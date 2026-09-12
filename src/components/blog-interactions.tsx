'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Fixed gold gradient progress bar at the top of the viewport that tracks
 *  scroll. Also renders a small glassmorphic percentage badge in the top-right
 *  corner — a Cinematic Finance detail that gives readers a sense of how far
 *  through the article they are. Hidden until the reader scrolls past 2%, and
 *  hidden under prefers-reduced-motion (the badge is fine, but the bar's
 *  transition is already handled by the global guard). */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pct = Math.round(progress);

  return (
    <>
      {/* The progress bar itself */}
      <div
        className="bg-cf-gold-gradient fixed left-0 top-0 z-[60] h-[3px]"
        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        aria-hidden
      />
      {/* Percentage badge — glassmorphic gold pill, top-right.
          Appears once the reader scrolls past 2%; hides at the very top so it
          doesn't clutter the hero. */}
      {pct > 2 && (
        <div
          className="fixed top-3 right-3 z-[60] hidden sm:flex items-center gap-1.5 rounded-full bg-cf-glass backdrop-blur-glass border border-cf-glass-border shadow-glass px-2.5 py-1 transition-opacity duration-240 ease-cinematic"
          aria-label={`${pct}% of article read`}
        >
          <span className="font-data text-[11px] font-semibold tabular-nums text-cf-gold">
            {pct}%
          </span>
          <span className="block w-8 h-1 rounded-full bg-white/10 overflow-hidden">
            <span
              className="block h-full bg-cf-gold-gradient transition-[width] duration-100 linear"
              style={{ width: `${pct}%` }}
            />
          </span>
        </div>
      )}
    </>
  );
}

/** Copy-link + native share buttons. Stays client-only (uses clipboard/Web API). */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-text-muted">Share</span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        aria-label="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.96 1.38-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.95-4.37-.15-.2-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.37.78-.37.2 0 .39.002.56.01.18.008.42-.07.66.5.24.59.82 2.03.89 2.18.07.15.12.32.02.52-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.29.15.46.13.63-.08.17-.2.73-.85.93-1.15.2-.29.39-.24.66-.15.27.1 1.71.81 2 .96.29.15.49.22.56.35.07.13.07.74-.17 1.42z" />
        </svg>
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
        aria-label="Share on X"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <button
        onClick={copyLink}
        className="share-btn"
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-cf-emerald" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * Highlights the current ToC entry based on which heading is in view.
 * Uses IntersectionObserver with a rootMargin that triggers ~30% down the
 * viewport so the active item updates as you read, not only at the very top.
 */
export function ActiveTocHighlighter() {
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLElement>('article .markdown-body h2[id]'));
    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('aside nav a'));
    if (headings.length === 0 || tocLinks.length === 0) return;

    const linkFor = (id: string) =>
      tocLinks.find((a) => a.getAttribute('href') === `#${id}`);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const activeId = visible[0]?.target.id;

        tocLinks.forEach((l) => l.classList.remove('toc-link-active'));
        if (activeId) linkFor(activeId)?.classList.add('toc-link-active');
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return null;
}

/**
 * Glassmorphic gold back-to-top button for article pages. The landing page has
 * its own .btt-btn; this is the article-page equivalent — appears after the
 * reader scrolls past 600px, smooth-scrolls to top (respects reduced-motion),
 * and uses the Cinematic Finance glassmorphic + gold-ring treatment.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });

  return (
    <button
      type="button"
      onClick={toTop}
      data-visible={visible}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full border border-cf-gold/30 bg-cf-glass text-cf-gold backdrop-blur-glass flex items-center justify-center transition-all duration-240 ease-cinematic data-[visible=false]:opacity-0 data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-3 hover:bg-cf-gold/15 hover:border-cf-gold/60 hover:shadow-glow-gold motion-reduce:transition-none"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
