import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouteSearchParams, navigate } from '../src/router.js';
import { resolveApiBaseUrl } from '../src/data/ApiService.js';
import { renderSafely } from '../src/rendering.js';

test('route query parsing reads clean URL parameters and keeps legacy hash support', () => {
  const cleanParams = getRouteSearchParams({
    search: '?subject=rfq&model=RT%2Fduroid',
    hash: '',
  });
  assert.equal(cleanParams.get('subject'), 'rfq');
  assert.equal(cleanParams.get('model'), 'RT/duroid');

  const legacyParams = getRouteSearchParams({
    search: '',
    hash: '#/blogs?oem=rogers-corporation&tab=videos',
  });
  assert.equal(legacyParams.get('oem'), 'rogers-corporation');
  assert.equal(legacyParams.get('tab'), 'videos');
});

test('clean navigation removes stale query parameters when returning to the route base', () => {
  const previousWindow = globalThis.window;
  const historyUpdates = [];
  globalThis.window = {
    location: {
      pathname: '/blogs',
      search: '?oem=rogers-corporation',
      hash: '',
    },
    history: {
      pushState(_state, _title, url) {
        historyUpdates.push(url);
        const [pathname, search = ''] = url.split('?');
        this.location.pathname = pathname;
        this.location.search = search ? `?${search}` : '';
      },
    },
    scrollTo() {},
  };
  globalThis.window.history.location = globalThis.window.location;

  try {
    navigate('/blogs');
    assert.deepEqual(historyUpdates, ['/blogs']);
    assert.equal(globalThis.window.location.search, '');
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test('API base URL prioritizes runtime overrides, then build configuration, then same-origin default', () => {
  assert.equal(resolveApiBaseUrl('https://api.example.test/v1///', '/build-api/'), 'https://api.example.test/v1');
  assert.equal(resolveApiBaseUrl('', '/build-api/'), '/build-api');
  assert.equal(resolveApiBaseUrl('', ''), '/api');
});

test('render failures produce a fallback and log the component failure', () => {
  const errors = [];
  const fallback = '<main>Page recovery</main>';
  const result = renderSafely(
    () => {
      throw new Error('render failed');
    },
    fallback,
    'test component',
    (...args) => errors.push(args)
  );

  assert.equal(result, fallback);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][0], 'Failed to render test component.');
  assert.match(errors[0][1].message, /render failed/);
});

test('partner card click navigation uses clean HTML5 route without hash', async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  const navigatedUrls = [];
  const cardListeners = new Map();

  const mockCard = {
    getAttribute(name) {
      if (name === 'data-partner-id') return 'rogers';
      return null;
    },
    addEventListener(event, fn) {
      cardListeners.set(event, fn);
    },
    click() {
      const fn = cardListeners.get('click');
      if (fn) fn();
    },
  };

  globalThis.document = {
    querySelectorAll(selector) {
      if (selector === '.partner-static-card') return [mockCard];
      if (selector === '.oem-running-logo-item') return [];
      return [];
    },
    querySelector() { return null; },
  };

  globalThis.window = {
    location: {
      pathname: '/partners',
      search: '',
      hash: '',
    },
    history: {
      pushState(_state, _title, url) {
        navigatedUrls.push(url);
      },
    },
    scrollTo() {},
  };

  try {
    const { initPartnersPage } = await import('../src/pages/Partners.js');
    initPartnersPage();
    mockCard.click();

    // Must navigate to clean route without setting window.location.hash
    assert.equal(globalThis.window.location.hash, '');
    assert.equal(navigatedUrls.length, 1);
    assert.equal(navigatedUrls[0], '/products?level=categories&oem=rogers-corporation');
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }
});
