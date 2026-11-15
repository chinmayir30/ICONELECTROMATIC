/**
 * AccountSecurity.js — CMS Administrator Account Security & Recovery Management
 *
 * Requirements:
 * - One CMS admin account with permanent login email.
 * - One active recovery email at a time.
 * - Default recovery email is the login email, awaiting verification.
 * - Optional personal recovery email can be added with password step-up.
 * - Verification link sent only to the address being verified.
 * - Previous verified recovery address remains active until replacement verification.
 * - Never change the admin login email.
 * - Never allow personal recovery email to log in.
 */

import { ApiService } from '../data/ApiService.js';

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let securityState = {
  loading: true,
  error: '',
  configured: false,
  maskedEmail: null,
  verified: false,
  verifiedAt: null,
  loginEmail: '',
  maskedLoginEmail: null,
  isDefaultLoginEmail: true,
  showChangeForm: false,
  showRemoveModal: false,
  showVerifyLoginModal: false,
  pendingProposed: false,
};

export function renderAccountSecurityTab() {
  return `
    <div class="a-account-security-wrap" id="a-account-security-container">
      <div class="a-section-header" style="margin-bottom: 24px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--a-blue, #0b2e59); margin-bottom: 6px;">
          Account Security &amp; Password Recovery
        </h3>
        <p style="color: var(--a-muted, #64748b); font-size: 0.875rem;">
          Manage your emergency recovery destination. In the event of a lost password, reset instructions will be dispatched exclusively to your verified recovery address.
        </p>
      </div>

      <div id="a-security-content">
        ${renderSecurityContent()}
      </div>

      <div id="a-security-modal-slot"></div>
    </div>
  `;
}

function renderSecurityContent() {
  if (securityState.loading) {
    return `
      <div class="a-card" style="padding: 40px; text-align: center; color: var(--a-muted, #64748b);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--a-blue, #0b2e59); margin-bottom: 12px;"></i>
        <p style="font-size: 0.875rem;">Loading account recovery status from server...</p>
      </div>
    `;
  }

  if (securityState.error) {
    return `
      <div class="a-recovery-alert a-recovery-alert-error" style="margin-bottom: 20px;">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div>
          <strong>Unable to load recovery status</strong>
          <p>${esc(securityState.error)}</p>
        </div>
      </div>
      <button type="button" class="a-btn a-btn-outline a-btn-sm" id="a-retry-security-btn">
        <i class="fa-solid fa-rotate-left"></i> Retry
      </button>
    `;
  }

  const {
    configured,
    maskedEmail,
    verified,
    verifiedAt,
    maskedLoginEmail,
    isDefaultLoginEmail,
    showChangeForm,
    pendingProposed,
  } = securityState;

  let badgeClass = 'a-badge-empty';
  let badgeLabel = 'Not Configured';
  let badgeIcon = 'fa-circle-question';

  if (verified) {
    badgeClass = 'a-badge-verified';
    badgeLabel = 'Active & Verified';
    badgeIcon = 'fa-circle-check';
  } else {
    badgeClass = 'a-badge-pending';
    badgeLabel = 'Pending Verification';
    badgeIcon = 'fa-clock';
  }

  const displayAddress = maskedEmail || maskedLoginEmail || 'No address configured';
  const addressTypeLabel = isDefaultLoginEmail
    ? 'Default Recovery Address (Login Email)'
    : 'Personal Recovery Address';
  const formattedDate = verifiedAt ? new Date(verifiedAt).toLocaleString() : 'N/A';

  return `
    <div class="a-card a-security-card" style="background:#fff; border:1px solid var(--a-border, #e2e8f0); border-radius:10px; padding:24px; margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
        <div>
          <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:var(--a-muted, #64748b);">
            ${esc(addressTypeLabel)}
          </span>
          <div style="display:flex; align-items:center; gap:12px; margin-top:6px;">
            <span style="font-size:1.15rem; font-weight:600; color:var(--a-text, #1e293b); font-family:monospace;">
              ${esc(displayAddress)}
            </span>
            <span class="a-recovery-badge ${badgeClass}">
              <i class="fa-solid ${badgeIcon}"></i> ${esc(badgeLabel)}
            </span>
          </div>
          ${verified ? `
            <p style="color:var(--a-muted, #64748b); font-size:0.8rem; margin-top:4px;">
              Verified on: <strong>${esc(formattedDate)}</strong>
            </p>
          ` : ''}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          ${!verified && isDefaultLoginEmail ? `
            <button type="button" class="a-btn a-btn-primary a-btn-sm" id="a-verify-login-btn">
              <i class="fa-solid fa-envelope-circle-check"></i> Verify Login Email
            </button>
            <button type="button" class="a-btn a-btn-outline a-btn-sm" id="a-toggle-change-btn">
              <i class="fa-solid fa-plus"></i> Add Personal Recovery Email
            </button>
          ` : ''}

          ${verified && isDefaultLoginEmail ? `
            <button type="button" class="a-btn a-btn-outline a-btn-sm" id="a-toggle-change-btn">
              <i class="fa-solid fa-plus"></i> Add Personal Recovery Email
            </button>
          ` : ''}

          ${!isDefaultLoginEmail ? `
            <button type="button" class="a-btn a-btn-outline a-btn-sm" id="a-toggle-change-btn">
              <i class="fa-solid fa-pen"></i> Change Address
            </button>
            <button type="button" class="a-btn a-btn-danger a-btn-sm" id="a-open-remove-btn">
              <i class="fa-solid fa-trash-can"></i> Remove
            </button>
          ` : ''}
        </div>
      </div>

      ${pendingProposed ? `
        <div class="a-recovery-alert a-recovery-alert-pending" style="margin-bottom:16px;">
          <i class="fa-solid fa-paper-plane"></i>
          <div>
            <strong>Verification Email Dispatched</strong>
            <p>A confirmation link was sent to the proposed address. Check that inbox and click the verification link within 30 minutes to activate it. Note: Your current verified recovery address remains active until the new one is verified.</p>
          </div>
        </div>
      ` : ''}

      ${!verified ? `
        <div class="a-recovery-alert a-recovery-alert-warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Password recovery is currently inactive</strong>
            <p>Self-service password reset requires a verified recovery address. Click <strong>Verify Login Email</strong> to receive a confirmation link, or add an optional personal recovery address.</p>
          </div>
        </div>
      ` : ''}
    </div>

    ${showChangeForm ? renderChangeForm(configured, isDefaultLoginEmail) : ''}
  `;
}

function renderChangeForm(isConfigured, isDefaultLoginEmail) {
  const formTitle = isDefaultLoginEmail
    ? 'Add Personal Recovery Email'
    : 'Change Personal Recovery Email';
  return `
    <div class="a-card" style="background:#fff; border:1px solid var(--a-border, #e2e8f0); border-radius:10px; padding:24px;">
      <div style="border-bottom:1px solid var(--a-border, #e2e8f0); padding-bottom:12px; margin-bottom:20px;">
        <h4 style="font-size:1rem; font-weight:700; color:var(--a-blue, #0b2e59);">
          ${esc(formTitle)}
        </h4>
        <p style="color:var(--a-muted, #64748b); font-size:0.8rem; margin-top:2px;">
          Password step-up authentication is required. A verification link will be sent strictly to the personal address.
        </p>
      </div>

      <form id="a-recovery-request-form">
        <div class="a-field" style="margin-bottom:16px;">
          <label for="a-new-recovery-email" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">
            Personal Recovery Email Address
          </label>
          <input
            class="a-input"
            type="email"
            id="a-new-recovery-email"
            placeholder="e.g. personal.recovery@domain.com"
            maxlength="254"
            required
            style="width:100%; max-width:420px;"
          >
          <small style="color:var(--a-muted, #64748b); font-size:0.75rem; display:block; margin-top:4px;">
            Must be an active mailbox you control. Cannot be identical to your primary CMS login email.
          </small>
        </div>

        <div class="a-field" style="margin-bottom:20px;">
          <label for="a-stepup-password" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">
            Confirm Current CMS Password
          </label>
          <div class="a-password-wrapper" style="position:relative; width:100%; max-width:420px;">
            <input
              class="a-input"
              type="password"
              id="a-stepup-password"
              placeholder="Enter current password"
              autocomplete="current-password"
              required
              style="width:100%; padding-right:42px;"
            >
            <button
              type="button"
              id="a-toggle-stepup-password"
              class="a-password-toggle-btn"
              aria-label="Show password"
              title="Show password"
              aria-controls="a-stepup-password"
              style="position:absolute; right:0; top:50%; transform:translateY(-50%); width:38px; height:100%; border:none; background:transparent; color:var(--a-muted, #64748b); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.95rem; border-radius:0 7px 7px 0; transition:color 0.15s;"
            >
              <i class="fa-solid fa-eye" id="a-stepup-password-eye" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <p class="a-login-error" id="a-request-error" role="alert" style="margin-bottom:14px; font-size:0.85rem;"></p>

        <div style="display:flex; gap:10px; align-items:center;">
          <button type="submit" class="a-btn a-btn-primary" id="a-submit-request-btn">
            <i class="fa-solid fa-paper-plane"></i> Send Verification Link
          </button>
          <button type="button" class="a-btn a-btn-outline" id="a-cancel-change-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderVerifyLoginModal() {
  const targetLabel = securityState.maskedLoginEmail || securityState.maskedEmail || 'your login email';
  return `
    <div class="a-modal-backdrop" id="a-verify-login-modal-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;">
      <div class="a-modal-box" style="background:#fff; border-radius:10px; max-width:460px; width:100%; padding:24px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:40px; height:40px; border-radius:50%; background:#dbeafe; color:#2563eb; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
            <i class="fa-solid fa-envelope-circle-check"></i>
          </div>
          <div>
            <h4 style="font-size:1.1rem; font-weight:700; color:#1e293b; margin:0;">Verify Login Email</h4>
            <p style="font-size:0.8rem; color:#64748b; margin:0;">Dispatch verification link to ${esc(targetLabel)}</p>
          </div>
        </div>

        <p style="font-size:0.85rem; color:#475569; line-height:1.5; margin-bottom:16px;">
          Please confirm your CMS password to dispatch a 30-minute verification link to your primary login inbox. Once verified, this address will serve as your active recovery destination.
        </p>

        <form id="a-verify-login-form">
          <div class="a-field" style="margin-bottom:16px;">
            <label for="a-verify-login-password" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">
              Current CMS Password
            </label>
            <input
              class="a-input"
              type="password"
              id="a-verify-login-password"
              placeholder="Enter current password"
              autocomplete="current-password"
              required
              style="width:100%;"
            >
          </div>

          <p class="a-login-error" id="a-verify-login-error" role="alert" style="margin-bottom:14px; font-size:0.85rem;"></p>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="a-btn a-btn-outline" id="a-cancel-verify-login-modal-btn">
              Cancel
            </button>
            <button type="submit" class="a-btn a-btn-primary" id="a-confirm-verify-login-submit-btn">
              <i class="fa-solid fa-paper-plane"></i> Send Verification Link
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderRemoveModal() {
  return `
    <div class="a-modal-backdrop" id="a-remove-modal-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;">
      <div class="a-modal-box" style="background:#fff; border-radius:10px; max-width:460px; width:100%; padding:24px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:40px; height:40px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 style="font-size:1.1rem; font-weight:700; color:#1e293b; margin:0;">Remove Personal Recovery Email</h4>
            <p style="font-size:0.8rem; color:#64748b; margin:0;">This action requires password confirmation.</p>
          </div>
        </div>

        <p style="font-size:0.85rem; color:#475569; line-height:1.5; margin-bottom:16px;">
          Are you sure you want to remove your personal recovery email? Recovery destination will revert to your primary login email.
        </p>

        <form id="a-remove-recovery-form">
          <div class="a-field" style="margin-bottom:16px;">
            <label for="a-remove-password" style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">
              Current CMS Password
            </label>
            <input
              class="a-input"
              type="password"
              id="a-remove-password"
              placeholder="Enter current password"
              autocomplete="current-password"
              required
              style="width:100%;"
            >
          </div>

          <p class="a-login-error" id="a-remove-error" role="alert" style="margin-bottom:14px; font-size:0.85rem;"></p>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" class="a-btn a-btn-outline" id="a-cancel-remove-modal-btn">
              Cancel
            </button>
            <button type="submit" class="a-btn a-btn-danger" id="a-confirm-remove-submit-btn">
              <i class="fa-solid fa-trash-can"></i> Remove Address
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function bindAccountSecurityEvents(rerenderParent, toastNotifier) {
  async function loadStatus() {
    securityState.loading = true;
    securityState.error = '';
    updateDOM();

    try {
      const data = await ApiService.getRecoveryEmailStatus();
      securityState.loading = false;
      securityState.configured = Boolean(data?.configured);
      securityState.maskedEmail = data?.maskedEmail || null;
      securityState.verified = Boolean(data?.verified);
      securityState.verifiedAt = data?.verifiedAt || null;
      securityState.loginEmail = data?.loginEmail || '';
      securityState.maskedLoginEmail = data?.maskedLoginEmail || null;
      if (typeof data?.isDefaultLoginEmail === 'boolean') {
        securityState.isDefaultLoginEmail = data.isDefaultLoginEmail;
      } else if (data?.maskedEmail && data?.maskedLoginEmail) {
        securityState.isDefaultLoginEmail = data.maskedEmail === data.maskedLoginEmail;
      } else {
        securityState.isDefaultLoginEmail = !data?.configured;
      }
    } catch (err) {
      securityState.loading = false;
      securityState.error = err?.message || 'Failed to load recovery email status.';
    }
    updateDOM();
  }

  function updateDOM() {
    const slot = document.getElementById('a-security-content');
    if (slot) {
      slot.innerHTML = renderSecurityContent();
      attachInlineEvents();
    }
    const modalSlot = document.getElementById('a-security-modal-slot');
    if (modalSlot) {
      if (securityState.showRemoveModal) {
        modalSlot.innerHTML = renderRemoveModal();
      } else if (securityState.showVerifyLoginModal) {
        modalSlot.innerHTML = renderVerifyLoginModal();
      } else {
        modalSlot.innerHTML = '';
      }
      attachModalEvents();
    }
  }

  function attachInlineEvents() {
    document.getElementById('a-retry-security-btn')?.addEventListener('click', () => {
      loadStatus();
    });

    document.getElementById('a-verify-login-btn')?.addEventListener('click', () => {
      securityState.showVerifyLoginModal = true;
      securityState.showRemoveModal = false;
      updateDOM();
    });

    document.getElementById('a-toggle-change-btn')?.addEventListener('click', () => {
      securityState.showChangeForm = !securityState.showChangeForm;
      updateDOM();
    });

    document.getElementById('a-cancel-change-btn')?.addEventListener('click', () => {
      securityState.showChangeForm = false;
      updateDOM();
    });

    document.getElementById('a-open-remove-btn')?.addEventListener('click', () => {
      securityState.showRemoveModal = true;
      securityState.showVerifyLoginModal = false;
      updateDOM();
    });

    const toggleStepupBtn = document.getElementById('a-toggle-stepup-password');
    const stepupPasswordInput = document.getElementById('a-stepup-password');
    const stepupEyeIcon = document.getElementById('a-stepup-password-eye');

    if (toggleStepupBtn && stepupPasswordInput && stepupEyeIcon) {
      toggleStepupBtn.addEventListener('click', () => {
        const isPassword = stepupPasswordInput.type === 'password';
        stepupPasswordInput.type = isPassword ? 'text' : 'password';
        stepupEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        const label = isPassword ? 'Hide password' : 'Show password';
        toggleStepupBtn.setAttribute('aria-label', label);
        toggleStepupBtn.setAttribute('title', label);
      });
    }

    const requestForm = document.getElementById('a-recovery-request-form');
    if (requestForm) {
      requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmailInput = document.getElementById('a-new-recovery-email');
        const passwordInput = document.getElementById('a-stepup-password');
        const submitBtn = document.getElementById('a-submit-request-btn');
        const errorEl = document.getElementById('a-request-error');

        const newEmail = newEmailInput?.value?.trim() || '';
        const password = passwordInput?.value || '';

        if (errorEl) errorEl.textContent = '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Link...';
        }

        try {
          const response = await ApiService.requestRecoveryEmailChange(newEmail, password);
          securityState.showChangeForm = false;
          securityState.pendingProposed = true;
          if (toastNotifier) {
            toastNotifier(response?.message || 'Verification link dispatched to proposed address.', 'success');
          }
          await loadStatus();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Verification Link';
          }
          if (errorEl) {
            errorEl.textContent = err?.message || 'Failed to request recovery email change.';
          }
        }
      });
    }
  }

  function attachModalEvents() {
    document.getElementById('a-cancel-remove-modal-btn')?.addEventListener('click', () => {
      securityState.showRemoveModal = false;
      updateDOM();
    });

    document.getElementById('a-cancel-verify-login-modal-btn')?.addEventListener('click', () => {
      securityState.showVerifyLoginModal = false;
      updateDOM();
    });

    const verifyLoginForm = document.getElementById('a-verify-login-form');
    if (verifyLoginForm) {
      verifyLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById('a-verify-login-password');
        const submitBtn = document.getElementById('a-confirm-verify-login-submit-btn');
        const errorEl = document.getElementById('a-verify-login-error');

        const password = passwordInput?.value || '';
        if (errorEl) errorEl.textContent = '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Link...';
        }

        try {
          // If loginEmail is not yet stored in state, fallback to empty or let backend validate
          const targetEmail = securityState.loginEmail || '';
          const response = await ApiService.requestRecoveryEmailChange(targetEmail, password);
          securityState.showVerifyLoginModal = false;
          securityState.pendingProposed = true;
          if (toastNotifier) {
            toastNotifier(response?.message || 'Verification link dispatched to login email.', 'success');
          }
          await loadStatus();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Verification Link';
          }
          if (errorEl) {
            errorEl.textContent = err?.message || 'Failed to dispatch verification link.';
          }
        }
      });
    }

    const removeForm = document.getElementById('a-remove-recovery-form');
    if (removeForm) {
      removeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById('a-remove-password');
        const submitBtn = document.getElementById('a-confirm-remove-submit-btn');
        const errorEl = document.getElementById('a-remove-error');

        const password = passwordInput?.value || '';
        if (errorEl) errorEl.textContent = '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Removing...';
        }

        try {
          const response = await ApiService.removeRecoveryEmail(password);
          securityState.showRemoveModal = false;
          securityState.pendingProposed = false;
          if (toastNotifier) {
            toastNotifier(response?.message || 'Recovery email removed successfully.', 'success');
          }
          await loadStatus();
        } catch (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Remove Address';
          }
          if (errorEl) {
            errorEl.textContent = err?.message || 'Failed to remove recovery email.';
          }
        }
      });
    }
  }

  // Initial fetch of account security status
  return loadStatus();
}
