# Threat Model

> **Owner**: Systematic Yield Analysts Pvt. Ltd. ("SYA")
> **Last reviewed**: 2026-09-11
> **Method**: lightweight STRIDE-per-component (Microsoft Threat Modeling, trimmed for a single-app surface)

## 1. Assets (what we protect)

| Asset | Sensitivity | Where it lives |
|---|---|---|
| Lead PII (name, phone, email, message) | **High** — PII under DPDP Act 2023 | Postgres `Lead` table |
| Newsletter subscriber emails | **High** — PII + CAN-SPAM regulated | Postgres `NewsletterSubscriber` table |
| Admin password (`ADMIN_SECRET`) | **Critical** — single shared secret protecting the admin dashboard | Environment variable (Vercel project secret) |
| Admin session tokens | **High** — revocable, but the raw token authenticates every admin request for 7 days | httpOnly cookie on the admin's browser + scrypt hash in Postgres `AdminSession` table |
| Blog draft content | **Medium** — pre-publication competitive intelligence | Postgres `BlogPost` table (rows with `published = false`) |
| Public blog content (published posts) | **Public** — already openly served | Postgres `BlogPost` table + rendered HTML |
| Browser localStorage (cookie consent, partial form PII for abandoned-form restore) | **Low/medium** — UX state, gated on consent | Browser localStorage under `sya_cookie_consent` + `sya_form_abandon` |

## 2. Adversaries (who we defend against)

| Adversary | Capability | Motivation |
|---|---|---|
| **Opportunistic scanner** | Runs Shodan/curl with default payloads | Mass exploitation, low effort |
| **Script kiddie** | Follows public PoCs, uses Burp/ZAP | Defacement, bragging rights |
| **Targeted attacker** | Recons the org on LinkedIn + GitHub, crafts spear-phishing | Lead PII for resale, brokerage-account-opening fraud |
| **CSV injection opportunist** | Submits a lead whose `name` field starts with `=cmd\|...` | Code execution when an admin opens the CSV in Excel |
| **Rate-limit bypasser** | Rotates IPs to evade the in-memory limiter | Lead-form spam, newsletter-list poisoning |
| **Search-engine bot** | Crawls `/sitemap.xml`, OG images, draft URLs | Index draft metadata (reputation harm, not breach) |

We do NOT model a **nation-state adversary with insider access** — that threat
requires a level of operational hygiene (HSM-backed secrets, signed releases,
air-gapped staging) that is out of scope for a sub-broker marketing site.

## 3. Attack surface (where they can come at us)

| Surface | Exposed by | Auth required |
|---|---|---|
| `POST /api/leads` | Public | None |
| `POST /api/newsletter` | Public | None |
| `POST /api/newsletter/unsubscribe` | Public (token-gated) | Possession of unsubscribe token |
| `GET /api/blogs` | Public | None — but always filters `published: true` |
| `GET /api/blogs/[slug]` | Public | None — but always filters `published: true` |
| `GET /blog/[slug]/opengraph-image` | Public (crawled by social scrapers) | None — but always filters `published: true` |
| `GET /api/search` | Public | None (rate-limited 30/min/IP) |
| `GET /sitemap.xml` | Public | None |
| `POST /api/auth/login` | Public | None (rate-limited 10/min/IP) |
| `POST /api/auth/logout` | Public | None (idempotent) |
| `POST /api/auth/revoke` | Auth-gated | Active admin session |
| `GET/POST /api/admin/blogs` (+ `POST /api/blogs`, `PUT/DELETE /api/blogs/[slug]`) | Auth-gated | Active admin session |
| `GET /api/leads` (+ `?format=csv`) | Auth-gated | Active admin session |
| `GET /api/newsletter` (+ `?format=csv`) | Auth-gated | Active admin session |

## 4. Mitigations (per STRIDE category)

### Spoofing
- **Admin login** uses constant-time `crypto.timingSafeEqual` against `ADMIN_SECRET`.
- **Session tokens** are 256-bit `crypto.randomBytes`, scrypt-hashed before storage.
  The raw token lives only in the httpOnly cookie. DB compromise cannot be replayed. (Phase 2)
- **`X-Powered-By: Next.js`** header removed — no free stack fingerprint. (Phase 4)

### Tampering
- **Blog draft disclosure**: `/api/blogs` hard-codes `published: true` — the
  `?published=false` query param is silently ignored. Drafts are only accessible
  via the auth-gated `/api/admin/blogs`. (Phase 2)
- **OG image route** filters `published: true` — draft slugs get the generic
  fallback, not the draft's title/author/category. (Phase 2)
- **JSON-LD** is serialized via `safeJsonStringify` (escapes `<`, `>`, `&`,
  U+2028/9) — blog post titles cannot escape the `<script>` block via
  `</script><script>...</script>` payloads. (Phase 4)
- **PII in localStorage** is gated on `sya_cookie_consent === 'accepted'`.
  Declining purges existing PII immediately. (Phase 4)

### Information disclosure
- **CSV formula injection** is blocked: every CSV cell from `/api/leads` and
  `/api/newsletter` exports is prefixed with `'` when its first char is `=+-@\t\r`.
  (Phase 4, refactored to `src/lib/csv.ts` `safeCsvCell` in Phase 5)
- **CSP**: marketing pages get a permissive-but-safe policy (`script-src 'self'
  'unsafe-inline'`; no `'unsafe-eval'` in production). API routes get
  `default-src 'none'; frame-ancestors 'none'`. (Phase 4)
- **Sitemap fallback** logs loudly with `[SITEMAP FALLBACK]` marker — silent
  degradation is no longer possible. (Phase 3)
- **HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  Permissions-Policy** set on all responses.

### Denial of service
- **Rate limiting** on `POST /api/leads` (3/min/IP), `POST /api/newsletter`
  (5/min/IP), `POST /api/auth/login` (10/min/IP), `GET /api/search` (30/min/IP).
  In-memory, per-instance.
- **Body-size policy** (1 MB cap) on every mutation endpoint via `bodyTooLarge()`
  in `src/lib/validation.ts`. (Phase 5)
- **Input length caps** on every API field (see `LENGTH_LIMITS` in
  `src/lib/validation.ts`).
- **No unbounded queries**: every `findMany` includes `take: limit` clamped to
  a max (100 for public, 500 for admin).

### Elevation of privilege
- **Admin endpoints** all call `await verifyAdmin(request)` first — there is
  no public path to `/api/admin/blogs`, `/api/leads`, `/api/newsletter` GET,
  `/api/blogs` POST/PUT/DELETE. (Phase 2 + Phase 5 refactor)
- **Admin cookie** is `httpOnly`, `secure` in prod, `sameSite=lax` — not
  readable by client-side JS, not sent on cross-site POSTs without a top-level
  GET to the same origin first.

## 5. Residual risk (consciously accepted)

| Risk | Why we accept it | Mitigation if it materializes |
|---|---|---|
| Rate-limit state is per-instance | Vercel serverless can run multiple warm instances; an attacker rotating across instances may exceed the per-instance cap | Move rate-limit state to Upstash Redis when abuse is observed |
| `ADMIN_SECRET` is a single shared password | Single-partner org, no per-admin identity; full revocation = one secret rotation + `POST /api/auth/revoke { all: true }` | Migrate to per-admin accounts (Clerk/Auth.js) when a second admin is added |
| `unsafe-inline` in marketing CSP | Next.js inline hydration data + JSON-LD + styled-components require it | Switch to nonce-based CSP (separate larger project; would touch every inline script) |
| PII at rest is plaintext in Postgres | Schema doesn't use Postgres column-level encryption; managed-provider at-rest encryption is on by default but doesn't protect against SQLi or rogue queries | Add application-layer encryption (libsodium sealed boxes) for `Lead.phone` and `Lead.email` — future hardening item |
| No automated tests | Manual smoke test scripts cover the security-critical paths | Add Vitest on the validation layer + auth flow |

## 6. Out of scope

The following are explicitly NOT covered by this threat model — they belong to
Angel One or the platform provider:

- The Angel One e-KYC flow (we redirect to it; their threat model applies)
- Postgres engine-level vulnerabilities (the provider's responsibility)
- Vercel platform-level vulnerabilities (Vercel's responsibility)
- The user's device (out of our control; we set headers, that's it)
