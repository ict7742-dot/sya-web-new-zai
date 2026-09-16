'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/** Visible trigger button for the global Cmd/Ctrl+K command palette.
 *
 *  HYDRATION-SAFE PATTERN:
 *  - Server renders "Ctrl K" (isMac=false)
 *  - Client first render also renders "Ctrl K" (isMac=false) → matches server
 *  - useEffect runs AFTER hydration → setIsMac(true) on Mac
 *  - Second client render shows "⌘K"
 *  - The <kbd> uses suppressHydrationWarning because the text is intentionally
 *    client-determined (depends on navigator.platform, which is client-only)
 *
 *  This is the canonical React pattern for client-only values. */
export function SearchTrigger({ className = '' }: { className?: string }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const open = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })
    );
  };

  return (
    <button
      onClick={open}
      className={`cmdk-trigger ${className}`}
      aria-label="Open search (Cmd/Ctrl+K)"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search…</span>
      <kbd className="hidden sm:inline-flex" suppressHydrationWarning>
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
