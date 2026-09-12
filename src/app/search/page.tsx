import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { SearchClient } from './search-client';

export const metadata: Metadata = {
  title: 'Search — Insights | Systematic Yield Analysts',
  description:
    'Search across all our market analysis, trading tips, SEBI updates, and course announcements.',
  alternates: { canonical: 'https://systematicyield.in/search' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Search Insights — Systematic Yield Analysts',
    description: 'Find market analysis, trading tips, and SEBI updates.',
    type: 'website',
  },
};

type SearchParams = { q?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const initialQuery = typeof q === 'string' ? q.trim().slice(0, 100) : '';

  return (
    <main className="min-h-screen bg-cf-bg text-cf-text relative overflow-hidden">
      {/* Ambient gold + emerald glow drift */}
      <div
        className="pointer-events-none absolute -top-32 left-10 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.16), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-10 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift [animation-delay:4s]"
        style={{ background: 'radial-gradient(circle, rgba(53,212,154,0.10), transparent 70%)' }}
        aria-hidden
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="wrap relative px-5 py-16 md:px-8 md:py-24">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-cf-mist transition-colors duration-160 hover:text-cf-gold"
          >
            <ArrowLeft className="h-4 w-4" /> All Insights
          </Link>
          <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
            <span className="block w-6 h-px bg-cf-gold opacity-70" />
            <Search className="h-3.5 w-3.5" /> Search
          </p>
          <h1 className="mt-5 max-w-3xl font-display font-normal text-[56px] md:text-[88px] leading-[0.95] tracking-[-0.01em] text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
            Find the insight <span className="bg-cf-gold-gradient bg-clip-text text-transparent">you need.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-cf-mist md:text-lg animate-cf-reveal-up [animation-delay:160ms]">
            Search across market analysis, trading strategies, SEBI updates, and course
            announcements — by topic, author, or keyword.
          </p>
        </div>
      </section>

      {/* Search UI (client component, wrapped in Suspense for useSearchParams) */}
      <section className="wrap relative px-5 py-14 md:px-8 md:py-20">
        <Suspense fallback={<div className="h-16" />}>
          <SearchClient initialQuery={initialQuery} />
        </Suspense>
      </section>
    </main>
  );
}
