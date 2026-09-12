'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  LogOut,
  Users,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Download,
  Shield,
  Eye,
  EyeOff,
  X,
  Loader2,
  Mail,
} from 'lucide-react';

/* ═══════════════ Types ═══════════════ */

interface Lead {
  name: string;
  phone: string;
  email: string;
  interest: string;
  createdAt: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  category: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  published: boolean;
  coverImage: string;
}

const CATEGORIES = ['General', 'Market Analysis', 'Trading Tips', 'Course Updates', 'SEBI Updates'];

const INTEREST_LABELS: Record<string, string> = {
  account: 'Open Demat',
  courses: 'Courses',
  both: 'Account + Courses',
};

const INTEREST_COLORS: Record<string, string> = {
  account: 'bg-[#E2B15C]/15 text-[#E2B15C]',
  courses: 'bg-[#35D49A]/15 text-[#35D49A]',
  both: 'bg-[#818CF8]/15 text-[#818CF8]',
};

/* ═══════════════ Helpers ═══════════════ */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/* ═══════════════ SYA Logo SVG ═══════════════ */

function SyaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="1.25" y="1.25" width="29.5" height="29.5" rx="7"
        fill="none" stroke="#E2B15C" strokeWidth="1.4" opacity=".8"
      />
      <path
        d="M8 22 L13 16 L17 19 L24 10" stroke="#fff"
        strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
    </svg>
  );
}

/* ═══════════════ Empty Blog Form ═══════════════ */

const emptyBlogForm: BlogFormData = {
  title: '',
  slug: '',
  category: 'General',
  author: 'SYA Team',
  excerpt: '',
  content: '',
  published: false,
  coverImage: '',
};

/* ═══════════════ Main Component ═══════════════ */

export default function AdminPage() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [tab, setTab] = useState<'leads' | 'blogs' | 'subscribers'>('leads');

  // Leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');

  // Blogs
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState('');

  // Blog Form Modal
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Subscribers (newsletter)
  const [subscribers, setSubscribers] = useState<Array<{ email: string; source: string; active: boolean; createdAt: string }>>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersError, setSubscribersError] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<BlogFormData>(emptyBlogForm);
  const [blogFormErrors, setBlogFormErrors] = useState<Record<string, string>>({});
  const [blogFormLoading, setBlogFormLoading] = useState(false);
  const [blogFormError, setBlogFormError] = useState('');

  // Delete Confirm
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ─── Auth ───

  const doLogin = useCallback(async (pw: string) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setLoginError('Invalid password. Please try again.');
        setLoginLoading(false);
        return;
      }
      // Cookie is now set by the server (httpOnly, not readable by JS).
      // Fetch initial leads data.
      setAuthed(true);
      const leadsRes = await fetch('/api/leads');
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.recent || []);
        setTotalLeads(data.total || 0);
      }
      setLoginLoading(false);
    } catch {
      setLoginError('Network error. Please try again.');
      setLoginLoading(false);
    }
  }, []);

  const doLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setAuthed(false);
    setPassword('');
  };

  // Check for existing session (cookie is sent automatically).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          setAuthed(true);
          const data = await res.json();
          setLeads(data.recent || []);
          setTotalLeads(data.total || 0);
        }
      } catch { /* not logged in */ }
    })();
  }, []);

  // ─── Leads ───

  const fetchLeads = useCallback(async () => {
    if (!authed) return;
    setLeadsLoading(true);
    setLeadsError('');
    try {
      const res = await fetch('/api/leads', {
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.recent || []);
      setTotalLeads(data.total || 0);
    } catch {
      setLeadsError('Failed to load leads.');
    } finally {
      setLeadsLoading(false);
    }
  }, [authed]);

  const exportCsv = async () => {
    if (!authed) return;
    try {
      const res = await fetch('/api/leads?format=csv', {
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sya-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CSV exported successfully!', 'success');
    } catch {
      showToast('Failed to export CSV.', 'error');
    }
  };

  useEffect(() => {
    if (authed && tab === 'leads') fetchLeads();
  }, [authed, tab, fetchLeads]);

  // ─── Subscribers ───
  const fetchSubscribers = useCallback(async () => {
    if (!authed) return;
    setSubscribersLoading(true);
    setSubscribersError('');
    try {
      const res = await fetch('/api/newsletter', {
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      const data = await res.json();
      setSubscribers(data.recent || []);
      setTotalSubscribers(data.total || 0);
    } catch {
      setSubscribersError('Failed to load subscribers.');
    } finally {
      setSubscribersLoading(false);
    }
  }, [authed]);

  const exportSubscribersCsv = async () => {
    if (!authed) return;
    try {
      const res = await fetch('/api/newsletter?format=csv', {
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sya-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Subscribers exported.', 'success');
    } catch {
      showToast('Export failed.', 'error');
    }
  };

  useEffect(() => {
    if (authed && tab === 'subscribers') fetchSubscribers();
  }, [authed, tab, fetchSubscribers]);

  // ─── Blogs ───

  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    setBlogsError('');
    try {
      const res = await fetch('/api/admin/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data);
    } catch {
      setBlogsError('Failed to load blog posts.');
    } finally {
      setBlogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && tab === 'blogs') fetchBlogs();
  }, [authed, tab, fetchBlogs]);

  // ─── Blog CRUD ───

  const openNewBlog = () => {
    setEditingSlug(null);
    setBlogForm(emptyBlogForm);
    setBlogFormErrors({});
    setBlogFormError('');
    setShowBlogForm(true);
  };

  const openEditBlog = async (post: BlogPost) => {
    setEditingSlug(post.slug);
    // Populate the form with the LIST-level fields we already have (title,
    // slug, category, author, excerpt, published, coverImage). The `content`
    // field is deliberately omitted by the list endpoint to keep list
    // payloads small — fetch the full post (incl. markdown body) from the
    // auth-gated admin detail endpoint.
    setBlogForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      author: post.author,
      excerpt: post.excerpt || '',
      content: '', // placeholder until the detail fetch completes
      published: post.published,
      coverImage: post.coverImage || '',
    });
    setBlogFormErrors({});
    setBlogFormError('');
    setShowBlogForm(true);

    // Fetch the full post (incl. content) in the background. This closes
    // the bug where editing a post would WIPE its markdown content because
    // the editor opened with an empty content field.
    try {
      const res = await fetch(`/api/admin/blogs/${encodeURIComponent(post.slug)}`);
      if (res.ok) {
        const full = await res.json();
        setBlogForm((prev) => ({ ...prev, content: full.content ?? '' }));
      } else {
        setBlogFormError('Could not load existing post content — saving may overwrite it.');
      }
    } catch {
      setBlogFormError('Network error loading post content.');
    }
  };

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

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authed || !validateBlogForm()) return;

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

      // Only send content if it's provided (skip for edits if not fetched)
      if (blogForm.content.trim()) {
        payload.content = blogForm.content;
      }

      const url = editingSlug
        ? `/api/blogs/${encodeURIComponent(editingSlug)}`
        : '/api/blogs';
      const method = editingSlug ? 'PUT' : 'POST';

      // For new posts, content is required
      if (!editingSlug && !blogForm.content.trim()) {
        setBlogFormErrors({ content: 'Content is required.' });
        setBlogFormLoading(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        doLogout();
        return;
      }

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

      setShowBlogForm(false);
      showToast(editingSlug ? 'Post updated!' : 'Post created!', 'success');
      fetchBlogs();
    } catch {
      setBlogFormError('Network error. Please try again.');
    } finally {
      setBlogFormLoading(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    if (!authed) return;
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(post.slug)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) {
        showToast('Failed to update post status.', 'error');
        return;
      }
      showToast(
        post.published ? 'Post unpublished.' : 'Post published!',
        'success'
      );
      fetchBlogs();
    } catch {
      showToast('Network error.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!authed || !deleteSlug) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(deleteSlug)}`, {
        method: 'DELETE',
      });
      if (res.status === 401) {
        doLogout();
        return;
      }
      if (!res.ok) {
        showToast('Failed to delete post.', 'error');
        return;
      }
      showToast('Post deleted.', 'success');
      setDeleteSlug(null);
      fetchBlogs();
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Toast ───

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Computed ───

  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const thisWeekCount = leads.filter(
    (l) => new Date(l.createdAt) >= weekStart
  ).length;
  const thisMonthCount = leads.filter(
    (l) => new Date(l.createdAt) >= monthStart
  ).length;

  /* ═══════════════ Render: Login ═══════════════ */

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-cf-bg relative overflow-hidden">
        {/* Ambient gold glow drift */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 animate-cf-glow-drift" style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.18), transparent 70%)' }} aria-hidden />
        <div className="w-full max-w-sm relative">
          {/* Glassmorphic login card */}
          <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-60" />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
            <div className="relative flex flex-col items-center gap-4 mb-6">
              <SyaLogo size={48} />
              <div className="text-center">
                <h1 className="font-display font-normal text-[40px] leading-none tracking-[-0.01em] text-cf-text-strong">SYA Admin</h1>
                <p className="text-sm text-cf-mist mt-1.5">Dashboard Access</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (password.trim()) doLogin(password);
              }}
            >
              <label className="block text-sm text-cf-mist mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter admin password"
                  className="w-full bg-cf-glass border border-cf-glass-border rounded-md px-3 py-2.5 text-sm text-cf-text placeholder:text-cf-text-muted focus:outline-none focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 transition-all duration-240 ease-cinematic pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cf-mist hover:text-cf-gold transition-colors duration-160"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {loginError && (
                <p className="text-cf-crimson text-xs mt-2">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password.trim()}
                className="w-full mt-5 bg-cf-gold-gradient text-cf-bg font-semibold rounded-md px-4 py-2.5 hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-240 ease-cinematic disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {loginLoading && <Loader2 size={16} className="animate-spin" />}
                {loginLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-cf-text-muted mt-4">
            <Shield size={12} className="inline mr-1 text-cf-gold" />
            Authorized access only
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════ Render: Dashboard ═══════════════ */

  return (
    <div className="min-h-screen bg-cf-bg">
      {/* ─── Top Bar ─── glassmorphic sticky */}
      <header className="sticky top-0 z-30 bg-cf-bg-elevated/85 backdrop-blur-glass backdrop-saturate-glass border-b border-cf-glass-border shadow-glass">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SyaLogo size={30} />
            <h1 className="font-display font-normal text-[22px] leading-none tracking-[-0.01em] text-cf-text-strong">
              SYA Admin Dashboard
            </h1>
          </div>
          <button
            onClick={doLogout}
            className="flex items-center gap-2 border border-cf-gold/30 text-cf-text rounded-md px-3 py-1.5 text-sm hover:border-cf-gold/60 hover:text-cf-gold transition-colors duration-160"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-cf-glass-border">
          <button
            onClick={() => setTab('leads')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-160 -mb-px ${
              tab === 'leads'
                ? 'border-cf-gold text-cf-gold'
                : 'border-transparent text-cf-mist hover:text-cf-text'
            }`}
          >
            <Users size={16} />
            Leads
          </button>
          <button
            onClick={() => setTab('blogs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-160 -mb-px ${
              tab === 'blogs'
                ? 'border-cf-gold text-cf-gold'
                : 'border-transparent text-cf-mist hover:text-cf-text'
            }`}
          >
            <FileText size={16} />
            Blog Posts
          </button>
          <button
            onClick={() => setTab('subscribers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-160 -mb-px ${
              tab === 'subscribers'
                ? 'border-cf-gold text-cf-gold'
                : 'border-transparent text-cf-mist hover:text-cf-text'
            }`}
          >
            <Mail size={16} />
            Subscribers
          </button>
        </div>

        {/* ══════════ Leads Tab ══════════ */}
        {tab === 'leads' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Leads', value: totalLeads, icon: Users },
                { label: "This Week's Leads", value: thisWeekCount, icon: Users },
                { label: "This Month's Leads", value: thisMonthCount, icon: Users },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-5 transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
                  <div className="relative flex items-center justify-between mb-2">
                    <span className="text-sm text-cf-mist">{stat.label}</span>
                    <stat.icon size={16} className="text-cf-gold/60" />
                  </div>
                  <p className="font-data text-3xl font-bold tabular-nums text-cf-text-strong">
                    {stat.value.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-xs text-[#98A2B8]">
                Showing most recent {leads.length} lead{leads.length !== 1 ? 's' : ''}.{' '}
                <button
                  onClick={exportCsv}
                  className="text-[#E2B15C] hover:underline"
                >
                  Export CSV
                </button>{' '}
                for full list.
              </p>
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 bg-[#E2B15C] text-[#0A0F1C] font-semibold rounded-md px-4 py-2 hover:bg-[#F0CD8F] transition-colors text-sm self-start sm:self-auto"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>

            {/* Table */}
            {leadsLoading ? (
              <div className="flex items-center justify-center py-12 text-[#98A2B8]">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading leads...
              </div>
            ) : leadsError ? (
              <div className="bg-[#F0555F]/10 border border-[#F0555F]/20 rounded-lg p-4 text-sm text-[#F0555F]">
                {leadsError}
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 text-[#98A2B8] text-sm">
                No leads yet.
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        {['Name', 'Phone', 'Email', 'Interest', 'Source', 'Date'].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-xs font-medium text-[#98A2B8] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr
                          key={`${lead.phone}-${i}`}
                          className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-[#E8EBF2] whitespace-nowrap">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap">
                            {lead.phone}
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap">
                            {lead.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                INTEREST_COLORS[lead.interest] ||
                                'bg-white/10 text-[#98A2B8]'
                              }`}
                            >
                              {INTEREST_LABELS[lead.interest] || lead.interest}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap">
                            {lead.utmSource || 'website'}
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap">
                            {formatDate(lead.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ Blogs Tab ══════════ */}
        {tab === 'blogs' && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#98A2B8]">
                {blogs.length} post{blogs.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={openNewBlog}
                className="flex items-center gap-2 bg-[#E2B15C] text-[#0A0F1C] font-semibold rounded-md px-4 py-2 hover:bg-[#F0CD8F] transition-colors text-sm"
              >
                <Plus size={15} />
                New Post
              </button>
            </div>

            {/* Table */}
            {blogsLoading ? (
              <div className="flex items-center justify-center py-12 text-[#98A2B8]">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading posts...
              </div>
            ) : blogsError ? (
              <div className="bg-[#F0555F]/10 border border-[#F0555F]/20 rounded-lg p-4 text-sm text-[#F0555F]">
                {blogsError}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 text-[#98A2B8] text-sm">
                No blog posts yet. Click "New Post" to create one.
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        {['Title', 'Slug', 'Category', 'Status', 'Date', 'Actions'].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-xs font-medium text-[#98A2B8] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((post) => (
                        <tr
                          key={post.id}
                          className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-[#E8EBF2] max-w-[200px] truncate">
                            {post.title}
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap font-mono text-xs">
                            {post.slug}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-[#98A2B8]">
                              {post.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                post.published
                                  ? 'bg-[#35D49A]/15 text-[#35D49A]'
                                  : 'bg-white/[0.06] text-[#98A2B8]'
                              }`}
                            >
                              {post.published ? (
                                <><Eye size={11} /> Published</>
                              ) : (
                                <><EyeOff size={11} /> Draft</>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#98A2B8] whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditBlog(post)}
                                className="p-1.5 rounded-md text-[#98A2B8] hover:text-[#E2B15C] hover:bg-white/[0.04] transition-colors"
                                title="Edit"
                                aria-label={`Edit ${post.title}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => togglePublish(post)}
                                className={`p-1.5 rounded-md hover:bg-white/[0.04] transition-colors ${
                                  post.published
                                    ? 'text-[#98A2B8] hover:text-[#F0555F]'
                                    : 'text-[#98A2B8] hover:text-[#35D49A]'
                                }`}
                                title={post.published ? 'Unpublish' : 'Publish'}
                                aria-label={
                                  post.published
                                    ? `Unpublish ${post.title}`
                                    : `Publish ${post.title}`
                                }
                              >
                                {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => setDeleteSlug(post.slug)}
                                className="p-1.5 rounded-md text-[#98A2B8] hover:text-[#F0555F] hover:bg-white/[0.04] transition-colors"
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
          </div>
        )}

        {/* ══════════ Subscribers Tab ══════════ */}
        {tab === 'subscribers' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Total Subscribers', value: totalSubscribers, icon: Mail },
                { label: 'Active', value: subscribers.filter((s) => s.active).length, icon: Mail },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-[#0C1322] border border-white/[0.08] rounded-lg p-5 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#E2B15C]/10 flex items-center justify-center text-[#E2B15C]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-[#98A2B8] text-xs uppercase tracking-[0.16em] font-semibold">
                        {stat.label}
                      </p>
                      <p className="text-[#E8EBF2] text-2xl font-semibold tnum mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Header row with export */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#98A2B8]">
                Showing the 10 most recent subscribers. Export for the full list.
              </p>
              <button
                onClick={exportSubscribersCsv}
                disabled={totalSubscribers === 0}
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.12] bg-[#0C1322] px-4 py-2 text-sm font-medium text-[#E8EBF2] transition-colors hover:border-[#E2B15C]/40 hover:text-[#E2B15C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>

            {/* Table or empty/error */}
            {subscribersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-[#E2B15C]" size={28} />
              </div>
            ) : subscribersError ? (
              <div className="text-center py-16 text-[#F0555F] text-sm">{subscribersError}</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-16 border border-white/[0.08] rounded-lg">
                <Mail className="mx-auto mb-3 text-white/15" size={32} />
                <p className="text-[#98A2B8]">No subscribers yet. Signups from the blog &amp; landing will appear here.</p>
              </div>
            ) : (
              <div className="bg-[#0C1322] border border-white/[0.08] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-left text-[#98A2B8] uppercase text-[11px] tracking-[0.14em]">
                        <th className="px-5 py-3 font-semibold">Email</th>
                        <th className="px-5 py-3 font-semibold">Source</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s) => (
                        <tr key={s.email} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                          <td className="px-5 py-3.5 text-[#E8EBF2] font-mono text-[13px]">{s.email}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-[#C6CDDB] capitalize">
                              {s.source}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${s.active ? 'bg-[#35D49A]/12 text-[#35D49A]' : 'bg-white/[0.06] text-[#98A2B8]'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${s.active ? 'bg-[#35D49A]' : 'bg-[#98A2B8]'}`} />
                              {s.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[#98A2B8] text-xs tnum">
                            {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════ Blog Form Modal ══════════ */}
      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[10vh]">
          <div className="w-full max-w-xl bg-[#0C1322] border border-white/[0.08] rounded-xl p-6 relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#E8EBF2]">
                {editingSlug ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={() => setShowBlogForm(false)}
                className="p-1.5 rounded-md text-[#98A2B8] hover:text-[#E8EBF2] hover:bg-white/[0.06] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {blogFormError && (
              <div className="bg-[#F0555F]/10 border border-[#F0555F]/20 rounded-lg p-3 text-sm text-[#F0555F] mb-4">
                {blogFormError}
              </div>
            )}

            <form onSubmit={handleBlogSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-[#98A2B8] mb-1">Title *</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => handleBlogTitleChange(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50"
                  placeholder="Post title"
                />
                {blogFormErrors.title && (
                  <p className="text-[#F0555F] text-xs mt-1">{blogFormErrors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm text-[#98A2B8] mb-1">Slug *</label>
                <input
                  type="text"
                  value={blogForm.slug}
                  onChange={(e) => {
                    setBlogForm((prev) => ({ ...prev, slug: e.target.value }));
                    setBlogFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.slug;
                      return next;
                    });
                  }}
                  disabled={!!editingSlug}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50 disabled:opacity-50 font-mono"
                  placeholder="post-url-slug"
                />
                {blogFormErrors.slug && (
                  <p className="text-[#F0555F] text-xs mt-1">{blogFormErrors.slug}</p>
                )}
                {editingSlug && (
                  <p className="text-xs text-[#98A2B8]/50 mt-1">Slug cannot be changed after creation.</p>
                )}
              </div>

              {/* Category & Author row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#98A2B8] mb-1">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) =>
                      setBlogForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] focus:outline-none focus:border-[#E2B15C]/50 appearance-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0C1322] text-[#E8EBF2]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#98A2B8] mb-1">Author</label>
                  <input
                    type="text"
                    value={blogForm.author}
                    onChange={(e) =>
                      setBlogForm((prev) => ({ ...prev, author: e.target.value }))
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50"
                    placeholder="SYA Team"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm text-[#98A2B8] mb-1">Excerpt</label>
                <input
                  type="text"
                  value={blogForm.excerpt}
                  onChange={(e) =>
                    setBlogForm((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50"
                  placeholder="Brief description (optional)"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm text-[#98A2B8] mb-1">
                  Content {editingSlug ? '(leave blank to keep existing)' : '*'}
                </label>
                <textarea
                  value={blogForm.content}
                  onChange={(e) => {
                    setBlogForm((prev) => ({ ...prev, content: e.target.value }));
                    setBlogFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.content;
                      return next;
                    });
                  }}
                  rows={8}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50 resize-y"
                  placeholder="Write your post content here (Markdown supported)..."
                />
                {blogFormErrors.content && (
                  <p className="text-[#F0555F] text-xs mt-1">{blogFormErrors.content}</p>
                )}
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm text-[#98A2B8] mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={blogForm.coverImage}
                  onChange={(e) =>
                    setBlogForm((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-sm text-[#E8EBF2] placeholder:text-[#98A2B8]/50 focus:outline-none focus:border-[#E2B15C]/50"
                  placeholder="https://example.com/cover.jpg (optional)"
                />
                {blogForm.coverImage && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.08]">
                    <img
                      src={blogForm.coverImage}
                      alt="Cover preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
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
                  onClick={() =>
                    setBlogForm((prev) => ({ ...prev, published: !prev.published }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    blogForm.published ? 'bg-[#E2B15C]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      blogForm.published ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-[#E8EBF2]">Published</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlogForm(false)}
                  className="border border-white/15 text-white rounded-md px-4 py-2 text-sm hover:border-[#E2B15C]/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blogFormLoading}
                  className="bg-[#E2B15C] text-[#0A0F1C] font-semibold rounded-md px-4 py-2 hover:bg-[#F0CD8F] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {blogFormLoading && <Loader2 size={15} className="animate-spin" />}
                  {editingSlug ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ Delete Confirm Modal ══════════ */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0C1322] border border-white/[0.08] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#E8EBF2] mb-2">Delete Post?</h3>
            <p className="text-sm text-[#98A2B8] mb-5">
              This action cannot be undone. The post with slug{' '}
              <code className="text-[#E2B15C] font-mono text-xs">{deleteSlug}</code>{' '}
              will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteSlug(null)}
                className="border border-white/15 text-white rounded-md px-4 py-2 text-sm hover:border-[#E2B15C]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="bg-[#F0555F] text-white font-semibold rounded-md px-4 py-2 hover:bg-[#F0555F]/80 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading && <Loader2 size={15} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Toast ══════════ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border ${
              toast.type === 'success'
                ? 'bg-[#35D49A]/15 border-[#35D49A]/30 text-[#35D49A]'
                : 'bg-[#F0555F]/15 border-[#F0555F]/30 text-[#F0555F]'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
