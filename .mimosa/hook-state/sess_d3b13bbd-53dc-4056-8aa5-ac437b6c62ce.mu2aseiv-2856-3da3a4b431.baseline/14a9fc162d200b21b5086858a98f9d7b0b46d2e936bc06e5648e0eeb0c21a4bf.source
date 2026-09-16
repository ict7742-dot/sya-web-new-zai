import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, revokeCurrentSession } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * Revokes the session identified by the cookie on this request (if any), then
 * clears the cookie. Idempotent — a second call with no cookie still returns
 * 200. After this returns, the same cookie value can no longer authenticate
 * any admin request because its row in AdminSession has `revokedAt` set.
 */
export async function POST(request: NextRequest) {
  await revokeCurrentSession(request);

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return res;
}
