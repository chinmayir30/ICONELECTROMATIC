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
      </nav>

      <div class="header-actions">
        <a class="btn-relay-border" data-route="/contact">
          Request Quote
        </a>
        <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Toggle light/dark theme" title="Switch Theme">
          <i class="fa-solid fa-sun" id="theme-toggle-icon"></i>
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
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-active');
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-active');
      });
    });
  }

  // Theme toggle — persist to localStorage (supports ?theme=light URL override)
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const toggleIcon = document.getElementById('theme-toggle-icon');
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const savedTheme = urlTheme || localStorage.getItem('icon-theme') || 'dark';

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-moon';
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-sun';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('icon-theme', 'dark');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-sun';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('icon-theme', 'light');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-moon';
      }
      // Ensure hero video keeps playing smoothly
      const heroVid = document.getElementById('hero-bg-video');
      if (heroVid) {
        heroVid.muted = true;
        heroVid.play().catch(() => {});
      }
    });
  }
}
