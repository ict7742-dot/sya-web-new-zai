'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { ChartSVG } from '@/components/landing/chart-svg';
import { SYMBOLS, type SeriesData } from '@/lib/landing-data';
import { inr, genSeries } from '@/lib/chart-utils';

interface HeroProps {
  /** Triggered when the primary CTA is clicked. */
  onSelectInterest: (interest: 'account' | 'courses' | 'both', label: string) => void;
}

/**
 * Hero section — Phase 9.1 visual rewrite using Cinematic Finance tokens.
 *
 * This is the most complex section — it owns ALL chart state:
 *   - activeSym: which symbol is shown in the terminal (NIFTY/BANKNIFTY/RELIANCE)
 *   - seriesMap: candle data per symbol (initialized via genSeries, live-ticked)
 *   - volJitter: VOL readout jitter (Phase 4 hydration fix — useState(0) + useEffect)
 *   - flashClass: price-flash animation class on the live price readout
 *   - 12 SVG refs for the chart elements (chart, grid, candles, overlay, crosshair, etc.)
 *   - Chart helper functions: getChartGeom, yOf, vOf, xOf, fmtP, timeOf
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md):
 *   - Bebas Neue headline at 14vw (font-display text-[14vw] leading-[0.92])
 *   - Layered background: deep black + grain texture + parallax gold glow drift
 *   - Glassmorphic terminal with gold gradient border + inner glow
 *   - JetBrains Mono for all numeric data (prices, OHLC, VOL, timestamps)
 *   - Emerald/crimson for up/down indicators + price flash
 *   - Ken Burns zoom on the chart container (subtle scale over 12s)
 *   - 80ms staggered reveal of the hero copy + terminal
 */
export function Hero({ onSelectInterest }: HeroProps) {
  /* ── State ── */
  const [activeSym, setActiveSym] = useState(0);
  const [seriesMap, setSeriesMap] = useState<Map<string, SeriesData>>(() => {
    const m = new Map<string, SeriesData>();
    SYMBOLS.forEach((s) => m.set(s.sym, genSeries(s)));
    return m;
  });
  const [flashClass, setFlashClass] = useState('');
  // VOL readout jitter — initialized to 0 so server + client render match
  // (no hydration mismatch). Rolled to a random value after mount.
  const [volJitter, setVolJitter] = useState(0);
  const [kenBurnsKey, setKenBurnsKey] = useState(0); // re-triggers Ken Burns on symbol change

  /* ── Refs ── */
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const chartRef = useRef<SVGSVGElement>(null);
  const gGridRef = useRef<SVGGElement>(null);
  const gCandlesRef = useRef<SVGGElement>(null);
  const gOverlayRef = useRef<SVGGElement>(null);
  const gXhairRef = useRef<SVGGElement>(null);
  const xVRef = useRef<SVGLineElement>(null);
  const xHRef = useRef<SVGLineElement>(null);
  const xPRRef = useRef<SVGRectElement>(null);
  const xPTRef = useRef<SVGTextElement>(null);
  const xTRRef = useRef<SVGRectElement>(null);
  const xTTRef = useRef<SVGTextElement>(null);
  const tPriceRef = useRef<HTMLSpanElement>(null);

  /* ── Derived ── */
  const cur = SYMBOLS[activeSym];
  const st = seriesMap.get(cur.sym)!;
  const lastCandle = st.candles[st.candles.length - 1];

  /* ── Chart geometry helpers ── */
  const VW = 560;
  const VH = 250;
  const padL = 6;
  const padR = 58;
  const padT = 12;
  const padB = 24;

  const getChartGeom = useCallback(() => {
    const cs = st.candles;
    const n = cs.length;
    const step = (VW - padL - padR) / n;
    let mn = Infinity;
    let mx = -Infinity;
    cs.forEach((k) => {
      mn = Math.min(mn, k.l);
      mx = Math.max(mx, k.h);
    });
    const pad = (mx - mn) * 0.08;
    const min = mn - pad;
    const max = mx + pad;
    return { step, min, max, n };
  }, [st]);

  const yOf = useCallback(
    (v: number) => {
      const { min, max } = getChartGeom();
      return padT + ((max - v) / (max - min)) * (VH - padT - padB);
    },
    [getChartGeom]
  );

  const vOf = useCallback(
    (y: number) => {
      const { min, max } = getChartGeom();
      return max - ((y - padT) / (VH - padT - padB)) * (max - min);
    },
    [getChartGeom]
  );

  const xOf = useCallback(
    (i: number) => {
      const { step } = getChartGeom();
      return padL + step * i + step / 2;
    },
    [getChartGeom]
  );

  const fmtP = (v: number) => inr(v, cur.dec);
  const fmtAxis = (v: number) =>
    v >= 500
      ? v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
      : v.toFixed(1);
  const timeOf = (i: number) => {
    const m = 9 * 60 + 15 + i * 5;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  };

  /* ── Render chart (grid + candles + overlay) ── */
  useEffect(() => {
    const { step, min, max, n } = getChartGeom();
    const cs = st.candles;

    // Grid + axis labels
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const y = padT + ((VH - padT - padB) * g) / 4;
      const val = max - ((max - min) * g) / 4;
      grid += `<line x1="${padL}" x2="${VW - padR + 8}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.05)"/>`;
      grid += `<text x="${VW - padR + 12}" y="${y + 3}" font-size="9.5" fill="#5F6981" font-family="var(--font-jetbrains), monospace">${fmtAxis(val)}</text>`;
    }
    for (let i = 4; i < n; i += 8)
      grid += `<text x="${xOf(i)}" y="${VH - 7}" font-size="9" fill="#5F6981" text-anchor="middle" font-family="var(--font-jetbrains), monospace">${timeOf(i)}</text>`;
    if (gGridRef.current) gGridRef.current.innerHTML = grid;

    // Candles — emerald (up) / crimson (down)
    const bw = Math.max(2, step * 0.55);
    let s = '';
    cs.forEach((k, i) => {
      const isUp = k.c >= k.o;
      const col = isUp ? '#35D49A' : '#F0555F';
      const x = xOf(i);
      const yH = yOf(k.h);
      const yL = yOf(k.l);
      const yO = yOf(k.o);
      const yC = yOf(k.c);
      s += `<line x1="${x}" x2="${x}" y1="${yH}" y2="${yL}" stroke="${col}" stroke-width="1" opacity="0.85"/>`;
      s += `<rect x="${(x - bw / 2).toFixed(2)}" y="${Math.min(yO, yC).toFixed(2)}" width="${bw.toFixed(2)}" height="${Math.max(1, Math.abs(yO - yC)).toFixed(2)}" fill="${col}" opacity="${i === n - 1 ? 1 : 0.9}" rx="1"/>`;
    });
    if (gCandlesRef.current) gCandlesRef.current.innerHTML = s;

    // Last-price line + price tag (gold)
    const ylp = yOf(cs[n - 1].c);
    if (gOverlayRef.current) {
      gOverlayRef.current.innerHTML =
        `<line x1="${padL}" x2="${VW - padR}" y1="${ylp}" y2="${ylp}" stroke="#E2B15C" stroke-width="1" stroke-dasharray="3 3" opacity="0.65"/>` +
        `<rect x="${VW - padR + 2}" y="${ylp - 8}" width="52" height="16" rx="3" fill="#E2B15C"/>` +
        `<text x="${VW - padR + 28}" y="${ylp + 3.5}" font-size="9.5" font-weight="600" fill="#0A0F1C" text-anchor="middle" font-family="var(--font-jetbrains), monospace">${fmtP(cs[n - 1].c)}</text>`;
    }
  }, [st, getChartGeom, xOf, yOf, fmtP]);

  /* ── Live tick — updates the last candle every 900ms ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    const iv = setInterval(() => {
      if (document.hidden) return;
      setSeriesMap((prev) => {
        const next = new Map(prev);
        const sd = next.get(cur.sym);
        if (!sd) return prev;
        const newSd = { ...sd, candles: sd.candles.map((k) => ({ ...k })) };
        const last = newSd.candles[newSd.candles.length - 1];
        last.c = last.c * (1 + (Math.random() - 0.5) * cur.vol * 1.8);
        last.h = Math.max(last.h, last.c);
        last.l = Math.min(last.l, last.c);
        newSd.tickCount++;
        if (newSd.tickCount % 14 === 0) {
          newSd.candles.push({ o: last.c, h: last.c, l: last.c, c: last.c });
          newSd.candles.shift();
        }
        next.set(cur.sym, newSd);
        return next;
      });
      // Flash the price readout
      setFlashClass((_prev) => (Math.random() > 0.5 ? 'text-cf-emerald' : 'text-cf-crimson'));
      setTimeout(() => setFlashClass(''), 550);
    }, 900);
    return () => clearInterval(iv);
  }, [cur]);

  /* ── VOL readout jitter — re-roll after mount, then every 5s ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    const roll = () => setVolJitter(Math.random() * 8);
    roll();
    const iv = setInterval(roll, 5000);
    return () => clearInterval(iv);
  }, []);

  /* ── Ken Burns zoom — re-trigger on symbol change ── */
  const handleSymChange = (i: number) => {
    setActiveSym(i);
    setKenBurnsKey((k) => k + 1); // re-mounts the Ken Burns animation
  };

  // Derived chart metrics
  const sma = st.candles.slice(-20).reduce((a, k) => a + k.c, 0) / 20;
  const above = lastCandle.c >= sma;
  const up = lastCandle.c >= lastCandle.o;
  const pct = ((lastCandle.c - st.prevClose) / st.prevClose) * 100;

  return (
    <section id="home" className="relative overflow-hidden bg-cf-bg">
      {/* Layered background: grain texture + parallax gold glow drift */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />
      {/* Parallax gold glow drift — large blurred radial that drifts via CSS animation */}
      <div
        className="pointer-events-none absolute -top-40 -left-20 w-[640px] h-[640px] rounded-full blur-3xl opacity-40 animate-cf-glow-drift"
        style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.18), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-20 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 animate-cf-glow-drift [animation-delay:4s]"
        style={{ background: 'radial-gradient(circle, rgba(53,212,154,0.12), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="wrap relative pt-14 pb-16 lg:pt-24 lg:pb-24 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* ── Copy column ── */}
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist animate-cf-reveal-up">
            <span className="block w-6 h-px bg-cf-gold opacity-70" />
            Angel One Authorized Partner · Jaipur
          </p>
          {/* Bebas Neue headline at 14vw — the signature Cinematic Finance display type */}
          <h1 className="font-display font-normal text-[14vw] md:text-[10vw] lg:text-[8vw] leading-[0.92] tracking-[-0.02em] mt-6 text-cf-text-strong animate-cf-reveal-up [animation-delay:80ms]">
            Master the<br />
            <span className="bg-cf-gold-gradient bg-clip-text text-transparent">Markets</span>.
          </h1>
          <p className="mt-6 text-cf-mist text-[15.5px] md:text-base leading-relaxed max-w-xl animate-cf-reveal-up [animation-delay:160ms]">
            Your trusted Angel One Authorized Partner and premier stock market education academy.
            Build your wealth with data-driven strategies — not guesswork.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 animate-cf-reveal-up [animation-delay:240ms]">
            <button
              onClick={() => onSelectInterest('account', '')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold"
            >
              Open Angel One Account <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
            >
              View Our Courses
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2.5 text-[12.5px] text-cf-mist animate-cf-reveal-up [animation-delay:320ms]">
            <ShieldCheck className="w-[15px] h-[15px] text-cf-gold shrink-0" />
            Backed by Angel One — Member NSE · BSE · MCX. Paperless onboarding in about 15 minutes.
          </p>
        </div>

        {/* ── Live terminal — glassmorphic with gold gradient border ── */}
        <div className="lg:col-span-6 animate-cf-reveal-up [animation-delay:160ms]">
          <div className="relative">
            {/* Corner ticks — the chart-annotation motif */}
            <span className="tick tick-tl" aria-hidden="true" />
            <span className="tick tick-tr" aria-hidden="true" />
            <span className="tick tick-bl" aria-hidden="true" />
            <span className="tick tick-br" aria-hidden="true" />

            {/* Glassmorphic terminal panel */}
            <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
              {/* Gradient gold border highlight on top edge */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />

              {/* Terminal header / symbol tabs */}
              <div className="flex items-center justify-between border-b border-white/[0.07] pl-2 pr-4">
                <div className="flex">
                  {SYMBOLS.map((s, i) => (
                    <button
                      key={s.sym}
                      className={`relative px-4 py-3 text-[12.5px] font-medium transition-colors duration-160 ${
                        activeSym === i ? 'text-cf-text-strong' : 'text-cf-mist hover:text-cf-text'
                      }`}
                      onClick={() => handleSymChange(i)}
                    >
                      {s.sym}
                      {activeSym === i && (
                        <span className="absolute left-4 right-4 bottom-0 h-0.5 bg-cf-gold-gradient" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cf-emerald animate-pulse" />
                  <span className="text-[10.5px] font-semibold tracking-[0.2em] text-cf-emerald font-data">LIVE</span>
                </div>
              </div>

              {/* Quote header — JetBrains Mono for all numerics */}
              <div className="px-5 pt-4 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] tracking-[0.18em] text-cf-mist uppercase font-medium">
                    {cur.sym}
                  </div>
                  <div className="flex items-baseline gap-3 mt-1.5">
                    <span
                      ref={tPriceRef}
                      className={`font-data text-[30px] font-semibold leading-none tabular-nums transition-colors duration-160 text-cf-text-strong ${flashClass}`}
                    >
                      {fmtP(lastCandle.c)}
                    </span>
                    <span
                      className={`font-data text-[13px] px-1.5 py-0.5 rounded tabular-nums ${
                        up ? 'bg-cf-emerald/10 text-cf-emerald' : 'bg-cf-crimson/10 text-cf-crimson'
                      }`}
                    >
                      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex gap-5 text-right">
                  <div>
                    <div className="text-[9.5px] tracking-[0.16em] text-cf-text-muted font-data">OPEN</div>
                    <div className="font-data text-[12.5px] text-cf-text mt-0.5 tabular-nums">{fmtP(lastCandle.o)}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] tracking-[0.16em] text-cf-text-muted font-data">HIGH</div>
                    <div className="font-data text-[12.5px] text-cf-text mt-0.5 tabular-nums">{fmtP(lastCandle.h)}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] tracking-[0.16em] text-cf-text-muted font-data">LOW</div>
                    <div className="font-data text-[12.5px] text-cf-text mt-0.5 tabular-nums">{fmtP(lastCandle.l)}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] tracking-[0.16em] text-cf-text-muted font-data">CLOSE</div>
                    <div className="font-data text-[12.5px] text-cf-text mt-0.5 tabular-nums">{fmtP(lastCandle.c)}</div>
                  </div>
                </div>
              </div>

              {/* Candlestick chart — Ken Burns zoom re-triggers on symbol change */}
              <div className="mt-2 px-1 overflow-hidden" key={kenBurnsKey}>
                <div className="animate-cf-ken-burns motion-reduce:[animation:none]">
                  <ChartSVG
                    chartRef={chartRef}
                    gGridRef={gGridRef}
                    gCandlesRef={gCandlesRef}
                    gOverlayRef={gOverlayRef}
                    gXhairRef={gXhairRef}
                    xVRef={xVRef}
                    xHRef={xHRef}
                    xPRRef={xPRRef}
                    xPTRef={xPTRef}
                    xTRRef={xTRRef}
                    xTTRef={xTTRef}
                    getChartGeom={getChartGeom}
                    yOf={yOf}
                    vOf={vOf}
                    xOf={xOf}
                    fmtP={fmtP}
                    timeOf={timeOf}
                  />
                </div>
              </div>

              {/* Terminal footer */}
              <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[11.5px] text-cf-mist">
                <span className="font-data tabular-nums">
                  VOL {(st.volM + volJitter).toFixed(1)}M
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${above ? 'bg-cf-emerald' : 'bg-cf-crimson'}`} />
                  {above ? 'Above 20-SMA · Bullish bias' : 'Below 20-SMA · Cautious'}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3.5 text-[11px] text-cf-text-muted">
            Illustrative feed for demonstration — open your account with us for live market data.
          </p>
        </div>
      </div>
    </section>
  );
}
