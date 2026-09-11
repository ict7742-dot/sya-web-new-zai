import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// Per-IP rate limit (in-memory, same pattern as leads).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 newsletter signups / min / IP

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = typeof body?.source === 'string' ? body.source : 'blog';

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!['blog', 'footer', 'landing'].includes(source)) {
      return NextResponse.json({ error: 'Invalid source.' }, { status: 400 });
    }

    // Upsert: if already subscribed, just reactivate silently so we never
    // leak whether an email is already on the list (anti-enumeration).
    // Generate a fresh opaque unsubscribe token on each (re)subscribe so the
    // user always has a valid one-click opt-out link (CAN-SPAM / GDPR).
    const unsubscribeToken = randomBytes(24).toString('hex');
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true, source, unsubscribeToken },
      create: { email, source, active: true, unsubscribeToken },
    });

    return NextResponse.json({
      success: true,
      message: 'You are subscribed! Watch your inbox for market insights.',
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/newsletter — ADMIN, returns subscriber count + recent subscribers.
// Supports ?format=csv for export. Public POST above stays unauthenticated.
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // CSV export of all subscribers
  if (format === 'csv') {
    try {
      const subs = await db.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        select: { email: true, source: true, active: true, createdAt: true },
      });

      const headers = ['Email', 'Source', 'Active', 'Subscribed At'];
      // CSV cell escaping with formula-injection defense (OWASP). See the
      // matching comment in /api/leads/route.ts for the rationale. Phase 5
      // will extract this into src/lib/csv.ts (safeCsvCell).
      const escape = (v: string | null | undefined) => {
        if (v == null) return '';
        let s = String(v);
        if (/^[=+\-@\t\r]/.test(s)) {
          s = `'${s}`;
        }
        return `"${s.replace(/"/g, '""')}"`;
      };

      const rows = subs.map((s) =>
        [escape(s.email), escape(s.source), escape(s.active ? 'Yes' : 'No'), escape(s.createdAt.toISOString())].join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sya-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    } catch (error) {
      console.error('Newsletter CSV export error:', error);
      return NextResponse.json({ error: 'Failed to export subscribers' }, { status: 500 });
    }
  }

  // Default JSON — supports pagination via ?page=N&pageSize=M
  try {
    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') ?? '10', 10) || 10, 1), 50);
    const skip = (page - 1) * pageSize;

    const [total, recent] = await Promise.all([
      db.newsletterSubscriber.count(),
      db.newsletterSubscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: { email: true, source: true, active: true, createdAt: true },
      }),
    ]);
    return NextResponse.json({
      total,
      recent,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Newsletter fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
