'use client';

import { ArrowUpRight, IndianRupee, Receipt, UserCheck, Code2, Zap } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';

interface BrokingServicesProps {
  /** Triggered when the onboarding CTA is clicked (scrolls to contact form). */
  onSelectInterest: (interest: 'account' | 'courses' | 'both', label: string) => void;
}

/** Glassmorphic mini-card data — 5 partner-desk benefits. */
const BENEFITS = [
  {
    icon: IndianRupee,
    title: 'Zero brokerage on equity delivery',
    desc: 'Buy and hold across NSE & BSE without brokerage eating into your returns. Delivery trades stay completely free.',
  },
  {
    icon: Receipt,
    title: 'Flat ₹20 on intraday & F&O',
    desc: 'One flat fee per executed order — or 0.03% of turnover, whichever is lower. No hidden slabs, no percentage surprises.',
  },
  {
    icon: UserCheck,
    title: 'Personalized portfolio guidance',
    desc: 'A dedicated partner who reviews your allocations with you every quarter — and tells you when the right move is to do nothing.',
  },
  {
    icon: Code2,
    title: 'API & algo trading support',
    desc: 'Build on Angel One SmartAPI with hand-holding from our quant team — from your first automated signal to full deployment.',
  },
  {
    icon: Zap,
    title: 'Seamless digital onboarding',
    desc: '100% paperless e-KYC with e-Sign and DigiLocker. Most accounts are trade-ready within 24 hours.',
  },
] as const;

/** Pricing term-sheet rows — JetBrains Mono for the ₹ figures. */
const PRICING = [
  { dt: 'Equity Delivery', dd: '₹0', sub: 'Hold as long as you like', gold: true },
  { dt: 'Intraday Equity', dd: '₹20', sub: 'Per executed order', gold: false },
  { dt: 'Futures & Options', dd: '₹20', sub: 'Per order, all segments', gold: false },
  { dt: 'Account Opening', dd: '₹0', sub: 'Paperless e-KYC', gold: true },
  { dt: 'Annual Maintenance', dd: '₹0', sub: 'First year, on accounts opened with us', gold: true },
] as const;

const DOCUMENTS = ['PAN card', 'Aadhaar', 'Bank proof', 'Photo & signature'];

/**
 * Broking Services section — Phase 9.4 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md §5 + §9.4):
 *   - Bebas Neue section heading + eyebrow with gold hairline
 *   - Left: intro copy + 2-col grid of glassmorphic mini benefit cards
 *     (5th card spans full width for visual balance); 80ms staggered reveal
 *   - Right: glassmorphic pricing term sheet with gradient gold top-edge border
 *     + corner ticks + JetBrains Mono ₹ figures + pulsing onboarding CTA
 *   - Hover lift on every card (duration-240 ease-cinematic, -translate-y-1)
 */
export function BrokingServices({ onSelectInterest }: BrokingServicesProps) {
  return (
    <LazySection>
      <section id="demat" className="sec border-t border-white/[0.06] relative overflow-hidden">
        {/* Parallax gold glow drift — subtle ambient layer */}
        <div
          className="pointer-events-none absolute -top-32 right-0 w-[480px] h-[480px] rounded-full blur-3xl opacity-25 animate-cf-glow-drift"
          style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.16), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="wrap relative grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* ── Left: heading + benefits grid ── */}
          <div>
            <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              01 · Partner Desk
            </p>
            <h2 className="font-display font-normal text-[48px] md:text-[72px] lg:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
              Why open your<br />
              <span className="bg-cf-gold-gradient bg-clip-text text-transparent">account with us?</span>
            </h2>
            <p className="mt-5 text-cf-mist text-[15px] md:text-base leading-relaxed max-w-lg animate-cf-reveal-up [animation-delay:160ms]">
              Anyone can issue you a login. As an Authorized Partner of Angel One, we pair India&apos;s most
              trusted broking platform with a local desk that actually picks up the phone.
            </p>

            {/* Benefits — 2-col grid of glassmorphic mini cards; 5th spans full width */}
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {BENEFITS.map((item, i) => (
                <div
                  key={item.title}
                  className={`group relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40 animate-cf-reveal-up [animation-delay:${200 + i * 80}ms] ${i === BENEFITS.length - 1 ? 'sm:col-span-2' : ''}`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />
                  <div className="relative p-5 flex gap-4">
                    <span className="w-11 h-11 shrink-0 rounded-lg border border-cf-gold/30 bg-cf-gold/[0.05] flex items-center justify-center text-cf-gold group-hover:bg-cf-gold/15 group-hover:border-cf-gold/60 transition-all duration-240">
                      <item.icon className="w-[19px] h-[19px]" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-cf-text-strong leading-snug">{item.title}</h3>
                      <p className="text-[13px] text-cf-mist mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: glassmorphic pricing term sheet ── */}
          <div className="lg:sticky lg:top-24 animate-cf-reveal-up [animation-delay:240ms]">
            <div className="relative">
              {/* Corner ticks — chart-annotation motif */}
              <span className="tick tick-tl" aria-hidden="true" />
              <span className="tick tick-tr" aria-hidden="true" />
              <span className="tick tick-bl" aria-hidden="true" />
              <span className="tick tick-br" aria-hidden="true" />

              <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
                {/* Gradient gold border highlight on top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />

                <div className="relative p-7 md:p-9">
                  <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-cf-gold">Partner Pricing</p>
                  <h3 className="font-display font-normal text-[40px] md:text-[44px] leading-none tracking-[-0.01em] text-cf-text-strong mt-2">
                    Brokerage, in plain numbers.
                  </h3>

                  <dl className="mt-7">
                    {PRICING.map((item, i, arr) => (
                      <div
                        key={item.dt}
                        className={`flex items-baseline justify-between gap-4 py-4 ${i < arr.length - 1 ? 'border-b border-white/[0.07]' : ''}`}
                      >
                        <dt>
                          <span className="text-[14px] text-cf-text font-medium">{item.dt}</span>
                          <span className="block text-[11.5px] text-cf-mist mt-0.5">{item.sub}</span>
                        </dt>
                        <dd className={`font-data text-[26px] font-medium leading-none tabular-nums ${item.gold ? 'text-cf-gold' : 'text-cf-text-strong'}`}>
                          {item.dd}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="text-[10.5px] text-cf-text-muted leading-relaxed mt-3">
                    *Or 0.03% of turnover, whichever is lower, as per Angel One&apos;s published rate card.
                    Statutory charges apply as per exchange &amp; SEBI norms.
                  </p>

                  <div className="mt-7 pt-7 border-t border-white/[0.07]">
                    <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cf-mist mb-3">Documents you&apos;ll need</p>
                    <div className="flex flex-wrap gap-2">
                      {DOCUMENTS.map((doc) => (
                        <span
                          key={doc}
                          className="text-[11.5px] px-3 py-1.5 rounded border border-cf-glass-border text-cf-text bg-cf-glass-glow"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectInterest('account', 'Demat account onboarding')}
                    className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold animate-cf-pulse-cta motion-reduce:[animation:none]"
                  >
                    Start Paperless Onboarding <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazySection>
  );
}
