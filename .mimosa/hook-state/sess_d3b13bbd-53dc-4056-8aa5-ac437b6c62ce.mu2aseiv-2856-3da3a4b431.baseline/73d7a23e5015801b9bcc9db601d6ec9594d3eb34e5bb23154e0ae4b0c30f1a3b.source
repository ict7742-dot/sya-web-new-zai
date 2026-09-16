'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  ArrowUp,
  Zap,
  CheckCircle2,
  X,
  Menu,
  Cookie,
} from 'lucide-react';
import { SearchTrigger } from '@/components/search-trigger';
import { LazySection } from '@/components/landing/lazy-section';
import { ToastItem } from '@/components/landing/toast-item';
import { FAQ } from '@/components/landing/sections/FAQ';
import { Footer } from '@/components/landing/sections/Footer';
import { HowItWorks } from '@/components/landing/sections/HowItWorks';
import { TrustStrip } from '@/components/landing/sections/TrustStrip';
import { Testimonials } from '@/components/landing/sections/Testimonials';
import { TickerBar } from '@/components/landing/sections/TickerBar';
import { Hero } from '@/components/landing/sections/Hero';
import { BrokingServices } from '@/components/landing/sections/BrokingServices';
import { Courses } from '@/components/landing/sections/Courses';
import { BlogPreview } from '@/components/landing/sections/BlogPreview';
import { ContactForm } from '@/components/landing/sections/ContactForm';
import { StickyCTA } from '@/components/landing/sections/StickyCTA';
import {
  clearAbandonment,
  // captureUtm/getStoredUtm/saveAbandonment/loadAbandonment + SYMBOLS +
  // CURRICULUM + UtmData/Candle/SymbolData/SeriesData types ALL moved into
  // their section components (Hero/Courses/ContactForm/TickerBar — Phases
  // 9.1/9.2/9.5/9.10). TESTIMONIALS lives in Testimonials.tsx now.
  SOCIAL_PROOFS,
  LEGAL,
} from '@/lib/landing-data';

export default function HomePage() {
  /* ── State ── */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  // Chart state (activeSym, seriesMap, flashClass, volJitter) moved into
  // the Hero section component (Phase 9.1 extraction).
  // Form state (formSubmitted, submitterName, submitting, submittedInterest,
  // formErrors, selectFlash) + all form refs + handlers moved into the
  // ContactForm section component (Phase 9.10 extraction). The parent now
  // drives the form via an `interest` trigger object (kind + nonce) so repeat
  // clicks on the same CTA still re-fire the focus/select effect.
  const [interestTrigger, setInterestTrigger] = useState<{ kind: string; nonce: number }>({ kind: '', nonce: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState('privacy');
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  /* ── Refs ── */
  // Chart refs + form refs (formRef, fNameRef, fPhoneRef, fEmailRef,
  // fInterestRef) + mobileMenuRef ALL moved/removed into their section
  // components (Phase 9.1 / 9.10). The mobile menu now animates via CSS
  // max-h classes — no ref needed.
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const toastId = useRef(0);
  // spIndex starts at 0 (deterministic — avoids calling Math.random() during
  // render, which the react-compiler lint rule forbids). The random start
  // offset is applied inside the social-proof effect below.
  const spIndex = useRef(0);
  const [socialProof, setSocialProof] = useState<{ name: string; loc: string; action: string; mins: number } | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const exitShown = useRef(false);
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'declined' | null>(null);
  // openCurriculum state moved into the Courses section component (Phase 9.5
  // extraction — the flip cards own their own flip state).
  // utmRef + captureUtm() effect moved into the ContactForm section component
  // (Phase 9.10 — UTM is only consumed by the lead submit handler).
  // blogPosts state + /api/blogs?limit=3 fetch effect moved into the
  // BlogPreview section component (Phase 9.9 extraction).

  // Chart helpers + derived values + render-chart/live-tick/VOL-jitter effects
  // ALL moved into the Hero section component (Phase 9.1 extraction).


  /* ── Social proof notifications ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    // Randomize the starting index INSIDE the effect (not during render).
    spIndex.current = Math.floor(Math.random() * SOCIAL_PROOFS.length);
    // Show first one after 8s, then every 25-40s
    const delay = 8000;
    const show = () => {
      const item = SOCIAL_PROOFS[spIndex.current % SOCIAL_PROOFS.length];
      spIndex.current++;
      setSocialProof(item);
      setTimeout(() => setSocialProof(null), 5000);
    };
    const t1 = setTimeout(show, delay);
    const iv = setInterval(show, 25000 + Math.random() * 15000);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  /* ── Exit-intent detection (desktop only) ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current && !modalOpen) {
        exitShown.current = true;
        setExitOpen(true);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [modalOpen]);

  /* ── Mobile menu height — handled via CSS max-h classes (no ref read /
     setState-in-effect needed). The menu animates between max-h-0 and
     max-h-[80vh] on toggle. */

  /* ── Header scroll + progress + back-to-top + mobile CTA ── */
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setHeaderScrolled(y > 8);
      setShowBackToTop(y > 600);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min(1, y / docH) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Scroll spy ── */
  useEffect(() => {
    const ids = ['home', 'demat', 'courses', 'howitworks', 'testimonials', 'faq', 'about', 'blog', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Reveal on scroll ── */
  useEffect(() => {
    if (reducedMotion.current) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Counter animation ──
     Phase 9.3: moved into the TrustStrip section component (it has its own
     IntersectionObserver scoped to its own [data-count] elements). This
     global observer is no longer needed — there are no other [data-count]
     elements on the page outside TrustStrip. */

  /* ── UTM capture on mount ──
     Moved into the ContactForm section component (Phase 9.10 — UTM is only
     consumed by the lead submit handler, which also moved there). */

  /* ── Cookie consent check ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sya_cookie_consent');
      if (stored === 'accepted' || stored === 'declined') setCookieConsent(stored);
    } catch { /* ignore */ }
  }, []);

  const handleCookieConsent = useCallback((choice: 'accepted' | 'declined') => {
    setCookieConsent(choice);
    try { localStorage.setItem('sya_cookie_consent', choice); } catch { /* ignore */ }
    // PRIVACY: when the user declines, purge any partial-form PII that may
    // have been saved during a previous accepted-consent session. This
    // makes the decline action immediate — not "we'll stop saving new
    // data, but the old data lingers". `saveAbandonment` also refuses to
    // write while consent is declined, so the two stay in sync.
    if (choice === 'declined') clearAbandonment();
  }, []);

  /* ── Form abandonment tracking (restore + trackFormInput + beforeunload) ──
     ALL moved into the ContactForm section component (Phase 9.10 — these
     handlers reference the form refs that now live there). */

  /* ── Ticker price flicker ──
     Phase 9.2: moved into the TickerBar section component. */

  // VOL readout jitter effect moved into Hero (Phase 9.1 extraction).

  /* ── Escape key for modal ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) setModalOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalOpen]);

  /* ── Modal focus trap ── */
  useEffect(() => {
    if (!modalOpen) return;
    const modal = document.getElementById('modal');
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [modalOpen]);

  /* ── Toast helper ── */
  const addToast = useCallback((msg: string, ok = true) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, ok }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  /* ── CTA handler ── */
  const handleInterest = useCallback(
    (kind: string, label: string) => {
      // Set the interest trigger (kind + nonce) — ContactForm owns the select
      // ref + focus-ring flash now; it reacts to this prop change and focuses
      // the name field after the smooth-scroll settles.
      setInterestTrigger({ kind, nonce: Date.now() });
      setMobileOpen(false);
      document
        .getElementById('contact')
        ?.scrollIntoView({ behavior: reducedMotion.current ? 'auto' : 'smooth' });
      if (label)
        addToast(
          `Noted — "${label}". Share your details and we'll take it from here.`
        );
    },
    [addToast]
  );

  // Form validation (setErr) + submit handler (handleSubmit) + resetForm moved
  // into the ContactForm section component (Phase 9.10 extraction).

  // Chart-derived values (chg, pct, up, sma, above) moved into Hero (Phase 9.1).

  const navLinks = ['home', 'demat', 'courses', 'howitworks', 'testimonials', 'faq', 'about', 'blog', 'contact'];
  const navLabels: Record<string, string> = {
    home: 'Home',
    demat: 'Open Demat',
    courses: 'Courses',
    howitworks: 'How It Works',
    testimonials: 'Reviews',
    faq: 'FAQ',
    about: 'About',
    blog: 'Insights',
    contact: 'Contact',
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* ══════════ ACCESSIBILITY ══════════ */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} role="progressbar" aria-valuenow={Math.round(scrollProgress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Page scroll progress" />

      {/* ══════════ LIVE INDEX TICKER ══════════
          Phase 9.2: extracted to src/components/landing/sections/TickerBar.tsx
          (glassmorphic strip + JetBrains Mono prices + emerald/crimson change
          indicators + flash-on-price-change animation). */}
      <TickerBar />

      {/* ══════════ STICKY NAV ══════════ */}
      <header
        id="siteHeader"
        className={`sticky top-0 z-50 transition-all duration-240 ease-cinematic ${headerScrolled ? 'bg-cf-bg-elevated/85 backdrop-blur-glass backdrop-saturate-glass border-b border-cf-glass-border shadow-glass' : 'bg-cf-bg/40 backdrop-blur-md border-b border-transparent'}`}
      >
        <nav
          className="wrap h-[70px] flex items-center justify-between gap-6"
          aria-label="Main navigation"
        >
          <a href="#home" className="flex items-center gap-3 shrink-0">
            <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
              <rect
                x="1.25" y="1.25" width="29.5" height="29.5" rx="7"
                fill="none" stroke="#E2B15C" strokeWidth="1.4" opacity=".8"
              />
              <path
                d="M8 22 L13 16 L17 19 L24 10" stroke="#fff"
                strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
            </svg>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">
                Systematic Yield
              </span>
              <span className="block text-[9px] font-medium tracking-[0.24em] text-cf-mist uppercase">
                Analysts · Angel One Partner
              </span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium">
            {navLinks.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`nav-link dl ${activeSection === id ? 'active' : ''}`}
              >
                {navLabels[id]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SearchTrigger className="hidden sm:inline-flex" />
            <button
              onClick={() => handleInterest('account', 'Demat account onboarding')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[13px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold"
            >
              Open Demat Account
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden w-10 h-10 flex items-center justify-center border border-cf-gold/30 rounded-md text-cf-text hover:border-cf-gold/60 transition-colors duration-160"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          id="mobileMenu"
          className={`lg:hidden border-t border-white/[0.06] bg-ink2/95 backdrop-blur-md overflow-hidden transition-[max-height] duration-240 ease-cinematic ${mobileOpen ? 'max-h-[80vh]' : 'max-h-0'}`}
        >
          <div className="wrap py-2 flex flex-col">
            {navLinks.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileOpen(false)}
                className="nav-link py-3.5 border-b border-white/5 text-[15px] font-medium"
              >
                {navLabels[id]}
              </a>
            ))}
            <button
              onClick={() => handleInterest('account', 'Demat account onboarding')}
              className="btn btn-primary w-full my-4"
            >
              Open Demat Account
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ══════════ HERO ══════════
            Phase 9.1: extracted to src/components/landing/sections/Hero.tsx
            (Cinematic Finance rewrite — Bebas Neue 14vw headline, layered bg
            with grain + parallax gold glow drift, glassmorphic terminal with
            gold gradient border, JetBrains Mono for all numerics, Ken Burns
            zoom on chart container, 80ms staggered reveal). */}
        <Hero onSelectInterest={handleInterest} />

        {/* ══════════ TRUST & STATS STRIP ══════════
            Phase 9.3: extracted to src/components/landing/sections/TrustStrip.tsx
            (glassmorphic trust pillars + JetBrains Mono stat counters +
            verifiable SEBI/NSE/NISM badges; 80ms staggered reveal).
            The fabricated "4.8/180 Google Reviews" badge was REMOVED here —
            consistent with the Phase 6 AggregateRating JSON-LD removal. */}
        <TrustStrip />

        {/* ══════════ BROKING SERVICES ══════════
            Phase 9.4: extracted to src/components/landing/sections/BrokingServices.tsx
            (Cinematic Finance rewrite — glassmorphic pricing term sheet with
            gradient gold border, 2-col glass benefit mini-cards, Bebas Neue
            heading, pulsing onboarding CTA, 80ms staggered reveal). */}
        <BrokingServices onSelectInterest={handleInterest} />

        {/* ══════════ EDUCATION & ACADEMY ══════════
            Phase 9.5: extracted to src/components/landing/sections/Courses.tsx
            (Cinematic Finance rewrite — 3D Y-axis flip cards: hover/tap reveals
            curriculum + outcomes on the back face; [perspective:1200px] +
            preserve-3d + rotateY(180deg) + backface-hidden; duration-480
            ease-cinematic flip; Bebas Neue heading; flagship gold ring). */}
        <Courses onSelectInterest={handleInterest} />

        {/* ══════════ HOW IT WORKS ══════════
            Phase 9.6: extracted to src/components/landing/sections/HowItWorks.tsx
            (glassmorphic step cards + gold connecting dots + 80ms staggered reveal). */}
        <HowItWorks onSelectInterest={handleInterest} />

        {/* ══════════ TESTIMONIALS ══════════
            Phase 9.7: extracted to src/components/landing/sections/Testimonials.tsx
            (glassmorphic cards + gold star ratings + 80ms staggered reveal). */}
        <Testimonials />

        <LazySection>
        {/* ══════════ FAQ ══════════
            Phase 8/9: extracted to src/components/landing/sections/FAQ.tsx
            (proof-of-concept for the section-component pattern + cf-* visual rewrite). */}
        <FAQ />
        </LazySection>

        <LazySection>
        {/* ══════════ ABOUT US ══════════
            Phase 9 page-level: cf-* token pass — Bebas Neue heading,
            glassmorphic principle mini-cards, 80ms staggered reveal. */}
        <section id="about" className="sec border-t border-white/[0.06] relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-20 left-10 w-[420px] h-[420px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
            style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.12), transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="wrap relative">
            <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              06 · About Us
            </p>
            <div className="grid lg:grid-cols-12 gap-12 mt-6">
              <div className="lg:col-span-7">
                <h2 className="font-display font-normal text-[44px] md:text-[64px] lg:text-[72px] leading-[0.96] tracking-[-0.01em] text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
                  A Jaipur desk that treats investing as a <span className="bg-cf-gold-gradient bg-clip-text text-transparent">process</span> — not a prediction.
                </h2>
                <p className="mt-6 text-cf-mist text-[15px] leading-relaxed animate-cf-reveal-up [animation-delay:160ms]">
                  Systematic Yield Analysts Pvt. Ltd. runs on two wings of the same philosophy. As an Authorized
                  Partner of Angel One, we help investors access world-class broking infrastructure with local,
                  accountable guidance. As an academy, we train the next generation of market participants to
                  trade with rules, evidence and risk control — because we&apos;d rather build disciplined traders
                  than sell certainty.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-cf-text animate-cf-reveal-up [animation-delay:240ms]">
                  No tips. No pump groups. No guaranteed-return promises — those are red flags, and we say so plainly.
                </p>
              </div>
              <div className="lg:col-span-5 space-y-4">
                {[
                  { num: '01', title: 'Risk before returns', desc: 'Position sizing and stop-losses are the first thing we teach — and the last thing we compromise.' },
                  { num: '02', title: 'Process over predictions', desc: "If it can't be written as a rule and tested on data, it doesn't belong in your portfolio." },
                  { num: '03', title: 'Education before execution', desc: 'We make sure you understand a trade before you\'re allowed to be convinced by one.' },
                ].map((p, i) => (
                  <div key={p.num} className={`group relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40 animate-cf-reveal-up [animation-delay:${240 + i * 80}ms]`}>
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />
                    <div className="relative p-5">
                      <p className="font-data text-[11px] font-semibold tracking-[0.2em] text-cf-gold uppercase">Principle {p.num}</p>
                      <p className="text-[16px] font-semibold mt-1.5 text-cf-text-strong">{p.title}</p>
                      <p className="text-[13px] text-cf-mist mt-1.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counters — moved into the TrustStrip section (Phase 9.3 IA improvement).
                Was: 3 stat cards (2400+ accounts, 900+ traders, 12 yrs experience).
                The counters now live in src/components/landing/sections/TrustStrip.tsx
                so the "trust + stats" content is consolidated in one component
                (matching docs/DESIGN_SYSTEM.md §6 sub-task 9.3). */}
          </div>
        </section>
        </LazySection>


        {/* ══════════ BLOG / INSIGHTS ══════════
            Phase 9.9: extracted to src/components/landing/sections/BlogPreview.tsx
            (Cinematic Finance rewrite — glassmorphic card grid, image zoom on
            hover scale-1.05 duration-240 ease-cinematic, gradient overlay with
            title/excerpt/author, Bebas Neue heading, 80ms staggered reveal.
            Owns its own /api/blogs?limit=3 fetch — blogPosts state moved out of
            page.tsx). */}
        <BlogPreview />

        {/* ══════════ CONTACT & LEAD FORM ══════════
            Phase 9.10: extracted to src/components/landing/sections/ContactForm.tsx
            (Cinematic Finance rewrite — glassmorphic form panel with gold-gradient
            focus rings, pulsing submit CTA animate-cf-pulse-cta, Bebas Neue
            heading. ALL form state/refs/handlers/effects moved into the
            component; parent passes an `interest` trigger + onToast callback). */}
        <ContactForm interest={interestTrigger} onToast={addToast} />
      </main>

      {/* ══════════ REGULATORY FOOTER ══════════
          Phase 9.12: extracted to src/components/landing/sections/Footer.tsx
          (Cinematic Finance rewrite — grain texture, gold glow drift,
          JetBrains Mono SEBI disclosures, staggered column reveal). */}
      <Footer
        navLinks={navLinks}
        navLabels={navLabels}
        onSelectInterest={handleInterest}
        onOpenModal={(key) => { setModalKey(key); setModalOpen(true); }}
      />

      {/* ══════════ LEGAL MODAL ══════════ */}
      {modalOpen && (
        <div
          id="modal"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h3 className="font-display font-normal text-[28px] leading-none tracking-[-0.01em] text-cf-text-strong">{LEGAL[modalKey].t}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-md border border-cf-glass-border text-cf-mist hover:text-cf-gold hover:border-cf-gold/50 transition-colors duration-160"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="relative p-6 text-[13.5px] text-cf-mist leading-relaxed space-y-3 overflow-y-auto cf-scroll"
              dangerouslySetInnerHTML={{ __html: LEGAL[modalKey].b }}
            />
          </div>
        </div>
      )}

      {/* Toast stack */}
      <div id="toasts" className="fixed bottom-6 right-5 z-[90] flex flex-col gap-2.5 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>

      {/* Social Proof Notification */}
      {socialProof && (
        <div className="social-proof-toast visible" role="status" aria-live="polite">
          <span className="sp-check"><CheckCircle2 className="w-3.5 h-3.5" /></span>
          <span className="sp-text">
            <span className="font-semibold text-cf-text-strong">{socialProof.name}</span>{' '}
            <span className="text-cf-mist">from {socialProof.loc} {socialProof.action} {'·'} {socialProof.mins} min ago</span>
          </span>
        </div>
      )}

      {/* Exit-Intent Popup */}
      {exitOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Special offer">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setExitOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-gold/30 shadow-glass overflow-hidden p-8 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
            <button onClick={() => setExitOpen(false)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-md border border-cf-glass-border text-cf-mist hover:text-cf-gold hover:border-cf-gold/50 transition-colors duration-160" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
            <div className="relative mx-auto w-14 h-14 rounded-full border border-cf-gold/40 bg-cf-gold/10 flex items-center justify-center text-cf-gold mb-5 shadow-glow-gold">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="relative font-display font-normal text-[32px] leading-tight text-cf-text-strong">Wait — before you go.</h3>
            <p className="relative text-[14px] text-cf-mist mt-3 leading-relaxed">
              Most investors lose money because they start without a plan. Let us help you build one.
            </p>
            <div className="relative flex flex-col gap-3 mt-7">
              <button onClick={() => { setExitOpen(false); handleInterest('both', 'Account + Course Package'); }} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold animate-cf-pulse-cta motion-reduce:[animation:none]">
                Open Account + Get Course Access <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => { setExitOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold">
                Just take me to the form
              </button>
            </div>
            <p className="relative text-[11px] text-cf-text-muted mt-5">Zero commitment. No spam. Talk to a real human first.</p>
          </div>
        </div>
      )}

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion.current ? 'auto' : 'smooth' })}
        className={`btt-btn ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919829012345?text=Hi%20SYA%20team%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
      </a>

      {/* ══════════ STICKY CTA BAR ══════════
          Phase 9.11: extracted to src/components/landing/sections/StickyCTA.tsx
          (Cinematic Finance rewrite — glassmorphic bar that snaps in past the
          hero with duration-480 ease-snap, pulsing primary CTA, hides when the
          contact form is in view). Replaces the legacy mobile-cta-bar. */}
      <StickyCTA onSelectInterest={handleInterest} />

      {/* Cookie Consent Banner */}
      {cookieConsent === null && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
          <div className="cookie-banner-inner">
            <Cookie className="w-5 h-5 text-cf-gold shrink-0 mt-0.5" />
            <p className="text-[13px] text-cf-mist leading-relaxed">
              We use essential browser storage (localStorage) to save your form progress and preferences. No third-party tracking cookies are active.{' '}
              <button onClick={() => { setModalKey('privacy'); setModalOpen(true); }} className="text-cf-gold hover:underline">Learn more</button>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleCookieConsent('declined')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[12px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                Decline
              </button>
              <button
                onClick={() => handleCookieConsent('accepted')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[12px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

