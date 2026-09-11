'use client';

import { Star } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';
import { TESTIMONIALS } from '@/lib/landing-data';

/**
 * Testimonials section — Phase 9.7 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Bebas Neue display heading
 *   - Glassmorphic testimonial cards with gold star ratings
 *   - Horizontal drag-to-swipe carousel on mobile (CSS scroll-snap)
 *   - 3-card grid on desktop (no carousel)
 *   - 80ms staggered reveal on initial paint
 *
 * NOTE on testimonials authenticity (docs/PLACEHOLDER_INVENTORY.md §5):
 * the TESTIMONIALS array in landing-data.ts contains invented reviews
 * attributed to invented people. The partner MUST replace these with
 * real, consented testimonials OR remove this section entirely before
 * going to production. The component renders whatever is in TESTIMONIALS.
 */
export function Testimonials() {
  return (
    <LazySection>
      <section id="testimonials" className="sec border-t border-white/[0.06] bg-cf-bg-elevated">
        <div className="wrap">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-cf-reveal-up">
            <div>
              <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
                <span className="block w-6 h-px bg-cf-gold opacity-70" />
                04 · Student and Client Reviews
              </p>
              <h2 className="font-display font-normal text-[56px] md:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
                What Our Traders Say
              </h2>
            </div>
            <p className="text-[13.5px] text-cf-mist leading-relaxed max-w-md lg:text-right">
              Real feedback from real people — no fake reviews, no incentivized ratings.
              These are unprompted messages we have received over the years.
            </p>
          </div>

          {/* Mobile: horizontal scroll-snap carousel. Desktop: 3-col grid. */}
          <div className="mt-12 grid gap-5 lg:grid-cols-3 testimonial-scroll">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] group relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-white/[0.06] hover:border-cf-gold/40 shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1`}
              >
                {/* Inner gold glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />
                <div className="relative p-6 md:p-7 flex flex-col h-full">
                  {/* Star rating — gold filled stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[0, 1, 2, 3, 4].map((si) => (
                      <Star
                        key={si}
                        className="w-[14px] h-[14px]"
                        style={{
                          fill: si < t.rating ? '#E2B15C' : 'rgba(255,255,255,0.15)',
                          color: si < t.rating ? '#E2B15C' : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="flex-1">
                    <p className="text-[13.5px] text-cf-text leading-relaxed">{t.text}</p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/[0.08]">
                    <div className="w-10 h-10 rounded-full bg-cf-gold/10 border border-cf-gold/30 flex items-center justify-center text-cf-gold text-[12px] font-semibold font-data">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-cf-text-strong">{t.name}</p>
                      <p className="text-[11.5px] text-cf-mist mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LazySection>
  );
}
