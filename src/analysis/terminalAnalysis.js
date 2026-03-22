/**
 * Terminal Analysis Engine
 * Rule-based narrative generator — no API key needed.
 * Produces a concise 2-3 sentence market summary based on scored conditions.
 */

function generateAnalysis(scores, finalScore, marketData, mode = 'swingTrading') {
  const { decision, marketQualityScore } = finalScore;
  const { volatility, trend, breadth, momentum, macro } = scores;

  const parts = [];

  // ── Environment characterization ─────────────────────────────────────────
  if (trend.score >= 75) {
    parts.push(`This is a ${trend.interpretation.toLowerCase()} environment with ${marketQualityScore >= 70 ? 'solid' : 'developing'} price structure across major averages.`);
  } else if (trend.score >= 50) {
    parts.push(`The market is showing a mixed trend structure, with SPY holding ${trend.components.above200 ? 'above' : 'below'} its 200-day moving average.`);
  } else {
    parts.push(`Market structure is deteriorating — SPY is positioned below key moving averages, signaling caution.`);
  }

  // ── Volatility context ────────────────────────────────────────────────────
  const vixVal = marketData?.vix?.price;
  if (vixVal) {
    if (vixVal < 16) {
      parts.push(`Volatility is subdued (VIX ${vixVal.toFixed(1)}), supporting clean entry conditions for ${mode === 'dayTrading' ? 'intraday' : 'swing'} setups.`);
    } else if (vixVal < 22) {
      parts.push(`Volatility is moderate (VIX ${vixVal.toFixed(1)}) — manageable, but size accordingly and use defined risk.`);
    } else if (vixVal < 30) {
      parts.push(`Elevated volatility (VIX ${vixVal.toFixed(1)}) is compressing edge; reduce size and focus only on highest-quality setups.`);
    } else {
      parts.push(`Danger: VIX is spiking at ${vixVal.toFixed(1)} — market is in risk-off mode. Avoid new longs.`);
    }
  }

  // ── Breadth + sector leadership ───────────────────────────────────────────
  const sectorLeaders = momentum.leaders || '';
  const breadthInterp = breadth.interpretation;

  if (momentum.score >= 70) {
    parts.push(`Sector participation is ${momentum.interpretation.toLowerCase()}, led by ${sectorLeaders}. Momentum conditions favor trend-following strategies.`);
  } else if (momentum.score >= 45) {
    parts.push(`Sector leadership is selective, concentrated in ${sectorLeaders}. Favor liquid, momentum-confirmed names over broad exposure.`);
  } else {
    parts.push(`Sector breadth is thin (${momentum.interpretation.toLowerCase()}) — avoid chasing breakouts. Focus on relative strength leaders only.`);
  }

  // ── Macro context ─────────────────────────────────────────────────────────
  if (macro.components?.fomcPenalty < -15) {
    parts.push(`⚠️ FOMC event is imminent — expect heightened uncertainty. Hold cash; avoid initiating new risk before the announcement.`);
  } else if (macro.score >= 65) {
    parts.push(`Macro tailwinds are supportive. Fed stance is ${macro.fedStance?.toLowerCase()}, and yield trends are not headwinds to equities.`);
  } else if (macro.score < 35) {
    parts.push(`Macro environment is restrictive — rising yields and/or dollar strength are headwinds to risk assets.`);
  }

  // ── Final recommendation ──────────────────────────────────────────────────
  if (decision === 'YES') {
    parts.push(`Conclusion: Conditions are favorable for swing trading. Deploy capital into high-quality setups with standard position sizing.`);
  } else if (decision === 'CAUTION') {
    parts.push(`Conclusion: Trade with caution — reduce size by 50%, stick to A+ patterns only, and avoid extended names.`);
  } else {
    parts.push(`Conclusion: This is not the time to trade. Market conditions do not support favorable risk/reward. Sit on cash and monitor.`);
  }

  return parts.join(' ');
}

module.exports = { generateAnalysis };
