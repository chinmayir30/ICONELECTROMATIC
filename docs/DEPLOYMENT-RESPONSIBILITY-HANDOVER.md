# ICON ELECTROMATIC — Complete Technical Handover & Deployment Responsibility Agreement

**To:** Taneesha & The IT / Infrastructure Team  
**Organization:** Innovate Electronics / Icon Electromatic Private Limited  
**Project:** ICON ELECTROMATIC Corporate B2B Catalog & CMS Platform  
**Subject:** Operational Handover, Deployment Responsibility & Supabase Project Activity  
**Date:** November 4, 2026  
**Document Reference:** IE-DEP-HANDOVER-2026-FINAL  

---

## 1. Executive Overview & Purpose

To ensure zero technical ambiguities and a seamless go-live, this document provides an **exhaustive breakdown** of every component in the ICON ELECTROMATIC project.

As agreed:
- **Developer Responsibility:** Delivers the complete, self-contained application source code, 167 pre-rendered product pages, 190+ packaged image assets, 5 PostgreSQL database migrations, 3 seed datasets, serverless contact functions, and configuration templates.
- **Client / Innovate Electronics Responsibility:** Owns and provisions cloud accounts (Supabase, Resend), hosting infrastructure, domain DNS records (`iconelectromatic.com`), and executes production deployment.

---

## 2. Complete Component-by-Component Responsibility Breakdown

### 2.1 The Product Catalog & Static Generation (SSG)
| Area | Developer Delivers (Our Side) | Client IT Responsibility (Your Side) |
|---|---|---|
| **167 B2B Products** | Complete catalog representing 13 global OEM partners (Rogers, Mini-Circuits, Qorvo, Tecdia, Tri-TeQ, etc.) mapped with categories, descriptions, specs, and applications. | Review and approve product descriptions; supply any proprietary internal part numbers if needed. |
| **Static HTML Pages** | 167 pre-rendered static HTML detail pages in `/products/` that load instantly and are 100% crawlable by Google without requiring JavaScript execution. | Host on a modern static-compatible edge network (Vercel, AWS Amplify, Cloudflare Pages, Netlify). |
| **"Publish Catalog" Webhook** | In-admin "Publish Catalog" trigger button wired to `VITE_REBUILD_WEBHOOK_URL` so staff edits can trigger a background static rebuild. | **Create a Deploy Hook** in your hosting dashboard (e.g. Vercel Settings $\rightarrow$ Git $\rightarrow$ Deploy Hooks) and paste the URL into `VITE_REBUILD_WEBHOOK_URL`. |

### 2.2 Product Images, Logos & Media Assets
| Asset Category | Asset Count & Storage | Post-Deployment Guarantee |
|---|---|---|
| **Product Images** | **94 files** in `public/images/products/` | Bundled directly inside the repository. Guaranteed to load on any host with zero broken links and zero external CDN dependency. |
| **OEM Partner Logos & Icons** | **96 files** in `public/catalog-images/` & `public/images/oem-logos/` | Bundled directly inside the repository. High-resolution transparent PNGs and vector SVGs. |
| **Future Admin Uploads** | Dynamic cloud storage | The Admin CMS uses Supabase Storage bucket `catalog-images` for any *new* images uploaded by staff in the future. |
| **Corporate Downloads & Media** | `public/downloads/`<br>• Corporate Presentation (68 MB)<br>• Company Flyer (3 MB)<br>`public/videos/`<br>• Hero Background Video (6.8 MB) | Bundled inside repository. Client team should note these media files when choosing a hosting plan to ensure adequate bandwidth limits. |

### 2.3 The Database (Supabase PostgreSQL 15) & Scheduled Activity Check
| Database Component | Developer Delivers (Our Side) | Client IT Responsibility (Your Side) |
|---|---|---|
| **5 SQL Migrations** | `001_initial_schema.sql` (Tables: `oems`, `categories`, `products`, `enquiries`, `rate_limits`, `user_roles`)<br>`002_rls_policies.sql` (Row-Level Security)<br>`003_admin_schema_alignment.sql` (Storage bucket `catalog-images` & alignment)<br>`004_cms_content.sql` (Key-value CMS store)<br>`005_cms_content_versioning.sql` (Optimistic concurrency control) | **Provision Supabase project** (recommended region: `ap-south-1` Mumbai or `ap-southeast-1` Singapore) under company email.<br>Run migrations sequentially in the Supabase SQL Editor. |
| **3 Seed Datasets** | `seed.sql` (Base roles, OEMs, categories)<br>`seed_cms_content.sql` (Initial website copy, office info)<br>`seed_products_cms.sql` (All 167 products in CMS JSON store) | Run the 3 seed scripts in order after applying the migrations. Run `NOTIFY pgrst, 'reload schema';` once complete. |
| **First Admin User Creation** | Role-Based Access Control logic (`admin`, `staff`, `viewer`). | **Mandatory Step**: After signing up the first staff email in Supabase Authentication, run: <br>`INSERT INTO public.user_roles (user_id, role) VALUES ('<USER_UUID>', 'admin');`<br>*(Without this, staff cannot log into `/admin`)*. |
| **Scheduled Supabase Activity Check** | `.github/workflows/supabase-keepalive.yml` attempts a read-only request to `/rest/v1/oems?select=id&limit=1` every 3 days and fails visibly if credentials are missing or the request fails. | Apply every migration in `supabase/migrations/` from the final delivered source, including the explicit Data API grant for public `oems` reads, before enabling the workflow. Then configure the repository URL/key variables or secrets, keep GitHub Actions enabled, and monitor workflow runs. GitHub scheduled runs are best-effort, so this workflow cannot guarantee that Supabase will avoid inactivity pausing. Verify the current Supabase plan behavior and choose a plan with suitable availability if uninterrupted service is required. |

### 2.4 Contact Form & Regional RFQ Routing
| Component | Developer Delivers (Our Side) | Client IT Responsibility (Your Side) |
|---|---|---|
| **Serverless Function** | Edge function code in `supabase/functions/contact/index.ts` with server-side validation, anti-bot honeypots, and IP rate-limiting (max 5 submissions/hour/IP). | Deploy function via Supabase CLI (`npx supabase functions deploy contact`) or paste into Supabase Edge Functions dashboard. |
| **Email API (Resend)** | Resend API client integration formatting professional HTML notification emails to regional offices with client enquiry details. | 1. Create account on [resend.com](https://resend.com) with corporate email.<br>2. Add domain `iconelectromatic.com` and add SPF/DKIM DNS records.<br>3. Provide Resend API Key. |
| **Office Recipient Inboxes** | Regional routing logic directing inquiries to India, Singapore, or USA based on user selection. | **Supply active recipient inboxes**: <br>• India HQ (`OFFICE_EMAIL_INDIA`)<br>• Singapore (`OFFICE_EMAIL_SINGAPORE`)<br>• USA (`OFFICE_EMAIL_USA`) |

### 2.5 Search Engine Optimization (SEO) & Domain
| Item | Developer Delivers (Our Side) | Client IT Responsibility (Your Side) |
|---|---|---|
| **Canonical Domain** | All 167 static HTML files, OpenGraph metadata, JSON-LD schemas, and `sitemap.xml` strictly declare `https://iconelectromatic.com`. | **Point DNS records** (`A` and `CNAME`) at domain registrar to your hosting server. |
| **In-Admin SEO Tools** | Interactive SERP preview card with live Google desktop/mobile simulation and character/pixel counters in `/admin`. | Administrative staff can fine-tune meta titles and descriptions for any product directly from the CMS. |
| **XML Sitemap** | Automated generation of `/sitemap.xml` with 174 indexed URLs. | Submit `https://iconelectromatic.com/sitemap.xml` in **Google Search Console** post-launch. |
| **Robots Directives** | `public/robots.txt` disallows `/admin` and references the sitemap; `/admin` route injects `<meta name="robots" content="noindex, nofollow">`. | None (pre-configured in code). |

---

## 3. Master Environment Variables Specification (`.env.example`)

### Frontend Hosting Environment Variables (Client Hosting Dashboard):
```env
# Supabase Connection (Obtained from Supabase Dashboard -> Project Settings -> API)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-public-key>

# Static Rebuild Webhook (Obtained from Hosting Dashboard -> Deploy Hooks -> Branch: main)
VITE_REBUILD_WEBHOOK_URL=https://<your-hosting-deploy-hook-url>
```

### Backend Function Secrets (Configured in Supabase Vault / CLI):
```env
# Transactional Email (Obtained from Resend Dashboard -> API Keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Regional Office Inboxes for Inquiries & RFQs
OFFICE_EMAIL_INDIA=salesiepl@iconelectromatic.com
OFFICE_EMAIL_SINGAPORE=IESing@iconelectromatic.com
OFFICE_EMAIL_USA=salesiellc@iconelectromatic.com

# Strict Security Origins (Comma-separated)
ALLOWED_ORIGINS=https://iconelectromatic.com,https://www.iconelectromatic.com
```

---

## 4. Formal Confirmation & Sign-Off

### For Innovate Electronics / Icon Electromatic:
**Authorized Representative:** Taneesha  
**Title:** _________________________________________________  
**Signature / Written Approval:** _________________________________________________  
**Date:** ________________________  

### For the Development Team:
**Lead Developer:** _________________________________________________  
**Status:** Draft — pending final PR integration, client configuration, and handover verification  
**Date:** November 2, 2026  

