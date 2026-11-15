import "dotenv/config";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPasswordHash,
  validatePasswordPolicy,
} from "../src/auth/security.js";
import { createPrismaClient as makePrismaClient } from "../src/prismaClient.js";

export function ask(question, input = process.stdin, output = process.stdout) {
  const readline = createInterface({
    input,
    output,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

export function askHidden(question, input = process.stdin, output = process.stdout) {
  if (!input.isTTY || !output.isTTY) {
    return Promise.reject(new Error("Interactive terminal required."));
  }

  return new Promise((resolve, reject) => {
    let value = "";

    function finish(error) {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      output.write("\n");
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }

    function onData(chunk) {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Password reset cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          value = Array.from(value).slice(0, -1).join("");
        } else if (character >= " ") {
          value += character;
        }
      }
    }

    output.write(question);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

export function validateAdminEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    email.length === 0 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Invalid administrator email.");
  }
  return email;
}

export const APPROVED_LOCAL_TARGETS = Object.freeze({
  TEST: Object.freeze({
    allowedHosts: Object.freeze(["127.0.0.1", "localhost"]),
    port: 5433,
    databaseName: "icon_electromatic_test",
  }),
  LOCAL_DEV: Object.freeze({
    allowedHosts: Object.freeze(["127.0.0.1", "localhost"]),
    port: 5432,
    databaseName: "icon_electromatic",
  }),
});

export function parseAndValidateDatabaseUrl(databaseUrl) {
  if (!databaseUrl || typeof databaseUrl !== "string") {
    throw new Error("DATABASE_URL is required and must be a valid string.");
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl.replace(/^postgres:\/\//, "postgresql://"));
  } catch (err) {
    throw new Error("Invalid database URL format.");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error(
      `Disallowed database protocol "${parsed.protocol}". Must be postgresql: or postgres:`
    );
  }

  const hostname = (parsed.hostname || "").toLowerCase().trim();
  const port = parsed.port ? Number.parseInt(parsed.port, 10) : 5432;
  const databaseName = (parsed.pathname || "").replace(/^\//, "").trim();

  if (!databaseName) {
    throw new Error("Database name is missing in database URL pathname.");
  }

  return { hostname, port, databaseName };
}

export function verifySafeDatabaseTarget(
  databaseUrl,
  { allowLocalDev = false } = {}
) {
  const { hostname, port, databaseName } =
    parseAndValidateDatabaseUrl(databaseUrl);

  // 1. Strict prohibition of remote or production databases:
  //    Host must be strictly 127.0.0.1 or localhost.
  const isLocalHost = hostname === "127.0.0.1" || hostname === "localhost";
  if (!isLocalHost) {
    throw new Error(
      `SAFETY VIOLATION: Database host "${hostname}" is remote. Production and remote database targets are strictly forbidden.`
    );
  }

  // Also block any URLs with production indicators regardless of host
  if (
    databaseName.toLowerCase().includes("prod") ||
    hostname.includes("prod")
  ) {
    throw new Error(
      "SAFETY VIOLATION: Production database targets are strictly forbidden."
    );
  }

  // 2. Port 5432 check: blocked by default to protect local dev database
  if (port === APPROVED_LOCAL_TARGETS.LOCAL_DEV.port) {
    if (!allowLocalDev) {
      throw new Error(
        "SAFETY VIOLATION: PostgreSQL port 5432 is blocked by default to protect the local development database. Explicit authorization (ALLOW_LOCAL_PORT_5432=true or --allow-local-db) is required."
      );
    }

    // With explicit authorization, verify exact approved local database name
    if (databaseName !== APPROVED_LOCAL_TARGETS.LOCAL_DEV.databaseName) {
      throw new Error(
        `SAFETY VIOLATION: Port 5432 database "${databaseName}" does not match approved local database name "${APPROVED_LOCAL_TARGETS.LOCAL_DEV.databaseName}".`
      );
    }

    return {
      targetType: "LOCAL_DEV",
      hostname,
      port,
      databaseName,
    };
  }

  // 3. Port 5433 check: verify exact approved test database name
  if (port === APPROVED_LOCAL_TARGETS.TEST.port) {
    if (databaseName !== APPROVED_LOCAL_TARGETS.TEST.databaseName) {
      throw new Error(
        `SAFETY VIOLATION: Port 5433 database "${databaseName}" does not match approved test database name "${APPROVED_LOCAL_TARGETS.TEST.databaseName}".`
      );
    }

    return {
      targetType: "TEST",
      hostname,
      port,
      databaseName,
    };
  }

  // 4. Any other port is unrecognized and rejected
  throw new Error(
    `SAFETY VIOLATION: Database port ${port} is not an approved local database target (approved: 5433 for test, 5432 with explicit authorization for local dev).`
  );
}

export async function runResetAdminPassword({
  args = process.argv.slice(2),
  env = process.env,
  input = process.stdin,
  output = process.stdout,
  errorOutput = process.stderr,
  promptAsk = null,
  promptHidden = null,
  createPrismaClient = null,
} = {}) {
  let prismaClient;
  try {
    // 1. Never accept passwords via command-line arguments
    for (const arg of args) {
      if (
        arg.startsWith("--password") ||
        arg.startsWith("-p") ||
        arg.startsWith("--pass")
      ) {
        throw new Error(
          "Passwords must never be passed as command-line arguments."
        );
      }
    }

    // 2. Check for explicit local dev authorization
    const allowLocalDev =
      args.includes("--allow-local-db") || env.ALLOW_LOCAL_PORT_5432 === "true";

    // 3. Resolve administrator email from arguments or interactive prompt
    let rawEmail = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--email" && i + 1 < args.length) {
        rawEmail = args[i + 1];
        i++;
      } else if (args[i].startsWith("--email=")) {
        rawEmail = args[i].slice("--email=".length);
      } else if (!args[i].startsWith("--")) {
        rawEmail = args[i];
      }
    }

    const askUser = promptAsk || ((q) => ask(q, input, output));
    const askHiddenUser = promptHidden || ((q) => askHidden(q, input, output));

    if (!rawEmail) {
      rawEmail = await askUser("Administrator email to reset: ");
    }

    const email = validateAdminEmail(rawEmail);

    // 4. Validate database target safety
    if (env.DATABASE_URL) {
      verifySafeDatabaseTarget(env.DATABASE_URL, { allowLocalDev });
    } else if (!createPrismaClient) {
      throw new Error("DATABASE_URL is required.");
    }

    // 5. Connect and verify administrator exists and is active
    prismaClient = createPrismaClient
      ? createPrismaClient()
      : makePrismaClient(env.DATABASE_URL);

    const admin = await prismaClient.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, active: true },
    });

    if (!admin) {
      errorOutput.write(`Administrator account "${email}" not found.\n`);
      return false;
    }

    if (!admin.active) {
      errorOutput.write(
        `Administrator account "${email}" is inactive. Cannot reset password.\n`
      );
      return false;
    }

    // 4. Require explicit confirmation of the target account
    const confirmation = await askUser(
      `Confirm password reset for active administrator "${admin.email}"? (Type "yes" to proceed): `
    );

    if (confirmation.trim().toLowerCase() !== "yes") {
      output.write("Password reset cancelled.\n");
      return false;
    }

    // 5. Read new password and confirmation using hidden input
    const newPassword = await askHiddenUser(
      "Enter new password (input hidden): "
    );
    const confirmPassword = await askHiddenUser(
      "Confirm new password (input hidden): "
    );

    // 6. Enforce 14-1024 character policy
    validatePasswordPolicy(newPassword, confirmPassword);

    // 7. Hash password and execute database transaction
    const passwordHash = await createPasswordHash(newPassword);
    const now = new Date();

    await prismaClient.$transaction(async (tx) => {
      // Update password hash and timestamp
      await tx.adminUser.update({
        where: { id: admin.id },
        data: {
          passwordHash,
          passwordChangedAt: now,
        },
      });

      // Revoke all active sessions for this administrator
      await tx.adminSession.updateMany({
        where: {
          adminUserId: admin.id,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      // Record AuditEvent
      await tx.auditEvent.create({
        data: {
          adminUserId: admin.id,
          action: "ADMIN_PASSWORD_RESET_CLI",
          entityType: "AdminUser",
          entityId: admin.id,
          afterData: {
            resetMethod: "EMERGENCY_CLI",
            timestamp: now.toISOString(),
          },
        },
      });
    });

    output.write(
      `Password successfully reset for administrator "${admin.email}". All active sessions have been revoked.\n`
    );
    return true;
  } catch (err) {
    const message = err?.message || "Unexpected error.";
    errorOutput.write(`Password reset failed: ${message}\n`);
    return false;
  } finally {
    if (prismaClient && typeof prismaClient.$disconnect === "function") {
      try {
        await prismaClient.$disconnect();
      } catch {
        errorOutput.write("Database client cleanup failed.\n");
        process.exitCode = 1;
      }
    }
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  const succeeded = await runResetAdminPassword();
  if (!succeeded) process.exitCode = 1;
}
