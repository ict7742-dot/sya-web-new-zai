
---
Task ID: review-1
Agent: main
Task: Codebase security & technical review + apply critical fixes + verify

Work Log:
- Extracted uploaded workspace tar (git repo) and reviewed the SYA (Systematic Yield Analysts) project: landing page, admin dashboard, leads/blogs APIs, Prisma schema, auth, SEO config.
- Identified and documented technical & security gaps (timing-unsafe admin token compare, no input length caps, headers only on /api, missing /blog/[slug] route referenced by sitemap, ignoreBuildErrors:true, reactStrictMode:false, etc.).
- Synced the uploaded project's src/configs into the live working directory so fixes are previewable.
- SECURITY FIX: Rewrote `src/lib/auth.ts` to use `crypto.timingSafeEqual` for constant-time admin-token comparison (was vulnerable to timing side-channel). Added `adminTokenConfigured()` helper. Fail-closed when no secret set.
- SECURITY FIX: `src/app/api/leads/route.ts` — added input length caps (name 120, email 254, message 2000), hardened `getClientIp` to validate the XFF value matches an IP pattern (prevents rate-limit key poisoning).
- SECURITY FIX: `src/app/api/blogs/route.ts` — added length caps (title 200, excerpt 600, content 50000, author 120, category 60) and `isSafeImageUrl()` validation rejecting javascript:/data: schemes for coverImage.
- SECURITY FIX: `next.config.ts` — set `reactStrictMode: true`, `ignoreBuildErrors: false`, added site-wide security headers (HSTS, nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy) plus extra /api/ hardening (frame DENY + CSP default-src none), `allowedDevOrigins`, `images` config.
- TECHNICAL FIX: Created `src/app/blog/[slug]/page.tsx` — server-rendered blog detail page using `react-markdown` (XSS-safe) with `generateMetadata` for per-post OG tags. Fixes the sitemap→404 gap (sitemap referenced /blog/[slug] which didn't exist).
- Added `.markdown-body` styling to `globals.css` for safe Markdown rendering (headings, lists, blockquotes, code, tables, links).
- Added `ADMIN_SECRET` (random 64-hex) to `.env` so the admin dashboard is functional (was previously missing → admin panel non-functional).
- Ran `bun run db:push` to sync Lead + BlogPost models to SQLite.

Verification (agent-browser + curl):
- `bunx eslint src/` → 0 errors (extracted upload/ folder has unrelated example lint error, not part of project).
- GET / → 200, renders all 8 sections (ticker, hero, demat, courses, how-it-works, reviews, FAQ, blog, contact, footer).
- Security headers verified on both / and /api/ (HSTS, nosniff, Permissions-Policy, CSP on /api/).
- GET /api/leads without token → 401 (fail-closed). With Bearer token → 200 + PII data.
- POST /api/leads → 200 (lead saved). Oversized message (>2000 chars) → 400 (validation works).
- POST /api/blogs with admin token → 201. GET /blog/[slug] → 200, Markdown rendered (headings, lists, blockquote, links).
- GET /blog/nonexistent → 404 (correct).
- Footer present; page 7635px tall so footer pushed down naturally (no overlap).
- dev.log clean — no runtime errors after all changes.

Stage Summary:
- Critical timing-attack on admin auth patched with timingSafeEqual.
- All public/admin inputs now length-bounded; coverImage URLs scheme-validated.
- Site-wide security headers live (previously only /api/ on Vercel).
- Missing blog detail page created — closes the sitemap→404 SEO gap and enables XSS-safe Markdown rendering.
- reactStrictMode on + ignoreBuildErrors off → type safety now enforced.
- ADMIN_SECRET configured so admin dashboard is usable.
- Project is stable and ready for the scheduled webDevReview loop to continue iterating.

Unresolved / Next-phase priorities:
- Split the 2267-line monolithic `src/app/page.tsx` into section components for maintainability.
- Move admin token from sessionStorage to an httpOnly cookie (XSS-hardening).
- Add admin login brute-force rate limiting + failed-attempt lockout.
- Add pagination to admin leads list (currently only 10 recent shown).
- Add a Content-Security-Policy for the marketing pages (currently only /api/ has CSP).
- Add OG image generation (dynamic per-blog OG images).
- Consider encrypting PII (phone/email) at rest for SEBI compliance.
- The `upload/extracted` examples folder trips `bun run lint` on the websocket example — keep excluded from project lint scope.
