// ==============================================================================
// tests/publish-webhook-pipeline.test.mjs
// Automated verification for Step 5: Publishing Pipeline & Webhook Integration
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runCatalogPrePublishAudit,
  renderCatalogPublishModal
} from '../src/admin/components/SeoAuditModal.js';
import { supabaseClient } from '../src/services/supabaseClient.js';
import { CATALOG } from '../src/data/catalogData.js';

test('Publishing Pipeline & Webhook Integration Suite', async (t) => {
  await t.test('Test 1: runCatalogPrePublishAudit validates authentic catalog against Option B', () => {
    const audit = runCatalogPrePublishAudit(CATALOG);

    assert.equal(audit.totalOems, 15, 'Must audit all 15 OEMs');
    assert.equal(audit.totalCategories, 88, 'Must audit all 88 categories');
    assert.equal(audit.totalProducts, 169, 'Must audit all 169 products');
    assert.equal(audit.eligibleProducts, 169, 'All 169 verified products in baseline CATALOG must pass Option B');
    assert.equal(audit.draftProducts, 0, 'Zero incomplete products in baseline');
    assert.equal(audit.score, 100, 'Baseline catalog score must be 100%');
    assert.equal(audit.canPublish, true, 'Catalog must be eligible to publish');
  });

  await t.test('Test 2: runCatalogPrePublishAudit separates incomplete products and hidden entities', () => {
    const mockCatalog = [
      {
        id: 'oem-1',
        name: 'Test OEM 1',
        visible: true,
        categories: [
          {
            id: 'cat-1',
            name: 'Cat 1',
            visible: true,
            products: [
              {
                id: 'p1',
                name: 'Valid Component',
                description: 'Full rich technical description for high-frequency microwave testing',
                image: '/images/products/comp1.jpg',
                visible: true
              },
              {
                id: 'p2',
                name: 'Missing Image Component',
                description: 'Valid rich description but hardware photo is missing',
                image: '',
                visible: true
              },
              {
                id: 'p3',
                name: 'Thin Description Component',
                description: 'Too short',
                image: '/images/products/comp3.jpg',
                visible: true
              },
              {
                id: 'p4',
                name: 'Hidden Component',
                description: 'Valid rich description for component',
                image: '/images/products/comp4.jpg',
                visible: false // explicitly draft/hidden
              }
            ]
          }
        ]
      },
      {
        id: 'oem-hidden',
        name: 'Hidden OEM',
        visible: false,
        categories: [
          {
            id: 'c2',
            name: 'Cat 2',
            products: [
              { id: 'p5', name: 'Ignored', description: 'Long enough', image: '/img.jpg' }
            ]
          }
        ]
      }
    ];

    const audit = runCatalogPrePublishAudit(mockCatalog);

    assert.equal(audit.totalOems, 1, 'Only visible OEMs counted');
    assert.equal(audit.totalProducts, 4, 'Total products in visible OEM');
    assert.equal(audit.eligibleProducts, 1, 'Only p1 meets Option B');
    assert.equal(audit.draftProducts, 2, 'p2 and p3 are incomplete drafts');
    assert.equal(audit.hiddenProducts, 1, 'p4 is explicitly marked hidden');
    assert.equal(audit.canPublish, true);
  });

  await t.test('Test 3: renderCatalogPublishModal includes audit metrics and webhook mode', () => {
    const mockAudit = {
      totalOems: 15,
      totalCategories: 88,
      totalProducts: 169,
      eligibleProducts: 160,
      draftProducts: 9,
      hiddenProducts: 0,
      score: 95,
      canPublish: true
    };

    const modalLive = renderCatalogPublishModal(mockAudit, true);
    assert.match(modalLive, /160/, 'Must display eligible count');
    assert.match(modalLive, /9/, 'Must display draft count');
    assert.match(modalLive, /Live deploy webhook is configured/, 'Must indicate live webhook status');

    const modalSim = renderCatalogPublishModal(mockAudit, false);
    assert.match(modalSim, /Simulation Mode/, 'Must indicate simulation mode when unconfigured');
  });

  await t.test('Test 4: triggerPublishWebhook defaults gracefully to Simulation Mode when URL is empty', async () => {
    // When VITE_REBUILD_WEBHOOK_URL is unset
    const result = await supabaseClient.triggerPublishWebhook({
      publishedCount: 169,
      draftCount: 0
    });

    assert.equal(result.success, true);
    assert.equal(result.simulated, true);
    assert.match(result.message, /Simulation Mode/);
  });

  await t.test('Test 5: triggerPublishWebhook dispatches POST and handles 200 OK and 500 error', async () => {
    const originalFetch = globalThis.fetch;

    // Simulate successful webhook (200 OK)
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.buildhost.com/deploy-hook');
      assert.equal(options.method, 'POST');
      return { ok: true, status: 200 };
    };

    // Temporarily point REBUILD_WEBHOOK_URL
    const origUrl = supabaseClient.REBUILD_WEBHOOK_URL;
    supabaseClient.REBUILD_WEBHOOK_URL = 'https://api.buildhost.com/deploy-hook';

    try {
      const okRes = await supabaseClient.triggerPublishWebhook({ publishedCount: 169 });
      assert.equal(okRes.success, true);
      assert.equal(okRes.status, 200);
      assert.match(okRes.message, /triggered successfully/);

      // Simulate failure (500 Server Error)
      globalThis.fetch = async () => ({ ok: false, status: 500 });
      const failRes = await supabaseClient.triggerPublishWebhook({ publishedCount: 169 });
      assert.equal(failRes.success, false);
      assert.equal(failRes.status, 500);
      assert.match(failRes.message, /status 500/);

      // Simulate network exception (Fetch throws)
      globalThis.fetch = async () => { throw new Error('ECONNREFUSED'); };
      const netRes = await supabaseClient.triggerPublishWebhook({ publishedCount: 169 });
      assert.equal(netRes.success, false);
      assert.match(netRes.message, /ECONNREFUSED/);
    } finally {
      supabaseClient.REBUILD_WEBHOOK_URL = origUrl;
      globalThis.fetch = originalFetch;
    }
  });
});
