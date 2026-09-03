import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// Rate limit store (in-memory, per server instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute per IP

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
  // Behind Caddy/Vercel the proxy sets x-forwarded-for. Take the first hop and
  // validate it looks like an IP so a malicious header value can't poison the
  // rate-limit key with arbitrary strings.
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (raw && /^[0-9a-fA-F.:]+$/.test(raw)) return raw;
  return 'unknown';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(digits) && /^[6-9]/.test(digits);
}

// Hard length caps to prevent oversized payloads bloating the DB / causing DoS.
const MAX_NAME = 120;
const MAX_EMAIL = 254; // RFC 5321 practical limit
const MAX_MESSAGE = 2000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, email, interest, message, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, landingPage } = body;

    // Server-side validation
    const errors: Record<string, string> = {};

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      errors.name = 'Please enter your full name.';
    } else if (name.trim().length > MAX_NAME) {
      errors.name = `Name must be ${MAX_NAME} characters or fewer.`;
    }

    if (!phone || typeof phone !== 'string' || !isValidIndianPhone(phone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      errors.email = 'Enter a valid email address.';
    } else if (email.trim().length > MAX_EMAIL) {
      errors.email = 'Email address is too long.';
    }

    if (!interest || !['account', 'courses', 'both'].includes(interest)) {
      errors.interest = 'Please select a valid option.';
    }

    if (message && typeof message === 'string' && message.trim().length > MAX_MESSAGE) {
      errors.message = `Message must be ${MAX_MESSAGE} characters or fewer.`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 });
    }

    // Save to database with UTM data
    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        interest,
        message: message?.trim() || null,
        source: 'website',
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        landingPage: landingPage || null,
      },
    });

    // Determine redirect URL for Angel One eKYC
    let ekycUrl: string | null = null;
    if (interest === 'account' || interest === 'both') {
      // Angel One referral signup link (placeholder — replace with actual referral URL)
      ekycUrl = 'https://angelone.in/?ref=systematicyield';
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      firstName: name.trim().split(' ')[0],
      interest,
      ekycUrl,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}

// GET endpoint for admin (count + recent leads) — requires Bearer token auth
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // CSV export
  if (format === 'csv') {
    try {
      const leads = await db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          name: true, phone: true, email: true, interest: true,
          message: true, source: true, createdAt: true,
          utmSource: true, utmMedium: true, utmCampaign: true,
          utmTerm: true, utmContent: true, landingPage: true,
        },
      });

      const headers = [
        'Name', 'Phone', 'Email', 'Interest', 'Message', 'Source',
        'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Term', 'UTM Content',
        'Landing Page', 'Submitted At',
      ];

      const escape = (v: string | null | undefined) => {
        if (v == null) return '';
        return `"${String(v).replace(/"/g, '""')}"`;
      };

      const rows = leads.map((l) => [
        escape(l.name),
        escape(l.phone),
        escape(l.email),
        escape(l.interest),
        escape(l.message),
        escape(l.source),
        escape(l.utmSource),
        escape(l.utmMedium),
        escape(l.utmCampaign),
        escape(l.utmTerm),
        escape(l.utmContent),
        escape(l.landingPage),
        escape(l.createdAt.toISOString()),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sya-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    } catch (error) {
      console.error('Leads CSV export error:', error);
      return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 });
    }
  }

  // Default JSON response
  try {
    const total = await db.lead.count();
    const recent = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        name: true, phone: true, email: true, interest: true,
        createdAt: true, utmSource: true, utmMedium: true, utmCampaign: true,
      },
    });
    return NextResponse.json({ total, recent });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
