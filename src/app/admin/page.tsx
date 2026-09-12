'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Users,
  FileText,
  Mail,
} from 'lucide-react';
import {
  SyaLogo,
  type Lead,
  type Tab,
} from './lib';
import { LeadsTab } from './LeadsTab';
import { BlogsTab } from './BlogsTab';
import { SubscribersTab } from './SubscribersTab';

/* ═══════════════ Main Component — thin shell ═══════════════
 *
 * Phase 12d structural split: this file was 1,306 lines (auth + 3 tabs +
 * blog form modal + delete modal + all CRUD). It is now the orchestrator —
 * it owns auth/session + the active tab, then renders LeadsTab / BlogsTab /
 * SubscribersTab components (each owns its own data + CRUD). The blog form
 * modal lives inside BlogsTab. The shared types/helpers/logo are in ./lib.
 */

export default function AdminPage() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [tab, setTab] = useState<Tab>('leads');

  // Initial leads (prefetched on login so the shell can pass them to LeadsTab)
  const [initialLeads, setInitialLeads] = useState<Lead[]>([]);
  const [initialTotalLeads, setInitialTotalLeads] = useState(0);

  // Toast (lifted; tabs call onToast)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const doLogout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setAuthed(false);
    setPassword('');
    setInitialLeads([]);
    setInitialTotalLeads(0);
  }, []);

  // Session-expiry callback (passed to tabs — fires when a tab's fetch hits 401)
  const onUnauthorized = useCallback(() => {
    doLogout();
    showToast('Session expired. Please sign in again.', 'error');
  }, [doLogout, showToast]);

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
      setAuthed(true);
      // Prefetch initial leads so LeadsTab can render immediately.
      const leadsRes = await fetch('/api/leads');
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setInitialLeads(data.recent || []);
        setInitialTotalLeads(data.total || 0);
      }
      setLoginLoading(false);
    } catch {
      setLoginError('Network error. Please try again.');
      setLoginLoading(false);
    }
  }, []);

  // Check for existing session (cookie is sent automatically).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          setAuthed(true);
          const data = await res.json();
          setInitialLeads(data.recent || []);
          setInitialTotalLeads(data.total || 0);
        }
      } catch { /* not logged in */ }
    })();
  }, []);

  /* ═══════════════ Render: Login ═══════════════ */

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-cf-bg relative overflow-hidden">
        {/* Ambient gold glow drift */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 animate-cf-glow-drift"
          style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.18), transparent 70%)' }}
          aria-hidden
        />
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

  const TABS: Array<{ id: Tab; label: string; icon: typeof Users; count?: number }> = [
    { id: 'leads', label: 'Leads', icon: Users, count: initialTotalLeads },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
  ];

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
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-160 -mb-px ${
                  active
                    ? 'border-cf-gold text-cf-gold'
                    : 'border-transparent text-cf-mist hover:text-cf-text'
                }`}
              >
                <Icon size={16} />
                {t.label}
                {/* Live count badge — gold gradient pill for at-a-glance status */}
                {typeof t.count === 'number' && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums font-data transition-colors duration-160 ${
                      active
                        ? 'bg-cf-gold-gradient text-cf-bg shadow-glow-gold'
                        : 'bg-cf-glass text-cf-mist border border-cf-glass-border'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════ Tab content (delegated to components) ══════════ */}
        {tab === 'leads' && (
          <LeadsTab
            initialLeads={initialLeads}
            initialTotal={initialTotalLeads}
            onUnauthorized={onUnauthorized}
            onToast={showToast}
          />
        )}
        {tab === 'blogs' && (
          <BlogsTab
            onUnauthorized={onUnauthorized}
            onToast={showToast}
          />
        )}
        {tab === 'subscribers' && (
          <SubscribersTab
            onUnauthorized={onUnauthorized}
            onToast={showToast}
          />
        )}
      </main>

      {/* ══════════ Toast ══════════ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-glass border backdrop-blur-glass ${
              toast.type === 'success'
                ? 'bg-cf-emerald/15 border-cf-emerald/30 text-cf-emerald'
                : 'bg-cf-crimson/15 border-cf-crimson/30 text-cf-crimson'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
