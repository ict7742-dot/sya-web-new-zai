import type { NextConfig } from "next";

// Note: editing this file triggers a full dev-server restart (clears the
// cached Prisma client singleton when the schema changes). v4 — marketing CSP.
const nextConfig: NextConfig = {
  output: "standalone",
  // Surface type errors at build time instead of silently shipping them.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Catch unsafe patterns (double effects, deprecated lifecycles) in dev.
  reactStrictMode: true,
  // Don't expose the Next.js banner in HTTP response headers.
  // Default is `true` — every response used to carry `X-Powered-By: Next.js`,
  // which is a free fingerprint for attackers scanning for vulnerable stacks.
  poweredByHeader: false,
  // Allow the sandbox preview origin to request Next dev assets.
  allowedDevOrigins: ["*.space-z.ai"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Site-wide security headers. Marketing pages get a permissive-but-safe CSP
  // that allows inline styles + scripts (needed for Next.js runtime + JSON-LD
  // blocks) but blocks mixed content, frame embedding, and third-party origins
  // we don't control. API routes get the strict 'none' CSP.
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];
    // Marketing-page CSP: allow self for scripts/styles/images/fonts,
    // allow inline (needed for Next.js hydration + JSON-LD + styled
    // components), allow data: for SVG favicons, block everything else.
    //
    // NOTE on `'unsafe-eval'`: previously in production CSP. It's NOT needed
    // by Next.js 16 production builds — only React Refresh in dev uses eval.
    // We restrict it to dev so prod stays tight.
    const isDev = process.env.NODE_ENV !== 'production';
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
    const marketingCsp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      { source: "/(.*)", headers: [...security, { key: "Content-Security-Policy", value: marketingCsp }] },
      // Override with strict CSP for API responses — no scripts, no styles,
      // no frames, no anything.
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
