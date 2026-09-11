import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, revokeCurrentSession, revokeAllSessions } from '@/lib/auth';

/**
 * POST /api/auth/revoke
 *
 * Requires an active admin session (the cookie on this request).
 *
 * Body (optional): { "all": boolean }
 *   - `all: true`  → revoke EVERY active session ("log out everywhere" —
 *                    use this after a suspected cookie compromise or a credential
 *                    rotation). Returns `{ revoked: <count> }`.
 *   - `all: false` or absent → revoke only the current session. Same effect as
 *                    /api/auth/logout but kept as a distinct endpoint so the
 *                    semantics are explicit. Returns `{ revoked: 1 }` (best
 *                    effort — already-revoked or expired sessions report 0).
 *
 * The cookie is NOT cleared here — the caller can clear it client-side if
 * they want a hard sign-out (call /api/auth/logout instead for that).
 */
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let all = false;
  try {
    const body = await request.json();
    if (body && typeof body.all === 'boolean') all = body.all;
  } catch {
    // No body or invalid JSON — treat as the default (revoke current only).
  }

  if (all) {
    const count = await revokeAllSessions();
    return NextResponse.json({ success: true, revoked: count });
  }

  await revokeCurrentSession(request);
  return NextResponse.json({ success: true, revoked: 1 });
}
