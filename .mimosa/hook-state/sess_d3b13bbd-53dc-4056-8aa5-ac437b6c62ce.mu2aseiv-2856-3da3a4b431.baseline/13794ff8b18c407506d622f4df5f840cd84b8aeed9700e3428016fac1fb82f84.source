import Link from 'next/link';
import { TrendingUp, Eye, ArrowUpRight } from 'lucide-react';
import { db } from '@/lib/db';

/** "Popular Posts" widget — shows the top 5 most-viewed published posts.
 *  Server component, fetched at request time. Falls back gracefully (renders
 *  nothing) if there are no posts with views. Cinematic Finance styling:
 *  glassmorphic container with gold top-edge, ranked list with gold rank
 *  badges, hover lift on each item. */
export async function PopularPosts() {
  let posts: Array<{ slug: string; title: string; views: number; category: string }> = [];
  try {
    posts = await db.blogPost.findMany({
      where: { published: true, views: { gt: 0 } },
      orderBy: { views: 'desc' },
      take: 5,
      select: { slug: true, title: true, views: true, category: true },
    });
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <aside className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />

      {/* Header */}
      <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cf-gold/10 border border-cf-gold/30 text-cf-gold">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
          Popular this week
        </h2>
      </div>

      {/* Ranked list */}
      <ol className="relative p-2">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-160 hover:bg-cf-gold/[0.06]"
            >
              {/* Rank badge — gold gradient for #1, muted for the rest */}
              <span
                className={`font-data flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold tabular-nums ${
                  i === 0
                    ? 'bg-cf-gold-gradient text-cf-bg shadow-glow-gold'
                    : 'bg-white/[0.04] text-cf-mist border border-white/[0.08]'
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium leading-snug text-cf-text-strong group-hover:text-cf-gold transition-colors duration-160 line-clamp-2">
                  {post.title}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-cf-text-muted">
                  <span className="inline-flex items-center rounded-full border border-cf-glass-border bg-cf-glass-glow px-2 py-0.5 text-cf-text">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-data tabular-nums">
                    <Eye className="h-3 w-3 text-cf-gold" />
                    {post.views}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-cf-text-muted opacity-0 transition-opacity duration-240 group-hover:opacity-100 group-hover:text-cf-gold" />
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
