// ==============================================================================
// build-static-catalog.mjs
// Static Site Generation (SSG) & Master SEO Pre-Renderer for Icon Electromatic
// Generates standalone HTML files, XML Sitemap, and Schema.org JSON-LD
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATALOG } from '../src/data/catalogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const SITE_URL = 'https://iconelectromatic.com';
const TODAY = new Date().toISOString().split('T')[0];

// Detect dynamic CSS asset from Vite build output
export function getCssAssetFile() {
  const fallback = 'index-DmDkINf5.css';
  try {
    const assetsDir = path.resolve(DIST_DIR, 'assets');
    if (fs.existsSync(assetsDir)) {
      const found = fs.readdirSync(assetsDir).find(file => file.startsWith('index-') && file.endsWith('.css'));
      if (found) {
        return found;
      }
    }
  } catch (e) {
    console.warn('Could not inspect dist/assets, falling back to default CSS asset:', e.message);
  }
  return fallback;
}

export function sanitizeImageUrl(url, fallback = '/images/rf-laminate.jpg') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  // IndexedDB, blob, or raw data URLs cannot be fetched by search engines or external browsers
  if (trimmed.startsWith('idb:') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return fallback;
  }
  return trimmed;
}

// Load extraction report to link images
let extractionReport = {};
try {
  const reportPath = path.resolve(PUBLIC_DIR, 'catalog-images', 'full_extraction_report.json');
  if (fs.existsSync(reportPath)) {
    extractionReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read extraction report, proceeding with CATALOG data:', e.message);
}

function loadEnv() {
  const env = { ...process.env };
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const full = path.resolve(ROOT_DIR, f);
    if (fs.existsSync(full)) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              const k = trimmed.slice(0, eqIdx).trim();
              let v = trimmed.slice(eqIdx + 1).trim();
              if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
              }
              if (!env[k]) env[k] = v;
            }
          }
        }
      } catch {}
    }
  }
  return env;
}

export async function loadAuthoritativeCatalog(options = {}) {
  const env = options.env || loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseKey) {
    try {
      const fetchFn = options.fetch || globalThis.fetch;
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/cms_content?key=eq.products&select=content`;
      const res = await fetchFn(endpoint, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (res && res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0].content) && rows[0].content.length > 0) {
          console.log(`[SSG] Successfully loaded authoritative catalog (${rows[0].content.length} OEMs) from Supabase PostgreSQL.`);
          return rows[0].content;
        }
      } else {
        const statusText = res ? `status ${res.status}` : 'no response';
        console.warn(`[SSG] Supabase endpoint returned ${statusText}. Falling back to CATALOG.`);
      }
    } catch (e) {
      console.warn(`[SSG] Supabase network error (${e.message}). Falling back to CATALOG.`);
    }
  } else {
    console.log('[SSG] Supabase credentials not configured in environment. Using local CATALOG dataset.');
  }

  return CATALOG;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const sitemapUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/products`, priority: '0.9', changefreq: 'daily' },
  { loc: `${SITE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/services`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/partners`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${SITE_URL}/blogs`, priority: '0.7', changefreq: 'weekly' },
  { loc: `${SITE_URL}/contact`, priority: '0.8', changefreq: 'monthly' },
];

export function generateProductHtml(product, oem, category, images = []) {
  const oemSlug = oem.id || slugify(oem.name);
  const prodSlug = product.id || slugify(product.name);
  const pageUrl = product.canonical_url || `${SITE_URL}/products/${oemSlug}/${prodSlug}`;
  const title = product.meta_title || `${product.name} | ${oem.name} Distributor | Icon Electromatic`;
  const description = product.meta_description || (product.description 
    ? (product.description.length > 155 ? product.description.slice(0, 152) + '...' : product.description)
    : `Buy authentic ${product.name} components manufactured by ${oem.name}. Distributed by Icon Electromatic across India, Singapore and USA.`);

  const fallbackHero = sanitizeImageUrl(oem.defaultImage, '/images/rf-laminate.jpg');
  const rawHero = images.find(i => i.is_primary) || images[0] || {
    url: fallbackHero,
    alt: `${product.name} - ${oem.name}`
  };
  const heroImage = {
    url: sanitizeImageUrl(rawHero.url, fallbackHero),
    alt: rawHero.alt || `${product.name} - ${oem.name}`
  };

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": heroImage.url ? (heroImage.url.startsWith('http') ? heroImage.url : `${SITE_URL}${heroImage.url}`) : undefined,
    "description": product.description || description,
    "sku": product.id || prodSlug,
    "mpn": product.name,
    "brand": {
      "@type": "Brand",
      "name": oem.name
    },
    "category": category.name,
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "seller": {
        "@type": "Organization",
        "name": "Icon Electromatic",
        "url": SITE_URL
      }
    }
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": `${SITE_URL}/products`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": oem.name,
        "item": `${SITE_URL}/products?oem=${encodeURIComponent(oemSlug)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": pageUrl
      }
    ]
  };

  const specs = product.specs || {};
  const features = product.features || [];
  const applications = product.applications || (product.applications_raw ? [product.applications_raw] : []);
  const cssFile = getCssAssetFile();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(pageUrl)}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- OpenGraph Social Tags -->
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  ${heroImage.url ? `<meta property="og:image" content="${heroImage.url.startsWith('http') ? heroImage.url : `${SITE_URL}${heroImage.url}`}">` : ''}

  <!-- Google Structured Data (JSON-LD) -->
  <script type="application/ld+json">
${JSON.stringify(schemaJson, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(breadcrumbsSchema, null, 2)}
  </script>

  <!-- Typography & Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/${cssFile}">

  <style>
    :root {
      --bg-dark: #080c14;
      --bg-card: #0f172a;
      --border-dark: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --blue-accent: #2563eb;
      --blue-light: #60a5fa;
    }
    body {
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .static-nav {
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--border-dark);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
    }
    .static-logo {
      font-weight: 800;
      font-size: 1.1rem;
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .static-nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      margin-left: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .static-nav-links a:hover { color: #fff; }
    .product-container {
      max-width: 1200px;
      margin: 32px auto;
      padding: 0 24px;
    }
    .breadcrumb-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .breadcrumb-row a { color: var(--text-muted); text-decoration: none; }
    .breadcrumb-row a:hover { color: var(--blue-light); }
    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 40px;
      margin-bottom: 48px;
    }
    @media (max-width: 860px) {
      .product-grid { grid-template-columns: 1fr; }
    }
    .gallery-box {
      background: var(--bg-card);
      border: 1px solid var(--border-dark);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .main-image-wrap {
      width: 100%;
      height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #020617;
      border-radius: 8px;
      overflow: hidden;
    }
    .main-image-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .thumbs-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
    }
    .thumb-btn {
      width: 70px;
      height: 70px;
      border: 1px solid var(--border-dark);
      border-radius: 6px;
      background: #020617;
      padding: 4px;
      cursor: pointer;
    }
    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .product-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 10px 0;
      letter-spacing: -0.02em;
    }
    .oem-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid rgba(37, 99, 235, 0.3);
      color: var(--blue-light);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .product-lead {
      font-size: 1.05rem;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 0.9rem;
    }
    .specs-table th, .specs-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-dark);
      text-align: left;
    }
    .specs-table th {
      color: var(--text-muted);
      width: 40%;
      font-weight: 600;
    }
    .specs-table td {
      color: #f1f5f9;
      font-family: 'JetBrains Mono', monospace;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-primary {
      background: var(--blue-accent);
      color: #fff;
      border: none;
    }
    .btn-primary:hover { background: #1d4ed8; }
    .static-footer {
      border-top: 1px solid var(--border-dark);
      padding: 40px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header class="static-nav">
    <a href="/" class="static-logo">
      <i class="fa-solid fa-microchip" style="color:var(--blue-light);"></i>
      <span>ICON ELECTROMATIC</span>
    </a>
    <nav class="static-nav-links">
      <a href="/products">Products</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/partners">OEM Partners</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main class="product-container">
    <nav class="breadcrumb-row" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>&rsaquo;</span>
      <a href="/products">Products</a>
      <span>&rsaquo;</span>
      <a href="/products?oem=${encodeURIComponent(oemSlug)}">${escapeHtml(oem.name)}</a>
      <span>&rsaquo;</span>
      <span style="color:#fff;">${escapeHtml(product.name)}</span>
    </nav>

    <div class="product-grid">
      <div class="gallery-box">
        <div class="main-image-wrap">
          <img src="${escapeHtml(heroImage.url)}" alt="${escapeHtml(heroImage.alt || product.name)}" id="main-product-img" width="480" height="320" loading="eager" />
        </div>
        ${images.length > 1 ? `
          <div class="thumbs-row">
            ${images.map(img => `
              <div class="thumb-btn" onclick="document.getElementById('main-product-img').src='${escapeHtml(img.url)}'">
                <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || product.name)}" width="60" height="60" loading="lazy" />
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="product-details">
        <div class="oem-pill">
          <i class="fa-solid fa-industry"></i>
          <span>${escapeHtml(oem.name)} &bull; ${escapeHtml(category.name)}</span>
        </div>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="product-lead">${escapeHtml(product.description || description)}</p>

        ${Object.keys(specs).length > 0 ? `
          <h3>Engineering Specifications</h3>
          <table class="specs-table">
            <tbody>
              ${Object.entries(specs).map(([k, v]) => `
                <tr>
                  <th>${escapeHtml(k)}</th>
                  <td>${escapeHtml(v)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${features.length > 0 ? `
          <h3>Key Features</h3>
          <ul style="color:#cbd5e1;margin-bottom:24px;padding-left:20px;font-size:0.9rem;">
            ${features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
          </ul>
        ` : ''}

        <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap;">
          <a href="/contact?subject=rfq&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="btn-action btn-primary">
            <i class="fa-solid fa-file-invoice-dollar"></i> Request Formal RFQ
          </a>
          <a href="/contact?subject=technical&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="btn-action" style="background:transparent;border:1px solid var(--border-dark);color:#fff;">
            <i class="fa-solid fa-headset"></i> Technical Consultation
          </a>
        </div>
      </div>
    </div>
  </main>

  <footer class="static-footer">
    <p>&copy; 2026 ICON ELECTROMATIC &bull; Authorized Distributor of RF, Microwave &amp; Millimeter-Wave Components.</p>
    <p style="margin-top:6px;font-size:0.75rem;">Serving Defense, Space, Aerospace, 5G Telecommunications, and Radar Industries.</p>
  </footer>
</body>
</html>`;
}

export async function run(options = {}) {
  console.log('--- Generating Static SEO HTML & Sitemap ---');
  let productCount = 0;
  const sitemapUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/services`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/partners`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/blogs`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${SITE_URL}/contact`, priority: '0.8', changefreq: 'monthly' },
  ];

  const catalog = await loadAuthoritativeCatalog(options);

  for (const oem of catalog) {
    if (oem.visible === false) continue;
    const oemSlug = oem.id || slugify(oem.name);

    for (const cat of (oem.categories || [])) {
      if (cat.visible === false) continue;

      for (const prod of (cat.products || [])) {
        if (prod.visible === false) continue;

        // Collect product images from product.gallery, extraction report, or fallback
        const prodKey = `${oemSlug}__${prod.id || slugify(prod.name)}`;
        const extracted = extractionReport[prodKey] || [];
        const fallbackImage = sanitizeImageUrl(oem.defaultImage, '/images/rf-laminate.jpg');
        
        let images = [];
        if (Array.isArray(prod.gallery) && prod.gallery.length > 0) {
          images = prod.gallery.map((g, idx) => ({
            url: sanitizeImageUrl(g.image_url || g.url, fallbackImage),
            alt: g.alt_text || `${prod.name} - ${oem.name}`,
            is_primary: Boolean(g.is_primary || idx === 0)
          })).filter(img => Boolean(img.url));
        } else if (extracted.length > 0) {
          images = extracted.map((ext, idx) => ({
            url: sanitizeImageUrl(ext.web_path, fallbackImage),
            alt: `${prod.name} - ${oem.name} (${ext.drawing_name})`,
            is_primary: ext.is_primary || idx === 0
          }));
        } else if (prod.image) {
          images = [{
            url: sanitizeImageUrl(prod.image, fallbackImage),
            alt: `${prod.name} - ${oem.name}`,
            is_primary: true
          }];
        }

        // Only generate standalone static SEO pages for products meeting Option B quality gate
        const hasImg = images.length > 0 && Boolean(images[0].url);
        const hasDesc = Boolean(prod.description && prod.description.trim().length >= 20);

        if (hasImg && hasDesc) {
          const prodSlug = prod.id || slugify(prod.name);
          const html = generateProductHtml(prod, oem, cat, images);

          if (!options.dryRun) {
            // Write to dist/ and public/
            const distDir = path.resolve(DIST_DIR, 'products', oemSlug, prodSlug);
            const pubDir = path.resolve(PUBLIC_DIR, 'products', oemSlug, prodSlug);
            ensureDir(distDir);
            ensureDir(pubDir);

            fs.writeFileSync(path.resolve(distDir, 'index.html'), html, 'utf8');
            fs.writeFileSync(path.resolve(pubDir, 'index.html'), html, 'utf8');
          }

          sitemapUrls.push({
            loc: prod.canonical_url || `${SITE_URL}/products/${oemSlug}/${prodSlug}`,
            priority: '0.8',
            changefreq: 'monthly'
          });
          productCount++;
        }
      }
    }
  }

  // Deduplicate Sitemap URLs by location to prevent Search Console errors
  const seenLocs = new Set();
  const uniqueSitemapUrls = [];
  for (const u of sitemapUrls) {
    if (!seenLocs.has(u.loc)) {
      seenLocs.add(u.loc);
      uniqueSitemapUrls.push(u);
    }
  }

  // Generate Sitemap XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueSitemapUrls.map(u => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  if (!options.dryRun) {
    fs.writeFileSync(path.resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
    if (fs.existsSync(DIST_DIR)) {
      fs.writeFileSync(path.resolve(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
    }
  }

  console.log(`Generated ${productCount} static product HTML pages with JSON-LD schema.`);
  console.log(`Generated sitemap.xml with ${uniqueSitemapUrls.length} indexable URLs.`);

  return { productCount, sitemapUrlCount: uniqueSitemapUrls.length, sitemapXml };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().catch(console.error);
}

