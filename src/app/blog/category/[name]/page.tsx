import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { BlogBrowser, type BlogListPost } from '../../blog-browser';
import { ArrowLeft, FileText, Layers } from 'lucide-react';

type Params = { name: string };

/** Known category descriptions for SEO + hero copy. */
const CATEGORY_META: Record<string, { description: string; long: string }> = {
  'Market Analysis': {
    description: 'Index analysis, price-action reads, and market commentary from the SYA research desk.',
    long: 'Data-driven notes on indices, sectors and price action. No tips, no hype — just the process.',
  },
  'Trading Tips': {
    description: 'Practical trading tactics: position sizing, options strategies, and risk management.',
    long: 'Tactics you can apply. Each tip comes with the why, the risk, and the exit.',
  },
  'Course Updates': {
    description: 'Announcements, curriculum notes, and resources from the SYA Academy.',
    long: 'Batch announcements, what we teach, and how to prepare for your programme.',
  },
  'SEBI Updates': {
    description: 'Plain-English summaries of SEBI circulars and regulatory changes.',
    long: 'We translate SEBI regulations into plain English so you know your rights and protections.',
  },
  General: {
    description: 'General insights and notes from Systematic Yield Analysts.',
    long: 'Miscellaneous notes from the SYA team.',
  },
};

/** Resolve a URL slug to the exact category name stored in the DB. */
async function resolveCategory(nameSlug: string): Promise<string | null> {
  const cats = await db.blogPost.findMany({
    where: { published: true },
    distinct: ['category'],
    select: { category: true },
  });
  const match = cats.find((c) => c.category.toLowerCase().replace(/\s+/g, '-') === decodeURIComponent(nameSlug));
  return match?.category ?? null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { name: nameSlug } = await params;
  const name = await resolveCategory(nameSlug);
  if (!name) return { title: 'Category not found' };
  const meta = CATEGORY_META[name] ?? CATEGORY_META.General;
  return {
    title: `${name} — Insights | Systematic Yield Analysts`,
    description: meta.description,
    alternates: { canonical: `https://systematicyield.in/blog/category/${nameSlug}` },
    openGraph: { title: `${name} — Insights`, description: meta.description, type: 'website' },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { name: nameSlug } = await params;
  const name = await resolveCategory(nameSlug);
  if (!name) notFound();

  const posts = await db.blogPost.findMany({
    where: { published: true, category: name },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true, title: true, excerpt: true, coverImage: true,
      category: true, author: true, createdAt: true,
    },
  });

  if (posts.length === 0) notFound();

  const mappedPosts: BlogListPost[] = posts;
  const categories = Array.from(new Set(posts.map((p) => p.category))) as string[];
  const meta = CATEGORY_META[name] ?? CATEGORY_META.General;

  return (
    <main className="min-h-screen bg-cf-bg text-cf-text relative overflow-hidden">
      {/* Ambient gold glow */}
      <div
        className="pointer-events-none absolute -top-24 left-10 w-[460px] h-[460px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.14), transparent 70%)' }}
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

          <div className="flex items-start gap-6">
            <div className="relative w-16 h-16 shrink-0 rounded-2xl border border-cf-gold/30 bg-cf-gold/[0.06] flex items-center justify-center text-cf-gold shadow-glow-gold">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
                <span className="block w-6 h-px bg-cf-gold opacity-70" />
                <FileText className="h-3.5 w-3.5" /> Category
              </p>
              <h1 className="mt-3 font-display font-normal text-[48px] md:text-[80px] leading-[0.95] tracking-[-0.01em] text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
                {name}
              </h1>
              <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-cf-mist animate-cf-reveal-up [animation-delay:160ms]">
                {meta.long}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-cf-text-muted font-data tabular-nums animate-cf-reveal-up [animation-delay:240ms]">
                <FileText className="h-4 w-4 text-cf-gold" /> {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts in this category */}
      <section className="wrap relative px-5 py-14 md:px-8 md:py-20">
        <h2 className="mb-8 font-display font-normal text-[32px] md:text-[44px] leading-tight tracking-[-0.01em] text-cf-text-strong">
          All articles in <span className="bg-cf-gold-gradient bg-clip-text text-transparent">{name}</span>
        </h2>
        <BlogBrowser posts={mappedPosts} categories={categories} />
      </section>
    </main>
  );
}
