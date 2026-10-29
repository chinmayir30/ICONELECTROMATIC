/**
 * Main Entry Point — ICON ELECTROMATIC
 */
import { registerRoute, initRouter, getCurrentPath } from './router.js';
import { renderHeader, renderHeaderInner, initHeader, closeSidebarDrawer, updateDrawerActiveState } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderHomePage, initHomePage } from './pages/Home.js';
import { renderProductsPage, initProductsPage } from './pages/Products.js';
import { renderAboutPage, initAboutPage } from './pages/About.js';
import { renderServicesPage, initServicesPage } from './pages/Services.js';
import { renderPartnersPage, initPartnersPage } from './pages/Partners.js';
import { renderBlogsPage, initBlogsPage } from './pages/Blogs.js';
import { renderContactPage, initContactPage } from './pages/Contact.js';
import { renderChatbot, initChatbot } from './components/Chatbot.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { ImageStorage } from './data/ImageStorage.js';
import { ContentService } from './data/ContentService.js';

const app = document.getElementById('app');

function renderPage(content, initFn) {
  const currentPath = getCurrentPath();
  let header = document.getElementById('site-header');

  if (!header) {
    header = document.createElement('header');
    header.className = 'site-header';
    header.id = 'site-header';
    document.body.insertBefore(header, app);
  }
  header.style.display = 'block';
  header.innerHTML = renderHeaderInner(currentPath);
  initHeader();
  updateDrawerActiveState(currentPath);

  // Always close mobile navigation drawer and sidebar drawer when a route loads
  const mainNav = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mainNav) mainNav.classList.remove('mobile-active');
  if (mobileToggle) {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
  closeSidebarDrawer();

  app.innerHTML = content + renderFooter() + renderBackToTop() + renderChatbot();
  initChatbot();
  if (initFn) initFn();
  initBackToTop();
  window.scrollTo({ top: 0 });
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

registerRoute('/', () => renderPage(renderHomePage(), initHomePage));
registerRoute('/products', () => renderPage(renderProductsPage(), initProductsPage));
registerRoute('/about', () => renderPage(renderAboutPage(), initAboutPage));
registerRoute('/services', () => renderPage(renderServicesPage(), initServicesPage));
registerRoute('/partners', () => renderPage(renderPartnersPage(), initPartnersPage));
registerRoute('/blogs', (params) => renderPage(renderBlogsPage(params), () => initBlogsPage(params)));
registerRoute('/blog', (params) => renderPage(renderBlogsPage(params), () => initBlogsPage(params)));
registerRoute('/contact', () => renderPage(renderContactPage(), initContactPage));
// /admin is always registered. Access is controlled entirely at runtime by
// authService + Supabase GoTrue — unauthenticated visitors see only the login screen.
// robots.txt already has Disallow: /admin, so search engines will not index this route.
registerRoute('/admin', async () => {
  // Prevent search engines from indexing the admin shell while it is active.
  let noindexMeta = document.querySelector('meta[name="robots"][data-admin]');
  if (!noindexMeta) {
    noindexMeta = document.createElement('meta');
    noindexMeta.name = 'robots';
    noindexMeta.content = 'noindex, nofollow';
    noindexMeta.setAttribute('data-admin', '1');
    document.head.appendChild(noindexMeta);
  }
  closeSidebarDrawer();
  const header = document.getElementById('site-header');
  if (header) header.style.display = 'none';
  const app = document.getElementById('app');
  const { renderAdminPage, initAdminPage } = await import('./admin/Admin.js');
  app.innerHTML = renderAdminPage();
  initAdminPage();
});

// Remove the admin noindex tag when navigating to any public route.
function removeAdminNoindex() {
  document.querySelector('meta[name="robots"][data-admin]')?.remove();
}
// Click-based navigation (data-route links, <a href="/">, etc.)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-route]:not([data-route="/admin"]), a[href^="/"]:not([href^="//"])');
  if (link) removeAdminNoindex();
}, { capture: true, passive: true });
// Back/Forward (popstate) and hashchange navigation bypasses click events.
// Remove noindex tag whenever the resolved URL is no longer /admin.
window.addEventListener('popstate', () => {
  const p = window.location.pathname || '/';
  if (p !== '/admin' && p !== '/admin/') removeAdminNoindex();
});
window.addEventListener('hashchange', () => {
  const h = (window.location.hash || '').replace(/^#\/?/, '/');
  if (h !== '/admin' && h !== '/admin/') removeAdminNoindex();
});

// Initialize router and components immediately after storage and content are ready
Promise.all([
  ImageStorage.init(),
  ContentService.init()
]).finally(() => {
  initRouter();
  initCustomCursor();
});
