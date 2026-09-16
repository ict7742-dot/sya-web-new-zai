'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, FileText, Calendar, ArrowUpRight, X } from 'lucide-react';

interface SearchPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  createdAt: string;
}

/** Per-category accent (gold/emerald/crimson) via cf-* tokens. */
const CATEGORY_ACCENT: Record<string, { text: string; bg: string; ring: string }> = {
  'Market Analysis': { text: 'text-cf-emerald', bg: 'bg-cf-emerald/10', ring: 'border-cf-emerald/30' },
  'Trading Tips': { text: 'text-cf-gold', bg: 'bg-cf-gold/10', ring: 'border-cf-gold/30' },
  'SEBI Updates': { text: 'text-cf-crimson', bg: 'bg-cf-crimson/10', ring: 'border-cf-crimson/30' },
  'Course Updates': { text: 'text-cf-gold-soft', bg: 'bg-cf-gold-soft/10', ring: 'border-cf-gold-soft/30' },
  General: { text: 'text-cf-mist', bg: 'bg-white/[0.04]', ring: 'border-white/10' },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Escape regex special chars in a string. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Highlight all occurrences of each search term within text by wrapping
 *  them in <mark>. Returns an array of strings + <mark> elements safe for
 *  React rendering (no dangerouslySetInnerHTML). */
function highlight(text: string, query: string): ReactNode[] {
  const terms = query.trim().split(/\s+/).filter((t) => t.length >= 2);
  if (terms.length === 0) return [text];

  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
    return isMatch ? <mark key={i} className="search-highlight">{part}</mark> : part;
  });
}

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Run the search.
  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=24`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL ?q= when query changes (debounced).
  const updateUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) params.set('q', q.trim());
      else params.delete('q');
      router.replace(`/search${params.toString() ? `?${params}` : ''}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search + URL update on input change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
      updateUrl(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Initial search on mount if there's a query.
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    inputRef.current?.focus();
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setSearched(false);
    updateUrl('');
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Search bar — glassmorphic with gold focus ring */}
      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cf-text-muted" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, authors…"
          aria-label="Search articles"
          className="w-full rounded-xl border border-cf-glass-border bg-cf-glass backdrop-blur-glass backdrop-saturate-glass py-4 pl-14 pr-12 text-lg text-cf-text outline-none transition-all duration-240 ease-cinematic placeholder:text-cf-text-muted focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 shadow-glass"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-cf-mist transition-colors duration-160 hover:bg-cf-gold/10 hover:text-cf-gold"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Status row */}
      {searched && (
        <p className="mb-6 text-sm text-cf-mist">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-cf-gold" /> Searching…
            </span>
          ) : (
            <>
              {total} {total === 1 ? 'result' : 'results'} for{' '}
              <span className="font-medium text-cf-gold">&ldquo;{query.trim()}&rdquo;</span>
            </>
          )}
        </p>
      )}

      {/* Results */}
      {!searched ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-glass border border-cf-glass-border backdrop-blur-glass">
            <Search className="h-7 w-7 text-cf-text-muted" />
          </div>
          <p className="text-cf-mist">Start typing to search across all our market insights.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['options', 'SEBI', 'position sizing', 'NIFTY'].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-cf-glass-border bg-cf-glass px-3 py-1.5 text-xs text-cf-mist transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? null : results.length === 0 ? (
        <div className="relative rounded-xl bg-cf-glass border border-cf-glass-border shadow-glass overflow-hidden py-20 flex flex-col items-center gap-3 text-center">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
          <FileText className="relative h-8 w-8 text-cf-text-muted" />
          <p className="relative text-cf-mist">No articles match your search.</p>
          <button
            onClick={clearSearch}
            className="relative text-sm text-cf-gold hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((post, i) => {
            const accent = CATEGORY_ACCENT[post.category] ?? CATEGORY_ACCENT.General;
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group relative flex flex-col rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40 hover:shadow-glow-gold animate-cf-reveal-up [animation-delay:${Math.min(i, 8) * 80}ms]`}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />

                {/* Cover — image zoom on hover */}
                <div className="relative h-44 overflow-hidden bg-cf-bg-panel">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover opacity-70 transition-all duration-240 ease-cinematic group-hover:opacity-95 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cf-bg-panel to-cf-bg-elevated">
                      <FileText className="h-9 w-9 text-cf-gold/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-cf-bg/70 to-transparent" />
                  {/* Category chip */}
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border backdrop-blur-glass px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${accent.bg} ${accent.text} ${accent.ring} hover:scale-105 transition-transform duration-240`}>
                    {post.category}
                  </span>
                </div>

                {/* Body */}
                <div className="relative flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-cf-text-strong transition-colors duration-160 group-hover:text-cf-gold">
                    {highlight(post.title, query)}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-cf-mist">
                      {highlight(post.excerpt, query)}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-cf-text-muted">
                    <span className="inline-flex items-center gap-1.5 font-data tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-cf-gold" /> {fmt(post.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-cf-gold opacity-0 transition-opacity duration-240 group-hover:opacity-100">
                      Read <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
