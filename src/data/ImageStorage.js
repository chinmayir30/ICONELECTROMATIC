/**
 * ImageStorage — Persistent Local Image Storage via IndexedDB
 * Prevents localStorage 5MB quota overflow by saving image blobs in IndexedDB.
 * Supports file uploads, replacement, deletion, and provides instant object URLs.
 */

const DB_NAME = 'IconElectromatic_CMS';
const DB_VERSION = 2;
const STORE_NAME = 'cms_images';
const BACKUP_STORE_NAME = 'cms_backups';
const LEDGER_STORE_NAME = 'cms_migration_ledger';

// In-memory cache: id -> blobUrl (or dataUrl)
const memoryCache = new Map();
// In-memory store backups for offline / non-IDB environments and testing
const memoryRecords = new Map();
const memoryBackups = new Map();
const memoryLedger = new Map();

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        db.createObjectStore(BACKUP_STORE_NAME, { keyPath: 'backupId' });
      }
      if (!db.objectStoreNames.contains(LEDGER_STORE_NAME)) {
        db.createObjectStore(LEDGER_STORE_NAME, { keyPath: 'ledgerId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB failed to open, falling back to in-memory storage.', request.error);
      resolve(null);
    };
  });
  return dbPromise;
}

export const ImageStorage = {
  /**
   * Pre-load all saved images into memoryCache so synchronous lookups work.
   */
  async init() {
    const db = await getDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          (req.result || []).forEach(item => {
            if (item && item.id && item.blob) {
              const url = URL.createObjectURL(item.blob);
              memoryCache.set(item.id, url);
              memoryRecords.set(item.id, item);
            }
          });
          resolve();
        };
        req.onerror = () => resolve();
      } catch (err) {
        console.warn('Error reading images from IndexedDB:', err);
        resolve();
      }
    });
  },

  /**
   * Store a File or Blob in IndexedDB.
   * Returns a persistent identifier key: 'idb:img_<timestamp>'
   */
  async saveImage(fileOrBlob, customId = null) {
    const id = customId || `idb:img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const db = await getDB();

    // Cache object URL immediately
    let blobUrl = id;
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        blobUrl = URL.createObjectURL(fileOrBlob);
      } catch {
        blobUrl = id;
      }
    }
    memoryCache.set(id, blobUrl);

    const record = {
      id,
      blob: fileOrBlob,
      name: fileOrBlob.name || 'image',
      type: fileOrBlob.type || 'image/jpeg',
      updatedAt: Date.now()
    };
    memoryRecords.set(id, record);

    if (db) {
      await new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }

    return id;
  },

  /**
   * Retrieve all raw image records stored in IndexedDB.
   * Used by migration audit to enumerate local source images.
   */
  async getAllImageRecords() {
    const db = await getDB();
    if (!db) {
      return Array.from(memoryRecords.values());
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(memoryRecords.values()));
      } catch (err) {
        console.warn('Error fetching all image records:', err);
        resolve(Array.from(memoryRecords.values()));
      }
    });
  },

  /**
   * Retrieve a specific image record by ID.
   */
  async getImageRecord(id) {
    if (!id) return null;
    if (memoryRecords.has(id)) {
      return memoryRecords.get(id);
    }
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  },

  /**
   * Save a verified pre-migration backup snapshot into IndexedDB.
   * Keyed by backupId.
   */
  async saveBackupSnapshot(backupData) {
    if (!backupData || !backupData.backupId) {
      throw new Error('Invalid backup data: missing backupId');
    }
    memoryBackups.set(backupData.backupId, backupData);
    const db = await getDB();
    if (!db) return backupData.backupId;
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(BACKUP_STORE_NAME, 'readwrite');
        const store = tx.objectStore(BACKUP_STORE_NAME);
        const req = store.put(backupData);
        req.onsuccess = () => resolve(backupData.backupId);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Retrieve a backup snapshot by ID for verification or rollback.
   */
  async getBackupSnapshot(backupId) {
    if (!backupId) return null;
    const db = await getDB();
    if (!db) return memoryBackups.get(backupId) || null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(BACKUP_STORE_NAME, 'readonly');
        const store = tx.objectStore(BACKUP_STORE_NAME);
        const req = store.get(backupId);
        req.onsuccess = () => resolve(req.result || memoryBackups.get(backupId) || null);
        req.onerror = () => resolve(memoryBackups.get(backupId) || null);
      } catch (err) {
        resolve(memoryBackups.get(backupId) || null);
      }
    });
  },

  /**
   * Save durable migration ledger state to IndexedDB.
   */
  async saveLedgerState(ledgerData) {
    if (!ledgerData || !ledgerData.ledgerId) {
      throw new Error('Invalid ledger data: missing ledgerId');
    }
    memoryLedger.set(ledgerData.ledgerId, ledgerData);
    const db = await getDB();
    if (!db) return ledgerData.ledgerId;
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(LEDGER_STORE_NAME, 'readwrite');
        const store = tx.objectStore(LEDGER_STORE_NAME);
        const req = store.put(ledgerData);
        req.onsuccess = () => resolve(ledgerData.ledgerId);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Retrieve durable migration ledger state by ID.
   */
  async getLedgerState(ledgerId) {
    if (!ledgerId) return null;
    const db = await getDB();
    if (!db) return memoryLedger.get(ledgerId) || null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(LEDGER_STORE_NAME, 'readonly');
        const store = tx.objectStore(LEDGER_STORE_NAME);
        const req = store.get(ledgerId);
        req.onsuccess = () => resolve(req.result || memoryLedger.get(ledgerId) || null);
        req.onerror = () => resolve(memoryLedger.get(ledgerId) || null);
      } catch (err) {
        resolve(memoryLedger.get(ledgerId) || null);
      }
    });
  },

  /**
   * Resolve an image identifier or URL.
   * If it starts with 'idb:', returns the cached blob object URL.
   * If it's a regular asset path (/images/...) or external URL, returns as-is.
   */
  resolveImageUrl(urlOrId) {
    if (!urlOrId) return '';
    if (typeof urlOrId !== 'string') return '';
    if (urlOrId.startsWith('idb:')) {
      const cached = memoryCache.get(urlOrId);
      if (cached) return cached;
      // If not yet in cache, schedule async load and return placeholder or fallback
      this.fetchAndCache(urlOrId);
      return cached || urlOrId;
    }
    return urlOrId;
  },

  /**
   * Async fetch from IndexedDB if missed cache.
   */
  async fetchAndCache(id) {
    if (memoryCache.has(id)) return memoryCache.get(id);
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            let url = id;
            if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
              try {
                url = URL.createObjectURL(req.result.blob);
              } catch {
                url = id;
              }
            }
            memoryCache.set(id, url);
            memoryRecords.set(id, req.result);
            // Update any existing DOM elements matching this ID
            if (typeof document !== 'undefined') {
              document.querySelectorAll(`img[src="${id}"], img[data-idb="${id}"]`).forEach(img => {
                img.src = url;
              });
            }
            resolve(url);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  },

  /**
   * Delete an image from IndexedDB and free memory cache.
   */
  async deleteImage(id) {
    if (!id || !id.startsWith('idb:')) return;
    const cached = memoryCache.get(id);
    if (cached) {
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(cached); } catch (e) {}
      }
      memoryCache.delete(id);
    }
    memoryRecords.delete(id);
    const db = await getDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (err) {
        resolve();
      }
    });
  },

  /**
   * Helper to scan a DOM container and resolve any idb: images that haven't been resolved yet.
   */
  resolveAllImagesInContainer(container = (typeof document !== 'undefined' ? document : null)) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('idb:')) {
        const resolved = this.resolveImageUrl(src);
        if (resolved && resolved !== src) {
          img.src = resolved;
          img.setAttribute('data-idb', src);
        }
      }
    });
  },

  /**
   * Test helper to reset in-memory state.
   */
  _resetMemoryStore() {
    memoryCache.clear();
    memoryRecords.clear();
    memoryBackups.clear();
    memoryLedger.clear();
  }
};
