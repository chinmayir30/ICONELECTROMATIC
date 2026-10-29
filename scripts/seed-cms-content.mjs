// ==============================================================================
// seed-cms-content.mjs
// Extracts authentic INITIAL_CONTENT, partners, and blogs from ContentService.js
// and generates idempotent PostgreSQL seed commands for public.cms_content
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OEM_BLOGS } from '../src/data/blogData.js';

import { extractAuthoritativeCatalog } from './seed-products-cms.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function extractAllContentSections() {
  const csPath = path.resolve(ROOT_DIR, 'src', 'data', 'ContentService.js');
  const code = fs.readFileSync(csPath, 'utf8');

  // 1. Extract INITIAL_CONTENT object
  const startMarker = 'const INITIAL_CONTENT = {';
  const startIdx = code.indexOf(startMarker);
  const endMatch = code.match(/\};\s*export\s+const\s+ContentService/);

  if (startIdx === -1 || !endMatch) {
    throw new Error('Could not locate INITIAL_CONTENT block in ContentService.js');
  }

  const endIdx = endMatch.index;
  const objectCode = code.slice(startIdx + 'const INITIAL_CONTENT = '.length, endIdx + 1);
  const fn = new Function(`return (${objectCode});`);
  const initialContent = fn();

  // 2. Extract partners section from ContentService.js
  const partnersMatch = code.match(/const\s+initialPartners\s*=\s*(\[[\s\S]*?\]);\s*const\s+initial\s*=\s*\{[\s\S]*?partners:\s*initialPartners\s*\};/);
  let partnersSection = null;
  if (partnersMatch) {
    const initialPartners = (new Function(`return (${partnersMatch[1]});`))();
    partnersSection = {
      heroTitle: 'Authorized Technology Partners',
      heroLead: 'We represent a diverse portfolio of OEMs across sectors, industries and application.<br />To know more about their products, make an enquiry or request samples just get in touch with us.',
      trustBadge1: '10+ Global Technology Partners',
      trustBadge2: 'Space & Mil-Spec Screening Support',
      partners: initialPartners
    };
  }

  // 3. Construct blogs section with OEM_BLOGS
  const blogsSection = {
    heroTitle: 'OEM Technical News, Video Demos & Insights',
    heroSubtitle: 'Direct technical bulletins, video demonstrations, application whitepapers, and product release updates from ICON Electromatic\'s 15 global manufacturing partners.',
    trustBadge1: 'Application Whitepapers & Notes',
    trustBadge2: 'Video Demos & Technical Webinars',
    trustBadge3: 'Direct Manufacturer Bulletins',
    oemBlogs: (OEM_BLOGS || []).map(b => ({
      oemId: b.oemId,
      officialWebsite: b.officialWebsite || '',
      portalName: b.portalName || '',
      headline: b.headline || '',
      visible: b.visible !== false,
      articles: (b.articles || []).map(a => ({
        id: a.id || `art-${Math.random().toString(36).substr(2, 6)}`,
        title: a.title || '',
        date: a.date || '',
        category: a.category || 'Technical News',
        readTime: a.readTime || '5 min read',
        image: a.image || '',
        summary: a.summary || '',
        content: a.content || '',
        tags: Array.isArray(a.tags) ? a.tags : [],
        visible: a.visible !== false
      })),
      videos: (b.videos || []).map(v => ({
        id: v.id || `vid-${Math.random().toString(36).substr(2, 6)}`,
        title: v.title || '',
        speaker: v.speaker || '',
        duration: v.duration || '',
        date: v.date || '',
        thumbnail: v.thumbnail || '',
        videoUrl: v.videoUrl || '',
        summary: v.summary || '',
        topics: Array.isArray(v.topics) ? v.topics : [],
        visible: v.visible !== false
      })),
      whitepapers: (b.whitepapers || []).map(w => ({
        id: w.id || `wp-${Math.random().toString(36).substr(2, 6)}`,
        title: w.title || '',
        author: w.author || '',
        date: w.date || '',
        pages: w.pages || '',
        frequencyBand: w.frequencyBand || '',
        summary: w.summary || '',
        keyFindings: Array.isArray(w.keyFindings) ? w.keyFindings : [],
        downloadUrl: w.downloadUrl || '',
        visible: w.visible !== false
      })),
      officialLinks: (b.officialLinks || []).map(l => ({
        title: l.title || '',
        url: l.url || '',
        description: l.description || '',
        icon: l.icon || 'fa-globe'
      }))
    }))
  };

  const allSections = {
    ...initialContent,
    ...(partnersSection ? { partners: partnersSection } : {}),
    blogs: blogsSection,
    products: extractAuthoritativeCatalog()
  };

  return allSections;
}

export function generateSeedSql(allSections) {
  const keys = Object.keys(allSections);
  let sql = `-- ==============================================================================
-- seed_cms_content.sql
-- Authentic baseline seed for public.cms_content (All 12 CMS sections)
-- Generated automatically from ContentService.js and blogData.js
-- ==============================================================================

`;

  for (const key of keys) {
    const jsonStr = JSON.stringify(allSections[key]).replace(/'/g, "''");
    sql += `-- Section: ${key}
INSERT INTO public.cms_content (key, content, updated_at)
VALUES ('${key}', '${jsonStr}'::jsonb, timezone('utc'::text, now()))
ON CONFLICT (key) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = timezone('utc'::text, now());

`;
  }

  return { sql, sectionCount: keys.length, keys };
}

async function run() {
  console.log('🔄 Extracting all 12 authentic content sections...');
  const allSections = extractAllContentSections();
  const { sql, sectionCount, keys } = generateSeedSql(allSections);

  const outPath = path.resolve(ROOT_DIR, 'supabase', 'seed_cms_content.sql');
  fs.writeFileSync(outPath, sql, 'utf8');

  console.log(`✅ Successfully generated supabase/seed_cms_content.sql with all ${sectionCount} sections:`);
  console.log(`   ${keys.join(', ')}`);
}

// Only execute when run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(err => {
    console.error('❌ Failed to generate seed SQL:', err);
    process.exit(1);
  });
}
