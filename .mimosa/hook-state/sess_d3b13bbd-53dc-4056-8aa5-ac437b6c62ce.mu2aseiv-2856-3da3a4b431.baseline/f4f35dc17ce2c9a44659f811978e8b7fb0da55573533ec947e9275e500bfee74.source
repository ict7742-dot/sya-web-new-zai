/**
 * CSV cell escaping with formula-injection defense (OWASP).
 *
 * Extracted here so /api/leads and /api/newsletter share the SAME implementation
 * — and so future CSV exports automatically pick up the protection without
 * each author having to remember the OWASP rules.
 *
 * Defense layers (in order):
 *   1. If the value starts with =, +, -, @, \\t, or \\r, prefix with a single
 *      quote so Excel/Sheets treats the cell as text, not a formula.
 *      (Otherwise a lead named `=cmd|"/c calc"!A1` could execute shell
 *      commands when an admin opens the export.)
 *   2. Wrap in double quotes and double any embedded double quotes per
 *      RFC 4180.
 *
 * Pass null/undefined → empty string.
 */
const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

export function safeCsvCell(v: string | null | undefined): string {
  if (v == null) return '';
  let s = String(v);
  if (FORMULA_PREFIX_RE.test(s)) {
    s = `'${s}`;
  }
  return `"${s.replace(/"/g, '""')}"`;
}
