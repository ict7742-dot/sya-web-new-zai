import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Reject obviously-malicious cover image URLs (javascript:, data: payloads, etc.)
// while still allowing https image hosts.
const MAX_TITLE = 200;
const MAX_EXCERPT = 600;
const MAX_CONTENT = 50000;
const MAX_AUTHOR = 120;
const MAX_CATEGORY = 60;

function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return true; // optional field
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const u = new URL(url);
    // Only allow http(s) and a reasonable host. Blocks javascript:/data: schemes.
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.hostname;
  } catch {
    return false;
  }
}

// GET /api/blogs — PUBLIC, returns published posts (no content field)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limitParam = searchParams.get('limit');
    const category = searchParams.get('category');

    const limit = Math.min(Math.max(parseInt(limitParam || '6', 10) || 6, 1), 100);

    const where: Record<string, unknown> = {};
    if (published === null || published === 'true') {
      where.published = true;
    }
    if (category) {
      where.category = category;
    }

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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Blogs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/blogs — ADMIN, creates a new blog post
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, author, published } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.title = 'Title is required.';
    } else if (title.trim().length > MAX_TITLE) {
      errors.title = `Title must be ${MAX_TITLE} characters or fewer.`;
    }

    const finalSlug = slug?.trim() ? slug.trim() : generateSlug(title);
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      errors.content = 'Content is required.';
    } else if (content.trim().length > MAX_CONTENT) {
      errors.content = `Content must be ${MAX_CONTENT} characters or fewer.`;
    }

    if (excerpt && typeof excerpt === 'string' && excerpt.trim().length > MAX_EXCERPT) {
      errors.excerpt = `Excerpt must be ${MAX_EXCERPT} characters or fewer.`;
    }

    if (author && typeof author === 'string' && author.trim().length > MAX_AUTHOR) {
      errors.author = `Author must be ${MAX_AUTHOR} characters or fewer.`;
    }

    if (category && typeof category === 'string' && category.trim().length > MAX_CATEGORY) {
      errors.category = `Category must be ${MAX_CATEGORY} characters or fewer.`;
    }

    if (!isSafeImageUrl(coverImage)) {
      errors.coverImage = 'Cover image must be a valid http(s) URL.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 });
    }

    // Check for existing slug
    const existing = await db.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(
        { error: 'A post with this slug already exists.', fields: { slug: 'Slug must be unique.' } },
        { status: 409 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage || null,
        category: category?.trim() || 'General',
        author: author?.trim() || 'SYA Team',
        published: typeof published === 'boolean' ? published : false,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
