import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Params = { slug: string };

/** Static metadata per post so each article gets its own OG title/description. */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return { title: 'Article not found' };
  return {
    title: `${post.title} — Systematic Yield Analysts`,
    description: post.excerpt ?? 'Insights from Systematic Yield Analysts',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      type: 'article',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    alternates: { canonical: `https://systematicyield.in/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <article className="min-h-screen bg-[#070B14] text-[#E8EBF2]">
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <Link
          href="/#blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#98A2B8] transition-colors hover:text-[#E2B15C]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Insights
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-[#E2B15C]">
          <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{post.category}</span>
        </div>

        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-tight md:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-[#98A2B8]">{post.excerpt}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-5 border-y border-white/10 py-4 text-sm text-[#98A2B8]">
          <span className="inline-flex items-center gap-2">
            <User className="h-4 w-4 text-[#E2B15C]" /> {post.author}
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#E2B15C]" /> {fmt(post.createdAt)}
          </span>
        </div>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-xl border border-white/10 object-cover"
          />
        )}

        {/* react-markdown escapes HTML by default and only renders known nodes,
            so untrusted Markdown content can't inject scripts. */}
        <div className="markdown-body mt-10">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
