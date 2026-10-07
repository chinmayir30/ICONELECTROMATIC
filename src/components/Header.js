/**
 * Header Component — ICON ELECTROMATIC
 * Sleek Minimalist Dark Header matching the Relay Framer reference
 */
import { getCurrentPath } from '../router.js';

export function renderHeaderInner(currentRoute) {
  const route = currentRoute || getCurrentPath();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/partners', label: 'Partners' },
    { path: '/products', label: 'Products' },
    { path: '/services', label: 'Services' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/contact', label: 'Contact' },
  ];

  const isLight = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('theme') === 'light' ||
    localStorage.getItem('icon-theme') === 'light' ||
    document.documentElement.getAttribute('data-theme') === 'light'
  );

  return `
    <div class="header-inner">
      <a class="logo-container" data-route="/" title="ICON ELECTROMATIC Home">
        <img src="/icon-logo-transparent.png" alt="ICON ELECTROMATIC" />
      </a>

      <nav class="main-nav" id="main-nav">
        ${navLinks.map(link => `
          <a class="nav-link ${route === link.path ? 'active' : ''}" data-route="${link.path}">
            ${link.label}
          </a>
        `).join('')}
        <div class="mobile-nav-cta">
          <a class="btn-relay-red mobile-drawer-cta" data-route="/contact">
            Request a Quote <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </nav>

      <div class="header-actions">
        <a class="btn-relay-border" data-route="/contact">
          Request Quote
        </a>
        <button class="theme-toggle-btn theme-toggle-switch ${isLight ? 'is-light' : ''}" id="theme-toggle-btn" role="switch" aria-checked="${isLight ? 'true' : 'false'}" aria-label="Toggle dark and light theme" title="${isLight ? 'Switch to Darker Version' : 'Switch to Lighter Version'}">
          <span class="theme-switch-track">
            <span class="theme-switch-icon theme-switch-moon" title="Darker Version">
              <i class="fa-solid fa-moon"></i>
            </span>
            <span class="theme-switch-icon theme-switch-sun" title="Lighter Version">
              <i class="fa-solid fa-sun"></i>
            </span>
            <span class="theme-switch-thumb">
              <i class="fa-solid ${isLight ? 'fa-sun' : 'fa-moon'}" id="theme-toggle-icon"></i>
            </span>
          </span>
        </button>
      </div>

      <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;
}

export function renderHeader() {
  return `
    <header class="site-header" id="site-header">
      ${renderHeaderInner()}
    </header>
  `;
}

export function initHeader() {
  const header = document.getElementById('site-header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (window.location.hash.includes('scroll=')) {
      const match = window.location.hash.match(/scroll=(\d+)/);
      if (match) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(match[1], 10));
          handleScroll();
        }, 150);
      }
    }
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mainNav.classList.toggle('mobile-active');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('mobile-active') && !mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        mainNav.classList.remove('mobile-active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Theme toggle — persist to localStorage (supports ?theme=light URL override)
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const toggleIcon = document.getElementById('theme-toggle-icon');
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const savedTheme = urlTheme || localStorage.getItem('icon-theme') || 'dark';

  const updateThemeUI = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('icon-theme', theme);

    if (toggleBtn) {
      toggleBtn.classList.toggle('is-light', isLight);
      toggleBtn.setAttribute('aria-checked', isLight ? 'true' : 'false');
      toggleBtn.setAttribute('title', isLight ? 'Switch to Darker Version' : 'Switch to Lighter Version');
    }
    if (toggleIcon) {
      toggleIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  };

  updateThemeUI(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      updateThemeUI(isLight ? 'dark' : 'light');
      // Ensure hero video keeps playing smoothly
      const heroVid = document.getElementById('hero-bg-video');
      if (heroVid) {
        heroVid.muted = true;
        heroVid.play().catch(() => {});
      }
    });
  }
}
