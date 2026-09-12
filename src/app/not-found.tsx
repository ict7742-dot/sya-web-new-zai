import Link from 'next/link';
import { ArrowRight, ArrowLeft, Home, Compass } from 'lucide-react';

/**
 * Custom 404 page — Cinematic Finance branded.
 *
 * Renders for any unmatched route (e.g. /blog/unknown-slug, /typo). Uses the
 * full cf-* design system: layered bg with grain + parallax gold glow drift,
 * Bebas Neue display heading, glassmorphic card, gold-gradient CTA. Provides
 * navigation back to the home page + the blog (the two most likely intended
 * destinations).
 */
export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-16 bg-cf-bg text-cf-text overflow-hidden">
      {/* Layered background — grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      {/* Parallax gold glow drift */}
      <div
        className="pointer-events-none absolute -top-40 -left-20 w-[640px] h-[640px] rounded-full blur-3xl opacity-40 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.18), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-20 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 animate-cf-glow-drift [animation-delay:4s]"
        style={{ background: 'radial-gradient(circle, rgba(53,212,154,0.12), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative w-full max-w-lg text-center">
        {/* Giant 404 — Bebas Neue display */}
        <p className="font-display font-normal text-[28vw] sm:text-[200px] leading-[0.85] tracking-[-0.02em] animate-cf-reveal-up">
          <span className="bg-cf-gold-gradient bg-clip-text text-transparent">404</span>
        </p>

        {/* Glassmorphic content card */}
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden mt-6 p-8 md:p-10 animate-cf-reveal-up [animation-delay:80ms]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />

          <div className="relative">
            <p className="flex items-center justify-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              <Compass className="h-3.5 w-3.5" /> Lost in the markets
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
            </p>
            <h1 className="font-display font-normal text-[44px] md:text-[56px] leading-[0.95] tracking-[-0.01em] text-cf-text-strong mt-4">
              This page <span className="bg-cf-gold-gradient bg-clip-text text-transparent">doesn&apos;t exist</span>.
            </h1>
            <p className="mt-4 text-cf-mist text-[15px] leading-relaxed max-w-md mx-auto">
              The link may be broken, or the page may have moved. Let&apos;s get you back on track —
              head to the home page for the full market desk, or browse our latest insights.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold animate-cf-pulse-cta motion-reduce:[animation:none] w-full sm:w-auto"
              >
                <Home className="w-4 h-4" />
                Back to home
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse insights
              </Link>
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="relative mt-6 text-[11px] text-cf-text-muted animate-cf-reveal-up [animation-delay:160ms]">
          If you reached this page from a link on our site, please{' '}
          <a href="mailto:connect@systematicyield.in" className="text-cf-gold hover:underline">
            let us know
          </a>{' '}
          so we can fix it.
        </p>
      </div>
    </main>
  );
}
