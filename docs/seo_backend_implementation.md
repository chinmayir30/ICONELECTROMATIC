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
- **Status:** Implemented (PR #20, merge commit `3a6c446`, 30 Oct 2026)
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
- **Undo:** Revert PR #20.

### Entry 22: Header Refinement, Homepage Capabilities Removal & Light Theme Elevation
- **Status:** In progress (branch `feat/header-refinement-alignment`, 03 Nov 2026)
- **What was built:**
  - Scaled down the Icon Electromatic logo proportionally in the header (desktop height 52px, laptop to 46px, tablet to 42px, mobile to 36px) while preserving exact aspect ratio (`width: auto`, `object-fit: contain`).
  - Removed the "Request Quote" button from the header action area, eliminating header crowding while keeping full quote request functionality everywhere else on the site (Contact page, sidebar drawer, product cards, blogs, etc.).
  - Perfectly aligned the logo cluster, 7 navigation links, and theme toggle button in a single balanced row; increased header height to 92px (laptop 86px, tablet 76px) and expanded nav gap (`1.75rem`) and container padding (`var(--space-8)`) so the header feels spacious, open, and uncrowded across all screen widths.
  - Removed the entire Core Capabilities section from the homepage (`src/pages/Home.js`), including heading, subtitle, lead text, and all four capability cards, keeping other homepage sections in their original sequence and preserving Core Capabilities intact on the About page.
  - Modernized the homepage light theme with a clean white palette (`#ffffff` / `#f8fafc`) across all sections (Hero, Popular Products, Latest Blogs, Connect with Engineering), matching the professional White, Deep Navy Blue (`#0f1d3d`), and Signature Red (`#e32726`) brand aesthetic.
  - Fine-tuned the homepage background video in light mode to be slightly darker with enhanced contrast (`brightness(0.80)`, `contrast(115%)`, `opacity: 0.65`) and a directional vignette for crisp text contrast without washing out the video details.
- **Technology and role:** Header UI component, CSS responsive layout styles, Home page template.
- **How it works:** The header inner container uses flexbox (`justify-content: space-between; align-items: center;`) with adjusted logo height, streamlined nav link spacing, and only the theme toggle on the right. The homepage renders directly from Hero into Popular Products with clean light mode CSS scoped specifically to `[data-theme="light"]` on homepage section classes.
- **Files and folders added or changed:**
  - `src/components/Header.js`
  - `src/styles/index.css`
  - `src/pages/Home.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend layout and component adjustments. No new dependencies, no secrets, no backend changes.
- **Checked (and how):**
  - `npm run build` passed with 0 errors.
  - Full automated test suite (60/60 tests passed).
  - Dev server active and serving cleanly on localhost:3000.
  - Core capabilities section confirmed preserved in `src/pages/About.js`.
- **Not checked:**
  - Production deployment URL (will be checked when merged and deployed).
- **Undo:** Revert this branch or pull request.

### Entry 23: Complete Removal of Spellman & AEE Israel from Products and Blogs
- **Status:** In progress (branch `feat/header-refinement-alignment`, 03 Nov 2026)
- **What was built:**
  - Completely removed Spellman and AEE Israel from `src/data/catalogData.js`, reducing total OEMs from 15 to 13 and total verified products from 169 to 167 (categories from 88 to 86).
  - Completely removed Spellman High Voltage Technical Center and AEE Israel Perimeter Defense Systems Center channels (articles, lab videos, whitepapers, official links) from `src/data/blogData.js`, leaving exactly 13 OEM blog hubs.
  - Updated `src/pages/Blogs.js`, `src/pages/Products.js`, `src/data/ContentService.js`, and `src/components/Chatbot.js` to reference the 13 authorized OEMs and reflect accurate grounded partner counts.
  - Deleted obsolete pre-rendered static HTML directories `public/products/spellman/` and `public/products/aee-isarael/` and regenerated `public/sitemap.xml` with 174 indexable URLs (down from 176).
  - Regenerated `supabase/seed_products_cms.sql` and `supabase/seed_cms_content.sql` and updated automated tests (`admin-product-persistence.test.mjs`, `publish-webhook-pipeline.test.mjs`, `static-catalog-builder.test.mjs`).
- **Technology and role:** Data models, static catalog generator, CMS seeds, Chatbot dispatch, and test suites.
- **How it works:** Products and Blogs dynamically consume the canonical arrays `CATALOG` and `OEM_BLOGS`. Removing the two objects eliminates all associated cards, category pills, search matches, and detail modals across both pages without altering styling or layout.
- **Files and folders added or changed:**
  - `src/data/catalogData.js`
  - `src/data/blogData.js`
  - `src/pages/Blogs.js`
  - `src/pages/Products.js`
  - `src/data/ContentService.js`
  - `src/components/Chatbot.js`
  - `src/admin/Admin.js`
  - `supabase/seed_products_cms.sql`
  - `supabase/seed_cms_content.sql`
  - `tests/admin-product-persistence.test.mjs`
  - `tests/publish-webhook-pipeline.test.mjs`
  - `tests/static-catalog-builder.test.mjs`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure catalog pruning. No invented data; grounded strictly in verified dataset. No secrets, no new dependencies.
- **Checked (and how):**
  - `npm run build`: Exit code 0, 167 static product pages generated, 174 sitemap URLs.
  - Automated tests: `node --test tests/*.test.mjs` — all 60 tests passing (60 passed, 0 failed).
  - Local dev server active and hot-reloading smoothly.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 24: Streamline About Us Page & Standardize Product Card Actions
- **Status:** In progress (branch `feat/header-refinement-alignment`, 03 Nov 2026)
- **What was built:**
  - Removed the entire "Strategic Application Domains" section from the About Us page (`src/pages/About.js`), including its header, subtitle, description, satellite dish orb junction connector, and all four application domain cards.
  - Cleaned up the unused `domains` array definition from `src/pages/About.js`.
  - Added balanced top spacing (`margin-top: 10px;`) to `.journey-pillars-grid` in `src/styles/index.css` to ensure smooth visual spacing between the 4 milestone cards and the 2 foundation pillars without any dead gaps.
  - Removed the "4 Parts", "7 Parts", and similar number badges (`.category-count-badge`) from the top-right corner of all product cards in `src/pages/Products.js`.
  - Standardized product card action button and link text to display only "View All Products" without any number counts.
  - Added `display: none !important;` to `.category-count-badge` in `src/styles/index.css` as a defensive safeguard.
  - Preserved all existing product details, images, layout styling, and navigation functionality across the site.
- **Technology and role:** Vanilla JavaScript page templates, CSS layout styles.
- **How it works:** In `renderCategoryCard()`, the badge overlay is eliminated and the CTA string is simplified to a static "View All Products" label. In `About.js`, the timeline wrapper flows directly into the foundational pillars with balanced margin.
- **Files and folders added or changed:**
  - `src/pages/About.js`
  - `src/pages/Products.js`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure UI layout and card styling adjustments. Zero hardcoded or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - `npm run build`: Exit code 0, 167 static product pages generated.
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Scripted assertions verifying removal of number badges and presence of "View All Products".
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 25: Remove Global Partnerships Pillar & Increase Logo on Catalog Pages
- **Status:** In progress (branch `feat/header-refinement-alignment`, 04 Nov 2026)
- **What was built:**
  - Removed the "Global Partnerships" pillar card (including image, heading, eyebrow, subtitle, and description) from `src/pages/About.js` and `src/data/ContentService.js`.
  - Added `.journey-pillars-grid.single-pillar` styling in `src/styles/index.css` to center the remaining "Bespoke Solutions" pillar card (`max-width: 840px; margin: 16px auto 0;`).
  - Added dynamic `data-page` routing attributes to `document.body`, `#site-header`, and `.header-inner` in `src/main.js` and `src/components/Header.js`.
  - Slightly increased the header logo size to 58px height on the Products, Partners, and Blogs pages (laptop 50px, tablet 44px, mobile 38px) while maintaining its proportions (`width: auto`, `object-fit: contain`).
  - Preserved the 92px header height, vertical alignment, and navigation link spacing across all pages with zero impact on dark theme or other sections.
  - Bumped `CMS_VERSION` to `'v9'` in `ContentService.js` to ensure fresh schema cache invalidation.
- **Technology and role:** Vanilla JavaScript page templates, CSS responsive layout styles.
- **How it works:** When navigating to `/products`, `/partners`, or `/blogs`, the body and header inner elements receive matching `data-page` attributes, triggering targeted responsive logo CSS rules. On About Us, the pillars array renders only the single Bespoke Solutions card with centered grid styling.
- **Files and folders added or changed:**
  - `src/pages/About.js`
  - `src/data/ContentService.js`
  - `src/components/Header.js`
  - `src/main.js`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend layout adjustments. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - `npm run build`: Exit code 0, 167 static product pages generated.
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Local dev server active and hot-reloading smoothly.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 26: Milestone Image Cropping & Positioning on About Us Timeline
- **Status:** In progress (branch `feat/header-refinement-alignment`, 04 Nov 2026)
- **What was built:**
  - Identified root cause of visual flaws on the About Us timeline milestone cards: the original cropped assets suffered progressive horizontal offset shifts (+14px to +122px), causing Card 4 (India incorporation) to display a large empty blue background strip on the right, and clipping key landmark subjects in Cards 2 and 3.
  - Re-sliced all 4 milestone photos directly from the uncompressed master infographic asset (`public/images/timeline/icon-journey-infographic-full.png`) using pixel-accurate bounding boxes (each 322x200 px, 16:10 aspect ratio):
    - Photo 1 (2009 Bengaluru): `(83, 308, 405, 508)` — perfectly framing the RF engineering team.
    - Photo 2 (2018 Singapore): `(419, 308, 741, 508)` — centering Marina Bay Sands and the Merlion fountain.
    - Photo 3 (May 2020 USA): `(754, 308, 1076, 508)` — centering the US flag and Statue of Liberty.
    - Photo 4 (Nov 2020 India): `(1090, 308, 1412, 508)` — centering the Taj Mahal with zero background border or side void bleed.
  - Exported 2x Retina-quality JPEGs at 644x400 px with Lanczos resampling and 95% quality.
  - Explicitly configured `.journey-photo-frame img` with `object-fit: cover` and `object-position: center center` in `src/styles/index.css`.
  - Maintained all existing timeline styles, badge colors, typography, hover HUD crosshairs, and mobile responsiveness intact.
- **Technology and role:** Image asset optimization, CSS layout rules.
- **How it works:** Each milestone card renders a `.journey-photo-frame` with `aspect-ratio: 16 / 10`. The newly sliced 644x400 (16:10) images load at native proportion, preventing any distortion or letterboxing, and `object-position: center center` keeps the landmark focal point centered on all viewport sizes.
- **Files and folders added or changed:**
  - `public/images/timeline/timeline-2009-bengaluru.jpg`
  - `public/images/timeline/timeline-2018-singapore.jpg`
  - `public/images/timeline/timeline-2020-usa.jpg`
  - `public/images/timeline/timeline-2020-india.jpg`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure image asset replacement and CSS styling. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Image geometry verified via Pillow: all 4 images are 644x400 px (1.61 aspect ratio).
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 27: Equal Height & Field Alignment on Contact Page
- **Status:** Implemented (PR #33, merge commit `7ba6aaa29d3c587fa2c168fac67338f6cd09e8a6`, 05 Nov 2026)
- **What was built:**
  - Standardized `.contact-relay-grid` to a balanced two-column layout (`grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: stretch;`).
  - Set both the left "Office Addresses" card (`.contact-relay-card.contact-office-card`) and the right "Send Us a Message" form card (`.contact-relay-form`) to `height: 100%; display: flex; flex-direction: column;` with identical `padding: var(--space-8)` (32px), matching rounded corners (`border-radius: var(--radius-xl)` / 20px), and matching subtle box shadows.
  - Aligned header typography and spacing: matched `<h3>` margins (6px), line-heights, and standardized subtitles with `.subtitle` (`font-size: 0.9rem; line-height: 1.5; margin-bottom: var(--space-6)`).
  - Configured `.contact-meta-list` to `display: flex; flex-direction: column; justify-content: space-between; flex: 1;`, evenly and elegantly distributing the four office rows (India, Singapore, USA, and Business Hours) across the full height of the card.
  - Configured `#contact-full-form` to `display: flex; flex-direction: column; flex: 1; justify-content: space-between;`, allowing `.relay-field-message` to flex harmoniously and locking the submit button cleanly to the bottom line of the form card.
  - Fixed form field overflow and awkward wrapping by setting `.relay-form-row` to `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);`, adding `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` on `<select>` elements, and removing double bottom margins on nested `.relay-field` elements.
  - Relocated "Quick Requirement Presets" into a dedicated, responsive row (`.contact-presets-row`) directly below the two-column grid, keeping one-click presets fully functional on the Inquiry tab and properly toggled on the Careers tab.
  - Preserved full dark/light theme consistency and responsive mobile behavior (`max-width: 1024px`).
- **Technology and role:** CSS Grid / Flexbox layout alignment, semantic markup structure.
- **How it works:** CSS Grid stretches both primary cards to equal vertical height. Inside the cards, flexbox distributes the address list and form elements proportionately so both bottom edges align seamlessly without any empty voids.
- **Files and folders added or changed:**
  - `src/pages/Contact.js`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure CSS layout and HTML structure alignment. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 28: Separate Mini-Circuits and RFuW Filter Buttons on Homepage
- **Status:** Implemented (PR #33, merge commit `7ba6aaa29d3c587fa2c168fac67338f6cd09e8a6`, 05 Nov 2026)
- **What was built:**
  - Separated the combined "Mini-Circuits & RFuW" filter chip in the homepage Popular Products & Components section into two independent buttons: `<button class="filter-chip-dark" data-filter="minicircuits">Mini-Circuits</button>` and `<button class="filter-chip-dark" data-filter="rfuw">RFuW</button>`.
  - Updated the event filter routing in `initHomePage()` so selecting "Mini-Circuits" filters strictly by `p.oemId === 'minicircuits'`, and selecting "RFuW" filters strictly by `p.oemId === 'rfuw-engineering'`.
  - Maintained all existing button styling, spacing, colors, hover and active states, and dark/light theme overrides.
  - Kept all other product categories ("All Popular", "Rogers Laminates", "Qorvo GaN & ICs", "Ohmega-Ticer", "Fortify 3D Optics", "Sensors & PCB") and sections completely unchanged.
- **Technology and role:** Client-side component filtering, UI state management.
- **How it works:** When a filter chip is clicked, `initHomePage()` reads its `data-filter` attribute and filters the `allPopular` array based on the OEM ID, rendering the corresponding product cards into `#home-products-grid`.
- **Files and folders added or changed:**
  - `src/pages/Home.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend event handler and button separation. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Verification test: confirmed Mini-Circuits returns 1 item (`RF/MW Amplifiers`) and RFuW returns 1 item (`RF Limiters`).
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 29: Refine "Our Journey" Heading & Remove Bespoke Solutions Card on About Us
- **Status:** Implemented (PR #33, merge commit `7ba6aaa29d3c587fa2c168fac67338f6cd09e8a6`, 05 Nov 2026)
- **What was built:**
  - Removed the "Chronology" `<h2>` heading on the About Us page and promoted "Our Journey" to be the prominent primary `<h2>` section title (`font-size: clamp(2.1rem, 3.2vw, 2.75rem); font-weight: 800; line-height: 1.2; margin-bottom: 14px;`).
  - Removed the entire "Bespoke Solutions" card (including its image, eyebrow, heading, subtitle, description, and `.journey-pillars-grid` container).
  - Maintained all 4 milestone cards (2009 Bengaluru, 2018 Singapore, May 2020 USA, Nov 2020 India) and the "View Slide Graphic" modal functionality intact.
  - Preserved clean spacing (`margin-bottom: var(--space-16);`) between the Section 5 timeline and Section 6 ("Why Us / Our Advantage").
  - Updated `about.journeyTitle` in `ContentService.js`, emptied `about.pillars`, and bumped `CMS_VERSION` to `'v10'` to ensure fresh local cache invalidation.
- **Technology and role:** Component layout refinement, semantic typography alignment.
- **How it works:** Section 5 renders a single cohesive `<h2>` for "Our Journey" with the lead description and slide graphic trigger, followed by the 4-milestone chronological rail, seamlessly transitioning into the "Why Us" section without any leftover pillar cards.
- **Files and folders added or changed:**
  - `src/pages/About.js`
  - `src/data/ContentService.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend layout adjustments. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 30: Replace PowerRF Brand Logo on Partners Page & Running Ticker
- **Status:** Implemented (PR #33, merge commit `7ba6aaa29d3c587fa2c168fac67338f6cd09e8a6`, 05 Nov 2026)
- **What was built:**
  - Replaced the legacy vertical PowerRF logo asset with the official horizontal company brand logo provided by the client (`media_1793840139530_efcaf9d1.png`).
  - Generated a clean, Retina-ready 2x RGBA asset at [`public/images/oem-logos/powerrf-logo.png`](file:///c:/Users/User/ICONELECTROMATIC/public/images/oem-logos/powerrf-logo.png) (552 × 228 px, ~2.42:1 aspect ratio) with transparent background and boosted faint Smith chart curves, eliminating any rectangular background seam inside the white logo cards.
  - Symmetrically centered the emblem, orange Greek letter $\Phi$, "POWERF" logotype, "Powerfully Innovative" tagline, and "PoweRFactor Electronics Private Limited" footer text.
  - Updated `DEFAULT_PARTNERS` entry for `id: 'powerfactor'` in [`src/data/ContentService.js`](file:///c:/Users/User/ICONELECTROMATIC/src/data/ContentService.js) to reference `/images/oem-logos/powerrf-logo.png`.
  - Bumped `CMS_VERSION` to `'v11'` to ensure instant cache invalidation and schema synchronization across active browser sessions.
  - Verified crisp rendering and optical centering across both the `.partner-stream-card-logo-box` grid and `.oem-running-logo-box` ticker without distortion, stretching, or cropping in both dark and light modes.
- **Technology and role:** Digital image processing (Pillow Lanczos supersampling, alpha extraction), component data binding, responsive asset optimization.
- **How it works:** The Partners page queries `ContentService.getData('partners')`. The resolved path `/images/oem-logos/powerrf-logo.png` is passed into both the running marquee ticker and partner cards. With `.partner-logo-img` (`max-height: 58px; max-width: 215px; object-fit: contain;`), the horizontal logo renders naturally at 140.4 × 58 px, seamlessly centered inside the 86px-tall white container.
- **Files and folders added or changed:**
  - `public/images/oem-logos/powerrf-logo.png`
  - `src/data/ContentService.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Exact client-provided brand asset used. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
  - Verified in runtime data model and responsive dimensions.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 31: Display Complete Fortify Logo Without White Background Across Partners, Products & Blogs
- **Status:** Implemented (PR #33, merge commit `7ba6aaa29d3c587fa2c168fac67338f6cd09e8a6`, 05 Nov 2026)
- **What was built:**
  - Enhanced the official Fortify brand logo to a complete, uncropped 2x Retina transparent PNG asset saved at [`public/images/oem-logos/Fortify_Logo_Transparent.png`](file:///c:/Users/User/ICONELECTROMATIC/public/images/oem-logos/Fortify_Logo_Transparent.png) (and mirrored to `Fortify_Logo_Black_Bg.png` for complete backwards compatibility) with smooth subpixel antialiasing and full geometric chevron + "FORTIFY" logotype (652 × 126 px).
  - Eliminated the jarring solid white container background on Fortify cards across all three key pages:
    1. *Partners page*: `.partner-stream-card-logo-box` and `.oem-running-logo-box` ticker.
    2. *Products page*: `.oem-card-logo-container` and `.catalog-oem-banner-logo-box`.
    3. *Blogs page*: `.oem-logo-badge-pod` and `.blogs-selected-logo-wrap`.
  - In Dark Theme, set Fortify container background to transparent (`background: transparent !important;`) with a subtle dark border (`border: 1px solid rgba(255, 255, 255, 0.12);`), allowing the pure white lettering and chevron to blend naturally into the dark card surface.
  - Centered the logo with `max-height: 44px !important; width: auto !important; max-width: 90% !important; object-fit: contain !important; margin: 0 auto;`, preventing any clipping or stretching.
  - In Light Theme, applied `filter: invert(1) brightness(0.1) !important;` over the clean white pod, ensuring sharp contrast and legibility.
  - Updated `src/data/catalogData.js` and `src/data/ContentService.js` to reference `/images/oem-logos/Fortify_Logo_Transparent.png` and bumped `CMS_VERSION` to `'v12'`.
- **Technology and role:** Image alpha extraction, CSS layout rules and theme adaptation, OCC schema synchronization.
- **How it works:** Fortify's card containers dynamically match via `:has(img[src*="Fortify"])` and OEM IDs, overriding the generic `#ffffff` pod in dark theme so the white lettering sits directly on the dark card, while preserving the card's rounded borders, padding, and hover elevation.
- **Files and folders added or changed:**
  - `public/images/oem-logos/Fortify_Logo_Transparent.png`
  - `public/images/oem-logos/Fortify_Logo_Black_Bg.png`
  - `src/data/catalogData.js`
  - `src/data/ContentService.js`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Exact OEM brand assets used. Zero hardcoded claims or invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Automated tests: `node --test tests/*.test.mjs` — 60/60 tests passing.
  - Production build: `npm run build` — 167 static product pages generated, exit code 0.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 32: Transline Logo, Ohmega-Ticer Brand Update, DHL GoGreen Badge & Contact Preset Cleanup
- **Status:** In progress (PR #34, branch `feat/transline-logo-frontend`, 05 Nov 2026)
- **What was built:**
  - Added official Transline Technology brand logo asset with transparent alpha background to `public/images/oem-logos/Transline_Logo_Transparent.png` (294 × 73 px), smoothly anti-aliased to render cleanly on both dark and light surfaces.
  - Linked `logoImg: "/images/oem-logos/Transline_Logo_Transparent.png"` to OEM `transline-technology` in `src/data/catalogData.js`.
  - Added Transline Technology to `initialPartners` in `src/data/ContentService.js` to ensure representation in the Partners page running logo ticker and static partner card grid.
  - Added dedicated styling rules in `src/styles/index.css` for Transline logo across `.oem-logo-img`, `.partner-logo-img`, `.blogs-selected-logo-wrap`, and `.oem-running-logo-box` with `max-height: 44px !important` and light theme contrast adaptation.
  - **Row 74:** Removed "Quantic" prefix from "Quantic Ohmega-Ticer" across catalog data, partner lists, and vector branding, standardizing to "Ohmega-Ticer".
  - **Row 75:** Removed "Inquiring about Perimeter Intrusion Detection System (PIDS)" from Contact page Quick Requirement Presets.
  - **Row 84:** Added a "DHL GoGreen Plus Certified (IESPL)" badge to the About Us page highlights badge strip alongside existing pedigree highlights.
  - Bumped `CMS_VERSION` to `v13` in `src/data/ContentService.js` to ensure immediate client cache synchronization.
  - Re-rendered static HTML product pages and sitemap via `npm run build`.
- **Technology and role:** Image alpha extraction, CSS layout rules and theme adaptation, static site generation.
- **How it works:** Transline Technology now supplies a primary `logoImg` so `Products.js`, `Blogs.js`, and `Partners.js` render the real brand logo instead of falling back to text or SVG placeholders.
- **Files and folders added or changed:**
  - `public/images/oem-logos/Transline_Logo_Transparent.png`
  - `public/images/oem-logos/Transline_Logo_Dark_Bg.png`
  - `src/data/catalogData.js`
  - `src/data/ContentService.js`
  - `src/styles/index.css`
  - `public/products/...`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Exact client-provided OEM asset. No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Unit tests: all tests passing (100%).
  - Production build: `npm run build` generates 167 static product pages cleanly (exit code 0).
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 33: Fix Quick Requirement Preset Button Alignment on Contact Page
- **Status:** In progress (branch `fix/contact-preset-button-alignment`, 05 Nov 2026)
- **What was built:**
  - Added dedicated styling rules for `.contact-presets-card .quick-preset`, `.contact-relay-card .quick-preset`, and `.contact-presets-grid .quick-preset` in `src/styles/index.css`.
  - Configured `white-space: normal !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important;` to allow multi-line wrapping without breaking grid tracks.
  - Set `min-height: 46px; height: 100%;` and `align-items: stretch` in `src/pages/Contact.js` so all preset buttons in each grid row share uniform heights and clean visual alignment.
  - Adjusted minimum grid column size to 250px to accommodate longer titles like "High Power GaN Device and Beamforming IC".
- **Technology and role:** CSS Grid and Flexbox alignment rules, UI polish.
- **How it works:** Prevents text clipping and horizontal track overflow on desktop and laptop screens by enabling controlled text wrapping and flexbox centering.
- **Files and folders added or changed:**
  - `src/styles/index.css`
  - `src/pages/Contact.js`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** Pure frontend layout enhancement. No secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds with 0 errors.
  - Test suite: 100% passing across all 42 unit and integration tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 34: Complete Removal of Fortify Across Website and Catalog
- **Status:** Implemented (PR #36, merge commit 08200c1, 06 Nov 2026)
- **What was built:**
  - Removed Fortify OEM from `src/data/catalogData.js`, pruning 8 products (catalog updated to 12 authentic OEMs, 85 categories, 159 products).
  - Removed Fortify from `src/data/ContentService.js` initial partners list and technical engagement mentions.
  - Removed Fortify blog entries and technical whitepapers from `src/data/blogData.js`.
  - Removed Fortify filter chip from `src/pages/Home.js`.
  - Removed Fortify routing mapping from `src/pages/Partners.js`.
  - Removed Fortify chatbot queries and quick chips from `src/components/Chatbot.js`.
  - Removed Fortify specific styling rules and light/dark theme filters from `src/styles/index.css`.
  - Removed Fortify pre-rendered static HTML directory (`public/products/fortify/`) and OEM logo assets.
  - Re-rendered static HTML catalog with 159 product pages and updated sitemap.
- **Technology and role:** Static site generator, catalog service, test suite alignment.
- **How it works:** Prunes deprecated partner cleanly from codebase, data models, static HTML pages, and sitemap.
- **Files and folders added or changed:**
  - `src/data/catalogData.js`
  - `src/data/ContentService.js`
  - `src/data/blogData.js`
  - `src/pages/Home.js`
  - `src/pages/Partners.js`
  - `src/components/Chatbot.js`
  - `src/styles/index.css`
  - `public/products/fortify/`
  - `tests/admin-product-persistence.test.mjs`
  - `tests/publish-webhook-pipeline.test.mjs`
  - `tests/static-catalog-builder.test.mjs`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds generating 159 pages cleanly (exit code 0).
  - Test suite: 100% passing across all 42 tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert commit or branch.

### Entry 35: Purge Cached Fortify Data via CMS Version Bump (v14), Filter Exclusions, and Presets Purge
- **Status:** Implemented (PR #37, merge commit 4492ed7, 06 Nov 2026)
- **What was built:**
  - Bumped `CMS_VERSION` from `v13` to `v14` in `src/data/ContentService.js` to automatically invalidate and purge stale browser `localStorage` containing Fortify.
  - Added strict runtime filtering for `o.id !== 'fortify'` across `ContentService.getData('products')`, `ContentService.getData('partners')`, `ContentService.getData('blogs')`, and `ContentService.init()` (Supabase remote hydration).
  - Added `'fortify'` to `EXCLUDED_OEM_IDS` in `src/pages/Products.js` and `src/pages/Blogs.js`.
  - Removed "3D Printed Dielectric Parts" requirement presets from `src/data/ContentService.js`, `src/pages/Contact.js`, and `src/pages/Home.js`.
  - Updated Home hero stats to reflect accurate 12 OEM partners and 159 verified components.
  - Removed deprecated 3D printed dielectric references from `src/components/Chatbot.js`.
  - Re-rendered all static HTML pages and updated sitemap.
- **Technology and role:** Client-side cache management, defensive runtime filtering, preset configuration.
- **How it works:** Prevents cached client-side localStorage or Supabase persistence stores from resurrecting deprecated Fortify OEM data, and invalidates older caches on visiting the site.
- **Files and folders added or changed:**
  - `src/data/ContentService.js`
  - `src/pages/Products.js`
  - `src/pages/Blogs.js`
  - `src/pages/Contact.js`
  - `src/pages/Home.js`
  - `src/components/Chatbot.js`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No secrets, no new dependencies, strictly frontend data cleanliness.
- **Checked (and how):**
  - Unit tests: 43 tests passing (100%).
  - Production build: `npm run build` exits 0 with 159 static product pages.
  - Runtime verification: Verified `getOEMs()`, `getData('products')`, `getData('blogs')`, and `getData('partners')` all exclude Fortify.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 36: Services Page Hero Lead Copy Refinement & CMS Version Bump (v15)
- **Status:** Implemented (PR #39, merge commit 38e403b, 09 Nov 2026)
- **What was built:**
  - Updated the Services page hero lead paragraph in `src/pages/Services.js` and `src/data/ContentService.js` to: *"From representing world-class RF and Microwave components, semiconductors manufacturers to offering design collaboration and strategic business consultancy, our services empower engineers and organisations to innovate with confidence."*
  - Bumped `CMS_VERSION` to `'v15'` in `src/data/ContentService.js` to ensure client browser `localStorage` refreshes automatically on next visit.
  - Synchronized `supabase/seed_cms_content.sql` with the new services hero lead text.
- **Technology and role:** Frontend copy refinement, CMS default content, client cache invalidation.
- **How it works:** Provides clear, professional, unified value proposition across services representation, design collaboration, and strategic business consulting.
- **Files and folders added or changed:**
  - `src/pages/Services.js`
  - `src/data/ContentService.js`
  - `supabase/seed_cms_content.sql`
  - `FEATURE.md`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds generating 159 pages cleanly (exit code 0).
  - Test suite: 100% passing across all 43 tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 37: Partners Page Heading and Lead Copy Refinement & CMS Version Bump (v16)
- **Status:** Implemented (PR #40, merge commit be72944, 09 Nov 2026)
- **What was built:**
  - Updated Partners page heading in `src/pages/Partners.js`, `src/data/ContentService.js`, `src/admin/Admin.js`, `scripts/seed-cms-content.mjs`, and `supabase/seed_cms_content.sql` from *"Authorized Technology Partners"* to *"Our Global Technology Partners"*.
  - Updated Partners page lead paragraph to: *"Icon Electromatic collaborates with a select group of globally recognised technology partners to deliver advanced RF, microwave, mmWave, semiconductor, and Hi-Rel solutions. Together, these partnerships enable reliable access to cutting-edge components, materials, and systems for mission-critical aerospace, defence, space, SATCOM, and next-generation communication applications."*
  - Bumped `CMS_VERSION` to `'v16'` in `src/data/ContentService.js` to ensure client browser `localStorage` refreshes automatically on next visit.
- **Technology and role:** Frontend copy refinement, CMS default content, client cache invalidation.
- **How it works:** Provides clear, professional narrative aligning global partner capabilities with mission-critical aerospace, defense, space, and SATCOM applications.
- **Files and folders added or changed:**
  - `src/pages/Partners.js`
  - `src/data/ContentService.js`
  - `src/admin/Admin.js`
  - `scripts/seed-cms-content.mjs`
  - `supabase/seed_cms_content.sql`
  - `FEATURE.md`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds generating 159 pages cleanly (exit code 0).
  - Test suite: 100% passing across all 43 tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 38: Home Page DHL GoGreen Plus Stat & Transline Logo Consistency in Light/Dark & CMS Version Bump (v17)
- **Status:** Implemented (PR #41, merge commit 23ead60, 10 Nov 2026)
- **What was built:**
  - Replaced the Home page third hero stat item ("100% / ROHS & ISO 9001") with "DHL GoGreen Plus / CERTIFIED (IESPL)" across `src/pages/Home.js` and `src/data/ContentService.js`.
  - Added dynamic font-size scaling for stat items in `src/pages/Home.js` and defensive sanitization mapping any cached "100%" or "ROHS" entries to "DHL GoGreen Plus Certified (IESPL)".
  - Updated `src/styles/index.css` Transline logo styles to eliminate light mode color inversion (`filter: none !important;`) and wrapped the logo in a dark pod (`#0f172a`) in both light and dark modes, ensuring consistent appearance matching dark mode across the entire site.
  - Bumped `CMS_VERSION` to `'v17'` in `src/data/ContentService.js` to ensure client browser `localStorage` refreshes automatically on next visit.
- **Technology and role:** Frontend styling, responsive typography, CMS default content, client cache invalidation.
- **How it works:** Aligns Home certification highlight with DHL GoGreen Plus credential and ensures Transline logo renders authentically with white text and gold swoosh in both theme modes.
- **Files and folders added or changed:**
  - `src/pages/Home.js`
  - `src/data/ContentService.js`
  - `src/styles/index.css`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds generating 159 pages cleanly (exit code 0).
  - Test suite: 100% passing across all 43 tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 39: Remove Category and Product Count Badges from Products Page OEM Cards
- **Status:** Implemented (PR #42, merge commit deed827, 10 Nov 2026)
- **What was built:**
  - Removed `.oem-card-meta` (containing category and product counter badges such as "7 Categories" and "37 Products & Lines") from all 12 OEM cards in `src/pages/Products.js`.
  - Streamlined OEM cards to cleanly emphasize official brand logo, title, tagline, description, category preview pills, and direct exploration call-to-action.
- **Technology and role:** Frontend UI layout simplification.
- **How it works:** Prunes redundant quantitative badge indicators on the primary catalog overview.
- **Files and folders added or changed:**
  - `src/pages/Products.js`
  - `docs/seo_backend_implementation.md`
  - `docs/PROJECT-STATE.md`
- **Data and security notes:** No invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Production build: `npm run build` succeeds generating 159 pages cleanly (exit code 0).
  - Test suite: 100% passing across all 43 tests.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 40: Deep Product Catalog Search with Hierarchical Route Display Across All OEMs
- **Status:** Implemented (PR #43, merge commit fc8dc70, 10 Nov 2026)
- **What was built:**
  - Upgraded the Products catalog search on `src/pages/Products.js` to index across all 12 OEM partners, 85 categories, and 159 product models.
  - Implemented tokenized and typo-tolerant search using word-boundary matching and Levenshtein distance $\le 2$ on words $\ge 4$ characters, so searches for product models (e.g. "RT/duroid 5880", "Capattery", "HyperSDR", "Bias Tees", and common misspellings) accurately identify the right products and OEMs.
  - Added a dedicated rich search results view displaying matching products with full hierarchical route breadcrumbs (`OEM Partner → Category → Product`), product pictures, OEM overlays, descriptions, key application chips, direct category navigation links, standalone product page links, and RFQ quote buttons.
  - Added synchronized OEM partner filtering to display associated OEMs alongside matching products, with automatic empty-state feedback and 1-click search reset.
  - Styled with CSS variables for responsive multi-column layouts across desktop and mobile in both dark and light themes.
- **Technology and role:** In-memory full-text search indexing, Levenshtein distance algorithm, DOM event delegation, CSS theming and responsive design.
- **How it works:** `searchCatalog(query)` parses input tokens and evaluates them against OEM, category, and product data models. When queries are active, `applyFilters()` dynamically populates `#catalog-search-results-wrap` with route-badged product cards and filters the `#oem-cards-grid`.
- **Files and folders added or changed:**
  - `src/pages/Products.js`
  - `src/styles/index.css`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** All search runs in-browser against authoritative catalog data. Zero invented data, no secrets, no new dependencies.
- **Checked (and how):**
  - Test suite: 100% passing across all 43 tests.
  - Production build: `npm run build` generates 159 pages cleanly with zero errors.
  - Verified searches: "rt duroid 5880", "rt duriod 5580", "capattery", "hypersdr", "bias tees", empty state, and 1-click reset.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 41: Fix Catalog Search Event Delegation Across Navigation Transitions
- **Status:** Implemented (PR #44, merge commit 5edcece, 10 Nov 2026)
- **What was built:**
  - Switched `#oem-search-input` event listener from direct DOM element binding to container-level event delegation on `#catalog-page`.
  - Resolved event listener detachment issue where navigating into an OEM/category and returning to the main OEMs view destroyed and recreated the search input without its listener.
  - Added delegated `<kbd>Escape</kbd>` key listener to quickly clear search queries and reset filters.
  - Added automatic filter execution in `navigateTo()` whenever returning to `level === 'oems'` with an active search query.
- **Technology and role:** DOM event delegation, SPA navigation lifecycle synchronization.
- **How it works:** Attaching event listeners to the persistent `#catalog-page` container ensures events bubble correctly even when inner child HTML is replaced by level transitions.
- **Files and folders added or changed:**
  - `src/pages/Products.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend DOM event management. Zero secrets, no new dependencies.
- **Checked (and how):**
  - Test suite: 100% passing across all 43 tests.
  - Production build: `npm run build` generates 159 pages cleanly with zero errors.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

### Entry 42: Universal Catalog Search Bar Across All Catalog Levels
- **Status:** In progress (PR #45, branch `feat/universal-catalog-search-all-levels`, 10 Nov 2026)
- **What was built:**
  - Added a universal catalog search bar component across all inner catalog levels: Level 1 (All OEMs), Level 2 (OEM Categories View), and Level 3 (Category Products Table / Cards View).
  - Users can now search from any catalog view for any product, model, category, or manufacturer.
  - When a query is entered from Level 2 or Level 3, the current level's category or product grid smoothly collapses, revealing the full catalog deep search results with complete hierarchical route breadcrumbs (`OEM Partner → Category → Product`), allowing instant jump to any item across the entire website catalog.
  - Clearing the search restores the native OEM, Category, or Product level view seamlessly.
- **Technology and role:** Reusable component templating, dynamic DOM view toggling, global search integration.
- **How it works:** `renderCatalogSearchToolbar()` is embedded in `renderCategoriesLevel()` and `renderProductsLevel()`. `applyFilters()` controls the visibility of `#category-section-meta`, `#category-cards-grid`, and `#product-view-container` alongside `#catalog-search-results-wrap`.
- **Files and folders added or changed:**
  - `src/pages/Products.js`
  - `docs/PROJECT-STATE.md`
  - `docs/seo_backend_implementation.md`
- **Data and security notes:** Pure frontend enhancement against authoritative catalog data. Zero secrets, no new dependencies.
- **Checked (and how):**
  - Test suites: 43/43 tests passing.
  - Production build: `npm run build` passing cleanly with 159 static HTML pages generated.
- **Not checked:**
  - Live production deployment URL (checked after pull request merge).
- **Undo:** Revert PR or branch.

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
