'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Defers rendering of children until they are about to enter the viewport.
 * Uses IntersectionObserver with a 200px rootMargin so the content renders
 * just before the user scrolls to it — improving initial page weight.
 * Shows a skeleton placeholder while not yet visible.
 */
export function LazySection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
              style={{ height: '300px' }}
              className="animate-pulse rounded-xl bg-white/[0.01]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
