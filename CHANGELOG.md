# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Global Cmd/Ctrl+K command palette with keyboard navigation
- Blog search API (`/api/search`) with multi-term AND logic
- Dedicated search page (`/search`) with debounced live results + highlighting
- Blog category index pages (`/blog/category/[name]`)
- Blog author profile pages (`/blog/author/[name]`)
- "Popular this week" widget (view-based ranking)
- View count tracking on blog posts
- Dynamic OG image generation per blog post
- Newsletter subscribe/unsubscribe with token-based one-click opt-out
- Admin subscribers tab with CSV export
- Reading progress bar + Table of Contents (active highlighting) on blog detail
- Related posts + prev/next navigation on blog detail
- Sitemap expanded with blog posts, categories, and author pages

### Security
- Timing-safe admin auth (`crypto.timingSafeEqual`)
- httpOnly session cookies (replaced sessionStorage)
- Brute-force rate limiting on login (10/min/IP)
- Site-wide Content-Security-Policy
- Input length validation on all APIs
- URL scheme validation for cover images
- Anti-enumeration on newsletter endpoints

### Changed
- Split monolithic `page.tsx` into modular components (2,278 → 1,906 lines)
- Admin auth moved from Bearer header to httpOnly cookie
- Leads + newsletter APIs now support pagination
- Blog cards link to real post URLs (were `href="#"`)

### Infrastructure
- GitHub Actions CI/CD pipeline (lint, type-check, build)
- Industry-standard `.gitignore`, `.env.example`, `.nvmrc`, `.prettierrc`
- Comprehensive README, CONTRIBUTING, LICENSE, CHANGELOG

## [0.1.0] - Initial Release

### Added
- Landing page with 10 sections (ticker, hero, courses, testimonials, FAQ, contact)
- Lead capture form with validation + UTM tracking
- Admin dashboard with leads + blog CRUD
- SEBI-compliant disclosure footer
- JSON-LD structured data for SEO
- Mobile-responsive design with sticky footer
- Accessibility: skip-to-content, focus-visible, ARIA labels
