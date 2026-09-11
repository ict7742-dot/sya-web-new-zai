import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import {
  LENGTH_LIMITS,
  validateRequiredString,
  validateOptionalString,
  validateSlug,
  isSafeImageUrl,
  validationErrorResponse,
  bodyTooLarge,
  bodyTooLargeResponse,
  type ValidationErrors,
} from '@/lib/validation';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/blogs/[slug] — PUBLIC, returns full post including content.
// Hard-filters `published: true` — draft slugs get a 404, never the draft body.
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

// PUT /api/blogs/[slug] — ADMIN, updates a blog post.
// Validates every provided field via the shared helpers in src/lib/validation.ts
// (fixes the previous "no validation, .trim() before typeof check, 500 on bad
// input" bugs). Slug changes are honored — they're validated against the slug
// regex and a 409 is returned if the new slug collides with another post
// (either via pre-flight findUnique OR via the Postgres unique constraint,
// which we catch as P2002 and surface as a 409 too — closing the TOCTOU race).
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (bodyTooLarge(request)) {
    return bodyTooLargeResponse();
  }

  try {
    const { slug: oldSlug } = await context.params;
    const body = await request.json();

    // 404 early if the post doesn't exist — no point validating fields for a
    // ghost.
    const existing = await db.blogPost.findUnique({ where: { slug: oldSlug } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const errors: ValidationErrors = {};
    const update: Record<string, unknown> = {};

    // For each field that the client wants to update, validate it via the
    // shared helpers. The helpers write into `errors` and return the cleaned
    // value (or null). We accumulate updates into the `update` object and only
    // touch the DB if there are zero errors.
    if (body.title !== undefined) {
      const v = validateRequiredString(
        body.title, LENGTH_LIMITS.BLOG_TITLE, 'title', errors, { label: 'Title' },
      );
      if (v !== null) update.title = v;
    }
    if (body.slug !== undefined) {
      // Slug change is allowed — but validate the new slug + check uniqueness
      // against OTHER posts.
      const v = validateSlug(body.slug, errors);
      if (v !== null && v !== oldSlug) {
        update.slug = v;
      }
    }
    if (body.content !== undefined) {
      const v = validateRequiredString(
        body.content, LENGTH_LIMITS.BLOG_CONTENT, 'content', errors, { label: 'Content' },
      );
      if (v !== null) update.content = v;
    }
    if (body.excerpt !== undefined) {
      update.excerpt = validateOptionalString(
        body.excerpt, LENGTH_LIMITS.BLOG_EXCERPT, 'excerpt', errors, { label: 'Excerpt' },
      );
    }
    if (body.author !== undefined) {
      const v = validateOptionalString(
        body.author, LENGTH_LIMITS.BLOG_AUTHOR, 'author', errors, { label: 'Author' },
      );
      if (v !== null) update.author = v;
    }
    if (body.category !== undefined) {
      const v = validateOptionalString(
        body.category, LENGTH_LIMITS.BLOG_CATEGORY, 'category', errors, { label: 'Category' },
      );
      if (v !== null) update.category = v;
    }
    if (body.coverImage !== undefined) {
      if (!isSafeImageUrl(body.coverImage)) {
        errors.coverImage = 'Cover image must be a valid http(s) URL.';
      } else {
        update.coverImage = body.coverImage || null;
      }
    }
    if (body.published !== undefined) {
      if (typeof body.published !== 'boolean') {
        errors.published = 'Published must be a boolean.';
      } else {
        update.published = body.published;
      }
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // If slug is changing, verify the new slug isn't taken by a DIFFERENT post.
    // Done as a separate query (not a transaction) because Postgres enforces the
    // unique constraint atomically — if a concurrent request inserts the same
    // slug between our check and our update, the update will throw P2002, which
    // we catch below and return as a 409.
    if (update.slug && update.slug !== oldSlug) {
      const clash = await db.blogPost.findUnique({ where: { slug: update.slug as string } });
      if (clash) {
        return NextResponse.json(
          { error: 'A post with this slug already exists.', fields: { slug: 'Slug must be unique.' } },
          { status: 409 }
        );
      }
    }

    try {
      const post = await db.blogPost.update({
        where: { slug: oldSlug },
        data: update,
      });
      return NextResponse.json(post);
    } catch (error: unknown) {
      // P2002 = unique constraint violation. This happens if another request
      // inserted the new slug between our check and our update. Return 409
      // instead of 500.
      if (
        typeof error === 'object' && error !== null &&
        'code' in error && (error as { code: string }).code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'A post with this slug already exists.', fields: { slug: 'Slug must be unique.' } },
          { status: 409 }
        );
      }
      throw error; // re-throw — caught by outer try/catch
    }
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blogs/[slug] — ADMIN, deletes a blog post.
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await verifyAdmin(request))) {
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
