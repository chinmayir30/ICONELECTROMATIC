// ==============================================================================
// tests/admin-image-upload.test.mjs
// Isolated unit & integration tests for Phase 2.2.2 Admin Image Upload Integration
// ==============================================================================

import assert from 'assert';
import { register } from 'node:module';

// ------------------------------------------------------------------------------
// Register ESM Loader Hook for CSS and Browser Env in Node.js
// ------------------------------------------------------------------------------
register(`data:text/javascript,
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return { format: 'module', shortCircuit: true, source: 'export default {};' };
  }
  const result = await nextLoad(url, context);
  if (url.includes('authService.js')) {
    const raw = Buffer.from(result.source).toString('utf8');
    const patched = raw.replaceAll('import.meta.env', '(globalThis.__vite_env || {})');
    return { format: 'module', shortCircuit: true, source: patched };
  }
  return result;
}
`, import.meta.url);

globalThis.__vite_env = { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '', DEV: true };

// ------------------------------------------------------------------------------
// Setup Mock Browser & DOM Environment
// ------------------------------------------------------------------------------
const mockLocalStorage = new Map();
global.localStorage = {
  getItem: (key) => mockLocalStorage.get(key) || null,
  setItem: (key, val) => mockLocalStorage.set(key, String(val)),
  removeItem: (key) => mockLocalStorage.delete(key),
  clear: () => mockLocalStorage.clear()
};

let lastAlert = null;
global.alert = (msg) => { lastAlert = msg; };

// Minimal DOM Element Mock for Event Testing
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.className = attributes.class || '';

    this.listeners = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.value = attributes.value || '';
    this.disabled = false;
    this.innerHTML = '';
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(val) {
    this.setAttribute('id', val);
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(val) {
    this.setAttribute('class', val);
    const classes = new Set(String(val).split(/\s+/).filter(Boolean));
    this.classList = {
      contains: (c) => classes.has(c),
      add: (c) => { classes.add(c); this.setAttribute('class', Array.from(classes).join(' ')); },
      remove: (c) => { classes.delete(c); this.setAttribute('class', Array.from(classes).join(' ')); }
    };
  }

  get textContent() {
    if (this._textContent !== undefined) return this._textContent;
    return this.children.map(c => c.textContent).join('');
  }

  set textContent(val) {
    this._textContent = String(val);
    this.children = [];
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
      this.parentElement = null;
    }
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) return curr;
      curr = curr.parentElement;
    }
    return null;
  }

  matches(selector) {
    if (selector.startsWith('.')) {
      return this.classList.contains(selector.slice(1));
    }
    if (selector.startsWith('#')) {
      return this.id === selector.slice(1);
    }
    return false;
  }

  addEventListener(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(fn);
  }

  async dispatchEvent(eventObj) {
    const handlers = this.listeners.get(eventObj.type) || [];
    for (const h of handlers) {
      await h(eventObj);
    }
  }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const walk = (node) => {
      for (const child of node.children) {
        let match = false;
        if (sel.startsWith('.')) {
          const cls = sel.slice(1).split('[')[0];
          if (child.classList.contains(cls)) match = true;
        } else if (sel.startsWith('#')) {
          const id = sel.slice(1);
          if (child.id === id || child.getAttribute('id') === id) match = true;
        } else if (sel.startsWith('input[')) {
          if (child.tagName === 'INPUT') match = true;
        } else {
          const [tagPart] = sel.split(/[.\[#]/);
          if (!tagPart || child.tagName === tagPart.toUpperCase()) {
            match = true;
            if (sel.includes('.')) {
              const cls = sel.split('.')[1].split('[')[0];
              if (!child.classList.contains(cls)) match = false;
            }
          }
        }

        // Attribute filter check e.g. [data-target="image"]
        if (match && sel.includes('[') && sel.endsWith(']')) {
          const attrPart = sel.slice(sel.indexOf('[') + 1, -1);
          const [aName, aValRaw] = attrPart.split('=');
          const aVal = aValRaw ? aValRaw.replace(/['"]/g, '') : null;
          if (aVal !== null) {
            if (child.getAttribute(aName) !== aVal) match = false;
          } else {
            if (!child.attributes.has(aName)) match = false;
          }
        }

        if (match) results.push(child);
        walk(child);
      }
    };
    walk(this);
    return results;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag),
  body: new MockElement('body'),
  getElementById: (id) => global.document.body.querySelector(`#${id}`)
};

// Import module after DOM mocks and CSS loader setup
const {
  isUuid,
  normalizeSlug,
  resolveStorageSlug,
  escapeAttr,
  escapeHtml,
  renderImageUploadField,
  bindImageWidgets,
  showToast
} = await import('../src/admin/Admin.js');

const { supabaseClient } = await import('../src/services/supabaseClient.js');
const { ImageStorage } = await import('../src/data/ImageStorage.js');

console.log('--- Running Phase 2.2.2 Admin Image Upload Integration Tests ---\n');

let totalTests = 0;
let passedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// ------------------------------------------------------------------------------
// Part 1: UUID, Slug Normalization & Slug Resolution Tests
// ------------------------------------------------------------------------------

await test('isUuid: recognizes standard hyphenated and unhyphenated UUIDs and rejects normal slugs', () => {
  assert.strictEqual(isUuid('c0a80101-0000-0000-0000-000000000001'), true);
  assert.strictEqual(isUuid('123E4567-E89B-12D3-A456-426614174000'), true);
  assert.strictEqual(isUuid('c0a80101000000000000000000000001'), true);
  assert.strictEqual(isUuid('rogers-corporation'), false);
  assert.strictEqual(isUuid('rt-duroid-5880-2'), false);
  assert.strictEqual(isUuid(''), false);
  assert.strictEqual(isUuid(null), false);
});

await test('normalizeSlug: safely normalizes string into clean lowercase hyphenated ASCII', () => {
  assert.strictEqual(normalizeSlug('Rogers Corporation'), 'rogers-corporation');
  assert.strictEqual(normalizeSlug('  Mini-Circuits, Inc.  '), 'mini-circuits-inc');
  assert.strictEqual(normalizeSlug(''), '');
  assert.strictEqual(normalizeSlug(null), '');
});

await test('resolveStorageSlug: rejects UUID in entity.slug and falls back to entity.name', () => {
  const oem = {
    slug: 'c0a80101-0000-0000-0000-000000000001',
    name: 'Rogers Corporation'
  };
  const result = resolveStorageSlug(oem);
  assert.strictEqual(result, 'rogers-corporation');
});

await test('resolveStorageSlug: rejects UUID in entity.id and falls back to entity.name', () => {
  const prod = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'RT/duroid 5880'
  };
  const result = resolveStorageSlug(prod);
  assert.strictEqual(result, 'rt-duroid-5880');
});

await test('resolveStorageSlug: rejects UUID in both slug and id, falling back to name or general', () => {
  const entityWithName = {
    slug: 'c0a80101-0000-0000-0000-000000000001',
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Qorvo RF Solutions'
  };
  assert.strictEqual(resolveStorageSlug(entityWithName), 'qorvo-rf-solutions');

  const entityWithoutName = {
    slug: 'c0a80101-0000-0000-0000-000000000001',
    id: '123e4567-e89b-12d3-a456-426614174000'
  };
  assert.strictEqual(resolveStorageSlug(entityWithoutName), 'general');
});

await test('resolveStorageSlug: handles unusual entity names (special characters, symbols, leading/trailing hyphens)', () => {
  assert.strictEqual(
    resolveStorageSlug({ name: 'Qorvo, Inc. / High-Rel & Defense (86 GHz+)' }),
    'qorvo-inc-high-rel-defense-86-ghz'
  );
  assert.strictEqual(
    resolveStorageSlug({ name: '   --- Rogers Corp. @2026 ---   ' }),
    'rogers-corp-2026'
  );
  assert.strictEqual(
    resolveStorageSlug({ name: '### $$$ %%%' }),
    'general'
  );
  assert.strictEqual(
    resolveStorageSlug({ name: 'Mini___Circuits...Amplifiers///' }),
    'mini-circuits-amplifiers'
  );
});

await test('resolveStorageSlug: handles missing, null, undefined or empty input safely', () => {
  assert.strictEqual(resolveStorageSlug(null), 'general');
  assert.strictEqual(resolveStorageSlug(undefined), 'general');
  assert.strictEqual(resolveStorageSlug({}), 'general');
  assert.strictEqual(resolveStorageSlug('', 'fallback-oem'), 'fallback-oem');
  assert.strictEqual(resolveStorageSlug('rogers-corporation'), 'rogers-corporation');
  assert.strictEqual(resolveStorageSlug('c0a80101-0000-0000-0000-000000000001', 'custom-fallback'), 'custom-fallback');
});

await test('resolveStorageSlug: handles oem object when available and falls back to oemId string', () => {
  const oemWithSlug = { id: 'c0a80101-0000-0000-0000-000000000001', slug: 'rogers-corp', name: 'Rogers Corporation' };
  assert.strictEqual(resolveStorageSlug(oemWithSlug || 'c0a80101-0000-0000-0000-000000000001'), 'rogers-corp');

  const oemFallback = null;
  assert.strictEqual(resolveStorageSlug(oemFallback || 'mini-circuits'), 'mini-circuits');
});

// ------------------------------------------------------------------------------
// Part 2: HTML & Attribute Escaping and Toast Safety Tests
// ------------------------------------------------------------------------------

await test('showToast: safely renders messages using textContent and prevents HTML injection', () => {
  // 1. Success toast test
  showToast('Saved successfully!', 'success');
  let toast = global.document.getElementById('a-toast');
  assert(toast, 'Toast element should be mounted in document.body');
  assert.strictEqual(toast.classList.contains('success'), true);
  assert.strictEqual(toast.querySelector('i.fa-circle-check') !== null, true);
  let msgSpan = toast.querySelector('.a-toast-msg');
  assert(msgSpan, 'Toast should contain .a-toast-msg container');
  assert.strictEqual(msgSpan.textContent, 'Saved successfully!');

  // 2. HTML injection attempt test in error toast
  const maliciousMsg = '<img src=x onerror="alert(1)"> Upload failed: <b>Server Error</b>';
  showToast(maliciousMsg, 'error');
  toast = global.document.getElementById('a-toast');
  assert(toast, 'Toast element should be mounted');
  assert.strictEqual(toast.classList.contains('error'), true);
  msgSpan = toast.querySelector('.a-toast-msg');
  assert.strictEqual(msgSpan.textContent, maliciousMsg);
  // Confirm no HTML tags were parsed or injected into the DOM
  assert.strictEqual(toast.querySelectorAll('img').length, 0);
  assert.strictEqual(toast.querySelectorAll('b').length, 0);
  assert.strictEqual(msgSpan.children.length, 0);
});

await test('escapeAttr and escapeHtml: correctly escape malicious characters', () => {
  const evil = '<script>alert("XSS")</script> & \'quote\'';
  const escapedAttr = escapeAttr(evil);
  assert.strictEqual(escapedAttr.includes('<'), false);
  assert.strictEqual(escapedAttr.includes('>'), false);
  assert.strictEqual(escapedAttr.includes('"'), false);
  assert.strictEqual(escapedAttr.includes("'"), false);

  const escapedHtml = escapeHtml(evil);
  assert.strictEqual(escapedHtml.includes('<'), false);
  assert.strictEqual(escapedHtml.includes('>'), false);
});

await test('renderImageUploadField: safely renders markup with escaped attributes and options', () => {
  const html = renderImageUploadField(
    'image',
    'Hardware Photo <test>',
    'https://xyz.supabase.co/image.png?test=1&x="2"',
    'Context & info',
    { folder: 'products', oemSlug: 'rogers', productSlug: 'rt-5880' }
  );

  assert.strictEqual(html.includes('data-field="image"'), true);
  assert.strictEqual(html.includes('data-folder="products"'), true);
  assert.strictEqual(html.includes('data-oem-slug="rogers"'), true);
  assert.strictEqual(html.includes('data-product-slug="rt-5880"'), true);
  assert.strictEqual(html.includes('&lt;test&gt;'), true);
  assert.strictEqual(html.includes('Context &amp; info'), true);
  assert.strictEqual(html.includes('Replace Image'), true);
});

await test('renderImageUploadField: renders empty state when currentValue is empty', () => {
  const html = renderImageUploadField('logoImg', 'Principal Logo', '', 'Helper text');
  assert.strictEqual(html.includes('No image'), true);
  assert.strictEqual(html.includes('Upload Image'), true);
  assert.strictEqual(html.includes('style="display:none;"'), true); // Delete button hidden
});

// ------------------------------------------------------------------------------
// Part 3: Widget DOM Binding & Event Handling Integration Tests
// ------------------------------------------------------------------------------

function createMockWidgetDOM(initialValue = '', options = {}) {
  const container = new MockElement('div');
  const widget = new MockElement('div', {
    class: 'a-field span2 a-image-widget',
    'data-field': 'image',
    'data-folder': options.folder || 'products',
    'data-oem-slug': options.oemSlug || 'rogers',
    'data-product-slug': options.productSlug || 'prod-1'
  });
  container.appendChild(widget);

  const thumbBox = new MockElement('div', { id: 'thumb-box-image', class: 'a-img-thumb-box' });
  thumbBox.innerHTML = initialValue
    ? `<img src="${initialValue}" class="a-thumb-img" alt="Preview" />`
    : `<div class="a-thumb-empty"><i class="fa-solid fa-image"></i><span>No image</span></div>`;
  widget.appendChild(thumbBox);

  const hiddenInput = new MockElement('input', {
    type: 'hidden',
    name: 'image',
    id: 'hidden-image',
    value: initialValue
  });
  widget.appendChild(hiddenInput);

  const uploadTxt = new MockElement('span', { id: 'upload-txt-image' });
  uploadTxt.textContent = initialValue ? 'Replace Image' : 'Upload Image';
  widget.appendChild(uploadTxt);

  const fileInput = new MockElement('input', {
    type: 'file',
    class: 'a-file-input',
    'data-target': 'image'
  });
  widget.appendChild(fileInput);

  const delBtn = new MockElement('button', {
    type: 'button',
    class: 'a-btn a-btn-sm a-btn-danger a-img-delete-btn',
    'data-target': 'image',
    id: 'del-btn-image'
  });
  delBtn.style.display = initialValue ? 'inline-flex' : 'none';
  widget.appendChild(delBtn);

  const urlInput = new MockElement('input', {
    type: 'text',
    class: 'a-input a-input-sm a-img-url-input',
    'data-target': 'image',
    value: initialValue
  });
  widget.appendChild(urlInput);

  return { container, widget, thumbBox, hiddenInput, uploadTxt, fileInput, delBtn, urlInput };
}

await test('bindImageWidgets: configured upload success updates hidden input, url input and thumbnail to CDN URL', async () => {
  const dom = createMockWidgetDOM('');
  const originalUpload = supabaseClient.uploadImage;

  let capturedOptions = null;
  supabaseClient.uploadImage = async (file, opts) => {
    capturedOptions = opts;
    return {
      success: true,
      url: 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/rogers/prod-1_12345.webp',
      path: 'products/rogers/prod-1_12345.webp',
      bucket: 'catalog-images'
    };
  };

  try {
    bindImageWidgets(dom.container);

    const mockFile = { name: 'hardware.png', type: 'image/png', size: 1024 };
    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [mockFile] }
    });

    assert.strictEqual(capturedOptions.folder, 'products');
    assert.strictEqual(capturedOptions.oemSlug, 'rogers');
    assert.strictEqual(capturedOptions.productSlug, 'prod-1');

    assert.strictEqual(dom.hiddenInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/rogers/prod-1_12345.webp');
    assert.strictEqual(dom.urlInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/rogers/prod-1_12345.webp');
    assert.strictEqual(dom.thumbBox.innerHTML.includes('https://example.supabase.co/'), true);
    assert.strictEqual(dom.uploadTxt.textContent, 'Replace Image');
    assert.strictEqual(dom.delBtn.style.display, 'inline-flex');
    assert.strictEqual(dom.widget.classList.contains('is-uploading'), false);
    assert.strictEqual(dom.fileInput.disabled, false);
  } finally {
    supabaseClient.uploadImage = originalUpload;
  }
});

await test('bindImageWidgets: supports both contract shapes (res.url and defensive res.publicUrl)', async () => {
  const dom = createMockWidgetDOM('');
  const originalUpload = supabaseClient.uploadImage;

  // Case 1: Primary production contract returning res.url
  supabaseClient.uploadImage = async () => ({
    success: true,
    url: 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-url.webp',
    path: 'products/item-url.webp',
    bucket: 'catalog-images'
  });

  try {
    bindImageWidgets(dom.container);
    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [{ name: 'item.webp', type: 'image/webp', size: 500 }] }
    });

    assert.strictEqual(dom.hiddenInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-url.webp');
    assert.strictEqual(dom.urlInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-url.webp');
    assert.strictEqual(dom.thumbBox.innerHTML.includes('item-url.webp'), true);

    // Case 2: Defensive compatibility returning res.publicUrl
    supabaseClient.uploadImage = async () => ({
      success: true,
      publicUrl: 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-public-url.webp',
      path: 'products/item-public-url.webp'
    });

    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [{ name: 'item2.webp', type: 'image/webp', size: 500 }] }
    });

    assert.strictEqual(dom.hiddenInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-public-url.webp');
    assert.strictEqual(dom.urlInput.value, 'https://example.supabase.co/storage/v1/object/public/catalog-images/products/item-public-url.webp');
    assert.strictEqual(dom.thumbBox.innerHTML.includes('item-public-url.webp'), true);
  } finally {
    supabaseClient.uploadImage = originalUpload;
  }
});

await test('bindImageWidgets: local dev fallback stores idb: reference key in hidden input and displays blob URL', async () => {
  const dom = createMockWidgetDOM('');
  const originalUpload = supabaseClient.uploadImage;

  supabaseClient.uploadImage = async () => ({
    success: true,
    url: 'blob:http://localhost:5173/mock-blob-uuid',
    path: 'idb:img_1729000000_abcde',
    isLocalFallback: true
  });

  try {
    bindImageWidgets(dom.container);

    const mockFile = { name: 'local.jpg', type: 'image/jpeg', size: 2048 };
    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [mockFile] }
    });

    assert.strictEqual(dom.hiddenInput.value, 'idb:img_1729000000_abcde');
    assert.strictEqual(dom.urlInput.value, 'idb:img_1729000000_abcde');
    assert.strictEqual(dom.thumbBox.innerHTML.includes('blob:http://localhost:5173/'), true);
  } finally {
    supabaseClient.uploadImage = originalUpload;
  }
});

await test('bindImageWidgets: in-flight guard prevents concurrent duplicate uploads', async () => {
  const dom = createMockWidgetDOM('');
  const originalUpload = supabaseClient.uploadImage;

  let uploadCallCount = 0;
  let resolvePromise;
  supabaseClient.uploadImage = () => {
    uploadCallCount++;
    return new Promise(res => { resolvePromise = res; });
  };

  try {
    bindImageWidgets(dom.container);

    const mockFile = { name: 'item.png', type: 'image/png', size: 1024 };

    // Trigger first upload
    const p1 = dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [mockFile] }
    });

    assert.strictEqual(dom.widget.classList.contains('is-uploading'), true);
    assert.strictEqual(dom.fileInput.disabled, true);

    // Attempt second upload event while first is in flight
    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [mockFile] }
    });

    // Resolve first upload
    resolvePromise({
      success: true,
      url: 'https://cdn.example.com/item.webp',
      path: 'products/item.webp'
    });
    await p1;

    assert.strictEqual(uploadCallCount, 1);
    assert.strictEqual(dom.widget.classList.contains('is-uploading'), false);
    assert.strictEqual(dom.fileInput.disabled, false);
  } finally {
    supabaseClient.uploadImage = originalUpload;
  }
});

await test('bindImageWidgets: upload failure rolls back UI state to previous snapshot and preserves existing image', async () => {
  const initialImg = 'https://existing.cdn.com/old-hardware.jpg';
  const dom = createMockWidgetDOM(initialImg);
  const originalUpload = supabaseClient.uploadImage;
  const originalConsoleError = console.error;
  let loggedError = null;
  console.error = (...args) => { loggedError = args.join(' '); };

  supabaseClient.uploadImage = async () => {
    throw new Error('Storage upload network error: Connection refused');
  };

  try {
    bindImageWidgets(dom.container);

    const mockFile = { name: 'bad.png', type: 'image/png', size: 1024 };
    await dom.fileInput.dispatchEvent({
      type: 'change',
      target: { files: [mockFile] }
    });

    // Assert state restored to snapshot
    assert.strictEqual(dom.hiddenInput.value, initialImg);
    assert.strictEqual(dom.urlInput.value, initialImg);
    assert.strictEqual(dom.thumbBox.innerHTML.includes(initialImg), true);
    assert.strictEqual(dom.uploadTxt.textContent, 'Replace Image');
    assert.strictEqual(dom.delBtn.style.display, 'inline-flex');
    assert.strictEqual(dom.widget.classList.contains('is-uploading'), false);
    assert.strictEqual(dom.fileInput.disabled, false);
    assert.strictEqual(lastAlert.includes('Connection refused'), true);
    assert.strictEqual(loggedError.includes('Connection refused'), true);
  } finally {
    supabaseClient.uploadImage = originalUpload;
    console.error = originalConsoleError;
  }
});

await test('bindImageWidgets: manual URL input updates hidden input and preview live', async () => {
  const dom = createMockWidgetDOM('');
  bindImageWidgets(dom.container);

  dom.urlInput.value = '/images/products/manual-filter.jpg';
  await dom.urlInput.dispatchEvent({ type: 'input' });

  assert.strictEqual(dom.hiddenInput.value, '/images/products/manual-filter.jpg');
  assert.strictEqual(dom.thumbBox.innerHTML.includes('/images/products/manual-filter.jpg'), true);
  assert.strictEqual(dom.delBtn.style.display, 'inline-flex');
  assert.strictEqual(dom.uploadTxt.textContent, 'Replace Image');

  // Clear manual URL
  dom.urlInput.value = '';
  await dom.urlInput.dispatchEvent({ type: 'input' });

  assert.strictEqual(dom.hiddenInput.value, '');
  assert.strictEqual(dom.thumbBox.innerHTML.includes('No image'), true);
  assert.strictEqual(dom.delBtn.style.display, 'none');
  assert.strictEqual(dom.uploadTxt.textContent, 'Upload Image');
});

await test('bindImageWidgets: delete button unlinks form reference only and NEVER deletes stored assets', async () => {
  const dom = createMockWidgetDOM('https://example.supabase.co/catalog-images/products/keep-me.webp');
  const originalDelete = supabaseClient.deleteImage;
  const originalIdbDelete = ImageStorage.deleteImage;

  let remoteDeleteCalls = 0;
  let idbDeleteCalls = 0;
  supabaseClient.deleteImage = async () => { remoteDeleteCalls++; return { success: true }; };
  ImageStorage.deleteImage = async () => { idbDeleteCalls++; return true; };

  try {
    bindImageWidgets(dom.container);

    await dom.delBtn.dispatchEvent({ type: 'click' });

    assert.strictEqual(dom.hiddenInput.value, '');
    assert.strictEqual(dom.urlInput.value, '');
    assert.strictEqual(dom.thumbBox.innerHTML.includes('No image'), true);
    assert.strictEqual(dom.delBtn.style.display, 'none');
    assert.strictEqual(dom.uploadTxt.textContent, 'Upload Image');

    // Strict safety assertions: zero deletions triggered
    assert.strictEqual(remoteDeleteCalls, 0);
    assert.strictEqual(idbDeleteCalls, 0);
  } finally {
    supabaseClient.deleteImage = originalDelete;
    ImageStorage.deleteImage = originalIdbDelete;
  }
});

// ------------------------------------------------------------------------------
// Test Summary
// ------------------------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
console.log(`Phase 2.2.2 Admin Image Upload Tests: ${passedTests} / ${totalTests} Passed`);
console.log('-------------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
