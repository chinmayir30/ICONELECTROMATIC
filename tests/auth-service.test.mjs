import assert from 'node:assert/strict';
import { register } from 'node:module';
import test from 'node:test';

register(`data:text/javascript,
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('authService.js')) {
    const source = Buffer.from(result.source).toString('utf8')
      .replaceAll('import.meta.env', '(globalThis.__vite_env || {})');
    return { format: 'module', shortCircuit: true, source };
  }
  return result;
}
`, import.meta.url);

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

async function loadAuth(env, label) {
  globalThis.__vite_env = env;
  return (await import(`../src/services/authService.js?${label}`)).authService;
}

test('local demo auth needs DEV, the flag, and missing Supabase config', async () => {
  values.clear();
  const auth = await loadAuth({ DEV: true, VITE_ENABLE_DEMO_ADMIN: 'true' }, 'demo');
  assert.equal(auth.isDemoEnabled, true);
  const session = await auth.signIn('developer@example.test', 'local-password');
  assert.match(session.access_token, /^mock_staff_token_/);
  assert.equal(auth.isAuthenticated(), true);
  assert.equal(await auth.getValidToken(), session.access_token);
  await auth.signOut();
});

test('unconfigured development without the flag rejects mock sign-in and existing sessions', async () => {
  values.clear();
  const auth = await loadAuth({ DEV: true, VITE_ENABLE_DEMO_ADMIN: 'false' }, 'disabled');
  await assert.rejects(auth.signIn('staff@example.test', 'password123'), /Supabase is not configured/);
  localStorage.setItem('icon_staff_session', JSON.stringify({ access_token: 'mock_existing', user: {} }));
  localStorage.setItem('icon_staff_token', 'mock_existing');
  assert.equal(auth.getSession(), null);
  assert.equal(await auth.getValidToken(), null);
  localStorage.setItem('icon_staff_session', JSON.stringify({ access_token: 'unverified_existing', user: {} }));
  assert.equal(auth.getSession(), null);
});

test('production cannot enable mock auth with the demo flag', async () => {
  values.clear();
  const auth = await loadAuth({ DEV: false, VITE_ENABLE_DEMO_ADMIN: 'true' }, 'production');
  assert.equal(auth.isDemoEnabled, false);
  await assert.rejects(auth.signIn('staff@example.test', 'password123'), /Supabase is not configured/);
});

test('configured Supabase sign-in remains available', async () => {
  values.clear();
  const auth = await loadAuth({ DEV: false, VITE_SUPABASE_URL: 'https://project.example.test', VITE_SUPABASE_ANON_KEY: 'public-test-key' }, 'supabase');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://project.example.test/auth/v1/token?grant_type=password');
    assert.equal(options.method, 'POST');
    return { ok: true, json: async () => ({ access_token: 'supabase-jwt', user: { id: 'staff-1' } }) };
  };
  const session = await auth.signIn('staff@example.test', 'password123');
  assert.equal(session.access_token, 'supabase-jwt');
  assert.equal(auth.isAuthenticated(), true);
});

test('configured Supabase token refresh continues to refresh expiring sessions', async () => {
  values.clear();
  const auth = await loadAuth({ DEV: false, VITE_SUPABASE_URL: 'https://project.example.test', VITE_SUPABASE_ANON_KEY: 'public-test-key' }, 'refresh');
  localStorage.setItem('icon_staff_session', JSON.stringify({
    access_token: 'old-jwt', refresh_token: 'test-refresh-token', expires_at: Math.floor(Date.now() / 1000) + 60, user: { id: 'staff-1' },
  }));
  localStorage.setItem('icon_staff_token', 'old-jwt');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://project.example.test/auth/v1/token?grant_type=refresh_token');
    assert.equal(JSON.parse(options.body).refresh_token, 'test-refresh-token');
    return { ok: true, json: async () => ({ access_token: 'new-jwt', refresh_token: 'new-refresh', expires_in: 3600 }) };
  };
  assert.equal(await auth.getValidToken(), 'new-jwt');
  assert.equal(JSON.parse(localStorage.getItem('icon_staff_session')).access_token, 'new-jwt');
});

test('configured Supabase prevents demo mode even when the local demo flag is true', async () => {
  const auth = await loadAuth({ DEV: true, VITE_ENABLE_DEMO_ADMIN: 'true', VITE_SUPABASE_URL: 'https://project.example.test', VITE_SUPABASE_ANON_KEY: 'public-test-key' }, 'configured-demo-flag');
  assert.equal(auth.isConfigured, true);
  assert.equal(auth.isDemoEnabled, false);
});

