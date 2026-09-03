import { timingSafeEqual } from 'crypto';

/**
 * Admin authentication helper.
 *
 * SECURITY: Uses `crypto.timingSafeEqual` for a constant-time comparison so the
 * admin Bearer token cannot be leaked via timing side-channels. A naive
 * `===` comparison short-circuits on the first differing byte, which lets an
 * attacker statistically recover the secret one character at a time.
 *
 * Returns `false` (fail-closed) if no `ADMIN_SECRET` is configured so the
 * admin endpoints are never accidentally left open.
 */
export function verifyAdmin(request: Request): boolean {
  const token = process.env.ADMIN_SECRET;
  if (!token) return false; // fail-closed: no secret configured => no access

  const auth = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${token}`;

  // Constant-time comparison. Guard against length differences (timingSafeEqual
  // throws when Buffer lengths differ) by comparing the lengths first in a
  // way that still always calls timingSafeEqual with equal-length buffers.
  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still perform a comparison against a fixed buffer of the expected length
    // so the call takes the same time regardless of the early-return outcome.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Look up the effective admin token (used for presence checks / health). */
export function adminTokenConfigured(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}
