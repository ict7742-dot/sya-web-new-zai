import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

// Node runtime (not edge) so the SQLite Prisma client works.
export const runtime = 'nodejs';
export const alt = 'Systematic Yield Analysts — Insights';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

// Cache for 1 hour per slug so repeated social-scrapes are cheap.
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // SECURITY: only generate OG images for published posts. Draft slugs that
  // happen to be crawled (link shared before publish, or guessed) get the
  // generic "Insights" fallback rather than leaking draft titles/authors.
  const post = await db.blogPost.findFirst({
    where: { slug, published: true },
    select: { title: true, category: true, author: true },
  });

  const title = post?.title ?? 'Insights';
  const category = post?.category ?? 'General';
  const author = post?.author ?? 'SYA Team';

  // Tailwind-like inline styles (edge runtime has no CSS file access).
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #070B14 0%, #0C1322 100%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Faint grid-paper texture + candlestick watermark on the right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(226,177,92,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(226,177,92,0.05) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage: 'radial-gradient(ellipse 60% 70% at 80% 50%, #000 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 80% 50%, #000 0%, transparent 70%)',
          }}
        />
        {/* Candlestick chart silhouette on the right */}
        <svg
          width="260"
          height="320"
          viewBox="0 0 260 320"
          style={{
            position: 'absolute',
            right: 90,
            top: 180,
            opacity: 0.32,
          }}
        >
          {[
            { x: 10, o: 200, c: 240, h: 255, l: 185, up: true },
            { x: 46, o: 240, c: 210, h: 250, l: 195, up: false },
            { x: 82, o: 210, c: 250, h: 265, l: 200, up: true },
            { x: 118, o: 250, c: 280, h: 295, l: 240, up: true },
            { x: 154, o: 280, c: 260, h: 290, l: 245, up: false },
            { x: 190, o: 260, c: 300, h: 310, l: 250, up: true },
            { x: 226, o: 300, c: 270, h: 315, l: 255, up: false },
          ].map((k, i) => (
            <g key={i}>
              <line x1={k.x + 6} y1={320 - k.h} x2={k.x + 6} y2={320 - k.l} stroke={k.up ? '#35D49A' : '#F0555F'} strokeWidth="1.5" />
              <rect x={k.x} y={320 - Math.max(k.o, k.c)} width="12" height={Math.abs(k.c - k.o) || 4} fill={k.up ? '#35D49A' : '#F0555F'} rx="1" />
            </g>
          ))}
        </svg>

        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: '1.5px solid rgba(226,177,92,0.25)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 44px',
            background: 'rgba(7,11,20,0.35)',
          }}
        >
          {/* Top row: brand + category */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Chart mark */}
              <svg width="36" height="36" viewBox="0 0 32 32">
                <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="#E2B15C" strokeWidth="1.4" />
                <path d="M8 22 L13 16 L17 19 L24 10" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
              </svg>
              <span style={{ color: '#E8EBF2', fontSize: 22, fontWeight: 600, letterSpacing: -0.2 }}>
                Systematic Yield Analysts
              </span>
            </div>
            <span
              style={{
                color: '#E2B15C',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                padding: '8px 16px',
                border: '1px solid rgba(226,177,92,0.35)',
                borderRadius: 999,
              }}
            >
              {category}
            </span>
          </div>

          {/* Title block, centered vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40 }}>
            <span style={{ color: '#E2B15C', fontSize: 18, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>
              Insights
            </span>
            <span
              style={{
                color: '#EDEFF5',
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: -1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </span>
          </div>

          {/* Bottom row: author + url */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 24,
            }}
          >
            <span style={{ color: '#98A2B8', fontSize: 20 }}>By {author}</span>
            <span style={{ color: '#525C70', fontSize: 18, fontFamily: 'monospace' }}>
              systematicyield.in/blog
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
