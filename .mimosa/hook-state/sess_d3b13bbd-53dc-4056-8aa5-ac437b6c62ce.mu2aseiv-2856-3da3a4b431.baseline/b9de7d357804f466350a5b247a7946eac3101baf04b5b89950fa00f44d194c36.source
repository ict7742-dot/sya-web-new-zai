import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/admin/blogs/[slug] — ADMIN, returns the FULL post (including
 * draft body content). This is the counterpart to the public
 * GET /api/blogs/[slug] which filters `published: true`.
 *
 * Used by the admin dashboard's "Edit" action to populate the editor form
 * with the post's actual markdown content (the list endpoint at
 * /api/admin/blogs deliberately omits `content` to keep list payloads small).
 */
export async function GET(request: NextRequest, context: RouteContext) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const post = await db.blogPost.findUnique({ where: { slug } });

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Admin blog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}
