/**
 * PublicRecovery.js — Public Recovery Email Verification & Password Reset views
 *
 * Requirements:
 * - Standalone branded public views (no admin session required).
 * - Safe URL token extraction and immediate address bar URL scrubbing via history.replaceState.
 * - Explicit user confirmation before token consumption (never consume on GET).
 * - Strict password policy enforcement (14–1024 characters).
 * - No tokens or passwords logged or saved in localStorage/sessionStorage.
 */

import { ApiService } from '../data/ApiService.js';

if (typeof window !== 'undefined') {
  import('./admin.css').catch(() => {});
}

const RECOVERY_STYLES = `
<style id="a-recovery-inline-styles">
  .a-recovery-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0b2e59 0%, #0e3a72 60%, #1a1a2e 100%);
    padding: 24px 16px;
    box-sizing: border-box;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .a-recovery-box {
    background: #ffffff !important;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    box-sizing: border-box;
    color: #1e293b;
  }
  .a-recovery-box .a-login-logo {
    text-align: center;
    margin-bottom: 24px;
  }
  .a-recovery-box .a-login-logo img {
    height: 48px;
    max-width: 100%;
  }
  .a-recovery-box h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: #0b2e59;
    text-align: center;
    margin: 0 0 8px 0;
  }
  .a-recovery-box p {
    font-size: 0.88rem;
    color: #64748b;
    text-align: center;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
  .a-recovery-box .a-recovery-notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    margin: 16px 0;
    font-size: 0.85rem;
    color: #475569;
    text-align: left;
  }
  .a-recovery-box .a-recovery-notice i {
    color: #0b2e59;
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }
  .a-recovery-box .a-recovery-notice strong {
    display: block;
    color: #1e293b;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .a-recovery-box .a-recovery-notice p {
    margin: 0;
    text-align: left;
    font-size: 0.82rem;
    color: #64748b;
    line-height: 1.45;
  }
  .a-recovery-box .a-btn-primary {
    background: #0b2e59 !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    padding: 13px 24px !important;
    border-radius: 8px !important;
    border: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    width: 100% !important;
    cursor: pointer !important;
    box-shadow: 0 4px 14px rgba(11, 46, 89, 0.3) !important;
    transition: all 0.2s ease !important;
    text-decoration: none !important;
    box-sizing: border-box;
  }
  .a-recovery-box .a-btn-primary:hover:not(:disabled) {
    background: #0e3a72 !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(11, 46, 89, 0.4) !important;
  }
  .a-recovery-box .a-btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .a-recovery-box .a-btn-outline {
    background: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #475569 !important;
    font-weight: 500 !important;
    padding: 9px 18px !important;
    border-radius: 8px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    font-size: 0.85rem !important;
    text-decoration: none !important;
    transition: all 0.15s ease !important;
    cursor: pointer !important;
    box-sizing: border-box;
  }
  .a-recovery-box .a-btn-outline:hover {
    border-color: #0b2e59 !important;
    color: #0b2e59 !important;
    background: #f8fafc !important;
  }
  .a-recovery-box .a-login-error {
    color: #b42318;
    font-size: 0.82rem;
    margin: 12px 0 0;
    text-align: center;
  }
  .a-recovery-box .a-login-error:empty {
    display: none;
  }
  .a-recovery-box .a-recovery-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    margin-bottom: 16px;
    text-align: left;
  }
  .a-recovery-box .a-recovery-alert i {
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }
  .a-recovery-box .a-recovery-alert strong {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .a-recovery-box .a-recovery-alert p {
    margin: 0;
    text-align: left;
    font-size: 0.82rem;
    line-height: 1.45;
    color: inherit;
  }
  .a-recovery-box .a-recovery-alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }
  .a-recovery-box .a-recovery-alert-success i {
    color: #059669;
  }
  .a-recovery-box .a-recovery-alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }
  .a-recovery-box .a-recovery-alert-error i {
    color: #dc2626;
  }
  .a-recovery-box .a-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
    text-align: left;
  }
  .a-recovery-box .a-field label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #64748b;
  }
  .a-recovery-box .a-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.92rem;
    color: #1e293b;
    box-sizing: border-box;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .a-recovery-box .a-input:focus {
    border-color: #0b2e59;
    box-shadow: 0 0 0 3px rgba(11, 46, 89, 0.12);
  }
  #custom-cursor-ring,
  #custom-cursor-dot,
  .custom-cursor-ring,
  .custom-cursor-dot {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
</style>
`;

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function scrubUrlToken() {
  if (typeof window !== 'undefined' && window.location) {
    const hasSearch = Boolean(window.location.search);
    const hasHashQuery = Boolean(window.location.hash && window.location.hash.includes('?'));
    if (hasSearch || hasHashQuery) {
      const cleanPath = window.location.pathname || '/admin';
      try {
        window.history.replaceState(window.history.state, '', cleanPath);
      } catch {
        // Non-blocking in test or restricted environments
      }
    }
  }
}

export function extractToken(params) {
  let token = params?._query?.get('token') || '';
  if (!token && typeof window !== 'undefined' && window.location?.search) {
    token = new URLSearchParams(window.location.search).get('token') || '';
  }
  return typeof token === 'string' ? token.trim() : '';
}

// ─── 1. Recovery Email Verification View ──────────────────────────────────────

export function renderVerifyRecoveryPage() {
  return `
    ${RECOVERY_STYLES}
    <div class="a-login-page a-recovery-page">
      <div class="a-login-box a-recovery-box" id="a-verify-card">
        <div class="a-login-logo">
          <img src="/icon-logo-transparent.png" alt="Icon Electromatic" onerror="this.style.display='none'">
        </div>
        <h2>Verify Recovery Email</h2>
        <p>Confirm ownership to activate this address for emergency CMS password recovery.</p>

        <div id="a-verify-state">
          <div class="a-recovery-notice">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>Security Confirmation</strong>
              <p>Clicking the button below confirms that you control this email address. Verification links expire 30 minutes after issuance.</p>
            </div>
          </div>
          <button type="button" class="a-btn a-btn-primary" id="a-confirm-verify-btn" style="width:100%; margin-top:16px; background-color:#0b2e59 !important; color:#ffffff !important;">
            <i class="fa-solid fa-circle-check"></i> Confirm Verification
          </button>
        </div>

        <p class="a-login-error" id="a-verify-error" role="alert" style="margin-top:12px;"></p>

        <div style="margin-top:20px; text-align:center;">
          <a href="/admin" data-route="/admin" class="a-btn a-btn-outline a-btn-sm" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none;">
            <i class="fa-solid fa-arrow-left"></i> Return to Sign In
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initVerifyRecoveryPage(params) {
  const token = extractToken(params);
  scrubUrlToken();

  const verifyCard = document.getElementById('a-verify-card');
  const verifyState = document.getElementById('a-verify-state');
  const errorEl = document.getElementById('a-verify-error');
  const confirmBtn = document.getElementById('a-confirm-verify-btn');

  function setError(msg) {
    if (errorEl) errorEl.textContent = msg;
  }

  if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
    if (verifyState) {
      verifyState.innerHTML = `
        <div class="a-recovery-alert a-recovery-alert-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div>
            <strong>Invalid Verification Link</strong>
            <p>This verification link is missing or malformed. Please request a new verification link from your CMS Account Security settings.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
    setError('');

    try {
      const response = await ApiService.confirmRecoveryEmail(token);
      const successMessage = response?.message || 'Recovery email verified successfully.';

      if (verifyState) {
        verifyState.innerHTML = `
          <div class="a-recovery-alert a-recovery-alert-success">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Verification Complete</strong>
              <p>${esc(successMessage)} This address is now active for emergency password recovery.</p>
            </div>
          </div>
          <div style="margin-top:20px; text-align:center;">
            <a href="/admin" data-route="/admin" class="a-btn a-btn-primary" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; width:100%; justify-content:center;">
              Sign In to CMS <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        `;
      }
    } catch (err) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Confirm Verification';
      setError(err?.message || 'Verification link is invalid, expired, or has already been used.');
    }
  });
}

// ─── 2. Password Reset View ───────────────────────────────────────────────────

export function renderResetPasswordPage() {
  return `
    ${RECOVERY_STYLES}
    <div class="a-login-page a-recovery-page">
      <div class="a-login-box a-recovery-box" id="a-reset-card">
        <div class="a-login-logo">
          <img src="/icon-logo-transparent.png" alt="Icon Electromatic" onerror="this.style.display='none'">
        </div>
        <h2>Reset Administrator Password</h2>
        <p>Enter a new secure password for your administrator account.</p>

        <div id="a-reset-state">
          <form class="a-login-form" id="a-reset-form">
            <div class="a-field">
              <label for="a-new-password">New Password</label>
              <input class="a-input" type="password" id="a-new-password" autocomplete="new-password" minlength="14" maxlength="1024" required>
              <small class="a-field-hint" style="color:var(--a-muted, #64748b); font-size:0.75rem; display:block; margin-top:4px;">
                Must be at least 14 characters (maximum 1024).
              </small>
            </div>
            <div class="a-field">
              <label for="a-confirm-password">Confirm New Password</label>
              <input class="a-input" type="password" id="a-confirm-password" autocomplete="new-password" minlength="14" maxlength="1024" required>
            </div>
            <button type="submit" class="a-btn a-btn-primary" id="a-submit-reset-btn" style="width:100%; background-color:#0b2e59 !important; color:#ffffff !important;">
              Set New Password <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        </div>

        <p class="a-login-error" id="a-reset-error" role="alert" style="margin-top:12px;"></p>

        <div style="margin-top:20px; text-align:center;">
          <a href="/admin" data-route="/admin" class="a-btn a-btn-outline a-btn-sm" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none;">
            <i class="fa-solid fa-arrow-left"></i> Return to Sign In
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initResetPasswordPage(params) {
  const token = extractToken(params);
  scrubUrlToken();

  const resetState = document.getElementById('a-reset-state');
  const errorEl = document.getElementById('a-reset-error');
  const resetForm = document.getElementById('a-reset-form');

  function setError(msg) {
    if (errorEl) errorEl.textContent = msg;
  }

  if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
    if (resetState) {
      resetState.innerHTML = `
        <div class="a-recovery-alert a-recovery-alert-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div>
            <strong>Invalid Reset Link</strong>
            <p>This password reset link is missing or malformed. Please request a new password reset link from the sign-in screen.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  if (!resetForm) return;

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('a-new-password')?.value || '';
    const confirmPassword = document.getElementById('a-confirm-password')?.value || '';
    const submitBtn = document.getElementById('a-submit-reset-btn');

    setError('');

    // Client-side pre-validation consistent with server policy
    if (newPassword.length < 14) {
      setError('Password must be at least 14 characters long.');
      return;
    }
    if (newPassword.length > 1024) {
      setError('Password cannot exceed 1024 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating Password...';
    }

    try {
      const response = await ApiService.resetPassword(token, newPassword, confirmPassword);
      const successMessage = response?.message || 'Password reset successfully. All active sessions have been terminated.';

      if (resetState) {
        resetState.innerHTML = `
          <div class="a-recovery-alert a-recovery-alert-success">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Password Reset Complete</strong>
              <p>${esc(successMessage)}</p>
            </div>
          </div>
          <div style="margin-top:20px; text-align:center;">
            <a href="/admin" data-route="/admin" class="a-btn a-btn-primary" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; width:100%; justify-content:center;">
              Sign In with New Password <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        `;
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Set New Password <i class="fa-solid fa-arrow-right"></i>';
      }
      setError(err?.message || 'Password reset link is invalid, expired, or has already been used.');
    }
  });
}
