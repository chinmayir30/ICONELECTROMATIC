# PROJECT-STATE.md - Icon Electromatic website

Last updated: 2026-10-16
Rule: update this file at the end of every task. Never write passwords, keys or tokens here.

## Goal
Deliver a live, secure, SEO-ready B2B catalog site that the client's staff can edit
through a CMS, that sends every enquiry to the right office, that gives every product
an indexable page with unique content, and that is handed over with documentation,
client-owned accounts and one year of maintenance.

## Current stage
Stage 1 - Review and clean-up (in progress)

## Stage checklist
- [x] Frontend built (reviewed at commit e371aac, 15 Oct 2026)
- [x] Stage 0 - Preparation: scope freeze, tag frontend-v1, rule files, automation workflows and CI
- [ ] Stage 1 - Clean-up: private repo, branch protection, remove dead files, hide demo admin, remove false claims
- [ ] Stage 2 - Data: final Excel, data model, validation
- [ ] Stage 3 - Backend and CMS
- [ ] Stage 4 - Enquiry forms that really send email
- [ ] Stage 5 - Connect everything, real URLs, static pages
- [ ] Stage 6 - Security and safety nets
- [ ] Stage 7 - SEO for every product and the whole site
- [ ] Stage 8 - Testing and launch
- [ ] Stage 9 - Handover and maintenance

## Decisions (confirmed by the owner)
| Date | Decision | Why |
|---|---|---|
| 2026-10 | Build the backend first, then SEO | SEO fields must exist in the data model from day one |
| 2026-10 | Whole project is built with Antigravity | Owner's workflow |
| 2026-10 | The CMS exposes all intended website content as editable | Owner's requirement |
| 2026-10 | Work one step at a time with detailed explanations | Owner is a beginner and wants senior-developer practices |
| 2026-10 | Automate via /new_feature, /finish_feature and GitHub Actions CI | Standardize branching, enforce safety rules, and ensure every PR builds clean |

## Proposed, not yet confirmed
- Static site generation (Astro recommended) so every product is a real HTML page
- A managed headless CMS (for example Sanity) as the backend; Supabase with custom admin is the alternative
- A small serverless function for enquiries (validation, spam protection, regional email routing, saved copy)

## Known issues (as of 2026-10-16)
- Web addresses use #hash routing, so Google sees one page
- Contact and careers forms show a thank-you message but send nothing
- Demo admin: password is pre-filled in the page, edits and images are stored in the browser only, Employee Zone link is public, admin code ships in the production bundle
- Old fake product files (products.js, ProductDetail.js) are still in the repo
- "4,000+ products" and "24+ categories" appear in index.html, Home.js, ContentService.js and Admin.js
- No per-page titles or descriptions, canonical tags, sitemap, robots.txt or structured data
- Large files: 65 MB presentation, hero videos, main JS bundle about 645 KB
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