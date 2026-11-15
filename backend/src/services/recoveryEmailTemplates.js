/**
 * recoveryEmailTemplates.js — Branded email templates for CMS admin password recovery & security.
 *
 * Requirements:
 *   - Reuses existing branded email styling and HTML escaping.
 *   - Provides both HTML and plain-text formats for every template.
 *   - Includes explicit 30-minute expiry notice for verification and reset links.
 *   - Never includes passwords, token hashes, or credentials in templates or logs.
 */

import { esc } from "./emailService.js";

function renderBaseLayout({ title, heading, subtitle, contentHtml, plainFooterText }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1e3a5f;padding:20px 24px;">
      <h2 style="color:#fff;margin:0;font-size:18px;font-weight:700;">ICON Electromatic</h2>
      <p style="color:#a0b4c8;margin:4px 0 0;font-size:13px;">${esc(subtitle || "CMS Account Security")}</p>
    </div>
    <div style="padding:24px;">
      <h3 style="color:#0f172a;margin:0 0 16px;font-size:16px;">${esc(heading)}</h3>
      ${contentHtml}
    </div>
    <div style="background:#f9f9f9;padding:14px 24px;font-size:12px;color:#64748b;border-top:1px solid #e8e8e8;line-height:1.5;">
      Icon Electromatic Pvt. Ltd. | Bengaluru &bull; Singapore &bull; United States<br>
      ${esc(plainFooterText || "This is an automated security notification. Do not reply directly to this email.")}
    </div>
  </div>
</body>
</html>`.trim();
}

/**
 * 1. Recovery email ownership verification template.
 */
export function buildRecoveryVerificationEmail({
  adminEmail,
  verificationUrl,
  expiresMinutes = 30,
}) {
  const subject = "Verify Recovery Email Address — ICON Electromatic CMS";
  const safeAdminEmail = typeof adminEmail === "string" ? adminEmail.trim() : "Administrator";
  const safeUrl = typeof verificationUrl === "string" ? verificationUrl.trim() : "#";

  const contentHtml = `
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
      This email address has been specified as the recovery address for the ICON Electromatic CMS administrator account <strong>${esc(safeAdminEmail)}</strong>.
    </p>
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 20px;">
      To confirm ownership and complete verification, please click the button below:
    </p>
    <div style="margin:24px 0;text-align:left;">
      <a href="${esc(safeUrl)}" style="display:inline-block;background:#1e3a5f;color:#ffffff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;font-size:14px;">
        Verify Recovery Email
      </a>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin:20px 0;font-size:13px;color:#475569;line-height:1.5;">
      <strong>Security Notice:</strong> This verification link is valid for <strong>${expiresMinutes} minutes</strong> and can only be used once.<br><br>
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${esc(safeUrl)}" style="color:#1e3a5f;word-break:break-all;">${esc(safeUrl)}</a>
    </div>
    <p style="color:#64748b;font-size:13px;line-height:1.5;margin:16px 0 0;">
      If you did not request to link this email address to an ICON Electromatic CMS account, please disregard this email. No changes will take effect without verification.
    </p>
  `.trim();

  const html = renderBaseLayout({
    title: "Verify Recovery Email — ICON Electromatic",
    heading: "Recovery Email Verification",
    subtitle: "CMS Account Security & Access Control",
    contentHtml,
  });

  const text = `ICON Electromatic — CMS Account Security
Recovery Email Verification

This email address was specified as the recovery address for administrator account: ${safeAdminEmail}

To verify ownership and activate this recovery email, open the link below:
${safeUrl}

Notice: This verification link expires in ${expiresMinutes} minutes and can only be used once.

If you did not request this, you can safely ignore this email. No changes will take effect without verification.

Icon Electromatic Pvt. Ltd. | Bengaluru • Singapore • United States`.trim();

  return { subject, html, text };
}

/**
 * 2. Password reset request template.
 */
export function buildPasswordResetEmail({
  adminEmail,
  resetUrl,
  expiresMinutes = 30,
}) {
  const subject = "Reset Your CMS Password — ICON Electromatic";
  const safeAdminEmail = typeof adminEmail === "string" ? adminEmail.trim() : "Administrator";
  const safeUrl = typeof resetUrl === "string" ? resetUrl.trim() : "#";

  const contentHtml = `
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
      A password reset was requested for the ICON Electromatic CMS administrator account <strong>${esc(safeAdminEmail)}</strong>.
    </p>
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Click the button below to choose a new password:
    </p>
    <div style="margin:24px 0;text-align:left;">
      <a href="${esc(safeUrl)}" style="display:inline-block;background:#1e3a5f;color:#ffffff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;font-size:14px;">
        Reset CMS Password
      </a>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin:20px 0;font-size:13px;color:#475569;line-height:1.5;">
      <strong>Security Notice:</strong> This password reset link is valid for <strong>${expiresMinutes} minutes</strong> and can only be used once.<br><br>
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${esc(safeUrl)}" style="color:#1e3a5f;word-break:break-all;">${esc(safeUrl)}</a>
    </div>
    <p style="color:#64748b;font-size:13px;line-height:1.5;margin:16px 0 0;">
      If you did not request a password reset, your account is still secure. However, please notify your system administrator immediately if you suspect unauthorized activity.
    </p>
  `.trim();

  const html = renderBaseLayout({
    title: "Reset CMS Password — ICON Electromatic",
    heading: "Password Reset Request",
    subtitle: "CMS Account Security & Access Control",
    contentHtml,
  });

  const text = `ICON Electromatic — CMS Account Security
Password Reset Request

A password reset was requested for administrator account: ${safeAdminEmail}

To reset your password, open the link below:
${safeUrl}

Notice: This password reset link expires in ${expiresMinutes} minutes and can only be used once.

If you did not request this, your account is still secure and your password has not been changed. Please inform your administrator if you suspect unauthorized activity.

Icon Electromatic Pvt. Ltd. | Bengaluru • Singapore • United States`.trim();

  return { subject, html, text };
}

/**
 * 3. Password successfully changed notification template.
 */
export function buildPasswordChangedNotificationEmail({
  adminEmail,
  timestamp = new Date(),
}) {
  const subject = "Security Alert: Your CMS Password Has Been Changed — ICON Electromatic";
  const safeAdminEmail = typeof adminEmail === "string" ? adminEmail.trim() : "Administrator";
  const dateStr =
    timestamp instanceof Date
      ? timestamp.toUTCString()
      : new Date(timestamp).toUTCString();

  const contentHtml = `
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
      The password for the ICON Electromatic CMS administrator account <strong>${esc(safeAdminEmail)}</strong> was changed on:
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px;margin:16px 0;font-size:13px;color:#0f172a;font-weight:600;">
      ${esc(dateStr)}
    </div>
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
      All existing active sessions have been automatically terminated. You must sign in again with your new password.
    </p>
    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:6px;padding:14px 16px;margin:20px 0;font-size:13px;color:#9f1239;line-height:1.5;">
      <strong>Important Security Notice:</strong> If you did NOT make this change, your account may be compromised. Please use the emergency CLI or contact your system administrator immediately to regain control.
    </div>
  `.trim();

  const html = renderBaseLayout({
    title: "Security Alert: Password Changed — ICON Electromatic",
    heading: "Password Changed Successfully",
    subtitle: "CMS Account Security & Access Control",
    contentHtml,
  });

  const text = `ICON Electromatic — CMS Account Security
Security Alert: Password Changed

The password for administrator account ${safeAdminEmail} was changed on ${dateStr}.

All existing active sessions have been automatically revoked.

URGENT: If you did NOT make this change, your account may be compromised. Please use the emergency reset CLI or contact your system administrator immediately.

Icon Electromatic Pvt. Ltd. | Bengaluru • Singapore • United States`.trim();

  return { subject, html, text };
}

/**
 * 4. Recovery email changed or removed notification template.
 */
export function buildRecoveryEmailChangedNotificationEmail({
  adminEmail,
  action = "updated",
  previousRecoveryEmail = null,
  timestamp = new Date(),
}) {
  const subject = "Security Alert: CMS Recovery Email Updated — ICON Electromatic";
  const safeAdminEmail = typeof adminEmail === "string" ? adminEmail.trim() : "Administrator";
  const safeAction = typeof action === "string" ? action.trim() : "updated";
  const dateStr =
    timestamp instanceof Date
      ? timestamp.toUTCString()
      : new Date(timestamp).toUTCString();

  const contentHtml = `
    <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
      The recovery email address associated with the ICON Electromatic CMS administrator account <strong>${esc(safeAdminEmail)}</strong> was <strong>${esc(safeAction)}</strong> on:
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px;margin:16px 0;font-size:13px;color:#0f172a;">
      <strong>Timestamp:</strong> ${esc(dateStr)}<br>
      ${previousRecoveryEmail ? `<strong>Previous Recovery Email:</strong> ${esc(previousRecoveryEmail)}<br>` : ""}
      <strong>Status:</strong> ${esc(safeAction.toUpperCase())}
    </div>
    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:6px;padding:14px 16px;margin:20px 0;font-size:13px;color:#9f1239;line-height:1.5;">
      <strong>Security Notice:</strong> If you did not authorize this change, please sign in to the CMS immediately and review your Account Security section, or contact your system administrator.
    </div>
  `.trim();

  const html = renderBaseLayout({
    title: "Security Alert: Recovery Email Updated — ICON Electromatic",
    heading: "Recovery Email Updated",
    subtitle: "CMS Account Security & Access Control",
    contentHtml,
  });

  const text = `ICON Electromatic — CMS Account Security
Security Alert: Recovery Email Updated

The recovery email address for administrator account ${safeAdminEmail} was ${safeAction} on ${dateStr}.
${previousRecoveryEmail ? `Previous Recovery Email: ${previousRecoveryEmail}\n` : ""}
If you did not authorize this change, please log in to the CMS immediately and check your Account Security settings, or contact your system administrator.

Icon Electromatic Pvt. Ltd. | Bengaluru • Singapore • United States`.trim();

  return { subject, html, text };
}
