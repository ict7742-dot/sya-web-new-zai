import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // ─── Phase 5: re-enabled previously-disabled rules ───
    // Promoted to "error" — these are zero-tolerance safety rules where we've
    // confirmed the codebase already passes (or where a violation would
    // represent a genuine bug). CI fails on any of these.
    "no-debugger": "error",
    "no-unreachable": "error",
    "no-redeclare": "error",
    "no-undef": "error",
    "no-useless-escape": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-irregular-whitespace": "error",
    "no-fallthrough": "error",
    "no-case-declarations": "error",
    "prefer-const": "error",
    "no-empty": "warn",             // empty catch blocks are sometimes intentional — warn, don't fail
    "@typescript-eslint/prefer-as-const": "error",

    // TypeScript rules — promoted to warn first; promote to error later as
    // code is cleaned up. `no-unused-vars` keeps the `_` prefix escape hatch
    // (intentionally unused function args).
    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",   // common in pattern-matched React refs; warn first
    "@typescript-eslint/ban-ts-comment": "warn",

    // React rules
    "react-hooks/exhaustive-deps": "warn",   // very noisy on legacy code — warn first
    "react-hooks/preserve-manual-memoization": "off", // not using React Compiler yet
    "react/no-unescaped-entities": "warn",
    "react/display-name": "off",             // Next.js App Router doesn't require display names
    "react/prop-types": "off",               // not using PropTypes (using TS types)
    "react-compiler/react-compiler": "off",  // opt-in only

    // Next.js-specific — warn rather than error to avoid breaking the build
    // on existing patterns; promote to error after fixing the violations.
    "@next/next/no-img-element": "warn",    // landing page has raw <img> — Phase 8/9 redesign will fix
    "@next/next/no-html-link-for-pages": "warn",

    // General — relaxed for legitimate use
    "no-console": "off",   // server-side logs are fine; client-side is what should be guarded
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills", "upload/**", "tool-results/**", "mini-services/**"]
}];

export default eslintConfig;
