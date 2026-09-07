import Link from 'next/link';
import { db } from '@/lib/db';
import { TrendingUp, Eye, ArrowUpRight } from 'lucide-react';

/** "Popular Posts" widget — shows the top 5 most-viewed published posts.
 *  Server component, fetched at request time. Falls back gracefully (renders
 *  nothing) if there are no posts with views. */
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
    <aside className="popular-widget">
      <div className="popular-widget-header">
        <span className="popular-widget-icon">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="popular-widget-title">Popular this week</h2>
      </div>
      <ol className="popular-widget-list">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="popular-item group">
              <span className="popular-rank">{i + 1}</span>
              <div className="popular-item-text">
                <p className="popular-item-title group-hover:text-[#E2B15C] transition-colors">
                  {post.title}
                </p>
                <span className="popular-item-meta">
                  <span className="popular-item-cat">{post.category}</span>
                  <span className="popular-item-views">
                    <Eye className="h-3 w-3" />
                    {post.views} {post.views === 1 ? 'view' : 'views'}
                  </span>
                </span>
              </div>
              <ArrowUpRight className="popular-item-arrow" />
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
