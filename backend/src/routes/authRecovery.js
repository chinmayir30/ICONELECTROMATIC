import { Router } from "express";
import {
  clearAuthCookies,
  createPasswordHash,
  hashOpaqueToken,
  isValidOpaqueToken,
  validatePasswordPolicy,
  verifyPassword,
} from "../auth/security.js";
import {
  createAttemptLimiter,
  normalizeEmail,
  resolveClientIp,
} from "../middleware/loginRateLimit.js";
import { createAdminSecurityToken } from "../services/securityTokenService.js";
import * as defaultEmailService from "../services/emailService.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function maskEmail(email) {
  if (!email || typeof email !== "string") return null;
  const parts = email.trim().split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || !domain) return null;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function createAuthRecoveryRouter({
  prismaClient,
  requireAdminMiddleware,
  now = () => new Date(),
  isProduction = process.env.NODE_ENV === "production",
  emailService = defaultEmailService,
  stepUpLimiter = createAttemptLimiter({
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    now: () => now().getTime(),
  }),
  forgotPasswordIpLimiter = createAttemptLimiter({
    windowMs: 15 * 60 * 1000,
    maxAttempts: 3,
    now: () => now().getTime(),
  }),
  forgotPasswordEmailLimiter = createAttemptLimiter({
    windowMs: 15 * 60 * 1000,
    maxAttempts: 3,
    now: () => now().getTime(),
  }),
  forgotPasswordAccountLimiter = createAttemptLimiter({
    windowMs: 15 * 60 * 1000,
    maxAttempts: 3,
    now: () => now().getTime(),
  }),
  publicTokenAttemptLimiter = createAttemptLimiter({
    windowMs: 15 * 60 * 1000,
    maxAttempts: 10,
    now: () => now().getTime(),
  }),
} = {}) {
  const router = Router();

  function getFrontendUrl(req) {
    const configured = (process.env.FRONTEND_URL || "").trim();
    if (configured) return configured.replace(/\/+$/, "");
    const origin = req.get("origin");
    if (origin && !isProduction) return origin.replace(/\/+$/, "");
    return "http://localhost:5173";
  }

  // 1. GET /recovery-email — View masked recovery-email status (Authenticated)
  router.get("/recovery-email", requireAdminMiddleware, async (req, res) => {
    try {
      const admin = await prismaClient.adminUser.findUnique({
        where: { id: req.adminUser.id },
        select: {
          email: true,
          recoveryEmail: true,
          recoveryEmailVerifiedAt: true,
        },
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrator account not found.",
        });
      }

      const isConfigured = Boolean(admin.recoveryEmail);
      const isVerified = Boolean(admin.recoveryEmail && admin.recoveryEmailVerifiedAt);
      const effectiveEmail = admin.recoveryEmail || admin.email;
      const isDefaultLoginEmail =
        !admin.recoveryEmail ||
        admin.recoveryEmail.toLowerCase() === admin.email.toLowerCase();

      return res.status(200).json({
        success: true,
        data: {
          configured: isConfigured,
          maskedEmail: maskEmail(effectiveEmail),
          verified: isVerified,
          verifiedAt: admin.recoveryEmailVerifiedAt,
          loginEmail: admin.email,
          maskedLoginEmail: maskEmail(admin.email),
          isDefaultLoginEmail,
          recoveryEmailType: isDefaultLoginEmail ? "default_login" : "personal",
        },
      });
    } catch {
      return res.status(503).json({
        success: false,
        message: "Account security service is unavailable.",
      });
    }
  });

  // 2. POST /recovery-email/request — Request recovery email link with password step-up (Authenticated, CSRF enforced)
  router.post(
    "/recovery-email/request",
    requireAdminMiddleware,
    async (req, res) => {
      const { newRecoveryEmail, password } = req.body || {};

      if (
        typeof newRecoveryEmail !== "string" ||
        !EMAIL_PATTERN.test(newRecoveryEmail.trim()) ||
        newRecoveryEmail.trim().length > 254 ||
        typeof password !== "string" ||
        password.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid email address and password confirmation are required.",
        });
      }

      const normalizedProposed = newRecoveryEmail.trim().toLowerCase();
      const adminId = req.adminUser.id;

      // Check step-up rate limiter
      const blocked = stepUpLimiter.isBlocked(adminId);
      if (blocked.blocked) {
        res.set("Retry-After", String(blocked.retryAfterSeconds));
        return res.status(429).json({
          success: false,
          message: "Too many failed password attempts. Please try again later.",
        });
      }

      try {
        const admin = await prismaClient.adminUser.findUnique({
          where: { id: adminId },
          select: { id: true, email: true, passwordHash: true, active: true },
        });

        if (!admin || !admin.active) {
          return res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }

        const passwordValid = await verifyPassword(password, admin.passwordHash);
        if (!passwordValid) {
          const failure = stepUpLimiter.recordFailure(adminId);
          if (!failure.allowed) {
            res.set("Retry-After", String(failure.retryAfterSeconds));
            return res.status(429).json({
              success: false,
              message: "Too many failed password attempts. Please try again later.",
            });
          }
          return res.status(401).json({
            success: false,
            message: "Incorrect password.",
          });
        }

        // Successful password verification: reset step-up failure counter
        stepUpLimiter.reset(adminId);

        // Check uniqueness across other administrators (without exposing account details)
        const conflict = await prismaClient.adminUser.findFirst({
          where: {
            OR: [
              { recoveryEmail: normalizedProposed },
              { email: normalizedProposed },
            ],
            id: { not: adminId },
          },
          select: { id: true },
        });

        if (conflict) {
          return res.status(400).json({
            success: false,
            message: "This recovery email address cannot be used. Please choose a different address.",
          });
        }

        // Invalidate any previous unconsumed verification tokens for this administrator
        await prismaClient.adminSecurityToken.updateMany({
          where: {
            adminUserId: adminId,
            type: "RECOVERY_EMAIL_VERIFICATION",
            usedAt: null,
          },
          data: { usedAt: now() },
        });

        // Create new token
        const { rawToken, record: tokenRecord } =
          await createAdminSecurityToken(prismaClient, {
            adminUserId: adminId,
            type: "RECOVERY_EMAIL_VERIFICATION",
            payload: normalizedProposed,
            expiresMinutes: 30,
          });

        // Dispatch verification email outside of database transaction
        const frontendUrl = getFrontendUrl(req);
        const verificationUrl = `${frontendUrl}/admin/verify-recovery?token=${rawToken}`;

        const sendResult = await emailService.sendRecoveryVerificationEmail({
          to: normalizedProposed,
          adminEmail: admin.email,
          verificationUrl,
          expiresMinutes: 30,
        });

        if (!sendResult.ok) {
          // Immediately clean up the token so no usable orphan token remains
          await prismaClient.adminSecurityToken
            .delete({ where: { id: tokenRecord.id } })
            .catch(() => {});

          return res.status(502).json({
            success: false,
            message: "Failed to dispatch verification email. Please try again.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Verification email sent to the proposed recovery address.",
        });
      } catch {
        return res.status(503).json({
          success: false,
          message: "Account security service is unavailable.",
        });
      }
    }
  );

  // 3. POST /recovery-email/confirm — Public token verification confirmation (Immune to GET link previews)
  router.post("/recovery-email/confirm", async (req, res) => {
    const clientIp = resolveClientIp(req);
    const ipCheck = publicTokenAttemptLimiter.consume(clientIp);
    if (!ipCheck.allowed) {
      res.set("Retry-After", String(ipCheck.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    const { token } = req.body || {};
    if (!isValidOpaqueToken(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or malformed verification token.",
      });
    }

    const tokenHash = hashOpaqueToken(token);
    const currentTime = now();

    try {
      const result = await prismaClient.$transaction(async (tx) => {
        // 1. Look up token with associated admin
        const tokenRecord = await tx.adminSecurityToken.findUnique({
          where: { tokenHash },
          include: {
            adminUser: {
              select: { id: true, email: true, recoveryEmail: true, active: true },
            },
          },
        });

        if (
          !tokenRecord ||
          tokenRecord.type !== "RECOVERY_EMAIL_VERIFICATION" ||
          tokenRecord.usedAt !== null ||
          tokenRecord.expiresAt <= currentTime ||
          !tokenRecord.adminUser ||
          !tokenRecord.adminUser.active
        ) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        // 2. Conditional atomic update: exactly one concurrent request can succeed
        const consumption = await tx.adminSecurityToken.updateMany({
          where: {
            id: tokenRecord.id,
            tokenHash,
            adminUserId: tokenRecord.adminUserId,
            type: "RECOVERY_EMAIL_VERIFICATION",
            usedAt: null,
            expiresAt: { gt: currentTime },
          },
          data: { usedAt: currentTime },
        });

        if (consumption.count !== 1) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        const proposedEmail = tokenRecord.payload;
        if (!proposedEmail) {
          throw new Error("PAYLOAD_MISSING");
        }

        // 3. Re-verify uniqueness within transaction
        const conflict = await tx.adminUser.findFirst({
          where: {
            OR: [
              { recoveryEmail: proposedEmail },
              { email: proposedEmail },
            ],
            id: { not: tokenRecord.adminUserId },
          },
          select: { id: true },
        });

        if (conflict) {
          throw new Error("EMAIL_CONFLICT");
        }

        const previousRecoveryEmail = tokenRecord.adminUser.recoveryEmail;

        // 4. Atomically update AdminUser recovery email, ensuring account is still active
        const adminUpdate = await tx.adminUser.updateMany({
          where: {
            id: tokenRecord.adminUserId,
            active: true,
          },
          data: {
            recoveryEmail: proposedEmail,
            recoveryEmailVerifiedAt: currentTime,
          },
        });

        if (adminUpdate.count !== 1) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        // 5. Invalidate any remaining RECOVERY_EMAIL_VERIFICATION tokens for this admin
        await tx.adminSecurityToken.updateMany({
          where: {
            adminUserId: tokenRecord.adminUserId,
            type: "RECOVERY_EMAIL_VERIFICATION",
            usedAt: null,
          },
          data: { usedAt: currentTime },
        });

        // 6. Record AuditEvent
        await tx.auditEvent.create({
          data: {
            adminUserId: tokenRecord.adminUserId,
            action: "ADMIN_RECOVERY_EMAIL_VERIFIED",
            entityType: "AdminUser",
            entityId: tokenRecord.adminUserId,
            afterData: {
              verifiedAt: currentTime.toISOString(),
            },
          },
        });

        return {
          adminEmail: tokenRecord.adminUser.email,
          previousRecoveryEmail,
          newRecoveryEmail: proposedEmail,
        };
      });

      // Post-transaction notification: notify previous recovery email if it existed and changed
      if (
        result.previousRecoveryEmail &&
        result.previousRecoveryEmail.toLowerCase() !==
          result.newRecoveryEmail.toLowerCase()
      ) {
        emailService
          .sendRecoveryEmailChangedEmail({
            to: result.previousRecoveryEmail,
            adminEmail: result.adminEmail,
            action: "updated",
            previousRecoveryEmail: result.previousRecoveryEmail,
            timestamp: currentTime,
          })
          .catch(() => {});
      }

      return res.status(200).json({
        success: true,
        message: "Recovery email verified successfully.",
      });
    } catch (err) {
      if (err.message === "TOKEN_INVALID_OR_EXPIRED" || err.message === "PAYLOAD_MISSING") {
        return res.status(400).json({
          success: false,
          message: "Verification link is invalid, expired, or has already been used.",
        });
      }
      if (err.message === "EMAIL_CONFLICT") {
        return res.status(409).json({
          success: false,
          message: "This recovery email address is already claimed by another account.",
        });
      }
      console.error("Recovery email confirmation error:", err.message || err);
      return res.status(503).json({
        success: false,
        message: "Account security service is unavailable.",
      });
    }
  });

  // 4. POST /recovery-email/remove — Remove recovery email with password step-up (Authenticated, CSRF enforced)
  router.post(
    "/recovery-email/remove",
    requireAdminMiddleware,
    async (req, res) => {
      const { password } = req.body || {};
      if (typeof password !== "string" || password.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Password confirmation is required.",
        });
      }

      const adminId = req.adminUser.id;

      // Check step-up rate limiter
      const blocked = stepUpLimiter.isBlocked(adminId);
      if (blocked.blocked) {
        res.set("Retry-After", String(blocked.retryAfterSeconds));
        return res.status(429).json({
          success: false,
          message: "Too many failed password attempts. Please try again later.",
        });
      }

      try {
        const admin = await prismaClient.adminUser.findUnique({
          where: { id: adminId },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            recoveryEmail: true,
            active: true,
          },
        });

        if (!admin || !admin.active) {
          return res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
        }

        const passwordValid = await verifyPassword(password, admin.passwordHash);
        if (!passwordValid) {
          const failure = stepUpLimiter.recordFailure(adminId);
          if (!failure.allowed) {
            res.set("Retry-After", String(failure.retryAfterSeconds));
            return res.status(429).json({
              success: false,
              message: "Too many failed password attempts. Please try again later.",
            });
          }
          return res.status(401).json({
            success: false,
            message: "Incorrect password.",
          });
        }

        // Successful password verification: reset step-up failure counter
        stepUpLimiter.reset(adminId);

        if (!admin.recoveryEmail) {
          return res.status(400).json({
            success: false,
            message: "No recovery email is currently configured.",
          });
        }

        const previousRecoveryEmail = admin.recoveryEmail;
        const currentTime = now();

        await prismaClient.$transaction(async (tx) => {
          // Remove recovery email
          await tx.adminUser.update({
            where: { id: adminId },
            data: {
              recoveryEmail: null,
              recoveryEmailVerifiedAt: null,
            },
          });

          // Invalidate all pending security tokens for this administrator
          await tx.adminSecurityToken.updateMany({
            where: {
              adminUserId: adminId,
              usedAt: null,
            },
            data: { usedAt: currentTime },
          });

          // Record AuditEvent
          await tx.auditEvent.create({
            data: {
              adminUserId: adminId,
              action: "ADMIN_RECOVERY_EMAIL_REMOVED",
              entityType: "AdminUser",
              entityId: adminId,
              afterData: {
                removedAt: currentTime.toISOString(),
              },
            },
          });
        });

        // Post-transaction notifications (outside transaction)
        emailService
          .sendRecoveryEmailChangedEmail({
            to: previousRecoveryEmail,
            adminEmail: admin.email,
            action: "removed",
            previousRecoveryEmail,
            timestamp: currentTime,
          })
          .catch(() => {});

        emailService
          .sendRecoveryEmailChangedEmail({
            to: admin.email,
            adminEmail: admin.email,
            action: "removed",
            previousRecoveryEmail,
            timestamp: currentTime,
          })
          .catch(() => {});

        return res.status(200).json({
          success: true,
          message: "Recovery email removed successfully.",
        });
      } catch {
        return res.status(503).json({
          success: false,
          message: "Account security service is unavailable.",
        });
      }
    }
  );

  // 5. POST /forgot-password — Public password reset request (Always generic 200 response)
  router.post("/forgot-password", async (req, res) => {
    const clientIp = resolveClientIp(req);
    const ipCheck = forgotPasswordIpLimiter.consume(clientIp);
    if (!ipCheck.allowed) {
      res.set("Retry-After", String(ipCheck.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: "Too many reset requests. Please try again later.",
      });
    }

    const { email } = req.body || {};
    const normalized = normalizeEmail(email);

    if (normalized) {
      const emailCheck = forgotPasswordEmailLimiter.consume(normalized);
      if (!emailCheck.allowed) {
        res.set("Retry-After", String(emailCheck.retryAfterSeconds));
        return res.status(429).json({
          success: false,
          message: "Too many reset requests. Please try again later.",
        });
      }
    }

    const genericResponse = {
      success: true,
      message:
        "If an active account exists with a verified recovery address, a password reset link has been dispatched.",
    };

    if (!normalized || !EMAIL_PATTERN.test(normalized)) {
      return res.status(200).json(genericResponse);
    }

    try {
      // Find active administrators matching either the login email OR the verified recovery email
      const matchingAdmins = await prismaClient.adminUser.findMany({
        where: {
          active: true,
          OR: [
            { email: { equals: normalized, mode: "insensitive" } },
            {
              recoveryEmail: { equals: normalized, mode: "insensitive" },
              recoveryEmailVerifiedAt: { not: null },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          active: true,
          recoveryEmail: true,
          recoveryEmailVerifiedAt: true,
        },
      });

      // Send reset link ONLY if exactly one active administrator matches,
      // and that account has an active verified recovery email address
      if (matchingAdmins.length === 1) {
        const admin = matchingAdmins[0];

        // Account-level rate limiting: prevents bypassing limits by switching between login and recovery email
        const accountCheck = forgotPasswordAccountLimiter.consume(admin.id);

        // Also consume emailLimiter for the account's alternate identifier so switching cannot bypass limits
        if (admin.email && admin.email.toLowerCase() !== normalized) {
          forgotPasswordEmailLimiter.consume(admin.email.toLowerCase());
        }
        if (
          admin.recoveryEmail &&
          admin.recoveryEmailVerifiedAt &&
          admin.recoveryEmail.toLowerCase() !== normalized
        ) {
          forgotPasswordEmailLimiter.consume(admin.recoveryEmail.toLowerCase());
        }

        if (
          accountCheck.allowed &&
          admin.active &&
          admin.recoveryEmail &&
          admin.recoveryEmailVerifiedAt
        ) {
          // Invalidate any existing unconsumed PASSWORD_RESET tokens for this administrator
          await prismaClient.adminSecurityToken.updateMany({
            where: {
              adminUserId: admin.id,
              type: "PASSWORD_RESET",
              usedAt: null,
            },
            data: { usedAt: now() },
          });

          // Create new token
          const { rawToken, record: tokenRecord } =
            await createAdminSecurityToken(prismaClient, {
              adminUserId: admin.id,
              type: "PASSWORD_RESET",
              expiresMinutes: 30,
            });

          // Dispatch email outside of database transaction
          const frontendUrl = getFrontendUrl(req);
          const resetUrl = `${frontendUrl}/admin/reset-password?token=${rawToken}`;

          const sendResult = await emailService.sendPasswordResetEmail({
            to: admin.recoveryEmail,
            adminEmail: admin.email,
            resetUrl,
            expiresMinutes: 30,
          });

          if (!sendResult.ok) {
            // Immediately delete the token so no usable orphan token remains
            await prismaClient.adminSecurityToken
              .delete({ where: { id: tokenRecord.id } })
              .catch(() => {});
          }
        }
      } else if (matchingAdmins.length > 1) {
        // Ambiguous match defense: Multiple active accounts matched the same input
        // Safe security event logging without exposing user-submitted email addresses
        console.warn(
          "[SECURITY_AUDIT] Ambiguous password reset request: multiple active accounts matched. Request safely suppressed."
        );
      }

      return res.status(200).json(genericResponse);
    } catch {
      return res.status(200).json(genericResponse);
    }
  });

  // 6. POST /reset-password — Public password reset confirmation
  router.post("/reset-password", async (req, res) => {
    const clientIp = resolveClientIp(req);
    const ipCheck = publicTokenAttemptLimiter.consume(clientIp);
    if (!ipCheck.allowed) {
      res.set("Retry-After", String(ipCheck.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    const { token, newPassword, confirmPassword } = req.body || {};

    if (!isValidOpaqueToken(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or malformed password reset token.",
      });
    }

    try {
      validatePasswordPolicy(newPassword, confirmPassword);
    } catch (policyErr) {
      return res.status(400).json({
        success: false,
        message: policyErr.message || "Password does not meet requirements.",
      });
    }

    const tokenHash = hashOpaqueToken(token);
    const currentTime = now();

    try {
      const passwordHash = await createPasswordHash(newPassword);

      const result = await prismaClient.$transaction(async (tx) => {
        // 1. Look up token
        const tokenRecord = await tx.adminSecurityToken.findUnique({
          where: { tokenHash },
          include: {
            adminUser: {
              select: { id: true, email: true, recoveryEmail: true, active: true },
            },
          },
        });

        if (
          !tokenRecord ||
          tokenRecord.type !== "PASSWORD_RESET" ||
          tokenRecord.usedAt !== null ||
          tokenRecord.expiresAt <= currentTime ||
          !tokenRecord.adminUser ||
          !tokenRecord.adminUser.active
        ) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        const admin = tokenRecord.adminUser;

        // 2. Conditional atomic update: exactly one concurrent request can consume the token
        const consumption = await tx.adminSecurityToken.updateMany({
          where: {
            id: tokenRecord.id,
            tokenHash,
            adminUserId: admin.id,
            type: "PASSWORD_RESET",
            usedAt: null,
            expiresAt: { gt: currentTime },
          },
          data: { usedAt: currentTime },
        });

        if (consumption.count !== 1) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        // 3. Update AdminUser password, ensuring account is still active
        const adminUpdate = await tx.adminUser.updateMany({
          where: {
            id: admin.id,
            active: true,
          },
          data: {
            passwordHash,
            passwordChangedAt: currentTime,
          },
        });

        if (adminUpdate.count !== 1) {
          throw new Error("TOKEN_INVALID_OR_EXPIRED");
        }

        // 4. Revoke ALL active sessions for this administrator
        await tx.adminSession.updateMany({
          where: {
            adminUserId: admin.id,
            revokedAt: null,
          },
          data: { revokedAt: currentTime },
        });

        // 5. Invalidate ALL remaining security tokens for this administrator
        await tx.adminSecurityToken.updateMany({
          where: {
            adminUserId: admin.id,
            usedAt: null,
          },
          data: { usedAt: currentTime },
        });

        // 6. Record AuditEvent
        await tx.auditEvent.create({
          data: {
            adminUserId: admin.id,
            action: "ADMIN_PASSWORD_RESET_RECOVERY",
            entityType: "AdminUser",
            entityId: admin.id,
            afterData: {
              resetMethod: "RECOVERY_TOKEN",
              timestamp: currentTime.toISOString(),
            },
          },
        });

        return {
          adminEmail: admin.email,
          recoveryEmail: admin.recoveryEmail,
        };
      });

      // Clear any session cookies from the caller
      clearAuthCookies(res, isProduction);

      // Post-transaction security notification (outside of transaction)
      if (
        result.recoveryEmail &&
        result.recoveryEmail.toLowerCase() !== result.adminEmail.toLowerCase()
      ) {
        emailService
          .sendPasswordChangedEmail({
            to: result.recoveryEmail,
            adminEmail: result.adminEmail,
            timestamp: currentTime,
          })
          .catch(() => {});
      }

      emailService
        .sendPasswordChangedEmail({
          to: result.adminEmail,
          adminEmail: result.adminEmail,
          timestamp: currentTime,
        })
        .catch(() => {});

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully. All active sessions have been terminated.",
      });
    } catch (err) {
      if (err.message === "TOKEN_INVALID_OR_EXPIRED") {
        return res.status(400).json({
          success: false,
          message:
            "Password reset link is invalid, expired, or has already been used.",
        });
      }

      console.error("Password reset execution error:", err.message || err);
      return res.status(503).json({
        success: false,
        message: "Account security service is unavailable.",
      });
    }
  });

  return router;
}
