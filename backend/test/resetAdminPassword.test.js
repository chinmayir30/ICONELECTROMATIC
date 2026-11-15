import test from "node:test";
import assert from "node:assert/strict";
import {
  APPROVED_LOCAL_TARGETS,
  validateAdminEmail,
  parseAndValidateDatabaseUrl,
  verifySafeDatabaseTarget,
  runResetAdminPassword,
} from "../scripts/reset-admin-password.js";
import { verifyPassword } from "../src/auth/security.js";

test("validateAdminEmail normalizes valid emails and rejects invalid formats", () => {
  assert.equal(
    validateAdminEmail("  ADMIN@IconElectromatic.COM  "),
    "admin@iconelectromatic.com"
  );
  assert.throws(() => validateAdminEmail(""), /Invalid administrator email/);
  assert.throws(() => validateAdminEmail("notanemail"), /Invalid administrator email/);
  assert.throws(() => validateAdminEmail("@missinguser.com"), /Invalid administrator email/);
  assert.throws(() => validateAdminEmail("user@.com"), /Invalid administrator email/);
  assert.throws(() => validateAdminEmail("a".repeat(250) + "@b.com"), /Invalid administrator email/);
});

test("verifySafeDatabaseTarget: port 5432 is rejected by default", () => {
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@127.0.0.1:5432/icon_electromatic"
      ),
    /PostgreSQL port 5432 is blocked by default.*Explicit authorization.*is required/
  );

  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@localhost:5432/icon_electromatic"
      ),
    /PostgreSQL port 5432 is blocked by default.*Explicit authorization.*is required/
  );
});

test("verifySafeDatabaseTarget: port 5432 accepted only with explicit authorization and exact approved database name", () => {
  // 127.0.0.1 with exact database name: accepted
  const result1 = verifySafeDatabaseTarget(
    "postgresql://postgres:secret@127.0.0.1:5432/icon_electromatic",
    { allowLocalDev: true }
  );
  assert.equal(result1.targetType, "LOCAL_DEV");
  assert.equal(result1.port, 5432);
  assert.equal(result1.databaseName, "icon_electromatic");

  // localhost with exact database name: accepted
  const result2 = verifySafeDatabaseTarget(
    "postgresql://postgres:secret@localhost:5432/icon_electromatic",
    { allowLocalDev: true }
  );
  assert.equal(result2.targetType, "LOCAL_DEV");
  assert.equal(result2.port, 5432);
  assert.equal(result2.databaseName, "icon_electromatic");
});

test("verifySafeDatabaseTarget: wrong database name is rejected", () => {
  // Wrong database name on port 5432 (even with authorization)
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@127.0.0.1:5432/wrong_local_db",
        { allowLocalDev: true }
      ),
    /does not match approved local database name "icon_electromatic"/
  );

  // Wrong database name on port 5433
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@127.0.0.1:5433/wrong_test_db"
      ),
    /does not match approved test database name "icon_electromatic_test"/
  );
});

test("verifySafeDatabaseTarget: wrong host or port is rejected", () => {
  // Remote host on port 5433
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@192.168.1.50:5433/icon_electromatic_test"
      ),
    /is remote\. Production and remote database targets are strictly forbidden/
  );

  // Unapproved port (e.g. 5434)
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@127.0.0.1:5434/icon_electromatic_test"
      ),
    /is not an approved local database target/
  );

  // Unapproved port 3306
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://postgres:secret@127.0.0.1:3306/icon_electromatic_test"
      ),
    /is not an approved local database target/
  );
});

test("verifySafeDatabaseTarget: production targets are always rejected even with authorization", () => {
  // Remote domain with port 5432 and allowLocalDev=true
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://admin:supersecret@db.iconelectromatic.com:5432/icon_electromatic",
        { allowLocalDev: true }
      ),
    /is remote\. Production and remote database targets are strictly forbidden/
  );

  // AWS RDS endpoint with allowLocalDev=true
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://admin:supersecret@icon-prod.c3jkl12.rds.amazonaws.com:5432/icon_electromatic",
        { allowLocalDev: true }
      ),
    /is remote\. Production and remote database targets are strictly forbidden/
  );

  // Database name containing "prod" rejected
  assert.throws(
    () =>
      verifySafeDatabaseTarget(
        "postgresql://admin:supersecret@127.0.0.1:5432/icon_electromatic_prod",
        { allowLocalDev: true }
      ),
    /Production database targets are strictly forbidden/
  );
});

test("runResetAdminPassword enforces database safety: rejects port 5432 by default and allows with authorization", async () => {
  const errors1 = [];
  // 1. Rejected by default on port 5432
  const result1 = await runResetAdminPassword({
    args: ["--email", "admin@example.com"],
    env: {
      DATABASE_URL: "postgresql://postgres:secret@127.0.0.1:5432/icon_electromatic",
    },
    errorOutput: { write: (m) => errors1.push(m) },
  });
  assert.equal(result1, false);
  assert.ok(errors1.join("").includes("port 5432 is blocked by default"));

  // 2. Rejected on production remote host even with --allow-local-db
  const errors2 = [];
  const result2 = await runResetAdminPassword({
    args: ["--email", "admin@example.com", "--allow-local-db"],
    env: {
      DATABASE_URL: "postgresql://admin:secret@remote-db.example.com:5432/icon_electromatic",
    },
    errorOutput: { write: (m) => errors2.push(m) },
  });
  assert.equal(result2, false);
  assert.ok(errors2.join("").includes("Production and remote database targets are strictly forbidden"));

  // 3. Allowed on port 5432 with --allow-local-db flag and exact approved target
  let clientCreatedWithAuth = false;
  const mockPrisma = {
    adminUser: {
      findUnique: async () => null, // Stop at account check
    },
    $disconnect: async () => {},
  };

  const result3 = await runResetAdminPassword({
    args: ["--email", "admin@example.com", "--allow-local-db"],
    env: {
      DATABASE_URL: "postgresql://postgres:secret@127.0.0.1:5432/icon_electromatic",
    },
    errorOutput: { write: () => {} },
    createPrismaClient: () => {
      clientCreatedWithAuth = true;
      return mockPrisma;
    },
  });
  assert.equal(clientCreatedWithAuth, true);

  // 4. Allowed on port 5432 with ALLOW_LOCAL_PORT_5432=true env var
  let clientCreatedWithEnv = false;
  await runResetAdminPassword({
    args: ["--email", "admin@example.com"],
    env: {
      DATABASE_URL: "postgresql://postgres:secret@127.0.0.1:5432/icon_electromatic",
      ALLOW_LOCAL_PORT_5432: "true",
    },
    errorOutput: { write: () => {} },
    createPrismaClient: () => {
      clientCreatedWithEnv = true;
      return mockPrisma;
    },
  });
  assert.equal(clientCreatedWithEnv, true);
});

test("runResetAdminPassword rejects passwords passed via command-line arguments", async () => {
  const errors = [];
  const secret = "a-leaked-password-123";

  const result = await runResetAdminPassword({
    args: ["--email", "admin@example.com", "--password", secret],
    errorOutput: { write: (m) => errors.push(m) },
  });

  assert.equal(result, false);
  assert.ok(errors.join("").includes("Passwords must never be passed as command-line arguments"));
  // Secret must NOT be in error output
  assert.ok(!errors.join("").includes(secret));
});

test("runResetAdminPassword rejects unknown administrator accounts", async () => {
  const errors = [];
  let disconnected = false;

  const mockPrisma = {
    adminUser: {
      findUnique: async () => null,
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  const result = await runResetAdminPassword({
    args: ["--email", "nonexistent@example.com"],
    errorOutput: { write: (m) => errors.push(m) },
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, false);
  assert.equal(disconnected, true);
  assert.ok(errors.join("").includes('Administrator account "nonexistent@example.com" not found'));
});

test("runResetAdminPassword rejects inactive administrator accounts", async () => {
  const errors = [];
  let disconnected = false;

  const mockPrisma = {
    adminUser: {
      findUnique: async () => ({
        id: "admin-inactive",
        email: "deactivated@example.com",
        active: false,
      }),
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  const result = await runResetAdminPassword({
    args: ["--email", "deactivated@example.com"],
    errorOutput: { write: (m) => errors.push(m) },
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, false);
  assert.equal(disconnected, true);
  assert.ok(errors.join("").includes("is inactive. Cannot reset password"));
});

test("runResetAdminPassword cancels if user does not explicitly confirm with 'yes'", async () => {
  const outputs = [];
  let disconnected = false;

  const mockPrisma = {
    adminUser: {
      findUnique: async () => ({
        id: "admin-active",
        email: "admin@example.com",
        active: true,
      }),
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  const result = await runResetAdminPassword({
    args: ["--email", "admin@example.com"],
    output: { write: (m) => outputs.push(m) },
    promptAsk: async () => "no", // User refuses confirmation
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, false);
  assert.equal(disconnected, true);
  assert.ok(outputs.join("").includes("Password reset cancelled"));
});

test("runResetAdminPassword rejects password below 14 characters", async () => {
  const errors = [];
  let disconnected = false;
  const shortSecret = "short-pass-12";

  const mockPrisma = {
    adminUser: {
      findUnique: async () => ({
        id: "admin-active",
        email: "admin@example.com",
        active: true,
      }),
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  let promptStep = 0;
  const result = await runResetAdminPassword({
    args: ["--email", "admin@example.com"],
    errorOutput: { write: (m) => errors.push(m) },
    promptAsk: async () => "yes",
    promptHidden: async () => {
      promptStep++;
      return shortSecret;
    },
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, false);
  assert.equal(disconnected, true);
  assert.ok(errors.join("").includes("at least 14 characters"));
  // Secret must NOT be in error output
  assert.ok(!errors.join("").includes(shortSecret));
});

test("runResetAdminPassword rejects mismatched password confirmation", async () => {
  const errors = [];
  let disconnected = false;

  const mockPrisma = {
    adminUser: {
      findUnique: async () => ({
        id: "admin-active",
        email: "admin@example.com",
        active: true,
      }),
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  let promptStep = 0;
  const result = await runResetAdminPassword({
    args: ["--email", "admin@example.com"],
    errorOutput: { write: (m) => errors.push(m) },
    promptAsk: async () => "yes",
    promptHidden: async () => {
      promptStep++;
      return promptStep === 1 ? "a-valid-password-1" : "a-valid-password-2";
    },
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, false);
  assert.equal(disconnected, true);
  assert.ok(errors.join("").includes("Password confirmation does not match"));
});

test("runResetAdminPassword successfully updates password, revokes sessions, and logs audit event", async () => {
  const outputs = [];
  const errors = [];
  let disconnected = false;
  const newPasswordSecret = "very-secure-admin-password-2026!";

  let updatedAdminData = null;
  let revokedSessionQuery = null;
  let createdAuditEvent = null;

  const mockPrisma = {
    adminUser: {
      findUnique: async () => ({
        id: "admin-id-123",
        email: "admin@iconelectromatic.com",
        active: true,
      }),
    },
    $transaction: async (callback) => {
      const mockTx = {
        adminUser: {
          update: async ({ where, data }) => {
            updatedAdminData = { where, data };
            return { id: "admin-id-123", ...data };
          },
        },
        adminSession: {
          updateMany: async ({ where, data }) => {
            revokedSessionQuery = { where, data };
            return { count: 3 };
          },
        },
        auditEvent: {
          create: async ({ data }) => {
            createdAuditEvent = data;
            return { id: "audit-1", ...data };
          },
        },
      };
      return callback(mockTx);
    },
    $disconnect: async () => {
      disconnected = true;
    },
  };

  const result = await runResetAdminPassword({
    args: ["--email", "admin@iconelectromatic.com"],
    output: { write: (m) => outputs.push(m) },
    errorOutput: { write: (m) => errors.push(m) },
    promptAsk: async () => "yes",
    promptHidden: async () => newPasswordSecret,
    createPrismaClient: () => mockPrisma,
  });

  assert.equal(result, true);
  assert.equal(disconnected, true);

  // 1. Admin updated with new hash and passwordChangedAt
  assert.equal(updatedAdminData.where.id, "admin-id-123");
  assert.ok(updatedAdminData.data.passwordChangedAt instanceof Date);
  assert.notEqual(updatedAdminData.data.passwordHash, newPasswordSecret);
  assert.equal(
    await verifyPassword(newPasswordSecret, updatedAdminData.data.passwordHash),
    true
  );

  // 2. Active sessions revoked
  assert.equal(revokedSessionQuery.where.adminUserId, "admin-id-123");
  assert.equal(revokedSessionQuery.where.revokedAt, null);
  assert.ok(revokedSessionQuery.data.revokedAt instanceof Date);

  // 3. Audit event created
  assert.equal(createdAuditEvent.adminUserId, "admin-id-123");
  assert.equal(createdAuditEvent.action, "ADMIN_PASSWORD_RESET_CLI");
  assert.equal(createdAuditEvent.entityType, "AdminUser");
  assert.equal(createdAuditEvent.entityId, "admin-id-123");
  assert.equal(createdAuditEvent.afterData.resetMethod, "EMERGENCY_CLI");

  // 4. Secret is NEVER printed in output or logs
  const combinedLog = outputs.join("") + errors.join("");
  assert.ok(!combinedLog.includes(newPasswordSecret));
  assert.ok(combinedLog.includes("Password successfully reset"));
});
