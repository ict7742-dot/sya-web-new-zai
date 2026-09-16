'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Clock } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';

interface BlogPostPreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  createdAt: string;
}

/**
 * Blog / Insights preview — Phase 9.9 visual rewrite using Cinematic Finance tokens.
 *
 * Owns its own data fetch (`/api/blogs?limit=3`) — the `blogPosts` state +
 * useEffect previously lived in page.tsx and has been moved here.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md §9.9):
 *   - Bebas Neue section heading + eyebrow with gold hairline
 *   - Glassmorphic card grid (3-col desktop / 2-col tablet / 1-col mobile)
 *   - Image zoom on hover (scale-1.05 duration-240 ease-cinematic) — image also
 *     lifts from 70% → 95% opacity
 *   - Glassmorphic gradient overlay carrying title + excerpt + author/date
 *   - 80ms staggered reveal of the cards
 *   - Empty state when no posts exist
 *   - "View all insights" ghost CTA links to /blog
 */
export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPostPreview[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/blogs?limit=3')
      .then((res) => res.json())
      .then((data) => { if (!cancelled && Array.isArray(data)) setPosts(data); })
      .catch(() => { /* silently fail — empty state renders */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <LazySection>
      <section id="blog" className="sec border-t border-white/[0.06] relative overflow-hidden">
        {/* Ambient gold glow */}
        <div
          className="pointer-events-none absolute -top-24 right-10 w-[460px] h-[460px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
          style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.14), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="wrap relative">
          {/* Header */}
          <div className="animate-cf-reveal-up">
            <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              07 · Insights
            </p>
            <h2 className="font-display font-normal text-[48px] md:text-[72px] lg:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
              Latest from the <span className="bg-cf-gold-gradient bg-clip-text text-transparent">desk</span>
            </h2>
            <p className="mt-4 text-cf-mist text-[15px] leading-relaxed max-w-xl">
              Market insights, trading strategies, and updates from the SYA team.
            </p>
          </div>

          {/* Empty state */}
          {posts.length === 0 ? (
            <div className="mt-12 animate-cf-reveal-up [animation-delay:80ms]">
              <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-12 flex flex-col items-center justify-center text-center">
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
                <BookOpen className="relative w-10 h-10 text-cf-text-muted mb-4" />
                <p className="relative text-[15px] text-cf-mist">No posts yet. Check back soon for market insights from our team.</p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
              {posts.map((post, i) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`group relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40 animate-cf-reveal-up [animation-delay:${80 + i * 80}ms]`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow opacity-0 group-hover:opacity-100 transition-opacity duration-240" />

                  {/* Cover image — zoom on hover (scale-1.05, duration-240 ease-cinematic) */}
                  <div className="relative h-44 overflow-hidden bg-cf-bg-panel">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-[1.05] transition-all duration-240 ease-cinematic"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-cf-text-muted/40" />
                      </div>
                    )}
                    {/* Glassmorphic gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cf-bg/80 via-cf-bg/20 to-transparent" />
                    {/* Category chip on the image */}
                    <span className="absolute top-3 left-3 text-[10px] tracking-[0.16em] uppercase font-semibold text-cf-gold px-2.5 py-1 rounded bg-cf-bg/70 backdrop-blur-glass border border-cf-glass-border">
                      {post.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="relative p-5">
                    <h3 className="text-[17px] font-semibold text-cf-text-strong leading-snug line-clamp-2 group-hover:text-cf-gold transition-colors duration-160">
                      {post.title}
                    </h3>
                    <p className="text-[13px] text-cf-mist leading-relaxed line-clamp-3 mt-2">{post.excerpt || ''}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.07]">
                      <span className="text-[12px] text-cf-text">{post.author}</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-cf-text-muted font-data tabular-nums">
                        <Clock className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* View all CTA */}
          {posts.length > 0 && (
            <div className="mt-10 text-center animate-cf-reveal-up [animation-delay:320ms]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                View all insights <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </LazySection>
  );
}
