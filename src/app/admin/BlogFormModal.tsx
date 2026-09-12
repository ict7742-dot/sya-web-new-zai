'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  CATEGORIES,
  generateSlug,
  emptyBlogForm,
  type BlogFormData,
  type BlogPost,
} from './lib';

interface BlogFormModalProps {
  /** null = creating a new post; string = editing this slug. */
  editingSlug: string | null;
  /** Initial form data when opening (for edit, content is fetched async). */
  initialForm: BlogFormData;
  /** Called when the user cancels / closes the modal. */
  onClose: () => void;
  /** Fired on a successful create/update — parent refetches the list. */
  onSuccess: (verb: 'created' | 'updated') => void;
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** The blog post being edited (for the async content fetch). Null on create. */
  editPost: BlogPost | null;
}

/**
 * Blog create/edit modal — Phase 12d extraction.
 *
 * Owns its own form state, validation, async content fetch (for edit mode),
 * and submit. The parent only passes `editingSlug` + `initialForm` + callbacks.
 *
 * Cinematic Finance styling: glassmorphic panel (bg-cf-glass + backdrop-blur-glass
 * + gold top-edge + glow), cf-* inputs with gold focus rings, JetBrains Mono
 * slug field, cf-gold-gradient submit, glassmorphic cover-image preview.
 */
export function BlogFormModal({
  editingSlug,
  initialForm,
  editPost,
  onClose,
  onSuccess,
  onUnauthorized,
}: BlogFormModalProps) {
  const [blogForm, setBlogForm] = useState<BlogFormData>(initialForm);
  const [blogFormErrors, setBlogFormErrors] = useState<Record<string, string>>({});
  const [blogFormLoading, setBlogFormLoading] = useState(false);
  const [blogFormError, setBlogFormError] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  /* ── Edit mode: fetch the full post (incl. content) ── */
  useEffect(() => {
    if (!editingSlug || !editPost) return;
    let cancelled = false;
    (async () => {
      setContentLoading(true);
      try {
        const res = await fetch(`/api/admin/blogs/${encodeURIComponent(editingSlug)}`);
        if (cancelled) return;
        if (res.ok) {
          const full = await res.json();
          setBlogForm((prev) => ({ ...prev, content: full.content ?? '' }));
        } else {
          setBlogFormError('Could not load existing post content — saving may overwrite it.');
        }
      } catch {
        if (!cancelled) setBlogFormError('Network error loading post content.');
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editingSlug, editPost]);

  const handleBlogTitleChange = (title: string) => {
    setBlogForm((prev) => ({
      ...prev,
      title,
      slug: editingSlug ? prev.slug : generateSlug(title),
    }));
    setBlogFormErrors((prev) => {
      const next = { ...prev };
      delete next.title;
      return next;
    });
  };

  const validateBlogForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!blogForm.title.trim()) errors.title = 'Title is required.';
    if (!blogForm.slug.trim() || !/^[a-z0-9-]+$/.test(blogForm.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }
    if (!editingSlug && !blogForm.content.trim()) {
      errors.content = 'Content is required for new posts.';
    }
    setBlogFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateBlogForm()) return;

    setBlogFormLoading(true);
    setBlogFormError('');

    try {
      const payload: Record<string, unknown> = {
        title: blogForm.title,
        slug: blogForm.slug,
        category: blogForm.category,
        author: blogForm.author,
        excerpt: blogForm.excerpt || null,
        published: blogForm.published,
        coverImage: blogForm.coverImage || null,
      };
      if (blogForm.content.trim()) payload.content = blogForm.content;

      if (!editingSlug && !blogForm.content.trim()) {
        setBlogFormErrors({ content: 'Content is required.' });
        setBlogFormLoading(false);
        return;
      }

      const url = editingSlug
        ? `/api/blogs/${encodeURIComponent(editingSlug)}`
        : '/api/blogs';
      const method = editingSlug ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.fields) {
          setBlogFormErrors(data.fields);
          setBlogFormError(data.error || 'Validation failed.');
        } else {
          setBlogFormError(data.error || `Failed to ${editingSlug ? 'update' : 'create'} post.`);
        }
        setBlogFormLoading(false);
        return;
      }

      onSuccess(editingSlug ? 'updated' : 'created');
    } catch {
      setBlogFormError('Network error. Please try again.');
    } finally {
      setBlogFormLoading(false);
    }
  };

  const inputClass =
    'w-full bg-cf-glass border border-cf-glass-border rounded-md px-3 py-2 text-sm text-cf-text placeholder:text-cf-text-muted focus:outline-none focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 transition-all duration-240 ease-cinematic';
  const labelClass = 'block text-sm text-cf-mist mb-1';
  const errClass = 'text-cf-crimson text-xs mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-cf-bg/70 backdrop-blur-sm p-4 pt-[8vh]">
      <div className="w-full max-w-xl relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-normal text-[28px] leading-none tracking-[-0.01em] text-cf-text-strong">
              {editingSlug ? 'Edit Post' : 'New Post'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-cf-mist hover:text-cf-gold hover:bg-cf-gold/10 transition-colors duration-160"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {blogFormError && (
            <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-3 text-sm text-cf-crimson mb-4">
              {blogFormError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={blogForm.title}
                onChange={(e) => handleBlogTitleChange(e.target.value)}
                className={inputClass}
                placeholder="Post title"
                autoFocus
              />
              {blogFormErrors.title && <p className={errClass}>{blogFormErrors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                type="text"
                value={blogForm.slug}
                onChange={(e) => {
                  setBlogForm((prev) => ({ ...prev, slug: e.target.value }));
                  setBlogFormErrors((prev) => { const n = { ...prev }; delete n.slug; return n; });
                }}
                disabled={!!editingSlug}
                className={`${inputClass} disabled:opacity-50 font-data text-[13px]`}
                placeholder="post-url-slug"
              />
              {blogFormErrors.slug && <p className={errClass}>{blogFormErrors.slug}</p>}
              {editingSlug && (
                <p className="text-xs text-cf-text-muted mt-1">Slug cannot be changed after creation.</p>
              )}
            </div>

            {/* Category & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={blogForm.category}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, category: e.target.value }))}
                  className={`${inputClass} appearance-none`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-cf-bg-elevated text-cf-text">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input
                  type="text"
                  value={blogForm.author}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, author: e.target.value }))}
                  className={inputClass}
                  placeholder="SYA Team"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelClass}>Excerpt</label>
              <input
                type="text"
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                className={inputClass}
                placeholder="Brief description (optional)"
              />
            </div>

            {/* Content */}
            <div>
              <label className={labelClass}>
                Content {editingSlug ? '(leave blank to keep existing)' : '*'}
                {contentLoading && <span className="ml-2 text-cf-gold text-[11px]">loading…</span>}
              </label>
              <textarea
                value={blogForm.content}
                onChange={(e) => {
                  setBlogForm((prev) => ({ ...prev, content: e.target.value }));
                  setBlogFormErrors((prev) => { const n = { ...prev }; delete n.content; return n; });
                }}
                rows={8}
                className={`${inputClass} resize-y font-data text-[13px] leading-relaxed`}
                placeholder="Write your post content here (Markdown supported)..."
              />
              {blogFormErrors.content && <p className={errClass}>{blogFormErrors.content}</p>}
            </div>

            {/* Cover Image URL */}
            <div>
              <label className={labelClass}>Cover Image URL</label>
              <input
                type="url"
                value={blogForm.coverImage}
                onChange={(e) => setBlogForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                className={inputClass}
                placeholder="https://example.com/cover.jpg (optional)"
              />
              {blogForm.coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-cf-glass-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blogForm.coverImage}
                    alt="Cover preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={blogForm.published}
                onClick={() => setBlogForm((prev) => ({ ...prev, published: !prev.published }))}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-240 ${
                  blogForm.published ? 'bg-cf-gold-gradient' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform duration-240 ease-cinematic ${
                    blogForm.published ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-cf-text">Published</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-cf-glass-border text-cf-text font-medium text-sm transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={blogFormLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-sm transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold disabled:opacity-50 disabled:translate-y-0"
              >
                {blogFormLoading && <Loader2 size={15} className="animate-spin" />}
                {editingSlug ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Convenience factory so the parent can reset to a blank form for "new post". */
export function blankBlogForm(): BlogFormData {
  return { ...emptyBlogForm };
}
