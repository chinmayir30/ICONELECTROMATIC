import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiService, ApiError } from '../src/data/ApiService.js';
import {
  extractToken,
  scrubUrlToken,
  renderVerifyRecoveryPage,
  initVerifyRecoveryPage,
  renderResetPasswordPage,
  initResetPasswordPage,
} from '../src/admin/PublicRecovery.js';
import { renderAccountSecurityTab, bindAccountSecurityEvents } from '../src/admin/AccountSecurity.js';

// ─── 1. ApiService Recovery Endpoints Contract Tests ─────────────────────────

test('ApiService.getRecoveryEmailStatus performs authenticated GET /auth/recovery-email', async () => {
  const previousFetch = globalThis.fetch;
  let requestedUrl = '';
  let requestOptions = null;

  globalThis.fetch = async (url, options) => {
    requestedUrl = url;
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          configured: true,
          maskedEmail: 'a***n@iconelectromatic.com',
          verified: true,
          verifiedAt: '2026-11-13T10:00:00.000Z',
        },
      }),
    };
  };

  try {
    const data = await ApiService.getRecoveryEmailStatus();
    assert.ok(requestedUrl.endsWith('/auth/recovery-email'));
    assert.equal(requestOptions.method, 'GET');
    assert.equal(requestOptions.credentials, 'include');
    assert.equal(data.configured, true);
    assert.equal(data.maskedEmail, 'a***n@iconelectromatic.com');
    assert.equal(data.verified, true);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('ApiService.requestRecoveryEmailChange sends POST /auth/recovery-email/request with CSRF and payload', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;
  ApiService.setCsrfToken('mock-csrf-recovery');

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Verification email sent to the proposed recovery address.',
      }),
    };
  };

  try {
    const res = await ApiService.requestRecoveryEmailChange('proposed@example.com', 'mypassword12345');
    assert.equal(requestOptions.method, 'POST');
    assert.equal(requestOptions.credentials, 'include');
    assert.equal(requestOptions.headers['X-CSRF-Token'], 'mock-csrf-recovery');
    assert.deepEqual(JSON.parse(requestOptions.body), {
      newRecoveryEmail: 'proposed@example.com',
      password: 'mypassword12345',
    });
    assert.equal(res.success, true);
    assert.ok(res.message.includes('Verification email sent'));
  } finally {
    globalThis.fetch = previousFetch;
    ApiService.setCsrfToken(null);
  }
});

test('ApiService.confirmRecoveryEmail performs public POST /auth/recovery-email/confirm with token', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;
  const token = 'a'.repeat(64);

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Recovery email verified successfully.',
      }),
    };
  };

  try {
    const res = await ApiService.confirmRecoveryEmail(token);
    assert.equal(requestOptions.method, 'POST');
    assert.deepEqual(JSON.parse(requestOptions.body), { token });
    assert.equal(res.success, true);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('ApiService.removeRecoveryEmail sends POST /auth/recovery-email/remove with password confirmation', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;
  ApiService.setCsrfToken('csrf-remove');

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Recovery email removed successfully.',
      }),
    };
  };

  try {
    const res = await ApiService.removeRecoveryEmail('currentpass1234');
    assert.equal(requestOptions.method, 'POST');
    assert.equal(requestOptions.headers['X-CSRF-Token'], 'csrf-remove');
    assert.deepEqual(JSON.parse(requestOptions.body), { password: 'currentpass1234' });
    assert.equal(res.success, true);
  } finally {
    globalThis.fetch = previousFetch;
    ApiService.setCsrfToken(null);
  }
});

test('ApiService.forgotPassword sends public POST /auth/forgot-password and returns uniform message', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'If an active account exists with a verified recovery address, a password reset link has been dispatched.',
      }),
    };
  };

  try {
    const res = await ApiService.forgotPassword('admin@iconelectromatic.com');
    assert.equal(requestOptions.method, 'POST');
    assert.deepEqual(JSON.parse(requestOptions.body), { email: 'admin@iconelectromatic.com' });
    assert.equal(res.success, true);
    assert.ok(res.message.includes('If an active account exists'));
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('ApiService.forgotPassword sends public POST /auth/forgot-password with verified recovery email', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'If an active account exists with a verified recovery address, a password reset link has been dispatched.',
      }),
    };
  };

  try {
    const res = await ApiService.forgotPassword('personal.recovery@example.com');
    assert.equal(requestOptions.method, 'POST');
    assert.deepEqual(JSON.parse(requestOptions.body), { email: 'personal.recovery@example.com' });
    assert.equal(res.success, true);
    assert.ok(res.message.includes('If an active account exists'));
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('ApiService.resetPassword sends public POST /auth/reset-password and purges CSRF token on success', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions = null;
  const token = 'b'.repeat(64);
  ApiService.setCsrfToken('stale-session-csrf');

  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Password reset successfully. All active sessions have been terminated.',
      }),
    };
  };

  try {
    const res = await ApiService.resetPassword(token, 'newSecretPassword1234!', 'newSecretPassword1234!');
    assert.equal(requestOptions.method, 'POST');
    assert.deepEqual(JSON.parse(requestOptions.body), {
      token,
      newPassword: 'newSecretPassword1234!',
      confirmPassword: 'newSecretPassword1234!',
    });
    assert.equal(res.success, true);
    // CSRF token must be purged upon successful password reset
    assert.equal(ApiService.getCsrfToken(), null);
  } finally {
    globalThis.fetch = previousFetch;
    ApiService.setCsrfToken(null);
  }
});

// ─── 2. Token Extraction & Address Bar URL Scrubbing ─────────────────────────

test('extractToken extracts token safely from router query parameters or location search', () => {
  const tokenValue = 'c'.repeat(64);
  const paramsWithToken = {
    _query: new URLSearchParams(`token=${tokenValue}`),
  };
  assert.equal(extractToken(paramsWithToken), tokenValue);
  assert.equal(extractToken({ _query: new URLSearchParams() }), '');
  assert.equal(extractToken(null), '');
});

test('scrubUrlToken strips query parameters via history.replaceState preserving history.state', () => {
  const previousWindow = globalThis.window;
  let replaceStateCalledWith = null;

  globalThis.window = {
    location: {
      pathname: '/admin/verify-recovery',
      search: '?token=secret1234567890',
      hash: '',
    },
    history: {
      state: { scrollPos: 120 },
      replaceState: (state, title, url) => {
        replaceStateCalledWith = { state, title, url };
      },
    },
  };

  try {
    scrubUrlToken();
    assert.ok(replaceStateCalledWith);
    assert.deepEqual(replaceStateCalledWith.state, { scrollPos: 120 });
    assert.equal(replaceStateCalledWith.url, '/admin/verify-recovery');
    assert.equal(replaceStateCalledWith.url.includes('token='), false);
  } finally {
    globalThis.window = previousWindow;
  }
});

// ─── 3. DOM & Interaction Helper Setup ───────────────────────────────────────

function createMockElement(id = '', tag = 'div') {
  const listeners = new Map();
  const attributes = new Map();
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    type: '',
    className: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
    },
    setAttribute(name, val) {
      attributes.set(name, String(val));
    },
    getAttribute(name) {
      return attributes.get(name) || null;
    },
    addEventListener(event, fn) {
      listeners.set(event, fn);
    },
    dispatchEvent(event) {
      const fn = listeners.get(event);
      if (fn) return fn({ preventDefault: () => {}, currentTarget: this });
    },
    click() {
      const fn = listeners.get('click');
      if (fn) return fn({ preventDefault: () => {}, currentTarget: this });
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function setupMockDom(elementMap = {}) {
  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;

  globalThis.document = {
    getElementById: (id) => elementMap[id] || null,
    querySelector: (selector) => {
      const id = selector.replace(/^[#.]/, '');
      return elementMap[id] || null;
    },
    querySelectorAll: () => [],
    createElement: (tag) => createMockElement('', tag),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };

  globalThis.window = {
    location: {
      pathname: '/admin',
      search: '',
      hash: '',
    },
    history: {
      state: null,
      replaceState: () => {},
    },
  };

  return () => {
    globalThis.document = prevDoc;
    globalThis.window = prevWin;
  };
}

// ─── 4. Public Verification Page Interactive Flow ────────────────────────────

test('initVerifyRecoveryPage does not consume token on load and consumes strictly upon user click', async () => {
  const validToken = 'e'.repeat(64);
  let confirmApiCalledWith = null;
  const previousFetch = globalThis.fetch;

  globalThis.fetch = async (_url, options) => {
    confirmApiCalledWith = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Recovery email verified successfully.' }),
    };
  };

  const confirmBtn = createMockElement('a-confirm-verify-btn', 'button');
  const verifyState = createMockElement('a-verify-state');
  const verifyError = createMockElement('a-verify-error');
  const verifyCard = createMockElement('a-verify-card');

  const teardown = setupMockDom({
    'a-confirm-verify-btn': confirmBtn,
    'a-verify-state': verifyState,
    'a-verify-error': verifyError,
    'a-verify-card': verifyCard,
  });

  try {
    initVerifyRecoveryPage({
      _query: new URLSearchParams(`token=${validToken}`),
    });

    // On page load: API must NOT have been called
    assert.equal(confirmApiCalledWith, null);

    // User explicitly clicks confirm button
    await confirmBtn.click();

    // Now API must be called with the exact token
    assert.ok(confirmApiCalledWith);
    assert.equal(confirmApiCalledWith.token, validToken);
    assert.ok(verifyState.innerHTML.includes('Verification Complete'));
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

test('initVerifyRecoveryPage shows error and rejects malformed tokens without calling API', async () => {
  let confirmApiCalled = false;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    confirmApiCalled = true;
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  };

  const verifyState = createMockElement('a-verify-state');
  const teardown = setupMockDom({ 'a-verify-state': verifyState });

  try {
    initVerifyRecoveryPage({
      _query: new URLSearchParams('token=invalid-short-token'),
    });

    assert.equal(confirmApiCalled, false);
    assert.ok(verifyState.innerHTML.includes('Invalid Verification Link'));
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

// ─── 5. Public Reset Password Interactive Flow ───────────────────────────────

test('initResetPasswordPage enforces client-side password policy (14-1024 chars and match)', async () => {
  const validToken = 'f'.repeat(64);
  let resetApiPayload = null;
  const previousFetch = globalThis.fetch;

  globalThis.fetch = async (_url, options) => {
    resetApiPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: 'Password reset successfully.' }),
    };
  };

  const newPassInput = createMockElement('a-new-password', 'input');
  const confirmPassInput = createMockElement('a-confirm-password', 'input');
  const submitBtn = createMockElement('a-submit-reset-btn', 'button');
  const resetForm = createMockElement('a-reset-form', 'form');
  const resetError = createMockElement('a-reset-error');
  const resetState = createMockElement('a-reset-state');

  const teardown = setupMockDom({
    'a-new-password': newPassInput,
    'a-confirm-password': confirmPassInput,
    'a-submit-reset-btn': submitBtn,
    'a-reset-form': resetForm,
    'a-reset-error': resetError,
    'a-reset-state': resetState,
  });

  try {
    initResetPasswordPage({
      _query: new URLSearchParams(`token=${validToken}`),
    });

    // 1. Password under 14 characters -> rejected client-side
    newPassInput.value = 'short-pass';
    confirmPassInput.value = 'short-pass';
    resetForm.dispatchEvent('submit');
    assert.equal(resetApiPayload, null);
    assert.ok(resetError.textContent.includes('at least 14 characters'));

    // 2. Mismatched passwords -> rejected client-side
    newPassInput.value = 'long-enough-password-1234';
    confirmPassInput.value = 'different-password-1234';
    resetForm.dispatchEvent('submit');
    assert.equal(resetApiPayload, null);
    assert.ok(resetError.textContent.includes('do not match'));

    // 3. Valid password (>= 14 characters, matching) -> submitted
    newPassInput.value = 'correct-horse-battery-staple-secure';
    confirmPassInput.value = 'correct-horse-battery-staple-secure';
    resetForm.dispatchEvent('submit');

    // Wait microtask
    await Promise.resolve();
    assert.ok(resetApiPayload);
    assert.equal(resetApiPayload.token, validToken);
    assert.equal(resetApiPayload.newPassword, 'correct-horse-battery-staple-secure');
    assert.equal(resetApiPayload.confirmPassword, 'correct-horse-battery-staple-secure');
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

// ─── 6. Authenticated Account Security View Rendering ────────────────────────

test('renderAccountSecurityTab renders initial container shell', () => {
  const html = renderAccountSecurityTab();
  assert.ok(html.includes('Account Security &amp; Password Recovery'));
  assert.ok(html.includes('id="a-security-content"'));
  assert.ok(html.includes('id="a-security-modal-slot"'));
});

test('bindAccountSecurityEvents loads and renders verified recovery email status', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        configured: true,
        maskedEmail: 'r***y@domain.com',
        verified: true,
        verifiedAt: '2026-11-13T12:00:00.000Z',
      },
    }),
  });

  const contentSlot = createMockElement('a-security-content');
  const modalSlot = createMockElement('a-security-modal-slot');
  const teardown = setupMockDom({
    'a-security-content': contentSlot,
    'a-security-modal-slot': modalSlot,
  });

  try {
    await bindAccountSecurityEvents();

    assert.ok(contentSlot.innerHTML.includes('r***y@domain.com'));
    assert.ok(contentSlot.innerHTML.includes('Active &amp; Verified'));
    assert.ok(contentSlot.innerHTML.includes('Change Address'));
    assert.ok(contentSlot.innerHTML.includes('Remove'));
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

test('bindAccountSecurityEvents renders unverified login email with "Verify Login Email" action', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        configured: true,
        maskedEmail: 'a***n@iconelectromatic.com',
        verified: false,
        verifiedAt: null,
        loginEmail: 'admin@iconelectromatic.com',
        maskedLoginEmail: 'a***n@iconelectromatic.com',
        isDefaultLoginEmail: true,
      },
    }),
  });

  const contentSlot = createMockElement('a-security-content');
  const modalSlot = createMockElement('a-security-modal-slot');
  const teardown = setupMockDom({
    'a-security-content': contentSlot,
    'a-security-modal-slot': modalSlot,
  });

  try {
    await bindAccountSecurityEvents();

    assert.ok(contentSlot.innerHTML.includes('a***n@iconelectromatic.com'));
    assert.ok(contentSlot.innerHTML.includes('Pending Verification'));
    assert.ok(contentSlot.innerHTML.includes('Verify Login Email'));
    assert.ok(contentSlot.innerHTML.includes('Add Personal Recovery Email'));
    // Must not show remove button for default login email
    assert.equal(contentSlot.innerHTML.includes('id="a-open-remove-btn"'), false);
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

test('bindAccountSecurityEvents renders verified default login email without remove button', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        configured: true,
        maskedEmail: 'a***n@iconelectromatic.com',
        verified: true,
        verifiedAt: '2026-11-14T10:00:00.000Z',
        loginEmail: 'admin@iconelectromatic.com',
        maskedLoginEmail: 'a***n@iconelectromatic.com',
        isDefaultLoginEmail: true,
      },
    }),
  });

  const contentSlot = createMockElement('a-security-content');
  const modalSlot = createMockElement('a-security-modal-slot');
  const teardown = setupMockDom({
    'a-security-content': contentSlot,
    'a-security-modal-slot': modalSlot,
  });

  try {
    await bindAccountSecurityEvents();

    assert.ok(contentSlot.innerHTML.includes('a***n@iconelectromatic.com'));
    assert.ok(contentSlot.innerHTML.includes('Active &amp; Verified'));
    assert.ok(contentSlot.innerHTML.includes('Add Personal Recovery Email'));
    assert.equal(contentSlot.innerHTML.includes('id="a-open-remove-btn"'), false);
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});

test('bindAccountSecurityEvents renders change form with password visibility toggle markup', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        configured: true,
        maskedEmail: 'r***y@domain.com',
        verified: true,
        verifiedAt: '2026-11-13T12:00:00.000Z',
      },
    }),
  });

  const contentSlot = createMockElement('a-security-content');
  const modalSlot = createMockElement('a-security-modal-slot');
  const changeBtn = createMockElement('a-toggle-change-btn');
  const cancelBtn = createMockElement('a-cancel-change-btn');
  const teardown = setupMockDom({
    'a-security-content': contentSlot,
    'a-security-modal-slot': modalSlot,
    'a-toggle-change-btn': changeBtn,
    'a-cancel-change-btn': cancelBtn,
  });

  try {
    await bindAccountSecurityEvents();
    // Reveal the change form
    changeBtn.click();

    // Verify HTML contains the password input and eye toggle button with accessibility attributes
    assert.ok(contentSlot.innerHTML.includes('id="a-stepup-password"'));
    assert.ok(contentSlot.innerHTML.includes('type="password"'));
    assert.ok(contentSlot.innerHTML.includes('id="a-toggle-stepup-password"'));
    assert.ok(contentSlot.innerHTML.includes('class="a-password-toggle-btn"'));
    assert.ok(contentSlot.innerHTML.includes('id="a-stepup-password-eye"'));
    assert.ok(contentSlot.innerHTML.includes('aria-label="Show password"'));
    assert.ok(contentSlot.innerHTML.includes('aria-controls="a-stepup-password"'));
  } finally {
    cancelBtn.click();
    teardown();
    globalThis.fetch = previousFetch;
  }
});

test('password visibility toggle reveals and hides stepup password without modifying value', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        configured: true,
        maskedEmail: 'r***y@domain.com',
        verified: true,
        verifiedAt: '2026-11-13T12:00:00.000Z',
      },
    }),
  });

  const contentSlot = createMockElement('a-security-content');
  const modalSlot = createMockElement('a-security-modal-slot');
  const toggleBtn = createMockElement('a-toggle-stepup-password', 'button');
  const passwordInput = createMockElement('a-stepup-password', 'input');
  passwordInput.type = 'password';
  const eyeIcon = createMockElement('a-stepup-password-eye', 'i');
  eyeIcon.className = 'fa-solid fa-eye';

  const teardown = setupMockDom({
    'a-security-content': contentSlot,
    'a-security-modal-slot': modalSlot,
    'a-toggle-stepup-password': toggleBtn,
    'a-stepup-password': passwordInput,
    'a-stepup-password-eye': eyeIcon,
  });

  try {
    await bindAccountSecurityEvents();

    // Set initial password value
    passwordInput.value = 'MySecretAdminPassword123!';

    // Verify initial state: hidden by default
    assert.equal(passwordInput.type, 'password');

    // First click: reveal password
    toggleBtn.click();
    assert.equal(passwordInput.type, 'text');
    assert.equal(passwordInput.value, 'MySecretAdminPassword123!');
    assert.equal(eyeIcon.className, 'fa-solid fa-eye-slash');
    assert.equal(toggleBtn.getAttribute('aria-label'), 'Hide password');
    assert.equal(toggleBtn.getAttribute('title'), 'Hide password');

    // Second click: hide password
    toggleBtn.click();
    assert.equal(passwordInput.type, 'password');
    assert.equal(passwordInput.value, 'MySecretAdminPassword123!');
    assert.equal(eyeIcon.className, 'fa-solid fa-eye');
    assert.equal(toggleBtn.getAttribute('aria-label'), 'Show password');
    assert.equal(toggleBtn.getAttribute('title'), 'Show password');
  } finally {
    teardown();
    globalThis.fetch = previousFetch;
  }
});
