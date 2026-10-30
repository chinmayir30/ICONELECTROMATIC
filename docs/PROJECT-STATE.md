# PROJECT-STATE.md - Icon Electromatic website

Last updated: 2026-10-29
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
- "4,000+ products" and "24+ categories" claims removed from index.html, Home.js, and ContentService.js and replaced with verified counts (160+ verified components, 15 OEM partners)
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