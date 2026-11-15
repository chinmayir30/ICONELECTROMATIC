import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ApiError,
  ApiService,
  isSubmissionOutcomeUnknown,
} from '../src/data/ApiService.js';

test('API requests preserve credentials and CSRF while adding request-specific headers', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions;
  ApiService.setCsrfToken('csrf-test-token');
  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, id: 'test-enquiry' }),
    };
  };

  try {
    const response = await ApiService.post(
      '/enquiries/contact',
      { fullname: 'Test' },
      { headers: { 'X-Turnstile-Token': 'mock-turnstile-token' } }
    );

    assert.equal(response.id, 'test-enquiry');
    assert.equal(requestOptions.credentials, 'include');
    assert.equal(requestOptions.headers['X-Turnstile-Token'], 'mock-turnstile-token');
    assert.equal(requestOptions.headers['X-CSRF-Token'], 'csrf-test-token');
    assert.equal(requestOptions.headers['Content-Type'], 'application/json');
  } finally {
    globalThis.fetch = previousFetch;
    ApiService.setCsrfToken(null);
  }
});

test('API FormData requests keep the browser multipart boundary and request headers', async () => {
  const previousFetch = globalThis.fetch;
  let requestOptions;
  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return {
      ok: true,
      status: 201,
      json: async () => ({ success: true, id: 'test-career' }),
    };
  };
  const formData = new FormData();
  formData.append('fullname', 'Test Candidate');

  try {
    await ApiService.post('/enquiries/careers', formData, {
      headers: { 'X-Turnstile-Token': 'mock-career-token' },
    });

    assert.equal(requestOptions.body, formData);
    assert.equal(requestOptions.headers['X-Turnstile-Token'], 'mock-career-token');
    assert.equal('Content-Type' in requestOptions.headers, false);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('API errors preserve stable backend error codes', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({
      success: false,
      code: 'TURNSTILE_REJECTED',
      message: 'Verification failed.',
    }),
  });

  test('submission outcome classification treats success-like and server failures as uncertain', () => {
    assert.equal(isSubmissionOutcomeUnknown({ status: 0 }), true);
    assert.equal(isSubmissionOutcomeUnknown({ status: 200 }), true);
    assert.equal(isSubmissionOutcomeUnknown({ status: 502 }), true);
    assert.equal(isSubmissionOutcomeUnknown({ status: 400 }), false);
    assert.equal(isSubmissionOutcomeUnknown(new Error('unexpected failure')), true);
  });

  try {
    await assert.rejects(
      ApiService.post('/enquiries/contact', {}, {
        headers: { 'X-Turnstile-Token': 'expired-token' },
      }),
      (error) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 400);
        assert.equal(error.code, 'TURNSTILE_REJECTED');
        return true;
      }
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});
