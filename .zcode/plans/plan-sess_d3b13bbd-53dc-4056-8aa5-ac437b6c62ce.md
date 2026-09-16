Remediation of the reviewed issues in sya-web-new-zai, in priority order. (Partial work already applied: created src/lib/rate-limit.ts and rewrote src/app/api/leads/route.ts.)

**1. Leads admin fixes**
- Leads API GET: server-side filters (?interest=&since=&q=), pagination, per-filter totals, true stats (last-7-days / last-30-days counts via db.count), lead `id` in payload; CSV export honors the same filters (kills the fragile client-side DATE_IDX/multi-line parsing).
- LeadsTab: server-driven pagination (prev/next + page indicator), debounced search (350ms), stats from API, expandable row keyed by lead.id (fixes drawer jumping while searching), keyboard-accessible rows, CSV export via filtered API.
- Lead POST: honeypot field ("website") — bots get fake success, nothing saved.

**2. Subscribers admin fixes**
- Newsletter GET: return `activeCount`; SubscribersTab uses it for the Active stat and broadcast recipient count (fixes wrong "To N subscribers"); pagination controls.

**3. Admin shell**
- Session-check loading state (no login-form flash); surface leads-prefetch failure as a toast instead of silently ignoring.

**4. View tracking**
- ViewTracker: sessionStorage dedupe per slug, skip navigator.webdriver, keepalive fetch.
- View API: per-IP+slug rate limit (shared limiter).

**5. Broadcast rebuild**
- Resend batch endpoint (up to 100/call) instead of sequential per-recipient fetches; per-recipient unsubscribe link (`/unsubscribe?token=`) appended to body + List-Unsubscribe headers; confirmation checkbox in the modal before send; Escape/aria-modal on modals.

**6. Performance**
- Landing page → server component with client islands (interactive sections stay client); BlogPreview data from server, killing the /api/blogs waterfall.
- next/image for blog cover images (config already allows it); trim font weights in layout.

**7. Hardening**
- Shared rate limiter (src/lib/rate-limit.ts) wired into login, leads, newsletter, search, broadcast, view routes (fixes Map memory growth; Redis can slot in later).
- noindex on /admin (layout metadata); opportunistic purge of long-expired AdminSessions on login.

**8. Tests**
- Vitest + unit tests for validation, csv, auth helpers, and the rate limiter; wire `bun run test` into CI.

Verification: bun run lint, tsc --noEmit, vitest run, next build.

User items still requiring your input (not code): real contact info/Angel One referral URL, RESEND_API_KEY + verified FROM_EMAIL, strong production ADMIN_SECRET, production Postgres provider, analytics choice.