import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildTestRunnerArguments,
  resolveTestDatabaseUrl,
  resolveTestFiles,
} from "../scripts/run-tests.js";

const backendDirectory = fileURLToPath(new URL("..", import.meta.url));
const testRunnerPath = fileURLToPath(
  new URL("../scripts/run-tests.js", import.meta.url)
);
const safeTestDatabaseUrl =
  "postgresql://test:test@127.0.0.1:5433/icon_electromatic_test?schema=public";

test("a local GITHUB_ACTIONS flag cannot enable the CI database exception", () => {
  const result = spawnSync(process.execPath, [testRunnerPath], {
    cwd: backendDirectory,
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://127.0.0.1:5432/icon_ci_test?schema=public",
      TEST_DATABASE_URL: "",
      GITHUB_ACTIONS: "true",
      GITHUB_RUN_ID: "",
      GITHUB_WORKSPACE: "",
      GITHUB_WORKFLOW: "",
    },
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Backend tests only allow icon_electromatic_test on local port 5433/);
});

test("resolves selected test files relative to the backend directory", () => {
  const selectedFile = path.join(
    backendDirectory,
    "test",
    "turnstileVerification.test.js"
  );

  assert.deepEqual(
    resolveTestFiles(["test/turnstileVerification.test.js"]),
    [selectedFile]
  );
  assert.deepEqual(
    buildTestRunnerArguments([selectedFile]),
    ["--test", selectedFile]
  );
});

test("preserves full-suite runner arguments when no test files are supplied", () => {
  assert.deepEqual(resolveTestFiles([]), []);
  assert.deepEqual(buildTestRunnerArguments([]), ["--test"]);
});

test("rejects flags, directories, missing files, traversal, and duplicate paths", () => {
  const invalidArguments = [
    "--test",
    "test",
    "test/missing.test.js",
    "../.env",
    "test/../.env",
  ];

  for (const arg of invalidArguments) {
    assert.throws(() => resolveTestFiles([arg]));
  }

  assert.throws(
    () =>
      resolveTestFiles([
        "test/turnstileVerification.test.js",
        "./test/turnstileVerification.test.js",
      ]),
    /Duplicate test-file argument/
  );
});

test("rejects symlinks that resolve outside the test directory", (t) => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "backend-test-runner-")
  );
  const testDirectory = path.join(temporaryRoot, "test");
  const externalDirectory = path.join(temporaryRoot, "external");
  const externalTestFile = path.join(externalDirectory, "external.test.js");
  const externalLink = path.join(testDirectory, "external");

  try {
    mkdirSync(testDirectory);
    mkdirSync(externalDirectory);
    writeFileSync(externalTestFile, 'import "node:test";\n');
    try {
      symlinkSync(
        externalDirectory,
        externalLink,
        process.platform === "win32" ? "junction" : "dir"
      );
    } catch (error) {
      if (["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) {
        t.skip("Symlink creation is not permitted in this environment");
        return;
      }
      throw error;
    }

    assert.throws(
      () => resolveTestFiles(["test/external/external.test.js"], temporaryRoot),
      /inside the test directory/
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("forwards only a valid selected test file to Node's test runner", () => {
  const childEnvironment = {
    ...process.env,
    TEST_DATABASE_URL: safeTestDatabaseUrl,
  };
  delete childEnvironment.NODE_TEST_CONTEXT;

  const result = spawnSync(
    process.execPath,
    [testRunnerPath, "test/turnstileVerification.test.js"],
    {
      cwd: backendDirectory,
      encoding: "utf8",
      env: childEnvironment,
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /Siteverify posts the token and accepts the configured hostname and action/);
  assert.match(output, /# tests \d+/);
});

test("rejects invalid test-file arguments before starting Node's test runner", () => {
  const result = spawnSync(
    process.execPath,
    [testRunnerPath, "--test"],
    {
      cwd: backendDirectory,
      encoding: "utf8",
      env: {
        ...process.env,
        TEST_DATABASE_URL: safeTestDatabaseUrl,
      },
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid test-file argument/);
  assert.doesNotMatch(result.stdout, /TAP version/);
});

test("resolveTestDatabaseUrl prefers explicit TEST_DATABASE_URL over DATABASE_URL", () => {
  const explicitUrl = "postgresql://explicit:secret@127.0.0.1:5433/icon_electromatic_test";
  const fallbackUrl = "postgresql://fallback:secret@127.0.0.1:5433/icon_electromatic_test";
  const resolved = resolveTestDatabaseUrl({
    TEST_DATABASE_URL: explicitUrl,
    DATABASE_URL: fallbackUrl,
  });
  assert.equal(resolved, explicitUrl);
});

test("resolveTestDatabaseUrl falls back to DATABASE_URL when TEST_DATABASE_URL is absent or empty", () => {
  const fallbackUrl = "postgresql://fallback:secret@127.0.0.1:5433/icon_electromatic_test";
  assert.equal(
    resolveTestDatabaseUrl({ TEST_DATABASE_URL: "", DATABASE_URL: fallbackUrl }),
    fallbackUrl
  );
  assert.equal(
    resolveTestDatabaseUrl({ DATABASE_URL: fallbackUrl }),
    fallbackUrl
  );
});

test("resolveTestDatabaseUrl resolves DATABASE_URL from backend/.env when env variables are unset", () => {
  const resolved = resolveTestDatabaseUrl({}, backendDirectory);
  assert.ok(resolved.startsWith("postgresql://") || resolved.startsWith("postgres://"));
  const url = new URL(resolved);
  assert.equal(url.port, "5433");
  assert.equal(url.pathname, "/icon_electromatic_test");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
});

test("resolveTestDatabaseUrl throws when no TEST_DATABASE_URL or .env file is available", () => {
  const emptyDir = mkdtempSync(path.join(os.tmpdir(), "empty-test-dir-"));
  try {
    assert.throws(
      () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: "", DATABASE_URL: "" }, emptyDir),
      /Set TEST_DATABASE_URL to the local Docker test database before running backend tests/
    );
  } finally {
    rmSync(emptyDir, { recursive: true, force: true });
  }
});

test("resolveTestDatabaseUrl explicitly rejects port 5432 in local mode", () => {
  const port5432Url = "postgresql://test:test@127.0.0.1:5432/icon_electromatic_test";
  assert.throws(
    () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: port5432Url }),
    /Backend tests only allow icon_electromatic_test on local port 5433/
  );
  assert.throws(
    () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: "", DATABASE_URL: port5432Url }),
    /Backend tests only allow icon_electromatic_test on local port 5433/
  );
});

test("resolveTestDatabaseUrl explicitly rejects remote database hosts in local mode", () => {
  const remoteUrls = [
    "postgresql://test:test@db.example.com:5433/icon_electromatic_test",
    "postgresql://test:test@192.168.1.100:5433/icon_electromatic_test",
    "postgresql://test:test@aws.rds.amazonaws.com:5433/icon_electromatic_test",
  ];
  for (const remoteUrl of remoteUrls) {
    assert.throws(
      () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: remoteUrl }),
      /Backend tests only allow icon_electromatic_test on local port 5433/
    );
  }
});

test("resolveTestDatabaseUrl explicitly rejects production database names in local mode", () => {
  const prodUrls = [
    "postgresql://test:test@127.0.0.1:5433/icon_electromatic",
    "postgresql://test:test@127.0.0.1:5433/production",
    "postgresql://test:test@127.0.0.1:5433/",
  ];
  for (const prodUrl of prodUrls) {
    assert.throws(
      () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: prodUrl }),
      /Backend tests only allow icon_electromatic_test on local port 5433/
    );
  }
});

test("resolveTestDatabaseUrl rejects non-postgres protocols", () => {
  const invalidProtocols = [
    "http://127.0.0.1:5433/icon_electromatic_test",
    "mysql://test:test@127.0.0.1:5433/icon_electromatic_test",
    "mongodb://test:test@127.0.0.1:5433/icon_electromatic_test",
  ];
  for (const invalidUrl of invalidProtocols) {
    assert.throws(
      () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: invalidUrl }),
      /Backend tests only allow icon_electromatic_test on local port 5433/
    );
  }
});

test("resolveTestDatabaseUrl rejects invalid URLs without leaking credentials", () => {
  assert.throws(
    () => resolveTestDatabaseUrl({ TEST_DATABASE_URL: "not a valid url at all" }),
    (err) => {
      assert.equal(err.message, "The test database URL is invalid.");
      assert.doesNotMatch(err.message, /not a valid url/);
      return true;
    }
  );
});

test("resolveTestDatabaseUrl preserves GitHub Actions CI environment behaviour", () => {
  const ciEnv = {
    GITHUB_ACTIONS: "true",
    GITHUB_RUN_ID: "run-123",
    GITHUB_WORKSPACE: "/home/runner/work/repo",
    GITHUB_WORKFLOW: "Backend CI",
    DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/icon_ci_test",
  };

  // Valid CI database URL on port 5432 and /icon_ci_test
  assert.equal(
    resolveTestDatabaseUrl(ciEnv),
    "postgresql://postgres:postgres@127.0.0.1:5432/icon_ci_test"
  );

  // CI rejects port 5433 (local port)
  assert.throws(
    () =>
      resolveTestDatabaseUrl({
        ...ciEnv,
        DATABASE_URL: safeTestDatabaseUrl,
      }),
    /Backend tests only allow the isolated GitHub Actions test database/
  );

  // CI rejects remote hosts
  assert.throws(
    () =>
      resolveTestDatabaseUrl({
        ...ciEnv,
        DATABASE_URL: "postgresql://postgres:postgres@remote-host:5432/icon_ci_test",
      }),
    /Backend tests only allow the isolated GitHub Actions test database/
  );
});
