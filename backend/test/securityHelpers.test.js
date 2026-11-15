import test from "node:test";
import assert from "node:assert/strict";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  SECURITY_TOKEN_EXPIRY_MINUTES,
  validatePasswordPolicy,
  createOpaqueToken,
  hashOpaqueToken,
  isValidOpaqueToken,
  tokenMatchesHash,
  computeTokenExpiry,
  isTokenExpired,
} from "../src/auth/security.js";
import {
  createAdminSecurityToken,
  findValidSecurityToken,
} from "../src/services/securityTokenService.js";

test("validatePasswordPolicy enforces 14-1024 character boundary and confirmation", () => {
  // Exactly 14 characters: valid
  assert.equal(
    validatePasswordPolicy("12345678901234"),
    "12345678901234"
  );

  // 13 characters: invalid
  assert.throws(
    () => validatePasswordPolicy("1234567890123"),
    /at least 14 characters/
  );

  // 1024 characters: valid
  const exactMax = "a".repeat(1024);
  assert.equal(validatePasswordPolicy(exactMax), exactMax);

  // 1025 characters: invalid
  const overMax = "a".repeat(1025);
  assert.throws(
    () => validatePasswordPolicy(overMax),
    /not exceed 1024 characters/
  );

  // Passwords with spaces, punctuation, unicode, or all lowercase: all valid (no arbitrary composition rules)
  const passphrase = "correct horse battery staple";
  assert.equal(validatePasswordPolicy(passphrase), passphrase);

  const unicodePass = "конфиденциальный пароль 2026!";
  assert.equal(validatePasswordPolicy(unicodePass), unicodePass);

  // Confirmation matches: valid
  assert.equal(
    validatePasswordPolicy("long-enough-password", "long-enough-password"),
    "long-enough-password"
  );

  // Confirmation mismatch: invalid
  assert.throws(
    () => validatePasswordPolicy("long-enough-password", "different-password!"),
    /confirmation does not match/
  );

  // Non-string: invalid
  assert.throws(() => validatePasswordPolicy(null), /must be a string/);
  assert.throws(() => validatePasswordPolicy(123456789012345), /must be a string/);
});

test("createOpaqueToken generates 64-character lowercase hex tokens (256-bit)", () => {
  const token1 = createOpaqueToken();
  const token2 = createOpaqueToken();

  assert.equal(typeof token1, "string");
  assert.equal(token1.length, 64);
  assert.ok(/^[a-f0-9]{64}$/.test(token1));
  assert.ok(isValidOpaqueToken(token1));

  assert.notEqual(token1, token2);
});

test("isValidOpaqueToken rejects invalid formats strictly", () => {
  assert.equal(isValidOpaqueToken(""), false);
  assert.equal(isValidOpaqueToken("abc"), false);
  assert.equal(isValidOpaqueToken(null), false);
  assert.equal(isValidOpaqueToken(undefined), false);
  assert.equal(isValidOpaqueToken(12345), false);
  assert.equal(isValidOpaqueToken("a".repeat(63)), false);
  assert.equal(isValidOpaqueToken("a".repeat(65)), false);

  // Uppercase hex rejected
  assert.equal(isValidOpaqueToken("A".repeat(64)), false);

  // Non-hex characters rejected
  assert.equal(isValidOpaqueToken("g".repeat(64)), false);
  assert.equal(isValidOpaqueToken(" " + "a".repeat(63)), false);

  // Valid 64 lowercase hex accepted
  assert.equal(isValidOpaqueToken("0123456789abcdef".repeat(4)), true);
});

test("hashOpaqueToken returns SHA-256 for valid tokens and null for invalid inputs", () => {
  const validToken = "a".repeat(64);
  const hash = hashOpaqueToken(validToken);

  assert.equal(typeof hash, "string");
  assert.equal(hash.length, 64);
  assert.ok(/^[a-f0-9]{64}$/.test(hash));

  // Same token produces identical hash
  assert.equal(hashOpaqueToken(validToken), hash);

  // Invalid token inputs return null
  assert.equal(hashOpaqueToken("short"), null);
  assert.equal(hashOpaqueToken(null), null);
  assert.equal(hashOpaqueToken("Z".repeat(64)), null);
});

test("computeTokenExpiry calculates safe future timestamps", () => {
  const now = Date.now();
  const expiry = computeTokenExpiry(30);

  assert.ok(expiry instanceof Date);
  assert.ok(expiry.getTime() > now);
  // Around 30 minutes in the future (within 2 seconds tolerance)
  const diffMinutes = (expiry.getTime() - now) / (60 * 1000);
  assert.ok(diffMinutes >= 29.9 && diffMinutes <= 30.1);

  // Default minutes is 30
  const defaultExpiry = computeTokenExpiry();
  const defaultDiff = (defaultExpiry.getTime() - now) / (60 * 1000);
  assert.ok(defaultDiff >= 29.9 && defaultDiff <= 30.1);
});

test("isTokenExpired detects expired vs active timestamps", () => {
  const future = new Date(Date.now() + 60 * 1000);
  const past = new Date(Date.now() - 60 * 1000);

  assert.equal(isTokenExpired(future), false);
  assert.equal(isTokenExpired(past), true);
  assert.equal(isTokenExpired(null), true);
  assert.equal(isTokenExpired(undefined), true);
  assert.equal(isTokenExpired("invalid-date"), true);
});

test("createAdminSecurityToken creates token record with hashed token", async () => {
  let createdData = null;
  const mockPrisma = {
    adminSecurityToken: {
      create: async ({ data }) => {
        createdData = data;
        return { id: "token-id-1", ...data };
      },
    },
  };

  const { rawToken, record } = await createAdminSecurityToken(mockPrisma, {
    adminUserId: "admin-1",
    type: "RECOVERY_EMAIL_VERIFICATION",
    payload: "recovery@example.com",
    expiresMinutes: 30,
  });

  assert.ok(isValidOpaqueToken(rawToken));
  assert.equal(record.id, "token-id-1");
  assert.equal(createdData.adminUserId, "admin-1");
  assert.equal(createdData.type, "RECOVERY_EMAIL_VERIFICATION");
  assert.equal(createdData.payload, "recovery@example.com");

  // Raw token is NEVER stored in database
  assert.notEqual(createdData.tokenHash, rawToken);
  assert.equal(createdData.tokenHash, hashOpaqueToken(rawToken));
  assert.ok(createdData.expiresAt.getTime() > Date.now());
});

test("findValidSecurityToken safely finds active token and rejects invalid/expired/used", async () => {
  const rawToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);

  const mockDbRecord = {
    id: "token-rec-1",
    adminUserId: "admin-1",
    type: "PASSWORD_RESET",
    tokenHash,
    payload: null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // active
    usedAt: null,
    adminUser: {
      id: "admin-1",
      email: "admin@iconelectromatic.com",
      recoveryEmail: "rec@example.com",
      role: "ADMIN",
      active: true,
    },
  };

  let queriedWhere = null;
  const mockPrisma = {
    adminSecurityToken: {
      findUnique: async ({ where }) => {
        queriedWhere = where;
        if (where.tokenHash === tokenHash) return mockDbRecord;
        return null;
      },
    },
  };

  // 1. Valid lookup succeeds
  const found = await findValidSecurityToken(mockPrisma, {
    rawToken,
    type: "PASSWORD_RESET",
  });
  assert.ok(found);
  assert.equal(found.id, "token-rec-1");
  assert.equal(queriedWhere.tokenHash, tokenHash);

  // 2. Wrong token format returns null
  assert.equal(
    await findValidSecurityToken(mockPrisma, {
      rawToken: "invalid-token",
      type: "PASSWORD_RESET",
    }),
    null
  );

  // 3. Wrong type returns null
  assert.equal(
    await findValidSecurityToken(mockPrisma, {
      rawToken,
      type: "RECOVERY_EMAIL_VERIFICATION",
    }),
    null
  );

  // 4. Used token returns null
  const usedRecord = { ...mockDbRecord, usedAt: new Date() };
  const mockPrismaUsed = {
    adminSecurityToken: {
      findUnique: async () => usedRecord,
    },
  };
  assert.equal(
    await findValidSecurityToken(mockPrismaUsed, {
      rawToken,
      type: "PASSWORD_RESET",
    }),
    null
  );

  // 5. Expired token returns null
  const expiredRecord = {
    ...mockDbRecord,
    expiresAt: new Date(Date.now() - 1000),
  };
  const mockPrismaExpired = {
    adminSecurityToken: {
      findUnique: async () => expiredRecord,
    },
  };
  assert.equal(
    await findValidSecurityToken(mockPrismaExpired, {
      rawToken,
      type: "PASSWORD_RESET",
    }),
    null
  );

  // 6. Deactivated admin returns null
  const inactiveAdminRecord = {
    ...mockDbRecord,
    adminUser: { ...mockDbRecord.adminUser, active: false },
  };
  const mockPrismaInactive = {
    adminSecurityToken: {
      findUnique: async () => inactiveAdminRecord,
    },
  };
  assert.equal(
    await findValidSecurityToken(mockPrismaInactive, {
      rawToken,
      type: "PASSWORD_RESET",
    }),
    null
  );
});
