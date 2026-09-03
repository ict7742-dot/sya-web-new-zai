/**
 * Chart math utilities for the landing page candlestick chart.
 *
 * Extracted from the monolithic `src/app/page.tsx`.
 */

import type { Candle, SeriesData, SymbolData } from './landing-data';

/** Seeded PRNG (mulberry32) — deterministic so the chart is stable per symbol. */
export function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Format a number in Indian locale with the given decimal places. */
export function inr(v: number, d = 2) {
  if (v == null || isNaN(v)) return '—';
  return v.toLocaleString('en-IN', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

/** Generate a deterministic candlestick series from symbol config. */
export function genSeries(s: SymbolData): SeriesData {
  const rnd = mulberry32(s.seed);
  const n = 44;
  const arr: Candle[] = [];
  let p = s.start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o * (1 + 0.0007 + (rnd() - 0.5) * s.vol * 2);
    const h = Math.max(o, c) * (1 + rnd() * s.vol * 0.9);
    const l = Math.min(o, c) * (1 - rnd() * s.vol * 0.9);
    arr.push({ o, h, l, c });
    p = c;
  }
  return {
    candles: arr,
    prevClose: s.start * 0.994,
    volM: 90 + rnd() * 80,
    tickCount: 0,
  };
}
