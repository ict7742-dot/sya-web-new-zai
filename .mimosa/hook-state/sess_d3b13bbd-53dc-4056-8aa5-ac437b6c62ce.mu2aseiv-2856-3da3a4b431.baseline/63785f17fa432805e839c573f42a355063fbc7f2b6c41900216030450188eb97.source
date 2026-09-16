'use client';

import { useEffect, useRef } from 'react';
import { BadgeCheck, GraduationCap, Cpu, Headphones, ShieldCheck } from 'lucide-react';

/**
 * TrustStrip section — Phase 9.3 visual rewrite using Cinematic Finance tokens.
 *
 * Combines (per docs/DESIGN_SYSTEM.md §6):
 *   - The 4 trust cards (Authorized Partner, Expert Mentorship, Data-Driven
 *     Quant Strategies, Dedicated Support)
 *   - The 3 stat counters (Demat accounts / Traders mentored / Combined
 *     market experience years) — animate from 0 to value on scroll-in
 *
 * Visual treatment:
 *   - Glassmorphic card per stat + per trust pillar
 *   - JetBrains Mono numerics for the counters (tabular-nums)
 *   - 80ms staggered reveal
 *
 * Removed in Phase 9 (consistent with Phase 6 AggregateRating removal from
 * JSON-LD): the fabricated "4.8 ★★★★★ Based on 180+ Google Reviews" badge.
 * Re-added only when real Google-verified reviews exist.
 *
 * PLACEHOLDER WARNING (docs/PLACEHOLDER_INVENTORY.md §3): the counter values
 * 2400 / 900 / 12 are unverified marketing claims. SEBI prohibits unverifiable
 * claims on regulated marketing sites. The partner MUST verify and update
 * these numbers OR remove the counters before going to production. The values
 * are kept here for layout continuity during the redesign.
 */
const TRUST_PILLARS = [
  {
    icon: BadgeCheck,
    title: 'Authorized Angel One Partner',
    desc: 'Regulated broking ecosystem, end to end',
  },
  {
    icon: GraduationCap,
    title: 'Expert Mentorship',
    desc: 'NISM-certified mentors, live market sessions',
  },
  {
    icon: Cpu,
    title: 'Data-Driven Quant Strategies',
    desc: 'Backtested models — never hot tips',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'One point of contact — KYC to strategy',
  },
];

// ⚠️ PLACEHOLDER VALUES — see file header + docs/PLACEHOLDER_INVENTORY.md §3.
const STATS = [
  { value: 2400, suffix: '+', label: 'Demat accounts guided' },
  { value: 900, suffix: '+', label: 'Traders mentored' },
  { value: 12, suffix: ' yrs', label: 'Combined market experience' },
];

const VERIFICATIONS = [
  { icon: ShieldCheck, label: 'SEBI Regulated' },
  { icon: BadgeCheck, label: 'NSE, BSE, MCX' },
  { icon: GraduationCap, label: 'NISM Certified' },
];

export function TrustStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Counter animation — uses IntersectionObserver scoped to this section's
  // [data-count] elements. Animate from 0 → value over 1.2s on scroll-in
  // with cubic ease-out. Respects prefers-reduced-motion (jumps to final).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const count = parseInt(el.dataset.count || '0', 10);
          observer.unobserve(el);
          if (reduce) {
            el.textContent = count.toLocaleString('en-IN');
            return;
          }
          const t0 = performance.now();
          const dur = 1200; // 1.2s — slightly faster than legacy 1.4s for snappier feel
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            // ease-cubic-out (1 - (1-p)^3) — matches the cf-reveal-up feel
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(count * eased).toLocaleString('en-IN');
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    section.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="relative border-y border-cf-gold/10 bg-cf-bg-elevated">
      {/* Trust pillars — 4 glassmorphic cards in a row (2-col on mobile) */}
      <div className="wrap py-12 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_PILLARS.map((p, i) => (
            <div
              key={p.title}
              className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] group rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-white/[0.06] hover:border-cf-gold/40 shadow-glass p-5 md:p-6 flex items-start gap-4 transition-all duration-240 ease-cinematic`}
            >
              <span className="w-10 h-10 shrink-0 rounded-md border border-cf-gold/30 text-cf-gold flex items-center justify-center group-hover:bg-cf-gold/10 group-hover:border-cf-gold/60 transition-all duration-240">
                <p.icon className="w-[18px] h-[18px]" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold leading-snug text-cf-text-strong">{p.title}</span>
                <span className="block text-[12px] text-cf-mist mt-1 leading-relaxed">{p.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats counters — 3 glassmorphic stat cards. JetBrains Mono numerics. */}
      <div className="wrap pb-12 md:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-gold/15 shadow-glass px-7 py-7 text-center relative overflow-hidden`}
            >
              {/* Gold inner glow on the bottom edge — the "live data" feel */}
              <div
                className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-12 rounded-full blur-2xl opacity-30"
                style={{ background: 'radial-gradient(ellipse, rgba(226,177,92,0.4), transparent 70%)' }}
              />
              <div className="relative font-data text-[44px] md:text-[52px] text-cf-gold leading-none tabular-nums">
                <span data-count={s.value}>0</span>
                <span className="text-[24px] text-cf-gold-soft">{s.suffix}</span>
              </div>
              <div className="relative mt-2.5 text-[11px] tracking-[0.16em] uppercase text-cf-mist font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification badges — real, verifiable (not fabricated). Replaces the
          old Google Reviews badge which displayed a fabricated 4.8/180 rating. */}
      <div className="wrap pb-10 md:pb-12">
        <div className="flex flex-wrap items-center justify-center gap-5 text-[12.5px] text-cf-mist">
          {VERIFICATIONS.map((v) => (
            <span
              key={v.label}
              className="flex items-center gap-1.5 animate-cf-reveal-up"
            >
              <v.icon className="w-4 h-4 text-cf-emerald" />
              {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
