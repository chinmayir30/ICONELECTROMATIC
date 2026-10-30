/**
 * ImageMigrationModal.js — Phase 2.2.4: IndexedDB to Supabase Storage Image Migration UI
 *
 * Implements interactive pre-flight verification, discovery audit preview,
 * progress tracking, conflict alerts, and targeted rollback controls.
 */

import './migration.css';
import { ImageMigrationService } from '../../services/ImageMigrationService.js';
import { supabaseClient } from '../../services/supabaseClient.js';
import { authService } from '../../services/authService.js';

let currentAudit = null;
let currentMigrationResult = null;
let isMigrating = false;

export function renderMigrationModal() {
  const isAuth = authService.isAuthenticated();
  const isMock = authService.isMockSession
    ? authService.isMockSession()
    : (typeof localStorage !== 'undefined' && (localStorage.getItem('icon_staff_token') || '').startsWith('mock_'));
  const supabaseUrl = supabaseClient.supabaseUrl || 'https://mock.supabase.co';
  const targetBucket = 'catalog-images';

  return `
    <div class="migration-modal-backdrop" id="migration-modal-backdrop">
      <div class="migration-modal-card">
        <div class="migration-modal-header">
          <div>
            <h3><i class="fa-solid fa-cloud-arrow-up" style="color: #e51e2a;"></i> IndexedDB Cloud Image Migration</h3>
            <p>Phase 2.2.4 — Migrate browser-local IndexedDB image blobs to shared Supabase Storage</p>
          </div>
          <button type="button" class="a-btn a-btn-sm a-btn-outline" id="btn-close-migration" style="padding: 4px 10px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="migration-modal-body" id="migration-modal-body">
          <!-- Preflight Authorization & Configuration Gates -->
          <div class="migration-preflight-grid">
            <div class="migration-preflight-card valid">
              <strong>Target Storage URL</strong>
              <code>${supabaseUrl}</code>
            </div>
            <div class="migration-preflight-card valid">
              <strong>Target Bucket</strong>
              <code>${targetBucket}</code> (Public Read)
            </div>
            <div class="migration-preflight-card ${isAuth && !isMock ? 'valid' : 'invalid'}">
              <strong>Staff Session</strong>
              <span>${isAuth && !isMock ? '<i class="fa-solid fa-check" style="color:#10b981;"></i> Authenticated' : (isMock ? '<i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i> Mock Session (Prohibited)' : '<i class="fa-solid fa-xmark" style="color:#ef4444;"></i> Not Authenticated')}</span>
            </div>
          </div>

          <!-- Audit Stats Section -->
          <div id="migration-audit-summary">
            <div class="migration-stats-grid">
              <div class="migration-stat-box highlight">
                <h4 id="stat-total-refs">-</h4>
                <p>CMS References</p>
              </div>
              <div class="migration-stat-box highlight">
                <h4 id="stat-unique-images">-</h4>
                <p>Unique Images</p>
              </div>
              <div class="migration-stat-box warning">
                <h4 id="stat-orphaned-blobs">-</h4>
                <p>Orphaned Blobs</p>
              </div>
              <div class="migration-stat-box error">
                <h4 id="stat-dangling-refs">-</h4>
                <p>Missing Blobs</p>
              </div>
            </div>

            <div class="migration-option-row" style="margin-top: 14px;">
              <input type="checkbox" id="chk-include-orphans">
              <label for="chk-include-orphans" style="cursor: pointer;">
                <strong>Upload unreferenced orphaned blobs</strong> (Default: off. Retains local blobs without uploading)
              </label>
            </div>
          </div>

          <!-- Progress and Live Logs -->
          <div class="migration-progress-box" id="migration-progress-box" style="display: none;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
              <span id="migration-step-label">Initializing migration...</span>
              <span id="migration-percent-label">0%</span>
            </div>
            <div class="migration-progress-bar-bg">
              <div class="migration-progress-bar-fill" id="migration-progress-bar-fill"></div>
            </div>
            <div class="migration-console" id="migration-console">
              <div>[Ready] Awaiting migration command...</div>
            </div>
          </div>

          <!-- Completion Banner & Action Panel -->
          <div id="migration-results-panel" style="display: none;"></div>
        </div>

        <div class="migration-modal-footer">
          <button type="button" class="a-btn a-btn-outline" id="btn-cancel-migration">Close</button>
          <button type="button" class="a-btn a-btn-outline" id="btn-run-audit">
            <i class="fa-solid fa-magnifying-glass"></i> Scan Storage
          </button>
          <button type="button" class="a-btn a-btn-primary" id="btn-start-migration" ${isMock || !isAuth ? 'disabled' : ''}>
            <i class="fa-solid fa-cloud-arrow-up"></i> Start Migration
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindMigrationModalEvents() {
  const backdrop = document.getElementById('migration-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-migration');
  const cancelBtn = document.getElementById('btn-cancel-migration');
  const runAuditBtn = document.getElementById('btn-run-audit');
  const startMigrationBtn = document.getElementById('btn-start-migration');
  const chkIncludeOrphans = document.getElementById('chk-include-orphans');

  function closeModal() {
    if (isMigrating) {
      if (!confirm('Migration is currently running. Closing the window will not stop background storage operations. Are you sure?')) {
        return;
      }
    }
    if (backdrop) backdrop.remove();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Run initial scan
  async function performAudit() {
    if (runAuditBtn) runAuditBtn.disabled = true;
    try {
      const audit = await ImageMigrationService.runDiscoveryAudit();
      currentAudit = audit;

      const statTotal = document.getElementById('stat-total-refs');
      const statUnique = document.getElementById('stat-unique-images');
      const statOrphan = document.getElementById('stat-orphaned-blobs');
      const statDangling = document.getElementById('stat-dangling-refs');

      if (statTotal) statTotal.textContent = audit.totalReferences;
      if (statUnique) statUnique.textContent = audit.uniqueImagesCount;
      if (statOrphan) statOrphan.textContent = audit.orphanedBlobs.length;
      if (statDangling) statDangling.textContent = audit.danglingReferences.length;
    } catch (err) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      if (runAuditBtn) runAuditBtn.disabled = false;
    }
  }

  if (runAuditBtn) runAuditBtn.addEventListener('click', performAudit);

  // Auto-run audit on open
  performAudit();

  // Start Migration
  if (startMigrationBtn) {
    startMigrationBtn.addEventListener('click', async () => {
      const isMock = authService.isMockSession
        ? authService.isMockSession()
        : (typeof localStorage !== 'undefined' && (localStorage.getItem('icon_staff_token') || '').startsWith('mock_'));

      if (isMock) {
        alert('Migration prohibited in mock preview mode. Please sign in with an authentic staff account.');
        return;
      }

      if (!confirm('Are you sure you want to begin migrating IndexedDB images to Supabase Storage? A pre-migration backup will be saved automatically in IndexedDB.')) {
        return;
      }

      const progressBox = document.getElementById('migration-progress-box');
      const progressFill = document.getElementById('migration-progress-bar-fill');
      const stepLabel = document.getElementById('migration-step-label');
      const percentLabel = document.getElementById('migration-percent-label');
      const consoleLog = document.getElementById('migration-console');
      const resultsPanel = document.getElementById('migration-results-panel');

      if (progressBox) progressBox.style.display = 'block';
      if (resultsPanel) resultsPanel.style.display = 'none';
      if (startMigrationBtn) startMigrationBtn.disabled = true;
      if (runAuditBtn) runAuditBtn.disabled = true;
      isMigrating = true;

      const logMsg = (level, msg) => {
        if (!consoleLog) return;
        const line = document.createElement('div');
        line.className = `log-${level}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
      };

      try {
        const includeOrphans = chkIncludeOrphans ? chkIncludeOrphans.checked : false;

        const result = await ImageMigrationService.executeMigration({
          includeOrphans,
          bucket: 'catalog-images'
        }, {
          onProgress: (step, percent, details) => {
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (percentLabel) percentLabel.textContent = `${percent}%`;
            if (stepLabel) stepLabel.textContent = details;
          },
          onLog: logMsg
        });

        currentMigrationResult = result;
        renderResults(result);
      } catch (err) {
        logMsg('error', `MIGRATION FAILED: ${err.message}`);
        renderError(err);
      } finally {
        isMigrating = false;
        if (runAuditBtn) runAuditBtn.disabled = false;
      }
    });
  }

  function renderResults(result) {
    const resultsPanel = document.getElementById('migration-results-panel');
    if (!resultsPanel) return;

    resultsPanel.style.display = 'block';
    const isSuccess = result.status === 'COMPLETED_SUCCESS';
    const isWarning = result.status === 'COMPLETED_WITH_WARNINGS';

    resultsPanel.innerHTML = `
      <div class="migration-banner ${isSuccess ? 'success' : 'warning'}">
        <i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-triangle-exclamation'}" style="font-size: 1.5rem;"></i>
        <div>
          <strong>${isSuccess ? 'Migration Completed Successfully!' : 'Migration Completed with Warnings'}</strong>
          <p>${result.rewrittenCount} of ${result.totalReferences} references rewritten to Supabase CDN URLs. ${result.uniqueUploaded} unique images verified.</p>
        </div>
      </div>

      ${result.residualsCount > 0 ? `
        <div style="margin-top: 12px;">
          <h5 style="font-size: 0.85rem; font-weight: 700; color: #92400e; margin-bottom: 6px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Unmigrated Residual Strings (${result.residualsCount})
          </h5>
          <div class="migration-table-wrap">
            <table class="migration-table">
              <thead><tr><th>Storage Key</th><th>Content Snippet</th></tr></thead>
              <tbody>
                ${result.residualMatches.map(r => `<tr><td><code>${r.key}</code></td><td>${r.snippet}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px; border-radius: 8px;">
        <span style="font-size: 0.82rem; color: #64748b;">
          Original IndexedDB blobs have been preserved. You may revert rewritten references at any time.
        </span>
        <button type="button" class="a-btn a-btn-outline a-btn-sm" id="btn-trigger-rollback" style="color: #e51e2a; border-color: #e51e2a;">
          <i class="fa-solid fa-rotate-left"></i> Targeted Rollback
        </button>
      </div>
    `;

    const rollbackBtn = document.getElementById('btn-trigger-rollback');
    if (rollbackBtn) {
      rollbackBtn.addEventListener('click', async () => {
        if (!confirm('Targeted Rollback will revert rewritten CDN image references back to original idb: references. Any unrelated CMS edits made since migration will be preserved. Proceed?')) {
          return;
        }
        try {
          rollbackBtn.disabled = true;
          const rollbackRes = await ImageMigrationService.executeTargetedRollback(result.migrationId);
          alert(`Rollback complete! ${rollbackRes.rolledBackCount} references reverted. ${rollbackRes.preservedEditsCount} unrelated user edits preserved.`);
          closeModal();
        } catch (rbErr) {
          alert(`Rollback failed: ${rbErr.message}`);
        } finally {
          rollbackBtn.disabled = false;
        }
      });
    }
  }

  function renderError(err) {
    const resultsPanel = document.getElementById('migration-results-panel');
    if (!resultsPanel) return;
    resultsPanel.style.display = 'block';
    resultsPanel.innerHTML = `
      <div class="migration-banner error">
        <i class="fa-solid fa-circle-xmark" style="font-size: 1.5rem;"></i>
        <div>
          <strong>Migration Halted / Failed</strong>
          <p>${err.message}</p>
        </div>
      </div>
    `;
  }
}

export function openMigrationModal() {
  const existing = document.getElementById('migration-modal-backdrop');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.innerHTML = renderMigrationModal();
  document.body.appendChild(container.firstElementChild);
  bindMigrationModalEvents();
}
