import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/newsletter/unsubscribe
// Accepts { token } and deactivates the matching subscriber. Tokens are opaque
// 24-byte hex strings so they cannot be guessed — safe to put in a URL.
// We never reveal whether the token existed (always return success) to prevent
// enumeration, except when the token format is plainly invalid.
export async function POST(request: NextRequest) {
  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  // Reject obviously-malformed tokens early (defends against junk payloads).
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return NextResponse.json(
      { error: 'Invalid unsubscribe link. Please check your email for the correct link.' },
      { status: 400 }
    );
  }

  try {
    const sub = await db.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, active: true },
    });

    // Always succeed to prevent token enumeration.
    if (sub) {
      await db.newsletterSubscriber.update({
        where: { id: sub.id },
        data: { active: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed. We will not send you further emails.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or reply to any email for help.' },
      { status: 500 }
    );
  }
}
