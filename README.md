# Systematic Yield Analysts (SYA) — Website

A production-ready financial services website for **Systematic Yield Analysts Pvt. Ltd.**, an Angel One Authorized Partner and stock market education academy based in Jaipur, India.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Prisma ORM** (SQLite), and **shadcn/ui**.

## ✨ Features

### Landing Page (`/`)
- **10 interactive sections**: live ticker, hero with candlestick chart, trust strip, broking services, courses, how-it-works, testimonials, FAQ, blog preview, contact form
- **Simulated live market data** (candlestick chart with crosshair, ticker marquee)
- Scroll spy navigation, reading progress bar, back-to-top, mobile CTA bar
- Exit-intent popup, social proof toasts, course urgency elements
- SEBI-compliant disclosure footer
- Accessibility: skip-to-content, focus-visible, ARIA labels, modal focus trap
- SEO: JSON-LD structured data (FinancialService, Course, FAQPage), per-page OG tags, dynamic sitemap

### Blog Ecosystem
- **`/blog`** — Index with category filter, live search, "Popular this week" widget (view-based)
- **`/blog/[slug]`** — Article detail with reading progress, ToC (active highlighting), share buttons, prev/next, related posts, breadcrumbs, view count, dynamic OG images
- **`/blog/category/[name]`** — Category index pages (SEO-indexable)
- **`/blog/author/[name]`** — Author profile pages with bio + avatar
- **`/search`** — Full-text search with highlighting
- **Cmd/Ctrl+K** — Global command palette with keyboard navigation

### Admin Dashboard (`/admin`)
- Cookie-based auth (httpOnly, timing-safe comparison)
- Brute-force rate limiting (10 attempts/min/IP)
- **Leads tab** — stats, paginated table, CSV export
- **Blog Posts tab** — full CRUD (create/edit/delete/toggle publish)
- **Subscribers tab** — newsletter subscriber list + CSV export

### APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/leads` | POST | Public | Lead capture with validation + rate limiting + UTM tracking |
| `/api/leads` | GET | Admin | Paginated leads + CSV export |
| `/api/blogs` | GET | Public | List published posts |
| `/api/blogs` | POST | Admin | Create blog post |
| `/api/blogs/[slug]` | GET | Public | Full post detail |
| `/api/blogs/[slug]` | PUT/DELETE | Admin | Update/delete post |
| `/api/newsletter` | POST | Public | Subscribe (anti-enumeration) |
| `/api/newsletter` | GET | Admin | Subscriber list + CSV |
| `/api/newsletter/unsubscribe` | POST | Public | Token-based one-click unsubscribe |
| `/api/search` | GET | Public | Server-side search |
| `/api/auth/login` | POST | Public | Set httpOnly session cookie |
| `/api/auth/logout` | POST | Admin | Clear session cookie |

### Security
- Timing-safe admin auth (`crypto.timingSafeEqual`)
- httpOnly session cookies (XSS-safe)
- Site-wide security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy)
- Input validation + length caps on all APIs
- Rate limiting on lead + newsletter + login endpoints
- Anti-enumeration on newsletter subscribe/unsubscribe
- CSP: marketing pages get a safe permissive policy; API routes get `default-src 'none'`

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (or [Bun](https://bun.sh) runtime)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/ict7742-dot/SYA-website.git
cd SYA-website

# Install dependencies (Bun recommended)
bun install

# Set up environment variables
cp .env.example .env
# Edit .env and set ADMIN_SECRET:
#   openssl rand -hex 32

# Push the database schema
bun run db:push

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Dashboard
- URL: `http://localhost:3000/admin`
- Password: The value of `ADMIN_SECRET` in your `.env` file

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Sync Prisma schema to SQLite |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate` | Create + apply a migration |
| `bun run db:reset` | Reset database (destroys data) |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite (dev) |
| Icons | Lucide React |
| Markdown | react-markdown |
| OG Images | next/og (ImageResponse) |
| Runtime | Bun (recommended) / Node.js 20+ |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (client component)
│   ├── layout.tsx            # Root layout + JSON-LD + CommandPalette
│   ├── globals.css           # Tailwind + custom styles
│   ├── admin/                # Admin dashboard
│   ├── blog/                 # Blog index, detail, category, author
│   ├── search/               # Search page
│   ├── unsubscribe/          # Newsletter unsubscribe page
│   └── api/                  # API routes (leads, blogs, newsletter, auth, search)
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── landing/              # Landing page sections (LazySection, ChartSVG, Toast)
│   ├── command-palette.tsx   # Cmd/Ctrl+K search
│   ├── newsletter.tsx        # Reusable newsletter signup
│   ├── popular-posts.tsx     # Popular posts widget
│   └── ...
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── auth.ts               # Timing-safe admin auth + cookie helpers
│   ├── landing-data.ts       # Landing page data + types
│   ├── chart-utils.ts        # Chart math utilities
│   └── utils.ts              # cn() + shared utilities
├── hooks/                    # Custom React hooks
└── prisma/
    └── schema.prisma         # Database schema (Lead, BlogPost, NewsletterSubscriber)
```

## 🔒 Security Checklist

- [x] Secrets in `.env` (never committed — see `.gitignore`)
- [x] httpOnly session cookies (not readable by JavaScript)
- [x] Timing-safe token comparison (`crypto.timingSafeEqual`)
- [x] Brute-force rate limiting on login (10/min/IP)
- [x] Input validation + length caps on all APIs
- [x] Content-Security-Policy on all routes
- [x] HSTS, X-Frame-Options, Permissions-Policy headers
- [x] Anti-enumeration on newsletter endpoints
- [ ] **TODO**: Encrypt PII (phone/email) at rest for SEBI compliance
- [ ] **TODO**: Set up a real email provider for newsletter sending

## 🚢 Deployment

### Vercel (recommended)
1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (`DATABASE_URL`, `ADMIN_SECRET`)
4. Deploy

The `vercel.json` includes security headers for API routes.

### Production Database
Switch from SQLite to PostgreSQL:
1. Update `prisma/schema.prisma` datasource to `postgresql`
2. Set `DATABASE_URL` to your Postgres connection string
3. Run `bun run db:push`

## 📝 Content Updates

### Adding Blog Posts
1. Log into `/admin` with your `ADMIN_SECRET`
2. Go to **Blog Posts** tab → **New Post**
3. Fill in title, content (Markdown), category, author, cover image URL

### Replacing Placeholder Content
Search the codebase for these placeholders and replace with real data:
- Phone: `+91 98290 12345`
- Email: `connect@systematicyield.in`
- Address: `2nd Floor, Landmark Tower, Tonk Road, Jaipur`
- Angel One referral URL: `https://angelone.in/?ref=systematicyield`
- CIN number in footer
- Domain in `layout.tsx` and `sitemap.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure `bun run lint` passes before submitting.

## 📄 License

This project is proprietary software owned by Systematic Yield Analysts Pvt. Ltd.
All rights reserved.

## ⚠️ Disclaimer

Investments in securities markets are subject to market risks. This website is for informational purposes only and does not constitute investment advice. SEBI registration details and disclaimers are provided in the footer of the website.
