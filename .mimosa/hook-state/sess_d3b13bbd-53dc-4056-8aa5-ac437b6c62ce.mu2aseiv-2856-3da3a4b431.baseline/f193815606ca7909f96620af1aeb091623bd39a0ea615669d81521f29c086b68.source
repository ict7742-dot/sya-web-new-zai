import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import {
  LENGTH_LIMITS,
  isSafeImageUrl,
  generateSlug,
  validateSlug,
  validateRequiredString,
  validateOptionalString,
  validationErrorResponse,
  bodyTooLarge,
  bodyTooLargeResponse,
  type ValidationErrors,
} from '@/lib/validation';

// generateSlug + isSafeImageUrl + MAX_* constants moved to src/lib/validation.ts
// (shared helpers in Phase 5 redo). Import from there.

// GET /api/blogs — PUBLIC, returns PUBLISHED posts only (no content field).
// SECURITY: the `published` filter is hard-coded to true and is NOT
// controllable via query string. Drafts are never exposed on the public
// surface — admins must use /api/admin/blogs (auth-gated) for draft access.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const category = searchParams.get('category');

    const limit = Math.min(Math.max(parseInt(limitParam || '6', 10) || 6, 1), 100);

    const where: Record<string, unknown> = { published: true };
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
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (bodyTooLarge(request)) {
    return bodyTooLargeResponse();
  }

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, author, published } = body;

    // Validation — shared helpers from src/lib/validation.ts
    const errors: ValidationErrors = {};

    const finalTitle = validateRequiredString(
      title, LENGTH_LIMITS.BLOG_TITLE, 'title', errors, { label: 'Title' },
    );
    const finalContent = validateRequiredString(
      content, LENGTH_LIMITS.BLOG_CONTENT, 'content', errors, { label: 'Content' },
    );

    // Slug: if provided, validate; if not, derive from title.
    const finalSlug = slug?.trim()
      ? validateSlug(slug, errors)
      : (finalTitle ? generateSlug(finalTitle) : '');
    if (finalTitle && !finalSlug) {
      // generateSlug produced an empty string (e.g. title was all non-ASCII).
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }

    const finalExcerpt = validateOptionalString(
      excerpt, LENGTH_LIMITS.BLOG_EXCERPT, 'excerpt', errors, { label: 'Excerpt' },
    );
    const finalAuthor = validateOptionalString(
      author, LENGTH_LIMITS.BLOG_AUTHOR, 'author', errors, { label: 'Author' },
    ) ?? 'SYA Team';
    const finalCategory = validateOptionalString(
      category, LENGTH_LIMITS.BLOG_CATEGORY, 'category', errors, { label: 'Category' },
    ) ?? 'General';

    if (!isSafeImageUrl(coverImage)) {
      errors.coverImage = 'Cover image must be a valid http(s) URL.';
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Slug-uniqueness check + create. We still do the upfront findUnique so
    // we can return a friendly 409 BEFORE attempting the create — but the
    // actual race window is closed by the Postgres unique constraint on
    // BlogPost.slug. If a concurrent request inserts the same slug between
    // our check and our create, Prisma throws P2002, which we catch and
    // also return as a 409.
    const existing = await db.blogPost.findUnique({ where: { slug: finalSlug! } });
    if (existing) {
      return NextResponse.json(
        { error: 'A post with this slug already exists.', fields: { slug: 'Slug must be unique.' } },
        { status: 409 },
      );
    }

    try {
      const post = await db.blogPost.create({
        data: {
          title: finalTitle!,
          slug: finalSlug!,
          content: finalContent!,
          excerpt: finalExcerpt,
          coverImage: coverImage || null,
          category: finalCategory,
          author: finalAuthor,
          published: typeof published === 'boolean' ? published : false,
        },
      });
      return NextResponse.json(post, { status: 201 });
    } catch (error: unknown) {
      // P2002 = unique constraint violation. Happens if another request
      // inserted the same slug between our check and our create.
      if (
        typeof error === 'object' && error !== null &&
        'code' in error && (error as { code: string }).code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'A post with this slug already exists.', fields: { slug: 'Slug must be unique.' } },
          { status: 409 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
