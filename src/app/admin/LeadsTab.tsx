'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Users, Download, Filter, X, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, MessageCircle, Search } from 'lucide-react';
import {
  formatDate,
  getWeekStart,
  getMonthStart,
  INTEREST_LABELS,
  INTEREST_COLORS,
  type Lead,
  type LeadsStats,
} from './lib';

interface LeadsTabProps {
  /** Initial page-1 leads (prefetched on login by the parent). */
  initialLeads: Lead[];
  initialTotal: number;
  /** Initial rolling-window stats from the same prefetch. */
  initialStats: LeadsStats;
  /** Fired when the API returns 401 (session expired). */
  onUnauthorized: () => void;
  /** Toast notifier (lifted to parent). */
  onToast: (message: string, type: 'success' | 'error') => void;
}

type InterestFilter = 'all' | 'account' | 'courses' | 'both';
type DateFilter = 'all' | '7d' | '30d' | 'month' | 'week';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

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
 * Leads tab — server-driven list with filters + pagination.
 *
 * All filtering (interest / date / text search) and pagination run server-side
 * in GET /api/leads, so the admin sees the ENTIRE leads table, not just the
 * 10 newest rows. The CSV export passes the same filters — the downloaded
 * file always matches what the filters describe.
 *
 * Cinematic Finance: glassmorphic stat cards (gold top-edge + glow + hover
 * lift), glassmorphic filter bar, glassmorphic leads table, cf-* pills for
 * interest, JetBrains Mono for the date column.
 */
export function LeadsTab({ initialLeads, initialTotal, initialStats, onUnauthorized, onToast }: LeadsTabProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [totalLeads, setTotalLeads] = useState(initialTotal);
  const [stats, setStats] = useState<LeadsStats>(initialStats);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(Math.ceil(initialTotal / PAGE_SIZE), 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interestFilter, setInterestFilter] = useState<InterestFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  /** Text search across name / email / phone. Empty string = no text filter. */
  const [searchQuery, setSearchQuery] = useState('');
  /** Debounced copy of searchQuery — drives the API call, not the input. */
  const [debouncedQuery, setDebouncedQuery] = useState('');
  /** Lead id of the expanded row, or null if none — stable across refilters. */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /** True while the parent's prefetch can serve the first render — skips the
   *  redundant initial fetch (the old double-fetch wasted the prefetch). */
  const hasInitialData = initialLeads.length > 0 || initialTotal > 0;
  const skippedInitialFetch = useRef(false);

  // Debounce the search box so typing doesn't fire an API call per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

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

  /** Query-string view of the active filters — shared by the JSON fetch + CSV export. */
  const filterParams = useMemo(() => {
    const params = new URLSearchParams();
    if (interestFilter !== 'all') params.set('interest', interestFilter);
    if (dateCutoff) params.set('since', dateCutoff.toISOString());
    if (debouncedQuery) params.set('q', debouncedQuery);
    return params;
  }, [interestFilter, dateCutoff, debouncedQuery]);

  const hasFilters = filterParams.size > 0;

  const fetchLeads = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(filterParams);
      params.set('page', String(targetPage));
      params.set('pageSize', String(PAGE_SIZE));
      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.recent || []);
      setTotalLeads(data.total || 0);
      setStats(data.stats || { thisWeek: 0, thisMonth: 0 });
      setTotalPages(Math.max(data.totalPages || 1, 1));
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [filterParams, onUnauthorized]);

  // Refetch when filters change (back to page 1) or when the page changes.
  // The first render is served by the parent's prefetch, so skip it.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (hasInitialData) { skippedInitialFetch.current = true; return; }
    }
    void fetchLeads(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams, page]);

  const changeFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const clearFilters = () => {
    setInterestFilter('all');
    setDateFilter('all');
    setSearchQuery('');
    setDebouncedQuery('');
    setExpandedId(null);
    setPage(1);
  };

  /** Export CSV — the API applies the same server-side filters, so the
   *  download matches the active interest/date/search selection. */
  const exportCsv = async () => {
    try {
      const params = new URLSearchParams(filterParams);
      params.set('format', 'csv');
      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = hasFilters ? `-${interestFilter}-${dateFilter}` : '';
      a.download = `sya-leads${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast(`Exported ${totalLeads} lead${totalLeads !== 1 ? 's' : ''}.`, 'success');
    } catch {
      onToast('Failed to export CSV.', 'error');
    }
  };

  const statCards = [
    { label: 'Total Leads', value: totalLeads },
    { label: "Last 7 Days' Leads", value: stats.thisWeek },
    { label: "Last 30 Days' Leads", value: stats.thisMonth },
  ];

  const selectClass =
    'bg-cf-glass border border-cf-glass-border rounded-md px-3 py-2 text-sm text-cf-text outline-none focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 transition-all duration-240 ease-cinematic cursor-pointer';

  const from = totalLeads === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalLeads);

  return (
    <div className="animate-cf-reveal-up">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden p-5 transition-all duration-240 ease-cinematic hover:-translate-y-1 hover:border-cf-gold/40"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
            <div className="relative flex items-center justify-between mb-2">
              <span className="text-sm text-cf-mist">{stat.label}</span>
              <Users size={16} className="text-cf-gold/60" />
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
              onChange={(e) => changeFilter(setInterestFilter)(e.target.value as InterestFilter)}
              className={selectClass}
              aria-label="Filter by interest"
            >
              {INTEREST_FILTERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-cf-bg-elevated text-cf-text">{f.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => changeFilter(setDateFilter)(e.target.value as DateFilter)}
              className={selectClass}
              aria-label="Filter by date range"
            >
              {DATE_FILTERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-cf-bg-elevated text-cf-text">{f.label}</option>
              ))}
            </select>
            {/* Text search — name / email / phone */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cf-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone…"
                aria-label="Search leads by name, email, or phone"
                className="w-full bg-cf-glass border border-cf-glass-border rounded-md pl-9 pr-3 py-2 text-sm text-cf-text outline-none transition-all duration-240 ease-cinematic placeholder:text-cf-text-muted focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20"
              />
            </div>
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
            Showing{' '}
            <span className="text-cf-text font-data tabular-nums">{from}–{to}</span>
            {' '}of{' '}
            <span className="text-cf-text font-data tabular-nums">{totalLeads}</span>
            {' '}lead{totalLeads !== 1 ? 's' : ''}
            {hasFilters && ' (filtered)'}
          </>
        )}
      </p>

      {/* Table */}
      {error ? (
        <div className="bg-cf-crimson/10 border border-cf-crimson/30 rounded-lg p-4 text-sm text-cf-crimson">{error}</div>
      ) : !loading && totalLeads === 0 ? (
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
              <tbody className={loading ? 'opacity-50 pointer-events-none' : undefined}>
                {leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isExpanded={expandedId === lead.id}
                    onToggle={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-md border border-cf-glass-border px-3 py-1.5 text-xs text-cf-text transition-colors duration-160 hover:border-cf-gold/60 hover:text-cf-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-cf-mist font-data tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 rounded-md border border-cf-glass-border px-3 py-1.5 text-xs text-cf-text transition-colors duration-160 hover:border-cf-gold/60 hover:text-cf-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A single lead row + its expandable detail drawer. Clicking the row (or
 *  focusing it + pressing Enter/Space) toggles the drawer, which shows the
 *  full UTM breakdown + quick-action links (call / email / WhatsApp). The
 *  drawer uses a colspan row so it spans the full table width — a glassmorphic
 *  panel with gold top-edge. */
function LeadRow({ lead, isExpanded, onToggle }: { lead: Lead; isExpanded: boolean; onToggle: () => void }) {
  const waUrl = `https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, this is SYA regarding your inquiry.`)}`;
  return (
    <>
      <tr
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Lead details for ${lead.name}`}
        className={`border-b border-white/[0.04] last:border-b-0 transition-colors duration-160 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cf-gold/40 ${isExpanded ? 'bg-cf-gold/[0.06]' : 'hover:bg-cf-gold/[0.04]'}`}
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
              {/* Message from the lead — shown prominently above the UTM grid
                  so the admin sees WHY the lead reached out before they see
                  WHERE they came from. Empty state stays silent (no junk row). */}
              {lead.message?.trim() && (
                <div className="mb-4 rounded-lg border border-cf-gold/20 bg-cf-glass/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cf-gold mb-1.5">Message</p>
                  <p className="text-[13px] text-cf-text leading-relaxed whitespace-pre-wrap">{lead.message.trim()}</p>
                </div>
              )}
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
