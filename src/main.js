/**
 * Main Entry Point — ICON ELECTROMATIC
 */
import { registerRoute, initRouter, getCurrentPath, handleRoute } from './router.js';
import { renderHeader, renderHeaderInner, initHeader, closeSidebarDrawer, updateDrawerActiveState } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderHomePage, initHomePage } from './pages/Home.js';
import { renderProductsPage, initProductsPage } from './pages/Products.js';
import { renderProductDetailPage, initProductDetailPage } from './pages/ProductDetail.js';
import { renderAboutPage, initAboutPage } from './pages/About.js';
import { renderServicesPage, initServicesPage } from './pages/Services.js';
import { renderPartnersPage, initPartnersPage } from './pages/Partners.js';
import { renderBlogsPage, initBlogsPage } from './pages/Blogs.js';
import { renderContactPage, initContactPage } from './pages/Contact.js';
import { renderChatbot, initChatbot } from './components/Chatbot.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { ImageStorage } from './data/ImageStorage.js';
import { SeoService } from './data/SeoService.js';
import { ContentService } from './data/ContentService.js';
import { renderSafely } from './rendering.js';

const app = document.getElementById('app');

function enterAdminMode() {
  if (typeof document !== 'undefined') {
    document.body.classList.add('admin-mode');
    const ring = document.getElementById('custom-cursor-ring');
    const dot = document.getElementById('custom-cursor-dot');
    if (ring) { ring.style.display = 'none'; ring.style.opacity = '0'; }
    if (dot) { dot.style.display = 'none'; dot.style.opacity = '0'; }
  }
}

function exitAdminMode() {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('admin-mode');
  }
}

function renderPage(renderContent, initFn) {
  exitAdminMode();
  const currentPath = getCurrentPath();
  let header = document.getElementById('site-header');

  if (!header) {
    header = document.createElement('header');
    header.className = 'site-header';
    header.id = 'site-header';
    document.body.insertBefore(header, app);
  }
  header.style.display = 'block';
  header.innerHTML = renderSafely(
    () => renderHeaderInner(currentPath),
    '',
    'site header'
  );
  renderSafely(initHeader, undefined, 'site header behavior');
  renderSafely(
    () => updateDrawerActiveState(currentPath),
    undefined,
    'navigation state'
  );

  // Always close mobile navigation drawer and sidebar drawer when a route loads
  const mainNav = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mainNav) mainNav.classList.remove('mobile-active');
  if (mobileToggle) {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
  renderSafely(closeSidebarDrawer, undefined, 'navigation drawer');

  if (!currentPath.startsWith('/product/')) {
    renderSafely(
      () => SeoService.setDefaultSeo(currentPath),
      undefined,
      'page metadata'
    );
  }

  const content = renderSafely(
    renderContent,
    `<main class="page-content render-error" role="alert">
      <div class="container">
        <h1>This page could not be displayed</h1>
        <p>Please try again or return to the <a href="/" data-route="/">home page</a>.</p>
        <button type="button" onclick="window.location.reload()">Reload this page</button>
      </div>
    </main>`,
    `page ${currentPath}`
  );
  const footer = renderSafely(renderFooter, '', 'site footer');
  const chatbot = renderSafely(renderChatbot, '', 'chatbot');
  app.innerHTML = content + footer + renderBackToTop() + chatbot;
  renderSafely(initChatbot, undefined, 'chatbot behavior');
  if (initFn) renderSafely(initFn, undefined, 'page behavior');
  renderSafely(initBackToTop, undefined, 'back-to-top behavior');
  renderSafely(() => window.scrollTo({ top: 0 }), undefined, 'page scrolling');
}

function renderBackToTop() {
  return `<button class="back-to-top" id="back-to-top" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>`;
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

registerRoute('/', () => renderPage(renderHomePage, initHomePage));
registerRoute('/products', () => renderPage(renderProductsPage, initProductsPage));
registerRoute('/product/:id', (params) => renderPage(() => renderProductDetailPage(params), () => initProductDetailPage(params)));
registerRoute('/about', () => renderPage(renderAboutPage, initAboutPage));
registerRoute('/services', () => renderPage(renderServicesPage, initServicesPage));
registerRoute('/partners', () => renderPage(renderPartnersPage, initPartnersPage));
registerRoute('/blogs', (params) => renderPage(() => renderBlogsPage(params), () => initBlogsPage(params)));
registerRoute('/blog', (params) => renderPage(() => renderBlogsPage(params), () => initBlogsPage(params)));
registerRoute('/contact', () => renderPage(renderContactPage, initContactPage));
function renderAdminLoadingPlaceholder(message = 'Loading Administration Portal...') {
  return `
    <div style="min-height:100vh;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f8fafc;font-family:sans-serif;padding:24px;">
      <div style="width:44px;height:44px;border:3px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;animation:admin-spin 0.8s linear infinite;margin-bottom:16px;"></div>
      <p style="color:#94a3b8;font-size:0.95rem;margin:0;">${message}</p>
      <style>@keyframes admin-spin { to { transform: rotate(360deg); } }</style>
    </div>
  `;
}

function renderAdminErrorPlaceholder(title, errorDetail = '') {
  return `
    <div style="min-height:100vh;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f8fafc;font-family:sans-serif;padding:24px;text-align:center;">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:1.5rem;margin-bottom:16px;">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h2 style="font-size:1.35rem;font-weight:700;margin:0 0 8px 0;color:#f8fafc;">${title}</h2>
      <p style="color:#94a3b8;max-width:440px;font-size:0.9rem;margin:0 0 20px 0;">An error occurred while loading this section. Please refresh or return to the website.</p>
      ${errorDetail ? `<pre style="background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:6px;font-size:0.75rem;color:#cbd5e1;max-width:500px;overflow-x:auto;margin-bottom:20px;">${errorDetail}</pre>` : ''}
      <a href="/" class="btn-relay btn-relay-primary" style="padding:10px 22px;font-size:0.85rem;text-decoration:none;border-radius:8px;">Return to Home</a>
    </div>
  `;
}

registerRoute('/admin', async () => {
  enterAdminMode();
  closeSidebarDrawer();
  const header = document.getElementById('site-header');
  if (header) header.style.display = 'none';
  SeoService.setDefaultSeo('/admin');
  const app = document.getElementById('app');
  if (app) app.innerHTML = renderAdminLoadingPlaceholder('Loading Administration Portal...');
  try {
    const { renderAdminPage, initAdminPage } = await import('./admin/Admin.js');
    if (app) app.innerHTML = renderAdminPage();
    initAdminPage();
  } catch (err) {
    console.error('Failed to load Admin CMS:', err);
    if (app) app.innerHTML = renderAdminErrorPlaceholder('Unable to load Admin CMS', err?.message);
  }
});

registerRoute('/admin/verify-recovery', async (params) => {
  enterAdminMode();
  closeSidebarDrawer();
  const header = document.getElementById('site-header');
  if (header) header.style.display = 'none';
  SeoService.setDefaultSeo('/admin');
  const app = document.getElementById('app');
  if (app) app.innerHTML = renderAdminLoadingPlaceholder('Loading Recovery Verification...');
  try {
    await import('./admin/admin.css');
    const { renderVerifyRecoveryPage, initVerifyRecoveryPage } = await import('./admin/PublicRecovery.js');
    if (app) app.innerHTML = renderVerifyRecoveryPage();
    initVerifyRecoveryPage(params);
  } catch (err) {
    console.error('Failed to load verification view:', err);
    if (app) app.innerHTML = renderAdminErrorPlaceholder('Unable to load verification view', err?.message);
  }
});

async function loadResetPasswordRoute(params) {
  enterAdminMode();
  closeSidebarDrawer();
  const header = document.getElementById('site-header');
  if (header) header.style.display = 'none';
  SeoService.setDefaultSeo('/admin');
  const app = document.getElementById('app');
  if (app) app.innerHTML = renderAdminLoadingPlaceholder('Loading Password Reset...');
  try {
    await import('./admin/admin.css');
    const { renderResetPasswordPage, initResetPasswordPage } = await import('./admin/PublicRecovery.js');
    if (app) app.innerHTML = renderResetPasswordPage();
    initResetPasswordPage(params);
  } catch (err) {
    console.error('Failed to load password reset view:', err);
    if (app) app.innerHTML = renderAdminErrorPlaceholder('Unable to load password reset view', err?.message);
  }
}
registerRoute('/admin/reset-password', (params) => loadResetPasswordRoute(params));
registerRoute('/reset-password', (params) => loadResetPasswordRoute(params));

// Listen for real-time CMS content updates to refresh layout and public page views
if (typeof window !== 'undefined') {
  window.addEventListener('cms-data-updated', (e) => {
    const pageKey = e.detail?.pageKey;
    const currentPath = getCurrentPath();

    // Never interrupt an active administrator session
    if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
      return;
    }

    if (pageKey === 'header') {
      const header = document.getElementById('site-header');
      if (header && header.style.display !== 'none') {
        header.innerHTML = renderHeaderInner(currentPath);
        initHeader();
      }
      return;
    }

    if (pageKey === 'footer') {
      const footer = document.querySelector('.site-footer');
      if (footer) {
        footer.outerHTML = renderFooter();
      }
      return;
    }

    // Map content pageKey to active public route
    const pageRouteMap = {
      home: '/',
      about: '/about',
      services: '/services',
      contact: '/contact',
      partners: '/partners',
      blogs: '/blogs',
      projects: '/',
      gallery: '/',
      testimonials: '/',
    };

    const targetRoute = pageRouteMap[pageKey];
    if (
      targetRoute &&
      (currentPath === targetRoute || (pageKey === 'blogs' && currentPath === '/blog'))
    ) {
      handleRoute();
    }
  });
}

// Initialize components, preload all 12 CMS content modules, and start router
Promise.allSettled([
  ImageStorage.init(),
  ContentService.preload([
    'header', 'footer', 'home', 'about', 'services', 'contact',
    'partners', 'blogs', 'projects', 'gallery', 'testimonials', 'seo'
  ]),
]).finally(() => {
  initRouter();
  initCustomCursor();
});
