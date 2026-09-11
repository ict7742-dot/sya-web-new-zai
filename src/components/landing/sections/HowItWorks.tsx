'use client';

import { MessageCircle, UserCheck, Zap, ArrowUpRight } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';

interface HowItWorksProps {
  /** Triggered when a step CTA is clicked (scrolls to contact form). */
  onSelectInterest: (interest: 'account' | 'courses' | 'both', label: string) => void;
}

const STEPS = [
  {
    step: '01',
    icon: MessageCircle,
    title: 'Reach Out',
    desc: 'Fill the form, WhatsApp us, or call directly. Tell us what you need — a trading account, a course, or both.',
    cta: 'Start with a message',
    ctaKind: 'both' as const,
  },
  {
    step: '02',
    icon: UserCheck,
    title: 'Quick Onboarding',
    desc: 'Our team walks you through paperless e-KYC via DigiLocker. PAN, Aadhaar, bank proof — done in about 15 minutes.',
    cta: 'Open Demat Account',
    ctaKind: 'account' as const,
  },
  {
    step: '03',
    icon: Zap,
    title: 'Start Trading & Learning',
    desc: 'Your Angel One account goes live within 24 hours. Course batches start monthly — or get instant access to recordings.',
    cta: 'View Courses',
    ctaKind: 'courses' as const,
  },
];

/**
 * How It Works section — Phase 9.6 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Bebas Neue display heading + eyebrow with gold hairline
 *   - Glassmorphic step cards with gold index number + icon chip
 *   - Animated gold connecting dots between steps on desktop (visual rhythm)
 *   - 80ms staggered reveal of the 3 step cards
 *   - Hover lift: -translate-y-1 + gold border glow (duration-240 ease-cinematic)
 */
export function HowItWorks({ onSelectInterest }: HowItWorksProps) {
  return (
    <LazySection>
      <section id="howitworks" className="sec border-t border-white/[0.06]">
        <div className="wrap max-w-5xl">
          {/* Header */}
          <div className="text-center animate-cf-reveal-up">
            <p className="flex items-center justify-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              03 · How It Works
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
            </p>
            <h2 className="font-display font-normal text-[56px] md:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
              Three steps. Zero friction.
            </h2>
            <p className="mt-4 text-cf-mist text-[15px] md:text-[16px] leading-relaxed max-w-lg mx-auto">
              Whether you are opening your first demat account or enrolling in a program — we keep it simple, fast, and human.
            </p>
          </div>

          {/* Step cards — 3-col grid on desktop, stacked on mobile.
              Each card is glassmorphic with gold step number + icon chip.
              80ms staggered reveal. */}
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {STEPS.map((item, i) => (
              <div
                key={item.step}
                className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] group relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-white/[0.06] hover:border-cf-gold/40 shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1`}
              >
                {/* Inner glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />

                <div className="relative p-7 md:p-8 flex flex-col items-center text-center">
                  {/* Icon chip */}
                  <div className="w-14 h-14 rounded-full border border-cf-gold/40 bg-cf-gold/[0.06] flex items-center justify-center text-cf-gold group-hover:bg-cf-gold/15 group-hover:border-cf-gold/70 transition-all duration-240">
                    <item.icon className="w-6 h-6" />
                  </div>

                  {/* Giant ghost step number — decorative */}
                  <p
                    className="font-display text-[64px] leading-none text-cf-gold/[0.06] absolute top-2 right-3 select-none"
                    aria-hidden="true"
                  >
                    {item.step}
                  </p>

                  <h3 className="text-[17px] font-semibold mt-5 text-cf-text-strong">{item.title}</h3>
                  <p className="text-[13.5px] text-cf-mist leading-relaxed mt-3">{item.desc}</p>

                  <button
                    onClick={() => onSelectInterest(item.ctaKind, item.cta)}
                    className="mt-6 text-[13px] font-medium text-cf-gold hover:text-cf-gold-soft transition-colors duration-160 flex items-center gap-1.5"
                  >
                    {item.cta} <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gold connecting dot to the next step (desktop only, hides on last item) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-1/2 -right-3 z-10 w-2 h-2 rounded-full bg-cf-gold/70 shadow-glow-gold"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </LazySection>
  );
}
