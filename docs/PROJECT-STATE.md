# PROJECT-STATE.md - Icon Electromatic website

Last updated: 2026-11-09
Rule: update this file at the end of every task. Never write passwords, keys or tokens here.
Read docs/seo_backend_implementation.md for the implementation log, technology stack and phase status.

## Goal
Deliver a live, secure, SEO-ready B2B catalog site that the client's staff can edit
through a CMS, that sends every enquiry to the right office, that gives every product
an indexable page with unique content, and that is handed over with documentation,
client-owned accounts and one year of maintenance.

## Current stage
Stage 7 - Central CMS Supabase Persistence & SSG Integration (feat/admin-cms-supabase-persistence + feat/single-domain-routing)

## Stage checklist
- [x] Frontend built (reviewed at commit e371aac, 15 Oct 2026)
- [x] Stage 0 - Preparation: scope freeze, tag frontend-v1, rule files, automation workflows and CI (PR #5, PR #6)
- [x] Stage 1 - Clean-up: remove dead files (PR #9), hide demo admin (PR #7)
- [x] Phase 1 - Walking Skeleton: 1 OEM + 5 products from DB to static SEO page (PR #10)
- [x] Stage 2 - Data: final Excel, full catalog migration, batch image pipeline (PR #11)
- [x] Stage 3 - Backend and CMS connected to Supabase (PR #12)
- [x] Stage 4 - Enquiry forms that really send email (PR #13)
- [x] Stage 5 - Real URLs, Static HTML Pages, Sitemap & Schema.org SEO (PR #14, commit 9aaf192 - with known gaps recorded)
- [x] Stage 6 - Client Handover, Setup Guide & Maintenance (PR #15, commit 023190b)
- [x] Task 1 - Static SEO Pipeline Repair (ISS-04, 05, 06, 08, 09, 10, 15 on fix/static-seo-pipeline-repair)
- [x] Step 1 - Central CMS Database Schema & Seed (004_cms_content.sql, seed_cms_content.sql)
- [x] Step 2 - Dual-Mode Service Layer Adapter (ContentService.js, supabaseClient.js)
- [x] Step 3 - Centralize Product & OEM Persistence (Admin.js -> Supabase, seed_products_cms.sql)
- [x] Step 4 - Connect Static Site Generator to Supabase (build-static-catalog.mjs, static-catalog-builder.test.mjs - 10/10 verified)
- [x] Step 5 - Publishing Pipeline & Rebuild Webhook Integration (Admin.js, triggerPublishWebhook, SeoAuditModal.js - 5/5 verified)
- [x] Phase 1.2 - Optimistic Concurrency Protection (supabaseClient.js, ContentService.js, Admin.js, migration 005 - 25/25 verified)
- [x] Step 6 - Single-Domain Routing Alignment (/ vs /admin, src/main.js - locally verified)
- [x] Header Refinement, Homepage Capabilities Removal & Light Theme Elevation (feat/header-refinement-alignment)
- [x] Remove Spellman & AEE Israel from Products & Blogs (13 OEMs, 167 Products on feat/header-refinement-alignment)
- [x] Remove Strategic Application Domains from About Us (feat/header-refinement-alignment)
- [x] Remove Product Card Part Badges & Standardize to "View All Products" (feat/header-refinement-alignment)
- [x] Remove Global Partnerships Pillar & Center Bespoke Solutions on About Us (feat/header-refinement-alignment)
- [x] Slightly Increase Header Logo on Products, Partners & Blogs Pages (feat/header-refinement-alignment)
- [x] Improve Timeline Milestone Image Cropping & Centering on About Us (feat/header-refinement-alignment)
- [x] Equal Height & Proper Alignment for Office Addresses & Send Us a Message on Contact (feat/header-refinement-alignment)
- [x] Separate Mini-Circuits & RFuW Homepage Filter Buttons (feat/header-refinement-alignment)
- [x] Refine "Our Journey" Heading & Remove Bespoke Solutions Card on About Us (feat/header-refinement-alignment)
- [x] Display Complete Transline Logo across Products, Blogs & Partners (PR #34)
- [x] Remove Quantic from Ohmega-Ticer, Add DHL GoGreen Badge to About Us, Remove PIDS Contact Preset (PR #34)
- [x] Align Contact Us Quick Requirement Presets & Fix GaN Button Wrapping (fix/contact-preset-button-alignment)
- [x] Complete Removal of Fortify Across Website and Catalog (PR #36)
- [x] Purge Cached Fortify Data via CMS Version Bump (v14), Filter Exclusions & Presets (fix/purge-fortify-and-bump-cms-version)
- [x] Update Services Page Hero Lead Copy & Bump CMS Version to v15 (content/update-services-hero-lead)

## Decisions (confirmed by the owner)
| Date | Decision | Why |
|---|---|---|
| 2026-10 | Build the backend first, then SEO | SEO fields must exist in the data model from day one |
| 2026-10 | Whole project is built with Antigravity | Owner's workflow |
| 2026-10 | The CMS exposes all intended website content as editable | Owner's requirement |
| 2026-10 | Work one step at a time with detailed explanations | Owner is a beginner and wants senior-developer practices |
| 2026-10 | Automate via /new_feature, /finish_feature and GitHub Actions CI | Standardize branching, enforce safety rules, and ensure every PR builds clean |
| 2026-10 | Fail loudly instead of faking success | Stop fake ticket IDs and silent fallback; enforce required secrets and production authentication |
| 2026-10 | Option 1 Architecture Repair | Complete existing Supabase + SSG static pipeline; do not rewrite or replace framework |
| 2026-11 | Streamline Header, Remove Homepage Capabilities & Elevate Light Theme | Reduce header crowding (height 92px, nav gap 1.75rem), remove redundant Request Quote header CTA (preserving quote elsewhere), remove Core Capabilities from homepage, and elevate homepage light theme to clean white with darkened hero background video |
| 2026-11 | Prune Catalog to 13 Canonical OEMs | Completely remove Spellman and AEE Israel from Products and Blogs pages (leaving 13 authentic OEMs and 167 verified products) |
| 2026-11 | Streamline About Us & Standardize Product Cards | Removed Strategic Application Domains from About page with balanced layout spacing; removed "X Parts" number badges from top-right corner of product cards and standardized card button/link to "View All Products" without numbers |
| 2026-11 | Remove Global Partnerships Pillar & Increase Logo on Catalog Pages | Removed Global Partnerships card from About Us, centered remaining Bespoke Solutions pillar card, and slightly increased header logo size to 58px on Products, Partners, and Blogs pages while maintaining header alignment and nav spacing |
| 2026-11 | Precision Crop & Center Milestone Images on About Us Timeline | Re-sliced 4 milestone photos from master infographic at exact geometry (644x400 px, 16:10 aspect ratio), eliminating rightward crop displacement and blue background void on Card 4, perfectly centering key subjects, and explicitly enforcing object-fit: cover and object-position: center center |
| 2026-11 | Equal Height & Field Alignment on Contact Page | Aligned Office Addresses card and Send Us a Message form to equal height (1fr 1fr, align-items: stretch), unified typography, padding (32px), and rounded corners (20px), prevented select/field overflow via minmax(0, 1fr) and ellipsis, and moved Quick Requirement Presets to a dedicated clean row below the grid |
| 2026-11 | Separate Mini-Circuits and RFuW Filter Buttons on Homepage | Split combined Mini-Circuits & RFuW filter chip into two independent buttons, each filtering strictly by its own OEM (minicircuits and rfuw-engineering) while maintaining existing chip styling, colors, and functionality |
| 2026-11 | Promote "Our Journey" Heading & Remove Bespoke Solutions Card on About Us | Removed "Chronology" heading, promoted "Our Journey" to prominent primary section title, and removed "Bespoke Solutions" card and pillars section while preserving 4-milestone timeline and clean spacing |
| 2026-11 | Replace PowerRF Logo on Partners Page & Running Ticker | Replaced legacy vertical PowerRF logo with the authentic horizontal brand logo (Smith chart circle emblem, orange Greek Phi, bold POWERF, tagline, and registered entity name), optimized as crisp 552x228 PNG with transparent background, seamlessly centered in white logo cards on both Partners grid and OEM running ticker |
| 2026-11 | Display Complete Fortify Logo Without White Background Across Partners, Products & Blogs | Enhanced Fortify logo to complete, uncropped 2x Retina transparent PNG asset (652x126), eliminated the jarring solid white container background on Partners, Products, and Blogs cards in dark mode with transparent glassy outline styling, centered logo with max-height 44px, and preserved crisp inverted contrast in light mode |

## Proposed, not yet confirmed
- Static site generation (Astro recommended) so every product is a real HTML page
- A managed headless CMS (for example Sanity) as the backend; Supabase with custom admin is the alternative
- A small serverless function for enquiries (validation, spam protection, regional email routing, saved copy)

## Known issues & status (as of 2026-10-21)
- Contact form fails loudly with inline error if unconfigured or server rejects; ticket IDs only accepted from server
- Admin sign-in blocks mock fallback in production builds; refuses login if Supabase is unconfigured
- Edge function validates ALLOWED_ORIGINS and fails with HTTP 500 if regional office emails or RESEND_API_KEY are missing (saves enquiry first)
- Static SEO pages pre-rendered with dynamic CSS asset detection, valid Schema.org Product Offer, responsive image dimensions, and permanent 301 redirects for legacy prototype URLs
- Dynamic catalog cards and rows now render direct crawlable links (/products/{oem}/{slug}) to static product pages
- "4,000+ products" and "24+ categories" claims removed from index.html, Home.js, and ContentService.js and replaced with verified counts (160+ verified components, 13 OEM partners)
- Admin CMS (/admin): always routable in production; runtime Supabase auth enforces access; VITE_ENABLE_DEMO_ADMIN retained for display-only badge on login screen (PR #7 for original gate, Step 6 for routing change)
- Old fake product files (products.js, ProductDetail.js) removed in Phase 0 (PR #9)
- Large files: 65 MB presentation, hero videos; main JS bundle is 399.46 kB (down from 645 kB baseline)
- Repo is public and contains client files
- Two development-tool vulnerabilities (Vite, esbuild); affect the dev server only

## Open questions
1. Final product count: 169 in code, about 130 stated by the owner, 400+ claimed by the client
2. Who builds the backend?
3. Who edits and publishes at the client; is an approval step needed; do they add images and videos?
4. Which email receives enquiries for each office (India, Singapore, USA)?
5. Has the budget been renegotiated?

## Environments (names only, no secrets)
- Production: not live yet
- Hosting: Vercel (to confirm)
- Domain: owned by the client (registrar access to confirm)

## How to resume work
1. Read AGENTS.md, then this file.
2. Pick the first unchecked item in the stage checklist.
3. Make a plan, wait for approval, work on a branch, update this file when done.