/**
 * Blogs & OEM Technical News Page — ICON ELECTROMATIC
 * Sleek Dark Relay Aesthetics
 * Displays all 15 manufacturing partner OEMs, technical news releases,
 * demonstration videos, application notes, and official technical website links.
 */
import { CATALOG } from '../../shared/catalogData.js';
import { OEM_BLOGS } from '../data/blogData.js';
import { ContentService } from '../data/ContentService.js';
import { getRouteSearchParams, navigate } from '../router.js';

const EXCLUDED_OEM_IDS = new Set(['fortify', 'spellman', 'aee-isarael']);

function getActiveBlogOems() {
  return CATALOG.filter(o => o.visible !== false && !EXCLUDED_OEM_IDS.has(o.id));
}

function getBlogCmsData() {
  const cms = ContentService.getData('blogs');
  if (cms && Array.isArray(cms.oemBlogs)) {
    return {
      ...cms,
      heroSubtitle: (cms.heroSubtitle || '').replace(/15\s+global/i, 'global'),
      oemBlogs: cms.oemBlogs.filter(b => !EXCLUDED_OEM_IDS.has(b.oemId))
    };
  }
  return {
    heroTitle: 'OEM Technical News & Insights',
    heroSubtitle: 'Direct technical bulletins, application notes, and product release updates from ICON Electromatic\'s global manufacturing partners.',
    trustBadge1: 'Technical Application Notes',
    trustBadge2: 'Manufacturer Engineering Bulletins',
    trustBadge3: 'Verified OEM Insights',
    oemBlogs: (OEM_BLOGS || []).filter(b => !EXCLUDED_OEM_IDS.has(b.oemId))
  };
}

function getActiveOemBlogs() {
  const data = getBlogCmsData();
  return (data.oemBlogs || []).filter(b => b.visible !== false && !EXCLUDED_OEM_IDS.has(b.oemId));
}

function getActiveBlogDataForOem(oemId) {
  if (EXCLUDED_OEM_IDS.has(oemId)) return null;
  const cms = getBlogCmsData();
  const oemBlogs = cms.oemBlogs || [];
  const oem = CATALOG.find(o => o.id === oemId);
  if (!oem || oem.visible === false) return null;
  const blog = oemBlogs.find(b => b.oemId === oemId) || {
    oemId,
    officialWebsite: oem.website || '#',
    portalName: `${oem.name} Engineering Resource Hub`,
    headline: oem.tagline || oem.specialty,
    articles: [],
    videos: [],
    whitepapers: [],
    officialLinks: []
  };
  return { oem, blog };
}

function getAllActiveArticles() {
  const oemBlogs = getActiveOemBlogs();
  const list = [];
  oemBlogs.forEach(b => {
    if (EXCLUDED_OEM_IDS.has(b.oemId)) return;
    const oem = CATALOG.find(o => o.id === b.oemId);
    if (!oem || oem.visible === false) return;
    (b.articles || []).filter(a => a.visible !== false).forEach(art => {
      list.push({ ...art, oemName: oem.name, oemShort: oem.shortName, oemId: oem.id, oemAccent: oem.accentColor, oemLogo: oem.logoSvg });
    });
  });
  return list;
}

function getActiveOemContentCount(oemId) {
  const cms = getBlogCmsData();
  const blog = (cms.oemBlogs || []).find(b => b.oemId === oemId);
  if (!blog) return { articles: 0, total: 0 };
  const articles = (blog.articles || []).filter(a => a.visible !== false).length;
  return { articles, total: articles };
}

export function renderBlogsPage() {
  const searchParams = getRouteSearchParams();
  const selectedOemId = searchParams.get('oem') || '';
  const activeTab = searchParams.get('tab') || 'all';

  if (selectedOemId) {
    const oemData = getActiveBlogDataForOem(selectedOemId);
    if (oemData) {
      return renderSingleOemBlogView(oemData.oem, oemData.blog, activeTab);
    }
  }

  return renderAllOemsBlogView();
}

function renderAllOemsBlogView() {
  const cmsData = getBlogCmsData();
  const allArticles = getAllActiveArticles();
  const activeBlogOems = getActiveBlogOems();

  return `
    <div class="blogs-page-wrap" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span class="crumb-current" style="color:var(--text-white);font-weight:600;">OEM Technical Blogs &amp; Releases</span>
          </nav>

          <!-- Page Header -->
          <div class="page-header-unified blogs-hero" style="margin-bottom:0;">
            <h1 class="page-title-unified">
              ${cmsData.heroTitle || 'OEM Technical News &amp; Bulletins'}
            </h1>
            <p class="page-lead-unified">
              ${cmsData.heroSubtitle || 'Direct technical bulletins, engineering updates, and product release announcements from ICON Electromatic\'s global manufacturing partners.'}
            </p>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="page-main-body" style="padding-top:var(--space-8);padding-bottom:var(--space-20);">
        <div class="container">
          <!-- Quick Filter Chips by OEM -->
          <div class="blogs-oem-selector-bar">
            <button class="blogs-oem-chip active" data-filter="all">
              <i class="fa-solid fa-layer-group"></i> All ${activeBlogOems.length} OEMs
            </button>
          ${activeBlogOems.map(oem => `
            <button class="blogs-oem-chip" data-oem-select="${oem.id}">
              <span style="width:8px;height:8px;border-radius:50%;background:${oem.accentColor};display:inline-block;"></span>
              ${oem.shortName}
            </button>
          `).join('')}
        </div>

        <!-- Section: Select an OEM to Explore Their Releases -->
        <div style="margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="font-size:1.3rem;font-weight:800;color:var(--text-white);margin-bottom:4px;">
              Select an OEM to Explore Direct Releases
            </h3>
            <p style="font-size:0.85rem;color:var(--text-gray-400);margin:0;">
              Click any manufacturer card to explore their latest technical articles, bulletins, and product announcements:
            </p>
          </div>
        </div>

        <!-- OEMs Grid -->
        <div class="blogs-oem-grid">
          ${activeBlogOems.map(oem => {
            const counts = getActiveOemContentCount(oem.id);
            return `
              <div class="blogs-oem-card" data-oem-id="${oem.id}" style="--oem-accent:${oem.accentColor};--oem-glow:${oem.glowColor};">
                <div class="blogs-oem-card-top-row">
                  <span class="blogs-oem-partner-tag" style="color:${oem.accentColor};background:${oem.accentColor}18;border:1px solid ${oem.accentColor}35;">
                    <i class="fa-solid fa-certificate"></i> Official Partner
                  </span>
                  <span class="blogs-oem-card-count">
                    <i class="fa-solid fa-newspaper" style="color:${oem.accentColor};font-size:0.7rem;"></i>
                    ${counts.total} ${counts.total === 1 ? 'Release' : 'Releases'}
                  </span>
                </div>

                <!-- Centered Prominent OEM Logo Showcase -->
                <div class="blogs-oem-card-logo-showcase">
                  <div class="oem-logo-badge-pod" style="--oem-accent:${oem.accentColor};">
                    ${oem.logoImg ? `<img src="${ContentService.resolveImg(oem.logoImg)}" alt="${oem.name} Official Logo" class="oem-logo-img" loading="eager" />` : (oem.logoSvg || '')}
                  </div>
                </div>

                <div style="text-align:center;margin-bottom:8px;">
                  <h3 style="margin-bottom:4px;">${oem.name}</h3>
                  <div class="blogs-oem-card-specialty" style="margin-bottom:8px;">${oem.specialty}</div>
                </div>
                <p class="blogs-oem-card-desc">${oem.description.slice(0, 130)}...</p>
                
                <div class="blogs-oem-card-footer">
                  <span>Explore Technical News</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Latest Highlights across All OEMs -->
        <div style="margin-top:var(--space-12);padding-top:var(--space-8);border-top:1px solid var(--border-card);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);flex-wrap:wrap;gap:12px;">
            <div>
              <h2 style="font-size:1.45rem;font-weight:800;color:var(--text-white);margin:0;">
                Recent Technical News &amp; Product Announcements
              </h2>
            </div>
          </div>

          <div class="blogs-articles-grid">
            ${allArticles.slice(0, 6).map(art => `
              <div class="blog-article-card" data-article-id="${art.id}">
                <div class="blog-article-img-wrap">
                  <img src="${ContentService.resolveImg(art.image)}" alt="${art.title}" class="blog-article-img" loading="lazy" />
                  <span class="blog-article-cat-pill">${art.category}</span>
                </div>
                <div class="blog-article-body">
                  <div class="blog-article-meta">
                    <span style="color:${art.oemAccent};font-weight:700;"><i class="fa-solid fa-tag"></i> ${art.oemShort}</span>
                    <span>&bull;</span>
                    <span><i class="fa-regular fa-calendar"></i> ${art.date}</span>
                    <span>&bull;</span>
                    <span><i class="fa-regular fa-clock"></i> ${art.readTime}</span>
                  </div>
                  <h3 class="blog-article-title">${art.title}</h3>
                  <p class="blog-article-summary">${art.summary}</p>
                  
                  <div class="blog-article-tags">
                    ${art.tags.map(t => `<span class="blog-tag-pill">#${t}</span>`).join('')}
                  </div>

                  <button class="blog-article-btn read-article-trigger" data-art-id="${art.id}">
                    <span>Read Full Technical Release</span>
                    <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        </div>
      </div>
    </div>

    <!-- Article Reader Modal -->
    <div class="blog-modal-backdrop" id="blog-article-modal">
      <div class="blog-modal-dialog">
        <div class="blog-modal-header">
          <h3 id="modal-article-category">Technical Release</h3>
          <button class="blog-modal-close" id="close-article-modal" aria-label="Close article modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="blog-modal-body" id="modal-article-body">
          <!-- Dynamic article content -->
        </div>
        <div class="blog-modal-footer" id="modal-article-footer">
          <span style="font-size:0.8rem;color:var(--text-gray-400);">
            <i class="fa-solid fa-shield-check" style="color:var(--success);margin-right:5px;"></i> Official Technical Dispatch
          </span>
          <a class="btn-relay-red" id="modal-article-rfq-link" href="/contact?subject=technical">
            <i class="fa-solid fa-paper-plane"></i> Inquire on this Technology
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderSingleOemBlogView(oem, blog, activeTab) {
  const articles = (blog.articles || []).filter(a => a.visible !== false);

  return `
    <div class="blogs-page-wrap" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <a data-route="/blogs">OEM Blogs &amp; Tech Hub</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span class="crumb-current" style="color:var(--text-white);font-weight:600;">${oem.name}</span>
          </nav>

          <!-- Selected OEM Banner -->
          <div class="blogs-selected-header" style="border-top:3px solid ${oem.accentColor};margin-bottom:0;">
            <div class="blogs-selected-info">
              <div class="blogs-selected-logo-wrap">
                ${oem.logoImg ? `<img src="${ContentService.resolveImg(oem.logoImg)}" alt="${oem.name} Official Logo" class="oem-logo-img" loading="eager" />` : (oem.logoSvg || '')}
              </div>
              <div class="blogs-selected-text">
                <h2>${oem.name}</h2>
                <p>${blog.headline || oem.description}</p>
              </div>
            </div>

            <div class="blogs-selected-actions">
              <button class="btn-relay-dark" id="back-to-all-oems-btn">
                <i class="fa-solid fa-arrow-left"></i> All OEMs
              </button>
              <a class="btn-relay-red" href="/contact?subject=technical&oem=${encodeURIComponent(oem.name)}">
                <i class="fa-solid fa-paper-plane"></i> Technical Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="page-main-body" style="padding-top:var(--space-8);padding-bottom:var(--space-20);">
        <div class="container">

        <!-- Content Type Header -->
        <div class="blogs-content-tabs">
          <button class="blogs-tab-btn active" data-tab="all">
            <i class="fa-solid fa-newspaper"></i> Technical News &amp; Bulletins
            <span class="blogs-tab-badge">${articles.length}</span>
          </button>
        </div>

        <!-- 1. Technical News Section -->
        ${(activeTab === 'all' || activeTab === 'articles') && articles.length > 0 ? `
          <div style="margin-bottom:var(--space-10);">
            <div style="margin-bottom:var(--space-4);display:flex;align-items:center;gap:10px;">
              <h3 style="font-size:1.25rem;font-weight:800;color:var(--text-white);margin:0;">
                Technical News &amp; Product Releases from ${oem.shortName}
              </h3>
            </div>
            <div class="blogs-articles-grid">
              ${articles.map(art => `
                <div class="blog-article-card" data-article-id="${art.id}">
                  <div class="blog-article-img-wrap">
                    <img src="${ContentService.resolveImg(art.image)}" alt="${art.title}" class="blog-article-img" loading="lazy" />
                    <span class="blog-article-cat-pill">${art.category}</span>
                  </div>
                  <div class="blog-article-body">
                    <div class="blog-article-meta">
                      <span><i class="fa-regular fa-calendar"></i> ${art.date}</span>
                      <span>&bull;</span>
                      <span><i class="fa-regular fa-clock"></i> ${art.readTime}</span>
                    </div>
                    <h4 class="blog-article-title">${art.title}</h4>
                    <p class="blog-article-summary">${art.summary}</p>
                    
                    <div class="blog-article-tags">
                      ${art.tags.map(t => `<span class="blog-tag-pill">#${t}</span>`).join('')}
                    </div>

                    <button class="blog-article-btn read-article-trigger" data-art-id="${art.id}">
                      <span>Read Full Technical Release</span>
                      <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Bottom OEM RFQ Box -->
        <div class="blogs-oem-rfq-box" style="background:rgba(255,255,255,0.02);border:1px solid var(--border-card);border-radius:var(--radius-xl);padding:24px 30px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <h4 style="font-size:1.1rem;font-weight:800;color:var(--text-white);margin-bottom:4px;">
              Need Specific Components from ${oem.name}?
            </h4>
            <p style="font-size:0.85rem;color:var(--text-gray-400);margin:0;">
              Our Bengaluru application team provides official quotations, screening, and delivery estimates within 24 hours.
            </p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a class="btn-relay-dark" data-route="/products?level=categories&oem=${oem.id}">
              <i class="fa-solid fa-boxes-stacked"></i> Browse Catalog
            </a>
            <a class="btn-relay-red" href="/contact?subject=rfq&oem=${encodeURIComponent(oem.name)}">
              <i class="fa-solid fa-file-invoice"></i> Request Quote for ${oem.shortName}
            </a>
          </div>
        </div>

        </div>
      </div>
    </div>

    <!-- Article Reader Modal -->
    <div class="blog-modal-backdrop" id="blog-article-modal">
      <div class="blog-modal-dialog">
        <div class="blog-modal-header">
          <h3 id="modal-article-category">Technical Release</h3>
          <button class="blog-modal-close" id="close-article-modal" aria-label="Close article modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="blog-modal-body" id="modal-article-body"></div>
        <div class="blog-modal-footer">
          <span style="font-size:0.8rem;color:var(--text-gray-400);">
            <i class="fa-solid fa-shield-check" style="color:var(--success);margin-right:5px;"></i> Official Technical Bulletin
          </span>
          <a class="btn-relay-red" id="modal-article-rfq-link" href="/contact?subject=technical">
            <i class="fa-solid fa-paper-plane"></i> Inquire on this Technology
          </a>
        </div>
      </div>
    </div>

  `;
}

export function initBlogsPage() {
  const searchParams = getRouteSearchParams();
  const selectedOemId = searchParams.get('oem') || '';

  // OEM Card click in "All OEMs" grid
  document.querySelectorAll('.blogs-oem-card').forEach(card => {
    card.addEventListener('click', () => {
      const oemId = card.getAttribute('data-oem-id');
      if (oemId) {
        navigate(`/blogs?${new URLSearchParams({ oem: oemId })}`);
      }
    });
  });

  // OEM chip in top selector
  document.querySelectorAll('[data-oem-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-select');
      if (oemId) {
        navigate(`/blogs?${new URLSearchParams({ oem: oemId })}`);
      }
    });
  });

  // "All 15 OEMs" chip
  document.querySelector('.blogs-oem-chip[data-filter="all"]')?.addEventListener('click', () => {
    navigate('/blogs');
  });

  // Back to All OEMs button in single OEM view
  document.getElementById('back-to-all-oems-btn')?.addEventListener('click', () => {
    navigate('/blogs');
  });

  // Tab switching in single OEM view
  document.querySelectorAll('.blogs-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (selectedOemId && tab) {
        navigate(`/blogs?${new URLSearchParams({ oem: selectedOemId, tab })}`);
      }
    });
  });

  // Article Modal Logic
  const articleModal = document.getElementById('blog-article-modal');
  const closeArticleBtn = document.getElementById('close-article-modal');
  const modalCategory = document.getElementById('modal-article-category');
  const modalBody = document.getElementById('modal-article-body');
  const modalRfqLink = document.getElementById('modal-article-rfq-link');

  function openArticleModal(article) {
    if (!articleModal || !article) return;
    if (modalCategory) modalCategory.textContent = `${article.oemName || ''} · ${article.category}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="font-size:0.8rem;color:var(--text-gray-400);margin-bottom:12px;display:flex;align-items:center;gap:12px;">
          <span><i class="fa-regular fa-calendar"></i> ${article.date}</span>
          <span>&bull;</span>
          <span><i class="fa-regular fa-clock"></i> ${article.readTime}</span>
        </div>
        <h2 style="font-size:1.35rem;font-weight:800;color:var(--text-white);line-height:1.35;margin-bottom:16px;">
          ${article.title}
        </h2>
        <div style="border-radius:12px;overflow:hidden;margin-bottom:20px;max-height:240px;background:#090D16;">
          <img src="${ContentService.resolveImg(article.image)}" alt="${article.title}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div class="article-rich-text">
          ${article.content}
        </div>
        <div style="margin-top:20px;padding-top:14px;border-top:1px solid var(--border-card);display:flex;flex-wrap:wrap;gap:6px;">
          ${article.tags.map(t => `<span class="blog-tag-pill" style="font-size:0.75rem;padding:4px 10px;">#${t}</span>`).join('')}
        </div>
      `;
    }
    if (modalRfqLink) {
      modalRfqLink.href = `/contact?subject=technical&oem=${encodeURIComponent(article.oemName || '')}&product=${encodeURIComponent(article.title)}`;
    }
    articleModal.classList.add('open');
  }

  document.querySelectorAll('.read-article-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const artId = btn.getAttribute('data-art-id');
      const allArts = getAllActiveArticles();
      const target = allArts.find(a => a.id === artId);
      if (target) {
        openArticleModal(target);
      }
    });
  });

  closeArticleBtn?.addEventListener('click', () => articleModal?.classList.remove('open'));
  articleModal?.addEventListener('click', (e) => {
    if (e.target === articleModal) articleModal.classList.remove('open');
  });
}
