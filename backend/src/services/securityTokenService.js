import {
  createOpaqueToken,
  hashOpaqueToken,
  isValidOpaqueToken,
  computeTokenExpiry,
  isTokenExpired,
  SECURITY_TOKEN_EXPIRY_MINUTES,
} from "../auth/security.js";

/**
 * Create a cryptographically secure, time-limited security token for an administrator.
 *
 * @param {object} prismaOrTx - Prisma client or transaction instance
 * @param {object} options
 * @param {string} options.adminUserId - Target administrator ID
 * @param {"RECOVERY_EMAIL_VERIFICATION"|"PASSWORD_RESET"} options.type - Security token type
 * @param {string|null} [options.payload] - Optional payload (e.g., proposed recovery email)
 * @param {number} [options.expiresMinutes] - Expiry in minutes (defaults to 30)
 * @returns {Promise<{ rawToken: string, record: object }>}
 */
export async function createAdminSecurityToken(
  prismaOrTx,
  { adminUserId, type, payload = null, expiresMinutes = SECURITY_TOKEN_EXPIRY_MINUTES }
) {
  if (!prismaOrTx || typeof prismaOrTx.adminSecurityToken?.create !== "function") {
    throw new Error("A valid Prisma client or transaction is required.");
  }
  if (!adminUserId || typeof adminUserId !== "string") {
    throw new Error("adminUserId is required.");
  }
  if (type !== "RECOVERY_EMAIL_VERIFICATION" && type !== "PASSWORD_RESET") {
    throw new Error(`Invalid security token type: ${type}`);
  }

  const rawToken = createOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const expiresAt = computeTokenExpiry(expiresMinutes);

  const record = await prismaOrTx.adminSecurityToken.create({
    data: {
      adminUserId,
      type,
      tokenHash,
      payload: typeof payload === "string" ? payload.trim() : null,
      expiresAt,
    },
  });

  return { rawToken, record };
}

/**
 * Look up a security token by its raw token and expected type, verifying validity and expiration.
 * Does NOT consume the token. (Atomic consumption is handled in routes).
 *
 * @param {object} prismaOrTx - Prisma client or transaction instance
 * @param {object} options
 * @param {string} options.rawToken - The unhashed opaque token from user request/email
 * @param {"RECOVERY_EMAIL_VERIFICATION"|"PASSWORD_RESET"} options.type - Expected token type
 * @returns {Promise<object|null>} The token record with adminUser relation, or null if invalid/expired/used
 */
export async function findValidSecurityToken(prismaOrTx, { rawToken, type }) {
  if (!prismaOrTx || typeof prismaOrTx.adminSecurityToken?.findUnique !== "function") {
    return null;
  }
  if (!isValidOpaqueToken(rawToken)) {
    return null;
  }
  if (type !== "RECOVERY_EMAIL_VERIFICATION" && type !== "PASSWORD_RESET") {
    return null;
  }

  const tokenHash = hashOpaqueToken(rawToken);
  const record = await prismaOrTx.adminSecurityToken.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          recoveryEmail: true,
          role: true,
          active: true,
        },
      },
    },
  });

  if (!record) {
    return null;
  }
  if (record.type !== type) {
    return null;
  }
  if (record.usedAt !== null) {
    return null;
  }
  if (isTokenExpired(record.expiresAt)) {
    return null;
  }
  if (!record.adminUser || !record.adminUser.active) {
    return null;
  }

  return record;
}
