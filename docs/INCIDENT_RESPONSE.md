# Incident Response Plan

> **Owner**: Systematic Yield Analysts Pvt. Ltd. ("SYA")
> **Last reviewed**: 2026-09-11
> **Audience**: SYA partner on call (single-admin org)

## 1. Severity rubric

| Severity | Definition | Examples | First-response SLA |
|---|---|---|---|
| **SEV1 — Critical** | Active unauthorized access to PII, admin compromise, or site-wide outage | Attacker posting draft blog posts; attacker exporting leads CSV; `POST /api/leads` 500-ing for >5 min; suspected `ADMIN_SECRET` leak | **15 minutes** — start containment |
| **SEV2 — High** | Security control bypass OR partial outage | Rate-limit bypass on `/api/leads`; newsletter list poisoned | **2 hours** — start investigation |
| **SEV3 — Medium** | Degraded service, no PII impact | Sitemap fallback firing in prod; OG image route returning 500 for a specific slug | **24 hours** — triage |
| **SEV4 — Low** | Cosmetic / hygiene issue | A 4xx error with a confusing message; a missing header on a route that doesn't matter | **Next sprint** — file an issue |

## 2. On-call playbook (single-responder)

### Step 1 — Contain (within SLA)

| Symptom | Action |
|---|---|
| Suspected `ADMIN_SECRET` leak | 1. Rotate `ADMIN_SECRET` in Vercel project settings. 2. `curl -X POST https://systematicyield.in/api/auth/revoke -H "Cookie: sya_admin=<your-cookie>" -d '{"all":true}'`. 3. Verify: any old session now returns 401 on `GET /api/leads`. |
| Rogue admin session | Same as above — call `POST /api/auth/revoke { all: true }`. All sessions including the attacker's are dead. |
| Lead form being flooded | 1. Tail Vercel logs for `/api/leads` 429 rate. 2. If bypass is real, temporarily tighten `RATE_LIMIT_MAX` in `src/app/api/leads/route.ts` (e.g. 3 → 1) and deploy. 3. Long-term: move rate-limit state to Upstash Redis. |
| Draft leak suspected | 1. `curl 'https://systematicyield.in/api/blogs?published=false'` — should always return ONLY published posts. 2. If drafts visible: deploy a hotfix re-applying the `where: { published: true }` clause. 3. Audit access logs for the affected slug. |
| Vercel deploy broken | 1. Check `.github/workflows/ci.yml` run for the last commit. 2. If `prisma migrate deploy` failed: prod DB migration is rolled back. Verify the prod site is still serving the previous deploy. 3. If `next build` failed: previous deploy still serves. Investigate the failing type/lint error. |
| Site-wide 500 | 1. Check Vercel function logs. 2. Most likely cause: `DATABASE_URL` not propagated, or Postgres provider outage. 3. Verify with `curl -sI https://systematicyield.in/` and check `PrismaClientInitializationError`. |

### Step 2 — Eradicate

- Identify root cause (see Step 3 for forensic logs available).
- Patch the underlying bug — push a fix branch + PR + CI green + merge + Vercel auto-deploy.
- If the bug is in production code that we can't immediately fix, set up a
  temporary mitigation (e.g. add a route-specific header in `next.config.ts`
  to block the offending path).

### Step 3 — Recover

- For PII breaches: pull the affected rows from the Postgres provider's
  PITR backup to identify what was exposed. See `docs/DATA_RETENTION.md` §6
  for backup retention windows.
- For site outages: verify the prod site is healthy (`curl -sI /`), verify
  the sitemap is complete (`curl /sitemap.xml` should list every published
  post — if it lists only the 2 static entries, the `[SITEMAP FALLBACK]`
  log marker is firing; investigate the DB connection).
- For admin compromise: confirm via `bun run db:migrate:status` that the
  schema is intact (no surprise migrations); confirm via Prisma Studio
  (`bun run db:studio`) that no new admin sessions exist with recent
  `createdAt` you don't recognize.

### Step 4 — Notify

| Severity | Who to notify | When |
|---|---|---|
| SEV1 (PII breach) | Affected users (within 72 hours per DPDP Act 2023 §8(6)); SYA partner; SEBI (if broker record-keeping was impacted) | Within 72 hours of confirmation |
| SEV1 (admin compromise) | SYA partner; rotate all secrets; if leads were exported, follow PII-breach notification path | Within 24 hours |
| SEV2 | SYA partner; affected users only if data was actually exposed | Within 7 days |
| SEV3 | SYA partner (internal note); no external notification | Next sprint review |
| SEV4 | Internal issue tracker | Next sprint |

### Step 5 — Postmortem

Within **7 days** of incident closure, write a `docs/postmortems/YYYY-MM-DD-<slug>.md`
document covering:

1. **What happened** (one-paragraph summary).
2. **Impact** (which users, which data, how long).
3. **Root cause** (the actual bug, not the symptom).
4. **Timeline** (UTC timestamps; first alert, containment, eradication, recovery, notification).
5. **What went well**.
6. **What went wrong**.
7. **Action items** (each with an owner + due date).

## 3. Forensic sources available

| Source | Where | Retention |
|---|---|---|
| Vercel function logs | Vercel dashboard → project → Logs | Per Vercel plan (free: 1 hour of streaming; Pro: 90 days searchable) |
| Vercel deploy history | Vercel dashboard → project → Deployments | Indefinite (until manually deleted) |
| GitHub Actions run history | GitHub repo → Actions | 90 days (free) / configurable on paid |
| Postgres query history | `SELECT * FROM pg_stat_activity` (live); provider's PITR (historical) | Provider-dependent |
| `AdminSession` table | `bun run db:studio` → `AdminSession` | 90 days post-revocation (per Data Retention §1) |
| `worklog.md` in this repo | `git log` of the file | Indefinite (commit history) |
