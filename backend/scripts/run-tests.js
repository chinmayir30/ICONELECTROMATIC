import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const backendDirectory = fileURLToPath(new URL("../", import.meta.url));

export function resolveTestFiles(args, rootDirectory = backendDirectory) {
  const testDirectory = realpathSync(path.join(rootDirectory, "test"));
  const resolvedFiles = [];
  const seenFiles = new Set();

  for (const arg of args) {
    if (
      typeof arg !== "string" ||
      !arg ||
      arg.startsWith("-") ||
      arg.includes("\0") ||
      path.isAbsolute(arg) ||
      path.win32.isAbsolute(arg) ||
      arg.split(/[\\/]+/).includes("..")
    ) {
      throw new Error(`Invalid test-file argument: ${String(arg)}`);
    }

    const candidatePath = path.resolve(rootDirectory, arg);
    let realPath;
    try {
      realPath = realpathSync(candidatePath);
    } catch {
      throw new Error(`Test file does not exist: ${arg}`);
    }

    const relativeToTestDirectory = path.relative(testDirectory, realPath);
    if (
      relativeToTestDirectory === "" ||
      relativeToTestDirectory.startsWith(`..${path.sep}`) ||
      relativeToTestDirectory === ".." ||
      path.isAbsolute(relativeToTestDirectory)
    ) {
      throw new Error(`Test file must be inside the test directory: ${arg}`);
    }

    if (path.extname(realPath) !== ".js" || !realPath.endsWith(".test.js")) {
      throw new Error(`Test file must have a .test.js extension: ${arg}`);
    }

    const fileStat = statSync(realPath);
    if (!fileStat.isFile()) {
      throw new Error(`Test-file argument must be a file: ${arg}`);
    }

    const duplicateKey =
      process.platform === "win32" ? realPath.toLowerCase() : realPath;
    if (seenFiles.has(duplicateKey)) {
      throw new Error(`Duplicate test-file argument: ${arg}`);
    }

    seenFiles.add(duplicateKey);
    resolvedFiles.push(realPath);
  }

  return resolvedFiles;
}

export function buildTestRunnerArguments(testFiles) {
  return ["--test", ...testFiles];
}

export function resolveTestDatabaseUrl(
  env = process.env,
  rootDirectory = backendDirectory
) {
  const isGitHubActions =
    env.GITHUB_ACTIONS === "true" &&
    Boolean(env.GITHUB_RUN_ID) &&
    Boolean(env.GITHUB_WORKSPACE) &&
    Boolean(env.GITHUB_WORKFLOW);

  let databaseUrl =
    typeof env.TEST_DATABASE_URL === "string" && env.TEST_DATABASE_URL.trim()
      ? env.TEST_DATABASE_URL.trim()
      : "";

  if (!databaseUrl) {
    if (isGitHubActions) {
      databaseUrl =
        typeof env.DATABASE_URL === "string" && env.DATABASE_URL.trim()
          ? env.DATABASE_URL.trim()
          : "";
    } else {
      if (typeof env.DATABASE_URL === "string" && env.DATABASE_URL.trim()) {
        databaseUrl = env.DATABASE_URL.trim();
      } else {
        const envPath = path.resolve(rootDirectory, ".env");
        if (existsSync(envPath)) {
          try {
            const parsed = dotenv.parse(readFileSync(envPath, "utf8"));
            if (typeof parsed.DATABASE_URL === "string" && parsed.DATABASE_URL.trim()) {
              databaseUrl = parsed.DATABASE_URL.trim();
            }
          } catch {
            // Ignore file read or parse error and fall through
          }
        }
      }
    }
  }

  if (!databaseUrl) {
    throw new Error(
      "Set TEST_DATABASE_URL to the local Docker test database before running backend tests."
    );
  }

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("The test database URL is invalid.");
  }

  const expectedPort = isGitHubActions ? "5432" : "5433";
  const expectedDatabase = isGitHubActions
    ? "/icon_ci_test"
    : "/icon_electromatic_test";
  const isLoopback = ["localhost", "127.0.0.1"].includes(url.hostname);

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !isLoopback ||
    url.port !== expectedPort ||
    url.pathname !== expectedDatabase
  ) {
    throw new Error(
      isGitHubActions
        ? "Backend tests only allow the isolated GitHub Actions test database."
        : "Backend tests only allow icon_electromatic_test on local port 5433."
    );
  }

  return databaseUrl;
}

function runTests(args = process.argv.slice(2)) {
  let testDatabaseUrl;
  let testFiles;
  try {
    testDatabaseUrl = resolveTestDatabaseUrl();
    testFiles = resolveTestFiles(args);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const result = spawnSync(
    process.execPath,
    buildTestRunnerArguments(testFiles),
    {
      env: {
        ...process.env,
        CI: "true",
        NODE_ENV: "test",
        TEST_DATABASE_URL: testDatabaseUrl,
      },
      stdio: "inherit",
    }
  );

  if (result.error) {
    console.error("Could not start the backend test runner:", result.error.message);
    process.exitCode = 1;
  } else {
    process.exitCode = result.status ?? 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runTests();
}
