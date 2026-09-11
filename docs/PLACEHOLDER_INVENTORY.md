# Placeholder Inventory

> **Purpose**: catalog every placeholder value currently in the codebase so
> the content team can find and replace them with real, verified values
> before going live. This is the actionable list behind audit finding P0-9.
>
> **Last reviewed**: 2026-09-11
> **Status legend**: ⚠️ placeholder (replace before launch) · ✅ verified ·
> 🛑 risk-of-penalty (must remove or replace before launch)

## 1. Contact details (⚠️ verify before launch)

| Field | Placeholder value | Where it appears | Action needed |
|---|---|---|---|
| Phone (display) | `+91 98290 12345` | `src/app/page.tsx` (4 places: contact card, WhatsApp link, footer, exit-intent popup), `src/app/layout.tsx` (JSON-LD `telephone`) | Replace with the actual SYA business phone number |
| Phone (tel: link) | `tel:+919829012345` | `src/app/page.tsx` contact card | Same as above |
| Phone (wa.me link) | `https://wa.me/919829012345?text=...` | `src/app/page.tsx` (2 places: contact card, exit-intent popup) | Same as above; verify WhatsApp Business account is on this number |
| Email | `connect@systematicyield.in` | `src/app/page.tsx` (4 places: contact card, footer, grievance redressal, legal modal), `src/app/layout.tsx` (JSON-LD `email`), `src/lib/landing-data.ts` (privacy policy) | Verify the inbox exists and is monitored; replace if different |
| Office address | `2nd Floor, Landmark Tower, Tonk Road, Jaipur, Rajasthan 302015` | `src/app/page.tsx` (contact card, footer disclosure), `src/app/layout.tsx` (JSON-LD `PostalAddress`) | Verify the office address; check it's the registered office in ROC records |

## 2. Referral / partner URLs (⚠️ verify before launch)

| Field | Placeholder value | Where it appears | Action needed |
|---|---|---|---|
| Angel One referral URL | `https://angelone.in/?ref=systematicyield` | `src/app/page.tsx` (ekyc CTA, "click here to start onboarding"), `src/app/api/leads/route.ts` line ~127 (`ekycUrl` returned on successful lead submission) | Get the actual partner referral URL from Angel One. The current value is a guess — without a real `ref` parameter, leads that click through may not be attributed to SYA |

## 3. Marketing claims (🛑 risk-of-penalty)

| Claim | Where it appears | Why it's risky | Action |
|---|---|---|---|
| **"2400+ accounts guided"** (counter on stats strip + OG description) | `src/app/page.tsx` (counter on TrustStrip stats), `src/app/layout.tsx` line ~44 (OG description — Phase 6 reddo softens this) | SEBI prohibits unverifiable claims; Google's E-E-A-T guidelines penalize unverifiable stats. The number "2400" was invented. | Replace with a verifiable claim (e.g. "Operating since YYYY", or "Authorized Partner since YYYY") or remove the counter entirely |
| **AggregateRating 4.8/180 reviews** in JSON-LD | `src/app/layout.tsx` (Phase 6 reddo REMOVES this) | 🛑 **Removed in Phase 6**. Google's structured-data guidelines explicitly forbid fabricated ratings — leaving this can trigger a manual penalty that strips ALL rich-result eligibility from the site. Will be re-enabled only when real Google-verified reviews exist. | (Done in Phase 6 redo) Re-enable only when collecting real reviews from a verifiable source |

## 4. SEBI / regulatory disclosures (⚠️ verify)

| Field | Value | Where it appears | Status |
|---|---|---|---|
| Angel One SEBI Reg. No. | `INZ000161534` | `src/app/page.tsx` footer, `src/lib/landing-data.ts` (FAQ answer) | ⚠️ Verify against SEBI's broker registry — value appears correct but the partner should confirm |
| Angel One CIN | `U74999RJ2008PLC026458` | `src/app/page.tsx` footer | ⚠️ This is Angel One's CIN (publicly verifiable on MCA). Verify it hasn't changed. |
| SYA's own CIN | (not present anywhere) | n/a | ⚠️ If SYA Pvt. Ltd. is incorporated, its CIN should appear in the footer alongside or instead of Angel One's. Add when known. |
| Angel One memberships | `Member NSE · BSE · MCX` | `src/app/page.tsx` footer | ⚠️ Verify — Angel One's memberships should be current |

## 5. Social proof (⚠️ fabricated)

| Field | Where | Why it's risky | Action |
|---|---|---|---|
| Testimonials (`TESTIMONIALS` array — 6 entries with names like "Rohit Sharma", "Priya Mehta", etc.) | `src/lib/landing-data.ts` | These are invented reviews attributed to invented people. SEBI and ASCI guidelines prohibit fabricated testimonials. | Replace with real, consented testimonials OR remove the testimonials section entirely. If using real testimonials, get written consent and keep the consent on file. |
| Social proof toasts (Rahul from Vaishali Nagar opened a Demat account, Priya enrolled in Advanced Options, etc.) | `src/lib/landing-data.ts` `SOCIAL_PROOFS` array | Invented names + invented actions + fake time-ago. Same ASCI concern as testimonials. | Remove entirely OR replace with a less specific indicator (e.g. "X traders onboarded this week" where X is a real aggregate). |

## 6. Domain

| Field | Value | Where | Status |
|---|---|---|---|
| Production domain | `https://systematicyield.in` | `src/app/layout.tsx` (metadataBase, JSON-LD, OG url), `src/app/sitemap.ts`, `src/app/blog/[slug]/page.tsx` (canonical) | ⚠️ Verify the domain is registered and points at Vercel. Replace if different. |

## 7. Sign-off

Before promoting to production, every row above should be either:
- ✅ Verified (with a one-line source: ROC filing number, Angel One partner portal URL, MCA company search URL, etc.)
- OR explicitly removed from the codebase

The partner is responsible for the verification. This document exists to make
the work findable — it does not absolve the partner of the regulatory obligation
to ensure that claims on a SEBI-regulated marketing site are accurate and
verifiable.
