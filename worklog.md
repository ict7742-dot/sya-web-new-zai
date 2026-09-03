
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

---
Task ID: review-2
Agent: main (webDevReview cron loop, round 2)
Task: QA current state + build blog ecosystem (index page, enhanced detail, newsletter) + styling polish

Current project status / assessment:
- Project was stable from review-1 (landing 200, admin 200, blog detail 200, security headers live, auth fail-closed, no console errors).
- QA via agent-browser + curl surfaced ONE clear feature gap: `/blog` index route returned 404 (only `/blog/[slug]` detail existed). The landing page showed 3 inline posts linking to `href="#"` (dead links). This was the highest-impact fix.
- Newsletter capture did not exist (`/api/newsletter` → 404).
- Dev server running cleanly; lint passing on src/.

Work Log:
- Added `NewsletterSubscriber` Prisma model (email unique, source, active, timestamps) + indexes. Ran `bun run db:push`.
- Created `POST /api/newsletter` route: email validation, IP-based rate limit (5/min), source enum check, anti-enumeration upsert (idempotent resubscribe never leaks whether an email is already on the list). Fail-closed error handling.
- Created reusable `<Newsletter>` client component (card + inline variants, loading/success/error states, success re-subscribe flow). Used on blog index + blog detail.
- Created `/blog` index page (server component): hero with radial gold/green glow, eyebrow, serif headline. Fetches all published posts server-side, passes to `<BlogBrowser>`.
- Created `<BlogBrowser>` client component: category pills (All + 4 categories) with active gold state, live search box, result count, responsive 3-col grid of styled blog cards (image hover zoom, category color-coding, line-clamp, "Read" arrow reveal on hover), empty state with clear-filters button.
- Rewrote `/blog/[slug]` detail page with major enhancements:
  - Reading-progress bar (fixed gold gradient, scroll-tracked) via `<ReadingProgress>` client component.
  - Reading-time estimate (~200 wpm) shown in hero.
  - Auto-generated Table of Contents from H2 headings, sticky sidebar on desktop with active-hover gold border.
  - `<ShareButtons>` (WhatsApp, X/Twitter, Copy-link with copied-check state).
  - Prev/Next article navigation (queries older/newer published posts by createdAt).
  - Breadcrumbs (Home > Insights > title).
  - Article JSON-LD `Article` schema for rich results.
  - Newsletter card at bottom.
- Updated landing page `page.tsx` Insights section: blog cards now link to real `/blog/[slug]` (were `href="#"`), added hover lift + image zoom + title gold-on-hover, and a "View all insights" ghost CTA button → `/blog`.
- Added ~150 lines of CSS to `globals.css`: `.blog-hero-glow`, `.cat-pill`/`.cat-pill-active`, `.blog-card` (lift + shadow + zoom), `.blog-card-cat`, `.share-btn`, `.post-nav` (prev/next), `.newsletter-card` (gradient), `:target` scroll-margin.
- Forced a full dev-server restart (touched next.config.ts) to clear the stale Prisma client singleton after the schema change — newsletter endpoint then worked.

Verification results (agent-browser + curl + VLM):
- `bun run lint` → 0 errors, 0 warnings.
- dev.log clean (no errors/⨯ after restart).
- GET `/blog` → 200; renders 6 post cards, 5 category pills, search input. Hero glow + serif headline render.
- Category filter: clicking "Course Updates" → 1 card (correct). Resetting + searching "iron condor" → 1 matching card (correct). Search + filter compose correctly.
- GET `/blog/[slug]` → 200; reading time "1 min read", ToC (1 item for 1 H2), 3 share buttons, progress bar present, newsletter card present, Article JSON-LD present, prev/next nav present.
- POST `/api/newsletter` valid → `{"success":true,...}`. Resubscribe same email → identical success (idempotent/anti-enumeration). Invalid email → 400.
- Landing page `/` → 200; after scroll, blog section renders 3 cards linked to real posts + "View all insights" CTA. Footer present, no regressions.
- VLM visual assessment of blog index: **9/10 polish** — "highly polished, professional, cohesive; conveys trust and expertise". VLM analysis of blog detail confirmed all elements (progress bar, hero, ToC sidebar, share, prev/next, breadcrumbs, newsletter, markdown body) rendered correctly.
- Screenshots saved to `/home/z/my-project/download/blog-index-full.png` and `blog-detail-full.png`.

Stage Summary:
- Closed the biggest UX/SEO gap: `/blog` index page now exists (was 404) with filter + search + styled cards.
- Blog detail page elevated from a plain article to a full reading experience (progress, ToC, share, prev/next, reading time, JSON-LD, newsletter).
- Newsletter capture feature complete end-to-end (DB + API + reusable component, anti-enumeration + rate-limited).
- Landing page blog cards now drive real traffic into the blog funnel.
- All new features verified working in-browser; lint clean; no runtime errors.

Unresolved / next-phase priorities:
- Split the 2,267-line monolithic `src/app/page.tsx` into section components (still pending from review-1).
- Move admin token from sessionStorage → httpOnly cookie (XSS hardening).
- Add admin login brute-force rate limiting + pagination for leads list.
- Add a marketing-page Content-Security-Policy (currently only /api/ has CSP).
- Add OG image generation (dynamic per-blog OG images) — currently uses a static SVG.
- Consider encrypting PII (phone/email) at rest for SEBI compliance.
- Add an admin view for newsletter subscribers + CSV export.
- ToC active-section highlighting on scroll (currently hover-only).
