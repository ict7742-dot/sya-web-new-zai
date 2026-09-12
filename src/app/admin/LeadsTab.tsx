'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Download, Loader2, Filter, X, ChevronDown, Phone, Mail, MessageCircle } from 'lucide-react';
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

type InterestFilter = 'all' | 'account' | 'courses' | 'both';
type DateFilter = 'all' | '7d' | '30d' | 'month' | 'week';

const DATE_FILTERS: Array<{ id: DateFilter; label: string }> = [
  { id: 'all', label: 'All time' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'week', label: 'This week' },
];

const INTEREST_FILTERS: Array<{ id: InterestFilter; label: string }> = [
  { id: 'all', label: 'All interests' },
  { id: 'account', label: 'Open Demat' },
  { id: 'courses', label: 'Courses' },
  { id: 'both', label: 'Account + Courses' },
];

/**
 * Leads tab — Phase 12d extraction + round-7 filters.
 *
 * Owns its own leads state + fetch + CSV export. The parent only passes the
 * initial data (prefetched on login) + callbacks.
 *
 * Round-7 filters: interest + date-range refine the displayed table AND the
 * CSV export (the export fetches the full CSV from the API, then filters
 * client-side before download — no API changes needed).
 *
 * Cinematic Finance: glassmorphic stat cards (gold top-edge + glow + hover
 * lift), glassmorphic filter bar, glassmorphic leads table, cf-* pills for
 * interest, JetBrains Mono for the date column.
 */
export function LeadsTab({ initialLeads, initialTotal, onUnauthorized, onToast }: LeadsTabProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [totalLeads, setTotalLeads] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interestFilter, setInterestFilter] = useState<InterestFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  /** Index (into filteredLeads) of the expanded lead row, or null if none. */
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
    fetchLeads();
  }, [fetchLeads]);

  /** Compute the date cutoff for the active date filter. */
  const dateCutoff = useMemo((): Date | null => {
    const now = new Date();
    switch (dateFilter) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'month': return getMonthStart();
      case 'week': return getWeekStart();
      default: return null;
    }
  }, [dateFilter]);

  /** Filtered leads — refined by both interest + date. */
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (interestFilter !== 'all' && l.interest !== interestFilter) return false;
      if (dateCutoff && new Date(l.createdAt) < dateCutoff) return false;
      return true;
    });
  }, [leads, interestFilter, dateCutoff]);

  const hasFilters = interestFilter !== 'all' || dateFilter !== 'all';
  const clearFilters = () => { setInterestFilter('all'); setDateFilter('all'); setExpandedIdx(null); };

  /** Export CSV — fetches the full CSV from the API, then filters client-side
   *  so the downloaded file respects the active interest + date filters. */
  const exportCsv = async () => {
    try {
      const res = await fetch('/api/leads?format=csv');
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error('Export failed');
      const fullCsv = await res.text();
      // Parse the CSV (simple split — the CSV is well-formed with safeCsvCell
      // escaping). First line is the header; remaining lines are rows.
      const lines = fullCsv.split('\n');
      const header = lines[0];
      const dataRows = lines.slice(1).filter(Boolean);
      // Find the column indices for Interest (idx 3) + Submitted At (idx 12).
      // The header order is fixed in the API: Name, Phone, Email, Interest,
      // Message, Source, UTM Source, UTM Medium, UTM Campaign, UTM Term,
      // UTM Content, Landing Page, Submitted At.
      const INTEREST_IDX = 3;
      const DATE_IDX = 12;
      const filteredRows = dataRows.filter((row) => {
        const cols = parseCsvRow(row);
        const interest = cols[INTEREST_IDX] ?? '';
        const dateStr = cols[DATE_IDX] ?? '';
        if (interestFilter !== 'all' && interest !== interestFilter) return false;
        if (dateCutoff) {
          const d = new Date(dateStr);
          if (isNaN(d.getTime()) || d < dateCutoff) return false;
        }
        return true;
      });
      const filteredCsv = [header, ...filteredRows].join('\n');
      const blob = new Blob([filteredCsv], { type: 'text/csv; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = hasFilters ? `-${interestFilter}-${dateFilter}` : '';
      a.download = `sya-leads${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast(`Exported ${filteredRows.length} lead${filteredRows.length !== 1 ? 's' : ''}.`, 'success');
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

  const selectClass =
    'bg-cf-glass border border-cf-glass-border rounded-md px-3 py-2 text-sm text-cf-text outline-none focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 transition-all duration-240 ease-cinematic cursor-pointer';

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

      {/* Filter bar — interest + date-range + clear + export */}
      <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass border border-cf-glass-border shadow-glass overflow-hidden mb-4 p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-40" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <Filter size={13} className="text-cf-gold" /> Filter
            </span>
            <select
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value as InterestFilter)}
              className={selectClass}
              aria-label="Filter by interest"
            >
              {INTEREST_FILTERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-cf-bg-elevated text-cf-text">{f.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className={selectClass}
              aria-label="Filter by date range"
            >
              {DATE_FILTERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-cf-bg-elevated text-cf-text">{f.label}</option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-cf-mist hover:text-cf-gold transition-colors duration-160"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 bg-cf-gold-gradient text-cf-bg font-semibold rounded-md px-4 py-2 hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-240 ease-cinematic text-sm self-start lg:self-auto"
          >
            <Download size={15} />
            Export {hasFilters ? 'filtered' : 'CSV'}
          </button>
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-cf-mist">
        {loading ? 'Loading…' : (
          <>
            Showing <span className="text-cf-text font-data tabular-nums">{filteredLeads.length}</span>
            {' '}of{' '}
            <span className="text-cf-text font-data tabular-nums">{leads.length}</span>
            {' '}lead{filteredLeads.length !== 1 ? 's' : ''}
            {hasFilters && ' (filtered)'}
          </>
        )}
      </p>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-cf-mist">
          <Loader2 size={20} className="animate-spin mr-2 text-cf-gold" />
          Loading leads...
        </div>
      ) : error ? (
        <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-4 text-sm text-cf-crimson">{error}</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-cf-mist text-sm">
          {hasFilters ? 'No leads match the active filters.' : 'No leads yet.'}
          {hasFilters && (
            <button onClick={clearFilters} className="block mx-auto mt-2 text-cf-gold hover:underline text-xs">
              Clear filters
            </button>
          )}
        </div>
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
                {filteredLeads.map((lead, i) => {
                  const isExpanded = expandedIdx === i;
                  return (
                    <LeadRow
                      key={`${lead.phone}-${i}`}
                      lead={lead}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedIdx(isExpanded ? null : i)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/** A single lead row + its expandable detail drawer. Clicking the row toggles
 *  the drawer, which shows the full UTM breakdown + quick-action links (call /
 *  email / WhatsApp). The drawer uses a colspan row so it spans the full table
 *  width — a glassmorphic panel with gold top-edge. */
function LeadRow({ lead, isExpanded, onToggle }: { lead: Lead; isExpanded: boolean; onToggle: () => void }) {
  const waUrl = `https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, this is SYA regarding your inquiry.`)}`;
  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-white/[0.04] last:border-b-0 transition-colors duration-160 cursor-pointer ${isExpanded ? 'bg-cf-gold/[0.06]' : 'hover:bg-cf-gold/[0.04]'}`}
      >
        <td className="px-4 py-3 font-medium text-cf-text-strong whitespace-nowrap">
          <span className="inline-flex items-center gap-2">
            <ChevronDown size={14} className={`text-cf-gold transition-transform duration-240 ease-cinematic ${isExpanded ? 'rotate-180' : ''}`} />
            {lead.name}
          </span>
        </td>
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
      {isExpanded && (
        <tr className="border-b border-white/[0.04] last:border-b-0">
          <td colSpan={6} className="p-0">
            {/* Glassmorphic detail panel */}
            <div className="relative bg-cf-bg-elevated/60 border-t border-cf-gold/20 px-4 py-4 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-40" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* UTM breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cf-gold">UTM Tracking</p>
                  <DetailRow label="Source" value={lead.utmSource} />
                  <DetailRow label="Medium" value={lead.utmMedium} />
                  <DetailRow label="Campaign" value={lead.utmCampaign} />
                </div>
                {/* Timestamp */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cf-gold">Timestamp</p>
                  <DetailRow label="Submitted" value={new Date(lead.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} mono />
                </div>
                {/* Quick actions */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cf-gold">Quick Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:+91${lead.phone.replace(/\D/g, '').slice(-10)}`} className="inline-flex items-center gap-1.5 rounded-md border border-cf-gold/30 bg-cf-glass px-3 py-1.5 text-xs text-cf-text hover:border-cf-gold/60 hover:text-cf-gold transition-colors duration-160">
                      <Phone size={12} /> Call
                    </a>
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-cf-gold/30 bg-cf-glass px-3 py-1.5 text-xs text-cf-text hover:border-cf-gold/60 hover:text-cf-gold transition-colors duration-160">
                      <Mail size={12} /> Email
                    </a>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs text-[#25D366] hover:border-[#25D366]/60 transition-colors duration-160">
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** A label + value row for the detail drawer. */
function DetailRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-cf-text-muted w-20 shrink-0">{label}</span>
      <span className={`text-cf-text ${mono ? 'font-data tabular-nums' : ''}`}>
        {value || <span className="text-cf-text-muted/60">—</span>}
      </span>
    </div>
  );
}

/** Parse a single CSV row into columns. Handles quoted fields with embedded
 *  commas (safeCsvCell wraps fields containing commas/quotes in double quotes
 *  + escapes internal quotes by doubling them). */
function parseCsvRow(row: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (row[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === ',') { cols.push(cur); cur = ''; }
      else if (ch === '"') inQuotes = true;
      else cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}
