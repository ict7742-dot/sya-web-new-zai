import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { BlogBrowser, type BlogListPost } from '../../blog-browser';
import { ArrowLeft, FileText, PenLine, Calendar } from 'lucide-react';

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

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Author avatar — gold gradient ring with initials */}
            <div className="author-avatar-lg">{initials}</div>
            <div>
              <div className="eyebrow reveal in">
                <PenLine className="h-3.5 w-3.5" /> Author
              </div>
              <h1 className="reveal in mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-tight md:text-5xl">
                {name}
              </h1>
              <p className="reveal in d1 mt-3 max-w-xl text-[15.5px] leading-relaxed text-[#98A2B8]">
                {bio}
              </p>
              <div className="reveal in d2 mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#525C70]">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#E2B15C]" /> {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                </span>
                {categories.length > 1 && (
                  <span className="inline-flex items-center gap-2">
                    {categories.map((c) => (
                      <span key={c} className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-xs text-[#C6CDDB] ring-1 ring-white/[0.08]">
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
      <section className="wrap px-5 py-14 md:px-8 md:py-20">
        <h2 className="mb-8 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#E8EBF2]">
          Articles by {name}
        </h2>
        <BlogBrowser posts={mappedPosts} categories={categories} />
      </section>
    </main>
  );
}
