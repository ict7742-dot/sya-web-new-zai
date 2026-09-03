import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://systematicyield.in'),
  title: 'Systematic Yield Analysts — Angel One Authorized Partner & Stock Market Academy, Jaipur',
  description:
    'Open a Demat & Trading account with Angel One through Systematic Yield Analysts, Jaipur. Zero brokerage on delivery, flat ₹20 F&O. Learn stock market trading with NISM-certified mentors. SEBI-regulated broking partner.',
  keywords:
    'Angel One partner Jaipur, demat account Jaipur, stock market course Jaipur, options trading course, algo trading, SEBI registered broker, zero brokerage delivery, systematic yield analysts',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23070B14'/%3E%3Cpath d='M8 22 L13 16 L17 19 L24 10' stroke='%23E2B15C' stroke-width='2.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
    apple: "/icon-192.png",
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#E2B15C',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#070B14',
  },
  openGraph: {
    title: 'Systematic Yield Analysts — Angel One Authorized Partner & Stock Market Academy, Jaipur',
    description:
      'Open a Demat account with zero delivery brokerage or join our expert-led stock market courses. 2400+ accounts guided. SEBI-regulated Angel One partner in Jaipur.',
    siteName: 'Systematic Yield Analysts',
    type: 'website',
    locale: 'en_IN',
    url: 'https://systematicyield.in',
    images: [
      {
        url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#070B14"/><rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="rgba(226,177,92,0.25)" stroke-width="1.5"/><text x="600" y="260" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="700" fill="#E8EBF2">Systematic Yield Analysts</text><text x="600" y="310" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#98A2B8">Angel One Authorized Partner · Stock Market Academy · Jaipur</text><path d="M500 420 L560 370 L590 390 L660 340" stroke="#E2B15C" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="660" cy="340" r="6" fill="#E2B15C"/></svg>'),
        width: 1200,
        height: 630,
        alt: 'Systematic Yield Analysts — Angel One Authorized Partner & Stock Market Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Systematic Yield Analysts — Angel One Authorized Partner & Stock Market Academy, Jaipur',
    description:
      'Open a Demat account with zero delivery brokerage or join expert-led stock market courses. SEBI-regulated Angel One partner in Jaipur.',
  },
  alternates: {
    canonical: 'https://systematicyield.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'FinancialService',
                  '@id': 'https://systematicyield.in/#organization',
                  name: 'Systematic Yield Analysts Pvt. Ltd.',
                  alternateName: 'SYA',
                  url: 'https://systematicyield.in',
                  logo: 'https://systematicyield.in/logo.png',
                  description: 'Angel One Authorized Partner and stock market education academy in Jaipur, Rajasthan.',
                  telephone: '+91-98290-12345',
                  email: 'connect@systematicyield.in',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '2nd Floor, Landmark Tower, Tonk Road',
                    addressLocality: 'Jaipur',
                    addressRegion: 'Rajasthan',
                    postalCode: '302015',
                    addressCountry: 'IN',
                  },
                  geo: { '@type': 'GeoCoordinates', latitude: 26.9124, longitude: 75.7873 },
                  openingHoursSpecification: {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    opens: '09:30',
                    closes: '18:30',
                  },
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '180', bestRating: '5' },
                  areaServed: { '@type': 'City', name: 'Jaipur' },
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Broking & Education Services',
                    itemListElement: [
                      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Demat & Trading Account Opening', description: 'Paperless e-KYC account opening through Angel One. Zero brokerage on equity delivery, flat ₹20 on intraday & F&O.' } },
                      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Portfolio Guidance', description: 'Personalized quarterly portfolio review with a dedicated partner.' } },
                    ],
                  },
                },
                {
                  '@type': 'Course',
                  name: 'Beginner to Pro: Stock Market Basics',
                  description: 'From your first candlestick to a complete trading plan — the essentials of markets, instruments and risk, taught without jargon or hype. 6 weeks, live online + Jaipur classroom.',
                  provider: { '@id': 'https://systematicyield.in/#organization' },
                  educationalLevel: 'Beginner',
                  inLanguage: 'en-IN',
                  coursePrerequisites: 'No prior experience required',
                },
                {
                  '@type': 'Course',
                  name: 'Advanced Options & Derivatives Trading',
                  description: 'Greeks, spreads and position sizing — taught on live markets. Learn to build, adjust and exit option structures with institutional discipline. 8 weeks, live market-hour sessions.',
                  provider: { '@id': 'https://systematicyield.in/#organization' },
                  educationalLevel: 'Advanced',
                  inLanguage: 'en-IN',
                },
                {
                  '@type': 'Course',
                  name: 'Quantitative & Algo Trading Mastery',
                  description: 'Backtest, refine and deploy rule-based strategies with Python and Angel One SmartAPI. No prior coding experience assumed. 10 weeks, includes live API lab.',
                  provider: { '@id': 'https://systematicyield.in/#organization' },
                  educationalLevel: 'Professional',
                  inLanguage: 'en-IN',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    { '@type': 'Question', name: 'How do I open a Demat & Trading account through SYA?', acceptedAnswer: { '@type': 'Answer', text: 'Fill out the inquiry form above or WhatsApp us. Our team will guide you through the paperless e-KYC process. You will need your PAN card, Aadhaar, and a cancelled cheque or bank statement. Most accounts are trade-ready within 24 hours.' } },
                    { '@type': 'Question', name: 'What brokerage charges apply?', acceptedAnswer: { '@type': 'Answer', text: 'Equity delivery trades are at zero brokerage. Intraday equity and F&O are charged at a flat ₹20 per executed order (or 0.03% of turnover, whichever is lower). Statutory charges like STT, transaction charges, GST, and SEBI turnover fees apply as per exchange norms.' } },
                    { '@type': 'Question', name: 'Do I need prior trading experience to join a course?', acceptedAnswer: { '@type': 'Answer', text: 'Not at all. Our Foundation program is designed for people with zero market knowledge. We start from what a stock exchange is and build up to creating your own trading plan. The only prerequisite is curiosity.' } },
                    { '@type': 'Question', name: 'Are the courses conducted online or in person?', acceptedAnswer: { '@type': 'Answer', text: 'Both. All programs are conducted live on Zoom during market hours, and we also have a Jaipur classroom option. Every session is recorded with lifetime access.' } },
                    { '@type': 'Question', name: 'What is the relationship between SYA and Angel One?', acceptedAnswer: { '@type': 'Answer', text: 'Systematic Yield Analysts Pvt. Ltd. is an Authorized Partner (sub-broker) of Angel One Limited. Your trading account is directly with Angel One, a SEBI-registered stock broker (INZ000161534) and member of NSE, BSE, and MCX.' } },
                    { '@type': 'Question', name: 'Do you guarantee returns or provide stock tips?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely not. SEBI regulations prohibit guaranteed-return promises. We teach process-based, risk-managed trading. Anyone offering guaranteed returns in the stock market is violating SEBI guidelines.' } },
                    { '@type': 'Question', name: 'Is my money safe with Angel One?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Angel One is a publicly listed company regulated by SEBI. All client funds are held in segregated bank accounts as mandated by SEBI. Securities are held in dematerialized form with NSDL/CDSL.' } },
                    { '@type': 'Question', name: 'Can I switch from my current broker to Angel One through SYA?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We can help you initiate the account transfer process. The process typically takes 5-7 business days. Your new account can be active for fresh trades within 24 hours.' } },
                  ],
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
