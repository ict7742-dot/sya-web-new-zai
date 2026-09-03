import type { NextConfig } from "next";

// Note: editing this file triggers a full dev-server restart (clears the
// cached Prisma client singleton when the schema changes).
const nextConfig: NextConfig = {
  output: "standalone",
  // Surface type errors at build time instead of silently shipping them.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Catch unsafe patterns (double effects, deprecated lifecycles) in dev.
  reactStrictMode: true,
  // Allow the sandbox preview origin to request Next dev assets.
  allowedDevOrigins: ["*.space-z.ai"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Site-wide security headers (also covers non-API routes). vercel.json only
  // applied these to /api/* so the marketing pages shipped without them.
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
    ];
    return [
      { source: "/(.*)", headers: security },
      // Extra hardening for API responses — never let the browser render API
      // JSON as HTML or frame it.
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
