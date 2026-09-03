import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/blogs/[slug] — PUBLIC, returns full post including content
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const post = await db.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

// PUT /api/blogs/[slug] — ADMIN, updates a blog post
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { title, excerpt, content, coverImage, category, author, published } = body;

    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const post = await db.blogPost.update({
      where: { slug },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
        ...(content !== undefined && { content: content.trim() }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(category !== undefined && { category: category?.trim() || 'General' }),
        ...(author !== undefined && { author: author?.trim() || 'SYA Team' }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blogs/[slug] — ADMIN, deletes a blog post
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await context.params;

    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.blogPost.delete({ where: { slug } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Blog delete error:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
