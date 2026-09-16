'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/** Visible trigger button for the global Cmd/Ctrl+K command palette.
 *  NOTE: isMac is intentionally NOT set via useState initializer — that would
 *  run on both server (navigator undefined → false) and client (navigator
 *  available → true on Mac), causing a hydration mismatch on the <kbd> text.
 *  Instead, isMac starts as false (matches server) and is set to the real
 *  value AFTER mount via useEffect. The <kbd> updates from "Ctrl K" to "⌘K"
 *  on the second render — invisible to the user but hydration-safe. */
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
      <kbd className="hidden sm:inline-flex">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  );
}
