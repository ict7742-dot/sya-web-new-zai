'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Download, Loader2 } from 'lucide-react';
import { formatDate, type Subscriber } from './lib';

interface SubscribersTabProps {
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** Toast notifier (lifted to parent). */
  onToast: (message: string, type: 'success' | 'error') => void;
}

/**
 * Subscribers tab — Phase 12d extraction.
 *
 * Owns its own subscribers state + fetch + CSV export.
 *
 * Cinematic Finance: glassmorphic stat cards (horizontal layout with gold icon
 * chip), glassmorphic subscribers table, emerald/mist status pills, JetBrains
 * Mono email column.
 */
export function SubscribersTab({ onUnauthorized, onToast }: SubscribersTabProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter');
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      const data = await res.json();
      setSubscribers(data.recent || []);
      setTotalSubscribers(data.total || 0);
    } catch {
      setError('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const exportSubscribersCsv = async () => {
    try {
      const res = await fetch('/api/newsletter?format=csv');
      if (res.status === 401) { onUnauthorized(); return; }
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
      onToast('Subscribers exported.', 'success');
    } catch {
      onToast('Export failed.', 'error');
    }
  };

  const stats = [
    { label: 'Total Subscribers', value: totalSubscribers, icon: Mail },
    { label: 'Active', value: subscribers.filter((s) => s.active).length, icon: Mail },
  ];

  return (
    <div className="animate-cf-reveal-up">
      {/* Stats — horizontal cards with gold icon chip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-5 flex items-center gap-4 transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
              <div className="relative w-11 h-11 rounded-lg bg-cf-gold/10 border border-cf-gold/30 flex items-center justify-center text-cf-gold shrink-0">
                <Icon size={20} />
              </div>
              <div className="relative">
                <p className="text-cf-mist text-[10px] uppercase tracking-[0.18em] font-semibold">{stat.label}</p>
                <p className="font-data text-2xl font-bold tabular-nums text-cf-text-strong mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header row with export */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-cf-mist">
          Showing the 10 most recent subscribers. Export for the full list.
        </p>
        <button
          onClick={exportSubscribersCsv}
          disabled={totalSubscribers === 0}
          className="inline-flex items-center gap-2 rounded-md border border-cf-glass-border bg-cf-glass px-4 py-2 text-sm font-medium text-cf-text transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table or empty/error */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-cf-gold" size={28} />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-cf-crimson text-sm">{error}</div>
      ) : subscribers.length === 0 ? (
        <div className="relative text-center py-16 rounded-xl bg-cf-glass border border-cf-glass-border overflow-hidden">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
          <Mail className="relative mx-auto mb-3 text-cf-text-muted" size={32} />
          <p className="relative text-cf-mist">No subscribers yet. Signups from the blog &amp; landing will appear here.</p>
        </div>
      ) : (
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] text-left text-cf-mist uppercase text-[11px] tracking-[0.14em]">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} className="border-b border-white/[0.04] last:border-b-0 hover:bg-cf-gold/[0.04] transition-colors duration-160">
                    <td className="px-5 py-3.5 text-cf-text-strong font-data text-[13px]">{s.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-cf-gold/[0.08] border border-cf-gold/20 px-2.5 py-0.5 text-xs text-cf-text capitalize">
                        {s.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs border ${s.active ? 'bg-cf-emerald/12 text-cf-emerald border-cf-emerald/30' : 'bg-white/[0.06] text-cf-mist border-white/10'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.active ? 'bg-cf-emerald' : 'bg-cf-mist'}`} />
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-cf-mist text-xs font-data tabular-nums">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
