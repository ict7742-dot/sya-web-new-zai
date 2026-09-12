'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Download, Loader2 } from 'lucide-react';
import {
  formatDate,
  getWeekStart,
  getMonthStart,
  INTEREST_LABELS,
  INTEREST_COLORS,
  type Lead,
} from './lib';

interface LeadsTabProps {
  /** Initial leads (prefetched on login by the parent). */
  initialLeads: Lead[];
  initialTotal: number;
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** Toast notifier (lifted to parent). */
  onToast: (message: string, type: 'success' | 'error') => void;
}

/**
 * Leads tab — Phase 12d extraction.
 *
 * Owns its own leads state + fetch + CSV export. The parent only passes the
 * initial data (prefetched on login) + callbacks.
 *
 * Cinematic Finance: glassmorphic stat cards (gold top-edge + glow + hover
 * lift), glassmorphic leads table, cf-* pills for interest, JetBrains Mono
 * for the date column.
 */
export function LeadsTab({ initialLeads, initialTotal, onUnauthorized, onToast }: LeadsTabProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [totalLeads, setTotalLeads] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads');
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.recent || []);
      setTotalLeads(data.total || 0);
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    // Refresh on mount (in case data is stale from the parent's login-time fetch)
    fetchLeads();
  }, [fetchLeads]);

  const exportCsv = async () => {
    try {
      const res = await fetch('/api/leads?format=csv');
      if (res.status === 401) { onUnauthorized(); return; }
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
      onToast('CSV exported successfully!', 'success');
    } catch {
      onToast('Failed to export CSV.', 'error');
    }
  };

  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const thisWeekCount = leads.filter((l) => new Date(l.createdAt) >= weekStart).length;
  const thisMonthCount = leads.filter((l) => new Date(l.createdAt) >= monthStart).length;

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users },
    { label: "This Week's Leads", value: thisWeekCount, icon: Users },
    { label: "This Month's Leads", value: thisMonthCount, icon: Users },
  ];

  return (
    <div className="animate-cf-reveal-up">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
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
            <p className="relative font-data text-3xl font-bold tabular-nums text-cf-text-strong">
              {stat.value.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-xs text-cf-mist">
          Showing most recent {leads.length} lead{leads.length !== 1 ? 's' : ''}.{' '}
          <button onClick={exportCsv} className="text-cf-gold hover:underline">
            Export CSV
          </button>{' '}
          for full list.
        </p>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-cf-gold-gradient text-cf-bg font-semibold rounded-md px-4 py-2 hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-240 ease-cinematic text-sm self-start sm:self-auto"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-cf-mist">
          <Loader2 size={20} className="animate-spin mr-2 text-cf-gold" />
          Loading leads...
        </div>
      ) : error ? (
        <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-4 text-sm text-cf-crimson">{error}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-cf-mist text-sm">No leads yet.</div>
      ) : (
        <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['Name', 'Phone', 'Email', 'Interest', 'Source', 'Date'].map((h) => (
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
                {leads.map((lead, i) => (
                  <tr
                    key={`${lead.phone}-${i}`}
                    className="border-b border-white/[0.04] last:border-b-0 hover:bg-cf-gold/[0.04] transition-colors duration-160"
                  >
                    <td className="px-4 py-3 font-medium text-cf-text-strong whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-cf-mist font-data tabular-nums whitespace-nowrap">{lead.phone}</td>
                    <td className="px-4 py-3 text-cf-mist whitespace-nowrap">{lead.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          INTEREST_COLORS[lead.interest] || 'bg-white/[0.06] text-cf-mist border border-white/10'
                        }`}
                      >
                        {INTEREST_LABELS[lead.interest] || lead.interest}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cf-mist whitespace-nowrap">{lead.utmSource || 'website'}</td>
                    <td className="px-4 py-3 text-cf-mist font-data tabular-nums whitespace-nowrap">{formatDate(lead.createdAt)}</td>
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
