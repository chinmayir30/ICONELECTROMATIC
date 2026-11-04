import assert from 'node:assert/strict';
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keepAliveScript = path.join(repoRoot, 'scripts', 'supabase-keepalive.sh');

async function runKeepAlive({ url, key, httpStatus = '200', curlExit = 0 } = {}) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'supabase-keepalive-'));
  const binDir = path.join(tempDir, 'bin');
  const invokedPath = path.join(tempDir, 'curl-invoked');
  await mkdir(binDir);
  const fakeCurl = path.join(binDir, 'curl');
  const fakeCurlSource = [
    '#!/usr/bin/env bash',
    'printf \'%s\' "$*" > "$MOCK_CURL_INVOKED"',
    'printf \'%s\' "$MOCK_HTTP_STATUS"',
    'exit "$MOCK_CURL_EXIT"',
    ''
  ].join('\n');
  await writeFile(fakeCurl, fakeCurlSource);
  await chmod(fakeCurl, 0o755);

  const env = { ...process.env, PATH: binDir + path.delimiter + (process.env.PATH ?? ''),
    MOCK_CURL_INVOKED: invokedPath, MOCK_HTTP_STATUS: httpStatus, MOCK_CURL_EXIT: String(curlExit) };
  if (url === undefined) delete env.SUPABASE_URL;
  else env.SUPABASE_URL = url;
  if (key === undefined) delete env.SUPABASE_KEY;
  else env.SUPABASE_KEY = key;

  try {
    const result = spawnSync('bash', [keepAliveScript], { encoding: 'utf8', env });
    let curlArgs;
    try { curlArgs = await readFile(invokedPath, 'utf8'); } catch {}
    return { ...result, curlArgs };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test('fails before curl when Supabase credentials are missing', async () => {
  const result = await runKeepAlive({ url: '', key: 'test-key' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /URL and API key are required/i);
  assert.equal(result.curlArgs, undefined);
});

test('fails when Supabase returns a non-2xx status', async () => {
  const result = await runKeepAlive({ url: 'https://example.supabase.co/', key: 'test-key', httpStatus: '503' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HTTP 503/);
  assert.match(result.curlArgs, /https:\/\/example\.supabase\.co\/rest\/v1\/oems\?select=id&limit=1/);
});

test('fails when curl reports a transport error', async () => {
  const result = await runKeepAlive({ url: 'https://example.supabase.co', key: 'test-key', curlExit: 7 });
  assert.notEqual(result.status, 0);
});

test('succeeds when Supabase returns a 2xx status', async () => {
  const result = await runKeepAlive({ url: 'https://example.supabase.co', key: 'test-key', httpStatus: '204' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /request succeeded \(HTTP 204\)/);
});
