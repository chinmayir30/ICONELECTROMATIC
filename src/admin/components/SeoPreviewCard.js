/**
 * Live SEO Preview Card Component
 * Simulates Google SERP result (Desktop and Mobile) with live character counters
 * and pixel width indicators.
 */

export function renderSeoPreviewCard(product = {}) {
  const title = product.meta_title || `${product.name || 'Product Name'} | Icon Electromatic`;
  const url = product.canonical_url || `https://iconelectromatic.com/products/${product.oem_slug || 'oem'}/${product.slug || 'product'}`;
  const description = product.meta_description || product.description || 'Add a compelling meta description summarizing technical specifications and key applications to maximize search click-through rate.';

  const titleLen = title.length;
  const descLen = description.length;

  // Title length indicator (ideal 50-60 chars)
  let titleBadgeClass = 'badge-good';
  let titleStatus = 'Optimal length (50–60 chars)';
  if (titleLen < 30) {
    titleBadgeClass = 'badge-warn';
    titleStatus = 'Too short (< 30 chars)';
  } else if (titleLen > 60) {
    titleBadgeClass = 'badge-error';
    titleStatus = 'Too long (> 60 chars, Google will truncate)';
  }

  // Description length indicator (ideal 140-160 chars)
  let descBadgeClass = 'badge-good';
  let descStatus = 'Optimal length (140–160 chars)';
  if (descLen < 70) {
    descBadgeClass = 'badge-warn';
    descStatus = 'Too short (< 70 chars)';
  } else if (descLen > 160) {
    descBadgeClass = 'badge-error';
    descStatus = 'Too long (> 160 chars, Google will truncate)';
  }

  return `
    <div class="seo-card-container">
      <div class="seo-card-header">
        <div class="seo-card-title">
          <i class="fa-brands fa-google"></i>
          <span>Live Google Search Snippet Preview</span>
        </div>
        <div class="seo-mode-toggle">
          <button type="button" class="seo-toggle-btn active" id="btn-seo-desktop"><i class="fa-solid fa-desktop"></i> Desktop</button>
          <button type="button" class="seo-toggle-btn" id="btn-seo-mobile"><i class="fa-solid fa-mobile-screen"></i> Mobile</button>
        </div>
      </div>

      <div class="google-serp-preview desktop-view" id="google-serp-snippet">
        <div class="serp-site-info">
          <div class="serp-favicon"><i class="fa-solid fa-microchip"></i></div>
          <div class="serp-urls">
            <span class="serp-domain">iconelectromatic.com</span>
            <span class="serp-breadcrumb"> › products › ${escapeHtml(product.oem_slug || 'oem')} › ${escapeHtml(product.slug || 'product')}</span>
          </div>
        </div>
        <div class="serp-headline" id="preview-serp-title">${escapeHtml(title)}</div>
        <div class="serp-snippet" id="preview-serp-desc">${escapeHtml(description)}</div>
      </div>

      <div class="seo-metrics-grid">
        <div class="seo-metric-item">
          <div class="metric-top">
            <span class="metric-label">Meta Title Length</span>
            <span class="metric-count ${titleBadgeClass}" id="title-char-count">${titleLen} / 60 chars</span>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-bar ${titleBadgeClass}" style="width: ${Math.min(100, (titleLen / 60) * 100)}%;"></div>
          </div>
          <span class="metric-hint" id="title-status-text">${titleStatus}</span>
        </div>

        <div class="seo-metric-item">
          <div class="metric-top">
            <span class="metric-label">Meta Description Length</span>
            <span class="metric-count ${descBadgeClass}" id="desc-char-count">${descLen} / 160 chars</span>
          </div>
          <div class="metric-progress-bg">
            <div class="metric-progress-bar ${descBadgeClass}" style="width: ${Math.min(100, (descLen / 160) * 100)}%;"></div>
          </div>
          <span class="metric-hint" id="desc-status-text">${descStatus}</span>
        </div>
      </div>
    </div>
  `;
}

export function initSeoPreviewCard() {
  const desktopBtn = document.getElementById('btn-seo-desktop');
  const mobileBtn = document.getElementById('btn-seo-mobile');
  const snippet = document.getElementById('google-serp-snippet');

  if (desktopBtn && mobileBtn && snippet) {
    desktopBtn.addEventListener('click', () => {
      desktopBtn.classList.add('active');
      mobileBtn.classList.remove('active');
      snippet.className = 'google-serp-preview desktop-view';
    });

    mobileBtn.addEventListener('click', () => {
      mobileBtn.classList.add('active');
      desktopBtn.classList.remove('active');
      snippet.className = 'google-serp-preview mobile-view';
    });
  }
}

export function updateSeoPreviewLive(title, desc) {
  const previewTitle = document.getElementById('preview-serp-title');
  const previewDesc = document.getElementById('preview-serp-desc');
  const titleCount = document.getElementById('title-char-count');
  const descCount = document.getElementById('desc-char-count');
  const titleHint = document.getElementById('title-status-text');
  const descHint = document.getElementById('desc-status-text');

  if (previewTitle) previewTitle.textContent = title || 'Product Name | Icon Electromatic';
  if (previewDesc) previewDesc.textContent = desc || 'Add a compelling meta description...';

  const tLen = (title || '').length;
  const dLen = (desc || '').length;

  if (titleCount) {
    titleCount.textContent = `${tLen} / 60 chars`;
    titleCount.className = `metric-count ${tLen > 60 ? 'badge-error' : tLen < 30 ? 'badge-warn' : 'badge-good'}`;
  }
  if (titleHint) {
    titleHint.textContent = tLen > 60 ? 'Too long (> 60 chars, Google will truncate)' : tLen < 30 ? 'Too short (< 30 chars)' : 'Optimal length (50–60 chars)';
  }

  if (descCount) {
    descCount.textContent = `${dLen} / 160 chars`;
    descCount.className = `metric-count ${dLen > 160 ? 'badge-error' : dLen < 70 ? 'badge-warn' : 'badge-good'}`;
  }
  if (descHint) {
    descHint.textContent = dLen > 160 ? 'Too long (> 160 chars, Google will truncate)' : dLen < 70 ? 'Too short (< 70 chars)' : 'Optimal length (140–160 chars)';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
