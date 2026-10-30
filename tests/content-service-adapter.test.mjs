// ==============================================================================
// tests/content-service-adapter.test.mjs
// Automated verification for Step 2: ContentService Adapter & Supabase Client
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

// Setup browser globals for Node.js test environment before importing ContentService
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (i) => Array.from(mockStorage.keys())[i] || null
};

const dispatchedEvents = [];
const eventListeners = new Map();

globalThis.window = {
  dispatchEvent: (event) => {
    dispatchedEvents.push(event);
    const handlers = eventListeners.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('Error in mock event handler:', err);
      }
    }
    return true;
  },
  addEventListener: (type, handler) => {
    if (!eventListeners.has(type)) eventListeners.set(type, []);
    eventListeners.get(type).push(handler);
  },
  removeEventListener: (type, handler) => {
    if (!eventListeners.has(type)) return;
    eventListeners.set(type, eventListeners.get(type).filter(h => h !== handler));
  }
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail || null;
  }
};

// Now import ContentService after window and localStorage globals are set up
const { ContentService } = await import('../src/data/ContentService.js');
const { supabaseClient } = await import('../src/services/supabaseClient.js');

test('ContentService Adapter Suite', async (t) => {
  await t.test('Test 1: ContentService exports required synchronous and asynchronous API surface', () => {
    assert.equal(typeof ContentService.init, 'function', 'ContentService.init must be a function');
    assert.equal(typeof ContentService.getData, 'function', 'ContentService.getData must be a function');
    assert.equal(typeof ContentService.saveData, 'function', 'ContentService.saveData must be a function');
    assert.equal(typeof ContentService.resetData, 'function', 'ContentService.resetData must be a function');
    assert.equal(typeof ContentService.resolveImg, 'function', 'ContentService.resolveImg must be a function');
  });

  await t.test('Test 2: supabaseClient exports CMS content methods', () => {
    assert.equal(typeof supabaseClient.getAllCmsContent, 'function', 'supabaseClient.getAllCmsContent must be a function');
    assert.equal(typeof supabaseClient.getCmsContent, 'function', 'supabaseClient.getCmsContent must be a function');
    assert.equal(typeof supabaseClient.saveCmsContent, 'function', 'supabaseClient.saveCmsContent must be a function');
  });

  await t.test('Test 3: ContentService.init() executes cleanly and enables fast synchronous getData()', async () => {
    await ContentService.init();

    // Must be completely synchronous (not returning a Promise)
    const homeData = ContentService.getData('home');
    assert.ok(homeData && typeof homeData === 'object', 'homeData must be an object');
    assert.ok(homeData.heroTitle, 'homeData must contain heroTitle');
    assert.equal(homeData.heroTitle.includes('mission-ready hardware'), true, 'homeData must match authentic text');

    const aboutData = ContentService.getData('about');
    assert.equal(aboutData.heroTitle, 'About Us', 'aboutData must match authentic title');

    const partnersData = ContentService.getData('partners');
    assert.ok(Array.isArray(partnersData.partners), 'partnersData.partners must be an array');
    assert.ok(partnersData.partners.length >= 10, 'partnersData must contain at least 10 partners');

    const blogsData = ContentService.getData('blogs');
    assert.ok(Array.isArray(blogsData.oemBlogs), 'blogsData.oemBlogs must be an array');
    assert.ok(blogsData.oemBlogs.length >= 10, 'blogsData must contain at least 10 OEM blogs');
  });

  await t.test('Test 4: ContentService.saveData() updates in-memory cache and localStorage synchronously', async () => {
    const updatedAbout = {
      heroTitle: 'Updated About Us Title for Testing',
      heroLead: 'Verified test lead paragraph for RF/microwave testing.'
    };

    const res = await ContentService.saveData('about', updatedAbout);
    assert.ok(res.success, 'saveData must return success');

    // Immediate synchronous read must reflect the new value
    const readBack = ContentService.getData('about');
    assert.equal(readBack.heroTitle, 'Updated About Us Title for Testing', 'Synchronous read must immediately return updated value');

    // LocalStorage must be mirrored
    const rawLocal = localStorage.getItem('cms_about');
    assert.ok(rawLocal, 'localStorage must contain cms_about');
    const parsed = JSON.parse(rawLocal);
    assert.equal(parsed.heroTitle, 'Updated About Us Title for Testing', 'localStorage must match saved data');
  });

  await t.test('Test 5: ContentService.resetData() purges cache and resets to authentic defaults', () => {
    const fresh = ContentService.resetData('about');
    assert.equal(fresh.heroTitle, 'About Us', 'resetData must restore authentic default title');

    const readAgain = ContentService.getData('about');
    assert.equal(readAgain.heroTitle, 'About Us', 'Subsequent getData must return authentic default');
  });

  await t.test('Test 6: Cross-component event updates cache and notifies UI', async () => {
    const externalUpdate = {
      heroTitle: 'Migrated Title via Event',
      items: [{ id: 'p-1', title: 'Test Project' }]
    };

    // Simulate ImageMigrationService or external component dispatching event
    window.dispatchEvent(new CustomEvent('cms-data-updated', {
      detail: { pageKey: 'projects', data: externalUpdate }
    }));

    const currentProjects = ContentService.getData('projects');
    assert.equal(currentProjects.heroTitle, 'Migrated Title via Event', 'Memory cache must update when cms-data-updated is dispatched');
  });

  await t.test('Test 7: Unconfigured Supabase client handles CMS calls gracefully without throwing', async () => {
    // In test environment, unless VITE_SUPABASE_URL is provided, isConfigured is false
    const res = await supabaseClient.saveCmsContent('contact', { phone: '+123456789' });
    assert.ok(res.success, 'saveCmsContent must return success in unconfigured mode');
    assert.ok(res.localOnly, 'Must indicate localOnly mode when unconfigured');

    const remoteContent = await supabaseClient.getCmsContent('nonexistent');
    assert.equal(remoteContent, null, 'getCmsContent must return null when unconfigured without throwing');

    const allContent = await supabaseClient.getAllCmsContent();
    assert.equal(allContent, null, 'getAllCmsContent must return null when unconfigured without throwing');
  });
});
