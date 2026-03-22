const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const SECTOR_ETFS = ['XLK','XLF','XLE','XLV','XLI','XLY','XLP','XLU','XLB','XLRE','XLC'];
const SECTOR_NAMES = {
  XLK: 'Technology', XLF: 'Financials', XLE: 'Energy',
  XLV: 'Healthcare', XLI: 'Industrials', XLY: 'Cons. Disc.',
  XLP: 'Cons. Staples', XLU: 'Utilities', XLB: 'Materials',
  XLRE: 'Real Estate', XLC: 'Comm. Svcs',
};

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calculateMA(closes, period) {
  if (closes.length < period) return null;
  return avg(closes.slice(-period));
}

function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const recent = changes.slice(-period);
  const gains = recent.filter(c => c > 0);
  const losses = recent.filter(c => c < 0).map(Math.abs);
  const avgGain = gains.length ? avg(gains) : 0;
  const avgLoss = losses.length ? avg(losses) : 0;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calcSlope5d(closes) {
  if (closes.length < 5) return 0;
  const last5 = closes.slice(-5);
  return (last5[4] - last5[0]) / last5[0] * 100;
}

async function fetchQuote(symbol) {
  try {
    const q = await yahooFinance.quote(symbol, {}, { validateResult: false });
    return q;
  } catch (e) {
    console.warn(`Failed to fetch quote for ${symbol}: ${e.message}`);
    return null;
  }
}

async function fetchHistory(symbol, days = 220) {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const hist = await yahooFinance.historical(symbol, {
      period1: start.toISOString().split('T')[0],
      period2: end.toISOString().split('T')[0],
      interval: '1d',
    }, { validateResult: false });
    return hist.map(d => d.close).filter(Boolean);
  } catch (e) {
    console.warn(`Failed to fetch history for ${symbol}: ${e.message}`);
    return [];
  }
}

async function fetchAllMarketData() {
  console.log('[MarketFetcher] Starting data fetch...');

  // Fetch all quotes in parallel
  const symbols = ['SPY', 'QQQ', '^VIX', '^VVIX', '^TNX', 'DX-Y.NYB', ...SECTOR_ETFS];
  const [quotes, spyHistory, qqqHistory, vixHistory] = await Promise.all([
    Promise.all(symbols.map(s => fetchQuote(s).then(q => ({ symbol: s, quote: q })))),
    fetchHistory('SPY', 220),
    fetchHistory('QQQ', 60),
    fetchHistory('^VIX', 260),
  ]);

  const quoteMap = {};
  for (const { symbol, quote } of quotes) {
    quoteMap[symbol] = quote;
  }

  // --- SPY ---
  const spy = quoteMap['SPY'];
  const spyPrice = spy?.regularMarketPrice || null;
  const spyChange = spy?.regularMarketChangePercent || 0;
  const spy20MA = calculateMA(spyHistory, 20);
  const spy50MA = calculateMA(spyHistory, 50);
  const spy200MA = calculateMA(spyHistory, 200);
  const spyRSI = calculateRSI(spyHistory, 14);

  // --- QQQ ---
  const qqq = quoteMap['QQQ'];
  const qqqPrice = qqq?.regularMarketPrice || null;
  const qqqChange = qqq?.regularMarketChangePercent || 0;
  const qqqHistory60 = await fetchHistory('QQQ', 60);
  const qqq50MA = calculateMA(qqqHistory60, 50);

  // --- VIX ---
  const vix = quoteMap['^VIX'];
  const vixPrice = vix?.regularMarketPrice || null;
  const vixSlope5d = calcSlope5d(vixHistory);
  // VIX 1yr percentile from history
  let vixPercentile1yr = 50;
  if (vixHistory.length >= 252 && vixPrice) {
    const last252 = vixHistory.slice(-252);
    const below = last252.filter(v => v < vixPrice).length;
    vixPercentile1yr = Math.round((below / last252.length) * 100);
  }
  const vvix = quoteMap['^VVIX'];
  const vvixPrice = vvix?.regularMarketPrice || null;

  // Put/Call estimated from VIX regime
  let putCallEstimate = 0.95;
  if (vixPrice) {
    if (vixPrice > 30) putCallEstimate = 1.3;
    else if (vixPrice > 22) putCallEstimate = 1.1;
    else if (vixPrice > 16) putCallEstimate = 0.95;
    else putCallEstimate = 0.75;
  }

  // --- 10yr yield & DXY ---
  const tnx = quoteMap['^TNX'];
  const tnxPrice = tnx?.regularMarketPrice || null;
  const tnxChange = tnx?.regularMarketChangePercent || 0;

  const dxy = quoteMap['DX-Y.NYB'];
  const dxyPrice = dxy?.regularMarketPrice || null;
  const dxyChange = dxy?.regularMarketChangePercent || 0;

  // --- Sectors ---
  const sectors = SECTOR_ETFS.map(sym => {
    const q = quoteMap[sym];
    return {
      symbol: sym,
      name: SECTOR_NAMES[sym],
      price: q?.regularMarketPrice || null,
      change: q?.regularMarketChangePercent || 0,
      prevClose: q?.regularMarketPreviousClose || null,
    };
  });

  // Market regime
  let regime = 'chop';
  if (spyPrice && spy20MA && spy50MA && spy200MA) {
    if (spyPrice > spy20MA && spyPrice > spy50MA && spyPrice > spy200MA) regime = 'uptrend';
    else if (spyPrice < spy50MA && spyPrice < spy200MA) regime = 'downtrend';
  }

  console.log('[MarketFetcher] Fetch complete');

  return {
    timestamp: new Date().toISOString(),
    spy: {
      price: spyPrice,
      change: spyChange,
      ma20: spy20MA,
      ma50: spy50MA,
      ma200: spy200MA,
      aboveMa20: spyPrice && spy20MA ? spyPrice > spy20MA : null,
      aboveMa50: spyPrice && spy50MA ? spyPrice > spy50MA : null,
      aboveMa200: spyPrice && spy200MA ? spyPrice > spy200MA : null,
      rsi: spyRSI,
      regime,
    },
    qqq: {
      price: qqqPrice,
      change: qqqChange,
      ma50: qqq50MA,
      aboveMa50: qqqPrice && qqq50MA ? qqqPrice > qqq50MA : null,
    },
    vix: {
      price: vixPrice,
      slope5d: vixSlope5d,
      percentile1yr: vixPercentile1yr,
      putCallEstimate,
    },
    vvix: { price: vvixPrice },
    yield10yr: { price: tnxPrice, change: tnxChange },
    dxy: { price: dxyPrice, change: dxyChange },
    sectors,
    raw: { spyHistory, vixHistory },
  };
}

module.exports = { fetchAllMarketData, SECTOR_ETFS, SECTOR_NAMES };
