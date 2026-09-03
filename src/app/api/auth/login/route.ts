import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth';

// Per-IP rate limit for login attempts (prevents brute-force).
const loginLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 60_000; // 1 minute
const MAX_ATTEMPTS = 10; // 10 attempts per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    loginLimitMap.set(ip, { count: 1, resetAt: now + WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

function getClientIp(req: NextRequest): string {
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (raw && /^[0-9a-fA-F.:]+$/.test(raw)) return raw;
  return 'unknown';
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufB, bufB);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/auth/login
 * Body: { "password": "..." }
 *
 * Validates the password against ADMIN_SECRET using a constant-time comparison.
 * On success, sets an httpOnly cookie with the token and returns 200.
 * On failure, returns 401 without revealing whether the secret is configured.
 *
 * Rate-limited to 10 attempts/minute/IP to prevent brute-force attacks.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a moment.' },
      { status: 429 }
    );
  }

  let password: string;
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // Fail-closed but return a generic 401 so the absence of a configured
    // secret isn't leaked to the client.
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  if (!safeEqual(password, secret)) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  // Set the httpOnly cookie and return success.
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, secret, adminCookieOptions);
  return res;
}
