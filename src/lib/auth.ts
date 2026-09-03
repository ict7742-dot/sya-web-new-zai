import { timingSafeEqual } from 'crypto';

/** Cookie name used for the admin session token. */
export const ADMIN_COOKIE = 'sya_admin';

/**
 * Constant-time string comparison. Returns false (not throw) on length
 * mismatch so callers don't need try/catch.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still perform a comparison against a fixed buffer of the expected length
    // so the call takes the same time regardless of the early-return outcome.
    timingSafeEqual(bufB, bufB);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Admin authentication helper.
 *
 * Accepts the token from EITHER:
 *   1. An httpOnly cookie named `sya_admin` (preferred — not readable by JS)
 *   2. A Bearer Authorization header (backwards-compatible with existing
 *      admin dashboard code during the transition)
 *
 * SECURITY: Uses `crypto.timingSafeEqual` for a constant-time comparison so the
 * admin token cannot be leaked via timing side-channels.
 *
 * Returns `false` (fail-closed) if no `ADMIN_SECRET` is configured.
 */
export function verifyAdmin(request: Request): boolean {
  const token = process.env.ADMIN_SECRET;
  if (!token) return false;

  // 1. Check httpOnly cookie first (the secure path)
  const cookieToken = getCookie(request, ADMIN_COOKIE);
  if (cookieToken && safeEqual(cookieToken, token)) return true;

  // 2. Fall back to Bearer header (backwards-compatible)
  const auth = request.headers.get('authorization') ?? '';
  return safeEqual(auth, `Bearer ${token}`);
}

/** Extract a cookie value from a Request's Cookie header. */
export function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Cookie options for the admin session token. */
export const adminCookieOptions = {
  httpOnly: true, // not readable by JavaScript — XSS-safe
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Look up the effective admin token (used for presence checks / health). */
export function adminTokenConfigured(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}
