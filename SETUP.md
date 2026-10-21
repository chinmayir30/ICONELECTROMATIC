# Icon Electromatic — Master Setup & Client Handover Guide

Welcome to the **Icon Electromatic B2B Catalog Website** repository. This document is the master engineering and administrative handover guide for developers, DevOps engineers, and marketing editors.

---

## 1. System Architecture Overview

The system is engineered as a high-performance, host-independent, and SEO-optimized B2B catalog architecture:

```
[ Search Engines / Users ]
           │
           ▼
[ Real URLs / Static HTML ] ◄── Pre-rendered by build-static-catalog.mjs
           │
           ▼
[ Vite Vanilla JS SPA ] ───────► [ Custom Admin CMS (/admin) ]
           │                                 │
           ▼                                 ▼
[ Supabase Edge Functions ]       [ Supabase PostgreSQL ]
  - /contact (Honeypot + Resend)    - 15 OEMs, 88 Categories, 169 Products
  - Rate limiting & anti-spam       - Row Level Security (RLS)
```

1. **Frontend & Routing:** Pure Vanilla JavaScript with Vite. Utilizes HTML5 History API (`window.history.pushState`) for clean real URLs (e.g., `/products`, `/about`, `/contact`, `/products/rogers-corporation/rtduroid-5880`) without hash routes.
2. **Static Site Generation (SSG) & SEO:** Built with `scripts/build-static-catalog.mjs`. Pre-renders 169 standalone HTML pages containing Google Schema.org `Product` & `BreadcrumbList` JSON-LD, OpenGraph tags, canonical tags, `sitemap.xml`, and `robots.txt`. Readable with zero client JavaScript.
3. **Database & Storage:** Hosted on Supabase (PostgreSQL 15+). Secured with strict Row Level Security (RLS) policies allowing public read access for published products, authenticated write access for administrators, and insert-only rate limiting.
4. **Image Pipeline:** All 95 catalog pictures extracted left-to-right from client Excel sheets, normalized and converted to WebP format under `public/catalog-images/`.
5. **Custom Admin CMS:** Zero-dependency admin panel accessible at `/admin`. Includes an Option B pre-publish SEO audit modal, Google SERP snippet preview card, interactive image gallery reordering, and a rebuild trigger. Guarded in production by `VITE_ENABLE_DEMO_ADMIN`.
6. **Enquiry & RFQ Edge Function:** Host-independent TypeScript serverless function (`supabase/functions/contact/index.ts`). Features anti-spam honeypot fields (`_honey`), timestamp verification (`_rendered_at`), SQL rate limiting (`rate_limits` table), SQL persistence (`enquiries` table), and automated multi-office routing via Resend API (India, Singapore, USA).

---

## 2. Developer Quickstart

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git**

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/chinmayir30/ICONELECTROMATIC.git
cd ICONELECTROMATIC

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

### Production Build & Preview
```bash
# Compiles Vite bundle and runs the SSG pre-renderer:
npm run build

# Preview the production dist folder locally:
npm run preview
```

---

## 3. Supabase Cloud Setup (Free Tier)

Follow these steps to connect your own Supabase project:

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create an account.
2. Click **New Project**, choose a region close to your primary audience (e.g., *India / Mumbai* or *Singapore*), set a secure database password, and choose the Free Plan ($0/mo).

### Step 2: Configure Environment Variables
1. In your Supabase Dashboard, navigate to **Settings (gear icon) -> API**.
2. Copy the **Project URL** and the **Project API Key (`anon` `public`)**.
3. Open your local `.env.local` file (git-ignored) and populate:
   ```env
   VITE_ENABLE_DEMO_ADMIN=true
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
   ```

### Step 3: Run Database Migrations
In the Supabase Dashboard, open the **SQL Editor** (`>_`) and run the SQL migration files in this order:
1. `supabase/migrations/001_initial_schema.sql`: Creates `oems`, `categories`, `products`, `product_images`, `product_specs`, `enquiries`, and `rate_limits` tables.
2. `supabase/migrations/002_rls_policies.sql`: Enables Row Level Security and defines public read and admin write policies.
3. `supabase/seed.sql`: Populates the complete catalog of 15 OEMs, 88 categories, and 169 products with specs and image relations.

### Step 4: Deploy the Contact Edge Function
Using the Supabase CLI:
```bash
# Log into Supabase
npx supabase login

# Link your local project
npx supabase link --project-ref your-project-id

# Set secrets for email dispatch (replace placeholder values with real client mailboxes and API keys):
npx supabase secrets set RESEND_API_KEY=re_your_resend_api_key
npx supabase secrets set OFFICE_EMAIL_INDIA=your_india_office@domain.com
npx supabase secrets set OFFICE_EMAIL_SINGAPORE=your_apac_office@domain.com
npx supabase secrets set OFFICE_EMAIL_USA=your_usa_office@domain.com
npx supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173

# Deploy the function
npx supabase functions deploy contact
```

---

## 4. Production Hosting & Deployment

The static build output in `dist/` is 100% host-independent.

### Deploying to Vercel, Netlify, or Cloudflare Pages
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_ENABLE_DEMO_ADMIN`: `false` (in production)
  - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
  - `VITE_REBUILD_WEBHOOK_URL`: `https://api.vercel.com/v1/integrations/deploy/...` (optional deploy webhook)

### Deploying to Nginx / Apache / Traditional VPS
Point your virtual host document root to `/path/to/ICONELECTROMATIC/dist`.
- For Nginx:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  error_page 404 /404.html;
  ```

---

## 5. Staff Content Editor & Admin Guide

### Accessing the Admin Panel
1. When `VITE_ENABLE_DEMO_ADMIN=true` (or when authenticated via Supabase Auth), navigate to `/admin`.
2. The Admin panel provides:
   - **Catalog Browser:** Filter products by OEM and Category.
   - **Product Editor:** Edit product model names, marketing descriptions, technical specs, and target applications.
   - **Gallery Manager:** Reorder image priorities (drag-and-drop or rank ordering) and set the primary hero picture.
   - **Google SERP Snippet Preview:** Real-time visual preview of how the title and description will appear in Google search results.

### The Option B Rule (Quality Gate)
- To prevent Google thin-content penalties, the catalog enforces **Option B**:
  - A product is only published (`is_published = true`) if it has **both an image and a description of at least 20 characters**.
  - Incomplete products remain in `Draft` mode and are excluded from static generation and `sitemap.xml`.
- Click the **Pre-Publish SEO Audit** button in the Admin toolbar at any time to inspect all draft items, missing images, and thin descriptions.

### Publishing Changes
When staff finishes updating products, clicking **Publish to Production** triggers `VITE_REBUILD_WEBHOOK_URL`, causing your hosting platform to re-run `npm run build` and publish updated static HTML files.

---

## 6. Enquiries & RFQ Lead Management

- **Database Lead Capture:** Every form submission from `/contact` is stored permanently in the `enquiries` table in Supabase.
- **Exporting Leads:** In the Supabase Dashboard, navigate to **Table Editor -> enquiries** and click **Export to CSV**.
- **Email Notifications:** The Contact Edge function dispatches HTML notification emails with lead details to the selected regional office (`India`, `Singapore`, or `USA`).

---

## 7. Security & Secret Hygiene

1. **Zero Secrets in Git:** Never commit `.env` or `.env.local` files. The repository includes `.env.example` with empty placeholders only.
2. **Row Level Security:** Public clients only have `SELECT` permission on published products and `INSERT` permission for submitting contact enquiries.
3. **Admin Protection:** Demo administrative functions are strictly deactivated in production unless explicitly enabled. Real administration is secured by Supabase Auth (JWT).
4. **Anti-Spam & DoS Protection:** Contact submissions are guarded by honeypot fields, submission timing checks, and database-enforced rate limits (max 5 requests per IP per hour).

---

## 8. Summary of Useful Commands

| Task | Command |
|---|---|
| Run development server | `npm run dev` |
| Build production bundle & SSG | `npm run build` |
| Preview production build locally | `npm run preview` |
| Regenerate static HTML & sitemap | `node scripts/build-static-catalog.mjs` |
| Verify Git status | `git status` |
