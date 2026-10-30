/**
 * Pre-Publish SEO Quality Gate & Audit Component
 * Enforces Option B rule: a product cannot be published unless it has BOTH
 * an image and a detailed description, plus basic SEO metadata.
 */

export function runProductQualityAudit(product, images = []) {
  const issues = [];
  const warnings = [];
  const passes = [];

  // Rule 1: Option B - Primary Image
  if (!images || images.length === 0) {
    issues.push({
      rule: 'Option B Quality Gate: Primary Image Required',
      message: 'Product has no images. Google Image Search will not index this page.',
      severity: 'error'
    });
  } else {
    passes.push({
      rule: 'Product Image',
      message: `${images.length} image(s) linked. Primary hero: ${images.find(i => i.is_primary)?.alt_text || 'Yes'}`
    });
  }

  // Rule 2: Description Quality
  const desc = (product.description || '').trim();
  if (!desc) {
    issues.push({
      rule: 'Option B Quality Gate: Description Required',
      message: 'Product description is completely missing.',
      severity: 'error'
    });
  } else if (desc.length < 60) {
    warnings.push({
      rule: 'Thin Content Risk',
      message: `Description is only ${desc.length} characters (recommended: > 60 chars for RF/microwave components).`,
      severity: 'warning'
    });
  } else {
    passes.push({
      rule: 'Product Description',
      message: `Rich description provided (${desc.length} characters).`
    });
  }

  // Rule 3: Meta Title
  const title = (product.meta_title || '').trim();
  if (!title) {
    issues.push({
      rule: 'Missing Meta Title',
      message: 'Page has no customized <title> tag for Google SERP snippet.',
      severity: 'error'
    });
  } else if (title.length > 65) {
    warnings.push({
      rule: 'Meta Title Length',
      message: `Title is ${title.length} chars (will truncate in Google Search beyond 60 chars).`,
      severity: 'warning'
    });
  } else {
    passes.push({
      rule: 'Meta Title',
      message: `SEO title is optimal (${title.length} chars).`
    });
  }

  // Rule 4: Meta Description
  const metaDesc = (product.meta_description || '').trim();
  if (!metaDesc) {
    warnings.push({
      rule: 'Missing Meta Description',
      message: 'Google will auto-generate snippet text from the page body if empty.',
      severity: 'warning'
    });
  } else if (metaDesc.length > 165) {
    warnings.push({
      rule: 'Meta Description Length',
      message: `Description is ${metaDesc.length} chars (Google will truncate beyond 160 chars).`,
      severity: 'warning'
    });
  } else {
    passes.push({
      rule: 'Meta Description',
      message: `Optimal snippet description (${metaDesc.length} chars).`
    });
  }

  // Rule 5: Specifications
  const specs = product.specifications || {};
  const specCount = Object.keys(specs).length;
  if (specCount === 0) {
    warnings.push({
      rule: 'Missing Technical Specifications',
      message: 'No key-value engineering specs provided (e.g. Frequency, Insertion Loss, Dielectric Constant).',
      severity: 'warning'
    });
  } else {
    passes.push({
      rule: 'Technical Specifications',
      message: `${specCount} engineering specification parameters defined.`
    });
  }

  const canPublish = issues.length === 0;

  return {
    canPublish,
    issues,
    warnings,
    passes,
    score: Math.round(((passes.length) / (passes.length + issues.length + warnings.length)) * 100)
  };
}

export function renderAuditModal(auditResult, onConfirmPublish) {
  return `
    <div class="audit-modal-backdrop" id="audit-modal-backdrop">
      <div class="audit-modal-card">
        <div class="audit-modal-header">
          <div class="audit-score-circle ${auditResult.canPublish ? 'circle-pass' : 'circle-fail'}">
            <span>${auditResult.score}%</span>
          </div>
          <div>
            <h3>Pre-Publish SEO & Quality Gate Audit</h3>
            <p class="subtitle">${auditResult.canPublish ? 'All mandatory quality gates passed! Product is eligible for publication.' : 'Action required: Fix critical quality issues before publishing.'}</p>
          </div>
          <button type="button" class="btn-close" id="btn-close-audit"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="audit-modal-body">
          ${auditResult.issues.length > 0 ? `
            <div class="audit-group error-group">
              <h4><i class="fa-solid fa-circle-xmark"></i> Critical Errors (${auditResult.issues.length})</h4>
              <ul>
                ${auditResult.issues.map(item => `<li><strong>${item.rule}:</strong> ${item.message}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${auditResult.warnings.length > 0 ? `
            <div class="audit-group warning-group">
              <h4><i class="fa-solid fa-triangle-exclamation"></i> Optimization Warnings (${auditResult.warnings.length})</h4>
              <ul>
                ${auditResult.warnings.map(item => `<li><strong>${item.rule}:</strong> ${item.message}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${auditResult.passes.length > 0 ? `
            <div class="audit-group pass-group">
              <h4><i class="fa-solid fa-circle-check"></i> Passed Quality Checks (${auditResult.passes.length})</h4>
              <ul>
                ${auditResult.passes.map(item => `<li><strong>${item.rule}:</strong> ${item.message}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="audit-modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-audit">Back to Editor</button>
          ${auditResult.canPublish ? `
            <button type="button" class="btn btn-success" id="btn-confirm-publish">
              <i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Publish Live
            </button>
          ` : `
            <button type="button" class="btn btn-disabled" disabled title="Resolve critical errors above to publish">
              <i class="fa-solid fa-lock"></i> Publishing Locked (Option B Gate)
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

export function bindAuditModalEvents(onConfirmPublish) {
  const backdrop = document.getElementById('audit-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-audit');
  const cancelBtn = document.getElementById('btn-cancel-audit');
  const confirmBtn = document.getElementById('btn-confirm-publish');

  function closeModal() {
    if (backdrop) backdrop.remove();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeModal();
      if (onConfirmPublish) onConfirmPublish();
    });
  }
}

/**
 * Catalog-wide Pre-Publish Quality Audit.
 * Scans all OEMs, categories, and products to calculate Option B readiness.
 *
 * @param {Array} oems - Full array of OEMs with categories and products
 * @returns {Object} Catalog audit metrics
 */
export function runCatalogPrePublishAudit(oems = []) {
  let totalOems = 0;
  let totalCategories = 0;
  let totalProducts = 0;
  let eligibleProducts = 0;
  let draftProducts = 0;
  let hiddenProducts = 0;
  const issues = [];
  const warnings = [];

  for (const oem of oems) {
    if (oem.visible === false) continue;
    totalOems++;
    for (const cat of (oem.categories || [])) {
      if (cat.visible === false) continue;
      totalCategories++;
      for (const prod of (cat.products || [])) {
        totalProducts++;
        if (prod.visible === false) {
          hiddenProducts++;
          continue;
        }

        const hasImg = Boolean(
          (prod.image && !prod.image.startsWith('idb:')) ||
          (Array.isArray(prod.gallery) && prod.gallery.length > 0 && prod.gallery.some(g => (g.image_url || g.url) && !(g.image_url || g.url).startsWith('idb:'))) ||
          oem.defaultImage
        );
        const hasDesc = Boolean(prod.description && prod.description.trim().length >= 20);

        if (hasImg && hasDesc) {
          eligibleProducts++;
        } else {
          draftProducts++;
          if (!hasImg) {
            issues.push(`Product "${prod.name}" (${oem.name}) is missing a hardware photo.`);
          }
          if (!hasDesc) {
            warnings.push(`Product "${prod.name}" (${oem.name}) has a thin description (< 20 chars).`);
          }
        }
      }
    }
  }

  const score = totalProducts > 0 ? Math.round((eligibleProducts / totalProducts) * 100) : 100;

  return {
    totalOems,
    totalCategories,
    totalProducts,
    eligibleProducts,
    draftProducts,
    hiddenProducts,
    score,
    issues,
    warnings,
    canPublish: eligibleProducts > 0
  };
}

/**
 * Render the Catalog-Wide Pre-Publish Audit Modal.
 *
 * @param {Object} auditSummary - Output from runCatalogPrePublishAudit
 * @param {boolean} isWebhookConfigured - Whether VITE_REBUILD_WEBHOOK_URL is set
 * @returns {string} Modal HTML markup
 */
export function renderCatalogPublishModal(auditSummary, isWebhookConfigured) {
  return `
    <div class="audit-modal-backdrop" id="publish-audit-modal-backdrop">
      <div class="audit-modal-card">
        <div class="audit-modal-header">
          <div class="audit-score-circle ${auditSummary.canPublish ? 'circle-pass' : 'circle-fail'}">
            <span>${auditSummary.score}%</span>
          </div>
          <div>
            <h3>Pre-Publish SEO &amp; Quality Gate Audit</h3>
            <p class="subtitle">Verifying catalog readiness before triggering static site regeneration.</p>
          </div>
          <button type="button" class="btn-close" id="btn-close-publish-audit"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="audit-modal-body">
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center;margin-bottom:10px;">
            <div style="background:#f1f5f9;padding:12px;border-radius:8px;">
              <div style="font-size:1.4rem;font-weight:700;color:#0f172a;">${auditSummary.eligibleProducts}</div>
              <div style="font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;">Eligible to Publish</div>
            </div>
            <div style="background:#fef2f2;padding:12px;border-radius:8px;">
              <div style="font-size:1.4rem;font-weight:700;color:#dc2626;">${auditSummary.draftProducts}</div>
              <div style="font-size:0.75rem;color:#dc2626;font-weight:600;text-transform:uppercase;">Drafts (Incomplete)</div>
            </div>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;">
              <div style="font-size:1.4rem;font-weight:700;color:#64748b;">${auditSummary.totalProducts}</div>
              <div style="font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;">Total In Catalog</div>
            </div>
          </div>

          <div class="audit-group pass-group">
            <h4><i class="fa-solid fa-circle-check"></i> Option B SEO Quality Gate</h4>
            <p style="font-size:0.85rem;color:#334155;margin-top:4px;">
              ${auditSummary.eligibleProducts} component(s) meet the Option B quality standard (valid hardware photo + detailed engineering description). These will be pre-rendered into indexable static HTML pages and submitted to the XML Sitemap.
            </p>
          </div>

          ${auditSummary.draftProducts > 0 ? `
            <div class="audit-group warning-group">
              <h4><i class="fa-solid fa-triangle-exclamation"></i> Draft Protection (${auditSummary.draftProducts})</h4>
              <p style="font-size:0.85rem;color:#92400e;margin-top:4px;">
                ${auditSummary.draftProducts} product(s) do not meet the minimum requirements and will remain safely hidden from search engines to protect site ranking authority.
              </p>
            </div>
          ` : ''}

          <div style="background:${isWebhookConfigured ? '#eff6ff' : '#fffbeb'};border:1px solid ${isWebhookConfigured ? '#bfdbfe' : '#fde68a'};padding:12px;border-radius:8px;font-size:0.82rem;color:${isWebhookConfigured ? '#1e40af' : '#92400e'};">
            <i class="fa-solid ${isWebhookConfigured ? 'fa-satellite-dish' : 'fa-info-circle'}"></i>
            <strong>Publishing Pipeline:</strong> ${isWebhookConfigured 
              ? 'Live deploy webhook is configured. Confirming will signal your production static builder to rebuild the website.' 
              : 'Simulation Mode: VITE_REBUILD_WEBHOOK_URL is not set. Confirming will simulate a publish event without pinging a remote server.'}
          </div>
        </div>

        <div class="audit-modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-publish-audit">Cancel</button>
          <button type="button" class="btn btn-success" id="btn-confirm-global-publish" ${!auditSummary.canPublish ? 'disabled' : ''}>
            <i class="fa-solid fa-cloud-arrow-up"></i> Confirm &amp; Publish (${auditSummary.eligibleProducts} Products)
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Bind event handlers for the catalog pre-publish modal.
 *
 * @param {Function} onConfirm - Callback triggered when user clicks Confirm & Publish
 */
export function bindCatalogPublishModalEvents(onConfirm) {
  const backdrop = document.getElementById('publish-audit-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-publish-audit');
  const cancelBtn = document.getElementById('btn-cancel-publish-audit');
  const confirmBtn = document.getElementById('btn-confirm-global-publish');

  function closeModal() {
    if (backdrop) backdrop.remove();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeModal();
      if (onConfirm) onConfirm();
    });
  }
}

