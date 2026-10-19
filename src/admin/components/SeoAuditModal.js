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
