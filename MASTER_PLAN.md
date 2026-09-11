# SYA Website — Master Remediation Plan

> **Status**: Active — Phase 1 in progress
> **Last Updated**: 2026-09-11
> **Audit Date**: 2026-09-08
> **Total Findings**: 54 (9 P0, 10 CI/CD, 15 App/API, 16 Architecture, 4 Governance)

---

## 📋 Table of Contents

1. [Audit Summary](#audit-summary)
2. [Design Direction](#design-direction)
3. [Phase-by-Phase Remediation Plan](#phase-by-phase-remediation-plan)
4. [Current Progress](#current-progress)
5. [How to Continue in a New Chat](#how-to-continue-in-a-new-chat)

---

## Audit Summary

### P0 — Release Blockers (9 findings, all verified)

| # | Finding | Evidence | Status |
|---|---------|----------|--------|
| P0-1 | 90 dependency vulnerabilities | `bun audit` → 3 critical, 48 high, 34 moderate, 5 low | ✅ Fixed (Phase 1.1) — 90→67, critical 3→0 |
| P0-2 | CI and deployment broken | `deploy.yml` uses `needs: [quality, build]` across workflows (invalid) | 🔲 Phase 1.2 |
| P0-3 | Unpublished blog metadata public | `GET /api/blogs?published=false` returns drafts without auth; OG image route also | 🔲 Phase 2 |
| P0-4 | Admin cookie contains root secret | Login stores raw `ADMIN_SECRET` in 7-day cookie; no sessions/revocation | 🔲 Phase 2 |
| P0-5 | Production DB architecture unsuitable | SQLite hardcoded; `db:push --accept-data-loss`; CI db path wrong; build false-green | 🔲 Phase 3 |
| P0-6 | Confirmed hydration failure | `Math.random()` in JSX render (page.tsx:899) → React error #418 | 🔲 Phase 4 |
| P0-7 | Personal data handling unsafe | PII saved to localStorage despite cookie decline; plaintext SQLite | 🔲 Phase 4 |
| P0-8 | CSV formula injection | `escape()` only handles `"`, not `=+-@` — both leads + newsletter | 🔲 Phase 4 |
| P0-9 | Placeholder/unverified claims live | Phone, email, address, referral URL, CIN, ratings all placeholders | 🔲 Phase 6 |

### CI/CD & Supply-Chain Gaps (10 findings)

- `bun audit || true` — non-blocking (ci.yml:~98)
- Secret scanner matches `sk-` in `risk-managed` (false positive)
- `.next/` not uploaded (artifact action excludes hidden files)
- `continue-on-error: true` on deploy (deploy.yml:35)
- Bun `latest` — non-reproducible
- Actions use mutable tags (`@v4`) not commit SHAs
- `output: "standalone"` conflicts with `next start` script
- Build false-green: sitemap catches DB error, returns static-only URLs
- No staging promotion, rollback, migration, smoke test, env validation
- No automated tests (tests/ gitignored + excluded from TS)

### Application & API Gaps (15 findings)

- No automated tests
- Lint rules materially weakened (20+ rules set to `"off"`)
- TypeScript: `noImplicitAny: false`, `allowJs: true`, `skipLibCheck: true`
- Blog PUT has no validation (500 instead of 400)
- `.trim()` called before type validation
- Slug uniqueness race (TOCTOU)
- Admin editor doesn't fetch existing content
- Search: unindexed `contains` scans, no rate limiting
- In-memory rate limits per-process (bypassable on serverless)
- UTM/landingPage fields unbounded
- Newsletter: no double opt-in, no consent version
- No shared validation layer / API contract
- No CSRF token on admin mutations
- JSON-LD uses raw `JSON.stringify` (no `</script>` escaping)
- No request body-size policy

### Architecture & Performance Gaps (16 findings)

- `page.tsx` 1,906 lines; `globals.css` 1,314 lines; `admin/page.tsx` 1,286 lines
- ~5,399 lines of unused shadcn UI components (38 of 48 unused)
- 11+ unused dependencies (next-auth, next-intl, zustand, zod, etc.)
- Blog pages repeat author/category queries
- Blog listing loads all posts (no pagination)
- View increments fire-and-forget, count bots
- "Popular this week" sorts by lifetime views (not weekly)
- DB indexes don't match query patterns
- Prisma logs every query in production
- No health endpoint, structured logging, request IDs, tracing
- Raw `<img>` elements bypass Next.js optimization
- `images.remotePatterns` allows `**` (any HTTPS host)
- CSP allows `'unsafe-inline'` and `'unsafe-eval'`
- `X-Powered-By: Next.js` exposed
- Security headers duplicated (next.config.ts + vercel.json)
- Home page heavily client-rendered (SEO/no-JS risk)

### Repository & Governance Gaps (4 findings)

- LICENSE (MIT) vs README (proprietary) contradiction
- Package name still `nextjs_tailwind_shadcn_ts`
- No data-retention policy, threat model, incident procedure
- No production migration plan or recovery test

---

## Design Direction

### References Synthesized

| Reference | What We Take |
|-----------|-------------|
| **Trader Portfolio Landing Page** (Envato) | Financial data aesthetic, chart-driven hero, professional trust signals |
| **High-end Fitness Studio** (Z.ai share) | Cinematic hero reel, staggered scroll reveals, card flip on hover, sticky CTA snap, grain-texture parallax, bold display typography |
| **META NFT Marketplace** (Envato) | Glassmorphic cards, gradient borders, card-heavy grid layouts, smooth hover micro-interactions |

### New Design Language: "Cinematic Finance"

| Element | Current | New |
|---------|---------|-----|
| **Background** | Flat `#070B14` | Layered: deep black `#05070D` + grain texture + parallax glow drift |
| **Accent** | Flat gold `#E2B15C` | Metallic gold gradient + neon emerald `#35D49A` for live data |
| **Typography** | Inter + Fraunces | Bebas Neue (display, 14vw) + Inter (body) + JetBrains Mono (data) |
| **Cards** | Flat border | Glassmorphic: backdrop-blur + gradient border + inner glow |
| **Reveals** | Simple fade | Staggered fade + upward translate (0.08s/item) |
| **CTA** | Static button | Pulsing radial glow + sticky bottom bar |
| **Hero** | Static SVG chart | Cinematic chart reel: cycling symbols with Ken Burns zoom |
| **Course cards** | Flat | 3D Y-axis flip on hover revealing curriculum |

---

## Phase-by-Phase Remediation Plan

### Part A: Security & Technical Remediation

#### Phase 1: Dependencies & CI/CD (~1 day)

**1.1 Dependency cleanup** ✅ COMPLETED
- Removed 17 unused packages
- Upgraded Next.js 16.1.1→16.3.4, Sharp 0.34.3→0.35.4
- Pinned TypeScript to ^5, ESLint to ^9, Prisma to ^6
- Vulnerabilities: 90→67, critical 3→0

**1.2 CI/CD repair** 🔲 NEXT
- Merge `deploy.yml` into `ci.yml` (single workflow, 3 jobs: quality→build→deploy)
- Remove cross-workflow `needs:`
- Remove `continue-on-error: true`
- Pin Bun to specific version
- Pin Actions to commit SHAs
- Add `include-hidden-files: true` to artifact upload
- Make `bun audit` blocking
- Fix secret scanner regex
- Add `db:push` to CI build job
- Add `next build` smoke test

#### Phase 2: Auth Overhaul & Draft Disclosure (~2 days)
- Replace root-secret cookie with revocable sessions (AdminSession model)
- Login: generate session token → hash with bcrypt → store hash → set cookie
- Add session revocation endpoint
- Fix `GET /api/blogs` to always filter `published: true`
- Fix OG image route to filter `published: true`
- Add `GET /api/admin/blogs` for draft access

#### Phase 3: Database Migration (~2 days)
- Migrate SQLite → PostgreSQL
- Create proper Prisma migrations
- Add migration step to CI + deploy
- Fix CI database path

#### Phase 4: Hydration, CSV, JSON-LD, PII, CSP (~2 days)
- Remove `Math.random()` from JSX render
- Fix CSV escape (prefix `=+-@` with `'`)
- Fix JSON-LD (escape `<` and `</script>`)
- Gate localStorage PII behind cookie consent
- Remove `'unsafe-eval'` from CSP
- Remove `X-Powered-By` header

#### Phase 5: Code Quality & Dead Code (~2 days)
- Re-enable disabled lint rules
- Tighten TypeScript config
- Remove 38 unused shadcn components
- Fix Prisma production logging
- Add shared validation layer

#### Phase 6: Repository Governance (~0.5 days)
- Resolve license (proprietary, no MIT)
- Add data-retention policy
- Add threat model
- Remove `--accept-data-loss` from scripts

#### Phase 7: Blog API Hardening (~1 day)
- Add validation to blog PUT
- Fix `.trim()` ordering
- Wrap slug uniqueness in transaction
- Admin editor: fetch existing content
- Add rate limiting to search
- Add CSRF token on admin mutations
- Bound UTM/landingPage fields

### Part B: UI/UX Redesign

#### Phase 8: Design System & Architecture (~2 days)
- New design tokens (colors, typography, motion)
- Split page.tsx into Server Components + client islands
- Split globals.css into per-section CSS
- Split admin into tab components

#### Phase 9: Section-by-Section Redesign (~5 days)
- 9.1: Cinematic hero (chart reel, Ken Burns, massive type)
- 9.2: Live ticker bar (glassmorphic)
- 9.3: Trust strip + stats (counter animation)
- 9.4: Broking services (3D flip cards)
- 9.5: Courses (flip cards with curriculum)
- 9.6: How it works (stepper animation)
- 9.7: Testimonials (drag-to-swipe carousel)
- 9.8: FAQ (smooth accordion)
- 9.9: Blog cards (image zoom on hover)
- 9.10: Contact form (glassmorphic)
- 9.11: Sticky CTA bar (snap in/out)
- 9.12: Footer (SEBI disclosures + grain)

#### Phase 10: Animation System (~1 day)
- Scroll reveal hook (IntersectionObserver, staggered)
- Hover micro-interactions (lift, zoom, glow, flip)
- Page transitions (Framer Motion)

#### Phase 11: Responsive Design (~1 day)
- Mobile-first breakpoints
- Touch-optimized controls
- Mobile hamburger menu + sticky CTA

#### Phase 12: Blog + Admin Redesign (~2 days)
- Apply design system to blog pages
- Redesign admin dashboard

---

## Current Progress

| Phase | Status | Commit |
|-------|--------|--------|
| 1.1 Dependency cleanup | ✅ Done | `133ddbc` |
| 1.2 CI/CD repair | 🔲 In progress | — |
| 2-7 Security/Tech | 🔲 Pending | — |
| 8-12 Redesign | 🔲 Pending | — |

### Phase 1.1 Results
- Vulnerabilities: 90 → 67 (-26%)
- Critical: 3 → 0 (eliminated)
- High: 48 → 20 (-58%)
- Removed: 17 unused packages
- Upgraded: Next.js, Sharp, React
- Pinned: TypeScript ^5, ESLint ^9, Prisma ^6

---

## How to Continue in a New Chat

### Quick Start (copy-paste this into a new chat)

```
I'm working on the SYA Website project. The code is at /home/z/my-project
and the repo is https://github.com/ict7742-dot/sya-web-new-zai.git

Read /home/z/my-project/MASTER_PLAN.md for the full context — it has:
- All audit findings (54 verified issues)
- The 12-phase remediation plan
- Current progress (Phase 1.1 done, Phase 1.2 next)
- Design direction for the UI redesign

Continue with Phase 1.2: CI/CD repair.

Read /home/z/my-project/worklog.md for detailed work logs from previous sessions.
```

### What to Tell the New Chat

1. **Project path**: `/home/z/my-project`
2. **Repo**: `https://github.com/ict7742-dot/sya-web-new-zai.git`
3. **Read first**: `MASTER_PLAN.md` (this file) + `worklog.md`
4. **Current phase**: Check the "Current Progress" table above
5. **Next task**: Phase 1.2 — CI/CD repair

### Key Files to Reference

| File | Purpose |
|------|---------|
| `MASTER_PLAN.md` | This file — full audit + plan |
| `worklog.md` | Detailed work logs from each session |
| `.env.example` | Environment variable documentation |
| `README.md` | Project setup instructions |
| `CONTRIBUTING.md` | Development workflow |

### Test Commands

```bash
bun run lint          # ESLint
bunx tsc --noEmit     # TypeScript type-check
bun run db:generate   # Prisma client
bun run db:push       # Database schema sync
bun run dev           # Dev server (localhost:3000)
bun run build         # Production build
bun audit             # Vulnerability check
```

### GitHub Push (when token is available)

```bash
git remote set-url origin "https://github.com/ict7742-dot/sya-web-new-zai.git"
git push -u origin main
```
