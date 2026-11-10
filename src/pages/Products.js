/**
 * Products Catalog Page — ICON ELECTROMATIC
 * Hierarchical Navigation: Companies (13 OEMs) → Categories → Products
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
import { ContentService } from '../data/ContentService.js';

const EXCLUDED_OEM_IDS = new Set(['spellman', 'aee-isarael', 'fortify']);

function sanitizeOemList(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(o => o && !EXCLUDED_OEM_IDS.has(o.id));
}

function getAllOEMs() {
  const cmsProds = ContentService.getData('products');
  const oems = (Array.isArray(cmsProds) && cmsProds.length > 0) ? cmsProds : getOEMs();
  return sanitizeOemList(oems);
}

function getActiveOEMs() {
  return getAllOEMs().filter(o => o.visible !== false);
}

function getActiveOEM(oemId) {
  if (EXCLUDED_OEM_IDS.has(oemId)) return null;
  return getAllOEMs().find(o => o.id === oemId) || null;
}

function getActiveCategories(oemId) {
  const oem = getActiveOEM(oemId);
  if (!oem || !Array.isArray(oem.categories)) return [];
  return oem.categories.filter(c => c.visible !== false);
}

function getActiveCategory(oemId, categoryId) {
  const cats = getActiveCategories(oemId);
  return cats.find(c => c.id === categoryId) || null;
}

function getActiveProductsForCategory(oemId, categoryId) {
  const cat = getActiveCategory(oemId, categoryId);
  if (!cat || !Array.isArray(cat.products)) return [];
  return cat.products.filter(p => p.visible !== false);
}

function getActiveTotalOEMCount() {
  return getActiveOEMs().length;
}

function getActiveTotalCategoryCount() {
  return getActiveOEMs().reduce((sum, o) => sum + (o.categories ? o.categories.filter(c => c.visible !== false).length : 0), 0);
}

function getActiveTotalProductCount() {
  return getActiveOEMs().reduce((sum, o) => {
    if (!o.categories) return sum;
    return sum + o.categories.filter(c => c.visible !== false).reduce((pSum, c) => {
      return pSum + (c.products ? c.products.filter(p => p.visible !== false).length : 0);
    }, 0);
  }, 0);
}

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
  const search = window.location.search || '';
  let queryStr = '';
  if (search.includes('?')) {
    queryStr = search.slice(search.indexOf('?') + 1);
  } else if (hash.includes('?')) {
    queryStr = hash.slice(hash.indexOf('?') + 1);
  }
  const params = new URLSearchParams(queryStr);

  const oemParam = params.get('oem') || null;
  const categoryParam = params.get('category') || null;
  const levelParam = params.get('level') || (categoryParam ? 'products' : (oemParam ? 'categories' : 'oems'));

  navState.level = levelParam;
  navState.oemId = oemParam;
  navState.categoryId = categoryParam;

  return `
    <div class="page-content catalog-page" id="catalog-page" style="min-height:100vh;">
      ${renderPageShell()}
    </div>
  `;
}

function renderPageShell() {
  const totalProds = getActiveTotalProductCount();
  const totalCats = getActiveTotalCategoryCount();
  const totalOEMs = getActiveTotalOEMCount();

  return `
    <!-- Unified Page Hero Banner (Blue in light theme) -->
    <section class="page-hero-banner">
      <div class="container">
        <!-- Interactive Breadcrumb matching all pages -->
        <nav class="breadcrumb-dark catalog-breadcrumb-nav" id="catalog-breadcrumb">
          ${renderBreadcrumb()}
        </nav>

        <!-- Unified Page Header matching Partners, Services, Blogs, About -->
        <div class="page-header-unified catalog-page-header" style="margin-bottom:0;">
          <h1 class="page-title-unified">Product Portfolio &amp; Component Catalog</h1>
          <p class="page-lead-unified">
            Authorized distributor for world-leading RF, microwave, mmWave, semiconductor, and Hi-Rel materials manufacturers.
            Explore authorized global OEM partners, multi-frequency categories, and specialized product lines.
          </p>

          <!-- Trust & Capability Highlights matching Partners and Services -->
          <div class="catalog-trust-strip" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:24px;margin-bottom:0;">
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
              <span><strong>${totalProds}</strong> Precision Products &amp; Lines</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content View -->
    <div class="page-main-body" style="padding-top:var(--space-8);padding-bottom:var(--space-24);">
      <div class="container">
        <div id="catalog-content">
          ${renderCurrentLevel()}
        </div>
      </div>
    </div>
  `;
}

function renderBreadcrumb() {
  const crumbs = [
    { label: 'Home', route: '/' },
    { label: 'Products', level: 'oems' }
  ];

  if (navState.oemId) {
    const oem = getActiveOEM(navState.oemId);
    crumbs.push({
      label: oem ? oem.shortName : navState.oemId,
      level: 'categories',
      oemId: navState.oemId
    });
  }

  if (navState.categoryId && navState.oemId) {
    const cat = getActiveCategory(navState.oemId, navState.categoryId);
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
// UNIVERSAL SEARCH TOOLBAR COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
function renderCatalogSearchToolbar(placeholder = "Search by company, specialty, category, or product...") {
  return `
    <!-- Universal Catalog Search Bar -->
    <div class="catalog-filter-panel catalog-search-only-panel" style="margin-top: 20px; margin-bottom: 24px;">
      <div class="catalog-filter-toolbar">
        <div class="catalog-search-wrap">
          <i class="fa-solid fa-magnifying-glass catalog-search-icon"></i>
          <input 
            type="text" 
            id="oem-search-input" 
            class="catalog-search-input" 
            placeholder="${placeholder}"
            value="${navState.searchQuery || ''}"
          />
          ${navState.searchQuery ? `
            <button class="catalog-search-clear" id="catalog-search-clear" title="Clear search">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </div>
        <div class="catalog-toolbar-actions">
          <button 
            class="catalog-reset-filters-btn" 
            id="catalog-reset-filters-btn" 
            title="Reset active search"
            style="display: ${navState.searchQuery ? 'inline-flex' : 'none'};"
          >
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Results for deep search with complete hierarchical route -->
    <div class="catalog-search-results-wrap" id="catalog-search-results-wrap" style="display:none;"></div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL 1: ALL COMPANIES (13 OEMs)
// ═════════════════════════════════════════════════════════════════════════════
function renderOEMsLevel() {
  const oems = getActiveOEMs();
  
  // Extract unique specialties from catalog matching the Excel sheet's "Speciales in" column
  const specialties = [];
  oems.forEach(oem => {
    if (oem.specialty && !specialties.includes(oem.specialty)) {
      specialties.push(oem.specialty);
    }
  });

  return `
    <!-- Search and Specialty Filter Command Center -->
    <div class="catalog-filter-panel" id="catalog-filter-panel">
      <!-- Top Row: Unified Search Bar & Quick Specialty Selector -->
      <div class="catalog-filter-toolbar">
        <div class="catalog-search-wrap">
          <i class="fa-solid fa-magnifying-glass catalog-search-icon"></i>
          <input 
            type="text" 
            id="oem-search-input" 
            class="catalog-search-input" 
            placeholder="Search by company, specialty, category, or product..."
            value="${navState.searchQuery || ''}"
          />
          ${navState.searchQuery ? `
            <button class="catalog-search-clear" id="catalog-search-clear" title="Clear search">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </div>

        <div class="catalog-toolbar-actions">
          <div class="catalog-select-wrap">
            <i class="fa-solid fa-sliders select-icon"></i>
            <select id="oem-specialty-select" class="catalog-specialty-select" aria-label="Filter by OEM Specialty">
              <option value="all" ${(!navState.activeFilter || navState.activeFilter === 'all') ? 'selected' : ''}>
                All Specialties (${specialties.length})
              </option>
              ${specialties.map(spec => {
                const count = oems.filter(o => o.specialty === spec).length;
                return `
                  <option value="${spec}" ${navState.activeFilter === spec ? 'selected' : ''}>
                    ${spec} (${count})
                  </option>
                `;
              }).join('')}
            </select>
            <i class="fa-solid fa-chevron-down select-arrow"></i>
          </div>

          <button 
            class="catalog-reset-filters-btn" 
            id="catalog-reset-filters-btn" 
            title="Reset active filters"
            style="display: ${(navState.activeFilter && navState.activeFilter !== 'all') || navState.searchQuery ? 'inline-flex' : 'none'};"
          >
            <i class="fa-solid fa-rotate-left"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Bottom Row: Sleek Horizontal Specialty Carousel Track -->
      <div class="catalog-chips-carousel-wrapper">
        <button class="chips-scroll-btn chips-scroll-prev" id="chips-scroll-prev" aria-label="Scroll specialties left" title="Scroll left">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="catalog-chips-track" id="catalog-chips-track">
          <button class="domain-filter-pill ${(!navState.activeFilter || navState.activeFilter === 'all') ? 'active' : ''}" data-specialty="all">
            <span class="pill-title">All Specialties</span>
            <span class="pill-badge">${specialties.length}</span>
          </button>
          ${specialties.map(spec => {
            const count = oems.filter(o => o.specialty === spec).length;
            return `
              <button class="domain-filter-pill ${navState.activeFilter === spec ? 'active' : ''}" data-specialty="${spec}" title="${spec}">
                <span class="pill-title">${spec}</span>
                <span class="pill-badge">${count}</span>
              </button>
            `;
          }).join('')}
        </div>

        <button class="chips-scroll-btn chips-scroll-next" id="chips-scroll-next" aria-label="Scroll specialties right" title="Scroll right">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Active Count Display (Badge removed per user request) -->
    <div class="catalog-section-meta" id="catalog-section-meta">
      <div class="catalog-level-header">
        <h2 class="catalog-level-title" id="catalog-section-title">Authorized Technology Manufacturers</h2>
        <p class="catalog-level-desc" id="catalog-section-desc">Select an OEM partner below to explore their specialized categories and product models</p>
      </div>
      <span id="visible-oem-count" style="display:none;">${oems.length}</span>
    </div>

    <!-- Dynamic Search Results Section (Displays matching products with hierarchical routes) -->
    <div class="catalog-search-results-wrap" id="catalog-search-results-wrap" style="display:none;"></div>

    <!-- Grid of OEM Cards -->
    <div class="oem-cards-grid" id="oem-cards-grid">
      ${oems.map(oem => renderOEMCard(oem)).join('')}
    </div>
  `;
}

function renderOEMCard(oem) {
  if (!oem || EXCLUDED_OEM_IDS.has(oem.id)) return '';
  const visibleCategories = (oem.categories || []).filter(c => c.visible !== false);
  const totalProducts = visibleCategories.reduce((acc, cat) => acc + (cat.products ? cat.products.filter(p => p.visible !== false).length : 0), 0);
  const totalCategories = visibleCategories.length;
  const params = buildNavParams('categories', oem.id);

  // Standardize preview categories to maximum 2-line footprint
  let previewCats = visibleCategories.slice(0, 3);
  const totalLength = previewCats.reduce((sum, c) => sum + c.name.length, 0);
  if (totalLength > 36 && visibleCategories.length > 2) {
    previewCats = visibleCategories.slice(0, 2);
  }
  const remainingCount = visibleCategories.length - previewCats.length;

  return `
    <div class="oem-card" data-nav-params="${params}" data-oem-id="${oem.id}" data-specialty="${oem.specialty}" style="--oem-accent: ${oem.accentColor}; --oem-glow: ${oem.glowColor};">
      <div class="oem-card-accent-bar"></div>
      
      <!-- Prominent OEM Logo Header Showcase -->
      <div class="oem-card-logo-showcase" style="border-bottom: 1px solid ${oem.accentColor}25;">
        <div class="oem-card-logo-container">
          ${oem.logoImg ? `<img src="${ContentService.resolveImg(oem.logoImg)}" alt="${oem.name} Official Logo" class="oem-logo-img" loading="eager" />` : (oem.logoSvg || '')}
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
  const oem = getActiveOEM(navState.oemId);
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

  const categories = getActiveCategories(navState.oemId);
  const totalProducts = categories.reduce((acc, cat) => acc + (cat.products ? cat.products.filter(p => p.visible !== false).length : 0), 0);

  return `
    <!-- OEM Header Banner -->
    <div class="catalog-oem-banner" style="--oem-accent: ${oem.accentColor}; --oem-glow: ${oem.glowColor};">
      <div class="catalog-oem-banner-top">
        <div class="catalog-oem-banner-logo-box">
          ${oem.logoImg ? `<img src="${ContentService.resolveImg(oem.logoImg)}" alt="${oem.name} Official Logo" class="oem-banner-logo-img" loading="eager" />` : (oem.logoSvg || '')}
        </div>
        <div class="catalog-oem-banner-links">
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
            <i class="fa-solid fa-box-open"></i> ${totalProducts} Products / Lines across ${categories.length} Categories
          </span>
        </div>
        <h2 class="catalog-oem-name">${oem.name}</h2>
        <p class="catalog-oem-desc">${oem.description}</p>
      </div>
    </div>

    <!-- Universal Search Bar on Level 2 -->
    ${renderCatalogSearchToolbar("Search all products, models, categories, or manufacturers...")}

    <!-- Category Section Header -->
    <div class="catalog-section-meta" id="category-section-meta" style="margin-top: 16px;">
      <div>
        <h3 class="catalog-level-title">Select a Product Category</h3>
        <p class="catalog-level-desc">Browse through ${oem.name}'s product families and click any category to view individual models and specifications.</p>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="category-cards-grid" id="category-cards-grid">
      ${categories.map(cat => renderCategoryCard(oem, cat)).join('')}
    </div>
  `;
}

function renderCategoryCard(oem, cat) {
  if (!oem || EXCLUDED_OEM_IDS.has(oem.id)) return '';
  const params = buildNavParams('products', oem.id, cat.id);
  const sampleProd = cat.products[0] || {};
  const image = ContentService.resolveImg(sampleProd.image || oem.defaultImage || '/images/rf-filter.jpg');

  return `
    <div class="category-card" data-nav-params="${params}" style="--oem-accent: ${oem.accentColor};">
      <!-- Category Visual Header Preview -->
      <div class="category-card-visual">
        <img 
          src="${image}" 
          alt="${cat.name}" 
          class="category-card-img" 
          loading="lazy" 
          onerror="this.onerror=null; this.src='/images/rf-filter.jpg';" 
        />
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
        <span>View All Products</span>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL 3: PRODUCTS (Visual Cards with Product Pictures + Detailed Table)
// ═════════════════════════════════════════════════════════════════════════════
function renderProductsLevel() {
  const oem = getActiveOEM(navState.oemId);
  const cat = getActiveCategory(navState.oemId, navState.categoryId);
  const products = getActiveProductsForCategory(navState.oemId, navState.categoryId);

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
            ${oem.logoImg ? `<img src="${ContentService.resolveImg(oem.logoImg)}" alt="${oem.name}" class="cpl-inline-logo-img" />` : (oem.logoSvg || '')}
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

    <!-- Universal Search Bar on Level 3 -->
    ${renderCatalogSearchToolbar("Search all products, models, or manufacturers...")}

    <!-- Main Products View: Visual Cards or Data Table -->
    <div id="product-view-container">
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
    </div>
  `;
}

function renderProductCard(product, index, oem, cat) {
  const isValidLink = product.link && product.link.startsWith('http');
  const image = ContentService.resolveImg(product.image || oem.defaultImage || '/images/rf-filter.jpg');

  // Format applications into individual chips
  let apps = [];
  if (product.applications) {
    apps = product.applications
      .split(/[,;\n•]/)
      .map(a => a.replace(/^[0-9]+[\.\)]\s*/, '').trim())
      .filter(a => a.length > 2)
      .slice(0, 4);
  }

  const productUrl = `/products/${oem?.id || 'all'}/${product.id}`;

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
        <h4 class="product-card-name" title="${product.name}">
          <a href="${productUrl}" class="product-card-title-link" style="color: inherit; text-decoration: none;">${product.name}</a>
        </h4>
        
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
  if (!oem || EXCLUDED_OEM_IDS.has(oem.id)) return '';
  const isValidLink = product.link && product.link.startsWith('http');
  const image = ContentService.resolveImg(product.image || oem.defaultImage || '/images/rf-filter.jpg');

  let apps = [];
  if (product.applications) {
    apps = product.applications
      .split(/[,;\n•]/)
      .map(a => a.replace(/^[0-9]+[\.\)]\s*/, '').trim())
      .filter(a => a.length > 2)
      .slice(0, 3);
  }

  const productUrl = `/products/${oem?.id || 'all'}/${product.id}`;

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
        <a href="${productUrl}" class="ptable-name-link" style="color: inherit; text-decoration: none;">
          <span class="ptable-product-name">${product.name}</span>
        </a>
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
// GLOBAL SEARCH & ROUTE RESOLUTION
// ═════════════════════════════════════════════════════════════════════════════

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[s]);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function wordMatchesToken(token, targetWords) {
  if (token.length < 3) {
    return targetWords.some(tw => tw.includes(token));
  }
  for (const tw of targetWords) {
    if (tw.includes(token)) return true;
    if (token.length >= 4 && tw.length >= 4) {
      const maxDist = token.length >= 6 ? 2 : 1;
      if (Math.abs(tw.length - token.length) <= maxDist && levenshtein(token, tw) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}

function searchCatalog(query) {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) {
    return { matchingProducts: [], matchingOemIds: new Set() };
  }

  const tokens = cleanQuery.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const oems = getActiveOEMs();
  const matchingProducts = [];
  const matchingOemIds = new Set();

  oems.forEach(oem => {
    const oemRaw = `${oem.name} ${oem.shortName || ''} ${oem.specialty || ''} ${oem.tagline || ''} ${oem.description || ''}`.toLowerCase();
    const oemWords = oemRaw.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const oemMatches = tokens.every(token => wordMatchesToken(token, oemWords));
    if (oemMatches) {
      matchingOemIds.add(oem.id);
    }

    const categories = (oem.categories || []).filter(c => c && c.visible !== false);
    categories.forEach(cat => {
      const catRaw = `${cat.name} ${cat.description || ''}`.toLowerCase();
      const catWords = catRaw.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      const catMatches = tokens.every(token => wordMatchesToken(token, catWords));
      if (catMatches) {
        matchingOemIds.add(oem.id);
      }

      const products = (cat.products || []).filter(p => p && p.visible !== false);
      products.forEach(prod => {
        const prodRaw = `${prod.name} ${prod.id || ''} ${prod.description || ''} ${prod.applications || ''} ${cat.name} ${oem.name}`.toLowerCase();
        const prodWords = prodRaw.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
        const prodMatches = tokens.every(token => wordMatchesToken(token, prodWords));
        if (prodMatches) {
          matchingOemIds.add(oem.id);
          matchingProducts.push({
            product: prod,
            oem: oem,
            category: cat
          });
        }
      });
    });
  });

  // Prioritize exact substring match on product name
  matchingProducts.sort((a, b) => {
    const aName = a.product.name.toLowerCase();
    const bName = b.product.name.toLowerCase();
    const aExact = aName.includes(cleanQuery);
    const bExact = bName.includes(cleanQuery);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return { matchingProducts, matchingOemIds };
}

function renderSearchResultProductCard(item) {
  const { product, oem, category: cat } = item;
  const image = ContentService.resolveImg(product.image || oem.defaultImage || '/images/rf-filter.jpg');
  const productUrl = `/products/${oem.id}/${product.id}`;
  const catNavParams = buildNavParams('products', oem.id, cat.id);
  const oemNavParams = buildNavParams('categories', oem.id);

  let apps = [];
  if (product.applications) {
    apps = product.applications
      .split(/[,;\n•]/)
      .map(a => a.replace(/^[0-9]+[\.\)]\s*/, '').trim())
      .filter(a => a.length > 2)
      .slice(0, 3);
  }

  return `
    <div class="product-detail-card search-product-card" style="--oem-accent: ${oem.accentColor};" data-product-id="${product.id}">
      <!-- Route Breadcrumb Banner (OEM → Category → Product) -->
      <div class="search-result-route-badge">
        <span class="search-route-crumb search-route-oem" data-nav-params="${oemNavParams}" style="color: ${oem.accentColor}; cursor: pointer;" title="View all ${oem.name} categories">
          <i class="fa-solid fa-industry"></i>
          <span>${oem.name}</span>
        </span>
        <i class="fa-solid fa-chevron-right search-route-sep"></i>
        <span class="search-route-crumb search-route-cat" data-nav-params="${catNavParams}" style="cursor: pointer;" title="View ${cat.name} category in catalog">
          <i class="fa-solid fa-folder-open"></i>
          <span>${cat.name}</span>
        </span>
        <i class="fa-solid fa-chevron-right search-route-sep"></i>
        <span class="search-route-crumb search-route-prod" title="${product.name}">
          ${product.name}
        </span>
      </div>

      <!-- Dedicated Product Picture Banner -->
      <div class="product-card-image-wrap">
        <img 
          src="${image}" 
          alt="${product.name}" 
          class="product-card-img" 
          loading="lazy"
          onerror="this.onerror=null; this.src='/images/rf-filter.jpg';"
        />
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
        <h4 class="product-card-name" title="${product.name}">
          <a href="${productUrl}" class="product-card-title-link" style="color: inherit; text-decoration: none;">${product.name}</a>
        </h4>
        
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
        <a class="pcard-link-btn" data-nav-params="${catNavParams}" style="cursor: pointer; background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #CBD5E1;" title="View category in catalog">
          <i class="fa-solid fa-folder-tree"></i>
          <span>View Category</span>
        </a>
        <a href="${productUrl}" class="pcard-link-btn" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #CBD5E1;" title="Open standalone product page">
          <i class="fa-solid fa-circle-info"></i>
          <span>Details</span>
        </a>
        <a href="#/contact?subject=rfq&model=${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.name)}&oem=${encodeURIComponent(oem.name)}" class="pcard-rfq-btn" style="background: ${oem.accentColor};" title="Request Quote">
          <span>Request RFQ</span>
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
  if (navState.level === 'oems' && navState.searchQuery) {
    applyFilters();
  }
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

    // Specialty filter pills
    const specialtyPill = e.target.closest('.domain-filter-pill');
    if (specialtyPill) {
      const specialty = specialtyPill.getAttribute('data-specialty');
      filterOEMsBySpecialty(specialty);
      return;
    }

    // Reset filters button or Empty State Clear button
    const resetBtn = e.target.closest('#catalog-reset-filters-btn, #search-clear-empty-btn');
    if (resetBtn) {
      resetAllFilters();
      return;
    }

    // Horizontal Chips Track Scroll Buttons
    const prevBtn = e.target.closest('#chips-scroll-prev');
    if (prevBtn) {
      const track = document.getElementById('catalog-chips-track');
      if (track) track.scrollBy({ left: -260, behavior: 'smooth' });
      return;
    }

    const nextBtn = e.target.closest('#chips-scroll-next');
    if (nextBtn) {
      const track = document.getElementById('catalog-chips-track');
      if (track) track.scrollBy({ left: 260, behavior: 'smooth' });
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

  // Delegated change listener for Specialty Select
  page.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'oem-specialty-select') {
      filterOEMsBySpecialty(e.target.value);
    }
  });

  // Delegated search input typing across any level transition or re-render
  page.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'oem-search-input') {
      const query = e.target.value.trim().toLowerCase();
      navState.searchQuery = query;
      filterOEMsBySearch(query);
    }
  });

  // Delegated keydown listener (Escape clears search)
  page.addEventListener('keydown', (e) => {
    if (e.target && e.target.id === 'oem-search-input') {
      if (e.key === 'Escape') {
        resetAllFilters();
      }
    }
  });
}

function filterOEMsBySpecialty(specialty) {
  navState.activeFilter = specialty;

  // Sync Select Dropdown
  const select = document.getElementById('oem-specialty-select');
  if (select && select.value !== specialty) {
    select.value = specialty;
  }

  // Update pill active classes & center active pill
  const pills = document.querySelectorAll('.domain-filter-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-specialty') === specialty) {
      p.classList.add('active');
      p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      p.classList.remove('active');
    }
  });

  applyFilters();
}

function resetAllFilters() {
  navState.activeFilter = 'all';
  navState.searchQuery = '';

  const searchInput = document.getElementById('oem-search-input');
  if (searchInput) searchInput.value = '';

  const select = document.getElementById('oem-specialty-select');
  if (select) select.value = 'all';

  const pills = document.querySelectorAll('.domain-filter-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-specialty') === 'all') {
      p.classList.add('active');
      p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      p.classList.remove('active');
    }
  });

  applyFilters();
}

function filterOEMsBySearch(query) {
  applyFilters();
}

function applyFilters() {
  const query = (navState.searchQuery || '').trim();
  const filter = navState.activeFilter || 'all';

  const resultsWrap = document.getElementById('catalog-search-results-wrap');
  const oemMeta = document.getElementById('catalog-section-meta');
  const oemTitle = document.getElementById('catalog-section-title');
  const oemDesc = document.getElementById('catalog-section-desc');
  const oemGrid = document.getElementById('oem-cards-grid');

  const catMeta = document.getElementById('category-section-meta');
  const catGrid = document.getElementById('category-cards-grid');

  const prodView = document.getElementById('product-view-container');

  if (!query) {
    // Normal level view: hide search results, restore native level content
    if (resultsWrap) {
      resultsWrap.style.display = 'none';
      resultsWrap.innerHTML = '';
    }

    if (navState.level === 'oems') {
      if (oemMeta) oemMeta.style.display = 'flex';
      if (oemTitle) oemTitle.textContent = 'Authorized Technology Manufacturers';
      if (oemDesc) oemDesc.textContent = 'Select an OEM partner below to explore their specialized categories and product models';
      if (oemGrid) oemGrid.style.display = 'grid';

      const cards = document.querySelectorAll('.oem-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const cardSpecialty = card.getAttribute('data-specialty') || '';
        const matchesSpecialty = (filter === 'all') || (cardSpecialty === filter);
        if (matchesSpecialty) {
          card.classList.remove('is-hidden');
          card.style.setProperty('display', 'flex', 'important');
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
          card.style.setProperty('display', 'none', 'important');
        }
      });

      const counter = document.getElementById('visible-oem-count');
      if (counter) counter.textContent = visibleCount;
    } else if (navState.level === 'categories') {
      if (catMeta) catMeta.style.display = 'flex';
      if (catGrid) catGrid.style.display = 'grid';
    } else if (navState.level === 'products') {
      if (prodView) prodView.style.display = 'block';
    }

    const resetBtn = document.getElementById('catalog-reset-filters-btn');
    if (resetBtn) {
      resetBtn.style.display = (navState.level === 'oems' && filter !== 'all') ? 'inline-flex' : 'none';
    }
    return;
  }

  // Active search query on ANY level: full-catalog deep search
  const { matchingProducts, matchingOemIds } = searchCatalog(query);

  // If on Level 1, filter OEM cards
  let visibleOemCount = 0;
  if (navState.level === 'oems') {
    const cards = document.querySelectorAll('.oem-card');
    cards.forEach(card => {
      const oemId = card.getAttribute('data-oem-id') || '';
      const cardSpecialty = card.getAttribute('data-specialty') || '';
      const matchesSpecialty = (filter === 'all') || (cardSpecialty === filter);
      const matchesOem = matchingOemIds.has(oemId);

      if (matchesSpecialty && matchesOem) {
        card.classList.remove('is-hidden');
        card.style.setProperty('display', 'flex', 'important');
        visibleOemCount++;
      } else {
        card.classList.add('is-hidden');
        card.style.setProperty('display', 'none', 'important');
      }
    });

    const counter = document.getElementById('visible-oem-count');
    if (counter) counter.textContent = visibleOemCount;
  } else if (navState.level === 'categories') {
    if (catMeta) catMeta.style.display = 'none';
    if (catGrid) catGrid.style.display = 'none';
  } else if (navState.level === 'products') {
    if (prodView) prodView.style.display = 'none';
  }

  // Render search results section
  if (resultsWrap) {
    if (matchingProducts.length === 0 && (navState.level !== 'oems' || visibleOemCount === 0)) {
      resultsWrap.style.display = 'block';
      resultsWrap.innerHTML = `
        <div class="search-empty-state">
          <div class="search-empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
          <h3 class="search-empty-title">No products or manufacturers found</h3>
          <p class="search-empty-desc">
            We couldn't find any catalog matches for "<strong>${escapeHtml(query)}</strong>". Try checking the model code (e.g. <em>RT/duroid 5880</em>, <em>Capattery</em>) or searching by partner name.
          </p>
          <button class="btn-primary search-clear-empty-btn" id="search-clear-empty-btn">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Clear Search &amp; Restore View</span>
          </button>
        </div>
      `;
      if (oemGrid) oemGrid.style.display = 'none';
      if (oemMeta) oemMeta.style.display = 'none';
    } else {
      resultsWrap.style.display = 'block';
      let html = '';
      if (matchingProducts.length > 0) {
        html += `
          <div class="search-results-header">
            <div class="search-results-heading-group">
              <h3 class="search-results-title">
                <i class="fa-solid fa-microchip" style="color: var(--logo-blue-light); margin-right: 8px;"></i>
                Matching Products &amp; Lines
                <span class="search-results-count-badge">${matchingProducts.length} ${matchingProducts.length === 1 ? 'Product Found' : 'Products Found'}</span>
              </h3>
              <p class="search-results-lead">
                Matching products displaying complete hierarchical routes: <strong>OEM Partner → Category → Product</strong>. Click any product to explore details or view its category.
              </p>
            </div>
          </div>
          <div class="product-cards-grid search-products-grid" style="margin-bottom: 40px;">
            ${matchingProducts.map(item => renderSearchResultProductCard(item)).join('')}
          </div>
        `;
      }

      resultsWrap.innerHTML = html;

      if (navState.level === 'oems') {
        if (visibleOemCount > 0) {
          if (oemGrid) oemGrid.style.display = 'grid';
          if (oemMeta) oemMeta.style.display = 'flex';
          if (oemTitle) oemTitle.textContent = `Matching Manufacturers (${visibleOemCount})`;
          if (oemDesc) oemDesc.textContent = `Authorized OEM partners relevant to "${escapeHtml(query)}"`;
        } else {
          if (oemGrid) oemGrid.style.display = 'none';
          if (oemMeta) oemMeta.style.display = 'none';
        }
      }
    }
  }

  const resetBtn = document.getElementById('catalog-reset-filters-btn');
  if (resetBtn) {
    resetBtn.style.display = 'inline-flex';
  }
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
  navState.searchQuery = '';

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
      applyFilters();
    }, 100);
  }

  if (breadcrumb) {
    breadcrumb.innerHTML = renderBreadcrumb();
  }

  // Smooth scroll to catalog view
  document.querySelector('#catalog-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
