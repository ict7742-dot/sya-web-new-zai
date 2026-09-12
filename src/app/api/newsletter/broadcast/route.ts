import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { bodyTooLarge, bodyTooLargeResponse } from '@/lib/validation';

/**
 * POST /api/newsletter/broadcast — ADMIN
 *
 * Sends a broadcast email to all active newsletter subscribers.
 *
 * Request body: { subject: string, body: string }
 * Response: { sent: number, total: number, dryRun: boolean }
 *
 * Email provider: uses Resend (https://resend.com) when RESEND_API_KEY is set.
 * If the key is absent (local dev / sandbox), the endpoint runs in DRY-RUN
 * mode — it counts the recipients + logs the would-be send, but does not
 * actually send. This keeps the feature usable in environments without an
 * email provider configured.
 *
 * Rate-limit: 1 broadcast per 30 seconds per admin (in-memory). Prevents
 * accidental double-sends. Serverless multi-instance bypass is a known
 * residual risk (documented in docs/THREAT_MODEL.md §5).
 *
 * The send loop is sequential + best-effort: a single subscriber's send
 * failure does not abort the batch. The response reports `sent` (successes)
 * vs `total` (attempted) so the admin knows if any failed.
 */

const MAX_SUBJECT = 200;
const MAX_BODY = 10_000;

// Per-IP broadcast rate limit (more conservative than the signup limit).
const broadcastRateMap = new Map<string, { lastAt: number }>();
const BROADCAST_COOLDOWN = 30_000; // 30 seconds

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (bodyTooLarge(request)) {
    return bodyTooLargeResponse();
  }

  // Broadcast cooldown — prevent accidental double-send within 30s.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const last = broadcastRateMap.get(ip);
  if (last && now - last.lastAt < BROADCAST_COOLDOWN) {
    const wait = Math.ceil((BROADCAST_COOLDOWN - (now - last.lastAt)) / 1000);
    return NextResponse.json(
      { error: `Please wait ${wait}s before sending another broadcast.` },
      { status: 429 },
    );
  }
  broadcastRateMap.set(ip, { lastAt: now });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject.trim().slice(0, MAX_SUBJECT) : '';
  const text = typeof body?.body === 'string' ? body.body.trim().slice(0, MAX_BODY) : '';

  if (!subject || !text) {
    return NextResponse.json(
      { error: 'Subject and body are required.', fields: { subject: !subject ? 'Subject is required.' : null, body: !text ? 'Body is required.' : null } },
      { status: 400 },
    );
  }

  // Fetch all active subscribers.
  const subscribers = await db.newsletterSubscriber.findMany({
    where: { active: true },
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, total: 0, dryRun: false, message: 'No active subscribers to send to.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'connect@systematicyield.in';
  const dryRun = !apiKey;

  if (dryRun) {
    // Dry-run mode: no email provider configured. Log + return the count.
    console.log(`[broadcast dry-run] subject="${subject}" recipients=${subscribers.length} bodyLen=${text.length}`);
    return NextResponse.json({
      sent: subscribers.length,
      total: subscribers.length,
      dryRun: true,
      message: `Dry-run: ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''} would receive "${subject}". Set RESEND_API_KEY to send for real.`,
    });
  }

  // Real send via Resend. Sequential + best-effort — a single failure does
  // not abort the batch.
  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: sub.email,
          subject,
          text,
        }),
      });
      if (res.ok) sent++;
      else failed++;
    } catch {
      failed++;
    }
  }

  console.log(`[broadcast] subject="${subject}" sent=${sent} failed=${failed} total=${subscribers.length}`);
  return NextResponse.json({
    sent,
    total: subscribers.length,
    dryRun: false,
    failed,
    message: `Sent to ${sent} of ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}.${failed > 0 ? ` ${failed} failed.` : ''}`,
  });
}
