import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';

/** Cookie name used for the admin session token. */
export const ADMIN_COOKIE = 'sya_admin';

/** Session lifetime: 7 days, in seconds (used for both DB expiry and cookie maxAge). */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** scrypt parameters. N=2^14, r=8, p=1 — about ~30 ms per hash, fine for low-volume auth.
 *  Sync API used because this is not a hot path; we run scrypt at most twice per
 *  admin request (once during verify, once during mint). */
const SCRYPT_KEYLEN = 32;
const SCRYPT_SALT = 'sya-admin-session-v1'; // static salt — token already has 256 bits of entropy

/** Cookie options for the admin session token. */
export const adminCookieOptions = {
  httpOnly: true, // not readable by JavaScript — XSS-safe
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // CSRF protection
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};

/** Look up the effective admin token (used for presence checks / health). */
export function adminTokenConfigured(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}

/**
 * Constant-time string comparison. Returns false (not throw) on length
 * mismatch so callers don't need try/catch.
 */
function safeEqualStr(a: string, b: string): boolean {
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

/** Hash a raw session token with scrypt. Returns hex string for DB storage. */
function hashToken(rawToken: string): string {
  return scryptSync(rawToken, SCRYPT_SALT, SCRYPT_KEYLEN).toString('hex');
}

/** Extract a cookie value from a Request's Cookie header. */
export function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface SessionMeta {
  ip: string | null;
  userAgent: string | null;
}

/**
 * Verify the admin password and mint a new session. Persists only the scrypt
 * hash of the token — the raw token is returned to the caller so it can be
 * written to the httpOnly cookie and never stored server-side.
 *
 * Returns the raw token on success, or null on failure (wrong password or
 * no ADMIN_SECRET configured). The caller is responsible for not leaking
 * which of the two failure reasons triggered the null.
 */
export async function createSession(
  password: string,
  meta: SessionMeta,
): Promise<string | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  if (!safeEqualStr(password, secret)) return null;

  // 256-bit random token. base64url keeps it URL-safe for a cookie value.
  const rawToken = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(rawToken);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

  await db.adminSession.create({
    data: {
      tokenHash,
      expiresAt,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  return rawToken;
}

/**
 * Authenticate an incoming request against the revocable session table.
 *
 * Flow:
 *   1. Read the `sya_admin` httpOnly cookie. If absent → not authenticated.
 *   2. scrypt-hash the presented token.
 *   3. Look up `AdminSession` by `tokenHash` (unique index).
 *   4. Reject if not found, expired (`expiresAt <= now`), or revoked.
 *
 * Returns `false` (fail-closed) if no ADMIN_SECRET is configured or if any
 * step doesn't match.
 */
export async function verifyAdmin(request: Request): Promise<boolean> {
  if (!process.env.ADMIN_SECRET) return false;

  const rawToken = getCookie(request, ADMIN_COOKIE);
  if (!rawToken) return false;

  // scrypt throws if the input is malformed (e.g. contains bytes outside the
  // base64url alphabet after decoding). We treat any error as "not a valid
  // token" rather than crashing the request.
  let tokenHash: string;
  try {
    tokenHash = hashToken(rawToken);
  } catch {
    return false;
  }

  const session = await db.adminSession.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, revokedAt: true },
  });
  if (!session) return false;

  if (session.revokedAt !== null) return false;
  if (session.expiresAt.getTime() <= Date.now()) return false;

  return true;
}

/**
 * Revoke the session identified by the cookie on this request (if any).
 * Idempotent: returns true even if no session matches (so logout always works).
 */
export async function revokeCurrentSession(request: Request): Promise<void> {
  const rawToken = getCookie(request, ADMIN_COOKIE);
  if (!rawToken) return;

  let tokenHash: string;
  try {
    tokenHash = hashToken(rawToken);
  } catch {
    return;
  }

  await db.adminSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke every active session. Used by the "log out everywhere" admin action.
 * Returns the count of sessions revoked.
 */
export async function revokeAllSessions(): Promise<number> {
  const result = await db.adminSession.updateMany({
    where: { revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
