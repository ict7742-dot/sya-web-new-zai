import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { safeJsonStringify } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ICT Methodology Course — Smart Money Concepts | Systematic Yield Analysts',
  description:
    'Learn ICT (Inner Circle Trader) methodology — market structure, liquidity, order blocks, fair value gaps, killzones, and the OTE entry framework. 6-module structured course with live mentorship. Educational content only.',
  keywords:
    'ICT course India, Inner Circle Trader, Smart Money Concepts, ICT methodology, ICT mentorship Jaipur, order blocks, fair value gaps, ICT killzones, OTE trading',
  openGraph: {
    title: 'ICT Methodology Course — Smart Money Concepts | SYA',
    description:
      '6-module ICT methodology course — market structure, liquidity, order blocks, FVGs, killzones, OTE. Live mentorship + recorded sessions. Jaipur & online.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://systematicyield.in/courses/ict',
  },
  alternates: {
    canonical: 'https://systematicyield.in/courses/ict',
  },
};

const ICT_MODULES = [
  {
    num: '01',
    title: 'Market Structure — BOS and CHoCH',
    slug: 'ict-market-structure-bos-choch-beginners-guide',
    summary: 'Break of Structure (BOS) and Change of Character (CHoCH) are the foundation. Learn to read directional bias in 10 seconds by identifying swing structure breaks.',
    points: [
      'Identify swing highs and lows on any timeframe',
      'Classify structure as bullish, bearish, or ranging',
      'Distinguish BOS (continuation) vs CHoCH (potential reversal)',
      'Internal vs external liquidity — and why the distinction matters',
    ],
  },
  {
    num: '02',
    title: 'Liquidity — Buy-Side, Sell-Side & Sweeps',
    slug: 'ict-liquidity-buy-side-sell-side-sweeps-explained',
    summary: 'Price moves in search of liquidity. Learn to identify buy-side and sell-side pools, judge sweep quality, and position on the right side of the stop run.',
    points: [
      'Mark buy-side and sell-side liquidity pools',
      'Distinguish a sweep (wick + close back) from a genuine breakout',
      'Judge sweep quality: candle close, time, confluence, magnitude',
      'Retail stops as liquidity magnets: equal highs/lows, round numbers',
    ],
  },
  {
    num: '03',
    title: 'Order Blocks — The Smart Money Footprint',
    slug: 'ict-order-blocks-smart-money-footprint-guide',
    summary: 'Order blocks are the exact candles where institutional orders were placed. Learn to identify fresh vs mitigated blocks and use them as low-risk entry zones.',
    points: [
      'Identify bullish and bearish order blocks',
      'Fresh vs mitigated — and why fresh blocks are higher probability',
      'High-probability filters: FVG confluence, displacement, sweep',
      'Define invalidation using candle closes (not wicks)',
    ],
  },
  {
    num: '04',
    title: 'Fair Value Gaps (FVG) — Imbalance & Displacement',
    slug: 'ict-fair-value-gaps-fvg-imbalance-displacement',
    summary: 'A Fair Value Gap is a three-candle imbalance price is likely to revisit. Learn fill mechanics, premium vs discount FVGs, and the ICT trifecta.',
    points: [
      'Identify bullish and bearish FVGs using the three-candle pattern',
      'Full fill, partial fill, and ignore scenarios',
      'Higher-timeframe FVGs as magnets / reference points',
      'The ICT trifecta: sweep + order block + FVG confluence',
    ],
  },
  {
    num: '05',
    title: 'Killzones — Time-Based Trade Selection',
    slug: 'ict-killzones-time-based-trade-selection',
    summary: 'ICT traders trade only during 3-4 hours per day when 80%+ of the daily range is delivered. Learn the Asian, London, and New York killzones in IST.',
    points: [
      'The three primary killzones — Asian, London, New York (in IST)',
      'Why the NY lunch period is explicitly avoided',
      'Form daily bias using Asian range + London/NY sweeps',
      'Restrict screen time to 2-4 focused hours per day',
    ],
  },
  {
    num: '06',
    title: 'OTE & Backtesting — Optimal Trade Entry + Discipline',
    slug: 'ict-ote-optimal-trade-entry-backtesting-discipline',
    summary: 'The OTE is the 62-79% Fibonacci retracement zone where ICT traders enter within a killzone. Learn the full framework + the 100-trade backtesting discipline.',
    points: [
      'Mark the OTE zone on any impulse leg',
      'OTE confluence with FVG + order block (highest probability)',
      'Rule-based trade management and time stops',
      'The 100-trade backtest + journal discipline before going live',
    ],
  },
];

export default async function ICTCoursePage() {
  let posts: { slug: string; title: string; createdAt: Date }[] = [];
  try {
    posts = await db.blogPost.findMany({
      where: {
        published: true,
        slug: { in: ICT_MODULES.map((m) => m.slug) },
      },
      select: { slug: true, title: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch {
    // DB unavailable — page still renders
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'ICT Methodology — Smart Money Concepts',
    description:
      '6-module ICT (Inner Circle Trader) methodology course covering market structure, liquidity, order blocks, fair value gaps, killzones, and the OTE entry framework. Educational content only — no specific investment advice.',
    provider: {
      '@type': 'Organization',
      name: 'Systematic Yield Analysts',
      sameAs: 'https://systematicyield.in',
    },
    educationalLevel: 'Advanced',
    inLanguage: 'en-IN',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['Online', 'Onsite'],
      courseWorkload: 'PT6H',
    },
  };

  return (
    <div className="sy-concept" style={{ minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(courseSchema) }}
      />

      <header className="sy-header sy-shell">
        <Link href="/" className="sy-brand" style={{ textDecoration: 'none' }}>
          <span className="sy-monogram">SY</span>
          Systematic Yield
        </Link>
        <nav className="sy-nav" aria-label="Main navigation">
          <Link href="/#home" style={{ textDecoration: 'none' }}>Home</Link>
          <Link href="/#academy" style={{ textDecoration: 'none' }}>Academy</Link>
          <Link href="/#info" style={{ textDecoration: 'none' }}>About</Link>
          <Link href="/#contact" style={{ textDecoration: 'none' }}>Contact</Link>
        </nav>
        <Link href="/#contact" className="sy-action sy-primary" style={{ textDecoration: 'none' }}>
          Enquire <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <main>
        <section className="sy-shell" style={{ paddingBlock: '64px 48px' }}>
          <span className="sy-eyebrow" style={{ color: 'var(--sy-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '2.2px', textTransform: 'uppercase', display: 'block', marginBottom: '19px' }}>
            Advanced · 6 Modules · ~10,800 words
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5.25cqw, 56px)', fontWeight: 500, letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: '23px', margin: '0 0 23px' }}>
            ICT Methodology<br/>
            <em style={{ fontStyle: 'normal', color: 'var(--sy-lime)' }}>Smart Money Concepts.</em>
          </h1>
          <p style={{ color: 'var(--sy-muted)', maxWidth: '560px', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
            The Inner Circle Trader (ICT) methodology, developed by Michael J. Huddleston, is a price-action framework that explains market movement through liquidity, order flow, and institutional algorithms. This 6-module course covers the complete methodology — from market structure to the OTE entry framework — with a focus on process education, not tips or signals.
          </p>

          <div style={{ marginTop: '32px', padding: '16px 20px', background: 'var(--sy-panel)', border: '1px solid var(--sy-line)', borderRadius: '10px', fontSize: '12px', color: 'var(--sy-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--sy-lime)', fontWeight: 600 }}>Educational use only.</strong> This course teaches methodology concepts. It does not recommend any specific security, and all examples use generic instrument labels. Trading involves substantial risk of loss. SEBI-regulated Angel One Authorized Partner.
          </div>
        </section>

        <section className="sy-shell" style={{ paddingBlock: '24px 64px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 500, letterSpacing: '-1.4px', lineHeight: 1.12, marginBottom: '32px', color: 'var(--sy-text)' }}>
            The 6 modules
          </h2>
          <div className="sy-course-grid sy-course-grid-4" style={{ gridTemplateColumns: '1fr' }}>
            {ICT_MODULES.map((m) => {
              const post = posts.find((p) => p.slug === m.slug);
              return (
                <article
                  key={m.num}
                  style={{
                    background: 'var(--sy-panel)',
                    border: '1px solid var(--sy-line)',
                    borderRadius: '13px',
                    padding: '24px',
                    marginBottom: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '28px', color: 'var(--sy-lime)', fontFamily: 'monospace', fontWeight: 500, flexShrink: 0 }}>
                      {m.num}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '8px', color: 'var(--sy-text)' }}>
                        {m.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--sy-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                        {m.summary}
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
                        {m.points.map((p, i) => (
                          <li key={i} style={{ fontSize: '12px', color: 'var(--sy-muted)', paddingLeft: '16px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: 'var(--sy-lime)' }}>→</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      {post ? (
                        <Link
                          href={`/blog/${m.slug}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--sy-lime)',
                            textDecoration: 'none',
                          }}
                        >
                          Read module <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: 'var(--sy-muted)' }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="sy-shell" style={{ paddingBlock: '48px 80px', borderTop: '1px solid var(--sy-line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '16px', color: 'var(--sy-text)' }}>
                Ready to start the <em style={{ fontStyle: 'normal', color: 'var(--sy-lime)' }}>ICT course?</em>
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--sy-muted)', lineHeight: 1.7, margin: 0 }}>
                The course is available as 6 blog posts (free) + optional live mentorship sessions (paid). Enquire via the contact form to learn about the next cohort, weekend batch timings, and pricing.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link href="/#contact" className="sy-action sy-primary" style={{ textDecoration: 'none' }}>
                Enquire about ICT course <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/blog" className="sy-action" style={{ textDecoration: 'none' }}>
                Browse all posts
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="sy-footer sy-shell">
        <span>Systematic Yield · Jaipur</span>
        <span>Angel One Authorized Partner · SEBI Reg INZ000161534</span>
        <span>Education does not guarantee investment outcomes.</span>
      </footer>
    </div>
  );
}
