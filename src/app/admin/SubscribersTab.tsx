'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Mail, Download, Loader2, Send, X } from 'lucide-react';
import { formatDate, type Subscriber } from './lib';

interface SubscribersTabProps {
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** Toast notifier (lifted to parent). */
  onToast: (message: string, type: 'success' | 'error') => void;
}

/**
 * Subscribers tab — Phase 12d extraction + round-11 broadcast feature.
 *
 * Owns its own subscribers state + fetch + CSV export + broadcast modal.
 *
 * Cinematic Finance: glassmorphic stat cards, glassmorphic subscribers table,
 * emerald/mist status pills, glassmorphic broadcast modal with gold top-edge.
 */
export function SubscribersTab({ onUnauthorized, onToast }: SubscribersTabProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Broadcast modal state
  const [showBroadcast, setShowBroadcast] = useState(false);

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

      {/* Header row with compose + export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-cf-mist">
          Showing the 10 most recent subscribers. Export for the full list.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBroadcast(true)}
            disabled={totalSubscribers === 0}
            className="inline-flex items-center gap-2 bg-cf-gold-gradient text-cf-bg font-semibold rounded-md px-4 py-2 text-sm transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            <Send size={15} />
            Compose Broadcast
          </button>
          <button
            onClick={exportSubscribersCsv}
            disabled={totalSubscribers === 0}
            className="inline-flex items-center gap-2 rounded-md border border-cf-glass-border bg-cf-glass px-4 py-2 text-sm font-medium text-cf-text transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
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

      {/* Broadcast Modal */}
      {showBroadcast && (
        <BroadcastModal
          recipientCount={subscribers.filter((s) => s.active).length || totalSubscribers}
          onClose={() => setShowBroadcast(false)}
          onSuccess={(msg) => { setShowBroadcast(false); onToast(msg, 'success'); }}
          onUnauthorized={onUnauthorized}
          onToast={onToast}
        />
      )}
    </div>
  );
}

/* ═══════════════ Broadcast Modal ═══════════════ */

interface BroadcastModalProps {
  recipientCount: number;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onUnauthorized: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

function BroadcastModal({ recipientCount, onClose, onSuccess, onUnauthorized, onToast }: BroadcastModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!body.trim()) nextErrors.body = 'Body is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });
      if (res.status === 401) { onUnauthorized(); return; }
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields);
          setApiError(data.error || 'Validation failed.');
        } else {
          setApiError(data.error || 'Failed to send broadcast.');
        }
        setLoading(false);
        return;
      }
      onSuccess(data.message || `Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}.`);
    } catch {
      setApiError('Network error. Please try again.');
      setLoading(false);
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
            <div>
              <h2 className="font-display font-normal text-[28px] leading-none tracking-[-0.01em] text-cf-text-strong">
                Compose Broadcast
              </h2>
              <p className="text-xs text-cf-mist mt-1.5 font-data tabular-nums">
                To {recipientCount} active subscriber{recipientCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-cf-mist hover:text-cf-gold hover:bg-cf-gold/10 transition-colors duration-160"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {apiError && (
            <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-3 text-sm text-cf-crimson mb-4">
              {apiError}
            </div>
          )}

          {/* Dry-run notice (informational — the API reports dryRun in the response) */}
          <div className="bg-cf-gold/[0.06] border border-cf-gold/20 rounded-lg p-3 text-xs text-cf-mist mb-4">
            If no email provider is configured (RESEND_API_KEY), this runs as a dry-run — it counts recipients + logs the send without actually delivering. In production with the key set, it sends via Resend.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className={labelClass}>Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setErrors((p) => { const n = { ...p }; delete n.subject; return n; }); }}
                className={inputClass}
                placeholder="This week's market analysis"
                autoFocus
              />
              {errors.subject && <p className={errClass}>{errors.subject}</p>}
            </div>

            {/* Body */}
            <div>
              <label className={labelClass}>
                Body *{' '}
                <span className="text-cf-text-muted normal-case tracking-normal text-[11px]">
                  ({body.length}/10,000 chars)
                </span>
              </label>
              <textarea
                value={body}
                onChange={(e) => { setBody(e.target.value.slice(0, 10000)); setErrors((p) => { const n = { ...p }; delete n.body; return n; }); }}
                rows={10}
                className={`${inputClass} resize-y font-data text-[13px] leading-relaxed`}
                placeholder="Write your broadcast here. Plain text — each subscriber receives this as the email body. Include a reminder that they can unsubscribe via the link in every email."
              />
              {errors.body && <p className={errClass}>{errors.body}</p>}
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
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-sm transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {loading ? 'Sending…' : 'Send Broadcast'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
