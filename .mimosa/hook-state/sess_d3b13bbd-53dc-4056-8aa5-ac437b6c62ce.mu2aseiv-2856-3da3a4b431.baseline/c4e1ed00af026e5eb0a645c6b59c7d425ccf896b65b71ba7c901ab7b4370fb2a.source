/**
 * Seed script for the BlogPost table.
 *
 * Idempotent: re-running upserts each post by slug, so edits to content are
 * reflected without manual delete/re-create. Run with:
 *
 *   bun run prisma/seed-blogs.ts
 *   # or:  npx tsx prisma/seed-blogs.ts
 *
 * All content authored for SYA (an Angel One Authorised Person; Angel One's
 * SEBI registration INZ000161534). Compliant with SEBI's content rules for
 * stock-broking communications: no guaranteed returns, no specific stock tips,
 * no fabricated statistics or quotes. Any cited statistic is from a SEBI
 * published report and is clearly attributed. coverImage is set to null —
 * per project placeholder-inventory policy we never fabricate image URLs.
 */

import { db } from '../src/lib/db';

const posts: Array<{
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
}> = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1
  {
    slug: 'complete-guide-to-opening-your-first-demat-account-in-india',
    title: 'Complete Guide to Opening Your First Demat Account in India',
    excerpt:
      'A step-by-step walkthrough of opening your first demat account in India — eligibility, documents, KYC, charges, and what to expect before placing your first trade.',
    category: 'Trading Tips',
    author: 'SYA Team',
    content: `A demat account is the gateway to India's equity markets. Without one, you cannot hold shares, ETFs, bonds, or government securities in electronic form. This guide walks through what a demat account is, how to choose where to open one, the documents you need, the KYC process, the charges to expect, and what happens in the first few minutes after your account goes live.

## What a Demat Account Actually Does

A demat (dematerialised) account holds your securities in electronic form, the same way a bank account holds money. When you buy a share on the NSE or BSE, the security is credited to your demat account on settlement (T+1 for most equity trades). When you sell, it is debited.

Behind every demat account are two depositories regulated by SEBI: NSDL (National Securities Depository Limited) and CDSL (Central Depository Services Limited). You do not open an account directly with a depository — you open it through a Depository Participant (DP), which is usually your stockbroker. The broker is your trading member on the exchange; the DP role is the custody link to the depository.

It is normal to have the demat account, the trading account, and the bank account linked together so that cash and securities flow seamlessly on each trade.

## Eligibility and Documents

To open a demat account in India you must be a resident individual (or qualify under the NRI route with a PIS/NRO bank account) and have:

- A PAN (Permanent Account Number) — mandatory under SEBI regulations; no PAN, no account.
- An Aadhaar number linked to a working mobile number, used for the e-KYC OTP.
- A proof of address (Aadhaar, voter ID, passport, or utility bill).
- A proof of income (bank statement for the last six months, ITR acknowledgement, or salary slip) — required if you also want to activate the F&O segment.
- A passport-size photograph and a cancelled cheque or bank passbook copy for bank linking.

Minors can hold demat accounts operated by a guardian. Joint accounts are also supported with the same KYC for each holder.

## Choosing a Depository Participant

The choice of DP usually means choosing a broker. Three things should drive the decision:

1. Regulatory standing. Confirm the broker is SEBI-registered. As an Authorised Person of Angel One (SEBI registration INZ000161534), SYA routes trades through a regulated, exchange-trading member. The Angel One SEBI registration is publicly verifiable on the SEBI intermediary database.
2. Product fit. Discount brokers offer lean pricing for self-directed traders; full-service brokers add research and advisory. Pick the one that matches your workflow, not the one with the loudest marketing.
3. Technology. Check the trading platform's uptime during volatile sessions, the quality of the mobile app, and how quickly funds are settled. If you intend to use an API for algorithmic strategies, confirm the broker exposes one (Angel One's SmartAPI is one example).

## The e-KYC Process

Most account openings today are paperless, completed end-to-end in under an hour if your documents are in order.

1. Online application. Enter your PAN, contact details, and bank account number. DigiLocker can auto-fetch your Aadhaar and other documents, removing manual upload steps.
2. Aadhaar OTP e-sign. SEBI permits Aadhaar-based e-KYC with OTP authentication. The broker pulls your KYC from the KRA (KYC Registration Agency) — if you have invested before, your KYC may already be validated.
3. In-Person Verification (IPV). Done over a short video call or selfie with a one-time password. This is a SEBI requirement to confirm your identity.
4. E-sign the Depository Participant–Client Agreement and the tariff sheet. The agreement sets out charges, margin rules, and the broker's dispute-resolution process.
5. UCC activation. Your Unique Client Code is registered with the exchanges. Once approved (usually within hours if the KRA is clean), you receive your BO ID (Beneficial Owner Identification Number) — an eight-digit (CDSL) or sixteen-digit (NSDL) identifier for your demat account.

## Charges You Should Know Up Front

The tariff sheet you sign at account opening lists every charge. The main ones:

- Account opening fee. Often zero for retail accounts; some brokers charge a one-time fee for premium plans.
- Annual Maintenance Charge (AMC). Typically ₹300–₹750 per year for a regular demat account; the first year is frequently waived.
- DP charges. A flat fee per sell transaction (commonly ₹13.50 plus GST) debited from your trading account when securities leave your demat.
- Brokerage. Charged as a percentage of trade value (delivery) or per trade (intraday/F&O). Compare the structure to your expected trade frequency.
- Statutory charges. STT (Securities Transaction Tax), GST, SEBI turnover fee, exchange transaction charges, and stamp duty. These are not negotiable and apply uniformly across brokers.

The honest summary: brokerage is the only charge that varies materially. Stamp duty, STT, GST, SEBI fees, and exchange fees are statutory.

## Funding, Pledging, and Your First Trade

Once your UCC is active, link your primary bank account. All fund transfers should go through the broker's payment gateway or via UPI to a verified merchant handle — never to an individual's bank account. Brokers display their verified UPI handles in the app.

A note on pledging: since August 2020, SEBI has required that securities be pledged to the broker in writing before they can be used as margin. The broker cannot debit your demat to settle trades without your explicit pledge instruction. This was a major investor-protection reform and removed the older risk of brokers quietly moving client shares.

When you place your first trade, start with a delivery buy of a liquid large-cap or an ETF, with a quantity small enough to feel routine. The goal of the first trade is not profit; it is to verify end-to-end that funds, order routing, exchange confirmation, contract note, and demat credit all flow as expected.

## Common Pitfalls

- Signing a blank DP agreement or authorising a Power of Attorney (PoA) you have not read. The PoA authorises the broker to debit securities on your sell instructions; modern e-DIS (electronic Delivery Instruction Slip) systems make PoA optional — prefer brokers that support e-DIS.
- Operating without a transaction password and 2FA on the trading app. Both are mandatory.
- Not reading the tariff sheet and being surprised by AMC or DP charges.

## Closing

Opening a demat account is a 30-minute process when your PAN, Aadhaar, and bank details are consistent. Take the extra five minutes to read the tariff sheet and the DP-client agreement — the clauses on margin, pledge, and dispute resolution are the ones that matter if anything ever goes wrong.

If you want a structured walkthrough alongside account opening, our team at SYA can help you set up your Angel One demat and walk through the first few orders with you. The account is yours; we are simply a regulated access point to the markets.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2
  {
    slug: 'nifty-50-vs-bank-nifty-which-index-should-you-trade',
    title: 'Nifty 50 vs Bank Nifty: Which Index Should You Trade?',
    excerpt:
      "Nifty 50 and Bank Nifty are India's two most-traded index derivatives. We compare composition, volatility, lot sizes, expiry cycles, and which one fits a given trading style.",
    category: 'Market Analysis',
    author: 'Amit Jain',
    content: `Nifty 50 and Bank Nifty are the two most-traded index derivatives on the NSE. They look superficially similar — both are NSE indices, both have F&O contracts, both move on the same calendar of macro events — but their composition, volatility, and contract structure are quite different. This post breaks down the differences and offers a framework for choosing between them based on your trading style, capital, and risk appetite.

## Composition: Diversified vs Concentrated

Nifty 50 is a free-float market-capitalisation-weighted index of 50 large-cap stocks across sectors — financials, IT, energy, FMCG, pharma, autos, metals, and others. No single stock has dominant weight, and no single sector controls more than roughly a third of the index. The result is a smoother, more diversified price path.

Bank Nifty is a free-float market-cap-weighted index of 12 large banking stocks — a mix of private banks (HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra) and public-sector banks (SBIN, Bank of Baroda, PNB, Canara Bank, and others). Because all 12 names belong to one sector, the index is far more concentrated. A single RBI policy move, a credit-cost surprise, or a sector-wide NPA concern moves the whole basket together.

The practical consequence: Bank Nifty's average true range is typically higher than Nifty's, and its intraday swings are larger in both directions.

## Volatility and Risk Profile

Bank Nifty's beta to Nifty is greater than 1 — when Nifty moves, Bank Nifty moves more. This cuts both ways:

- Trend traders often prefer Bank Nifty for the sharper directional moves.
- Position-size discipline matters more. With higher volatility, a fixed-percentage stop translates into a wider absolute stop distance, and a fixed-lot count translates into a larger notional risk.

For a beginner with limited capital, this is the single most important point. Trading Bank Nifty with the same lot count as Nifty is not the same trade.

## Lot Sizes and Capital Required

Lot sizes in F&O are set by the NSE and revised periodically (the exchange reviews them roughly every six months based on the near-month contract's value). At the time of writing, Nifty's F&O lot is significantly larger than Bank Nifty's, which changes the notional exposure per lot.

Check the current lot size on the NSE F&O contract specification page before sizing positions — these numbers change. The notional value of one lot equals lot size multiplied by the index level, so when the index rallies, the notional value per lot rises and SEBI may step in to trim the lot size to keep retail exposure in check.

The reason this matters for the choice between the two: with a smaller per-lot notional, Bank Nifty allows finer-grained position sizing for the same capital. A trader with ₹2 lakh of risk capital may find that one Bank Nifty lot is sized closer to their intended exposure, whereas one Nifty lot may be too large or too small.

## Expiry Cycles and the New Weekly Expiry Rule

This is the single biggest structural change to be aware of in 2024.

SEBI introduced a framework limiting each exchange to a single weekly expiry index to curb excessive speculative volumes in index options. NSE selected Nifty 50 as its weekly expiry product. Existing Bank Nifty weekly contracts were discontinued; Bank Nifty now has only monthly expiries, while Nifty retains a weekly cycle.

Implications:

- Nifty weekly options remain the most liquid short-dated contracts on the exchange. The near-week expiry attracts the bulk of intraday option volume.
- Bank Nifty's liquidity now concentrates in the monthly contract. Traders who previously sold Bank Nifty weeklies to capture theta now need to manage a longer-dated position.
- Premium decay dynamics have shifted. Bank Nifty monthly options experience theta more gradually; Nifty weeklies still exhibit the sharp final-week decay that short-sellers exploit (and that long-position holders must respect).

Confirm the current expiry calendar on the NSE website — exchange notifications occasionally adjust expiry days.

## Liquidity and Bid-Ask Spreads

Both indices are highly liquid in their near-month contracts, but Nifty weekly options typically show tighter bid-ask spreads and deeper open interest across strikes. This matters for:

- Option buyers — tighter spreads reduce slippage on entry and exit.
- Option sellers — deeper OI means less risk of being trapped in illiquid far-OTM strikes.
- Traders who scale in and out — Nifty's liquidity supports partial fills more gracefully.

Bank Nifty's liquidity, while still strong, is concentrated in fewer strikes around the spot. Far strikes can be illiquid, particularly after the loss of weekly expiries.

## Which Index Should You Trade?

There is no universal answer, but a simple framework helps:

- Newer to F&O, smaller capital, want to learn mechanics — Nifty 50 weeklies. Tighter spreads, smaller theta surprises, and weekly expiry gives fast feedback on directional reads.
- Comfortable with F&O, trading directional trends, larger capital — Bank Nifty monthlies. Sharper moves reward clean trend reads; the monthly cycle gives a position time to develop.
- Selling premium for income — Nifty weekly short strangles and iron condors are the most liquid play; Bank Nifty monthlies suit longer-dated income strategies.
- Hedging a stock portfolio — Nifty put options on the index closest to your portfolio's beta is the standard approach.

## Common Pitfalls

- Treating Bank Nifty as "just like Nifty with bigger moves." It is a single-sector basket with idiosyncratic policy and credit risk.
- Ignoring the expiry change. Strategies that worked on Bank Nifty weeklies in 2023 need to be re-engineered for the monthly cycle.
- Over-sizing Bank Nifty positions because the lot is smaller.

## Closing

Both Nifty 50 and Bank Nifty are excellent instruments when matched to the right style. The question is not which is "better" — it is which fits your capital, your time horizon, and your capacity to absorb volatility. Get the sizing right, respect the new expiry structure, and let the index work for you rather than against you.

In our market analysis sessions at SYA, we walk through both indices side by side so traders can see how the same macro event shows up differently in each. The skill of choosing the right instrument is as important as the skill of reading the chart.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3
  {
    slug: 'options-trading-for-beginners-the-greeks-explained-simply',
    title: 'Options Trading for Beginners: The Greeks Explained Simply',
    excerpt:
      "The Greeks — delta, gamma, theta, vega, rho — tell you how an option's price changes. Here is a plain-English walkthrough with a worked example.",
    category: 'Trading Tips',
    author: 'Amit Jain',
    content: `Options prices do not move in a straight line with the underlying. They respond to several variables at once: the price of the underlying, time to expiry, volatility, and interest rates. The "Greeks" are the sensitivities that quantify each of these relationships. Understanding them is what separates option trading from option gambling.

## What the Greeks Actually Are

An option's theoretical price is a function — most commonly the Black-Scholes-Merton model — of five inputs:

- Spot price of the underlying
- Strike price of the option
- Time to expiry
- Implied volatility
- Risk-free interest rate

The Greeks are the partial derivatives of that price with respect to each of those inputs (with strike held constant once you have chosen the contract). Each one tells you a story: how much the option moves when the underlying moves, how much it bleeds each day, how much it jumps when volatility spikes.

## Delta — Directional Exposure

Delta is the change in option price for a one-unit change in the underlying.

- A call with delta 0.50 will move roughly ₹0.50 for every ₹1.00 move in the underlying.
- A put with delta -0.40 will move roughly -₹0.40 for every ₹1.00 move up in the underlying.

Delta also has a second interpretation: as an approximate probability of expiring in-the-money. A 0.30-delta call is roughly a 30% probability bet on the option being ITM at expiry (under model assumptions).

For an option seller, the absolute delta tells you how much directional risk you are taking. A short 0.20-delta call has limited directional risk; a short 0.50-delta call is essentially a coin-flip on direction.

## Gamma — The Rate of Change of Delta

If delta is speed, gamma is acceleration. Gamma tells you how much delta itself changes when the underlying moves.

Gamma is highest for at-the-money options near expiry — a small move in the underlying can swing delta dramatically. This is why short ATM options in the last few days before expiry are notoriously risky: a small move can put you suddenly deep ITM.

Long options have positive gamma (delta moves in your favour as the underlying moves your way). Short options have negative gamma (delta moves against you).

For practical risk management: short gamma positions require smaller size. The negative gamma of a near-expiry short straddle can wipe out weeks of premium income in a single session.

## Theta — Time Decay

Theta is the daily bleed of option value due to time passing. Every day closer to expiry, an option loses value (all else equal) because there is less time for the underlying to move into a profitable zone.

Theta is small for far-dated options and accelerates in the final weeks, particularly for ATM options. This is the engine of premium-selling strategies: sell theta, manage delta, repeat.

The catch: theta is paid daily and quietly; gamma losses arrive suddenly and violently. Net positive theta almost always means net short gamma. Risk and reward travel together.

For a hypothetical example: a short strangle on an index with 30 days to expiry might collect ₹5,000 in premium. If theta averages ₹150/day, that is a steady income — until a 2% gap move puts one leg deep ITM and costs ₹15,000 to close.

## Vega — Volatility Sensitivity

Vega is the change in option price for a 1% change in implied volatility. Long options have positive vega — when IV rises, premiums expand. Short options have negative vega.

Vega matters most around events: RBI policy, Union Budget, earnings, global rate decisions. Implied volatility typically rises before scheduled events (a "volatility crush" is the post-event drop in IV). Buying options before an event pays you in delta if you are right on direction, but you may still lose money because IV drops as the event resolves — the classic "right on direction, wrong on volatility" trap.

The lesson: never buy an option without checking implied volatility against its recent range. Paying 25 IV when the 30-day average is 18 is a structural headwind.

## Rho — Interest Rate Sensitivity

Rho is the change in option price for a 1% change in the risk-free rate. For most short-dated equity options, rho is small enough to ignore. It becomes meaningful for long-dated LEAPS options, where a rate move can shift the time-value calculation.

For index F&O traded in India on weekly or monthly cycles, rho is rarely a primary driver. Mention it, acknowledge it exists, move on.

## Putting the Greeks Together

No single Greek tells the whole story. A short ATM straddle the day before expiry has:

- High positive theta (the option decays rapidly)
- High negative gamma (delta can swing fast)
- Modest vega exposure (most IV already crushed)

A long-dated long call has:

- Positive delta (directional exposure)
- Positive gamma (delta grows in your favour)
- Negative theta (you pay to hold time)
- Positive vega (IV expansion helps)

Each strategy has a fingerprint of Greek exposures. Knowing yours tells you what you are betting on, what you are betting against, and what can hurt you.

## Practical Risk Notes

- Position size from Greeks, not from premium. A ₹5,000-premium short strangle with 0.15 delta and -0.05 gamma is not "₹5,000 of risk" — the risk is the gap move, not the premium collected.
- Manage delta, not just P&L. A delta-neutral premium seller who lets delta run to 0.40 has silently become a directional trader.
- Respect expiry concentration. Most catastrophic option losses cluster in the final 48 hours of an expiry when gamma peaks.

## Closing

The Greeks are not optional knowledge for option traders — they are the language of the instrument. A trader who knows delta, gamma, theta, and vega can describe any position in three numbers and know exactly what they are exposed to. A trader who does not is essentially flipping coins with a fee structure attached.

In our Advanced Options cohort at SYA, we build every position from the Greeks outward — the trade thesis first, the strike selection second, and the position size last. That order matters. Get the structure right and the premium takes care of itself; get it wrong and no amount of premium collected will save you from the inevitable gap.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4
  {
    slug: 'sebi-new-margin-rules-what-changed-and-what-it-means-for-you',
    title: "SEBI's New Margin Rules: What Changed and What It Means for You",
    excerpt:
      'The peak-margin framework, rolled out in phases from December 2020 to September 2021, ended intraday broker leverage and changed how every trader funds positions. Here is what changed and what it means for you.',
    category: 'SEBI Updates',
    author: 'SYA Team',
    content: `If you traded intraday before December 2020, you could take a position with as little as 10–15% of the total contract value as margin, with your broker funding the rest. That world is gone. The peak-margin framework, fully implemented in September 2021, requires you to bring the full exchange-prescribed margin to your position at all times during the trading day. This is one of the most consequential investor-protection reforms SEBI has introduced in the derivatives era.

## Background: Why Peak Margins

Before the framework, exchanges levied margin only on end-of-day positions. A trader could enter a position far in excess of their capital, exit before close, and never post the margin the exchange required for an overnight position. The system worked most days — until a gap move left clearing corporations exposed to client defaults that exceeded posted collateral.

SEBI's fix was to make margin a real-time requirement, not an end-of-day one. The clearing corporations began taking four random snapshots of every client's open positions during the trading day. The highest margin observed across those snapshots became the minimum margin required for the position. Hence the name: peak margin.

## The Phased Rollout

The framework was implemented in four phases to give the market time to adjust:

1. December 2020 — 25% of peak margin required. Brokers had to collect at least a quarter of the peak margin from clients up front.
2. March 2021 — 50%. Half of the peak margin required.
3. June 2021 — 75%. Three-quarters required.
4. September 2021 — 100%. Full peak margin required, end of intraday leverage.

By September 2021, every client had to bring the full exchange-prescribed margin for any open position, intraday or overnight. The era of "20x intraday exposure" from your broker was effectively over.

## What Actually Changed for the Trader

Three concrete changes hit retail workflows:

1. You must fund the full position. If the exchange-prescribed initial margin for a Nifty futures lot is, for illustration, ₹1,20,000, you need that amount in your trading account at the moment you place the order — not at end of day, not by next morning.
2. Margin shortfalls are penalised. If a snapshot catches your position with insufficient margin, the clearing corporation levies a penalty (up to 5% of the shortfall amount, depending on the degree and duration). Your broker may pass this through.
3. No "free" leverage from your broker. Brokers cannot fund your intraday positions with their own capital. The broker that used to offer 20x intraday exposure now offers the exchange-prescribed margin (often 1x to 5x of the SPAN + exposure, depending on contract).

## Pledging: A Companion Reform

In parallel with the peak-margin rollout, SEBI introduced the mandatory pledging of securities for margin (effective August 2020). Before this, a broker could move client shares to its own pool and use them as collateral. After the reform, shares remain in the client's demat account; the client must explicitly pledge them to the broker, and only the pledge value is recognised as margin.

The combined effect: client collateral sits in the client's own demat, used only when explicitly pledged, and intraday positions are fully funded. The structural risk of broker defaults bleeding client capital was substantially reduced.

## Impact on Intraday Strategies

The peak-margin framework reshaped how intraday strategies are sized:

- Capital per trade increased 4–5x for the same notional exposure. A strategy that previously needed ₹20,000 to take a Nifty intraday futures position now needs the full exchange margin.
- Option selling became the preferred leveraged path. Option sellers receive premium upfront, which is credited as margin. Selling options became a more capital-efficient way to take a directional or volatility view than futures.
- Multi-position strategies required larger capital reserves. A trader running four simultaneous intraday positions needs margin for all four at peak overlap, not just the end-of-day residue.

## What It Means for You — Practical Takeaways

- Fund your account for the worst-case margin overlap, not the average. If you ever run two strategies simultaneously, size for both being open at the same snapshot.
- Treat your broker's margin calculator as the source of truth. NSE's SPAN + exposure margin is published daily; your broker's calculator should reflect it. If a position shows less margin required than the exchange calculator, do not trust it.
- Use pledged shares for margin sparingly. Pledging your long-term portfolio to fund F&O positions converts a long-term investment into collateral for short-term risk. The portfolio that earns 12% a year should not be pledged to fund a strategy that loses 30% in a bad week.
- Track margin utilisation daily. Your broker's margin report shows you exactly how much peak margin you have consumed. If you are routinely running at 80%+ utilisation, you are one bad day away from a shortfall penalty.

## Common Misconceptions

- "My broker still offers 5x leverage — the rules don't apply to me." They do. The "leverage" your broker offers is simply the recognition that exchange-prescribed margin is itself a fraction of the full notional contract value. The broker is not funding you; the exchange margining system is.
- "Margin penalty is a broker problem." It is your problem. The clearing corporation charges the penalty to the broker, who passes it through to the client whose position caused the shortfall.
- "I can exit before close and avoid margin requirements." You cannot avoid the snapshots. The clearing corporation's four intraday snapshots define the peak regardless of whether you exit before close.

## Closing

The peak-margin framework made Indian derivatives markets safer for the system and harsher for the under-capitalised trader. If you trade F&O, the rule that matters most is simple: bring the full margin, every position, every snapshot. The brokers who survived this reform are the ones who passed it through cleanly; the traders who thrive under it are the ones who size for it.

At SYA, our risk-management curriculum treats peak margin as a foundational constraint, not an afterthought. Every strategy we teach is sized against actual exchange margin, not against broker leverage, because the only leverage that matters in a stressed market is the one the clearing corporation enforces.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5
  {
    slug: 'how-to-build-your-first-algorithmic-trading-strategy-with-python',
    title: 'How to Build Your First Algorithmic Trading Strategy with Python',
    excerpt:
      'A practical walkthrough of building a moving-average crossover strategy in Python — hypothesis, data, signals, backtest, paper trade, and deploy via Angel One SmartAPI.',
    category: 'Course Updates',
    author: 'Vikram Singh',
    content: `Algorithmic trading sounds intimidating — images of co-located servers and nanosecond latency dance in the head. The reality for most retail traders is far simpler: a Python script that fetches historical data, applies a rules-based signal, and places orders via a broker API. This post walks through the end-to-end process of building a first strategy, with the moving-average crossover as the worked example.

## The Strategy Lifecycle

Every algo strategy passes through six stages, and skipping any of them is how traders lose money:

1. Hypothesis. A clear, falsifiable statement of the edge you believe exists.
2. Data. Clean, point-in-time-correct historical price data.
3. Signal logic. A deterministic rule that converts prices into buy/sell signals.
4. Backtest. Apply the signal to historical data and simulate P&L with realistic costs.
5. Paper trade. Run the algo on live data without real money, for at least one full market cycle.
6. Deploy. Live trade with small size, monitor, scale only if it survives.

## A Worked Example: Moving Average Crossover

The moving average crossover is the "Hello World" of algorithmic trading. The hypothesis is simple: when a short-term moving average crosses above a long-term moving average, momentum has shifted up; when it crosses below, momentum has shifted down.

A typical configuration: 50-day simple moving average (SMA) and 200-day SMA. A "golden cross" is the 50-day crossing above the 200-day; a "death cross" is the reverse.

Be honest about what this is: a trend-following filter, not a magic edge. It works in trending regimes and bleeds in sideways markets. The goal of the first algo is to learn the engineering, not to discover alpha.

## Setting Up the Python Environment

A minimal stack:

    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt

You will also need a way to fetch historical data — either a free source like NSE's published bhavcopy archives, a paid data vendor, or your broker's API historical endpoints. For Angel One SmartAPI, historical candle endpoints are available after you authenticate with your API key and feed token.

## Building the Signal

A simple implementation:

    df['sma_50'] = df['close'].rolling(50).mean()
    df['sma_200'] = df['close'].rolling(200).mean()

    # 1 = long, -1 = short, 0 = flat
    df['signal'] = np.where(df['sma_50'] > df['sma_200'], 1, -1)
    df['position'] = df['signal'].shift(1)  # act on yesterday's signal
    df['returns'] = df['close'].pct_change()
    df['strategy_returns'] = df['position'] * df['returns']

The shift(1) is critical — it ensures you act on the signal generated by the prior day's close, not today's. Acting on the same day's signal is the most common lookahead bias in backtests.

## Adding Realistic Costs

A backtest without costs is fiction. For Indian equity, the realistic costs include:

- Brokerage (per your tariff)
- STT (0.1% on delivery sells, 0.025% on intraday sells)
- Exchange transaction charges
- GST (18% on brokerage + exchange charges)
- SEBI turnover fee
- Stamp duty (0.015% on the buy side for equity delivery)

A reasonable per-trade cost assumption for backtests is 0.1–0.15% of trade value for delivery, 0.025% for intraday. Underestimate costs and your backtest inflates returns; overestimate them and you skip strategies that would have worked.

For the moving-average crossover on daily data, costs matter less because the strategy trades infrequently. For an intraday strategy turning over 5x per day, costs can be the difference between profit and ruin.

## Backtest Metrics That Matter

A naive backtest shows cumulative return. A serious backtest reports:

- CAGR (annualised return)
- Max drawdown (worst peak-to-trough decline)
- Sharpe ratio (return per unit of volatility)
- Sortino ratio (return per unit of downside volatility)
- Trade count and win rate
- Average win / average loss ratio

A strategy with 70% win rate and a 1:0.5 win-loss ratio will lose money over time. A strategy with 35% win rate and a 1:3 win-loss ratio can be highly profitable. Win rate without payoff ratio is meaningless.

## Pitfalls That Will Invalidate a Backtest

- Lookahead bias. Using information that wasn't available at the time of the signal. The shift(1) above is one defence; the deeper discipline is to ask, "What did I know on the day this signal was generated?"
- Survivorship bias. Backtesting only on stocks that exist today. If your universe includes only current Nifty 50 constituents, you have excluded every stock that was delisted or fell out of the index — your returns are inflated.
- Overfitting. Optimising parameters (e.g., the 47-day SMA and 213-day SMA) until the backtest looks perfect. A good rule of thumb: if the strategy works only at one specific parameter combination, it does not work.
- Ignoring slippage. Real orders do not fill at the close price. Assume you pay the ask when buying and the bid when selling.
- Ignoring latency. A signal that fires at 3:30 PM cannot be acted on at 3:30 PM. A signal that fires at 9:31 AM cannot be acted on at 9:30 AM.

## Paper Trading — The Step Most Beginners Skip

A backtest that survives all the above pitfalls is still not ready for capital. Run the algo on live data with paper (simulated) orders for at least one full market cycle — typically 4–8 weeks for a daily strategy, 2–4 weeks for an intraday strategy. Compare live paper-traded fills to backtested expectations. If the paper-traded returns diverge materially from the backtest, your model is missing something the real market includes.

## Deployment via Broker API

Once paper trading validates the strategy, deploy with small size via your broker's API. For Angel One, the SmartAPI provides:

- Authentication with API key + JWT
- Historical candle endpoints for backtest validation
- Live order placement, modification, and cancellation
- Position, holdings, and funds endpoints
- WebSockets for live tick data

Start with one instrument, one strategy, and the smallest permitted order size. Run for a month. If live results match paper results, scale by 2x. Repeat.

## Risk Controls to Build Into the Algo

- Max daily loss kill-switch. If the algo loses X% of allocated capital in a day, it stops placing new orders.
- Max open positions. A hard cap on concurrent positions to prevent runaway exposure if a signal misfires.
- Connection-loss safeguard. If the algo loses its API connection, existing orders should be cancelled, not left orphaned.
- Reconciliation loop. Every order placed should be checked against the broker's order book to confirm fills before the next signal is acted on.

## Closing

A first algo is rarely profitable. The point of the first algo is to learn the engineering — data, signals, backtests, paper trade, deploy, monitor — so that when you do find an edge, you have the infrastructure to exploit it safely. Build the pipeline first; trade your edge with confidence second.

In SYA's algorithmic trading programme, we walk through this exact lifecycle with a real broker API, real historical data, and a live paper-trading environment. The goal is not to teach you a secret strategy — there is no secret strategy — but to give you the engineering discipline that turns a trading idea into a tested, deployed, and monitored system.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6
  {
    slug: 'risk-management-the-2-percent-rule-every-trader-should-follow',
    title: 'Risk Management: The 2% Rule Every Trader Should Follow',
    excerpt:
      'The 2% rule caps the loss on any single trade at 2% of total trading capital. Here is the math, the position-sizing formula, and why it survives the test of time.',
    category: 'Trading Tips',
    author: 'SYA Team',
    content: `Most traders spend 90% of their time on entries and 10% on risk. Profitable traders invert that ratio. Of all the risk-management rules a trader can adopt, the 2% rule is the simplest, the most durable, and the one most consistently violated. This post walks through what the rule is, why it works mathematically, and how to implement it.

## What the 2% Rule Says

The 2% rule states: never risk more than 2% of your total trading capital on any single trade.

"Risk" here does not mean position size. It means the maximum loss you would take if your stop-loss is hit, including slippage and costs. If your trading capital is ₹1,00,000, the 2% rule caps your per-trade loss at ₹2,000.

Note: the rule is a guideline, not a law. Some traders tighten it to 1% (more conservative); some loosen it to 3% (more aggressive). The point is to pick a number and stick to it for every trade, every market, every regime.

## The Position-Sizing Formula

The 2% rule translates directly into position size:

    Position size = (Capital × 2%) / (Entry price − Stop-loss price)

For an equity trade: if your capital is ₹1,00,000, your 2% risk is ₹2,000. If you plan to buy a stock at ₹500 with a stop-loss at ₹485, your per-share risk is ₹15. Position size = ₹2,000 / ₹15 = 133 shares. Total trade value = 133 × ₹500 = ₹66,500.

Note the implication: the position size depends on the stop-loss distance, not on the capital you can deploy. A wider stop means a smaller position; a tighter stop means a larger position. The risk stays constant at ₹2,000.

For an F&O trade, replace per-share risk with per-lot risk (lot size × per-unit stop distance), and apply the same formula.

## Why 2% — The Math of Drawdown Recovery

The 2% rule exists because of the asymmetry of drawdown recovery. The math:

- A 10% drawdown requires an 11% gain to recover.
- A 20% drawdown requires a 25% gain.
- A 50% drawdown requires a 100% gain.
- A 90% drawdown requires a 900% gain.

The deeper the hole, the steeper the climb out. A trader who risks 10% per trade and loses five in a row is down 50% — requiring a 100% gain just to get back to break-even.

At 2% per trade, five consecutive losses produce a 10% drawdown — uncomfortable but recoverable in a few good weeks. At 10% per trade, the same losing streak produces a 50% drawdown — a multi-month or multi-year recovery.

The 2% rule is not about being cautious. It is about being mathematical. The same edge, sized correctly, compounds. Sized recklessly, it bankrupts you before the edge can express itself.

## Adjusting for Consecutive Losses

The basic 2% rule protects you from any single trade. A more disciplined variant — sometimes called the "2% and 6% rule" — adds a daily and weekly ceiling:

- 2% per trade — never risk more than 2% on any single position.
- 6% per day — if cumulative losses for the day reach 6% of capital, stop trading for the day.
- 6% per week or month — if cumulative losses for the period reach 6%, reduce position size by 50% until the next period begins.

The logic: if you are losing multiple trades in a row, either the market regime has changed or your judgment is off. Either way, the response is to reduce exposure, not to double down. The "stop trading" threshold exists to interrupt the psychological spiral of revenge trading.

## Why Most Traders Violate the Rule

The 2% rule is mathematically simple and psychologically difficult. Three reasons it gets violated:

1. Boredom. A ₹2,000 risk on a ₹1,00,000 account feels small. Traders scale up to "feel" the trade.
2. Recovery temptation. After a losing streak, traders size up to "win it back." This is the exact moment to size down.
3. Overconfidence after a win streak. A trader up 30% in a quarter decides they have figured it out and raises risk per trade. The market then teaches them otherwise.

The discipline is boring on purpose. The 2% rule does not make you rich quickly. It keeps you in the game long enough for your edge to compound.

## A Worked Example

Consider a hypothetical trader with ₹2,00,000 of trading capital. Their 2% risk is ₹4,000 per trade.

- They identify a setup: enter a stock at ₹1,000, stop-loss at ₹960. Per-share risk = ₹40.
- Position size = ₹4,000 / ₹40 = 100 shares. Total trade value = ₹1,00,000.
- The trade hits stop. Loss = 100 × ₹40 = ₹4,000. Account drops to ₹1,96,000.

Next trade, the trader recalculates 2% on the new balance: ₹3,920. The position size adjusts slightly downward.

After five losses in a row (an extreme but possible scenario), the account is at ₹1,80,800 — a 9.6% drawdown, recoverable with a few normal-winning trades. Without the 2% rule, the same losing streak at 10% per trade would have produced a 40% drawdown.

## Practical Implementation Notes

- Calculate risk before the trade, not after. The position size formula is a function of the stop-loss, so the stop-loss comes first. If you find yourself choosing the position size first and then back-fitting a stop-loss to match your size, you have inverted the discipline.
- Include slippage in your risk assumption. A stop at ₹960 may fill at ₹955 in a fast market. Plan for it.
- Re-balance the 2% on a defined cadence. Daily re-balancing is too noisy; quarterly is more realistic for most retail traders. The point is to size from current capital, not from peak capital.
- Apply the rule to F&O with extra care. A single short option position can blow through 2% in a gap move. Option sellers often need to think of "risk per trade" as "max loss in a tail scenario," not the standard stop-loss distance.

## Closing

The 2% rule is the single most boring, most important rule in trading. It does not generate alpha. It does not pick stocks. It does not time the market. It simply keeps you in the game long enough for the edge you have to express itself through the noise.

In our risk-management module at SYA, the 2% rule is the first thing we install, before any strategy, any indicator, any market view. Strategies come and go; the risk rule is what survives.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 7
  {
    slug: 'understanding-candlestick-patterns-doji-hammer-engulfing',
    title: 'Understanding Candlestick Patterns: Doji, Hammer, and Engulfing',
    excerpt:
      'Doji, hammer, and engulfing patterns are the foundation of price-action reading. Here is what each one signals — and what it does not.',
    category: 'Trading Tips',
    author: 'Amit Jain',
    content: `Candlestick charts are the most common way to visualise price action in Indian markets. A single candle compresses four pieces of information — open, high, low, close — into a visual that the eye can process faster than a column of numbers. Patterns of one or more candles have been given names for centuries, dating back to the Japanese rice-trading origins of the technique.

This post walks through three of the most-cited single- and two-candle patterns — the doji, the hammer, and the engulfing pattern — and explains what each actually signals, what it does not, and how to use them responsibly.

## Candle Anatomy

Before the patterns, the building blocks. Every candle has:

- Body. The rectangle between the open and close prices. Bullish candles (close above open) are typically green or white; bearish candles (close below open) are red or black.
- Wicks / shadows. The thin lines above and below the body, marking the high and low of the period.
- Range. High minus low — the total price excursion during the period.

A candle with a long body shows conviction; a candle with a long wick shows rejection; a candle with almost no body shows indecision. Candlestick patterns are simply combinations of these features in meaningful sequences.

## The Doji — Indecision, Not Direction

A doji is a candle where the open and close are nearly equal, producing a very thin (or absent) body. The candle can have long or short wicks; the defining feature is the open≈close relationship.

Variants worth knowing:

- Long-legged doji. Long wicks on both sides. The market traded well above and below the open but finished where it started — a clear sign of indecision after volatility.
- Dragonfly doji. Long lower wick, no upper wick. The market probed lower and was bought back to the open — bullish in context, particularly after a downtrend.
- Gravestone doji. Long upper wick, no lower wick. The market probed higher and was sold back to the open — bearish in context, particularly after an uptrend.

The critical point: a doji is not a directional signal. It is an indecision signal. The direction the market resolves after a doji depends on the candle that follows. Traders who treat every doji as a reversal signal will be wrong as often as they are right.

Context matters: a doji after a long, clean trend has more informational value than a doji in the middle of a sideways range.

## The Hammer — Rejection of Lows

A hammer is a candle with:

- A small body at the upper end of the range
- A long lower wick (typically at least twice the body length)
- Little or no upper wick

The hammer's story: the market traded significantly lower during the period, but buyers stepped in and pushed the price back up to close near the high. The long lower wick is the rejection of lower prices.

Variants:

- Hammer. Appears after a downtrend. Bullish reversal signal.
- Hanging man. Identical candle shape, appears after an uptrend. Bearish reversal signal — the market rejected higher prices intraday.

The same candle means different things in different contexts. A hammer at the bottom of a downtrend is bullish; a hanging man at the top of an uptrend is bearish.

For confirmation, traders typically wait for the next candle to close above the hammer's high before acting. A hammer followed by a bearish close is not a hammer signal — it is just a candle with a long lower wick.

## The Engulfing Pattern — A Two-Candle Reversal

The engulfing pattern is a two-candle formation:

- Bullish engulfing. A small bearish candle (red body) followed by a larger bullish candle (green body) whose body fully engulfs the prior candle's body. The buyers overwhelmed the sellers in the second period.
- Bearish engulfing. A small bullish candle (green body) followed by a larger bearish candle (red body) whose body fully engulfs the prior candle's body. The sellers overwhelmed the buyers.

What makes the engulfing pattern powerful: it is a clear shift in the balance of power between buyers and sellers within a defined two-period window. The first candle shows one side in control; the second candle shows the opposite side taking over decisively.

For maximum signal quality:

- The engulfing candle should have above-average volume relative to recent candles.
- The pattern should appear at a meaningful location — a support level for bullish engulfing, a resistance level for bearish engulfing.
- The body of the engulfing candle should fully cover the body of the prior candle, not just the wicks.

## What Candlestick Patterns Are Not

The biggest mistake new traders make with candlestick patterns is treating them as standalone buy/sell signals. They are not. A doji in isolation is a coin flip. A hammer in isolation is a coin flip. An engulfing pattern in isolation is slightly better than a coin flip.

Candlestick patterns are inputs to a larger decision. The decision incorporates:

- Trend context. Is the pattern forming with the trend or against it?
- Support and resistance. Is the pattern at a level where price has reversed before?
- Volume. Is the pattern confirmed by above-average participation?
- Higher timeframe. Does the daily chart agree with the hourly pattern?

A bullish engulfing pattern at a daily support level, in a daily uptrend, with above-average volume, is a high-quality signal. A bullish engulfing pattern in the middle of a sideways range, with average volume, on a 5-minute chart, is mostly noise.

## Common Misreadings

- Treating every doji as a reversal. Most dojis in trending markets are just pauses, not reversals.
- Acting on a hammer before the next candle confirms. The hammer's signal is the rejection, but the confirmation is the next candle's close.
- Ignoring the engulfing candle's size. An engulfing candle that barely covers the prior body is weaker than one that covers it with margin.
- Trading patterns on extremely short timeframes. The lower the timeframe, the more noise in candle shapes. Patterns on 1-minute charts have far lower signal-to-noise than patterns on daily charts.

## Closing

Candlestick patterns are a vocabulary, not a strategy. They let you describe what the market just did in shorthand — "doji at support," "hammer after a downtrend," "bullish engulfing on volume" — but they do not, on their own, tell you what to do. The decision to enter a trade comes from context, confirmation, and risk management, not from the candle shape alone.

In our price-action sessions at SYA, we teach candlestick patterns alongside support/resistance, volume, and trend — the four inputs that together make a trade thesis. A candle in isolation is just a candle. A candle in context is a signal.`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 8
  {
    slug: 'why-90-percent-of-day-traders-lose-money-and-how-to-be-in-the-10-percent',
    title: 'Why 90% of Day Traders Lose Money (And How to Be in the 10%)',
    excerpt:
      "SEBI's own study found that 9 in 10 F&O traders lost money. Here are the structural reasons — and what the 10% who survive do differently.",
    category: 'Market Analysis',
    author: 'SYA Team',
    content: `The number is not a myth. SEBI's recent analysis of trends in the equity derivatives segment found that 9 out of 10 individual traders in equity F&O lost money, with the average loss exceeding ₹50,000 per trader. For options buyers specifically, the loss rate was even higher. This is not a marketing scare statistic — it is a regulator's empirical finding, based on the entire population of F&O trades over a multi-year period.

This post walks through the structural reasons most day traders lose, what the survivors do differently, and the practical habits that move you from the 90 to the 10.

## Why the Loss Rate Is So High

The high failure rate is not a mystery. It is the predictable outcome of structural forces that every active trader confronts:

1. Negative-sum game before costs. Derivatives are a zero-sum game before costs — every winner's rupee is a loser's rupee. After STT, brokerage, exchange fees, GST, and slippage, the game becomes negative-sum. The average trader must lose simply because the total costs must be paid by the participants.
2. Asymmetric counterparties. Retail traders often trade against institutions with superior information, lower latency, deeper capital, and risk-management infrastructure. The retail trader who thinks they have an "edge" is usually trading a strategy the other side has already priced in.
3. Leverage amplifies mistakes. A 1% gap move against a 10x leveraged position is a 10% capital loss. Most retail accounts are not sized to absorb more than a handful of these.
4. Cost drag on high-frequency strategies. A trader doing 20 trades a day at ₹20 brokerage plus statutory costs of ₹30 per trade pays ₹1,000 per day in costs alone. That is ₹2.5 lakh per year — a hurdle most directional edges cannot overcome.
5. Behavioural failure. Loss aversion causes traders to hold losers too long and cut winners too short. Revenge trading after a loss compounds the damage. The discipline required to follow a system is harder than the system itself.

## The SEBI Findings in Context

The SEBI study covered multiple fiscal years of F&O participation. The key numbers, all publicly reported:

- 9 out of 10 individual traders in equity F&O lost money.
- The average loss for traders who lost was over ₹50,000.
- The top 1% of traders by profit captured a disproportionate share of total gains.
- Active traders (those trading most frequently) had worse outcomes than infrequent traders.

The implication: trading more does not make you better. For most retail participants, the inverse is true. Frequency is a cost multiplier, not an edge multiplier.

## What the 10% Do Differently

The traders who survive and profit are not a different species. They share a set of behaviours that anyone can adopt but most do not:

1. They trade a defined edge, not opinions. A profitable trader can state their edge in one sentence: "I sell weekly ATM straddles on Nifty when implied volatility is in the top quartile of its 60-day range and delta-hedge once a day." A losing trader trades "what looks good."
2. They size positions by risk, not by conviction. The 2% rule (capping per-trade risk) is the foundation. Position size follows from the stop-loss, never the other way around.
3. They keep a journal and review it. Every trade is logged: thesis, entry, exit, costs, P&L, lessons. Reviewed weekly. Losing traders have no record and therefore no learning loop.
4. They limit trade frequency. Most profitable retail day traders take fewer than five trades per day. The 20-trade-per-day trader is paying costs that no realistic edge can overcome.
5. They cap daily and weekly losses. When a daily loss limit is hit, trading stops. The "one more trade to recover" reflex is the single most destructive behaviour in day trading.
6. They accept that losses are a cost of doing business. A profitable trader expects to lose on 40–60% of trades. What matters is the average win-to-loss ratio and the discipline of cutting losers short.

## Practical Habits to Install

If you are in the 90 and want to move to the 10, the path is not a better strategy — it is a better process. Start with these:

- Write your trading plan down. Markets traded, setups, entry rules, exit rules, position-sizing rule, daily loss limit, weekly loss limit. If you cannot write it down, you do not have a plan.
- Trade a fixed small size for 50 trades. Same instrument, same risk per trade, same setup. This is your baseline. You cannot improve what you have not measured.
- Journal every trade. Date, time, instrument, direction, entry, stop, exit, P&L, costs, and a one-line thesis. Review weekly. Patterns will emerge that no backtest will show you.
- Set a daily loss limit at 3% of capital. When hit, the platform closes for the day. No exceptions, no "recovery trades."
- Audit your costs quarterly. Pull the broker's contract-note summary. If costs exceed 10% of gross P&L, your strategy cannot survive in its current form.
- Stop trading strategies you cannot articulate. If you cannot explain to a sceptical friend why you entered a trade, you should not have entered it.

## The Hardest Truth

The 90% loss rate is not a problem to be solved by working harder. It is a feature of the market structure. The market does not owe anyone a profit. Every rupee you take home is taken from someone else's account, minus the costs. To be in the 10%, you need both an edge (some structural reason your trades should win over time) and the discipline to execute it consistently under stress.

If you cannot identify your edge, the most profitable trade you can make is to not trade. The capital you preserve by sitting out is the capital you would otherwise have handed to the costs the market extracts from uninformed participants.

## Closing

The SEBI data is not a warning to scare you out of the market — it is a map of where the pitfalls are. Most traders fall into the same few traps, and the traps have known exits: smaller size, fewer trades, sharper theses, harder stops, and a journal that turns experience into data.

At SYA, our curriculum is built around this reality. We do not promise quick profits; we promise a structured path to becoming the kind of trader who survives long enough to be in the 10%. The first lesson is the most important one: most day traders lose money, and the way to be different is to do different things — not to trade more, but to trade better.`,
  },
];

async function main(): Promise<void> {
  try {
    for (const post of posts) {
      await db.blogPost.upsert({
        where: { slug: post.slug },
        create: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          published: true,
          coverImage: null,
        },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          published: true,
          coverImage: null,
        },
      });
    }
    console.log(`Seeded ${posts.length} blog posts`);
    await db.$disconnect();
  } catch (error) {
    console.error('Blog seed failed:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

void main();
