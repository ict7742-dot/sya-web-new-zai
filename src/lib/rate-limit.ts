/**
 * Shared in-memory rate limiter + client-IP extraction for all API routes.
 *
 * One implementation instead of five copy-pasted Maps. Entries are swept on
 * a lazy schedule (every SWEEP_INTERVAL) so the Map cannot grow unboundedly
 * with one entry per IP that ever hit the route.
 *
 * STILL per-instance: on serverless (Vercel) each warm instance keeps its own
 * Map, so a flood of cold starts can bypass a limit. This is a known residual
 * risk (docs/THREAT_MODEL.md §5); a durable backend (Upstash Redis / KV) can
 * be slotted in behind this same interface without touching the routes.
 */

import type { NextRequest } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();
const SWEEP_INTERVAL = 60_000;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Milliseconds until the bucket resets (0 when allowed). */
  retryAfterMs: number;
}

/**
 * Fixed-window counter. Returns ok=false once `max` hits are exceeded inside
 * `windowMs` for the same key (e.g. `ip`, `ip:route`, `ip:slug`).
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count++;
  if (bucket.count > max) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  return { ok: true, retryAfterMs: 0 };
}

/**
 * Extract the client IP from x-forwarded-for (first hop). On Vercel the
 * platform sets this header and it is trustworthy; when self-hosting behind
 * a proxy, the proxy must overwrite (not append to) client-supplied values
 * or this can be spoofed — see docs/THREAT_MODEL.md.
 */
export function getClientIp(req: NextRequest): string {
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (raw && /^[0-9a-fA-F.:]+$/.test(raw)) return raw;
  return 'unknown';
}
