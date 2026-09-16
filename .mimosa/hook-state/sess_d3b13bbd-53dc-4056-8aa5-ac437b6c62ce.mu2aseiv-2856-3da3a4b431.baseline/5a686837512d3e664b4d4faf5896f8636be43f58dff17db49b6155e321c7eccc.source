/**
 * Shared input-validation helpers for all API routes.
 *
 * Goal: ONE source of truth for length caps, slug/email/phone/URL rules so
 * that adding a new endpoint doesn't mean copy-pasting (and subtly
 * diverging from) the same helpers. Every helper either returns the
 * cleaned value (success) or null (failure) — and writes a human-readable
 * message into the passed `errors` record. Callers collect all errors
 * and return them in a single 400 response so the client sees every
 * problem at once.
 *
 * All public helpers are pure: no side effects, no throws.
 */

export type ValidationErrors = Record<string, string>;

/**
 * Centralized length caps. Lifted to a single object so a future tightening
 * (e.g. lowering MAX_LEAD_MESSAGE to 1000) is one edit, not a route-by-route
 * find-and-replace. Numbers chosen to:
 *   - comfortably exceed any reasonable user input
 *   - stay well below Postgres TEXT performance cliffs (multi-MB)
 *   - match RFC limits where applicable (email = RFC 5321 practical limit)
 */
export const LENGTH_LIMITS = {
  LEAD_NAME: 120,
  LEAD_EMAIL: 254,
  LEAD_MESSAGE: 2000,
  BLOG_TITLE: 200,
  BLOG_EXCERPT: 600,
  BLOG_CONTENT: 50000,
  BLOG_AUTHOR: 120,
  BLOG_CATEGORY: 60,
  URL: 2048,
} as const;

/* ─── Required-field helpers ─── */

export function validateRequiredString(
  value: unknown,
  maxLength: number,
  fieldName: string,
  errors: ValidationErrors,
  opts: { minLength?: number; label?: string } = {},
): string | null {
  const label = opts.label ?? fieldName;
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors[fieldName] = `${label} is required.`;
    return null;
  }
  const trimmed = value.trim();
  const minLen = opts.minLength ?? 1;
  if (trimmed.length < minLen) {
    errors[fieldName] = `${label} must be at least ${minLen} character${minLen === 1 ? '' : 's'}.`;
    return null;
  }
  if (trimmed.length > maxLength) {
    errors[fieldName] = `${label} must be ${maxLength} characters or fewer.`;
    return null;
  }
  return trimmed;
}

export function validateOptionalString(
  value: unknown,
  maxLength: number,
  fieldName: string,
  errors: ValidationErrors,
  opts: { label?: string } = {},
): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') {
    errors[fieldName] = `${opts.label ?? fieldName} must be a string.`;
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) {
    errors[fieldName] = `${opts.label ?? fieldName} must be ${maxLength} characters or fewer.`;
    return null;
  }
  return trimmed;
}

/* ─── Field-specific validators ─── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(
  value: unknown,
  errors: ValidationErrors,
  fieldName = 'email',
): string | null {
  if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
    errors[fieldName] = 'Enter a valid email address.';
    return null;
  }
  if (value.trim().length > LENGTH_LIMITS.LEAD_EMAIL) {
    errors[fieldName] = 'Email address is too long.';
    return null;
  }
  return value.trim().toLowerCase();
}

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

export function validateIndianPhone(
  value: unknown,
  errors: ValidationErrors,
  fieldName = 'phone',
): string | null {
  if (typeof value !== 'string') {
    errors[fieldName] = 'Enter a valid 10-digit Indian mobile number.';
    return null;
  }
  const digits = value.replace(/\D/g, '');
  if (!INDIAN_PHONE_RE.test(digits)) {
    errors[fieldName] = 'Enter a valid 10-digit Indian mobile number.';
    return null;
  }
  return digits;
}

const SLUG_RE = /^[a-z0-9-]+$/;

export function validateSlug(
  value: unknown,
  errors: ValidationErrors,
  fieldName = 'slug',
): string | null {
  if (typeof value !== 'string' || !SLUG_RE.test(value)) {
    errors[fieldName] = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    return null;
  }
  return value;
}

export function isSafeImageUrl(url: unknown): boolean {
  if (url == null || url === '') return true;
  if (typeof url !== 'string' || url.length > LENGTH_LIMITS.URL) return false;
  try {
    const u = new URL(url);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.hostname;
  } catch {
    return false;
  }
}

/* ─── Formatting helpers ─── */

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseBoundedInt(
  raw: string | null,
  opts: { default: number; min: number; max: number },
): number {
  const n = parseInt(raw ?? String(opts.default), 10) || opts.default;
  return Math.min(Math.max(n, opts.min), opts.max);
}

/* ─── Response helper ─── */

export function validationErrorResponse(errors: ValidationErrors): Response {
  return new Response(JSON.stringify({ error: 'Validation failed', fields: errors }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ─── Body-size policy ─── */

/**
 * Default max request body size for mutation endpoints (POST/PUT/PATCH).
 * 1 MB is generous — the largest legitimate payload is a blog-post create
 * with 50k chars of content + metadata. Anything bigger is either a
 * mistake or a DoS attempt.
 *
 * Use as the very first check in a handler, BEFORE `await request.json()`,
 * so we don't read a 50 MB body into memory just to fail on the first
 * field.
 */
export function bodyTooLarge(request: Request, maxBytes = 1024 * 1024): boolean {
  const len = request.headers.get('content-length');
  if (!len) return false;
  const n = parseInt(len, 10);
  if (Number.isNaN(n)) return false;
  return n > maxBytes;
}

export function bodyTooLargeResponse(maxBytes = 1024 * 1024): Response {
  return new Response(
    JSON.stringify({ error: `Request body too large (max ${maxBytes} bytes).` }),
    { status: 413, headers: { 'Content-Type': 'application/json' } },
  );
}
