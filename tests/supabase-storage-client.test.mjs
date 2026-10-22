// ==============================================================================
// tests/supabase-storage-client.test.mjs
// Isolated, portable unit tests for Supabase Storage Client (Phase 2.2.1)
// Zero hosted mutations: uses mocked global.fetch and mock localStorage
// ==============================================================================

import assert from 'assert';

// ------------------------------------------------------------------------------
// Mock DOM / Browser Environment
// ------------------------------------------------------------------------------
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

const originalFetch = global.fetch;

console.log('--- Running Phase 2.2.1 Supabase Storage Client Portable Tests ---\n');

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         Error: ${err.message}`);
  }
}

// ------------------------------------------------------------------------------
// Part 1: Genuinely Unconfigured Module Instance Tests
// ------------------------------------------------------------------------------
delete process.env.VITE_SUPABASE_URL;
delete process.env.VITE_SUPABASE_ANON_KEY;
process.env.DEV = 'false';

// Import unconfigured instance using query string to prevent module caching
const unconfiguredUrl = new URL('../src/services/supabaseClient.js?state=unconfigured_prod', import.meta.url).href;
const { supabaseClient: unconfiguredClient, isConfigured: isConfiguredFalse } = await import(unconfiguredUrl);

await test('Unconfigured module evaluates isConfigured to false', async () => {
  assert.strictEqual(isConfiguredFalse, false, 'isConfigured must be false when env vars are absent');
});

await test('Remote deletion fails clearly with explicit error when Supabase is unconfigured', async () => {
  await assert.rejects(
    async () => await unconfiguredClient.deleteImage('products/rogers/ro4003c.webp'),
    { message: /^Supabase Storage is not configured\. Cannot delete remote image\.$/ }
  );
});

await test('Remote deletion via full URL fails clearly when Supabase is unconfigured', async () => {
  await assert.rejects(
    async () => await unconfiguredClient.deleteImage('https://some-project.supabase.co/storage/v1/object/public/catalog-images/item.webp'),
    { message: /^Supabase Storage is not configured\. Cannot delete remote image\.$/ }
  );
});

await test('Retains explicit idb: deletion path even when Supabase is unconfigured', async () => {
  const res = await unconfiguredClient.deleteImage('idb:img_12345_test');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.isLocalFallback, true);
});

await test('Upload rejects in production or when DEV="false" without Supabase credentials', async () => {
  const validFile = { name: 'component.webp', type: 'image/webp', size: 1024 };
  await assert.rejects(
    async () => await unconfiguredClient.uploadImage(validFile),
    { message: /^Supabase Storage is not configured\. Local fallback is disabled outside explicit development mode\.$/ }
  );
});

// Import unconfigured instance in explicit DEV mode
process.env.DEV = 'true';
const unconfiguredDevUrl = new URL('../src/services/supabaseClient.js?state=unconfigured_dev', import.meta.url).href;
const { supabaseClient: unconfiguredDevClient } = await import(unconfiguredDevUrl);

await test('Upload allows IndexedDB fallback ONLY in explicit development mode when unconfigured', async () => {
  const validBlob = new Blob(['fake-image-bytes'], { type: 'image/webp' });
  validBlob.name = 'component.webp';
  const res = await unconfiguredDevClient.uploadImage(validBlob);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.isLocalFallback, true);
  assert(res.path.startsWith('idb:img_'), `Expected idb: path, got: ${res.path}`);
});

// ------------------------------------------------------------------------------
// Part 2: Genuinely Configured Module Instance Tests
// ------------------------------------------------------------------------------
process.env.VITE_SUPABASE_URL = 'https://mock-project.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key-12345';
process.env.DEV = 'true';

const configuredUrl = new URL('../src/services/supabaseClient.js?state=configured', import.meta.url).href;
const {
  supabaseClient,
  STORAGE_BUCKET,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  MIME_TO_EXTENSION,
  isExplicitDevMode,
  isConfigured: isConfiguredTrue
} = await import(configuredUrl);

await test('Configured module evaluates isConfigured to true', async () => {
  assert.strictEqual(isConfiguredTrue, true, 'isConfigured must be true when env vars are set');
});

await test('Storage constants and MIME-to-extension mappings are properly configured', async () => {
  assert.strictEqual(STORAGE_BUCKET, 'catalog-images');
  assert.strictEqual(MAX_FILE_SIZE, 10 * 1024 * 1024);
  assert.deepStrictEqual(ALLOWED_MIME_TYPES, ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  assert(!ALLOWED_MIME_TYPES.includes('image/svg+xml'), 'SVG must NOT be in ALLOWED_MIME_TYPES');
  assert.strictEqual(MIME_TO_EXTENSION['image/jpeg'], 'jpg');
  assert.strictEqual(MIME_TO_EXTENSION['image/png'], 'png');
  assert.strictEqual(MIME_TO_EXTENSION['image/webp'], 'webp');
  assert.strictEqual(MIME_TO_EXTENSION['image/gif'], 'gif');
});

await test('isExplicitDevMode helper rejects string "false" or production environment', async () => {
  const origDev = process.env.DEV;
  const origNodeEnv = process.env.NODE_ENV;
  try {
    process.env.DEV = 'false';
    assert.strictEqual(isExplicitDevMode(), false, 'String "false" must not enable dev mode');
    process.env.DEV = 'true';
    assert.strictEqual(isExplicitDevMode(), true, 'String "true" must enable dev mode');
    process.env.DEV = '';
    process.env.NODE_ENV = 'production';
    assert.strictEqual(isExplicitDevMode(), false, 'NODE_ENV=production must not enable dev mode');
  } finally {
    process.env.DEV = origDev;
    process.env.NODE_ENV = origNodeEnv;
  }
});

await test('Rejects null or missing file payload', async () => {
  await assert.rejects(
    async () => await supabaseClient.uploadImage(null),
    { message: /No file provided for upload/ }
  );
});

await test('Rejects SVG upload by MIME type (image/svg+xml) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  const file = { name: 'logo.svg', type: 'image/svg+xml', size: 2048 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(file),
    { message: /SVG uploads are disallowed for security/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on disallowed SVG');
});

await test('Rejects SVG upload by .svg extension even if MIME is empty or spoofed', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  const file = { name: 'exploit.svg', type: 'application/octet-stream', size: 2048 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(file),
    { message: /SVG uploads are disallowed for security/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on disallowed SVG');
});

await test('Rejects file exceeding 10MB limit with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  const file = { name: 'large-photo.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(file),
    { message: /exceeds the maximum allowed limit of 10 MB/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called when file is oversized');
});

await test('Rejects disallowed non-raster MIME types (application/pdf, text/html) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  const pdfFile = { name: 'datasheet.pdf', type: 'application/pdf', size: 50000 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(pdfFile),
    { message: /Unsupported file type \(application\/pdf\)/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on disallowed MIME');
});

await test('Stored filename extension strictly agrees with validated MIME type, ignoring filename extension mismatch', async () => {
  mockStorage.set('icon_staff_token', 'valid_staff_jwt_token');

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ Key: 'mock' })
  });

  // File named .png, but actual MIME is image/webp
  const mismatchedFile = { name: 'fake-png.png', type: 'image/webp', size: 2048 };
  const res = await supabaseClient.uploadImage(mismatchedFile, {
    folder: 'products',
    oemSlug: 'rogers',
    productSlug: 'ro4003c'
  });

  assert(res.path.endsWith('.webp'), `Expected path to end with .webp based on MIME type, got: ${res.path}`);
  assert(res.url.endsWith('.webp'), `Expected URL to end with .webp based on MIME type, got: ${res.url}`);
});

await test('Upload request does NOT contain x-upsert header', async () => {
  mockStorage.set('icon_staff_token', 'valid_staff_jwt_token');
  let capturedHeaders = {};

  global.fetch = async (url, opts) => {
    capturedHeaders = opts.headers;
    return { ok: true, status: 200, json: async () => ({ Key: 'mock' }) };
  };

  const validFile = { name: 'hero.webp', type: 'image/webp', size: 4000 };
  await supabaseClient.uploadImage(validFile);

  assert.strictEqual(capturedHeaders['x-upsert'], undefined, 'x-upsert header must be disabled');
});

await test('Rejects unauthenticated upload in configured mode (missing token)', async () => {
  mockStorage.delete('icon_staff_token');
  const validFile = { name: 'photo.webp', type: 'image/webp', size: 1024 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(validFile),
    { message: /Authentication required\. Please log in as staff/ }
  );
});

await test('Rejects upload with mock token in configured mode', async () => {
  mockStorage.set('icon_staff_token', 'mock_staff_token_12345');
  const validFile = { name: 'photo.webp', type: 'image/webp', size: 1024 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(validFile),
    { message: /Authentication required\. Please log in as staff/ }
  );
});

await test('Handles 401 Session Expired and 403 Forbidden from Supabase Storage API', async () => {
  mockStorage.set('icon_staff_token', 'valid_token');
  global.fetch = async () => ({ ok: false, status: 401, text: async () => 'JWT expired' });

  const validFile = { name: 'component.png', type: 'image/png', size: 2048 };
  await assert.rejects(
    async () => await supabaseClient.uploadImage(validFile),
    { message: /Session expired\. Please log in again/ }
  );

  global.fetch = async () => ({ ok: false, status: 403, text: async () => 'RLS violation' });
  await assert.rejects(
    async () => await supabaseClient.uploadImage(validFile),
    { message: /Permission denied\. Staff role required/ }
  );
});

await test('Configured upload failure (HTTP 500) never triggers IndexedDB fallback', async () => {
  mockStorage.set('icon_staff_token', 'valid_token');
  global.fetch = async () => ({ ok: false, status: 500, text: async () => 'Internal Error' });

  // Import ImageStorage to spy on saveImage
  const { ImageStorage } = await import('../src/data/ImageStorage.js');
  let idbSaveCalled = false;
  const originalSave = ImageStorage.saveImage;
  ImageStorage.saveImage = async () => { idbSaveCalled = true; };

  try {
    const validFile = { name: 'component.png', type: 'image/png', size: 2048 };
    await assert.rejects(
      async () => await supabaseClient.uploadImage(validFile),
      { message: /Storage upload failed \(500\)/ }
    );
    assert.strictEqual(idbSaveCalled, false, 'Configured upload failure must NEVER call ImageStorage.saveImage');
  } finally {
    ImageStorage.saveImage = originalSave;
  }
});

await test('Configured upload network failure (fetch throws) never triggers IndexedDB fallback', async () => {
  mockStorage.set('icon_staff_token', 'valid_token');
  global.fetch = async () => { throw new TypeError('Network connection lost'); };

  const { ImageStorage } = await import('../src/data/ImageStorage.js');
  let idbSaveCalled = false;
  const originalSave = ImageStorage.saveImage;
  ImageStorage.saveImage = async () => { idbSaveCalled = true; };

  try {
    const validFile = { name: 'component.png', type: 'image/png', size: 2048 };
    await assert.rejects(
      async () => await supabaseClient.uploadImage(validFile),
      { message: /Storage upload network error: Network connection lost/ }
    );
    assert.strictEqual(idbSaveCalled, false, 'Upload network error must NEVER trigger IndexedDB fallback');
  } finally {
    ImageStorage.saveImage = originalSave;
  }
});

// ------------------------------------------------------------------------------
// Part 3: Hardened Deletion Validation Tests
// ------------------------------------------------------------------------------
await test('Remote deletion rejects external URLs with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://evil-site.com/avatar.jpg'),
    { message: /Invalid deletion target: URL does not belong to project's catalog-images bucket/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on external URL');
});

await test('Remote deletion rejects wrong-bucket URLs in same project with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/private-invoices/invoice.pdf'),
    { message: /Invalid deletion target: URL does not belong to project's catalog-images bucket/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on wrong-bucket URL');
});

await test('Remote deletion rejects query parameters and URL fragments with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  await assert.rejects(
    async () => await supabaseClient.deleteImage('products/rogers/ro4003c.webp?version=1'),
    { message: /Invalid storage path for deletion: path contains query parameters or URL fragments/ }
  );

  await assert.rejects(
    async () => await supabaseClient.deleteImage('products/rogers/ro4003c.webp#target'),
    { message: /Invalid storage path for deletion: path contains query parameters or URL fragments/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on path with query/fragment');
});

await test('Remote deletion rejects leading slashes in relative paths and URL paths with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // Single leading slash in relative path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('/products/rogers/ro4003c.webp'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );

  // Double leading slash in relative path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('//products/rogers/ro4003c.webp'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );

  // Leading slash before bucket prefix in relative path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('/catalog-images/products/rogers/ro4003c.webp'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );

  // Leading slash in path component of full URL
  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/catalog-images//products/rogers/ro4003c.webp'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );

  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on leading-slash paths');
});

await test('Remote deletion rejects plain and backslash directory traversal with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  await assert.rejects(
    async () => await supabaseClient.deleteImage('../../../secret.env'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );

  await assert.rejects(
    async () => await supabaseClient.deleteImage('products/rogers/..\\system.dll'),
    { message: /Invalid storage path for deletion: path contains prohibited characters or directory traversal/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on traversal path');
});

await test('Remote deletion rejects single-encoded directory traversal (%2e%2e, %2f, %5c) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // %2e%2e is '..'
  await assert.rejects(
    async () => await supabaseClient.deleteImage('%2e%2e%2fsecret.key'),
    { message: /Invalid storage path for deletion/ }
  );

  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%2frogers%2f..%2f..%2fprivate.key'),
    { message: /Invalid storage path for deletion/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on encoded traversal');
});

await test('Remote deletion rejects double-encoded directory traversal (%252e%252e, %252f, %255c) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // %252e%252e is double-encoded '..'
  await assert.rejects(
    async () => await supabaseClient.deleteImage('%252e%252e%2fsecret.key'),
    { message: /Invalid storage path for deletion/ }
  );

  // %252f is double-encoded '/'
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%252frogers%252f..%252fsecret.key'),
    { message: /Invalid storage path for deletion/ }
  );

  // %255c is double-encoded '\'
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%255crogers%255citem.webp'),
    { message: /Invalid storage path for deletion/ }
  );

  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on double-encoded traversal');
});

await test('Remote deletion rejects encoded separators in otherwise non-traversal relative paths (%2f, %252f, %2F) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // Single-encoded separator %2f in otherwise valid path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%2frogers%2fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  // Double-encoded separator %252f in otherwise valid path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%252frogers%252fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  // Mixed-case encoded separator %2F in otherwise valid path
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products%2Frogers%2Fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on relative paths with encoded separators');
});

await test('Remote deletion rejects encoded separators in otherwise non-traversal URL paths (%2f, %252f, %2F) with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // URL with %2f
  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/catalog-images/products%2frogers%2fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  // URL with %252f
  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/catalog-images/products%252frogers%252fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  // URL with %2F
  await assert.rejects(
    async () => await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/catalog-images/products%2Frogers%2Fro4003c.webp'),
    { message: /Invalid storage path for deletion: encoded path representations are not allowed/ }
  );

  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on URL paths with encoded separators');
});

await test('Remote deletion rejects ambiguous lingering percent signs and excessive encoding with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  await assert.rejects(
    async () => await supabaseClient.deleteImage('products/item%20photo.webp'),
    { message: /Invalid storage path for deletion/ }
  );

  // 4-times encoded %2525252e
  await assert.rejects(
    async () => await supabaseClient.deleteImage('%252525252e%252525252e/secret.key'),
    { message: /Invalid storage path for deletion/ }
  );

  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on ambiguous or excessive encoding');
});

await test('Remote deletion rejects malformed URI encoding with 0 network calls', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };
  mockStorage.set('icon_staff_token', 'valid_token');

  // %E0%A4%A is an incomplete UTF-8 byte sequence that causes decodeURIComponent to throw URIError
  await assert.rejects(
    async () => await supabaseClient.deleteImage('products/%E0%A4%A/image.webp'),
    { message: /Invalid storage path for deletion: malformed URI encoding/ }
  );
  assert.strictEqual(fetchCalled, false, 'Fetch must not be called on malformed encoding');
});

await test('URL-based and relative-path deletion follow identical rules and send exact canonical path', async () => {
  mockStorage.set('icon_staff_token', 'valid_staff_jwt');
  const capturedRequests = [];

  global.fetch = async (url, opts) => {
    capturedRequests.push({ url, method: opts.method, auth: opts.headers['Authorization'] });
    return { ok: true, status: 200 };
  };

  const expectedUrl = 'https://mock-project.supabase.co/storage/v1/object/catalog-images/products/rogers/ro4003c_123.webp';

  // 1. Full public URL
  const res1 = await supabaseClient.deleteImage('https://mock-project.supabase.co/storage/v1/object/public/catalog-images/products/rogers/ro4003c_123.webp');
  assert.strictEqual(res1.success, true);

  // 2. Relative path without bucket prefix
  const res2 = await supabaseClient.deleteImage('products/rogers/ro4003c_123.webp');
  assert.strictEqual(res2.success, true);

  // 3. Relative path with redundant bucket prefix
  const res3 = await supabaseClient.deleteImage('catalog-images/products/rogers/ro4003c_123.webp');
  assert.strictEqual(res3.success, true);

  assert.strictEqual(capturedRequests.length, 3);
  for (const req of capturedRequests) {
    assert.strictEqual(req.method, 'DELETE');
    assert.strictEqual(req.url, expectedUrl, `Requested URL must match exact canonical path: ${req.url}`);
    assert.strictEqual(req.auth, 'Bearer valid_staff_jwt');
  }
});

await test('Remote delete network error is caught and bubbles descriptive error', async () => {
  mockStorage.set('icon_staff_token', 'valid_staff_jwt');
  global.fetch = async () => { throw new TypeError('Network connection reset'); };

  const validUrl = 'https://mock-project.supabase.co/storage/v1/object/public/catalog-images/products/rogers/item.webp';
  await assert.rejects(
    async () => await supabaseClient.deleteImage(validUrl),
    { message: /Storage delete network error: Network connection reset/ }
  );
});

// Restore global fetch
global.fetch = originalFetch;

console.log(`\n--- Test Results: ${passedTests}/${totalTests} Passed ---`);
if (passedTests !== totalTests) {
  process.exit(1);
}
