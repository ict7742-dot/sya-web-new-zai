'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  BadgeCheck,
  GraduationCap,
  Cpu,
  Headphones,
  IndianRupee,
  Receipt,
  UserCheck,
  Code2,
  Zap,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Menu,
  ChevronDown,
  Star,
  MessageCircle,
  BookOpen,
  FileText,
  ChevronUp,
  Cookie,
} from 'lucide-react';
import { SearchTrigger } from '@/components/search-trigger';

/* ═══════════════ Types & Data ═══════════════ */

interface UtmData {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  landingPage: string;
}

function captureUtm(): UtmData {
  if (typeof window === 'undefined') return { utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', landingPage: '' };
  const params = new URLSearchParams(window.location.search);
  const data: UtmData = {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmTerm: params.get('utm_term') || '',
    utmContent: params.get('utm_content') || '',
    landingPage: window.location.href.split('?')[0],
  };
  if (data.utmSource || data.utmMedium || data.utmCampaign) {
    sessionStorage.setItem('sya_utm', JSON.stringify(data));
  }
  return data;
}

function getStoredUtm(): UtmData {
  if (typeof window === 'undefined') return { utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', landingPage: '' };
  try {
    const raw = sessionStorage.getItem('sya_utm');
    if (raw) return JSON.parse(raw) as UtmData;
  } catch { /* ignore */ }
  return { utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', landingPage: window.location.href.split('?')[0] };
}

/* Form abandonment — saves partial form data to localStorage */
const ABANDON_KEY = 'sya_form_abandon';

function saveAbandonment(data: Record<string, string>) {
  try {
    localStorage.setItem(ABANDON_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch { /* ignore */ }
}

function clearAbandonment() {
  try { localStorage.removeItem(ABANDON_KEY); } catch { /* ignore */ }
}

function loadAbandonment(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(ABANDON_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Only restore if less than 7 days old
    const age = Date.now() - new Date(data.savedAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) { clearAbandonment(); return null; }
    return data;
  } catch { return null; }
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

interface SymbolData {
  sym: string;
  seed: number;
  start: number;
  vol: number;
  dec: number;
}

interface SeriesData {
  candles: Candle[];
  prevClose: number;
  volM: number;
  tickCount: number;
}

interface TickerItem {
  name: string;
  price: number;
  change: number;
}

const SYMBOLS: SymbolData[] = [
  { sym: 'NIFTY 50', seed: 7, start: 24850.4, vol: 0.0011, dec: 2 },
  { sym: 'BANK NIFTY', seed: 23, start: 52340.2, vol: 0.0013, dec: 2 },
  { sym: 'RELIANCE', seed: 11, start: 1418.6, vol: 0.0016, dec: 2 },
];

const INITIAL_TICKERS: TickerItem[] = [
  { name: 'NIFTY 50', price: 24850.4, change: 0.42 },
  { name: 'SENSEX', price: 81455.6, change: 0.38 },
  { name: 'BANK NIFTY', price: 52340.2, change: 0.55 },
  { name: 'NIFTY MIDCAP', price: 58920.1, change: 0.31 },
  { name: 'INDIA VIX', price: 13.84, change: -2.14 },
  { name: 'USD/INR', price: 84.32, change: 0.05 },
  { name: 'RELIANCE', price: 1420.5, change: 0.92 },
  { name: 'HDFCBANK', price: 1712.3, change: 0.34 },
  { name: 'TCS', price: 4102.0, change: -0.41 },
  { name: 'INFY', price: 1854.6, change: 0.63 },
  { name: 'SBIN', price: 812.4, change: 1.12 },
  { name: 'ITC', price: 492.1, change: -0.22 },
];

/* ── Testimonials Data ── */
const TESTIMONIALS = [
  { name: 'Rohit Sharma', initials: 'RS', role: 'Options Trader · Batch 2024', rating: 5, text: 'The options course completely changed how I approach the markets. Before SYA, I was gambling with naked buys. Now I understand Greeks, position sizing, and risk management. My drawdowns dropped by 60% in the first quarter after the program.' },
  { name: 'Priya Mehta', initials: 'PM', role: 'Demat Client · since 2022', rating: 5, text: 'What I appreciate most is the honesty. No guaranteed-return promises, no pressure to overtrade. My partner at SYA actually told me to hold my mutual funds instead of churning them. That kind of integrity is rare in this industry.' },
  { name: 'Amit Jain', initials: 'AJ', role: 'Algo Student · Batch 2024', rating: 5, text: 'I came in knowing zero Python. Ten weeks later, I had a working mean-reversion strategy backtested on five years of NIFTY data. The API lab sessions were hands-on and the mentors actually trade what they teach.' },
  { name: 'Kavita Joshi', initials: 'KJ', role: 'Beginner Program · Batch 2023', rating: 4, text: 'As a complete beginner, I was nervous about joining. But the cohort size was small, the Hinglish instruction made it easy, and the lifetime access to recordings means I can revisit concepts whenever I need to. Highly recommend for anyone starting out.' },
  { name: 'Vikram Singh', initials: 'VS', role: 'F&O Trader · Demat Client', rating: 5, text: 'The zero brokerage on delivery is great, but what really matters is having someone local who picks up the phone. When the Adani crash happened, my SYA contact called me proactively to discuss my positions. That level of service is worth more than any brokerage savings.' },
  { name: 'Sneha Agarwal', initials: 'SA', role: 'Advanced Options · Batch 2024', rating: 5, text: 'The live market sessions during actual trading hours were a game-changer. Watching the mentor build and adjust an iron condor in real-time, explaining every adjustment — you cannot get that from YouTube videos. Worth every rupee.' },
];

/* ── FAQ Data ── */
const FAQS = [
  { q: 'How do I open a Demat & Trading account through SYA?', a: 'Fill out the inquiry form above or WhatsApp us. Our team will guide you through the paperless e-KYC process. You will need your PAN card, Aadhaar, and a cancelled cheque or bank statement. Most accounts are trade-ready within 24 hours.' },
  { q: 'What brokerage charges apply?', a: 'Equity delivery trades are at zero brokerage. Intraday equity and F&O are charged at a flat ₹20 per executed order (or 0.03% of turnover, whichever is lower). Statutory charges like STT, transaction charges, GST, and SEBI turnover fees apply as per exchange norms.' },
  { q: 'Do I need prior trading experience to join a course?', a: 'Not at all. Our Foundation program is designed for people with zero market knowledge. We start from what a stock exchange is and build up to creating your own trading plan. The only prerequisite is curiosity.' },
  { q: 'Are the courses conducted online or in person?', a: 'Both. All programs are conducted live on Zoom during market hours, and we also have a Jaipur classroom option. Every session is recorded with lifetime access.' },
  { q: 'What is the relationship between SYA and Angel One?', a: 'Systematic Yield Analysts Pvt. Ltd. is an Authorized Partner (sub-broker) of Angel One Limited. Your trading account is directly with Angel One, a SEBI-registered stock broker (INZ000161534) and member of NSE, BSE, and MCX.' },
  { q: 'Do you guarantee returns or provide stock tips?', a: 'Absolutely not. SEBI regulations prohibit guaranteed-return promises. We teach process-based, risk-managed trading. Anyone offering guaranteed returns in the stock market is violating SEBI guidelines.' },
  { q: 'Is my money safe with Angel One?', a: 'Yes. Angel One is a publicly listed company regulated by SEBI. All client funds are held in segregated bank accounts as mandated by SEBI. Securities are held in dematerialized form with NSDL/CDSL.' },
  { q: 'Can I switch from my current broker to Angel One through SYA?', a: 'Yes. We can help you initiate the account transfer process. The process typically takes 5-7 business days. Your new account can be active for fresh trades within 24 hours.' },
];

/* ── Social Proof Data ── */
const SOCIAL_PROOFS = [
  { name: 'Rahul', loc: 'Vaishali Nagar, Jaipur', action: 'opened a Demat account', mins: 3 },
  { name: 'Priya', loc: 'Malviya Nagar', action: 'enrolled in Advanced Options', mins: 7 },
  { name: 'Amit', loc: 'Mansarovar, Jaipur', action: 'completed onboarding', mins: 12 },
  { name: 'Kavita', loc: 'C-Scheme, Jaipur', action: 'joined the Foundation batch', mins: 18 },
  { name: 'Vikram', loc: 'Tonk Road', action: 'opened an account', mins: 24 },
  { name: 'Sneha', loc: 'Jagatpura, Jaipur', action: 'enrolled in Algo Trading', mins: 31 },
  { name: 'Deepak', loc: 'Raja Park', action: 'transferred from Zerodha', mins: 38 },
  { name: 'Neha', loc: 'Bani Park, Jaipur', action: 'started the Options course', mins: 45 },
];

/* ── Course Curriculum Data ── */
const CURRICULUM: Record<string, { weeks: string; topics: string[]; outcomes: string[] }> = {
  foundation: {
    weeks: '6 weeks',
    topics: [
      'What is the stock market? Exchanges, regulators, and market participants',
      'Reading candlestick charts — single, dual, and multi-candle patterns',
      'Fundamental analysis — balance sheets, P&L, ratios, and valuations',
      'Technical indicators — RSI, MACD, Bollinger Bands, moving averages',
      'Risk management — position sizing, stop-losses, risk-reward ratios',
      'Trading psychology — managing greed, fear, and FOMO',
      'Building your first trading plan with entry/exit rules',
      'Paper trading practicum — 2 weeks of simulated execution',
    ],
    outcomes: [
      'Read any candlestick chart and identify key patterns',
      'Analyze a company\'s fundamentals before buying',
      'Apply position sizing and stop-loss to every trade',
      'Build a written, rule-based trading plan',
    ],
  },
  options: {
    weeks: '8 weeks',
    topics: [
      'Options pricing — intrinsic value, time value, and the Greeks',
      'Delta, gamma, theta, vega — how each affects your P&L',
      'Vertical spreads — bull/bear call & put spreads',
      'Iron condors, straddles, and strangles for range-bound markets',
      'Live market sessions — building and adjusting positions in real-time',
      'Implied volatility and IV rank — when options are cheap or expensive',
      'Margin management and assignment risk',
      'Building an options playbook for NIFTY and BANK NIFTY',
    ],
    outcomes: [
      'Construct and manage multi-leg options strategies',
      'Understand how Greeks drive your position P&L',
      'Adjust positions dynamically during live market hours',
      'Apply institutional-grade risk management to F&O trades',
    ],
  },
  algo: {
    weeks: '10 weeks',
    topics: [
      'Python fundamentals for traders — no prior coding assumed',
      'Working with market data — APIs, OHLCV, and pandas',
      'Backtesting frameworks — writing and testing strategy rules',
      'Mean reversion strategies — Bollinger Band, RSI, and z-score',
      'Momentum and trend-following — moving average crossovers, breakouts',
      'Angel One SmartAPI — authentication, order placement, and live deployment',
      'Risk metrics — Sharpe ratio, max drawdown, Calmar ratio, win rate',
      'Portfolio-level strategy construction and live paper trading',
    ],
    outcomes: [
      'Write, backtest, and evaluate trading strategies in Python',
      'Connect to Angel One SmartAPI for live order execution',
      'Evaluate strategies with institutional risk metrics',
      'Deploy at least one automated strategy in paper trading',
    ],
  },
};

const LEGAL: Record<string, { t: string; b: string }> = {
  privacy: {
    t: 'Privacy Policy',
    b: `
      <p>Systematic Yield Analysts Pvt. Ltd. ("we") collects only the information you voluntarily submit through this website — your name, phone number, email address and service interest.</p>
      <p>This information is used exclusively to respond to your inquiry about broking services or education programs. We do not sell, rent or share your details with third parties, other than Angel One Limited for the limited purpose of account opening that you explicitly request.</p>
      <p><strong>UTM Tracking:</strong> When you arrive via a marketing link, we capture referral parameters (UTM source, medium, campaign) from the URL. This data is stored in your browser's session storage and attached to your inquiry to help us measure which campaigns are effective. It is not shared externally.</p>
      <p><strong>Local Storage:</strong> We use your browser's local storage to (a) remember your cookie consent preference, and (b) save partially filled form data so you do not lose progress if you navigate away. This data never leaves your browser.</p>
      <p>This website does not use third-party analytics or advertising cookies by default. If we introduce analytics in the future, you will be notified via the cookie consent banner.</p>
      <p>To access, correct or delete your information, write to connect@systematicyield.in.</p>
    `,
  },
  terms: {
    t: 'Terms & Conditions',
    b: `
      <p>This website is operated by Systematic Yield Analysts Pvt. Ltd., an Authorized Partner of Angel One Limited, for information and lead-generation purposes only.</p>
      <p>Nothing on this website constitutes investment advice, a research report, or an offer to buy or sell any security. Course content is educational in nature and does not guarantee trading outcomes.</p>
      <p>Investments in securities markets are subject to market risks. Please read all related documents carefully before investing. Past performance is not indicative of future returns.</p>
      <p>All pricing shown is as per Angel One's published rate card and may change; statutory charges apply as per exchange and SEBI norms.</p>
      <p>Disputes, if any, shall be subject to the jurisdiction of courts at Jaipur, Rajasthan.</p>
    `,
  },
};

/* ═══════════════ Utilities ═══════════════ */

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inr(v: number, d = 2) {
  if (v == null || isNaN(v)) return '—';
  return v.toLocaleString('en-IN', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function genSeries(s: SymbolData): SeriesData {
  const rnd = mulberry32(s.seed);
  const n = 44;
  const arr: Candle[] = [];
  let p = s.start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o * (1 + 0.0007 + (rnd() - 0.5) * s.vol * 2);
    const h = Math.max(o, c) * (1 + rnd() * s.vol * 0.9);
    const l = Math.min(o, c) * (1 - rnd() * s.vol * 0.9);
    arr.push({ o, h, l, c });
    p = c;
  }
  return {
    candles: arr,
    prevClose: s.start * 0.994,
    volM: 90 + rnd() * 80,
    tickCount: 0,
  };
}

/* ═══════════════ Component ═══════════════ */

function LazySection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {visible ? children : <div className="sec"><div className="wrap"><div style={{ height: '300px' }} className="animate-pulse bg-white/[0.01] rounded-xl" /></div></div>}
    </div>
  );
}

export default function HomePage() {
  /* ── State ── */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeSym, setActiveSym] = useState(0);
  const [seriesMap, setSeriesMap] = useState<Map<string, SeriesData>>(
    () => {
      const m = new Map<string, SeriesData>();
      SYMBOLS.forEach((s) => m.set(s.sym, genSeries(s)));
      return m;
    }
  );
  const [flashClass, setFlashClass] = useState('');
  const [tickers, setTickers] = useState<TickerItem[]>(
    () => INITIAL_TICKERS.map((t) => ({ ...t }))
  );
  const [tickerFlashIdx, setTickerFlashIdx] = useState<Set<number>>(new Set());
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedInterest, setSubmittedInterest] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState('privacy');
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);
  const [selectFlash, setSelectFlash] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);

  /* ── Refs ── */
  const chartRef = useRef<SVGSVGElement>(null);
  const gGridRef = useRef<SVGGElement>(null);
  const gCandlesRef = useRef<SVGGElement>(null);
  const gOverlayRef = useRef<SVGGElement>(null);
  const gXhairRef = useRef<SVGGElement>(null);
  const xVRef = useRef<SVGLineElement>(null);
  const xHRef = useRef<SVGLineElement>(null);
  const xPRRef = useRef<SVGRectElement>(null);
  const xPTRef = useRef<SVGTextElement>(null);
  const xTRRef = useRef<SVGRectElement>(null);
  const xTTRef = useRef<SVGTextElement>(null);
  const tPriceRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fNameRef = useRef<HTMLInputElement>(null);
  const fPhoneRef = useRef<HTMLInputElement>(null);
  const fEmailRef = useRef<HTMLInputElement>(null);
  const fInterestRef = useRef<HTMLSelectElement>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const toastId = useRef(0);
  const spIndex = useRef(Math.floor(Math.random() * SOCIAL_PROOFS.length));
  const [socialProof, setSocialProof] = useState<{ name: string; loc: string; action: string; mins: number } | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const exitShown = useRef(false);
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'declined' | null>(null);
  const [openCurriculum, setOpenCurriculum] = useState<string | null>(null);
  const utmRef = useRef<UtmData>({ utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', landingPage: '' });
  const [blogPosts, setBlogPosts] = useState<Array<{id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null; category: string; author: string; createdAt: string; updatedAt: string}>>([]);

  /* ── Fetch blog posts ── */
  useEffect(() => {
    fetch('/api/blogs?limit=3')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setBlogPosts(data); })
      .catch(() => { /* silently fail */ });
  }, []);

  const cur = SYMBOLS[activeSym];
  const st = seriesMap.get(cur.sym)!;
  const lastCandle = st.candles[st.candles.length - 1];

  /* ── Chart helpers ── */
  const VW = 560;
  const VH = 250;
  const padL = 6;
  const padR = 58;
  const padT = 12;
  const padB = 24;

  const getChartGeom = useCallback(() => {
    const cs = st.candles;
    const n = cs.length;
    const step = (VW - padL - padR) / n;
    let mn = Infinity;
    let mx = -Infinity;
    cs.forEach((k) => {
      mn = Math.min(mn, k.l);
      mx = Math.max(mx, k.h);
    });
    const pad = (mx - mn) * 0.08;
    const min = mn - pad;
    const max = mx + pad;
    return { step, min, max, n };
  }, [st]);

  const yOf = useCallback(
    (v: number) => {
      const { min, max } = getChartGeom();
      return padT + ((max - v) / (max - min)) * (VH - padT - padB);
    },
    [getChartGeom]
  );

  const vOf = useCallback(
    (y: number) => {
      const { min, max } = getChartGeom();
      return max - ((y - padT) / (VH - padT - padB)) * (max - min);
    },
    [getChartGeom]
  );

  const xOf = useCallback(
    (i: number) => {
      const { step } = getChartGeom();
      return padL + step * i + step / 2;
    },
    [getChartGeom]
  );

  const fmtP = (v: number) => inr(v, cur.dec);
  const fmtAxis = (v: number) =>
    v >= 500
      ? v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
      : v.toFixed(1);
  const timeOf = (i: number) => {
    const m = 9 * 60 + 15 + i * 5;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  };

  /* ── Render chart ── */
  useEffect(() => {
    const { step, min, max, n } = getChartGeom();
    const cs = st.candles;

    // Grid + axis labels
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const y = padT + ((VH - padT - padB) * g) / 4;
      const val = max - ((max - min) * g) / 4;
      grid += `<line x1="${padL}" x2="${VW - padR + 8}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.05)"/>`;
      grid += `<text x="${VW - padR + 12}" y="${y + 3}" font-size="9.5" fill="#5F6981">${fmtAxis(val)}</text>`;
    }
    for (let i = 4; i < n; i += 8)
      grid += `<text x="${xOf(i)}" y="${VH - 7}" font-size="9" fill="#5F6981" text-anchor="middle">${timeOf(i)}</text>`;
    if (gGridRef.current) gGridRef.current.innerHTML = grid;

    // Candles
    const bw = Math.max(2, step * 0.55);
    let s = '';
    cs.forEach((k, i) => {
      const up = k.c >= k.o;
      const col = up ? '#35D49A' : '#F0555F';
      const x = xOf(i);
      const yH = yOf(k.h);
      const yL = yOf(k.l);
      const yO = yOf(k.o);
      const yC = yOf(k.c);
      s += `<line x1="${x}" x2="${x}" y1="${yH}" y2="${yL}" stroke="${col}" stroke-width="1" opacity="0.85"/>`;
      s += `<rect x="${(x - bw / 2).toFixed(2)}" y="${Math.min(yO, yC).toFixed(2)}" width="${bw.toFixed(2)}" height="${Math.max(1, Math.abs(yO - yC)).toFixed(2)}" fill="${col}" opacity="${i === n - 1 ? 1 : 0.9}"/>`;
    });
    if (gCandlesRef.current) gCandlesRef.current.innerHTML = s;

    // Last-price line
    const ylp = yOf(cs[n - 1].c);
    if (gOverlayRef.current) {
      gOverlayRef.current.innerHTML =
        `<line x1="${padL}" x2="${VW - padR}" y1="${ylp}" y2="${ylp}" stroke="#E2B15C" stroke-width="1" stroke-dasharray="3 3" opacity="0.65"/>` +
        `<rect x="${VW - padR + 2}" y="${ylp - 8}" width="52" height="16" rx="3" fill="#E2B15C"/>` +
        `<text x="${VW - padR + 28}" y="${ylp + 3.5}" font-size="9.5" font-weight="600" fill="#0A0F1C" text-anchor="middle">${fmtP(cs[n - 1].c)}</text>`;
    }
  }, [st, getChartGeom, xOf, yOf, fmtP]);

  /* ── Live tick ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    const iv = setInterval(() => {
      if (document.hidden) return;
      setSeriesMap((prev) => {
        const next = new Map(prev);
        const sd = next.get(cur.sym);
        if (!sd) return prev;
        const newSd = { ...sd, candles: sd.candles.map((k) => ({ ...k })) };
        const last = newSd.candles[newSd.candles.length - 1];
        const old = last.c;
        last.c = last.c * (1 + (Math.random() - 0.5) * cur.vol * 1.8);
        last.h = Math.max(last.h, last.c);
        last.l = Math.min(last.l, last.c);
        newSd.tickCount++;
        if (newSd.tickCount % 14 === 0) {
          newSd.candles.push({ o: last.c, h: last.c, l: last.c, c: last.c });
          newSd.candles.shift();
        }
        next.set(cur.sym, newSd);
        return next;
      });
      // Flash
      setFlashClass((prev) => {
        const dir = Math.random() > 0.5 ? 'flash-up' : 'flash-down';
        return dir;
      });
      setTimeout(() => setFlashClass(''), 550);
    }, 900);
    return () => clearInterval(iv);
  }, [cur]);

  /* ── Social proof notifications ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    // Show first one after 8s, then every 25-40s
    const delay = 8000;
    const show = () => {
      const item = SOCIAL_PROOFS[spIndex.current % SOCIAL_PROOFS.length];
      spIndex.current++;
      setSocialProof(item);
      setTimeout(() => setSocialProof(null), 5000);
    };
    const t1 = setTimeout(show, delay);
    const iv = setInterval(show, 25000 + Math.random() * 15000);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  /* ── Exit-intent detection (desktop only) ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current && !modalOpen) {
        exitShown.current = true;
        setExitOpen(true);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [modalOpen]);

  /* ── Header scroll + progress + back-to-top + mobile CTA ── */
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setHeaderScrolled(y > 8);
      setShowBackToTop(y > 600);
      setShowMobileCta(y > 500);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min(1, y / docH) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Scroll spy ── */
  useEffect(() => {
    const ids = ['home', 'demat', 'courses', 'howitworks', 'testimonials', 'faq', 'about', 'blog', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Reveal on scroll ── */
  useEffect(() => {
    if (reducedMotion.current) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Counter animation ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const count = parseInt(el.dataset.count || '0', 10);
          observer.unobserve(el);
          if (reducedMotion.current) {
            el.textContent = count.toLocaleString('en-IN');
            return;
          }
          const t0 = performance.now();
          const dur = 1400;
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(count * eased).toLocaleString('en-IN');
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── UTM capture on mount ── */
  useEffect(() => {
    utmRef.current = captureUtm();
  }, []);

  /* ── Cookie consent check ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sya_cookie_consent');
      if (stored === 'accepted' || stored === 'declined') setCookieConsent(stored);
    } catch { /* ignore */ }
  }, []);

  const handleCookieConsent = useCallback((choice: 'accepted' | 'declined') => {
    setCookieConsent(choice);
    try { localStorage.setItem('sya_cookie_consent', choice); } catch { /* ignore */ }
  }, []);

  /* ── Restore abandoned form data ── */
  useEffect(() => {
    const saved = loadAbandonment();
    if (!saved) return;
    if (fNameRef.current && saved.name) fNameRef.current.value = saved.name;
    if (fPhoneRef.current && saved.phone) fPhoneRef.current.value = saved.phone;
    if (fEmailRef.current && saved.email) fEmailRef.current.value = saved.email;
    if (fInterestRef.current && saved.interest) fInterestRef.current.value = saved.interest;
    if (saved.message) {
      const msgEl = document.getElementById('fMsg') as HTMLTextAreaElement | null;
      if (msgEl) msgEl.value = saved.message;
    }
    // Show a subtle toast about restored data
    addToast('We restored your previous form entries.', true);
  }, []);

  /* ── Save form data on input (abandonment tracking) ── */
  const trackFormInput = useCallback(() => {
    const data: Record<string, string> = {};
    if (fNameRef.current?.value) data.name = fNameRef.current.value;
    if (fPhoneRef.current?.value) data.phone = fPhoneRef.current.value;
    if (fEmailRef.current?.value) data.email = fEmailRef.current.value;
    if (fInterestRef.current?.value) data.interest = fInterestRef.current.value;
    const msgEl = document.getElementById('fMsg') as HTMLTextAreaElement | null;
    if (msgEl?.value) data.message = msgEl.value;
    if (Object.keys(data).length > 0) saveAbandonment(data);
  }, []);

  /* ── Save on page unload ── */
  useEffect(() => {
    const handler = () => trackFormInput();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [trackFormInput]);

  /* ── Ticker price flicker ── */
  useEffect(() => {
    if (reducedMotion.current) return;
    const iv = setInterval(() => {
      setTickers((prev) => {
        const next = [...prev];
        const flashSet = new Set<number>();
        for (let k = 0; k < 3; k++) {
          const i = Math.floor(Math.random() * next.length);
          const t = { ...next[i] };
          const old = t.price;
          t.price = t.price * (1 + (Math.random() - 0.5) * 0.0035);
          t.change += ((t.price - old) / old) * 100;
          next[i] = t;
          flashSet.add(i);
        }
        setTickerFlashIdx(flashSet);
        return next;
      });
      setTimeout(() => setTickerFlashIdx(new Set()), 420);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  /* ── Escape key for modal ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) setModalOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalOpen]);

  /* ── Modal focus trap ── */
  useEffect(() => {
    if (!modalOpen) return;
    const modal = document.getElementById('modal');
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [modalOpen]);

  /* ── Toast helper ── */
  const addToast = useCallback((msg: string, ok = true) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, ok }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  /* ── CTA handler ── */
  const handleInterest = useCallback(
    (kind: string, label: string) => {
      if (fInterestRef.current) {
        fInterestRef.current.value = kind;
        setSelectFlash(true);
        setTimeout(() => setSelectFlash(false), 2200);
      }
      setMobileOpen(false);
      document
        .getElementById('contact')
        ?.scrollIntoView({ behavior: reducedMotion.current ? 'auto' : 'smooth' });
      setTimeout(() => fNameRef.current?.focus({ preventScroll: true }), 700);
      if (label)
        addToast(
          `Noted — "${label}". Share your details and we'll take it from here.`
        );
    },
    [addToast]
  );

  /* ── Form validation ── */
  const setErr = (field: string, msg: string | null) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
    // Also toggle .err on input
    const elMap: Record<string, HTMLInputElement | HTMLSelectElement | null> = {
      name: fNameRef.current,
      phone: fPhoneRef.current,
      email: fEmailRef.current,
      interest: fInterestRef.current,
    };
    const el = elMap[field];
    if (el) {
      if (msg) el.classList.add('err');
      else el.classList.remove('err');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fNameRef.current?.value || '';
    const phone = fPhoneRef.current?.value || '';
    const email = fEmailRef.current?.value || '';
    const interest = fInterestRef.current?.value || '';

    let ok = true;
    if (name.trim().length < 3) {
      setErr('name', 'Please enter your full name.');
      ok = false;
    } else setErr('name', null);

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || !/^[6-9]\d{9}$/.test(digits.slice(-10))) {
      setErr('phone', 'Enter a valid 10-digit Indian mobile number.');
      ok = false;
    } else setErr('phone', null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setErr('email', 'Enter a valid email address.');
      ok = false;
    } else setErr('email', null);

    if (!interest) {
      setErr('interest', 'Please choose an option.');
      ok = false;
    } else setErr('interest', null);

    if (!ok) {
      addToast('Please fix the highlighted fields.', false);
      return;
    }

    // Hybrid form system: save to database + conditional eKYC redirect
    setSubmitting(true);

    try {
      const utm = getStoredUtm();
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          email: email.trim(),
          interest,
          message: document.getElementById('fMsg')?.value || '',
          ...utm,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          Object.entries(data.fields).forEach(([field, msg]) => setErr(field, msg as string));
          addToast('Please fix the highlighted fields.', false);
        } else {
          addToast(data.error || 'Something went wrong. Please try again.', false);
        }
        setSubmitting(false);
        return;
      }

      setSubmitterName(data.firstName);
      setSubmittedInterest(data.interest);
      setFormSubmitted(true);
      clearAbandonment();
      addToast('Inquiry received — we usually respond within a few hours.');

      // Redirect to Angel One eKYC for account/both interests
      if (data.ekycUrl) {
        setTimeout(() => {
          window.open(data.ekycUrl, '_blank', 'noopener,noreferrer');
        }, 1200);
      }
    } catch {
      addToast('Network error — please check your connection and try again.', false);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    formRef.current?.reset();
    setFormSubmitted(false);
    setSubmittedInterest('');
    setFormErrors({});
  };

  /* ── Header data ── */
  const chg = lastCandle.c - st.prevClose;
  const pct = (chg / st.prevClose) * 100;
  const up = chg >= 0;
  const sma =
    st.candles.slice(-20).reduce((a, k) => a + k.c, 0) / 20;
  const above = lastCandle.c >= sma;

  /* ── Ticker HTML ── */
  const tkHTML = tickers.map((t, i) => (
    <span
      key={i}
      className="tk flex items-center gap-2 text-[12px] whitespace-nowrap"
      data-tk={i}
    >
      <span className="text-white/60 font-medium">{t.name}</span>
      <span
        className={`tk-px tnum text-white/90 ${tickerFlashIdx.has(i) ? 'tk-flash' : ''}`}
      >
        {inr(t.price)}
      </span>
      <span
        className={`tnum text-[11px] ${t.change >= 0 ? 'text-up' : 'text-down'}`}
      >
        {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
      </span>
    </span>
  ));

  const navLinks = ['home', 'demat', 'courses', 'howitworks', 'testimonials', 'faq', 'about', 'blog', 'contact'];
  const navLabels: Record<string, string> = {
    home: 'Home',
    demat: 'Open Demat',
    courses: 'Courses',
    howitworks: 'How It Works',
    testimonials: 'Reviews',
    faq: 'FAQ',
    about: 'About',
    blog: 'Insights',
    contact: 'Contact',
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* ══════════ ACCESSIBILITY ══════════ */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} role="progressbar" aria-valuenow={Math.round(scrollProgress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Page scroll progress" />

      {/* ══════════ LIVE INDEX TICKER ══════════ */}
      <div className="border-b border-white/[0.06] bg-ink2">
        <div className="ticker-wrap overflow-hidden">
          <div className="ticker-track flex w-max items-center py-2">
            {tkHTML}
            {tkHTML}
          </div>
        </div>
      </div>

      {/* ══════════ STICKY NAV ══════════ */}
      <header
        id="siteHeader"
        className={`sticky top-0 z-50 border-b border-white/[0.06] bg-ink/80 backdrop-blur-md transition-all ${headerScrolled ? 'scrolled' : ''}`}
      >
        <nav
          className="wrap h-[70px] flex items-center justify-between gap-6"
          aria-label="Main navigation"
        >
          <a href="#home" className="flex items-center gap-3 shrink-0">
            <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
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
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">
                Systematic Yield
              </span>
              <span className="block text-[9px] font-medium tracking-[0.24em] text-mist uppercase">
                Analysts · Angel One Partner
              </span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium">
            {navLinks.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`nav-link dl ${activeSection === id ? 'active' : ''}`}
              >
                {navLabels[id]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SearchTrigger className="hidden sm:inline-flex" />
            <button
              onClick={() => handleInterest('account', 'Demat account onboarding')}
              className="btn btn-primary hidden sm:inline-flex !py-2.5 !px-5 !text-[13px]"
            >
              Open Demat Account
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden w-10 h-10 flex items-center justify-center border border-white/15 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          ref={mobileMenuRef}
          id="mobileMenu"
          className="lg:hidden border-t border-white/[0.06] bg-ink2/95 backdrop-blur-md"
          style={{ maxHeight: mobileOpen ? mobileMenuRef.current?.scrollHeight + 'px' : '0px' }}
        >
          <div className="wrap py-2 flex flex-col">
            {navLinks.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileOpen(false)}
                className="nav-link py-3.5 border-b border-white/5 text-[15px] font-medium"
              >
                {navLabels[id]}
              </a>
            ))}
            <button
              onClick={() => handleInterest('account', 'Demat account onboarding')}
              className="btn btn-primary w-full my-4"
            >
              Open Demat Account
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ══════════ HERO ══════════ */}
        <section id="home" className="relative overflow-hidden">
          <div className="grid-paper absolute inset-0 pointer-events-none" aria-hidden="true" />

          <div className="wrap relative pt-14 pb-16 lg:pt-24 lg:pb-24 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Copy */}
            <div className="lg:col-span-6">
              <p className="eyebrow reveal">Angel One Authorized Partner · Jaipur</p>
              <h1 className="reveal d1 font-serif font-medium text-[38px] leading-[1.08] sm:text-[46px] lg:text-[54px] tracking-[-0.01em] mt-6">
                Master the <em>Markets</em>.<br />Trade with the Best.
              </h1>
              <p className="reveal d2 mt-6 text-mist text-[15.5px] md:text-base leading-relaxed max-w-xl">
                Your trusted Angel One Authorized Partner and premier stock market education academy.
                Build your wealth with data-driven strategies — not guesswork.
              </p>
              <div className="reveal d3 mt-9 flex flex-wrap gap-3">
                <button
                  onClick={() => handleInterest('account', '')}
                  className="btn btn-primary"
                >
                  Open Angel One Account <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#courses" className="btn btn-ghost">
                  View Our Courses
                </a>
              </div>
              <p className="reveal d3 mt-8 flex items-center gap-2.5 text-[12.5px] text-mist">
                <ShieldCheck className="w-[15px] h-[15px] text-gold shrink-0" />
                Backed by Angel One — Member NSE · BSE · MCX. Paperless onboarding in about 15 minutes.
              </p>
            </div>

            {/* Live terminal */}
            <div className="lg:col-span-6 reveal d2">
              <div className="relative">
                <span className="tick tick-tl" aria-hidden="true" />
                <span className="tick tick-tr" aria-hidden="true" />
                <span className="tick tick-bl" aria-hidden="true" />
                <span className="tick tick-br" aria-hidden="true" />

                <div className="rounded-xl border border-white/10 bg-panel shadow-2xl shadow-black/60 overflow-hidden">
                  {/* Terminal header / symbol tabs */}
                  <div className="flex items-center justify-between border-b border-white/[0.07] pl-2 pr-4">
                    <div className="flex">
                      {SYMBOLS.map((s, i) => (
                        <button
                          key={s.sym}
                          className={`term-tab ${activeSym === i ? 'active' : ''}`}
                          onClick={() => setActiveSym(i)}
                        >
                          {s.sym}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="live-dot" />
                      <span className="text-[10.5px] font-semibold tracking-[0.2em] text-up">LIVE</span>
                    </div>
                  </div>

                  {/* Quote header */}
                  <div className="px-5 pt-4 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-[11px] tracking-[0.18em] text-mist uppercase font-medium">
                        {cur.sym}
                      </div>
                      <div className="flex items-baseline gap-3 mt-1.5">
                        <span
                          ref={tPriceRef}
                          id="tPrice"
                          className={`tnum text-[30px] font-semibold leading-none ${flashClass}`}
                        >
                          {fmtP(lastCandle.c)}
                        </span>
                        <span
                          className={`tnum text-[13px] px-1.5 py-0.5 rounded ${up ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`}
                        >
                          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex gap-5 text-right">
                      <div><div className="text-[9.5px] tracking-[0.16em] text-white/40">OPEN</div><div className="tnum text-[12.5px] text-white/85 mt-0.5">{fmtP(lastCandle.o)}</div></div>
                      <div><div className="text-[9.5px] tracking-[0.16em] text-white/40">HIGH</div><div className="tnum text-[12.5px] text-white/85 mt-0.5">{fmtP(lastCandle.h)}</div></div>
                      <div><div className="text-[9.5px] tracking-[0.16em] text-white/40">LOW</div><div className="tnum text-[12.5px] text-white/85 mt-0.5">{fmtP(lastCandle.l)}</div></div>
                      <div><div className="text-[9.5px] tracking-[0.16em] text-white/40">CLOSE</div><div className="tnum text-[12.5px] text-white/85 mt-0.5">{fmtP(lastCandle.c)}</div></div>
                    </div>
                  </div>

                  {/* Candlestick chart */}
                  <div className="mt-2 px-1">
                    <ChartSVG
                      chartRef={chartRef}
                      gGridRef={gGridRef}
                      gCandlesRef={gCandlesRef}
                      gOverlayRef={gOverlayRef}
                      gXhairRef={gXhairRef}
                      xVRef={xVRef}
                      xHRef={xHRef}
                      xPRRef={xPRRef}
                      xPTRef={xPTRef}
                      xTRRef={xTRRef}
                      xTTRef={xTTRef}
                      getChartGeom={getChartGeom}
                      yOf={yOf}
                      vOf={vOf}
                      xOf={xOf}
                      fmtP={fmtP}
                      timeOf={timeOf}
                    />
                  </div>

                  {/* Terminal footer */}
                  <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[11.5px] text-mist">
                    <span className="tnum">VOL {(st.volM + Math.random() * 8).toFixed(1)}M</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${above ? 'bg-up' : 'bg-down'} inline-block`} />
                      {above ? 'Above 20-SMA · Bullish bias' : 'Below 20-SMA · Cautious'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3.5 text-[11px] text-white/35">
                Illustrative feed for demonstration — open your account with us for live market data.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST & STATS STRIP ══════════ */}
        <div className="border-y border-white/[0.08]">
          <div className="wrap !px-0 md:!px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
              <div className="bg-ink px-6 py-7 flex items-start gap-4 reveal">
                <span className="w-10 h-10 shrink-0 rounded-md border border-gold/25 text-gold flex items-center justify-center"><BadgeCheck className="w-[18px] h-[18px]" /></span>
                <span><span className="block text-[13.5px] font-semibold leading-snug">Authorized Angel One Partner</span><span className="block text-[12px] text-mist mt-1 leading-relaxed">Regulated broking ecosystem, end to end</span></span>
              </div>
              <div className="bg-ink px-6 py-7 flex items-start gap-4 reveal d1">
                <span className="w-10 h-10 shrink-0 rounded-md border border-gold/25 text-gold flex items-center justify-center"><GraduationCap className="w-[18px] h-[18px]" /></span>
                <span><span className="block text-[13.5px] font-semibold leading-snug">Expert Mentorship</span><span className="block text-[12px] text-mist mt-1 leading-relaxed">NISM-certified mentors, live market sessions</span></span>
              </div>
              <div className="bg-ink px-6 py-7 flex items-start gap-4 reveal d2">
                <span className="w-10 h-10 shrink-0 rounded-md border border-gold/25 text-gold flex items-center justify-center"><Cpu className="w-[18px] h-[18px]" /></span>
                <span><span className="block text-[13.5px] font-semibold leading-snug">Data-Driven Quant Strategies</span><span className="block text-[12px] text-mist mt-1 leading-relaxed">Backtested models — never hot tips</span></span>
              </div>
              <div className="bg-ink px-6 py-7 flex items-start gap-4 reveal d3">
                <span className="w-10 h-10 shrink-0 rounded-md border border-gold/25 text-gold flex items-center justify-center"><Headphones className="w-[18px] h-[18px]" /></span>
                <span><span className="block text-[13.5px] font-semibold leading-snug">Dedicated Support</span><span className="block text-[12px] text-mist mt-1 leading-relaxed">One point of contact — KYC to strategy</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ GOOGLE REVIEWS BADGE ══════════ */}
        <div className="border-b border-white/[0.08]">
          <div className="wrap py-6 flex flex-wrap items-center justify-center gap-6 reveal">
            <div className="google-badge">
              <svg className="google-badge-logo" viewBox="0 0 24 24" aria-hidden="true" loading="lazy"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="google-badge-rating">4.8</span>
                  <div className="google-badge-stars">
                    {[0,1,2,3,4].map((si) => (
                      <Star key={si} style={{ width: 14, height: 14, fill: '#E2B15C', color: '#E2B15C' }} />
                    ))}
                  </div>
                </div>
                <p className="google-badge-count">Based on 180+ Google Reviews</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-[12.5px] text-mist">
              <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-up" /> SEBI Regulated</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-up" /> NSE, BSE, MCX</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-up" /> NISM Certified</span>
            </div>
          </div>
        </div>

        {/* ══════════ BROKING SERVICES ══════════ */}
        <section id="demat" className="sec bg-ink2/50">
          <div className="wrap grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
            {/* Left: benefits */}
            <div>
              <p className="eyebrow reveal">01 · Partner Desk</p>
              <h2 className="reveal d1 font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                Why Open Your Account With Us?
              </h2>
              <p className="reveal d2 mt-4 text-mist text-[15px] leading-relaxed max-w-lg">
                Anyone can issue you a login. As an Authorized Partner of Angel One, we pair India&apos;s most trusted
                broking platform with a local desk that actually picks up the phone.
              </p>

              <div className="reveal d2 mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {[
                  { icon: IndianRupee, title: 'Zero brokerage on equity delivery', desc: 'Buy and hold across NSE & BSE without brokerage eating into your returns. Delivery trades stay completely free.' },
                  { icon: Receipt, title: 'Flat ₹20 on intraday & F&O', desc: 'One flat fee per executed order — or 0.03% of turnover, whichever is lower. No hidden slabs, no percentage surprises.' },
                  { icon: UserCheck, title: 'Personalized portfolio guidance', desc: 'A dedicated partner who reviews your allocations with you every quarter — and tells you when the right move is to do nothing.' },
                  { icon: Code2, title: 'API & algo trading support', desc: 'Build on Angel One SmartAPI with hand-holding from our quant team — from your first automated signal to full deployment.' },
                  { icon: Zap, title: 'Seamless digital onboarding', desc: '100% paperless e-KYC with e-Sign and DigiLocker. Most accounts are trade-ready within 24 hours.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5 py-6 group">
                    <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-gold flex items-center justify-center group-hover:border-gold/50 transition-colors">
                      <item.icon className="w-[19px] h-[19px]" />
                    </span>
                    <div>
                      <h3 className="text-[15.5px] font-semibold">{item.title}</h3>
                      <p className="text-[13.5px] text-mist mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: pricing term sheet */}
            <div className="reveal d1 lg:sticky lg:top-24">
              <div className="relative">
                <span className="tick tick-tl" aria-hidden="true" />
                <span className="tick tick-tr" aria-hidden="true" />
                <span className="tick tick-bl" aria-hidden="true" />
                <span className="tick tick-br" aria-hidden="true" />

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7 md:p-9">
                  <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-gold">Partner Pricing</p>
                  <h3 className="font-serif font-medium text-[26px] mt-2">Brokerage, in plain numbers.</h3>

                  <dl className="mt-7">
                    {[
                      { dt: 'Equity Delivery', dd: '₹0', sub: 'Hold as long as you like', gold: true },
                      { dt: 'Intraday Equity', dd: '₹20', sub: 'Per executed order', gold: false },
                      { dt: 'Futures & Options', dd: '₹20', sub: 'Per order, all segments', gold: false },
                      { dt: 'Account Opening', dd: '₹0', sub: 'Paperless e-KYC', gold: true },
                      { dt: 'Annual Maintenance', dd: '₹0', sub: 'First year, on accounts opened with us', gold: true },
                    ].map((item, i, arr) => (
                      <div key={item.dt} className={`flex items-baseline justify-between gap-4 py-4 ${i < arr.length - 1 ? 'border-b border-white/[0.08]' : ''}`}>
                        <dt>
                          <span className="text-[14px] text-white/85 font-medium">{item.dt}</span>
                          <span className="block text-[11.5px] text-mist mt-0.5">{item.sub}</span>
                        </dt>
                        <dd className={`font-serif text-[26px] leading-none ${item.gold ? 'text-gold' : ''}`}>{item.dd}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="text-[10.5px] text-white/35 leading-relaxed mt-2">
                    *Or 0.03% of turnover, whichever is lower, as per Angel One&apos;s published rate card. Statutory charges apply as per exchange &amp; SEBI norms.
                  </p>

                  <div className="mt-7 pt-7 border-t border-white/[0.08]">
                    <p className="f-label">Documents you&apos;ll need</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['PAN card', 'Aadhaar', 'Bank proof', 'Photo & signature'].map((doc) => (
                        <span key={doc} className="text-[11.5px] px-3 py-1.5 rounded border border-white/10 text-white/70 bg-white/[0.03]">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleInterest('account', 'Demat account onboarding')}
                    className="btn btn-primary w-full mt-8"
                  >
                    Start Paperless Onboarding <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ EDUCATION & ACADEMY ══════════ */}
        <section id="courses" className="sec border-t border-white/[0.06]">
          <div className="wrap">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="reveal">
                <p className="eyebrow">02 · The Academy</p>
                <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                  Stock Market Education Programs
                </h2>
              </div>
              <p className="reveal d1 text-[13.5px] text-mist leading-relaxed max-w-md lg:text-right">
                Small cohorts, live-market sessions, and mentors who trade what they teach.
                Every program includes lifetime access to recordings and our trader community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
              {/* Card 1 — Foundations */}
              <article className="reveal group relative flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-7 transition-colors duration-300 hover:border-gold/40">
                <span className="font-serif text-[58px] leading-none text-white/[0.05] absolute top-4 right-6 select-none group-hover:text-gold/20 transition-colors duration-500" aria-hidden="true">01</span>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-mist">Foundation</p>
                <h3 className="font-serif font-medium text-[21px] leading-snug mt-3 max-w-[85%]">Beginner to Pro: Stock Market Basics</h3>
                <p className="text-[13.5px] text-mist leading-relaxed mt-3">
                  From your first candlestick to a complete trading plan — the essentials of markets, instruments
                  and risk, taught without jargon or hype.
                </p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {['Candlestick reading', 'Risk management', 'Fundamental analysis', 'Trading psychology'].map((tag) => (
                    <span key={tag} className="text-[11px] px-2.5 py-1.5 rounded border border-white/10 text-white/70 bg-white/[0.03]">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => setOpenCurriculum(openCurriculum === 'foundation' ? null : 'foundation')}
                    className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-mist hover:text-gold transition-colors py-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {openCurriculum === 'foundation' ? 'Hide' : 'View'} Curriculum &amp; Outcomes
                    {openCurriculum === 'foundation' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {openCurriculum === 'foundation' && (
                    <div className="curriculum-panel mt-3">
                      <div className="curriculum-list">
                        {CURRICULUM.foundation.topics.map((t, ti) => (
                          <div key={ti} className="curriculum-item"><span className="curriculum-num">{String(ti + 1).padStart(2, '0')}</span><span>{t}</span></div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">By the end, you will:</p>
                        {CURRICULUM.foundation.outcomes.map((o, oi) => (
                          <div key={oi} className="flex items-start gap-2 text-[12px] text-mist leading-relaxed mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-up shrink-0 mt-0.5" /><span>{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[11.5px] text-mist mt-4">6 weeks · Live online + Jaipur classroom · Hinglish</p>
                  <p className="text-[11px] text-gold/80 mt-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" />Next batch starts 15th Sept — <span className="font-semibold text-gold">4 seats left</span></p>
                  <button
                    onClick={() => handleInterest('courses', 'Beginner to Pro: Stock Market Basics')}
                    className="mt-4 w-full flex items-center justify-center gap-2 border border-white/12 rounded-md py-3 text-[13.5px] font-medium transition-all hover:bg-gold hover:text-ink hover:border-gold"
                  >
                    Enroll Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>

              {/* Card 2 — Options & Derivatives (flagship) */}
              <article className="reveal d1 group relative flex flex-col rounded-xl border border-gold/40 bg-gold/[0.03] p-6 md:p-7 transition-colors duration-300 hover:border-gold/70">
                <span className="font-serif text-[58px] leading-none text-white/[0.05] absolute top-4 right-6 select-none group-hover:text-gold/20 transition-colors duration-500" aria-hidden="true">02</span>
                <span className="absolute -top-3 left-6 bg-gold text-ink text-[9.5px] font-bold tracking-[0.18em] px-3 py-1 rounded">MOST ENROLLED</span>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-mist">Advanced</p>
                <h3 className="font-serif font-medium text-[21px] leading-snug mt-3 max-w-[85%]">Advanced Options &amp; Derivatives Trading</h3>
                <p className="text-[13.5px] text-mist leading-relaxed mt-3">
                  Greeks, spreads and position sizing — taught on live markets. Learn to build, adjust and exit
                  option structures with institutional discipline.
                </p>
                <svg viewBox="0 0 260 92" className="w-full h-auto mt-5" aria-hidden="true">
                  <line x1="14" y1="46" x2="246" y2="46" stroke="rgba(255,255,255,0.14)" strokeDasharray="3 3" />
                  <polyline points="24,14 130,64 236,14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" strokeDasharray="4 3" />
                  <polyline points="24,30 130,80 236,30" fill="none" stroke="#E2B15C" strokeWidth="2" />
                  <text x="14" y="11" fontSize="8.5" fill="rgba(255,255,255,0.4)">GROSS</text>
                  <text x="246" y="42" fontSize="8.5" fill="#E2B15C" textAnchor="end">NET OF PREMIUM</text>
                  <text x="130" y="90" fontSize="8" fill="rgba(255,255,255,0.35)" textAnchor="middle" letterSpacing="1">LONG STRADDLE — PAYOFF AT EXPIRY</text>
                </svg>
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => setOpenCurriculum(openCurriculum === 'options' ? null : 'options')}
                    className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-mist hover:text-gold transition-colors py-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {openCurriculum === 'options' ? 'Hide' : 'View'} Curriculum &amp; Outcomes
                    {openCurriculum === 'options' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {openCurriculum === 'options' && (
                    <div className="curriculum-panel mt-3">
                      <div className="curriculum-list">
                        {CURRICULUM.options.topics.map((t, ti) => (
                          <div key={ti} className="curriculum-item"><span className="curriculum-num">{String(ti + 1).padStart(2, '0')}</span><span>{t}</span></div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">By the end, you will:</p>
                        {CURRICULUM.options.outcomes.map((o, oi) => (
                          <div key={oi} className="flex items-start gap-2 text-[12px] text-mist leading-relaxed mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-up shrink-0 mt-0.5" /><span>{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[11.5px] text-mist mt-4">8 weeks · Live market-hour sessions · Weekend batch</p>
                  <p className="text-[11px] text-gold/80 mt-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" />Weekend batch starting 20th Sept — <span className="font-semibold text-gold">2 seats left</span></p>
                  <button
                    onClick={() => handleInterest('courses', 'Advanced Options & Derivatives Trading')}
                    className="mt-4 w-full flex items-center justify-center gap-2 border border-white/12 rounded-md py-3 text-[13.5px] font-medium transition-all hover:bg-gold hover:text-ink hover:border-gold"
                  >
                    Enroll Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>

              {/* Card 3 — Quant & Algo */}
              <article className="reveal d2 group relative flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-7 transition-colors duration-300 hover:border-gold/40 md:col-span-2 xl:col-span-1">
                <span className="font-serif text-[58px] leading-none text-white/[0.05] absolute top-4 right-6 select-none group-hover:text-gold/20 transition-colors duration-500" aria-hidden="true">03</span>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-mist">Professional</p>
                <h3 className="font-serif font-medium text-[21px] leading-snug mt-3 max-w-[85%]">Quantitative &amp; Algo Trading Mastery</h3>
                <p className="text-[13.5px] text-mist leading-relaxed mt-3">
                  Backtest, refine and deploy rule-based strategies with Python and Angel One SmartAPI.
                  No prior coding experience assumed.
                </p>
                <div className="mt-5">
                  <svg viewBox="0 0 260 80" className="w-full h-auto" aria-hidden="true">
                    <path d="M4,64 L24,56 42,60 60,46 78,50 96,36 112,41 130,28 148,33 166,22 184,27 202,15 220,19 240,9 256,13 256,78 4,78 Z" fill="rgba(53,212,154,0.08)" />
                    <path d="M4,64 L24,56 42,60 60,46 78,50 96,36 112,41 130,28 148,33 166,22 184,27 202,15 220,19 240,9 256,13" fill="none" stroke="#35D49A" strokeWidth="1.8" strokeLinejoin="round" />
                    <text x="4" y="10" fontSize="8" fill="rgba(255,255,255,0.4)" letterSpacing="1">EQUITY CURVE — SAMPLE BACKTEST</text>
                  </svg>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] tnum text-mist mt-3">
                    <span>CAGR <span className="text-white">26.4%</span></span>
                    <span>Max DD <span className="text-white">−8.2%</span></span>
                    <span>Trades <span className="text-white">1,240</span></span>
                    <span className="text-white/35">*illustrative lab results</span>
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => setOpenCurriculum(openCurriculum === 'algo' ? null : 'algo')}
                    className="w-full flex items-center justify-center gap-2 text-[12px] font-medium text-mist hover:text-gold transition-colors py-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {openCurriculum === 'algo' ? 'Hide' : 'View'} Curriculum &amp; Outcomes
                    {openCurriculum === 'algo' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {openCurriculum === 'algo' && (
                    <div className="curriculum-panel mt-3">
                      <div className="curriculum-list">
                        {CURRICULUM.algo.topics.map((t, ti) => (
                          <div key={ti} className="curriculum-item"><span className="curriculum-num">{String(ti + 1).padStart(2, '0')}</span><span>{t}</span></div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">By the end, you will:</p>
                        {CURRICULUM.algo.outcomes.map((o, oi) => (
                          <div key={oi} className="flex items-start gap-2 text-[12px] text-mist leading-relaxed mt-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-up shrink-0 mt-0.5" /><span>{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[11.5px] text-mist mt-4">10 weeks · Includes live API lab · Cohort of 15</p>
                  <p className="text-[11px] text-gold/80 mt-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" />Next cohort opens October — <span className="font-semibold text-gold">7 seats left</span></p>
                  <button
                    onClick={() => handleInterest('courses', 'Quantitative & Algo Trading Mastery')}
                    className="mt-4 w-full flex items-center justify-center gap-2 border border-white/12 rounded-md py-3 text-[13.5px] font-medium transition-all hover:bg-gold hover:text-ink hover:border-gold"
                  >
                    Enroll Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="howitworks" className="sec border-t border-white/[0.06]">
          <div className="wrap max-w-4xl">
            <div className="text-center reveal">
              <p className="eyebrow justify-center">03 · How It Works</p>
              <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                Three steps. Zero friction.
              </h2>
              <p className="mt-4 text-mist text-[15px] leading-relaxed max-w-lg mx-auto">
                Whether you are opening your first demat account or enrolling in a program — we keep it simple, fast, and human.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-3 gap-8 reveal d1">
              {[
                {
                  step: '01',
                  icon: MessageCircle,
                  title: 'Reach Out',
                  desc: 'Fill the form, WhatsApp us, or call directly. Tell us what you need — a trading account, a course, or both.',
                  cta: 'Start with a message',
                  ctaKind: 'both' as const,
                },
                {
                  step: '02',
                  icon: UserCheck,
                  title: 'Quick Onboarding',
                  desc: 'Our team walks you through paperless e-KYC via DigiLocker. PAN, Aadhaar, bank proof — done in about 15 minutes.',
                  cta: 'Open Demat Account',
                  ctaKind: 'account' as const,
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Start Trading & Learning',
                  desc: 'Your Angel One account goes live within 24 hours. Course batches start monthly — or get instant access to recordings.',
                  cta: 'View Courses',
                  ctaKind: 'courses' as const,
                },
              ].map((item) => (
                <div key={item.step} className="hiw-step relative flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full border border-gold/40 bg-gold/[0.06] flex items-center justify-center text-gold group-hover:bg-gold/15 group-hover:border-gold/70 transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="font-serif text-[48px] leading-none text-white/[0.04] absolute -top-1 right-2 select-none" aria-hidden="true">{item.step}</p>
                  <h3 className="text-[17px] font-semibold mt-5">{item.title}</h3>
                  <p className="text-[13.5px] text-mist leading-relaxed mt-3">{item.desc}</p>
                  <button
                    onClick={() => handleInterest(item.ctaKind, item.cta)}
                    className="mt-6 text-[13px] font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1.5"
                  >
                    {item.cta} <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none" aria-hidden="true" />
          </div>
        </section>

        <LazySection>
        {/* ══════════ TESTIMONIALS ══════════ */}
        <section id="testimonials" className="sec border-t border-white/[0.06] bg-ink2/50">
          <div className="wrap">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="reveal">
                <p className="eyebrow">04 · Student and Client Reviews</p>
                <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                  What Our Traders Say
                </h2>
              </div>
              <p className="reveal d1 text-[13.5px] text-mist leading-relaxed max-w-md lg:text-right">
                Real feedback from real people — no fake reviews, no incentivized ratings.
                These are unprompted messages we have received over the years.
              </p>
            </div>

            <div className="testimonial-scroll mt-12 reveal d1">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="flex items-center gap-1 mb-4">
                    {[0,1,2,3,4].map((si) => (
                      <Star key={si} style={{ width: 14, height: 14, fill: si < t.rating ? '#E2B15C' : 'rgba(255,255,255,0.15)', color: si < t.rating ? '#E2B15C' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                  <div className="testimonial-quote">
                    <p className="text-[13.5px] text-mist leading-relaxed">{t.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/[0.08]">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div>
                      <p className="text-[14px] font-semibold">{t.name}</p>
                      <p className="text-[11.5px] text-mist mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </LazySection>

        <LazySection>
        {/* ══════════ FAQ ══════════ */}
        <section id="faq" className="sec border-t border-white/[0.06]">
          <div className="wrap max-w-3xl">
            <div className="reveal">
              <p className="eyebrow">05 · Frequently Asked Questions</p>
              <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                Questions We Get Asked a Lot
              </h2>
              <p className="mt-4 text-mist text-[15px] leading-relaxed max-w-lg">
                Can not find what you are looking for? <a href="#contact" className="text-gold hover:underline">Reach out directly</a> — we respond within one business day.
              </p>
            </div>

            <div className="mt-10 reveal d1">
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="faq-item">
                    <button
                      className={`faq-toggle ${isOpen ? 'open' : ''}`}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      <span>{f.q}</span>
                      <ChevronDown className="w-[18px] h-[18px] faq-chevron" />
                    </button>
                    <div
                      className="faq-body"
                      style={{
                        maxHeight: isOpen ? '500px' : '0',
                      }}
                    >
                      <div className="pb-5 text-[13.5px] text-mist leading-relaxed">
                        {f.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        </LazySection>

        <LazySection>
        {/* ══════════ ABOUT US ══════════ */}
        <section id="about" className="sec border-t border-white/[0.06] bg-ink2/50">
          <div className="wrap">
            <p className="eyebrow reveal">06 · About Us</p>
            <div className="grid lg:grid-cols-12 gap-12 mt-5">
              <div className="lg:col-span-7">
                <h2 className="reveal d1 font-serif font-medium text-[28px] sm:text-[34px] lg:text-[38px] leading-[1.16] tracking-[-0.01em]">
                  A Jaipur desk that treats investing as a <em>process</em> — not a prediction.
                </h2>
                <p className="reveal d2 mt-6 text-mist text-[15px] leading-relaxed">
                  Systematic Yield Analysts Pvt. Ltd. runs on two wings of the same philosophy. As an Authorized
                  Partner of Angel One, we help investors access world-class broking infrastructure with local,
                  accountable guidance. As an academy, we train the next generation of market participants to
                  trade with rules, evidence and risk control — because we&apos;d rather build disciplined traders
                  than sell certainty.
                </p>
                <p className="reveal d2 mt-4 text-[15px] leading-relaxed text-white/85">
                  No tips. No pump groups. No guaranteed-return promises — those are red flags, and we say so plainly.
                </p>
              </div>
              <div className="lg:col-span-5 reveal d2">
                <div className="border-t border-white/[0.08]">
                  {[
                    { num: '01', title: 'Risk before returns', desc: 'Position sizing and stop-losses are the first thing we teach — and the last thing we compromise.' },
                    { num: '02', title: 'Process over predictions', desc: "If it can't be written as a rule and tested on data, it doesn't belong in your portfolio." },
                    { num: '03', title: 'Education before execution', desc: 'We make sure you understand a trade before you\'re allowed to be convinced by one.' },
                  ].map((p) => (
                    <div key={p.num} className="py-5 border-b border-white/[0.08]">
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">Principle {p.num}</p>
                      <p className="text-[15px] font-semibold mt-1.5">{p.title}</p>
                      <p className="text-[13px] text-mist mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Counters */}
            <div className="reveal mt-14 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="bg-ink px-7 py-8">
                <div className="font-serif text-[36px] md:text-[42px] text-gold leading-none">
                  <span data-count="2400">0</span><span className="text-[24px]">+</span>
                </div>
                <div className="mt-2.5 text-[11px] tracking-[0.16em] uppercase text-mist">Demat accounts guided</div>
              </div>
              <div className="bg-ink px-7 py-8">
                <div className="font-serif text-[36px] md:text-[42px] text-gold leading-none">
                  <span data-count="900">0</span><span className="text-[24px]">+</span>
                </div>
                <div className="mt-2.5 text-[11px] tracking-[0.16em] uppercase text-mist">Traders mentored</div>
              </div>
              <div className="bg-ink px-7 py-8">
                <div className="font-serif text-[36px] md:text-[42px] text-gold leading-none">
                  <span data-count="12">0</span><span className="text-[24px]">&nbsp;yrs</span>
                </div>
                <div className="mt-2.5 text-[11px] tracking-[0.16em] uppercase text-mist">Combined market experience</div>
              </div>
            </div>
          </div>
        </section>
        </LazySection>


        {/* ══════════ BLOG / INSIGHTS ══════════ */}
        <LazySection>
        <section id="blog" className="sec border-t border-white/[0.06] bg-ink2/50">
          <div className="wrap">
            <div className="reveal">
              <p className="eyebrow">07 · Insights</p>
              <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                Latest from Our <em>Desk</em>
              </h2>
              <p className="mt-4 text-mist text-[15px] leading-relaxed max-w-xl">
                Market insights, trading strategies, and updates from the SYA team.
              </p>
            </div>

            {blogPosts.length === 0 ? (
              <div className="mt-12 reveal d1">
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <BookOpen className="w-10 h-10 text-white/20 mb-4" />
                  <p className="text-[15px] text-mist">No posts yet. Check back soon for market insights from our team.</p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12 reveal d1">
                {blogPosts.map((post, i) => (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden hover:border-[#E2B15C]/30 hover:-translate-y-1 transition-all duration-300 reveal d${(i % 3) + 1} group`}
                  >
                    <div className="h-44 bg-white/[0.03] relative overflow-hidden">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-10 h-10 text-white/[0.08]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] tracking-[0.16em] uppercase font-semibold text-[#E2B15C]">{post.category}</p>
                      <h3 className="text-[17px] font-semibold text-white leading-snug line-clamp-2 mt-2 group-hover:text-[#E2B15C] transition-colors">{post.title}</h3>
                      <p className="text-[13px] text-[#98A2B8] leading-relaxed line-clamp-3 mt-2">{post.excerpt || ''}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                        <span className="text-[12px] text-[#98A2B8]">{post.author}</span>
                        <span className="text-[11px] text-[#5F6981] tnum">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {blogPosts.length > 0 && (
              <div className="mt-10 reveal d2 text-center">
                <a href="/blog" className="btn btn-ghost inline-flex">
                  View all insights
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </section>
        </LazySection>

        {/* ══════════ CONTACT & LEAD FORM ══════════ */}
        <section id="contact" className="sec border-t border-white/[0.06]">
          <div className="wrap grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
            {/* Left: contact info */}
            <div className="reveal">
              <p className="eyebrow">08 · Get in Touch</p>
              <h2 className="font-serif font-medium text-[30px] sm:text-[38px] lg:text-[42px] leading-[1.12] tracking-[-0.01em] mt-5">
                Talk to a human,<br />not a helpline.
              </h2>
              <p className="mt-4 text-mist text-[15px] leading-relaxed max-w-md">
                Whether you&apos;re opening your first demat account or joining the next cohort — write, call, or walk in.
                We typically respond within one business day.
              </p>

              <div className="mt-10 space-y-6">
                <a href="mailto:connect@systematicyield.in" className="flex items-center gap-4 group">
                  <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-gold flex items-center justify-center group-hover:border-gold/50 transition-colors"><Mail className="w-[18px] h-[18px]" /></span>
                  <span><span className="block text-[10.5px] tracking-[0.16em] uppercase text-mist font-semibold">Email</span><span className="block text-[14.5px] mt-0.5 group-hover:text-gold transition-colors">connect@systematicyield.in</span></span>
                </a>
                <a href="tel:+919829012345" className="flex items-center gap-4 group">
                  {/* TODO: Replace with actual business phone number */}
                  <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-gold flex items-center justify-center group-hover:border-gold/50 transition-colors"><Phone className="w-[18px] h-[18px]" /></span>
                  <span><span className="block text-[10.5px] tracking-[0.16em] uppercase text-mist font-semibold">Phone</span><span className="block text-[14.5px] mt-0.5 tnum group-hover:text-gold transition-colors">+91 98290 12345</span></span>
                </a>
                <a href="https://wa.me/919829012345?text=Hi%20SYA%20team%2C%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more." target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-[#25D366] flex items-center justify-center group-hover:border-[#25D366]/50 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  </span>
                  <span><span className="block text-[10.5px] tracking-[0.16em] uppercase text-mist font-semibold">WhatsApp</span><span className="block text-[14.5px] mt-0.5 group-hover:text-[#25D366] transition-colors">+91 98290 12345</span></span>
                </a>
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-gold flex items-center justify-center"><MapPin className="w-[18px] h-[18px]" /></span>
                  <span><span className="block text-[10.5px] tracking-[0.16em] uppercase text-mist font-semibold">Office</span><span className="block text-[14.5px] mt-0.5 leading-snug">2nd Floor, Landmark Tower, Tonk Road,<br />Jaipur, Rajasthan 302015 · <a href="https://maps.google.com/?q=Landmark+Tower+Tonk+Road+Jaipur" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Visits by appointment</a></span></span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 shrink-0 rounded-lg border border-white/10 text-gold flex items-center justify-center"><Clock className="w-[18px] h-[18px]" /></span>
                  <span><span className="block text-[10.5px] tracking-[0.16em] uppercase text-mist font-semibold">Hours</span><span className="block text-[14.5px] mt-0.5">Monday – Saturday · 9:30 AM – 6:30 PM IST</span></span>
                </div>
              </div>

              <div className="mt-10 border-l-2 border-gold/60 pl-5">
                <p className="text-[13px] text-mist leading-relaxed">
                  Opening an account? Keep your <span className="text-white">PAN, Aadhaar and a cancelled cheque</span> handy —
                  paperless onboarding takes about 15 minutes over a call.
                </p>
              </div>
            </div>

            {/* Right: lead form */}
            <div className="reveal d1">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                {!formSubmitted ? (
                  <div id="formWrap">
                    <h3 className="font-serif font-medium text-[22px]">Request a callback</h3>
                    <p className="text-[12px] text-mist mt-1.5">Tell us a little about yourself — fields marked * are required.</p>

                    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="field">
                          <label htmlFor="fName" className="f-label">Full Name *</label>
                          <input
                            ref={fNameRef}
                            id="fName"
                            type="text"
                            className={`f-input ${formErrors.name ? 'err' : ''}`}
                            placeholder="e.g. Rohan Sharma"
                            autoComplete="name"
                            onInput={() => { setErr('name', null); trackFormInput(); }}
                          />
                          <p className={`${formErrors.name ? '' : 'hidden'} text-[11.5px] text-down mt-1.5`}>{formErrors.name || ''}</p>
                        </div>
                        <div className="field">
                          <label htmlFor="fPhone" className="f-label">Phone Number *</label>
                          <input
                            ref={fPhoneRef}
                            id="fPhone"
                            type="tel"
                            inputMode="tel"
                            className={`f-input tnum ${formErrors.phone ? 'err' : ''}`}
                            placeholder="10-digit mobile"
                            autoComplete="tel"
                            onInput={() => { setErr('phone', null); trackFormInput(); }}
                          />
                          <p className={`${formErrors.phone ? '' : 'hidden'} text-[11.5px] text-down mt-1.5`}>{formErrors.phone || ''}</p>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="fEmail" className="f-label">Email *</label>
                        <input
                          ref={fEmailRef}
                          id="fEmail"
                          type="email"
                          className={`f-input ${formErrors.email ? 'err' : ''}`}
                          placeholder="you@example.com"
                          autoComplete="email"
                          onInput={() => { setErr('email', null); trackFormInput(); }}
                        />
                        <p className={`${formErrors.email ? '' : 'hidden'} text-[11.5px] text-down mt-1.5`}>{formErrors.email || ''}</p>
                      </div>
                      <div className="field">
                        <label htmlFor="fInterest" className="f-label">Interested In: *</label>
                        <div className="relative">
                          <select
                            ref={fInterestRef}
                            id="fInterest"
                            className={`f-input appearance-none pr-10 ${selectFlash ? 'sel-flash' : ''} ${formErrors.interest ? 'err' : ''}`}
                            onChange={() => { setErr('interest', null); trackFormInput(); }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select an option</option>
                            <option value="account">Opening a Demat &amp; Trading Account</option>
                            <option value="courses">Stock Market Education Programs</option>
                            <option value="both">Both — Account + Courses</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                        <p className={`${formErrors.interest ? '' : 'hidden'} text-[11.5px] text-down mt-1.5`}>{formErrors.interest || ''}</p>
                      </div>
                      <div className="field">
                        <label htmlFor="fMsg" className="f-label">Message <span className="normal-case tracking-normal text-white/35">(optional)</span></label>
                        <textarea
                          id="fMsg"
                          rows={3}
                          className="f-input resize-none"
                          placeholder="Anything specific you'd like to ask?"
                          onInput={trackFormInput}
                        />
                      </div>

                      <p className="text-[11px] text-white/40 leading-relaxed">
                        By submitting, you authorize Systematic Yield Analysts to contact you via call, WhatsApp or email
                        regarding our services. We never share your details with third parties.
                      </p>

                      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                        <span>{submitting ? 'Submitting…' : 'Submit Inquiry'}</span> {!submitting && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div id="formSuccess" className="text-center py-10">
                    <span className="mx-auto w-14 h-14 rounded-full border border-up/40 bg-up/10 flex items-center justify-center text-up">
                      <CheckCircle2 className="w-7 h-7" />
                    </span>
                    <h4 className="font-serif font-medium text-[24px] mt-5">Inquiry received.</h4>
                    <p className="text-[13.5px] text-mist mt-2.5 leading-relaxed max-w-sm mx-auto">
                      Thank you, <span className="text-white">{submitterName}</span>. Our team will reach out within one business day.
                      {submittedInterest !== 'courses' && (
                        <>
                          {' '}The Angel One eKYC page should open automatically — if not,{' '}
                          <a href="https://angelone.in/?ref=systematicyield" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">click here to start onboarding</a>.
                        </>
                      )}
                    </p>
                    <button
                      onClick={resetForm}
                      className="btn btn-ghost mt-7 !py-2.5 !text-[13px]"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════ REGULATORY FOOTER ══════════ */}
      <footer className="border-t border-white/[0.08] bg-[#060910] mt-auto">
        <div className="wrap py-14 md:py-16">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <a href="#home" className="flex items-center gap-3">
                <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
                  <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="7" fill="none" stroke="#E2B15C" strokeWidth="1.4" opacity=".8" />
                  <path d="M8 22 L13 16 L17 19 L24 10" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="24" cy="10" r="2.3" fill="#E2B15C" />
                </svg>
                <span className="leading-tight">
                  <span className="block text-[15px] font-semibold tracking-tight">Systematic Yield</span>
                  <span className="block text-[9px] font-medium tracking-[0.24em] text-mist uppercase">Analysts · Angel One Partner</span>
                </span>
              </a>
              <p className="text-[13px] text-mist leading-relaxed mt-5 max-w-sm">
                An Angel One Authorized Partner desk and stock market academy based in Jaipur —
                helping investors trade with structure, not sentiment.
              </p>
              {/* TODO: Replace with actual business phone number */}
              <p className="text-[12px] text-white/40 mt-4 tnum">+91 98290 12345 · connect@systematicyield.in</p>
            </div>

            <div className="md:col-span-3">
              <p className="f-label">Explore</p>
              <div className="flex flex-col gap-3 mt-2 text-[13.5px]">
                {navLinks.map((id) => (
                  <a key={id} href={`#${id}`} className="text-mist hover:text-gold transition-colors w-fit">
                    {navLabels[id]}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="f-label">Programs</p>
              <div className="flex flex-col gap-3 mt-2 text-[13.5px]">
                {[
                  { label: 'Beginner to Pro: Stock Market Basics', interest: 'courses' },
                  { label: 'Advanced Options & Derivatives Trading', interest: 'courses' },
                  { label: 'Quantitative & Algo Trading Mastery', interest: 'courses' },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleInterest(p.interest, p.label)}
                    className="text-mist hover:text-gold transition-colors text-left w-fit"
                  >
                    {p.label}
                  </button>
                ))}
                <a href="#demat" className="text-mist hover:text-gold transition-colors w-fit">Angel One Pricing →</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12.5px] text-white/45">
            <p>© {year} Systematic Yield Analysts Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => { setModalKey('privacy'); setModalOpen(true); }} className="hover:text-gold transition-colors">Privacy Policy</button>
              <button onClick={() => { setModalKey('terms'); setModalOpen(true); }} className="hover:text-gold transition-colors">Terms &amp; Conditions</button>
            </div>
          </div>

          {/* SEBI Compliant Disclosures */}
          <div className="sebi-disclosure">
            <p><strong>SEBI Registration and Governance:</strong> Systematic Yield Analysts Pvt. Ltd. operates as an Authorized Partner (sub-broker) of Angel One Limited (SEBI Reg. No. INZ000161534), a stock broker registered with the Securities and Exchange Board of India and a member of NSE, BSE, and MCX. Investment in the securities market carries inherent market risk. All investors are advised to read the KYC documents, Risk Disclosure Documents, and the Do&apos;s and Don&apos;ts prescribed by SEBI before making any investment decisions.</p>
            <p><strong>Disclaimer on Education Programs:</strong> The courses offered by Systematic Yield Analysts are educational in nature and are not investment advisory services. Course content is designed to enhance knowledge and understanding of financial markets and does not constitute a recommendation to buy, sell, or hold any security. No course guarantees any specific trading outcome or return. Past performance of any trading strategy, backtest result, or mentor track record discussed during the program is not indicative of future results.</p>
            <p><strong>Derivatives and Leveraged Products:</strong> Derivatives trading, including futures and options, involves substantial risk of loss and is not suitable for every investor. The use of leverage in derivative transactions can result in losses exceeding the initial margin deposit. Investors should only trade in derivatives if they fully understand the risks involved.</p>
            <p><strong>No Guaranteed Returns:</strong> Systematic Yield Analysts, its directors, employees, or mentors do not offer, promise, or guarantee any fixed or minimum returns on any investment or trading activity. Any person or entity offering guaranteed returns in the securities market is in violation of SEBI guidelines and should be reported to SEBI at <a href="https://scores.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">scores.sebi.gov.in</a>.</p>
            <p><strong>Grievance Redressal:</strong> For any complaint against the broker (Angel One), you may reach out to the <a href="https://smartodr.in/login" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">SMART ODR Portal</a> or SEBI SCORES portal. For complaints regarding our services, please email connect@systematicyield.in.</p>
            <p className="text-white/40">Angel One Limited · Member NSE · BSE · MCX · SEBI Reg. No. INZ000161534 · CIN: U74999RJ2008PLC026458 · Office: 2nd Floor, Landmark Tower, Tonk Road, Jaipur, Rajasthan 302015</p>
          </div>
        </div>
      </footer>

      {/* ══════════ LEGAL MODAL ══════════ */}
      {modalOpen && (
        <div
          id="modal"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-xl border border-white/10 bg-ink2 shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <h3 className="font-serif font-medium text-[19px]">{LEGAL[modalKey].t}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-md border border-white/10 text-mist hover:text-white hover:border-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="p-6 text-[13.5px] text-mist leading-relaxed space-y-3 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: LEGAL[modalKey].b }}
            />
          </div>
        </div>
      )}

      {/* Toast stack */}
      <div id="toasts" className="fixed bottom-6 right-5 z-[90] flex flex-col gap-2.5 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>

      {/* Social Proof Notification */}
      {socialProof && (
        <div className="social-proof-toast visible" role="status" aria-live="polite">
          <span className="sp-check"><CheckCircle2 className="w-3.5 h-3.5" /></span>
          <span className="sp-text">
            <span className="font-semibold text-white">{socialProof.name}</span>{' '}
            <span className="text-mist">from {socialProof.loc} {socialProof.action} {'·'} {socialProof.mins} min ago</span>
          </span>
        </div>
      )}

      {/* Exit-Intent Popup */}
      {exitOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Special offer">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setExitOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-gold/30 bg-ink2 shadow-2xl shadow-black/70 p-8 text-center">
            <button onClick={() => setExitOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-mist hover:text-white hover:border-white/30 transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto w-14 h-14 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center text-gold mb-5">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-medium text-[24px] leading-snug">Wait - before you go.</h3>
            <p className="text-[14px] text-mist mt-3 leading-relaxed">
              Most investors lose money because they start without a plan. Let us help you build one.
            </p>
            <div className="flex flex-col gap-3 mt-7">
              <button onClick={() => { setExitOpen(false); handleInterest('both', 'Account + Course Package'); }} className="btn btn-primary w-full">
                Open Account + Get Course Access <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => { setExitOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn btn-ghost w-full">
                Just take me to the form
              </button>
            </div>
            <p className="text-[11px] text-white/30 mt-5">Zero commitment. No spam. Talk to a real human first.</p>
          </div>
        </div>
      )}

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion.current ? 'auto' : 'smooth' })}
        className={`btt-btn ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919829012345?text=Hi%20SYA%20team%2C%20I%20came%20across%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
      </a>

      {/* Sticky Mobile CTA Bar */}
      <div className={`mobile-cta-bar ${showMobileCta ? 'visible' : ''}`}>
        <button
          onClick={() => handleInterest('account', 'Demat account onboarding')}
          className="btn btn-primary flex-1 !py-3 !text-[13px]"
        >
          Open Demat Account
        </button>
        <a
          href="#contact"
          onClick={() => setMobileOpen(false)}
          className="btn btn-ghost flex-1 !py-3 !text-[13px]"
        >
          Enquire Now
        </a>
      </div>

      {/* Cookie Consent Banner */}
      {cookieConsent === null && (
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
          <div className="cookie-banner-inner">
            <Cookie className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <p className="text-[13px] text-mist leading-relaxed">
              We use essential browser storage (localStorage) to save your form progress and preferences. No third-party tracking cookies are active.{' '}
              <button onClick={() => { setModalKey('privacy'); setModalOpen(true); }} className="text-gold hover:underline">Learn more</button>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleCookieConsent('declined')}
                className="btn btn-ghost !py-2 !px-4 !text-[12px]"
              >
                Decline
              </button>
              <button
                onClick={() => handleCookieConsent('accepted')}
                className="btn btn-primary !py-2 !px-4 !text-[12px]"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════ Sub-components ═══════════════ */

function ToastItem({ toast: t }: { toast: { id: number; msg: string; ok: boolean } }) {
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.querySelector(`[data-toast-id="${t.id}"]`);
      el?.classList.add('show');
    }));
  }, [t.id]);

  return (
    <div data-toast-id={t.id} className="toast-item">
      <span className={`mt-0.5 shrink-0 ${t.ok ? 'text-up' : 'text-down'}`}>
        {t.ok ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.8 10A10 10 0 1 1 17 3.34" /><path d="m9 11 3 3L22 4" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        )}
      </span>
      <span className="text-[13.5px] text-white/85 leading-snug">{t.msg}</span>
    </div>
  );
}

interface ChartSVGProps {
  chartRef: React.RefObject<SVGSVGElement | null>;
  gGridRef: React.RefObject<SVGGElement | null>;
  gCandlesRef: React.RefObject<SVGGElement | null>;
  gOverlayRef: React.RefObject<SVGGElement | null>;
  gXhairRef: React.RefObject<SVGGElement | null>;
  xVRef: React.RefObject<SVGLineElement | null>;
  xHRef: React.RefObject<SVGLineElement | null>;
  xPRRef: React.RefObject<SVGRectElement | null>;
  xPTRef: React.RefObject<SVGTextElement | null>;
  xTRRef: React.RefObject<SVGRectElement | null>;
  xTTRef: React.RefObject<SVGTextElement | null>;
  getChartGeom: () => { step: number; min: number; max: number; n: number };
  yOf: (v: number) => number;
  vOf: (y: number) => number;
  xOf: (i: number) => number;
  fmtP: (v: number) => string;
  timeOf: (i: number) => string;
}

function ChartSVG({
  chartRef, gGridRef, gCandlesRef, gOverlayRef, gXhairRef,
  xVRef, xHRef, xPRRef, xPTRef, xTRRef, xTTRef,
  getChartGeom, yOf, vOf, xOf, fmtP, timeOf,
}: ChartSVGProps) {
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = chartRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * 560;
    const vy = ((e.clientY - r.top) / r.height) * 250;
    const { step, n } = getChartGeom();
    if (vx < 6 || vx > 560 - 58 || vy < 12 || vy > 250 - 24) {
      if (gXhairRef.current) gXhairRef.current.style.display = 'none';
      return;
    }
    const i = Math.max(0, Math.min(n - 1, Math.floor((vx - 6) / step)));
    const x = xOf(i);
    if (xVRef.current) { xVRef.current.setAttribute('x1', String(x)); xVRef.current.setAttribute('x2', String(x)); }
    if (xHRef.current) { xHRef.current.setAttribute('y1', String(vy)); xHRef.current.setAttribute('y2', String(vy)); }
    if (xPRRef.current) { xPRRef.current.setAttribute('x', String(560 - 58 + 2)); xPRRef.current.setAttribute('y', String(vy - 8)); }
    if (xPTRef.current) { xPTRef.current.setAttribute('x', String(560 - 58 + 28)); xPTRef.current.setAttribute('y', String(vy + 3.5)); xPTRef.current.textContent = fmtP(vOf(vy)); }
    if (xTRRef.current) { xTRRef.current.setAttribute('x', String(x - 20)); xTRRef.current.setAttribute('y', String(250 - 18)); }
    if (xTTRef.current) { xTTRef.current.setAttribute('x', String(x)); xTTRef.current.setAttribute('y', String(250 - 7.5)); xTTRef.current.textContent = timeOf(i); }
    if (gXhairRef.current) gXhairRef.current.style.display = '';
  };

  const handlePointerLeave = () => {
    if (gXhairRef.current) gXhairRef.current.style.display = 'none';
  };

  return (
    <svg
      ref={chartRef}
      viewBox="0 0 560 250"
      className="block w-full h-auto cursor-crosshair touch-pan-y select-none"
      aria-label="Live candlestick chart (illustrative data)"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <g ref={gGridRef} />
      <g ref={gCandlesRef} />
      <g ref={gOverlayRef} />
      <g ref={gXhairRef} pointerEvents="none" style={{ display: 'none' }}>
        <line ref={xVRef} y1={12} y2={226} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 3" />
        <line ref={xHRef} x1={6} x2={502} stroke="rgba(255,255,255,0.35)" strokeDasharray="2 3" />
        <g>
          <rect ref={xPRRef} width={52} height={16} rx={3} fill="#16203A" stroke="rgba(226,177,92,0.5)" strokeWidth={0.5} />
          <text ref={xPTRef} fontSize={9.5} fontWeight="600" fill="#E2B15C" textAnchor="middle" />
        </g>
        <g>
          <rect ref={xTRRef} width={40} height={15} rx={3} fill="#16203A" />
          <text ref={xTTRef} fontSize={9} fill="#C6CDDB" textAnchor="middle" />
        </g>
      </g>
    </svg>
  );
}
