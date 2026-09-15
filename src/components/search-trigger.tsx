'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

/** Visible trigger button for the global Cmd/Ctrl+K command palette. */
export function SearchTrigger({ className = '' }: { className?: string }) {
  const [isMac] = useState(
    () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  );

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
