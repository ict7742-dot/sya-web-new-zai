import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import {
  LENGTH_LIMITS,
  validateRequiredString,
  validateOptionalString,
  validateEmail,
  validateIndianPhone,
  validationErrorResponse,
  bodyTooLarge,
  bodyTooLargeResponse,
  type ValidationErrors,
} from '@/lib/validation';
import { safeCsvCell } from '@/lib/csv';

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
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (raw && /^[0-9a-fA-F.:]+$/.test(raw)) return raw;
  return 'unknown';
}

const VALID_INTERESTS = new Set(['account', 'courses', 'both']);

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
    // Body-size policy (1 MB default — generous for a lead form payload which
    // is at most a few hundred bytes; anything bigger is suspicious).
    if (bodyTooLarge(request)) {
      return bodyTooLargeResponse();
    }

    const body = await request.json();
    const { name, phone, email, interest, message, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, landingPage } = body;

    // Server-side validation — shared helpers from src/lib/validation.ts
    const errors: ValidationErrors = {};

    const finalName = validateRequiredString(
      name, LENGTH_LIMITS.LEAD_NAME, 'name', errors, { minLength: 3, label: 'Name' }
    );
    const finalPhone = validateIndianPhone(phone, errors);
    const finalEmail = validateEmail(email, errors);

    if (!interest || !VALID_INTERESTS.has(interest)) {
      errors.interest = 'Please select a valid option.';
    }

    const finalMessage = validateOptionalString(
      message, LENGTH_LIMITS.LEAD_MESSAGE, 'message', errors, { label: 'Message' }
    );

    // UTM params are optional but bounded — generous cap so a 100KB utm_source
    // doesn't bloat the row.
    const MAX_UTM = 500;
    const utmSourceTrim = typeof utmSource === 'string' ? utmSource.slice(0, MAX_UTM) : null;
    const utmMediumTrim = typeof utmMedium === 'string' ? utmMedium.slice(0, MAX_UTM) : null;
    const utmCampaignTrim = typeof utmCampaign === 'string' ? utmCampaign.slice(0, MAX_UTM) : null;
    const utmTermTrim = typeof utmTerm === 'string' ? utmTerm.slice(0, MAX_UTM) : null;
    const utmContentTrim = typeof utmContent === 'string' ? utmContent.slice(0, MAX_UTM) : null;
    const landingPageTrim = typeof landingPage === 'string' ? landingPage.slice(0, 2048) : null;

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Save to database with UTM data
    const lead = await db.lead.create({
      data: {
        name: finalName!,
        phone: finalPhone!,
        email: finalEmail!,
        interest,
        message: finalMessage,
        source: 'website',
        utmSource: utmSourceTrim,
        utmMedium: utmMediumTrim,
        utmCampaign: utmCampaignTrim,
        utmTerm: utmTermTrim,
        utmContent: utmContentTrim,
        landingPage: landingPageTrim,
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
      firstName: finalName!.split(' ')[0],
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

// GET endpoint for admin (count + recent leads) — requires admin session
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
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

      const rows = leads.map((l) => [
        safeCsvCell(l.name),
        safeCsvCell(l.phone),
        safeCsvCell(l.email),
        safeCsvCell(l.interest),
        safeCsvCell(l.message),
        safeCsvCell(l.source),
        safeCsvCell(l.utmSource),
        safeCsvCell(l.utmMedium),
        safeCsvCell(l.utmCampaign),
        safeCsvCell(l.utmTerm),
        safeCsvCell(l.utmContent),
        safeCsvCell(l.landingPage),
        safeCsvCell(l.createdAt.toISOString()),
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

  // Default JSON response — supports pagination via ?page=N&pageSize=M
  try {
    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') ?? '10', 10) || 10, 1), 50);
    const skip = (page - 1) * pageSize;

    const [total, recent] = await Promise.all([
      db.lead.count(),
      db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          name: true, phone: true, email: true, interest: true,
          createdAt: true, utmSource: true, utmMedium: true, utmCampaign: true,
        },
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
    console.error('Leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
