import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * GET /api/admin/blogs/word-counts — ADMIN
 *
 * Returns a { [slug]: { words, readingMins } } map for all blog posts in a
 * single DB call. The admin BlogsTab uses this to show a word-count / reading-
 * time column without the N+1 of fetching full content per post.
 *
 * Word count = content.trim().split(/\s+/).length (markdown syntax counts as
 * words, which is fine for a rough gauge). Reading time = max(1, round(words/200)).
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await db.blogPost.findMany({
      select: { slug: true, content: true },
    });
    const map: Record<string, { words: number; readingMins: number }> = {};
    for (const p of posts) {
      const words = p.content.trim() ? p.content.trim().split(/\s+/).length : 0;
      map[p.slug] = { words, readingMins: Math.max(1, Math.round(words / 200)) };
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error('Word-count fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch word counts' }, { status: 500 });
  }
}
