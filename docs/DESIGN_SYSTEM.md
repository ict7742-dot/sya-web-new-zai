# Cinematic Finance — Design System

> **Status**: Phase 8 — tokens defined. Phase 9 applies them section-by-section.
> **Reference doc**: source of truth for the visual redesign. Every Tailwind class, color, font weight, motion duration, and shadow recipe used in Phase 9 MUST be defined here first.

## §1 — Design language

| Element | Legacy | Cinematic Finance |
|---|---|---|
| Background | Flat `#070B14` | Layered: deep black `#05070D` + grain texture + parallax glow drift |
| Accent | Flat gold `#E2B15C` | Metallic gold gradient + neon emerald `#35D49A` for live data |
| Typography | Inter + Fraunces | Bebas Neue (display, 14vw) + Inter (body) + JetBrains Mono (data) |
| Cards | Flat border | Glassmorphic: backdrop-blur + gradient border + inner glow |
| Reveals | Simple fade | Staggered fade + upward translate (80ms/item) |
| CTA | Static button | Pulsing radial glow + sticky bottom bar |

## §2 — Color palette

### Core surfaces

| Token | Value | Usage |
|---|---|---|
| `bg-cf-bg` | `#05070D` | Page canvas |
| `bg-cf-bg-elevated` | `#080B14` | Sticky nav, sticky CTA bar |
| `bg-cf-bg-panel` | `#0C1322` | Card surface |
| `cf-grain` | `rgba(255, 255, 255, 0.018)` | Film-grain overlay |

### Accent — gold (metallic gradient)

| Token | Value | Usage |
|---|---|---|
| `text-cf-gold` / `border-cf-gold` | `#E2B15C` | Mid-tone — text accents, borders |
| `cf-gold-soft` | `#F0CD8F` | Highlight stop |
| `cf-gold-deep` | `#B98A3B` | Shadow stop |
| `cf-gold-gradient` | `linear-gradient(135deg, #F0CD8F 0%, #E2B15C 50%, #B98A3B 100%)` | Buttons, gradient text, gradient borders |

### Accent — live data

| Token | Value | Usage |
|---|---|---|
| `text-cf-emerald` | `#35D49A` | Tick-up, "LIVE" dot |
| `text-cf-crimson` | `#F0555F` | Tick-down |
| `cf-glow-gold` | `rgba(226, 177, 92, 0.16)` | Radial glow drift |
| `cf-glow-emerald` | `rgba(53, 212, 154, 0.10)` | Live-data accent glow |

### Text

| Token | Value | Usage |
|---|---|---|
| `text-cf-text` | `#E8EBF2` | Body text |
| `text-cf-text-strong` | `#FFFFFF` | Headlines (Bebas Neue) |
| `text-cf-text-muted` | `#525C70` | Captions, disclaimers |
| `text-cf-mist` | `#98A2B8` | Secondary body text |

### Glassmorphism recipe

```tsx
<div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
  <div className="relative">{children}</div>
</div>
```

## §3 — Typography scale

| Token | Mobile | Desktop | Family | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| Display XL (hero) | 14vw | 14vw | Bebas Neue | 400 | 0.92 | -0.02em |
| Display L (section H1) | 56px | 96px | Bebas Neue | 400 | 0.95 | -0.01em |
| Display M (subsection) | 36px | 56px | Bebas Neue | 400 | 1.0 | 0 |
| Body L | 18px | 20px | Inter | 400 | 1.6 | 0 |
| Body M | 15px | 16px | Inter | 400 | 1.65 | 0 |
| Eyebrow | 11px | 12px | Inter | 600 | 1.4 | 0.18em uppercase |
| Data L (price) | 22px | 28px | JetBrains Mono | 500 | 1.2 | 0 tabular-nums |
| Data M (ticker) | 13px | 14px | JetBrains Mono | 500 | 1.0 | 0 tabular-nums |

**Tailwind mapping**:
- Hero: `font-display text-[14vw] leading-[0.92] tracking-[-0.02em]`
- Section H1: `font-display text-[56px] md:text-[96px] leading-[0.95]`
- Eyebrow: `text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist`
- Price: `font-data text-[22px] md:text-[28px] tabular-nums`

## §4 — Motion

### Easing

| Token | Cubic-bezier | Usage |
|---|---|---|
| `ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Soft ease-out — scroll reveals, card hover lifts |
| `ease-snap` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Slight overshoot — sticky CTA snap, modal pop |

### Duration

| Token | Value | Usage |
|---|---|---|
| `duration-70` | 70ms | Micro-interaction hover |
| `duration-160` | 160ms | Small UI state change |
| `duration-240` | 240ms | Medium (card hover lift) |
| `duration-480` | 480ms | Large (scroll reveal, modal in) |
| `duration-800` | 800ms | Hero entrance |

### Stagger pattern (the Cinematic Finance signature)

Sequential children reveal with **80ms** stagger between each item:

```tsx
<div className="animate-cf-reveal-up [animation-delay:0ms]">...</div>
<div className="animate-cf-reveal-up [animation-delay:80ms]">...</div>
<div className="animate-cf-reveal-up [animation-delay:160ms]">...</div>
```

### Keyframe animations (defined in tailwind.config.ts)

| Class | Effect |
|---|---|
| `animate-cf-reveal-up` | Opacity 0→1, translateY 16px→0, 480ms ease-cinematic |
| `animate-cf-glow-drift` | Radial glow translate(30px, -20px) + opacity oscillation, 18s infinite |
| `animate-cf-ken-burns` | scale(1)→scale(1.08) translate(-2%, -1%), 12s ease-out forwards |
| `animate-cf-pulse-cta` | Box-shadow 0→14px gold ring, 2.4s ease-in-out infinite |

## §5 — Component recipes

### Glassmorphic card

```tsx
<div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
  <div className="relative">{children}</div>
</div>
```

### Eyebrow label

```tsx
<p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
  <span className="block w-6 h-px bg-cf-gold opacity-70" />
  Section label
</p>
```

### Sticky CTA bar (snap-in)

```tsx
<div className="fixed bottom-0 inset-x-0 z-40 transition-transform duration-480 ease-snap
                data-[visible=true]:translate-y-0 data-[visible=false]:translate-y-full">
  {/* glassmorphic bar with pulsing CTA */}
</div>
```
