/**
 * Scoring Engine
 * All weights and thresholds are editable constants at the top.
 */

// ─── EDITABLE WEIGHTS ─────────────────────────────────────────────────────────
const WEIGHTS = {
  volatility: 0.25,
  momentum:   0.25,
  trend:      0.20,
  breadth:    0.20,
  macro:      0.10,
};

// ─── DECISION THRESHOLDS ──────────────────────────────────────────────────────
const THRESHOLDS = {
  swingTrading: { yes: 80, caution: 60 },
  dayTrading:   { yes: 75, caution: 55 }, // tighter thresholds for day trading
};

// ─── VOLATILITY ───────────────────────────────────────────────────────────────
function scoreVolatility(vix, mode = 'swingTrading') {
  const { price: vixPrice, slope5d, percentile1yr } = vix;
  if (!vixPrice) return { score: 50, details: 'No VIX data', components: {} };

  // Base VIX score: ideal is 12-18, penalized above
  let vixBase = Math.max(0, 100 - (vixPrice - 12) * 4.5);
  // tighter for day trading
  if (mode === 'dayTrading') vixBase = Math.max(0, 100 - (vixPrice - 10) * 5);

  // Trend bonus: falling VIX = good
  const trendBonus = slope5d < -5 ? 12 : slope5d < 0 ? 6 : slope5d > 10 ? -15 : 0;

  // Percentile penalty: if historically elevated
  const percentilePenalty = percentile1yr > 80 ? -20 : percentile1yr > 60 ? -8 : 0;

  const score = Math.min(100, Math.max(0, vixBase + trendBonus + percentilePenalty));
  
  let interpretation = 'Calm';
  if (vixPrice > 30) interpretation = 'Risk-Off';
  else if (vixPrice > 22) interpretation = 'Elevated';
  else if (vixPrice > 17) interpretation = 'Moderate';

  return {
    score: Math.round(score),
    interpretation,
    details: `VIX ${vixPrice?.toFixed(1)} | ${interpretation} | ${slope5d > 0 ? '↑' : '↓'} 5d trend`,
    components: { vixBase: Math.round(vixBase), trendBonus, percentilePenalty },
  };
}

// ─── TREND ────────────────────────────────────────────────────────────────────
function scoreTrend(spy, qqq, mode = 'swingTrading') {
  let score = 0;
  const components = {};

  // SPY vs MAs (25 points each)
  const above20 = spy.aboveMa20 ? 25 : 0;
  const above50 = spy.aboveMa50 ? 25 : 0;
  const above200 = spy.aboveMa200 ? 25 : 0;

  // RSI scoring (25 points)
  let rsiScore = 0;
  if (spy.rsi !== null) {
    const rsi = spy.rsi;
    if (rsi >= 50 && rsi <= 68) rsiScore = 25;      // ideal trend
    else if (rsi >= 40 && rsi < 50) rsiScore = 12;  // weak
    else if (rsi > 68 && rsi <= 75) rsiScore = 18;  // overbought but ok
    else if (rsi > 75) rsiScore = 8;                // very overbought
    else rsiScore = 0;                              // <40 = bearish
  }
  if (mode === 'dayTrading') {
    // Day trading favors more momentum - boost RSI range
    if (spy.rsi && spy.rsi >= 55 && spy.rsi <= 72) rsiScore = 25;
  }

  components.above20 = above20;
  components.above50 = above50;
  components.above200 = above200;
  components.rsiScore = rsiScore;

  score = above20 + above50 + above200 + rsiScore;

  const maCount = [spy.aboveMa20, spy.aboveMa50, spy.aboveMa200].filter(Boolean).length;
  let interpretation = 'Downtrend';
  if (maCount === 3) interpretation = 'Strong Uptrend';
  else if (maCount === 2) interpretation = 'Uptrend';
  else if (maCount === 1) interpretation = 'Weakening';

  return {
    score: Math.round(Math.min(100, score)),
    interpretation,
    regime: spy.regime,
    details: `SPY ${maCount}/3 MAs | RSI ${spy.rsi?.toFixed(0) || 'N/A'} | ${interpretation}`,
    components,
  };
}

// ─── MOMENTUM ─────────────────────────────────────────────────────────────────
function scoreMomentum(sectors, mode = 'swingTrading') {
  if (!sectors || sectors.length === 0) return { score: 50, details: 'No sector data', components: {} };

  const validSectors = sectors.filter(s => s.change !== null);
  const positiveSectors = validSectors.filter(s => s.change > 0);

  // Sector breadth (60 points)
  const sectorBreadthScore = (positiveSectors.length / validSectors.length) * 60;

  // RS spread: top 3 vs bottom 3 (40 points)
  const sorted = [...validSectors].sort((a, b) => b.change - a.change);
  const top3Avg = sorted.slice(0, 3).reduce((a, s) => a + s.change, 0) / 3;
  const bottom3Avg = sorted.slice(-3).reduce((a, s) => a + s.change, 0) / 3;
  const rsSpread = top3Avg - bottom3Avg;
  const rsScore = Math.min(40, Math.max(0, rsSpread * 3.5));

  const score = sectorBreadthScore + rsScore;

  // Leadership analysis
  const leaders = sorted.slice(0, 3).map(s => s.symbol).join(', ');
  const laggards = sorted.slice(-3).map(s => s.symbol).join(', ');
  
  let interpretation = 'Weak';
  if (positiveSectors.length >= 8) interpretation = 'Broad';
  else if (positiveSectors.length >= 6) interpretation = 'Selective';
  else if (positiveSectors.length >= 4) interpretation = 'Narrow';

  return {
    score: Math.round(Math.min(100, score)),
    interpretation,
    details: `${positiveSectors.length}/11 sectors positive | Leaders: ${leaders}`,
    leaders,
    laggards,
    rsSpread: Math.round(rsSpread * 100) / 100,
    components: { sectorBreadthScore: Math.round(sectorBreadthScore), rsScore: Math.round(rsScore) },
  };
}

// ─── BREADTH ──────────────────────────────────────────────────────────────────
function scoreBreadth(breadth, mode = 'swingTrading') {
  const { pctAbove50d, adRatio, pctAbove200d } = breadth;

  // % above 50d MA (60 points)
  const pctScore = (pctAbove50d / 100) * 60;

  // A/D ratio (40 points)
  const adScore = Math.min(40, Math.max(0, (adRatio - 0.3) * 71.4));

  const score = pctScore + adScore;

  let interpretation = 'Deteriorating';
  if (pctAbove50d > 65 && adRatio > 0.6) interpretation = 'Healthy';
  else if (pctAbove50d > 50) interpretation = 'Mixed';
  else if (pctAbove50d < 35) interpretation = 'Oversold';

  return {
    score: Math.round(Math.min(100, score)),
    interpretation,
    details: `${pctAbove50d}% >50d MA | A/D ${adRatio} | ${interpretation}`,
    components: { pctScore: Math.round(pctScore), adScore: Math.round(adScore) },
  };
}

// ─── MACRO ────────────────────────────────────────────────────────────────────
function scoreMacro(yield10yr, dxy, fomc, mode = 'swingTrading') {
  let score = 50; // neutral base
  const components = {};

  // 10yr yield trend
  const yieldChange = yield10yr?.change || 0;
  let yieldScore = 50;
  if (yieldChange < -0.5) yieldScore = 80;      // yields falling = risk on
  else if (yieldChange < 0) yieldScore = 65;
  else if (yieldChange > 1.0) yieldScore = 20;   // yields rising fast = risk off
  else if (yieldChange > 0.3) yieldScore = 35;
  components.yieldScore = yieldScore;

  // DXY trend
  const dxyChange = dxy?.change || 0;
  let dxyScore = 50;
  if (dxyChange < -0.3) dxyScore = 80;           // weak dollar = risk on
  else if (dxyChange > 0.5) dxyScore = 25;       // strong dollar = risk off
  components.dxyScore = dxyScore;

  // Fed stance derived from yield level
  let fedStance = 'Neutral';
  const yieldLevel = yield10yr?.price || 4.5;
  if (yieldLevel < 3.8) fedStance = 'Dovish';
  else if (yieldLevel > 4.8) fedStance = 'Hawkish';

  score = (yieldScore + dxyScore) / 2;

  // FOMC penalty
  let fomcPenalty = 0;
  if (fomc.isSameDay) fomcPenalty = -35;
  else if (fomc.isImminent) fomcPenalty = -20;
  components.fomcPenalty = fomcPenalty;
  score = Math.max(0, score + fomcPenalty);

  let interpretation = 'Neutral';
  if (score > 65) interpretation = 'Supportive';
  else if (score < 35) interpretation = 'Restrictive';

  return {
    score: Math.round(score),
    interpretation,
    fedStance,
    details: `10yr ${yield10yr?.price?.toFixed(2) || 'N/A'}% | DXY ${dxy?.price?.toFixed(1) || 'N/A'} | Fed: ${fedStance}`,
    components,
  };
}

// ─── EXECUTION WINDOW ─────────────────────────────────────────────────────────
function scoreExecutionWindow(spy, sectors, vix) {
  let score = 50;

  // Are breakouts holding? (SPY above 20d and positive RSI momentum)
  if (spy.aboveMa20 && spy.rsi && spy.rsi > 50) score += 15;
  else if (!spy.aboveMa20) score -= 15;

  // Multi-day follow-through (SPY above all MAs)
  if (spy.aboveMa20 && spy.aboveMa50 && spy.aboveMa200) score += 15;

  // Pullbacks being bought (RSI not deeply oversold)
  if (spy.rsi && spy.rsi >= 40 && spy.rsi <= 60) score += 10;

  // Low volatility environment favors execution
  if (vix.price && vix.price < 18) score += 10;
  else if (vix.price && vix.price > 28) score -= 20;

  // Sector follow-through
  const positiveSectors = sectors.filter(s => s.change > 0.3).length;
  score += (positiveSectors / sectors.length) * 20 - 10;

  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    details: 'Based on price structure, MA positioning, and sector follow-through',
  };
}

// ─── FINAL SCORING ────────────────────────────────────────────────────────────
function calculateFinalScore(scores, mode = 'swingTrading') {
  const { volatility, momentum, trend, breadth, macro } = scores;
  
  const weighted =
    volatility.score * WEIGHTS.volatility +
    momentum.score   * WEIGHTS.momentum +
    trend.score      * WEIGHTS.trend +
    breadth.score    * WEIGHTS.breadth +
    macro.score      * WEIGHTS.macro;

  const marketQualityScore = Math.round(weighted);
  const thresholds = THRESHOLDS[mode] || THRESHOLDS.swingTrading;

  let decision, decisionColor, advice;
  if (marketQualityScore >= thresholds.yes) {
    decision = 'YES';
    decisionColor = 'green';
    advice = 'Full position sizing. Press risk on A+ setups.';
  } else if (marketQualityScore >= thresholds.caution) {
    decision = 'CAUTION';
    decisionColor = 'amber';
    advice = 'Half position size. A+ setups only. Manage risk tightly.';
  } else {
    decision = 'NO';
    decisionColor = 'red';
    advice = 'Avoid new positions. Preserve capital. Wait for better conditions.';
  }

  return {
    marketQualityScore,
    decision,
    decisionColor,
    advice,
    weights: WEIGHTS,
    thresholds: thresholds,
  };
}

module.exports = {
  scoreVolatility,
  scoreTrend,
  scoreMomentum,
  scoreBreadth,
  scoreMacro,
  scoreExecutionWindow,
  calculateFinalScore,
  WEIGHTS,
  THRESHOLDS,
};
