// ==============================================================================
// tests/static-catalog-builder.test.mjs
// Automated verification for Step 4: Connecting Static Site Generator to Supabase
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadAuthoritativeCatalog,
  generateProductHtml,
  sanitizeImageUrl,
  getCssAssetFile,
  run
} from '../scripts/build-static-catalog.mjs';
import { CATALOG } from '../src/data/catalogData.js';

test('Static Catalog Builder Suite', async (t) => {
  await t.test('Test 1: loadAuthoritativeCatalog falls back to CATALOG when env is unset', async () => {
    const catalog = await loadAuthoritativeCatalog({
      env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' }
    });
    assert.equal(catalog, CATALOG, 'Must return authentic CATALOG array when unconfigured');
    assert.equal(catalog.length, 15, 'Must contain 15 OEMs in fallback');
  });

  await t.test('Test 2: loadAuthoritativeCatalog parses and returns remote catalog when Supabase responds', async () => {
    const mockRemoteCatalog = [
      {
        id: 'mock-oem',
        name: 'Mock Principal OEM',
        categories: [
          {
            id: 'mock-cat',
            name: 'Mock Category',
            products: [
              {
                id: 'mock-prod-1',
                name: 'Mock Product 1',
                description: 'Detailed technical description for automated verification testing',
                image: '/images/products/mock.jpg'
              }
            ]
          }
        ]
      }
    ];

    const mockFetch = async (url, options) => {
      assert.ok(url.includes('/rest/v1/cms_content?key=eq.products'), 'Must query cms_content with key=products');
      assert.equal(options.headers.apikey, 'test-key', 'Must pass apikey header');
      assert.equal(options.headers.Authorization, 'Bearer test-key', 'Must pass Bearer token');
      return {
        ok: true,
        json: async () => [{ key: 'products', content: mockRemoteCatalog }]
      };
    };

    const catalog = await loadAuthoritativeCatalog({
      env: { VITE_SUPABASE_URL: 'https://mock.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' },
      fetch: mockFetch
    });

    assert.equal(catalog, mockRemoteCatalog, 'Must return parsed remote content array');
    assert.equal(catalog.length, 1);
    assert.equal(catalog[0].id, 'mock-oem');
  });

  await t.test('Test 3: Remote fetch network error or non-200 degrades gracefully to CATALOG', async () => {
    const mockFailingFetch = async () => {
      throw new Error('ETIMEDOUT: Connection to database timed out');
    };

    const catalog = await loadAuthoritativeCatalog({
      env: { VITE_SUPABASE_URL: 'https://mock.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' },
      fetch: mockFailingFetch
    });

    assert.equal(catalog, CATALOG, 'Must degrade gracefully to CATALOG array on fetch throw');
  });

  await t.test('Test 4: Hidden OEMs, categories, and products are skipped during generation', async () => {
    const mockCatalogWithHidden = [
      {
        id: 'hidden-oem',
        name: 'Hidden OEM',
        visible: false,
        categories: [
          {
            id: 'c1',
            name: 'Cat 1',
            products: [{ id: 'p1', name: 'Prod 1', description: 'Long enough description for test', image: '/img.jpg' }]
          }
        ]
      },
      {
        id: 'visible-oem',
        name: 'Visible OEM',
        visible: true,
        categories: [
          {
            id: 'hidden-cat',
            name: 'Hidden Cat',
            visible: false,
            products: [{ id: 'p2', name: 'Prod 2', description: 'Long enough description for test', image: '/img.jpg' }]
          },
          {
            id: 'visible-cat',
            name: 'Visible Cat',
            visible: true,
            products: [
              { id: 'hidden-prod', name: 'Hidden Prod', visible: false, description: 'Long enough description for test', image: '/img.jpg' },
              { id: 'visible-prod', name: 'Visible Prod', visible: true, description: 'Long enough description for test', image: '/img.jpg' }
            ]
          }
        ]
      }
    ];

    const mockFetch = async () => ({
      ok: true,
      json: async () => [{ key: 'products', content: mockCatalogWithHidden }]
    });

    const result = await run({
      dryRun: true,
      env: { VITE_SUPABASE_URL: 'https://mock.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' },
      fetch: mockFetch
    });

    assert.equal(result.productCount, 1, 'Only the single visible product in visible cat and visible oem must be generated');
  });

  await t.test('Test 5: Option B Quality Gate rejects products without images or with description < 20 chars', async () => {
    const mockQualityCatalog = [
      {
        id: 'test-oem',
        name: 'Test OEM',
        categories: [
          {
            id: 'c1',
            name: 'Cat 1',
            products: [
              { id: 'no-img', name: 'No Image Prod', description: 'Valid long technical description for testing', image: '' },
              { id: 'thin-desc', name: 'Thin Desc Prod', description: 'Too short', image: '/img.jpg' },
              { id: 'valid-prod', name: 'Valid Prod', description: 'Comprehensive component description meeting Option B rules', image: '/img.jpg' }
            ]
          }
        ]
      }
    ];

    const mockFetch = async () => ({
      ok: true,
      json: async () => [{ key: 'products', content: mockQualityCatalog }]
    });

    const result = await run({
      dryRun: true,
      env: { VITE_SUPABASE_URL: 'https://mock.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' },
      fetch: mockFetch
    });

    assert.equal(result.productCount, 1, 'Option B Quality Gate must accept exactly 1 valid product');
  });

  await t.test('Test 6: Custom SEO metadata is properly rendered in HTML head and Schema.org', () => {
    const customProduct = {
      id: 'custom-rf-filter-100',
      name: 'Custom Cavity Bandpass Filter',
      description: 'High-Q cavity bandpass filter engineered for military radar and telemetry systems.',
      meta_title: 'Custom Military Cavity Filter | Specialized Solutions | Icon Electromatic',
      meta_description: 'Precision cavity bandpass filter offering low insertion loss and high out-of-band rejection.',
      canonical_url: 'https://iconelectromatic.com/products/triteq/custom-rf-filter-100'
    };

    const oem = { id: 'triteq', name: 'TriTeq' };
    const cat = { id: 'filters', name: 'RF Filters' };
    const images = [{ url: '/images/products/filter.jpg', alt: 'Cavity Filter', is_primary: true }];

    const html = generateProductHtml(customProduct, oem, cat, images);

    // Meta Title
    assert.match(html, /<title>Custom Military Cavity Filter \| Specialized Solutions \| Icon Electromatic<\/title>/);
    // Meta Description
    assert.match(html, /<meta name="description" content="Precision cavity bandpass filter offering low insertion loss and high out-of-band rejection\.">/);
    // Canonical URL
    assert.match(html, /<link rel="canonical" href="https:\/\/iconelectromatic\.com\/products\/triteq\/custom-rf-filter-100">/);
    // OpenGraph Tags
    assert.match(html, /<meta property="og:title" content="Custom Military Cavity Filter/);
    assert.match(html, /<meta property="og:url" content="https:\/\/iconelectromatic\.com\/products\/triteq\/custom-rf-filter-100">/);
    // Schema.org
    assert.match(html, /"https:\/\/iconelectromatic\.com\/products\/triteq\/custom-rf-filter-100"/);
  });

  await t.test('Test 7: Multi-image gallery items appear in thumbnails and image markup', () => {
    const productWithGallery = {
      id: 'prod-gallery-test',
      name: 'Multi-Image Synthesizer Module',
      description: 'Wideband frequency synthesizer with multiple hardware inspection angles.',
      gallery: [
        { image_url: '/images/products/synth-front.jpg', alt_text: 'Front Faceplate', is_primary: true },
        { image_url: '/images/products/synth-pcb.jpg', alt_text: 'Internal RF PCB', is_primary: false }
      ]
    };

    const oem = { id: 'minicircuits', name: 'Mini-Circuits' };
    const cat = { id: 'synthesizers', name: 'Synthesizers' };
    const images = productWithGallery.gallery.map(g => ({ url: g.image_url, alt: g.alt_text, is_primary: g.is_primary }));

    const html = generateProductHtml(productWithGallery, oem, cat, images);

    assert.match(html, /synth-front\.jpg/);
    assert.match(html, /synth-pcb\.jpg/);
    assert.match(html, /thumbs-row/);
    assert.match(html, /Internal RF PCB/);
  });

  await t.test('Test 8: sanitizeImageUrl filters idb:, blob:, and data: URLs to fallback', () => {
    assert.equal(sanitizeImageUrl('idb:sample-uuid-123.png', '/fallback.jpg'), '/fallback.jpg');
    assert.equal(sanitizeImageUrl('blob:http://localhost:5173/abc', '/fallback.jpg'), '/fallback.jpg');
    assert.equal(sanitizeImageUrl('data:image/png;base64,...', '/fallback.jpg'), '/fallback.jpg');
    assert.equal(sanitizeImageUrl('  ', '/fallback.jpg'), '/fallback.jpg');
    assert.equal(sanitizeImageUrl(null, '/fallback.jpg'), '/fallback.jpg');
    assert.equal(sanitizeImageUrl('/images/products/rf.jpg', '/fallback.jpg'), '/images/products/rf.jpg');
    assert.equal(sanitizeImageUrl('https://supabase.co/storage/v1/obj/img.webp', '/fallback.jpg'), 'https://supabase.co/storage/v1/obj/img.webp');
  });

  await t.test('Test 9: generateProductHtml complies with Rule 5 (no # hash routes in breadcrumbs) and escapes URLs', () => {
    const product = {
      id: 'test-filter-1',
      name: 'Precision Filter & Coupler',
      description: 'Ultra high frequency component designed for RF satellite links.',
      canonical_url: 'https://iconelectromatic.com/products/triteq/test-filter-1?ref=test&lang=en'
    };
    const oem = { id: 'triteq', name: 'TriTeq Corp' };
    const cat = { id: 'rf-filters', name: 'RF Filters' };
    const images = [{ url: 'idb:temp-upload-blob.png', alt: 'Test', is_primary: true }];

    const html = generateProductHtml(product, oem, cat, images);

    // Rule 5: No #hash routes in breadcrumbs schema or HTML
    assert.doesNotMatch(html, /products#triteq/, 'Must not contain hash route in breadcrumbs');
    assert.match(html, /"https:\/\/iconelectromatic\.com\/products\?oem=triteq"/, 'Must use real URL in schema breadcrumbs');
    assert.match(html, /<a href="\/products\?oem=triteq">TriTeq Corp<\/a>/, 'Must use real URL query parameter in breadcrumb link');

    // Canonical and OG URL attribute escaping
    assert.match(html, /<link rel="canonical" href="https:\/\/iconelectromatic\.com\/products\/triteq\/test-filter-1\?ref=test&amp;lang=en">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/iconelectromatic\.com\/products\/triteq\/test-filter-1\?ref=test&amp;lang=en">/);

    // Image URL should fall back instead of outputting idb:
    assert.doesNotMatch(html, /idb:/, 'Must not output idb: in HTML markup');
    assert.match(html, /rf-laminate\.jpg/, 'Must fall back to authentic default image');
  });

  await t.test('Test 10: run() deduplicates sitemap URLs preventing Search Console duplication', async () => {
    const mockDuplicateCatalog = [
      {
        id: 'oem-dup',
        name: 'OEM Dup',
        categories: [
          {
            id: 'cat-1',
            name: 'Cat 1',
            products: [
              {
                id: 'prod-shared',
                name: 'Shared Product',
                description: 'Valid long technical description for testing sitemap deduplication',
                canonical_url: 'https://iconelectromatic.com/products/oem-dup/prod-canonical',
                image: '/img1.jpg'
              }
            ]
          },
          {
            id: 'cat-2',
            name: 'Cat 2',
            products: [
              {
                id: 'prod-shared-variant',
                name: 'Shared Product Variant',
                description: 'Valid long technical description for testing sitemap deduplication',
                canonical_url: 'https://iconelectromatic.com/products/oem-dup/prod-canonical', // identical canonical
                image: '/img2.jpg'
              }
            ]
          }
        ]
      }
    ];

    const mockFetch = async () => ({
      ok: true,
      json: async () => [{ key: 'products', content: mockDuplicateCatalog }]
    });

    const result = await run({
      dryRun: true,
      env: { VITE_SUPABASE_URL: 'https://mock.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key' },
      fetch: mockFetch
    });

    // 7 base static URLs + 1 deduplicated product URL = 8 total sitemap URLs
    assert.equal(result.sitemapUrlCount, 8, 'Sitemap must deduplicate duplicate canonical locations');
    const matches = result.sitemapXml.match(/https:\/\/iconelectromatic\.com\/products\/oem-dup\/prod-canonical/g);
    assert.equal(matches.length, 1, 'Canonical URL must appear exactly once in sitemap.xml');
  });
});

