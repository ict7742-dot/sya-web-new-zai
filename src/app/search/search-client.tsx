'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const CATEGORY_COLORS: Record<string, string> = {
  'Market Analysis': 'bg-[#35D49A]/12 text-[#35D49A] ring-[#35D49A]/25',
  'Trading Tips': 'bg-[#E2B15C]/12 text-[#E2B15C] ring-[#E2B15C]/25',
  'SEBI Updates': 'bg-[#818CF8]/12 text-[#818CF8] ring-[#818CF8]/25',
  'Course Updates': 'bg-[#F0CD8F]/12 text-[#F0CD8F] ring-[#F0CD8F]/25',
  General: 'bg-white/[0.06] text-[#C6CDDB] ring-white/10',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#525C70]" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, authors…"
          aria-label="Search articles"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-4 pl-14 pr-12 text-lg text-[#EDEFF5] outline-none transition-colors placeholder:text-[#525C70] focus:border-[#E2B15C]/60 focus:bg-white/[0.05]"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#98A2B8] transition-colors hover:bg-white/[0.06] hover:text-[#E8EBF2]"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Status row */}
      {searched && (
        <p className="mb-6 text-sm text-[#98A2B8]">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#E2B15C]" /> Searching…
            </span>
          ) : (
            <>
              {total} {total === 1 ? 'result' : 'results'} for{' '}
              <span className="font-medium text-[#E2B15C]">“{query.trim()}”</span>
            </>
          )}
        </p>
      )}

      {/* Results */}
      {!searched ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.08]">
            <Search className="h-7 w-7 text-[#525C70]" />
          </div>
          <p className="text-[#98A2B8]">Start typing to search across all our market insights.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['options', 'SEBI', 'position sizing', 'NIFTY'].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-[#98A2B8] transition-colors hover:border-[#E2B15C]/40 hover:text-[#E2B15C]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? null : results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
          <FileText className="h-8 w-8 text-[#525C70]" />
          <p className="text-[#98A2B8]">No articles match your search.</p>
          <button
            onClick={clearSearch}
            className="text-sm text-[#E2B15C] hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="blog-card group flex flex-col"
            >
              <div className="blog-card-cover">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0C1322] to-[#0A0F1C]">
                    <FileText className="h-9 w-9 text-[#E2B15C]/40" />
                  </div>
                )}
                <span
                  className={`blog-card-cat ${
                    CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General
                  }`}
                >
                  {post.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-[family-name:var(--font-fraunces)] text-[17px] font-semibold leading-snug text-[#E8EBF2] transition-colors group-hover:text-[#E2B15C]">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-[#98A2B8]">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-5 text-xs text-[#525C70]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {fmt(post.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#E2B15C] opacity-0 transition-opacity group-hover:opacity-100">
                    Read <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
