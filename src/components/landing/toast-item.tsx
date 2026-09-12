'use client';

import { useEffect } from 'react';

export interface ToastData {
  id: number;
  msg: string;
  ok: boolean;
}

/**
 * Single toast notification item. Uses a double-rAF to trigger the CSS
 * transition after the element is mounted in the DOM.
 */
export function ToastItem({ toast: t }: { toast: ToastData }) {
  useEffect(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-toast-id="${t.id}"]`);
        el?.classList.add('show');
      })
    );
  }, [t.id]);

  return (
    <div data-toast-id={t.id} className="toast-item">
      <span className={`mt-0.5 shrink-0 ${t.ok ? 'text-cf-emerald' : 'text-cf-crimson'}`}>
        {t.ok ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.8 10A10 10 0 1 1 17 3.34" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </span>
      <span className="text-[13.5px] text-cf-text leading-snug">{t.msg}</span>
    </div>
  );
}
