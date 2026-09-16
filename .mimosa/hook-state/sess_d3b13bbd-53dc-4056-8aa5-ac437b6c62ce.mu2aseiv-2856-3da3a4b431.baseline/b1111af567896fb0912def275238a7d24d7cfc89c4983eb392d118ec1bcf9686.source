'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Calendar, ArrowUpRight, FileText, Clock } from 'lucide-react';

export interface BlogListPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  createdAt: string | Date;
}

interface BlogBrowserProps {
  posts: BlogListPost[];
  categories: string[];
}

/** Per-category accent (gold/emerald/crimson) — keeps the visual signal of the
 *  legacy color coding but via cf-* tokens. */
const CATEGORY_ACCENT: Record<string, { text: string; bg: string; ring: string }> = {
  'Market Analysis': { text: 'text-cf-emerald', bg: 'bg-cf-emerald/10', ring: 'border-cf-emerald/30' },
  'Trading Tips': { text: 'text-cf-gold', bg: 'bg-cf-gold/10', ring: 'border-cf-gold/30' },
  'SEBI Updates': { text: 'text-cf-crimson', bg: 'bg-cf-crimson/10', ring: 'border-cf-crimson/30' },
  'Course Updates': { text: 'text-cf-gold-soft', bg: 'bg-cf-gold-soft/10', ring: 'border-cf-gold-soft/30' },
  General: { text: 'text-cf-mist', bg: 'bg-white/[0.04]', ring: 'border-white/10' },
};

function fmt(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function catSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

export function BlogBrowser({ posts, categories }: BlogBrowserProps) {
  const [activeCat, setActiveCat] = useState<string>('All');
  const [query, setQuery] = useState('');
  const router = useRouter();

  const goToCategory = (e: MouseEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/blog/category/${catSlug(category)}`);
  };

  const filtered = useMemo(() => {
    let list = posts;
    if (activeCat !== 'All') list = list.filter((p) => p.category === activeCat);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt?.toLowerCase().includes(q) ?? false) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, activeCat, query]);

  const allCats = ['All', ...categories];

  return (
    <div>
      {/* Controls — glassmorphic category pills + cf-gold search */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {allCats.map((cat) => {
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-[12.5px] font-medium transition-all duration-240 ease-cinematic ${
                  active
                    ? 'bg-cf-gold-gradient text-cf-bg shadow-glow-gold'
                    : 'bg-cf-glass text-cf-mist border border-cf-glass-border hover:text-cf-text hover:border-cf-gold/40'
                }`}
                aria-pressed={active}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cf-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-md border border-cf-glass-border bg-cf-glass backdrop-blur-glass py-2.5 pl-10 pr-4 text-sm text-cf-text outline-none transition-all duration-240 ease-cinematic placeholder:text-cf-text-muted focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20"
          />
        </div>
      </div>

      {/* Result count */}
      <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {activeCat !== 'All' && ` · ${activeCat}`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass border border-cf-glass-border shadow-glass overflow-hidden py-20 flex flex-col items-center gap-3 text-center">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
          <FileText className="relative h-8 w-8 text-cf-text-muted" />
          <p className="relative text-cf-mist">No articles match your search.</p>
          <button
            onClick={() => { setQuery(''); setActiveCat('All'); }}
            className="relative text-sm text-cf-gold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => {
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
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={(e) => goToCategory(e, post.category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToCategory(e as unknown as MouseEvent, post.category);
                      }
                    }}
                    className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border backdrop-blur-glass px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${accent.bg} ${accent.text} ${accent.ring} hover:scale-105 transition-transform duration-240`}
                    aria-label={`View all posts in ${post.category}`}
                    title={`View all posts in ${post.category}`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Body */}
                <div className="relative flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-cf-text-strong transition-colors duration-160 group-hover:text-cf-gold">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-cf-mist">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-cf-text-muted">
                    <span className="inline-flex items-center gap-1.5 font-data tabular-nums">
                      <Calendar className="h-3.5 w-3.5" /> {fmt(post.createdAt)}
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
