/**
 * ImageMigrationService.js — Phase 2.2.4: IndexedDB to Supabase Storage Image Migration
 *
 * Implements safe, verifiable migration of browser-local IndexedDB images
 * into Supabase Storage with:
 * - Strict regex matching on structured JSON paths
 * - Deduplication of multi-referenced images
 * - Cross-tab mutex coordination (Web Locks + heartbeat fallback)
 * - Cryptographic pre-migration backup stored in IndexedDB (prevents localStorage quota errors)
 * - Active CDN HEAD verification with backoff retry
 * - Pre-write concurrent edit detection
 * - Targeted property-level rollback preserving unrelated CMS edits
 * - Level 1 supported reference completion + Level 2 residual string scan
 * - Strict source blob non-deletion policy
 */

import { ImageStorage } from '../data/ImageStorage.js';
import { supabaseClient } from './supabaseClient.js';
import { authService } from './authService.js';

// Exact matching pattern for supported idb image keys
export const IDB_IMAGE_REGEX = /^idb:img_[a-zA-Z0-9_-]+$/;

// All 13 CMS localStorage stores in scope
export const CMS_STORES = [
  'cms_products',
  'cms_partners',
  'cms_blogs',
  'cms_home',
  'cms_about',
  'cms_services',
  'cms_projects',
  'cms_gallery',
  'cms_testimonials',
  'cms_contact',
  'cms_header',
  'cms_footer',
  'cms_seo'
];

export const LOCK_NAME = 'icon_cms_migration_lock';
export const TAB_LOCK_STORAGE_KEY = 'icon_cms_tab_lock';
export const MIGRATION_STATE_STORAGE_KEY = 'icon_idb_migration_state';

/**
 * Cross-environment cryptographic SHA-256 hash helper
 */
export async function computeHash(content) {
  if (content === null || content === undefined) content = '';
  if (typeof crypto !== 'undefined') {
    if (crypto.subtle && crypto.subtle.digest) {
      const buffer = typeof content === 'string'
        ? new TextEncoder().encode(content)
        : (content instanceof Uint8Array ? content : new Uint8Array(await content.arrayBuffer()));
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  }
  // Fast pure-JS 64-char fallback for non-crypto environments / unit tests
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (4294967296 + h1).toString(16).slice(-8);
  const hex2 = (4294967296 + h2).toString(16).slice(-8);
  return (hex1 + hex2).repeat(4).slice(0, 64);
}

/**
 * Checks if a value strictly matches the supported idb:img_ pattern
 */
export function isExactIdbReference(val) {
  return typeof val === 'string' && IDB_IMAGE_REGEX.test(val.trim());
}

/**
 * Safe JSON parse helper
 */
export function safeJsonParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Traverse object by array path and retrieve value
 */
export function getByPath(obj, path) {
  let curr = obj;
  for (const seg of path) {
    if (curr == null) return undefined;
    curr = curr[seg];
  }
  return curr;
}

/**
 * Traverse object by array path and set value
 */
export function setByPath(obj, path, value) {
  if (!path || path.length === 0) return;
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    if (curr[seg] == null) {
      curr[seg] = typeof path[i + 1] === 'number' ? [] : {};
    }
    curr = curr[seg];
  }
  curr[path[path.length - 1]] = value;
}

/**
 * ImageMigrationService implementation
 */
export const ImageMigrationService = {
  activeHeartbeatTimer: null,
  activeLockTabId: null,

  /**
   * Cross-tab mutex: Try acquiring lock
   */
  async acquireLock(tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, migrationId = 'pending') {
    // 1. If Web Locks API available
    if (typeof navigator !== 'undefined' && navigator.locks && typeof navigator.locks.request === 'function') {
      try {
        let lockGranted = false;
        const lockPromise = new Promise((resolve) => {
          navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
            if (!lock) {
              resolve(false);
              return;
            }
            lockGranted = true;
            resolve(true);
            // Hold lock until released
            await new Promise((lockResolve) => {
              this._releaseWebLock = lockResolve;
            });
          });
        });
        const granted = await lockPromise;
        if (!granted) {
          return {
            success: false,
            reason: 'LOCKED_BY_ANOTHER_TAB',
            message: 'Migration is currently active in another browser tab.'
          };
        }
      } catch (err) {
        console.warn('Web Locks API failed, falling back to lease storage:', err);
      }
    }

    // 2. Storage-based Heartbeat Lease Fallback
    if (typeof localStorage !== 'undefined') {
      const existingRaw = localStorage.getItem(TAB_LOCK_STORAGE_KEY);
      const now = Date.now();
      if (existingRaw) {
        const lease = safeJsonParse(existingRaw);
        if (lease && lease.expiresAt > now && lease.tabId !== tabId) {
          return {
            success: false,
            reason: 'LOCKED_BY_ANOTHER_TAB',
            message: `Migration is currently active in another tab (Tab ID: ${lease.tabId}).`
          };
        }
      }

      // Claim lease for 5000ms
      const lease = {
        tabId,
        migrationId,
        acquiredAt: now,
        expiresAt: now + 5000
      };
      localStorage.setItem(TAB_LOCK_STORAGE_KEY, JSON.stringify(lease));
      this.activeLockTabId = tabId;

      // Start 2000ms heartbeat
      if (this.activeHeartbeatTimer) clearInterval(this.activeHeartbeatTimer);
      this.activeHeartbeatTimer = setInterval(() => {
        try {
          const current = safeJsonParse(localStorage.getItem(TAB_LOCK_STORAGE_KEY));
          if (current && current.tabId === tabId) {
            current.expiresAt = Date.now() + 5000;
            localStorage.setItem(TAB_LOCK_STORAGE_KEY, JSON.stringify(current));
          }
        } catch (e) {}
      }, 2000);
    }

    return { success: true, tabId };
  },

  /**
   * Release acquired cross-tab lock
   */
  async releaseLock(tabId = this.activeLockTabId) {
    if (this._releaseWebLock) {
      this._releaseWebLock();
      this._releaseWebLock = null;
    }
    if (this.activeHeartbeatTimer) {
      clearInterval(this.activeHeartbeatTimer);
      this.activeHeartbeatTimer = null;
    }
    if (typeof localStorage !== 'undefined' && tabId) {
      try {
        const existingRaw = localStorage.getItem(TAB_LOCK_STORAGE_KEY);
        const lease = safeJsonParse(existingRaw);
        if (lease && lease.tabId === tabId) {
          localStorage.removeItem(TAB_LOCK_STORAGE_KEY);
        }
      } catch (e) {}
    }
    this.activeLockTabId = null;
  },

  /**
   * Verify staff session and destination configuration
   */
  verifyPreflight(options = {}) {
    const isMock = authService.isMockSession
      ? authService.isMockSession()
      : (typeof localStorage !== 'undefined' && (localStorage.getItem('icon_staff_token') || '').startsWith('mock_'));

    if (isMock) {
      return {
        valid: false,
        error: 'MOCK_AUTH_REJECTED',
        message: 'Migration requires an authentic Supabase staff session; mock sessions are prohibited.'
      };
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icon_staff_token') : null;
    if (!token && options.requireAuth !== false) {
      return {
        valid: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required: no active staff session found.'
      };
    }

    const bucket = options.bucket || 'catalog-images';
    if (bucket !== 'catalog-images') {
      return {
        valid: false,
        error: 'INVALID_BUCKET',
        message: `Approved bucket is catalog-images, received: ${bucket}`
      };
    }

    return { valid: true };
  },

  /**
   * Discovers all supported idb: references across 13 stores according to the registry
   */
  async runDiscoveryAudit(options = {}) {
    const references = [];
    const malformedStores = [];
    const mediaRegistry = new Map(); // idbKey -> { idbKey, folder, references: [] }
    const preMigrationHashes = {};

    // Get all image records currently stored in IndexedDB
    const idbRecords = await ImageStorage.getAllImageRecords();
    const idbRecordMap = new Map((idbRecords || []).map(r => [r.id, r]));

    for (const storeKey of CMS_STORES) {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(storeKey) : null;
      const hash = await computeHash(raw || '');
      preMigrationHashes[storeKey] = hash;

      if (!raw) continue;

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        malformedStores.push({
          storeKey,
          error: err.message,
          rawPreview: raw.slice(0, 100)
        });
        continue;
      }

      this._scanStoreReferences(storeKey, data, (ref) => {
        references.push(ref);
        if (!mediaRegistry.has(ref.idbKey)) {
          mediaRegistry.set(ref.idbKey, {
            idbKey: ref.idbKey,
            folder: ref.folder,
            references: [ref],
            sourceRecord: idbRecordMap.get(ref.idbKey) || null,
            status: idbRecordMap.has(ref.idbKey) ? 'PENDING' : 'MISSING_SOURCE_BLOB'
          });
        } else {
          mediaRegistry.get(ref.idbKey).references.push(ref);
        }
      });
    }

    // Determine orphaned blobs (in IndexedDB but not referenced in any CMS store)
    const orphanedBlobs = [];
    for (const record of idbRecords) {
      if (!mediaRegistry.has(record.id)) {
        orphanedBlobs.push({
          id: record.id,
          name: record.name,
          type: record.type,
          updatedAt: record.updatedAt
        });
      }
    }

    // Dangling references (referenced in CMS but missing from IndexedDB)
    const danglingReferences = references.filter(r => !idbRecordMap.has(r.idbKey));

    return {
      references,
      totalReferences: references.length,
      uniqueImagesCount: mediaRegistry.size,
      mediaRegistry: Array.from(mediaRegistry.values()),
      orphanedBlobs,
      danglingReferences,
      malformedStores,
      preMigrationHashes
    };
  },

  /**
   * Internal structured scan for each of the 13 CMS stores
   */
  _scanStoreReferences(storeKey, data, onRef) {
    if (!data || typeof data !== 'object') return;

    const addRef = (path, idbKey, folder, context) => {
      if (isExactIdbReference(idbKey)) {
        onRef({ storeKey, path, idbKey: idbKey.trim(), folder, context });
      }
    };

    switch (storeKey) {
      case 'cms_products': {
        const oems = Array.isArray(data.oems) ? data.oems : (Array.isArray(data) ? data : []);
        oems.forEach((oem, oemIdx) => {
          const oemPath = Array.isArray(data.oems) ? ['oems', oemIdx] : [oemIdx];
          const oemSlug = oem.slug || 'general';

          if (oem.logoImg) {
            addRef([...oemPath, 'logoImg'], oem.logoImg, 'logos/', `${oem.name || oemSlug} OEM logo`);
          }
          if (oem.defaultImage) {
            addRef([...oemPath, 'defaultImage'], oem.defaultImage, `products/${oemSlug}/`, `${oem.name || oemSlug} default image`);
          }

          if (Array.isArray(oem.categories)) {
            oem.categories.forEach((cat, catIdx) => {
              const catPath = [...oemPath, 'categories', catIdx];
              if (Array.isArray(cat.products)) {
                cat.products.forEach((prod, prodIdx) => {
                  const prodPath = [...catPath, 'products', prodIdx];
                  if (prod.image) {
                    addRef([...prodPath, 'image'], prod.image, `products/${oemSlug}/`, `${prod.name || 'Product'} primary image`);
                  }
                  if (Array.isArray(prod.gallery)) {
                    prod.gallery.forEach((gal, galIdx) => {
                      if (gal && gal.image_url) {
                        addRef([...prodPath, 'gallery', galIdx, 'image_url'], gal.image_url, `products/${oemSlug}/`, `${prod.name || 'Product'} gallery image #${galIdx + 1}`);
                      }
                    });
                  }
                });
              }
            });
          }
        });
        break;
      }

      case 'cms_partners': {
        const partners = Array.isArray(data.partners) ? data.partners : (Array.isArray(data) ? data : []);
        partners.forEach((partner, idx) => {
          const partnerPath = Array.isArray(data.partners) ? ['partners', idx] : [idx];
          if (partner.logoImg) {
            addRef([...partnerPath, 'logoImg'], partner.logoImg, 'partners/', `${partner.name || 'Partner'} logo`);
          }
        });
        break;
      }

      case 'cms_blogs': {
        const oemBlogs = Array.isArray(data.oemBlogs) ? data.oemBlogs : (Array.isArray(data) ? data : []);
        oemBlogs.forEach((blogGroup, groupIdx) => {
          const groupPath = Array.isArray(data.oemBlogs) ? ['oemBlogs', groupIdx] : [groupIdx];
          const oemSlug = blogGroup.slug || 'general';

          if (Array.isArray(blogGroup.articles)) {
            blogGroup.articles.forEach((art, artIdx) => {
              if (art.image) {
                addRef([...groupPath, 'articles', artIdx, 'image'], art.image, `blogs/${oemSlug}/`, `${art.title || 'Article'} image`);
              }
            });
          }
          if (Array.isArray(blogGroup.videos)) {
            blogGroup.videos.forEach((vid, vidIdx) => {
              if (vid.thumbnail) {
                addRef([...groupPath, 'videos', vidIdx, 'thumbnail'], vid.thumbnail, `blogs/${oemSlug}/`, `${vid.title || 'Video'} thumbnail`);
              }
            });
          }
        });
        break;
      }

      case 'cms_home': {
        if (data.heroBgImage) addRef(['heroBgImage'], data.heroBgImage, 'general/', 'Home hero background image');
        break;
      }

      case 'cms_about': {
        if (data.infographicImage) addRef(['infographicImage'], data.infographicImage, 'general/', 'About infographic image');
        if (Array.isArray(data.milestones)) {
          data.milestones.forEach((m, idx) => {
            if (m.image) addRef(['milestones', idx, 'image'], m.image, 'general/', `About milestone #${idx + 1} image`);
          });
        }
        if (Array.isArray(data.domains)) {
          data.domains.forEach((d, idx) => {
            if (d.image) addRef(['domains', idx, 'image'], d.image, 'general/', `About domain #${idx + 1} image`);
          });
        }
        if (Array.isArray(data.pillars)) {
          data.pillars.forEach((p, idx) => {
            if (p.image) addRef(['pillars', idx, 'image'], p.image, 'general/', `About pillar #${idx + 1} image`);
          });
        }
        break;
      }

      case 'cms_services': {
        if (Array.isArray(data.items)) {
          data.items.forEach((item, itemIdx) => {
            if (Array.isArray(item.slides)) {
              item.slides.forEach((slide, slideIdx) => {
                if (slide.image) addRef(['items', itemIdx, 'slides', slideIdx, 'image'], slide.image, 'general/', `Service slide image`);
              });
            }
          });
        }
        break;
      }

      case 'cms_projects': {
        if (Array.isArray(data.projects)) {
          data.projects.forEach((proj, idx) => {
            if (proj.image) addRef(['projects', idx, 'image'], proj.image, 'general/', `Project ${proj.title || idx + 1} image`);
          });
        }
        break;
      }

      case 'cms_gallery': {
        if (Array.isArray(data.gallery)) {
          data.gallery.forEach((item, idx) => {
            if (item.image) addRef(['gallery', idx, 'image'], item.image, 'general/', `Gallery ${item.title || idx + 1} image`);
          });
        }
        break;
      }

      case 'cms_testimonials': {
        if (Array.isArray(data.testimonials)) {
          data.testimonials.forEach((t, idx) => {
            if (t.avatar) addRef(['testimonials', idx, 'avatar'], t.avatar, 'general/', `Testimonial avatar ${t.name || idx + 1}`);
          });
        }
        break;
      }

      case 'cms_contact': {
        if (data.careers && data.careers.careersHeroImage) {
          addRef(['careers', 'careersHeroImage'], data.careers.careersHeroImage, 'general/', 'Careers hero image');
        }
        break;
      }

      case 'cms_header': {
        if (data.logoUrl) addRef(['logoUrl'], data.logoUrl, 'general/', 'Header brand logo');
        if (data.logoDarkUrl) addRef(['logoDarkUrl'], data.logoDarkUrl, 'general/', 'Header dark logo');
        if (data.logoLightUrl) addRef(['logoLightUrl'], data.logoLightUrl, 'general/', 'Header light logo');
        break;
      }

      case 'cms_footer': {
        if (data.logoUrl) addRef(['logoUrl'], data.logoUrl, 'general/', 'Footer brand logo');
        if (data.logoDarkUrl) addRef(['logoDarkUrl'], data.logoDarkUrl, 'general/', 'Footer dark logo');
        if (data.logoLightUrl) addRef(['logoLightUrl'], data.logoLightUrl, 'general/', 'Footer light logo');
        break;
      }

      case 'cms_seo': {
        if (data.ogImage) addRef(['ogImage'], data.ogImage, 'general/', 'SEO OpenGraph default image');
        break;
      }
    }
  },

  /**
   * Pre-migration backup saved in IndexedDB with cryptographic verification
   */
  async createAndVerifyBackup(preMigrationHashes = {}) {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const snapshotData = {};

    for (const storeKey of CMS_STORES) {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(storeKey) : null;
      snapshotData[storeKey] = raw;
      if (!preMigrationHashes[storeKey]) {
        preMigrationHashes[storeKey] = await computeHash(raw || '');
      }
    }

    const backupPayload = {
      backupId,
      timestamp: Date.now(),
      hashes: { ...preMigrationHashes },
      data: snapshotData
    };

    try {
      await ImageStorage.saveBackupSnapshot(backupPayload);
    } catch (err) {
      throw new Error(`BACKUP_WRITE_FAILED: Could not write snapshot to IndexedDB: ${err.message}`);
    }

    // Read back and verify digests
    const readBack = await ImageStorage.getBackupSnapshot(backupId);
    if (!readBack || !readBack.data) {
      throw new Error('BACKUP_VERIFICATION_FAILED: Could not read back pre-migration backup from IndexedDB');
    }

    for (const storeKey of CMS_STORES) {
      const originalHash = preMigrationHashes[storeKey] || '';
      const readBackHash = await computeHash(readBack.data[storeKey] || '');
      if (originalHash !== readBackHash) {
        throw new Error(`BACKUP_VERIFICATION_FAILED: Hash mismatch on store ${storeKey}`);
      }
    }

    return backupId;
  },

  /**
   * Verifies an uploaded URL via HTTP HEAD with exponential backoff
   */
  async verifyCdnObject(url, maxRetries = 3, initialDelayMs = 200) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          return { verified: true, status: res.status };
        }
        if (res.status === 404 || res.status === 403) {
          return { verified: false, status: res.status, error: `HTTP ${res.status}` };
        }
      } catch (err) {
        // Transient network error
      }
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, initialDelayMs * Math.pow(2, attempt - 1)));
      }
    }
    return { verified: false, error: 'HEAD request failed after retries' };
  },

  /**
   * Main Migration Execution
   */
  async executeMigration(options = {}, callbacks = {}) {
    const { onProgress = () => {}, onLog = () => {} } = callbacks;
    const migrationId = `mig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tabId = options.tabId || `tab_${Date.now()}`;

    // 1. Preflight Auth & Configuration Check
    const preflight = this.verifyPreflight(options);
    if (!preflight.valid) {
      throw new Error(`${preflight.error}: ${preflight.message}`);
    }

    // 2. Cross-Tab Mutex
    const lockResult = await this.acquireLock(tabId, migrationId);
    if (!lockResult.success) {
      throw new Error(`${lockResult.reason}: ${lockResult.message}`);
    }

    try {
      onLog('info', 'Starting discovery audit across 13 CMS stores...');
      onProgress('discovery', 5, 'Scanning stores and IndexedDB');

      // 3. Discovery Audit
      const audit = await this.runDiscoveryAudit(options);

      // 4. Create Pre-Migration Backup in IndexedDB
      onLog('info', 'Creating pre-migration snapshot in IndexedDB...');
      onProgress('backup', 15, 'Writing verified backup to IndexedDB');
      const backupId = await this.createAndVerifyBackup(audit.preMigrationHashes);
      onLog('info', `Backup created and verified successfully (Backup ID: ${backupId})`);

      // 5. Initialize Durable Ledger State
      const ledger = {
        ledgerId: migrationId,
        backupId,
        tabId,
        createdAt: Date.now(),
        status: 'IN_PROGRESS',
        preMigrationHashes: audit.preMigrationHashes,
        mediaMap: {}, // idbKey -> { cdnUrl, status, folder }
        referenceLedger: audit.references.map(r => ({ ...r, status: 'PENDING', cdnUrl: null })),
        rewrittenStores: {},
        malformedStores: audit.malformedStores,
        danglingReferences: audit.danglingReferences,
        orphanedBlobs: audit.orphanedBlobs
      };

      for (const m of audit.mediaRegistry) {
        ledger.mediaMap[m.idbKey] = {
          idbKey: m.idbKey,
          folder: m.folder,
          status: m.status,
          cdnUrl: null,
          sourceFound: !!m.sourceRecord
        };
      }

      await this._saveLedger(ledger);

      // 6. Phase 1: Uploads & Active Verification
      const uniqueItems = Object.values(ledger.mediaMap);
      const itemsToUpload = uniqueItems.filter(i => i.status === 'PENDING' && i.sourceFound);
      let uploadedCount = 0;

      onLog('info', `Found ${uniqueItems.length} unique images (${itemsToUpload.length} to upload).`);
      onProgress('upload', 25, `Uploading 0/${itemsToUpload.length} images`);

      for (let i = 0; i < itemsToUpload.length; i++) {
        const item = itemsToUpload[i];
        const record = await ImageStorage.getImageRecord(item.idbKey);

        if (!record || !record.blob) {
          item.status = 'MISSING_SOURCE_BLOB';
          continue;
        }

        // Generate deterministic filename
        const ext = (record.type || 'image/jpeg').split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const keyHash = (await computeHash(item.idbKey)).substring(0, 12);
        const fileName = `${record.name ? record.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'image'}_${keyHash}.${ext}`;
        const destinationPath = `${item.folder}${fileName}`;

        try {
          const uploadRes = await supabaseClient.uploadImage(record.blob, destinationPath);

          if (!uploadRes.success) {
            if (uploadRes.isAuthExpired || uploadRes.status === 401) {
              ledger.status = 'HALTED_AUTH_EXPIRED';
              await this._saveLedger(ledger);
              throw new Error('AUTH_EXPIRED: Staff authentication expired during upload.');
            }
            item.status = 'FAILED';
            item.error = uploadRes.error;
            continue;
          }

          const targetUrl = uploadRes.url || uploadRes.publicUrl;

          // Verify object via active HEAD request
          const verifyRes = await this.verifyCdnObject(targetUrl);
          if (verifyRes.verified) {
            item.cdnUrl = targetUrl;
            item.status = 'VERIFIED';
          } else {
            item.status = 'UPLOADED_UNVERIFIED';
            item.cdnUrl = targetUrl;
          }

          uploadedCount++;
          const uploadPercent = 25 + Math.round((uploadedCount / itemsToUpload.length) * 45);
          onProgress('upload', uploadPercent, `Uploaded ${uploadedCount}/${itemsToUpload.length} images`);
          await this._saveLedger(ledger);
        } catch (uploadErr) {
          if (uploadErr.message?.startsWith('AUTH_EXPIRED')) throw uploadErr;
          item.status = 'FAILED';
          item.error = uploadErr.message;
        }
      }

      // If user explicitly authorized orphaned blobs upload
      if (options.includeOrphans === true && audit.orphanedBlobs.length > 0) {
        onLog('info', `Uploading ${audit.orphanedBlobs.length} authorized orphaned blobs...`);
        for (const orphan of audit.orphanedBlobs) {
          const record = await ImageStorage.getImageRecord(orphan.id);
          if (record && record.blob) {
            const ext = (record.type || 'image/jpeg').split('/')[1] || 'jpg';
            const orphanKeyHash = (await computeHash(orphan.id)).substring(0, 12);
            await supabaseClient.uploadImage(record.blob, `orphans/${orphanKeyHash}.${ext}`);
          }
        }
      }

      // 7. Phase 2: Conflict Detection & Sequential Reference Rewriting
      onLog('info', 'Beginning reference rewriting with concurrent-edit conflict detection...');
      onProgress('rewriting', 75, 'Rewriting store references');

      // Group references by storeKey
      const storeRefMap = {};
      for (const ref of ledger.referenceLedger) {
        if (!storeRefMap[ref.storeKey]) storeRefMap[ref.storeKey] = [];
        storeRefMap[ref.storeKey].push(ref);
      }

      let conflictOccurred = false;

      for (const storeKey of Object.keys(storeRefMap)) {
        const liveRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(storeKey) : null;
        const liveHash = await computeHash(liveRaw || '');

        // Conflict check against preMigrationHashes
        if (liveHash !== ledger.preMigrationHashes[storeKey]) {
          onLog('error', `CONCURRENT_EDIT_CONFLICT detected on store ${storeKey}! Rewriting halted.`);
          ledger.status = 'HALTED_CONFLICT';
          ledger.conflictStore = storeKey;
          await this._saveLedger(ledger);
          conflictOccurred = true;
          throw new Error(`CONCURRENT_EDIT_CONFLICT: ${storeKey} was modified externally during upload.`);
        }

        const liveData = safeJsonParse(liveRaw);
        if (!liveData) continue;

        const storeRefs = storeRefMap[storeKey];
        let storeModified = false;

        for (const ref of storeRefs) {
          const media = ledger.mediaMap[ref.idbKey];
          if (media && media.status === 'VERIFIED' && media.cdnUrl) {
            setByPath(liveData, ref.path, media.cdnUrl);
            ref.cdnUrl = media.cdnUrl;
            ref.status = 'REWRITTEN';
            storeModified = true;
          } else {
            ref.status = 'SKIPPED_NOT_VERIFIED';
          }
        }

        if (storeModified && typeof localStorage !== 'undefined') {
          const serialized = JSON.stringify(liveData);
          localStorage.setItem(storeKey, serialized);

          // Verification read-back
          const readBack = safeJsonParse(localStorage.getItem(storeKey));
          for (const ref of storeRefs) {
            if (ref.status === 'REWRITTEN') {
              const currentVal = getByPath(readBack, ref.path);
              if (currentVal !== ref.cdnUrl) {
                throw new Error(`WRITE_VERIFICATION_FAILED on ${storeKey} at path ${ref.path.join('.')}`);
              }
            }
          }
          ledger.rewrittenStores[storeKey] = true;
          await this._saveLedger(ledger);

          // Synchronize rewritten store to in-memory cache and central Supabase if configured
          const pageKey = storeKey.replace(/^cms_/, '');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cms-data-updated', { detail: { pageKey, data: liveData } }));
          }
          if (typeof supabaseClient !== 'undefined' && supabaseClient.isConfigured) {
            if (pageKey === 'products') {
              supabaseClient.saveProductCatalog(liveData).catch(e => {
                onLog('warn', `Cloud sync deferred for ${storeKey}: ${e.message}`);
              });
            } else {
              supabaseClient.saveCmsContent(pageKey, liveData).catch(e => {
                onLog('warn', `Cloud sync deferred for ${storeKey}: ${e.message}`);
              });
            }
          }
        }
      }

      // 8. Phase 3: Level 2 Residual String Scan
      onLog('info', 'Performing Level 2 residual idb string scan...');
      onProgress('residuals', 90, 'Scanning for unmigrated residual strings');
      const residualMatches = [];

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key === MIGRATION_STATE_STORAGE_KEY || key === TAB_LOCK_STORAGE_KEY) continue;
          const val = localStorage.getItem(key);
          if (val && typeof val === 'string' && val.includes('idb:')) {
            residualMatches.push({
              key,
              snippet: val.slice(0, 120)
            });
          }
        }
      }

      // 9. Completion Accounting
      const anyUploadFailed = Object.values(ledger.mediaMap).some(m => m.status === 'FAILED');
      const anyDangling = ledger.danglingReferences.length > 0;
      const anyResiduals = residualMatches.length > 0;
      const anyOrphans = ledger.orphanedBlobs.length > 0 && options.includeOrphans !== true;

      let finalStatus = 'COMPLETED_SUCCESS';
      if (anyUploadFailed || conflictOccurred) {
        finalStatus = 'FAILED';
      } else if (anyResiduals || anyOrphans || anyDangling) {
        finalStatus = 'COMPLETED_WITH_WARNINGS';
      }

      ledger.status = finalStatus;
      ledger.completedAt = Date.now();
      ledger.residualMatches = residualMatches;
      await this._saveLedger(ledger);

      onProgress('done', 100, `Migration finished: ${finalStatus}`);
      onLog('info', `Migration complete with status: ${finalStatus}`);

      return {
        migrationId,
        backupId,
        status: finalStatus,
        totalReferences: ledger.referenceLedger.length,
        rewrittenCount: ledger.referenceLedger.filter(r => r.status === 'REWRITTEN').length,
        uniqueUploaded: Object.values(ledger.mediaMap).filter(m => m.status === 'VERIFIED').length,
        orphanedBlobsCount: ledger.orphanedBlobs.length,
        danglingReferencesCount: ledger.danglingReferences.length,
        residualsCount: residualMatches.length,
        residualMatches,
        ledger
      };
    } finally {
      await this.releaseLock(tabId);
    }
  },

  /**
   * Targeted Property-Level Rollback
   * Reverts ONLY properties matching verified CDN URLs back to original idb: references.
   * Completely preserves unrelated operator edits made after migration began.
   */
  async executeTargetedRollback(migrationId) {
    const ledger = await ImageStorage.getLedgerState(migrationId);
    if (!ledger) {
      throw new Error(`LEDGER_NOT_FOUND: Cannot find migration state for ID ${migrationId}`);
    }

    const rewrittenStores = Object.keys(ledger.rewrittenStores || {});
    const rolledBackReferences = [];
    const preservedUserEdits = [];

    for (const storeKey of rewrittenStores) {
      const liveRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(storeKey) : null;
      if (!liveRaw) continue;

      const liveData = safeJsonParse(liveRaw);
      if (!liveData) continue;

      const storeRefs = (ledger.referenceLedger || []).filter(r => r.storeKey === storeKey && r.status === 'REWRITTEN');
      let storeModified = false;

      for (const ref of storeRefs) {
        const currentVal = getByPath(liveData, ref.path);

        // Targeted property-level check:
        // Only revert if currentVal STILL EQUALS the migrated CDN URL.
        // If the user changed the image to another URL or edited the field, preserve it!
        if (currentVal === ref.cdnUrl) {
          setByPath(liveData, ref.path, ref.idbKey);
          rolledBackReferences.push({ storeKey, path: ref.path, idbKey: ref.idbKey });
          storeModified = true;
        } else {
          preservedUserEdits.push({
            storeKey,
            path: ref.path,
            currentVal,
            expectedCdnUrl: ref.cdnUrl
          });
        }
      }

      if (storeModified && typeof localStorage !== 'undefined') {
        localStorage.setItem(storeKey, JSON.stringify(liveData));
      }
    }

    ledger.status = 'ROLLED_BACK';
    ledger.rolledBackAt = Date.now();
    await this._saveLedger(ledger);

    // Dispatch DOM event so admin interface refreshes
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('cms-data-updated', { detail: { action: 'rollback', migrationId } }));
      } catch (e) {}
    }

    return {
      success: true,
      migrationId,
      rolledBackCount: rolledBackReferences.length,
      preservedEditsCount: preservedUserEdits.length,
      preservedUserEdits
    };
  },

  /**
   * Internal helper to persist state to IndexedDB and mirror to localStorage
   */
  async _saveLedger(ledger) {
    try {
      await ImageStorage.saveLedgerState(ledger);
    } catch (err) {
      console.warn('Failed saving ledger to IndexedDB:', err);
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const compact = {
          ledgerId: ledger.ledgerId,
          backupId: ledger.backupId,
          status: ledger.status,
          updatedAt: Date.now()
        };
        localStorage.setItem(MIGRATION_STATE_STORAGE_KEY, JSON.stringify(compact));
      } catch (quotaErr) {
        // Safe quota overflow handling: IndexedDB is primary source of truth
        console.warn('localStorage quota exceeded when mirroring state; IndexedDB ledger remains safe.');
      }
    }
  }
};
