import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/blogs/[slug]/view — increments the view count for a published post.
 *
 * Called client-side from the blog detail page (via useEffect) so the page
 * itself stays a pure read → ISR-cacheable (revalidate: 60s). The previous
 * fire-and-forget server-side increment made the page dynamic (uncacheable)
 * because it was a DB mutation inside a Server Component.
 *
 * Returns 204 (no content) on success — the client doesn't need the new count.
 * Returns 404 if the post doesn't exist or is unpublished (so a bot scanning
 * slugs doesn't get a 200 that pollutes view counts). Silently ignores DB
 * errors so a view-tracking failure never breaks the reading experience.
 *
 * No rate-limiting: a single increment per page-load is the intended UX. A
 * determined abuser could inflate counts, but view counts are display-only
 * (they power "popular posts" sorting) and carry no financial or auth weight.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!post || !post.published) {
      return new NextResponse(null, { status: 404 });
    }
    await db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    // Never break the reading experience over a view-count failure.
    return new NextResponse(null, { status: 204 });
  }
}
