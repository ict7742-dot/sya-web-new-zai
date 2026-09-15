'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

/**
 * Defers rendering of children until they are about to enter the viewport.
 * Uses IntersectionObserver with a 200px rootMargin so the content renders
 * just before the user scrolls to it — improving initial page weight.
 *
 * Skeleton: visible glass panel with lime top-edge + slow pulse shimmer.
 *
 * IMPORTANT: do NOT wrap critical-above-the-fold content or conversion
 * targets (ContactForm) in LazySection — IntersectionObserver may not fire
 * for crawlers / no-JS users / failed IO callbacks, breaking SSR + SEO.
 */
export function LazySection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {visible ? (
        children
      ) : (
        <div className="sec">
          <div className="wrap">
            <div
              className="relative h-[280px] rounded-xl bg-sy-glass/40 backdrop-blur-glass border border-sy-glass-border overflow-hidden"
              aria-hidden="true"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-sy-lime-gradient opacity-40" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-sy-lime/[0.04] to-transparent animate-pulse" />
              <div className="relative h-full flex items-center justify-center">
                <span className="text-[11px] font-data uppercase tracking-[0.2em] text-sy-muted/60">
                  Loading section…
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
