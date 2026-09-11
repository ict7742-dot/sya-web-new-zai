'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';
import { FAQS } from '@/lib/landing-data';

/**
 * FAQ section — Phase 9.8 visual rewrite using Cinematic Finance tokens.
 *
 * Establishes the Phase 9 section-component pattern:
 *   1. Section lives in src/components/landing/sections/<Name>.tsx
 *   2. Section owns its OWN local state (openFaq here — section-local)
 *   3. Section imports LazySection for scroll-reveal behavior
 *   4. Data comes from @/lib/landing-data.ts
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Bebas Neue display heading
 *   - Glassmorphic accordion cards with gradient gold border
 *   - Gold chevron rotates 180deg on open (duration-240 ease-cinematic)
 *   - 80ms staggered reveal of accordion items on scroll-in
 */
export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <LazySection>
      <section id="faq" className="sec border-t border-white/[0.06]">
        <div className="wrap max-w-3xl">
          {/* Header — Bebas Neue display, gold hairline eyebrow */}
          <div className="animate-cf-reveal-up">
            <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              05 · Frequently Asked Questions
            </p>
            <h2 className="font-display font-normal text-[56px] md:text-[72px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
              Questions We Get Asked a Lot
            </h2>
            <p className="mt-4 text-cf-mist text-[15px] md:text-[16px] leading-relaxed max-w-lg">
              Can not find what you are looking for?{' '}
              <a href="#contact" className="text-cf-gold hover:underline underline-offset-4">
                Reach out directly
              </a>{' '}
              — we respond within one business day.
            </p>
          </div>

          {/* Accordion — each item is a glassmorphic card with gold chevron */}
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border overflow-hidden transition-colors duration-240 ease-cinematic ${
                    isOpen
                      ? 'border-cf-glass-border shadow-glow-gold'
                      : 'border-white/[0.06] hover:border-cf-gold/40'
                  }`}
                >
                  <button
                    className="relative w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className={`text-[14.5px] md:text-[15.5px] font-medium leading-snug transition-colors duration-160 ${
                      isOpen ? 'text-cf-gold' : 'text-cf-text group-hover:text-cf-gold'
                    }`}>
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-[18px] h-[18px] shrink-0 text-cf-gold transition-transform duration-240 ease-cinematic ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-[max-height] duration-240 ease-cinematic"
                    style={{ maxHeight: isOpen ? '500px' : '0' }}
                  >
                    <div className="px-5 pb-5 md:px-6 md:pb-6 text-[13.5px] md:text-[14px] text-cf-mist leading-relaxed">
                      {f.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </LazySection>
  );
}
