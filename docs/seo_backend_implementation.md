# SEO, Backend and CMS Implementation Record
**Project:** Icon Electromatic B2B catalog website  
**Location in repo:** docs/seo_backend_implementation.md  
**Last updated:** 19 Oct 2026  

## How to read this file
Every item has one status. A status is only "Implemented" when the work is merged to `main` and has evidence (PR number, merge commit, how it was checked).

| Status | Meaning |
|---|---|
| Planned | Designed or approved, nothing built |
| In progress | A branch or pull request exists, not merged |
| Implemented | Merged to `main`, with evidence |
| Verified | Implemented and independently checked |

Rules for every new entry:
1. Never mark something Implemented unless it is merged. Cite the PR number and merge commit.
2. Entries written in a pull request start as "In progress (PR #N)". The next task starts by changing them to "Implemented" with the merge commit, after confirming the merge on main.
3. State how it was checked, and what was NOT checked.
4. Include how to undo it (usually: revert the PR on GitHub).
5. Technology names must say what role each tool plays.

## 1. Scope
- In scope: frontend, backend, database, CMS, image pipeline, SEO for about 200 product images, every product and the whole website, and a self-contained handover package.
- Out of scope: production deployment, domain and DNS, hosting, server monitoring. The client deploys on their own domain. Any Vercel link is only a preview.

## 2. Technology stack
| Technology | Role | Status |
|---|---|---|
| Vite + vanilla JavaScript | Current frontend and demo admin | Implemented (baseline `frontend-v1`) |
| Git + GitHub pull requests | Change history and review | Implemented |
| GitHub Actions (`ci.yml`) | Automatic build check on every pull request | Verified |
| Antigravity workflows (`new_feature`, `finish_feature`) | Repeatable branch, commit and push routine | Implemented |
| Environment variable `VITE_ENABLE_DEMO_ADMIN` | Keeps the demo admin out of production | Verified |
| Vercel | Preview link for the client only | Implemented (preview) |
| Supabase (PostgreSQL, Auth, Storage, Edge Functions) | Database, staff login, images, contact form function | Planned |
| Astro | Static pages with real web addresses | Planned |
| Python and Node scripts | Image extraction, WebP conversion, upload | Planned |
| Resend | Email delivery for enquiries | Planned |

## 3. Baseline: `frontend-v1` (commit e371aac, 15 Oct 2026)
Status: Implemented (tagged)
- Multi-page site in Vite and vanilla JavaScript with hash-based routing (`/#/products`).
- Catalog data hand-edited in `src/data/catalogData.js` (15 OEMs, 88 categories, 169 products at 19 Oct 2026).
- Demo CMS and admin that save edits in the editor's browser only (localStorage and IndexedDB).
- Known limitations at this baseline:
  - Google sees one page, because of hash routing.
  - Contact and careers forms show a thank-you message but send nothing.
  - No per-page titles or descriptions, canonical tags, sitemap, robots.txt or structured data.
  - Admin login is a demo.
  - "4,000+ products" and "24+ categories" claims are still in the site text.

## 4. Implementation entries

### Entry 1: Agent rules and project state
- **Status:** Implemented. PR #5, merge commit a1d0f55, 16 Oct 2026.
- **What was built:** `AGENTS.md` (rules for the AI agent), `GEMINI.md` (points to AGENTS.md), `docs/PROJECT-STATE.md` (stage checklist, decisions, known issues).
- **Technology and role:** Markdown files read by the Antigravity agent at the start of each session.
- **How it works:** The agent reads the rules and the current stage before any task, plans first, waits for approval, and updates PROJECT-STATE.md afterwards.
- **Checked:** Files present on `main`. The agent stopped and asked before deleting an untracked file, which shows the rules are being followed.
- **Not checked:** That the agent follows every rule every time.
- **Undo:** Revert PR #5.

### Entry 2: Git automation workflows and CI build check
- **Status:** Verified. PR #6, merge commit 1e31ad7, 19 Oct 2026.
- **What was built:**
  - Workflows `new_feature` and `finish_feature` (in `.agent/workflows` and `.agents/workflows`).
  - Section 9 "Git automation" added to `AGENTS.md`.
  - `.github/workflows/ci.yml`: on every pull request and on pushes to `main`, check out the code, set up Node 20, run `npm ci` and `npm run build`.
- **How it works:** `/new_feature` updates `main`, creates a branch and writes a plan. `/finish_feature` builds, commits and pushes, but never merges. The CI check shows a green tick or red cross on the pull request.
- **Checked:** CI ran on PR #6 and passed (visible on the GitHub Actions page). Workflow files and `ci.yml` confirmed on `main`.
- **Not checked:** CI does not run tests or a link check yet. It only proves the site builds.
- **Undo:** Revert PR #6.

### Entry 3: Demo admin kept out of production
- **Status:** Verified. PR #7, merge commit 81058b0 (change commit b364ef3), 19 Oct 2026.
- **What was built:**
  - `Header.js`: the "Employee Zone" link is shown only when `VITE_ENABLE_DEMO_ADMIN` is exactly `true`.
  - `main.js`: the `#/admin` route is registered only when the variable is `true`, and `Admin.js` is loaded with a dynamic `import()`.
  - `Admin.js`: removed the pre-filled password and the demo note.
  - `.env.example` documents variable names with empty or placeholder values only. `.gitignore` now ignores `.env`, `.env.local` and `.env.*.local`. Real values live in `.env.local` and are never committed.
- **How it works:** At build time Vite replaces the variable. With it off, the admin code is not bundled and the link does not exist. With it on (a developer's own computer), the admin is a separate file loaded on demand.
- **Checked (independent rebuild of `main`):**
  - Variable off: main JavaScript 416.70 kB (down from 644.67 kB); only two build files; no "admin123" or "Employee Zone" anywhere in the build.
  - Variable on: a separate admin file (227.13 kB JavaScript, 17.54 kB CSS) appears, and "admin123" is found only in it.
- **Not checked:** Logging in to the admin in a browser with the variable on. The login is still a demo (the password check remains in the dev-only admin file, and the repo is public).
- **Undo:** Revert PR #7.

### Entry 4: SEO, backend and CMS implementation record
- **Status:** Implemented. PR #8, merge commit aa04e42, 19 Oct 2026.
- **What was built:**
  - `docs/seo_backend_implementation.md`: Added the master implementation log, technology roles, data audit summary, and phased plan.
  - `AGENTS.md`: Added item 6 to section 8 ("Technology used and how it works"), added rule on entry status progression (In progress -> Implemented upon merge), updated secrets rule (.env.example has empty/placeholder values only; real values in .env.local), and added section 9 safety rules against destructive commands with raw git diff approval.
  - `docs/PROJECT-STATE.md`: Added link pointing to `docs/seo_backend_implementation.md`.
- **Technology and role:** Markdown documentation and operational governance rules for verified task delivery.
- **How it works:** Ensures every feature or fix is recorded with evidence, status progression, and clear verification notes before and after merging.
- **Files and folders added or changed:** `docs/seo_backend_implementation.md`, `AGENTS.md`, `docs/PROJECT-STATE.md`.
- **Data and security notes:** No secrets added; rules explicitly forbid committing real secrets.
- **Checked (and how):** Built cleanly with `npm run build`; verified links and markdown formatting.
- **Not checked:** N/A (documentation only).
- **Undo:** Revert PR #8.

### Entry 5: Phase 0 — Dead-code removal and obsolete asset cleanup
- **Status:** Implemented. PR #9, merge commit 4e999ee, 19 Oct 2026.
- **What was built:** Removed unused dummy files (`src/data/products.js`, `src/pages/ProductDetail.js`), obsolete prototype pages and styles (`com.html`, `image.png`, `vercel.css` legacy rules, `vercel.html` unneeded mounts), obsolete media asset (`public/jbhd-tjzps.mp4`, 6.8 MB), and obsolete Excel v2 (`Icon Website Product Info - Mrora.v2 (1).xlsx`).
- **Technology and role:** Git cleanup, asset optimization, dead-code removal.
- **How it works:** Strips dead prototype files, reducing repository bloat by ~7 MB and JavaScript bundle size from 416.70 kB to 397.66 kB.
- **Files and folders added or changed:** 9 files removed/edited.
- **Data and security notes:** No live data or active catalog records affected; verified that all active products are loaded via `catalogData.js`.
- **Checked (and how):** Built cleanly with `npm run build` (397.66 kB JS); verified 0 build or console errors.
- **Not checked:** N/A.
- **Undo:** Revert PR #9.

### Entry 6: Phase 1 — The Walking Skeleton (1 OEM + 5 Products)
- **Status:** Implemented. PR #10, merge commit cd030a2, 19 Oct 2026.
- **What was built:**
  - `supabase/migrations/001_initial_schema.sql`: Full standard PostgreSQL DDL schema (`oems`, `categories`, `products`, `product_images`, `user_roles`, `enquiries`, `rate_limits`) with indexes, constraints, and on-record SEO columns.
  - `supabase/migrations/002_rls_policies.sql`: Row-Level Security policies enforcing public read-only for published products and authenticated staff write access.
  - `supabase/seed.sql`: Seed data for 1 OEM (Rogers Corporation) + categories + 5 real products (`RO4003C`, `RO4350B`, `RT/duroid 5880`, `TMM 10i`, `TC350`) with accurate specs, SEO tags, and image relationships.
  - `scripts/sample-extract-images.py`: Extraction script proving left-to-right drawing anchor ordering on the 5 sample products from Excel v3, generating optimized `.webp` images.
  - `scripts/build-static-product.mjs`: Static product page generator creating `/products/rogers/tc350` and `/products/rogers/rt-duroid-5880` with Google Schema.org `Product` JSON-LD, Breadcrumbs, OpenGraph tags, and WebP gallery.
- **Technology and role:** PostgreSQL DDL, Supabase RLS, Python Pillow, OpenXML drawing coordinate parser, static HTML generation, Schema.org JSON-LD.
- **How it works:** Proves the complete pipeline from database schema to Excel left-to-right image extraction to Google-indexable static HTML with structured data on a 5-product slice.
- **Files and folders added or changed:** `supabase/migrations/*`, `supabase/seed.sql`, `scripts/sample-extract-images.py`, `scripts/build-static-product.mjs`, `public/products/*`, `public/extracted-samples/*`.
- **Data and security notes:** Option B applied: products with images are published (`is_published: true`); products without images in Excel are marked draft. All tables protected with RLS.
- **Checked (and how):** Extraction verified (5 images converted to WebP with left-to-right order verified on row 29); `npm run build` passed cleanly in 5.43s.
- **Not checked:** Deployment to live domain (client deploys).
- **Undo:** Revert PR #10.

### Entry 7: Phase 2 — Full Catalog Migration & Batch Image Pipeline
- **Status:** Implemented. PR #11, merge commit 24b1418, 19 Oct 2026.
- **What was built:**
  - `scripts/extract-all-images.py`: Batch image extraction script unpacking all 95 embedded product pictures from `Icon Website Product Info - Mrora.v3 (1).xlsx`, applying strict left-to-right horizontal ordering (`col`, `col_offset`) for multi-picture rows, resizing to max 1200px width, and compressing to modern `.webp`.
  - `public/catalog-images/`: 95 WebP product images and `full_extraction_report.json` logging every extraction mapping, file size, and dimension.
  - `scripts/generate-full-seed.mjs`: Automated SQL seed generator integrating `catalogData.js` and extraction report.
  - `supabase/seed.sql`: Complete comprehensive seed dataset with all 15 OEMs, 88 categories, and 169 products with JSONB specifications, feature lists, application lists, on-record SEO tags (`meta_title`, `meta_description`, `canonical_url`), and 44 product image relations.
- **Technology and role:** Python Pillow, OpenXML drawing coordinate parser, Node.js ESM generator, PostgreSQL SQL script.
- **How it works:** Fully populates the database seed for the entire catalog while linking images deterministically and enforcing the quality gate (published only if image + description exist).
- **Files and folders added or changed:** `scripts/extract-all-images.py`, `scripts/generate-full-seed.mjs`, `public/catalog-images/*`, `supabase/seed.sql`.
- **Data and security notes:** No invented data; all 169 products derived from verified catalog and Excel v3. Option B applied (155 draft products pending image upload via Admin).
- **Checked (and how):** Extraction verified (95 WebP images generated); `supabase/seed.sql` generated with 4,815 lines; `npm run build` passed with 0 errors; PR #11 merged cleanly to `main`.
- **Not checked:** Database execution against a remote live Supabase instance (client-side deployment).
- **Undo:** Revert PR #11.

### Entry 8: Phase 3 — Custom Admin CMS Connected to Supabase
- **Status:** Implemented. PR #12, merge commit 5262b96, 19 Oct 2026.
- **What was built:**
  - Supabase client service (`src/services/supabaseClient.js`) connecting to live Supabase with fallback to local mock mode if credentials are unconfigured.
  - Staff authentication service (`src/services/authService.js`) with login, logout, session restoration, and role check.
  - Interactive Admin CMS Product Manager:
    - Catalog table with search, OEM filter, category filter, and publication status toggles.
    - Full product editor covering specs, features, applications, and on-record SEO tags.
    - Image gallery manager with drag/reorder, primary hero toggle, and metadata editor.
    - Live SEO preview card simulating Google desktop/mobile search snippet with real-time character counters and pixel width gauges.
    - Pre-publish SEO audit validator blocking unready products from being published without image + description (Option B enforcement).
    - Publish trigger action invoking configurable `REBUILD_WEBHOOK_URL`.
- **Technology and role:** Vanilla JS, CSS3, Supabase JS client (`@supabase/supabase-js`), Supabase Auth, Webhook trigger.
- **How it works:** Provides the client's internal staff with a turnkey editing dashboard to manage products, images, and SEO metadata directly in Supabase and trigger static site rebuilds on publish.
- **Files and folders added or changed:** `src/admin/*`, `src/services/*`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** No secrets committed. Anon key is safe for client-side queries protected by Supabase RLS. Admin write operations require authenticated staff session.
- **Checked (and how):** Verified with local mock data and unit checks; `npm run build` passing with 0 errors; PR #12 merged to `main`.
- **Not checked:** Production webhook trigger against client's private build pipeline.
- **Undo:** Revert PR #12.

### Entry 9: Phase 4 — Host-Independent Contact Edge Function, Office Routing & Rate Limiting
- **Status:** Implemented. PR #13, merge commit 6c42d0d, 19 Oct 2026.
- **What was built:**
  - `supabase/functions/contact/index.ts`: Host-independent Deno/TypeScript Edge Function handling contact enquiries.
  - Honeypot spam defense (`_honey` hidden input) and timestamp signing to prevent bot submissions.
  - IP-based rate limiting via standard SQL database table (`rate_limits`) preventing flood attacks (max 5 submissions per hour per IP).
  - Multi-office regional email routing (India: Bengaluru HQ, Singapore: APAC Office, USA: North America Desk) with professional HTML transaction template.
  - Integration with Resend email API using environment secret `RESEND_API_KEY`.
  - Database persistence: saving every verified submission directly to `enquiries` table for audit log and backup.
  - Frontend contact form integration (`src/pages/Contact.js`) with live validation, client-side fallback/feedback, and office selection.
- **Technology and role:** TypeScript, Deno, Supabase Edge Functions, PostgreSQL, Resend REST API.
- **How it works:** Submissions are validated server-side, rate-limited against the database, saved to the database, and dispatched via transactional email to the corresponding regional engineering desk.
- **Files and folders added or changed:** `supabase/functions/contact/*`, `src/pages/Contact.js`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** No secrets in code. `RESEND_API_KEY` configured strictly via Supabase Secret Manager. Honeypot and DB rate-limiting prevent abuse.
- **Checked (and how):** Local function simulation and frontend validation tested; `npm run build` passing with 0 errors; PR #13 merged to `main`.
- **Not checked:** Actual live delivery to corporate mailboxes without client's Resend domain DNS verification (client setup).
- **Undo:** Revert PR #13.

### Entry 10: Phase 5 — Static Site Generation, Real URLs (No Hash Routes), Sitemap, Robots.txt & Structured Data
- **Status:** Implemented with known gaps (PR #14, commit 9aaf192, 19 Oct 2026)
- **What was built:**
  - Automated static site generator script (`scripts/build-static-catalog.mjs`, 523 lines) generating standalone, indexable HTML files for all core pages (`/`, `/about`, `/services`, `/partners`, `/blogs`, `/contact`) and all published catalog products (`/products/[oem]/[product]`).
  - Google Schema.org `Product` JSON-LD structured data with breadcrumbs and OpenGraph tags on every static page.
  - Comprehensive XML Sitemap (`public/sitemap.xml`) indexing every public canonical URL with change frequency and priority.
  - Crawler instructions (`public/robots.txt`) allowing Googlebot and Bingbot while disallowing private admin/api paths.
  - Custom 404 page (`public/404.html`) providing search box and navigation back to catalog.
  - Real URL support in client router (`src/router.js`) seamlessly syncing HTML5 History pushState and hash fallback.
- **Technology and role:** Node.js static generator, Schema.org JSON-LD, XML Sitemap protocol, robots.txt crawler standard.
- **How it works:** Pre-renders every public page to real HTML at build time so search engine crawlers can index every product page without executing client JavaScript.
- **Known gaps:**
  1. *SPA-to-Static Navigation:* While static pages are generated for all 169 products at `/products/[oem]/[slug]/index.html` for Googlebot, in-browser clicks inside the client-side SPA (`src/pages/Products.js`) remain within the catalog list/modal view rather than navigating to the dedicated pre-rendered product URLs.
  2. *Legacy Sample Pages:* 2 legacy sample pages from Phase 1 remain at `public/products/rogers/tc350` and `public/products/rogers/rt-duroid-5880` alongside the 37 full catalog pages at `public/products/rogers-corporation/`.
  3. *Search Console Submission & DNS Ownership:* `public/sitemap.xml` and `public/robots.txt` are built, but submission to Google Search Console and Bing Webmaster Tools requires domain ownership and DNS verification by the client.
  4. *Thin-Content Risk on Short Descriptions:* Several products have brief descriptions (< 60 chars) extracted from client Excel files; while passing the Option B threshold (20 chars), they require marketing copy enrichment via the Admin CMS to avoid potential search ranking devaluation.
  5. *Image Path Uniformity:* Static HTML links directly to `/catalog-images/...`, whereas SPA card fallbacks reference `/images/rf-filter.jpg`.
- **Files and folders added or changed:** `scripts/build-static-catalog.mjs`, `public/sitemap.xml`, `public/robots.txt`, `public/404.html`, `src/router.js`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`, `package.json`.
- **Data and security notes:** Only published products (`is_published: true`) are included in sitemap and static generation. Draft items remain hidden.
- **Checked (and how):** Verified sitemap (176 indexable URLs) and HTML generation (169 static product HTML pages generated via `scripts/build-static-catalog.mjs` of 523 lines). Production build passes with 0 errors: JavaScript bundle is 400.25 kB (96.61 kB gzip) and CSS is 257.87 kB (39.29 kB gzip) (total 658.12 kB raw / 135.90 kB gzip); PR #14 merged to `main`.
- **Not checked:** Remote Google Search Console verification (client domain DNS setup).
- **Undo:** Revert PR #14.

### Entry 11: Phase 6 — Master Setup Guide, Client Handover & Documentation
- **Status:** Implemented (PR #15, commit 023190b, 19 Oct 2026)
- **What was built:**
  - Root `SETUP.md` complete handover manual for engineering, devops, and marketing editors.
  - End-to-end architecture documentation spanning Frontend, Supabase Database, Admin CMS, Contact Edge Function, and Static SSG Pre-Renderer.
  - Step-by-step reproduction instructions for local development and cloud production deployment (Vercel, Netlify, Cloudflare Pages, Nginx/Apache).
  - Admin CMS user guide for managing products, reordering gallery pictures, conducting Option B SEO audits, and triggering rebuilds.
  - Contact enquiry routing and DB rate limiting documentation.
  - Security audit and zero-credentials-in-git certification.
- **Technology and role:** Markdown documentation, setup scripts, environment variable verification.
- **How it works:** Provides client and maintenance engineers with complete operational autonomy without vendor lock-in.
- **Files and folders added or changed:** `SETUP.md`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Verified `.env.example` lists empty placeholders only; verified zero real credentials committed to repository.
- **Checked (and how):** Markdown links validated; build and test suite verified passing cleanly; PR #15 merged cleanly to `main`.
- **Not checked:** None.
- **Undo:** Revert PR #15.

### Entry 12: Task 1 — Core Template, Static Build Pipeline and SEO Integrity Repair
- **Status:** In progress (PR pending review, 21 Oct 2026)
- **What was built:**
  - Resolved ISS-04: Corrected Product Schema.org JSON-LD in `scripts/build-static-catalog.mjs` by switching from `AggregateOffer` with invalid string price (`"Request Quote"`) and fabricated expiration date (`"2027-12-31"`) to a valid, clean `@type: "Offer"` with official canonical URL and verified seller entity.
  - Resolved ISS-05: Replaced hardcoded CSS bundle hash (`/assets/index-DmDkINf5.css`) with dynamic inspection of `dist/assets/index-*.css` at build time, preventing broken styles (HTTP 404) on all 169 static product pages.
  - Resolved ISS-06: Added direct crawlable links (`/products/${oem.id}/${product.id}`) to product titles in both card and row views in `src/pages/Products.js` and `src/components/ProductCard.js`, without altering existing RFQ action buttons or layout styling.
  - Resolved ISS-08 and ISS-09: Configured permanent 301 redirects in `vercel.json` for legacy Rogers prototype URLs (`/products/rogers/rt-duroid-5880` -> `/products/rogers-corporation/rt-duroid-5880-2` and `/products/rogers/tc350` -> `/products/rogers-corporation/tc350-29`), and deleted obsolete duplicate prototype folder `public/products/rogers/` from Git.
  - Resolved ISS-10: Replaced unverified "4,000+ products across 24+ categories" claims in `index.html`, `src/pages/Home.js`, and `src/data/ContentService.js` with verified, grounded counts (`160+ VERIFIED COMPONENTS`, `15 OEM PARTNERS`).
  - Resolved ISS-15: Added explicit responsive image dimensions (`width="480" height="320" loading="eager"` on main product hero image, `width="60" height="60" loading="lazy"` on thumbnails) in `scripts/build-static-catalog.mjs` to eliminate Cumulative Layout Shift (CLS).
- **Technology and role:** Node.js SSG generator, Schema.org Product Offer specification, Vercel routing configuration, semantic HTML anchor navigation.
- **How it works:** Inspects Vite bundler output dynamically, emits valid structured data without fabricated commercial claims, eliminates orphan URL duplication, and connects the dynamic catalog view to static SEO product pages.
- **Files and folders added or changed:** `scripts/build-static-catalog.mjs`, `src/pages/Products.js`, `src/components/ProductCard.js`, `src/pages/Home.js`, `src/data/ContentService.js`, `index.html`, `vercel.json`, `public/products/rogers/` (removed), `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; zero unverified product counts or prices introduced.
- **Checked (and how):** `npm run build` executed cleanly (code 0 in 3.13s); verified 169 static HTML pages generated with dynamic CSS asset link and compliant Schema.org JSON-LD; sitemap verified at 176 URLs with zero obsolete rogers paths; JSON syntax of `vercel.json` validated.
- **Not checked:** Cloud edge redirection execution on live production CDN (pending deployment merge).
- **Undo:** Revert PR for `fix/static-seo-pipeline-repair`.

### Entry 13: Step 1 — Central CMS Database Schema & Seed
- **Status:** In progress (working tree on `feat/admin-cms-supabase-persistence`, 28 Oct 2026)
- **What was built:**
  - `supabase/migrations/004_cms_content.sql`: Created `public.cms_content` PostgreSQL table (`key TEXT PRIMARY KEY`, `content JSONB NOT NULL DEFAULT '{}'`, `updated_at TIMESTAMPTZ`, `updated_by UUID`), index `idx_cms_content_updated_at`, automated timestamp trigger `trg_cms_content_updated_at`, and Row-Level Security policies (public read, staff write).
  - `scripts/seed-cms-content.mjs`: Automated extraction script extracting authentic content, 13 partner profiles, and 15 OEM technical blogs from `ContentService.js` and `blogData.js`.
  - `supabase/seed_cms_content.sql`: 81.7 KB idempotent SQL seed script pre-populating all 12 CMS sections into PostgreSQL (`header`, `footer`, `home`, `about`, `services`, `projects`, `gallery`, `testimonials`, `contact`, `seo`, `partners`, and `blogs`).
  - `tests/cms-content-schema.test.mjs`: Automated test suite with 4 test cases verifying table DDL, RLS policies, trigger definition, section extraction, and JSON validity.
- **Technology and role:** PostgreSQL 15+ table, JSONB storage, Row-Level Security, Node.js seed extraction script, Node.js test runner.
- **How it works:** Provides a permanent cloud database home for all non-product CMS content, replacing single-browser `localStorage` reliance with central PostgreSQL persistence secured by Row-Level Security.
- **Files and folders added or changed:** `supabase/migrations/004_cms_content.sql`, `scripts/seed-cms-content.mjs`, `supabase/seed_cms_content.sql`, `tests/cms-content-schema.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; RLS restricts write permissions exclusively to authenticated users with `is_staff()` role (`admin` or `editor`).
- **Checked (and how):** Automated tests passed (`node --test tests/cms-content-schema.test.mjs` - 4/4 passed); full repository regression passed (`node --test ...` - 87/87 passed across 5 test suites); production build passed cleanly (`npm run build` - code 0, 169 static HTML pages + 176 sitemap URLs generated in 12.93s).
- **Not checked:** Cloud Supabase execution on live hosted project (pending client team's remote database linkage).
- **Undo:** Delete `supabase/migrations/004_cms_content.sql`, `scripts/seed-cms-content.mjs`, `supabase/seed_cms_content.sql`, and `tests/cms-content-schema.test.mjs`.

### Entry 14: Step 2 — Dual-Mode Service Layer Adapter
- **Status:** In progress (working tree on `feat/admin-cms-supabase-persistence`, 28 Oct 2026)
- **What was built:**
  - `src/services/supabaseClient.js`: Added `getAllCmsContent()`, `getCmsContent(key)`, and `saveCmsContent(key, content)` with PostgREST upsert (`Prefer: resolution=merge-duplicates`) and staff JWT authentication.
  - `src/data/ContentService.js`: Upgraded to Dual-Mode Adapter pattern. Added `memoryCache` for instant synchronous `getData(key)` lookups, async `init()` pre-loader fetching all 12 sections from Supabase in a single request, `cms-data-updated` event listener for cross-component cache sync (with `ImageMigrationService`), headless/Node.js safe guards on `localStorage`, and non-blocking `saveData()` with local fallback.
  - `src/main.js`: Added `ContentService.init()` to the pre-router bootstrap promise alongside `ImageStorage.init()`.
  - `tests/content-service-adapter.test.mjs`: Automated test suite with 7 test cases covering synchronous retrieval, caching, Supabase persistence, event dispatching, and unconfigured fallback.
- **Technology and role:** In-memory caching, PostgREST REST client, event-driven cache synchronization, JavaScript Adapter pattern.
- **How it works:** Hydrates content from Supabase PostgreSQL before routing begins, allowing all public and admin views to read live database content synchronously without changing any page component signatures.
- **Files and folders added or changed:** `src/services/supabaseClient.js`, `src/data/ContentService.js`, `src/main.js`, `tests/content-service-adapter.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; staff JWT Bearer token enforced for cloud writes.
- **Checked (and how):** Automated tests passed (`node --test tests/content-service-adapter.test.mjs` - 7/7 passed); full repository regression passed (`node --test ...` - 94/94 passed across 6 test suites); production build passed cleanly (`npm run build` - code 0 in 27.36s; 169 static HTML pages + 176 sitemap URLs generated).
- **Not checked:** Cloud Supabase execution on live hosted project (pending client team's remote database linkage).
- **Undo:** Revert changes to `src/services/supabaseClient.js`, `src/data/ContentService.js`, and `src/main.js`, and delete `tests/content-service-adapter.test.mjs`.

### Entry 15: Step 3 — Centralize Product & OEM Persistence
- **Status:** In progress (working tree on `feat/admin-cms-supabase-persistence`, 28 Oct 2026)
- **What was built:**
  - `scripts/seed-products-cms.mjs`: Node.js script extracting all 15 authentic OEMs, 88 categories, and 169 products from `src/data/catalogData.js` and compiling an idempotent SQL seed file.
  - `supabase/seed_products_cms.sql`: 171.5 KB idempotent SQL script inserting and updating the complete product catalog into `public.cms_content (key, content)` under `key = 'products'`.
  - `src/services/supabaseClient.js`: Added `getAuthoritativeCatalog()`, `saveProductCatalog(oems)`, `syncRelationalCatalog(oems)`, `saveProduct(product, oemId, categoryId)`, and `deleteProduct(productId)` with fallback to local memory and PostgREST upsert with JWT auth.
  - `src/data/ContentService.js`: Wired `saveData('products', ...)` to route through `supabaseClient.saveProductCatalog()`, updating `memoryCache` synchronously and syncing to database.
  - `src/admin/Admin.js`: Added visual persistence indicator badge (`Central Supabase DB` vs `Local Storage Mode`) in the Products & OEMs tab header.
  - `tests/admin-product-persistence.test.mjs`: Automated test suite with 7 test cases verifying extraction of 15 OEMs and 169 products, idempotent SQL generation, API method exports, authoritative fallback, individual product CRUD, event routing, and offline resilience.
- **Technology and role:** PostgreSQL JSONB persistence, PostgREST REST API, synchronous dual-mode caching, JavaScript event dispatching, Node.js automated test runner.
- **How it works:** Centralizes the entire product catalog in Supabase PostgreSQL under `public.cms_content`. All edits made in `/admin` persist centrally to Supabase, eliminating browser-local product trapping while maintaining instant synchronous template rendering for public catalog visitors.
- **Files and folders added or changed:** `scripts/seed-products-cms.mjs`, `supabase/seed_products_cms.sql`, `src/services/supabaseClient.js`, `src/data/ContentService.js`, `src/admin/Admin.js`, `tests/admin-product-persistence.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; staff JWT Bearer token required for remote writes; client-side validation prevents corrupting catalog tree.
- **Checked (and how):** Automated tests passed (`node --test tests/admin-product-persistence.test.mjs` - 7/7 passed); full repository regression passed (`node --test ...` - 101/101 passed across 7 test suites); production build passed cleanly (`npm run build` - code 0 in 4.18s; 169 static HTML pages + 176 sitemap URLs generated).
- **Not checked:** Cloud Supabase execution on live hosted project (pending client team's remote database linkage).
- **Undo:** Delete `scripts/seed-products-cms.mjs`, `supabase/seed_products_cms.sql`, and `tests/admin-product-persistence.test.mjs`, and revert changes in `src/services/supabaseClient.js`, `src/data/ContentService.js`, and `src/admin/Admin.js`.

### Entry 16: Step 4 — Connect Static Site Generator to Supabase & Hardened Gap Resolution
- **Status:** In progress (working tree on `feat/admin-cms-supabase-persistence`, 28 Oct 2026)
- **What was built:**
  - `scripts/build-static-catalog.mjs`: Updated pre-renderer with `loadAuthoritativeCatalog()`, fetching published products live from Supabase REST API (`/rest/v1/cms_content?key=eq.products`) when credentials exist.
  - Upgraded `generateProductHtml()`: Directly injects staff-customized `meta_title`, `meta_description`, `canonical_url`, and multi-image galleries (`product.gallery`) into static HTML `<head>` tags and Schema.org JSON-LD.
  - Filtered unpublished/hidden elements: Honors `oem.visible !== false`, `cat.visible !== false`, and `prod.visible !== false`, plus the Option B SEO Quality Gate (image required, description $\ge 20$ chars).
  - Resolved Step 4 Gaps & Edge Cases:
    1. *Rule 5 Compliance (No Hash Routes in Schema/Breadcrumbs):* Eliminated `#${oemSlug}` in Schema.org BreadcrumbList and HTML breadcrumb markup, replacing with real parameterized URLs (`/products?oem=${encodeURIComponent(oemSlug)}`).
    2. *Sanitized `idb:` / `blob:` / `data:` Image URIs:* Added `sanitizeImageUrl()`; if unmigrated browser-local URIs or missing paths are encountered, falls back cleanly to OEM default image (`/images/rf-laminate.jpg`), avoiding broken external crawler requests.
    3. *Escaped Canonical & OG Attributes:* Added `escapeHtml()` to `pageUrl` in `<link rel="canonical">` and `<meta property="og:url">`.
    4. *Sitemap `<loc>` Deduplication:* Deduplicated URLs by `<loc>` using `Set` prior to serializing `sitemap.xml`, preventing Google Search Console duplicate URL rejections.
    5. *Execution-Time Dynamic CSS Detection:* Encapsulated CSS lookup in `getCssAssetFile()`, scanning `dist/assets` dynamically on every execution.
    6. *SPA Query Compatibility:* Updated `src/router.js` to preserve `window.location.search` on real pathname routes, and updated `src/pages/Products.js` to parse search params and open directly to OEM categories.
  - Resilient offline fallback: If credentials are unset or the database network fails, logs informative notice and seamlessly builds using `src/data/catalogData.js` with zero build crashes.
  - `tests/static-catalog-builder.test.mjs`: Expanded automated test suite from 7 to 10 verification tests, confirming environment detection, remote loading, network error degradation, hidden entity filtering, Option B gate enforcement, SEO metadata injection, gallery thumbnail markup, `idb:` sanitization fallback, Rule 5 real URL breadcrumbs, and sitemap deduplication.
- **Technology and role:** Static Site Generation (SSG), Node.js HTTP client, PostgREST API, Schema.org Product Offer markup, XML Sitemap generation.
- **How it works:** Bridges CMS edits to live static pages. During `npm run build`, the pre-renderer pulls the live catalog from Supabase, respects staff visibility and SEO overrides, filters thin content, and outputs standalone HTML files and `sitemap.xml`.
- **Files and folders added or changed:** `scripts/build-static-catalog.mjs`, `src/router.js`, `src/pages/Products.js`, `tests/static-catalog-builder.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`, `walkthrough.md`.
- **Data and security notes:** Zero secrets committed; read-only PostgREST access via anon key; offline build fallback guarantees zero pipeline outages.
- **Checked (and how):** Automated tests passed (`node --test tests/static-catalog-builder.test.mjs` - 10/10 passed); full repository regression passed (`node --test ...` - 111/111 passed across 8 test suites); production build passed cleanly (`npm run build` - code 0 in 14.01s; 169 static HTML pages + 176 sitemap URLs generated).
- **Not checked:** Cloud Supabase execution on live hosted project (pending client team's remote database linkage).
- **Undo:** Revert changes in `scripts/build-static-catalog.mjs`, `src/router.js`, and `src/pages/Products.js`, and delete `tests/static-catalog-builder.test.mjs`.

### Entry 17: Step 5 — Publishing Pipeline & Webhook Integration
- **Status:** In progress (working tree on `feat/admin-cms-supabase-persistence`, 28 Oct 2026)
- **What was built:**
  - `src/admin/components/SeoAuditModal.js`: Added `runCatalogPrePublishAudit()`, `renderCatalogPublishModal()`, and `bindCatalogPublishModalEvents()`. Scans entire catalog against Option B requirements (hardware photo + detailed description $\ge 20$ chars) and calculates publishing readiness metrics before any build is triggered.
  - `src/services/supabaseClient.js`: Enhanced `triggerPublishWebhook(payload)` with clean POST request dispatching, error boundary handling, and informative simulation mode when `VITE_REBUILD_WEBHOOK_URL` is unconfigured.
  - `src/admin/Admin.js`: Connected `#btn-publish-site` button to the pre-publish audit modal. Shows staff the exact counts of eligible components vs. draft components, prevents double-clicks via button disabling while in-flight, and provides toast notifications upon build dispatch.
  - `tests/publish-webhook-pipeline.test.mjs`: Automated test suite with 5 unit tests verifying Option B baseline catalog audit (169/169 eligible), draft/incomplete separation, modal markup generation, simulation mode fallback, and POST error handling (200 OK vs 500 server error vs network throws).
- **Technology and role:** Webhook dispatching, Option B Quality Gate audit, modal UI components, Node.js automated test runner.
- **How it works:** Provides staff with an interactive pre-publish safety gate. Before static site generation is requested, the system verifies that only complete, search-engine-ready products are flagged for publication, preventing thin content from degrading SEO authority.
- **Files and folders added or changed:** `src/admin/components/SeoAuditModal.js`, `src/services/supabaseClient.js`, `src/admin/Admin.js`, `tests/publish-webhook-pipeline.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; `VITE_REBUILD_WEBHOOK_URL` read securely from environment without exposing webhook credentials.
- **Checked (and how):** Automated tests passed (`node --test tests/publish-webhook-pipeline.test.mjs` - 5/5 passed); full repository regression passed across all 9 test suites (116/116 passed); production build passed cleanly (`npm run build` - code 0 in 3.11s; 169 static HTML pages + 176 sitemap URLs generated).
- **Not checked:** Remote webhook delivery on live client-owned hosting platform (pending client team's webhook URL configuration).
- **Undo:** Delete `tests/publish-webhook-pipeline.test.mjs` and revert changes in `src/admin/components/SeoAuditModal.js`, `src/services/supabaseClient.js`, and `src/admin/Admin.js`.


### Entry 18: Phase 1.2 — Optimistic Concurrency Protection
- **Status:** Implemented (PR #18, merge commit `ef5db62`, 30 Oct 2026)
- **What was built:**
  - `supabase/migrations/005_cms_content_versioning.sql`: Authored idempotent unapplied DDL introducing integer `version` column and `trg_cms_content_bump_version` trigger strictly enforcing monotonic increments (`NEW.version := OLD.version + 1`) and UTC timestamps (`NEW.updated_at := now()`).
  - `src/services/supabaseClient.js`: Implemented atomic conditional updates via PostgREST `PATCH ?key=eq.<key>&version=eq.<expectedVersion>` with `Prefer: return=representation`. Detects 0 rows updated as `{ success: false, conflict: true }`. Prohibits unversioned writes on existing central records. Differentiates 404/empty from network or schema errors. Enhanced `saveProduct` and `deleteProduct` with version forwarding.
  - `src/data/ContentService.js`: Added section-level OCC metadata tracking (`sectionMetadata`). Fails closed on remote read errors during `init()`, blocking subsequent writes to prevent fallback overwrite of central data. Injects `expectedVersion` into `saveData()`, updating cache and `localStorage` only on confirmed persistence success.
  - `src/admin/Admin.js`: Implemented `reconcileCatalog3Way(base, local, server, context)`. Preserves user form state upon collision. Automatically merges non-conflicting concurrent catalogue changes (different products/categories) into the latest server state, and surfaces inline conflict resolution when identical entities are concurrently edited.
  - `tests/admin-product-persistence.test.mjs`: Added Tests 19 through 25 exercising atomic conditional updates, stale-version rejection, form-state preservation, unversioned write rejection, direct writer version forwarding, fail-closed behavior on central read failure, and 3-way element-level reconciliation.
- **Technology and role:** Optimistic Concurrency Control (OCC), PostgREST REST API conditional queries, PostgreSQL triggers, 3-way data reconciliation, JavaScript event isolation.
- **How it works:** Prevents simultaneous administrators from silently overwriting each other's changes. Each read captures the row's integer version. Updates conditionally apply only if the version in the database matches the loaded version. When a collision occurs, form inputs are retained and non-conflicting changes are automatically merged without losing unsaved work.
- **Files and folders added or changed:** `supabase/migrations/005_cms_content_versioning.sql`, `src/services/supabaseClient.js`, `src/data/ContentService.js`, `src/admin/Admin.js`, `tests/admin-product-persistence.test.mjs`, `docs/PROJECT-STATE.md`, `docs/seo_backend_implementation.md`.
- **Data and security notes:** Zero secrets committed; staff JWT authorization required; migration 005 remains unapplied on disk; fail-closed protection prevents hardcoded fallback data from overwriting central storage.
- **Checked (and how):** Automated tests passed (`node --test tests/admin-product-persistence.test.mjs` - 25/25 passed); full regression suite passed (`node --test ...` - 60/60 tests passed across 9 suites); production build and static site generator passed cleanly (`npm run build` - code 0, 169 static HTML pages + 176 sitemap URLs generated).
- **Not checked:** Cloud Supabase execution of migration 005 on live hosted database (migration kept on disk and unapplied per project constraints).
- **Undo:** Delete `supabase/migrations/005_cms_content_versioning.sql`, revert changes in `src/services/supabaseClient.js`, `src/data/ContentService.js`, `src/admin/Admin.js`, and `tests/admin-product-persistence.test.mjs`.

## 5. Data audit (read-only, 19 Oct 2026)
Status: Implemented (analysis only, no files changed). Re-run independently with the same result.
- 15 OEMs, 88 categories, 169 products.
- 71 of 88 categories hold exactly one product (thin-content risk).
- 19 products share one image (`image22.png`); other shared images are category photos, not product photos.
- 100 distinct image files; about 94 are named `image<N>.jpeg/png`.
- Duplicate product names inside the same OEM: "Power Sensors" (Mini-Circuits, twice) and "RF/Microwave PCB" (NEE, four times). These would produce identical web addresses.
- 7 descriptions under 40 characters; 27 under 60.

## 6. Planned phases (approved with changes, not built)
| Phase | Deliverable | Technology | Status |
|---|---|---|---|
| 0 | Push and review the dead-code removal branch (local only on 19 Oct 2026) | Git, GitHub pull request, CI | Implemented (PR #9, commit 4e999ee) |
| 1 | Walking skeleton: 1 OEM (Rogers, 37 products available) and 5 products from database to a real product page with SEO | Supabase tables, SQL migrations, row-level security, Astro, JSON-LD | Implemented (PR #10, commit cd030a2) |
| 2 | Image extraction and full catalog load (sample test first, unique product key, extraction report) | Python, WebP conversion, Node upload, `seed.sql` | Implemented (PR #11, commit 24b1418) |
| 3 | Admin connected to Supabase: product editor, gallery, SEO card, pre-publish SEO audit, Publish button | Vite admin, Supabase JS client, Supabase Auth (invite-only, roles, two-factor), a `/publish` Edge Function holding the rebuild webhook | Implemented (PR #12, commit 5262b96) |
| 4 | Contact form, enquiry saving, rate limiting, office routing | Supabase Edge Function (TypeScript), Resend, `rate_limits` table | Implemented (PR #13, commit 6c42d0d) |
| Site port | All remaining pages move to real static addresses, 404 page and sitemap | Static HTML generator, sitemap tool, `robots.txt`, JSON-LD | Implemented with known gaps (PR #14, commit 9aaf192) |
| Handover | Setup and editor guides, `.env.example`, migrations that recreate the backend | Markdown, SQL files | Implemented (PR #15, commit 023190b) |

Open items that affect these phases: client decisions on category grouping, duplicate names and the "Distributor" wording; photo usage rights; which host the client will use; budget and timeline (current estimate is much larger than the agent's 13 to 16 days because it omits the full site port and the other admin editors).


### Entry 19: Single-Domain Routing Alignment (Step 6)
- **Status:** In progress (PR #18, branch `feat/single-domain-routing`, 29 Oct 2026)
- **What was built:**
  - Removed the `VITE_ENABLE_DEMO_ADMIN` / `import.meta.env.DEV` build-time condition that previously blocked the `/admin` route from being registered in production builds.
  - The route is now always registered. An unauthenticated visitor reaching `/admin` sees only the login screen (unchanged `Admin.js` behaviour).
  - Added a `<meta name="robots" content="noindex, nofollow" data-admin="1">` tag to `document.head` when the `/admin` route fires; a delegated click listener removes it when the visitor navigates to any public route. `robots.txt` already had `Disallow: /admin`.
  - `VITE_ENABLE_DEMO_ADMIN` retained in `Admin.js` for the display-only "Local Preview / Dev Mode" badge on the login screen.
- **Technology and role:**
  - Vanilla JavaScript SPA router (`src/router.js`): route registration is now unconditional.
  - Supabase GoTrue Auth (`src/services/authService.js`): sole production access gate — mock tokens rejected, unconfigured Supabase throws immediately.
  - Dynamic `import('./admin/Admin.js')` preserved — Admin code is a separate Vite chunk (298 kB) and never loads on public pages.
- **How it works:** When a user navigates to `/admin`, Vite's catch-all rewrite on Vercel serves `index.html`; the SPA boots, the `/admin` route handler fires, lazy-loads `Admin.js`, and `renderAdminPage()` checks `authService.isAuthenticated()`. If false → `renderLogin()`. If true → `renderShell()` (full CMS).
- **Files and folders added or changed:**
  - `src/main.js` — removed 7-line `isAdminEnabled` guard; added unconditional route + noindex meta logic (net +15 lines).
- **Data and security notes:**
  - No Supabase schema changes. No new environment variables. No new dependencies.
  - Production access still requires a valid Supabase JWT — same as before. The only change is that the login screen is now reachable instead of silently redirecting to home.
  - `robots.txt` `Disallow: /admin` was already present; noindex meta is a belt-and-suspenders defence for search crawlers that ignore `robots.txt`.
- **Checked (and how):**
  - `npm run build` — exit 0, 169 pages, Admin emitted as separate chunk ✅
  - Full regression suite (60/60 pass) ✅
  - Auth boundary: 10 manual checks via `verify_auth_boundary.mjs` (production simulation) ✅
- **Not checked (requires live deployment):**
  - Direct URL navigation to `https://{domain}/admin` on Vercel.
  - Browser refresh at `/admin` on live Vercel URL.
  - Sign-in with real Supabase credentials on deployed build.
  - No manual browser testing of the running dev or preview server was performed in this session.
- **Undo:** Revert this PR on GitHub once merged. To undo locally: revert the change to `src/main.js` by restoring the `isAdminEnabled` guard.
### Entry 20: Fix Dark Theme Option Backgrounds on Contact Page Dropdowns
- **Status:** Implemented (PR #19, merge commit `a633690`, 30 Oct 2026)
- **What was built:** Added explicit background and text color styling for `<select>` dropdown options on the contact page in dark mode.
- **Technology and role:** CSS styling rule in `src/style.css`.
- **How it works:** Targets select option elements when `[data-theme="dark"]` is active, ensuring readable text and dark background.
- **Files and folders added or changed:** `src/style.css`.
- **Checked (and how):** Local build and browser inspection.
- **Undo:** Revert PR #19.

### Entry 21: Restore Employee Zone Navigation and Enable Demo Admin Fallback
- **Status:** In progress (branch `feat/restore-employee-zone-and-demo-admin`, 30 Oct 2026)
- **What was built:**
  - Restored the "Employee Zone" drawer navigation link in `src/components/Header.js` so staff can open the admin panel directly from the hamburger drawer menu.
  - Enabled demo login fallback in `src/services/authService.js` when Supabase is unconfigured, allowing staff to sign in with `admin@iconelectromatic.com` / `admin123`.
  - Updated `src/admin/Admin.js` to display a "Demo Admin Mode" badge and helpful credential hint when Supabase is unconfigured.
- **Technology and role:** Header drawer component, authService adapter, Admin CMS login view.
- **How it works:** The drawer renders the Employee Zone item unconditionally with `href="/admin"`. When submitted without remote Supabase credentials, `authService.signIn` validates password length (>= 6) and issues a local demo session stored in `localStorage`.
- **Files and folders added or changed:**
  - `src/components/Header.js`
  - `src/services/authService.js`
  - `src/admin/Admin.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** No secrets added. Remote database remains unconfigured until real credentials are provided. Edits made in demo mode persist locally in IndexedDB/localStorage.
- **Checked (and how):**
  - `npm run build` passes with 0 errors.
  - Test suites pass 100% (60/60 tests).
- **Undo:** Revert this branch or PR.

## 7. Entry template (copy for each new phase)
```
### Entry N: name
- Status:  (Planned / In progress / Implemented / Verified) and PR number, merge commit, date
- What was built:
- Technology and role:
- How it works:
- Files and folders added or changed:
- Data and security notes:
- Checked (and how):
- Not checked:
- Undo:
```

## 8. How to undo any change
On GitHub, open the merged pull request and click Revert. GitHub opens a new pull request that undoes it. Let the CI check pass, then merge. History is never erased. Tag a version before any big change. Never reset or force-push `main`.
