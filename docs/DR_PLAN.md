# Disaster Recovery Plan

> **Owner**: Systematic Yield Analysts Pvt. Ltd. ("SYA")
> **Last reviewed**: 2026-09-11
> **Recovery objectives**: RTO = 4 hours, RPO = 24 hours

## 1. Recovery objectives

| Objective | Target | How we hit it |
|---|---|---|
| **RTO** (Recovery Time Objective) — max acceptable downtime | 4 hours | Vercel deploys are ~2 minutes; Postgres provider restore is ~10-30 minutes; the buffer covers comms + verification |
| **RPO** (Recovery Point Objective) — max acceptable data loss | 24 hours | Postgres provider's PITR default is 7-35 days; we cap accepted loss at 24h meaning we may lose the most recent day's leads under catastrophic failure |
| **RTO for "bad deploy rollback"** | 10 minutes | Vercel instant rollback to previous deployment |

## 2. Failure scenarios and recovery procedures

### 2.1 Bad deploy (most common)

1. Go to Vercel dashboard → project → Deployments.
2. Find the most recent "Ready" deployment that worked.
3. Click the `⋯` menu → **Promote to Production**.
4. Verify: `curl -sI https://systematicyield.in/` returns 200.
5. In GitHub: revert the bad commit (`git revert <sha>` then push) so the next deploy doesn't re-break.

**Time to recovery**: ~3 minutes.

### 2.2 Database migration failure

**Symptom**: `prisma migrate deploy` in the GitHub Actions deploy job fails. The site is still running on the previous deploy (because the Vercel deploy step didn't run — the migration step is `needs: build` and runs first).

1. Check the GitHub Actions run log for the failed `prisma migrate deploy` step.
2. Read the error. Most common causes:
   - Migration SQL has a syntax error (rare — Prisma generates the SQL).
   - Migration tries to add a NOT NULL column without a default to a non-empty table.
   - Database is in a locked state (e.g. another migration is running).
3. Fix the migration in a feature branch. If the migration is genuinely wrong,
   DELETE the migration file from `prisma/migrations/` and re-run
   `prisma migrate dev --name <new-name>` against a fresh local DB to regenerate.
4. Push the fix. CI re-runs `prisma migrate deploy` against the CI Postgres
   service container. If green, the deploy job proceeds.

**Important**: NEVER manually run `prisma db push` against the production DB
to "fix" a failed migration. That bypasses the migration history and creates
drift between the DB and the committed migrations.

### 2.3 Database corruption / provider outage

1. Check the Postgres provider's status page:
   - Neon: https://neonstatus.com
   - Supabase: https://status.supabase.com
   - AWS RDS: https://health.aws.amazon.com
2. If the provider has an active incident, wait for resolution.
3. If the provider is fine but OUR database is broken:
   - Provider console → Restore from PITR to a new branch/project.
   - Update `DATABASE_URL` in Vercel project settings → point at the restored DB.
   - Vercel auto-redeploys on env-var change (or trigger manually).
   - Verify: `curl /sitemap.xml` lists every published post (not just the 2 static entries — if only 2, the `[SITEMAP FALLBACK]` log marker is firing and the DB isn't actually reachable yet).

### 2.4 Vercel platform outage

1. Check https://www.vercelstatus.com.
2. If Vercel is down, there is nothing to do — wait.
3. If the outage is prolonged (>1 hour) and SEBI-relevant (e.g. a user can't submit a lead), set up a temporary fallback: a static "we're experiencing an outage, please WhatsApp us at <phone>" page on Cloudflare Pages or Netlify that points at the same domain via a DNS failover. Planned future capability.

### 2.5 Compromised admin account

1. Rotate `ADMIN_SECRET` in Vercel project settings (this generates a new secret via `openssl rand -hex 32` and updates the env var).
2. Hit `POST /api/auth/revoke { all: true }` with the old cookie — this kills every active session in the DB.
3. Re-login with the new secret — generates a fresh session row in the DB.
4. Audit: query `AdminSession ORDER BY createdAt DESC LIMIT 20` to confirm no further rogue sessions.
5. Audit the `Lead`, `BlogPost`, `NewsletterSubscriber` tables for any unauthorized changes.

**Time to recovery**: 5-10 minutes.

## 3. Backup strategy

We do NOT run our own backup jobs. The Postgres provider's defaults apply:

| Provider | Default backups | Restore method |
|---|---|---|
| **Neon** (recommended for this project) | 7 days PITR (free), 30 days PITR (paid) | Console → "Restore branch" → point at the new branch from `DATABASE_URL` |
| **Supabase** | 7 days PITR (free), 14 days (Pro) | Dashboard → "Restore" → new project |
| **AWS RDS** | 35 days automated backups + manual snapshots | AWS Console → "Restore to point in time" |

**What this means in practice**: if we delete a Lead row today, it will still
exist in the provider's PITR backups for 7-35 days. After that window, it's gone
(unless a managed snapshot was taken). This is disclosed in the deletion-response
email per `docs/DATA_RETENTION.md` §5 step 5.

## 4. Recovery test cadence

A backup you've never restored from is not a backup. Run this drill **once per
quarter**:

### Drill procedure (Neon example; adapt for the configured provider)

1. In the Neon console, click the production project → "Restore" → pick a timestamp from 1 hour ago → create a new branch named `recovery-test-<date>`.
2. Copy the connection string of the new branch.
3. Locally: `DATABASE_URL=<new-branch-string> bun run db:migrate:status` — should show all migrations as applied.
4. Locally: `DATABASE_URL=<new-branch-string> bunx prisma studio` — open the Lead table, confirm the row count matches prod (within the last 1 hour).
5. Run a few queries: `SELECT COUNT(*) FROM "Lead";`, `SELECT COUNT(*) FROM "BlogPost" WHERE published = true;`, `SELECT COUNT(*) FROM "AdminSession" WHERE "revokedAt" IS NULL;`.
6. Tear down: in the Neon console, delete the `recovery-test-<date>` branch.
7. Log the drill result in `docs/postmortems/YYYY-MM-DD-drill.md`.

### Pass criteria
- The restore completes within 30 minutes.
- All migrations are present and applied on the restored DB.
- Row counts match production within the expected PITR window (last 1 hour).

### Fail criteria
If the drill fails, this is a SEV3 per `docs/INCIDENT_RESPONSE.md` §1. File an issue,
investigate, and re-run the drill within 2 weeks.
