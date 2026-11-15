import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  createOpaqueToken,
  createPasswordHash,
  hashOpaqueToken,
  verifyPassword,
} from "../src/auth/security.js";
import { createAttemptLimiter } from "../src/middleware/loginRateLimit.js";
import { createRequireAdmin } from "../src/middleware/requireAdmin.js";
import { createAuthRouter } from "../src/routes/auth.js";
import { maskEmail } from "../src/routes/authRecovery.js";

function createMockPrisma({
  admins = [],
  sessions = [],
  tokens = [],
  auditEvents = [],
} = {}) {
  const adminList = [...admins];
  const sessionList = [...sessions];
  const tokenList = [...tokens];
  const auditList = [...auditEvents];

  const client = {
    _data: { adminList, sessionList, tokenList, auditList },

    adminUser: {
      findUnique: async ({ where }) => {
        if (where.id) return adminList.find((a) => a.id === where.id) || null;
        if (where.email) return adminList.find((a) => a.email.toLowerCase() === where.email.toLowerCase()) || null;
        if (where.recoveryEmail) return adminList.find((a) => a.recoveryEmail?.toLowerCase() === where.recoveryEmail.toLowerCase()) || null;
        return null;
      },
      findMany: async ({ where = {} } = {}) => {
        return adminList.filter((a) => {
          if (where.active !== undefined && a.active !== where.active) return false;
          if (Array.isArray(where.OR)) {
            return where.OR.some((clause) => {
              if (clause.email) {
                const target = typeof clause.email === "object" ? clause.email.equals : clause.email;
                if (a.email?.toLowerCase() === target?.toLowerCase()) return true;
              }
              if (clause.recoveryEmail) {
                const target = typeof clause.recoveryEmail === "object" ? clause.recoveryEmail.equals : clause.recoveryEmail;
                if (a.recoveryEmail?.toLowerCase() === target?.toLowerCase()) {
                  if (clause.recoveryEmailVerifiedAt !== undefined) {
                    if (clause.recoveryEmailVerifiedAt?.not === null && !a.recoveryEmailVerifiedAt) {
                      return false;
                    }
                  }
                  return true;
                }
              }
              return false;
            });
          }
          return true;
        });
      },
      findFirst: async ({ where }) => {
        return adminList.find((a) => {
          if (where.id?.not && a.id === where.id.not) return false;
          if (where.recoveryEmail) {
            return a.recoveryEmail?.toLowerCase() === where.recoveryEmail.toLowerCase();
          }
          if (Array.isArray(where.OR)) {
            return where.OR.some((clause) => {
              if (clause.recoveryEmail && a.recoveryEmail?.toLowerCase() === clause.recoveryEmail.toLowerCase()) return true;
              if (clause.email && a.email?.toLowerCase() === clause.email.toLowerCase()) return true;
              return false;
            });
          }
          return false;
        }) || null;
      },
      update: async ({ where, data }) => {
        const admin = adminList.find((a) => a.id === where.id);
        if (!admin) throw new Error("Admin not found");
        Object.assign(admin, data);
        return admin;
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const a of adminList) {
          if (where.id && a.id !== where.id) continue;
          if (where.active !== undefined && a.active !== where.active) continue;
          Object.assign(a, data);
          count++;
        }
        return { count };
      },
    },

    adminSession: {
      findUnique: async ({ where }) => {
        const session = sessionList.find((s) => s.tokenHash === where.tokenHash);
        if (!session) return null;
        const adminUser = adminList.find((a) => a.id === session.adminUserId);
        return { ...session, adminUser };
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const s of sessionList) {
          if (where.id && s.id !== where.id) continue;
          if (where.adminUserId && s.adminUserId !== where.adminUserId) continue;
          if (where.revokedAt === null && s.revokedAt !== null) continue;
          Object.assign(s, data);
          count++;
        }
        return { count };
      },
    },

    adminSecurityToken: {
      findUnique: async ({ where }) => {
        const token = tokenList.find((t) => t.tokenHash === where.tokenHash);
        if (!token) return null;
        const adminUser = adminList.find((a) => a.id === token.adminUserId);
        return { ...token, adminUser };
      },
      create: async ({ data }) => {
        const id = `tok-${tokenList.length + 1}`;
        const record = { id, createdAt: new Date(), usedAt: null, ...data };
        tokenList.push(record);
        return record;
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        for (const t of tokenList) {
          if (where.id && t.id !== where.id) continue;
          if (where.adminUserId && t.adminUserId !== where.adminUserId) continue;
          if (where.tokenHash && t.tokenHash !== where.tokenHash) continue;
          if (where.type && t.type !== where.type) continue;
          if (where.usedAt === null && t.usedAt !== null) continue;
          if (where.expiresAt?.gt && t.expiresAt <= where.expiresAt.gt) continue;
          Object.assign(t, data);
          count++;
        }
        return { count };
      },
      delete: async ({ where }) => {
        const idx = tokenList.findIndex((t) => t.id === where.id);
        if (idx >= 0) tokenList.splice(idx, 1);
        return { id: where.id };
      },
    },

    auditEvent: {
      create: async ({ data }) => {
        const id = `audit-${auditList.length + 1}`;
        const event = { id, createdAt: new Date(), ...data };
        auditList.push(event);
        return event;
      },
    },

    $transaction: async (cb) => {
      // In-memory mock transaction directly executes the callback with client
      return cb(client);
    },
  };

  return client;
}

function setupTestServer({
  prismaClient,
  emailService,
  currentTime = new Date("2026-11-12T12:00:00Z"),
  recoveryLimiters = {},
  trustProxy = false,
}) {
  const adminMiddleware = createRequireAdmin({
    prismaClient,
    now: () => currentTime,
    isProduction: false,
  });

  const app = express();
  if (trustProxy) {
    app.set("trust proxy", true);
  }
  app.use(express.json());
  app.use(
    "/api/auth",
    createAuthRouter({
      prismaClient,
      requireAdminMiddleware: adminMiddleware,
      loginRateLimitMiddleware: (_req, _res, next) => next(),
      now: () => currentTime,
      isProduction: false,
      emailService,
      recoveryLimiters,
    })
  );

  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve({
        baseUrl,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

test("maskEmail masks local parts correctly", () => {
  assert.equal(maskEmail("admin@iconelectromatic.com"), "a***n@iconelectromatic.com");
  assert.equal(maskEmail("john.doe@example.com"), "j***e@example.com");
  assert.equal(maskEmail("me@domain.com"), "m***@domain.com");
  assert.equal(maskEmail(""), null);
  assert.equal(maskEmail(null), null);
  assert.equal(maskEmail("invalid-email"), null);
});

test("GET /recovery-email requires auth and reports recovery email status", async () => {
  const passwordHash = await createPasswordHash("admin-secure-password-123");
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: "recovery@example.com",
    recoveryEmailVerifiedAt: new Date("2026-11-12T10:00:00Z"),
    passwordHash,
    role: "ADMIN",
    active: true,
  };
  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const session = {
    id: "session-1",
    adminUserId: admin.id,
    tokenHash: hashOpaqueToken(sessionToken),
    csrfTokenHash: hashOpaqueToken(csrfToken),
    revokedAt: null,
    absoluteExpiresAt: new Date(Date.now() + 3600_000),
    lastSeenAt: new Date(),
  };

  const prisma = createMockPrisma({ admins: [admin], sessions: [session] });
  const server = await setupTestServer({ prismaClient: prisma });

  try {
    // 1. Unauthenticated request -> 401
    const unauthRes = await fetch(`${server.baseUrl}/recovery-email`);
    assert.equal(unauthRes.status, 401);

    // 2. Authenticated request -> 200 with masked email
    const authRes = await fetch(`${server.baseUrl}/recovery-email`, {
      headers: {
        cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
      },
    });
    assert.equal(authRes.status, 200);
    const body = await authRes.json();
    assert.equal(body.success, true);
    assert.equal(body.data.configured, true);
    assert.equal(body.data.maskedEmail, "r***y@example.com");
    assert.equal(body.data.verified, true);
    assert.ok(body.data.verifiedAt);
  } finally {
    await server.close();
  }
});

test("POST /recovery-email/request enforces CSRF, password step-up, uniqueness, and dispatches email", async () => {
  const password = "correct-horse-battery-staple-pass";
  const passwordHash = await createPasswordHash(password);
  const admin1 = {
    id: "admin-1",
    email: "admin1@iconelectromatic.com",
    recoveryEmail: null,
    recoveryEmailVerifiedAt: null,
    passwordHash,
    role: "ADMIN",
    active: true,
  };
  const admin2 = {
    id: "admin-2",
    email: "admin2@iconelectromatic.com",
    recoveryEmail: "claimed@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash,
    role: "ADMIN",
    active: true,
  };

  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const session = {
    id: "session-1",
    adminUserId: admin1.id,
    tokenHash: hashOpaqueToken(sessionToken),
    csrfTokenHash: hashOpaqueToken(csrfToken),
    revokedAt: null,
    absoluteExpiresAt: new Date(Date.now() + 3600_000),
    lastSeenAt: new Date(),
  };

  const prisma = createMockPrisma({ admins: [admin1, admin2], sessions: [session] });

  let sentEmail = null;
  const mockEmailService = {
    sendRecoveryVerificationEmail: async (payload) => {
      sentEmail = payload;
      return { ok: true, id: "msg-1" };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }),
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 10 }),
    },
  });

  try {
    const authHeaders = {
      cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    // 1. Missing CSRF header -> 403
    const noCsrfRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: {
        cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newRecoveryEmail: "proposed@example.com", password }),
    });
    assert.equal(noCsrfRes.status, 403);

    // 2. Wrong password step-up -> 401
    const badPassRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ newRecoveryEmail: "proposed@example.com", password: "wrong-password-here" }),
    });
    assert.equal(badPassRes.status, 401);
    const badPassBody = await badPassRes.json();
    assert.equal(badPassBody.message, "Incorrect password.");

    // 3. Proposing own login email -> 200 (Default recovery email verification)
    const ownEmailRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ newRecoveryEmail: admin1.email, password }),
    });
    assert.equal(ownEmailRes.status, 200);
    assert.equal(sentEmail.to, admin1.email);
    assert.ok(sentEmail.verificationUrl.includes("token="));

    // 4. Proposing email already verified by admin2 -> 400 (generic error without leaking admin2)
    const conflictRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ newRecoveryEmail: "claimed@example.com", password }),
    });
    assert.equal(conflictRes.status, 400);
    const conflictBody = await conflictRes.json();
    assert.ok(conflictBody.message.includes("cannot be used"));

    // 5. Valid personal recovery request -> 200, token created, email dispatched only to personal address
    const validRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ newRecoveryEmail: "new-recovery@example.com", password }),
    });
    assert.equal(validRes.status, 200);
    assert.equal(sentEmail.to, "new-recovery@example.com");
    assert.notEqual(sentEmail.to, admin1.email);
    assert.ok(sentEmail.verificationUrl.includes("token="));

    // Token stored in database as hash, NOT plain text
    const storedTokens = prisma._data.tokenList;
    const activeTokens = storedTokens.filter((t) => t.usedAt === null);
    assert.equal(activeTokens.length, 1);
    assert.equal(activeTokens[0].type, "RECOVERY_EMAIL_VERIFICATION");
    assert.equal(activeTokens[0].payload, "new-recovery@example.com");
    assert.ok(!sentEmail.verificationUrl.includes(activeTokens[0].tokenHash)); // Hash is different from raw token

    // Refinement 1: existing recovery email on AdminUser remains unchanged until confirmed
    assert.equal(admin1.recoveryEmail, null);
  } finally {
    await server.close();
  }
});

test("POST /recovery-email/request cleans up token if email delivery fails", async () => {
  const password = "correct-horse-battery-staple-pass";
  const passwordHash = await createPasswordHash(password);
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: null,
    passwordHash,
    role: "ADMIN",
    active: true,
  };
  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const session = {
    id: "session-1",
    adminUserId: admin.id,
    tokenHash: hashOpaqueToken(sessionToken),
    csrfTokenHash: hashOpaqueToken(csrfToken),
    revokedAt: null,
    absoluteExpiresAt: new Date(Date.now() + 3600_000),
    lastSeenAt: new Date(),
  };

  const prisma = createMockPrisma({ admins: [admin], sessions: [session] });

  const failingEmailService = {
    sendRecoveryVerificationEmail: async () => ({ ok: false, error: "SMTP timeout" }),
  };

  const server = await setupTestServer({ prismaClient: prisma, emailService: failingEmailService });

  try {
    const res = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: {
        cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newRecoveryEmail: "recovery@example.com", password }),
    });

    assert.equal(res.status, 502);

    // Refinement 4: Token must be deleted so no usable orphan token remains
    assert.equal(prisma._data.tokenList.length, 0);
  } finally {
    await server.close();
  }
});

test("POST /recovery-email/confirm atomically consumes token, rejects GET, and enforces replay protection", async () => {
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: "old@example.com",
    recoveryEmailVerifiedAt: new Date("2026-11-01T00:00:00Z"),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const rawToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const tokenRecord = {
    id: "tok-1",
    adminUserId: admin.id,
    type: "RECOVERY_EMAIL_VERIFICATION",
    tokenHash,
    payload: "brand-new@example.com",
    expiresAt: new Date(Date.now() + 1800_000), // 30m future
    usedAt: null,
  };

  const prisma = createMockPrisma({ admins: [admin], tokens: [tokenRecord] });

  let securityAlertSent = null;
  const mockEmailService = {
    sendRecoveryEmailChangedEmail: async (payload) => {
      securityAlertSent = payload;
      return { ok: true };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }),
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 10 }),
    },
  });

  try {
    // 1. GET request is rejected with 404 (Immune to email preview crawlers)
    const getRes = await fetch(`${server.baseUrl}/recovery-email/confirm?token=${rawToken}`);
    assert.equal(getRes.status, 404);
    assert.equal(tokenRecord.usedAt, null);

    // 2. Valid POST confirm -> 200, updates email, marks used, creates audit event
    const postRes = await fetch(`${server.baseUrl}/recovery-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    });

    assert.equal(postRes.status, 200);
    assert.equal(admin.recoveryEmail, "brand-new@example.com");
    assert.ok(admin.recoveryEmailVerifiedAt);
    assert.ok(tokenRecord.usedAt);

    // Audit event created without secrets
    const auditEvent = prisma._data.auditList.find((a) => a.action === "ADMIN_RECOVERY_EMAIL_VERIFIED");
    assert.ok(auditEvent);
    assert.equal(auditEvent.adminUserId, admin.id);
    assert.equal(auditEvent.afterData.password, undefined);
    assert.equal(auditEvent.afterData.token, undefined);

    // Security alert sent to previous recovery email
    assert.ok(securityAlertSent);
    assert.equal(securityAlertSent.to, "old@example.com");
    assert.equal(securityAlertSent.action, "updated");

    // 3. Replay: second POST returns 400
    const replayRes = await fetch(`${server.baseUrl}/recovery-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    });
    assert.equal(replayRes.status, 400);
    const replayBody = await replayRes.json();
    assert.ok(replayBody.message.includes("invalid, expired, or has already been used"));
  } finally {
    await server.close();
  }
});

test("POST /recovery-email/remove verifies password step-up, removes email, and alerts addresses", async () => {
  const password = "admin-secret-password-123";
  const passwordHash = await createPasswordHash(password);
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: "recovery-to-remove@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash,
    role: "ADMIN",
    active: true,
  };

  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const session = {
    id: "session-1",
    adminUserId: admin.id,
    tokenHash: hashOpaqueToken(sessionToken),
    csrfTokenHash: hashOpaqueToken(csrfToken),
    revokedAt: null,
    absoluteExpiresAt: new Date(Date.now() + 3600_000),
    lastSeenAt: new Date(),
  };

  const prisma = createMockPrisma({ admins: [admin], sessions: [session] });

  const alerts = [];
  const mockEmailService = {
    sendRecoveryEmailChangedEmail: async (payload) => {
      alerts.push(payload);
      return { ok: true };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }),
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 10 }),
    },
  });

  try {
    const authHeaders = {
      cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    // 1. Wrong password -> 401
    const badPass = await fetch(`${server.baseUrl}/recovery-email/remove`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ password: "wrong" }),
    });
    assert.equal(badPass.status, 401);

    // 2. Correct password -> 200, sets null, alerts addresses
    const removeRes = await fetch(`${server.baseUrl}/recovery-email/remove`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ password }),
    });
    assert.equal(removeRes.status, 200);
    assert.equal(admin.recoveryEmail, null);
    assert.equal(admin.recoveryEmailVerifiedAt, null);

    // Alerts sent to both previous recovery email and primary admin email
    assert.equal(alerts.length, 2);
    assert.ok(alerts.some((a) => a.to === "recovery-to-remove@example.com"));
    assert.ok(alerts.some((a) => a.to === admin.email));

    const auditEvent = prisma._data.auditList.find((a) => a.action === "ADMIN_RECOVERY_EMAIL_REMOVED");
    assert.ok(auditEvent);
  } finally {
    await server.close();
  }
});

test("POST /forgot-password always returns generic 200 and only emails active verified recovery addresses", async () => {
  const adminWithVerifiedRecovery = {
    id: "admin-verified",
    email: "verified@iconelectromatic.com",
    recoveryEmail: "verified-recovery@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const adminWithUnverifiedRecovery = {
    id: "admin-unverified",
    email: "unverified@iconelectromatic.com",
    recoveryEmail: "pending@example.com",
    recoveryEmailVerifiedAt: null, // NOT verified
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const adminInactive = {
    id: "admin-inactive",
    email: "inactive@iconelectromatic.com",
    recoveryEmail: "inactive-recovery@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: false, // inactive
  };

  const adminWithVerifiedLoginRecovery = {
    id: "admin-verified-login-rec",
    email: "login-rec@iconelectromatic.com",
    recoveryEmail: "login-rec@iconelectromatic.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const adminNewlyProvisionedUnverified = {
    id: "admin-newly-provisioned",
    email: "newly-provisioned@iconelectromatic.com",
    recoveryEmail: "newly-provisioned@iconelectromatic.com",
    recoveryEmailVerifiedAt: null,
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const adminAmbiguous1 = {
    id: "admin-ambig-1",
    email: "ambig1@iconelectromatic.com",
    recoveryEmail: "shared-conflict@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const adminAmbiguous2 = {
    id: "admin-ambig-2",
    email: "shared-conflict@example.com",
    recoveryEmail: "ambig2-rec@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const prisma = createMockPrisma({
    admins: [
      adminWithVerifiedRecovery,
      adminWithUnverifiedRecovery,
      adminInactive,
      adminWithVerifiedLoginRecovery,
      adminNewlyProvisionedUnverified,
      adminAmbiguous1,
      adminAmbiguous2,
    ],
  });

  const emailsSent = [];
  const mockEmailService = {
    sendPasswordResetEmail: async (payload) => {
      emailsSent.push(payload);
      return { ok: true, id: "reset-msg" };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }),
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 10 }),
    },
  });

  try {
    const genericExpectedMsg =
      "If an active account exists with a verified recovery address, a password reset link has been dispatched.";

    // 1. Unknown user -> generic 200, 0 emails
    const res1 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unknown@example.com" }),
    });
    assert.equal(res1.status, 200);
    assert.equal((await res1.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 0);

    // 2. Inactive user -> generic 200, 0 emails
    const res2 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminInactive.email }),
    });
    assert.equal(res2.status, 200);
    assert.equal((await res2.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 0);

    // 3. User with unverified recovery email -> generic 200, 0 emails
    const res3 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminWithUnverifiedRecovery.email }),
    });
    assert.equal(res3.status, 200);
    assert.equal((await res3.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 0);

    // 4. User with verified recovery email -> generic 200, 1 email sent strictly to recovery email
    const res4 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminWithVerifiedRecovery.email }),
    });
    assert.equal(res4.status, 200);
    assert.equal((await res4.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 1);
    assert.equal(emailsSent[0].to, "verified-recovery@example.com");
    assert.ok(emailsSent[0].resetUrl.includes("token="));

    // Token stored in database
    const resetToken = prisma._data.tokenList.find((t) => t.type === "PASSWORD_RESET");
    assert.ok(resetToken);
    assert.equal(resetToken.adminUserId, adminWithVerifiedRecovery.id);

    // 5. User whose verified recovery email IS their login email -> generic 200, exactly 1 email sent to login email
    const res5 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminWithVerifiedLoginRecovery.email }),
    });
    assert.equal(res5.status, 200);
    assert.equal((await res5.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 2);
    assert.equal(emailsSent[1].to, adminWithVerifiedLoginRecovery.email);
    assert.ok(emailsSent[1].resetUrl.includes("token="));

    // 6. Newly provisioned user with initial unverified login recovery email -> generic 200, 0 emails dispatched
    const res6 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminNewlyProvisionedUnverified.email }),
    });
    assert.equal(res6.status, 200);
    assert.equal((await res6.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 2); // Count unchanged

    // 7. User enters their VERIFIED RECOVERY EMAIL -> resolves to SAME administrator, sends to recovery email
    const res7 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminWithVerifiedRecovery.recoveryEmail }),
    });
    assert.equal(res7.status, 200);
    assert.equal((await res7.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 3);
    assert.equal(emailsSent[2].to, "verified-recovery@example.com");
    assert.equal(emailsSent[2].adminEmail, adminWithVerifiedRecovery.email); // Displays login email in template
    assert.ok(emailsSent[2].resetUrl.includes("token="));

    // Token stored in database for the SAME administrator ID
    const tokensForAdmin = prisma._data.tokenList.filter(
      (t) => t.type === "PASSWORD_RESET" && t.adminUserId === adminWithVerifiedRecovery.id
    );
    assert.ok(tokensForAdmin.length >= 2);

    // 8. User enters an UNVERIFIED RECOVERY EMAIL -> generic 200, 0 emails dispatched
    const res8 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminWithUnverifiedRecovery.recoveryEmail }),
    });
    assert.equal(res8.status, 200);
    assert.equal((await res8.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 3); // Count unchanged

    // 9. Ambiguous match defense (2 active admins match the same submitted address) -> generic 200, 0 emails dispatched
    const res9 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "shared-conflict@example.com" }),
    });
    assert.equal(res9.status, 200);
    assert.equal((await res9.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 3); // Count unchanged

    // 10. Inactive administrator entered by recovery email -> generic 200, 0 emails dispatched
    const res10 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminInactive.recoveryEmail }),
    });
    assert.equal(res10.status, 200);
    assert.equal((await res10.json()).message, genericExpectedMsg);
    assert.equal(emailsSent.length, 3); // Count unchanged
  } finally {
    await server.close();
  }
});

test("POST /reset-password validates password, consumes token atomically, revokes sessions, and logs audit", async () => {
  const oldPasswordHash = await createPasswordHash("old-valid-password-123");
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: "recovery@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: oldPasswordHash,
    role: "ADMIN",
    active: true,
  };

  const rawResetToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(rawResetToken);
  const resetTokenRecord = {
    id: "tok-reset-1",
    adminUserId: admin.id,
    type: "PASSWORD_RESET",
    tokenHash,
    payload: null,
    expiresAt: new Date(Date.now() + 1800_000), // 30m
    usedAt: null,
  };

  const session1 = {
    id: "sess-1",
    adminUserId: admin.id,
    tokenHash: "hash1",
    revokedAt: null,
  };
  const session2 = {
    id: "sess-2",
    adminUserId: admin.id,
    tokenHash: "hash2",
    revokedAt: null,
  };

  const prisma = createMockPrisma({
    admins: [admin],
    tokens: [resetTokenRecord],
    sessions: [session1, session2],
  });

  const changedAlerts = [];
  const mockEmailService = {
    sendPasswordChangedEmail: async (payload) => {
      changedAlerts.push(payload);
      return { ok: true };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }),
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 10 }),
    },
  });

  try {
    const newPassword = "brand-new-secure-password-2026!";

    // 1. Password policy rejection (e.g. 13 characters)
    const policyFailRes = await fetch(`${server.baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: rawResetToken,
        newPassword: "short-pass-13",
        confirmPassword: "short-pass-13",
      }),
    });
    assert.equal(policyFailRes.status, 400);
    assert.equal(resetTokenRecord.usedAt, null);

    // 2. Successful reset
    const successRes = await fetch(`${server.baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: rawResetToken,
        newPassword,
        confirmPassword: newPassword,
      }),
    });

    assert.equal(successRes.status, 200);

    // Password updated and verified
    assert.notEqual(admin.passwordHash, oldPasswordHash);
    assert.equal(await verifyPassword(newPassword, admin.passwordHash), true);
    assert.ok(admin.passwordChangedAt);

    // Token marked as used
    assert.ok(resetTokenRecord.usedAt);

    // All sessions revoked
    assert.ok(session1.revokedAt);
    assert.ok(session2.revokedAt);

    // Audit event recorded without secrets
    const auditEvent = prisma._data.auditList.find(
      (a) => a.action === "ADMIN_PASSWORD_RESET_RECOVERY"
    );
    assert.ok(auditEvent);
    assert.equal(auditEvent.adminUserId, admin.id);
    assert.equal(auditEvent.afterData.password, undefined);

    // Security alerts sent to recovery email and primary email
    assert.ok(changedAlerts.some((a) => a.to === "recovery@example.com"));
    assert.ok(changedAlerts.some((a) => a.to === admin.email));

    // 3. Replay: second reset attempt rejected
    const replayRes = await fetch(`${server.baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: rawResetToken,
        newPassword: "another-password-1234",
        confirmPassword: "another-password-1234",
      }),
    });
    assert.equal(replayRes.status, 400);
  } finally {
    await server.close();
  }
});

test("Concurrent token consumption allows exactly one request to succeed", async () => {
  const admin = {
    id: "admin-1",
    email: "admin@iconelectromatic.com",
    recoveryEmail: "initial@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const rawToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const tokenRecord = {
    id: "tok-concurrent",
    adminUserId: admin.id,
    type: "RECOVERY_EMAIL_VERIFICATION",
    tokenHash,
    payload: "concurrent-verified@example.com",
    expiresAt: new Date(Date.now() + 1800_000),
    usedAt: null,
  };

  const prisma = createMockPrisma({ admins: [admin], tokens: [tokenRecord] });
  const server = await setupTestServer({ prismaClient: prisma });

  try {
    // Send two concurrent confirm requests with the identical token
    const [res1, res2] = await Promise.all([
      fetch(`${server.baseUrl}/recovery-email/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken }),
      }),
      fetch(`${server.baseUrl}/recovery-email/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken }),
      }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one 200 (succeeded) and one 400 (rejected as already consumed)
    assert.deepEqual(statuses, [200, 400]);
  } finally {
    await server.close();
  }
});

test("POST /forgot-password enforces IP rate limiting (3 attempts per 15 minutes)", async () => {
  const prisma = createMockPrisma();
  const server = await setupTestServer({ prismaClient: prisma });

  try {
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${server.baseUrl}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `attempt${i}@example.com` }),
      });
      assert.equal(res.status, 200);
    }

    // 4th request from same IP is rate-limited
    const rateLimitedRes = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "attempt4@example.com" }),
    });
    assert.equal(rateLimitedRes.status, 429);
    assert.ok(rateLimitedRes.headers.get("retry-after"));
    const body = await rateLimitedRes.json();
    assert.equal(body.success, false);
  } finally {
    await server.close();
  }
});

test("POST /forgot-password enforces normalized-email rate limiting across different client IP addresses", async () => {
  const prisma = createMockPrisma();
  const server = await setupTestServer({
    prismaClient: prisma,
    trustProxy: true,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 100 }),
    },
  });

  try {
    const targetEmail = "admin@iconelectromatic.com";
    const clientIps = ["198.51.100.1", "198.51.100.2", "198.51.100.3"];

    for (let i = 0; i < clientIps.length; i++) {
      const res = await fetch(`${server.baseUrl}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": clientIps[i],
        },
        body: JSON.stringify({
          email: i === 1 ? "  Admin@IconElectromatic.com  " : targetEmail,
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    }

    // 4th request targeting the same normalized email from a 4th unique IP address receives 429
    const fourthRes = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "198.51.100.4",
      },
      body: JSON.stringify({ email: "ADMIN@iconelectromatic.com" }),
    });

    assert.equal(fourthRes.status, 429);
    assert.ok(fourthRes.headers.get("retry-after"));
    const errorBody = await fourthRes.json();
    assert.equal(errorBody.success, false);
    assert.equal(
      errorBody.message,
      "Too many reset requests. Please try again later."
    );

    // Control request: Same 4th IP address requesting a different email receives 200,
    // confirming that the 4th request was blocked by the normalized-email limiter, not the IP limiter.
    const controlRes = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "198.51.100.4",
      },
      body: JSON.stringify({ email: "different-admin@iconelectromatic.com" }),
    });

    assert.equal(controlRes.status, 200);
    const controlBody = await controlRes.json();
    assert.equal(controlBody.success, true);
  } finally {
    await server.close();
  }
});

test("recovery email lifecycle: old address remains active until replacement, login email never changes, personal recovery cannot log in", async () => {
  const password = "admin-secret-password-123";
  const passwordHash = await createPasswordHash(password);
  const admin = {
    id: "admin-lifecycle-1",
    email: "admin.permanent@iconelectromatic.com",
    recoveryEmail: "admin.permanent@iconelectromatic.com",
    recoveryEmailVerifiedAt: new Date("2026-11-14T09:00:00Z"),
    passwordHash,
    role: "ADMIN",
    active: true,
  };

  const sessionToken = createOpaqueToken();
  const csrfToken = createOpaqueToken();
  const session = {
    id: "session-lifecycle-1",
    adminUserId: admin.id,
    tokenHash: hashOpaqueToken(sessionToken),
    csrfTokenHash: hashOpaqueToken(csrfToken),
    revokedAt: null,
    absoluteExpiresAt: new Date(Date.now() + 3600_000),
    lastSeenAt: new Date(),
  };

  const prisma = createMockPrisma({
    admins: [admin],
    sessions: [session],
  });

  const emailsDispatched = [];
  const mockEmailService = {
    sendRecoveryVerificationEmail: async (p) => {
      emailsDispatched.push({ type: "verification", ...p });
      return { ok: true };
    },
    sendPasswordResetEmail: async (p) => {
      emailsDispatched.push({ type: "reset", ...p });
      return { ok: true };
    },
    sendRecoveryEmailChangedEmail: async (p) => {
      emailsDispatched.push({ type: "changed", ...p });
      return { ok: true };
    },
  };

  const server = await setupTestServer({
    prismaClient: prisma,
    emailService: mockEmailService,
  });

  try {
    const authHeaders = {
      cookie: `admin_session=${sessionToken}; admin_csrf=${csrfToken}`,
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    // 1. Propose personal recovery email
    const reqRes = await fetch(`${server.baseUrl}/recovery-email/request`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        newRecoveryEmail: "admin.personal@gmail.com",
        password,
      }),
    });
    assert.equal(reqRes.status, 200);

    // Verification link sent ONLY to personal email, NOT to login email
    assert.equal(emailsDispatched.length, 1);
    assert.equal(emailsDispatched[0].to, "admin.personal@gmail.com");

    // 2. WHILE UNVERIFIED: Forgot password sends reset link to OLD verified address (login email)
    const forgotRes1 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email }),
    });
    assert.equal(forgotRes1.status, 200);
    const resetEmails = emailsDispatched.filter((e) => e.type === "reset");
    assert.equal(resetEmails.length, 1);
    assert.equal(resetEmails[0].to, "admin.permanent@iconelectromatic.com");

    // 3. Confirm personal recovery email
    const tokenRecord = prisma._data.tokenList.find(
      (t) => t.type === "RECOVERY_EMAIL_VERIFICATION" && t.payload === "admin.personal@gmail.com"
    );
    assert.ok(tokenRecord);
    const url = new URL(emailsDispatched[0].verificationUrl);
    const rawToken = url.searchParams.get("token");

    const confirmRes = await fetch(`${server.baseUrl}/recovery-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    });
    assert.equal(confirmRes.status, 200);

    // Recovery email is now the personal address
    assert.equal(admin.recoveryEmail, "admin.personal@gmail.com");
    assert.ok(admin.recoveryEmailVerifiedAt);

    // 4. Permanent login email remains completely UNCHANGED
    assert.equal(admin.email, "admin.permanent@iconelectromatic.com");

    // 5. AFTER VERIFICATION: Forgot password sends reset link to NEW personal recovery address
    const forgotRes2 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email }),
    });
    assert.equal(forgotRes2.status, 200);
    const resetEmails2 = emailsDispatched.filter((e) => e.type === "reset");
    assert.equal(resetEmails2.length, 2);
    assert.equal(resetEmails2[1].to, "admin.personal@gmail.com");

    // 5b. AFTER VERIFICATION: Entering verified personal recovery email also identifies same account
    const forgotRes3 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin.personal@gmail.com" }),
    });
    assert.equal(forgotRes3.status, 200);
    const resetEmails3 = emailsDispatched.filter((e) => e.type === "reset");
    assert.equal(resetEmails3.length, 3);
    assert.equal(resetEmails3[2].to, "admin.personal@gmail.com");
    assert.equal(resetEmails3[2].adminEmail, "admin.permanent@iconelectromatic.com");

    // 6. Personal recovery email CANNOT authenticate as admin via POST /login
    const loginAttempt = await fetch(`${server.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin.personal@gmail.com",
        password,
      }),
    });
    assert.equal(loginAttempt.status, 401);
  } finally {
    await server.close();
  }
});

test("POST /forgot-password enforces cross-identifier rate limiting so switching between login and recovery email cannot bypass limits", async () => {
  const admin = {
    id: "admin-cross-rate",
    email: "cross.login@iconelectromatic.com",
    recoveryEmail: "cross.recovery@example.com",
    recoveryEmailVerifiedAt: new Date(),
    passwordHash: "hash",
    role: "ADMIN",
    active: true,
  };

  const prisma = createMockPrisma({ admins: [admin] });
  const server = await setupTestServer({
    prismaClient: prisma,
    recoveryLimiters: {
      forgotPasswordIpLimiter: createAttemptLimiter({ maxAttempts: 10 }), // generous IP limiter to isolate email limiter
      forgotPasswordEmailLimiter: createAttemptLimiter({ maxAttempts: 3 }),
      forgotPasswordAccountLimiter: createAttemptLimiter({ maxAttempts: 3 }),
    },
  });

  try {
    // Attempt 1: submit login email -> OK (attempt 1 for login and recovery email)
    const res1 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.1" },
      body: JSON.stringify({ email: admin.email }),
    });
    assert.equal(res1.status, 200);

    // Attempt 2: switch to recovery email -> OK (attempt 2 for both)
    const res2 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.2" },
      body: JSON.stringify({ email: admin.recoveryEmail }),
    });
    assert.equal(res2.status, 200);

    // Attempt 3: switch back to login email -> OK (attempt 3 for both, limit reached)
    const res3 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.3" },
      body: JSON.stringify({ email: admin.email }),
    });
    assert.equal(res3.status, 200);

    // Attempt 4: try recovery email -> 429 Too Many Requests (rate limit enforced across identifiers!)
    const res4 = await fetch(`${server.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "10.0.0.4" },
      body: JSON.stringify({ email: admin.recoveryEmail }),
    });
    assert.equal(res4.status, 429);
    assert.equal((await res4.json()).message, "Too many reset requests. Please try again later.");
  } finally {
    await server.close();
  }
});
