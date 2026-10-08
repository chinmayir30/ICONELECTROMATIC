/**
 * SPA Router for ICON ELECTROMATIC
 * Supports hash routing (#/about), HTML5 history fallback, and mobile touch events
 */

const routes = {};
let currentPath = '';

export function registerRoute(path, handler) {
  let cleanPath = path;
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
  routes[cleanPath] = handler;
}

export function navigate(path) {
  let clean = path || '/';
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);

  const targetHash = '#' + clean;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    handleRoute();
  }
}

export function handleRoute() {
  // Extract route from hash first (#/about), then pathname fallback (/about)
  let raw = '';
  if (window.location.hash) {
    raw = window.location.hash.replace(/^#\/?/, '/');
  } else if (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    raw = window.location.pathname;
  } else {
    raw = '/';
  }

  const [routePath, queryStr] = raw.split('?');
  const queryParams = new URLSearchParams(queryStr || '');

  // Normalize: ensure leading slash, strip trailing slash
  let route = routePath.startsWith('/') ? routePath : '/' + routePath;
  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }

  // Extract base route and params
  const parts = route.split('/').filter(Boolean);
  let matchedHandler = null;
  let params = { _query: queryParams };

  // 1. Exact match
  if (routes[route]) {
    matchedHandler = routes[route];
  }
  // 2. Pattern match (e.g. /product/:id)
  else {
    for (const [pattern, handler] of Object.entries(routes)) {
      const patternParts = pattern.split('/').filter(Boolean);
      if (patternParts.length !== parts.length) continue;

      let match = true;
      const extractedParams = { _query: queryParams };
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          extractedParams[patternParts[i].slice(1)] = parts[i];
        } else if (patternParts[i] !== parts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        matchedHandler = handler;
        params = extractedParams;
        break;
      }
    }
  }

  if (matchedHandler) {
    currentPath = route;
    matchedHandler(params);
  } else if (routes['/']) {
    currentPath = '/';
    routes['/'](params);
  }

  // Scroll to top cleanly
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function getCurrentPath() {
  let raw = '';
  if (window.location.hash) {
    raw = window.location.hash.replace(/^#\/?/, '/');
  } else if (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    raw = window.location.pathname;
  } else {
    raw = '/';
  }
  const [route] = raw.split('?');
  let clean = route.startsWith('/') ? route : '/' + route;
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
  return clean || currentPath || '/';
}

export function initRouter() {
  window.addEventListener('popstate', handleRoute);
  window.addEventListener('hashchange', handleRoute);

  // Global click navigation delegation
  const handleNavClick = (e) => {
    const link = e.target.closest('[data-route], a[href^="#/"]');
    if (link) {
      let targetRoute = link.getAttribute('data-route');
      if (!targetRoute && link.getAttribute('href')?.startsWith('#/')) {
        targetRoute = link.getAttribute('href').slice(1);
      }
      if (targetRoute) {
        e.preventDefault();
        navigate(targetRoute);
      }
    }
  };

  document.addEventListener('click', handleNavClick, { passive: false });

  // Initial route handling
  if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
    if (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.location.hash = '#' + window.location.pathname;
    } else {
      window.location.hash = '#/';
    }
  } else {
    handleRoute();
  }
}
