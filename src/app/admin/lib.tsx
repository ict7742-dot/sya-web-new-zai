/**
 * Admin shared types, constants, and helpers.
 *
 * Extracted from the 1,306-line src/app/admin/page.tsx (Phase 12d structural
 * split) so LeadsTab / BlogsTab / SubscribersTab / BlogFormModal can import a
 * single source of truth instead of duplicating definitions.
 */

/* ═══════════════ Types ═══════════════ */

export interface Lead {
  name: string;
  phone: string;
  email: string;
  interest: string;
  createdAt: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export interface BlogPost {
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

export interface BlogFormData {
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  published: boolean;
  coverImage: string;
}

export interface Subscriber {
  email: string;
  source: string;
  active: boolean;
  createdAt: string;
}

export type Tab = 'leads' | 'blogs' | 'subscribers';

/* ═══════════════ Constants ═══════════════ */

export const CATEGORIES = ['General', 'Market Analysis', 'Trading Tips', 'Course Updates', 'SEBI Updates'] as const;

export const INTEREST_LABELS: Record<string, string> = {
  account: 'Open Demat',
  courses: 'Courses',
  both: 'Account + Courses',
};

/** Per-interest pill accent — cf-* tokens (gold / emerald / indigo). */
export const INTEREST_COLORS: Record<string, string> = {
  account: 'bg-cf-gold/15 text-cf-gold border border-cf-gold/30',
  courses: 'bg-cf-emerald/15 text-cf-emerald border border-cf-emerald/30',
  both: 'bg-[#818CF8]/15 text-[#818CF8] border border-[#818CF8]/30',
};

export const emptyBlogForm: BlogFormData = {
  title: '',
  slug: '',
  category: 'General',
  author: 'SYA Team',
  excerpt: '',
  content: '',
  published: false,
  coverImage: '',
};

/* ═══════════════ Helpers ═══════════════ */

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/* ═══════════════ SYA Logo SVG ═══════════════ */

export function SyaLogo({ size = 40 }: { size?: number }) {
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
