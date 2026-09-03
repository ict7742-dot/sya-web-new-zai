'use client';

import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface NewsletterProps {
  source?: 'blog' | 'footer' | 'landing';
  variant?: 'card' | 'inline';
  heading?: string;
  subheading?: string;
}

export function Newsletter({
  source = 'blog',
  variant = 'card',
  heading = 'Stay ahead of the markets',
  subheading = 'Get weekly market analysis, trading tips, and SEBI updates delivered to your inbox. No spam — unsubscribe anytime.',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
        return;
      }
      setStatus('success');
      setMessage(data.message || 'Subscribed!');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error — please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div
        className={
          variant === 'card'
            ? 'newsletter-card flex flex-col items-center gap-3 py-8 text-center'
            : 'flex items-center gap-3'
        }
      >
        <CheckCircle2 className="h-7 w-7 text-[#35D49A]" />
        <p className="text-[15px] font-medium text-[#E8EBF2]">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-1 text-xs text-[#98A2B8] underline-offset-2 hover:text-[#E2B15C] hover:underline"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525C70]" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="w-full rounded-md border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-[14.5px] text-[#EDEFF5] outline-none transition-colors placeholder:text-[#525C70] focus:border-[#E2B15C]/60 focus:bg-white/[0.05]"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Subscribe <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );

  if (variant === 'inline') {
    return (
      <div>
        {form}
        {status === 'error' && message && (
          <p className="mt-2 text-xs text-[#F0555F]">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="newsletter-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E2B15C]/10 ring-1 ring-[#E2B15C]/25">
          <Mail className="h-5 w-5 text-[#E2B15C]" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[#E8EBF2]">
            {heading}
          </h3>
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-[#98A2B8]">{subheading}</p>
      {form}
      {status === 'error' && message && (
        <p className="mt-2 text-xs text-[#F0555F]">{message}</p>
      )}
    </div>
  );
}
