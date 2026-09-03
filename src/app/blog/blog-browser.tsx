'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowUpRight, FileText } from 'lucide-react';

export interface BlogListPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  createdAt: string;
}

interface BlogBrowserProps {
  posts: BlogListPost[];
  categories: string[];
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

export function BlogBrowser({ posts, categories }: BlogBrowserProps) {
  const [activeCat, setActiveCat] = useState<string>('All');
  const [query, setQuery] = useState('');

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
      {/* Controls */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {allCats.map((cat) => {
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`cat-pill ${active ? 'cat-pill-active' : ''}`}
                aria-pressed={active}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525C70]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-md border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-[#EDEFF5] outline-none transition-colors placeholder:text-[#525C70] focus:border-[#E2B15C]/60 focus:bg-white/[0.05]"
          />
        </div>
      </div>

      {/* Result count */}
      <p className="mb-6 text-xs uppercase tracking-[0.18em] text-[#98A2B8]">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {activeCat !== 'All' && ` · ${activeCat}`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
          <FileText className="h-8 w-8 text-[#525C70]" />
          <p className="text-[#98A2B8]">No articles match your search.</p>
          <button
            onClick={() => {
              setQuery('');
              setActiveCat('All');
            }}
            className="text-sm text-[#E2B15C] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
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
