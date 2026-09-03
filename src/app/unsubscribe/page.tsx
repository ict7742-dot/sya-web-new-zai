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
    <main className="flex min-h-screen items-center justify-center bg-[#070B14] px-5 py-16 text-[#E8EBF2]">
      <div className="w-full max-w-lg">
        {/* Brand header — reinforces this is the genuine SYA site, not phishing */}
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <SyaMark />
          <span className="font-[family-name:var(--font-fraunces)] text-[15px] font-semibold tracking-tight text-[#E8EBF2]">
            Systematic Yield Analysts
          </span>
        </Link>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl md:p-12">
          {valid ? (
            <UnsubscribedForm token={token as string} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0555F]/10 ring-1 ring-[#F0555F]/30">
                <AlertCircle className="h-8 w-8 text-[#F0555F]" />
              </div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#E8EBF2]">
                Invalid unsubscribe link
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-[#98A2B8]">
                The link you followed is missing or malformed. Unsubscribe links are sent at the
                bottom of every newsletter email — please use the link from a recent email.
              </p>
              <a href="/blog" className="btn btn-ghost mt-2">
                Go to Insights
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
