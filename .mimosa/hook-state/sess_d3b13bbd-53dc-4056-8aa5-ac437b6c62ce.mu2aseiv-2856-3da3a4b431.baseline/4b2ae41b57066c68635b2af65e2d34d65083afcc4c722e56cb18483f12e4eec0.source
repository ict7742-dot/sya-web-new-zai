'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StickyCTAProps {
  /** Triggered when the primary "Open Demat Account" CTA is clicked. */
  onSelectInterest: (interest: 'account' | 'courses' | 'both', label: string) => void;
}

/**
 * Sticky CTA bar — Phase 9.11 visual rewrite using Cinematic Finance tokens.
 *
 * Replaces the legacy `mobile-cta-bar` (which used `showMobileCta` state in
 * page.tsx). This component owns its own scroll-visibility logic.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md §9.11):
 *   - Glassmorphic bar pinned to the bottom of the viewport
 *   - Snaps in (translate-y-full → translate-y-0) after the user scrolls past
 *     the hero; snaps out when the contact section enters view (so it never
 *     overlaps the form) or when near the very top
 *   - duration-480 ease-snap for the snap motion (slight overshoot)
 *   - Pulsing primary CTA (animate-cf-pulse-cta, motion-reduced disables it)
 *   - data-[visible=true/false] attribute drives the translate
 *   - Two CTAs: primary (Open Demat) + ghost (Enquire → #contact)
 */
export function StickyCTA({ onSelectInterest }: StickyCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      // Show after the user has scrolled past ~70% of the viewport (hero).
      const pastHero = y > window.innerHeight * 0.7;
      // Hide when the contact section is in view so the bar never overlaps
      // the form it's trying to drive traffic to.
      const contact = document.getElementById('contact');
      const contactTop = contact ? contact.getBoundingClientRect().top : Infinity;
      const contactInView = contactTop < window.innerHeight * 0.85;
      setVisible(pastHero && !contactInView);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div
      data-visible={visible}
      aria-hidden={!visible}
      className="fixed bottom-0 inset-x-0 z-40 transition-transform duration-480 ease-snap data-[visible=false]:translate-y-full data-[visible=true]:translate-y-0 motion-reduce:transition-none"
    >
      <div className="wrap pb-3">
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
          <div className="relative flex items-center gap-3 p-3">
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cf-gold">Open your account</p>
              <p className="text-[12px] text-cf-mist truncate">Paperless e-KYC · trade-ready in 24 hours</p>
            </div>
            <button
              onClick={() => onSelectInterest('account', 'Demat account onboarding')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[13px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold animate-cf-pulse-cta motion-reduce:[animation:none]"
            >
              Open Demat Account <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href="#contact"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[13px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
            >
              Enquire Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
