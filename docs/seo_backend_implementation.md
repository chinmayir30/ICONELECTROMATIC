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
- **Status:** In progress (PR #8)
- **What was built:**
  - `docs/seo_backend_implementation.md`: Added the master implementation log, technology roles, data audit summary, and phased plan.
  - `AGENTS.md`: Added item 6 to section 8 ("Technology used and how it works"), added rule on entry status progression (In progress -> Implemented upon merge), updated secrets rule (.env.example has empty/placeholder values only; real values in .env.local), and added section 9 safety rules against destructive commands with raw git diff approval.
  - `docs/PROJECT-STATE.md`: Added link pointing to `docs/seo_backend_implementation.md`.
- **Technology and role:** Markdown documentation and operational governance rules for verified task delivery.
- **How it works:** Ensures every feature or fix is recorded with evidence, status progression, and clear verification notes before and after merging.
- **Files and folders added or changed:** `docs/seo_backend_implementation.md`, `AGENTS.md`, `docs/PROJECT-STATE.md`.
- **Data and security notes:** No secrets added; rules explicitly forbid committing real secrets.
- **Checked (and how):** Built cleanly with `npm run build`; verified links and markdown formatting.
- **Not checked:** GitHub PR creation and CI run (will be checked upon push).
- **Undo:** Revert PR #8.

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
| 0 | Push and review the dead-code removal branch (local only on 19 Oct 2026) | Git, GitHub pull request, CI | In progress |
| 1 | Walking skeleton: 1 OEM (Rogers, 37 products available) and 5 products from database to a real product page with SEO | Supabase tables, SQL migrations, row-level security, Astro, JSON-LD | Planned |
| 2 | Image extraction and full catalog load (sample test first, unique product key, extraction report) | Python, WebP conversion, Node upload, `seed.sql` | Planned |
| 3 | Admin connected to Supabase: product editor, gallery, SEO card, pre-publish SEO audit, Publish button | Vite admin, Supabase JS client, Supabase Auth (invite-only, roles, two-factor), a `/publish` Edge Function holding the rebuild webhook | Planned |
| 4 | Contact form, enquiry saving, rate limiting, office routing | Supabase Edge Function (TypeScript), Resend, `rate_limits` table | Planned |
| Site port | All remaining pages move to Astro with real addresses, 404 page and sitemap | Astro, sitemap tool, `robots.txt` | Planned |
| Handover | Setup and editor guides, `.env.example`, migrations that recreate the backend | Markdown, SQL files | Planned |

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
