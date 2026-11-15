# Disaster Recovery and Backup Runbook

This is a procedure template for the client's technical operator. Production
provider names, regions, connection details, retention periods, recovery
objectives, and escalation contacts are client decisions and are intentionally
left as placeholders.

> **Production approval gate:** Any action against a production database,
> production R2 bucket, production account, DNS, or live email configuration
> requires explicit client authorization and access from the client's approved
> operator. This guide has not accessed or tested client production systems.
> Never paste secrets into tickets, shell history, documentation, or logs.

## 1. Scope and roles

Record before launch:

| Item | Client value |
|---|---|
| Frontend host and project | `CLIENT_FRONTEND_HOST_AND_PROJECT` |
| Backend host and service | `CLIENT_BACKEND_HOST_AND_SERVICE` |
| PostgreSQL provider/database/region | `CLIENT_DATABASE_PROVIDER_DB_REGION` |
| R2 account/bucket/region | `CLIENT_R2_ACCOUNT_BUCKET_REGION` |
| Resend account/domain/sending region | `CLIENT_RESEND_ACCOUNT_DOMAIN_REGION` |
| Primary incident owner and backup | `CLIENT_APPROVED_CONTACTS` |
| Approved recovery time/point objectives | `CLIENT_APPROVED_RTO_RPO` |
| Backup retention and storage location | `CLIENT_APPROVED_BACKUP_POLICY` |

Assign one incident lead, one database operator, and one communications owner.
Restrict production access to named authorized operators; use a separate
recovery environment for restore validation.

## 2. PostgreSQL backups

### Preferred provider backups

Use the database provider's managed backups/PITR where available. Confirm that
backups cover the database and required objects, retention meets client policy,
encryption and access controls are enabled, and a restore has been tested into a
separate recovery database. A backup that has never been restored is not a
verified recovery plan.

### Optional logical backup with PostgreSQL tools

Run only from an approved operator environment with a supported `pg_dump`
version. Configure a named libpq service and set `PGSERVICEFILE` to the client's
secure service file outside the repository; set `CLIENT_PG_SERVICE` to that
service name in the approved operator environment. Do not put a connection
password in the command line or commit a service file.

```sh
# Set CLIENT_PG_SERVICE and BACKUP_FILE through the approved operator environment.
pg_dump --format=custom --no-owner --no-acl \
  --file="$BACKUP_FILE" \
  --dbname="service=$CLIENT_PG_SERVICE"

# Verify the archive can be read; this does not restore or change a database.
pg_restore --list "$BACKUP_FILE"
```

Store the encrypted backup in the client's approved backup location, restrict
access, record its timestamp/checksum/retention, and ensure the archive does not
contain credentials. Client policy determines backup cadence and retention.

**Authorization required:** production backup access/export, transfer, retention
changes, and deletion of old backup copies.

## 3. Restore procedure

1. Declare the incident and have the client incident owner approve the restore
   point and scope. Stop or coordinate writes to avoid restoring over new data.
2. Select a verified backup and create an isolated, empty recovery database with
   the client's DBA/provider. Do not start by overwriting production.
3. Configure `CLIENT_RECOVERY_PG_SERVICE` through the approved secure operator
   environment and restore:

   ```sh
   pg_restore --no-owner --no-acl \
     --dbname="service=$CLIENT_RECOVERY_PG_SERVICE" \
     "$BACKUP_FILE"
   ```

4. Validate the recovery copy using the checklist below, the application health
   endpoints, and approved application smoke tests.
5. Present results, data-loss window, and cutover plan to the client approver.
   Production cutover/overwrite requires explicit client authorization.
6. Preserve the pre-restore production state according to the incident plan;
   never delete the original database or backup as part of an unreviewed fix.

For provider-native PITR, follow the provider's approved runbook and restore to a
new instance/database first. The exact controls depend on the client provider.

## 4. Prisma migration recovery

- Confirm the exact `DATABASE_URL` target through the approved secret store
  without printing the URL. Verify backup status and the maintenance window.
- From `backend/`, inspect migration state:

  ```sh
  npx prisma migrate status
  ```

- Normal deployment applies checked-in pending migrations with:

  ```sh
  npm run migrate
  ```

- If a migration fails, stop deployment, preserve complete logs, record the
  migration name and Prisma error code, and escalate to the application/database
  owner. Do not run `prisma migrate reset`, manually edit the production schema,
  delete migration history, or edit an already-applied migration.
- Recovery may require an app fix/new forward migration or restoring a verified
  backup to a separate database. A production restore or migration-resolution
  command must be explicitly approved by the client DBA and application owner.
- Re-run migration status after an approved fix and verify application health.

## 5. Catalogue recovery and reseeding

Preferred recovery for a complete database loss is restoring the database
backup. Catalogue import is not a substitute for restoring enquiries, CMS
content, users, audit records, sessions, or media metadata.

The baseline source is `shared/catalogData.js`. The Admin CMS transfer performs
a dry-run validation before an atomic transfer. The production baseline seeder
is a separate backend script, read-only by default, and refuses inconsistent
partial catalogues. It does not replace existing catalogue rows.

**Authorization required:** client approval, confirmed production target, and a
verified backup before any seed/apply action. From `backend/`, the read-only
inspection is:

```sh
npm run seed:production-catalog
```

Applying requires `PRODUCTION_DATABASE_URL`, `--apply`, and the exact target
confirmation described in [CLIENT-HANDOVER-GUIDE.md](./CLIENT-HANDOVER-GUIDE.md).
The seeder rejects `sslmode=require` and `sslmode=verify-ca`; use
`sslmode=verify-full` so the database certificate and hostname are verified.
Do not run the apply command as a speculative recovery fix. Verify counts and
catalogue hierarchy after an approved import.

The test-only script `node scripts/verify-baseline-catalog.js` is restricted to
the local test database and port 5433; do not use it for production recovery.

## 6. Administrator account recovery and emergency password reset

The application provides a three-tier recovery model for administrator access:

### Tier 1: Self-service password recovery (Standard)

Active administrators with an existing, verified recovery email (either their verified default login email or an optional verified personal recovery email) can recover access without operator intervention:

1. **Initiation:** On the `/admin` login screen, the administrator clicks **Forgot password?** and enters either their primary login email or their verified recovery email. Both identifiers resolve to the same administrator account, while account-level and cross-identifier rate limiting prevents bypassing protections by alternating addresses.
2. **Destination & Token:** The endpoint (`POST /api/auth/forgot-password`) verifies account status and dispatches a reset link strictly to the administrator's **active verified recovery email** (never to an unverified address, and never to multiple destinations). If the administrator verified their default login email, the reset link is sent to that login email; if they configured and verified a personal recovery email, the reset link is sent to that personal recovery email. Resetting the password never replaces the administrator's primary login email with the recovery email. The reset token is a cryptographically random 256-bit opaque token, valid for **30 minutes**, and stored as a SHA-256 hash.
3. **Reset Completion:** The administrator opens the emailed link (`/admin/reset-password?token=...` or `/reset-password?token=...`), enters a new password meeting policy (14–1024 characters), confirms the password, and submits.
4. **Enforcement & Revocation:** Upon successful reset (`POST /api/auth/reset-password`):
   - The token is consumed atomically (single-use; subsequent replay attempts are rejected).
   - **All active sessions for that administrator are immediately revoked across all browsers and devices.**
   - Security alert emails are dispatched to both the primary login and verified recovery addresses (or a single deduplicated email if the recovery address is the login email).
5. **Unconfigured or Unverified Accounts:** Newly provisioned administrators have their login email set as the default recovery email awaiting verification (`recoveryEmailVerifiedAt: null`). If an administrator has **no verified recovery email** (or has not yet verified the default login email), the forgot-password endpoint returns the identical uniform HTTP 200 message to prevent account enumeration, but no email is dispatched. Accounts without a verified recovery email cannot use self-service recovery.

### Tier 2: Controlled administrator-assisted recovery

If an administrator is locked out and has no verified recovery email, or has permanently lost access to their recovery mailbox:

1. **Authorization & Identity Gate:** The operator must verify the administrator's identity and obtain explicit client authorization through corporate channels before taking action.
2. **No CMS Admin-to-Admin Password Reset:** The web CMS does not provide an administrator-to-administrator password-reset function or allow viewing unmasked recovery credentials.
3. **Separate New Administrator Account:** If the client authorizes creating a separate new administrator account, provision it using:
   ```sh
   # From backend/, interactive terminal only:
   node scripts/provision-admin.js
   ```
   Provisioning a new administrator creates a distinct active account; it does not recover, reset, or replace the existing administrator account.
4. **Existing Account Retention:** If the existing administrator account and its audit history must be retained, use Tier 3.

### Tier 3: Emergency password reset CLI (`reset-admin-password.js`)

For emergency recovery of an existing administrator on an approved local database, the backend provides a guarded, interactive CLI script:

```sh
# From backend/, interactive terminal only:
node scripts/reset-admin-password.js --email="admin@iconelectromatic.com"
```

This is an exceptional operator procedure requiring client authorization.

**Strict safety constraints enforced by source code:**
- **Interactive terminal required:** Passwords must never be passed in command-line arguments, options (`--password`, `-p`, `--pass`), or environment variables. The script uses hidden terminal input (`askHidden`) for password entry.
- **Remote and production database targets strictly forbidden:** The script inspects `DATABASE_URL` and immediately aborts if the host is remote (not `127.0.0.1` or `localhost`) or if the database name or hostname contains `"prod"`. Production database targets are never permitted, even with authorization flags.
- **Port 5432 safety gate:** PostgreSQL port `5432` is blocked by default to protect the local development database from accidental modification. Operating against local port `5432` requires explicit authorization:
  ```sh
  node scripts/reset-admin-password.js --allow-local-db --email="admin@iconelectromatic.com"
  # or environment variable ALLOW_LOCAL_PORT_5432=true
  ```
  Even with explicit authorization, the CLI verifies that the host is strictly `127.0.0.1` or `localhost` and the database name matches the approved local database (`icon_electromatic`).
- **Port 5433 (Test Database):** Permitted only when the database name matches the approved test database (`icon_electromatic_test`).
- **Target verification:** Confirms that the target administrator exists and is active (`active: true`). Inactive accounts cannot be reset via the CLI.
- **Explicit confirmation:** Prompts the operator: `Confirm password reset for active administrator "..."? (Type "yes" to proceed):`. Any answer other than `"yes"` cancels the reset immediately.
- **Password policy enforcement:** Enforces client-side validation of the 14–1024 character policy and matching confirmation before database execution.
- **Atomic transaction:** In a single database transaction, the CLI updates `passwordHash` and `passwordChangedAt`, revokes all active sessions for that administrator (`revokedAt = now`), and records an `AuditEvent` with action `ADMIN_PASSWORD_RESET_CLI`.

## 7. Cloudflare R2 media recovery

- R2 credentials are backend-only. Keep the bucket private by default and use
  client-approved bucket-scoped credentials.
- This application mediates uploads through `POST /api/media/upload` and
  delivers by `GET /api/media/file/:id`; public access behavior changes if
  `R2_PUBLIC_DOMAIN` is configured.
- The database stores media metadata and R2 object keys; database backups do not
  include R2 object contents. Coordinate PostgreSQL restore points with the
  client's R2 retention/backup policy to avoid metadata/object mismatches.
- R2 object versioning, scheduled retirement/purge, automated bulk migration,
  and automatic restoration of deleted objects are not implemented or assumed.
  Ask the client R2 administrator to confirm current provider capabilities and
  approved retention/recovery options.
- Do not test restoration by deleting, replacing, or uploading objects in a
  production bucket. Validate any restore process in a separate non-production
  bucket first.

## 8. Resend and email incident troubleshooting

1. Check backend service health and sanitized application logs for email
   configuration or provider error messages; do not log API keys or full
   message contents.
2. Verify in the backend secret store that `RESEND_API_KEY`,
   `RESEND_FROM_EMAIL`, and `CONTACT_EMAIL` are configured. `ENQUIRY_FROM` is
   legacy fallback only.
3. Check the client's Resend account for sender-domain verification, sending
   region, API key status/permissions, provider delivery status, and account
   limits.
4. Have the authorized DNS/mail administrator verify the exact records displayed
   in the client's Resend account. Coordinate SPF/DMARC changes with existing
   mail routing; do not replace records speculatively.
5. Confirm the expected regional recipient mailboxes are active and receiving.
   Regional recipients are server-side configured in application code; `CONTACT_EMAIL`
   is the fallback/general recipient.
6. Use a client-approved test address and explicit approval for any live email
   test. This runbook task does not send email.
7. Enquiries are stored before notification dispatch; inspect the Admin enquiry
   status/communication history for `EMAIL_FAILED` and delivery diagnostics.
   Protect customer personal data during investigation and escalation.

## 9. Logs, investigation, and escalation

- Check the frontend host build/deployment logs, backend service logs, managed
  PostgreSQL events, R2 provider audit/activity records, and Resend delivery
  events in their respective client-controlled consoles.
- Backend exposes `GET /api/health` and `GET /api/health/db`. The database check
  reports connectivity only; it is not a backup or data-integrity check.
- Preserve timestamps with timezone, request/incident IDs when available,
  migration names, sanitized provider error codes, and affected service.
- Do not attach connection strings, API keys, passwords, session cookies,
  CSRF tokens, full enquiry bodies, or unredacted personal data to logs/tickets.
- Escalate data loss, suspected credential exposure, repeated failed migrations,
  unauthorized access, unexpected mail delivery, or R2 object loss to the client
  incident owner and relevant provider immediately.
- Rotate credentials only through client-approved provider procedures and update
  the backend secret store; never share replacement secrets in chat or email.

## 10. Recovery verification checklist

- [ ] Client incident lead approved recovery point, scope, and any production action.
- [ ] Backup source, timestamp, checksum, and restore procedure were verified.
- [ ] Recovery database is isolated; production was not overwritten during validation.
- [ ] `npx prisma migrate status` reports expected migration state on the recovery target.
- [ ] `GET /api/health` and `GET /api/health/db` return expected healthy responses.
- [ ] Catalogue hierarchy and counts were checked against an approved source.
- [ ] Admin login works and only authorized active administrators can access the portal.
- [ ] Admin recovery tokens enforce 30-minute expiry and atomic single-use behavior; replay attempts fail.
- [ ] Successful password reset revokes all active sessions for that administrator across all devices.
- [ ] Accounts without a verified recovery email cannot use self-service recovery, while public endpoints retain uniform generic responses.
- [ ] Emergency CLI (`reset-admin-password.js`) target restrictions (strictly local hosts, port 5432 authorization gate, port 5433 test DB match, no production targets) and interactive confirmation safeguards are verified.
- [ ] Enquiry records and communication history are present and readable by authorized staff.
- [ ] Site content, SEO, media metadata, and import history were sampled for expected integrity.
- [ ] R2 object availability and database metadata are consistent using a non-destructive check.
- [ ] Email configuration and regional routing are checked without sending unapproved messages.
- [ ] DNS, TLS, same-origin API proxy, sitemap, and prerendered page routes are checked after authorized cutover.
- [ ] Client owner accepted recovery results, documented data-loss window, and approved return to service.

## 11. Local Docker PostgreSQL is development/test only

The existing local Docker PostgreSQL container is used for development and
testing, with the test database `icon_electromatic_test` on port `5433`. It is
not production infrastructure. The test-only catalog verifier hard-codes that
database/port. Do not add a production Dockerfile or Compose stack unless the
client's selected hosting architecture specifically requires it.
