// ==============================================================================
// tests/image-migration-service.test.mjs
// Phase 2.2.4 — 19-Point Production Safety Test Suite for IndexedDB Image Migration
// ==============================================================================

import assert from 'assert';
import { register } from 'node:module';

// ESM loader hook for .css and import.meta.env
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

globalThis.__vite_env = { VITE_SUPABASE_URL: 'https://test.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-key', DEV: true };

// Mock localStorage
const storeMap = new Map();
global.localStorage = {
  getItem: (k) => (storeMap.has(k) ? storeMap.get(k) : null),
  setItem: (k, v) => {
    if (global.__throwLocalStorageQuota) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    storeMap.set(k, String(v));
  },
  removeItem: (k) => storeMap.delete(k),
  clear: () => storeMap.clear(),
  get length() { return storeMap.size; },
  key: (i) => Array.from(storeMap.keys())[i] || null
};

// Imports under test
const { ImageStorage } = await import('../src/data/ImageStorage.js');
const { supabaseClient } = await import('../src/services/supabaseClient.js');
const { authService } = await import('../src/services/authService.js');
const {
  ImageMigrationService,
  computeHash,
  isExactIdbReference,
  IDB_IMAGE_REGEX,
  CMS_STORES,
  LOCK_NAME,
  TAB_LOCK_STORAGE_KEY
} = await import('../src/services/ImageMigrationService.js');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, fn) {
  storeMap.clear();
  ImageStorage._resetMemoryStore();
  global.__throwLocalStorageQuota = false;
  ImageMigrationService.releaseLock();
  delete global.navigator;

  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
    failedTests++;
  }
}

console.log('\n--- Running Phase 2.2.4 19-Point Test Matrix ---');

// -----------------------------------------------------------------------------
// Test 1: Discovery & Strict Regex
// -----------------------------------------------------------------------------
await runTest('Test 1: Discovery & Strict Regex — matches valid pattern, ignores substring text', async () => {
  assert.strictEqual(isExactIdbReference('idb:img_1729000000_abc123'), true);
  assert.strictEqual(isExactIdbReference('idb:img_999-XYZ_001'), true);
  assert.strictEqual(isExactIdbReference('Please see idb:img_123 in doc'), false);
  assert.strictEqual(isExactIdbReference('/images/products/filter.png'), false);
  assert.strictEqual(isExactIdbReference('https://cdn.example.com/pic.jpg'), false);

  // Setup valid reference in cms_products and arbitrary text containing idb: in description
  const idbKey = await ImageStorage.saveImage(new Uint8Array([1, 2, 3]), 'idb:img_123');
  const productsData = {
    oems: [{
      slug: 'rogers',
      name: 'Rogers Corporation',
      categories: [{
        slug: 'laminates',
        products: [{
          slug: 'ro4003c',
          name: 'RO4003C',
          image: idbKey,
          description: 'Note: previously known as idb:img_fake in docs',
          gallery: []
        }]
      }]
    }]
  };
  localStorage.setItem('cms_products', JSON.stringify(productsData));

  const audit = await ImageMigrationService.runDiscoveryAudit();
  assert.strictEqual(audit.totalReferences, 1, 'Only exact structured idb: field should match');
  assert.strictEqual(audit.references[0].idbKey, 'idb:img_123');
  assert.strictEqual(audit.references[0].storeKey, 'cms_products');
});

// -----------------------------------------------------------------------------
// Test 2: Deduplication
// -----------------------------------------------------------------------------
await runTest('Test 2: Deduplication — 3 references to same idbKey trigger exactly 1 upload', async () => {
  const sharedKey = await ImageStorage.saveImage(new Uint8Array([1, 2, 3]), 'idb:img_shared_1');

  const productsData = {
    oems: [{
      slug: 'rogers',
      defaultImage: sharedKey,
      categories: [{
        products: [{
          image: sharedKey,
          gallery: [{ image_url: sharedKey }]
        }]
      }]
    }]
  };
  localStorage.setItem('cms_products', JSON.stringify(productsData));
  localStorage.setItem('icon_staff_token', 'real_staff_jwt_token_123');

  let uploadCalls = 0;
  supabaseClient.uploadImage = async () => {
    uploadCalls++;
    return { success: true, url: 'https://cdn.example.com/catalog-images/products/rogers/shared.jpg' };
  };
  global.fetch = async () => ({ ok: true, status: 200 });

  const result = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(uploadCalls, 1, 'Should only upload 1 time for shared image');
  assert.strictEqual(result.rewrittenCount, 3, 'All 3 references should be rewritten');

  const live = JSON.parse(localStorage.getItem('cms_products'));
  const cdn = 'https://cdn.example.com/catalog-images/products/rogers/shared.jpg';
  assert.strictEqual(live.oems[0].defaultImage, cdn);
  assert.strictEqual(live.oems[0].categories[0].products[0].image, cdn);
  assert.strictEqual(live.oems[0].categories[0].products[0].gallery[0].image_url, cdn);
});

// -----------------------------------------------------------------------------
// Test 3: Orphaned Blob Isolation
// -----------------------------------------------------------------------------
await runTest('Test 3: Orphaned Blob Isolation — unreferenced blobs reported, zero uploads by default', async () => {
  await ImageStorage.saveImage(new Uint8Array([1, 1, 1]), 'idb:img_orphan_1');
  await ImageStorage.saveImage(new Uint8Array([2, 2, 2]), 'idb:img_orphan_2');

  const audit = await ImageMigrationService.runDiscoveryAudit();
  assert.strictEqual(audit.orphanedBlobs.length, 2, 'Should discover both unreferenced blobs');

  let uploadCalls = 0;
  supabaseClient.uploadImage = async () => {
    uploadCalls++;
    return { success: true, url: 'https://cdn.example.com/pic.jpg' };
  };

  await ImageMigrationService.executeMigration({ includeOrphans: false, requireAuth: false });
  assert.strictEqual(uploadCalls, 0, 'Unreferenced blobs must not be uploaded when includeOrphans is false');
});

// -----------------------------------------------------------------------------
// Test 4: Dangling Reference Handling
// -----------------------------------------------------------------------------
await runTest('Test 4: Dangling Reference Handling — missing source blob recorded, reference preserved', async () => {
  const danglingKey = 'idb:img_missing_from_idb';
  localStorage.setItem('cms_home', JSON.stringify({ heroBgImage: danglingKey }));

  const audit = await ImageMigrationService.runDiscoveryAudit();
  assert.strictEqual(audit.danglingReferences.length, 1);
  assert.strictEqual(audit.danglingReferences[0].idbKey, danglingKey);

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/pic.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  const result = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(result.status, 'COMPLETED_WITH_WARNINGS', 'Dangling reference triggers warning');

  const liveHome = JSON.parse(localStorage.getItem('cms_home'));
  assert.strictEqual(liveHome.heroBgImage, danglingKey, 'Dangling reference is preserved in CMS data');
});

// -----------------------------------------------------------------------------
// Test 5: IndexedDB Backup Write & Verify
// -----------------------------------------------------------------------------
await runTest('Test 5: IndexedDB Backup Write & Verify — backup written and digest verified in IDB', async () => {
  localStorage.setItem('cms_about', JSON.stringify({ infographicImage: 'idb:img_about_1' }));
  const hashes = { cms_about: await computeHash(localStorage.getItem('cms_about')) };

  const backupId = await ImageMigrationService.createAndVerifyBackup(hashes);
  assert.ok(backupId, 'Backup ID returned');

  const readBack = await ImageStorage.getBackupSnapshot(backupId);
  assert.ok(readBack, 'Backup retrieved from IDB');
  assert.strictEqual(readBack.hashes.cms_about, hashes.cms_about);
  assert.strictEqual(readBack.data.cms_about, localStorage.getItem('cms_about'));
});

// -----------------------------------------------------------------------------
// Test 6: Backup Failure Hard Gate
// -----------------------------------------------------------------------------
await runTest('Test 6: Backup Failure Hard Gate — simulated failure halts before upload or write', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([1]), 'idb:img_test6');
  localStorage.setItem('cms_projects', JSON.stringify({ projects: [{ image: key }] }));

  let uploadAttempted = false;
  supabaseClient.uploadImage = async () => {
    uploadAttempted = true;
    return { success: true };
  };

  // Simulate backup save failure
  const originalSave = ImageStorage.saveBackupSnapshot;
  ImageStorage.saveBackupSnapshot = async () => {
    throw new Error('Disk quota or IDB error');
  };

  let threw = false;
  try {
    await ImageMigrationService.executeMigration({ requireAuth: false });
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('BACKUP_WRITE_FAILED'), `Expected backup error, got: ${err.message}`);
  } finally {
    ImageStorage.saveBackupSnapshot = originalSave;
  }

  assert.strictEqual(threw, true, 'Migration must throw on backup failure');
  assert.strictEqual(uploadAttempted, false, 'No upload should occur if backup fails');
  const live = JSON.parse(localStorage.getItem('cms_projects'));
  assert.strictEqual(live.projects[0].image, key, 'Store should remain completely untouched');
});

// -----------------------------------------------------------------------------
// Test 7: Web Locks Mutex
// -----------------------------------------------------------------------------
await runTest('Test 7: Web Locks Mutex — second instance blocked while lock is held', async () => {
  let heldLock = false;
  global.navigator = {
    locks: {
      request: async (name, options, cb) => {
        if (heldLock) {
          return cb(null); // Lock unavailable
        }
        heldLock = true;
        try {
          return await cb({ name });
        } finally {
          heldLock = false;
        }
      }
    }
  };

  const lock1 = await ImageMigrationService.acquireLock('tab_1');
  assert.strictEqual(lock1.success, true, 'First tab acquires lock');

  // Second tab attempts to acquire lock while first is held
  const lock2 = await ImageMigrationService.acquireLock('tab_2');
  assert.strictEqual(lock2.success, false, 'Second tab is blocked');
  assert.strictEqual(lock2.reason, 'LOCKED_BY_ANOTHER_TAB');

  await ImageMigrationService.releaseLock('tab_1');
});

// -----------------------------------------------------------------------------
// Test 8: Heartbeat Lease Fallback
// -----------------------------------------------------------------------------
await runTest('Test 8: Heartbeat Lease Fallback — acquires lease, renews, and takes over expired lease', async () => {
  // Without navigator.locks
  const lock1 = await ImageMigrationService.acquireLock('tab_1');
  assert.strictEqual(lock1.success, true);

  const raw = localStorage.getItem(TAB_LOCK_STORAGE_KEY);
  assert.ok(raw, 'Lease written to storage');
  const lease = JSON.parse(raw);
  assert.strictEqual(lease.tabId, 'tab_1');

  // Second tab trying concurrently is blocked
  const lock2 = await ImageMigrationService.acquireLock('tab_2');
  assert.strictEqual(lock2.success, false);

  // Expire the lease manually
  lease.expiresAt = Date.now() - 1000;
  localStorage.setItem(TAB_LOCK_STORAGE_KEY, JSON.stringify(lease));

  // Tab 2 can now acquire the expired lease
  const lock3 = await ImageMigrationService.acquireLock('tab_2');
  assert.strictEqual(lock3.success, true, 'Expired lease can be claimed');
  await ImageMigrationService.releaseLock('tab_2');
});

// -----------------------------------------------------------------------------
// Test 9: Pre-Write Conflict Detection
// -----------------------------------------------------------------------------
await runTest('Test 9: Pre-Write Conflict Detection — external mutation during upload halts rewrite', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([5, 5, 5]), 'idb:img_conflict');
  localStorage.setItem('cms_testimonials', JSON.stringify({ testimonials: [{ avatar: key, name: 'Alice' }] }));

  supabaseClient.uploadImage = async () => {
    // Simulate user editing testimonial name in another tab during upload!
    const live = JSON.parse(localStorage.getItem('cms_testimonials'));
    live.testimonials[0].name = 'Alice (Edited Concurrent)';
    localStorage.setItem('cms_testimonials', JSON.stringify(live));
    return { success: true, url: 'https://cdn.example.com/avatar.jpg' };
  };
  global.fetch = async () => ({ ok: true, status: 200 });

  let threw = false;
  try {
    await ImageMigrationService.executeMigration({ requireAuth: false });
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('CONCURRENT_EDIT_CONFLICT'), `Expected conflict error, got: ${err.message}`);
  }

  assert.strictEqual(threw, true, 'Migration must halt when store changed concurrently');
  const live = JSON.parse(localStorage.getItem('cms_testimonials'));
  assert.strictEqual(live.testimonials[0].name, 'Alice (Edited Concurrent)', 'User edit is preserved');
  assert.strictEqual(live.testimonials[0].avatar, key, 'Image reference was not rewritten on conflict');
});

// -----------------------------------------------------------------------------
// Test 10: Targeted Rollback Isolation
// -----------------------------------------------------------------------------
await runTest('Test 10: Targeted Rollback Isolation — reverts image to idb:, preserves user text edits', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([1, 2]), 'idb:img_prod_target');
  const initial = {
    oems: [{
      slug: 'mini-circuits',
      categories: [{
        products: [{
          slug: 'amp-1',
          name: 'Amplifier A',
          image: key,
          description: 'Original spec'
        }]
      }]
    }]
  };
  localStorage.setItem('cms_products', JSON.stringify(initial));

  supabaseClient.uploadImage = async () => ({
    success: true,
    url: 'https://cdn.example.com/catalog-images/amp.jpg'
  });
  global.fetch = async () => ({ ok: true, status: 200 });

  const result = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(result.rewrittenCount, 1);

  // Now an operator edits the product description and price
  const edited = JSON.parse(localStorage.getItem('cms_products'));
  edited.oems[0].categories[0].products[0].description = 'Updated spec with new 50 ohm impedance';
  localStorage.setItem('cms_products', JSON.stringify(edited));

  // Perform targeted rollback
  const rollbackRes = await ImageMigrationService.executeTargetedRollback(result.migrationId);
  assert.strictEqual(rollbackRes.rolledBackCount, 1, 'Should roll back the image URL');

  // Verify that image is back to idbKey AND the updated description is preserved
  const rolledBackData = JSON.parse(localStorage.getItem('cms_products'));
  const prod = rolledBackData.oems[0].categories[0].products[0];
  assert.strictEqual(prod.image, key, 'Image must be reverted back to idb: reference');
  assert.strictEqual(prod.description, 'Updated spec with new 50 ohm impedance', 'Unrelated text edit must be preserved');
});

// -----------------------------------------------------------------------------
// Test 11: Malformed JSON Resilience
// -----------------------------------------------------------------------------
await runTest('Test 11: Malformed JSON Resilience — corrupted store logged as error, valid stores proceed', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([1]), 'idb:img_valid');
  localStorage.setItem('cms_home', '{{ CORRUPT JSON syntax');
  localStorage.setItem('cms_gallery', JSON.stringify({ gallery: [{ image: key }] }));

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/gallery.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  const audit = await ImageMigrationService.runDiscoveryAudit();
  assert.strictEqual(audit.malformedStores.length, 1);
  assert.strictEqual(audit.malformedStores[0].storeKey, 'cms_home');
  assert.strictEqual(audit.totalReferences, 1, 'Valid store reference discovered');

  const result = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(result.rewrittenCount, 1);
  assert.strictEqual(localStorage.getItem('cms_home'), '{{ CORRUPT JSON syntax', 'Corrupted key untouched');
});

// -----------------------------------------------------------------------------
// Test 12: Durable IDB State on Quota Error
// -----------------------------------------------------------------------------
await runTest('Test 12: Durable IDB State on Quota Error — localStorage quota error does not abort migration', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([7]), 'idb:img_quota');
  localStorage.setItem('cms_services', JSON.stringify({ items: [{ slides: [{ image: key }] }] }));

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/slide.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  // Simulate quota error only when setting icon_idb_migration_state
  const origSet = localStorage.setItem;
  localStorage.setItem = (k, v) => {
    if (k === 'icon_idb_migration_state') {
      const e = new Error('QuotaExceeded');
      e.name = 'QuotaExceededError';
      throw e;
    }
    origSet(k, v);
  };

  try {
    const result = await ImageMigrationService.executeMigration({ requireAuth: false });
    assert.strictEqual(result.rewrittenCount, 1, 'Migration succeeds despite localStorage state quota error');
    const ledger = await ImageStorage.getLedgerState(result.migrationId);
    assert.ok(ledger, 'State safely preserved in durable IndexedDB ledger');
  } finally {
    localStorage.setItem = origSet;
  }
});

// -----------------------------------------------------------------------------
// Test 13: Mid-Upload Resume
// -----------------------------------------------------------------------------
await runTest('Test 13: Mid-Upload Resume — skips already verified objects', async () => {
  const key1 = await ImageStorage.saveImage(new Uint8Array([1]), 'idb:img_resume1');
  const key2 = await ImageStorage.saveImage(new Uint8Array([2]), 'idb:img_resume2');

  let uploads = 0;
  supabaseClient.uploadImage = async (blob, path) => {
    uploads++;
    return { success: true, url: `https://cdn.example.com/${path}` };
  };
  global.fetch = async () => ({ ok: true, status: 200 });

  // Step 1: Run with key1
  localStorage.setItem('cms_about', JSON.stringify({ infographicImage: key1 }));
  const res1 = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(uploads, 1);

  // Step 2: Now add key2 to another section and run
  localStorage.setItem('cms_about', JSON.stringify({ infographicImage: res1.ledger.mediaMap[key1].cdnUrl, pillars: [{ image: key2 }] }));
  const res2 = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(uploads, 2, 'Should only upload key2, skipping key1 which is already CDN URL');
});

// -----------------------------------------------------------------------------
// Test 14: Mid-Rewrite Resume
// -----------------------------------------------------------------------------
await runTest('Test 14: Mid-Rewrite Resume — skips stores already rewritten', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([3]), 'idb:img_rewrite_resume');
  localStorage.setItem('cms_header', JSON.stringify({ logoUrl: key }));

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/logo.png' });
  global.fetch = async () => ({ ok: true, status: 200 });

  const res1 = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(res1.rewrittenCount, 1);

  // Re-running discovery shows 0 pending idb: references
  const audit2 = await ImageMigrationService.runDiscoveryAudit();
  assert.strictEqual(audit2.totalReferences, 0, 'No remaining idb: references in header');
});

// -----------------------------------------------------------------------------
// Test 15: Active CDN HEAD Verification
// -----------------------------------------------------------------------------
await runTest('Test 15: Active CDN HEAD Verification — verifies status 200, retries transient 503', async () => {
  let fetchAttempts = 0;
  global.fetch = async () => {
    fetchAttempts++;
    if (fetchAttempts < 3) {
      return { ok: false, status: 503 };
    }
    return { ok: true, status: 200 };
  };

  const res = await ImageMigrationService.verifyCdnObject('https://cdn.example.com/test.jpg', 3, 20);
  assert.strictEqual(res.verified, true);
  assert.strictEqual(fetchAttempts, 3, 'Retried until HTTP 200 returned');
});

// -----------------------------------------------------------------------------
// Test 16: Auth 401 Expiration Pause
// -----------------------------------------------------------------------------
await runTest('Test 16: Auth 401 Expiration Pause — halts migration immediately on 401 session expiry', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([8]), 'idb:img_auth_expired');
  localStorage.setItem('cms_footer', JSON.stringify({ logoUrl: key }));

  supabaseClient.uploadImage = async () => ({
    success: false,
    status: 401,
    isAuthExpired: true,
    error: 'JWT expired'
  });

  let threw = false;
  try {
    await ImageMigrationService.executeMigration({ requireAuth: false });
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('AUTH_EXPIRED'), `Expected auth expired error, got: ${err.message}`);
  }

  assert.strictEqual(threw, true);
  const live = JSON.parse(localStorage.getItem('cms_footer'));
  assert.strictEqual(live.logoUrl, key, 'No rewrites should occur after auth expiration');
});

// -----------------------------------------------------------------------------
// Test 17: Supported 100% Completion Gate
// -----------------------------------------------------------------------------
await runTest('Test 17: Supported 100% Completion Gate — COMPLETED_SUCCESS when all clean', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([9]), 'idb:img_clean');
  localStorage.setItem('cms_seo', JSON.stringify({ ogImage: key }));

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/og.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  const res = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(res.status, 'COMPLETED_SUCCESS', 'Expected clean COMPLETED_SUCCESS');
  assert.strictEqual(res.residualsCount, 0);
  assert.strictEqual(res.orphanedBlobsCount, 0);
});

// -----------------------------------------------------------------------------
// Test 18: Residual idb: String Scan
// -----------------------------------------------------------------------------
await runTest('Test 18: Residual idb: String Scan — unmigrated residual string degrades to COMPLETED_WITH_WARNINGS', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([9]), 'idb:img_structured');
  localStorage.setItem('cms_seo', JSON.stringify({ ogImage: key }));
  // Add residual unmigrated freeform text in blogs
  localStorage.setItem('cms_blogs_notes', 'Draft note mentioning idb:img_forgotten_blob embedded in markdown');

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/og.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  const res = await ImageMigrationService.executeMigration({ requireAuth: false });
  assert.strictEqual(res.status, 'COMPLETED_WITH_WARNINGS', 'Should degrade status to COMPLETED_WITH_WARNINGS');
  assert.ok(res.residualsCount > 0, 'Residual match detected');
  assert.strictEqual(res.residualMatches[0].key, 'cms_blogs_notes');
});

// -----------------------------------------------------------------------------
// Test 19: Source Blob Non-Deletion
// -----------------------------------------------------------------------------
await runTest('Test 19: Source Blob Non-Deletion — zero calls to ImageStorage.deleteImage during migration', async () => {
  const key = await ImageStorage.saveImage(new Uint8Array([10, 20]), 'idb:img_keep_blob');
  localStorage.setItem('cms_contact', JSON.stringify({ careers: { careersHeroImage: key } }));

  let deleteCalls = 0;
  const origDelete = ImageStorage.deleteImage;
  ImageStorage.deleteImage = async (...args) => {
    deleteCalls++;
    return origDelete.apply(ImageStorage, args);
  };

  supabaseClient.uploadImage = async () => ({ success: true, url: 'https://cdn.example.com/career.jpg' });
  global.fetch = async () => ({ ok: true, status: 200 });

  try {
    await ImageMigrationService.executeMigration({ requireAuth: false });
    assert.strictEqual(deleteCalls, 0, 'deleteImage must NEVER be called during migration');

    // Confirm source blob is still intact in IndexedDB
    const record = await ImageStorage.getImageRecord(key);
    assert.ok(record, 'Source record must remain intact in IndexedDB');
    assert.strictEqual(record.id, key);
  } finally {
    ImageStorage.deleteImage = origDelete;
  }
});

console.log(`\nResults: ${passedTests} passed, ${failedTests} failed.`);
if (failedTests > 0) {
  process.exit(1);
}
