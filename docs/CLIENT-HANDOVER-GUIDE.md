# Client Deployment Handover & Operations Guide

**Project:** ICON Electromatic B2B Catalog & CMS Website
**Date:** November 2026
**Audience:** Client Technical Team, System Administrators, and Sales Operations

The client owns and performs production deployment. This guide describes the
implemented application and the configuration the client must supply. Production
hosting, domains, credentials, and infrastructure have not been provisioned or
verified by the development team.

For transfer of repository ownership, collaborator access, branch rules, and CI
responsibilities, see the [GitHub Source Handover Guide](./GITHUB-SOURCE-HANDOVER-GUIDE.md).

---

## 1. Project Overview & Capabilities

The repository implements an SEO-oriented B2B catalog platform for **Icon
Electromatic**, an authorized distributor of RF, microwave, and electronic
components. Production hosting and deployment have not yet been provisioned or
verified; client configuration and launch checks remain outstanding.

### Key Systems Delivered:
1. **Public B2B Product Catalog:**
   * Clean HTML5 history routing (no hash fragments, e.g. `/product/:id`).
   * Build-time static prerendering of all 169 authentic products (`dist/product/:id/index.html`) with unique metadata, single `<h1>`, and rich Schema.org JSON-LD structured data for search engine crawlers.
   * Valid `sitemap.xml` (176 canonical URLs) and dynamic backend sitemap endpoint (`/sitemap.xml`).
2. **Database-Backed CMS Content:**
   * Non-catalog website marketing copy (homepage hero/stats, about us, services, office contacts, partners, testimonials, and blogs) stored securely in PostgreSQL with browser-draft preservation.
3. **Regional Enquiry & RFQ Management:**
   * Public contact form supporting regional routing (India HQ, Singapore, USA).
   * Durable pre-commit saving in PostgreSQL before email dispatch.
   * Internal sales notifications sent to authoritative regional inboxes.
   * Branded customer acknowledgement emails dispatched only after internal notification succeeds.
   * Enquiry reference numbering (e.g. `#IE-ABC12345`).
   * Suppression of customer acknowledgements on spam/honeypot or internal failures; zero leakage of internal sales addresses.
4. **Administrative Enquiry Operations Portal:**
   * Filtered enquiry listing by office, workflow status, search keyword, and assigned staff member.
   * Workflow lifecycle management: `NEW`, `ASSIGNED`, `IN_PROGRESS`, `QUOTED`, `CONTACTED`, `CLOSED`, `ARCHIVED`.
   * Real-time KPI summary counters and unreviewed enquiry notification badges.
   * Chronological audit timeline recording customer acknowledgements, internal notifications, status transitions, staff assignments, customer replies, phone logs, and staff notes.
   * Dual CSV reporting: Enquiries Summary CSV and Communications Audit CSV with built-in formula-injection protection and UTF-8 BOM.
   * Safe data model: permanent deletion is disabled; records are preserved for auditing.

---

## 2. Architecture & Hosting Requirements

Recommended topology: host the static frontend on a static-site platform such as
Vercel, host the Express API on a managed Node.js service, and use managed
PostgreSQL and Cloudflare R2. The client chooses providers and regions. Production
Docker infrastructure is not required.

```
[ Client Browser / Administrator ]
               │
               ▼  HTTPS (TLS 1.3)
   https://iconelectromatic.com
               │
      ┌────────┴────────────────────────┐
      │  Static host / CDN / proxy      │
      └────────┬────────────────────────┘
               │
      ┌────────┴─────────────────────────────────┐
      │ Routes:                                  │
      │   /api/*          ──▶  Express API Server│
      │   /sitemap.xml    ──▶  Backend sitemap  │
      │   /* (Static)     ──▶  Frontend Static   │
      └──────────────────────────────────────────┘
```

### Frontend hosting

- Build from the repository root with Node.js 22, `npm ci`, then `npm run build`.
- Publish the generated `dist/` directory. The build prerenders product pages and
  the Home, About, Products, Blogs, and Contact pages.
- Configure the host to serve existing files/directories before applying the SPA
  fallback to `/index.html`.
- Set `VITE_SITE_ORIGIN` to the client's final HTTPS canonical site origin at
  build time. For same-origin proxying, keep `VITE_API_BASE_URL` as `/api`.
  The optional runtime `window.__ICON_API_BASE__` override takes precedence.

### Backend hosting

- Deploy with the complete repository checkout/build context, including `shared/`;
  the backend is not a standalone package.
- Use Node.js 22 and install backend dependencies from `backend/` with `npm ci`.
- Configure backend variables through the hosting provider's secret/config store.
  Start from `backend/` with `npm start` (equivalent to `node src/server.js`).
- Let the platform provide `PORT` where applicable. Keep the service behind the
  frontend reverse proxy where supported.

### Why same-origin `/api` reverse proxy is required
* **Session Cookie Hardening:** In production mode (`NODE_ENV=production`), admin authentication uses `__Host-` prefixed cookies (`__Host-admin_session` and `__Host-admin_csrf`). Browsers only store and transmit `__Host-` cookies when sent from the exact same origin over secure HTTPS with no domain attribute.
* **CORS Elimination:** Requests to `/api` are same-origin, eliminating complex cross-origin preflight requests.
* **Double-Submit CSRF Defense:** Modifying requests (`POST`, `PUT`, `PATCH`, `DELETE`) require both the secure CSRF cookie and an `X-CSRF-Token` header.

The current [vercel.json](../vercel.json) builds the static site, routes
`/sitemap.xml` to same-origin `/api/sitemap.xml`, and sends other unmatched paths
to `/index.html`. It does **not** contain a backend API origin or route `/api/*`
to a separately hosted service. Once the client chooses a backend provider, add
an explicit `/api/*` rewrite to that service and route the sitemap request to the
backend. Do not deploy the current configuration as though it already connects
the API. The backend origin is intentionally not invented here.

For self-managed hosting, an optional Nginx template is in
[Nginx template](./templates/nginx.conf.example), with
replacement and security notes in
[PRODUCTION-DEPLOYMENT-GUIDE.md](./PRODUCTION-DEPLOYMENT-GUIDE.md).

---

## 3. Required Environment Variables

All environment variables must be configured directly in your hosting platform dashboard. **Never commit `.env` files into Git.**

### Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Example / Placeholder | Client Responsibility / Description |
|---|---|---|---|
| `NODE_ENV` | **Yes** | `production` | Enables production security (enforces `__Host-` cookies, strict CORS, and disables localhost). |
| `PORT` | Hosting-dependent | Provider-assigned port (application default: `5000`) | Port on which the Express server listens. |
| `FRONTEND_URL` | **Yes** | `https://iconelectromatic.com,https://www.iconelectromatic.com` | Comma-separated list of allowed frontend web origins. |
| `TRUST_PROXY` | Hosting-dependent | Match the verified trusted proxy chain | Enables Express to resolve client IPs behind a proxy. Configure only when backend access is restricted to that proxy and it sanitizes or overwrites client-supplied forwarding headers. Never trust arbitrary forwarded headers or copy a generic hop count. |
| `SITE_ORIGIN` | **Yes** | `https://iconelectromatic.com` | Canonical public origin used for dynamic `/sitemap.xml` and prerender generation. |
| `DATABASE_URL` | **Yes** | `postgresql://USER:PASSWORD@HOST:5432/DB?schema=public` | Connection URL for your production PostgreSQL 14+ database. Use `sslmode=require` for cloud databases. |
| `RESEND_API_KEY` | Required for live email | Secret from provider | Resend sending API key; keep in the backend secret store. |
| `RESEND_FROM_EMAIL` | Required for live email | Sender on verified domain | Preferred sender setting. `ENQUIRY_FROM` is a legacy fallback only. |
| `CONTACT_EMAIL` | Required for live email | Client-approved fallback inbox | Receives general enquiries and career applications; regional enquiries use fixed server-side addresses. |
| `R2_ACCOUNT_ID` | Optional in app config | Cloudflare account identifier | The application uses the configured S3 endpoint and credentials directly. |
| `R2_ACCESS_KEY_ID` | Required for R2 | Secret from provider | Bucket-scoped R2 S3 API key ID. |
| `R2_SECRET_ACCESS_KEY` | Required for R2 | Secret from provider | Bucket-scoped R2 S3 API secret. |
| `R2_BUCKET_NAME` | Required for R2 | Client-selected bucket | Target bucket name. |
| `R2_ENDPOINT` | **Yes** | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | S3 API endpoint URL for your Cloudflare R2 account. |
| `R2_PUBLIC_DOMAIN` | Optional | Client-configured HTTPS domain | If set, public media redirects to this stable host, which must serve uploaded object keys. Otherwise the backend streams from the private bucket; a stream failure returns a non-cacheable `502` rather than an expiring public URL. |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are needed only for non-interactive first-admin
provisioning. `PRODUCTION_DATABASE_URL` is used only by the optional production
catalogue seeder. Supply these temporarily through a secret manager and remove
them after the operation.

### Frontend Environment Variables (`.env`)

| Variable Name | Required | Example / Placeholder | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Optional | `/api` | Build-time base path for API requests. A runtime `window.__ICON_API_BASE__` override takes precedence; otherwise, same-origin reverse-proxy setups use `/api`. |
| `VITE_SITE_ORIGIN` | Optional | `https://iconelectromatic.com` | Canonical site origin for static prerendered HTML links and social sharing tags. |

`SITE_ORIGIN` is the backend's canonical sitemap origin. The root
`.env.example` also lists it for build environments; use the client's canonical
HTTPS site origin when configuring the frontend build and backend service.

### Implementation status

**Implemented in the repository:** static product and core-page prerendering;
SPA fallback behavior; backend API and dynamic sitemap routes; Prisma migrations;
guarded read-only-by-default catalogue seeding; interactive and secret-store
admin provisioning; backend-mediated R2 upload and delivery; Resend-based email
dispatch with server-side regional routing.

**Client configuration and launch tasks:** choose frontend/backend/PostgreSQL
providers and regions; set production environment variables; configure same-origin
API and sitemap routing; apply migrations after target and backup verification;
provision the first administrator; select and authorize initial catalogue
population; configure R2, Resend, regional inboxes, DNS, and HTTPS; run the
verification checklist below.

**Future or unresolved items:** client-specific host/rewrite values cannot be
filled in before hosting is selected; R2 bulk migration and retired-object
cleanup are not implemented; `CmsDocument` remains pending a separate schema and
migration review. See [PROJECT-STATE.md](./PROJECT-STATE.md) and
[IMAGE-STORAGE-R2-INTEGRATION.md](./IMAGE-STORAGE-R2-INTEGRATION.md).

For the complete Prisma entity/field reference, see
[DATA-DICTIONARY.md](./DATA-DICTIONARY.md). For client-authorized backup,
restore, migration recovery, and incident procedures, see
[DISASTER-RECOVERY-RUNBOOK.md](./DISASTER-RECOVERY-RUNBOOK.md).

---

## 4. Regional Sales Mailboxes Setup

The backend features authoritative server-side regional enquiry routing. The client must ensure the following mailboxes or email aliases exist on your corporate mail server (`@iconelectromatic.com`):

1. **India HQ (Bengaluru):**
   * Expected address: `salesiepl@iconelectromatic.com`
   * Receives customer enquiries targeted to India HQ.
2. **Singapore Liaison Office:**
   * Expected address: `IESing@iconelectromatic.com`
   * Receives customer enquiries targeted to Singapore and Southeast Asia.
3. **USA Liaison Office:**
   * Expected address: `salesiellc@iconelectromatic.com`
   * Receives customer enquiries targeted to the Americas.
4. **General & Fallback Inbox (`CONTACT_EMAIL`):**
   * Configurable address (e.g. `sales@iconelectromatic.com` or `info@iconelectromatic.com`).
   * Receives enquiries where the customer selected no specific office, general RFQs, and career resume submissions.

> [!IMPORTANT]
> Verify that all three regional addresses are active and configured to receive inbound mail before pointing production traffic to the contact form.

---

## 5. Resend Email Delivery & Domain Verification

The website uses Resend for transactional customer notifications and internal sales routing:

1. **Sign Up & Add Domain:**
   Log in to [Resend](https://resend.com) and add your corporate domain: `iconelectromatic.com`.
2. **DNS Verification:**
   In your own Resend account, open the domain setup page and copy the exact DNS
   records and names it provides for the selected sending region. Add those
   records at the authoritative DNS provider. Do not assume a fixed number or
   type of records; requirements can vary. Coordinate SPF and DMARC with the
   client's existing mail administrator, and do not replace existing mail
   records blindly.
3. **Verification Check:**
   Confirm in Resend that the domain status is **Verified**. Emails sent from an unverified domain in production mode will be blocked.
4. **Sender Configuration:**
   Set `RESEND_FROM_EMAIL` to an address on your verified domain (e.g., `notifications@iconelectromatic.com`).

---

## 6. Cloudflare R2 Persistent Media Storage

Cloudflare R2 provides zero-egress S3-compatible storage for product images and CMS media:

1. **Bucket Creation:**
   Create a private bucket named `icon-electromatic-media` in the Cloudflare Dashboard under **R2**. Keep public access disabled by default.
2. **API Token Generation:**
   Under **Manage R2 API Tokens**, click **Create API Token** with **Object Read & Write** permissions scoped to your media bucket.
3. **Environment Setup:**
   Copy the Access Key ID, Secret Access Key, and S3 Endpoint into the backend environment variables.
4. **Implemented upload and delivery:**
   The Admin CMS sends uploads to authenticated backend
   `POST /api/media/upload`. The backend validates image bytes and size, writes
   the object to R2, then records the media asset in PostgreSQL. Public delivery
   uses `GET /api/media/file/:id`; by default the backend streams from the private
   bucket. A public stream failure returns a non-cacheable `502`; it does not
   redirect visitors to a short-lived signed URL. If `R2_PUBLIC_DOMAIN` is
   configured, the route redirects to that stable host instead. Browser-to-R2
   uploads and bucket CORS are not part of this implemented upload flow.

---

## 7. Database Migration & Provisioning Runbook

The existing local Docker PostgreSQL container and database
`icon_electromatic_test` on port `5433` are for development/testing only. They
are not production infrastructure. The client should use a selected managed
PostgreSQL service unless its chosen hosting design has a documented reason to
self-host a database. No production Dockerfile or Compose stack is included.

When deploying to your production infrastructure, run the following steps in sequence:

### Step 1: Install Dependencies
```bash
# In repository root
npm ci

# In backend directory
cd backend
npm ci
```

### Step 2: Apply Database Migrations
Prisma migrations create all tables, enums, indexes, and relations automatically:
```bash
cd backend
npm run migrate
```
This runs Prisma `migrate deploy` from the backend package, applying pending
checked-in migrations without resetting the database. Confirm the provider's
PostgreSQL compatibility, backup/restore procedure, TLS settings, and the exact
target before running it. Do not run development-only migration-reset commands
against production.

### Step 3: Provision the First Administrator Account
Create your first active system administrator interactively:
```bash
cd backend
node scripts/provision-admin.js
```
* **Email:** Enter the administrator's corporate email.
* **Password:** Enter a secure password (minimum 14 characters, hidden input).
* **Confirm:** Re-enter the password.

The script hashes the password with a cryptographic salt and creates an active administrator with role `ADMIN`.

For deployment automation, provision with `--non-interactive` and pass `ADMIN_EMAIL` and `ADMIN_PASSWORD` through the platform's secret environment-variable store. Do not put the password in command-line arguments, logs, or shell history:
```bash
cd backend
node scripts/provision-admin.js --non-interactive
```
Non-interactive mode requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the
provider's secret store. Do not pass passwords as command-line arguments, print
them, or place them in shell history. Remove temporary provisioning secrets
after setup.

### Step 3b: Verify Administrator Recovery Email (Mandatory Security Practice)
Upon administrator account provisioning via `provision-admin.js`, the administrator's login email is automatically recorded as the initial recovery email awaiting verification (`recoveryEmailVerifiedAt: null`). It is never automatically marked as verified.

Immediately after starting the application:
1. Sign in to `https://iconelectromatic.com/admin` (or `/admin` under your deployed domain) using the provisioned credentials.
2. In the navigation sidebar under **ACCOUNT**, click **Account Security**.
3. Under **Emergency Recovery Address**, the administrator's login email is displayed as the default recovery destination awaiting verification.
4. Click **Verify Login Email**, enter the current administrator password to complete password step-up authentication, and click **Send Verification Link**.
5. A verification email containing a 30-minute confirmation link will be dispatched via Resend strictly to the login email address.
6. Open the verification email, click the link (`/admin/verify-recovery?token=...`), and explicitly click the **Confirm & Verify Email** button on the page.
7. Return to `/admin` and confirm that the Account Security tab now displays the **Active & Verified (Login Email)** badge with a verification timestamp.
8. *(Optional)* If the administrator wishes to receive password reset links at a dedicated personal address instead, they can click **Add Personal Recovery Email**, enter the personal address, verify with password step-up, and complete verification via the link sent strictly to that personal address. The existing verified recovery address remains active until replacement verification succeeds.

> [!IMPORTANT]
> Self-service password recovery is unavailable until a recovery email is verified. If an administrator forgets their password while the recovery email remains unverified, they cannot reset it from the web interface.

### Step 4: Initial Catalog Transfer to PostgreSQL
1. Start the server and visit `/admin` in your browser.
2. Sign in with the newly provisioned administrator account.
3. Go to the **Catalog** tab.
4. A notice will indicate that PostgreSQL has 0 catalog records. Click **Execute Transfer to PostgreSQL**.
5. The system will perform an automatic pre-execution dry-run audit, then atomically populate all **15 OEM principals**, **88 product categories**, and **169 authentic products** into PostgreSQL.

#### Optional production seed command

The Admin CMS transfer above is preferred. Use the dedicated production seed command only when the client explicitly chooses a baseline import and an authorized operator has confirmed the target. It does not delete or replace catalog records: it seeds only a clean, empty catalog, returns without changes for an already consistent baseline, and stops on partial, conflicting, or inconsistent data.

1. Arrange a verified database backup and obtain the production connection URL from the client's hosting provider. Provide it only as `PRODUCTION_DATABASE_URL` through a secure environment-variable or secret manager. The catalogue seeder requires `sslmode=verify-full`, which verifies both the TLS certificate chain and server hostname; it rejects `require` and `verify-ca`.
2. Run a read-only inspection first:
   ```bash
   cd backend
   npm run seed:production-catalog
   ```
3. If and only if the inspection confirms the intended production host and an empty catalog, run the apply command. Replace the placeholders using the exact host, port, and database name from the authorized connection URL:
   ```bash
   npm run seed:production-catalog -- --apply --confirm-production-seed="PRODUCTION_HOST:PRODUCTION_PORT/PRODUCTION_DATABASE"
   ```
4. Review the reported target and resulting status. Never use a test URL, paste credentials into the confirmation argument, or run the apply command without an approved backup and client authorization.

---

## 8. Build & Deployment Commands

### Frontend Build & Prerender
```bash
# In repository root
npm run build
```
* Builds the optimized Vite production bundle in `dist/`.
* Runs `scripts/prerender.js` to prerender all 169 product pages as static HTML at `dist/product/:id/index.html`.
* Generates `public/sitemap.xml` with 176 canonical URLs and `public/robots.txt`.

### Backend Server Start
```bash
cd backend
npm start
```
* Starts `src/server.js` using the provider-assigned `PORT`, or the application's
  default port when the provider does not set one.

### Frontend Tests

From the repository root, run the three frontend test files directly:

```bash
node --test test/liveCatalog.test.js test/frontendReliability.test.js test/adminUpload.test.js
```

These tests use local mocks and do not connect to PostgreSQL, send email, or
access Cloudflare R2.

### Backend Tests

From the repository root, set `TEST_DATABASE_URL` in the local PowerShell
session to the Docker test database `icon_electromatic_test` on port `5433`,
then run:

```powershell
npm test
```

The test runner rejects missing or non-local test database URLs, sets
`NODE_ENV=test`, and enables the suite's CI skips for tests that require live R2
or production-seeded catalog data. Locally it accepts only
`icon_electromatic_test` on port `5433`. GitHub Actions uses its isolated
`icon_ci_test` database on port `5432`, and the runner requires GitHub Actions
run metadata before allowing that exception. The test suite includes
database-backed tests and may write test fixtures; never point it at the native
CMS database on port `5432` or at any database containing data that must be
preserved. The runner does not apply migrations or reset databases.

The root `npm test` command delegates to the backend test runner; it is not the
frontend test command. The project does not use npm workspaces.

### Content Security Policy

The Express backend serves API/media responses, not the static frontend
document. Helmet's disabled CSP in `backend/src/server.js` therefore does not
protect the website HTML. Put any CSP header on the selected frontend host
(such as the client-managed Nginx serving `dist/`), not only on the API. The
frontend host is not selected, so this policy is for **Report-Only testing
only**; do not enforce it yet.

#### Resource and inline-code inventory

- The Vite frontend loads its application scripts, styles, images, and default
  hero video from the site itself. Google Fonts use
  `https://fonts.googleapis.com` for stylesheets and
  `https://fonts.gstatic.com` for font files. Font Awesome CSS and fonts use
  `https://cdnjs.cloudflare.com`.
- The existing UI contains inline `style` attributes, including dynamically
  rendered public and admin/CMS markup. It also has inline JavaScript event
  handlers (including image-error fallbacks and a reload fallback). A strict
  `script-src-attr 'none'` will therefore produce Report-Only violations for
  those handlers; it will not block them in Report-Only mode. No `eval()` or
  `new Function()` use was found in the current frontend source.
- Prerendered product pages contain inline JSON-LD structured data. Check
  browser reports and confirm structured data remains present when reviewing
  the policy; do not add a broad inline-script exception merely to suppress a
  report.
- `img-src` needs the site origin, `data:`, and `blob:` for local, data, and
  browser-generated preview images. Source-defined product images include
  `https://www.minicircuits.com`. CMS/catalogue content can supply other image
  URLs, so inspect actual approved content and add only its required origins.
- `media-src` needs the site origin for the local default hero video. Add an
  external media origin only if an approved deployed CMS value actually uses
  one. The admin video field by itself does not establish that YouTube/Vimeo
  frames are loaded by the current application.
- API calls default to same-origin `/api`. If the client configures
  `VITE_API_BASE_URL` or `window.__ICON_API_BASE__` to a cross-origin API,
  add that exact origin to `connect-src`. With private R2, public media is
  streamed through the same-origin API. If the client configures
  `R2_PUBLIC_DOMAIN`, the media route redirects to that host; add its exact
  origin to `img-src` only when that delivery mode is selected.
- Manufacturer and social URLs used as ordinary links do not belong in
  `img-src` or `connect-src` unless browser testing shows that the page actually
  loads resources or makes connections to them.

The separate root-level `com.html` file is a legacy WordPress-exported page
with its own inline scripts/styles and external WordPress resources. The current
Vite build uses `index.html` as its input; `com.html` is not part of the normal
Vite `dist/` build. Its deployment/serving status has not been confirmed. If
the client serves it, review it separately and configure/test the policy for
that page's actual resources; do not add its legacy origins to the main
application policy without evidence.

#### CSP Report-Only draft

The following is a complete **draft for Report-Only review**, not a ready-to-use
enforcing header. Before configuring it, replace each bracketed placeholder
with the exact client-approved origin(s), or remove the placeholder when that
origin is not needed. Do not include brackets literally. `'self'` represents
the final frontend origin.

```text
Content-Security-Policy-Report-Only: default-src 'self'; base-uri 'self'; object-src 'none'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https://www.minicircuits.com [approved-R2-CDN-or-other-image-origins]; media-src 'self' [approved-external-media-origins]; connect-src 'self' https://challenges.cloudflare.com [approved-cross-origin-API-origin]
```

`'unsafe-inline'` is retained for styles because inline style attributes are
widespread. `script-src-attr 'none'` deliberately reports the existing inline
event handlers for review. Report-Only does not block either resource. The draft
does not permit `unsafe-eval`, inline scripts, or frames. Confirm JSON-LD
behavior in supported browsers during testing. The `frame-ancestors 'none'`
setting disallows embedding the site; confirm the client has no legitimate
embedding requirement before any later enforcement.

#### Report-Only browser review and reporting

Configure the draft only as `Content-Security-Policy-Report-Only` on the
frontend host. Open browser developer tools, enable Preserve Log in the
Console and Network panels, then visit representative public pages (home,
catalogue, product detail, contact, and other deployed prerendered pages).
Also exercise the admin login, `/admin`, CMS editing and previews, API-backed
catalogue/content loads, form flows, fonts, images, and the hero video. Check
the console for policy violations and the Network panel for failed requests.
Report-Only should report violations without blocking these resources.

For centralized reports, the client must select and operate a report collector
and approve its access, rate limiting, and retention policy. The application
does not provide a CSP report endpoint. Configure a client-controlled
`Reporting-Endpoints` value and the appropriate `report-to` directive (and
`report-uri` only if required for legacy browser support) at the selected
frontend host; verify report delivery without sending reports to an
unconfigured application endpoint. Review reported directives and destinations,
add only justified origins, and repeat the browser checks.

The final hosting origin, whether the API is same-origin or cross-origin, the
selected R2 public domain/CDN, any externally hosted CMS images or media, and
the reporting collector are client-dependent. Confirm these values from the
client's deployment and approved content before adjusting the draft. Keep
enforcement deferred until the host is selected, Report-Only results are
reviewed across public and admin/CMS workflows, legitimate violations are
resolved, and the client approves the final policy.

#### Cloudflare Turnstile handover

Turnstile protects the homepage enquiry, Contact/RFQ, and Careers forms. It is
an additional bot check, not a replacement for server-side validation, request
rate limits, or the existing hidden honeypot fields. Those controls address
different failure modes and remain enabled.

**Developer implementation already completed**

- The frontend explicitly loads Cloudflare's Turnstile script once and renders
  independent widgets for the forms. Contact/RFQ and the homepage enquiry use
  the `contact_enquiry` action; Careers uses `careers_application`.
- Each form sends its widget token in the `X-Turnstile-Token` request header.
  The backend calls Cloudflare Siteverify with a three-second timeout and
  verifies success, the exact action, and a hostname listed in `FRONTEND_URL`.
- Careers verification runs after rate limiting and before Multer processes or
  buffers the resume. Rejected requests therefore do not process the upload.
- Missing, invalid, expired, reused, misconfigured, or unverifiable tokens fail
  closed. The backend does not accept a submission by bypassing verification.
  Tokens are single-use; an expired or rejected challenge is reset so the user
  can complete a fresh challenge and retry without clearing form fields.
- Automated tests mock Turnstile and Siteverify. They must not call Cloudflare
  or use production keys.

**Client responsibilities: Cloudflare and deployment configuration**

1. In the client's Cloudflare account, create a Turnstile widget for the
   website, choose the widget mode appropriate to the approved user experience,
   and register every exact frontend hostname that will serve the production
   forms. Register `www` and non-`www` separately if both are used; do not rely
   on an unconfigured alias or wildcard.
2. Provide the widget's **site key** to the frontend build environment as
   `VITE_TURNSTILE_SITE_KEY`. It is public and is embedded in frontend assets;
   it is not an API secret. The root `.env.example` contains a placeholder.
3. Store the widget's **secret key** only in the backend deployment's private
   environment or secret manager as `TURNSTILE_SECRET_KEY`. It must never be
   put in frontend variables, code, build arguments that become public assets,
   logs, API responses, documentation with real values, or Git. The
   `backend/.env.example` contains only a placeholder.
4. Configure backend `FRONTEND_URL` with comma-separated, exact frontend
   origins, including the production hostnames above. The backend uses these
   origins both for its CORS allowlist and to validate Siteverify's returned
   hostname. Production entries must use HTTPS and an origin only (no path,
   credentials, query, fragment, or non-default port).
5. Configure these values independently in the client's local development and
   production environments. Use only client-approved non-production
   credentials for manual local widget testing; never copy production keys into
   local development or automated test environments. Keep local `.env` files
   untracked. Automated verification tests use mocks and need no keys.
6. Confirm the final hosting and API origins, then retain
   `https://challenges.cloudflare.com` in `script-src`, `frame-src`, and
   `connect-src` of the **Report-Only draft above**. These entries are required
   for the widget script, challenge frame, and browser communications. Do not
   enable an enforcing CSP as part of this setup.

The `.env.example` files document the variable names only; they do not
configure a deployment. The client or hosting operator owns provisioning,
secret storage, hostname registration, frontend build variables, backend
runtime variables, and any CSP Report-Only response header. Developers own the
application integration, mock-based regression tests, and these handover
instructions. No live Cloudflare verification has been performed, and neither
key is configured in this repository.

**Troubleshooting**

- If a widget is blank or reports a script error, confirm the frontend can load
  `https://challenges.cloudflare.com`, the CSP Report-Only report includes the
  required directives, and `VITE_TURNSTILE_SITE_KEY` is configured in the
  frontend build environment. The form must remain blocked until verification
  works; rebuild/redeploy the frontend after changing its build variable.
- `TURNSTILE_REQUIRED` or `TURNSTILE_INVALID` means the token was missing or
  malformed. Confirm the widget completed and that the form request includes
  `X-Turnstile-Token`.
- `TURNSTILE_REJECTED` indicates provider rejection, expiry/reuse, or a
  hostname/action mismatch. Recomplete the challenge; verify that the widget
  hostname is explicitly registered and the matching origin is included in
  `FRONTEND_URL`. Do not loosen hostname or action validation.
- `TURNSTILE_UNAVAILABLE` means Siteverify could not be reached or returned an
  unusable response. `TURNSTILE_NOT_CONFIGURED` means required backend
  configuration is missing or invalid. Both fail closed; an operator should
  check service connectivity and secret-manager/environment configuration.
- `ENQUIRY_SAVED_EMAIL_FAILED` and `CAREER_SAVED_EMAIL_FAILED` mean the
  submission was saved but email dispatch failed. Do not resubmit normally;
  contact the client team to avoid creating a duplicate submission.
- If a connection failure leaves submission status unknown, the page warns that
  it may already have been received and prevents ordinary resubmission. Contact
  the team before attempting another submission.

---

## 9. Administrator Guide: Enquiries & CSV Reports

Access the portal at `https://iconelectromatic.com/admin` (or `/admin` under your deployed domain).

### Navigation & Views
1. **Sidebar Badge:** Displays the real-time count of unreviewed (`NEW`) customer enquiries.
2. **KPI Summary Cards:** Click any KPI card (All, New, Assigned/Active, Quoted, Closed/Archived) to immediately filter the listing.
3. **Search & Filters:** Filter enquiries by target office (India HQ, Singapore, USA), workflow status, staff member, or customer search terms.

### Managing an Enquiry
Click **View Details** on any enquiry row to open the operational workspace:
1. **Customer & Enquiry Details:** View customer name, company, email, phone, target office, and full technical message.
2. **Workflow Status:** Advance the status across the business lifecycle:
   * `NEW` — Unreviewed submission.
   * `ASSIGNED` — Staff assigned; auto-advances when an assignee is selected.
   * `IN_PROGRESS` — Active review or RFQ calculation.
   * `QUOTED` — Formal quotation issued to customer.
   * `CONTACTED` — Customer contacted for clarifications.
   * `CLOSED` — Enquiry completed.
   * `ARCHIVED` — Inactive or soft-deleted record.
3. **Staff Assignment:** Assign the enquiry to any active staff member.
4. **Audit Timeline:** View the chronological record of:
   * Automated customer acknowledgement delivery (with delivery status and failure diagnostics).
   * Internal sales notification routing.
   * Status change audits (who changed it, old status, new status, timestamp).
   * Staff assignment logs (who assigned it, previous assignee, new assignee).
   * Manually recorded customer email replies, phone call notes, and internal team memos.
5. **Optimistic Concurrency Protection:** If two staff members edit the same enquiry simultaneously, the portal detects the collision (HTTP 409) and prompts to reload the latest data without overwriting edits.

### Administrator Account Security & Password Recovery

The CMS provides self-service password recovery and account security controls for administrators:

#### 1. Account Security Tab Navigation & Status
In the authenticated admin portal (`/admin`), click **Account Security** in the sidebar:
- **Masked Address Display:** Displays the administrator's recovery email in privacy-preserving masked format (e.g. `a***n@domain.com`) alongside their permanent login email.
- **Status Badges & Architecture:**
  - `Active & Verified (Login Email)`: The administrator's primary login email is verified and serves as the active recovery destination for password resets.
  - `Active & Verified (Personal Email)`: A separate personal recovery email has been verified and serves as the active recovery destination.
  - `Pending Verification`: The default login email or a replacement personal address has been requested but not yet verified. **Any existing verified recovery address remains active until replacement verification succeeds.**
  - `Not Configured`: No recovery address is configured (e.g. if a personal recovery email was removed without re-verifying the login email). Self-service password recovery is disabled.

#### 2. Default Login Email Verification and Optional Personal Recovery Email
- **Verifying the Default Login Email:** Newly provisioned administrators have their login email recorded as the default recovery email awaiting verification. Clicking **Verify Login Email** and entering the account password dispatches a verification link strictly to the login email (`POST /api/auth/recovery-email/request`).
- **Adding/Replacing a Personal Recovery Email:** Click **Add Personal Recovery Email** (or **Change Address**), enter the personal recovery email, and enter the account password for password step-up authentication (`POST /api/auth/recovery-email/request`). The verification link is dispatched strictly to that proposed personal address (never to the login email).
- **Verifying the Address:** The system dispatches a verification link (`/admin/verify-recovery?token=<64-hex>`). Upon visiting the link, the page requires an explicit click on **Confirm & Verify Email** (`POST /api/auth/recovery-email/confirm`). This activates the new recovery address and deactivates any previous recovery address.
- **Removing a Personal Recovery Address:** Click **Remove**, review the confirmation warning, enter the current password, and confirm (`POST /api/auth/recovery-email/remove`). Security alerts are dispatched to both the primary login email and the removed recovery address. The default login email cannot be removed, but can be replaced by configuring a personal recovery email.
- **Permanent Login Identity:** The administrator's primary login email never changes through recovery address operations. Personal recovery emails cannot authenticate at `/admin/login`.

#### 3. Requesting a Password Reset (Forgot Password)
- **Initiation:** On the `/admin` login screen, click **Forgot password?**, enter either the administrator's permanent login email or their verified recovery email, and click **Send Reset Link** (`POST /api/auth/forgot-password`). Both addresses resolve to the same administrator account.
- **Destination:** Reset links are sent strictly to the **active verified recovery email address** configured for that account (either the verified default login email or the verified personal recovery email). Reset links are never sent to unverified addresses, and are never dispatched to multiple addresses simultaneously.
- **Permanent Login Identity Preserved:** Resetting a password does not replace the administrator's login email with their recovery email; administrators always continue logging in with their permanent login email.
- **Enumeration Defense:** The endpoint always returns an identical generic response:
  `"If an active account exists with a verified recovery address, a password reset link has been dispatched."`
  This response is returned regardless of whether the account exists, is inactive, or has no verified recovery email, preventing account enumeration.
- **Rate Limiting:** Protected by dual IP-based and email-based rate limiters (3 requests per 15 minutes), augmented by account-level and cross-identifier throttling so that alternating between the login email and recovery email cannot bypass rate limits.
- **Accounts Without a Verified Recovery Address:** If no verified recovery address is configured (or the default login email has not yet been verified), the generic 200 response is still returned to callers, but no email is dispatched. The account cannot be recovered through self-service.

#### 4. Completing a Password Reset
- **Reset Page:** The link opens `/admin/reset-password?token=<64-hex>` (or `/reset-password?token=<64-hex>`).
- **Password Policy:** The form enforces client-side validation of the 14–1024 character password policy and matching confirmation before submission.
- **Submission:** Submitting sends `POST /api/auth/reset-password`.
- **All-Session Revocation:** Upon a successful reset, **all active sessions for that administrator are immediately revoked across all browsers and devices**.
- **Browser State:** The frontend API client (`ApiService.js`) explicitly clears its cached in-memory CSRF token (`csrfToken = null`) upon reset completion.

#### 5. Token Lifespan and Email Delivery Characteristics
- **30-Minute Token Lifespan:** Both recovery verification tokens and password reset tokens expire exactly **30 minutes** after generation. This 30-minute window represents the token's validity period before expiration, **not an email-delivery delay**.
- **Single-Use Behavior:** Tokens are consumed atomically in the database (`usedAt = now()`); subsequent replay attempts fail.
- **Email Delivery Timing:** Outbound email delivery is performed via Resend. The system does not guarantee immediate delivery; delivery speed depends on the client's verified domain DNS health, Resend service availability, and destination mail server processing.
- **Address-Bar Scrubbing vs. HTTP Referer:** When a public verification or reset link is loaded in the browser, client-side JavaScript immediately scrubs the `?token=...` query parameter from the address bar and browser history using `window.history.replaceState`. This prevents the token from remaining visible on screen or in local browser history. However, address-bar scrubbing does not alter the initial HTTP `Referer` header sent by external mail clients during navigation; full Referer protection requires host-level or document-level `Referrer-Policy: no-referrer` configuration.

#### 6. Emergency Recovery Reference
If an administrator is locked out and cannot use self-service recovery (e.g., no recovery email was configured or the recovery mailbox is permanently inaccessible), refer to the operator-assisted recovery and emergency CLI reset procedures documented in [DISASTER-RECOVERY-RUNBOOK.md](./DISASTER-RECOVERY-RUNBOOK.md).

---

## 10. Downloading & Opening CSV Reports

Two distinct CSV export reports are available in the **Enquiries** tab header for authorized administrators:

### 1. Export Enquiries CSV
* **How to access:** Click **Export Enquiries CSV** in the top-right toolbar.
* **Scope:** Exports all enquiries matching the currently applied filters (not just the current page).
* **Contents (15 columns):** Enquiry Reference Code, Submission Date (UTC), Customer Name, Company, Customer Email, Phone, Target Office, Enquiry Subject, Model/Band, Workflow Status, Assigned Staff, Dispatch Status, Total Communications Count, Latest Activity Date (UTC), and Customer Message.
* **Default Filename:** `icon-enquiries-YYYY-MM-DD.csv`.

### 2. Export Communications CSV
* **How to access:** Click **Export Communications CSV** in the toolbar.
* **Scope:** Full operational audit trail. Exports one row per communication event across all matching enquiries.
* **Contents (15 columns):** Enquiry Reference, Enquiry Date, Customer Name, Customer Email, Company, Target Office, Current Workflow Status, Communication ID, Event Date (UTC), Event Type (`EMAIL_OUTBOUND`, `CUSTOMER_REPLY`, `PHONE_LOG`, `INTERNAL_NOTE`, `STATUS_CHANGE`), Author/System, Subject/Action, Body/Notes, Delivery Status (`DELIVERED`, `FAILED`, `SKIPPED`), and Channel/Recipient.
* **Default Filename:** `icon-communications-YYYY-MM-DD.csv`.

### Opening CSV Files in Microsoft Excel
* **UTF-8 Compatibility:** Both CSV files include a UTF-8 Byte Order Mark (`\uFEFF`). When opened directly in Microsoft Excel (Windows or Mac), international company names, special characters, and formatting will render cleanly without requiring manual text-import wizard configuration.
* **Spreadsheet Security:** Both exports feature automatic formula-injection defense. Any cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is safely prefixed with a single quote (`'`), preventing malicious spreadsheet macros or calculation formulas from executing.

> [!NOTE]
> CSV exports are strictly protected by administrator authentication. Public website visitors cannot access or download enquiry data.

---

## 11. Pre-Launch Verification Checklist

Before directing public DNS traffic to the live production server:

- [ ] Production PostgreSQL 14+ database created and connection string tested.
- [ ] Database migrations applied cleanly via `npm run migrate`.
- [ ] First administrator provisioned via `node scripts/provision-admin.js`.
- [ ] Recovery email configured and verified for administrator accounts in Account Security.
- [ ] Client-authorized live recovery email and password reset test completed using the client's configured Resend sending domain (developer automated tests use mocks and do not establish successful live Resend delivery).
- [ ] Emergency CLI procedure (`backend/scripts/reset-admin-password.js`) reviewed by the client's authorized technical operator in [DISASTER-RECOVERY-RUNBOOK.md](./DISASTER-RECOVERY-RUNBOOK.md).
- [ ] Initial catalog imported via Admin CMS (15 OEMs, 88 categories, 169 products).
- [ ] Resend corporate domain `iconelectromatic.com` verified with SPF, DKIM, and DMARC DNS records.
- [ ] Three regional sales mailboxes (`salesiepl@...`, `IESing@...`, `salesiellc@...`) verified active on corporate email server.
- [ ] Cloudflare R2 bucket `icon-electromatic-media` created and API credentials configured.
- [ ] Reverse proxy configured to route `/api/*` and `/sitemap.xml` to the backend.
- [ ] Static host serves prerendered files before SPA fallback and has the final canonical site origin configured at build time.
- [ ] Backend runs on Node.js 22, has the full repository context (including `shared/`), and has its health check configured.
- [ ] API and sitemap rewrites point to the client-selected backend origin; `/api/*` does not fall through to the SPA HTML.
- [ ] `NODE_ENV=production` set in backend hosting dashboard.
- [ ] DNS points to the chosen frontend host, HTTPS is active, and all public pages and API paths use HTTPS.
- [ ] Backend access is restricted to the verified proxy; that proxy sanitizes or overwrites forwarded headers; `TRUST_PROXY` matches only that verified chain. If unverified, leave proxy trust disabled.
- [ ] Database backup and restore are confirmed before migrations or catalogue seeding.
- [ ] Client confirms whether to use the Admin CMS transfer or guarded baseline seed for initial catalogue population.
- [ ] All automated tests pass (`node --test`).
- [ ] Frontend built and prerendered via `npm run build`.
- [ ] Manual browser check of `/admin` login, enquiry timeline, and CSV downloads completed.
- [ ] Backup and restore process documented and restore tested in an isolated recovery database.
- [ ] Database model reference reviewed: [DATA-DICTIONARY.md](./DATA-DICTIONARY.md).
- [ ] Recovery and incident procedures reviewed: [DISASTER-RECOVERY-RUNBOOK.md](./DISASTER-RECOVERY-RUNBOOK.md).
