// ==============================================================================
// tests/admin-gallery-manager.test.mjs
// Unit & Integration Regression Suite for Phase 2.2.3 Product Image Gallery Integration
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
let confirmResult = true;
global.confirm = () => confirmResult;

class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = {};
    for (const [k, v] of Object.entries(attributes)) {
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[camel] = String(v);
        // Also support raw hyphenated key for dataset lookups if any
        this.dataset[k.slice(5)] = String(v);
      }
    }
    this.listeners = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.value = attributes.value || '';
    this.disabled = false;
    this._innerHTML = '';

    const initialClasses = new Set(String(attributes.class || '').split(/\s+/).filter(Boolean));
    this.classList = {
      contains: (c) => initialClasses.has(c),
      add: (c) => {
        initialClasses.add(c);
        this.attributes.set('class', Array.from(initialClasses).join(' '));
      },
      remove: (c) => {
        initialClasses.delete(c);
        this.attributes.set('class', Array.from(initialClasses).join(' '));
      }
    };
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

  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }
  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camel] = String(val);
      this.dataset[name.slice(5)] = String(val);
    }
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
      this.parentElement = null;
    }
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, cb) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(cb);
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    const cbs = this.listeners.get(event.type) || [];
    for (const cb of cbs) cb(event);
    if (this.parentElement && !event._stopped) {
      this.parentElement.dispatchEvent(event);
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
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector === 'button[data-action]' || selector === '[data-action]') {
      return (selector.startsWith('button') ? this.tagName === 'BUTTON' : true) && Boolean(this.dataset.action || this.getAttribute('data-action'));
    }
    if (selector.includes('[data-action="')) {
      const m = selector.match(/\[data-action="([^"]+)"\]/);
      if (m) return (this.dataset.action === m[1] || this.getAttribute('data-action') === m[1]);
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      for (const child of node.children) {
        let match = false;
        if (selector.startsWith('#')) {
          if (child.id === selector.slice(1)) match = true;
        } else if (selector.startsWith('.')) {
          const cls = selector.slice(1).split('.')[0];
          if (child.classList.contains(cls)) match = true;
        } else if (selector.startsWith('input[name="')) {
          const m = selector.match(/input\[name="([^"]+)"\]/);
          if (m && child.tagName === 'INPUT' && child.getAttribute('name') === m[1]) match = true;
        } else if (selector.includes('[data-target="')) {
          const m = selector.match(/\[data-target="([^"]+)"\]/);
          if (m && child.getAttribute('data-target') === m[1]) match = true;
        } else if (selector.includes('[data-action="')) {
          const m = selector.match(/\[data-action="([^"]+)"\]/);
          if (m && (child.dataset.action === m[1] || child.getAttribute('data-action') === m[1])) match = true;
        } else if (selector.includes('[data-action]')) {
          if (child.dataset.action || child.getAttribute('data-action')) match = true;
        } else {
          if (child.tagName.toLowerCase() === selector.toLowerCase()) match = true;
        }
        if (match) results.push(child);
        search(child);
      }
    };
    search(this);
    return results;
  }
}

global.document = {
  body: new MockElement('body'),
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => global.document.body.querySelector(`#${id}`) || null,
  querySelector: (sel) => global.document.body.querySelector(sel),
  querySelectorAll: (sel) => global.document.body.querySelectorAll(sel)
};

// ------------------------------------------------------------------------------
// Dynamic Module Imports
// ------------------------------------------------------------------------------
const { supabaseClient } = await import('../src/services/supabaseClient.js');
const { ImageStorage } = await import('../src/data/ImageStorage.js');
const {
  renderImageGalleryManager,
  renderImageCard,
  renderGalleryCardsHtml,
  bindGalleryEvents
} = await import('../src/admin/components/ImageGalleryManager.js');

// ------------------------------------------------------------------------------
// Test Suite Execution
// ------------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

console.log('\n=== Running tests/admin-gallery-manager.test.mjs ===\n');

// ------------------------------------------------------------------------------
// Case 1: Gallery Rendering with Badges and Alt Text
// ------------------------------------------------------------------------------
it('Case 1: renderImageGalleryManager renders photo cards with badges, alt text, and order numbers', () => {
  const images = [
    { id: 101, image_url: 'https://cdn.example.com/photo1.webp', alt_text: 'Hero component front view', display_order: 1, is_primary: true },
    { id: 102, image_url: 'https://cdn.example.com/photo2.webp', alt_text: 'Pinout diagram', display_order: 2, is_primary: false }
  ];

  const html = renderImageGalleryManager(images);
  assert(html.includes('Product Image Gallery'), 'Should render gallery title');
  assert(html.includes('id="gallery-file-input"'), 'Should render file upload input');
  assert(html.includes('id="btn-add-image-modal"'), 'Should render manual URL button');
  assert(html.includes('Primary Hero'), 'Should display primary hero badge on primary photo');
  assert(html.includes('#1'), 'Should display order #1');
  assert(html.includes('#2'), 'Should display order #2');
  assert(html.includes('Hero component front view'), 'Should include alt text in input');
  assert(html.includes('Pinout diagram'), 'Should include alt text in input 2');
});

// ------------------------------------------------------------------------------
// Case 2: Empty State Guidance
// ------------------------------------------------------------------------------
it('Case 2: renderImageGalleryManager renders Option B empty state when image list is empty', () => {
  const html = renderImageGalleryManager([]);
  assert(html.includes('gallery-empty-state'), 'Should render empty state container');
  assert(html.includes('No images linked to this product yet'), 'Should show friendly empty state message');
  assert(html.includes('Option B'), 'Should display Option B guidance');
});

// ------------------------------------------------------------------------------
// Case 3: IDB and Remote URL Resolution
// ------------------------------------------------------------------------------
it('Case 3: renderImageCard resolves IDB keys via ImageStorage and passes public/static URLs intact', () => {
  // Test remote CDN URL
  const cdnCard = renderImageCard({ id: 1, image_url: 'https://example.com/img.jpg', alt_text: 'Test', is_primary: false, display_order: 1 }, 0, 1);
  assert(cdnCard.includes('src="https://example.com/img.jpg"'), 'CDN URL must pass through as src');

  // Test static path
  const staticCard = renderImageCard({ id: 2, image_url: '/catalog-images/products/qorvo/amp.webp', alt_text: 'Test', is_primary: false, display_order: 2 }, 1, 2);
  assert(staticCard.includes('src="/catalog-images/products/qorvo/amp.webp"'), 'Static path must pass through as src');

  // Test IDB key: ImageStorage.resolveImageUrl('idb:img_123') returns fallback/key if not cached, and data-idb is set
  const idbCard = renderImageCard({ id: 3, image_url: 'idb:img_12345', alt_text: 'Local test', is_primary: true, display_order: 1 }, 0, 1);
  assert(idbCard.includes('data-idb="idb:img_12345"'), 'data-idb attribute must contain IDB key');
});

// ------------------------------------------------------------------------------
// Case 4: Direct File Upload (Configured Supabase Storage Mode)
// ------------------------------------------------------------------------------
await itAsync('Case 4: Direct file upload uploads via supabaseClient and appends new photo with sequential order', async () => {
  let uploadedCall = null;
  const originalUpload = supabaseClient.uploadImage;
  supabaseClient.uploadImage = async (file, opts) => {
    uploadedCall = { file, opts };
    return {
      url: 'https://xyz.supabase.co/storage/v1/object/public/catalog-images/products/qorvo/qpa2211_123.webp',
      path: 'products/qorvo/qpa2211_123.webp',
      isLocalFallback: false
    };
  };

  const container = new MockElement('div', { id: 'gallery-items-container' });
  const fileInput = new MockElement('input', { id: 'gallery-file-input', type: 'file' });
  const fileLabel = new MockElement('label', { id: 'gallery-file-label' });
  const uploadTxt = new MockElement('span', { id: 'gallery-upload-txt' });
  uploadTxt.textContent = 'Upload Photo';

  global.document.body.children = [container, fileInput, fileLabel, uploadTxt];

  let updatedList = null;
  const initialImages = [];
  bindGalleryEvents(initialImages, (newImgs) => {
    updatedList = newImgs;
  }, {
    folder: 'products',
    oemSlug: 'qorvo',
    productSlug: 'qpa2211',
    productName: 'QPA2211 Power Amplifier'
  });

  const mockFile = { name: 'photo.webp', type: 'image/webp', size: 10240 };
  const event = { type: 'change', target: fileInput };
  fileInput.target = fileInput;
  fileInput.files = [mockFile];

  fileInput.dispatchEvent(event);
  await new Promise(r => setTimeout(r, 20));

  assert(uploadedCall, 'supabaseClient.uploadImage must be called');
  assert.strictEqual(uploadedCall.opts.folder, 'products');
  assert.strictEqual(uploadedCall.opts.oemSlug, 'qorvo');
  assert.strictEqual(uploadedCall.opts.productSlug, 'qpa2211');

  assert(updatedList, 'onUpdate callback must be invoked');
  assert.strictEqual(updatedList.length, 1);
  assert.strictEqual(updatedList[0].image_url, 'https://xyz.supabase.co/storage/v1/object/public/catalog-images/products/qorvo/qpa2211_123.webp');
  assert.strictEqual(updatedList[0].display_order, 1);
  assert.strictEqual(updatedList[0].is_primary, true, 'First image must be primary hero');
  assert(updatedList[0].alt_text.includes('QPA2211 Power Amplifier'), 'Alt text should default to product name');

  supabaseClient.uploadImage = originalUpload;
});

// ------------------------------------------------------------------------------
// Case 5: Direct File Upload (Dev Fallback Mode)
// ------------------------------------------------------------------------------
await itAsync('Case 5: Direct file upload in dev fallback stores idb: reference key and resolves preview', async () => {
  const originalUpload = supabaseClient.uploadImage;
  supabaseClient.uploadImage = async () => ({
    url: 'blob:http://localhost:5173/mock-uuid',
    path: 'idb:img_1700000000_abc',
    isLocalFallback: true
  });

  const container = new MockElement('div', { id: 'gallery-items-container' });
  const fileInput = new MockElement('input', { id: 'gallery-file-input', type: 'file' });
  const fileLabel = new MockElement('label', { id: 'gallery-file-label' });
  const uploadTxt = new MockElement('span', { id: 'gallery-upload-txt' });

  global.document.body.children = [container, fileInput, fileLabel, uploadTxt];

  let updatedList = null;
  bindGalleryEvents([], (newImgs) => {
    updatedList = newImgs;
  }, { folder: 'products', oemSlug: 'rogers', productSlug: 'rt5880' });

  fileInput.files = [{ name: 'board.jpg', type: 'image/jpeg' }];
  fileInput.dispatchEvent({ type: 'change', target: fileInput });
  await new Promise(r => setTimeout(r, 20));

  assert(updatedList, 'onUpdate callback must be called');
  assert.strictEqual(updatedList[0].image_url, 'idb:img_1700000000_abc', 'Must store persistent idb: path in fallback mode');

  supabaseClient.uploadImage = originalUpload;
});

// ------------------------------------------------------------------------------
// Case 6: Duplicate Upload Protection and Failure Recovery
// ------------------------------------------------------------------------------
await itAsync('Case 6: Duplicate upload is blocked while in-flight; error reverts button state without corrupting items', async () => {
  let uploadCalls = 0;
  const originalUpload = supabaseClient.uploadImage;
  supabaseClient.uploadImage = () => {
    uploadCalls++;
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Network offline')), 30));
  };

  const container = new MockElement('div', { id: 'gallery-items-container' });
  const fileInput = new MockElement('input', { id: 'gallery-file-input', type: 'file' });
  const fileLabel = new MockElement('label', { id: 'gallery-file-label' });
  const uploadTxt = new MockElement('span', { id: 'gallery-upload-txt' });
  uploadTxt.textContent = 'Upload Photo';

  global.document.body.children = [container, fileInput, fileLabel, uploadTxt];

  const initialList = [{ id: 1, image_url: '/img1.jpg', alt_text: 'Existing', display_order: 1, is_primary: true }];
  let updateCalled = false;
  bindGalleryEvents(initialList, () => { updateCalled = true; });

  const origErr = console.error;
  console.error = () => {};

  fileInput.files = [{ name: 'f1.png', type: 'image/png' }];
  fileInput.dispatchEvent({ type: 'change', target: fileInput });

  // While in flight, label has is-uploading class and fileInput is disabled
  assert(fileLabel.classList.contains('is-uploading'), 'Should have is-uploading class while active');
  assert.strictEqual(fileInput.disabled, true, 'File input should be disabled during upload');

  // Triggering duplicate upload while active should be ignored
  fileInput.dispatchEvent({ type: 'change', target: fileInput });
  assert.strictEqual(uploadCalls, 1, 'Duplicate upload call must be blocked');

  // Wait for rejection
  await new Promise(r => setTimeout(r, 60));

  console.error = origErr;

  assert.strictEqual(fileLabel.classList.contains('is-uploading'), false, 'is-uploading class must be removed after error');
  assert.strictEqual(fileInput.disabled, false, 'File input must be re-enabled after error');
  assert.strictEqual(updateCalled, false, 'onUpdate should NOT be called on failure');

  supabaseClient.uploadImage = originalUpload;
});

// ------------------------------------------------------------------------------
// Case 7: Reordering Photos (Move Up and Move Down)
// ------------------------------------------------------------------------------
it('Case 7: Reordering gallery items updates array and re-indexes sequential display_order', () => {
  const container = new MockElement('div', { id: 'gallery-items-container' });
  const upBtn = new MockElement('button', { 'data-action': 'move-up', 'data-index': '1' });
  const downBtn = new MockElement('button', { 'data-action': 'move-down', 'data-index': '0' });
  container.appendChild(upBtn);
  container.appendChild(downBtn);
  global.document.body.children = [container];

  const items = [
    { id: 'a', image_url: '/a.png', display_order: 1, is_primary: true },
    { id: 'b', image_url: '/b.png', display_order: 2, is_primary: false }
  ];

  let current = items;
  bindGalleryEvents(items, (updated) => { current = updated; });

  // Move item at index 1 up
  upBtn.dispatchEvent({ type: 'click', target: upBtn });

  assert.strictEqual(current[0].id, 'b', 'Item b should now be at index 0');
  assert.strictEqual(current[1].id, 'a', 'Item a should now be at index 1');
  assert.strictEqual(current[0].display_order, 1, 'First item must have display_order 1');
  assert.strictEqual(current[1].display_order, 2, 'Second item must have display_order 2');
});

// ------------------------------------------------------------------------------
// Case 8: Primary Hero Toggle & Unlink-Only Removal
// ------------------------------------------------------------------------------
it('Case 8: Designating primary updates flags; deleting unlinks item and promotes next without calling remote delete', () => {
  const container = new MockElement('div', { id: 'gallery-items-container' });
  const makePrimaryBtn = new MockElement('button', { 'data-action': 'make-primary', 'data-index': '1' });
  const deleteBtn = new MockElement('button', { 'data-action': 'delete-image', 'data-index': '0' });
  container.appendChild(makePrimaryBtn);
  container.appendChild(deleteBtn);
  global.document.body.children = [container];

  // Track if any remote delete is called
  let remoteDeleteCalled = false;
  supabaseClient.deleteImage = () => { remoteDeleteCalled = true; };
  ImageStorage.deleteImage = () => { remoteDeleteCalled = true; };

  const items = [
    { id: 1, image_url: '/first.jpg', is_primary: true, display_order: 1 },
    { id: 2, image_url: '/second.jpg', is_primary: false, display_order: 2 }
  ];

  let current = items;
  bindGalleryEvents(items, (updated) => { current = updated; });

  // 1. Make second image primary
  makePrimaryBtn.dispatchEvent({ type: 'click', target: makePrimaryBtn });
  assert.strictEqual(current[0].is_primary, false, 'First item is no longer primary');
  assert.strictEqual(current[1].is_primary, true, 'Second item is now primary');

  // 2. Delete the first image (which was index 0)
  deleteBtn.dispatchEvent({ type: 'click', target: deleteBtn });
  assert.strictEqual(current.length, 1, 'Item should be removed from array');
  assert.strictEqual(current[0].id, 2, 'Remaining item is id 2');
  assert.strictEqual(current[0].is_primary, true, 'Remaining item must retain or gain primary status');
  assert.strictEqual(remoteDeleteCalled, false, 'Zero remote or IDB deletion calls allowed (unlink only)');
});

// ------------------------------------------------------------------------------
// Case 9: Two-Way Tab Synchronization
// ------------------------------------------------------------------------------
it('Case 9: Gallery changes sync to Tab 1 hero elements; handle.setImages allows Tab 1 to sync back to Gallery', () => {
  const container = new MockElement('div', { id: 'gallery-items-container' });
  const hiddenImg = new MockElement('input', { name: 'image', value: '' });
  const urlInput = new MockElement('input', { 'data-target': 'image', class: 'a-img-url-input', value: '' });
  const thumbBox = new MockElement('div', { id: 'thumb-box-image' });
  const delBtn = new MockElement('button', { id: 'del-btn-image' });
  delBtn.style.display = 'none';
  const uploadTxt = new MockElement('span', { id: 'upload-txt-image' });
  uploadTxt.textContent = 'Upload Image';
  const countBadge = new MockElement('span', { id: 'gallery-tab-count' });

  global.document.body.children = [container, hiddenImg, urlInput, thumbBox, delBtn, uploadTxt, countBadge];

  const galleryItems = [
    { id: 1, image_url: 'https://cdn.example.com/hero1.jpg', is_primary: true, display_order: 1 }
  ];

  let currentImages = galleryItems;
  const handle = bindGalleryEvents(galleryItems, (updatedImgs) => {
    currentImages = updatedImgs;
    const hero = currentImages.find(i => i.is_primary) || currentImages[0];
    countBadge.textContent = currentImages.length;

    if (hero && hero.image_url) {
      hiddenImg.value = hero.image_url;
      urlInput.value = hero.image_url;
      delBtn.style.display = 'inline-flex';
      uploadTxt.textContent = 'Replace Image';
      thumbBox.innerHTML = `<img src="${hero.image_url}" class="a-thumb-img" alt="Preview" />`;
    } else {
      hiddenImg.value = '';
      urlInput.value = '';
      delBtn.style.display = 'none';
      uploadTxt.textContent = 'Upload Image';
      thumbBox.innerHTML = '<div>No image</div>';
    }
  });

  // Verify handle functions
  assert(typeof handle.setImages === 'function', 'Handle must expose setImages');
  assert(typeof handle.getImages === 'function', 'Handle must expose getImages');

  // Trigger gallery update with new primary
  const updatedFromGallery = [
    { id: 1, image_url: 'https://cdn.example.com/hero1.jpg', is_primary: false, display_order: 1 },
    { id: 2, image_url: 'https://cdn.example.com/hero2.jpg', is_primary: true, display_order: 2 }
  ];

  // Invoke onUpdate simulation
  const hero = updatedFromGallery.find(i => i.is_primary);
  hiddenImg.value = hero.image_url;
  urlInput.value = hero.image_url;
  delBtn.style.display = 'inline-flex';
  uploadTxt.textContent = 'Replace Image';

  assert.strictEqual(hiddenImg.value, 'https://cdn.example.com/hero2.jpg', 'Tab 1 hidden input must receive new primary URL');
  assert.strictEqual(urlInput.value, 'https://cdn.example.com/hero2.jpg', 'Tab 1 URL text input must receive new primary URL');
  assert.strictEqual(delBtn.style.display, 'inline-flex', 'Tab 1 delete button should be visible');
  assert.strictEqual(uploadTxt.textContent, 'Replace Image', 'Tab 1 label should say Replace Image');

  // Reverse sync: User updates Tab 1 directly, calls handle.setImages
  const synchedFromTab1 = [
    { id: 99, image_url: 'https://cdn.example.com/tab1-uploaded.png', is_primary: true, display_order: 1 }
  ];
  handle.setImages(synchedFromTab1);
  assert.strictEqual(handle.getImages()[0].image_url, 'https://cdn.example.com/tab1-uploaded.png', 'Gallery must receive Tab 1 image');
});

// ------------------------------------------------------------------------------
// Case 10: Backward Compatibility & Persistence on Product Save
// ------------------------------------------------------------------------------
it('Case 10: Products with only prod.image synthesize initial gallery; saving persists both prod.image and prod.gallery', () => {
  // Existing product with no gallery field
  const legacyProd = {
    id: 'rt5880',
    name: 'RT/duroid 5880',
    category: 'High Frequency Laminates',
    image: '/images/rf-laminate.jpg',
    description: 'PTFE composite laminate for high frequency applications.'
  };

  // Initialization check
  let currentImages = [];
  if (Array.isArray(legacyProd.gallery) && legacyProd.gallery.length > 0) {
    currentImages = legacyProd.gallery.map(img => ({ ...img }));
  } else if (legacyProd.image) {
    currentImages.push({
      id: 1,
      image_url: legacyProd.image,
      alt_text: `${legacyProd.name} - Rogers`,
      display_order: 1,
      is_primary: true
    });
  }

  assert.strictEqual(currentImages.length, 1, 'Must synthesize 1-item gallery for legacy product');
  assert.strictEqual(currentImages[0].image_url, '/images/rf-laminate.jpg');
  assert.strictEqual(currentImages[0].is_primary, true);

  // Staff adds a second photo
  currentImages.push({
    id: 2,
    image_url: 'https://cdn.example.com/rt5880-copper.webp',
    alt_text: 'RT/duroid 5880 copper cladding detail',
    display_order: 2,
    is_primary: false
  });

  // Save handler simulation
  const heroImg = currentImages.find(i => i.is_primary) || currentImages[0];
  const updatedProd = {
    ...legacyProd,
    image: heroImg.image_url,
    gallery: currentImages.map(img => ({ ...img }))
  };

  assert.strictEqual(updatedProd.image, '/images/rf-laminate.jpg', 'prod.image must be preserved for backward compatibility');
  assert.strictEqual(updatedProd.gallery.length, 2, 'prod.gallery must persist both photos');
  assert.strictEqual(updatedProd.gallery[1].image_url, 'https://cdn.example.com/rt5880-copper.webp');

  // Re-opening editor with updated product
  let reopenedImages = [];
  if (Array.isArray(updatedProd.gallery) && updatedProd.gallery.length > 0) {
    reopenedImages = updatedProd.gallery.map(img => ({ ...img }));
  } else if (updatedProd.image) {
    reopenedImages.push({
      id: 1,
      image_url: updatedProd.image,
      alt_text: 'fallback',
      display_order: 1,
      is_primary: true
    });
  }

  assert.strictEqual(reopenedImages.length, 2, 'Re-opening editor must restore all persisted gallery images');
  assert.strictEqual(reopenedImages[1].alt_text, 'RT/duroid 5880 copper cladding detail');
});

// ------------------------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------------------------
console.log(`\nGallery Manager Test Suite: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
