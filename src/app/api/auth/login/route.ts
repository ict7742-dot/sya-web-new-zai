import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, createSession } from '@/lib/auth';

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

/**
 * POST /api/auth/login
 * Body: { "password": "..." }
 *
 * Validates the password against ADMIN_SECRET using a constant-time comparison
 * (inside `createSession`). On success, mints a new revocable session: a
 * 256-bit random token is hashed with scrypt, the hash is persisted to
 * AdminSession, and the RAW token is set in an httpOnly cookie. The
 * ADMIN_SECRET itself never leaves the server — and a DB compromise can't
 * leak live sessions because the raw tokens are unrecoverable from the hashes.
 *
 * On failure, returns a generic 401 without revealing whether the secret is
 * configured. Rate-limited to 10 attempts/minute/IP.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a moment.' },
      { status: 429 },
    );
  }

  let password: string;
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const token = await createSession(password, {
    ip,
    userAgent: request.headers.get('user-agent'),
  });

  if (!token) {
    // Wrong password — OR — no ADMIN_SECRET configured. Same response either
    // way so an attacker can't distinguish the two cases.
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
