/**
 * Image Gallery Manager Component
 * Allows staff to view, reorder, designate primary hero photo,
 * and add/remove image URLs for any product.
 */

export function renderImageGalleryManager(images = []) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  return `
    <div class="gallery-manager-box">
      <div class="gallery-manager-header">
        <div>
          <h4><i class="fa-regular fa-images"></i> Product Image Gallery</h4>
          <p class="section-subtitle">The primary hero image appears on catalog cards and Google thumbnail snippets. Reorder gallery photos with the arrows.</p>
        </div>
        <button type="button" class="btn-sm btn-outline" id="btn-add-image-modal">
          <i class="fa-solid fa-plus"></i> Add Image
        </button>
      </div>

      <div class="gallery-items-grid" id="gallery-items-container">
        ${sorted.length === 0 ? `
          <div class="gallery-empty-state">
            <i class="fa-solid fa-image"></i>
            <p>No images linked to this product yet.</p>
            <span class="text-muted">Per Option B, a product must have at least one image before it can be published.</span>
          </div>
        ` : sorted.map((img, index) => renderImageCard(img, index, sorted.length)).join('')}
      </div>

      <!-- Add Image Modal / Form Inline -->
      <div class="add-image-bar" id="add-image-bar" style="display: none;">
        <div class="form-row form-row-3">
          <div class="form-group">
            <label>Image URL / Path</label>
            <input type="text" id="new-img-url" placeholder="/catalog-images/... or https://..." />
          </div>
          <div class="form-group">
            <label>Alt Text (SEO)</label>
            <input type="text" id="new-img-alt" placeholder="Descriptive image text" />
          </div>
          <div class="form-group form-actions-inline">
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-new-image">Save Image</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-new-image">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderImageCard(img, index, total) {
  const isPrimary = Boolean(img.is_primary);
  return `
    <div class="image-card ${isPrimary ? 'is-primary-card' : ''}" data-id="${img.id || index}">
      <div class="image-card-thumb">
        <img src="${escapeHtml(img.image_url)}" alt="${escapeHtml(img.alt_text || 'Product image')}" loading="lazy" onerror="this.src='/favicon.ico'; this.style.opacity='0.4';" />
        ${isPrimary ? '<span class="primary-hero-pill"><i class="fa-solid fa-star"></i> Primary Hero</span>' : ''}
        <span class="order-badge">#${img.display_order || index + 1}</span>
      </div>
      <div class="image-card-details">
        <div class="image-card-actions">
          <div class="reorder-btns">
            <button type="button" class="btn-icon" data-action="move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move up">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="btn-icon" data-action="move-down" data-index="${index}" ${index === total - 1 ? 'disabled' : ''} title="Move down">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
          <div class="manage-btns">
            ${!isPrimary ? `
              <button type="button" class="btn-xs btn-outline" data-action="make-primary" data-index="${index}" title="Set as primary hero thumbnail">
                <i class="fa-regular fa-star"></i> Set Primary
              </button>
            ` : ''}
            <button type="button" class="btn-icon text-danger" data-action="delete-image" data-index="${index}" title="Remove image">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div class="image-card-alt">
          <input type="text" class="input-sm img-alt-input" data-index="${index}" value="${escapeHtml(img.alt_text || '')}" placeholder="Alt text..." />
        </div>
      </div>
    </div>
  `;
}

export function bindGalleryEvents(images, onUpdate) {
  const container = document.getElementById('gallery-items-container');
  const addBtn = document.getElementById('btn-add-image-modal');
  const addBar = document.getElementById('add-image-bar');
  const saveNewBtn = document.getElementById('btn-save-new-image');
  const cancelNewBtn = document.getElementById('btn-cancel-new-image');
  const newUrlInput = document.getElementById('new-img-url');
  const newAltInput = document.getElementById('new-img-alt');

  if (addBtn && addBar) {
    addBtn.addEventListener('click', () => {
      addBar.style.display = addBar.style.display === 'none' ? 'block' : 'none';
      if (newUrlInput) newUrlInput.focus();
    });
  }

  if (cancelNewBtn && addBar) {
    cancelNewBtn.addEventListener('click', () => {
      addBar.style.display = 'none';
      if (newUrlInput) newUrlInput.value = '';
      if (newAltInput) newAltInput.value = '';
    });
  }

  if (saveNewBtn && newUrlInput) {
    saveNewBtn.addEventListener('click', () => {
      const url = newUrlInput.value.trim();
      const alt = (newAltInput ? newAltInput.value : '').trim();
      if (!url) {
        alert('Please enter an image URL or relative path.');
        return;
      }

      const nextOrder = images.length + 1;
      const isFirst = images.length === 0;

      const newImg = {
        id: Date.now(),
        image_url: url,
        alt_text: alt,
        display_order: nextOrder,
        is_primary: isFirst
      };

      const updated = [...images, newImg];
      addBar.style.display = 'none';
      newUrlInput.value = '';
      if (newAltInput) newAltInput.value = '';
      onUpdate(updated);
    });
  }

  if (container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const idx = Number(btn.dataset.index);

      if (action === 'move-up' && idx > 0) {
        const copy = [...images];
        const temp = copy[idx - 1];
        copy[idx - 1] = copy[idx];
        copy[idx] = temp;
        // re-index display orders
        copy.forEach((item, i) => item.display_order = i + 1);
        onUpdate(copy);
      } else if (action === 'move-down' && idx < images.length - 1) {
        const copy = [...images];
        const temp = copy[idx + 1];
        copy[idx + 1] = copy[idx];
        copy[idx] = temp;
        // re-index display orders
        copy.forEach((item, i) => item.display_order = i + 1);
        onUpdate(copy);
      } else if (action === 'make-primary') {
        const copy = images.map((item, i) => ({
          ...item,
          is_primary: i === idx
        }));
        onUpdate(copy);
      } else if (action === 'delete-image') {
        if (confirm('Remove this image from product gallery?')) {
          let copy = images.filter((_, i) => i !== idx);
          if (copy.length > 0 && !copy.some(item => item.is_primary)) {
            copy[0].is_primary = true;
          }
          copy.forEach((item, i) => item.display_order = i + 1);
          onUpdate(copy);
        }
      }
    });

    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('img-alt-input')) {
        const idx = Number(e.target.dataset.index);
        const copy = [...images];
        if (copy[idx]) {
          copy[idx].alt_text = e.target.value.trim();
          onUpdate(copy);
        }
      }
    });
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
