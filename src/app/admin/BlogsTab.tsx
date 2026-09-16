'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  formatDate,
  emptyBlogForm,
  type BlogPost,
  type BlogFormData,
} from './lib';
import { BlogFormModal } from './BlogFormModal';

interface BlogsTabProps {
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** Toast notifier (lifted to parent). */
  onToast: (message: string, type: 'success' | 'error') => void;
}

/**
 * Blogs tab — Phase 12d extraction.
 *
 * Owns its own blogs list state + fetch + CRUD (new/edit/delete/publish toggle).
 * The BlogFormModal is rendered inside this tab when showBlogForm is true.
 *
 * Cinematic Finance: glassmorphic blogs table, cf-* status pills (emerald
 * Published / mist Draft), cf-* action buttons with gold/crimson hover accents,
 * glassmorphic delete-confirm modal with crimson danger button.
 */
export function BlogsTab({ onUnauthorized, onToast }: BlogsTabProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** { [slug]: { words, readingMins } } — fetched in parallel with the blog list
   *  so the Words column can render without an N+1 per-post content fetch. */
  const [wordCounts, setWordCounts] = useState<Record<string, { words: number; readingMins: number }>>({});

  // Blog form modal state
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [initialForm, setInitialForm] = useState<BlogFormData>(emptyBlogForm);

  // Delete confirm modal state
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch the blog list + word counts in parallel — single round-trip for
      // both, no N+1 on the per-post content.
      const [listRes, wcRes] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/blogs/word-counts'),
      ]);
      if (listRes.status === 401 || wcRes.status === 401) { onUnauthorized(); return; }
      if (!listRes.ok) throw new Error('Failed to fetch blogs');
      const data = await listRes.json();
      setBlogs(data);
      if (wcRes.ok) {
        const wc = await wcRes.json();
        setWordCounts(wc);
      }
    } catch {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const openNewBlog = () => {
    setEditingSlug(null);
    setEditPost(null);
    setInitialForm({ ...emptyBlogForm });
    setShowBlogForm(true);
  };

  const openEditBlog = (post: BlogPost) => {
    setEditingSlug(post.slug);
    setEditPost(post);
    setInitialForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author,
      excerpt: post.excerpt || '',
      content: '', // fetched async by BlogFormModal
      published: post.published,
      coverImage: post.coverImage || '',
    });
    setShowBlogForm(true);
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(post.slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) { onToast('Failed to update post status.', 'error'); return; }
      onToast(post.published ? 'Post unpublished.' : 'Post published!', 'success');
      fetchBlogs();
    } catch {
      onToast('Network error.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteSlug) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(deleteSlug)}`, { method: 'DELETE' });
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) { onToast('Failed to delete post.', 'error'); return; }
      onToast('Post deleted.', 'success');
      setDeleteSlug(null);
      fetchBlogs();
    } catch {
      onToast('Network error.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-cf-reveal-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-cf-mist">
          {blogs.length} post{blogs.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={openNewBlog}
          className="inline-flex items-center gap-2 bg-cf-gold-gradient text-cf-bg font-semibold rounded-md px-4 py-2 hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-240 ease-cinematic text-sm"
        >
          <Plus size={15} />
          New Post
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-cf-mist">
          <Loader2 size={20} className="animate-spin mr-2 text-cf-gold" />
          Loading posts...
        </div>
      ) : error ? (
        <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-4 text-sm text-cf-crimson">{error}</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 text-cf-mist text-sm">
          No blog posts yet. Click &ldquo;New Post&rdquo; to create one.
        </div>
      ) : (
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['Title', 'Slug', 'Category', 'Status', 'Views', 'Words', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-cf-mist whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-white/[0.04] last:border-b-0 hover:bg-cf-gold/[0.04] transition-colors duration-160"
                  >
                    <td className="px-4 py-3 font-medium text-cf-text-strong max-w-[200px] truncate">{post.title}</td>
                    <td className="px-4 py-3 text-cf-mist whitespace-nowrap font-data text-xs">{post.slug}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-cf-gold/[0.08] text-cf-gold border border-cf-gold/20">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          post.published
                            ? 'bg-cf-emerald/15 text-cf-emerald border-cf-emerald/30'
                            : 'bg-white/[0.06] text-cf-mist border-white/10'
                        }`}
                      >
                        {post.published ? <><Eye size={11} /> Published</> : <><EyeOff size={11} /> Draft</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-cf-mist font-data tabular-nums text-xs">
                        <Eye size={12} className="text-cf-gold/60" />
                        {post.views.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex flex-col leading-tight">
                        <span className="text-cf-text font-data tabular-nums text-xs">{(wordCounts[post.slug]?.words ?? 0).toLocaleString('en-IN')} w</span>
                        <span className="text-cf-text-muted font-data tabular-nums text-[10px]">{wordCounts[post.slug]?.readingMins ?? 0} min</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cf-mist font-data tabular-nums whitespace-nowrap">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditBlog(post)}
                          className="p-1.5 rounded-md text-cf-mist hover:text-cf-gold hover:bg-cf-gold/10 transition-colors duration-160"
                          title="Edit"
                          aria-label={`Edit ${post.title}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => togglePublish(post)}
                          className={`p-1.5 rounded-md hover:bg-cf-gold/10 transition-colors duration-160 ${
                            post.published ? 'text-cf-mist hover:text-cf-crimson' : 'text-cf-mist hover:text-cf-emerald'
                          }`}
                          title={post.published ? 'Unpublish' : 'Publish'}
                          aria-label={post.published ? `Unpublish ${post.title}` : `Publish ${post.title}`}
                        >
                          {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteSlug(post.slug)}
                          className="p-1.5 rounded-md text-cf-mist hover:text-cf-crimson hover:bg-cf-crimson/10 transition-colors duration-160"
                          title="Delete"
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Form Modal */}
      {showBlogForm && (
        <BlogFormModal
          editingSlug={editingSlug}
          editPost={editPost}
          initialForm={initialForm}
          onClose={() => setShowBlogForm(false)}
          onSuccess={(verb) => {
            setShowBlogForm(false);
            onToast(verb === 'updated' ? 'Post updated!' : 'Post created!', 'success');
            fetchBlogs();
          }}
          onUnauthorized={onUnauthorized}
        />
      )}

      {/* Delete Confirm Modal — glassmorphic */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cf-bg/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-crimson/30 shadow-glass overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-crimson/60" />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
            <h3 className="relative font-display font-normal text-[24px] leading-tight text-cf-text-strong mb-2">Delete Post?</h3>
            <p className="relative text-sm text-cf-mist mb-5">
              This action cannot be undone. The post with slug{' '}
              <code className="text-cf-gold font-data text-xs">{deleteSlug}</code>{' '}
              will be permanently deleted.
            </p>
            <div className="relative flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteSlug(null)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-cf-glass-border text-cf-text font-medium text-sm transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cf-crimson text-white font-semibold text-sm transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(240,85,95,0.32)] disabled:opacity-50 disabled:translate-y-0"
              >
                {deleteLoading && <Loader2 size={15} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
