'use client';

import { useEffect, useState } from 'react';
import { INITIAL_TICKERS, type TickerItem } from '@/lib/landing-data';
import { inr } from '@/lib/chart-utils';

/**
 * Ticker bar — Phase 9.2 visual rewrite using Cinematic Finance tokens.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Glassmorphic strip (backdrop-blur on the cf-bg-elevated surface)
 *   - JetBrains Mono prices + change percentages (tabular-nums)
 *   - Emerald (up) / crimson (down) for the change indicators
 *   - Flash-up / flash-down animation on price change (420ms ease-cinematic)
 *   - Marquee 60s linear infinite; pause on hover
 *
 * The price "flicker" simulates live market data — every 2.2s, 3 random
 * tickers get a small price adjustment (±0.175% range) and the flash state
 * highlights the changed cells. Respects prefers-reduced-motion.
 */
export function TickerBar() {
  const [tickers, setTickers] = useState<TickerItem[]>(() =>
    INITIAL_TICKERS.map((t) => ({ ...t })),
  );
  const [flashIdx, setFlashIdx] = useState<Set<number>>(new Set());
  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (reducedMotion) return;
    const iv = setInterval(() => {
      setTickers((prev) => {
        const next = [...prev];
        const flashSet = new Set<number>();
        for (let k = 0; k < 3; k++) {
          const i = Math.floor(Math.random() * next.length);
          const t = { ...next[i] };
          const old = t.price;
          t.price = t.price * (1 + (Math.random() - 0.5) * 0.0035);
          t.change += ((t.price - old) / old) * 100;
          next[i] = t;
          flashSet.add(i);
        }
        setFlashIdx(flashSet);
        return next;
      });
      setTimeout(() => setFlashIdx(new Set()), 420);
    }, 2200);
    return () => clearInterval(iv);
  }, [reducedMotion]);

  const items = tickers.map((t, i) => (
    <span
      key={i}
      className="tk flex items-center gap-2 text-[12px] whitespace-nowrap"
      data-tk={i}
    >
      <span className="text-cf-text-muted font-medium">{t.name}</span>
      <span
        className={`font-data tnum text-cf-text transition-colors duration-160 ${
          flashIdx.has(i) ? (t.change >= 0 ? 'text-cf-emerald' : 'text-cf-crimson') : ''
        }`}
      >
        {inr(t.price)}
      </span>
      <span
        className={`font-data tnum text-[11px] ${t.change >= 0 ? 'text-cf-emerald' : 'text-cf-crimson'}`}
      >
        {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
      </span>
    </span>
  ));

  return (
    <div className="relative border-b border-cf-gold/10 bg-cf-bg-elevated backdrop-blur-glass backdrop-saturate-glass">
      <div className="ticker-wrap overflow-hidden">
        <div className="ticker-track flex w-max items-center py-2.5">
          {items}
          {items}
        </div>
      </div>
    </div>
  );
}
