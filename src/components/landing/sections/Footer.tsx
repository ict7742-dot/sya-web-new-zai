'use client';

import { LazySection } from '@/components/landing/lazy-section';

interface FooterProps {
  navLinks: readonly string[];
  navLabels: Record<string, string>;
  /** Triggered when a program name is clicked in the footer. */
  onSelectInterest: (interest: string, label: string) => void;
  /** Triggered when "Privacy Policy" or "Terms & Conditions" is clicked. */
  onOpenModal: (key: 'privacy' | 'terms') => void;
}

/**
 * Footer section — Phase 9.12 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Grain-texture overlay on the deep-black background
 *   - JetBrains Mono for the SEBI disclosures (small-caps numerics)
 *   - Gold hairline dividers between disclosure paragraphs
 *   - Glassmorphic CTA cluster at the bottom (programs + legal links)
 *   - Staggered reveal of the 3 footer columns (80ms increments)
 */
export function Footer({ navLinks, navLabels, onSelectInterest, onOpenModal }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-cf-gold/15 bg-cf-bg mt-auto overflow-hidden">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Subtle gold glow drift at the top edge */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-48 rounded-full blur-3xl opacity-30 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(ellipse, rgba(226,177,92,0.16), transparent 70%)' }}
      />

      <div className="wrap relative py-14 md:py-16">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-5 animate-cf-reveal-up [animation-delay:0ms]">
            <a href="#home" className="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
                <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="#E2B15C" strokeWidth="1.4" opacity=".8" />
                <path d="M8 22 L13 16 L17 19 L24 10" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
              </svg>
              <span className="leading-tight">
                <span className="block text-[15px] font-semibold tracking-tight text-cf-text-strong">Systematic Yield</span>
                <span className="block text-[9px] font-medium tracking-[0.24em] text-cf-mist uppercase">Analysts · Angel One Partner</span>
              </span>
            </a>
            <p className="text-[13px] text-cf-mist leading-relaxed mt-5 max-w-sm">
              An Angel One Authorized Partner desk and stock market academy based in Jaipur —
              helping investors trade with structure, not sentiment.
            </p>
            {/* TODO(docs/PLACEHOLDER_INVENTORY.md §1): replace with verified contact details before launch */}
            <p className="text-[12px] text-cf-text-muted mt-4 font-data tabular-nums">
              +91 98290 12345 · connect@systematicyield.in
            </p>
          </div>

          {/* Explore column */}
          <div className="md:col-span-3 animate-cf-reveal-up [animation-delay:80ms]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-mist mb-3">
              Explore
            </p>
            <div className="flex flex-col gap-3 text-[13.5px]">
              {navLinks.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-cf-mist hover:text-cf-gold transition-colors duration-160 w-fit"
                >
                  {navLabels[id]}
                </a>
              ))}
            </div>
          </div>

          {/* Programs column */}
          <div className="md:col-span-4 animate-cf-reveal-up [animation-delay:160ms]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-mist mb-3">
              Programs
            </p>
            <div className="flex flex-col gap-3 text-[13.5px]">
              {[
                { label: 'Beginner to Pro: Stock Market Basics', interest: 'courses' },
                { label: 'Advanced Options & Derivatives Trading', interest: 'courses' },
                { label: 'Quantitative & Algo Trading Mastery', interest: 'courses' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onSelectInterest(p.interest, p.label)}
                  className="text-cf-mist hover:text-cf-gold transition-colors duration-160 text-left w-fit"
                >
                  {p.label}
                </button>
              ))}
              <a
                href="#demat"
                className="text-cf-mist hover:text-cf-gold transition-colors duration-160 w-fit"
              >
                Angel One Pricing →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row — copyright + legal */}
        <div className="mt-12 pt-6 border-t border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12.5px] text-cf-text-muted">
          <p>© {year} Systematic Yield Analysts Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <button
              onClick={() => onOpenModal('privacy')}
              className="hover:text-cf-gold transition-colors duration-160"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenModal('terms')}
              className="hover:text-cf-gold transition-colors duration-160"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>

        {/* SEBI Compliant Disclosures — JetBrains Mono small caps for the
            regulatory numerics (reg numbers, CIN, etc.) */}
        <div className="sebi-disclosure mt-8 pt-6 border-t border-cf-gold/10 space-y-3">
          <p className="text-[11.5px] text-cf-text-muted leading-relaxed font-data">
            <strong className="text-cf-mist font-semibold">SEBI Registration and Governance:</strong>{' '}
            Systematic Yield Analysts Pvt. Ltd. operates as an Authorized Partner (sub-broker) of Angel One Limited
            (SEBI Reg. No. INZ000161534), a stock broker registered with the Securities and Exchange Board of India and a member
            of NSE, BSE, and MCX. Investment in the securities market carries inherent market risk. All investors are advised
            to read the KYC documents, Risk Disclosure Documents, and the Do&apos;s and Don&apos;ts prescribed by SEBI before
            making any investment decisions.
          </p>
          <p className="text-[11.5px] text-cf-text-muted leading-relaxed">
            <strong className="text-cf-mist font-semibold">Disclaimer on Education Programs:</strong>{' '}
            The courses offered by Systematic Yield Analysts are educational in nature and are not investment advisory services.
            Course content is designed to enhance knowledge and understanding of financial markets and does not constitute a
            recommendation to buy, sell, or hold any security. No course guarantees any specific trading outcome or return.
            Past performance of any trading strategy, backtest result, or mentor track record discussed during the program is
            not indicative of future results.
          </p>
          <p className="text-[11.5px] text-cf-text-muted leading-relaxed">
            <strong className="text-cf-mist font-semibold">Derivatives and Leveraged Products:</strong>{' '}
            Derivatives trading, including futures and options, involves substantial risk of loss and is not suitable for every
            investor. The use of leverage in derivative transactions can result in losses exceeding the initial margin deposit.
            Investors should only trade in derivatives if they fully understand the risks involved.
          </p>
          <p className="text-[11.5px] text-cf-text-muted leading-relaxed">
            <strong className="text-cf-mist font-semibold">No Guaranteed Returns:</strong>{' '}
            Systematic Yield Analysts, its directors, employees, or mentors do not offer, promise, or guarantee any fixed or
            minimum returns on any investment or trading activity. Any person or entity offering guaranteed returns in the
            securities market is in violation of SEBI guidelines and should be reported to SEBI at{' '}
            <a
              href="https://scores.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cf-gold hover:underline underline-offset-4"
            >
              scores.sebi.gov.in
            </a>
            .
          </p>
          <p className="text-[11.5px] text-cf-text-muted leading-relaxed">
            <strong className="text-cf-mist font-semibold">Grievance Redressal:</strong>{' '}
            For any complaint against the broker (Angel One), you may reach out to the{' '}
            <a
              href="https://smartodr.in/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cf-gold hover:underline underline-offset-4"
            >
              SMART ODR Portal
            </a>{' '}
            or SEBI SCORES portal. For complaints regarding our services, please email connect@systematicyield.in.
          </p>
          <p className="text-[11px] text-cf-text-muted leading-relaxed font-data">
            Angel One Limited · Member NSE · BSE · MCX · SEBI Reg. No. INZ000161534 ·
            CIN: U74999RJ2008PLC026458 · Office: 2nd Floor, Landmark Tower, Tonk Road, Jaipur, Rajasthan 302015
          </p>
        </div>
      </div>
    </footer>
  );
}
