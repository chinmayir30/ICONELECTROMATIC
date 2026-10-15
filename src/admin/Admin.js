import './admin.css';
import { ContentService } from '../data/ContentService.js';
import { ImageStorage } from '../data/ImageStorage.js';

// ─── State ─────────────────────────────────────────────────────────────────
let isAuthenticated = localStorage.getItem('admin_auth') === 'true';
let currentTab = 'dashboard';
let currentSubTab = 'fields'; // for pages with subtabs (fields vs cards)

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
  return `
    <div class="a-login-page">
      <div class="a-login-box">
        <div class="a-login-logo">
          <img src="/icon-logo-transparent.png" alt="Icon Electromatic" onerror="this.style.display='none'">
        </div>
        <h2>Admin CMS</h2>
        <p>Icon Electromatic Content Portal</p>
        <form class="a-login-form" id="a-login-form">
          <div class="a-field">
            <label>Email</label>
            <input class="a-input" type="email" id="a-email" value="admin@iconelectromatic.com" required>
          </div>
          <div class="a-field">
            <label>Password</label>
            <input class="a-input" type="password" id="a-password" value="admin123" required>
          </div>
          <button type="submit" class="a-btn a-btn-primary">Sign In <i class="fa-solid fa-arrow-right"></i></button>
        </form>
        <div class="a-login-demo-note">
          <i class="fa-solid fa-flask"></i>&nbsp; Demo mode – credentials are prefilled above
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <a href="#/" class="a-btn a-btn-outline a-btn-sm" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
            <i class="fa-solid fa-arrow-left"></i> Return to Website
          </a>
        </div>
      </div>
    </div>
  `;
}

function bindLoginForm() {
  document.getElementById('a-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('a-email').value;
    const pass  = document.getElementById('a-password').value;
    if (email === 'admin@iconelectromatic.com' && pass === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      isAuthenticated = true;
      rerender();
    } else {
      alert('Invalid credentials.');
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
            <a href="#/" class="a-btn a-btn-outline a-btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
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
  document.getElementById('a-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('admin_auth');
    isAuthenticated = false;
    rerender();
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

function showToast(msg, type = '') {
  const existing = document.getElementById('a-toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'a-toast';
  t.className = `a-toast ${type}`;
  t.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── Universal Image Upload Widget ───────────────────────────────────────────
export function renderImageUploadField(fieldName, label, currentValue, ctxText = '') {
  const resolved = ImageStorage.resolveImageUrl(currentValue);
  const hasImg = Boolean(currentValue);

  return `
    <div class="a-field span2 a-image-widget" data-field="${fieldName}">
      <label class="a-label">${label} <span class="a-label-ctx">${ctxText}</span></label>
      <div class="a-img-uploader">
        <div class="a-img-thumb-box" id="thumb-box-${fieldName}">
          ${hasImg 
            ? `<img src="${resolved}" class="a-thumb-img" id="thumb-img-${fieldName}" alt="Preview" />` 
            : `<div class="a-thumb-empty" id="thumb-empty-${fieldName}"><i class="fa-solid fa-image"></i><span>No image</span></div>`}
        </div>
        <div class="a-img-actions">
          <input type="hidden" name="${fieldName}" id="hidden-${fieldName}" value="${currentValue || ''}" />
          <div class="a-img-btn-row">
            <label class="a-btn a-btn-sm a-btn-primary a-upload-btn">
              <i class="fa-solid fa-cloud-arrow-up"></i> <span id="upload-txt-${fieldName}">${hasImg ? 'Replace Image' : 'Upload Image'}</span>
              <input type="file" accept="image/*" class="a-file-input" data-target="${fieldName}" style="display:none;" />
            </label>
            <button type="button" class="a-btn a-btn-sm a-btn-danger a-img-delete-btn" data-target="${fieldName}" id="del-btn-${fieldName}" style="${hasImg ? '' : 'display:none;'}">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
          <div class="a-img-url-row">
            <input type="text" class="a-input a-input-sm a-img-url-input" data-target="${fieldName}" placeholder="Or paste asset path (/images/...) or URL" value="${currentValue || ''}" />
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindImageWidgets(container = document) {
  // File upload input change
  container.querySelectorAll('.a-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fieldName = input.getAttribute('data-target');
      showToast('Saving image to IndexedDB...', '');

      try {
        const imgId = await ImageStorage.saveImage(file);
        const resolvedUrl = ImageStorage.resolveImageUrl(imgId);

        // Update hidden input & text input
        const hiddenInput = container.querySelector(`#hidden-${fieldName}`) || container.querySelector(`input[name="${fieldName}"]`);
        if (hiddenInput) hiddenInput.value = imgId;

        const urlInput = container.querySelector(`.a-img-url-input[data-target="${fieldName}"]`);
        if (urlInput) urlInput.value = imgId;

        // Update thumbnail preview
        const thumbBox = container.querySelector(`#thumb-box-${fieldName}`) || container.querySelector(`.a-image-widget[data-field="${fieldName}"] .a-img-thumb-box`);
        if (thumbBox) {
          thumbBox.innerHTML = `<img src="${resolvedUrl}" class="a-thumb-img" alt="Preview" />`;
        }

        // Show delete button and update button label
        const delBtn = container.querySelector(`#del-btn-${fieldName}`) || container.querySelector(`.a-img-delete-btn[data-target="${fieldName}"]`);
        if (delBtn) delBtn.style.display = 'inline-flex';

        const uploadTxt = container.querySelector(`#upload-txt-${fieldName}`);
        if (uploadTxt) uploadTxt.textContent = 'Replace Image';

        showToast('Image saved securely in IndexedDB!', 'success');
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Failed to save image. Please check console.');
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
        if (thumbBox) thumbBox.innerHTML = `<img src="${resolved}" class="a-thumb-img" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'a-thumb-empty\\'><i class=\\'fa-solid fa-triangle-exclamation\\'></i><span>Invalid</span></div>'" />`;
        if (delBtn) delBtn.style.display = 'inline-flex';
        if (uploadTxt) uploadTxt.textContent = 'Replace Image';
      } else {
        if (thumbBox) thumbBox.innerHTML = `<div class="a-thumb-empty"><i class="fa-solid fa-image"></i><span>No image</span></div>`;
        if (delBtn) delBtn.style.display = 'none';
        if (uploadTxt) uploadTxt.textContent = 'Upload Image';
      }
    });
  });

  // Delete image button
  container.querySelectorAll('.a-img-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fieldName = btn.getAttribute('data-target');
      const hiddenInput = container.querySelector(`#hidden-${fieldName}`) || container.querySelector(`input[name="${fieldName}"]`);
      const currentVal = hiddenInput ? hiddenInput.value : '';

      if (currentVal && currentVal.startsWith('idb:')) {
        await ImageStorage.deleteImage(currentVal);
      }

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

      showToast('Image removed.', '');
    });
  });
}

// ─── Modal Dialog Helper ─────────────────────────────────────────────────────
function openModal(title, formHtml, onSave) {
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

  const closeModal = () => { container.innerHTML = ''; };

  document.getElementById('a-modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('a-modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('a-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'a-modal-backdrop') closeModal();
  });

  document.getElementById('a-modal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });
    onSave(data);
    closeModal();
    rerender();
    showToast('Card saved successfully!', 'success');
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
            <tr><td><strong>Products / OEMs</strong></td><td><i class="fa-solid fa-check" style="color:var(--a-success);"></i> OEM Logos</td><td>All 15 global manufacturers with logo upload</td><td><span class="a-badge a-badge-green">Full CRUD</span></td></tr>
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
  `;
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
          </div>
        </div>

        <div class="a-card">
          <div class="a-card-header"><div><h3>Vision &amp; Mission</h3><p>Guiding organizational principles</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Vision Title</label><input class="a-input" name="visionTitle" value="${d.visionTitle || 'Our Vision'}"></div>
            <div class="a-field"><label class="a-label">Mission Title</label><input class="a-input" name="missionTitle" value="${d.missionTitle || 'Our Mission'}"></div>
            <div class="a-field span2"><label class="a-label">Vision Statement</label><textarea class="a-textarea" name="visionDesc">${d.visionDesc || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Mission Statement</label><textarea class="a-textarea" name="missionDesc">${d.missionDesc || ''}</textarea></div>
          </div>
        </div>

        <div class="a-card">
          <div class="a-card-header"><div><h3>Chronology / Journey Section</h3><p>Timeline lead and official presentation infographic slide</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Title</label><input class="a-input" name="journeyTitle" value="${d.journeyTitle || 'Chronology'}"></div>
            <div class="a-field"><label class="a-label">Subtitle</label><input class="a-input" name="journeySubtitle" value="${d.journeySubtitle || 'Our Journey'}"></div>
            <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="journeyLead">${d.journeyLead || ''}</textarea></div>
            ${renderImageUploadField('infographicImage', 'Chronology Infographic Slide Image', d.infographicImage || '', 'High-res image opened by View Slide Graphic modal')}
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save About Us Content</button>
        </div>
      </form>
    ` : ''}

    ${currentSubTab === 'badges' ? renderCardsManagerTab('Trust Badges', badges, 'badge', ['text', 'icon', 'color']) : ''}
    ${currentSubTab === 'highlights' ? renderCardsManagerTab('Feature Highlights', highlights, 'highlight', ['title', 'desc', 'icon', 'color']) : ''}
    ${currentSubTab === 'stats' ? renderCardsManagerTab('Quick Facts Counters', stats, 'quickstat', ['target', 'suffix', 'label', 'icon', 'color']) : ''}
    ${currentSubTab === 'milestones' ? renderCardsManagerTab('Timeline Milestones', milestones, 'milestone', ['year', 'title', 'desc', 'image', 'caption', 'color']) : ''}
    ${currentSubTab === 'domains' ? renderCardsManagerTab('Strategic Application Domains', domains, 'domain', ['title', 'desc', 'image', 'tag']) : ''}
    ${currentSubTab === 'pillars' ? renderCardsManagerTab('Strategic Pillars', pillars, 'pillar', ['eyebrow', 'title', 'subtitle', 'desc', 'image', 'color']) : ''}
    ${currentSubTab === 'whyus' ? renderCardsManagerTab('Why Us Points', whyUs, 'whyus', ['number', 'title', 'desc', 'icon', 'color']) : ''}
  `;
}

function bindAboutTabEvents() {
  document.querySelectorAll('.a-subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubTab = btn.getAttribute('data-subtab');
      rerender();
    });
  });

  const d = ContentService.getData('about') || {};

  // Badges
  bindUniversalCardActions('about', d, 'badges', 'badge', () => `
    <div class="a-field"><label class="a-label">Badge Text</label><input class="a-input" name="text" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon (e.g. fa-solid fa-award)</label><input class="a-input" name="icon" value="fa-solid fa-award" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Text Color Hex (e.g. #FDA4AF)</label><input class="a-input" name="color" value="#FDA4AF" /></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Badge Text</label><input class="a-input" name="text" value="${card.text}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="${card.icon || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Text Color Hex</label><input class="a-input" name="color" value="${card.color || ''}" /></div>
  `);

  // Highlights
  bindUniversalCardActions('about', d, 'highlightCards', 'highlight', () => `
    <div class="a-field"><label class="a-label">Card Title</label><input class="a-input" name="title" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="fa-solid fa-tower-broadcast" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Color (blue / red)</label><input class="a-input" name="color" value="blue" /></div>
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Card Title</label><input class="a-input" name="title" value="${card.title}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="${card.icon || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Color (blue / red)</label><input class="a-input" name="color" value="${card.color || 'blue'}" /></div>
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${card.desc || ''}</textarea></div>
  `);

  // Stats
  bindUniversalCardActions('about', d, 'stats', 'quickstat', () => `
    <div class="a-field"><label class="a-label">Target Number (e.g. 1500)</label><input class="a-input" name="target" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Suffix (e.g. +)</label><input class="a-input" name="suffix" value="+" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Label (e.g. Products)</label><input class="a-input" name="label" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="fa-solid fa-boxes-stacked" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (red / blue)</label><input class="a-input" name="color" value="red" /></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Target Number</label><input class="a-input" name="target" value="${card.target}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Suffix</label><input class="a-input" name="suffix" value="${card.suffix || '+'}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Label</label><input class="a-input" name="label" value="${card.label}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="${card.icon || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (red / blue)</label><input class="a-input" name="color" value="${card.color || 'red'}" /></div>
  `);

  // Milestones
  bindUniversalCardActions('about', d, 'milestones', 'milestone', () => `
    <div class="a-field"><label class="a-label">Year / Milestone Date (e.g. 2009)</label><input class="a-input" name="year" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Headline Title</label><input class="a-input" name="title" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Theme Color (cyan / red / navy / amber)</label><input class="a-input" name="color" value="cyan" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Photo Caption</label><input class="a-input" name="caption" /></div>
    ${renderImageUploadField('image', 'Milestone Photo', '', 'Visual for this timeline step')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Milestone Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Year / Milestone Date</label><input class="a-input" name="year" value="${card.year}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Headline Title</label><input class="a-input" name="title" value="${card.title}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Theme Color (cyan / red / navy / amber)</label><input class="a-input" name="color" value="${card.color || 'cyan'}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Photo Caption</label><input class="a-input" name="caption" value="${card.caption || ''}" /></div>
    ${renderImageUploadField('image', 'Milestone Photo', card.image || '', 'Visual for this timeline step')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Milestone Description</label><textarea class="a-textarea" name="desc" required>${card.desc || ''}</textarea></div>
  `);

  // Domains
  bindUniversalCardActions('about', d, 'domains', 'domain', () => `
    <div class="a-field"><label class="a-label">Domain Name (e.g. Aerospace & Defence)</label><input class="a-input" name="title" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Tag Pill (e.g. Radar & EW Systems)</label><input class="a-input" name="tag" /></div>
    ${renderImageUploadField('image', 'Domain Photo', '', 'Image displayed on domain card')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Domain Name</label><input class="a-input" name="title" value="${card.title}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Tag Pill</label><input class="a-input" name="tag" value="${card.tag || ''}" /></div>
    ${renderImageUploadField('image', 'Domain Photo', card.image || '', 'Image displayed on domain card')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${card.desc || ''}</textarea></div>
  `);

  // Pillars
  bindUniversalCardActions('about', d, 'pillars', 'pillar', () => `
    <div class="a-field"><label class="a-label">Eyebrow (e.g. GLOBAL ALLIANCES)</label><input class="a-input" name="eyebrow" value="FOUNDATIONAL PILLAR" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Title</label><input class="a-input" name="title" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Subtitle</label><input class="a-input" name="subtitle" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (blue / red)</label><input class="a-input" name="color" value="blue" /></div>
    ${renderImageUploadField('image', 'Pillar Photo', '', 'Image displayed for this pillar')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Eyebrow</label><input class="a-input" name="eyebrow" value="${card.eyebrow || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Title</label><input class="a-input" name="title" value="${card.title}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Subtitle</label><input class="a-input" name="subtitle" value="${card.subtitle || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (blue / red)</label><input class="a-input" name="color" value="${card.color || 'blue'}" /></div>
    ${renderImageUploadField('image', 'Pillar Photo', card.image || '', 'Image displayed for this pillar')}
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${card.desc || ''}</textarea></div>
  `);

  // Why Us
  bindUniversalCardActions('about', d, 'whyUs', 'whyus', () => `
    <div class="a-field"><label class="a-label">Number (e.g. 01)</label><input class="a-input" name="number" value="01" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Title</label><input class="a-input" name="title" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="fa-solid fa-bullseye" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (red / blue)</label><input class="a-input" name="color" value="red" /></div>
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
  `, (card) => `
    <div class="a-field"><label class="a-label">Number</label><input class="a-input" name="number" value="${card.number || '01'}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Title</label><input class="a-input" name="title" value="${card.title}" required /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon</label><input class="a-input" name="icon" value="${card.icon || ''}" /></div>
    <div class="a-field" style="margin-top:12px;"><label class="a-label">Color (red / blue)</label><input class="a-input" name="color" value="${card.color || 'red'}" /></div>
    <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${card.desc || ''}</textarea></div>
  `);
}

// ─── SERVICES PAGE EDITOR ────────────────────────────────────────────────────
function renderServicesPageEditor() {
  const d = ContentService.getData('services') || {};
  const items = d.items || [];
  const badges = d.badges || [];

  return `
    <div class="a-subtabs-nav">
      <button type="button" class="a-subtab-btn ${currentSubTab === 'fields' ? 'active' : ''}" data-subtab="fields"><i class="fa-solid fa-pen-to-square"></i> Hero &amp; Badges</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'services' ? 'active' : ''}" data-subtab="services"><i class="fa-solid fa-gears"></i> Service Pillars (${items.length})</button>
    </div>

    ${currentSubTab === 'fields' ? `
      <form id="a-page-form">
        <div class="a-card">
          <div class="a-card-header"><div><h3>Services Hero Banner</h3><p>Page heading and introduction</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Eyebrow Tag</label><input class="a-input" name="heroEyebrow" value="${d.heroEyebrow || 'CAPABILITIES & SERVICES'}"></div>
            <div class="a-field"><label class="a-label">Page Title</label><input class="a-input" name="heroTitle" value="${d.heroTitle || 'Engineering Services & Global Representation'}"></div>
            <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="heroLead">${d.heroLead || ''}</textarea></div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Services Hero</button>
        </div>
      </form>
    ` : ''}

    ${currentSubTab === 'services' ? `
      <div class="a-cards-box">
        <div class="a-cards-box-header">
          <div>
            <h3>Core Service Blocks &amp; Sliders</h3>
            <p>Each service block has its own title, descriptions, tags, and multi-image slideshow</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-srv-btn"><i class="fa-solid fa-plus"></i> Add Service Pillar</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Service Title</th><th>Subtitle / Domain</th><th>Slideshow Images</th><th>Actions</th></tr></thead>
            <tbody>
              ${items.map((srv, idx) => {
                const slidesCount = (srv.slides || []).length;
                const firstImg = slidesCount ? ImageStorage.resolveImageUrl(srv.slides[0].image) : '';
                return `
                  <tr>
                    <td style="width:90px;">
                      <div class="a-reorder-group">
                        <button class="a-btn-reorder btn-move-srv" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="a-btn-reorder btn-move-srv" data-dir="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:10px;">
                        ${firstImg ? `<img src="${firstImg}" class="a-img-preview" alt="Thumb" style="width:50px; height:38px;" />` : ''}
                        <div>
                          <strong>${srv.title}</strong>
                          <div style="font-size:0.75rem; color:var(--a-muted);">${srv.badge || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>${srv.subtitle || '—'}</td>
                    <td><span class="a-badge a-badge-blue">${slidesCount} Slides</span></td>
                    <td>
                      <button class="a-btn a-btn-outline a-btn-sm btn-edit-srv" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                      <button class="a-btn a-btn-danger a-btn-sm btn-del-srv" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `;
}

function bindServicesTabEvents() {
  document.querySelectorAll('.a-subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubTab = btn.getAttribute('data-subtab');
      rerender();
    });
  });

  const d = ContentService.getData('services') || {};

  document.getElementById('a-add-srv-btn')?.addEventListener('click', () => {
    openModal('Add Service Block', `
      <div class="a-field"><label class="a-label">Service Title</label><input class="a-input" name="title" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Subtitle / Focus</label><input class="a-input" name="subtitle" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Badge Pill Label</label><input class="a-input" name="badge" value="Core Capability" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Badge Color (blue / red)</label><input class="a-input" name="badgeColor" value="blue" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Primary Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Secondary Description (Optional)</label><textarea class="a-textarea" name="desc2"></textarea></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tags (comma separated)</label><input class="a-input" name="tags" placeholder="e.g. Mil-Spec, Direct Warranty, Stock Hub" /></div>
      ${renderImageUploadField('slide1', 'Slide Image 1', '', 'First slideshow photo')}
      <div class="a-field span2"><label class="a-label">Slide 1 Caption</label><input class="a-input" name="caption1" /></div>
      ${renderImageUploadField('slide2', 'Slide Image 2 (Optional)', '', 'Second slideshow photo')}
      <div class="a-field span2"><label class="a-label">Slide 2 Caption</label><input class="a-input" name="caption2" /></div>
    `, (data) => {
      const items = d.items || [];
      const slides = [];
      if (data.slide1) slides.push({ image: data.slide1, caption: data.caption1 || '' });
      if (data.slide2) slides.push({ image: data.slide2, caption: data.caption2 || '' });
      if (!slides.length) slides.push({ image: '/images/hero-amplifier.jpg', caption: data.title });

      const tags = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      items.push({
        id: 'srv-' + Date.now(),
        title: data.title,
        subtitle: data.subtitle,
        badge: data.badge,
        badgeColor: data.badgeColor,
        desc: data.desc,
        desc2: data.desc2,
        tags,
        slides,
        ctaText: 'Explore More',
        ctaLink: '/products'
      });
      d.items = items;
      ContentService.saveData('services', d);
    });
  });

  document.querySelectorAll('.btn-edit-srv').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const srv = d.items[idx];
      const s1 = srv.slides?.[0] || {};
      const s2 = srv.slides?.[1] || {};

      openModal('Edit Service Block', `
        <div class="a-field"><label class="a-label">Service Title</label><input class="a-input" name="title" value="${srv.title}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Subtitle / Focus</label><input class="a-input" name="subtitle" value="${srv.subtitle || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Badge Pill Label</label><input class="a-input" name="badge" value="${srv.badge || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Badge Color (blue / red)</label><input class="a-input" name="badgeColor" value="${srv.badgeColor || 'blue'}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Primary Description</label><textarea class="a-textarea" name="desc" required>${srv.desc || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Secondary Description (Optional)</label><textarea class="a-textarea" name="desc2">${srv.desc2 || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tags (comma separated)</label><input class="a-input" name="tags" value="${(srv.tags || []).join(', ')}" /></div>
        ${renderImageUploadField('slide1', 'Slide Image 1', s1.image || '', 'First slideshow photo')}
        <div class="a-field span2"><label class="a-label">Slide 1 Caption</label><input class="a-input" name="caption1" value="${s1.caption || ''}" /></div>
        ${renderImageUploadField('slide2', 'Slide Image 2', s2.image || '', 'Second slideshow photo')}
        <div class="a-field span2"><label class="a-label">Slide 2 Caption</label><input class="a-input" name="caption2" value="${s2.caption || ''}" /></div>
      `, (data) => {
        const slides = [];
        if (data.slide1) slides.push({ image: data.slide1, caption: data.caption1 || '' });
        if (data.slide2) slides.push({ image: data.slide2, caption: data.caption2 || '' });
        // Preserve any remaining slides
        if (srv.slides && srv.slides.length > 2) {
          slides.push(...srv.slides.slice(2));
        }

        const tags = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        d.items[idx] = {
          ...srv,
          title: data.title,
          subtitle: data.subtitle,
          badge: data.badge,
          badgeColor: data.badgeColor,
          desc: data.desc,
          desc2: data.desc2,
          tags,
          slides: slides.length ? slides : srv.slides
        };
        ContentService.saveData('services', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-srv').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this service block?')) {
        d.items.splice(idx, 1);
        ContentService.saveData('services', d);
        rerender();
        showToast('Service block deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-srv').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.items = reorderArray(d.items, idx, targetIdx);
      ContentService.saveData('services', d);
      rerender();
      showToast('Service blocks reordered!', 'success');
    });
  });
}

// ─── PROJECTS PAGE EDITOR ────────────────────────────────────────────────────
function renderProjectsPageEditor() {
  const d = ContentService.getData('projects') || {};
  const items = d.items || [];

  return `
    <form id="a-page-form" style="margin-bottom:20px;">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Projects Section Intro</h3><p>Section title and narrative lead</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">Section Title</label><input class="a-input" name="heroTitle" value="${d.heroTitle || 'Featured Engineering Projects'}"></div>
          <div class="a-field"><label class="a-label">Section Subtitle</label><input class="a-input" name="heroSubtitle" value="${d.heroSubtitle || 'Mission-Ready Hardware Deployments'}"></div>
          <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="heroLead">${d.heroLead || ''}</textarea></div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Header</button>
        </div>
      </div>
    </form>

    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>Engineering Project Cards (${items.length})</h3>
          <p>Add, edit, delete, and reorder defense, space &amp; microwave projects</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-proj-btn"><i class="fa-solid fa-plus"></i> Add New Project</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Reorder</th><th>Cover</th><th>Project Title</th><th>Client / Sector</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${items.map((proj, idx) => {
              const img = ImageStorage.resolveImageUrl(proj.image);
              return `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-proj" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-proj" data-dir="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td>${img ? `<img src="${img}" class="a-img-preview" alt="Thumb" />` : '<span style="color:#94a3b8; font-size:0.75rem;">No image</span>'}</td>
                  <td><strong>${proj.title}</strong><div style="font-size:0.75rem; color:var(--a-muted);">${proj.category || ''}</div></td>
                  <td style="font-size:0.82rem;">${proj.clientSector || '—'}</td>
                  <td><span class="a-badge a-badge-green">${proj.status || 'Active'}</span></td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-proj" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-proj" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
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

function bindProjectsTabEvents() {
  const d = ContentService.getData('projects') || {};

  document.getElementById('a-add-proj-btn')?.addEventListener('click', () => {
    openModal('Add Project Card', `
      <div class="a-field"><label class="a-label">Project Title</label><input class="a-input" name="title" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Category (e.g. Defense & Radar)</label><input class="a-input" name="category" value="Defense & Radar" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Client / Sector</label><input class="a-input" name="clientSector" value="Aerospace & Defense" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Date / Timeline</label><input class="a-input" name="date" value="2026" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Status (e.g. Deployed, Flight Qualified)</label><input class="a-input" name="status" value="Deployed" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tags (comma separated)</label><input class="a-input" name="tags" placeholder="GaN SSPA, Cavity Filters, AESA" /></div>
      ${renderImageUploadField('image', 'Project Cover Photo', '', 'Hero hardware photo')}
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required></textarea></div>
    `, (data) => {
      const items = d.items || [];
      const tags = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      items.push({ id: 'proj-' + Date.now(), ...data, tags });
      d.items = items;
      ContentService.saveData('projects', d);
    });
  });

  document.querySelectorAll('.btn-edit-proj').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const proj = d.items[idx];
      openModal('Edit Project Card', `
        <div class="a-field"><label class="a-label">Project Title</label><input class="a-input" name="title" value="${proj.title}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Category</label><input class="a-input" name="category" value="${proj.category || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Client / Sector</label><input class="a-input" name="clientSector" value="${proj.clientSector || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Date / Timeline</label><input class="a-input" name="date" value="${proj.date || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Status</label><input class="a-input" name="status" value="${proj.status || ''}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tags (comma separated)</label><input class="a-input" name="tags" value="${(proj.tags || []).join(', ')}" /></div>
        ${renderImageUploadField('image', 'Project Cover Photo', proj.image || '', 'Hero hardware photo')}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="desc" required>${proj.desc || ''}</textarea></div>
      `, (data) => {
        const tags = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        d.items[idx] = { ...proj, ...data, tags };
        ContentService.saveData('projects', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-proj').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this project card?')) {
        d.items.splice(idx, 1);
        ContentService.saveData('projects', d);
        rerender();
        showToast('Project deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-proj').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.items = reorderArray(d.items, idx, targetIdx);
      ContentService.saveData('projects', d);
      rerender();
      showToast('Projects reordered!', 'success');
    });
  });
}

// ─── GALLERY PAGE EDITOR ─────────────────────────────────────────────────────
function renderGalleryPageEditor() {
  const d = ContentService.getData('gallery') || {};
  const items = d.items || [];

  return `
    <form id="a-page-form" style="margin-bottom:20px;">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Gallery Section Intro</h3><p>Page heading and gallery lead</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">Section Title</label><input class="a-input" name="heroTitle" value="${d.heroTitle || 'Hardware & Facility Gallery'}"></div>
          <div class="a-field"><label class="a-label">Section Subtitle</label><input class="a-input" name="heroSubtitle" value="${d.heroSubtitle || 'High-Reliability Components & Systems'}"></div>
          <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="heroLead">${d.heroLead || ''}</textarea></div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Header</button>
        </div>
      </div>
    </form>

    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>Hardware Gallery Items (${items.length})</h3>
          <p>Add, edit, delete, and reorder hardware photos and captions</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-gal-btn"><i class="fa-solid fa-plus"></i> Add Gallery Photo</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Reorder</th><th>Photo</th><th>Item Title</th><th>Category</th><th>Caption</th><th>Actions</th></tr></thead>
          <tbody>
            ${items.map((gal, idx) => {
              const img = ImageStorage.resolveImageUrl(gal.image);
              return `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-gal" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-gal" data-dir="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td>${img ? `<img src="${img}" class="a-img-preview" alt="Thumb" />` : '<span style="color:#94a3b8; font-size:0.75rem;">No image</span>'}</td>
                  <td><strong>${gal.title}</strong></td>
                  <td><span class="a-badge a-badge-blue">${gal.category || 'Component'}</span></td>
                  <td style="font-size:0.82rem; color:var(--a-muted); max-width:260px;">${gal.caption || '—'}</td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-gal" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-gal" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
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

function bindGalleryTabEvents() {
  const d = ContentService.getData('gallery') || {};

  document.getElementById('a-add-gal-btn')?.addEventListener('click', () => {
    openModal('Add Gallery Photo', `
      <div class="a-field"><label class="a-label">Item Title</label><input class="a-input" name="title" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Category (e.g. Semiconductors, Passives, Systems)</label><input class="a-input" name="category" value="Semiconductors" /></div>
      ${renderImageUploadField('image', 'Hardware Photo', '', 'Upload or select image')}
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Caption / Description</label><input class="a-input" name="caption" /></div>
    `, (data) => {
      const items = d.items || [];
      items.push({ id: 'gal-' + Date.now(), ...data });
      d.items = items;
      ContentService.saveData('gallery', d);
    });
  });

  document.querySelectorAll('.btn-edit-gal').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const gal = d.items[idx];
      openModal('Edit Gallery Photo', `
        <div class="a-field"><label class="a-label">Item Title</label><input class="a-input" name="title" value="${gal.title}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Category</label><input class="a-input" name="category" value="${gal.category || ''}" /></div>
        ${renderImageUploadField('image', 'Hardware Photo', gal.image || '', 'Upload or select image')}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Caption / Description</label><input class="a-input" name="caption" value="${gal.caption || ''}" /></div>
      `, (data) => {
        d.items[idx] = { ...gal, ...data };
        ContentService.saveData('gallery', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-gal').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this gallery photo?')) {
        d.items.splice(idx, 1);
        ContentService.saveData('gallery', d);
        rerender();
        showToast('Gallery photo deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-gal').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.items = reorderArray(d.items, idx, targetIdx);
      ContentService.saveData('gallery', d);
      rerender();
      showToast('Gallery reordered!', 'success');
    });
  });
}

// ─── TESTIMONIALS PAGE EDITOR ────────────────────────────────────────────────
function renderTestimonialsPageEditor() {
  const d = ContentService.getData('testimonials') || {};
  const items = d.items || [];

  return `
    <form id="a-page-form" style="margin-bottom:20px;">
      <div class="a-card">
        <div class="a-card-header"><div><h3>Testimonials Section Header</h3><p>Section title and endorsement lead</p></div></div>
        <div class="a-form-grid">
          <div class="a-field"><label class="a-label">Section Title</label><input class="a-input" name="heroTitle" value="${d.heroTitle || 'Trusted by Industry Leaders'}"></div>
          <div class="a-field"><label class="a-label">Section Subtitle</label><input class="a-input" name="heroSubtitle" value="${d.heroSubtitle || 'Client & Engineer Endorsements'}"></div>
          <div class="a-field span2"><label class="a-label">Lead Paragraph</label><textarea class="a-textarea" name="heroLead">${d.heroLead || ''}</textarea></div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Header</button>
        </div>
      </div>
    </form>

    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>Client Testimonial Cards (${items.length})</h3>
          <p>Add, edit, delete, and reorder scientist &amp; engineering endorsements</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-test-btn"><i class="fa-solid fa-plus"></i> Add Testimonial</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Reorder</th><th>Avatar</th><th>Client Name</th><th>Role &amp; Company</th><th>Stars</th><th>Industry Tag</th><th>Actions</th></tr></thead>
          <tbody>
            ${items.map((t, idx) => {
              const avatar = ImageStorage.resolveImageUrl(t.avatar);
              return `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-test" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-test" data-dir="down" data-idx="${idx}" ${idx === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td>${avatar ? `<img src="${avatar}" class="a-img-preview" alt="Avatar" style="width:40px; height:40px; border-radius:50%;" />` : '<div style="width:36px; height:36px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">' + (t.name ? t.name.substring(0,2).toUpperCase() : 'CL') + '</div>'}</td>
                  <td><strong>${t.name}</strong></td>
                  <td style="font-size:0.82rem; color:var(--a-muted);">${t.role} · ${t.company}</td>
                  <td><span style="color:#f59e0b;">${'★'.repeat(t.stars || 5)}</span></td>
                  <td><span class="a-badge a-badge-blue">${t.industry || 'Defense'}</span></td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-test" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-test" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
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

function bindTestimonialsTabEvents() {
  const d = ContentService.getData('testimonials') || {};

  document.getElementById('a-add-test-btn')?.addEventListener('click', () => {
    openModal('Add Testimonial Card', `
      <div class="a-field"><label class="a-label">Client Name</label><input class="a-input" name="name" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Role / Title</label><input class="a-input" name="role" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Organization / Company</label><input class="a-input" name="company" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Industry Tag (e.g. Radar & Defense EW)</label><input class="a-input" name="industry" value="Defense & Space" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Rating Stars (1-5)</label><input class="a-input" type="number" min="1" max="5" name="stars" value="5" /></div>
      ${renderImageUploadField('avatar', 'Client / OEM Avatar Photo', '', 'Upload avatar or logo')}
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Quote Endorsement</label><textarea class="a-textarea" name="quote" required></textarea></div>
    `, (data) => {
      const items = d.items || [];
      items.push({ id: 'test-' + Date.now(), ...data, stars: parseInt(data.stars, 10) || 5 });
      d.items = items;
      ContentService.saveData('testimonials', d);
    });
  });

  document.querySelectorAll('.btn-edit-test').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const t = d.items[idx];
      openModal('Edit Testimonial Card', `
        <div class="a-field"><label class="a-label">Client Name</label><input class="a-input" name="name" value="${t.name}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Role / Title</label><input class="a-input" name="role" value="${t.role || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Organization / Company</label><input class="a-input" name="company" value="${t.company || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Industry Tag</label><input class="a-input" name="industry" value="${t.industry || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Rating Stars (1-5)</label><input class="a-input" type="number" min="1" max="5" name="stars" value="${t.stars || 5}" /></div>
        ${renderImageUploadField('avatar', 'Client / OEM Avatar Photo', t.avatar || '', 'Upload avatar or logo')}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Quote Endorsement</label><textarea class="a-textarea" name="quote" required>${t.quote || ''}</textarea></div>
      `, (data) => {
        d.items[idx] = { ...t, ...data, stars: parseInt(data.stars, 10) || 5 };
        ContentService.saveData('testimonials', d);
      });
    });
  });

  document.querySelectorAll('.btn-del-test').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this testimonial?')) {
        d.items.splice(idx, 1);
        ContentService.saveData('testimonials', d);
        rerender();
        showToast('Testimonial deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-test').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      d.items = reorderArray(d.items, idx, targetIdx);
      ContentService.saveData('testimonials', d);
      rerender();
      showToast('Testimonials reordered!', 'success');
    });
  });
}

// ─── CONTACT PAGE EDITOR ─────────────────────────────────────────────────────
function renderContactPageEditor() {
  const c = ContentService.getData('contact') || {};
  const presets = c.presets || [];
  const careers = c.careers || {};
  const benefits = careers.benefits || [];
  const positions = careers.positions || [];
  const experienceLevels = careers.experienceLevels || [];
  const noticeOptions = careers.noticeOptions || [];

  return `
    <div class="a-subtabs-nav">
      <button type="button" class="a-subtab-btn ${currentSubTab === 'fields' ? 'active' : ''}" data-subtab="fields"><i class="fa-solid fa-building"></i> Offices &amp; Contact Info</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'presets' ? 'active' : ''}" data-subtab="presets"><i class="fa-solid fa-bolt"></i> Requirement Presets (${presets.length})</button>
      <button type="button" class="a-subtab-btn ${currentSubTab === 'careers' ? 'active' : ''}" data-subtab="careers"><i class="fa-solid fa-briefcase"></i> Careers &amp; Recruiting Management</button>
    </div>

    ${currentSubTab === 'fields' ? `
      <form id="a-page-form">
        <div class="a-card">
          <div class="a-card-header"><div><h3>Contact Page Headers</h3><p>RFQ and career tab headings</p></div></div>
          <div class="a-form-grid">
            <div class="a-field"><label class="a-label">Inquiry Hero Title</label><input class="a-input" name="heroTitle" value="${c.heroTitle || ''}"></div>
            <div class="a-field"><label class="a-label">Careers Hero Title</label><input class="a-input" name="careersTitle" value="${c.careersTitle || ''}"></div>
            <div class="a-field span2"><label class="a-label">Inquiry Lead</label><textarea class="a-textarea" name="heroLead">${c.heroLead || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Careers Lead</label><textarea class="a-textarea" name="careersLead">${c.careersLead || ''}</textarea></div>
          </div>
        </div>

        <div class="a-card">
          <div class="a-card-header"><div><h3>Global Office Locations</h3><p>Displayed in contact page and site footer</p></div></div>
          <div class="a-form-grid">
            <div class="a-section-divider span2">India Office (Headquarters)</div>
            <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="indiaOfficeName" value="${c.indiaOfficeName || ''}"></div>
            <div class="a-field"><label class="a-label">Telephone</label><input class="a-input" name="indiaPhone" value="${c.indiaPhone || ''}"></div>
            <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="indiaAddress">${c.indiaAddress || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Email</label><input class="a-input" name="indiaEmail" value="${c.indiaEmail || ''}"></div>

            <div class="a-section-divider span2">Singapore Office</div>
            <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="singaporeOfficeName" value="${c.singaporeOfficeName || ''}"></div>
            <div class="a-field"><label class="a-label">Email</label><input class="a-input" name="singaporeEmail" value="${c.singaporeEmail || ''}"></div>
            <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="singaporeAddress">${c.singaporeAddress || ''}</textarea></div>

            <div class="a-section-divider span2">USA Office</div>
            <div class="a-field"><label class="a-label">Office Name</label><input class="a-input" name="usaOfficeName" value="${c.usaOfficeName || ''}"></div>
            <div class="a-field"><label class="a-label">Telephone</label><input class="a-input" name="usaPhone" value="${c.usaPhone || ''}"></div>
            <div class="a-field span2"><label class="a-label">Address</label><textarea class="a-textarea" name="usaAddress">${c.usaAddress || ''}</textarea></div>
            <div class="a-field span2"><label class="a-label">Email</label><input class="a-input" name="usaEmail" value="${c.usaEmail || ''}"></div>

            <div class="a-section-divider span2">Operating Hours</div>
            <div class="a-field"><label class="a-label">Weekday Hours</label><input class="a-input" name="hoursWeekday" value="${c.hoursWeekday || ''}"></div>
            <div class="a-field"><label class="a-label">Weekend Hours</label><input class="a-input" name="hoursWeekend" value="${c.hoursWeekend || ''}"></div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit" class="a-btn a-btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Contact Info</button>
        </div>
      </form>
    ` : ''}

    ${currentSubTab === 'presets' ? `
      <div class="a-cards-box">
        <div class="a-cards-box-header">
          <div>
            <h3>Quick Requirement Presets (${presets.length})</h3>
            <p>One-click inquiry messages displayed on Home and Contact forms</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-preset-btn"><i class="fa-solid fa-plus"></i> Add Preset</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Preset Message</th><th>Actions</th></tr></thead>
            <tbody>
              ${presets.map((p, idx) => `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-preset" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-preset" data-dir="down" data-idx="${idx}" ${idx === presets.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td><strong>${p}</strong></td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-preset" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-preset" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    ${currentSubTab === 'careers' ? `
      <!-- Card 1: Tab Navigation, Hero & Badges -->
      <form id="a-careers-hero-form">
        <div class="a-card">
          <div class="a-card-header">
            <div>
              <h3>Hero, Header Tabs &amp; Hiring Badges</h3>
              <p>Customize tab buttons, navigation badges, and hero titles on Contact &amp; Careers page</p>
            </div>
            <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Header &amp; Hero</button>
          </div>
          <div class="a-form-grid">
            <div class="a-field">
              <label class="a-label">Careers Tab Button Label</label>
              <input class="a-input" name="tabLabelCareers" value="${careers.tabLabelCareers || 'Careers &amp; Recruiting'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Sales Tab Button Label</label>
              <input class="a-input" name="tabLabelSales" value="${careers.tabLabelSales || 'Sales &amp; RFQ Inquiry'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Breadcrumb Text</label>
              <input class="a-input" name="breadcrumbCareers" value="${careers.breadcrumbCareers || 'Careers &amp; Recruiting'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Hero Eyebrow Text</label>
              <input class="a-input" name="eyebrowCareers" value="${careers.eyebrowCareers || 'ICON TALENT ACQUISITION'}">
            </div>
            <div class="a-field span2">
              <label class="a-label">Hero Main Title</label>
              <input class="a-input" name="careersTitle" value="${careers.careersTitle || ''}" required>
            </div>
            <div class="a-field span2">
              <label class="a-label">Hero Lead Paragraph / Subtitle</label>
              <textarea class="a-textarea" name="careersLead" rows="2" required>${careers.careersLead || ''}</textarea>
            </div>
            <div class="a-field">
              <label class="a-checkbox-row" style="margin-top:6px;">
                <input type="checkbox" name="showHiringBadge" ${careers.showHiringBadge !== false ? 'checked' : ''}>
                <span>Display "We're Hiring" Badge on Tab</span>
              </label>
            </div>
            <div class="a-field">
              <label class="a-label">Hiring Badge Text</label>
              <input class="a-input" name="hiringBadgeText" value="${careers.hiringBadgeText || "We're Hiring"}">
            </div>
            ${renderImageUploadField('careersHeroImage', 'Careers Hero / Team Photo (Optional)', careers.careersHeroImage || '', 'Upload photo of engineering team, lab, or office')}
          </div>
        </div>
      </form>

      <!-- Card 2: Company Intro & Benefits -->
      <form id="a-careers-intro-form" style="margin-top:20px;">
        <div class="a-card">
          <div class="a-card-header">
            <div>
              <h3>"Why Build Your Career at ICON?" Introduction</h3>
              <p>Introductory copy displayed in the left column on the Careers tab</p>
            </div>
            <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Intro Copy</button>
          </div>
          <div class="a-form-grid">
            <div class="a-field">
              <label class="a-label">Intro Heading</label>
              <input class="a-input" name="introTitle" value="${careers.introTitle || 'Why Build Your Career at ICON?'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Intro Subtitle / Tagline</label>
              <input class="a-input" name="introSubtitle" value="${careers.introSubtitle || 'RF &amp; MICROWAVE EXCELLENCE'}">
            </div>
            <div class="a-field">
              <label class="a-label">Header Icon (FontAwesome class)</label>
              <input class="a-input" name="introIcon" value="${careers.introIcon || 'fa-solid fa-users'}">
            </div>
            <div class="a-field span2">
              <label class="a-label">Intro Description Paragraph</label>
              <textarea class="a-textarea" name="introDescription" rows="3" required>${careers.introDescription || ''}</textarea>
            </div>
          </div>
        </div>
      </form>

      <!-- Benefits Table -->
      <div class="a-cards-box" style="margin-top:20px;">
        <div class="a-cards-box-header">
          <div>
            <h3>Why Join Us Benefits &amp; Perks (${benefits.length})</h3>
            <p>Reorderable highlight cards showcasing engineering culture, labs, and OEM access</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-benefit-btn"><i class="fa-solid fa-plus"></i> Add Benefit</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Icon</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              ${benefits.map((b, idx) => `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-benefit" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-benefit" data-dir="down" data-idx="${idx}" ${idx === benefits.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td>
                    <div class="a-icon-preview-badge" style="color:${b.iconColor || '#3b82f6'};">
                      <i class="${b.icon || 'fa-solid fa-star'}"></i>
                    </div>
                  </td>
                  <td><strong>${b.title}</strong></td>
                  <td style="font-size:0.8rem;color:var(--a-muted);max-width:320px;">${b.description || ''}</td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-benefit" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-benefit" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Card 3: Application Form Fields, Validation & Upload Rules -->
      <form id="a-careers-form-config" style="margin-top:20px;">
        <div class="a-card">
          <div class="a-card-header">
            <div>
              <h3>Application Form Header &amp; Fields Configuration</h3>
              <p>Customize form title, badges, labels, placeholders, and required validation rules</p>
            </div>
            <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Form Settings</button>
          </div>
          
          <div class="a-form-grid">
            <div class="a-section-divider span2">Top Form Banner &amp; Heading</div>
            <div class="a-field">
              <label class="a-checkbox-row" style="margin-top:6px;">
                <input type="checkbox" name="showFormBadge" ${careers.showFormBadge !== false ? 'checked' : ''}>
                <span>Display Talent Acquisition Badge</span>
              </label>
            </div>
            <div class="a-field">
              <label class="a-label">Form Badge Text</label>
              <input class="a-input" name="formBadgeText" value="${careers.formBadgeText || 'Talent Acquisition · Bengaluru &amp; Pan-India'}">
            </div>
            <div class="a-field">
              <label class="a-label">Form Badge Icon (FontAwesome class)</label>
              <input class="a-input" name="formBadgeIcon" value="${careers.formBadgeIcon || 'fa-solid fa-briefcase'}">
            </div>
            <div class="a-field">
              <label class="a-label">Form Main Heading</label>
              <input class="a-input" name="formTitle" value="${careers.formTitle || 'Apply for an Engineering Career'}" required>
            </div>
            <div class="a-field span2">
              <label class="a-label">Form Subtitle / Instructions</label>
              <textarea class="a-textarea" name="formSubtitle" rows="2" required>${careers.formSubtitle || ''}</textarea>
            </div>

            <div class="a-section-divider span2">Field Labels, Placeholders &amp; Required Toggles</div>
            
            <!-- Full Name -->
            <div class="a-field">
              <label class="a-label">Full Name Field Label</label>
              <input class="a-input" name="nameLabel" value="${careers.nameLabel || 'Full Name *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Full Name Placeholder</label>
              <input class="a-input" name="namePlaceholder" value="${careers.namePlaceholder || 'e.g. Vikram Sharma'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="nameRequired" ${careers.nameRequired !== false ? 'checked' : ''}>
                <span>Full Name is Required</span>
              </label>
            </div>

            <!-- Email Address -->
            <div class="a-field">
              <label class="a-label">Email Field Label</label>
              <input class="a-input" name="emailLabel" value="${careers.emailLabel || 'Email Address *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Email Placeholder</label>
              <input class="a-input" name="emailPlaceholder" value="${careers.emailPlaceholder || 'vikram.sharma@example.com'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="emailRequired" ${careers.emailRequired !== false ? 'checked' : ''}>
                <span>Email Address is Required</span>
              </label>
            </div>

            <!-- Position -->
            <div class="a-field">
              <label class="a-label">Position Dropdown Label</label>
              <input class="a-input" name="positionLabel" value="${careers.positionLabel || 'Position *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Position Default Option Text</label>
              <input class="a-input" name="positionPlaceholder" value="${careers.positionPlaceholder || 'Select Position...'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="positionRequired" ${careers.positionRequired !== false ? 'checked' : ''}>
                <span>Position Selection is Required</span>
              </label>
            </div>

            <!-- Phone -->
            <div class="a-field">
              <label class="a-label">Phone Field Label</label>
              <input class="a-input" name="phoneLabel" value="${careers.phoneLabel || 'Phone / Mobile Number *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Phone Placeholder</label>
              <input class="a-input" name="phonePlaceholder" value="${careers.phonePlaceholder || '+91 98765 43210'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="phoneRequired" ${careers.phoneRequired !== false ? 'checked' : ''}>
                <span>Phone / Mobile Number is Required</span>
              </label>
            </div>

            <!-- Location / City -->
            <div class="a-field">
              <label class="a-label">Location Field Label</label>
              <input class="a-input" name="cityLabel" value="${careers.cityLabel || 'Current Location / City *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Location Placeholder</label>
              <input class="a-input" name="cityPlaceholder" value="${careers.cityPlaceholder || 'e.g. Bengaluru, Hyderabad, Pune, Chennai'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="cityRequired" ${careers.cityRequired !== false ? 'checked' : ''}>
                <span>Location / City is Required</span>
              </label>
            </div>

            <!-- Experience Level -->
            <div class="a-field">
              <label class="a-label">Experience Dropdown Label</label>
              <input class="a-input" name="experienceLabel" value="${careers.experienceLabel || 'Total Experience *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Experience Default Option Text</label>
              <input class="a-input" name="experiencePlaceholder" value="${careers.experiencePlaceholder || 'Select experience level...'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="experienceRequired" ${careers.experienceRequired !== false ? 'checked' : ''}>
                <span>Experience Level is Required</span>
              </label>
            </div>

            <!-- Current Company -->
            <div class="a-field">
              <label class="a-label">Company / University Label</label>
              <input class="a-input" name="organizationLabel" value="${careers.organizationLabel || 'Current Company or University *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Company / University Placeholder</label>
              <input class="a-input" name="organizationPlaceholder" value="${careers.organizationPlaceholder || 'e.g. BEL, DRDO, Astra Microwave, IISc, IIT'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="organizationRequired" ${careers.organizationRequired !== false ? 'checked' : ''}>
                <span>Current Company or University is Required</span>
              </label>
            </div>

            <!-- Notice Period -->
            <div class="a-field">
              <label class="a-label">Notice Period Field Label</label>
              <input class="a-input" name="noticeLabel" value="${careers.noticeLabel || 'Notice Period / Earliest Availability *'}" required>
            </div>
            <div class="a-field">
              <label class="a-checkbox-row" style="margin-top:24px;">
                <input type="checkbox" name="noticeRequired" ${careers.noticeRequired !== false ? 'checked' : ''}>
                <span>Notice Period is Required</span>
              </label>
            </div>

            <!-- Technical Skills -->
            <div class="a-field">
              <label class="a-label">Skills Field Label</label>
              <input class="a-input" name="skillsLabel" value="${careers.skillsLabel || 'Key Technical Skills &amp; RF EDA Tools *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Skills Field Placeholder</label>
              <input class="a-input" name="skillsPlaceholder" value="${careers.skillsPlaceholder || 'e.g. Keysight ADS, Ansys HFSS, CST Microwave Studio...'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="skillsRequired" ${careers.skillsRequired !== false ? 'checked' : ''}>
                <span>Technical Skills Field is Required</span>
              </label>
            </div>

            <!-- LinkedIn -->
            <div class="a-field">
              <label class="a-label">LinkedIn Field Label</label>
              <input class="a-input" name="linkedinLabel" value="${careers.linkedinLabel || 'LinkedIn Profile or Online Portfolio'}">
            </div>
            <div class="a-field">
              <label class="a-label">LinkedIn Placeholder</label>
              <input class="a-input" name="linkedinPlaceholder" value="${careers.linkedinPlaceholder || 'https://linkedin.com/in/username'}">
            </div>
            <div class="a-field">
              <label class="a-checkbox-row">
                <input type="checkbox" name="showLinkedin" ${careers.showLinkedin !== false ? 'checked' : ''}>
                <span>Display LinkedIn / Portfolio Field</span>
              </label>
            </div>
            <div class="a-field">
              <label class="a-checkbox-row">
                <input type="checkbox" name="linkedinRequired" ${careers.linkedinRequired ? 'checked' : ''}>
                <span>LinkedIn URL is Required</span>
              </label>
            </div>

            <!-- Statement -->
            <div class="a-field span2">
              <label class="a-label">Candidate Statement Field Label</label>
              <input class="a-input" name="statementLabel" value="${careers.statementLabel || 'Candidate Statement / Why ICON Electromatic? *'}" required>
            </div>
            <div class="a-field span2">
              <label class="a-label">Statement Placeholder</label>
              <textarea class="a-textarea" name="statementPlaceholder" rows="2">${careers.statementPlaceholder || ''}</textarea>
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="statementRequired" ${careers.statementRequired !== false ? 'checked' : ''}>
                <span>Candidate Statement is Required</span>
              </label>
            </div>

            <div class="a-section-divider span2">Resume Upload Controls &amp; Settings</div>
            <div class="a-field">
              <label class="a-label">Resume Upload Label</label>
              <input class="a-input" name="resumeLabel" value="${careers.resumeLabel || 'Resume / Curriculum Vitae (PDF / DOCX) *'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Dropzone Help / Instruction Text</label>
              <input class="a-input" name="resumeHelpText" value="${careers.resumeHelpText || 'Click or drop resume file (PDF/DOCX, max 10MB)'}">
            </div>
            <div class="a-field">
              <label class="a-label">Accepted File Types (Comma separated)</label>
              <input class="a-input" name="resumeAcceptedExtensions" value="${careers.resumeAcceptedExtensions || '.pdf,.doc,.docx'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Max Allowed File Size (Megabytes)</label>
              <input class="a-input" type="number" min="1" max="100" name="resumeMaxSizeMb" value="${careers.resumeMaxSizeMb || 10}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Resume Format Error Message (Use {types})</label>
              <input class="a-input" name="resumeFormatErrorMessage" value="${careers.resumeFormatErrorMessage || 'Invalid file format. Please upload an accepted file type: {types}'}">
            </div>
            <div class="a-field">
              <label class="a-label">Resume Size Limit Error Message (Use {size} and {max})</label>
              <input class="a-input" name="resumeSizeErrorMessage" value="${careers.resumeSizeErrorMessage || 'File size ({size} MB) exceeds the maximum allowed limit of {max} MB.'}">
            </div>
            <div class="a-field span2">
              <label class="a-checkbox-row">
                <input type="checkbox" name="resumeRequired" ${careers.resumeRequired !== false ? 'checked' : ''}>
                <span>Resume File Attachment is Required</span>
              </label>
            </div>

            <div class="a-section-divider span2">Submit Button Configuration</div>
            <div class="a-field">
              <label class="a-label">Submit Button Text</label>
              <input class="a-input" name="submitButtonText" value="${careers.submitButtonText || 'Submit Engineering Application'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Submit Button Icon (FontAwesome class)</label>
              <input class="a-input" name="submitButtonIcon" value="${careers.submitButtonIcon || 'fa-solid fa-briefcase'}">
            </div>
          </div>
        </div>
      </form>

      <!-- Card 4: Open Job Positions -->
      <div class="a-cards-box" style="margin-top:20px;">
        <div class="a-cards-box-header">
          <div>
            <h3>Open Engineering Positions (${positions.length})</h3>
            <p>Manage job titles in the Position dropdown on the public application form</p>
          </div>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-position-btn"><i class="fa-solid fa-plus"></i> Add Position</button>
        </div>
        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr><th>Reorder</th><th>Position Title</th><th>Actions</th></tr></thead>
            <tbody>
              ${positions.map((pos, idx) => `
                <tr>
                  <td style="width:90px;">
                    <div class="a-reorder-group">
                      <button class="a-btn-reorder btn-move-pos" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                      <button class="a-btn-reorder btn-move-pos" data-dir="down" data-idx="${idx}" ${idx === positions.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                    </div>
                  </td>
                  <td><strong>${pos}</strong></td>
                  <td>
                    <button class="a-btn a-btn-outline a-btn-sm btn-edit-pos" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="a-btn a-btn-danger a-btn-sm btn-del-pos" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Card 5: Experience Levels & Notice Periods -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-top:20px;">
        <!-- Experience Levels -->
        <div class="a-cards-box">
          <div class="a-cards-box-header">
            <div>
              <h3>Experience Levels (${experienceLevels.length})</h3>
              <p>Seniority options in application dropdown</p>
            </div>
            <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-exp-btn"><i class="fa-solid fa-plus"></i> Add Level</button>
          </div>
          <div class="a-table-wrap">
            <table class="a-table">
              <thead><tr><th>Reorder</th><th>Experience Bracket</th><th>Actions</th></tr></thead>
              <tbody>
                ${experienceLevels.map((exp, idx) => `
                  <tr>
                    <td style="width:90px;">
                      <div class="a-reorder-group">
                        <button class="a-btn-reorder btn-move-exp" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="a-btn-reorder btn-move-exp" data-dir="down" data-idx="${idx}" ${idx === experienceLevels.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                      </div>
                    </td>
                    <td><strong>${exp}</strong></td>
                    <td>
                      <button class="a-btn a-btn-outline a-btn-sm btn-edit-exp" data-idx="${idx}"><i class="fa-solid fa-pen"></i></button>
                      <button class="a-btn a-btn-danger a-btn-sm btn-del-exp" data-idx="${idx}" style="margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notice Periods -->
        <div class="a-cards-box">
          <div class="a-cards-box-header">
            <div>
              <h3>Notice Period Options (${noticeOptions.length})</h3>
              <p>Candidate availability window options</p>
            </div>
            <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-add-notice-btn"><i class="fa-solid fa-plus"></i> Add Option</button>
          </div>
          <div class="a-table-wrap">
            <table class="a-table">
              <thead><tr><th>Reorder</th><th>Availability Window</th><th>Actions</th></tr></thead>
              <tbody>
                ${noticeOptions.map((notc, idx) => `
                  <tr>
                    <td style="width:90px;">
                      <div class="a-reorder-group">
                        <button class="a-btn-reorder btn-move-notice" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="a-btn-reorder btn-move-notice" data-dir="down" data-idx="${idx}" ${idx === noticeOptions.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                      </div>
                    </td>
                    <td><strong>${notc}</strong></td>
                    <td>
                      <button class="a-btn a-btn-outline a-btn-sm btn-edit-notice" data-idx="${idx}"><i class="fa-solid fa-pen"></i></button>
                      <button class="a-btn a-btn-danger a-btn-sm btn-del-notice" data-idx="${idx}" style="margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Card 6: Application Confirmation & Success Message -->
      <form id="a-careers-success-form" style="margin-top:20px;">
        <div class="a-card">
          <div class="a-card-header">
            <div>
              <h3>Submission Success Screen &amp; Candidate Messages</h3>
              <p>Customize confirmation modal, candidate reference prefix, and next steps contact instructions</p>
            </div>
            <button type="submit" class="a-btn a-btn-primary a-btn-sm"><i class="fa-solid fa-floppy-disk"></i> Save Confirmation Settings</button>
          </div>
          <div class="a-form-grid">
            <div class="a-field">
              <label class="a-label">Success Screen Main Title</label>
              <input class="a-input" name="successTitle" value="${careers.successTitle || 'Application Received!'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Greeting Template (Use {name})</label>
              <input class="a-input" name="successSubtitle" value="${careers.successSubtitle || 'Thank you, {name}.'}" required>
            </div>
            <div class="a-field span2">
              <label class="a-label">Confirmation Body Message (Use {name} and {position})</label>
              <textarea class="a-textarea" name="successMessage" rows="2" required>${careers.successMessage || ''}</textarea>
            </div>
            <div class="a-field">
              <label class="a-label">Candidate Application ID Prefix</label>
              <input class="a-input" name="candidateIdPrefix" value="${careers.candidateIdPrefix || 'ICON-CAREER-'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Talent Acquisition Email</label>
              <input class="a-input" name="careersEmail" value="${careers.careersEmail || 'careers@iconelectromatic.com'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Next Steps Section Title</label>
              <input class="a-input" name="nextStepsTitle" value="${careers.nextStepsTitle || 'Next Steps:'}" required>
            </div>
            <div class="a-field">
              <label class="a-label">Submit Another Button Text</label>
              <input class="a-input" name="resetButtonText" value="${careers.resetButtonText || 'Submit Another Application'}" required>
            </div>
            <div class="a-field span2">
              <label class="a-label">Next Steps Guidance Text</label>
              <textarea class="a-textarea" name="nextStepsText" rows="3" required>${careers.nextStepsText || ''}</textarea>
            </div>
            <div class="a-field span2">
              <label class="a-label">Form Validation Error Message (Shown if required fields are missing)</label>
              <input class="a-input" name="validationErrorMessage" value="${careers.validationErrorMessage || 'Please complete all required fields and attach your resume before submitting.'}">
            </div>
            <div class="a-field span2">
              <label class="a-label">General Submission Error Message</label>
              <input class="a-input" name="errorMessage" value="${careers.errorMessage || 'An error occurred while submitting your application. Please check your connection and try again.'}">
            </div>
          </div>
        </div>
      </form>
    ` : ''}
  `;
}

function bindContactTabEvents() {
  document.querySelectorAll('.a-subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubTab = btn.getAttribute('data-subtab');
      rerender();
    });
  });

  const c = ContentService.getData('contact') || {};
  const careers = c.careers || {};

  // Presets Handlers
  document.getElementById('a-add-preset-btn')?.addEventListener('click', () => {
    openModal('Add Quick Requirement Preset', `
      <div class="a-field"><label class="a-label">Preset Message Text</label><input class="a-input" name="text" placeholder="e.g. Inquiring about High Power GaN Device and Beamforming IC." required /></div>
    `, (data) => {
      const presets = c.presets || [];
      presets.push(data.text);
      c.presets = presets;
      ContentService.saveData('contact', c);
    });
  });

  document.querySelectorAll('.btn-edit-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const text = c.presets[idx];
      openModal('Edit Requirement Preset', `
        <div class="a-field"><label class="a-label">Preset Message Text</label><input class="a-input" name="text" value="${text}" required /></div>
      `, (data) => {
        c.presets[idx] = data.text;
        ContentService.saveData('contact', c);
      });
    });
  });

  document.querySelectorAll('.btn-del-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this preset?')) {
        c.presets.splice(idx, 1);
        ContentService.saveData('contact', c);
        rerender();
        showToast('Preset deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      c.presets = reorderArray(c.presets, idx, targetIdx);
      ContentService.saveData('contact', c);
      rerender();
      showToast('Presets reordered!', 'success');
    });
  });

  // ─── Careers Forms & Action Handlers ───
  function handleCareersFormSave(formId, processFormData) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const fd = new FormData(form);
      const updated = { ...currentCareers };
      fd.forEach((v, k) => { updated[k] = v; });
      if (processFormData) processFormData(form, updated);
      currentContact.careers = updated;
      if (updated.careersTitle) currentContact.careersTitle = updated.careersTitle;
      if (updated.careersLead) currentContact.careersLead = updated.careersLead;
      ContentService.saveData('contact', currentContact);
      rerender();
      showToast('Careers settings saved successfully!', 'success');
    });
  }

  handleCareersFormSave('a-careers-hero-form', (form, updated) => {
    updated.showHiringBadge = form.querySelector('[name="showHiringBadge"]')?.checked || false;
  });

  handleCareersFormSave('a-careers-intro-form');

  handleCareersFormSave('a-careers-form-config', (form, updated) => {
    updated.showFormBadge = form.querySelector('[name="showFormBadge"]')?.checked || false;
    updated.nameRequired = form.querySelector('[name="nameRequired"]')?.checked || false;
    updated.emailRequired = form.querySelector('[name="emailRequired"]')?.checked || false;
    updated.positionRequired = form.querySelector('[name="positionRequired"]')?.checked || false;
    updated.phoneRequired = form.querySelector('[name="phoneRequired"]')?.checked || false;
    updated.cityRequired = form.querySelector('[name="cityRequired"]')?.checked || false;
    updated.experienceRequired = form.querySelector('[name="experienceRequired"]')?.checked || false;
    updated.organizationRequired = form.querySelector('[name="organizationRequired"]')?.checked || false;
    updated.noticeRequired = form.querySelector('[name="noticeRequired"]')?.checked || false;
    updated.skillsRequired = form.querySelector('[name="skillsRequired"]')?.checked || false;
    updated.showLinkedin = form.querySelector('[name="showLinkedin"]')?.checked || false;
    updated.linkedinRequired = form.querySelector('[name="linkedinRequired"]')?.checked || false;
    updated.statementRequired = form.querySelector('[name="statementRequired"]')?.checked || false;
    updated.resumeRequired = form.querySelector('[name="resumeRequired"]')?.checked || false;
    updated.resumeMaxSizeMb = Number(updated.resumeMaxSizeMb) || 10;
  });

  handleCareersFormSave('a-careers-success-form');

  // Benefits CRUD
  document.getElementById('a-add-benefit-btn')?.addEventListener('click', () => {
    openModal('Add Why Join Benefit Card', `
      <div class="a-field"><label class="a-label">Benefit Title</label><input class="a-input" name="title" placeholder="e.g. Cutting-Edge mmWave Lab" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon Class (FontAwesome)</label><input class="a-input" name="icon" value="fa-solid fa-microchip" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon Color (Hex / CSS)</label><input class="a-input" name="iconColor" value="#3b82f6" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Benefit Description</label><textarea class="a-textarea" name="description" rows="3" required></textarea></div>
    `, (data) => {
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const list = currentCareers.benefits || [];
      list.push({ id: 'ben-' + Date.now(), ...data });
      currentCareers.benefits = list;
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
    });
  });

  document.querySelectorAll('.btn-edit-benefit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const b = (currentCareers.benefits || [])[idx];
      if (!b) return;

      openModal('Edit Why Join Benefit Card', `
        <div class="a-field"><label class="a-label">Benefit Title</label><input class="a-input" name="title" value="${b.title || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon Class (FontAwesome)</label><input class="a-input" name="icon" value="${b.icon || 'fa-solid fa-microchip'}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Icon Color (Hex / CSS)</label><input class="a-input" name="iconColor" value="${b.iconColor || '#3b82f6'}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Benefit Description</label><textarea class="a-textarea" name="description" rows="3" required>${b.description || ''}</textarea></div>
      `, (data) => {
        currentCareers.benefits[idx] = { ...b, ...data };
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
      });
    });
  });

  document.querySelectorAll('.btn-del-benefit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      if (confirm('Delete this benefit card?')) {
        (currentCareers.benefits || []).splice(idx, 1);
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
        rerender();
        showToast('Benefit card deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-benefit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      currentCareers.benefits = reorderArray(currentCareers.benefits || [], idx, targetIdx);
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
      rerender();
      showToast('Benefits reordered!', 'success');
    });
  });

  // Positions CRUD
  document.getElementById('a-add-position-btn')?.addEventListener('click', () => {
    openModal('Add Open Engineering Position', `
      <div class="a-field"><label class="a-label">Position Title</label><input class="a-input" name="title" placeholder="e.g. Senior mmWave Antenna Engineer" required /></div>
    `, (data) => {
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const list = currentCareers.positions || [];
      list.push(data.title.trim());
      currentCareers.positions = list;
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
    });
  });

  document.querySelectorAll('.btn-edit-pos').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const currentPos = (currentCareers.positions || [])[idx];

      openModal('Edit Engineering Position', `
        <div class="a-field"><label class="a-label">Position Title</label><input class="a-input" name="title" value="${currentPos || ''}" required /></div>
      `, (data) => {
        currentCareers.positions[idx] = data.title.trim();
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
      });
    });
  });

  document.querySelectorAll('.btn-del-pos').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      if (confirm('Delete this position?')) {
        (currentCareers.positions || []).splice(idx, 1);
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
        rerender();
        showToast('Position deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-pos').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      currentCareers.positions = reorderArray(currentCareers.positions || [], idx, targetIdx);
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
      rerender();
      showToast('Positions reordered!', 'success');
    });
  });

  // Experience Levels CRUD
  document.getElementById('a-add-exp-btn')?.addEventListener('click', () => {
    openModal('Add Experience Level Option', `
      <div class="a-field"><label class="a-label">Experience Bracket Text</label><input class="a-input" name="level" placeholder="e.g. 10+ Years (Chief Technical Officer)" required /></div>
    `, (data) => {
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const list = currentCareers.experienceLevels || [];
      list.push(data.level.trim());
      currentCareers.experienceLevels = list;
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
    });
  });

  document.querySelectorAll('.btn-edit-exp').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const currentExp = (currentCareers.experienceLevels || [])[idx];

      openModal('Edit Experience Level Option', `
        <div class="a-field"><label class="a-label">Experience Bracket Text</label><input class="a-input" name="level" value="${currentExp || ''}" required /></div>
      `, (data) => {
        currentCareers.experienceLevels[idx] = data.level.trim();
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
      });
    });
  });

  document.querySelectorAll('.btn-del-exp').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      if (confirm('Delete this experience level?')) {
        (currentCareers.experienceLevels || []).splice(idx, 1);
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
        rerender();
        showToast('Experience level deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-exp').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      currentCareers.experienceLevels = reorderArray(currentCareers.experienceLevels || [], idx, targetIdx);
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
      rerender();
      showToast('Experience levels reordered!', 'success');
    });
  });

  // Notice Period CRUD
  document.getElementById('a-add-notice-btn')?.addEventListener('click', () => {
    openModal('Add Notice Period Option', `
      <div class="a-field"><label class="a-label">Notice Period Text</label><input class="a-input" name="notice" placeholder="e.g. 45 Days" required /></div>
    `, (data) => {
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const list = currentCareers.noticeOptions || [];
      list.push(data.notice.trim());
      currentCareers.noticeOptions = list;
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
    });
  });

  document.querySelectorAll('.btn-edit-notice').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      const currentNotc = (currentCareers.noticeOptions || [])[idx];

      openModal('Edit Notice Period Option', `
        <div class="a-field"><label class="a-label">Notice Period Text</label><input class="a-input" name="notice" value="${currentNotc || ''}" required /></div>
      `, (data) => {
        currentCareers.noticeOptions[idx] = data.notice.trim();
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
      });
    });
  });

  document.querySelectorAll('.btn-del-notice').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      if (confirm('Delete this notice period option?')) {
        (currentCareers.noticeOptions || []).splice(idx, 1);
        currentContact.careers = currentCareers;
        ContentService.saveData('contact', currentContact);
        rerender();
        showToast('Notice option deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-notice').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const currentContact = ContentService.getData('contact') || {};
      const currentCareers = currentContact.careers || {};
      currentCareers.noticeOptions = reorderArray(currentCareers.noticeOptions || [], idx, targetIdx);
      currentContact.careers = currentCareers;
      ContentService.saveData('contact', currentContact);
      rerender();
      showToast('Notice options reordered!', 'success');
    });
  });
}

// ─── PRODUCTS / OEMS TAB ─────────────────────────────────────────────────────
const expandedOemIds = new Set();
let catalogSearchQuery = '';

function renderProductsTab() {
  const oems = ContentService.getData('products') || [];

  const totalOems = oems.length;
  const visibleOemsCount = oems.filter(o => o.visible !== false).length;
  let totalProductsCount = 0;
  oems.forEach(o => {
    (o.categories || []).forEach(cat => {
      totalProductsCount += (cat.products || []).length;
    });
  });

  const q = (catalogSearchQuery || '').trim().toLowerCase();
  const filteredOems = oems.filter(o => {
    if (!q) return true;
    if ((o.name || '').toLowerCase().includes(q)) return true;
    if ((o.specialty || '').toLowerCase().includes(q)) return true;
    if ((o.description || '').toLowerCase().includes(q)) return true;
    return (o.categories || []).some(cat => {
      if ((cat.name || '').toLowerCase().includes(q)) return true;
      return (cat.products || []).some(p => {
        return (p.name || '').toLowerCase().includes(q) ||
               (p.description || '').toLowerCase().includes(q) ||
               (p.applications || '').toLowerCase().includes(q);
      });
    });
  });

  const oemCardsHtml = filteredOems.map(oem => {
    const origIdx = oems.indexOf(oem);
    const resolvedLogo = ImageStorage.resolveImageUrl(oem.logoImg);

    const oemProds = [];
    (oem.categories || []).forEach((cat, catIdx) => {
      (cat.products || []).forEach((prod, prodIdx) => {
        oemProds.push({
          ...prod,
          catId: cat.id,
          catName: cat.name,
          catIdx,
          prodIdx,
        });
      });
    });

    const prodCount = oemProds.length;
    const catCount = (oem.categories || []).length;
    const isExpanded = expandedOemIds.has(oem.id) || (q.length > 0);
    const isHidden = oem.visible === false;

    let productsPanelHtml = '';
    if (isExpanded) {
      const productRows = oemProds.map((p, pIdx) => {
        const prodImg = ImageStorage.resolveImageUrl(p.image || oem.defaultImage);
        const isProdHidden = p.visible === false;
        const catProds = oem.categories[p.catIdx]?.products || [];

        return `
          <tr class="${isProdHidden ? 'a-row-hidden' : ''}">
            <td style="width: 80px;">
              <div class="a-reorder-group">
                <button type="button" class="a-btn-reorder btn-move-prod" data-oem-idx="${origIdx}" data-cat-idx="${p.catIdx}" data-prod-idx="${p.prodIdx}" data-dir="up" ${p.prodIdx === 0 ? 'disabled' : ''} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="a-btn-reorder btn-move-prod" data-oem-idx="${origIdx}" data-cat-idx="${p.catIdx}" data-prod-idx="${p.prodIdx}" data-dir="down" ${p.prodIdx === catProds.length - 1 ? 'disabled' : ''} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
              </div>
            </td>
            <td style="width: 60px;">
              <div class="a-prod-thumb-box">
                ${prodImg ? `<img src="${prodImg}" alt="${p.name}" />` : '<i class="fa-solid fa-microchip" style="color:#64748b;"></i>'}
              </div>
            </td>
            <td>
              <div class="a-prod-name-box">
                <strong>${p.name || 'Unnamed Product'}</strong>
                <span>ID: ${p.id || '—'}</span>
              </div>
            </td>
            <td>
              <span class="a-badge a-badge-blue">${p.catName || p.category || 'General'}</span>
            </td>
            <td>
              <div class="a-prod-text-snippet" title="${p.description || ''}">
                ${p.description || '<span style="color:#94a3b8;font-style:italic;">No description</span>'}
              </div>
              ${p.applications ? `<div class="a-prod-text-snippet" style="color:#2563eb;font-size:0.7rem;margin-top:2px;" title="${p.applications}"><i class="fa-solid fa-bullseye"></i> ${p.applications}</div>` : ''}
            </td>
            <td>
              ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="a-btn a-btn-outline a-btn-sm" style="padding:3px 8px;font-size:0.72rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link</a>` : '<span style="color:#94a3b8;font-size:0.72rem;">None</span>'}
            </td>
            <td>
              <button type="button" class="a-btn a-btn-sm btn-toggle-prod-vis" data-oem-idx="${origIdx}" data-cat-idx="${p.catIdx}" data-prod-idx="${p.prodIdx}" title="Click to toggle visibility" style="${isProdHidden ? 'opacity:0.6;background:#f1f5f9;color:#64748b;' : 'background:#ecfdf5;color:#059669;border-color:#a7f3d0;'}">
                <i class="fa-solid ${isProdHidden ? 'fa-eye-slash' : 'fa-eye'}"></i> ${isProdHidden ? 'Hidden' : 'Visible'}
              </button>
            </td>
            <td style="white-space: nowrap;">
              <button type="button" class="a-btn a-btn-outline a-btn-sm btn-edit-product" data-oem-idx="${origIdx}" data-cat-idx="${p.catIdx}" data-prod-idx="${p.prodIdx}"><i class="fa-solid fa-pen"></i> Edit</button>
              <button type="button" class="a-btn a-btn-danger a-btn-sm btn-del-product" data-oem-idx="${origIdx}" data-cat-idx="${p.catIdx}" data-prod-idx="${p.prodIdx}" style="margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      productsPanelHtml = `
        <div class="a-oem-panel">
          <div class="a-oem-panel-top">
            <div>
              <strong style="color:#0f172a; font-size:0.88rem;">Products &amp; Lines under ${oem.name} (${prodCount})</strong>
              <div style="font-size:0.75rem; color:var(--a-muted); margin-top:2px;">Edit specifications, replace photos, reorder, or add variants</div>
            </div>
            <button type="button" class="a-btn a-btn-primary a-btn-sm btn-add-prod-to-oem" data-oem-idx="${origIdx}">
              <i class="fa-solid fa-plus"></i> Add Product to ${oem.shortName || oem.name}
            </button>
          </div>
          <div class="a-table-wrap">
            <table class="a-sub-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Image</th>
                  <th>Product Model</th>
                  <th>Category</th>
                  <th>Description &amp; Applications</th>
                  <th>Datasheet</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${productRows || '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--a-muted);">No products registered under this OEM yet. Click "+ Add Product to ' + (oem.shortName || oem.name) + '" above.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `
      <div class="a-oem-card ${isHidden ? 'oem-hidden' : ''}" id="oem-card-${oem.id}">
        <div class="a-oem-header">
          <div class="a-oem-header-left">
            <div class="a-reorder-group">
              <button type="button" class="a-btn-reorder btn-move-oem" data-dir="up" data-idx="${origIdx}" ${origIdx === 0 ? 'disabled' : ''} title="Move OEM Up"><i class="fa-solid fa-arrow-up"></i></button>
              <button type="button" class="a-btn-reorder btn-move-oem" data-dir="down" data-idx="${origIdx}" ${origIdx === oems.length - 1 ? 'disabled' : ''} title="Move OEM Down"><i class="fa-solid fa-arrow-down"></i></button>
            </div>
            <div class="a-oem-logo-thumb">
              ${resolvedLogo ? `<img src="${resolvedLogo}" alt="${oem.name}" />` : (oem.logoSvg || '<i class="fa-solid fa-industry" style="color:#94a3b8;"></i>')}
            </div>
            <div class="a-oem-info">
              <div class="a-oem-name-row">
                <span class="a-oem-title">${oem.name}</span>
                <span class="a-badge a-badge-blue">${oem.specialty || oem.category || 'RF & Microwave'}</span>
                ${isHidden ? '<span class="a-badge" style="background:#64748b;color:#fff;"><i class="fa-solid fa-eye-slash"></i> Hidden</span>' : '<span class="a-badge a-badge-green"><i class="fa-solid fa-eye"></i> Visible</span>'}
              </div>
              <div class="a-oem-meta-row">
                <span><i class="fa-solid fa-folder-tree"></i> ${catCount} ${catCount === 1 ? 'Category' : 'Categories'}</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-microchip"></i> <strong>${prodCount}</strong> ${prodCount === 1 ? 'Product' : 'Products & Lines'}</span>
                ${oem.website ? `<span>&bull;</span> <a href="${oem.website}" target="_blank" rel="noopener" style="color:var(--a-blue);text-decoration:none;"><i class="fa-solid fa-globe"></i> Website</a>` : ''}
              </div>
            </div>
          </div>

          <div class="a-oem-header-actions">
            <button type="button" class="a-btn a-btn-outline a-btn-sm btn-toggle-oem-vis" data-idx="${origIdx}" title="${isHidden ? 'Show on public site' : 'Hide from public site'}">
              <i class="fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${isHidden ? 'Show' : 'Hide'}
            </button>
            <button type="button" class="a-btn a-btn-primary a-btn-sm btn-toggle-oem-expand" data-oem-id="${oem.id}">
              <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
              <span>${isExpanded ? 'Collapse' : 'Expand'} Products (${prodCount})</span>
            </button>
            <button type="button" class="a-btn a-btn-outline a-btn-sm btn-edit-oem" data-idx="${origIdx}">
              <i class="fa-solid fa-pen"></i> Edit OEM
            </button>
            <button type="button" class="a-btn a-btn-danger a-btn-sm btn-del-oem" data-idx="${origIdx}" title="Delete OEM and its products">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        ${productsPanelHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="a-cards-box">
      <div class="a-cards-box-header" style="align-items:flex-start;">
        <div>
          <h3>OEM Principals &amp; Product Portfolio Catalog</h3>
          <p>Manage all 15 authorized global manufacturing partners and every associated product line. Expand any OEM to edit models, upload hardware photos, and adjust specifications.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-expand-all"><i class="fa-solid fa-angles-down"></i> Expand All</button>
          <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-collapse-all"><i class="fa-solid fa-angles-up"></i> Collapse All</button>
          <button type="button" class="a-btn a-btn-primary a-btn-sm" id="btn-add-new-oem"><i class="fa-solid fa-plus"></i> Add New OEM</button>
        </div>
      </div>

      <div class="a-catalog-toolbar">
        <div class="a-catalog-stats-strip">
          <div class="a-catalog-stat-badge">
            <span>Visible OEMs:</span>
            <strong>${visibleOemsCount}</strong>
            <span style="color:var(--a-muted);">/ ${totalOems}</span>
          </div>
          <div class="a-catalog-stat-badge">
            <span>Total Catalog Products:</span>
            <strong>${totalProductsCount}</strong>
          </div>
        </div>

        <div style="flex:1;max-width:420px;position:relative;">
          <input type="text" id="admin-catalog-search-input" class="a-input" placeholder="Search OEMs, products, categories, or keywords..." value="${catalogSearchQuery || ''}" style="padding-left:36px;" />
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--a-muted);font-size:0.85rem;"></i>
          ${catalogSearchQuery ? '<button type="button" id="admin-catalog-search-clear" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--a-muted);cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>' : ''}
        </div>
      </div>

      <div class="a-oem-accordions-list">
        ${oemCardsHtml || '<div class="a-empty-state" style="padding:40px;text-align:center;background:#fff;border-radius:12px;border:1px dashed var(--a-border);">No OEMs found matching your search.</div>'}
      </div>
    </div>
  `;
}

function bindProductsTabEvents() {
  const oems = ContentService.getData('products') || [];

  // Search input
  const searchInput = document.getElementById('admin-catalog-search-input');
  searchInput?.addEventListener('input', (e) => {
    catalogSearchQuery = e.target.value;
    rerender();
    // Re-focus search input and restore cursor position
    const newInp = document.getElementById('admin-catalog-search-input');
    if (newInp) {
      newInp.focus();
      newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
    }
  });

  document.getElementById('admin-catalog-search-clear')?.addEventListener('click', () => {
    catalogSearchQuery = '';
    rerender();
  });

  // Expand / Collapse All
  document.getElementById('btn-expand-all')?.addEventListener('click', () => {
    oems.forEach(o => expandedOemIds.add(o.id));
    rerender();
  });

  document.getElementById('btn-collapse-all')?.addEventListener('click', () => {
    expandedOemIds.clear();
    rerender();
  });

  // Toggle individual OEM expand
  document.querySelectorAll('.btn-toggle-oem-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemId = btn.getAttribute('data-oem-id');
      if (expandedOemIds.has(oemId)) {
        expandedOemIds.delete(oemId);
      } else {
        expandedOemIds.add(oemId);
      }
      rerender();
    });
  });

  // Toggle OEM visibility
  document.querySelectorAll('.btn-toggle-oem-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const o = oems[idx];
      o.visible = o.visible === false ? true : false;
      ContentService.saveData('products', oems);
      rerender();
      showToast(`OEM "${o.name}" is now ${o.visible ? 'visible' : 'hidden'}.`, 'success');
    });
  });

  // Move OEM up / down
  document.querySelectorAll('.btn-move-oem').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const reordered = reorderArray(oems, idx, targetIdx);
      ContentService.saveData('products', reordered);
      rerender();
      showToast('OEMs reordered!', 'success');
    });
  });

  // Add New OEM
  document.getElementById('btn-add-new-oem')?.addEventListener('click', () => {
    openModal('Add New Manufacturing Partner / OEM', `
      <div class="a-field"><label class="a-label">OEM / Principal Name *</label><input class="a-input" name="name" required placeholder="e.g. Rogers Corporation" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Short Display Name *</label><input class="a-input" name="shortName" required placeholder="e.g. Rogers" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Specialty / Domain *</label><input class="a-input" name="specialty" required placeholder="e.g. High Frequency Laminates & Prepregs" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tagline</label><input class="a-input" name="tagline" placeholder="High Performance Materials for RF/Microwave" /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description" rows="3"></textarea></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Official Website URL</label><input class="a-input" name="website" placeholder="https://..." /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Theme Color</label><input class="a-input" name="accentColor" value="#2563EB" placeholder="#2563EB" /></div>
      <div class="a-field" style="margin-top:12px;">
        <label class="a-label">Visibility Status</label>
        <select class="a-input" name="visible">
          <option value="true" selected>Visible in Public Catalog</option>
          <option value="false">Hidden (Draft / Archive)</option>
        </select>
      </div>
      ${renderImageUploadField('logoImg', 'Principal Logo Image', '', 'Upload PNG/SVG logo with transparent background')}
    `, (data) => {
      const slug = (data.shortName || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newOem = {
        id: slug + '-' + Date.now(),
        name: data.name,
        shortName: data.shortName || data.name,
        specialty: data.specialty,
        category: data.specialty,
        tagline: data.tagline || '',
        description: data.description || '',
        website: data.website || '',
        accentColor: data.accentColor || '#2563EB',
        glowColor: (data.accentColor || '#2563EB') + '40',
        logoImg: data.logoImg || '',
        visible: data.visible === 'true',
        categories: [
          {
            id: 'general',
            name: 'General Products',
            description: '',
            visible: true,
            products: []
          }
        ]
      };
      oems.push(newOem);
      expandedOemIds.add(newOem.id);
      ContentService.saveData('products', oems);
      rerender();
      showToast(`Added OEM "${newOem.name}"!`, 'success');
    });
  });

  // Edit OEM
  document.querySelectorAll('.btn-edit-oem').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const o = oems[idx];

      openModal('Edit OEM: ' + o.name, `
        <div class="a-field"><label class="a-label">OEM / Principal Name *</label><input class="a-input" name="name" value="${o.name}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Short Display Name *</label><input class="a-input" name="shortName" value="${o.shortName || o.name}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Specialty / Domain *</label><input class="a-input" name="specialty" value="${o.specialty || o.category || ''}" required /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Tagline</label><input class="a-input" name="tagline" value="${o.tagline || ''}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description" rows="3">${o.description || ''}</textarea></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Official Website URL</label><input class="a-input" name="website" value="${o.website || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Theme Color</label><input class="a-input" name="accentColor" value="${o.accentColor || '#2563EB'}" /></div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${o.visible !== false ? 'selected' : ''}>Visible in Public Catalog</option>
            <option value="false" ${o.visible === false ? 'selected' : ''}>Hidden (Draft / Archive)</option>
          </select>
        </div>
        ${renderImageUploadField('logoImg', 'Principal Logo Image', o.logoImg || '', 'Upload PNG/SVG logo with transparent background')}
      `, (data) => {
        oems[idx] = {
          ...o,
          name: data.name,
          shortName: data.shortName || data.name,
          specialty: data.specialty,
          category: data.specialty,
          tagline: data.tagline || '',
          description: data.description || '',
          website: data.website || '',
          accentColor: data.accentColor || '#2563EB',
          glowColor: (data.accentColor || '#2563EB') + '40',
          logoImg: data.logoImg,
          visible: data.visible === 'true',
        };
        ContentService.saveData('products', oems);
        rerender();
        showToast(`OEM "${data.name}" updated successfully!`, 'success');
      });
    });
  });

  // Delete OEM
  document.querySelectorAll('.btn-del-oem').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const o = oems[idx];
      let pCount = 0;
      (o.categories || []).forEach(c => pCount += (c.products || []).length);

      if (confirm(`Are you sure you want to delete OEM "${o.name}" and all of its ${pCount} products?\n\nThis cannot be undone.`)) {
        expandedOemIds.delete(o.id);
        oems.splice(idx, 1);
        ContentService.saveData('products', oems);
        rerender();
        showToast(`Deleted OEM "${o.name}".`, '');
      }
    });
  });

  // Add Product to OEM
  document.querySelectorAll('.btn-add-prod-to-oem').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemIdx = parseInt(btn.getAttribute('data-oem-idx'), 10);
      const oem = oems[oemIdx];
      const existingCats = (oem.categories || []).map(c => c.name);

      const catOptions = existingCats.map(c => `<option value="${c}">${c}</option>`).join('');

      openModal(`Add Product to ${oem.name}`, `
        <div class="a-field">
          <label class="a-label">Product Model / Name *</label>
          <input class="a-input" name="name" required placeholder="e.g. RT/duroid 5880 or QPA2211" />
        </div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Category Name *</label>
          <input class="a-input" name="category" list="cat-suggestions" required placeholder="Select existing or type new category..." value="${existingCats[0] || 'General'}" />
          <datalist id="cat-suggestions">
            ${catOptions}
          </datalist>
          <small style="color:var(--a-muted);font-size:0.75rem;">Pick from existing categories above or type a new category name.</small>
        </div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" selected>Visible in Public Catalog</option>
            <option value="false">Hidden (Draft / Archive)</option>
          </select>
        </div>
        ${renderImageUploadField('image', 'Product Image / Hardware Photo', '', 'Upload high-resolution component photo or diagram')}
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Technical Description</label>
          <textarea class="a-textarea" name="description" rows="3" placeholder="Key electrical characteristics, frequency range, packaging, etc."></textarea>
        </div>
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Specifications &amp; Target Applications</label>
          <textarea class="a-textarea" name="applications" rows="3" placeholder="e.g. Military Radar, Satellite Communications, 5G mmWave..."></textarea>
        </div>
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Datasheet / Official Product URL</label>
          <input class="a-input" name="link" placeholder="https://..." />
        </div>
      `, (data) => {
        if (!oem.categories) oem.categories = [];
        const catName = (data.category || 'General').trim();
        let targetCat = oem.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());

        if (!targetCat) {
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          targetCat = {
            id: catSlug || ('cat-' + Date.now()),
            name: catName,
            description: '',
            visible: true,
            products: []
          };
          oem.categories.push(targetCat);
        }

        const newProd = {
          id: (data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'prod') + '-' + Date.now().toString().slice(-4),
          name: data.name,
          category: catName,
          image: data.image || oem.defaultImage || '',
          description: data.description || '',
          applications: data.applications || '',
          link: data.link || '',
          visible: data.visible === 'true',
        };

        targetCat.products.push(newProd);
        expandedOemIds.add(oem.id);
        ContentService.saveData('products', oems);
        rerender();
        showToast(`Added product "${newProd.name}" to ${oem.shortName || oem.name}!`, 'success');
      });
    });
  });

  // Edit Product
  document.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemIdx = parseInt(btn.getAttribute('data-oem-idx'), 10);
      const catIdx = parseInt(btn.getAttribute('data-cat-idx'), 10);
      const prodIdx = parseInt(btn.getAttribute('data-prod-idx'), 10);

      const oem = oems[oemIdx];
      const cat = oem?.categories?.[catIdx];
      const prod = cat?.products?.[prodIdx];
      if (!oem || !cat || !prod) return;

      const existingCats = (oem.categories || []).map(c => c.name);
      const catOptions = existingCats.map(c => `<option value="${c}">${c}</option>`).join('');

      openModal(`Edit Product: ${prod.name}`, `
        <div class="a-field">
          <label class="a-label">Product Model / Name *</label>
          <input class="a-input" name="name" value="${prod.name || ''}" required />
        </div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Category Name *</label>
          <input class="a-input" name="category" list="cat-suggestions" value="${cat.name}" required />
          <datalist id="cat-suggestions">
            ${catOptions}
          </datalist>
          <small style="color:var(--a-muted);font-size:0.75rem;">Modify to move this product into a different category.</small>
        </div>
        <div class="a-field" style="margin-top:12px;">
          <label class="a-label">Visibility Status</label>
          <select class="a-input" name="visible">
            <option value="true" ${prod.visible !== false ? 'selected' : ''}>Visible in Public Catalog</option>
            <option value="false" ${prod.visible === false ? 'selected' : ''}>Hidden (Draft / Archive)</option>
          </select>
        </div>
        ${renderImageUploadField('image', 'Product Image / Hardware Photo', prod.image || '', 'Upload high-resolution component photo or diagram')}
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Technical Description</label>
          <textarea class="a-textarea" name="description" rows="3">${prod.description || ''}</textarea>
        </div>
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Specifications &amp; Target Applications</label>
          <textarea class="a-textarea" name="applications" rows="3">${prod.applications || ''}</textarea>
        </div>
        <div class="a-field span2" style="margin-top:12px;">
          <label class="a-label">Datasheet / Official Product URL</label>
          <input class="a-input" name="link" value="${prod.link || ''}" />
        </div>
      `, (data) => {
        const newCatName = (data.category || cat.name).trim();
        const updatedProd = {
          ...prod,
          name: data.name,
          category: newCatName,
          image: data.image,
          description: data.description || '',
          applications: data.applications || '',
          link: data.link || '',
          visible: data.visible === 'true',
        };

        if (newCatName.toLowerCase() === cat.name.toLowerCase()) {
          // Update in-place
          cat.products[prodIdx] = updatedProd;
        } else {
          // Moved category: remove from old category
          cat.products.splice(prodIdx, 1);
          // Find or create target category
          let targetCat = oem.categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
          if (!targetCat) {
            const catSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            targetCat = {
              id: catSlug || ('cat-' + Date.now()),
              name: newCatName,
              description: '',
              visible: true,
              products: []
            };
            oem.categories.push(targetCat);
          }
          targetCat.products.push(updatedProd);
        }

        expandedOemIds.add(oem.id);
        ContentService.saveData('products', oems);
        rerender();
        showToast(`Product "${updatedProd.name}" updated successfully!`, 'success');
      });
    });
  });

  // Delete Product
  document.querySelectorAll('.btn-del-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemIdx = parseInt(btn.getAttribute('data-oem-idx'), 10);
      const catIdx = parseInt(btn.getAttribute('data-cat-idx'), 10);
      const prodIdx = parseInt(btn.getAttribute('data-prod-idx'), 10);

      const oem = oems[oemIdx];
      const cat = oem?.categories?.[catIdx];
      const prod = cat?.products?.[prodIdx];
      if (!oem || !cat || !prod) return;

      if (confirm(`Delete product "${prod.name}" from ${oem.name}?`)) {
        cat.products.splice(prodIdx, 1);
        ContentService.saveData('products', oems);
        rerender();
        showToast(`Deleted product "${prod.name}".`, '');
      }
    });
  });

  // Move Product Up / Down within Category
  document.querySelectorAll('.btn-move-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemIdx = parseInt(btn.getAttribute('data-oem-idx'), 10);
      const catIdx = parseInt(btn.getAttribute('data-cat-idx'), 10);
      const prodIdx = parseInt(btn.getAttribute('data-prod-idx'), 10);
      const dir = btn.getAttribute('data-dir');

      const oem = oems[oemIdx];
      const cat = oem?.categories?.[catIdx];
      if (!cat || !cat.products) return;

      const targetIdx = dir === 'up' ? prodIdx - 1 : prodIdx + 1;
      cat.products = reorderArray(cat.products, prodIdx, targetIdx);
      ContentService.saveData('products', oems);
      rerender();
      showToast('Products reordered!', 'success');
    });
  });

  // Toggle Product Visibility
  document.querySelectorAll('.btn-toggle-prod-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const oemIdx = parseInt(btn.getAttribute('data-oem-idx'), 10);
      const catIdx = parseInt(btn.getAttribute('data-cat-idx'), 10);
      const prodIdx = parseInt(btn.getAttribute('data-prod-idx'), 10);

      const oem = oems[oemIdx];
      const cat = oem?.categories?.[catIdx];
      const prod = cat?.products?.[prodIdx];
      if (!prod) return;

      prod.visible = prod.visible === false ? true : false;
      ContentService.saveData('products', oems);
      rerender();
      showToast(`Product "${prod.name}" is now ${prod.visible ? 'visible' : 'hidden'}.`, 'success');
    });
  });
}

// ─── PARTNERS TAB ────────────────────────────────────────────────────────────
function renderPartnersTab() {
  const partners = ContentService.getData('partners') || [];

  const rows = partners.map((p, idx) => {
    const logo = ImageStorage.resolveImageUrl(p.logoImg);
    return `
      <tr>
        <td style="width:90px;">
          <div class="a-reorder-group">
            <button class="a-btn-reorder btn-move-partner" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
            <button class="a-btn-reorder btn-move-partner" data-dir="down" data-idx="${idx}" ${idx === partners.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
          </div>
        </td>
        <td>${logo ? `<img src="${logo}" class="a-img-preview" alt="${p.name}">` : '<span style="color:#94a3b8;font-size:0.75rem;">No logo</span>'}</td>
        <td><strong>${p.name}</strong></td>
        <td style="color:var(--a-muted);font-size:0.8rem;">${p.domain || '—'}</td>
        <td>
          <button class="a-btn a-btn-outline a-btn-sm partner-edit-btn" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="a-btn a-btn-danger a-btn-sm partner-del-btn" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>All Technology Partners (${partners.length})</h3>
          <p>Add, edit, delete, and reorder partners with live logo upload</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="partner-add-btn"><i class="fa-solid fa-plus"></i> Add Partner</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Reorder</th><th>Logo</th><th>Partner Name</th><th>Domain / Specialty</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindPartnersTabEvents() {
  const partners = ContentService.getData('partners') || [];

  document.getElementById('partner-add-btn')?.addEventListener('click', () => {
    openModal('Add New Technology Partner', `
      <div class="a-field"><label class="a-label">Partner Name</label><input class="a-input" name="name" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Domain / Specialty</label><input class="a-input" name="domain" placeholder="e.g. High-Frequency Laminates" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Color (red / blue)</label><input class="a-input" name="accentColor" value="blue" /></div>
      ${renderImageUploadField('logoImg', 'Partner Brand Logo', '', 'Transparent PNG/SVG')}
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Official Website URL</label><input class="a-input" name="website" placeholder="https://..." /></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description"></textarea></div>
    `, (data) => {
      partners.push({
        id: 'partner-' + Date.now(),
        ...data,
      });
      ContentService.saveData('partners', partners);
    });
  });

  document.querySelectorAll('.partner-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const p = partners[idx];
      openModal('Edit Partner: ' + p.name, `
        <div class="a-field"><label class="a-label">Partner Name</label><input class="a-input" name="name" value="${p.name}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Domain / Specialty</label><input class="a-input" name="domain" value="${p.domain || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Accent Color (red / blue)</label><input class="a-input" name="accentColor" value="${p.accentColor || 'blue'}" /></div>
        ${renderImageUploadField('logoImg', 'Partner Brand Logo', p.logoImg || '', 'Transparent PNG/SVG')}
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Official Website URL</label><input class="a-input" name="website" value="${p.website || ''}" /></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Description</label><textarea class="a-textarea" name="description">${p.description || ''}</textarea></div>
      `, (data) => {
        partners[idx] = { ...p, ...data };
        ContentService.saveData('partners', partners);
      });
    });
  });

  document.querySelectorAll('.partner-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this partner?')) {
        partners.splice(idx, 1);
        ContentService.saveData('partners', partners);
        rerender();
        showToast('Partner deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-partner').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const reordered = reorderArray(partners, idx, targetIdx);
      ContentService.saveData('partners', reordered);
      rerender();
      showToast('Partners reordered!', 'success');
    });
  });
}

// ─── BLOGS TAB ───────────────────────────────────────────────────────────────
function renderBlogsTab() {
  const blogs = ContentService.getData('blogs') || [];

  const rows = blogs.map((b, idx) => {
    const img = ImageStorage.resolveImageUrl(b.coverImg);
    return `
      <tr>
        <td style="width:90px;">
          <div class="a-reorder-group">
            <button class="a-btn-reorder btn-move-blog" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
            <button class="a-btn-reorder btn-move-blog" data-dir="down" data-idx="${idx}" ${idx === blogs.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
          </div>
        </td>
        <td>${img ? `<img src="${img}" class="a-img-preview" alt="Thumb" />` : '<span style="color:#94a3b8; font-size:0.75rem;">No image</span>'}</td>
        <td>
          <strong>${b.headline || b.title || 'Untitled'}</strong>
          <div style="font-size:0.75rem; color:var(--a-muted);">${b.oemId || ''} · ${b.date || ''}</div>
        </td>
        <td><span class="a-badge a-badge-blue">${b.tag || b.category || 'Article'}</span></td>
        <td>
          <button class="a-btn a-btn-outline a-btn-sm blog-edit-btn" data-idx="${idx}"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="a-btn a-btn-danger a-btn-sm blog-del-btn" data-idx="${idx}" style="margin-left:6px;"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="a-cards-box">
      <div class="a-cards-box-header">
        <div>
          <h3>Blog &amp; Technical Bulletins (${blogs.length})</h3>
          <p>Add, edit, delete, and reorder articles with cover image upload</p>
        </div>
        <button type="button" class="a-btn a-btn-primary a-btn-sm" id="blog-add-btn"><i class="fa-solid fa-plus"></i> Add New Blog</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>Reorder</th><th>Cover</th><th>Headline &amp; Source</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindBlogsTabEvents() {
  const blogs = ContentService.getData('blogs') || [];

  document.getElementById('blog-add-btn')?.addEventListener('click', () => {
    openModal('Add New Blog Article', `
      <div class="a-field"><label class="a-label">Headline / Title</label><input class="a-input" name="headline" required /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">OEM / Principal ID (e.g. rogers-corporation, qorvo)</label><input class="a-input" name="oemId" value="rogers-corporation" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Author (e.g. Dr. Vikram Nair)</label><input class="a-input" name="author" value="Technical Applications Team" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Category Tag (e.g. Technical Whitepaper)</label><input class="a-input" name="tag" value="Technical Note" /></div>
      <div class="a-field" style="margin-top:12px;"><label class="a-label">Read Time</label><input class="a-input" name="readTime" value="5 min" /></div>
      ${renderImageUploadField('coverImg', 'Article Cover Image', '', 'Hero banner for article')}
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Excerpt / Summary</label><textarea class="a-textarea" name="excerpt" required></textarea></div>
      <div class="a-field span2" style="margin-top:12px;"><label class="a-label">External Whitepaper / Portal Link</label><input class="a-input" name="officialWebsite" placeholder="https://..." /></div>
    `, (data) => {
      blogs.unshift({
        id: 'blog-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        ...data,
      });
      ContentService.saveData('blogs', blogs);
    });
  });

  document.querySelectorAll('.blog-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const b = blogs[idx];
      openModal('Edit Blog Article', `
        <div class="a-field"><label class="a-label">Headline / Title</label><input class="a-input" name="headline" value="${b.headline || b.title || ''}" required /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">OEM / Principal ID</label><input class="a-input" name="oemId" value="${b.oemId || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Author</label><input class="a-input" name="author" value="${b.author || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Category Tag</label><input class="a-input" name="tag" value="${b.tag || b.category || ''}" /></div>
        <div class="a-field" style="margin-top:12px;"><label class="a-label">Read Time</label><input class="a-input" name="readTime" value="${b.readTime || ''}" /></div>
        ${renderImageUploadField('coverImg', 'Article Cover Image', b.coverImg || '', 'Hero banner for article')}
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">Excerpt / Summary</label><textarea class="a-textarea" name="excerpt" required>${b.excerpt || b.desc || ''}</textarea></div>
        <div class="a-field span2" style="margin-top:12px;"><label class="a-label">External Whitepaper / Portal Link</label><input class="a-input" name="officialWebsite" value="${b.officialWebsite || ''}" /></div>
      `, (data) => {
        blogs[idx] = { ...b, ...data };
        ContentService.saveData('blogs', blogs);
      });
    });
  });

  document.querySelectorAll('.blog-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (confirm('Delete this blog entry?')) {
        blogs.splice(idx, 1);
        ContentService.saveData('blogs', blogs);
        rerender();
        showToast('Blog deleted.', '');
      }
    });
  });

  document.querySelectorAll('.btn-move-blog').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const dir = btn.getAttribute('data-dir');
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      const reordered = reorderArray(blogs, idx, targetIdx);
      ContentService.saveData('blogs', reordered);
      rerender();
      showToast('Blogs reordered!', 'success');
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
          ${renderImageUploadField('logoUrl', 'Header Brand Logo', h.logoUrl || '/icon-logo-transparent.png', 'Transparent PNG/SVG recommended')}
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
          ${renderImageUploadField('logoUrl', 'Footer Logo Image', f.logoUrl || '/icon-logo-transparent.png', 'Transparent logo')}
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
