'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

/** Visible trigger button for the global Cmd/Ctrl+K command palette.
 *  Dispatches the same keyboard shortcut the palette listens for, so a single
 *  source of truth controls open/close. Hides the kbd hint on mobile. */
export function SearchTrigger({ className = '' }: { className?: string }) {
  // Lazy init: navigator is available on first client render. Using useState's
  // initializer avoids the "setState in effect" lint rule and hydration mismatch
  // (the kbd hint renders only after mount on the client).
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
