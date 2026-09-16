'use client';

import { useState } from 'react';
import { ArrowUpRight, Clock, CheckCircle2, BookOpen, RotateCw } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';
import { CURRICULUM } from '@/lib/landing-data';

interface CoursesProps {
  /** Triggered when an "Enroll Now" CTA is clicked (scrolls to contact form). */
  onSelectInterest: (interest: 'account' | 'courses' | 'both', label: string) => void;
}

interface CourseCard {
  key: 'foundation' | 'options' | 'algo';
  index: string;
  level: string;
  title: string;
  desc: string;
  meta: string;
  seats: string;
  batch: string;
  featured?: boolean;
}

const COURSES: CourseCard[] = [
  {
    key: 'foundation',
    index: '01',
    level: 'Foundation',
    title: 'Beginner to Pro: Stock Market Basics',
    desc: 'From your first candlestick to a complete trading plan — the essentials of markets, instruments and risk, taught without jargon or hype.',
    meta: '6 weeks · Live online + Jaipur classroom · Hinglish',
    seats: '4 seats left',
    batch: 'Next batch starts 15th Sept',
  },
  {
    key: 'options',
    index: '02',
    level: 'Advanced',
    title: 'Advanced Options & Derivatives Trading',
    desc: 'Greeks, spreads and position sizing — taught on live markets. Learn to build, adjust and exit option structures with institutional discipline.',
    meta: '8 weeks · Live market-hour sessions · Weekend batch',
    seats: '2 seats left',
    batch: 'Weekend batch starting 20th Sept',
    featured: true,
  },
  {
    key: 'algo',
    index: '03',
    level: 'Professional',
    title: 'Quantitative & Algo Trading Mastery',
    desc: 'Backtest, refine and deploy rule-based strategies with Python and Angel One SmartAPI. No prior coding experience assumed.',
    meta: '10 weeks · Includes live API lab · Cohort of 15',
    seats: '7 seats left',
    batch: 'Next cohort opens October',
  },
];

/**
 * Education & Academy section — Phase 9.5 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md §9.5):
 *   - Bebas Neue section heading + eyebrow with gold hairline
 *   - 3D Y-axis flip cards: hover (desktop) or tap (mobile) flips the card to
 *     reveal the curriculum + outcomes on the back face.
 *   - [perspective:1200px] + [transform-style:preserve-3d] + rotateY(180deg)
 *   - [backface-visibility:hidden] on both faces
 *   - duration-480 ease-cinematic flip; motion-reduce disables the transition
 *   - Front face: level + title + desc + chart cover (options/algo) or tag cloud (foundation)
 *   - Back face: numbered curriculum topics + outcomes + Enroll Now CTA
 *   - Flagship (options) card carries a gold gradient ring + "MOST ENROLLED" badge
 */
export function Courses({ onSelectInterest }: CoursesProps) {
  // Touch / click flip state — a Set of flipped card keys. group-hover handles
  // desktop pointer hover; this handles tap-to-flip on touch devices.
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const toggleFlip = (key: string) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <LazySection>
      <section id="courses" className="sec border-t border-white/[0.06] relative overflow-hidden">
        {/* Ambient emerald glow — the "academy" accent */}
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 w-[520px] h-[520px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
          style={{ background: 'radial-gradient(circle, rgba(53,212,154,0.12), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="wrap relative">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="animate-cf-reveal-up">
              <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
                <span className="block w-6 h-px bg-cf-gold opacity-70" />
                02 · The Academy
              </p>
              <h2 className="font-display font-normal text-[48px] md:text-[72px] lg:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
                Stock market<br className="hidden sm:block" /> education programs
              </h2>
            </div>
            <p className="text-cf-mist text-[13.5px] md:text-[14px] leading-relaxed max-w-md lg:text-right animate-cf-reveal-up [animation-delay:80ms]">
              Small cohorts, live-market sessions, and mentors who trade what they teach.
              Every program includes lifetime access to recordings and our trader community.
            </p>
          </div>

          {/* Flip-card grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
            {COURSES.map((course, i) => {
              const isFlipped = flipped.has(course.key);
              const curr = CURRICULUM[course.key];
              return (
                <div
                  key={course.key}
                  className={`animate-cf-reveal-up [animation-delay:${i * 80}ms] group relative [perspective:1200px] ${course.featured ? 'ring-1 ring-cf-gold/40 rounded-xl' : ''}`}
                >
                  {/* MOST ENROLLED badge (flagship) */}
                  {course.featured && (
                    <span className="absolute -top-3 left-6 z-20 bg-cf-gold-gradient text-cf-bg text-[9.5px] font-bold tracking-[0.18em] px-3 py-1 rounded shadow-glow-gold">
                      MOST ENROLLED
                    </span>
                  )}

                  {/* Flip container — rotates on group-hover OR when isFlipped */}
                  <div
                    className={`relative h-[460px] [transform-style:preserve-3d] transition-transform duration-480 ease-cinematic motion-reduce:transition-none ${isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}
                  >
                    {/* ════ FRONT FACE ════ */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden flex flex-col">
                      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
                      {/* Giant ghost index number — decorative */}
                      <p
                        className="font-display text-[80px] leading-none text-cf-gold/[0.06] absolute top-3 right-4 select-none pointer-events-none"
                        aria-hidden="true"
                      >
                        {course.index}
                      </p>
                      <div className="relative p-6 md:p-7 flex flex-col h-full">
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-cf-mist">{course.level}</p>
                        <h3 className="font-display font-normal text-[28px] md:text-[30px] leading-tight tracking-[-0.01em] mt-3 text-cf-text-strong max-w-[88%]">
                          {course.title}
                        </h3>
                        <p className="text-[13.5px] text-cf-mist leading-relaxed mt-3">{course.desc}</p>

                        {/* Cover visual — differs per course */}
                        <div className="mt-5 flex-1 flex items-center">
                          {course.key === 'foundation' && (
                            <div className="flex flex-wrap gap-2">
                              {['Candlestick reading', 'Risk management', 'Fundamental analysis', 'Trading psychology'].map((tag) => (
                                <span key={tag} className="text-[11px] px-2.5 py-1.5 rounded border border-cf-glass-border text-cf-text bg-cf-glass-glow">{tag}</span>
                              ))}
                            </div>
                          )}
                          {course.key === 'options' && (
                            <svg viewBox="0 0 260 92" className="w-full h-auto" aria-hidden="true">
                              <line x1="14" y1="46" x2="246" y2="46" stroke="rgba(255,255,255,0.14)" strokeDasharray="3 3" />
                              <polyline points="24,14 130,64 236,14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" strokeDasharray="4 3" />
                              <polyline points="24,30 130,80 236,30" fill="none" stroke="#E2B15C" strokeWidth="2" />
                              <text x="14" y="11" fontSize="8.5" fill="rgba(255,255,255,0.4)" fontFamily="monospace">GROSS</text>
                              <text x="246" y="42" fontSize="8.5" fill="#E2B15C" textAnchor="end" fontFamily="monospace">NET OF PREMIUM</text>
                              <text x="130" y="90" fontSize="8" fill="rgba(255,255,255,0.35)" textAnchor="middle" letterSpacing="1" fontFamily="monospace">LONG STRADDLE — PAYOFF AT EXPIRY</text>
                            </svg>
                          )}
                          {course.key === 'algo' && (
                            <div className="w-full">
                              <svg viewBox="0 0 260 80" className="w-full h-auto" aria-hidden="true">
                                <path d="M4,64 L24,56 42,60 60,46 78,50 96,36 112,41 130,28 148,33 166,22 184,27 202,15 220,19 240,9 256,13 256,78 4,78 Z" fill="rgba(53,212,154,0.08)" />
                                <path d="M4,64 L24,56 42,60 60,46 78,50 96,36 112,41 130,28 148,33 166,22 184,27 202,15 220,19 240,9 256,13" fill="none" stroke="#35D49A" strokeWidth="1.8" strokeLinejoin="round" />
                                <text x="4" y="10" fontSize="8" fill="rgba(255,255,255,0.4)" letterSpacing="1" fontFamily="monospace">EQUITY CURVE — SAMPLE BACKTEST</text>
                              </svg>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] tabular-nums text-cf-mist mt-3 font-data">
                                <span>CAGR <span className="text-cf-text-strong">26.4%</span></span>
                                <span>Max DD <span className="text-cf-text-strong">−8.2%</span></span>
                                <span>Trades <span className="text-cf-text-strong">1,240</span></span>
                                <span className="text-cf-text-muted">*illustrative lab results</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer: meta + seats + flip hint */}
                        <div className="relative mt-auto pt-4 border-t border-white/[0.07]">
                          <p className="text-[11.5px] text-cf-mist">{course.meta}</p>
                          <p className="text-[11px] text-cf-gold mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />{course.batch} — <span className="font-semibold">{course.seats}</span>
                          </p>
                          <button
                            onClick={() => toggleFlip(course.key)}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-[12px] font-medium text-cf-mist hover:text-cf-gold transition-colors duration-160 py-2"
                            aria-expanded={isFlipped}
                            aria-label={`Flip card to view curriculum for ${course.title}`}
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Tap to view curriculum
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ════ BACK FACE ════ */}
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-gold/30 shadow-glass overflow-hidden flex flex-col">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
                      <div className="relative p-6 md:p-7 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-cf-gold flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" /> Curriculum &amp; Outcomes
                          </p>
                          <button
                            onClick={() => toggleFlip(course.key)}
                            className="text-cf-mist hover:text-cf-gold transition-colors duration-160"
                            aria-label={`Flip back to course overview for ${course.title}`}
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-display text-[22px] leading-tight text-cf-text-strong mt-2">{curr.weeks} program</p>

                        {/* Numbered topics — scrollable if long */}
                        <div className="mt-3 flex-1 overflow-y-auto max-h-[230px] pr-1 cf-scroll">
                          <ol className="space-y-1.5">
                            {curr.topics.map((t, ti) => (
                              <li key={ti} className="flex gap-2.5 text-[12px] text-cf-text leading-relaxed">
                                <span className="font-data text-[11px] text-cf-gold tabular-nums shrink-0 mt-0.5">{String(ti + 1).padStart(2, '0')}</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Outcomes */}
                        <div className="mt-3 pt-3 border-t border-white/[0.07]">
                          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-cf-gold mb-1.5">By the end, you will:</p>
                          <ul className="space-y-1">
                            {curr.outcomes.map((o, oi) => (
                              <li key={oi} className="flex items-start gap-2 text-[11.5px] text-cf-mist leading-relaxed">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cf-emerald shrink-0 mt-0.5" />
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Enroll CTA */}
                        <button
                          onClick={() => onSelectInterest('courses', course.title)}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[13px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold"
                        >
                          Enroll Now <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
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
