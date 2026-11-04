Warning: truncated output (original token count: 79973)
Total output lines: 5786

import './admin.css';
import { ContentService } from '../data/ContentService.js';
import { ImageStorage } from '../data/ImageStorage.js';
import { CATALOG } from '../data/catalogData.js';
import { supabaseClient } from '../services/supabaseClient.js';
import { authService } from '../services/authService.js';
import { renderSeoPreviewCard, initSeoPreviewCard, updateSeoPreviewLive } from './components/SeoPreviewCard.js';
import { renderImageGalleryManager, bindGalleryEvents } from './components/ImageGalleryManager.js';
import { runProductQualityAudit, renderAuditModal, bindAuditModalEvents, runCatalogPrePublishAudit, renderCatalogPublishModal, bindCatalogPublishModalEvents } from './components/SeoAuditModal.js';
import { openMigrationModal } from './components/ImageMigrationModal.js';

// ─── State ─────────────────────────────────────────────────────────────────
let isAuthenticated = authService.isAuthenticated();
let currentTab = 'dashboard';
let currentSubTab = 'fields'; // for pages with subtabs (fields vs cards)

// Listen for remote persistence warnings and alert staff
if (typeof window !== 'undefined') {
  window.addEventListener('cms-save-warning', (e) => {
    if (e.detail?.error) {
      showToast(`Saved locally. Supabase sync warning: ${e.detail.error}`, 'warning');
    }
  });
}

// ─── Sidebar navigation config ──────────────────────────────────────────────
const NAV = [
  { section: 'OVERVIEW' },
  { id: 'dashboard',    icon: 'fa-solid fa-gauge',           label: 'Dashboard' },
  { section: 'PAGES' },
  { id: 'home',         icon: 'fa-solid fa-house',           label: 'Home Page' },
  { id: 'about',        icon: 'fa-solid fa-building',        label: 'About Us' },
  { id: 'services',     icon: 'fa-solid fa-gear',            label: 'Services' },
  { id: 'projects',     icon: 'fa-solid fa-diagram-project', label: 'Projects' },
  { id: 'gallery',      icon: 'fa-solid fa-images',          label: 'Gallery' },
  { id: 'testimonials', icon: 'fa-solid fa-comments',        label: 'Testimonials' },
  { id: 'contact',      icon: 'fa-solid fa-phone',           label: 'Contact' },
  { section: 'CONTENT' },
  { id: 'products',     icon: 'fa-solid fa-microchip',       label: 'Products / OEMs' },
  { id: 'partners',     icon: 'fa-solid fa-handshake',       label: 'Partners' },
  { id: 'blogs',        icon: 'fa-solid fa-newspaper',       label: 'Blogs' },
  { section: 'GLOBAL' },
  { id: 'header',       icon: 'fa-solid fa-bars',            label: 'Header & Nav' },
  { id: 'footer',       icon: 'fa-solid fa-shoe-prints',     label: 'Footer & Offices' },
  { id: 'seo',          icon: 'fa-solid fa-magnifying-glass',label: 'SEO Settings' },
];

// ─── Entry Points ────────────────────────────────────────────────────────────
export function renderAdminPage() {
  if (!isAuthenticated) return renderLogin();
  return renderShell();
}

export function initAdminPage() {
  if (!isAuthenticated) {
    bindLoginForm();
  } else {
    bindShell();
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────
function renderLogin() {
  const isLive = authService.isConfigured;
  const isDemo = authService.isDemoEnabled;
  return `
    <div class="a-login-page">
      <div class="a-login-box">
        <div class="a-login-logo">
          <img src="/icon-logo-transparent.png" alt="Icon Electromatic" onerror="this.style.display='none'">
        </div>
        <h2>Admin CMS</h2>
        <p>Icon Electromatic Content Portal</p>
        ${isLive || isDemo ? `<div style="margin-bottom: 16px; text-align: center;">
          ${isLive
            ? '<span class="mode-status-badge live"><span class="badge-dot"></span> Supabase GoTrue Auth</span>'
            : '<span class="mode-status-badge demo"><span class="badge-dot"></span> Local Demo Mode</span>'}
        </div>` : ''}
        ${!isLive && !isDemo ? `
          <p role="status" style="color: #b45309; text-align: center;">Staff sign-in is unavailable because this site has not been connected to Supabase.</p>
        ` : `<form class="a-login-form" id="a-login-form">
          <div class="a-field">
            <label>Staff Email</label>
            <input class="a-input" type="email" id="a-email" placeholder="staff@company.com" required>
          </div>
          <div class="a-field">
            <label>Password</label>
            <input class="a-input" type="password" id="a-password" placeholder="Enter password" required>
          </div>
          <div id="a-login-error" style="color: #ef4444; font-size: 0.8rem; margin-bottom: 8px; display: none;"></div>
          <button type="submit" class="a-btn a-btn-primary" id="btn-login-submit">Sign In <i class="fa-solid fa-arrow-right"></i></button>
        </form>`}
        ${isDemo && !isLive ? `
          <div style="margin-top: 12px; font-size: 0.78rem; color: #94a3b8; text-align: center; background: rgba(37,99,235,0.08); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(37,99,235,0.2);">
            Local demo authentication is enabled for development only. Do not use this mode for staff accounts.
          </div>
        ` : ''}
        <div style="margin-top: 16px; text-align: center;">
          <a href="/" class="a-btn a-btn-outline a-btn-sm" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
            <i class="fa-solid fa-arrow-left"></i> Return to Website
          </a>
        </div>
      </div>
    </div>
  `;
}

function bindLoginForm() {
  document.getElementById('a-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('a-email').value;
    const pass  = document.getElementById('a-password').value;
    const errorDiv = document.getElementById('a-login-error');
    const submitBtn = document.getElementById('btn-login-submit');

    if (errorDiv) errorDiv.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    }

    try {
      await authService.signIn(email, pass);
      const contentResult = await ContentService.refresh({ includeHidden: true });
      if (!contentResult.success) {
        await authService.signOut();
        throw new Error(contentResult.error || 'CMS content is unavailable for this staff account.');
      }
      isAuthenticated = true;
      rerender();
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Authentication failed.';
        errorDiv.style.display = 'block';
      } else {
        alert(err.message || 'Authentication failed.');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
      }
    }
  });
}

// ─── Shell ───────────────────────────────────────────────────────────────────
function renderShell() {
  const sidebarItems = NAV.map(item => {
    if (item.section) {
      return `<div class="a-nav-section">${item.section}</div>`;
    }
    return `
      <button class="a-nav-item ${currentTab === item.id ? 'active' : ''}" data-tab="${item.id}">
        <i class="${item.icon}"></i> ${item.label}
      </button>`;
  }).join('');

  const tab = NAV.find(n => n.id === currentTab);
  const pageTitle = tab ? tab.label : 'Dashboard';

  return `
    <div class="admin-wrap">
      <aside class="a-sidebar">
        <div class="a-sidebar-brand">
          <h1>ICON Admin</h1>
          <small>Universal CMS Portal</small>
        </div>
        <nav class="a-nav">${sidebarItems}</nav>
      </aside>

      <div class="a-main">
        <div class="a-topbar">
          <div class="a-topbar-left">
            <h2>${pageTitle}</h2>
            <p>Live CMS with IndexedDB Image Storage &amp; Card Management</p>
          </div>
          <div class="a-topbar-right">
            ${supabaseClient.isConfigured 
              ? '<span class="mode-status-badge live" title="Connected to live Supabase project"><span class="badge-dot"></span> Supabase Connected</span>' 
              : '<span class="mode-status-badge demo" title="Running in mock mode. Add VITE_SUPABASE_URL in .env.local to link cloud"><span class="badge-dot"></span> Local Preview Mode</span>'}
            <button type="button" class="a-btn a-btn-primary a-btn-sm" id="btn-publish-site" title="Trigger static site generation rebuild hook">
              <i class="fa-solid fa-cloud-arrow-up"></i> Publish Site
            </button>
            <a href="/" class="a-btn a-btn-outline a-btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-globe"></i> View Site
            </a>
            <button class="a-btn a-btn-outline a-btn-sm" id="a-reset-btn" title="Reset this section to authentic default data">
              <i class="fa-solid fa-rotate-left"></i> Reset Defaults
            </button>
            <button class="a-btn a-btn-danger a-btn-sm" id="a-logout-btn">
              Logout <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <div class="a-content">
          <div class="a-notice">
            <i class="fa-solid fa-circle-check"></i>
            <span><strong>CMS Active:</strong> All changes to text, cards, and uploaded images persist across refreshes via localStorage &amp; IndexedDB and immediately reflect on the public website.</span>
          </div>
          ${renderTabContent()}
        </div>
      </div>
    </div>

    <!-- Universal Modal Container -->
    <div id="a-modal-container"></div>
  `;
}

function bindShell() {
  // Navigation
  document.querySelectorAll('.a-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.getAttribute('data-tab');
      currentSubTab = 'fields';
      rerender();
    });
  });

  // Logout
  document.getElementById('a-logout-btn')?.addEventListener('click', async () => {
    await authService.signOut();
    isAuthenticated = false;
    await ContentService.refresh();
    rerender();
  });

  // Publish Site Rebuild Hook with Option B Quality Gate Audit
  document.getElementById('btn-publish-site')?.addEventListener('click', () => {
    const oems = ContentService.getData('products');
    const isWebhookConfigured = Boolean(supabaseClient.REBUILD_WEBHOOK_URL);
    const auditSummary = runCatalogPrePublishAudit(oems);

    const modalHtml = renderCatalogPublishModal(auditSummary, isWebhookConfigured);
    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container.firstElementChild);

    bindCatalogPublishModalEvents(async () => {
      const btn = document.getElementById('btn-publish-site');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';
      }
      try {
        const res = await supabaseClient.triggerPublishWebhook({
          publishedCount: auditSummary.eligibleProducts,
          draftCount: auditSummary.draftProducts
        });
        showToast(res.message, res.success ? 'success' : '');
      } catch (e) {
        showToast(`Publish error: ${e.message}`, '');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publish Site';
        }
      }
    });
  });

  // Reset section
  document.getElementById('a-reset-btn')?.addEventListener('click', () => {
    if (confirm(`Reset "${currentTab}" to default authentic content? All custom edits in this section will be replaced with defaults.`)) {
      ContentService.resetData(currentTab);
      rerender();
      showToast('Section reset to authentic defaults.', 'success');
    }
  });

  // Bind active tab specific events & image widgets
  bindTabEvents();
}

function rerender() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = renderAdminPage();
    initAdminPage();
  }
}

export function showToast(msg, type = '') {
  const existing = document.getElementById('a-toast');
  if (existing) existing.remove();

  const normalizedType = (type === 'danger' || type === 'error') ? 'error' : (type === 'info' ? 'info' : (type === 'success' ? 'success' : ''));
  const t = document.createElement('div');
  t.id = 'a-toast';
  t.className = normalizedType ? `a-toast ${normalizedType}` : 'a-toast';

  const icon = document.createElement('i');
  if (normalizedType === 'error') {
    icon.className = 'fa-solid fa-triangle-exclamation';
  } else if (normalizedType === 'info') {
    icon.className = 'fa-solid fa-circle-info';
  } else {
    icon.className = 'fa-solid fa-circle-check';
  }
  t.appendChild(icon);

  const span = document.createElement('span');
  span.className = 'a-toast-msg';
  span.textContent = String(msg ?? '');
  t.appendChild(span);

  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

// ─── Universal Image Upload Widget Helpers ─────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export function isUuid(val) {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

export function escapeAttr(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeSlug(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function resolveStorageSlug(entity, fallback = 'general') {
  const safeFallback = normalizeSlug(fallback) || 'general';
  if (!entity) return safeFallback;

  // Direct string input
  if (typeof entity === 'string') {
    if (isUuid(entity)) return safeFallback;
    return normalizeSlug(entity) || safeFallback;
  }

  // 1. Check entity.slug: reject UUID, normalize valid string
  if (typeof entity.slug === 'string' && !isUuid(entity.slug)) {
    const normalized = normalizeSlug(entity.slug);
    if (normalized) return normalized;
  }

  // 2. Check entity.id: reject UUID, normalize valid string
  if (typeof entity.id === 'string' && !isUuid(entity.id)) {
    const normalized = normalizeSlug(entity.id);
    if (normalized) return normalized;
  }

  // 3. Fallback to entity.name or entity.title: normalize valid string
  const nameCandidate = entity.name || entity.title;
  if (typeof nameCandidate === 'string') {
    const normalized = normalizeSlug(nameCandidate);
    if (normalized) return normalized;
  }

  return safeFallback;
}

// ─── Universal Image Upload Widget ───────────────────────────────────────────
export function renderImageUploadField(fieldName, label, currentValue, ctxText = '', options = {}) {
  const safeField = String(fieldName || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeVal = currentValue ? String(currentValue) : '';
  const resolved = ImageStorage.resolveImageUrl(safeVal);
  const hasImg = Boolean(safeVal);

  const folder = options.folder ? String(options.folder) : '';
  const oemSlug = options.oemSlug ? String(options.oemSlug) : '';
  const productSlug = options.productSlug ? String(options.productSlug) : '';

  return `
    <div class="a-field span2 a-image-widget" data-field="${escapeAttr(safeField)}" data-folder="${escapeAttr(folder)}" data-oem-slug="${escapeAttr(oemSlug)}" data-product-slug="${escapeAttr(productSlug)}">
      <label class="a-label">${escapeHtml(label)} <span class="a-label-ctx">${escapeHtml(ctxText)}</span></label>
      <div class="a-img-uploader">
        <div class="a-img-thumb-box" id="thumb-box-${escapeAttr(safeField)}">
          ${hasImg
            ? `<img src="${escapeAttr(resolved)}" class="a-thumb-img" id="thumb-img-${escapeAttr(safeField)}" alt="Preview" />`
            : `<div class="a-thumb-empty" id="thumb-empty-${escapeAttr(safeField)}"><i class="fa-solid fa-image"></i><span>No image</span></div>`}
        </div>
        <div class="a-img-actions">
          <input type="hidden" name="${escapeAttr(safeField)}" id="hidden-${escapeAttr(safeField)}" value="${escapeAttr(safeVal)}" />
          <div class="a-img-btn-row">
            <label class="a-btn a-btn-sm a-btn-primary a-upload-btn">
              <i class="fa-solid fa-cloud-arrow-up"></i> <span id="upload-txt-${escapeAttr(safeField)}">${hasImg ? 'Replace Image' : 'Upload Image'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="a-file-input" data-target="${escapeAttr(safeField)}" style="display:none;" />
            </label>
            <button type="button" class="a-btn a-btn-sm a-btn-danger a-img-delete-btn" data-target="${escapeAttr(safeField)}" id="del-btn-${escapeAttr(safeField)}" style="${hasImg ? '' : 'display:none;'}">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
          <div class="a-img-url-row">
            <input type="text" class="a-input a-input-sm a-img-url-input" data-target="${escapeAttr(safeField)}" placeholder="Or paste asset path (/images/...) or URL" value="${escapeAttr(safeVal)}" />
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindImageWidgets(container = document) {
  // File upload input change
  container.querySelectorAll('.a-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fieldName = input.getAttribute('data-target');
      const widget = input.closest('.a-image-widget');
      if (!widget || widget.classList.contains('is-uploading') || input.disabled) return;

      const hiddenInput = container.querySelector(`#hidden-${fieldName}`) || container.querySelector(`input[name="${fieldName}"]`);
      const urlInput = container.querySelector(`.a-img-url-input[data-target="${fieldName}"]`);
      const thumbBox = container.querySelector(`#thumb-box-${fieldName}`) || container.querySelector(`.a-image-widget[data-field="${fieldName}"] .a-img-thumb-box`);
      const delBtn = container.querySelector(`#del-btn-${fieldName}`) || container.querySelector(`.a-img-delete-btn[data-target="${fieldName}"]`);
      const uploadTxt = container.querySelector(`#upload-txt-${fieldName}`);

      // Snapshot previous state before taking any action
      const prevVal = hiddenInput ? hiddenInput.value : '';
      const prevUrl = urlInput ? urlInput.value : '';
      const prevThumbHtml = thumbBox ? thumbBox.innerHTML : '';
      const prevUploadTxt = uploadTxt ? uploadTxt.textContent : 'Upload Image';
      const prevDelDisplay = delBtn ? delBtn.style.display : 'none';

      // Enter in-flight uploading state
      widget.classList.add('is-uploading');
      input.disabled = true;
      if (uploadTxt) uploadTxt.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
      showToast('Uploading image...', '');

      try {
        const folder = widget.getAttribute('data-folder') || (fieldName.toLowerCase().includes('logo') ? 'logos' : 'general');
        const oemSlug = widget.getAttribute('data-oem-slug') || '';
        const productSlug = widget.getAttribute('data-product-slug') || '';

        const result = await supabaseClient.uploadImage(file, { folder, oemSlug, productSlug });

        // In dev fallback mode: result.path is idb:img_... reference key; result.url is blob URL
        // In configured mode: result.url is public CDN URL; result.path is relative storage path
        const valueToStore = result.isLocalFallback ? result.path : (result.url || result.publicUrl);
        const previewUrl = result.url || result.publicUrl;

        // Update hidden input & text input
        if (hiddenInput) hiddenInput.value = valueToStore;
        if (urlInput) urlInput.value = valueToStore;

        // Update thumbnail preview
        if (thumbBox) {
          thumbBox.innerHTML = `<img src="${escapeAttr(previewUrl)}" class="a-thumb-img" alt="Preview" />`;
        }

        // Show delete button and update button label
        if (delBtn) delBtn.style.display = 'inline-flex';
        if (uploadTxt) uploadTxt.textContent = 'Replace Image';

        // Unlock widget and clear file input
        widget.classList.remove('is-uploading');
        input.disabled = false;
        input.value = '';

        const successMsg = result.isLocalFallback
          ? 'Image saved locally (Dev Mode)'
          : 'Image uploaded to Supabase Storage!';
        showToast(successMsg, 'success');
      } catch (err) {
        console.error('Image upload failed:', err);

        // Revert UI to snapshot
        if (hiddenInput) hiddenInput.value = prevVal;
        if (urlInput) urlInput.value = prevUrl;
        if (thumbBox) thumbBox.innerHTML = prevThumbHtml;
        if (uploadTxt) uploadTxt.textContent = prevUploadTxt;
        if (delBtn) delBtn.style.display = prevDelDisplay;

        // Unlock widget and re-enable input
        widget.classList.remove('is-uploading');
        input.disabled = false;
        input.value = '';

        showToast(`Upload failed: ${err.message}`, 'error');
        alert(`Image Upload Failed:\n${err.message}`);
      }
    });
  });

  // URL input change
  container.querySelectorAll('.a-img-url-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const fieldName = input.getAttribute('data-target');
      const val = input.value.trim();

      const hiddenInput = container.querySelector(`#hidden-${fieldName}`) || container.querySelector(`input[name="${fieldName}"]`);
      if (hiddenInput) hiddenInput.value = val;

      const thumbBox = container.querySelector(`#thumb-box-${fieldName}`) || container.querySelector(`.a-image-widget[data-field="${fieldName}"] .a-img-thumb-box`);
      const delBtn = container.querySelector(`#del-btn-${fieldName}`) || container.querySelector(`.a-img-delete-btn[data-target="${fieldName}"]`);
      const uploadTxt = container.querySelector(`#upload-txt-${fieldName}`);

      if (val) {
        const resolved = ImageStorage.resolveImageUrl(val);
        if (thumbBox) thumbBox.innerHTML = `<img src="${escapeAttr(resolved)}" class="a-thumb-img" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'a-thumb-empty\\'><i class=\\'fa-solid fa-triangle-exclamation\\'></i><span>Invalid</span></div>'" />`;
        if (delBtn) delBtn.style.display = 'inline-flex';
        if (uploadTxt) uploadTxt.textContent = 'Replace Image';
      } else {
        if (thumbBox) thumbBox.innerHTML = `<div class="a-thumb-empty"><i class="fa-solid fa-image"></i><span>No image</span></div>`;
        if (delBtn) delBtn.style.display = 'none';
        if (uploadTxt) uploadTxt.textContent = 'Upload Image';
      }
    });
  });

  // Delete image button (unlinks form reference only; never deletes remote or local assets)
  container.querySelectorAll('.a-img-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fieldName = btn.getAttribute('data-target');
      const hiddenInput = container.querySelector(`#hidden-${fieldName}`) || container.querySelector(`input[name="${fieldName}"]`);
      if (hiddenInput) hiddenInput.value = '';

      const urlInput = container.querySelector(`.a-img-url-input[data-target="${fieldName}"]`);
      if (urlInput) urlInput.value = '';

      const thumbBox = container.querySelector(`#thumb-box-${fieldName}`) || container.querySelector(`.a-image-widget[data-field="${fieldName}"] .a-img-thumb-box`);
      if (thumbBox) {
        thumbBox.innerHTML = `<div class="a-thumb-empty"><i class="fa-solid fa-image"></i><span>No image</span></div>`;
      }

      btn.style.display = 'none';
      const uploadTxt = container.querySelector(`#upload-txt-${fieldName}`);
      if (uploadTxt) uploadTxt.textContent = 'Upload Image';

      showToast('Image reference removed from form.', '');
    });
  });
}


// ─── Modal Dialog Helper ─────────────────────────────────────────────────────
function openModal(title, formHtml, onSave, onInit) {
  const container = document.getElementById('a-modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="a-modal-backdrop" id="a-modal-backdrop">
      <div class="a-modal">
        <div class="a-modal-header">
          <h3>${title}</h3>
          <button type="button" class="a-modal-close" id="a-modal-close-btn">&times;</button>
        </div>
        <form id="a-modal-form">
          <div class="a-modal-body">
            ${formHtml}
          </div>
          <div class="a-modal-footer">
            <button type="button" class="a-btn a-btn-outline" id="a-modal-cancel-btn">Cancel</button>
            <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Card</button>
          </div>
        </form>
      </div>
    </div>
  `;

  bindImageWidgets(container);
  if (onInit) onInit(container);

  const closeModal = () => { container.innerHTML = ''; };

  document.getElementById('a-modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('a-modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('a-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'a-modal-backdrop') closeModal();
  });

  const formEl = document.getElementById('a-modal-form');
  const submitBtn = formEl?.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById('a-modal-cancel-btn');
  const closeBtn = document.getElementById('a-modal-close-btn');

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn?.disabled) return;

    const originalSubmitHtml = submitBtn?.innerHTML || '<i class="fa-solid fa-floppy-disk"></i> Save Card';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }
    if (cancelBtn) cancelBtn.disabled = true;
    if (closeBtn) closeBtn.disabled = true;

    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });

    try {
      const result = await onSave(data);

      if (result && result.success === false) {
        // Save failed: preserve user inputs in the form, re-enable buttons, show error
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalSubmitHtml;
        }
        if (cancelBtn) cancelBtn.disabled = false;
        if (closeBtn) closeBtn.disabled = false;
        showToast(result.error || 'Database save failed. Your changes remain in the form.', 'error');
        return;
      }

      // Confirmed success: close modal, rerender, show appropriate toast
      closeModal();
      rerender();
      if (result && typeof result === 'object' && result.message) {
        showToast(result.message, result.localOnly ? 'info' : 'success');
      } else if (!result || result.silentToast !== true) {
        showToast('Saved successfully!', 'success');
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalSubmitHtml;
      }
      if (cancelBtn) cancelBtn.disabled = false;
      if (closeBtn) closeBtn.disabled = false;
      showToast(`Error: ${err.message}. Changes remain in form.`, 'error');
    }
  });
}

// ─── Card Reordering & Action Handlers ───────────────────────────────────────
function reorderArray(arr, fromIdx, toIdx) {
  if (toIdx < 0 || toIdx >= arr.length) return arr;
  const clone = [...arr];
  const [item] = clone.splice(fromIdx, 1);
  clone.splice(toIdx, 0, item);
  return clone;
}

// ─── Tab Content Router ──────────────────────────────────────────────────────
function renderTabContent() {
  switch (currentTab) {
    case 'dashboard':    return renderDashboard();
    case 'home':         return renderHomePageEditor();
    case 'about':        return renderAboutPageEditor();
    case 'services':     return renderServicesPageEditor();
    case 'projects':     return renderProjectsPageEditor();
    case 'gallery':      return renderGalleryPageEditor();
    case 'testimonials': return renderTestimonialsPageEditor();
    case 'contact':      return renderContactPageEditor();
    case 'header':       return renderHeaderPageEditor();
    case 'footer':       return renderFooterPageEditor();
    case 'seo':          return renderSeoPageEditor();
    case 'products':     return renderProductsTab();
    case 'partners':     return renderPartnersTab();
    case 'blogs':        return renderBlogsTab();
    default:             return `<p>Section not yet implemented.</p>`;
  }
}

function bindTabEvents() {
  // Bind image widgets in content
  bindImageWidgets(document.querySelector('.a-content'));

  // Generic page form submission
  const genericForm = document.getElementById('a-page-form');
  if (genericForm) {
    genericForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(genericForm);
      const existing = ContentService.getData(currentTab) || {};
      const updated = { ...existing };
      fd.forEach((v, k) => { updated[k] = v; });
      ContentService.saveData(currentTab, updated);
      showToast('Page sections saved successfully!', 'success');
      rerender();
    });
  }

  // Bind specific tabs
  switch (currentTab) {
    case 'dashboard':    bindDashboardEvents(); break;
    case 'home':         bindHomeTabEvents(); break;
    case 'about':        bindAboutTabEvents(); break;
    case 'services':     bindServicesTabEvents(); break;
    case 'projects':     bindProjectsTabEvents(); break;
    case 'gallery':      bindGalleryTabEvents(); break;
    case 'testimonials': bindTestimonialsTabEvents(); break;
    case 'contact':      bindContactTabEvents(); break;
    case 'products':     bindProductsTabEvents(); break;
    case 'partners':     bindPartnersTabEvents(); break;
    case 'blogs':        bindBlogsTabEvents(); break;
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function renderDashboard() {
  const products = ContentService.getData('products') || [];
  const partners = ContentService.getData('partners') || [];
  const blogs = ContentService.getData('blogs') || [];
  const projects = ContentService.getData('projects')?.items || [];
  const gallery = ContentService.getData('gallery')?.items || [];
  const testimonials = ContentService.getData('testimonials')?.items || [];

  return `
    <div class="a-stats-row">
      <div class="a-stat-card">
        <h3>${products.length}</h3>
        <p>Products / OEMs</p>
      </div>
      <div class="a-stat-card red">
        <h3>${partners.length}</h3>
        <p>Technology Partners</p>
      </div>
      <div class="a-stat-card">
        <h3>${projects.length}</h3>
        <p>Featured Projects</p>
      </div>
      <div class="a-stat-card red">
        <h3>${testimonials.length}</h3>
        <p>Testimonials</p>
      </div>
      <div class="a-stat-card">
        <h3>${gallery.length}</h3>
        <p>Gallery Photos</p>
      </div>
      <div class="a-stat-card red">
        <h3>${blogs.length}</h3>
        <p>Blog Entries</p>
      </div>
    </div>

    <div class="a-card">
      <div class="a-card-header">
        <div>
          <h3>Full Website Content &amp; Card Architecture</h3>
          <p>Every image, card, and section across the entire website is editable, reorderable, and saved locally</p>
        </div>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Section</th><th>Image Upload</th><th>Card CRUD &amp; Reorder</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td><strong>Home Page</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Background video/img</td><td>Hero Stats &amp; Core Capabilities cards</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>About Us</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Infographic &amp; Card photos</td><td>Badges, Stats, Milestones, Domains, Pillars, Why Us</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Services</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Multi-image sliders</td><td>4 Service Pillars with photo carousels &amp; tags</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Projects</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Project covers</td><td>Defense &amp; Space engineering project cards</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Gallery</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Hardware photos</td><td>Component &amp; hardware gallery cards</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Testimonials</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Client avatars</td><td>Scientist &amp; Engineer testimonial cards</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Products / OEMs</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> OEM Logos</td><td>All 13 global manufacturers with logo upload</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Partners</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Partner Logos</td><td>All 13 partners in running ticker &amp; static grid</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Blogs</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Article covers</td><td>Technical news, notes, and bulletins</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
            <tr><td><strong>Contact &amp; Offices</strong></td><td><i class="fa-solid fa-minus" style="color:#94a3b8;"></i> Text based</td><td>Offices (India, Singapore, USA) &amp; Requirement presets</td><td><span class="a-badge a-badge-green">Connected</span></td></tr>
            <tr><td><strong>Header &amp; Nav</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Brand Logo</td><td>Navigation labels, CTA button text &amp; destination</td><td><span class="a-badge a-badge-green">Connected</span></td></tr>
            <tr><td><strong>Footer</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> Footer Logo</td><td>Tagline, 3 offices, socials, copyright bar</td><td><span class="a-badge a-badge-green">Connected</span></td></tr>
            <tr><td><strong>SEO Settings</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> OpenGraph image</td><td>Meta titles, descriptions, keywords, social tags</td><td><span class="a-badge a-badge-green">Connected</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="a-card" style="margin-top: 20px; border-left: 4px solid var(--a-blue);">
      <div class="a-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3><i class="fa-solid fa-cloud-arrow-up" style="color: var(--a-red);"></i> Image Storage &amp; Cloud Migration</h3>
          <p>Scan and migrate browser-local IndexedDB images to shared Supabase Cloud Storage (<code>catalog-images</code>)</p>
        </div>
        <button type="button" class="a-btn a-btn-primary" id="btn-open-image-migration">
          <i class="fa-solid fa-database"></i> Launch Migration Tool
        </button>
      </div>
    </div>
  `;
}

function bindDashboardEvents() {
  document.getElementById('btn-open-image-migration')?.addEventListener('click', () => {
    openMigrationModal();
  });
}

// ─── HOME PAGE EDITOR ────────────────────────────────────────────────────────
function renderHomePageEditor() {
  const d = ContentService.getData('home') || {};
  const stats = d.stats || [];
  const caps = d.capabilities || [];

  return `
    <div class="a-subtabs-nav">
      <button type="button" class="a-subtab-btn ${currentSubTab === 'fields' ? 'active' : ''}" data-subtab="fields"><i class="fa-solid fa-pen-to-square"></i> Hero &amp; Section Texts</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'stats' ? 'active' : ''}" data-subtab="stats"><i class="fa-solid fa-chart-simple"></i> Hero Stats Bar (${stats.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'capabilities' ? 'active' : ''}" data-subtab="capabilities"><i class="fa-solid fa-boxes-stacked"></i> Core Capabilities Cards (${caps.length})</button>
    </div>

    ${currentSubTab === 'fields' ? `
      <form id="a-page-form">
        <div class="a-card">
          <div class="a-card-header"><div><h3>Hero Banner Section</h3><p>Main high-impact visual &amp; headline</p></div></div>
          <div class="a-form-grid">
            <div class="a-field span2"><label class="a-label">Main Heading <span class="a-label-ctx">HTML supported for color accent</span></label>
              <textarea class="a-textarea" name="heroTitle">${d.heroTitle || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Sub-description</label>
              <textarea class="a-textarea" name="heroSubtitle">${d.heroSubtitle || ''}</textarea></div>
            <div class="a-field"><label class="a-label">Hero Video URL / Path</label>
              <input class="a-input" type="text" name="heroBgVideo" value="${d.heroBgVideo || '/icon-video.mp4'}"></div>
            ${renderImageUploadField('heroBgImage', 'Hero Poster / Background Image', d.heroBgImage || '', 'Fallback or video poster')}
            <div class="a-field"><label class="a-label">Primary CTA Label</label>
              <input class="a-input" type="text" name="ctaExploreText" value="${d.ctaExploreText || 'Explore Products'}"></div>
            <div class="a-field"><label class="a-label">Primary CTA Link</label>
              <input class="a-input" type="text" name="ctaExploreLink" value="${d.ctaExploreLink || '/products'}"></div>
            <div class="a-field"><label class="a-label">Secondary CTA Label</label>
              <input class="a-input" type="text" name="ctaQuoteText" value="${d.ctaQuoteText || 'Request a Quote'}"></div>
            <div class="a-field"><label class="a-label">Secondary CTA Link</label>
              <input class="a-input" type="text" name="ctaQuoteLink" value="${d.ctaQuoteLink || '/contact'}"></div>
          </div>
        </div>

        <div class="a-card">
          <div class="a-card-header"><div><h3>Section Headers on Home Page</h3><p>Customize section titles &amp; subtitles displayed on the homepage</p></div></div>
          <div class="a-form-grid">
            <div class="a-section-divider span2">Core Capabilities Section</div>
            <div class="a-field"><label class="a-label">Section Tag</label><input class="a-input" name="coreCapabilitiesTitle" value="${d.coreCapabilitiesTitle || 'Core Capabilities'}"></div>
            <div class="a-field"><label class="a-label">Section Subtitle</label><input class="a-input" name="coreCapabilitiesSubtitle" value="${d.coreCapabilitiesSubtitle || 'Engineered for extreme performance.'}"></div>
            <div class="a-field span2"><label class="a-label">Section Lead</label><textarea class="a-textarea" name="coreCapabilitiesLead">${d.coreCapabilitiesLead || ''}</textarea></div>

            <div class="a-section-divider span2">Popular Products Section</div>
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="popularTitle" value="${d.popularTitle || 'Popular Products & Components'}"></div>
            <div class="a-field span2"><label class="a-label">Lead</label><textarea class="a-textarea" name="popularLead">${d.popularLead || ''}</textarea></div>

            <div class="a-section-divider span2">Featured Projects Section</div>
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="projectsTitle" value="${d.projectsTitle || 'Featured Projects'}"></div>
            <div class="a-field"><label class="a-label">Subtitle</label><input class="a-input" name="projectsSubtitle" value="${d.projectsSubtitle || 'Mission-Ready Hardware Deployments'}"></div>
            <div class="a-field span2"><label class="a-label">Lead</label><textarea class="a-textarea" name="projectsLead">${d.projectsLead || ''}</textarea></div>

            <div class="a-section-divider span2">Hardware Gallery Section</div>
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="galleryTitle" value="${d.galleryTitle || 'Hardware Gallery'}"></div>
            <div class="a-field"><label class="a-label">Subtitle</label><input class="a-input" name="gallerySubtitle" value="${d.gallerySubtitle || 'High-Rel Components in Action'}"></div>
            <div class="a-field span2"><label class="a-label">Lead</label><textarea class="a-textarea" name="galleryLead">${d.galleryLead || ''}</textarea></div>

            <div class="a-section-divider span2">Testimonials Section</div>
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="testimonialsTitle" value="${d.testimonialsTitle || 'Trusted by Industry Leaders'}"></div>
            <div class="a-field"><label class="a-label">Subtitle</label><input class="a-input" name="testimonialsSubtitle" value="${d.testimonialsSubtitle || 'What Defense, Space & Aerospace Engineers Say'}"></div>
            <div class="a-field span2"><label class="a-label">Lead</label><textarea class="a-textarea" name="testimonialsLead">${d.testimonialsLead || ''}</textarea></div>

            <div class="a-section-divider span2">Latest Insights / Blogs Section</div>
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="insightsTitle" value="${d.insightsTitle || 'Insights'}"></div>
            <div class="a-field"><label class="a-label">Subtitle</label><input class="a-input" name="insightsSubtitle" value="${d.insightsSubtitle || 'Latest Blogs'}"></div>
            <div class="a-field span2"><label class="a-label">Lead</label><textarea class="a-textarea" name="insightsLead">${d.insightsLead || ''}</textarea></div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Home Page Content</button>
        </div>
      </form>
    ` : ''}

    ${currentSubTab === 'stats' ? `
      <div class="a-cards-box">
        <div class="a-cards-box-header">
          <div>
            <h3>Hero Stats Bar Figures</h3>
            <p>Reorder, edit, or add figures shown in the hero stats banner</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-stat-btn"><i class="fa-solid fa-plus"></i> Add Stat Figure</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Stat Value</th><th>Label</th><th>Actions</th></tr></thead>
            <tbody>
              ${stats.map((st, idx) => `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-stat" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-stat" data-dir="down" data-idx="${idx}" ${idx === stats.length - 1 ? 'disabled' : ''} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td><strong style="color:var(--a-red); font-size:1.1rem;">${st.value}</strong></td>
                  <td>${st.label}</td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-stat" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-stat" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    ${currentSubTab === 'capabilities' ? `
      <div class="a-cards-box">
        <div class="a-cards-box-header">
          <div>
            <h3>Core Capabilities Cards</h3>
            <p>Add, edit, delete, and reorder the capability cards shown on the homepage</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-cap-btn"><i class="fa-solid fa-plus"></i> Add Capability Card</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Icon</th><th>Title</th><th>Description</th><th>Action Link</th><th>Actions</th></tr></thead>
            <tbody>
              ${caps.map((cap, idx) => `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-cap" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-cap" data-dir="down" data-idx="${idx}" ${idx === caps.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td style="font-size:1.2rem; color:var(--a-blue);"><i class="${cap.icon || 'fa-solid fa-microchip'}"></i></td>
                  <td><strong>${cap.title}</strong></td>
                  <td style="font-size:0.82rem; color:var(--a-muted); max-width:320px;">${cap.desc}</td>
                  <td style="font-size:0.8rem;"><code>${cap.linkUrl || '/products'}</code></td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-cap" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-cap" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `;
}

function bindHomeTabEvents() {
  // Subtabs switcher
  document.querySelectorAll('.a-subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubTab = btn.getAttribute('data-subtab');
      rerender();
    });
  });

  const d = ContentService.getData('home') || {};

  // Stats Card management
  document.getElementById('a-add-stat-btn')?.addEventListener('click', () => {
    openModal('Add Hero Stat Figure', `
      <div class="a-field"><label class="a-label">Stat Value (e.g. 4,000+)</label><input class="a-input" name="value" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Label (e.g. PRODUCTS AVAILABLE)</label><input class="a-input" name="label" required /></div>
    `, (data) => {
      const stats = d.stats || [];
      stats.push({ id: 'stat-' + Date.now(), value: data.value, label: data.label });
      d.stats = stats;
      ContentService.saveData('home', d);
    });
  });

  document.querySelectorAll('.btn-edit-stat').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const st = d.stats[idx];
      openModal('Edit Hero Stat Figure', `
        <div class="a-field"><label class="a-label">Stat Value</label><input class="a-input" name="value" value="${st.value}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Label</label><input class="a-input" name="label" value="${st.label}" required /></div>
      `, (data) => {
        d.stats[idx] = { ...st, value: data.value, label: data.label };
        ContentService.saveData('home', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-stat').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this stat figure?')) {
        d.stats.splice(idx, 1);
        ContentService.saveData('home', d);
        rerender();
        showToast('Stat removed.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-stat').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.stats = reorderArray(d.stats, idx, targetIdx);
      ContentService.saveData('home', d);
      rerender();
      showToast('Stat order updated!', 'success');
    });
  });

  // Capabilities Card management
  document.getElementById('a-add-cap-btn')?.addEventListener('click', () => {
    openModal('Add Capability Card', `
      <div class="a-field"><label class="a-label">Card Title</label><input class="a-input" name="title" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">FontAwesome Icon (e.g. fa-solid fa-wave-square)</label><input class="a-input" name="icon" value="fa-solid fa-wave-square" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Link Label (e.g. Explore Amplifiers →)</label><input class="a-input" name="linkText" value="Explore →" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Link URL (e.g. /products?category=amplifiers)</label><input class="a-input" name="linkUrl" value="/products" /></div>
    `, (data) => {
      const caps = d.capabilities || [];
      caps.push({ id: 'cap-' + Date.now(), ...data });
      d.capabilities = caps;
      ContentService.saveData('home', d);
    });
  });

  document.querySelectorAll('.btn-edit-cap').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const cap = d.capabilities[idx];
      openModal('Edit Capability Card', `
        <div class="a-field"><label class="a-label">Card Title</label><input class="a-input" name="title" value="${cap.title}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">FontAwesome Icon</label><input class="a-input" name="icon" value="${cap.icon || 'fa-solid fa-microchip'}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${cap.desc || ''}</textarea></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Link Label</label><input class="a-input" name="linkText" value="${cap.linkText || 'Explore →'}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Link URL</label><input class="a-input" name="linkUrl" value="${cap.linkUrl || '/products'}" /></div>
      `, (data) => {
        d.capabilities[idx] = { ...cap, ...data };
        ContentService.saveData('home', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-cap').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this capability card?')) {
        d.capabilities.splice(idx, 1);
        ContentService.saveData('home', d);
        rerender();
        showToast('Capability card deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-cap').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.capabilities = reorderArray(d.capabilities, idx, targetIdx);
      ContentService.saveData('home', d);
      rerender();
      showToast('Capability cards reordered!', 'success');
    });
  });
}

// ─── ABOUT US PAGE EDITOR ────────────────────────────────────────────────────
function renderAboutPageEditor() {
  const d = ContentService.getData('about') || {};
  const badges = d.badges || [];
  const highlights = d.highlightCards || [];
  const stats = d.stats || [];
  const milestones = d.milestones || [];
  const domains = d.domains || [];
  const pillars = d.pillars || [];
  const whyUs = d.whyUs || [];

  return `
    <div class="a-subtabs-nav">
      <button type="button" class="a-subtab-btn ${currentSubTab === 'fields' ? 'active' : ''}" data-subtab="fields"><i class="fa-solid fa-pen-to-square"></i> General &amp; Vision</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'badges' ? 'active' : ''}" data-subtab="badges"><i class="fa-solid fa-award"></i> Badges (${badges.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'highlights' ? 'active' : ''}" data-subtab="highlights"><i class="fa-solid fa-star"></i> Highlights (${highlights.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'stats' ? 'active' : ''}" data-subtab="stats"><i class="fa-solid fa-chart-line"></i> Quick Facts (${stats.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'milestones' ? 'active' : ''}" data-subtab="milestones"><i class="fa-solid fa-timeline"></i> Timeline (${milestones.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'domains' ? 'active' : ''}" data-subtab="domains"><i class="fa-solid fa-satellite-dish"></i> Domains (${domains.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'pillars' ? 'active' : ''}" data-subtab="pillars"><i class="fa-solid fa-monument"></i> Pillars (${pillars.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'whyus' ? 'active' : ''}" data-subtab="whyus"><i class="fa-solid fa-circle-question"></i> Why Us (${whyUs.length})</button>
    </div>

    ${currentSubTab === 'fields' ? `
      <form id="a-page-form">
        <div class="a-card">
          <div class="a-card-header"><div><h3>About Us Hero Banner</h3><p>Page heading and introduction</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Eyebrow</label><input class="a-input" name="heroEyebrow" value="${d.heroEyebrow || 'ABOUT ICON ELECTROMATIC'}"></div>
            <div class="a-field"><label class="a-label">Page Title</label><input class="a-input" name="heroTitle" value="${d.heroTitle || 'About Us'}"></div>
            <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="heroLead">${d.heroLead || ''}</textarea></div>
          </div>
        </div>

        <div class="a-card">
          <div class="a-card-header"><div><h3>Company Background &amp; Downloads</h3><p>Narrative paragraphs and brochure downloads</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Section Title</label><input class="a-input" name="coreCapabilitiesTitle" value="${d.coreCapabilitiesTitle || 'Core Capabilities'}"></div>
            <div class="a-field"><label class="a-label">Section Subtitle</label><input class="a-input" name="coreCapabilitiesSubtitle" value="${d.coreCapabilitiesSubtitle || 'Fulfillment partners for your electronic ambitions'}"></div>
            <div class="a-field span2"><label class="a-label">Description Paragraph 1</label><textarea class="a-textarea" name="companyDesc1">${d.companyDesc1 || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Description Paragraph 2</label><textarea class="a-textarea" name="companyDesc2">${d.companyDesc2 || ''}</textarea></div>
            <div class="a-field"><label class="a-label">Corporate Presentation Link</label><input class="a-input" name="presentationLink" value="${d.presentationLink || ''}"></div>
            <div class="a-field"><label class="a-label">Company Flyer Link</label><input class="a-input" name="flyerLink" value="${d.flyerLink || ''}"></div>
 …49973 tokens truncated…a-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      oemHubPanelHtml = `
        <div class="a-oem-panel">
          <!-- Hub Profile Strip -->
          <div class="a-blog-hub-profile">
            <div class="a-blog-hub-info">
              <div><strong style="color:#0f172a;font-size:0.92rem;"><i class="fa-solid fa-building-columns" style="color:var(--a-blue);margin-right:6px;"></i> ${b.portalName || `${oem.name} Technology Hub`}</strong></div>
              <div><span style="color:#64748b;">Headline:</span> ${b.headline || oem.description}</div>
              <div><span style="color:#64748b;">Official Portal:</span> ${b.officialWebsite ? `<a href="${b.officialWebsite}" target="_blank" rel="noopener" style="color:var(--a-blue);">${b.officialWebsite}</a>` : '<span style="color:#94a3b8;">None configured</span>'}</div>
            </div>
            <button type="button" class="a-btn a-btn-outline a-btn-sm btn-edit-oem-hub" data-oem-id="${oem.id}">
              <i class="fa-solid fa-pen"></i> Edit Hub Profile
            </button>
          </div>

          <!-- 1. Articles Section -->
          <div class="a-blog-section-box">
            <div class="a-blog-section-header">
              <div>
                <div class="a-blog-section-title">
                  <i class="fa-solid fa-newspaper" style="color:var(--a-blue);"></i> Technical Articles &amp; News Releases (${articles.length})
                </div>
                <div class="a-blog-section-subtitle">Manage article headlines, publication dates, categories, excerpts, and full technical dispatch</div>
              </div>
              <button type="button" class="a-btn a-btn-primary a-btn-sm btn-add-oem-art" data-oem-id="${oem.id}">
                <i class="fa-solid fa-plus"></i> Add Article to ${oem.shortName}
              </button>
            </div>
            <div class="a-table-wrap">
              <table class="a-sub-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Cover</th>
                    <th>Headline &amp; Date</th>
                    <th>Category</th>
                    <th>Excerpt &amp; Tags</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${articleRows || `<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--a-muted);">No technical articles added yet. Click "+ Add Article to ${oem.shortName}" above.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Videos Section -->
          <div class="a-blog-section-box">
            <div class="a-blog-section-header">
              <div>
                <div class="a-blog-section-title">
                  <i class="fa-solid fa-circle-play" style="color:#f59e0b;"></i> Demonstration Videos &amp; Webinars (${videos.length})
                </div>
                <div class="a-blog-section-subtitle">Manage lab sessions, speaker details, duration, video streaming URLs, and topics</div>
              </div>
              <button type="button" class="a-btn a-btn-primary a-btn-sm btn-add-oem-vid" data-oem-id="${oem.id}">
                <i class="fa-solid fa-plus"></i> Add Video to ${oem.shortName}
              </button>
            </div>
            <div class="a-table-wrap">
              <table class="a-sub-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Thumb</th>
                    <th>Video Title &amp; Speaker</th>
                    <th>Description &amp; Topics</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${videoRows || `<tr><td colspan="6" style="text-align:center;padding:18px;color:var(--a-muted);">No demonstration videos added yet. Click "+ Add Video to ${oem.shortName}" above.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. Whitepapers Section -->
          <div class="a-blog-section-box">
            <div class="a-blog-section-header">
              <div>
                <div class="a-blog-section-title">
                  <i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> Engineering Whitepapers &amp; Notes (${whitepapers.length})
                </div>
                <div class="a-blog-section-subtitle">Manage research whitepapers, frequency bands, page count, PDF downloads, and key findings</div>
              </div>
              <button type="button" class="a-btn a-btn-primary a-btn-sm btn-add-oem-wp" data-oem-id="${oem.id}">
                <i class="fa-solid fa-plus"></i> Add Whitepaper to ${oem.shortName}
              </button>
            </div>
            <div class="a-table-wrap">
              <table class="a-sub-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Whitepaper Title &amp; Author</th>
                    <th>Format &amp; Band</th>
                    <th>Summary &amp; Key Findings</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${whitepaperRows || `<tr><td colspan="6" style="text-align:center;padding:18px;color:var(--a-muted);">No whitepapers added yet. Click "+ Add Whitepaper to ${oem.shortName}" above.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. Official Resources & Links -->
          <div class="a-blog-section-box" style="margin-bottom:0;">
            <div class="a-blog-section-header">
              <div>
                <div class="a-blog-section-title">
                  <i class="fa-solid fa-link" style="color:var(--a-blue);"></i> Official Manufacturer Tools &amp; Portal Links (${links.length})
                </div>
                <div class="a-blog-section-subtitle">Direct links to manufacturer calculators, software, and design centers</div>
              </div>
              <button type="button" class="a-btn a-btn-primary a-btn-sm btn-add-oem-link" data-oem-id="${oem.id}">
                <i class="fa-solid fa-plus"></i> Add Official Link to ${oem.shortName}
              </button>
            </div>
            <div class="a-table-wrap">
              <table class="a-sub-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Icon</th>
                    <th>Resource Title &amp; URL</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${linkRows || `<tr><td colspan="5" style="text-align:center;padding:18px;color:var(--a-muted);">No official links added yet. Click "+ Add Official Link to ${oem.shortName}" above.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    }

    return `
      <div class="a-oem-card ${isHidden ? 'oem-hidden' : ''}" id="blog-oem-card-${oem.id}">
        <div class="a-oem-header">
          <div class="a-oem-header-left">
            <div class="a-oem-logo-thumb">
              ${resolvedLogo ? `<img src="${resolvedLogo}" alt="${oem.name}" />` : (oem.logoSvg || '<i class="fa-solid fa-industry" style="color:#94a3b8;"></i>')}
            </div>
            <div class="a-oem-info">
              <div class="a-oem-name-row">
                <span class="a-oem-title">${oem.name}</span>
                <span class="a-badge a-badge-blue">${oem.specialty || 'Manufacturing Principal'}</span>
                ${isHidden ? '<span class="a-badge" style="background:#64748b;color:#fff;"><i class="fa-solid fa-eye-slash"></i> Hidden</span>' : '<span class="a-badge a-badge-green"><i class="fa-solid fa-eye"></i> Visible</span>'}
              </div>
              <div class="a-oem-meta-row">
                <span><i class="fa-solid fa-newspaper"></i> <strong>${articles.length}</strong> Articles</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-video"></i> <strong>${videos.length}</strong> Videos</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-file-pdf"></i> <strong>${whitepapers.length}</strong> Whitepapers</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-link"></i> <strong>${links.length}</strong> Links</span>
              </div>
            </div>
          </div>

          <div class="a-oem-header-actions">
            <button type="button" class="a-btn a-btn-outline a-btn-sm btn-toggle-blog-oem-vis" data-oem-id="${oem.id}" title="${isHidden ? 'Show on public site' : 'Hide from public site'}">
              <i class="fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${isHidden ? 'Show' : 'Hide'}
            </button>
            <button type="button" class="a-btn a-btn-primary a-btn-sm btn-toggle-blog-oem-expand" data-oem-id="${oem.id}">
              <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
              <span>${isExpanded ? 'Collapse' : 'Manage'} Tech Hub (${totalUpdates} Updates)</span>
            </button>
            <button type="button" class="a-btn a-btn-outline a-btn-sm btn-edit-oem-hub" data-oem-id="${oem.id}">
              <i class="fa-solid fa-pen"></i> Edit Hub Profile
            </button>
          </div>
        </div>

        ${oemHubPanelHtml}
      </div>
    `;
  }).filter(Boolean).join('');

  return `
    <div class="a-cards-box">
      <div class="a-cards-box-header" style="align-items:flex-start;">
        <div>
          <h3>OEM Technical Blogs, Video Demos &amp; Whitepapers Catalog</h3>
          <p>Full pin-to-pin CMS management for all 13 global manufacturing partners. Edit technical articles, full dispatch text, video webinars, whitepapers, and official links.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-edit-blog-hero"><i class="fa-solid fa-heading"></i> Edit Page Hero &amp; Badges</button>
          <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-expand-all-blog-oems"><i class="fa-solid fa-angles-down"></i> Expand All</button>
          <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-collapse-all-blog-oems"><i class="fa-solid fa-angles-up"></i> Collapse All</button>
        </div>
      </div>

      <div class="a-catalog-toolbar">
        <div class="a-catalog-stats-strip">
          <div class="a-catalog-stat-badge">
            <span>Global OEM Hubs:</span>
            <strong>${totalOems}</strong>
          </div>
          <div class="a-catalog-stat-badge">
            <span>Technical Articles:</span>
            <strong>${totalArticles}</strong>
          </div>
          <div class="a-catalog-stat-badge">
            <span>Engineering Videos:</span>
            <strong>${totalVideos}</strong>
          </div>
          <div class="a-catalog-stat-badge">
            <span>Whitepapers &amp; Notes:</span>
            <strong>${totalWhitepapers}</strong>
          </div>
        </div>

        <div style="flex:1;max-width:420px;position:relative;">
          <input type="text" id="admin-blog-search-input" class="a-input" placeholder="Search OEMs, articles, videos, whitepapers, or tags..." value="${blogSearchQuery || ''}" style="padding-left:36px;" />
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--a-muted);font-size:0.85rem;"></i>
          ${blogSearchQuery ? '<button type="button" id="admin-blog-search-clear" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--a-muted);cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>' : ''}
        </div>
      </div>

      <div class="a-oem-accordions-list">
        ${oemCardsHtml || '<div class="a-empty-state" style="padding:40px;text-align:center;background:#fff;border-radius:12px;border:1px dashed var(--a-border);">No OEM tech hubs match your search query.</div>'}
      </div>
    </div>
  `;
}

function bindBlogsTabEvents() {
  const cmsBlogs = getCmsBlogsPayload();
  const oemBlogs = cmsBlogs.oemBlogs || [];

  const saveAndRefresh = (toastMsg = 'Blog updates saved!') => {
    cmsBlogs.oemBlogs = oemBlogs;
    ContentService.saveData('blogs', cmsBlogs);
    rerender();
    showToast(toastMsg, 'success');
  };

  // Search input
  const searchInput = document.getElementById('admin-blog-search-input');
  searchInput?.addEventListener('input', (e) => {
    blogSearchQuery = e.target.value;
    rerender();
    const newInp = document.getElementById('admin-blog-search-input');
    if (newInp) {
      newInp.focus();
      newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
    }
  });

  document.getElementById('admin-blog-search-clear')?.addEventListener('click', () => {
    blogSearchQuery = '';
    rerender();
  });

  // Expand / Collapse All
  document.getElementById('btn-expand-all-blog-oems')?.addEventListener('click', () => {
    CATALOG.forEach(o => expandedBlogOemIds.add(o.id));
    rerender();
  });

  document.getElementById('btn-collapse-all-blog-oems')?.addEventListener('click', () => {
    expandedBlogOemIds.clear();
    rerender();
  });

  // Edit Page Hero & Badges
  document.getElementById('btn-edit-blog-hero')?.addEventListener('click', () => {
    openModal('Edit Blogs Page Hero &amp; Badges', `
      <div class="a-field span2"><label class="a-label">Main Page Title *</label><input class="a-input" name="heroTitle" value="${cmsBlogs.heroTitle || 'OEM Technical News, Video Demos & Insights'}" required /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Lead Subtitle</label><textarea class="a-textarea" name="heroSubtitle" rows="3">${cmsBlogs.heroSubtitle || ''}</textarea></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Trust Badge 1 (Whitepapers)</label><input class="a-input" name="trustBadge1" value="${cmsBlogs.trustBadge1 || 'Application Whitepapers & Notes'}" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Trust Badge 2 (Videos)</label><input class="a-input" name="trustBadge2" value="${cmsBlogs.trustBadge2 || 'Video Demos & Technical Webinars'}" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Trust Badge 3 (Bulletins)</label><input class="a-input" name="trustBadge3" value="${cmsBlogs.trustBadge3 || 'Direct Manufacturer Bulletins'}" /></div>
    `, (data) => {
      cmsBlogs.heroTitle = data.heroTitle;
      cmsBlogs.heroSubtitle = data.heroSubtitle;
      cmsBlogs.trustBadge1 = data.trustBadge1;
      cmsBlogs.trustBadge2 = data.trustBadge2;
      cmsBlogs.trustBadge3 = data.trustBadge3;
      saveAndRefresh('Page hero and badges updated successfully!');
    });
  });

  // Toggle OEM expand
  document.querySelectorAll('.btn-toggle-blog-oem-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      if (expandedBlogOemIds.has(oemId)) {
        expandedBlogOemIds.delete(oemId);
      } else {
        expandedBlogOemIds.add(oemId);
      }
      rerender();
    });
  });

  // Toggle OEM visibility
  document.querySelectorAll('.btn-toggle-blog-oem-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (b) {
        b.visible = b.visible === false ? true : false;
        saveAndRefresh(`Tech Hub for ${oemId} is now ${b.visible ? 'visible' : 'hidden'}.`);
      }
    });
  });

  // Edit OEM Hub Profile
  document.querySelectorAll('.btn-edit-oem-hub').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const oem = CATALOG.find(o => o.id === oemId);
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!oem || !b) return;

      openModal(`Edit Tech Hub Profile: ${oem.name}`, `
        <div class="a-field span2"><label class="a-label">Dedicated Tech Hub Name *</label><input class="a-input" name="portalName" value="${b.portalName || `${oem.name} Technology Hub`}" required /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Hub Headline / Mission</label><textarea class="a-textarea" name="headline" rows="3">${b.headline || oem.description}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Official Engineering Website URL</label><input class="a-input" name="officialWebsite" value="${b.officialWebsite || ''}" placeholder="https://..." /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${b.visible !== false ? 'selected' : ''}>Visible in Public Hub</option>
            <option value="false" ${b.visible === false ? 'selected' : ''}>Hidden (Draft)</option>
          </select>
        </div>
      `, (data) => {
        b.portalName = data.portalName;
        b.headline = data.headline;
        b.officialWebsite = data.officialWebsite;
        b.visible = data.visible === 'true';
        saveAndRefresh(`Updated ${oem.name} Hub Profile!`);
      });
    });
  });

  // ─── ARTICLE ACTIONS ───
  // Add Article
  document.querySelectorAll('.btn-add-oem-art').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const oem = CATALOG.find(o => o.id === oemId);
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!oem || !b) return;

      openModal(`Add Technical Article to ${oem.name}`, `
        <div class="a-field span2"><label class="a-label">Article Headline / Title *</label><input class="a-input" name="title" required placeholder="e.g. Next-Gen Millimeter-Wave Substrate Formulations" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Article Category *</label><input class="a-input" name="category" value="Materials Innovation" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Publication Date</label><input class="a-input" name="date" value="${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Read Time</label><input class="a-input" name="readTime" value="5 min read" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" selected>Visible in Public Hub</option>
            <option value="false">Hidden (Draft)</option>
          </select>
        </div>
        ${renderImageUploadField('image', 'Article Cover Image', '', 'Upload hero image for article', { folder: 'blogs', oemSlug: resolveStorageSlug(oem || oemId) })}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Excerpt / Summary (Card Preview) *</label><textarea class="a-textarea" name="summary" rows="3" required placeholder="Short 2-3 sentence overview for the card preview..."></textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Full Technical Article Body (Rich HTML or Paragraphs)</label><textarea class="a-textarea" name="content" rows="6" placeholder="<p>Full article text, specifications, and engineering details...</p>"></textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Topic Tags (Comma-separated)</label><input class="a-input" name="tags" placeholder="e.g. 77 GHz Radar, RT/duroid, Substrate, Automotive" /></div>
      `, (data) => {
        if (!b.articles) b.articles = [];
        const tagsArr = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        const newArt = {
          id: `${oemId}-art-${Date.now()}`,
          title: data.title.trim(),
          category: data.category.trim(),
          date: data.date.trim(),
          readTime: data.readTime.trim(),
          image: data.image || '',
          summary: data.summary.trim(),
          content: data.content || `<p>${data.summary}</p>`,
          tags: tagsArr,
          visible: data.visible === 'true'
        };
        b.articles.unshift(newArt);
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Added article "${newArt.title}"!`);
      });
    });
  });

  // Edit Article
  document.querySelectorAll('.btn-edit-oem-art').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const art = b?.articles?.[idx];
      if (!b || !art) return;

      openModal(`Edit Article: ${art.title}`, `
        <div class="a-field span2"><label class="a-label">Article Headline / Title *</label><input class="a-input" name="title" value="${art.title || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Article Category *</label><input class="a-input" name="category" value="${art.category || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Publication Date</label><input class="a-input" name="date" value="${art.date || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Read Time</label><input class="a-input" name="readTime" value="${art.readTime || ''}" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${art.visible !== false ? 'selected' : ''}>Visible in Public Hub</option>
            <option value="false" ${art.visible === false ? 'selected' : ''}>Hidden (Draft)</option>
          </select>
        </div>
        ${renderImageUploadField('image', 'Article Cover Image', art.image || '', 'Upload hero image for article', { folder: 'blogs', oemSlug: resolveStorageSlug(oemId) })}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Excerpt / Summary (Card Preview) *</label><textarea class="a-textarea" name="summary" rows="3" required>${art.summary || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Full Technical Article Body (Rich HTML or Paragraphs)</label><textarea class="a-textarea" name="content" rows="8">${art.content || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Topic Tags (Comma-separated)</label><input class="a-input" name="tags" value="${(art.tags || []).join(', ')}" /></div>
      `, (data) => {
        art.title = data.title.trim();
        art.category = data.category.trim();
        art.date = data.date.trim();
        art.readTime = data.readTime.trim();
        art.image = data.image;
        art.summary = data.summary.trim();
        art.content = data.content;
        art.tags = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        art.visible = data.visible === 'true';
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Updated article "${art.title}"!`);
      });
    });
  });

  // Delete Article
  document.querySelectorAll('.btn-del-oem-art').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const art = b?.articles?.[idx];
      if (!b || !art) return;

      if (confirm(`Delete article "${art.title}"?`)) {
        b.articles.splice(idx, 1);
        saveAndRefresh(`Deleted article "${art.title}".`);
      }
    });
  });

  // Move Article
  document.querySelectorAll('.btn-move-oem-art').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!b || !b.articles) return;

      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      b.articles = reorderArray(b.articles, idx, targetIdx);
      saveAndRefresh('Articles reordered!');
    });
  });

  // Toggle Article Visibility
  document.querySelectorAll('.btn-toggle-art-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const art = b?.articles?.[idx];
      if (!art) return;
      art.visible = art.visible === false ? true : false;
      saveAndRefresh(`Article "${art.title}" is now ${art.visible ? 'visible' : 'hidden'}.`);
    });
  });

  // ─── VIDEO ACTIONS ───
  // Add Video
  document.querySelectorAll('.btn-add-oem-vid').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const oem = CATALOG.find(o => o.id === oemId);
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!oem || !b) return;

      openModal(`Add Video Demonstration to ${oem.name}`, `
        <div class="a-field span2"><label class="a-label">Video Title *</label><input class="a-input" name="title" required placeholder="e.g. Dielectric Material Characterization at W-Band" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Presenter / Speaker Name &amp; Title</label><input class="a-input" name="speaker" placeholder="e.g. John Coonrod, Technical Marketing Director" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Duration (MM:SS)</label><input class="a-input" name="duration" value="15:00" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Date</label><input class="a-input" name="date" value="${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" selected>Visible in Public Hub</option>
            <option value="false">Hidden (Draft)</option>
          </select>
        </div>
        ${renderImageUploadField('thumbnail', 'Video Thumbnail Image', '', 'Upload video cover preview', { folder: 'blogs', oemSlug: resolveStorageSlug(oem || oemId) })}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Video Streaming / Embed URL (YouTube, Vimeo, MP4)</label><input class="a-input" name="videoUrl" placeholder="https://..." /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Session Summary</label><textarea class="a-textarea" name="summary" rows="3" placeholder="Overview of the technical topics demonstrated in the video..."></textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Takeaway Topics (Comma-separated)</label><input class="a-input" name="topics" placeholder="e.g. Sub-THz Metrology, Skin Depth Effects, Microstrip Resonators" /></div>
      `, (data) => {
        if (!b.videos) b.videos = [];
        const topicsArr = (data.topics || '').split(',').map(t => t.trim()).filter(Boolean);
        const newVid = {
          id: `${oemId}-vid-${Date.now()}`,
          title: data.title.trim(),
          speaker: data.speaker.trim(),
          duration: data.duration.trim(),
          date: data.date.trim(),
          thumbnail: data.thumbnail || '',
          videoUrl: data.videoUrl || '',
          summary: data.summary.trim(),
          topics: topicsArr,
          visible: data.visible === 'true'
        };
        b.videos.unshift(newVid);
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Added video "${newVid.title}"!`);
      });
    });
  });

  // Edit Video
  document.querySelectorAll('.btn-edit-oem-vid').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const vid = b?.videos?.[idx];
      if (!b || !vid) return;

      openModal(`Edit Video: ${vid.title}`, `
        <div class="a-field span2"><label class="a-label">Video Title *</label><input class="a-input" name="title" value="${vid.title || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Presenter / Speaker Name &amp; Title</label><input class="a-input" name="speaker" value="${vid.speaker || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Duration</label><input class="a-input" name="duration" value="${vid.duration || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Date</label><input class="a-input" name="date" value="${vid.date || ''}" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${vid.visible !== false ? 'selected' : ''}>Visible in Public Hub</option>
            <option value="false" ${vid.visible === false ? 'selected' : ''}>Hidden (Draft)</option>
          </select>
        </div>
        ${renderImageUploadField('thumbnail', 'Video Thumbnail Image', vid.thumbnail || '', 'Upload video cover preview', { folder: 'blogs', oemSlug: resolveStorageSlug(oemId) })}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Video Streaming / Embed URL</label><input class="a-input" name="videoUrl" value="${vid.videoUrl || ''}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Session Summary</label><textarea class="a-textarea" name="summary" rows="3">${vid.summary || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Takeaway Topics (Comma-separated)</label><input class="a-input" name="topics" value="${(vid.topics || []).join(', ')}" /></div>
      `, (data) => {
        vid.title = data.title.trim();
        vid.speaker = data.speaker.trim();
        vid.duration = data.duration.trim();
        vid.date = data.date.trim();
        vid.thumbnail = data.thumbnail;
        vid.videoUrl = data.videoUrl;
        vid.summary = data.summary.trim();
        vid.topics = (data.topics || '').split(',').map(t => t.trim()).filter(Boolean);
        vid.visible = data.visible === 'true';
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Updated video "${vid.title}"!`);
      });
    });
  });

  // Delete Video
  document.querySelectorAll('.btn-del-oem-vid').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const vid = b?.videos?.[idx];
      if (!b || !vid) return;

      if (confirm(`Delete video "${vid.title}"?`)) {
        b.videos.splice(idx, 1);
        saveAndRefresh(`Deleted video "${vid.title}".`);
      }
    });
  });

  // Move Video
  document.querySelectorAll('.btn-move-oem-vid').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!b || !b.videos) return;

      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      b.videos = reorderArray(b.videos, idx, targetIdx);
      saveAndRefresh('Videos reordered!');
    });
  });

  // Toggle Video Visibility
  document.querySelectorAll('.btn-toggle-vid-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const vid = b?.videos?.[idx];
      if (!vid) return;
      vid.visible = vid.visible === false ? true : false;
      saveAndRefresh(`Video "${vid.title}" is now ${vid.visible ? 'visible' : 'hidden'}.`);
    });
  });

  // ─── WHITEPAPER ACTIONS ───
  // Add Whitepaper
  document.querySelectorAll('.btn-add-oem-wp').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const oem = CATALOG.find(o => o.id === oemId);
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!oem || !b) return;

      openModal(`Add Whitepaper to ${oem.name}`, `
        <div class="a-field span2"><label class="a-label">Whitepaper Title *</label><input class="a-input" name="title" required placeholder="e.g. Thermal Management Strategies for Multi-Layer High-Power RF Amplifiers" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Author / Engineering Lab</label><input class="a-input" name="author" value="${oem.name} Advanced Electronics Lab" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Publication Date</label><input class="a-input" name="date" value="${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Page Count</label><input class="a-input" name="pages" value="12 Pages" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Frequency Band</label><input class="a-input" name="frequencyBand" value="DC to 40 GHz" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Download / PDF Document URL</label><input class="a-input" name="downloadUrl" placeholder="https://..." /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" selected>Visible in Public Hub</option>
            <option value="false">Hidden (Draft)</option>
          </select>
        </div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Executive Summary</label><textarea class="a-textarea" name="summary" rows="3" placeholder="Technical summary of the study..."></textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Key Engineering Findings (One finding per line)</label><textarea class="a-textarea" name="keyFindings" rows="4" placeholder="Direct copper bonded substrates eliminate interface resistances.&#10;Thermal rating up to 170°C for airborne pods."></textarea></div>
      `, (data) => {
        if (!b.whitepapers) b.whitepapers = [];
        const findingsArr = (data.keyFindings || '').split('\n').map(f => f.trim()).filter(Boolean);
        const newWp = {
          id: `${oemId}-wp-${Date.now()}`,
          title: data.title.trim(),
          author: data.author.trim(),
          date: data.date.trim(),
          pages: data.pages.trim(),
          frequencyBand: data.frequencyBand.trim(),
          downloadUrl: data.downloadUrl || '',
          summary: data.summary.trim(),
          keyFindings: findingsArr,
          visible: data.visible === 'true'
        };
        b.whitepapers.unshift(newWp);
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Added whitepaper "${newWp.title}"!`);
      });
    });
  });

  // Edit Whitepaper
  document.querySelectorAll('.btn-edit-oem-wp').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const wp = b?.whitepapers?.[idx];
      if (!b || !wp) return;

      openModal(`Edit Whitepaper: ${wp.title}`, `
        <div class="a-field span2"><label class="a-label">Whitepaper Title *</label><input class="a-input" name="title" value="${wp.title || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Author / Engineering Lab</label><input class="a-input" name="author" value="${wp.author || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Publication Date</label><input class="a-input" name="date" value="${wp.date || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Page Count</label><input class="a-input" name="pages" value="${wp.pages || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Frequency Band</label><input class="a-input" name="frequencyBand" value="${wp.frequencyBand || ''}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Download / PDF Document URL</label><input class="a-input" name="downloadUrl" value="${wp.downloadUrl || ''}" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${wp.visible !== false ? 'selected' : ''}>Visible in Public Hub</option>
            <option value="false" ${wp.visible === false ? 'selected' : ''}>Hidden (Draft)</option>
          </select>
        </div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Executive Summary</label><textarea class="a-textarea" name="summary" rows="3">${wp.summary || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Key Engineering Findings (One finding per line)</label><textarea class="a-textarea" name="keyFindings" rows="4">${(wp.keyFindings || []).join('\n')}</textarea></div>
      `, (data) => {
        wp.title = data.title.trim();
        wp.author = data.author.trim();
        wp.date = data.date.trim();
        wp.pages = data.pages.trim();
        wp.frequencyBand = data.frequencyBand.trim();
        wp.downloadUrl = data.downloadUrl;
        wp.summary = data.summary.trim();
        wp.keyFindings = (data.keyFindings || '').split('\n').map(f => f.trim()).filter(Boolean);
        wp.visible = data.visible === 'true';
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Updated whitepaper "${wp.title}"!`);
      });
    });
  });

  // Delete Whitepaper
  document.querySelectorAll('.btn-del-oem-wp').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const wp = b?.whitepapers?.[idx];
      if (!b || !wp) return;

      if (confirm(`Delete whitepaper "${wp.title}"?`)) {
        b.whitepapers.splice(idx, 1);
        saveAndRefresh(`Deleted whitepaper "${wp.title}".`);
      }
    });
  });

  // Move Whitepaper
  document.querySelectorAll('.btn-move-oem-wp').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!b || !b.whitepapers) return;

      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      b.whitepapers = reorderArray(b.whitepapers, idx, targetIdx);
      saveAndRefresh('Whitepapers reordered!');
    });
  });

  // Toggle Whitepaper Visibility
  document.querySelectorAll('.btn-toggle-wp-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const wp = b?.whitepapers?.[idx];
      if (!wp) return;
      wp.visible = wp.visible === false ? true : false;
      saveAndRefresh(`Whitepaper "${wp.title}" is now ${wp.visible ? 'visible' : 'hidden'}.`);
    });
  });

  // ─── OFFICIAL LINKS ACTIONS ───
  // Add Link
  document.querySelectorAll('.btn-add-oem-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const oem = CATALOG.find(o => o.id === oemId);
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!oem || !b) return;

      openModal(`Add Official Tool / Link to ${oem.name}`, `
        <div class="a-field span2"><label class="a-label">Resource Title *</label><input class="a-input" name="title" required placeholder="e.g. ${oem.name} Design Hub & Calculator" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Official URL *</label><input class="a-input" name="url" required placeholder="https://..." /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description" rows="2" placeholder="Interactive RF calculator and design suite..."></textarea></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">FontAwesome Icon Class</label><input class="a-input" name="icon" value="fa-globe" placeholder="fa-globe, fa-calculator, fa-book-open" /></div>
      `, (data) => {
        if (!b.officialLinks) b.officialLinks = [];
        const newLink = {
          title: data.title.trim(),
          url: data.url.trim(),
          description: (data.description || '').trim(),
          icon: (data.icon || 'fa-globe').trim()
        };
        b.officialLinks.push(newLink);
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Added link "${newLink.title}"!`);
      });
    });
  });

  // Edit Link
  document.querySelectorAll('.btn-edit-oem-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const link = b?.officialLinks?.[idx];
      if (!b || !link) return;

      openModal(`Edit Official Link: ${link.title}`, `
        <div class="a-field span2"><label class="a-label">Resource Title *</label><input class="a-input" name="title" value="${link.title || ''}" required /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Official URL *</label><input class="a-input" name="url" value="${link.url || ''}" required /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description" rows="2">${link.description || ''}</textarea></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">FontAwesome Icon Class</label><input class="a-input" name="icon" value="${link.icon || 'fa-globe'}" /></div>
      `, (data) => {
        link.title = data.title.trim();
        link.url = data.url.trim();
        link.description = (data.description || '').trim();
        link.icon = (data.icon || 'fa-globe').trim();
        expandedBlogOemIds.add(oemId);
        saveAndRefresh(`Updated link "${link.title}"!`);
      });
    });
  });

  // Delete Link
  document.querySelectorAll('.btn-del-oem-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = oemBlogs.find(x => x.oemId === oemId);
      const link = b?.officialLinks?.[idx];
      if (!b || !link) return;

      if (confirm(`Delete official link "${link.title}"?`)) {
        b.officialLinks.splice(idx, 1);
        saveAndRefresh(`Deleted link "${link.title}".`);
      }
    });
  });

  // Move Link
  document.querySelectorAll('.btn-move-oem-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const b = oemBlogs.find(x => x.oemId === oemId);
      if (!b || !b.officialLinks) return;

      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      b.officialLinks = reorderArray(b.officialLinks, idx, targetIdx);
      saveAndRefresh('Official links reordered!');
    });
  });
}

// ─── HEADER & NAV EDITOR ─────────────────────────────────────────────────────
function renderHeaderPageEditor() {
  const h = ContentService.getData('header') || {};

  return `
    <form id="a-page-form">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Logo &amp; Brand Image</h3><p>Main website logo displayed in top navigation</p></div></div>
        <div class="a-form-grid">
          ${renderImageUploadField('logoUrl', 'Header Brand Logo', h.logoUrl || '/icon-logo-transparent.png', 'Transparent WebP, PNG, or JPG recommended (SVG disallowed)', { folder: 'general' })}
        </div>
      </div>

      <div class="a-card">
        <div class="a-card-header"><div><h3>Header Call-to-Action (CTA)</h3><p>Button in top-right corner &amp; mobile menu</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">Button Label</label><input class="a-input" name="ctaLabel" value="${h.ctaLabel || 'Request Quote'}"></div>
          <div class="a-field"><label class="a-label">Button Destination</label><input class="a-input" name="ctaLink" value="${h.ctaLink || '/contact'}"></div>
        </div>
      </div>

      <div class="a-card">
        <div class="a-card-header"><div><h3>Navigation Menu Labels</h3><p>Customize the 7 primary navigation links</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">Home Link Label</label><input class="a-input" name="navHome" value="${h.navHome || 'Home'}"></div>
          <div class="a-field"><label class="a-label">About Us Label</label><input class="a-input" name="navAbout" value="${h.navAbout || 'About Us'}"></div>
          <div class="a-field"><label class="a-label">Partners Label</label><input class="a-input" name="navPartners" value="${h.navPartners || 'Partners'}"></div>
          <div class="a-field"><label class="a-label">Products Label</label><input class="a-input" name="navProducts" value="${h.navProducts || 'Products'}"></div>
          <div class="a-field"><label class="a-label">Services Label</label><input class="a-input" name="navServices" value="${h.navServices || 'Services'}"></div>
          <div class="a-field"><label class="a-label">Blogs Label</label><input class="a-input" name="navBlogs" value="${h.navBlogs || 'Blogs'}"></div>
          <div class="a-field"><label class="a-label">Contact Label</label><input class="a-input" name="navContact" value="${h.navContact || 'Contact'}"></div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Header &amp; Nav</button>
      </div>
    </form>
  `;
}

// ─── FOOTER & OFFICES EDITOR ─────────────────────────────────────────────────
function renderFooterPageEditor() {
  const f = ContentService.getData('footer') || {};

  return `
    <form id="a-page-form">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Footer Branding &amp; Tagline</h3><p>Footer brand column</p></div></div>
        <div class="a-form-grid">
          ${renderImageUploadField('logoUrl', 'Footer Logo Image', f.logoUrl || '/icon-logo-transparent.png', 'Transparent logo', { folder: 'general' })}
          <div class="a-field span2"><label class="a-label">Company Mission Tagline</label><textarea class="a-textarea" name="tagline">${f.tagline || ''}</textarea></div>
          <div class="a-field span2"><label class="a-label">Copyright Notice</label><input class="a-input" name="copyrightText" value="${f.copyrightText || ''}"></div>
        </div>
      </div>

      <div class="a-card">
        <div class="a-card-header"><div><h3>Social Media Channels</h3><p>External links for social icons</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">LinkedIn Company URL</label><input class="a-input" name="linkedinUrl" value="${f.linkedinUrl || ''}"></div>
          <div class="a-field"><label class="a-label">YouTube URL</label><input class="a-input" name="youtubeUrl" value="${f.youtubeUrl || ''}"></div>
        </div>
      </div>

      <div class="a-card">
        <div class="a-card-header"><div><h3>Office Contacts (In Footer)</h3><p>Synced with contact page</p></div></div>
        <div class="a-form-grid">
          <div class="a-section-divider span2">India Office</div>
          <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="indiaOfficeName" value="${f.indiaOfficeName || ''}"></div>
          <div class="a-field"><label class="a-label">Telephone</label><input class="a-input" name="indiaPhone" value="${f.indiaPhone || ''}"></div>
          <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="indiaAddress">${f.indiaAddress || ''}</textarea></div>
          <div class="a-field span2"><label class="a-label">Email</label><input class="a-input" name="indiaEmail" value="${f.indiaEmail || ''}"></div>

          <div class="a-section-divider span2">Singapore Office</div>
          <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="singaporeOfficeName" value="${f.singaporeOfficeName || ''}"></div>
          <div class="a-field"><label class="a-label">Email</label><input class="a-input" name="singaporeEmail" value="${f.singaporeEmail || ''}"></div>
          <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="singaporeAddress">${f.singaporeAddress || ''}</textarea></div>

          <div class="a-section-divider span2">USA Office</div>
          <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="usaOfficeName" value="${f.usaOfficeName || ''}"></div>
          <div class="a-field"><label class="a-label">Telephone</label><input class="a-input" name="usaPhone" value="${f.usaPhone || ''}"></div>
          <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="usaAddress">${f.usaAddress || ''}</textarea></div>
          <div class="a-field span2"><label class="a-label">Email</label><input class="a-input" name="usaEmail" value="${f.usaEmail || ''}"></div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Footer Settings</button>
      </div>
    </form>
  `;
}

// ─── SEO SETTINGS EDITOR ─────────────────────────────────────────────────────
function renderSeoPageEditor() {
  const s = ContentService.getData('seo') || {};

  return `
    <form id="a-page-form">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Global SEO &amp; Meta Tags</h3><p>Search engine optimization tokens</p></div></div>
        <div class="a-form-grid">
          <div class="a-field span2"><label class="a-label">Site &lt;title&gt; Tag</label><input class="a-input" name="siteTitle" value="${s.siteTitle || ''}"></div>
          <div class="a-field span2"><label class="a-label">Meta Description</label><textarea class="a-textarea" name="metaDescription">${s.metaDescription || ''}</textarea></div>
          <div class="a-field span2"><label class="a-label">Meta Keywords (Comma separated)</label><input class="a-input" name="metaKeywords" value="${s.metaKeywords || ''}"></div>
        </div>
      </div>

      <div class="a-card">
        <div class="a-card-header"><div><h3>Open Graph &amp; Social Share</h3><p>Preview cards when links are shared on LinkedIn, Twitter, etc.</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">OG Title</label><input class="a-input" name="ogTitle" value="${s.ogTitle || ''}"></div>
          <div class="a-field"><label class="a-label">OG Description</label><textarea class="a-textarea" name="ogDescription">${s.ogDescription || ''}</textarea></div>
          ${renderImageUploadField('ogImage', 'OG Social Share Image', s.ogImage || '', 'Image preview shown in social posts')}
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save SEO Settings</button>
      </div>
    </form>
  `;
}

// ─── Universal Card Manager Tab Helper ───────────────────────────────────────
function renderCardsManagerTab(title, cardsArray, cardType, fieldsList) {
  return `
    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>${title} (${cardsArray.length})</h3>
          <p>Add, edit, delete, and reorder cards in this collection</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-${cardType}-btn"><i class="fa-solid fa-plus"></i> Add ${title.replace(/\s*\(\d+\)/, '')}</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead>
            <tr>
              <th>Reorder</th>
              ${fieldsList.includes('image') ? '<th>Photo</th>' : ''}
              <th>Item / Heading</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cardsArray.map((card, idx) => {
              const img = fieldsList.includes('image') ? ImageStorage.resolveImageUrl(card.image) : '';
              const titleVal = card.title || card.text || card.year || card.number || ('Item #' + (idx + 1));
              const subVal = card.desc || card.domain || card.subtitle || card.label || card.tag || card.company || '';
              return `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-${cardType}" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-${cardType}" data-dir="down" data-idx="${idx}" ${idx === cardsArray.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  ${fieldsList.includes('image') ? `
                    <td>${img ? `<img src="${img}" class="a-img-preview" alt="Thumb" />` : '<span style="color:#94a3b8; font-size:0.75rem;">No image</span>'}</td>
                  ` : ''}
                  <td><strong>${titleVal}</strong></td>
                  <td style="font-size:0.82rem; color:var(--a-muted); max-width:300px;">${subVal}</td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-${cardType}" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-${cardType}" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindUniversalCardActions(pageKey, parentData, arrayPropName, cardType, renderAddForm, renderEditForm) {
  const cards = parentData[arrayPropName] || [];

  document.getElementById(`a-add-${cardType}-btn`)?.addEventListener('click', () => {
    openModal('Add New Card', renderAddForm(), (data) => {
      cards.push({ id: `${cardType}-${Date.now()}`, ...data });
      parentData[arrayPropName] = cards;
      ContentService.saveData(pageKey, parentData);
    });
  });

  document.querySelectorAll(`.btn-edit-${cardType}`).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const card = cards[idx];
      openModal('Edit Card', renderEditForm(card), (data) => {
        cards[idx] = { ...card, ...data };
        parentData[arrayPropName] = cards;
        ContentService.saveData(pageKey, parentData);
      });
    });
  });

  document.querySelectorAll(`.btn-del-${cardType}`).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this card?')) {
        cards.splice(idx, 1);
        parentData[arrayPropName] = cards;
        ContentService.saveData(pageKey, parentData);
        rerender();
        showToast('Card deleted.', '');
      }
    });
  });

  document.querySelectorAll(`.btn-move-${cardType}`).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      parentData[arrayPropName] = reorderArray(cards, idx, targetIdx);
      ContentService.saveData(pageKey, parentData);
      rerender();
      showToast('Card order updated!', 'success');
    });
  });
}

