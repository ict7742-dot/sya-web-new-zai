import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { BlogBrowser, type BlogListPost } from '../../blog-browser';
import { ArrowLeft, FileText, PenLine } from 'lucide-react';

type Params = { name: string };

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Resolve a URL slug to the exact author name stored in the DB. Fetches all
 *  distinct authors and matches by slug so acronyms (NISM, SYA) are preserved. */
async function resolveAuthor(nameSlug: string): Promise<string | null> {
  const authors = await db.blogPost.findMany({
    where: { published: true },
    distinct: ['author'],
    select: { author: true },
  });
  const match = authors.find((a) => nameToSlug(a.author) === decodeURIComponent(nameSlug));
  return match?.author ?? null;
}

/** Short, human-readable author bios keyed by known author name. */
const AUTHOR_BIOS: Record<string, string> = {
  'SYA Desk': 'Market commentary and index analysis from the SYA research desk. Data-driven notes, no tips.',
  'NISM Faculty': 'Educators certified by NISM. Our faculty writes about derivatives, risk and trading discipline.',
  'Compliance Desk': 'Regulatory and compliance notes. We translate SEBI circulars into plain English.',
  'Academy Team': 'Updates from the SYA Academy — batch announcements, curriculum notes and student resources.',
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { name: nameSlug } = await params;
  const name = await resolveAuthor(nameSlug);
  if (!name) return { title: 'Author not found' };
  return {
    title: `${name} — Author at Systematic Yield Analysts`,
    description: AUTHOR_BIOS[name] ?? `Articles by ${name}.`,
    alternates: { canonical: `https://systematicyield.in/blog/author/${nameSlug}` },
    openGraph: { title: `${name} — Author`, description: AUTHOR_BIOS[name] ?? '', type: 'profile' },
  };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { name: nameSlug } = await params;
  const name = await resolveAuthor(nameSlug);
  if (!name) notFound();

  const posts = await db.blogPost.findMany({
    where: { published: true, author: name },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true, title: true, excerpt: true, coverImage: true,
      category: true, author: true, createdAt: true,
    },
  });

  if (posts.length === 0) notFound();

  const mappedPosts: BlogListPost[] = posts;
  const categories = Array.from(new Set(posts.map((p) => p.category))) as string[];
  const bio = AUTHOR_BIOS[name] ?? 'Contributor at Systematic Yield Analysts.';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <main className="min-h-screen bg-cf-bg text-cf-text relative overflow-hidden">
      {/* Ambient gold glow */}
      <div
        className="pointer-events-none absolute -top-24 right-0 w-[460px] h-[460px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
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

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Author avatar — gold gradient ring with initials */}
            <div className="relative w-20 h-20 shrink-0 rounded-full p-[2px] bg-cf-gold-gradient shadow-glow-gold">
              <div className="w-full h-full rounded-full bg-cf-bg-elevated flex items-center justify-center font-display text-[28px] tracking-[-0.01em] text-cf-gold">
                {initials}
              </div>
            </div>
            <div>
              <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
                <span className="block w-6 h-px bg-cf-gold opacity-70" />
                <PenLine className="h-3.5 w-3.5" /> Author
              </p>
              <h1 className="mt-3 font-display font-normal text-[48px] md:text-[80px] leading-[0.95] tracking-[-0.01em] text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
                {name}
              </h1>
              <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-cf-mist animate-cf-reveal-up [animation-delay:160ms]">
                {bio}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cf-text-muted font-data tabular-nums animate-cf-reveal-up [animation-delay:240ms]">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-cf-gold" /> {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                </span>
                {categories.length > 1 && (
                  <span className="inline-flex items-center gap-2">
                    {categories.map((c) => (
                      <span key={c} className="rounded-full border border-cf-glass-border bg-cf-glass-glow px-2.5 py-0.5 text-xs text-cf-text">
                        {c}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts by this author */}
      <section className="wrap relative px-5 py-14 md:px-8 md:py-20">
        <h2 className="mb-8 font-display font-normal text-[32px] md:text-[44px] leading-tight tracking-[-0.01em] text-cf-text-strong">
          Articles by <span className="bg-cf-gold-gradient bg-clip-text text-transparent">{name}</span>
        </h2>
        <BlogBrowser posts={mappedPosts} categories={categories} />
      </section>
    </main>
  );
}
