import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const testDirectory = resolve('tests');
const testFiles = readdirSync(testDirectory)
  .filter((fileName) => fileName.endsWith('.test.mjs'))
  .sort()
  .map((fileName) => resolve(testDirectory, fileName));

if (testFiles.length === 0) {
  console.error('No Node test files were found in the tests directory.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error('Unable to start the Node test runner:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
