/**
 * Product Detail Page — ICON ELECTROMATIC
 * Sleek Dark Relay-styled Detail View (UI Only)
 */
import { getProductById, getProductsByCategory } from '../data/products.js';
import { renderProductCard, getProductDisplayImage } from '../components/ProductCard.js';

export function renderProductDetailPage(params) {
  const product = getProductById(params.id);
  if (!product) {
    return `
      <div class="page-content" style="padding-top:calc(var(--header-height) + 40px);padding-bottom:var(--space-24);background:var(--bg-dark);min-height:80vh;">
        <div class="container" style="text-align:center; padding:var(--space-20) 0;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:3rem; color:var(--text-gray-500); margin-bottom:var(--space-4); display:block;"></i>
          <h2 style="color:var(--text-white); margin-bottom:var(--space-2);">Component Not Found</h2>
          <p style="color:var(--text-gray-400); margin-bottom:var(--space-6);">The component you are searching for does not exist or has been updated.</p>
          <a class="btn-relay-blue" data-route="/products">
            <i class="fa-solid fa-arrow-left"></i> Back to Products
          </a>
        </div>
      </div>
    `;
  }

  const related = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const specEntries = Object.entries(product.specs);
  const displayImage = getProductDisplayImage(product);

  return `
    <div class="page-content product-detail-page" style="min-height:100vh;">
      <!-- Unified Page Hero Banner (Blue in light theme) -->
      <section class="page-hero-banner" style="padding-bottom:20px;">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb-dark" style="margin-bottom:0;">
            <a data-route="/">Home</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <a data-route="/products">Products</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <a data-route="/products?category=${product.category}">${product.categoryName}</a>
            <span class="sep"><i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i></span>
            <span class="crumb-current" style="color:var(--text-white);font-weight:600;">${product.model}</span>
          </nav>
        </div>
      </section>

      <!-- Main Content Area -->
      <div class="page-main-body" style="padding-top:var(--space-8);padding-bottom:var(--space-24);">
        <div class="container">
          <div class="product-detail-layout" style="display:grid;grid-template-columns:1fr 1.15fr;gap:var(--space-12);margin-bottom:var(--space-16);margin-top:var(--space-4);">
          <!-- Gallery -->
          <div>
            <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);margin-bottom:var(--space-4);aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;padding:var(--space-4);">
              <img src="${displayImage}" alt="${product.model}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md);" />
            </div>
            <div style="display:flex;gap:10px;">
              <div style="width:72px;height:72px;border-radius:var(--radius-md);border:1.5px solid var(--logo-blue);overflow:hidden;cursor:pointer;background:rgba(0,0,0,0.4);">
                <img src="${displayImage}" alt="Thumb" style="width:100%;height:100%;object-fit:cover;" />
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div>
            <div class="page-eyebrow-pill" style="margin-bottom:12px;">
              <span class="hub-dot-pulse"></span>
              <span>${product.categoryName}</span>
            </div>
            <h1 class="page-title-unified" style="font-size:clamp(2rem, 3.5vw, 2.75rem);margin-bottom:10px;">
              ${product.model}
            </h1>
            <p style="font-size:0.85rem;color:var(--text-gray-400);margin-bottom:var(--space-4);">
              Model Part: <strong style="color:var(--text-white);">${product.model}</strong> · RoHS Compliant · ISO 9001
            </p>

            <p style="font-size:1rem;color:var(--text-gray-300);line-height:1.7;margin-bottom:var(--space-6);">
              ${product.description}
            </p>

            <!-- Technical Specifications Table -->
            <div style="margin-bottom:var(--space-8);">
              <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-white);margin-bottom:var(--space-3);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-list-check" style="color:var(--logo-blue-light);font-size:0.9rem;"></i> Technical Specifications
              </h3>
              <div style="border:1px solid var(--border-card);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg-card);">
                ${specEntries.map(([key, value], idx) => `
                  <div style="display:flex;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border-subtle);background:${idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};font-size:0.875rem;">
                    <span style="color:var(--text-gray-400);">${key}</span>
                    <span style="color:var(--text-white);font-weight:600;">${value}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Inquire Actions Box -->
            <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:var(--radius-xl);padding:var(--space-6);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);flex-wrap:wrap;gap:var(--space-2);">
                <div>
                  <h4 style="color:var(--text-white);font-size:1.1rem;font-weight:700;">Request Pricing & Fast Quote</h4>
                  <p style="color:var(--text-gray-400);font-size:0.8rem;">Technical datasheets and formal quote delivered within 24 hours.</p>
                </div>
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--success);font-weight:600;">
                  <i class="fa-solid fa-circle-check"></i> Verified Stock
                </span>
              </div>

              <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
                <a class="btn-relay-blue" data-route="/contact?subject=rfq&model=${encodeURIComponent(product.model)}&product=${encodeURIComponent(product.name || product.model)}&oem=${encodeURIComponent(product.oem || '')}" style="flex:1;justify-content:center;">
                  <i class="fa-solid fa-paper-plane"></i> Inquire for ${product.model}
                </a>
                <a class="btn-relay-dark" data-route="/contact?subject=technical&model=${encodeURIComponent(product.model)}&product=${encodeURIComponent(product.name || product.model)}&oem=${encodeURIComponent(product.oem || '')}">
                  Speak to Engineer
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        ${related.length > 0 ? `
          <div style="border-top:1px solid var(--border-subtle);padding-top:var(--space-12);">
            <div style="margin-bottom:var(--space-6);">
              <span class="section-tag-mono">SIMILAR SPECIFICATIONS</span>
              <h3 style="font-size:1.6rem;font-weight:800;color:var(--text-white);">Related Components</h3>
            </div>
            <div class="products-grid-dark">
              ${related.map((p, i) => renderProductCard(p, i)).join('')}
            </div>
          </div>
        ` : ''}
        </div>
      </div>
    </div>
  `;
}

export function initProductDetailPage() {}
