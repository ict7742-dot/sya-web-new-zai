import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BlogBrowser } from './blog-browser';
import { Newsletter } from '@/components/newsletter';
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

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <main className="min-h-screen bg-[#070B14] text-[#E8EBF2]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="blog-hero-glow" aria-hidden />
        <div className="wrap relative px-5 py-20 md:px-8 md:py-28">
          <div className="eyebrow reveal in">
            <FileText className="h-3.5 w-3.5" /> Insights · Market Desk
          </div>
          <h1 className="reveal in mt-5 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-[1.08] md:text-6xl">
            Market analysis, <em>without the noise.</em>
          </h1>
          <p className="reveal in d1 mt-5 max-w-xl text-[16px] leading-relaxed text-[#98A2B8] md:text-lg">
            Research-driven notes on indices, options, risk and regulation — written by
            NISM-certified mentors. No tips, no hype. Just the process.
          </p>
          <div className="reveal in d2 mt-7">
            <Link
              href="/search"
              className="btn btn-ghost inline-flex items-center gap-2"
            >
              <Search className="h-4 w-4" /> Search all articles
            </Link>
          </div>
        </div>
      </section>

      {/* Browser (client-interactive: filter + search) */}
      <section className="wrap px-5 py-14 md:px-8 md:py-20">
        <BlogBrowser posts={posts} categories={categories} />
      </section>

      {/* Newsletter */}
      <section className="wrap px-5 pb-24 md:px-8">
        <Newsletter source="blog" variant="card" />
      </section>
    </main>
  );
}
