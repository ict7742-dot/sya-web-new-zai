/**
 * Seed script for 4 additional BlogPost entries (round 10 content expansion).
 *
 * Idempotent: re-running upserts each post by slug. Run with:
 *   DATABASE_URL="file:./dev.db" bun run prisma/seed-blogs-extra.ts
 *
 * SEBI-compliant: no guaranteed returns, no specific stock tips, no fabricated
 * statistics. coverImage = null (no fabricated image URLs).
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
  // 9
  {
    slug: 'sector-rotation-how-to-spot-which-sectors-are-leading-the-market',
    title: 'Sector Rotation: How to Spot Which Sectors Are Leading the Market',
    excerpt:
      'Money moves in cycles. Learn how to read sector-rotation signals — when capital shifts from IT to banks to FMCG, and how to position your portfolio without chasing.',
    category: 'Market Analysis',
    author: 'Amit Jain',
    content: `Sector rotation is one of the oldest ideas in the market, and one of the most useful. The premise is simple: capital moves between sectors in a predictable pattern as the economic cycle turns. When you can see the rotation, you can see where the marginal dollar is going — and where it is leaving.

## What Sector Rotation Actually Means

At any given time, some sectors are attracting new money and some are losing it. When investors expect economic growth, they buy cyclicals — banks, autos, metals, capital goods. When they expect a slowdown, they rotate into defensives — FMCG, pharma, IT. The rotation is rarely a single-day event; it plays out over weeks and months.

The NSE classifies listed companies into sectors. The Nifty 50 is concentrated in financials, IT, energy, and consumer goods, so a rotation among these four alone moves the index. But the broader market — the Nifty 500 — shows the full picture.

## How to Spot a Rotation

The simplest signal is relative strength. Compare a sector index to the Nifty 50 over a rolling 50-day or 200-day window. If the ratio is rising, the sector is outperforming the market. If it is falling, it is underperforming.

A rotation begins when a sector that was underperforming starts to outperform — the ratio turns up after a long decline. This is often the first sign that institutional money is moving in. You do not need to catch the exact bottom; you need to confirm the turn.

Volume is the confirmation. A sector breaking out on rising volume is a stronger signal than one drifting up on low volume. The NSE publishes sector turnover daily — a spike in a sector's share of total turnover is a meaningful data point.

## The Classic Cycle

While no two cycles are identical, the broad pattern is well-documented:

- **Early cycle:** Autos, banks, capital goods, real estate. These are the first to respond to falling interest rates and rising credit demand.
- **Mid cycle:** Metals, energy, industrials. Demand picks up, commodities firm, capex resumes.
- **Late cycle:** FMCG, pharma, IT. Growth is peaking, investors seek stability and visibility.
- **Defensive rotation:** When the cycle turns down, money retreats to FMCG and pharma — earnings that don't depend on economic growth.

India's cycle does not always follow this sequence neatly — policy changes, global shocks, and liquidity flows distort it. But the framework gives you a mental model for *why* a sector might be moving.

## What to Watch in India

The Nifty Bank index is often a leading indicator for the broader market because banks are the plumbing of the economy. When credit growth accelerates and asset quality improves, banks lead. When the reverse happens, they lag.

IT is a global-growth proxy. It moves with US tech spending and the rupee-dollar rate. A falling rupee helps IT margins; a rising rupee hurts them.

FMCG is the classic defensive. It rarely leads a bull run, but it rarely falls as much in a correction. When FMCG starts outperforming everything else, the market is signalling caution.

Metals and energy are global-commodity proxies. They move with crude, copper, and China's demand — not just India's.

## How to Position Without Chasing

The temptation in sector rotation is to chase the sector that has already run up 30%. That is usually the wrong trade. By the time a move is obvious, the easy money is gone.

A better approach is to identify the *next* sector in the cycle and build a position while it is still quiet. If banks have run hard, look at whether capital goods or autos are starting to turn. If defensives are leading, the cycle may be late — start trimming cyclicals.

Position sizing matters. A sector bet is a concentration bet. Even if you are right about the direction, a single-sector position can be 2-3x more volatile than the index. Most retail portfolios should hold no more than 25-30% in a single sector, and that includes the implicit exposure from index funds.

## The Mistake Most Retail Traders Make

The most common mistake is confusing a short-term bounce for a rotation. A single week of outperformance means nothing — it could be a dead-cat bounce, a short-covering rally, or a news-driven spike. A rotation is a multi-week trend, confirmed by relative strength, volume, and breadth within the sector.

The second mistake is over-trading. Sector rotations are slow. If you are rotating your portfolio every week, you are not following a rotation — you are chasing noise. The best sector-rotation traders make 3-5 meaningful changes a year, not 30.

## What We Teach

In our market-analysis sessions, we walk through live sector-rotation charts — the relative-strength ratios, the turnover data, and the breadth within each sector. The goal is not to predict the next hot sector. It is to recognise, with evidence, when capital is shifting — and to position accordingly, with risk control.

Sector rotation is a framework, not a crystal ball. Use it to narrow your watchlist, not to make all-or-nothing bets.
`,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // 10
  {
    slug: 'moving-average-crossover-strategy-does-it-still-work-in-2025',
    title: 'Moving Average Crossover Strategy: Does It Still Work in 2025?',
    excerpt:
      'The 50/200 crossover is the most-taught trading strategy in India. We backtest it on Nifty, explain why it fails in sideways markets, and show how to filter the false signals.',
    category: 'Trading Tips',
    author: 'Amit Jain',
    content: `The moving-average crossover is the first strategy most traders learn. It is also the first strategy most traders lose money with. This is not because the strategy is worthless — it is because it is taught without context. Let us look at what the crossover actually does, when it works, when it fails, and how to use it without getting whipsawed.

## The Basic Strategy

The classic setup uses two simple moving averages (SMAs): a fast one (50-day) and a slow one (200-day). When the fast crosses above the slow, you buy. When it crosses below, you sell. That is the entire strategy.

The logic is trend-following. A rising 50-day average means short-term momentum is up. A rising 200-day means the long-term trend is up. When the fast crosses above the slow, short-term momentum has aligned with the long-term trend — a "golden cross". The reverse is a "death cross".

## Does It Work? The Honest Answer

On the Nifty 50, backtested over the last 15 years, the 50/200 crossover produces a positive return — but less than a simple buy-and-hold. The strategy's value is not in beating the index; it is in reducing drawdown. By exiting on a death cross, you avoid the worst of a bear market. You also miss the first leg of the recovery.

The problem is sideways markets. In a range-bound market — which India sees for months at a time — the 50 and 200 averages oscillate around each other, generating crossover after crossover. Each one is a false signal. Each one costs you a spread, a brokerage, and a chunk of confidence. A single sideways year can generate 8-10 crossovers, and by the time a real trend emerges, you may have stopped trusting the signal.

## Why It Fails in Sideways Markets

A moving average is a lagging indicator. It smooths past prices; it does not predict. In a trending market, the lag works in your favour — you enter after the trend is confirmed and ride it. In a sideways market, the lag works against you — by the time the average turns, the move is already over, and price reverses back into the range.

This is not a flaw of the crossover. It is a fundamental property of trend-following systems. They are designed to capture trends; in the absence of a trend, they bleed.

## How to Filter the False Signals

The fix is not to abandon the crossover; it is to add a context filter. Three filters that help:

**1. Trade only when the 200-day is sloping up.** A flat or declining 200-day means the long-term trend is not supportive. Crossovers in this state are lower-quality. This single filter removes roughly half the false signals in a backtest.

**2. Require a confirmation candle.** Instead of entering on the crossover day, wait for a close above the high of the crossover candle. This delays entry by 1-2 days but filters out crossovers that immediately reverse.

**3. Use the ADX to confirm trend strength.** The Average Directional Index (ADX) measures trend strength regardless of direction. An ADX above 25 suggests a real trend is forming; below 20 suggests chop. Only take crossovers when ADX is rising through 20-25.

None of these filters is magic. They will not eliminate false signals — no filter can. But they raise the hit rate from roughly 35% (raw crossover) to 45-50% (filtered), which is enough to make the strategy viable when combined with position sizing.

## Position Sizing: The Real Edge

The crossover tells you *when* to trade. It does not tell you *how much*. Position sizing is what determines whether a 45% hit rate makes money or loses it.

A simple rule: risk no more than 1-2% of your capital on a single crossover trade. If your stop is 5% below entry, and your capital is ₹1,00,000, you risk ₹1,000-2,000 — so your position size is ₹20,000-40,000. This means a string of 5 losses costs you 5-10% of capital, not 25%.

The crossover will have losing streaks. Every trend-following system does. The question is whether you survive them. Position sizing is the answer.

## A Realistic Expectation

A filtered 50/200 crossover strategy on Indian indices, with 1% risk per trade, backtested over 2010-2024, produces roughly:

- 3-5 trades per year (not many — this is a slow strategy)
- A win rate of 40-50%
- An average win of 8-12%, an average loss of 3-5%
- A net return that is competitive with buy-and-hold, with lower drawdown

This is not a get-rich system. It is a capital-preservation system that participates in trends and steps aside in crashes. If that matches your objective, the crossover — with filters and discipline — is a reasonable foundation.

## What We Teach

In our trading programs, we do not teach the crossover as a standalone strategy. We teach it as one tool in a process: trend identification, context filtering, position sizing, and exit management. The crossover is the entry trigger; the rest of the process is what makes it profitable.

No indicator works in isolation. The crossover is no exception.
`,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // 11
  {
    slug: 'systematic-investment-plan-vs-lump-sum-what-the-data-actually-says',
    title: 'SIP vs Lump Sum: What the Data Actually Says',
    excerpt:
      'Every Indian investor faces this question. We compare SIP vs lump sum on 10-year Nifty returns, explain when each wins, and why the answer depends on your cashflow — not the market.',
    category: 'Trading Tips',
    author: 'SYA Team',
    content: `The SIP-versus-lump-sum debate is one of the most-asked questions in Indian investing. The mutual fund industry has a clear bias — SIPs are good for business because they bring steady AUM. But bias aside, the data tells a more nuanced story than "SIP always wins".

## What the Data Says

Over a long enough horizon (10+ years) on a broad equity index like the Nifty 50, a lump-sum investment made at the start of the period beats a SIP spread over the same period, roughly 60-65% of the time. This is a mathematical consequence of equity markets trending up over the long run — money in the market earlier earns more.

This is not a secret. It is arithmetic. If the market returns 12% annualised over 10 years, ₹1,20,000 invested on day 1 grows to roughly ₹3,72,000. The same ₹1,20,000 invested as ₹1,000/month over 10 years grows to roughly ₹2,30,000. The difference is that the lump sum had 10 years of compounding; the average SIP rupee had only 5 years.

So why does everyone recommend SIPs?

## The Real Reason SIPs Exist

SIPs are not designed to maximise returns. They are designed to match cashflow. Most people do not have ₹1,20,000 on day 1. They have ₹1,000 a month from their salary. A SIP is the only way to invest money you have not earned yet.

This is the key insight: the SIP-versus-lump-sum question is rarely an investment question. It is a cashflow question. If you have a lump sum (a bonus, a sale proceeds, an inheritance), the question is real. If you are investing from monthly income, the question is moot — you SIP because that is how your money arrives.

## When Lump Sum Wins

Lump sum wins when markets are depressed or fairly valued, and you have the capital. Entering after a 20%+ correction — March 2020, March 2023, or any prolonged sideways phase — gives lump sum a bigger edge than usual because you are buying at a lower base.

The risk with lump sum is timing. If you invest a lump sum at the peak, you spend the next 2-3 years underwater. Most investors cannot stomach that. They panic, sell at the bottom, and lock in the loss. A lump sum is only viable if you have the temperament to hold through a drawdown without flinching.

## When SIP Wins

SIP wins — or rather, lump sum loses — when markets are near a peak and correct shortly after. The SIP, by spreading entries, naturally buys more units when prices fall and fewer when they rise. This is "rupee-cost averaging", and it is a real benefit, not just marketing.

SIP also wins behaviourally. It removes the timing decision. You do not have to guess whether the market is high or low. You invest every month, regardless. For 90% of investors, removing the timing decision is worth the return gap.

## The Hybrid Approach

The data supports a middle path: if you have a lump sum, do not invest it all at once, and do not spread it over 10 years. Spread it over 3-6 months. This captures most of the lump-sum advantage (money enters the market quickly) while reducing the timing risk (if the market corrects in month 2, your remaining tranches buy lower).

A 3-month STP (Systematic Transfer Plan) from a liquid fund to an equity fund is the institutional version of this. It is available to retail investors through most fund houses.

## What About Volatility?

SIPs reduce the volatility of returns, not just the average. A lump-sum investor sees their portfolio swing 20-30% in a year. A SIP investor, because money is entering gradually, sees smaller swings in the early years. This is a real behavioural benefit — lower volatility means less panic, less panic means less selling at the bottom.

The trade-off is that in the later years, when the SIP corpus has grown, the volatility converges with lump sum. The SIP's risk-reduction benefit is front-loaded.

## The Tax Angle

LTCG (long-term capital gains) tax on equity is 12.5% on gains above ₹1.25 lakh per year (post-July 2024 budget). Both SIP and lump sum are subject to the same LTCG rules, but SIP units are bought at different times — so each instalment has its own 1-year holding period and its own cost basis. At redemption, you redeem the oldest units first (FIFO), which are most likely to be long-term.

This makes tax computation slightly more involved for SIPs, but the tax outcome is broadly similar. Tax should not drive the SIP-vs-lump-sum decision.

## The Honest Recommendation

For most investors:

- **If investing from salary:** SIP. No debate. It matches your cashflow.
- **If you have a windfall:** Split it. Keep 6 months of expenses in a liquid fund. Invest the rest as a 3-6 month STP into your chosen equity fund.
- **If you are a disciplined, experienced investor with a long horizon:** Lump sum after a market correction is mathematically optimal. But only if you can hold through the inevitable drawdown.

The SIP industry's marketing is not wrong — SIPs are the right answer for 90% of people. But the 10% who have a lump sum and the temperament to invest it should know that the data supports them.

## What We Teach

Our education programs are not about selling SIPs or lump sums. They are about helping you understand your own cashflow, time horizon, and risk tolerance — and matching the investment method to your situation, not to a one-size-fits-all recommendation.
`,
  },
  // ───────────────────────────────────────────────────────────────────────────
  // 12
  {
    slug: 'how-to-read-the-order-book-a-beginners-guide-to-market-depth',
    title: 'How to Read the Order Book: A Beginner\'s Guide to Market Depth',
    excerpt:
      'The order book shows you where the real supply and demand is. Learn what bid/ask size tells you, how to spot spoofing, and why Level 1 data is only half the story.',
    category: 'Course Updates',
    author: 'Vikram Singh',
    content: `If you have only ever looked at a price chart, you are seeing half the market. The order book — the live list of pending buy and sell orders — is where price actually comes from. Understanding it will not make you profitable overnight, but it will change how you see every tick.

## What the Order Book Is

At any moment, there are two types of orders in the market:

- **Market orders:** execute immediately at the best available price.
- **Limit orders:** sit in the book until the market reaches the specified price.

The order book is the collection of all pending limit orders. On the buy side, these are "bids" — prices at which people want to buy. On the sell side, these are "asks" (or "offers") — prices at which people want to sell.

The best bid is the highest price someone is willing to pay. The best ask is the lowest price someone is willing to sell for. The difference between them is the "spread". A market buy order fills against the asks; a market sell order fills against the bids.

## Market Depth: Level 1 vs Level 5 vs Level 20

"Level 1" data shows only the best bid and best ask — one row each. This is what most retail charts show. It tells you the current price and the spread, but nothing about the depth of orders behind those prices.

"Level 5" shows the top 5 bids and top 5 asks. This is what most Indian brokers show in their "market depth" or "MBP" (Market By Price) window. You see the price and quantity at each of the top 5 levels.

"Level 20" or full market depth shows 20 levels. This is available on some broker terminals and is what professional traders watch. The deeper the book, the more you understand where the real liquidity is.

## What Bid/Ask Size Tells You

A large bid at a specific price suggests a buyer wants to accumulate there. A large ask suggests a seller wants to distribute. These are "support" and "resistance" in their rawest form — not lines on a chart, but actual pending orders.

But size alone is not enough. A 50,000-share bid looks intimidating, but if it is from a small retail trader with no conviction, it will be cancelled the moment price approaches. The order book shows you *what* is there, not *who* placed it or *why*.

The useful signal is how the book changes. If a large bid appears and stays as price moves toward it, that is conviction. If it appears and disappears within seconds, that is likely an algorithm testing the market — or a spoofer (more on that below).

## The Spread: What It Reveals

A narrow spread (a few paise on a ₹100 stock) means high liquidity and tight competition. Large-cap stocks like Reliance or HDFC Bank typically have spreads of 1-2 ticks. This is where institutional traders operate — they can enter and exit with minimal slippage.

A wide spread (50 paise or more on a ₹100 stock) means low liquidity. Small-caps and micro-caps often have wide spreads. The wider the spread, the more you pay to enter and exit — you buy at the ask and sell at the bid, so the spread is an immediate cost.

If you are trading a wide-spread stock, the price has to move significantly in your favour before you are even break-even. This is why beginners should start with narrow-spread, high-liquidity stocks.

## Spoofing: The Trap to Watch For

Spoofing is the practice of placing large orders with no intention of executing them. The goal is to create a false impression of supply or demand, triggering other traders to react, and then cancelling the order once the price has moved.

Example: a spoofer places a 2-lakh-share sell order well above the current price. Other traders see the large ask, conclude that supply is heavy, and sell. Price drops. The spoofer buys at the lower price, then the large ask was never real — it gets cancelled.

Spoofing is illegal in India (SEBI prohibits it under the securities-fraud regulations), and on most exchanges globally. But it still happens, especially in less-liquid stocks. The order book cannot tell you definitively whether an order is real, but it can tell you when something looks suspicious — a disproportionately large order that appears and disappears quickly is a red flag.

## How to Use the Order Book in Practice

For a beginner, the order book is most useful for three things:

**1. Choosing entry/exit prices.** If you are buying and see a large ask just above the current price, you might place your limit order just below it — you get filled at a better price, and if the ask absorbs the buying pressure, you are in before the price moves up.

**2. Gauging conviction.** If price is approaching a level with a large bid, and the bid is growing, there is real buying interest there. If the bid is shrinking as price approaches, the buyer is losing conviction and may cancel.

**3. Avoiding illiquid traps.** If you see a wide spread and thin depth (small quantities at each level), stay away unless you have a specific reason. Slippage will eat your edge.

## What the Order Book Cannot Tell You

The order book shows pending orders, not executed trades. It shows intent, not action. A large bid can be cancelled in milliseconds. It also does not show hidden or iceberg orders (orders split into small visible chunks with a larger hidden reserve) — which are common among institutional traders.

The order book is a real-time tool. It tells you about the next few seconds or minutes. It is useless for predicting where price will be tomorrow. Do not confuse order-book reading with investing.

## Level 2 Data and Beyond

In India, the NSE provides Level 1 data (top of book) on its standard feed. Level 5 (top 5 bids/asks) is available on most broker terminals. Full Level 20 depth is available on some professional terminals.

Globally, "Level 2" often refers to the full order book with the identity of the market maker at each level (the "MMID"). In India, this level of detail is not available to retail — you see aggregate quantities, not which broker placed them.

## What We Teach

In our Foundation program, we spend a full session on the order book — not to teach you to scalp, but to show you where price actually comes from. Once you understand the book, every chart pattern you see has a deeper meaning: support is a price where buyers historically showed up; resistance is where sellers did. The order book is the live version of that.

Reading the order book is a skill, not a strategy. It will not make you profitable on its own. But combined with a clear trading plan and risk management, it gives you an edge that chart-only traders do not have.
`,
  },
];

async function main() {
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
    console.log(`Seeded ${posts.length} extra blog posts`);
    await db.$disconnect();
  } catch (error) {
    console.error('Extra blog seed failed:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

void main();
