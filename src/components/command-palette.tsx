'use client';

import { useState, useEffect, useRef, useCallback, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, CornerDownLeft, ArrowLeft, FileText } from 'lucide-react';

interface SearchPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  author: string;
  createdAt: string;
}

/** Escape regex special chars. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Highlight matched query terms in text via <mark> (safe React rendering). */
function highlight(text: string, query: string): ReactNode[] {
  const terms = query.trim().split(/\s+/).filter((t) => t.length >= 2);
  if (terms.length === 0) return [text];
  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  return text.split(pattern).map((part, i) => {
    const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
    return isMatch ? <mark key={i} className="search-highlight">{part}</mark> : part;
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  'Market Analysis': 'bg-[#35D49A]/12 text-[#35D49A] ring-[#35D49A]/25',
  'Trading Tips': 'bg-[#E2B15C]/12 text-[#E2B15C] ring-[#E2B15C]/25',
  'SEBI Updates': 'bg-[#818CF8]/12 text-[#818CF8] ring-[#818CF8]/25',
  'Course Updates': 'bg-[#F0CD8F]/12 text-[#F0CD8F] ring-[#F0CD8F]/25',
  General: 'bg-white/[0.06] text-[#C6CDDB] ring-white/10',
};

const SUGGESTIONS = ['options', 'SEBI', 'position sizing', 'NIFTY', 'iron condor'];

/** Global command palette — opens with Cmd/Ctrl+K, closes with Escape.
 *  Renders a modal overlay with a search input, live results, and keyboard
 *  navigation (Up/Down to move, Enter to open). Mounted once in the root
 *  layout so it's available on every page. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keyboard shortcut: Cmd/Ctrl+K to open, Escape handled in overlay.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll + focus input when open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Defer focus to the next tick so the input is mounted.
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  // Debounced search.
  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
      setActiveIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const openPost = useCallback(
    (post?: SearchPost) => {
      if (!post) return;
      setOpen(false);
      router.push(`/blog/${post.slug}`);
    },
    [router, setOpen]
  );

  // Keyboard navigation within results.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      openPost(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (results[activeIndex]) openPost(results[activeIndex]);
    else if (query.trim().length >= 2) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const goToFullSearch = () => {
    setOpen(false);
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
    >
      <div className="cmdk-modal" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        {/* Search input */}
        <form onSubmit={handleSubmit} className="cmdk-input-row">
          <Search className="h-5 w-5 text-[#525C70]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, authors…"
            aria-label="Search query"
            className="cmdk-input"
            autoComplete="off"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#E2B15C]" />}
          <kbd className="cmdk-esc">ESC</kbd>
        </form>

        {/* Body */}
        <div className="cmdk-body">
          {query.trim().length < 2 ? (
            // Suggestions
            <div className="cmdk-section">
              <p className="cmdk-section-label">Suggested searches</p>
              <div className="cmdk-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="cmdk-suggestion"
                  >
                    <Search className="h-3.5 w-3.5" /> {s}
                  </button>
                ))}
              </div>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="cmdk-empty">
              <Loader2 className="h-5 w-5 animate-spin text-[#E2B15C]" />
            </div>
          ) : results.length === 0 ? (
            <div className="cmdk-empty">
              <FileText className="h-8 w-8 text-[#525C70]" />
              <p className="text-sm text-[#98A2B8]">No articles match “{query.trim()}”.</p>
              <button onClick={goToFullSearch} className="cmdk-full-search">
                Open full search <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <>
              <div className="cmdk-results">
                {results.map((post, i) => (
                  <button
                    key={post.id}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => openPost(post)}
                    className={`cmdk-result ${i === activeIndex ? 'cmdk-result-active' : ''}`}
                  >
                    <div className="cmdk-result-icon">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="cmdk-result-text">
                      <p className="cmdk-result-title">{highlight(post.title, query)}</p>
                      <div className="cmdk-result-meta">
                        <span
                          className={`cmdk-result-cat ${
                            CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General
                          }`}
                        >
                          {post.category}
                        </span>
                        <span className="cmdk-result-author">{post.author}</span>
                      </div>
                    </div>
                    {i === activeIndex && (
                      <CornerDownLeft className="h-4 w-4 shrink-0 text-[#98A2B8]" />
                    )}
                  </button>
                ))}
              </div>
              {/* Footer */}
              <div className="cmdk-footer">
                <button onClick={goToFullSearch} className="cmdk-full-search">
                  View all {query.trim().length >= 2 ? `results for “${query.trim()}”` : 'articles'}
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </button>
                <span className="cmdk-hints">
                  <kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open <kbd>esc</kbd> close
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
