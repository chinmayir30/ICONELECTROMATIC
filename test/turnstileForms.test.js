import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiService } from '../src/data/ApiService.js';
import { CatalogService } from '../src/data/CatalogService.js';
import { ContentService } from '../src/data/ContentService.js';
import { initHomePage } from '../src/pages/Home.js';
import { initContactPage } from '../src/pages/Contact.js';
import { TurnstileService } from '../src/data/TurnstileService.js';

function createElement(value = '') {
  const listeners = new Map();
  return {
    value,
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    files: [],
    classList: {
      toggle() {},
      add() {},
      remove() {},
    },
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    getListener(name) {
      return listeners.get(name);
    },
    setAttribute() {},
    focus() {},
    querySelector(selector) {
      if (selector === 'button[type="submit"]') return this.submitButton || null;
      if (selector === 'input[name="website"]') return this.honeypot || null;
      return null;
    },
    closest() {
      return this.wrapper || null;
    },
  };
}

function setBrowserGlobals(elements) {
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
  };
  globalThis.document = {
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  };
  globalThis.window = {
    location: { pathname: '/', search: '', hash: '' },
    addEventListener() {},
  };

  return () => {
    globalThis.document = previous.document;
    globalThis.window = previous.window;
  };
}

function createMockWidget(initialToken = 'mock-turnstile-token') {
  let token = initialToken;
  return {
    getToken: () => token,
    reset() {
      token = 'fresh-turnstile-token';
    },
    cleanup() {},
  };
}

function makeHomeElements() {
  const elements = {
    'home-contact-form': createElement(),
    'home-turnstile-widget': createElement(),
    'home-turnstile-status': createElement(),
    'home-contact-status': createElement(),
    'h-name': createElement('Ada Lovelace'),
    'h-company': createElement('Analytical Engines'),
    'h-email': createElement('ada@example.test'),
    'h-phone': createElement('123456'),
    'h-subject': createElement('rfq'),
    'h-message': createElement('Request for pricing'),
  };
  elements['home-contact-form'].submitButton = createElement();
  elements['home-contact-form'].honeypot = createElement('bot-value');
  elements['home-contact-form'].wrapper = createElement();
  return elements;
}

function makeContactElements() {
  const elements = {
    'tab-btn-inquiry': createElement(),
    'tab-btn-recruiting': createElement(),
    'inquiry-form-panel': createElement(),
    'recruiting-form-panel': createElement(),
    'inquiry-info-column': createElement(),
    'recruiting-info-column': createElement(),
    'contact-full-form': createElement(),
    'recruiting-full-form': createElement(),
    'inquiry-submit-btn': createElement(),
    'careers-submit-btn': createElement(),
    'inquiry-form-error': createElement(),
    'careers-form-error': createElement(),
    'contact-turnstile-widget': createElement(),
    'contact-turnstile-status': createElement(),
    'careers-turnstile-widget': createElement(),
    'careers-turnstile-status': createElement(),
    'c-region': createElement('india'),
    'c-fullname': createElement('Ada Lovelace'),
    'c-company': createElement('Analytical Engines'),
    'c-email': createElement('ada@example.test'),
    'c-phone': createElement('123456'),
    'c-subject': createElement('rfq'),
    'c-model': createElement('RF-100'),
    'c-message': createElement('Request for pricing'),
    'r-fullname': createElement('Grace Hopper'),
    'r-email': createElement('grace@example.test'),
    'r-position': createElement('RF Engineer'),
    'r-phone': createElement('654321'),
    'r-city': createElement('Bengaluru'),
    'r-experience': createElement('5 years'),
    'r-organization': createElement('Navy'),
    'r-notice': createElement('30 days'),
    'r-skills': createElement('RF systems'),
    'r-linkedin': createElement(''),
    'r-statement': createElement('Interested in RF systems.'),
    'r-resume-file': createElement(),
  };
  elements['contact-full-form'].honeypot = createElement('');
  elements['recruiting-full-form'].honeypot = createElement('');
  elements['r-resume-file'].files = [
    new Blob(['mock resume'], { type: 'application/pdf' }),
  ];
  return elements;
}

async function submit(element) {
  const handler = element.getListener('submit');
  assert.equal(typeof handler, 'function');
  await handler({ preventDefault() {} });
}

test('homepage sends the contact action token and submitted honeypot value', async () => {
  const elements = makeHomeElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getPublicCatalog: CatalogService.getPublicCatalog,
    render: TurnstileService.render,
  };
  const requests = [];
  const widgets = [];
  CatalogService.getPublicCatalog = async () => ({ catalog: [] });
  TurnstileService.render = async (options) => {
    widgets.push(options);
    return createMockWidget();
  };
  ApiService.post = async (...args) => {
    requests.push(args);
    return { success: true, id: 'enquiry-test-id' };
  };

  try {
    initHomePage();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['home-contact-form']);

    assert.equal(widgets[0].action, 'contact_enquiry');
    assert.equal(requests[0][0], '/enquiries/contact');
    assert.equal(requests[0][1].website, 'bot-value');
    assert.equal(requests[0][2].headers['X-Turnstile-Token'], 'mock-turnstile-token');
    assert.equal(elements['home-contact-form'].submitButton.disabled, true);
  } finally {
    ApiService.post = previous.post;
    CatalogService.getPublicCatalog = previous.getPublicCatalog;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});

test('contact enquiry and careers submit their own actions and token headers', async () => {
  const elements = makeContactElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getData: ContentService.getData,
    render: TurnstileService.render,
  };
  const widgets = [];
  const requests = [];
  ContentService.getData = () => ({ careers: { resumeRequired: false } });
  TurnstileService.render = async (options) => {
    widgets.push(options);
    return createMockWidget(options.action);
  };
  ApiService.post = async (...args) => {
    requests.push(args);
    return { success: true, id: 'submission-test-id' };
  };

  try {
    initContactPage();
    await elements['tab-btn-recruiting'].getListener('click')();
    await new Promise((resolve) => setImmediate(resolve));

    assert.deepEqual(
      widgets.map(({ action }) => action),
      ['contact_enquiry', 'careers_application']
    );

    await submit(elements['contact-full-form']);
    await submit(elements['recruiting-full-form']);

    assert.equal(requests[0][0], '/enquiries/contact');
    assert.equal(requests[0][2].headers['X-Turnstile-Token'], 'contact_enquiry');
    assert.equal(requests[1][0], '/enquiries/careers');
    assert.equal(requests[1][1] instanceof FormData, true);
    assert.equal(requests[1][1].get('resume') instanceof Blob, true);
    assert.equal(requests[1][2].headers['X-Turnstile-Token'], 'careers_application');
    assert.equal('Content-Type' in requests[1][2].headers, false);
  } finally {
    ApiService.post = previous.post;
    ContentService.getData = previous.getData;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});

test('rejected verification resets the widget and permits a fresh-token retry', async () => {
  const elements = makeHomeElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getPublicCatalog: CatalogService.getPublicCatalog,
    render: TurnstileService.render,
  };
  let requestCount = 0;
  let widget;
  CatalogService.getPublicCatalog = async () => ({ catalog: [] });
  TurnstileService.render = async () => {
    widget = createMockWidget('expired-token');
    return widget;
  };
  ApiService.post = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      const error = new Error('Verification failed. Please try again.');
      error.status = 400;
      error.code = 'TURNSTILE_REJECTED';
      throw error;
    }
    return { success: true, id: 'enquiry-test-id' };
  };

  try {
    initHomePage();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['home-contact-form']);
    assert.equal(widget.getToken(), 'fresh-turnstile-token');
    assert.equal(elements['home-contact-status'].textContent, 'Verification failed. Please try again.');
    await submit(elements['home-contact-form']);
    assert.equal(requestCount, 2);
  } finally {
    ApiService.post = previous.post;
    CatalogService.getPublicCatalog = previous.getPublicCatalog;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});

test('saved-but-email-failed and unknown network outcomes block ordinary resubmission', async (t) => {
  for (const scenario of [
    {
      title: 'saved email failure',
      status: 502,
      code: 'ENQUIRY_SAVED_EMAIL_FAILED',
    },
    {
      title: 'unknown network result',
      status: 0,
      code: undefined,
    },
  ]) {
    await t.test(scenario.title, async () => {
      const elements = makeHomeElements();
      const restoreGlobals = setBrowserGlobals(elements);
      const previous = {
        post: ApiService.post,
        getPublicCatalog: CatalogService.getPublicCatalog,
        render: TurnstileService.render,
      };
      let requestCount = 0;
      CatalogService.getPublicCatalog = async () => ({ catalog: [] });
      TurnstileService.render = async () => createMockWidget();
      ApiService.post = async () => {
        requestCount += 1;
        const error = new Error('Submission status is uncertain.');
        error.status = scenario.status;
        error.code = scenario.code;
        throw error;
      };

      try {
        initHomePage();
        await new Promise((resolve) => setImmediate(resolve));
        await submit(elements['home-contact-form']);
        await submit(elements['home-contact-form']);
        assert.equal(requestCount, 1);
        assert.equal(elements['home-contact-form'].submitButton.disabled, true);
      } finally {
        ApiService.post = previous.post;
        CatalogService.getPublicCatalog = previous.getPublicCatalog;
        TurnstileService.render = previous.render;
        restoreGlobals();
      }
    });
  }
});

test('contact and careers preserve form values and lock after saved or unknown outcomes', async () => {
  const elements = makeContactElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getData: ContentService.getData,
    render: TurnstileService.render,
  };
  const requestCounts = { contact: 0, careers: 0 };
  ContentService.getData = () => ({ careers: { resumeRequired: false } });
  TurnstileService.render = async (options) => createMockWidget(options.action);
  ApiService.post = async (path) => {
    const formName = path.endsWith('/careers') ? 'careers' : 'contact';
    requestCounts[formName] += 1;
    const error = new Error(formName === 'contact'
      ? 'Your enquiry was received but could not be dispatched.'
      : 'Network failed.');
    error.status = formName === 'careers' ? 0 : 502;
    error.code = formName === 'careers'
      ? undefined
      : 'ENQUIRY_SAVED_EMAIL_FAILED';
    throw error;
  };

  try {
    initContactPage();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['contact-full-form']);
    await submit(elements['contact-full-form']);
    assert.equal(requestCounts.contact, 1);
    assert.equal(elements['inquiry-submit-btn'].disabled, true);
    assert.equal(elements['c-fullname'].value, 'Ada Lovelace');
    assert.match(elements['inquiry-form-error'].textContent, /received/i);

    await elements['tab-btn-recruiting'].getListener('click')();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['recruiting-full-form']);
    await submit(elements['recruiting-full-form']);
    assert.equal(requestCounts.careers, 1);
    assert.equal(elements['careers-submit-btn'].disabled, true);
    assert.equal(elements['r-fullname'].value, 'Grace Hopper');
    assert.match(elements['careers-form-error'].textContent, /may already have been received/i);
  } finally {
    ApiService.post = previous.post;
    ContentService.getData = previous.getData;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});

test('CAREER_SAVED_EMAIL_FAILED prevents a second careers submission', async () => {
  const elements = makeContactElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getData: ContentService.getData,
    render: TurnstileService.render,
  };
  let requestCount = 0;
  ContentService.getData = () => ({ careers: { resumeRequired: false } });
  TurnstileService.render = async (options) => createMockWidget(options.action);
  ApiService.post = async () => {
    requestCount += 1;
    const error = new Error('Your application was received but could not be dispatched.');
    error.status = 502;
    error.code = 'CAREER_SAVED_EMAIL_FAILED';
    throw error;
  };

  try {
    initContactPage();
    await elements['tab-btn-recruiting'].getListener('click')();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['recruiting-full-form']);
    await submit(elements['recruiting-full-form']);

    assert.equal(requestCount, 1);
    assert.equal(elements['careers-submit-btn'].disabled, true);
    assert.match(elements['careers-form-error'].textContent, /application was received/i);
  } finally {
    ApiService.post = previous.post;
    ContentService.getData = previous.getData;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});

test('homepage blocks submission when widget loading fails', async () => {
  const elements = makeHomeElements();
  const restoreGlobals = setBrowserGlobals(elements);
  const previous = {
    post: ApiService.post,
    getPublicCatalog: CatalogService.getPublicCatalog,
    render: TurnstileService.render,
  };
  let requestCount = 0;
  CatalogService.getPublicCatalog = async () => ({ catalog: [] });
  TurnstileService.render = async () => {
    throw new Error('mock script load failure');
  };
  ApiService.post = async () => {
    requestCount += 1;
    return { success: true };
  };

  try {
    initHomePage();
    await new Promise((resolve) => setImmediate(resolve));
    await submit(elements['home-contact-form']);
    assert.equal(requestCount, 0);
    assert.match(elements['home-contact-status'].textContent, /verification is unavailable/i);
  } finally {
    ApiService.post = previous.post;
    CatalogService.getPublicCatalog = previous.getPublicCatalog;
    TurnstileService.render = previous.render;
    restoreGlobals();
  }
});
