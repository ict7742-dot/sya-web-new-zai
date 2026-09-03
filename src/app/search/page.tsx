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
    <main className="min-h-screen bg-[#070B14] text-[#E8EBF2]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="blog-hero-glow" aria-hidden />
        <div className="wrap relative px-5 py-16 md:px-8 md:py-24">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#98A2B8] transition-colors hover:text-[#E2B15C]"
          >
            <ArrowLeft className="h-4 w-4" /> All Insights
          </Link>
          <div className="eyebrow reveal in">
            <Search className="h-3.5 w-3.5" /> Search
          </div>
          <h1 className="reveal in mt-5 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-[1.08] md:text-5xl">
            Find the insight <em>you need.</em>
          </h1>
          <p className="reveal in d1 mt-5 max-w-xl text-[16px] leading-relaxed text-[#98A2B8] md:text-lg">
            Search across market analysis, trading strategies, SEBI updates, and course
            announcements — by topic, author, or keyword.
          </p>
        </div>
      </section>

      {/* Search UI (client component, wrapped in Suspense for useSearchParams) */}
      <section className="wrap px-5 py-14 md:px-8 md:py-20">
        <Suspense fallback={<div className="h-16" />}>
          <SearchClient initialQuery={initialQuery} />
        </Suspense>
      </section>
    </main>
  );
}
