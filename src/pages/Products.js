/**
 * Products Catalog Page — ICON ELECTROMATIC
 * Hierarchical Navigation: Companies (15 OEMs) → Categories → Products
 * Direct source: 'Icon Website Product Info - Mrora.v2.xlsx'
 */
import {
  CATALOG,
  getOEMs,
  getOEM,
  getCategories,
  getCategory,
  getProductsForCategory,
  getAllProducts,
  getTotalProductCount,
  getTotalCategoryCount,
  getTotalOEMCount
} from '../data/catalogData.js';

let navState = {
  level: 'oems',       // 'oems' | 'categories' | 'products'
  oemId: null,
  categoryId: null,
  activeFilter: 'all', // for OEM filter
  searchQuery: '',
  viewMode: 'cards'    // 'cards' | 'table'
};

export function renderProductsPage() {
  const hash = window.location.hash || '';
  const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(queryStr);

  navState.level = params.get('level') || 'oems';
  navState.oemId = params.get('oem') || null;
  navState.categoryId = params.get('category') || null;

  return `
    <div class="page-content catalog-page" id="catalog-page" style="padding-top:calc(var(--header-height) + 24px);padding-bottom:var(--space-24);background:var(--bg-dark);min-height:100vh;">
      <div class="container">
        ${renderPageShell()}
      </div>
    </div>
  `;
}

function renderPageShell() {
  const totalProds = getTotalProductCount();
  const totalCats = getTotalCategoryCount();
  const totalOEMs = getTotalOEMCount();

  return `
    <!-- Interactive Breadcrumb matching all pages -->
    <nav class="breadcrumb-dark catalog-breadcrumb-nav" id="catalog-breadcrumb">
      ${renderBreadcrumb()}
    </nav>

    <!-- Unified Page Header matching Partners, Services, Blogs, About -->
    <div class="page-header-unified catalog-page-header">
      <div class="page-eyebrow-pill">
        <span class="hub-dot-pulse"></span>
        <span>AUTHORIZED MANUFACTURER CATALOG</span>
      </div>
      <h1 class="page-title-unified">Product Portfolio &amp; Component Catalog</h1>
      <p class="page-lead-unified">
        Authorized distributor for world-leading RF, microwave, mmWave, semiconductor, and Hi-Rel materials manufacturers.
        Explore all 15 global OEM partners, multi-frequency categories, and specialized product lines.
      </p>

      <!-- Trust & Capability Highlights matching Partners and Services -->
      <div class="catalog-trust-strip" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:24px;margin-bottom:var(--space-8);">
        <div class="catalog-trust-pill">
          <i class="fa-solid fa-industry" style="color:var(--logo-blue-light);"></i>
          <span><strong>${totalOEMs}</strong> Global OEM Partners</span>
        </div>
        <div class="catalog-trust-pill">
          <i class="fa-solid fa-shapes" style="color:var(--logo-red-light);"></i>
          <span><strong>${totalCats}</strong> Specialized Categories</span>
        </div>
        <div class="catalog-trust-pill">
          <i class="fa-solid fa-microchip" style="color:#10B981;"></i>
          <span><strong>${totalProds}+</strong> Precision Products &amp; Lines</span>
        </div>
        <div class="catalog-trust-pill">
          <i class="fa-solid fa-certificate" style="color:#F59E0B;"></i>
          <span>Direct Factory Warranties &amp; CoCs</span>
        </div>
      </div>
    </div>

    <!-- Dynamic Content View -->
    <div id="catalog-content">
      ${renderCurrentLevel()}
    </div>
  `;
}

function renderBreadcrumb() {
  const crumbs = [
    { label: 'Home', route: '/' },
    { label: 'Products', level: 'oems' }
  ];

  if (navState.oemId) {
    const oem = getOEM(navState.oemId);
    crumbs.push({
      label: oem ? oem.shortName : navState.oemId,
      level: 'categories',
      oemId: navState.oemId
    });
  }

  if (navState.categoryId && navState.oemId) {
    const cat = getCategory(navState.oemId, navState.categoryId);
    crumbs.push({
      label: cat ? cat.name : navState.categoryId,
      level: 'products',
      oemId: navState.oemId,
      categoryId: navState.categoryId
    });
  }

  return crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const sep = i > 0 ? '<span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>' : '';
    if (isLast) {
      return `${sep}<span style="color:var(--text-white);font-weight:600;" class="crumb-current">${c.label}</span>`;
    }
    if (c.route) {
      return `${sep}<a data-route="${c.route}">${c.label}</a>`;
    }
    const params = buildNavParams(c.level, c.oemId, c.categoryId);
    return `${sep}<a class="crumb-link" data-nav-params="${params}" style="cursor:pointer;">${c.label}</a>`;
  }).join('');
}

function buildNavParams(level, oemId, categoryId) {
  const p = new URLSearchParams();
  p.set('level', level);
  if (oemId) p.set('oem', oemId);
  if (categoryId) p.set('category', categoryId);
  return p.toString();
}

function renderCurrentLevel() {
  switch (navState.level) {
    case 'oems': return renderOEMsLevel();
    case 'categories': return renderCategoriesLevel();
    case 'products': return renderProductsLevel();
    default: return renderOEMsLevel();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL 1: ALL COMPANIES (15 OEMs)
// ═════════════════════════════════════════════════════════════════════════════
function renderOEMsLevel() {
  const oems = getOEMs();
  
  return `
    <!-- Search and Domain Filter Controls -->
    <div class="catalog-controls-bar">
      <div class="catalog-search-wrap">
        <i class="fa-solid fa-magnifying-glass catalog-search-icon"></i>
        <input 
          type="text" 
          id="oem-search-input" 
          class="catalog-search-input" 
          placeholder="Search by company, category, product, or application..."
          value="${navState.searchQuery || ''}"
        />
        ${navState.searchQuery ? `
          <button class="catalog-search-clear" id="catalog-search-clear" title="Clear search">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : ''}
      </div>

      <div class="oem-domain-filters" id="oem-domain-filters">
        <button class="domain-filter-pill ${navState.activeFilter === 'all' ? 'active' : ''}" data-domain="all">
          All Partners (${oems.length})
        </button>
        <button class="domain-filter-pill ${navState.activeFilter === 'materials' ? 'active' : ''}" data-domain="materials">
          RF Laminates &amp; Materials
        </button>
        <button class="domain-filter-pill ${navState.activeFilter === 'semiconductors' ? 'active' : ''}" data-domain="semiconductors">
          Semiconductors &amp; GaN
        </button>
        <button class="domain-filter-pill ${navState.activeFilter === 'components' ? 'active' : ''}" data-domain="components">
          RF/MW Components
        </button>
        <button class="domain-filter-pill ${navState.activeFilter === 'sdr' ? 'active' : ''}" data-domain="sdr">
          SDR &amp; Optics
        </button>
        <button class="domain-filter-pill ${navState.activeFilter === 'sensors' ? 'active' : ''}" data-domain="sensors">
          Sensors, Power &amp; PCB
        </button>
      </div>
    </div>

    <!-- Active Count Display -->
    <div class="catalog-section-meta">
      <div class="catalog-level-header">
        <h2 class="catalog-level-title">Authorized Technology Manufacturers</h2>
        <p class="catalog-level-desc">Select an OEM partner below to explore their specialized categories and product models</p>
      </div>
      <div class="catalog-counter-tag">
        Showing <strong id="visible-oem-count">${oems.length}</strong> Global OEMs
      </div>
    </div>

    <!-- Grid of All 15 OEM Cards -->
    <div class="oem-cards-grid" id="oem-cards-grid">
      ${oems.map(oem => renderOEMCard(oem)).join('')}
    </div>
  `;
}

function renderOEMCard(oem) {
  const totalProducts = oem.categories.reduce((acc, cat) => acc + cat.products.length, 0);
  const totalCategories = oem.categories.length;
  const params = buildNavParams('categories', oem.id);

  // Derive domain category
  let domain = 'components';
  const nameL = oem.name.toLowerCase();
  if (nameL.includes('rogers') || nameL.includes('ohmega')) domain = 'materials';
  else if (nameL.includes('qorvo') || nameL.includes('gan')) domain = 'semiconductors';
  else if (nameL.includes('fortify') || nameL.includes('yttek')) domain = 'sdr';
  else if (nameL.includes('spellman') || nameL.includes('thermosen') || nameL.includes('tecdia') || nameL.includes('nee') || nameL.includes('transline') || nameL.includes('evans')) domain = 'sensors';

  // Standardize preview categories to maximum 2-line footprint
  let previewCats = oem.categories.slice(0, 3);
  const totalLength = previewCats.reduce((sum, c) => sum + c.name.length, 0);
  if (totalLength > 36 && oem.categories.length > 2) {
    previewCats = oem.categories.slice(0, 2);
  }
  const remainingCount = oem.categories.length - previewCats.length;

  return `
    <div class="oem-card" data-nav-params="${params}" data-oem-id="${oem.id}" data-domain="${domain}" style="--oem-accent: ${oem.accentColor}; --oem-glow: ${oem.glowColor};">
      <div class="oem-card-accent-bar"></div>
      
      <!-- Prominent OEM Logo Header Showcase -->
      <div class="oem-card-logo-showcase" style="border-bottom: 1px solid ${oem.accentColor}25;">
        <div class="oem-card-logo-container">
          ${oem.logoImg ? `<img src="${oem.logoImg}" alt="${oem.name} Official Logo" class="oem-logo-img" loading="eager" />` : oem.logoSvg}
        </div>
      </div>

      <div class="oem-card-body">
        <div class="oem-card-title-header">
          <h3 class="oem-card-name">${oem.name}</h3>
          <div class="oem-specialty-row">
            <span class="oem-specialty-pill" style="background: ${oem.accentColor}18; color: ${oem.accentColor}; border: 1px solid ${oem.accentColor}40;">
              ${oem.specialty}
            </span>
          </div>
        </div>

        <p class="oem-card-tagline">${oem.tagline}</p>
        <p class="oem-card-desc">${oem.description}</p>

        <!-- Categories preview pills -->
        <div class="oem-card-categories-preview">
          <span class="preview-label">Categories:</span>
          <div class="preview-pills">
            ${previewCats.map(c => `<span class="preview-pill">${c.name}</span>`).join('')}
            ${remainingCount > 0 ? `<span class="preview-pill preview-pill-more">+${remainingCount} more</span>` : ''}
          </div>
        </div>

        <!-- Meta Counters -->
        <div class="oem-card-meta">
          <span class="oem-meta-badge" style="background: ${oem.accentColor}15; border-color: ${oem.accentColor}35; color: ${oem.accentColor};">
            <i class="fa-solid fa-folder-tree"></i> ${totalCategories} ${totalCategories === 1 ? 'Category' : 'Categories'}
          </span>
          <span class="oem-meta-badge" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #E2E8F0;">
            <i class="fa-solid fa-microchip"></i> ${totalProducts} ${totalProducts === 1 ? 'Product Line' : 'Products &amp; Lines'}
          </span>
        </div>
      </div>

      <div class="oem-card-cta" style="color: ${oem.accentColor};">
        <span>Explore Categories &amp; Products</span>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL 2: CATEGORIES (When OEM is selected)
// ═════════════════════════════════════════════════════════════════════════════
function renderCategoriesLevel() {
  const oem = getOEM(navState.oemId);
  if (!oem) {
    return `
      <div class="catalog-empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h3>Manufacturer Not Found</h3>
        <p>The selected OEM could not be located in our catalog database.</p>
        <a class="btn-primary" data-nav-params="level=oems">Return to All Manufacturers</a>
      </div>
    `;
  }

  const totalProducts = oem.categories.reduce((acc, cat) => acc + cat.products.length, 0);

  return `
    <!-- OEM Header Banner -->
    <div class="catalog-oem-banner" style="--oem-accent: ${oem.accentColor}; --oem-glow: ${oem.glowColor};">
      <div class="catalog-oem-banner-top">
        <div class="catalog-oem-banner-logo-box">
          ${oem.logoImg ? `<img src="${oem.logoImg}" alt="${oem.name} Official Logo" class="oem-banner-logo-img" loading="eager" />` : oem.logoSvg}
        </div>
        <div class="catalog-oem-banner-links">
          ${oem.website ? `
            <a href="${oem.website}" target="_blank" rel="noopener noreferrer" class="oem-external-site-btn" style="color:${oem.accentColor}; border-color:${oem.accentColor}40;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Official Website</span>
            </a>
          ` : ''}
          <a class="oem-back-btn" data-nav-params="level=oems">
            <i class="fa-solid fa-arrow-left"></i>
            <span>All Companies</span>
          </a>
        </div>
      </div>

      <div class="catalog-oem-banner-info">
        <div class="catalog-oem-tag-row">
          <span class="catalog-spec-badge" style="background:${oem.accentColor}20; color:${oem.accentColor}; border:1px solid ${oem.accentColor}50;">
            <i class="fa-solid fa-industry"></i>
            <span>Specialty: ${oem.specialty}</span>
          </span>
          <span class="catalog-oem-count-badge">
            <i class="fa-solid fa-box-open"></i> ${totalProducts} Products / Lines across ${oem.categories.length} Categories
          </span>
        </div>
        <h2 class="catalog-oem-name">${oem.name}</h2>
        <p class="catalog-oem-desc">${oem.description}</p>
      </div>
    </div>

    <!-- Category Section Header -->
    <div class="catalog-section-meta" style="margin-top: 32px;">
      <div>
        <h3 class="catalog-level-title">Select a Product Category</h3>
        <p class="catalog-level-desc">Browse through ${oem.name}'s product families and click any category to view individual models and specifications.</p>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="category-cards-grid">
      ${oem.categories.map(cat => renderCategoryCard(oem, cat)).join('')}
    </div>
  `;
}

function renderCategoryCard(oem, cat) {
  const params = buildNavParams('products', oem.id, cat.id);
  const sampleProd = cat.products[0] || {};
  const image = sampleProd.image || oem.defaultImage || '/images/rf-filter.jpg';

  return `
    <div class="category-card" data-nav-params="${params}" style="--oem-accent: ${oem.accentColor};">
      <!-- Category Visual Header Preview -->
      <div class="category-card-visual" style="background-image: url('${image}');">
        <div class="category-visual-overlay"></div>
        <div class="category-count-badge" style="background: ${oem.accentColor}; color: #ffffff;">
          ${cat.products.length} ${cat.products.length === 1 ? 'Part' : 'Parts'}
        </div>
      </div>

      <div class="category-card-content">
        <div class="category-header-row">
          <h4 class="category-name">${cat.name}</h4>
        </div>
        <p class="category-desc">${cat.description}</p>

        <!-- Product Preview List -->
        <div class="category-products-preview">
          <div class="category-preview-title">Models &amp; Variants:</div>
          ${cat.products.slice(0, 3).map(p => `
            <div class="category-prod-preview-item">
              <i class="fa-solid fa-check" style="color: ${oem.accentColor}; font-size: 0.65rem;"></i>
              <span class="preview-name">${p.name}</span>
            </div>
          `).join('')}
          ${cat.products.length > 3 ? `
            <div class="category-prod-preview-item" style="color: #94A3B8; font-style: italic;">
              <i class="fa-solid fa-ellipsis" style="color: #64748B;"></i>
              <span>+${cat.products.length - 3} more product specifications</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="category-cta" style="color: ${oem.accentColor};">
        <span>View All ${cat.products.length} Products</span>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL 3: PRODUCTS (Visual Cards with Product Pictures + Detailed Table)
// ═════════════════════════════════════════════════════════════════════════════
function renderProductsLevel() {
  const oem = getOEM(navState.oemId);
  const cat = getCategory(navState.oemId, navState.categoryId);
  const products = getProductsForCategory(navState.oemId, navState.categoryId);

  if (!oem || !cat) {
    return `
      <div class="catalog-empty-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h3>Category Not Found</h3>
        <p>The requested product category could not be found.</p>
        <a class="btn-primary" data-nav-params="level=oems">Return to Catalog Home</a>
      </div>
    `;
  }

  const backToCatsParams = buildNavParams('categories', oem.id);

  return `
    <!-- Category & OEM Header Strip -->
    <div class="catalog-product-level-header" style="--oem-accent: ${oem.accentColor};">
      <div class="cpl-left">
        <div class="cpl-oem-badge-row">
          <div class="cpl-logo-inline">
            ${oem.logoImg ? `<img src="${oem.logoImg}" alt="${oem.name}" class="cpl-inline-logo-img" />` : oem.logoSvg}
          </div>
          <span class="cpl-divider">/</span>
          <span class="cpl-cat-tag">${cat.name}</span>
        </div>
        <h2 class="cpl-title">${cat.name}</h2>
        <p class="cpl-desc">${cat.description}</p>
      </div>

      <div class="cpl-actions">
        <div class="cpl-counter-pill" style="border-color:${oem.accentColor}40; color:${oem.accentColor}; background:${oem.accentColor}12;">
          <i class="fa-solid fa-boxes-stacked"></i>
          <span>${products.length} ${products.length === 1 ? 'Product Model' : 'Products &amp; Lines'}</span>
        </div>
        
        <div class="cpl-view-toggle">
          <button class="view-toggle-btn ${navState.viewMode === 'cards' ? 'active' : ''}" id="view-toggle-cards" title="Visual Cards View">
            <i class="fa-solid fa-grip"></i>
            <span>Cards</span>
          </button>
          <button class="view-toggle-btn ${navState.viewMode === 'table' ? 'active' : ''}" id="view-toggle-table" title="Data Table View">
            <i class="fa-solid fa-table-list"></i>
            <span>Table</span>
          </button>
        </div>

        <a class="cpl-back-link" data-nav-params="${backToCatsParams}">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Categories</span>
        </a>
      </div>
    </div>

    <!-- Main Products View: Visual Cards or Data Table -->
    ${navState.viewMode === 'cards' ? `
      <div class="product-cards-grid" id="product-cards-grid">
        ${products.map((p, i) => renderProductCard(p, i, oem, cat)).join('')}
      </div>
    ` : `
      <div class="products-table-wrap">
        <div class="products-table-header">
          <div class="ptable-col ptable-col-num">#</div>
          <div class="ptable-col ptable-col-img">Visual</div>
          <div class="ptable-col ptable-col-name">Product Name &amp; Code</div>
          <div class="ptable-col ptable-col-desc">Technical Description</div>
          <div class="ptable-col ptable-col-apps">Target Applications</div>
          <div class="ptable-col ptable-col-actions">Request RFQ</div>
        </div>
        <div class="products-table-body">
          ${products.map((p, i) => renderProductRow(p, i, oem)).join('')}
        </div>
      </div>
    `}
  `;
}

function renderProductCard(product, index, oem, cat) {
  const isValidLink = product.link && product.link.startsWith('http');
  const image = product.image || oem.defaultImage || '/images/rf-filter.jpg';

  // Format applications into individual chips
  let apps = [];
  if (product.applications) {
    apps = product.applications
      .split(/[,;\n•]/)
      .map(a => a.replace(/^[0-9]+[\.\)]\s*/, '').trim())
      .filter(a => a.length > 2)
      .slice(0, 4);
  }

  return `
    <div class="product-detail-card" style="--oem-accent: ${oem.accentColor};" data-product-id="${product.id}">
      <!-- Dedicated Product Picture Banner -->
      <div class="product-card-image-wrap">
        <img 
          src="${image}" 
          alt="${product.name}" 
          class="product-card-img" 
          loading="lazy"
          onerror="this.onerror=null; this.src='/images/rf-filter.jpg';"
        />
        <div class="product-card-img-gradient"></div>

        <!-- OEM Mini-Badge Overlay -->
        <div class="product-card-oem-overlay" style="background: rgba(10,15,30,0.85); border: 1px solid ${oem.accentColor}40;">
          <span style="color: ${oem.accentColor}; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em;">
            ${oem.shortName}
          </span>
        </div>

        <!-- Category Pill Overlay -->
        <div class="product-card-cat-overlay">
          ${cat.name}
        </div>
      </div>

      <!-- Card Information -->
      <div class="product-card-body">
        <h4 class="product-card-name" title="${product.name}">${product.name}</h4>
        
        <p class="product-card-desc">
          ${product.description}
        </p>

        <!-- Applications Tags -->
        ${apps.length ? `
          <div class="product-card-apps-section">
            <span class="product-card-apps-title">
              <i class="fa-solid fa-bullseye" style="color:${oem.accentColor};"></i> Key Applications:
            </span>
            <div class="product-card-apps-tags">
              ${apps.map(app => `
                <span class="product-app-pill" style="border-color:${oem.accentColor}30; background:${oem.accentColor}10; color:#E2E8F0;">
                  ${app}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Card Action Buttons -->
      <div class="product-card-footer">
        <a href="#/contact?subject=technical&model=${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="pcard-link-btn" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #CBD5E1;">
          <i class="fa-solid fa-circle-info"></i>
          <span>Technical Inquiry</span>
        </a>
        <a href="#/contact?subject=rfq&model=${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="pcard-rfq-btn" style="background: ${oem.accentColor};">
          <span>Request RFQ</span>
        </a>
      </div>
    </div>
  `;
}

function renderProductRow(product, index, oem) {
  const isValidLink = product.link && product.link.startsWith('http');
  const image = product.image || oem.defaultImage || '/images/rf-filter.jpg';

  let apps = [];
  if (product.applications) {
    apps = product.applications
      .split(/[,;\n•]/)
      .map(a => a.replace(/^[0-9]+[\.\)]\s*/, '').trim())
      .filter(a => a.length > 2)
      .slice(0, 3);
  }

  return `
    <div class="ptable-row" style="--row-index: ${index}; --oem-accent: ${oem.accentColor};">
      <div class="ptable-col ptable-col-num">
        <span class="ptable-num" style="background: ${oem.accentColor}18; color: ${oem.accentColor};">
          ${String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div class="ptable-col ptable-col-img">
        <img 
          src="${image}" 
          alt="${product.name}" 
          class="ptable-thumb" 
          loading="lazy"
          onerror="this.onerror=null; this.src='/images/rf-filter.jpg';"
        />
      </div>
      <div class="ptable-col ptable-col-name">
        <span class="ptable-product-name">${product.name}</span>
        <span class="ptable-oem-sub" style="color: ${oem.accentColor};">${oem.shortName}</span>
      </div>
      <div class="ptable-col ptable-col-desc">
        <span class="ptable-desc-text">${product.description}</span>
      </div>
      <div class="ptable-col ptable-col-apps">
        <div class="ptable-apps-wrap">
          ${apps.map(app => `<span class="ptable-app-badge">${app}</span>`).join('')}
        </div>
      </div>
      <div class="ptable-col ptable-col-actions">
        <a href="#/contact?subject=rfq&model=${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="ptable-action-rfq" title="Request Quote" style="background: ${oem.accentColor};">
          Request RFQ
        </a>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// INTERACTIVITY & EVENT LISTENERS
// ═════════════════════════════════════════════════════════════════════════════
export function initProductsPage() {
  attachCatalogEvents();
}

function attachCatalogEvents() {
  const page = document.getElementById('catalog-page');
  if (!page) return;

  // Delegated click on elements with data-nav-params
  page.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav-params]');
    if (navBtn) {
      e.preventDefault();
      const paramsStr = navBtn.getAttribute('data-nav-params');
      navigateTo(paramsStr);
      return;
    }

    // Domain filter pills
    const domainPill = e.target.closest('.domain-filter-pill');
    if (domainPill) {
      const domain = domainPill.getAttribute('data-domain');
      filterOEMsByDomain(domain);
      return;
    }

    // View toggle buttons
    const cardsBtn = e.target.closest('#view-toggle-cards');
    if (cardsBtn) {
      navState.viewMode = 'cards';
      refreshProductsView();
      return;
    }

    const tableBtn = e.target.closest('#view-toggle-table');
    if (tableBtn) {
      navState.viewMode = 'table';
      refreshProductsView();
      return;
    }

    // Clear search button
    const clearBtn = e.target.closest('#catalog-search-clear');
    if (clearBtn) {
      const input = document.getElementById('oem-search-input');
      if (input) input.value = '';
      navState.searchQuery = '';
      filterOEMsBySearch('');
      return;
    }
  });

  // Search input typing
  const searchInput = document.getElementById('oem-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      navState.searchQuery = query;
      filterOEMsBySearch(query);
    });
  }
}

function filterOEMsByDomain(domain) {
  navState.activeFilter = domain;

  // Update pill active classes
  const pills = document.querySelectorAll('.domain-filter-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-domain') === domain) p.classList.add('active');
    else p.classList.remove('active');
  });

  applyFilters();
}

function filterOEMsBySearch(query) {
  applyFilters();
}

function applyFilters() {
  const cards = document.querySelectorAll('.oem-card');
  let visibleCount = 0;
  const query = (navState.searchQuery || '').toLowerCase();
  const domain = navState.activeFilter || 'all';

  cards.forEach(card => {
    const cardDomain = card.getAttribute('data-domain') || 'components';
    const text = card.textContent.toLowerCase();

    const matchesDomain = (domain === 'all') || (cardDomain === domain);
    const matchesQuery = (!query) || text.includes(query);

    if (matchesDomain && matchesQuery) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const counter = document.getElementById('visible-oem-count');
  if (counter) counter.textContent = visibleCount;
}

function refreshProductsView() {
  const content = document.getElementById('catalog-content');
  if (content) {
    content.innerHTML = renderCurrentLevel();
  }
}

function navigateTo(paramsStr) {
  const params = new URLSearchParams(paramsStr);
  navState.level = params.get('level') || 'oems';
  navState.oemId = params.get('oem') || null;
  navState.categoryId = params.get('category') || null;

  // Update browser hash
  const newHash = `#/products?${paramsStr}`;
  history.replaceState(null, '', newHash);

  // Transition content
  const content = document.getElementById('catalog-content');
  const breadcrumb = document.getElementById('catalog-breadcrumb');

  if (content) {
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px)';
    setTimeout(() => {
      content.innerHTML = renderCurrentLevel();
      content.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 100);
  }

  if (breadcrumb) {
    breadcrumb.innerHTML = renderBreadcrumb();
  }

  // Smooth scroll to catalog view
  document.querySelector('#catalog-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
