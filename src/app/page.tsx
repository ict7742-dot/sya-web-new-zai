'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type FormEvent, type ReactElement, type CSSProperties } from 'react';
import { ArrowRight, ArrowUp, Mail, Phone, MapPin, Clock, CheckCircle2, Cookie, Star, Quote } from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════════════
   PHASE 13 — FULL MOCKUP REDESIGN (SY Lime design system)
   Complete replacement of the old Cinematic Finance landing page.
   ════════════════════════════════════════════════════════════════════════════ */

// ─── Testimonials data (existing SYA content) ───
const TESTIMONIALS = [
  { name: 'Rohit Sharma', initials: 'RS', role: 'Options Trader · Batch 2024', rating: 5, text: 'The options course completely changed how I approach the markets. Before SYA, I was gambling with naked buys. Now I understand Greeks, position sizing, and risk management. My drawdowns dropped by 60% in the first quarter after the program.' },
  { name: 'Priya Mehta', initials: 'PM', role: 'Demat Client · since 2022', rating: 5, text: 'What I appreciate most is the honesty. No guaranteed-return promises, no pressure to overtrade. My partner at SYA actually told me to hold my mutual funds instead of churning them. That kind of integrity is rare in this industry.' },
  { name: 'Amit Jain', initials: 'AJ', role: 'Algo Student · Batch 2024', rating: 5, text: 'I came in knowing zero Python. Ten weeks later, I had a working mean-reversion strategy backtested on five years of NIFTY data. The API lab sessions were hands-on and the mentors actually trade what they teach.' },
  { name: 'Kavita Joshi', initials: 'KJ', role: 'Beginner Program · Batch 2023', rating: 4, text: 'As a complete beginner, I was nervous about joining. But the cohort size was small, the Hinglish instruction made it easy, and the lifetime access to recordings means I can revisit concepts whenever I need to. Highly recommend for anyone starting out.' },
  { name: 'Vikram Singh', initials: 'VS', role: 'F&O Trader · Demat Client', rating: 5, text: 'The zero brokerage on delivery is great, but what really matters is having someone local who picks up the phone. When the Adani crash happened, my SYA contact called me proactively to discuss my positions. That level of service is worth more than any brokerage savings.' },
  { name: 'Sneha Agarwal', initials: 'SA', role: 'Advanced Options · Batch 2024', rating: 5, text: 'The live market sessions during actual trading hours were a game-changer. Watching the mentor build and adjust an iron condor in real-time, explaining every adjustment — you cannot get that from YouTube videos. Worth every rupee.' },
];

// ─── Course data (existing SYA content + new ICT course) ───
const COURSES = {
  foundations: {
    title: 'Market Foundations',
    level: 'Beginner',
    desc: 'Understand how the Indian markets work, step by step — from your first candlestick to a complete trading plan.',
    cls: 'sy-foundations',
    art: 'bars' as const,
    href: undefined as string | undefined,
    modules: [
      { name: 'Markets, instruments & order types', desc: 'What exchanges are, how orders match, and the difference between equity, F&O and commodities.' },
      { name: 'Reading price, volume & uncertainty', desc: 'Candlestick basics, volume analysis, and why uncertainty is the starting point of every trade.' },
      { name: 'Risk awareness & a trading journal', desc: 'Position sizing, stop-loss discipline, and how to keep a journal that actually improves your process.' },
    ],
  },
  options: {
    title: 'Options & Risk',
    level: 'Intermediate',
    desc: 'Explore payoff structures, the Greeks, and think in probabilities — not predictions.',
    cls: 'sy-options',
    art: 'rings' as const,
    href: undefined as string | undefined,
    modules: [
      { name: 'Calls, puts & payoff diagrams', desc: 'What options are, how payoffs work at expiry, and why buying is not the same as selling.' },
      { name: 'Volatility, Greeks & scenario analysis', desc: 'Delta, gamma, theta, vega — and how to use them to manage risk, not just chase returns.' },
      { name: 'Position sizing & loss scenarios', desc: 'How much to risk per trade, what happens when you are wrong, and how to survive long enough to be right.' },
    ],
  },
  quant: {
    title: 'Quant & Code',
    level: 'Advanced',
    desc: 'Explore data, test models and apply logic to markets — using Python and Angel One SmartAPI.',
    cls: 'sy-quant',
    art: 'cubes' as const,
    href: undefined as string | undefined,
    modules: [
      { name: 'Python, clean data & explicit rules', desc: 'Setting up your environment, sourcing clean data, and writing trading rules that are explicit — not vibes.' },
      { name: 'Backtests, costs & unseen data', desc: 'How to backtest honestly — including trading costs, slippage, and out-of-sample validation.' },
      { name: 'Failure analysis & repeatable research', desc: 'What killed your strategy, why, and how to build a research process that does not repeat the same mistakes.' },
    ],
  },
  ict: {
    title: 'ICT Methodology',
    level: 'Advanced',
    desc: 'Smart Money Concepts — liquidity, order blocks, fair value gaps, killzones, and the OTE entry framework.',
    cls: 'sy-ict',
    art: 'rings' as const,
    href: '/courses/ict',
    modules: [
      { name: 'Market Structure — BOS and CHoCH', desc: 'Read directional bias in 10 seconds by identifying swing structure breaks.' },
      { name: 'Liquidity — Buy-side, Sell-side & Sweeps', desc: 'Where retail stops cluster, why price reaches them, and how to position on the right side of the sweep.' },
      { name: 'Order Blocks, FVGs, Killzones & OTE', desc: 'Institutional footprints, imbalances, time-based trade selection, and the 62-79% entry zone.' },
    ],
  },
} as const;

// ─── FAQ data (existing SYA content) ───
const FAQS = [
  { q: 'How does account opening work?', a: 'Review the broker\u2019s current charges and terms, complete their official KYC process (PAN, Aadhaar, cancelled cheque), then follow the broker\u2019s activation steps. Most accounts are trade-ready within 24 hours. We guide you through each step \u2014 no confusion, no middlemen.' },
  { q: 'What does Systematic Yield help with?', a: 'Guided account support and structured market education. Education and account assistance are separate services \u2014 we do not pool your funds or execute trades on your behalf. Course examples are for learning; real trading decisions are yours.' },
  { q: 'Do I need prior trading experience to join a course?', a: 'Not at all. Our Foundation program is designed for people with zero market knowledge. We start from what a stock exchange is and build up to creating your own trading plan. The only prerequisite is curiosity and a willingness to learn.' },
  { q: 'Are the courses online or in person?', a: 'Both. All programs are conducted live on Zoom during market hours, and we also have a Jaipur classroom option. Every session is recorded with lifetime access \u2014 so you can revisit any lesson, any time.' },
  { q: 'What is the relationship between SYA and Angel One?', a: 'Systematic Yield Analysts Pvt. Ltd. is an Authorized Partner (sub-broker) of Angel One Limited. Your trading account is directly with Angel One, a SEBI-registered stock broker (INZ000161534) and member of NSE, BSE, and MCX. We provide onboarding support and education \u2014 your funds and securities are held directly with Angel One.' },
  { q: 'Do you guarantee returns or provide stock tips?', a: 'Absolutely not. SEBI regulations prohibit guaranteed-return promises. We teach process-based, risk-managed trading. Anyone offering guaranteed returns in the stock market is violating SEBI guidelines \u2014 that is a red flag, not a feature.' },
  { q: 'How can I speak to the Jaipur team?', a: 'Call +91 98290 12345, WhatsApp us, or visit our office at 2nd Floor, Landmark Tower, Tonk Road, Jaipur. We are available Monday\u2013Saturday, 9:30 AM \u2013 6:30 PM IST. Walk-in visits are by appointment \u2014 please call ahead.' },
];

// ─── Candlestick chart data (ported from mockup JS) ───
const CANDLE_SEQUENCE = [95,103,115,107,97,102,84,66,59,43,54,71,91,112,101,82,68,76,62,49,58,40,51,64];

// ════════════════════════════════════════════════════════════════════════════
// MARKET LAB — interactive candlestick + risk + research tabs
// ════════════════════════════════════════════════════════════════════════════
function MarketLab() {
  const [topic, setTopic] = useState<'price' | 'risk' | 'research'>('price');

  // Candlesticks are computed once via useMemo (not useEffect+setState) to avoid
  // the setState-in-effect warning and the hydration mismatch it can cause.
  // The sequence is deterministic (static const), so SSR + client render match.
  const candles = useMemo(() => {
    return CANDLE_SEQUENCE.map((close, i) => {
      const open = i ? CANDLE_SEQUENCE[i - 1] : 108;
      const color = close < open ? '#d1ff62' : '#ccb8ff';
      return { x: 7 + i * 14, open, close, color };
    });
  }, []);

  const captions: Record<string, [string, string]> = {
    price: ['Read the structure.', 'Understand the risk.'],
    risk: ['Position size matters.', 'Illustration excludes fees and slippage.'],
    research: ['Make the process repeatable.', 'A backtest is evidence to examine.'],
  };

  return (
    <section className="sy-lab" aria-label="Interactive learning preview">
      <div className="sy-lab-head">
        <h2>The market lab</h2>
        <span className="sy-demo">DEMO · ILLUSTRATIVE</span>
      </div>
      <div className="sy-lab-tabs" role="group" aria-label="Learning topic">
        <button type="button" aria-pressed={topic === 'price'} onClick={() => setTopic('price')}>Price action</button>
        <button type="button" aria-pressed={topic === 'risk'} onClick={() => setTopic('risk')}>Risk</button>
        <button type="button" aria-pressed={topic === 'research'} onClick={() => setTopic('research')}>Research</button>
      </div>
      <div aria-live="polite">
        {topic === 'price' && (
          <div className="sy-chart-panel sy-changing" data-panel="price">
            <svg className="sy-chart" viewBox="0 0 340 151" preserveAspectRatio="none" role="img" aria-label="Illustrative candlestick sequence showing both rising and falling prices. No real market data.">
              <g className="sy-chart-grid">
                <path d="M0 26H340 M0 76H340 M0 126H340 M34 0V151 M102 0V151 M170 0V151 M238 0V151 M306 0V151" />
              </g>
              <g>
                {candles.map((c, i) => (
                  <g key={i}>
                    <line x1={c.x} x2={c.x} y1={Math.min(c.open, c.close) - 7} y2={Math.max(c.open, c.close) + 8} stroke={c.color} strokeWidth="1.2" />
                    <rect x={c.x - 3.4} y={Math.min(c.open, c.close)} width="6.8" height={Math.max(3, Math.abs(c.open - c.close))} fill={c.color} />
                  </g>
                ))}
              </g>
            </svg>
            <div className="sy-chart-axis"><span>Earlier</span><span>Schematic price sequence</span><span>Later</span></div>
          </div>
        )}
        {topic === 'risk' && (
          <div className="sy-chart-panel sy-risk sy-changing" data-panel="risk">
            <p className="sy-risk-title">Same move. Different exposure.</p>
            <div className="sy-risk-track" role="img" aria-label="Illustration: position B is twice the size of position A.">
              <span style={{ width: '33.333%' }}>A · 1× size</span>
              <span style={{ width: '66.667%' }}>B · 2× size</span>
            </div>
            <div className="sy-risk-key"><span>Same instrument</span><span>Same entry and exit</span></div>
            <p className="sy-small" style={{ marginTop: '24px' }}>Doubling the position doubles the gross profit or loss for the same price change.</p>
          </div>
        )}
        {topic === 'research' && (
          <div className="sy-chart-panel sy-rules sy-changing" data-panel="research">
            <div className="sy-rule"><span>01</span><div>Write the hypothesis<small>Define rules before looking at results.</small></div></div>
            <div className="sy-rule"><span>02</span><div>Test unseen data<small>Include trading costs and losing periods.</small></div></div>
            <div className="sy-rule"><span>03</span><div>Review what can fail<small>Record limitations alongside the findings.</small></div></div>
          </div>
        )}
        <p className="sy-lab-foot"><strong>{captions[topic][0]}</strong> <span>{captions[topic][1]}</span></p>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO — split layout with MarketLab + orbits + lesson card
// ════════════════════════════════════════════════════════════════════════════
function SyHero({ onInterest }: { onInterest: (kind: string, label: string) => void }) {
  return (
    <section className="sy-hero sy-shell" id="home" aria-labelledby="sy-headline">
      <div className="sy-copy">
        <span className="sy-eyebrow">Angel One Authorized Partner · Jaipur</span>
        <h1 id="sy-headline">Build your edge.<br/><em>Understand<br/>the market.</em></h1>
        <p className="sy-intro">Start investing with guided account support. Build your knowledge with structured market education — not tips, not predictions, just a process.</p>
        <div className="sy-hero-actions">
          <button className="sy-action sy-primary" onClick={() => onInterest('account', 'Demat account onboarding')}>
            Open an account <span aria-hidden="true">↗</span>
          </button>
          <a className="sy-action" href="#academy">Explore courses <span aria-hidden="true">→</span></a>
        </div>
        {/* Angel One partnership highlight — logo + trust statement */}
        <div className="sy-hero-partner">
          <img src="/angel-one-logo.svg" alt="Angel One" width="90" height="20" />
          <span>Authorized Partner · SEBI Reg INZ000161534</span>
        </div>
      </div>
      <div className="sy-stage">
        <div className="sy-orbits" aria-hidden="true">
          {[0,12,24,36,48,60,72,84,96,108,120,132,144,156,168].map(turn => (
            <i key={turn} style={{ ['--sy-turn' as string]: `${turn}deg` }} />
          ))}
        </div>
        <MarketLab />
        <button className="sy-lesson" type="button" onClick={() => onInterest('courses', 'Beginner course — Market Foundations')}>
          <span>
            <small>01 / Foundations</small>
            <strong>Your first<br/>market lesson</strong>
          </span>
          <span className="sy-play" aria-hidden="true">▶</span>
        </button>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PATHS — 3-step horizontal strip
// ════════════════════════════════════════════════════════════════════════════
function SyPaths() {
  const paths = [
    { num: '01', title: 'Open your account', desc: 'Paperless e-KYC with Angel One. PAN, Aadhaar, cancelled cheque — 15 minutes over a call.' },
    { num: '02', title: 'Learn the fundamentals', desc: 'Start with Market Foundations. No jargon, no hype — just how markets actually work.' },
    { num: '03', title: 'Build your process', desc: 'Risk management, position sizing, journaling. The discipline that survives bear markets.' },
  ];
  return (
    <section className="sy-paths sy-shell" aria-label="How it works">
      {paths.map((p) => (
        <div className="sy-path" key={p.num}>
          <span>{p.num}</span>
          <div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACADEMY — 4 course cards + expandable outline (cream section)
// ════════════════════════════════════════════════════════════════════════════
function SyAcademy({ onInterest }: { onInterest: (kind: string, label: string) => void }) {
  const [expanded, setExpanded] = useState<keyof typeof COURSES | null>(null);

  const courseArt: Record<string, ReactElement> = {
    bars: (
      <div className="sy-course-art sy-bars" aria-hidden="true"><i></i><i></i><i></i></div>
    ),
    rings: (
      <div className="sy-course-art sy-rings" aria-hidden="true"><i></i><i></i></div>
    ),
    cubes: (
      <div className="sy-course-art sy-cubes" aria-hidden="true"><i></i><i></i><i></i></div>
    ),
  };

  return (
    <section className="sy-academy sy-shell" id="academy" aria-labelledby="sy-academy-title">
      <div className="sy-section-head">
        <h2 id="sy-academy-title">Knowledge is your<br/>first investment.</h2>
        <p>From your first market lesson to systematic thinking. Choose where to begin.</p>
      </div>
      <div className="sy-course-grid sy-course-grid-4">
        {(Object.keys(COURSES) as Array<keyof typeof COURSES>).map((key) => {
          const c = COURSES[key];
          const isExpanded = expanded === key;
          return (
            <article className={`sy-course ${c.cls}`} key={key}>
              <span className="sy-level">{c.level}</span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              {courseArt[c.art]}
              <button
                className="sy-course-toggle"
                type="button"
                aria-expanded={isExpanded}
                aria-controls="sy-course-outline"
                onClick={() => setExpanded(isExpanded ? null : key)}
              >
                View course <span aria-hidden="true">↗</span>
              </button>
            </article>
          );
        })}
      </div>
      {expanded && (
        <div className="sy-outline" id="sy-course-outline" role="region" aria-label="Course preview">
          <span className="sy-level">Course outline preview</span>
          <h3>{COURSES[expanded].title}</h3>
          <ol>
            {COURSES[expanded].modules.map((m, i) => (
              <li key={i}>
                <span>MODULE 0{i + 1}</span>
                {m.name}
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="sy-dismiss" type="button" onClick={() => setExpanded(null)}>Close outline</button>
            {COURSES[expanded].href && (
              <a className="sy-action sy-primary" href={COURSES[expanded].href} style={{ textDecoration: 'none' }}>
                View full course <ArrowRight className="w-4 h-4" />
              </a>
            )}
            <button className="sy-action" onClick={() => onInterest('courses', `${COURSES[expanded].title} course enrollment`)}>
              Enquire about this course
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK — adds the "alive" feel via IntersectionObserver
// Elements with data-reveal attribute fade+slide in when scrolled into view.
// Respects prefers-reduced-motion (instant show, no transform).
// ════════════════════════════════════════════════════════════════════════════
function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (reduced) {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sy-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS — reviews from existing SYA students/clients
// ════════════════════════════════════════════════════════════════════════════
function SyTestimonials() {
  return (
    <section className="sy-shell" id="reviews" aria-labelledby="sy-reviews-title" style={{ paddingBlock: '80px 64px', background: 'var(--sy-bg)' }}>
      <div data-reveal>
        <span className="sy-eyebrow">Student &amp; client reviews</span>
        <h2 id="sy-reviews-title" style={{ fontSize: 'clamp(30px, 4cqw, 48px)', fontWeight: 500, letterSpacing: '-1.4px', lineHeight: 1.12, maxWidth: '520px', margin: '8px 0 12px' }}>
          What our traders <em style={{ fontStyle: 'normal', color: 'var(--sy-lime)' }}>actually say.</em>
        </h2>
        <p style={{ color: 'var(--sy-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '480px' }}>
          Real feedback from real students. No paid reviews, no incentives — just honest accounts of their experience with SYA.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
        {TESTIMONIALS.map((t, i) => (
          <article
            key={i}
            data-reveal
            style={{
              '--delay': `${i * 80}ms`,
              position: 'relative',
              background: 'var(--sy-panel)',
              border: '1px solid var(--sy-line)',
              borderRadius: '13px',
              padding: '24px',
            } as CSSProperties}
          >
            {/* Quote icon */}
            <Quote style={{ position: 'absolute', top: '20px', right: '20px', width: '28px', height: '28px', color: 'var(--sy-lime)', opacity: 0.2 }} />
            {/* Star rating */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  style={{
                    width: '14px', height: '14px',
                    fill: s < t.rating ? 'var(--sy-lime)' : 'transparent',
                    color: s < t.rating ? 'var(--sy-lime)' : 'var(--sy-line)',
                  }}
                />
              ))}
            </div>
            {/* Review text */}
            <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: '#d4dcd4', marginBottom: '18px' }}>
              &ldquo;{t.text}&rdquo;
            </p>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--sy-line)' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--sy-lime)', color: 'var(--sy-ink)', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                {t.initials}
              </span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sy-text)' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--sy-muted)', marginTop: '2px' }}>{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INFO — FAQ + About + Contact merged into accordions (dark section)
// ════════════════════════════════════════════════════════════════════════════
function SyInfo() {
  return (
    <section className="sy-info sy-shell" id="info" aria-labelledby="sy-info-title">
      <div className="sy-info-grid">
        <div>
          <span className="sy-eyebrow">A clear next step</span>
          <h2 id="sy-info-title">Start with clarity.<br/><em>Ask us anything.</em></h2>
          <p>Understand the account process and find the right starting point for your learning. No pressure, no spam — just answers.</p>
        </div>
        <div>
          {FAQS.map((f, i) => (
            <details key={i}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTACT FORM — restyled to match mockup aesthetic
// ════════════════════════════════════════════════════════════════════════════
function SyContactForm({ interest, onToast }: { interest: { kind: string; nonce: number }; onToast: (msg: string, ok?: boolean) => void }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectFlash, setSelectFlash] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const fNameRef = useRef<HTMLInputElement>(null);
  const fPhoneRef = useRef<HTMLInputElement>(null);
  const fEmailRef = useRef<HTMLInputElement>(null);
  const fInterestRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!interest.kind || !interest.nonce) return;
    if (fInterestRef.current) {
      fInterestRef.current.value = interest.kind;
      setSelectFlash(true);
      const t = setTimeout(() => setSelectFlash(false), 2200);
      const ft = setTimeout(() => fNameRef.current?.focus({ preventScroll: true }), 700);
      return () => { clearTimeout(t); clearTimeout(ft); };
    }
  }, [interest.kind, interest.nonce]);

  const setErr = (field: string, msg: string | null) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg; else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = fNameRef.current?.value || '';
    const phone = fPhoneRef.current?.value || '';
    const email = fEmailRef.current?.value || '';
    const interestVal = fInterestRef.current?.value || '';

    let ok = true;
    if (name.trim().length < 3) { setErr('name', 'Please enter your full name.'); ok = false; } else setErr('name', null);
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || !/^[6-9]\d{9}$/.test(digits.slice(-10))) { setErr('phone', 'Enter a valid 10-digit Indian mobile number.'); ok = false; } else setErr('phone', null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr('email', 'Enter a valid email address.'); ok = false; } else setErr('email', null);
    if (!interestVal) { setErr('interest', 'Please choose an option.'); ok = false; } else setErr('interest', null);

    if (!ok) { onToast('Please fix the highlighted fields.', false); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone, email: email.trim(), interest: interestVal,
          message: (document.getElementById('fMsg') as HTMLTextAreaElement | null)?.value || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) { onToast(data.error || 'Something went wrong.', false); setSubmitting(false); return; }
      setSubmitterName(data.firstName);
      setFormSubmitted(true);
      onToast('Inquiry received — we usually respond within a few hours.');
      if (data.ekycUrl) setTimeout(() => window.open(data.ekycUrl, '_blank', 'noopener,noreferrer'), 1200);
    } catch {
      onToast('Network error — please try again.', false);
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: 'connect@systematicyield.in', href: 'mailto:connect@systematicyield.in' },
    { icon: Phone, label: 'Phone', value: '+91 98290 12345', href: 'tel:+919829012345' },
    { icon: MapPin, label: 'Office', value: '2nd Floor, Landmark Tower, Tonk Road, Jaipur, Rajasthan 302015', href: null },
    { icon: Clock, label: 'Hours', value: 'Monday – Saturday · 9:30 AM – 6:30 PM IST', href: null },
  ];

  return (
    <section className="sy-info sy-shell" id="contact" aria-labelledby="sy-contact-title">
      <div className="sy-info-grid">
        <div>
          <span className="sy-eyebrow">Get in touch</span>
          <h2 id="sy-contact-title">Talk to a human,<br/><em>not a helpline.</em></h2>
          <p>Whether you are opening your first demat account or joining the next cohort — write, call, or walk in. We typically respond within one business day.</p>
          <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
            {contactItems.map((item) => (
              <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '12px' }}>
                <item.icon style={{ width: '16px', height: '16px', color: 'var(--sy-lime)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ color: '#ecf3e8' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {!formSubmitted ? (
            <form ref={formRef} onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="fName" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input ref={fNameRef} id="fName" type="text" placeholder="e.g. Rohan Sharma" autoComplete="name"
                    style={{ width: '100%', background: 'var(--sy-panel)', border: `1px solid ${formErrors.name ? '#f0555f' : 'var(--sy-line)'}`, borderRadius: '8px', padding: '11px 14px', color: 'var(--sy-text)', fontSize: '13px', outline: 'none' }}
                    onInput={() => setErr('name', null)} />
                  {formErrors.name && <p style={{ fontSize: '11px', color: '#f0555f', marginTop: '4px' }}>{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="fPhone" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', display: 'block', marginBottom: '6px' }}>Phone *</label>
                  <input ref={fPhoneRef} id="fPhone" type="tel" inputMode="tel" placeholder="10-digit mobile" autoComplete="tel"
                    style={{ width: '100%', background: 'var(--sy-panel)', border: `1px solid ${formErrors.phone ? '#f0555f' : 'var(--sy-line)'}`, borderRadius: '8px', padding: '11px 14px', color: 'var(--sy-text)', fontSize: '13px', outline: 'none' }}
                    onInput={() => setErr('phone', null)} />
                  {formErrors.phone && <p style={{ fontSize: '11px', color: '#f0555f', marginTop: '4px' }}>{formErrors.phone}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="fEmail" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', display: 'block', marginBottom: '6px' }}>Email *</label>
                <input ref={fEmailRef} id="fEmail" type="email" placeholder="you@example.com" autoComplete="email"
                  style={{ width: '100%', background: 'var(--sy-panel)', border: `1px solid ${formErrors.email ? '#f0555f' : 'var(--sy-line)'}`, borderRadius: '8px', padding: '11px 14px', color: 'var(--sy-text)', fontSize: '13px', outline: 'none' }}
                  onInput={() => setErr('email', null)} />
                {formErrors.email && <p style={{ fontSize: '11px', color: '#f0555f', marginTop: '4px' }}>{formErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="fInterest" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', display: 'block', marginBottom: '6px' }}>Interested In *</label>
                <select ref={fInterestRef} id="fInterest" defaultValue=""
                  style={{ width: '100%', background: 'var(--sy-panel)', border: `1px solid ${formErrors.interest ? '#f0555f' : selectFlash ? 'var(--sy-lime)' : 'var(--sy-line)'}`, borderRadius: '8px', padding: '11px 14px', color: 'var(--sy-text)', fontSize: '13px', outline: 'none', appearance: 'none' }}
                  onChange={() => setErr('interest', null)}>
                  <option value="" disabled>Select an option</option>
                  <option value="account">Opening a Demat & Trading Account</option>
                  <option value="courses">Stock Market Education Programs</option>
                  <option value="both">Both — Account + Courses</option>
                </select>
                {formErrors.interest && <p style={{ fontSize: '11px', color: '#f0555f', marginTop: '4px' }}>{formErrors.interest}</p>}
              </div>
              <div>
                <label htmlFor="fMsg" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--sy-muted)', display: 'block', marginBottom: '6px' }}>Message <span style={{ textTransform: 'none', letterSpacing: '0', color: 'var(--sy-muted)' }}>(optional)</span></label>
                <textarea id="fMsg" rows={3} placeholder="Anything specific you would like to ask?"
                  style={{ width: '100%', background: 'var(--sy-panel)', border: '1px solid var(--sy-line)', borderRadius: '8px', padding: '11px 14px', color: 'var(--sy-text)', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--sy-muted)' }}>By submitting, you authorize Systematic Yield Analysts to contact you via call, WhatsApp or email regarding our services. We never share your details with third parties.</p>
              <button type="submit" disabled={submitting} className="sy-action sy-primary" style={{ justifyContent: 'center' }}>
                {submitting ? 'Submitting…' : 'Submit Inquiry'} {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ display: 'inline-grid', placeItems: 'center', width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(53, 212, 154, 0.4)', background: 'rgba(53, 212, 154, 0.1)', color: '#35d49a', marginBottom: '16px' }}>
                <CheckCircle2 style={{ width: '28px', height: '28px' }} />
              </span>
              <h3 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--sy-text)' }}>Inquiry received.</h3>
              <p style={{ fontSize: '13px', color: 'var(--sy-muted)', marginTop: '10px', lineHeight: 1.6 }}>
                Thank you, <span style={{ color: 'var(--sy-text)' }}>{submitterName}</span>. Our team will reach out within one business day.
              </p>
              <button onClick={() => { formRef.current?.reset(); setFormSubmitted(false); }} className="sy-action" style={{ marginTop: '20px' }}>
                Submit another inquiry
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HEADER — mockup-style header with SY monogram + nav + CTA + mobile menu
// ════════════════════════════════════════════════════════════════════════════
function SyHeader({ onInterest }: { onInterest: (kind: string, label: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'academy', label: 'Academy' },
    { id: 'info', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <header className="sy-header sy-shell" style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(16, 21, 17, 0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
      <a className="sy-brand" onClick={() => scrollTo('home')}>
        <span className="sy-monogram">SY</span>
        Systematic Yield
      </a>
      <nav className={`sy-nav ${menuOpen ? 'sy-open' : ''}`} aria-label="Main navigation">
        {navLinks.map((l) => (
          <a key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</a>
        ))}
      </nav>
      {/* Angel One Authorized Partner badge — highlights the partnership */}
      <a
        href="https://angelone.in/?ref=systematicyield"
        target="_blank"
        rel="noopener noreferrer"
        className="sy-angel-badge"
        title="Systematic Yield Analysts is an Authorized Partner of Angel One Limited (SEBI Reg INZ000161534)"
        aria-label="Angel One Authorized Partner"
      >
        <img src="/angel-one-logo.svg" alt="" width="80" height="18" style={{ display: 'block' }} />
        <span className="sy-angel-badge-text">Authorized Partner</span>
      </a>
      <button className="sy-action sy-primary" onClick={() => onInterest('account', 'Demat account onboarding')}>
        Open an account <span aria-hidden="true">↗</span>
      </button>
      <button className="sy-menu" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? 'Close' : 'Menu'}
      </button>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FOOTER — expanded with SEBI disclosures + risk warnings
// ════════════════════════════════════════════════════════════════════════════
function SyFooter() {
  return (
    <footer className="sy-shell" style={{ background: 'var(--sy-bg)', borderTop: '1px solid var(--sy-line)', paddingTop: '48px', paddingBottom: '32px' }}>
      {/* Top: brand + links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="sy-monogram" style={{ width: '32px', height: '32px', fontSize: '18px' }}>SY</span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Systematic Yield</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--sy-muted)', lineHeight: 1.6, maxWidth: '280px', marginBottom: '16px' }}>
            Angel One Authorized Partner &amp; stock market education academy. Jaipur, Rajasthan.
          </p>
          {/* Angel One logo in footer */}
          <a href="https://angelone.in/?ref=systematicyield" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid rgba(244, 99, 30, 0.3)', borderRadius: '8px', background: 'rgba(244, 99, 30, 0.06)', textDecoration: 'none' }}>
            <img src="/angel-one-logo.svg" alt="Angel One" width="70" height="16" />
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f4a371', borderLeft: '1px solid rgba(244, 99, 30, 0.25)', paddingLeft: '8px' }}>Authorized Partner</span>
          </a>
        </div>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--sy-lime)', marginBottom: '14px', fontWeight: 600 }}>Quick links</div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
            <a href="#home" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>Home</a>
            <a href="#academy" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>Academy</a>
            <a href="#reviews" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>Reviews</a>
            <a href="#info" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>FAQ</a>
            <a href="#contact" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>Contact</a>
            <a href="/blog" style={{ color: 'var(--sy-muted)', textDecoration: 'none' }}>Blog</a>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--sy-lime)', marginBottom: '14px', fontWeight: 600 }}>Contact</div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '12px', color: 'var(--sy-muted)' }}>
            <span>connect@systematicyield.in</span>
            <span>+91 98290 12345</span>
            <span>2nd Floor, Landmark Tower,<br/>Tonk Road, Jaipur 302015</span>
            <span>Mon–Sat · 9:30 AM – 6:30 PM IST</span>
          </div>
        </div>
      </div>

      {/* SEBI warnings block */}
      <div style={{ borderTop: '1px solid var(--sy-line)', paddingTop: '24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--sy-purple)', marginBottom: '12px', fontWeight: 600 }}>
          ⚠ SEBI Risk Disclosures
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--sy-muted)', lineHeight: 1.7, maxWidth: '900px', display: 'grid', gap: '10px' }}>
          <p>
            <strong style={{ color: '#d4dcd4' }}>Investments in the securities market are subject to market risks.</strong> Read all the related documents carefully before investing. The content on this website is for educational purposes only and does not constitute investment advice, recommendations, or solicitations to buy or sell any security.
          </p>
          <p>
            Systematic Yield Analysts Pvt. Ltd. is an Authorized Partner (sub-broker) of Angel One Limited, a SEBI-registered stock broker (Registration No: INZ000161534), member of NSE, BSE, and MCX. Your trading account is directly with Angel One — all client funds and securities are held in segregated accounts as mandated by SEBI.
          </p>
          <p>
            <strong style={{ color: '#d4dcd4' }}>Disclaimer:</strong> Trading in F&amp;O, intraday equity, and commodities involves substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results. SEBI regulations prohibit guaranteed-return promises — anyone offering guaranteed returns is violating SEBI guidelines. We teach process-based, risk-managed trading, not stock tips or signal services.
          </p>
          <p>
            For investor grievances, contact Angel One at 1800-xxx-xxxx or visit <span style={{ color: 'var(--sy-lime)' }}>scores.sebi.gov.in</span>. For SMART ODR (Online Dispute Resolution), visit <span style={{ color: 'var(--sy-lime)' }}>smartodr.io</span>.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sy-footer" style={{ borderTop: '1px solid var(--sy-line)', paddingTop: '20px', marginTop: 0, marginBottom: 0 }}>
        <span>Systematic Yield · Jaipur</span>
        <span>Angel One Authorized Partner · SEBI Reg INZ000161534</span>
        <span>Education does not guarantee investment outcomes.</span>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — assembles all sections + functional floating elements
// ════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [interest, setInterest] = useState<{ kind: string; nonce: number }>({ kind: '', nonce: 0 });
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'declined' | null>(null);

  // Scroll reveal animations — adds the "alive" feel
  useScrollReveal();

  const handleInterest = useCallback((kind: string, _label: string) => {
    setInterest({ kind, nonce: Date.now() });
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const addToast = useCallback((msg: string, ok: boolean = true) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cookie consent: read from localStorage on mount. Using useEffect (not
  // useState initializer) avoids hydration mismatch — server renders null
  // (banner visible), client matches on first render, THEN effect runs and
  // hides the banner if previously consented. The eslint warning about
  // setState-in-effect is acceptable here: this is the canonical pattern
  // for reading client-only storage after hydration.
  useEffect(() => {
    const stored = localStorage.getItem('sya-cookie-consent');
    if (stored === 'accepted' || stored === 'declined') {
      setCookieConsent(stored);
    }
  }, []);

  const handleCookie = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('sya-cookie-consent', choice);
    setCookieConsent(choice);
  };

  return (
    <div className="sy-concept" style={{ minHeight: '100vh' }}>
      <SyHeader onInterest={handleInterest} />
      <main>
        <SyHero onInterest={handleInterest} />
        <SyPaths />
        <SyAcademy onInterest={handleInterest} />
        <SyTestimonials />
        <SyInfo />
        <SyContactForm interest={interest} onToast={addToast} />
      </main>
      <SyFooter />

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '24px', right: '20px', zIndex: 90, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.ok ? 'rgba(20, 32, 25, 0.95)' : 'rgba(50, 20, 25, 0.95)',
            border: `1px solid ${t.ok ? 'rgba(209, 255, 98, 0.3)' : 'rgba(240, 85, 95, 0.3)'}`,
            borderRadius: '8px', padding: '12px 16px', color: '#f4f5ee', fontSize: '13px',
            backdropFilter: 'blur(12px)', maxWidth: '340px', animation: 'sy-content-in 0.24s ease-out',
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '24px', left: '20px', zIndex: 80,
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--sy-lime)', color: 'var(--sy-ink)', border: 'none',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(209, 255, 98, 0.3)',
          }}
          aria-label="Back to top"
        >
          <ArrowUp style={{ width: '20px', height: '20px' }} />
        </button>
      )}

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919829012345?text=Hi%20SYA%20team%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services."
        target="_blank" rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '24px', right: '20px', zIndex: 80,
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#25D366', color: '#fff', display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)', textDecoration: 'none',
        }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: 'currentColor' }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

      {/* Cookie consent banner */}
      {cookieConsent === null && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 85,
          background: 'var(--sy-panel)', borderTop: '1px solid var(--sy-line)',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
          flexWrap: 'wrap', fontSize: '12px', color: 'var(--sy-muted)',
        }}>
          <Cookie style={{ width: '20px', height: '20px', color: 'var(--sy-lime)', flexShrink: 0 }} />
          <p style={{ flex: 1, minWidth: '200px' }}>
            We use essential browser storage (localStorage) to save your form progress and preferences. No third-party tracking cookies are active.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="sy-action" onClick={() => handleCookie('declined')} style={{ fontSize: '12px', padding: '8px 14px', minHeight: '36px' }}>Decline</button>
            <button className="sy-action sy-primary" onClick={() => handleCookie('accepted')} style={{ fontSize: '12px', padding: '8px 14px', minHeight: '36px' }}>Accept</button>
          </div>
        </div>
      )}
    </div>
  );
}
