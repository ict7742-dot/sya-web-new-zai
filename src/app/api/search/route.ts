import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search?q=<query>&limit=<n>
// Server-side search across published blog posts (title, excerpt, content,
// category, author). Returns lightweight card data (no full content) so the
// search page can render results quickly.
const MAX_QUERY = 100;
const MAX_LIMIT = 24;
const MIN_QUERY_LEN = 2;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') ?? '';
    const query = rawQuery.trim().slice(0, MAX_QUERY);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '12', 10) || 12, 1),
      MAX_LIMIT
    );

    if (query.length < MIN_QUERY_LEN) {
      return NextResponse.json({
        query,
        results: [],
        total: 0,
        message: `Please enter at least ${MIN_QUERY_LEN} characters.`,
      });
    }

    // SQLite LIKE search across all text fields. Split the query into terms
    // and require each term to match somewhere (AND logic) for relevance.
    const terms = query.split(/\s+/).filter(Boolean);
    const where = {
      published: true,
      AND: terms.map((term) => ({
        OR: [
          { title: { contains: term } },
          { excerpt: { contains: term } },
          { content: { contains: term } },
          { category: { contains: term } },
          { author: { contains: term } },
        ],
      })),
    };

    const [results, total] = await Promise.all([
      db.blogPost.findMany({
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
          createdAt: true,
        },
      }),
      db.blogPost.count({ where }),
    ]);

    return NextResponse.json({ query, results, total });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
