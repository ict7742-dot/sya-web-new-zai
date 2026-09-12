import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BlogBrowser } from './blog-browser';
import { Newsletter } from '@/components/newsletter';
import { SearchTrigger } from '@/components/search-trigger';
import { PopularPosts } from '@/components/popular-posts';
import { FileText, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Insights — Market Analysis, Trading Tips & SEBI Updates | Systematic Yield Analysts',
  description:
    'Expert market analysis, options trading strategies, and SEBI regulatory updates from Systematic Yield Analysts, Jaipur. Learn from NISM-certified mentors.',
  alternates: { canonical: 'https://systematicyield.in/blog' },
  openGraph: {
    title: 'Insights — Systematic Yield Analysts',
    description: 'Market analysis, trading tips, and SEBI updates from NISM-certified mentors.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      author: true,
      createdAt: true,
    },
  });

  const categories = Array.from(new Set(posts.map((p) => p.category))) as string[];

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
        <div className="wrap relative px-5 py-20 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
            <span className="block w-6 h-px bg-cf-gold opacity-70" />
            <FileText className="h-3.5 w-3.5" /> Insights · Market Desk
          </p>
          <h1 className="mt-5 max-w-3xl font-display font-normal text-[56px] md:text-[88px] leading-[0.95] tracking-[-0.01em] text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
            Market analysis, <span className="bg-cf-gold-gradient bg-clip-text text-transparent">without the noise.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-cf-mist md:text-lg animate-cf-reveal-up [animation-delay:160ms]">
            Research-driven notes on indices, options, risk and regulation — written by
            NISM-certified mentors. No tips, no hype. Just the process.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 animate-cf-reveal-up [animation-delay:240ms]">
            <SearchTrigger />
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm text-cf-mist transition-colors duration-160 hover:text-cf-gold"
            >
              <Search className="h-4 w-4" /> Full search page
            </Link>
          </div>
        </div>
      </section>

      {/* Browser (client-interactive: filter + search) + Popular sidebar */}
      <section className="wrap relative px-5 py-14 md:px-8 md:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="min-w-0">
            <BlogBrowser posts={posts} categories={categories} />
          </div>
          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-6">
              <PopularPosts />
            </div>
          </aside>
        </div>
      </section>

      {/* Newsletter */}
      <section className="wrap relative px-5 pb-24 md:px-8">
        <Newsletter source="blog" variant="card" />
      </section>
    </main>
  );
}
