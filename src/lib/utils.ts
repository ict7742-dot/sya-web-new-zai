import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serialize a value as JSON for safe embedding inside an HTML `<script>` tag.
 *
 * `JSON.stringify` alone is NOT safe for this purpose — a value containing
 * the substring `</script>` (or `<!--`) would close the script element early
 * and allow HTML injection. The standard mitigation is to escape every
 * `<`, `>`, and `&` as their Unicode escape equivalents, plus the two
 * JavaScript line separators (U+2028 / U+2029) which are valid JSON but
 * invalid in JavaScript string literals (would break the script parse).
 *
 * Use this whenever a JSON blob from user-controlled content (e.g. a blog
 * post title, author, or excerpt) is rendered into a `<script type="application/ld+json">`
 * block via `dangerouslySetInnerHTML`.
 *
 * Reference: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#html-json
 */
export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
