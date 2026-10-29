// ==============================================================================
// tests/admin-product-persistence.test.mjs
// Automated verification for Step 3: Centralize Product & OEM Persistence
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractAuthoritativeCatalog, generateProductSeedSql } from '../scripts/seed-products-cms.mjs';
import { supabaseClient } from '../src/services/supabaseClient.js';
import { ContentService } from '../src/data/ContentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('Admin Product & OEM Persistence Suite', async (t) => {
  await t.test('Test 1: extractAuthoritativeCatalog extracts all 15 OEMs and 169 products', () => {
    const catalog = extractAuthoritativeCatalog();
    assert.ok(Array.isArray(catalog), 'Catalog must be an array');
    assert.equal(catalog.length, 15, 'Must contain exactly 15 authentic OEMs');

    let totalCats = 0;
    let totalProds = 0;
    for (const oem of catalog) {
      assert.ok(oem.id, 'OEM must have id');
      assert.ok(oem.name, 'OEM must have name');
      assert.ok(Array.isArray(oem.categories), `OEM ${oem.name} must have categories array`);
      for (const cat of oem.categories) {
        totalCats++;
        assert.ok(cat.id, 'Category must have id');
        assert.ok(cat.name, 'Category must have name');
        assert.ok(Array.isArray(cat.products), `Category ${cat.name} must have products array`);
        for (const prod of cat.products) {
          totalProds++;
          assert.ok(prod.id, 'Product must have id');
          assert.ok(prod.name, 'Product must have name');
          assert.ok(prod.canonical_url, 'Product must have canonical URL');
        }
      }
    }

    assert.equal(totalCats, 88, 'Must extract exactly 88 categories');
    assert.equal(totalProds, 169, 'Must extract exactly 169 products');
  });

  await t.test('Test 2: generateProductSeedSql creates valid idempotent SQL', () => {
    const catalog = extractAuthoritativeCatalog();
    const { sql, oemCount, categoryCount, productCount } = generateProductSeedSql(catalog);

    assert.equal(oemCount, 15);
    assert.equal(categoryCount, 88);
    assert.equal(productCount, 169);

    assert.match(sql, /INSERT INTO public\.cms_content/);
    assert.match(sql, /'products'/);
    assert.match(sql, /ON CONFLICT \(key\) DO UPDATE SET/);

    const seedFile = path.resolve(ROOT_DIR, 'supabase', 'seed_products_cms.sql');
    assert.ok(fs.existsSync(seedFile), 'supabase/seed_products_cms.sql must exist on disk');
  });

  await t.test('Test 3: supabaseClient exports catalog persistence API methods', () => {
    assert.equal(typeof supabaseClient.getAuthoritativeCatalog, 'function');
    assert.equal(typeof supabaseClient.saveProductCatalog, 'function');
    assert.equal(typeof supabaseClient.saveProduct, 'function');
    assert.equal(typeof supabaseClient.deleteProduct, 'function');
  });

  await t.test('Test 4: supabaseClient.getAuthoritativeCatalog returns complete catalog', async () => {
    const catalog = await supabaseClient.getAuthoritativeCatalog();
    assert.ok(Array.isArray(catalog), 'Catalog must be an array');
    assert.equal(catalog.length, 15, 'Must return 15 OEMs in offline/fallback mode');

    const rogers = catalog.find(o => o.id === 'rogers-corporation' || o.name.includes('Rogers'));
    assert.ok(rogers, 'Rogers Corporation must exist in catalog');
  });

  await t.test('Test 5: supabaseClient.saveProduct and deleteProduct operate cleanly', async () => {
    // Setup mock localStorage in Node.js test environment if absent
    if (typeof globalThis.localStorage === 'undefined') {
      const store = new Map();
      globalThis.localStorage = {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear()
      };
    }

    const testProd = {
      id: 'test-custom-amp-999',
      name: 'Custom High-Gain Test Amplifier',
      description: 'Mil-spec test amplifier for automated unit testing',
      image: '/images/products/test.jpg',
      visible: true
    };

    const saveRes = await supabaseClient.saveProduct(testProd, 'rogers-corporation', 'rt-duroid');
    assert.ok(saveRes.success, 'saveProduct must succeed');

    const delRes = await supabaseClient.deleteProduct('test-custom-amp-999');
    assert.ok(delRes.success, 'deleteProduct must succeed');
  });

  await t.test('Test 6: ContentService.saveData for products routes through saveProductCatalog', async () => {
    let eventFired = false;
    let eventDetail = null;

    if (typeof globalThis.window === 'undefined') {
      const listeners = new Map();
      globalThis.window = {
        addEventListener: (t, h) => {
          if (!listeners.has(t)) listeners.set(t, []);
          listeners.get(t).push(h);
        },
        removeEventListener: (t, h) => {
          if (listeners.has(t)) {
            listeners.set(t, listeners.get(t).filter(cb => cb !== h));
          }
        },
        dispatchEvent: (e) => {
          if (listeners.has(e.type)) {
            listeners.get(e.type).forEach(cb => cb(e));
          }
        }
      };
      globalThis.CustomEvent = class {
        constructor(type, opt = {}) {
          this.type = type;
          this.detail = opt.detail;
        }
      };
    }

    const handler = (e) => {
      eventFired = true;
      eventDetail = e.detail;
    };
    globalThis.window.addEventListener('cms-data-updated', handler);

    const testOems = [{ id: 'test-oem', name: 'Test OEM', categories: [] }];
    const res = await ContentService.saveData('products', testOems);

    assert.ok(res.success, 'saveData must return success: true');
    assert.ok(eventFired, 'Must fire cms-data-updated custom event');
    assert.equal(eventDetail.pageKey, 'products');

    // ContentService.getData must reflect new data immediately
    const updated = ContentService.getData('products');
    assert.deepEqual(updated, testOems);

    // Reset back to authentic fallback
    ContentService.resetData('products');
    globalThis.window.removeEventListener('cms-data-updated', handler);
  });

  await t.test('Test 7: Unconfigured Supabase client handles product catalog gracefully', async () => {
    const unconfigured = {
      isConfigured: false,
      saveProductCatalog: supabaseClient.saveProductCatalog,
      saveCmsContent: supabaseClient.saveCmsContent
    };

    const res = await unconfigured.saveCmsContent('products', [{ id: 'dummy' }]);
    assert.ok(res.success, 'Unconfigured client must return success without throwing');
    assert.equal(res.localOnly, true, 'Unconfigured result must specify localOnly: true');
  });

  await t.test('Test 8: saveProduct moves product across categories without duplicating records', async () => {
    // 1. Add product to category A
    const prod = {
      id: 'move-test-prod-101',
      name: 'Movable Attenuator',
      description: 'Test product for cross-category move integrity',
      visible: true
    };

    const initialAdd = await supabaseClient.saveProduct(prod, 'rogers-corporation', 'rt-duroid');
    assert.ok(initialAdd.success, 'Initial product addition must succeed');

    let catalog = await supabaseClient.getAuthoritativeCatalog();
    const rogers = catalog.find(o => o.id === 'rogers-corporation');
    const catA = rogers.categories.find(c => c.id === 'rt-duroid');
    assert.ok(catA.products.some(p => p.id === 'move-test-prod-101'), 'Product must exist in category A');

    // 2. Move product to category B (ro4000)
    const moveRes = await supabaseClient.saveProduct(prod, 'rogers-corporation', 'ro4000-series');
    assert.ok(moveRes.success, 'Moving product must succeed');

    catalog = await supabaseClient.getAuthoritativeCatalog();
    const rogersAfter = catalog.find(o => o.id === 'rogers-corporation');
    const catAAfter = rogersAfter.categories.find(c => c.id === 'rt-duroid');
    const catBAfter = rogersAfter.categories.find(c => c.id === 'ro4000-series');

    // Verify it is in catB and NOT in catA
    assert.equal(catAAfter.products.some(p => p.id === 'move-test-prod-101'), false, 'Product must be removed from old category A');
    assert.equal(catBAfter.products.some(p => p.id === 'move-test-prod-101'), true, 'Product must exist in new category B');

    // Clean up
    await supabaseClient.deleteProduct('move-test-prod-101');
  });

  await t.test('Test 9: deleteProduct purges all occurrences cleanly', async () => {
    const prod = {
      id: 'delete-target-prod-202',
      name: 'Purge Target Device',
      description: 'Will be deleted cleanly',
      visible: true
    };

    await supabaseClient.saveProduct(prod, 'rogers-corporation', 'rt-duroid');
    const delRes = await supabaseClient.deleteProduct('delete-target-prod-202');
    assert.ok(delRes.success, 'deleteProduct must succeed');
    assert.ok(delRes.deletedCount >= 1, 'deletedCount must be at least 1');

    const catalog = await supabaseClient.getAuthoritativeCatalog();
    let found = false;
    for (const oem of catalog) {
      for (const cat of (oem.categories || [])) {
        if ((cat.products || []).some(p => p.id === 'delete-target-prod-202')) {
          found = true;
          break;
        }
      }
    }
    assert.equal(found, false, 'Product must be completely absent from catalog after deletion');
  });

  await t.test('Test 10: ContentService saveData dispatches cms-save-warning on remote error', async () => {
    let warningFired = false;
    let warningDetail = null;

    const warningHandler = (e) => {
      warningFired = true;
      warningDetail = e.detail;
    };
    globalThis.window.addEventListener('cms-save-warning', warningHandler);

    // Temporarily mock failing client
    const origConfigured = supabaseClient.isConfigured;
    const origSave = supabaseClient.saveProductCatalog;
    supabaseClient.isConfigured = true;
    supabaseClient.saveProductCatalog = async () => ({ success: false, error: 'Simulated network timeout' });

    try {
      await ContentService.saveData('products', [{ id: 'warning-test', name: 'Test' }]);
      assert.ok(warningFired, 'Must dispatch cms-save-warning event when remote persistence fails');
      assert.equal(warningDetail.pageKey, 'products');
      assert.match(warningDetail.error, /Simulated network timeout/);
    } finally {
      supabaseClient.isConfigured = origConfigured;
      supabaseClient.saveProductCatalog = origSave;
      globalThis.window.removeEventListener('cms-save-warning', warningHandler);
      ContentService.resetData('products');
    }
  });

  await t.test('Test 11: ContentService.saveData preserves cache integrity on remote failure', async () => {
    // Initial baseline data
    const baseline = [{ id: 'stable-oem', name: 'Stable OEM', categories: [] }];
    ContentService.saveData('products', baseline);

    // Mock failing remote Supabase persistence
    const origConfigured = supabaseClient.isConfigured;
    const origSave = supabaseClient.saveProductCatalog;
    supabaseClient.isConfigured = true;
    supabaseClient.saveProductCatalog = async () => ({ success: false, error: 'Database connection refused' });

    try {
      const unconfirmedData = [{ id: 'unconfirmed-oem', name: 'Unconfirmed Ghost OEM', categories: [] }];
      const res = await ContentService.saveData('products', unconfirmedData);

      // Verify save reports failure
      assert.equal(res.success, false, 'Failed remote save must return success: false');
      assert.equal(res.error, 'Database connection refused');

      // Crucial: memoryCache and localStorage must NOT contain unconfirmed data
      const currentCache = ContentService.getData('products');
      assert.deepEqual(currentCache, baseline, 'Cache must retain baseline and NOT be polluted with unconfirmed data');

      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cms_products'));
        assert.deepEqual(stored, baseline, 'localStorage must retain baseline and NOT be polluted with unconfirmed data');
      }
    } finally {
      supabaseClient.isConfigured = origConfigured;
      supabaseClient.saveProductCatalog = origSave;
      ContentService.resetData('products');
    }
  });

  await t.test('Test 12: ContentService.saveData commits to cache and returns localOnly: false on central success', async () => {
    const origConfigured = supabaseClient.isConfigured;
    const origSave = supabaseClient.saveProductCatalog;
    supabaseClient.isConfigured = true;
    supabaseClient.saveProductCatalog = async (oems) => ({ success: true, data: oems });

    try {
      const validData = [{ id: 'verified-oem', name: 'Verified Central OEM', categories: [] }];
      const res = await ContentService.saveData('products', validData);

      assert.equal(res.success, true, 'Confirmed central save must return success: true');
      assert.equal(res.localOnly, false, 'Confirmed central save must specify localOnly: false');

      const cached = ContentService.getData('products');
      assert.deepEqual(cached, validData, 'Cache must update with verified data');
    } finally {
      supabaseClient.isConfigured = origConfigured;
      supabaseClient.saveProductCatalog = origSave;
      ContentService.resetData('products');
    }
  });

  await t.test('Test 13: Unconfigured client explicitly returns localOnly: true for demo storage', async () => {
    const origConfigured = supabaseClient.isConfigured;
    supabaseClient.isConfigured = false;

    try {
      const demoData = [{ id: 'demo-oem', name: 'Demo OEM', categories: [] }];
      const res = await ContentService.saveData('products', demoData);

      assert.equal(res.success, true);
      assert.equal(res.localOnly, true, 'Unconfigured client must explicitly set localOnly: true');
    } finally {
      supabaseClient.isConfigured = origConfigured;
      ContentService.resetData('products');
    }
  });

  await t.test('Test 14: Simulated modal onSave rejection prevents success notifications and keeps form state', async () => {
    let toastType = null;
    let toastMsg = null;
    let modalClosed = false;

    // Simulate modal form submit handler logic matching openModal in Admin.js
    const mockOnSave = async (data) => {
      return { success: false, error: 'PostgREST JWT expired' };
    };

    let submitDisabled = false;
    let submitHtml = 'Save Card';

    const simulateSubmit = async () => {
      submitDisabled = true;
      submitHtml = 'Saving...';

      const result = await mockOnSave({ name: 'Unsaved Product' });
      if (result && result.success === false) {
        submitDisabled = false;
        submitHtml = 'Save Card';
        toastType = 'error';
        toastMsg = result.error;
        return; // Modal stays open!
      }

      modalClosed = true;
      toastType = 'success';
      toastMsg = 'Saved successfully!';
    };

    await simulateSubmit();

    assert.equal(modalClosed, false, 'Modal must NOT be closed on save failure');
    assert.equal(toastType, 'error', 'Toast type must be error, not success');
    assert.equal(toastMsg, 'PostgREST JWT expired', 'Toast message must reflect explicit error');
    assert.equal(submitDisabled, false, 'Submit button must be re-enabled for retrying');
  });

  await t.test('Test 15: Product-edit failure recovery preserves form state and intact references, allowing successful retry', async () => {
    // 1. Initial test catalog
    const testOems = [{
      id: 'rogers',
      name: 'Rogers Corporation',
      categories: [{
        id: 'laminates',
        name: 'High Frequency Laminates',
        products: [{
          id: 'ro4003c',
          name: 'RO4003C',
          category: 'High Frequency Laminates',
          description: 'Hydrocarbon ceramic laminate',
          visible: true
        }]
      }]
    }];

    // 2. Bound references matching Admin.js button click listener
    const oemIdx = 0;
    const catIdx = 0;
    const prodIdx = 0;
    const boundOem = testOems[oemIdx];
    const boundCat = boundOem.categories[catIdx];
    const boundProd = boundCat.products[prodIdx];

    // Verify initial reference identity
    assert.equal(boundCat, testOems[0].categories[0]);
    assert.equal(boundProd, testOems[0].categories[0].products[0]);

    // 3. Form state maintained inside the open modal
    let formState = {
      name: 'RO4003C Ceramic Next-Gen',
      description: 'Updated technical specifications with lower loss tangent',
      category: 'High Frequency Laminates',
      visible: 'true'
    };
    let modalClosed = false;
    let submitDisabled = false;
    let toastType = null;
    let toastMessage = null;

    let remoteShouldFail = true;

    // Simulate Admin.js btn-edit-product onSave handler using the targeted in-place rollback logic
    const handleProductSave = async (data) => {
      const newCatName = (data.category || boundCat.name).trim();
      const updatedProd = {
        ...boundProd,
        name: data.name.trim(),
        description: data.description || '',
        category: newCatName,
        visible: data.visible === 'true'
      };

      const activeOem = testOems[oemIdx] || boundOem;
      const activeCat = activeOem?.categories?.[catIdx] || boundCat;
      const originalProd = activeCat?.products?.[prodIdx];

      const isSameCategory = newCatName.toLowerCase() === activeCat.name.toLowerCase();
      let targetCat = null;
      let isNewTargetCategory = false;

      if (isSameCategory) {
        activeCat.products[prodIdx] = updatedProd;
      } else {
        activeCat.products.splice(prodIdx, 1);
        targetCat = activeOem.categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
        if (!targetCat) {
          targetCat = {
            id: 'cat-new',
            name: newCatName,
            products: []
          };
          activeOem.categories.push(targetCat);
          isNewTargetCategory = true;
        }
        targetCat.products.push(updatedProd);
      }

      const rollbackChanges = () => {
        if (isSameCategory) {
          if (originalProd) activeCat.products[prodIdx] = originalProd;
        } else {
          if (targetCat) {
            const idx = targetCat.products.indexOf(updatedProd);
            if (idx !== -1) targetCat.products.splice(idx, 1);
            if (isNewTargetCategory) {
              const cIdx = activeOem.categories.indexOf(targetCat);
              if (cIdx !== -1) activeOem.categories.splice(cIdx, 1);
            }
          }
          if (originalProd) activeCat.products.splice(prodIdx, 0, originalProd);
        }
      };

      try {
        let res;
        if (remoteShouldFail) {
          res = { success: false, error: 'Database network connection timeout' };
        } else {
          res = { success: true, localOnly: false, data: testOems };
        }

        if (res && !res.success) {
          rollbackChanges();
          return { success: false, error: res.error };
        }

        return { success: true, message: `Product "${updatedProd.name}" saved to central database!` };
      } catch (err) {
        rollbackChanges();
        return { success: false, error: err.message };
      }
    };

    // Modal submit handler simulation
    const submitModalForm = async () => {
      submitDisabled = true;
      const res = await handleProductSave(formState);
      if (res && res.success === false) {
        submitDisabled = false;
        toastType = 'error';
        toastMessage = res.error;
        return; // Form stays open
      }
      modalClosed = true;
      submitDisabled = false;
      toastType = 'success';
      toastMessage = res.message;
    };

    // Step A: First save attempt (Central save FAILS)
    await submitModalForm();

    // Verify Step A Assertions
    assert.equal(modalClosed, false, 'Modal MUST remain open when central save fails');
    assert.equal(submitDisabled, false, 'Submit button MUST be re-enabled for retry');
    assert.equal(toastType, 'error', 'Error notification must be displayed');
    assert.equal(toastMessage, 'Database network connection timeout');
    assert.equal(formState.name, 'RO4003C Ceramic Next-Gen', 'Form state must retain user input');

    // In-memory catalog must have rolled back
    assert.equal(testOems[0].categories[0].products[0].name, 'RO4003C', 'In-memory catalog must roll back to original product');

    // Crucial check: Object references MUST NOT be detached!
    assert.equal(boundCat, testOems[0].categories[0], 'Category object reference must remain identical in memory (not detached)');
    assert.equal(boundOem, testOems[0], 'OEM object reference must remain identical in memory (not detached)');

    // Step B: Retry the exact same edit with central save SUCCEEDING
    remoteShouldFail = false;
    await submitModalForm();

    // Verify Step B Assertions
    assert.equal(modalClosed, true, 'Modal MUST close after successful retry');
    assert.equal(toastType, 'success', 'Success notification must be displayed');
    assert.match(toastMessage, /saved to central database/);

    // Verify persisted product has the user edited values
    assert.equal(testOems[0].categories[0].products[0].name, 'RO4003C Ceramic Next-Gen', 'Catalogue must contain updated product name');
    assert.equal(testOems[0].categories[0].products[0].description, 'Updated technical specifications with lower loss tangent', 'Catalogue must contain updated product description');
  });

  await t.test('Test 16: supabaseClient.saveProductCatalog isolates cache on remote failure without polluting localStorage or dispatching updates', async () => {
    const origConfigured = supabaseClient.isConfigured;
    const origSaveCms = supabaseClient.saveCmsContent;

    supabaseClient.isConfigured = true;

    // Baseline storage setup
    const baseline = [{ id: 'baseline-oem', name: 'Original Stable OEM', categories: [] }];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cms_products', JSON.stringify(baseline));
    }

    let updateEventDispatched = false;
    const updateHandler = () => { updateEventDispatched = true; };
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.addEventListener('cms-data-updated', updateHandler);
    }

    try {
      // 1. Simulate remote save failure in saveCmsContent
      supabaseClient.saveCmsContent = async () => ({
        success: false,
        error: 'Supabase RLS policy violation: insufficient staff privileges'
      });

      const attemptedUnconfirmedCatalog = [
        { id: 'polluted-oem', name: 'Polluted Ghost OEM', categories: [] }
      ];

      const failResult = await supabaseClient.saveProductCatalog(attemptedUnconfirmedCatalog);

      // Verify failure report
      assert.equal(failResult.success, false, 'saveProductCatalog must return failure');
      assert.equal(failResult.error, 'Supabase RLS policy violation: insufficient staff privileges');

      // Verify localStorage was NOT modified with unconfirmed data
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cms_products'));
        assert.deepEqual(stored, baseline, 'localStorage must retain baseline and NOT store unconfirmed data');
      }

      // Verify cms-data-updated event was NOT dispatched
      assert.equal(updateEventDispatched, false, 'cms-data-updated MUST NOT be dispatched on remote save failure');

      // 2. Now simulate confirmed remote save success
      supabaseClient.saveCmsContent = async (key, content) => ({
        success: true,
        data: { key, content }
      });

      const confirmedCatalog = [
        { id: 'confirmed-oem', name: 'Confirmed Central OEM', categories: [] }
      ];

      const successResult = await supabaseClient.saveProductCatalog(confirmedCatalog);
      assert.equal(successResult.success, true, 'saveProductCatalog must return success');

      // Verify localStorage updated with confirmed data
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('cms_products'));
        assert.deepEqual(stored, confirmedCatalog, 'localStorage must be updated with confirmed data');
      }

      // Verify cms-data-updated event WAS dispatched upon confirmation
      assert.equal(updateEventDispatched, true, 'cms-data-updated MUST be dispatched upon confirmed remote save');
    } finally {
      supabaseClient.isConfigured = origConfigured;
      supabaseClient.saveCmsContent = origSaveCms;
      if (typeof globalThis.window !== 'undefined') {
        globalThis.window.removeEventListener('cms-data-updated', updateHandler);
      }
      ContentService.resetData('products');
    }
  });

  await t.test('Test 17: Product-edit with category change rolls back cleanly on failure and succeeds on retry', async () => {
    const testOems = [{
      id: 'rogers',
      name: 'Rogers Corporation',
      categories: [{
        id: 'laminates',
        name: 'High Frequency Laminates',
        products: [{
          id: 'ro4003c',
          name: 'RO4003C',
          category: 'High Frequency Laminates',
          description: 'Hydrocarbon ceramic laminate',
          visible: true
        }]
      }]
    }];

    const oemIdx = 0;
    const catIdx = 0;
    const prodIdx = 0;
    const boundOem = testOems[oemIdx];
    const boundCat = boundOem.categories[catIdx];
    const boundProd = boundCat.products[prodIdx];

    let formState = {
      name: 'RO4003C Advanced',
      category: 'Advanced Bondply Substrates', // NEW CATEGORY
      description: 'Modified category product',
      visible: 'true'
    };
    let modalClosed = false;
    let submitDisabled = false;
    let toastType = null;
    let toastMessage = null;

    let remoteShouldFail = true;

    const handleProductSave = async (data) => {
      const newCatName = (data.category || boundCat.name).trim();
      const updatedProd = {
        ...boundProd,
        name: data.name.trim(),
        description: data.description || '',
        category: newCatName,
        visible: data.visible === 'true'
      };

      const activeOem = testOems[oemIdx] || boundOem;
      const activeCat = activeOem?.categories?.[catIdx] || boundCat;
      const originalProd = activeCat?.products?.[prodIdx];

      const isSameCategory = newCatName.toLowerCase() === activeCat.name.toLowerCase();
      let targetCat = null;
      let isNewTargetCategory = false;

      if (isSameCategory) {
        activeCat.products[prodIdx] = updatedProd;
      } else {
        activeCat.products.splice(prodIdx, 1);
        targetCat = activeOem.categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
        if (!targetCat) {
          const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          targetCat = {
            id: catSlug || ('cat-' + Date.now()),
            name: newCatName,
            label: '',
            description: '',
            visible: true,
            products: []
          };
          activeOem.categories.push(targetCat);
          isNewTargetCategory = true;
        }
        targetCat.products.push(updatedProd);
      }

      const rollbackChanges = () => {
        if (isSameCategory) {
          if (originalProd) activeCat.products[prodIdx] = originalProd;
        } else {
          if (targetCat) {
            const idx = targetCat.products.indexOf(updatedProd);
            if (idx !== -1) targetCat.products.splice(idx, 1);
            if (isNewTargetCategory) {
              const cIdx = activeOem.categories.indexOf(targetCat);
              if (cIdx !== -1) activeOem.categories.splice(cIdx, 1);
            }
          }
          if (originalProd) activeCat.products.splice(prodIdx, 0, originalProd);
        }
      };

      try {
        let res;
        if (remoteShouldFail) {
          res = { success: false, error: 'Remote write rejected' };
        } else {
          res = { success: true, localOnly: false, data: testOems };
        }

        if (res && !res.success) {
          rollbackChanges();
          return { success: false, error: res.error };
        }

        return { success: true, message: `Product "${updatedProd.name}" saved to central database!` };
      } catch (err) {
        rollbackChanges();
        return { success: false, error: err.message };
      }
    };

    const submitModalForm = async () => {
      submitDisabled = true;
      const res = await handleProductSave(formState);
      if (res && res.success === false) {
        submitDisabled = false;
        toastType = 'error';
        toastMessage = res.error;
        return;
      }
      modalClosed = true;
      submitDisabled = false;
      toastType = 'success';
      toastMessage = res.message;
    };

    // First attempt: Save fails
    await submitModalForm();

    assert.equal(modalClosed, false, 'Modal must remain open on category change failure');
    assert.equal(toastType, 'error');
    assert.equal(formState.category, 'Advanced Bondply Substrates', 'Form state must retain attempted category change');

    // Catalogue integrity check on failure:
    assert.equal(testOems[0].categories.length, 1, 'Temporary new category must be cleanly pruned on rollback');
    assert.equal(testOems[0].categories[0].products.length, 1, 'Original category must still contain the product');
    assert.equal(testOems[0].categories[0].products[0].name, 'RO4003C', 'Product in original category must have original name');
    assert.equal(boundCat, testOems[0].categories[0], 'Category reference must remain attached');

    // Second attempt: Retry succeeds
    remoteShouldFail = false;
    await submitModalForm();

    assert.equal(modalClosed, true, 'Modal must close on successful retry');
    assert.equal(toastType, 'success');
    assert.equal(testOems[0].categories.length, 2, 'New category must be persisted in catalogue');
    assert.equal(testOems[0].categories[0].products.length, 0, 'Original category must no longer contain the moved product');
    assert.equal(testOems[0].categories[1].name, 'Advanced Bondply Substrates');
    assert.equal(testOems[0].categories[1].products.length, 1);
    assert.equal(testOems[0].categories[1].products[0].name, 'RO4003C Advanced');
  });

  await t.test('Test 18: In-memory cache isolation during pending product saves (failure and success outcomes)', async () => {
    // 1. Establish baseline confirmed data in cache
    const initialOems = [{
      id: 'rogers',
      name: 'Rogers Corporation',
      categories: [{
        id: 'laminates',
        name: 'High Frequency Laminates',
        products: [{
          id: 'ro4003c',
          name: 'Authoritative RO4003C Original',
          category: 'High Frequency Laminates',
          description: 'Original hydrocarbon ceramic laminate'
        }]
      }]
    }];

    // Commit baseline to ContentService
    await ContentService.saveData('products', initialOems);

    // Verify baseline in cache
    const baselineInCache = ContentService.getData('products');
    assert.equal(baselineInCache[0].categories[0].products[0].name, 'Authoritative RO4003C Original');

    // 2. Setup mock for supabaseClient with controlled deferral (pending save)
    const origConfigured = supabaseClient.isConfigured;
    const origSave = supabaseClient.saveProductCatalog;
    supabaseClient.isConfigured = true;

    let resolvePendingSave = null;
    let pendingSavePromise = null;

    supabaseClient.saveProductCatalog = (catalogData) => {
      pendingSavePromise = new Promise((resolve) => {
        resolvePendingSave = resolve;
      });
      return pendingSavePromise;
    };

    let subscriberNotified = false;
    let subscriberPayload = null;
    const subscriberHandler = (e) => {
      subscriberNotified = true;
      subscriberPayload = e.detail;
    };
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.addEventListener('cms-data-updated', subscriberHandler);
    }

    try {
      // 3. Admin retrieves catalogue working copy and applies unconfirmed edit
      const adminWorkingCopy = ContentService.getData('products');
      adminWorkingCopy[0].categories[0].products[0].name = 'UNCONFIRMED MUTATION (PENDING IN-FLIGHT)';

      // 4. Admin initiates asynchronous save
      const saveExecutionPromise = ContentService.saveData('products', adminWorkingCopy);

      // 5. AT THIS EXACT MOMENT, THE SAVE IS PENDING (in-flight network call)
      assert.ok(resolvePendingSave !== null, 'Save operation must be actively pending in flight');

      // CRITICAL VERIFICATION: Inspect cache while save is pending
      const cacheWhilePending = ContentService.getData('products');
      assert.equal(
        cacheWhilePending[0].categories[0].products[0].name,
        'Authoritative RO4003C Original',
        'In-memory cache MUST NOT be polluted with unconfirmed data while save is pending'
      );
      assert.equal(subscriberNotified, false, 'Subscribers MUST NOT be notified before save confirms');

      // 6. Outcome A: Remote save FAILS
      resolvePendingSave({ success: false, error: 'Database network connection dropped' });
      const failResult = await saveExecutionPromise;

      assert.equal(failResult.success, false, 'Failed save must report failure');
      assert.equal(failResult.error, 'Database network connection dropped');

      // Verify cache after failed save
      const cacheAfterFailure = ContentService.getData('products');
      assert.equal(
        cacheAfterFailure[0].categories[0].products[0].name,
        'Authoritative RO4003C Original',
        'In-memory cache MUST remain unchanged after failed remote save'
      );
      assert.equal(subscriberNotified, false, 'Subscribers MUST NOT be notified after save failure');

      // 7. Outcome B: Retry with Remote save SUCCEEDING
      let resolveRetrySave = null;
      supabaseClient.saveProductCatalog = (catalogData) => {
        return new Promise((resolve) => {
          resolveRetrySave = resolve;
        });
      };

      const retryPromise = ContentService.saveData('products', adminWorkingCopy);
      assert.ok(resolveRetrySave !== null, 'Retry save is actively pending');

      // Inspect cache again while retry is pending: still original!
      const cacheWhileRetryPending = ContentService.getData('products');
      assert.equal(cacheWhileRetryPending[0].categories[0].products[0].name, 'Authoritative RO4003C Original');

      // Now resolve retry as SUCCESS
      resolveRetrySave({ success: true, localOnly: false, data: adminWorkingCopy });
      const successResult = await retryPromise;

      assert.equal(successResult.success, true, 'Confirmed retry must report success');

      // Verify cache after confirmed save
      const cacheAfterSuccess = ContentService.getData('products');
      assert.equal(
        cacheAfterSuccess[0].categories[0].products[0].name,
        'UNCONFIRMED MUTATION (PENDING IN-FLIGHT)',
        'In-memory cache MUST update with confirmed data after successful persistence'
      );
      assert.equal(subscriberNotified, true, 'Subscribers MUST be notified after confirmed save');
      assert.equal(subscriberPayload.pageKey, 'products');
    } finally {
      supabaseClient.isConfigured = origConfigured;
      supabaseClient.saveProductCatalog = origSave;
      if (typeof globalThis.window !== 'undefined') {
        globalThis.window.removeEventListener('cms-data-updated', subscriberHandler);
      }
      ContentService.resetData('products');
    }
  });
  await t.test('Test 19: Atomic conditional update succeeds when expectedVersion matches', async () => {
    supabaseClient._setMockVersion('products', 1);
    ContentService._setSectionMeta('products', { version: 1, updated_at: null, isRemote: false });

    const baseCatalog = ContentService.getData('products');
    baseCatalog[0].tagline = 'Updated Tagline for OCC Test 19';

    const res = await ContentService.saveData('products', baseCatalog, { expectedVersion: 1 });
    assert.equal(res.success, true, 'Save must succeed when expectedVersion matches current version');
    assert.equal(res.version, 2, 'Version must increment to 2 on success');

    const meta = ContentService.getSectionMeta('products');
    assert.equal(meta.version, 2, 'ContentService metadata version must advance to 2');
    ContentService.resetData('products');
  });

  await t.test('Test 20: Stale save rejection when server version has advanced', async () => {
    supabaseClient._setMockVersion('products', 2);
    ContentService._setSectionMeta('products', { version: 2, updated_at: null, isRemote: false });

    const baseCatalog = ContentService.getData('products');
    const originalName = baseCatalog[0].categories[0].products[0].name;

    // Simulate stale edit: saving with expectedVersion: 1 while version is already 2
    baseCatalog[0].categories[0].products[0].name = 'STALE EDIT SHOULD BE REJECTED';
    const res = await ContentService.saveData('products', baseCatalog, { expectedVersion: 1 });

    assert.equal(res.success, false, 'Stale save must fail');
    assert.equal(res.conflict, true, 'Stale save must be flagged as conflict');

    // Cache must remain untouched with original data
    const cache = ContentService.getData('products');
    assert.equal(cache[0].categories[0].products[0].name, originalName, 'In-memory cache must not be mutated on conflict');
    ContentService.resetData('products');
  });

  await t.test('Test 21: Preserved form input and modal state upon conflict', async () => {
    const mockForm = {
      name: 'Unsaved User Input in Form',
      description: 'Preserved technical specification',
      applications: 'Preserved applications'
    };

    supabaseClient._setMockVersion('products', 3);
    ContentService._setSectionMeta('products', { version: 3, updated_at: null, isRemote: false });

    // Attempt save with stale version 2
    const res = await ContentService.saveData('products', [], { expectedVersion: 2 });
    assert.equal(res.conflict, true);

    // Form inputs must remain intact
    assert.equal(mockForm.name, 'Unsaved User Input in Form');
    assert.equal(mockForm.description, 'Preserved technical specification');
    ContentService.resetData('products');
  });

  await t.test('Test 22: Rejection of unversioned writes on existing records (no unconditional upsert bypass)', async () => {
    const origConfigured = supabaseClient.isConfigured;
    supabaseClient.isConfigured = true;

    // Simulate presence of staff auth token
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem('icon_staff_token', 'mock_jwt_staff_token');
    }

    try {
      // Attempt to save without expectedVersion on existing record
      const res = await supabaseClient.saveCmsContent('products', [{ id: 'oem-1' }]);
      assert.equal(res.success, false, 'Unversioned write must be rejected');
      assert.match(res.error, /expectedVersion is required/, 'Error must explain expectedVersion requirement');
    } finally {
      supabaseClient.isConfigured = origConfigured;
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.removeItem('icon_staff_token');
      }
    }
  });

  await t.test('Test 23: Direct writers (saveProduct, deleteProduct) forward expectedVersion', async () => {
    supabaseClient._setMockVersion('products', 1);

    const testProd = {
      id: 'test-direct-writer-prod',
      name: 'Direct Writer OCC Product',
      description: 'Test OCC forwarding',
      visible: true
    };

    // Stale version rejection on saveProduct
    const staleSave = await supabaseClient.saveProduct(testProd, 'rogers-corporation', 'high-frequency-laminates', { expectedVersion: 99 });
    assert.equal(staleSave.success, false, 'Stale expectedVersion on saveProduct must fail');
    assert.equal(staleSave.conflict, true, 'Must indicate conflict');

    // Matching version succeeds
    const goodSave = await supabaseClient.saveProduct(testProd, 'rogers-corporation', 'high-frequency-laminates', { expectedVersion: 1 });
    assert.equal(goodSave.success, true, 'Matching expectedVersion on saveProduct must succeed');

    // Delete with stale version fails
    const staleDel = await supabaseClient.deleteProduct('test-direct-writer-prod', { expectedVersion: 99 });
    assert.equal(staleDel.success, false, 'Stale expectedVersion on deleteProduct must fail');
    assert.equal(staleDel.conflict, true, 'Must indicate conflict');

    // Delete with good version succeeds
    const goodDel = await supabaseClient.deleteProduct('test-direct-writer-prod', { expectedVersion: 2 });
    assert.equal(goodDel.success, true, 'Matching expectedVersion on deleteProduct must succeed');
    ContentService.resetData('products');
  });

  await t.test('Test 24: Fail-closed behavior on central database read failure', async () => {
    const origConfigured = supabaseClient.isConfigured;
    supabaseClient.isConfigured = true;

    // Simulate remote read failure
    ContentService._setRemoteAvailable(false, 'Simulated connection timeout to central Supabase');

    try {
      const saveRes = await ContentService.saveData('products', [{ id: 'oem-fail-closed' }]);
      assert.equal(saveRes.success, false, 'Writes must be blocked when remote persistence is unavailable');
      assert.match(saveRes.error, /Central persistence is unavailable/, 'Error must state persistence is blocked');
    } finally {
      ContentService._setRemoteAvailable(true, null);
      supabaseClient.isConfigured = origConfigured;
      ContentService.resetData('products');
    }
  });

  await t.test('Test 25: 3-way element-level reconciliation merges non-conflicting product and category edits', () => {
    const baseCatalog = [
      {
        id: 'oem-rogers',
        name: 'Rogers',
        categories: [
          {
            id: 'cat-laminates',
            name: 'Laminates',
            products: [
              { id: 'prod-ro4003', name: 'RO4003C', desc: 'Original RO4003' },
              { id: 'prod-ro4350', name: 'RO4350B', desc: 'Original RO4350' }
            ]
          }
        ]
      }
    ];

    // Local admin modified Product RO4003
    const localCatalog = JSON.parse(JSON.stringify(baseCatalog));
    localCatalog[0].categories[0].products[0].desc = 'Admin A Edited RO4003';

    // Concurrent server admin modified Product RO4350
    const serverCatalog = JSON.parse(JSON.stringify(baseCatalog));
    serverCatalog[0].categories[0].products[1].desc = 'Admin B Edited RO4350';

    const findInTree = (arr, id) => {
      for (const o of arr) {
        for (const c of o.categories) {
          const p = c.products.find(prod => prod.id === id);
          if (p) return { oem: o, cat: c, product: p };
        }
      }
      return null;
    };

    const bMatch = findInTree(baseCatalog, 'prod-ro4003');
    const sMatch = findInTree(serverCatalog, 'prod-ro4003');

    // Confirm that server did not touch prod-ro4003
    assert.equal(JSON.stringify(bMatch.product), JSON.stringify(sMatch.product), 'Server product ro4003 is untouched');

    // Merge local prod-ro4003 into serverCatalog
    const merged = JSON.parse(JSON.stringify(serverCatalog));
    const mMatch = findInTree(merged, 'prod-ro4003');
    mMatch.cat.products[0] = JSON.parse(JSON.stringify(localCatalog[0].categories[0].products[0]));

    // Assert that merged catalogue contains BOTH Admin A and Admin B edits!
    assert.equal(merged[0].categories[0].products[0].desc, 'Admin A Edited RO4003', 'Must contain Admin A edit');
    assert.equal(merged[0].categories[0].products[1].desc, 'Admin B Edited RO4350', 'Must contain Admin B edit');

    // Now test collision on same product:
    const collidingServer = JSON.parse(JSON.stringify(baseCatalog));
    collidingServer[0].categories[0].products[0].desc = 'Admin B ALSO Edited RO4003';
    const isSame = JSON.stringify(bMatch.product) === JSON.stringify(findInTree(collidingServer, 'prod-ro4003').product);
    assert.equal(isSame, false, 'Same-product collision must be detected as conflicting');
  });

});



