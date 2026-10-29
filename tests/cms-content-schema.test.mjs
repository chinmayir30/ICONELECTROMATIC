// ==============================================================================
// tests/cms-content-schema.test.mjs
// Automated verification for Step 1: Database Schema & Seed for CMS Content
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractAllContentSections, generateSeedSql } from '../scripts/seed-cms-content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const REQUIRED_SECTIONS = [
  'header',
  'footer',
  'home',
  'about',
  'services',
  'projects',
  'gallery',
  'testimonials',
  'contact',
  'seo',
  'partners',
  'blogs',
  'products'
];

test('CMS Content Schema & Seed Suite', async (t) => {
  await t.test('Test 1: Migration 004_cms_content.sql file exists and has correct DDL structure', () => {
    const migrationPath = path.resolve(ROOT_DIR, 'supabase', 'migrations', '004_cms_content.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration 004_cms_content.sql must exist');

    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Table definition
    assert.match(sql, /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.cms_content/i, 'Must create public.cms_content table');
    assert.match(sql, /key\s+TEXT\s+PRIMARY\s+KEY/i, 'Must define key as primary key');
    assert.match(sql, /content\s+JSONB\s+NOT\s+NULL/i, 'Must define content as JSONB NOT NULL');
    assert.match(sql, /updated_at\s+TIMESTAMPTZ\s+NOT\s+NULL/i, 'Must define updated_at as TIMESTAMPTZ');
    assert.match(sql, /updated_by\s+UUID\s+REFERENCES\s+auth\.users/i, 'Must define optional updated_by reference');

    // Index
    assert.match(sql, /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+idx_cms_content_updated_at/i, 'Must create index on updated_at');

    // Automated trigger
    assert.match(sql, /CREATE\s+TRIGGER\s+trg_cms_content_updated_at/i, 'Must create trg_cms_content_updated_at');
    assert.match(sql, /EXECUTE\s+FUNCTION\s+public\.set_updated_at\(\)/i, 'Must call set_updated_at()');

    // RLS
    assert.match(sql, /ALTER\s+TABLE\s+public\.cms_content\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i, 'Must enable RLS');
    assert.match(sql, /CREATE\s+POLICY\s+"Public can view cms_content"/i, 'Must declare public read policy');
    assert.match(sql, /CREATE\s+POLICY\s+"Staff can manage cms_content"/i, 'Must declare staff write policy');
    assert.match(sql, /public\.is_staff\(\)/i, 'Must check public.is_staff() for staff policy');
  });

  await t.test('Test 2: extractAllContentSections extracts all 13 authentic sections', () => {
    const sections = extractAllContentSections();
    assert.ok(sections && typeof sections === 'object', 'Extracted sections must be an object');

    for (const key of REQUIRED_SECTIONS) {
      assert.ok(key in sections, `Extracted content must contain key: '${key}'`);
      assert.ok(sections[key] && typeof sections[key] === 'object', `Section '${key}' must be a non-empty object`);
    }

    // Deep check key payloads
    assert.ok(Array.isArray(sections.home.stats), 'home.stats must be an array');
    assert.ok(sections.about.heroTitle === 'About Us', 'about.heroTitle must match authentic copy');
    assert.ok(Array.isArray(sections.partners.partners), 'partners.partners must be an array');
    assert.ok(sections.partners.partners.length >= 10, 'partners must contain at least 10 authentic OEMs');
    assert.ok(Array.isArray(sections.blogs.oemBlogs), 'blogs.oemBlogs must be an array');
    assert.ok(sections.blogs.oemBlogs.length >= 10, 'blogs must contain at least 10 OEM blog entries');
  });

  await t.test('Test 3: generateSeedSql generates valid idempotent SQL statements', () => {
    const sections = extractAllContentSections();
    const { sql, sectionCount, keys } = generateSeedSql(sections);

    assert.equal(sectionCount, 13, 'Must generate exactly 13 sections');
    assert.equal(keys.length, 13, 'Keys list must have 13 items');

    for (const key of REQUIRED_SECTIONS) {
      assert.ok(sql.includes(`'${key}',`), `SQL must contain insert for '${key}'`);
      assert.ok(sql.includes(`ON CONFLICT (key) DO UPDATE SET`), `SQL must be idempotent with ON CONFLICT for '${key}'`);
    }
  });

  await t.test('Test 4: supabase/seed_cms_content.sql matches expected file content and valid JSON', () => {
    const seedPath = path.resolve(ROOT_DIR, 'supabase', 'seed_cms_content.sql');
    assert.ok(fs.existsSync(seedPath), 'supabase/seed_cms_content.sql must exist');

    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Extract each JSON string literal and ensure it parses cleanly as JSON
    const regex = /VALUES\s*\(\s*'([^']+)'\s*,\s*'([\s\S]*?)'::jsonb/g;
    let match;
    let foundKeys = [];

    while ((match = regex.exec(seedSql)) !== null) {
      const key = match[1];
      const rawJson = match[2].replace(/''/g, "'");
      foundKeys.push(key);

      assert.doesNotThrow(() => {
        const parsed = JSON.parse(rawJson);
        assert.ok(parsed && typeof parsed === 'object', `Parsed JSON for '${key}' must be an object`);
      }, `JSON payload for '${key}' in seed_cms_content.sql must be valid JSON`);
    }

    assert.equal(foundKeys.length, 13, 'Must locate exactly 13 JSON payloads in seed_cms_content.sql');
    for (const reqKey of REQUIRED_SECTIONS) {
      assert.ok(foundKeys.includes(reqKey), `seed_cms_content.sql must contain section '${reqKey}'`);
    }
  });
});
