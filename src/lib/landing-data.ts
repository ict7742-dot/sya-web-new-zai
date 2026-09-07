/**
 * Landing page data, types, and browser-storage utilities.
 *
 * Extracted from the monolithic `src/app/page.tsx` to reduce file size and
 * improve maintainability. This module is pure TypeScript — no React — so it
 * can be imported by both client and server code.
 */

/* ═══════════════ UTM & form abandonment ═══════════════ */

export interface UtmData {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  landingPage: string;
}

const EMPTY_UTM: UtmData = {
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
  landingPage: '',
};

export function captureUtm(): UtmData {
  if (typeof window === 'undefined') return EMPTY_UTM;
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

export function getStoredUtm(): UtmData {
  if (typeof window === 'undefined') return EMPTY_UTM;
  try {
    const raw = sessionStorage.getItem('sya_utm');
    if (raw) return JSON.parse(raw) as UtmData;
  } catch {
    /* ignore */
  }
  return { ...EMPTY_UTM, landingPage: window.location.href.split('?')[0] };
}

/* ── Form abandonment — saves partial form data to localStorage ── */

const ABANDON_KEY = 'sya_form_abandon';

export function saveAbandonment(data: Record<string, string>) {
  try {
    localStorage.setItem(ABANDON_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch {
    /* ignore */
  }
}

export function clearAbandonment() {
  try {
    localStorage.removeItem(ABANDON_KEY);
  } catch {
    /* ignore */
  }
}

export function loadAbandonment(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(ABANDON_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Only restore if less than 7 days old
    const age = Date.now() - new Date(data.savedAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) {
      clearAbandonment();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/* ═══════════════ Chart types & data ═══════════════ */

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface SymbolData {
  sym: string;
  seed: number;
  start: number;
  vol: number;
  dec: number;
}

export interface SeriesData {
  candles: Candle[];
  prevClose: number;
  volM: number;
  tickCount: number;
}

export interface TickerItem {
  name: string;
  price: number;
  change: number;
}

export const SYMBOLS: SymbolData[] = [
  { sym: 'NIFTY 50', seed: 7, start: 24850.4, vol: 0.0011, dec: 2 },
  { sym: 'BANK NIFTY', seed: 23, start: 52340.2, vol: 0.0013, dec: 2 },
  { sym: 'RELIANCE', seed: 11, start: 1418.6, vol: 0.0016, dec: 2 },
];

export const INITIAL_TICKERS: TickerItem[] = [
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

/* ═══════════════ Content data ═══════════════ */

export interface Testimonial {
  name: string;
  initials: string;
  role: string;
  rating: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Rohit Sharma', initials: 'RS', role: 'Options Trader · Batch 2024', rating: 5, text: 'The options course completely changed how I approach the markets. Before SYA, I was gambling with naked buys. Now I understand Greeks, position sizing, and risk management. My drawdowns dropped by 60% in the first quarter after the program.' },
  { name: 'Priya Mehta', initials: 'PM', role: 'Demat Client · since 2022', rating: 5, text: 'What I appreciate most is the honesty. No guaranteed-return promises, no pressure to overtrade. My partner at SYA actually told me to hold my mutual funds instead of churning them. That kind of integrity is rare in this industry.' },
  { name: 'Amit Jain', initials: 'AJ', role: 'Algo Student · Batch 2024', rating: 5, text: 'I came in knowing zero Python. Ten weeks later, I had a working mean-reversion strategy backtested on five years of NIFTY data. The API lab sessions were hands-on and the mentors actually trade what they teach.' },
  { name: 'Kavita Joshi', initials: 'KJ', role: 'Beginner Program · Batch 2023', rating: 4, text: 'As a complete beginner, I was nervous about joining. But the cohort size was small, the Hinglish instruction made it easy, and the lifetime access to recordings means I can revisit concepts whenever I need to. Highly recommend for anyone starting out.' },
  { name: 'Vikram Singh', initials: 'VS', role: 'F&O Trader · Demat Client', rating: 5, text: 'The zero brokerage on delivery is great, but what really matters is having someone local who picks up the phone. When the Adani crash happened, my SYA contact called me proactively to discuss my positions. That level of service is worth more than any brokerage savings.' },
  { name: 'Sneha Agarwal', initials: 'SA', role: 'Advanced Options · Batch 2024', rating: 5, text: 'The live market sessions during actual trading hours were a game-changer. Watching the mentor build and adjust an iron condor in real-time, explaining every adjustment — you cannot get that from YouTube videos. Worth every rupee.' },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { q: 'How do I open a Demat & Trading account through SYA?', a: 'Fill out the inquiry form above or WhatsApp us. Our team will guide you through the paperless e-KYC process. You will need your PAN card, Aadhaar, and a cancelled cheque or bank statement. Most accounts are trade-ready within 24 hours.' },
  { q: 'What brokerage charges apply?', a: 'Equity delivery trades are at zero brokerage. Intraday equity and F&O are charged at a flat ₹20 per executed order (or 0.03% of turnover, whichever is lower). Statutory charges like STT, transaction charges, GST, and SEBI turnover fees apply as per exchange norms.' },
  { q: 'Do I need prior trading experience to join a course?', a: 'Not at all. Our Foundation program is designed for people with zero market knowledge. We start from what a stock exchange is and build up to creating your own trading plan. The only prerequisite is curiosity.' },
  { q: 'Are the courses conducted online or in person?', a: 'Both. All programs are conducted live on Zoom during market hours, and we also have a Jaipur classroom option. Every session is recorded with lifetime access.' },
  { q: 'What is the relationship between SYA and Angel One?', a: 'Systematic Yield Analysts Pvt. Ltd. is an Authorized Partner (sub-broker) of Angel One Limited. Your trading account is directly with Angel One, a SEBI-registered stock broker (INZ000161534) and member of NSE, BSE, and MCX.' },
  { q: 'Do you guarantee returns or provide stock tips?', a: 'Absolutely not. SEBI regulations prohibit guaranteed-return promises. We teach process-based, risk-managed trading. Anyone offering guaranteed returns in the stock market is violating SEBI guidelines.' },
  { q: 'Is my money safe with Angel One?', a: 'Yes. Angel One is a publicly listed company regulated by SEBI. All client funds are held in segregated bank accounts as mandated by SEBI. Securities are held in dematerialized form with NSDL/CDSL.' },
  { q: 'Can I switch from my current broker to Angel One through SYA?', a: 'Yes. We can help you initiate the account transfer process. The process typically takes 5-7 business days. Your new account can be active for fresh trades within 24 hours.' },
];

export interface SocialProof {
  name: string;
  loc: string;
  action: string;
  mins: number;
}

export const SOCIAL_PROOFS: SocialProof[] = [
  { name: 'Rahul', loc: 'Vaishali Nagar, Jaipur', action: 'opened a Demat account', mins: 3 },
  { name: 'Priya', loc: 'Malviya Nagar', action: 'enrolled in Advanced Options', mins: 7 },
  { name: 'Amit', loc: 'Mansarovar, Jaipur', action: 'completed onboarding', mins: 12 },
  { name: 'Kavita', loc: 'C-Scheme, Jaipur', action: 'joined the Foundation batch', mins: 18 },
  { name: 'Vikram', loc: 'Tonk Road', action: 'opened an account', mins: 24 },
  { name: 'Sneha', loc: 'Jagatpura, Jaipur', action: 'enrolled in Algo Trading', mins: 31 },
  { name: 'Deepak', loc: 'Raja Park', action: 'transferred from Zerodha', mins: 38 },
  { name: 'Neha', loc: 'Bani Park, Jaipur', action: 'started the Options course', mins: 45 },
];

export interface Curriculum {
  weeks: string;
  topics: string[];
  outcomes: string[];
}

export const CURRICULUM: Record<string, Curriculum> = {
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
      "Analyze a company's fundamentals before buying",
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

export interface LegalDoc {
  t: string;
  b: string;
}

export const LEGAL: Record<string, LegalDoc> = {
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
