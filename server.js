const express = require('express');
const cors = require('cors');
const { fetchAllMarketData } = require('./src/data/marketFetcher');
const { estimateBreadth, classifyBreadth } = require('./src/data/breadthEstimator');
const {
  scoreVolatility, scoreTrend, scoreMomentum, scoreBreadth, scoreMacro,
  scoreExecutionWindow, calculateFinalScore, WEIGHTS
} = require('./src/scoring/scoringEngine');
const { generateAnalysis } = require('./src/analysis/terminalAnalysis');
const { getFomcStatus } = require('./src/fomc/fomcCalendar');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── In-memory cache ────────────────────────────────────────────────────────
let cache = {
  marketData: null,
  tickerData: null,
  lastFetch: 0,
  isFetching: false,
};
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// ── Core data aggregation ──────────────────────────────────────────────────
async function aggregateMarketData(mode = 'swingTrading') {
  const raw = await fetchAllMarketData();
  const fomc = getFomcStatus();

  // Derive breadth from sector data
  const breadthData = estimateBreadth(raw.sectors, raw.spy);
  const breadthClass = classifyBreadth(breadthData);

  // Score each category
  const volatilityScore = scoreVolatility(raw.vix, mode);
  const trendScore = scoreTrend(raw.spy, raw.qqq, mode);
  const momentumScore = scoreMomentum(raw.sectors, mode);
  const breadthScore = scoreBreadth(breadthData, mode);
  const macroScore = scoreMacro(raw.yield10yr, raw.dxy, fomc, mode);

  const scores = {
    volatility: volatilityScore,
    trend: trendScore,
    momentum: momentumScore,
    breadth: breadthScore,
    macro: macroScore,
  };

  const finalScore = calculateFinalScore(scores, mode);
  const executionWindow = scoreExecutionWindow(raw.spy, raw.sectors, raw.vix);
  const analysis = generateAnalysis(scores, finalScore, raw, mode);

  return {
    timestamp: raw.timestamp,
    mode,
    decision: finalScore.decision,
    decisionColor: finalScore.decisionColor,
    advice: finalScore.advice,
    marketQualityScore: finalScore.marketQualityScore,
    executionWindow,
    analysis,
    fomc,
    scores,
    finalScore,
    weights: WEIGHTS,
    marketData: {
      spy: raw.spy,
      qqq: raw.qqq,
      vix: raw.vix,
      vvix: raw.vvix,
      yield10yr: raw.yield10yr,
      dxy: raw.dxy,
      sectors: raw.sectors,
      breadth: { ...breadthData, classification: breadthClass },
    },
  };
}

// ── Cache-aware fetch ──────────────────────────────────────────────────────
async function getOrFetchData(mode = 'swingTrading') {
  const now = Date.now();
  if (cache.marketData && (now - cache.lastFetch) < CACHE_TTL_MS && !cache.isFetching) {
    // Return cached data but update mode scoring if needed
    if (cache.marketData.mode !== mode) {
      // Re-score with new mode without re-fetching
      const raw = cache.rawData;
      if (raw) {
        return aggregateWithMode(raw, mode);
      }
    }
    return cache.marketData;
  }

  if (!cache.isFetching) {
    cache.isFetching = true;
    try {
      const data = await aggregateMarketData(mode);
      cache.marketData = data;
      cache.lastFetch = now;
    } catch (err) {
      console.error('[Cache] Fetch failed:', err.message);
    } finally {
      cache.isFetching = false;
    }
  }

  return cache.marketData;
}

// ── Routes ─────────────────────────────────────────────────────────────────

// Full market snapshot
app.get('/api/market', async (req, res) => {
  const mode = req.query.mode || 'swingTrading';
  try {
    const data = await getOrFetchData(mode);
    if (!data) {
      return res.status(503).json({ error: 'Market data temporarily unavailable', retry: true });
    }
    const secondsAgo = Math.round((Date.now() - cache.lastFetch) / 1000);
    res.json({ ...data, cacheAge: secondsAgo, isFetching: cache.isFetching });
  } catch (err) {
    console.error('[API] /market error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Fast ticker data
app.get('/api/ticker', async (req, res) => {
  try {
    const data = await getOrFetchData();
    if (!data) return res.status(503).json({ error: 'Unavailable' });

    const md = data.marketData;
    const tickers = [
      { symbol: 'SPY', price: md.spy.price, change: md.spy.change },
      { symbol: 'QQQ', price: md.qqq.price, change: md.qqq.change },
      { symbol: 'VIX', price: md.vix.price, change: null },
      { symbol: 'DXY', price: md.dxy.price, change: md.dxy.change },
      { symbol: 'TNX', price: md.yield10yr.price, change: md.yield10yr.change },
      ...md.sectors.map(s => ({ symbol: s.symbol, price: s.price, change: s.change })),
    ];

    res.json({ tickers, lastUpdate: data.timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', cacheAge: Math.round((Date.now() - cache.lastFetch) / 1000) });
});

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Should I Trade? API running at http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/market  /api/ticker  /api/health\n`);
  // Pre-warm cache
  getOrFetchData().then(() => console.log('[Cache] Pre-warmed successfully')).catch(console.error);
});
