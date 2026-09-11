import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search?q=<query>&limit=<n>
// Server-side search across published blog posts (title, excerpt, content,
// category, author). Returns lightweight card data (no full content) so the
// search page can render results quickly.

const MAX_QUERY = 100;
const MAX_LIMIT = 24;
const MIN_QUERY_LEN = 2;

// Rate limit: 30 searches per minute per IP. Generous enough for a real user
// typing into a search box (one request per keystroke with debounce would be
// ~6-10 per minute), tight enough that a scripted enumeration of the search
// surface can't drown the DB. In-memory per-instance — see threat model §5
// for the residual risk of multi-instance bypass.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(req: NextRequest): string {
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (raw && /^[0-9a-fA-F.:]+$/.test(raw)) return raw;
  return 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Rate-limit BEFORE doing any DB work — a flood of search requests from
    // one IP shouldn't even reach the query planner.
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many search requests. Please slow down.' },
        { status: 429 },
      );
    }

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

    // Postgres ILIKE search across all text fields. Split the query into
    // terms and require each term to match somewhere (AND logic) for relevance.
    //
    // NOTE (audit response): the audit flagged this as "unindexed contains
    // scans". At our scale (~10-50 blog posts), a full table scan on a 5-field
    // OR is sub-millisecond. Switching to Postgres full-text search (tsvector
    // + GIN index + to_tsquery) is a real optimization but adds schema + a
    // migration + custom query surface area. Deferred until post count
    // exceeds ~1000 — see docs/THREAT_MODEL.md §5 (residual risk) for the
    // explicit decision. Rate limiting above closes the "flood the DB" half
    // of the audit finding.
    //
    // Switched from plain `contains` to explicit `mode: 'insensitive'` for
    // Postgres ILIKE behavior (real UX improvement — 'NIFTY' matches 'nifty').
    const terms = query.split(/\s+/).filter(Boolean);
    const where = {
      published: true,
      AND: terms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' as const } },
          { excerpt: { contains: term, mode: 'insensitive' as const } },
          { content: { contains: term, mode: 'insensitive' as const } },
          { category: { contains: term, mode: 'insensitive' as const } },
          { author: { contains: term, mode: 'insensitive' as const } },
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
