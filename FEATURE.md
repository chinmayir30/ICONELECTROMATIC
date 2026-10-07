# 📋 ICON ELECTROMATIC — Features & Fixes Log (`FEATURE.md`)

> **Project:** ICON ELECTROMATIC Web Application  
> **Repository:** [`chinmayir30/ICONELECTROMATIC`](https://github.com/chinmayir30/ICONELECTROMATIC)  
> **Purpose:** Official log tracking all new features, bug fixes, visual refinements, affected pages, and release dates.  
> **Standard:** Every contributor or AI agent making changes must log their updates here following this structure.

---

## 📅 Log Entries

---

### **2026-10-07**

* **Category:** Services Page — Core Services Primary & Secondary Title Interchange
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js)
  * **Type:** UX/Content Hierarchy Alignment (Dark & Light Themes)
  * **Details:**
    * Interchanged the primary (`.service-primary-title`) and secondary (`.service-secondary-title`) titles across all 4 service pillar cards:
      * **Card 1:** Primary became `Representation of Global Leaders` and secondary became `Global Distribution & Sourcing`.
      * **Card 2:** Primary became `Product Supply and Logistics` and secondary became `Supply Chain & Logistics`.
      * **Card 3:** Primary became `Design Services` and secondary became `RF Engineering & Advisory`.
      * **Card 4:** Primary became `Business Consultancy` and secondary became `Strategic Partnerships`.
    * Fully unified and consistent across both light and dark themes with original typography and accent color hierarchy preserved.

* **Category:** Products & Blogs Pages — Removal of Outbound "Official Website" & "Official Portal" Links
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/pages/Blogs.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Blogs.js)
  * **Type:** Business Logic & Customer Retention (Zero Outbound OEM Referral Links)
  * **Details:**
    * **Products Page OEM Banner:**
      * Removed the external `Official Website` button (`<a class="oem-external-site-btn">`) that previously appeared in the top banner when selecting any manufacturer (e.g. Rogers Corporation).
      * Preserved clean navigation with the `All Companies` back button and catalog category browsing.
    * **Blogs Page OEM Header & Tabs:**
      * Removed the `Official Portal` button (`<a class="btn-relay-border">`) from the header action bar when viewing any OEM's blog release hub.
      * Removed the `Official Portals` filter tab button and external links directory section (`Official Portals & Engineering Tools`), ensuring prospective customers interact exclusively with ICON Electromatic's application engineering team via the `Technical Inquiry` and quote request actions.
      * Updated blog release description text and tab counts cleanly.

* **Category:** All Pages — Footer Differentiator & Surface Contrast System
  * **Page / Files:** [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css), [`src/components/Footer.js`](file:///d:/ICON%20ELECTROMATIC/src/components/Footer.js)
  * **Type:** UX/UI Layout Differentiation & Visual Separation (Dark & Light Themes)
  * **Details:**
    * **Signature Red Top Differentiator Border (`#e32726`):**
      * Added a prominent 4px signature crimson red border (`border-top: 4px solid #e32726 !important;`) running across the full width at the top boundary of `.site-footer-white` across all pages.
      * Positioned right at the transition between the page content cards and the footer, matching the user's marked boundary.
    * **Enhanced Light Mode Surface Contrast (`#f8fafc`):**
      * Changed the light theme footer background from plain white (`#ffffff`) to a sleek, cool light slate surface (`background: #f8fafc !important;`), paired with soft elevation shadow (`box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06);`).
      * Provides crisp separation from the white cards above it while keeping transparent brand logos and text razor-sharp.
      * Set copyright bar to `#f1f5f9` with subtle `#e2e8f0` divider.
    * **Dark Theme Harmony:**
      * Applied matching `border-top: 4px solid #e32726 !important;` and `box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);` across dark mode.

* **Category:** Footer / Home Page — Removal of ISO 9001:2015 | RoHS Compliant Bar
  * **Page / Files:** [`src/components/Footer.js`](file:///d:/ICON%20ELECTROMATIC/src/components/Footer.js)
  * **Type:** Content / Visual Cleanup (Dark & Light Themes)
  * **Details:**
    * Removed the `"ISO 9001:2015 | RoHS Compliant"` status badges from the footer copyright bar (`.footer-bottom-links`).
    * Centered the official copyright statement across the bottom copyright bar in both dark and light themes for a clean, minimalist footer presentation.

* **Category:** Products Page & All Pages — Trust Pills Visibility Restoration & Signature Red Hover Transition
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Bug Fix & Interactive Micro-Animation (Light Theme Brand Consistency)
  * **Details:**
    * **Resolved Text Visibility on Products Page Hero Pills:**
      * Root cause: Generic selector `[data-theme="light"] .catalog-trust-pill span` was setting dark slate `#334155 !important`, which blended into the Navy Blue hero banner canvas and rendered *"Global OEM Partners"*, *"Specialized Categories"*, and *"Precision Products & Lines"* invisible.
      * Fix: Explicitly mapped `[data-theme="light"] .page-hero-banner .catalog-trust-strip .catalog-trust-pill span` to crisp white (`#ffffff !important`, `font-weight: 600`, subtle text-shadow).
    * **Universal Signature Red Hover Transition (`#e32726`):**
      * Added interactive red hover transitions across all pages containing trust & highlight strips (`Products`, `About`, `Partners`, `Services`, `Blogs`, `Contact`).
      * On hover, pills transition to translucent crimson glass (`background: rgba(227, 39, 38, 0.2)`), crisp signature red border (`border-color: #e32726`), vibrant red glow shadow (`box-shadow: 0 6px 20px rgba(227, 39, 38, 0.38)`), smooth `translateY(-2px)` elevation, and glowing red scaled icons (`color: #ff4d6d`, `scale(1.15)`).

* **Category:** All Pages — Hero Headings in Signature Dark Red (`#e32726`), Trust Badges High Visibility & Breadcrumbs Sizing Refinement
  * **Page / Files:** [`src/pages/About.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/About.js), [`src/pages/Blogs.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Blogs.js), [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/pages/Contact.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Contact.js), [`src/pages/ProductDetail.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/ProductDetail.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** UX/UI Design Consistency, Typographic Hierarchy & Contrast Restoration
  * **Details:**
    * **Page Headings in Signature Brand Dark Red (`#e32726`):**
      * Styled all main page hero headings (`h1.page-title-unified`) across every page (`About Us`, `Authorized Technology Partners`, `Product Portfolio & Component Catalog`, `Engineering Services & Global Representation`, `OEM Technical News, Video Demos & Insights`, `Contact Our Technical Team`, and Product Detail models) in the authentic dark crimson red (`#e32726`) matching the official logo brand code.
    * **Full Visibility Restoration for Trust & Capability Badges:**
      * Restored crystal-clear visibility to all hero badges across all pages (`ISO 9001:2015 Operations`, `Multi-Decade Pedigree`, `Defense & Telecom Solutions`, `Global OEM Representation`, etc.).
      * Added high-contrast frosted glass container (`rgba(255, 255, 255, 0.12)` with `rgba(255, 255, 255, 0.3)` border and depth shadow).
      * Guaranteed pure bright white text (`#ffffff !important`, `font-weight: 600`) overriding all generic light-theme color selectors that previously darkened text into navy/brown/green.
      * Enhanced icons with high vibrancy drop shadows and sleek hover transitions.
    * **Prominent Breadcrumbs ("Home > [Page Name]") with Signature Red Active Crumb:**
      * Increased breadcrumb sizing to `1.05rem` with `font-weight: 600` for crisp legibility.
      * Styled parent "Home" links in prominent silver-white (`#f1f5f9`), with clear hover glow.
      * Styled the active/current page crumb (`About Us`, `Partners`, `Products`, `Services`, `OEM Technical Blogs & Releases`, `Contact`) in bold signature red (`#e32726`, `font-weight: 700`) uniformly across every page.

* **Category:** All Pages — Hero Banner Ending Baseline & Blogs Double-Padding Alignment Fix
  * **Page / Files:** [`src/pages/Blogs.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Blogs.js), [`src/pages/About.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/About.js), [`src/pages/Contact.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Contact.js), [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Bug Fix & Layout Consistency (Pixel-Perfect Banner Alignment Across All Pages)
  * **Details:**
    * **Eliminated Awkward Vertical Gap on Blogs Page (Yellow Arrow Fix):**
      * Identified and resolved double padding cause: `.blogs-page-wrap` had redundant `padding-top: calc(var(--header-height) + 24px)` stacked on top of `.page-hero-banner`'s padding.
      * Reset `.blogs-page-wrap` padding-top to `0`, pulling the breadcrumbs (`Home > OEM Technical Blogs & Releases`) and title up into exact alignment with all other pages.
    * **Unified Blue Ending Portion & Bottom Baseline Across All Pages:**
      * Addressed the issue where one page's blue banner was ending shorter and another longer by setting `.page-hero-banner` with `min-height: 380px`, `display: flex`, `flex-direction: column`, and `justify-content: center`.
      * Standardized top padding to `calc(var(--header-height, 74px) + 20px)` and bottom padding to `32px` across all pages.
      * Added matching 4-pill highlight strips to `Blogs`, `About`, and `Contact` matching `Partners` and `Services` 1:1, guaranteeing an identical vertical footprint and bottom divider baseline on every single tab.
    * **Preserved Full Functionality & Isolation:**
      * Zero impact on catalog logic, product cards, filter panel, or mobile responsive layouts.
      * Product detail page kept lightweight with `.product-detail-page .page-hero-banner { min-height: auto !important; }`.

* **Category:** All Pages — Full-Width Navy Blue Hero Banner System (`[data-theme="light"]`)
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/pages/About.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/About.js), [`src/pages/Blogs.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Blogs.js), [`src/pages/Contact.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Contact.js), [`src/pages/ProductDetail.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/ProductDetail.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** UX/UI Visual Consistency & Theme Architecture (Light Theme Brand Identity)
  * **Details:**
    * **Full-Width Navy Blue Page Hero Banner (`.page-hero-banner`):**
      * Encapsulated the entire top hero header (from below the fixed site header down through breadcrumbs, eyebrow pills, titles, descriptions, and trust highlight strips) inside a full-width `.page-hero-banner` section.
      * Styled with the authentic brand Navy Blue palette (`#0b1a3d` / `linear-gradient(135deg, #0a1e5e 0%, #10255c 50%, #0b1a3d 100%)`) in the lighter version (`[data-theme="light"]`).
      * Terminated with a clean, razor-sharp bottom divider (`border-bottom: 2px solid rgba(24, 59, 141, 0.45);`) matching the exact boundary marked by the user.
    * **High-Contrast Typography & Glow States:**
      * **Page Titles:** Crisp pure white (`#ffffff`) with subtle drop shadows.
      * **Lead Descriptions:** Light silver-slate (`#cbd5e1`) for readability.
      * **Breadcrumbs:** Soft light blue links (`#cbd5e1`, hover: `#ffffff`) with white current crumb and subtle translucent separators.
      * **Eyebrow Pills:** Translucent dark blue glass with sky-blue borders (`#93c5fd`) and animated pulsing dots.
      * **Trust Badges:** Restored high vibrancy and contrast on Partners, Services, and Products trust strips against the deep blue canvas.
    * **Uniform Alignment & Spacing:**
      * Separated main page content into `<div class="page-main-body"><div class="container">...</div></div>`, ensuring 100% horizontal pixel-perfect alignment and equal vertical breathing room across all pages.
      * Light mode canvas below the hero banner remains pure white (`#ffffff`) for cards, ticker, and catalog.

---

### **2026-10-06**

* **Category:** Pull Request #1 Merge — Collaborator UI Updates (`bhavyasj05:feature/website-ui-updates`)
  * **Page / Files:** [`src/pages/Home.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Home.js), [`src/components/Header.js`](file:///d:/ICON%20ELECTROMATIC/src/components/Header.js), [`src/components/Footer.js`](file:///d:/ICON%20ELECTROMATIC/src/components/Footer.js), [`src/components/ProductCard.js`](file:///d:/ICON%20ELECTROMATIC/src/components/ProductCard.js), [`index.html`](file:///d:/ICON%20ELECTROMATIC/index.html), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css), `public/icon-video.mp4`, `public/images/hero-new-bg.png`
  * **Type:** Collaboration Integration & PR Merge
  * **Details:**
    * **Integrated GitHub PR #1 (`bhavyasj05:feature/website-ui-updates`):**
      * Merged collaborator Bhavya's branch into `main` with 0 conflicts, fully preserving all existing product catalog updates, filter panels, and services card hierarchy.
      * **Home Page Enhancements:** Updated quick requirement inquiry presets to match the 14 authorized OEM categories; refined section titles with signature red accent typography; integrated new hero background media (`hero-new-bg.png`) and company video asset (`icon-video.mp4`).
      * **Header & Navigation:** Reordered navigation items (`Home`, `About Us`, `Partners`, `Products`, `Services`, `Blogs`, `Contact`) with responsive request quote button and theme toggle.
      * **Footer Modernization:** Integrated multi-office address directory (Bengaluru India, Singapore, Oklahoma USA) with contact details, social links, fast navigation, and ISO 9001:2015 / RoHS compliance status bar.
      * **Product Cards Contrast:** Enhanced badge text contrast on OEM pills for Qorvo and YTTEK.
      * **Typography & Fonts:** Harmonized Google Fonts to load Montserrat along with Plus Jakarta Sans and Inter.
      * **Zero Regressions:** All earlier today fixes (14 OEMs, Products light red panel with blue hover/active selection, badge numeric simplifications, Services primary/secondary title balance) remain 100% active and verified.


* **Category:** Services Page — Primary Title & Secondary Subtitle Typographic Hierarchy
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** UX/UI Typographic Hierarchy & Visual Balancing (Dark & Light Themes)
  * **Details:**
    * **Elevated Primary Domain Titles to Prominent Display Size:**
      * Updated all 4 core services blocks to make the broad capability domain the primary, large display title (`.service-primary-title` with `font-size: clamp(1.85rem, 2.8vw, 2.35rem); font-weight: 800;`):
        1. **Global Distribution & Sourcing**
        2. **Supply Chain & Logistics**
        3. **RF Engineering & Advisory**
        4. **Strategic Partnerships**
    * **Secondary Service Subtitles Positioned Proportionally Smaller:**
      * Positioned the specific service offerings directly below the primary heading as secondary subtitles (`.service-secondary-title` with `font-size: clamp(1.2rem, 1.8vw, 1.45rem); font-weight: 700;`):
        1. *Representation of Global Leaders* (Blue Accent)
        2. *Product Supply and Logistics* (Red Accent)
        3. *Design Services* (Blue Accent)
        4. *Business Consultancy* (Red Accent)
    * **Cross-Theme Harmony:**
      * Styled seamlessly for both Dark mode (crisp white primary headings with soft blue/rose subtitle accents) and Light mode (deep slate `#0F172A` headings with signature navy `#123b7a` and crimson `#e32726` subtitle accents).



* **Category:** Products Page — Light Red Filter Panel with Blue Hover/Selection & Restored Trust Strip
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement, Theme Correction & State Reversion
  * **Details:**
    * **Light Red Filter Box with Blue Hover & Cursor Selection (`[data-theme="light"] .catalog-filter-panel`):**
      * Retained the soft light red background (`#fff5f5 !important;`) on the filter command center box.
      * **Blue Hover Interactions:** Hovering over specialty pills displays light blue (`#dbeafe !important;`), navy border (`#123b7a !important;`), and blue text (`#123b7a !important;`). Search clear button, specialty dropdown, and carousel arrows also transition to blue on hover.
      * **Blue Cursor & Active Selection:** Selecting any specialty pill turns it solid navy blue (`#123b7a !important;`) with white text and badge. Focus states and text selection (`::selection`) across the panel now use signature navy blue (`#123b7a`).
    * **Refined Trust & Capability Highlights Badges:**
      * Removed the *"Direct Factory Warranties & CoCs"* badge.
      * Removed the numeric prefixes (`15`, `88`, and `145+`) from the remaining 3 badges while keeping their icons and descriptions clean:
        1. *Global OEM Partners*
        2. *Specialized Categories*
        3. *Precision Products & Lines*
    * **Excel Specialty Count Alignment:**
      * Retained the correct **14 distinct Specialties** count from the Excel workbook (`All Specialties (14)`).



* **Category:** Products Page — Specialty Filter Command Center Redesign & Light Mode Filter Fix
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** UX/UI Redesign & Critical Bug Fix (Dark & Light Themes)
  * **Details:**
    * **Resolved Unprofessional 4-Row Ragged Wrapping:**
      * Replaced the cluttered, unaligned 4-line wrapping of 15 long specialty pills with a sleek, unified **Filter Command Center** (`.catalog-filter-panel`).
      * Integrated a **Search & Quick Specialty Toolbar** (`.catalog-filter-toolbar`):
        * Full-featured search input with instant clear button.
        * Custom quick-select dropdown (`#oem-specialty-select`) styled cleanly with slider icon and chevron, enabling instant selection without hunting through pills.
        * Dynamic "Reset" button (`#catalog-reset-filters-btn`) that appears whenever a filter or search query is active to reset back to "All Specialties (15)" in 1 click.
      * Integrated a **Single-Row Horizontal Chips Carousel Track** (`.catalog-chips-carousel-wrapper`):
        * Smooth scrolling carousel track (`#catalog-chips-track`) with left (`#chips-scroll-prev`) and right (`#chips-scroll-next`) circular chevron scroll buttons.
        * All 15 specialty pills now sit cleanly on a single, perfectly aligned horizontal baseline with individual count badges (`.pill-badge`).
        * Full two-way synchronization: selecting a specialty from the dropdown automatically highlights and scrolls the corresponding chip into center view, and clicking any chip updates the dropdown selector.
    * **Fixed Light Mode Filter Bug (Cards Not Hiding When Filtered):**
      * **Root Cause:** In `src/styles/index.css`, `[data-theme="light"] .oem-card` had `display: flex !important;`. When JavaScript's `applyFilters()` set `card.style.display = 'none'`, the CSS `!important` rule overrode it, preventing non-matching cards (e.g. Mini-Circuits, Qorvo) from hiding in light mode despite the counter showing "Showing 1 Global OEMs".
      * **Resolution:**
        1. Removed `!important` from `display: flex` on `[data-theme="light"] .oem-card`.
        2. Added `.oem-card.is-hidden { display: none !important; }` for both default and light themes.
        3. Enhanced `applyFilters()` in `src/pages/Products.js` to toggle `card.classList.toggle('is-hidden')` AND set `card.style.setProperty('display', 'none' / 'flex', 'important')`.
      * Verified that clicking any specialty filter (e.g., *"High Frequency Laminates & Prepregs"*, *"Tunable Filters"*, *"PCB Fabrication"*) accurately isolates only the matching OEM partner(s) in both Dark and Light themes.



* **Category:** Products Page — Excel "Speciales in" Dynamic Filter Pills
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/data/catalogData.js`](file:///d:/ICON%20ELECTROMATIC/src/data/catalogData.js)
  * **Type:** Feature Enhancement & Excel Synchronization (Dark & Light Themes)
  * **Details:**
    * **Replaced Hardcoded Domain Categories with Authentic Specialties:**
      * Replaced the previous 5 generic domain filters (*RF Laminates & Materials*, *Semiconductors & GaN*, *RF/MW Components*, *SDR & Optics*, *Sensors, Power & PCB*) with dynamic filter pills derived directly from the **"Speciales in"** column of the official Excel workbook ([`Icon Website Product Info - Mrora.v2.xlsx`](file:///d:/ICON%20ELECTROMATIC/Icon%20Website%20Product%20Info%20-%20Mrora.v2.xlsx)).
      * Added filters for:
        1. *High Frequency Laminates & Prepregs* (Rogers Corporation)
        2. *RF and MW Components* (Minicircuits)
        3. *High Power GaN Device and Beamforming IC* (Qorvo)
        4. *Thin Film Capacitors* (TecDia)
        5. *Tunable Filters* (TriTeq)
        6. *High Power Switches and Limiter* (RFuW Engineering)
        7. *Software Defined Radios* (YTTEK)
        8. *Ceramic Capacitors* (Evans)
        9. *Embedded Resistive Film* (Ohmega Ticer)
        10. *Temperature Sensors* (Thermosen)
        11. *3D Printed Dielectric Parts* (Fortify)
        12. *PCB Fabrication* (NEE & Transline Technology)
        13. *High Voltage Power Supplies* (Spellman)
        14. *Perimeter Intrusion Detection System (PIDS)* (AEE Israel)
      * Clicking any specialty filter (e.g. *"High Frequency Laminates & Prepregs"* or *"PCB Fabrication"*) dynamically displays all matching OEM manufacturer cards and automatically updates the active count tag.
      * Includes *"All Specialties (15)"* button to reset filter and show all global partners.
      * Fully styled and reactive in both Dark and Light themes.


* **Category:** Products Page — OEM Cards Vertical Alignment & Layout Consistency
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Layout Alignment & Visual Consistency (Dark & Light Themes)
  * **Details:**
    * **Standardized Company Name & Specialty Badge Hierarchy:**
      * Separated the company title and specialty pill from an irregular wrap-flex row into dedicated vertical lines (`.oem-card-title-header` > `.oem-card-name` on line 1, `.oem-specialty-row` > `.oem-specialty-pill` on line 2).
      * Resolved inconsistency where short company names (Minicircuits, TecDia, TriTeq) placed the badge on the right while longer names (Rogers Corporation, RFuW Engineering) wrapped below. Now 100% of OEM cards display the specialty badge consistently on line 2.
    * **Uniform Categories Preview Box & Content Heights:**
      * Standardized preview category pill selection so total length never exceeds 2 lines (prevents cards like TecDia from inflating to 3 lines while 1-category cards like TriTeq only had 1 line).
      * Set consistent `min-height: 86px;` on `.oem-card-categories-preview` across all 15 cards in both Dark and Light themes.
      * Set `min-height: 2.8em;` on `.oem-card-tagline` and `min-height: 5.4em;` with `-webkit-line-clamp: 4;` on `.oem-card-desc` so every section (Title, Specialty Badge, Tagline, Description, Categories Box, and Meta Counters) aligns at the exact same horizontal baseline across adjacent cards in every row.

* **Category:** Products Page — Light Mode OEM Cards Pure White Background
  * **Page / Files:** [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Theme Correction
  * **Details:**
    * **Eliminated Dark/Black Backgrounds in OEM Cards in Light Mode (`[data-theme="light"]`):**
      * **OEM Card Container (`.oem-card`):** Changed card background from tinted reddish-pink to pure white (`#ffffff !important;`) with clean red top border accent (`#e32726`) and soft elevation drop shadows.
      * **OEM Logo Showcase Header & Pod (`.oem-card-logo-showcase`, `.oem-card-logo-container`, `.oem-logo-badge-pod`):** Replaced previous dark navy/black `#091527` container with crisp pure white (`#ffffff !important;`) and subtle slate border (`1px solid #e2e8f0`), allowing all authentic OEM partner logos (including white-backed PNGs like Qorvo, TriTeq, YTTEK, NEE, and transparent SVGs) to display naturally and seamlessly.
      * **SVG Logos & Dark Logo Assets:** Enhanced SVG text elements with `fill: #0F172A !important;` for strong contrast against the white pod, and inverted solid-black background logo assets (Fortify) to blend flawlessly into white pods.
      * **Card CTA Footer & Banner Pods:** Converted `.oem-card-cta`, `.catalog-oem-banner`, and `.catalog-oem-banner-logo-box` to pure white (`#ffffff !important;`).


* **Category:** Services Page — Light Mode Light Blue Badge & Capability Block Backgrounds
  * **Page / Files:** [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Color Harmonization
  * **Details:**
    * **Light Blue Styling Across All 4 Service Cards in Light Mode (`[data-theme="light"]`):**
      * **Card 1 (Representation Badges):** Applied a soft light-blue background (`#edf5ff`) with subtle blue border (`1px solid rgba(37, 99, 235, 0.22)`), crisp blue icons (`#2563eb`), and deep navy text (`#0f1d3d`) to all capability tags (*"Direct OEM Warranty"*, *"Mil-Spec Screened"*, *"Bengaluru Stock Hub"*, *"Traceable CoCs"*). Hover state transitions to `#e0effe` with elevated blue glow.
      * **Card 2 (Logistics Chips):** Styled GeM & CPPP Portal Bidding, Customs & Duty Optimization, and Multi-Currency Billing chips with the matching light-blue `#edf5ff` background, blue check icons, and navy text.
      * **Card 3 (Engineering Feature Blocks):** Replaced plain transparent hover blocks with styled light-blue `#edf5ff` containers, white circular icon badges with blue glyphs, and navy headers for *On-Call Senior RF Engineers* and *Stack-Up & S-Parameter Verification*.
      * **Card 4 (Consultancy Strategic Focus Blocks):** Styled *Make in India* and *Supply Chain Digitalization* cards with `#edf5ff` background, blue borders, and dark navy headers.

* **Category:** Services Page — Enhanced Light Mode Card Elevation Shadows
  * **Page / Files:** [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Depth Enhancement
  * **Details:**
    * **Pronounced Multi-Tier Drop Shadows for 4 Service Cards:**
      * Deepened the resting shadow of `.service-row-block` in Light Mode to `box-shadow: 0 16px 38px rgba(15, 29, 61, 0.1), 0 6px 16px rgba(227, 39, 38, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04) !important;` for prominent grounding against the light `#f4f6fa` background.
      * Enhanced hover elevation with expanded multi-layer blur: `box-shadow: 0 24px 56px rgba(15, 29, 61, 0.16), 0 10px 24px rgba(227, 39, 38, 0.18), 0 0 24px rgba(227, 39, 38, 0.1) !important;`.

* **Category:** Services Page — Rotating Media Showcase, Button Unification & Badge Cleanup
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Interactive Media & Visual Refinement
  * **Details:**
    * **Auto-Changing Media Showcase for All 4 Service Cards:**
      * Upgraded all 4 service pillar cards with an automated, continuous crossfade media carousel showcasing 4 high-resolution domain photos per card (total 16 high-tech images across Representation, Logistics, Design, and Consultancy).
      * Included smooth 0.85s opacity crossfade transitions, slow Ken Burns zoom, clickable floating glassmorphism indicator dots, and automatic pause-on-hover interaction in both Light and Dark themes.
    * **Red "Initiate Business Discussion →" Button:** Styled the Card 4 call-to-action button with `.btn-relay-red` and arrow icon to match the signature red button on Card 1 (*"Explore Represented Products →"*) across both Light and Dark themes.
    * **Removed ISO 9001:2015 Badge:** Purged the *"ISO 9001:2015 Quality Verified"* badge from the top trust badges strip in both themes.

* **Category:** Services Page — Header Lead Copy Update
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js)
  * **Type:** Copy / Content Refinement
  * **Details:**
    * **Updated Header Lead Paragraph:** Replaced the generic intro with comprehensive OEM representation copy across both Light and Dark themes:
      > *"We represent major RF, Microwave, mmWave, Semiconductors, Components, Subsystems and Power supplies manufacturers around the world, providing unparalleled support to electronic designers, manufacturers, engineers and researchers."*

* **Category:** Services Page — Removed Direct Collaboration CTA Section
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Content Removal & Cleanup
  * **Details:**
    * **Purged CTA Card:** Completely removed the bottom *"DIRECT COLLABORATION — Ready to partner on your next mission-critical system? Connect with our Bengaluru engineering and global logistics office for component inquiries, government tenders, or bespoke design consulting. [Contact Our Team] [Explore Products Catalog]"* card from the Services page across both Light and Dark themes.
    * **Cleaned Up Obsolete Styles & Spacing:** Adjusted the core services pillars container to `margin-bottom: 0` to preserve uniform bottom padding, and removed unused light theme styles for `.services-cta-card`.

* **Category:** Partners & Products Pages — OEM Flyer Alignment & Lead Text Update
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/data/catalogData.js`](file:///d:/ICON%20ELECTROMATIC/src/data/catalogData.js), [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js)
  * **Type:** Content & Data Reordering
  * **Details:**
    * **OEM Order Synchronized with Official Flyer (`ICON ELECTROMATCI FLYER .pdf`):**
      * Rearranged the OEM sequences in both the Partners Page (running ticker and static card profiles) and the Products Catalog Page (catalog OEM cards and query methods) to strictly match the row-by-row layout on Page 2 (*"Our Global Technology Partners"*):
        1. **Rogers Corporation**
        2. **Mini-Circuits**
        3. **Qorvo**
        4. **Tecdia**
        5. **Tri-TeQ**
        6. **RFuW Engineering**
        7. **YTTEK**
        8. **Quantic Eulex / Evans**
        9. **Quantic Ohmega-Ticer**
        10. **Thermosen Technologies**
        11. **Fortify**
        12. **NEE International**
        *(followed in catalog by Spellman, AEE Israel, and Transline Technology).*
    * **Updated Partners Page Lead Copy:** Updated the header lead paragraph across both Light and Dark themes to:
      > *"We represent a diverse portfolio of OEMs across sectors, industries and application.<br>To know more about their products, make an enquiry or request samples just get in touch with us."*

* **Category:** Partners Page — Equalized Top/Bottom Ticker Spacing & Enhanced OEM Logo Shadows/Effects
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Depth Enhancement
  * **Details:**
    * **Equalized Spacing Above & Below Scrolling Logo Ticker:**
      * **Top Spacing (Badges Strip to Ticker Pods):** Inside `.services-trust-strip.partners-trust-strip`, `padding-bottom: var(--space-8)` (32px) + `margin-bottom: var(--space-16)` (64px) + ticker `padding-top: 16px` = **112px**.
      * **Bottom Spacing (Ticker Pods to Static Cards Grid):** Configured `.oem-running-ticker-runthrough` with `padding-bottom: 18px` + `margin-bottom: 94px` = **112px**.
      * The distance from the trust badge strip down to the scrolling pods is now pixel-perfect and exactly equivalent to the distance from the scrolling pods down to the static partner cards in both Dark and Light modes.
    * **Enhanced OEM Logo Shadows & Micro-Interactions:**
      * **Light Theme (`[data-theme="light"]`):** Replaced the faint 0.06 opacity shadow with an elevated multi-layered drop shadow (`box-shadow: 0 12px 30px rgba(15, 29, 61, 0.12), 0 4px 12px rgba(15, 29, 61, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06) !important;`), a crisp slate border (`1.5px solid #cbd5e1`), and a subtle navy top-accent border (`2.5px solid rgba(18, 59, 122, 0.35)`). On hover, it lifts with an intense red/blue ambient glow (`box-shadow: 0 20px 42px rgba(227, 39, 38, 0.22), 0 6px 16px rgba(15, 29, 61, 0.1), 0 0 22px rgba(227, 39, 38, 0.18) !important;`) and logo image scale lift.
      * **Dark Theme:** Deepened the ambient box shadow with dual-tier drop shadows and neon-accented perimeter glow (`box-shadow: 0 12px 34px rgba(0, 0, 0, 0.65), 0 4px 14px rgba(0, 0, 0, 0.45), 0 0 22px rgba(37, 99, 235, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.7);`), with hover elevation producing an electric blue and crimson halo glow (`box-shadow: 0 22px 48px rgba(0, 0, 0, 0.8), 0 0 35px rgba(59, 130, 246, 0.6), 0 0 15px rgba(225, 29, 72, 0.35);`).

* **Category:** Partners Page — 1:1 Layout & Vertical Cadence Unification with Services Page
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Strict Layout Consistency
  * **Details:**
    * **1:1 Vertical Spacing Alignment with Services:** Replicated the exact spacing cadence marked in the user's reference screenshot:
      * Breadcrumb to Eyebrow: `margin-bottom: var(--space-6)` (24px).
      * Eyebrow to Main Title: `16px`.
      * Main Title to Lead Description: `16px`.
      * Lead Description to Badges Strip: Separated by closing `.page-header-unified` with `margin-bottom: var(--space-12)` (48px).
      * Badges Strip to Ticker: Applied the exact `.services-trust-strip` component styling with `margin-bottom: var(--space-16)` (64px), `padding-bottom: var(--space-8)` (32px), and a subtle `border-bottom: 1px solid var(--border-subtle)` divider line.
    * **Identical Colored Trust Badges:** Replaced generic pills with the exact 4-color palette from the Services screenshot (soft blue `#93C5FD`, soft red `#FDA4AF`, soft amber `#FCD34D`, and soft green `#6EE7B7`), which in Light Mode render as pastel tinted cards with vibrant dark text and elevation hover effects.
    * **Card-Aligned Scrolling Viewport:** Aligned the running logo stream strictly between the left card border (Rogers) and right card border (Qorvo).
    * **Maximized Logo Dimensions:** Expanded ticker pod heights to `86px` and image limits to `max-height: 58px; max-width: 175px;`, with static card pods increased to `86px` height and `max-height: 58px; max-width: 215px;`.

* **Category:** Partners Page — Cross-Page Badge Styling Consistency & Running Ticker Container Alignment
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Alignment Fix
  * **Details:**
    * **Trust Badges Consistency (`.ecosystem-trust-pill`):** Completely unified the four ecosystem trust badges (*"12+ Global Technology Partners"*, *"Direct Factory Warranties & CoCs"*, *"Space & Mil-Spec Screening Support"*, *"India Distribution Hub (Bengaluru)"*) with the styling used on the Products catalog page. In Dark Mode, they render as translucent dark pods with subtle border highlights and hover elevation; in Light Mode, they render as crisp, elevated white cards with slate borders (`rgba(18, 59, 122, 0.14)`), deep-navy bold highlights, dark typography (`#334155`), and smooth lift shadows.
    * **Container Alignment for Running Logo Stream:** Removed the `100vw` full-viewport breakout and negative margins from `.oem-running-ticker-runthrough`. The running OEM marquee stream is now strictly contained within the page container (`width: 100%`), aligning its left and right boundaries with the breadcrumb navigation, headings, and static cards grid. Clean gradient edge masks now dissolve logos gracefully at the container edges without spilling to the leftmost monitor boundary.

* **Category:** Partners Page — CTA Removal & High-Resolution OEM Logo Visibility Optimization
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css), [`public/images/oem-logos/`](file:///d:/ICON%20ELECTROMATIC/public/images/oem-logos/)
  * **Type:** Visual Enhancement & Content Removal
  * **Details:**
    * **Removed Collaboration CTA Box:** Completely removed the bottom partnership call-to-action section (*"Collaborate With Us - Looking to Distribute Your RF & Hi-Rel Technologies in India? / Become a Technology Partner → / Explore Products Catalog"*) from the Partners page across both Light and Dark modes.
    * **Fixed OEM Logo Visibility (Mini-Circuits, RFuW, Tecdia, Tri-TeQ, YTTEK, NEE):**
      * **Mini-Circuits:** Removed excessive outer blue dead space (`2000x729` cropped to tight `1497x231`), magnifying the central emblem and text by over 300% for immediate readability matching Qorvo.
      * **RFuW Engineering:** Eliminated massive white padding borders and converted to crisp transparent PNG (`337x214`) for sharp rendering in white pods.
      * **Tecdia:** Cropped out the 88% empty canvas of `Tecdia_Logo_grey_bg.png` (`1152x648` down to the actual logo bounds) and upscaled with Lanczos filtering to transparent `477x276` PNG.
      * **Tri-TeQ:** Cropped vertical transparent dead margins (`821x199`) so the wave logo and lettering fill the logo container prominently.
      * **YTTEK:** Tightened bounds and upscaled to a high-res `723x207` transparent PNG for sharp definition on high-DPI displays.
      * **NEE International:** Cropped side margins and upscaled to `804x288` transparent PNG.
    * **Enlarged Logo Containers & Max Heights:** Increased `.partner-stream-card-logo-box` and `.oem-running-logo-box` to `72px` height, with `.partner-logo-img` and `.oem-running-logo-img` expanded to `max-height: 48px` and `max-width: 200px` for consistent, prominent brand weight across all partner cards.

* **Category:** Partners Page & Global Navigation — Filter Strip Removal & Enlarged Consistent Breadcrumbs
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & UX Simplification
  * **Details:**
    * **Purged Filter Bar & Category Controls:** Completely removed the category filter strip (`All Technology Principals (12)`, `RF & Microwave`, `Semiconductors & SDR`, `Materials & 3D`, `Sensors & PCBs`) and the `"12 Authorized Manufacturer Profiles"` label from the Partners page across both Dark and Light themes.
    * **Direct Uncluttered Flow to Static Cards:** The static 3-column partner grid now sits cleanly right below the full-width running logo stream, eliminating redundant filtering buttons and presenting all authorized partner profiles in one clear view.
    * **Global Breadcrumb Enlargement & Unification:** Significantly increased the size of breadcrumb links (`Home > Partners`, `Home > Products`, `Home > Services`, `Home > About Us`, etc.) to `font-size: 1.05rem` with `font-weight: 500/600`, enhanced spacing, and proportional chevron dividers. Maintained this enlarged, highly readable styling uniformly across all pages in both Dark Mode and Light Mode.

* **Category:** Partners Page — Unconfined Running Logo Ticker & Badgeless Static Cards
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & UX Enhancement
  * **Details:**
    * **Unconfined Full-Width Logo Ticker:** Removed the enclosing container box and header box (`AUTHORIZED TECHNOLOGY PRINCIPALS STREAM - Continuous Global OEM Flow • Click any logo to jump to details`). Allowed the marquee stream to flow unconfined across the full viewport width (`width: 100vw`).
    * **Enlarged Logo Pods:** Increased the logo container height to 68px and image max-height to 44px with generous padding and clean rounded pods for maximum visual impact and brand prominence.
    * **Removed Redundant OEM Text:** Removed OEM name text from the running ticker items so that only prominent, clean OEM brand logos are rendered in the marquee.
    * **Removed Card Badges:** Removed both the "Authorized Partner" and "Direct Factory Warranty & CoC" badges from all static partner cards across both Light and Dark themes for a cleaner, decluttered profile presentation.
    * **Maintained Static Grid & Click-to-Jump:** Kept the cards section completely static in an organized 3-column layout, retaining smooth click-to-jump navigation from any ticker logo to its corresponding static card.

* **Category:** Partners Page — Continuous Running Logo Ticker & Static Profiles Grid
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css), [`src/components/Header.js`](file:///d:/ICON%20ELECTROMATIC/src/components/Header.js)
  * **Type:** Feature & UX Refinement
  * **Details:**
    * **Continuous Running OEM Logo Marquee:** Created a dedicated running marquee ticker (`.oem-running-ticker-section`) placed directly beneath the four ecosystem trust badges (`12+ Global Technology Partners`, `Direct Factory Warranties & CoCs`, `Space & Mil-Spec Screening Support`, `India Distribution Hub (Bengaluru)`). Displays only high-resolution OEM logo badges moving in an infinite, smooth continuous loop with pause-on-hover capability.
    * **Interactive Ticker Click-to-Jump:** Clicking any logo pill in the running ticker smoothly scrolls down and pulses/highlights that partner's static profile card.
    * **100% Static Partner Profiles Grid:** Converted the lower section from moving left/right stream rows into a clean, stable 3-column static grid (`.partners-static-grid`), enabling visitors to comfortably read partner names, technical domains, and comprehensive descriptions without chasing animated rows.
    * **Dual-Theme Refinement (Dark & Light):** Fully styled both the marquee ticker and the static profile cards across Dark Mode (translucent dark pods with glowing blue accents) and Light Mode (soft `#fff8f8` elevated cards with crimson top borders, white logo pods, and high-contrast typography).

* **Category:** Partners Page & Products Catalog Page — High-Resolution OEM Pictures
  * **Page / Files:** [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js), [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/data/catalogData.js`](file:///d:/ICON%20ELECTROMATIC/src/data/catalogData.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css), [`public/images/oem-logos/`](file:///d:/ICON%20ELECTROMATIC/public/images/oem-logos/)
  * **Type:** Feature & Visual Enhancement
  * **Details:**
    * **Authentic OEM Picture Integration:** Replaced SVG logo placeholders with the authentic, high-resolution OEM logo pictures supplied in `PICTURES/` (Evans/Eulex, Fortify, Mini-Circuits, NEE International, Quantic Ohmega-Ticer, PowerRF, Qorvo, RFuW Engineering, Rogers Corporation, Tecdia, Thermosen Technologies, Tri-TeQ Microwave, YTTEK).
    * **Partners Page Stream Cards:** Updated all animated partner stream cards in [`src/pages/Partners.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Partners.js) to render crisp `<img>` logos in dedicated white pod containers with high contrast and smooth hover zoom effects.
    * **Products Page Integration:** Updated Level 1 OEM Manufacturer Cards, Level 2 Manufacturer Banner Headers, and Level 3 Category Subheaders in [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js) to display official OEM pictures.
    * **Crisp Dual-Theme Contrast:** Upgraded logo container badge styling in [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css) to clean white pods (`background: #ffffff; border-radius: 12px-14px; box-shadow: ...`) so dark typography and colored emblems render with crisp contrast across both Dark Mode and Light Mode.
    * **Immediate Eager Loading:** Set `loading="eager"` on all OEM logo images to prevent offscreen lazy loading delay.

* **Category:** Documentation & Engineering Architecture
  * **Page / Files:** [`CONTRIBUTING.md`](file:///d:/ICON%20ELECTROMATIC/CONTRIBUTING.md)
  * **Type:** Feature (Engineering Standards)
  * **Details:** Created enterprise-grade multi-collaborator Git & AI workflow documentation based on GitHub Flow, Conventional Commits, and Antigravity prompt guidelines.

---

### **2026-10-05**

* **Category:** Products Catalog Page
  * **Page / Files:** [`src/pages/Products.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Products.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Refinement & Alignment Fix
  * **Details:**
    * **Hero Background Removal:** Removed the light-blue gradient container box behind the hero section (`AUTHORIZED MANUFACTURER CATALOG`, `Product Portfolio & Component Catalog`, and lead text) in Light Mode (`[data-theme="light"]`), creating a seamless, clean canvas matching all other pages.
    * **Header & Alignment Unification:** Replaced legacy `.catalog-hero-title` and `.catalog-hero-sub` with global unified classes (`.page-header-unified`, `.page-title-unified`, `.page-lead-unified`) for 100% typography and spacing consistency with the rest of the site.
    * **Breadcrumb Restructure:** Repositioned breadcrumbs (`Home > Products > [OEM] > [Category]`) to the top-left of the page container, identical to Partners, Services, and Blogs.
    * **Ecosystem Trust Badges:** Added standard capability pills (`15 Global OEM Partners`, `88 Specialized Categories`, `145+ Precision Products & Lines`, `Direct Factory Warranties & CoCs`) matching the Partners and Services badge aesthetic.
    * **Controls Bar Styling:** Synced search bar and category filter pill styling in light mode with the refined blog section design.

* **Category:** Services Page
  * **Page / Files:** [`src/pages/Services.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Services.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual Enhancement
  * **Details:**
    * Transformed the 4 core service pillar sections into elevated cards featuring soft light red backgrounds (`#fff8f8`), crimson top indicator lines (`#e32726`), 20px border radii, and polished hover transitions matching the aesthetic of Blogs and Partners.

* **Category:** Home Page — Hero Section
  * **Page / Files:** [`src/pages/Home.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Home.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Visual & Contrast Enhancement
  * **Details:**
    * Darkened the hero background video behind *"Precision that moves mission-critical systems forward"* using optimized filters (`brightness(0.65)`, `contrast(125%)`, `opacity: 0.82`, and a dark radial vignette) to guarantee crisp text legibility.

* **Category:** Home Page — Engineering Inquiry Section
  * **Page / Files:** [`src/pages/Home.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Home.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Bug Fix & Theming
  * **Details:**
    * Removed black background from the *"CONNECT WITH ENGINEERING"* section (`.contact-relay-section`) in Light Mode, overriding hardcoded dark styling and ensuring high-contrast white cards on a clean canvas.

* **Category:** Home Page — Insights & Products Sections
  * **Page / Files:** [`src/pages/Home.js`](file:///d:/ICON%20ELECTROMATIC/src/pages/Home.js), [`src/styles/index.css`](file:///d:/ICON%20ELECTROMATIC/src/styles/index.css)
  * **Type:** Style & Bug Fix
  * **Details:**
    * **Latest Blogs Background:** Updated `.insights-dark-section` to match the deep navy gradient background of *Popular Products & Components*.
    * **Card Hover Bug:** Fixed card hover flashing on *Popular Products & Components* by properly scoping related-product card selectors.
    * **Industry Strip:** Updated the partner domain strip (*Aerospace & Satcom*, *Defense R&D Labs*, *5G/6G Telecom*, *Semiconductor Labs*) to a light blue gradient (`#e8f1fc`) with deep blue icons and typography.

---

## 📌 Standard Format for Future Entries

When adding any new feature or fix to this project, append a new point under the corresponding date using this template:

```markdown
### **YYYY-MM-DD**

* **Category:** [Feature Area or Section Name]
  * **Page / Files:** [Relative file paths or routes affected]
  * **Type:** [Feature | Bug Fix | Visual Refinement | Performance | Content]
  * **Details:**
    * [Concise bullet point explaining WHAT was changed and WHY]
```
