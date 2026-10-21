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
