import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRecoveryVerificationEmail,
  buildPasswordResetEmail,
  buildPasswordChangedNotificationEmail,
  buildRecoveryEmailChangedNotificationEmail,
  sendRecoveryVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendRecoveryEmailChangedEmail,
} from "../src/services/emailService.js";

test("buildRecoveryVerificationEmail generates escaped HTML and plain text with 30-min expiry", () => {
  const maliciousEmail = 'admin<script>alert("xss")</script>@example.com';
  const verificationUrl = "https://example.com/verify?token=abcdef123456&admin=1";

  const { subject, html, text } = buildRecoveryVerificationEmail({
    adminEmail: maliciousEmail,
    verificationUrl,
    expiresMinutes: 30,
  });

  assert.equal(subject, "Verify Recovery Email Address — ICON Electromatic CMS");

  // XSS protection
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"));

  // 30-minute expiry
  assert.ok(html.includes("30 minutes"));
  assert.ok(text.includes("30 minutes"));

  // URL present (HTML escaped in href, plain text raw)
  assert.ok(html.includes("https://example.com/verify?token=abcdef123456&amp;admin=1"));
  assert.ok(text.includes(verificationUrl));

  // Plain-text content
  assert.ok(text.includes("Recovery Email Verification"));
  assert.ok(text.includes("Icon Electromatic Pvt. Ltd."));
});

test("buildPasswordResetEmail generates escaped HTML and plain text with 30-min expiry", () => {
  const adminEmail = 'admin"quote@example.com';
  const resetUrl = "https://example.com/reset?token=deadbeef67890";

  const { subject, html, text } = buildPasswordResetEmail({
    adminEmail,
    resetUrl,
    expiresMinutes: 30,
  });

  assert.equal(subject, "Reset Your CMS Password — ICON Electromatic");
  assert.ok(!html.includes('admin"quote'));
  assert.ok(html.includes("admin&quot;quote@example.com"));

  assert.ok(html.includes("30 minutes"));
  assert.ok(text.includes("30 minutes"));

  assert.ok(html.includes(resetUrl));
  assert.ok(text.includes(resetUrl));

  assert.ok(text.includes("Password Reset Request"));
});

test("buildPasswordChangedNotificationEmail alerts user and confirms sessions revoked", () => {
  const date = new Date("2026-11-12T12:00:00Z");
  const { subject, html, text } = buildPasswordChangedNotificationEmail({
    adminEmail: "admin@iconelectromatic.com",
    timestamp: date,
  });

  assert.ok(subject.includes("Password Has Been Changed"));
  assert.ok(html.includes("admin@iconelectromatic.com"));
  assert.ok(html.includes("terminated"));
  assert.ok(text.includes("revoked"));
  assert.ok(text.includes(date.toUTCString()));
});

test("buildRecoveryEmailChangedNotificationEmail alerts user with action and timestamp", () => {
  const date = new Date("2026-11-12T12:00:00Z");
  const { subject, html, text } = buildRecoveryEmailChangedNotificationEmail({
    adminEmail: "admin@iconelectromatic.com",
    action: "updated",
    previousRecoveryEmail: "old@example.com",
    timestamp: date,
  });

  assert.ok(subject.includes("Recovery Email Updated"));
  assert.ok(html.includes("old@example.com"));
  assert.ok(text.includes("old@example.com"));
  assert.ok(text.includes("updated on"));
});

test("sendRecoveryVerificationEmail sends email via injected mock client without real network calls", async () => {
  let sentPayload = null;
  const mockResend = {
    emails: {
      send: async (payload) => {
        sentPayload = payload;
        return { data: { id: "resend-test-id-1" }, error: null };
      },
    },
  };

  const mockConfig = {
    apiKey: "re_mock_test_key",
    fromEmail: "security@iconelectromatic.com",
    contactEmail: "contact@iconelectromatic.com",
    isConfigured: true,
    missing: [],
  };

  const result = await sendRecoveryVerificationEmail(
    {
      to: "recovery@example.com",
      adminEmail: "admin@iconelectromatic.com",
      verificationUrl: "https://example.com/verify-recovery?token=123",
      expiresMinutes: 30,
    },
    { resendClient: mockResend, config: mockConfig }
  );

  assert.equal(result.ok, true);
  assert.equal(result.id, "resend-test-id-1");
  assert.deepEqual(sentPayload.to, ["recovery@example.com"]);
  assert.equal(sentPayload.from, "security@iconelectromatic.com");
  assert.ok(sentPayload.subject.includes("Verify Recovery Email"));
  assert.ok(sentPayload.html.includes("30 minutes"));
  assert.ok(sentPayload.text.includes("30 minutes"));
});

test("sendPasswordResetEmail handles delivery failure safely", async () => {
  const mockResend = {
    emails: {
      send: async () => ({
        data: null,
        error: { message: "Rate limit exceeded" },
      }),
    },
  };

  const mockConfig = {
    apiKey: "re_mock_test_key",
    fromEmail: "security@iconelectromatic.com",
    contactEmail: "contact@iconelectromatic.com",
    isConfigured: true,
    missing: [],
  };

  const result = await sendPasswordResetEmail(
    {
      to: "recovery@example.com",
      adminEmail: "admin@iconelectromatic.com",
      resetUrl: "https://example.com/reset?token=abc",
    },
    { resendClient: mockResend, config: mockConfig }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "Rate limit exceeded");
});

test("sendPasswordChangedEmail rejects unconfigured environment without throwing", async () => {
  const unconfiguredConfig = {
    isConfigured: false,
    missing: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
  };

  const result = await sendPasswordChangedEmail(
    { to: "admin@example.com", adminEmail: "admin@example.com" },
    { config: unconfiguredConfig }
  );

  assert.equal(result.ok, false);
  assert.ok(result.error.includes("Server email configuration incomplete"));
});

test("sendRecoveryEmailChangedEmail rejects missing recipient", async () => {
  const mockConfig = {
    apiKey: "re_mock_test_key",
    fromEmail: "security@iconelectromatic.com",
    contactEmail: "contact@iconelectromatic.com",
    isConfigured: true,
    missing: [],
  };

  const result = await sendRecoveryEmailChangedEmail(
    { to: "", adminEmail: "admin@example.com" },
    { config: mockConfig }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "Missing recipient email address.");
});
