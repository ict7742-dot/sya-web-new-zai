'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

/** Interactive confirm/unsubscribed UI. Token is pre-validated by the page.
 *  Cinematic Finance styling: Bebas Neue headings, glassmorphic icon rings,
 *  cf-gold-gradient / cf-crimson action buttons, cf-* text tokens. */
export function UnsubscribedForm({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const confirm = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        // Keep a friendly message; the API already sanitises output.
        console.warn(data.error);
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-emerald/10 border border-cf-emerald/30 shadow-[0_0_18px_rgba(53,212,154,0.22)]">
          <CheckCircle2 className="h-8 w-8 text-cf-emerald" />
        </div>
        <h1 className="font-display font-normal text-[40px] leading-tight tracking-[-0.01em] text-cf-text-strong">
          You&apos;re unsubscribed
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-cf-mist">
          You will no longer receive market insights from Systematic Yield Analysts. If this
          was a mistake, you can always subscribe again from our blog.
        </p>
        <Link
          href="/blog"
          className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold"
        >
          Back to Insights
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-gold/10 border border-cf-gold/30 shadow-glow-gold">
        <Mail className="h-8 w-8 text-cf-gold" />
      </div>
      <h1 className="font-display font-normal text-[40px] leading-tight tracking-[-0.01em] text-cf-text-strong">
        Confirm unsubscribe
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-cf-mist">
        You&apos;re about to stop receiving our weekly market analysis, trading tips, and SEBI
        updates. This action cannot be undone, but you can re-subscribe anytime.
      </p>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md border border-cf-crimson/30 bg-cf-crimson/10 px-4 py-2.5 text-sm text-cf-crimson">
          <AlertCircle className="h-4 w-4" />
          Something went wrong. Please try again or reply to any email for help.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={confirm}
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-cf-crimson text-white font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(240,85,95,0.32)] disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Yes, unsubscribe me'
          )}
        </button>
        <Link
          href="/blog"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
        >
          Keep me subscribed
        </Link>
      </div>
    </div>
  );
}
