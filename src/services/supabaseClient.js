/**
 * Zero-Dependency Supabase Client for Icon Electromatic Admin CMS
 * Uses standard browser fetch against Supabase PostgREST endpoints.
 * Fallbacks seamlessly to local demo storage if Supabase credentials are unset.
 */

import { CATALOG } from '../data/catalogData.js';
import { ImageStorage } from '../data/ImageStorage.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
const REBUILD_WEBHOOK_URL = env.VITE_REBUILD_WEBHOOK_URL || '';

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Canonical storage configuration
export const STORAGE_BUCKET = 'catalog-images';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
export const ALLOWED_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

export const MIME_TO_EXTENSION = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
});

export function isExplicitDevMode() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.DEV === true) return true;
    if (import.meta.env.PROD === true || import.meta.env.MODE === 'production') return false;
  }
  if (typeof process !== 'undefined' && process.env) {
    // Explicit string check: "false" or "0" must NEVER enable dev fallback
    if (process.env.DEV === 'false' || process.env.VITE_DEV === 'false') return false;
    if (process.env.NODE_ENV === 'production') return false;
    if (process.env.DEV === 'true' || process.env.VITE_DEV === 'true') return true;
    if (process.env.NODE_ENV === 'development') return true;
  }
  return false;
}

function sanitizeSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const MOCK_STORAGE_KEY = 'icon_admin_catalog_v2';

function getMockData() {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Initialize from CATALOG
  const mockProducts = [];
  const mockImages = [];
  let prodId = 1;
  let imgId = 1;

  for (const oem of CATALOG) {
    const oemKey = oem.id || oem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    for (const cat of (oem.categories || [])) {
      const catKey = cat.id || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      for (const prod of (cat.products || [])) {
        const id = prodId++;
        const hasImg = Boolean(prod.image);
        const hasDesc = Boolean(prod.description && prod.description.trim().length >= 20);
        const isPublished = hasImg && hasDesc; // Option B rule

        mockProducts.push({
          id,
          name: prod.name,
          slug: prod.id || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          oem_name: oem.name,
          category_name: cat.name,
          oem_slug: oemKey,
          category_slug: catKey,
          tagline: prod.tagline || '',
          description: prod.description || '',
          specifications: prod.specs || {},
          features: prod.features || [],
          applications: prod.applications || [],
          is_published: isPublished,
          meta_title: `${prod.name} | ${oem.name} | Icon Electromatic`,
          meta_description: prod.description ? prod.description.slice(0, 155) : '',
          canonical_url: `https://iconelectromatic.com/products/${oemKey}/${prod.id || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (prod.image) {
          mockImages.push({
            id: imgId++,
            product_id: id,
            image_url: prod.image,
            caption: prod.name,
            alt_text: `${prod.name} - ${oem.name}`,
            display_order: 1,
            is_primary: true
          });
        }
      }
    }
  }

  const initial = { products: mockProducts, images: mockImages };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveMockData(data) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
}

// Request helper for PostgREST
async function restRequest(path, options = {}) {
  if (!isConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const token = localStorage.getItem('icon_staff_token') || SUPABASE_ANON_KEY;
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`;

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export const supabaseClient = {
  isConfigured,

  async getProducts({ search = '', oem = '', status = 'all' } = {}) {
    if (isConfigured) {
      let query = 'products?select=*,oems(name,slug),categories(name,slug)&order=name.asc';
      if (search) {
        query += `&name=ilike.*${encodeURIComponent(search)}*`;
      }
      if (status === 'published') {
        query += '&is_published=eq.true';
      } else if (status === 'draft') {
        query += '&is_published=eq.false';
      }
      return restRequest(query);
    }

    // Mock mode
    const data = getMockData();
    return data.products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (oem && p.oem_slug !== oem && p.oem_name !== oem) {
        return false;
      }
      if (status === 'published' && !p.is_published) return false;
      if (status === 'draft' && p.is_published) return false;
      return true;
    });
  },

  async getProductById(id) {
    if (isConfigured) {
      const prods = await restRequest(`products?id=eq.${id}&select=*,oems(name,slug),categories(name,slug)`);
      return prods[0] || null;
    }

    const data = getMockData();
    return data.products.find(p => p.id === Number(id)) || null;
  },

  async updateProduct(id, fields) {
    if (isConfigured) {
      const updated = await restRequest(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: {
          ...fields,
          updated_at: new Date().toISOString()
        }
      });
      return updated[0];
    }

    // Mock mode
    const data = getMockData();
    const index = data.products.findIndex(p => p.id === Number(id));
    if (index === -1) throw new Error(`Product ${id} not found`);

    data.products[index] = {
      ...data.products[index],
      ...fields,
      updated_at: new Date().toISOString()
    };
    saveMockData(data);
    return data.products[index];
  },

  async getProductImages(productId) {
    if (isConfigured) {
      return restRequest(`product_images?product_id=eq.${productId}&order=display_order.asc`);
    }

    const data = getMockData();
    return data.images
      .filter(img => img.product_id === Number(productId))
      .sort((a, b) => a.display_order - b.display_order);
  },

  async updateProductImages(productId, images) {
    if (isConfigured) {
      // Re-save image order and primaries
      for (const img of images) {
        if (img.id) {
          await restRequest(`product_images?id=eq.${img.id}`, {
            method: 'PATCH',
            body: {
              display_order: img.display_order,
              is_primary: img.is_primary,
              caption: img.caption,
              alt_text: img.alt_text
            }
          });
        }
      }
      return restRequest(`product_images?product_id=eq.${productId}&order=display_order.asc`);
    }

    // Mock mode
    const data = getMockData();
    data.images = data.images.filter(img => img.product_id !== Number(productId));
    for (const img of images) {
      data.images.push({
        id: img.id || Date.now() + Math.random(),
        product_id: Number(productId),
        image_url: img.image_url,
        caption: img.caption || '',
        alt_text: img.alt_text || '',
        display_order: img.display_order,
        is_primary: img.is_primary
      });
    }
    saveMockData(data);
    return data.images.filter(img => img.product_id === Number(productId));
  },

  async getAuditStats() {
    const products = await this.getProducts();
    const total = products.length;
    const published = products.filter(p => p.is_published).length;
    const draft = total - published;
    const missingDescription = products.filter(p => !p.description || p.description.trim().length < 60).length;
    const missingMeta = products.filter(p => !p.meta_title || !p.meta_description).length;

    return {
      total,
      published,
      draft,
      missingDescription,
      missingMeta
    };
  },

  async triggerPublishWebhook() {
    const webhookUrl = REBUILD_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        success: true,
        message: 'Publish triggered (Simulation Mode: VITE_REBUILD_WEBHOOK_URL is not set in environment). In production, this pings the site builder to regenerate static pages.'
      };
    }

    try {
      const res = await fetch(webhookUrl, { method: 'POST' });
      return {
        success: res.ok,
        message: res.ok ? 'Static rebuild webhook triggered successfully!' : `Webhook responded with status ${res.status}`
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to trigger rebuild webhook: ${err.message}`
      };
    }
  },

  /**
   * Upload an image to Supabase Storage ('catalog-images' bucket).
   * Enforces 10MB limit and raster-only MIME allowlist.
   * Strictly prohibits SVG for security.
   * Restricts local IndexedDB fallback to development mode with unconfigured credentials.
   *
   * @param {File|Blob} file - The image file to upload
   * @param {Object} options - Path and metadata options
   * @param {string} [options.folder='products'] - Target folder ('products', 'logos', 'partners', 'blogs', 'general')
   * @param {string} [options.oemSlug=''] - OEM slug for path scoping
   * @param {string} [options.productSlug=''] - Product slug for path scoping
   * @returns {Promise<{success: boolean, url: string, path: string, isLocalFallback?: boolean}>}
   */
  async uploadImage(file, options = {}) {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    // 1. Client-Side Security & Format Validation
    const fileName = file.name || '';
    const mimeType = file.type || '';

    // Reject SVG explicitly
    if (mimeType === 'image/svg+xml' || fileName.toLowerCase().endsWith('.svg')) {
      throw new Error('SVG uploads are disallowed for security. Please upload WebP, PNG, JPG, or GIF.');
    }

    // Enforce 10MB file size limit
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 10 MB.`);
    }

    // Enforce raster-only MIME allowlist
    const ext = MIME_TO_EXTENSION[mimeType];
    if (!ext || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported file type (${mimeType || 'unknown'}). Allowed formats: WebP, PNG, JPG, GIF.`);
    }

    // 2. Production & Environment Fallback Control
    // Fallback is permitted ONLY when development mode is explicitly enabled AND Supabase is unconfigured
    const isDevFallbackAllowed = Boolean(isExplicitDevMode() && !isConfigured);

    if (!isConfigured) {
      if (isDevFallbackAllowed) {
        // Safe development/offline fallback using IndexedDB
        const imgId = await ImageStorage.saveImage(file);
        const localUrl = ImageStorage.resolveImageUrl(imgId);
        return {
          success: true,
          url: localUrl,
          path: imgId,
          isLocalFallback: true
        };
      }
      throw new Error('Supabase Storage is not configured. Local fallback is disabled outside explicit development mode.');
    }

    // 3. Authentication Verification for Configured Mode
    const token = localStorage.getItem('icon_staff_token');
    if (!token || token.startsWith('mock_')) {
      throw new Error('Authentication required. Please log in as staff to upload images.');
    }

    // 4. Deterministic Storage Path Construction (extension strictly matches validated MIME)
    const { folder = 'products', oemSlug = '', productSlug = '' } = options;
    const rand = Math.random().toString(36).slice(2, 7);
    const timestamp = Date.now();
    let storagePath = '';

    if (folder === 'products') {
      const oemPart = sanitizeSlug(oemSlug) || 'general';
      const prodPart = sanitizeSlug(productSlug) || 'item';
      storagePath = `products/${oemPart}/${prodPart}_${timestamp}_${rand}.${ext}`;
    } else if (folder === 'logos') {
      const oemPart = sanitizeSlug(oemSlug) || 'principal';
      storagePath = `logos/${oemPart}_logo_${timestamp}_${rand}.${ext}`;
    } else {
      const folderPart = sanitizeSlug(folder) || 'general';
      const slugPart = sanitizeSlug(productSlug || oemSlug);
      storagePath = slugPart
        ? `${folderPart}/${slugPart}_${timestamp}_${rand}.${ext}`
        : `${folderPart}/${timestamp}_${rand}.${ext}`;
    }

    // 5. Execute Storage API Upload Request (no x-upsert to prevent accidental overwrites)
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': mimeType || 'application/octet-stream'
        },
        body: file
      });
    } catch (netErr) {
      throw new Error(`Storage upload network error: ${netErr.message}`);
    }

    if (res.status === 401) {
      throw new Error('Session expired. Please log in again to upload images.');
    }

    if (res.status === 403) {
      throw new Error('Permission denied. Staff role required to upload images.');
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Storage upload failed (${res.status}): ${errText}`);
    }

    // 6. Return Verified Public CDN URL
    const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;

    return {
      success: true,
      url: publicUrl,
      path: storagePath,
      bucket: STORAGE_BUCKET
    };
  },

  /**
   * Delete an image from Supabase Storage ('catalog-images' bucket).
   * In local fallback mode, deletes from IndexedDB.
   *
   * @param {string} storagePathOrUrl - Storage relative path or public CDN URL
   * @returns {Promise<{success: boolean, isLocalFallback?: boolean}>}
   */
  async deleteImage(storagePathOrUrl) {
    if (!storagePathOrUrl) return { success: true };

    // Retain explicit idb: deletion path
    if (storagePathOrUrl.startsWith('idb:')) {
      await ImageStorage.deleteImage(storagePathOrUrl);
      return { success: true, isLocalFallback: true };
    }

    // Fail clearly if Supabase is unconfigured for remote deletion
    if (!isConfigured) {
      throw new Error('Supabase Storage is not configured. Cannot delete remote image.');
    }

    const token = localStorage.getItem('icon_staff_token');
    if (!token || token.startsWith('mock_')) {
      throw new Error('Authentication required to delete images.');
    }

    // Validate that deletion targets only the configured project's catalog-images bucket
    let rawPath = '';
    const publicPrefix = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/`;

    if (storagePathOrUrl.startsWith('http://') || storagePathOrUrl.startsWith('https://')) {
      if (!storagePathOrUrl.startsWith(publicPrefix)) {
        throw new Error(`Invalid deletion target: URL does not belong to project's ${STORAGE_BUCKET} bucket.`);
      }
      rawPath = storagePathOrUrl.slice(publicPrefix.length);
    } else {
      // Relative paths must not have leading slashes silently stripped so leading-slash validation is strictly enforced
      rawPath = String(storagePathOrUrl);
    }

    // Strip redundant bucket prefix if present in relative path
    if (rawPath.startsWith(`${STORAGE_BUCKET}/`)) {
      rawPath = rawPath.slice(`${STORAGE_BUCKET}/`.length);
    }

    // Reject query parameters or URL fragments in path
    if (rawPath.includes('?') || rawPath.includes('#')) {
      throw new Error('Invalid storage path for deletion: path contains query parameters or URL fragments.');
    }

    // Safely and iteratively decode URI components to detect single, double, or multiply encoded directory traversal (%252e%252e, %252f, %255c)
    let decodedPath = rawPath;
    let prevPath = '';
    let iterations = 0;
    while (decodedPath !== prevPath) {
      prevPath = decodedPath;
      try {
        decodedPath = decodeURIComponent(decodedPath);
      } catch {
        throw new Error('Invalid storage path for deletion: malformed URI encoding.');
      }
      iterations++;
      if (iterations > 3) {
        throw new Error('Invalid storage path for deletion: excessive or ambiguous encoding detected.');
      }
    }

    // Reject encoded path representations:
    // Uploader outputs standard ASCII paths; rejecting encoded representations prevents
    // ambiguous discrepancies where validated and requested paths differ.
    if (rawPath.includes('%') || decodedPath !== rawPath) {
      throw new Error('Invalid storage path for deletion: encoded path representations are not allowed.');
    }

    // Canonical path validation: reject directory traversal, backslashes, double slashes, spaces, or control characters
    const canonicalPath = decodedPath;
    if (
      !canonicalPath ||
      canonicalPath.includes('..') ||
      canonicalPath.includes('\\') ||
      canonicalPath.includes('//') ||
      canonicalPath.startsWith('/') ||
      canonicalPath.endsWith('/') ||
      /\s/.test(canonicalPath) ||
      /[\x00-\x1f\x7f]/.test(canonicalPath) ||
      !/^[a-zA-Z0-9._/-]+$/.test(canonicalPath)
    ) {
      throw new Error('Invalid storage path for deletion: path contains prohibited characters or directory traversal.');
    }

    // Build request URL using the exact validated canonical path
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${STORAGE_BUCKET}/${canonicalPath}`;

    let res;
    try {
      res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (netErr) {
      throw new Error(`Storage delete network error: ${netErr.message}`);
    }

    if (res.status === 401) {
      throw new Error('Session expired. Please log in again to delete images.');
    }

    if (res.status === 403) {
      throw new Error('Permission denied. Staff role required to delete images.');
    }

    if (!res.ok && res.status !== 404) {
      const errText = await res.text();
      throw new Error(`Storage delete failed (${res.status}): ${errText}`);
    }

    return { success: true };
  }
};
