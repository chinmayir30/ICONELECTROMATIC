// ==============================================================================
// generate-full-seed.mjs
// Generates the comprehensive supabase/seed.sql for all 15 OEMs, 88 Categories,
// and 169 Products, with on-record SEO metadata and image relations.
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { CATALOG } from '../src/data/catalogData.js';

function slugify(text) {
  if (!text) return 'unnamed';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u2126\u03A9]/g, 'ohm') // Omega symbol to ohm
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed';
}

function escapeSql(text) {
  if (text === null || text === undefined) return 'NULL';
  return "'" + text.toString().replace(/'/g, "''") + "'";
}

// 2. Load extraction report
const reportPath = path.join('public', 'catalog-images', 'full_extraction_report.json');
let extractedImages = [];
if (fs.existsSync(reportPath)) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  extractedImages = report.products || [];
}

// Map extracted images by normalized (oem_slug, prod_slug) and (oem_name, prod_name)
const imageMap = new Map();
for (const item of extractedImages) {
  if (item.images && item.images.length > 0) {
    const key1 = `${item.oem_slug}__${item.prod_slug}`;
    const key2 = `${slugify(item.oem)}__${slugify(item.product)}`;
    imageMap.set(key1, item.images);
    imageMap.set(key2, item.images);
  }
}

console.log(`Loaded ${CATALOG.length} OEMs from catalogData.js.`);
console.log(`Loaded ${imageMap.size} image mappings from extraction report.`);

let sql = `-- ==============================================================================
-- seed.sql (Full Catalog Seed)
-- Complete dataset: 15 OEMs, 88 Categories, 169 Products + Images + SEO Metadata
-- Generated automatically from catalogData.js and full_extraction_report.json
-- ==============================================================================

`;

// 3. Generate OEMs SQL
sql += `-- ------------------------------------------------------------------------------
-- 1. OEMs (Original Equipment Manufacturers)
-- ------------------------------------------------------------------------------
INSERT INTO public.oems (id, name, slug, logo_url, description, priority_order, website_url) VALUES
`;

const oemValues = [];
let oemIndex = 1;
const oemIdMap = new Map();

for (const oem of CATALOG) {
  const oemUuid = `00000000-0000-0000-0000-${String(oemIndex).padStart(12, '0')}`;
  oemIdMap.set(oem.id, oemUuid);
  const oemSlug = slugify(oem.shortName || oem.name);
  
  oemValues.push(`(
    '${oemUuid}',
    ${escapeSql(oem.name)},
    ${escapeSql(oemSlug)},
    ${escapeSql(oem.logoImg || null)},
    ${escapeSql(oem.description || oem.tagline || '')},
    ${oemIndex},
    ${escapeSql(oem.website || null)}
  )`);
  oemIndex++;
}

sql += oemValues.join(',\n') + `
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;\n\n`;

// 4. Generate Categories SQL
sql += `-- ------------------------------------------------------------------------------
-- 2. Categories
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, oem_id) VALUES
`;

const catValues = [];
let catIndex = 1;
const catIdMap = new Map();
const seenCatSlugs = new Set();

for (const oem of CATALOG) {
  const oemUuid = oemIdMap.get(oem.id);
  for (const cat of oem.categories || []) {
    const catUuid = `00000000-0000-0000-0001-${String(catIndex).padStart(12, '0')}`;
    catIdMap.set(`${oem.id}__${cat.id}`, catUuid);

    let baseSlug = slugify(cat.name);
    let catSlug = baseSlug;
    if (seenCatSlugs.has(catSlug)) {
      catSlug = `${slugify(oem.shortName || oem.name)}-${baseSlug}`;
    }
    seenCatSlugs.add(catSlug);

    catValues.push(`(
      '${catUuid}',
      ${escapeSql(cat.name)},
      ${escapeSql(catSlug)},
      ${escapeSql(cat.description || '')},
      '${oemUuid}'
    )`);
    catIndex++;
  }
}

sql += catValues.join(',\n') + `
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;\n\n`;

// 5. Generate Products & Images SQL
const productValues = [];
const imageValues = [];
let prodIndex = 1;
let imgIndex = 1;
let publishedCount = 0;
let draftCount = 0;

for (const oem of CATALOG) {
  const oemUuid = oemIdMap.get(oem.id);
  const oemSlug = slugify(oem.shortName || oem.name);
  const seenProdSlugsInOem = new Set();

  for (const cat of oem.categories || []) {
    const catUuid = catIdMap.get(`${oem.id}__${cat.id}`);

    for (const prod of cat.products || []) {
      const prodUuid = `00000000-0000-0000-0002-${String(prodIndex).padStart(12, '0')}`;
      
      let baseSlug = slugify(prod.name);
      let prodSlug = baseSlug;
      if (seenProdSlugsInOem.has(prodSlug)) {
        prodSlug = `${baseSlug}-${slugify(cat.name)}`;
      }
      seenProdSlugsInOem.add(prodSlug);

      // Check if extracted images exist for this product
      const lookupKey = `${oemSlug}__${baseSlug}`;
      const foundImages = imageMap.get(lookupKey) || [];

      // Option B rule: published only if image AND description exist
      const hasImage = foundImages.length > 0;
      const hasDesc = !!(prod.description && prod.description.trim().length > 0);
      const isPublished = hasImage && hasDesc;

      if (isPublished) publishedCount++;
      else draftCount++;

      // SEO Fields
      const metaTitle = `${oem.shortName || oem.name} ${prod.name} ${cat.name} | Icon Electromatic`;
      const metaDesc = `Buy genuine ${oem.shortName || oem.name} ${prod.name} ${cat.name} from Icon Electromatic. Technical specifications and pricing for India, Singapore & USA.`;
      const canonicalUrl = `https://iconelectromatic.com/products/${oemSlug}/${prodSlug}`;
      const ogImage = hasImage ? foundImages[0].url : null;

      // Specs JSON
      const specsJson = JSON.stringify(prod.specifications || {});

      // Features & Apps
      const featuresArr = (prod.features || []).map(f => escapeSql(f)).join(', ');
      const featuresSql = featuresArr ? `ARRAY[${featuresArr}]` : `'{}'::text[]`;

      const appsText = typeof prod.applications === 'string' 
        ? prod.applications.split(',').map(a => a.trim()).filter(Boolean)
        : (prod.applications || []);
      const appsArr = appsText.map(a => escapeSql(a)).join(', ');
      const appsSql = appsArr ? `ARRAY[${appsArr}]` : `'{}'::text[]`;

      productValues.push(`(
        '${prodUuid}',
        ${escapeSql(prod.name)},
        ${escapeSql(prodSlug)},
        '${oemUuid}',
        '${catUuid}',
        ${escapeSql(prod.description || '')},
        ${escapeSql(specsJson)}::jsonb,
        ${featuresSql},
        ${appsSql},
        ${escapeSql(prod.datasheet || null)},
        ${isPublished},
        false,
        ${escapeSql(metaTitle)},
        ${escapeSql(metaDesc)},
        ${escapeSql(canonicalUrl)},
        ${escapeSql(ogImage)}
      )`);

      // Add image relations
      for (const img of foundImages) {
        const imgUuid = `00000000-0000-0000-0003-${String(imgIndex).padStart(12, '0')}`;
        imageValues.push(`(
          '${imgUuid}',
          '${prodUuid}',
          ${escapeSql(img.url)},
          ${escapeSql(img.alt_text || `${oem.name} ${prod.name}`)},
          ${img.display_order},
          ${img.is_primary},
          ${img.width || 800},
          ${img.height || 600},
          'webp'
        )`);
        imgIndex++;
      }

      prodIndex++;
    }
  }
}

sql += `-- ------------------------------------------------------------------------------
-- 3. Products (169 items with specifications and SEO tags)
-- ------------------------------------------------------------------------------
INSERT INTO public.products (
  id, name, slug, oem_id, category_id, description,
  specifications, features, applications, datasheet_url,
  is_published, is_featured,
  meta_title, meta_description, canonical_url, og_image_url
) VALUES
` + productValues.join(',\n') + `
ON CONFLICT (oem_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;\n\n`;

// 6. Generate Product Images SQL
if (imageValues.length > 0) {
  sql += `-- ------------------------------------------------------------------------------
-- 4. Product Images (Ordered Left-to-Right from Excel)
-- ------------------------------------------------------------------------------
INSERT INTO public.product_images (
  id, product_id, image_url, alt_text, display_order, is_primary, width, height, format
) VALUES
` + imageValues.join(',\n') + `
ON CONFLICT (id) DO NOTHING;\n`;
}

// Write to supabase/seed.sql
fs.writeFileSync('supabase/seed.sql', sql, 'utf8');

console.log('=' .repeat(70));
console.log(`Generated Full supabase/seed.sql successfully!`);
console.log(`- OEMs: ${CATALOG.length}`);
console.log(`- Categories: ${catValues.length}`);
console.log(`- Products: ${productValues.length}`);
console.log(`  - Published (has image + desc): ${publishedCount}`);
console.log(`  - Drafts (pending image upload): ${draftCount}`);
console.log(`- Image relations: ${imageValues.length}`);
console.log('=' .repeat(70));
