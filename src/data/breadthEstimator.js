/**
 * Breadth Estimator
 * Derives breadth indicators from available sector ETF and price data.
 * Since real-time breadth (NYSE A/D, % above MAs) isn't freely available,
 * we approximate from sector performance dispersion.
 */

/**
 * Estimate % of stocks above 50d MA from sector ETF performance
 * Positive correlates with broad participation
 */
function estimateBreadth(sectors, spyData) {
  const positiveCount = sectors.filter(s => s.change > 0).length;
  const sectorPositiveRatio = positiveCount / sectors.length;

  // Weighted estimate: sector ratio + SPY MA positioning
  let pctAbove50d = sectorPositiveRatio * 70; // sector component (0-70)
  
  // Add MA-based adjustment
  if (spyData.aboveMa200) pctAbove50d += 15;
  if (spyData.aboveMa50) pctAbove50d += 10;
  if (spyData.aboveMa20) pctAbove50d += 5;
  
  pctAbove50d = Math.min(Math.max(pctAbove50d, 5), 95);

  // Estimate % above 20d (more volatile, use daily change)
  const strongPositive = sectors.filter(s => s.change > 0.5).length;
  const pctAbove20d = Math.min(Math.max(
    (strongPositive / sectors.length) * 80 + (spyData.aboveMa20 ? 15 : 0),
    5, 95
  ), 95);

  // Estimate % above 200d (longer-term health)
  const pctAbove200d = Math.min(Math.max(
    pctAbove50d * 0.85 + (spyData.aboveMa200 ? 10 : 0),
    5, 95
  ), 95);

  // Advance/Decline ratio estimate
  const advancers = Math.round(sectors.filter(s => s.change >= 0).length / sectors.length * 2000);
  const decliners = 2000 - advancers;
  const adRatio = advancers / (advancers + decliners);

  // Nasdaq new highs vs lows estimate (from QQQ positioning + momentum)
  const positiveSectors = sectors.filter(s => s.change > 0).length;
  const newHighsEst = Math.round(positiveSectors * 25);
  const newLowsEst = Math.round((sectors.length - positiveSectors) * 8);

  return {
    pctAbove20d: Math.round(pctAbove20d),
    pctAbove50d: Math.round(pctAbove50d),
    pctAbove200d: Math.round(pctAbove200d),
    advancers,
    decliners,
    adRatio: Math.round(adRatio * 100) / 100,
    newHighsEst,
    newLowsEst,
    mclellanOscillator: Math.round((adRatio - 0.5) * 80), // approximation
    isEstimated: true,
  };
}

/**
 * Classify breadth health
 */
function classifyBreadth(breadth) {
  if (breadth.pctAbove50d > 70 && breadth.adRatio > 0.6) return 'Expanding';
  if (breadth.pctAbove50d < 40 || breadth.adRatio < 0.4) return 'Contracting';
  return 'Neutral';
}

module.exports = { estimateBreadth, classifyBreadth };
