import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * GET /api/admin/blogs — ADMIN, returns ALL posts including drafts.
 *
 * Query params:
 *   - `published=true|false`  Optional filter. Absent = return all (default).
 *   - `limit=N`               Defaults to 100, clamped to [1, 500].
 *
 * Unlike the public /api/blogs endpoint, this route:
 *   - Requires a valid admin session (revocable cookie — see src/lib/auth.ts)
 *   - May return posts with `published: false`
 *   - Returns the same field selection (no `content`) so it's a drop-in
 *     replacement for the admin dashboard's "list drafts" call.
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get('published');
    const limitParam = searchParams.get('limit');

    const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500);

    const where: Record<string, unknown> = {};
    if (publishedParam === 'true') where.published = true;
    else if (publishedParam === 'false') where.published = false;

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        author: true,
        published: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Admin blogs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
