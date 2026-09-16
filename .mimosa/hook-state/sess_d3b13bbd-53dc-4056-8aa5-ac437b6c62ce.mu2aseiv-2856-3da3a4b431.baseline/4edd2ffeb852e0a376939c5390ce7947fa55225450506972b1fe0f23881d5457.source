import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { UnsubscribedForm } from './unsubscribed-form';

export const metadata: Metadata = {
  title: 'Unsubscribe — Systematic Yield Analysts',
  description: 'Manage your newsletter subscription preferences.',
  robots: { index: false, follow: false },
};

/** Brand logo mark (mirrors the one used across the site). */
function SyaMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden>
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="#E2B15C" strokeWidth="1.4" opacity="0.85" />
      <path d="M8 22 L13 16 L17 19 L24 10" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
    </svg>
  );
}

type SearchParams = { token?: string };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token } = await searchParams;
  const valid = typeof token === 'string' && /^[a-f0-9]{48}$/.test(token);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cf-bg px-5 py-16 text-cf-text relative overflow-hidden">
      {/* Ambient gold glow drift — consistent with the rest of the site */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.16), transparent 70%)' }}
        aria-hidden
      />
      <div className="w-full max-w-lg relative">
        {/* Brand header — reinforces this is the genuine SYA site, not phishing */}
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <SyaMark />
          <span className="font-display font-normal text-[18px] leading-none tracking-[-0.01em] text-cf-text-strong">
            Systematic Yield Analysts
          </span>
        </Link>
        {/* Glassmorphic card */}
        <div className="relative rounded-2xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-8 md:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
          {valid ? (
            <div className="relative">
              <UnsubscribedForm token={token as string} />
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-crimson/10 border border-cf-crimson/30 shadow-[0_0_18px_rgba(240,85,95,0.18)]">
                <AlertCircle className="h-8 w-8 text-cf-crimson" />
              </div>
              <h1 className="font-display font-normal text-[40px] leading-tight tracking-[-0.01em] text-cf-text-strong">
                Invalid unsubscribe link
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-cf-mist">
                The link you followed is missing or malformed. Unsubscribe links are sent at the
                bottom of every newsletter email — please use the link from a recent email.
              </p>
              <Link
                href="/blog"
                className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                Go to Insights
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
