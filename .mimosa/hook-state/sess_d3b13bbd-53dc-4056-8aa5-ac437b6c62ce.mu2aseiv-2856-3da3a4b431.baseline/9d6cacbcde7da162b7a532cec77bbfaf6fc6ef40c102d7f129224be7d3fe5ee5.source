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
            : 'flex flex-col items-center gap-3 py-4 text-center'
        }
      >
        <span className="mx-auto w-14 h-14 rounded-full border border-cf-emerald/40 bg-cf-emerald/10 flex items-center justify-center text-cf-emerald">
          <CheckCircle2 className="w-7 h-7" />
        </span>
        <p className="text-[15px] font-medium text-cf-text-strong">{message}</p>
        <p className="text-xs text-cf-text-muted">
          Every email includes a one-click unsubscribe link. We never share your address.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-1 text-xs text-cf-mist underline-offset-2 hover:text-cf-gold hover:underline transition-colors duration-160"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-cf-glass-border bg-cf-glass py-3 pl-10 pr-4 text-[14.5px] text-cf-text outline-none transition-all duration-240 ease-cinematic placeholder:text-cf-text-muted focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20';

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cf-text-muted" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
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
          <p className="mt-2 text-xs text-cf-crimson">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="newsletter-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cf-gold/10 border border-cf-gold/30">
          <Mail className="h-5 w-5 text-cf-gold" />
        </div>
        <div>
          <h3 className="font-display font-normal text-[24px] leading-none tracking-[-0.01em] text-cf-text-strong">
            {heading}
          </h3>
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-cf-mist">{subheading}</p>
      {form}
      {status === 'error' && message && (
        <p className="mt-2 text-xs text-cf-crimson">{message}</p>
      )}
    </div>
  );
}
