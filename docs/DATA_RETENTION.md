# Data Retention Policy

> **Owner**: Systematic Yield Analysts Pvt. Ltd. ("SYA", "we")
> **Effective date**: 2026-09-11
> **Review cadence**: quarterly, or on material change to data flows
> **Applicable regulations**: DPDP Act 2023 (India), SEBI (KYC/Reg-16 record-keeping), IT Act 2000 (§43A + SPDI Rules 2011)

## 1. Data categories and retention periods

| Category | Source | Stored where | Retention | Rationale |
|---|---|---|---|---|
| **Lead PII** (name, phone, email, interest, message, UTM referrer) | Public `POST /api/leads` | Postgres `Lead` table | **3 years** from submission, then hard-deleted | SEBI sub-broker record-keeping + sales pipeline value; balanced against DPDP "purpose limitation" |
| **Blog post draft content** (title, body, author, cover image URL) | Authenticated admin via `/api/admin/blogs` | Postgres `BlogPost` table | Indefinite until admin deletes | Authors own their drafts; deletion is an explicit admin action |
| **Newsletter subscribers** (email, source, unsubscribe token) | Public `POST /api/newsletter` | Postgres `NewsletterSubscriber` table | Until the user unsubscribes; inactive (unsubscribed) records purged after **180 days** | CAN-SPAM + DPDP purpose limitation. Token is rotated on each (re)subscribe. |
| **Admin session tokens** (scrypt hash, IP, User-Agent) | Authenticated `POST /api/auth/login` | Postgres `AdminSession` table | 7 days OR until revoked, whichever first; revoked rows purged after **90 days** | Audit trail for force-revoke accountability; raw token never stored |
| **Server logs** (Vercel function logs, Prisma warn/error) | Platform (Vercel) | Vercel log stream (managed) | Vercel's default retention (currently 1 month on free tier, 90+ on Pro) | Operational debugging; PII in logs is minimized (see §3 below) |
| **Browser localStorage** (cookie consent, partial form PII for abandoned-form restore) | Client-side | User's browser | Until user clears browser data OR consent is declined (then immediate purge) | Functional UX; gated on cookie consent (see §4) |

## 2. Categories we do NOT collect

- **Government IDs** (PAN, Aadhaar) are NOT collected by this website. The Angel One e-KYC
  flow that we redirect to collects them directly with Angel One — they never touch our servers.
- **Payment instruments** (card numbers, UPI VPA). All payments go through Angel One's
  regulated stack.
- **Biometric or location data.** No GPS, no IP-based geolocation beyond the rate-limiter
  key (which is hashed and discarded).
- **Third-party analytics** (Google Analytics, PostHog, Meta Pixel). Not active by default
  in this build; if introduced, this document and the cookie banner must be updated first.

## 3. PII minimization in logs

- The leads API writes PII only to the `Lead` table, never to `console.log`. Error
  paths log `error.message` and a sanitized stack, not the request body.
- The Prisma client logs SQL statements in **dev only** (`PRISMA_LOG` env-driven, see
  `src/lib/db.ts`). Production is set to `['warn', 'error']`. A dev who needs ad-hoc
  query tracing can run `PRISMA_LOG=query bun run dev` locally — they should never
  enable it in production.
- Sitemap fallback logs emit only the error message, never the database URL or
  query parameters.

## 4. User rights and how to exercise them

Under DPDP Act 2023, every data principal has the right to access, correct, or
erase their personal data, and to nominate another individual to exercise these
rights in case of death/incapacity.

**To exercise any of these rights**, email `connect@systematicyield.in` from the
email address on file. We respond within **7 calendar days** with either the
requested data, the correction confirmation, or the deletion confirmation — or
with a request for additional verification if the email address on file is
different from the requesting email.

| Right | Our action | SLA |
|---|---|---|
| Access | Export all rows where the user's email/phone appears, as JSON | 7 days |
| Correction | Update the affected row(s); reply with the diff | 7 days |
| Erasure | Hard-delete the row(s); confirm with the deletion timestamp | 7 days |
| Grievance | Escalate to the contact email; if unresolved, the user may approach SEBI SCORES or the Data Protection Board | 30 days |

## 5. Operational deletion procedure

For an admin executing a deletion request (internal runbook):

1. Look up the requester by email in the `Lead` and `NewsletterSubscriber` tables.
2. For each match: `DELETE FROM Lead WHERE email = $1` (or use Prisma's `deleteMany`).
3. For subscribers: prefer `UPDATE NewsletterSubscriber SET active = false,
   email = 'redacted+' || id || '@redacted.invalid'` first — this preserves the
   audit trail of consent withdrawal. Hard-delete after 180 days per §1.
4. For AdminSession rows containing the user's IP/UA: rotate `ADMIN_SECRET`
   (which invalidates all sessions).
5. Reply to the requester with: the row count deleted, the deletion timestamp,
   and a note that backups (if any exist at the database provider) will retain
   the data for the provider's standard backup retention window (typically
   7-35 days), after which it is gone.

## 6. Backup retention

The production Postgres database (Neon / Supabase / RDS — whichever is configured)
maintains its own point-in-time backups. **We do not run our own backup jobs** —
the managed provider's defaults apply:

| Provider | Default PITR window | Restore method |
|---|---|---|
| Neon | 7 days (free tier), 30 days (paid) | Console → "Restore branch" |
| Supabase | 7 days (free), 14 days (Pro) | Dashboard → "Restore" |
| AWS RDS | 35 days default | AWS Console → "Restore to point in time" |

This means a hard-deleted user's data MAY still exist in provider backups for up to
35 days after deletion. We disclose this in our deletion-response email (§5 step 5).
