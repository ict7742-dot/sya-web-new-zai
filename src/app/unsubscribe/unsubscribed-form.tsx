'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

/** Interactive confirm/unsubscribed UI. Token is pre-validated by the page. */
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#35D49A]/10 ring-1 ring-[#35D49A]/30">
          <CheckCircle2 className="h-8 w-8 text-[#35D49A]" />
        </div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#E8EBF2]">
          You&apos;re unsubscribed
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-[#98A2B8]">
          You will no longer receive market insights from Systematic Yield Analysts. If this
          was a mistake, you can always subscribe again from our blog.
        </p>
        <a href="/blog" className="btn btn-primary mt-2">
          Back to Insights
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E2B15C]/10 ring-1 ring-[#E2B15C]/30">
        <Mail className="h-8 w-8 text-[#E2B15C]" />
      </div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#E8EBF2]">
        Confirm unsubscribe
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-[#98A2B8]">
        You&apos;re about to stop receiving our weekly market analysis, trading tips, and SEBI
        updates. This action cannot be undone, but you can re-subscribe anytime.
      </p>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md border border-[#F0555F]/30 bg-[#F0555F]/10 px-4 py-2.5 text-sm text-[#F0555F]">
          <AlertCircle className="h-4 w-4" />
          Something went wrong. Please try again or reply to any email for help.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={confirm}
          disabled={status === 'loading'}
          className="btn btn-primary inline-flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Yes, unsubscribe me'
          )}
        </button>
        <a href="/blog" className="btn btn-ghost">
          Keep me subscribed
        </a>
      </div>
    </div>
  );
}
