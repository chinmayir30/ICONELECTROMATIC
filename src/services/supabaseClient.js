/**
 * Zero-Dependency Supabase Client for Icon Electromatic Admin CMS
 * Uses standard browser fetch against Supabase PostgREST endpoints.
 * Fallbacks seamlessly to local demo storage if Supabase credentials are unset.
 */

import { CATALOG } from '../data/catalogData.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const REBUILD_WEBHOOK_URL = import.meta.env.VITE_REBUILD_WEBHOOK_URL || '';

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
  }
};
