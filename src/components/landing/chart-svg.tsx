'use client';

import type React from 'react';

export interface ChartSVGProps {
  chartRef: React.RefObject<SVGSVGElement | null>;
  gGridRef: React.RefObject<SVGGElement | null>;
  gCandlesRef: React.RefObject<SVGGElement | null>;
  gOverlayRef: React.RefObject<SVGGElement | null>;
  gXhairRef: React.RefObject<SVGGElement | null>;
  xVRef: React.RefObject<SVGLineElement | null>;
  xHRef: React.RefObject<SVGLineElement | null>;
  xPRRef: React.RefObject<SVGRectElement | null>;
  xPTRef: React.RefObject<SVGTextElement | null>;
  xTRRef: React.RefObject<SVGRectElement | null>;
  xTTRef: React.RefObject<SVGTextElement | null>;
  getChartGeom: () => { step: number; min: number; max: number; n: number };
  yOf: (v: number) => number;
  vOf: (y: number) => number;
  xOf: (i: number) => number;
  fmtP: (v: number) => string;
  timeOf: (i: number) => string;
}

/**
 * The candlestick chart SVG element with pointer-move crosshair support.
 * Extracted from the monolithic page.tsx to isolate the chart rendering logic.
 */
export function ChartSVG({
  chartRef,
  gGridRef,
  gCandlesRef,
  gOverlayRef,
  gXhairRef,
  xVRef,
  xHRef,
  xPRRef,
  xPTRef,
  xTRRef,
  xTTRef,
  getChartGeom,
  vOf,
  xOf,
  fmtP,
  timeOf,
}: ChartSVGProps) {
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = chartRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * 560;
    const vy = ((e.clientY - r.top) / r.height) * 250;
    const { step, n } = getChartGeom();
    if (vx < 6 || vx > 560 - 58 || vy < 12 || vy > 250 - 24) {
      if (gXhairRef.current) gXhairRef.current.style.display = 'none';
      return;
    }
    const i = Math.max(0, Math.min(n - 1, Math.floor((vx - 6) / step)));
    const x = xOf(i);
    if (xVRef.current) {
      xVRef.current.setAttribute('x1', String(x));
      xVRef.current.setAttribute('x2', String(x));
    }
    if (xHRef.current) {
      xHRef.current.setAttribute('y1', String(vy));
      xHRef.current.setAttribute('y2', String(vy));
    }
    if (xPRRef.current) {
      xPRRef.current.setAttribute('x', String(560 - 58 + 2));
      xPRRef.current.setAttribute('y', String(vy - 8));
    }
    if (xPTRef.current) {
      xPTRef.current.setAttribute('x', String(560 - 58 + 28));
      xPTRef.current.setAttribute('y', String(vy + 3.5));
      xPTRef.current.textContent = fmtP(vOf(vy));
    }
    if (xTRRef.current) {
      xTRRef.current.setAttribute('x', String(x - 20));
      xTRRef.current.setAttribute('y', String(250 - 18));
    }
    if (xTTRef.current) {
      xTTRef.current.setAttribute('x', String(x));
      xTTRef.current.setAttribute('y', String(250 - 7.5));
      xTTRef.current.textContent = timeOf(i);
    }
    if (gXhairRef.current) gXhairRef.current.style.display = '';
  };

  const handlePointerLeave = () => {
    if (gXhairRef.current) gXhairRef.current.style.display = 'none';
  };

  return (
    <svg
      ref={chartRef}
      viewBox="0 0 560 250"
      className="block w-full h-auto cursor-crosshair touch-pan-y select-none"
      aria-label="Live candlestick chart (illustrative data)"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <g ref={gGridRef} />
      <g ref={gCandlesRef} />
      <g ref={gOverlayRef} />
      <g ref={gXhairRef} pointerEvents="none" style={{ display: 'none' }}>
        <line ref={xVRef} y1={12} y2={226} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 3" />
        <line ref={xHRef} x1={6} x2={502} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 3" />
        <g>
          <rect ref={xPRRef} width={52} height={16} rx={3} fill="#16203A" stroke="rgba(226,177,92,0.5)" strokeWidth={0.5} />
          <text ref={xPTRef} fontSize={9.5} fontWeight="600" fill="#E2B15C" textAnchor="middle" />
        </g>
        <g>
          <rect ref={xTRRef} width={40} height={15} rx={3} fill="#16203A" />
          <text ref={xTTRef} fontSize={9} fill="#C6CDDB" textAnchor="middle" />
        </g>
      </g>
    </svg>
  );
}
