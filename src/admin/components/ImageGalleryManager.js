/**
 * Image Gallery Manager Component
 * Allows staff to view, reorder, designate primary hero photo,
 * upload images via Supabase Storage, and add/remove image URLs for any product.
 */

import { supabaseClient } from '../../services/supabaseClient.js';
import { ImageStorage } from '../../data/ImageStorage.js';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderGalleryCardsHtml(items = []) {
  if (!items || items.length === 0) {
    return `
      <div class="gallery-empty-state">
        <i class="fa-solid fa-image"></i>
        <p>No images linked to this product yet.</p>
        <span class="text-muted">Per Option B, a product must have at least one image before it can be published.</span>
      </div>
    `;
  }
  return items.map((img, index) => renderImageCard(img, index, items.length)).join('');
}

export function renderImageCard(img, index, total) {
  const isPrimary = Boolean(img.is_primary);
  const resolved = ImageStorage.resolveImageUrl(img.image_url);
  const orderNum = img.display_order != null ? img.display_order : (index + 1);

  return `
    <div class="image-card ${isPrimary ? 'is-primary-card' : ''}" data-id="${escapeAttr(img.id || index)}">
      <div class="image-card-thumb">
        <img src="${escapeAttr(resolved)}" data-idb="${escapeAttr(img.image_url)}" alt="${escapeAttr(img.alt_text || 'Product image')}" loading="lazy" onerror="this.src='/favicon.ico'; this.style.opacity='0.4';" />
        ${isPrimary ? '<span class="primary-hero-pill"><i class="fa-solid fa-star"></i> Primary Hero</span>' : ''}
        <span class="order-badge">#${orderNum}</span>
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
          <input type="text" class="input-sm img-alt-input" data-index="${index}" value="${escapeAttr(img.alt_text || '')}" placeholder="Alt text..." />
        </div>
      </div>
    </div>
  `;
}

export function renderImageGalleryManager(images = []) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  return `
    <div class="gallery-manager-box">
      <div class="gallery-manager-header">
        <div>
          <h4><i class="fa-regular fa-images"></i> Product Image Gallery</h4>
          <p class="section-subtitle">The primary hero image appears on catalog cards and Google thumbnail snippets. Reorder gallery photos with the arrows.</p>
        </div>
        <div class="gallery-header-actions" style="display:flex;gap:8px;align-items:center;">
          <label class="a-btn a-btn-sm a-btn-primary a-upload-btn" id="gallery-file-label" style="cursor:pointer;margin:0;">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span id="gallery-upload-txt">Upload Photo</span>
            <input type="file" id="gallery-file-input" accept="image/jpeg,image/png,image/webp" style="display:none;" />
          </label>
          <button type="button" class="a-btn a-btn-sm a-btn-outline" id="btn-add-image-modal">
            <i class="fa-solid fa-link"></i> Add from URL
          </button>
        </div>
      </div>

      <div class="gallery-items-grid" id="gallery-items-container">
        ${renderGalleryCardsHtml(sorted)}
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

export function bindGalleryEvents(images, onUpdate, context = {}) {
  let currentList = Array.isArray(images) ? [...images] : [];

  const container = document.getElementById('gallery-items-container');
  const addBtn = document.getElementById('btn-add-image-modal');
  const addBar = document.getElementById('add-image-bar');
  const saveNewBtn = document.getElementById('btn-save-new-image');
  const cancelNewBtn = document.getElementById('btn-cancel-new-image');
  const newUrlInput = document.getElementById('new-img-url');
  const newAltInput = document.getElementById('new-img-alt');
  const fileInput = document.getElementById('gallery-file-input');
  const fileLabel = document.getElementById('gallery-file-label');
  const uploadTxt = document.getElementById('gallery-upload-txt');

  function renderGrid() {
    if (!container) return;
    const sorted = [...currentList].sort((a, b) => a.display_order - b.display_order);
    container.innerHTML = renderGalleryCardsHtml(sorted);
  }

  function notifyUpdate() {
    renderGrid();
    if (typeof onUpdate === 'function') {
      onUpdate([...currentList]);
    }
  }

  // 1. Direct File Upload
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Duplicate upload guard
      if (fileLabel?.classList.contains('is-uploading') || fileInput.disabled) {
        return;
      }

      const prevUploadText = uploadTxt ? uploadTxt.innerHTML : 'Upload Photo';
      if (fileLabel) fileLabel.classList.add('is-uploading');
      fileInput.disabled = true;
      if (uploadTxt) uploadTxt.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

      try {
        const folder = context.folder || 'products';
        const oemSlug = context.oemSlug || '';
        const productSlug = context.productSlug || '';

        const result = await supabaseClient.uploadImage(file, { folder, oemSlug, productSlug });
        // Use result.url as primary, fallback to result.path for local dev
        const valueToStore = result.isLocalFallback ? result.path : (result.url || result.publicUrl);

        const nextOrder = currentList.length + 1;
        const isFirst = currentList.length === 0;
        const defaultAlt = context.productName ? `${context.productName} - Photo ${nextOrder}` : `Product Photo ${nextOrder}`;

        const newImg = {
          id: Date.now(),
          image_url: valueToStore,
          alt_text: defaultAlt,
          display_order: nextOrder,
          is_primary: isFirst
        };

        currentList.push(newImg);
        // Ensure exactly one primary image if non-empty
        if (!currentList.some(i => i.is_primary)) {
          currentList[0].is_primary = true;
        }

        // Reset state
        if (fileLabel) fileLabel.classList.remove('is-uploading');
        fileInput.disabled = false;
        fileInput.value = '';
        if (uploadTxt) uploadTxt.innerHTML = prevUploadText;

        notifyUpdate();
      } catch (err) {
        console.error('Gallery image upload failed:', err);
        if (fileLabel) fileLabel.classList.remove('is-uploading');
        fileInput.disabled = false;
        fileInput.value = '';
        if (uploadTxt) uploadTxt.innerHTML = prevUploadText;
        alert(`Gallery Image Upload Failed:\n${err.message}`);
      }
    });
  }

  // 2. Manual URL / Path Entry
  if (addBtn && addBar) {
    addBtn.addEventListener('click', () => {
      addBar.style.display = addBar.style.display === 'none' ? 'block' : 'none';
      if (newUrlInput && addBar.style.display !== 'none') newUrlInput.focus();
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

      const nextOrder = currentList.length + 1;
      const isFirst = currentList.length === 0;

      const newImg = {
        id: Date.now(),
        image_url: url,
        alt_text: alt || (context.productName ? `${context.productName} - Photo ${nextOrder}` : `Product Photo ${nextOrder}`),
        display_order: nextOrder,
        is_primary: isFirst
      };

      currentList.push(newImg);
      if (!currentList.some(i => i.is_primary)) {
        currentList[0].is_primary = true;
      }

      addBar.style.display = 'none';
      newUrlInput.value = '';
      if (newAltInput) newAltInput.value = '';

      notifyUpdate();
    });
  }

  // 3. Grid delegation: Reorder, Make Primary, Unlink
  if (container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset?.action || btn.getAttribute('data-action');
      const idxAttr = btn.dataset?.index !== undefined ? btn.dataset.index : btn.getAttribute('data-index');
      const idx = Number(idxAttr);

      if (action === 'move-up' && idx > 0) {
        const temp = currentList[idx - 1];
        currentList[idx - 1] = currentList[idx];
        currentList[idx] = temp;
        currentList.forEach((item, i) => { item.display_order = i + 1; });
        notifyUpdate();
      } else if (action === 'move-down' && idx < currentList.length - 1) {
        const temp = currentList[idx + 1];
        currentList[idx + 1] = currentList[idx];
        currentList[idx] = temp;
        currentList.forEach((item, i) => { item.display_order = i + 1; });
        notifyUpdate();
      } else if (action === 'make-primary') {
        currentList = currentList.map((item, i) => ({
          ...item,
          is_primary: i === idx
        }));
        notifyUpdate();
      } else if (action === 'delete-image') {
        // Confirmation dialog; unlink only (NEVER delete remote or IDB storage assets)
        if (confirm('Remove this image from product gallery?')) {
          currentList = currentList.filter((_, i) => i !== idx);
          if (currentList.length > 0 && !currentList.some(item => item.is_primary)) {
            currentList[0].is_primary = true;
          }
          currentList.forEach((item, i) => { item.display_order = i + 1; });
          notifyUpdate();
        }
      }
    });

    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('img-alt-input')) {
        const idxAttr = e.target.dataset?.index !== undefined ? e.target.dataset.index : e.target.getAttribute('data-index');
        const idx = Number(idxAttr);
        if (currentList[idx]) {
          currentList[idx].alt_text = e.target.value.trim();
          if (typeof onUpdate === 'function') {
            onUpdate([...currentList]);
          }
        }
      }
    });
  }

  // Return handle for external synchronization (e.g. Tab 1 to Gallery sync)
  return {
    setImages(newImages) {
      currentList = Array.isArray(newImages) ? [...newImages] : [];
      renderGrid();
    },
    getImages() {
      return [...currentList];
    }
  };
}
