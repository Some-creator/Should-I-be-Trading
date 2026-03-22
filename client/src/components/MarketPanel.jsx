function fmt(val, decimals = 2) {
  if (val == null) return '---';
  return Number(val).toFixed(decimals);
}

function scoreColor(score) {
  if (score == null) return 'blue';
  if (score >= 70) return 'green';
  if (score >= 45) return 'amber';
  return 'red';
}

function directionArrow(val) {
  if (val == null) return '→';
  if (val > 0.1) return '↑';
  if (val < -0.1) return '↓';
  return '→';
}

function directionClass(val) {
  if (val == null) return 'flat';
  if (val > 0.1) return 'up';
  if (val < -0.1) return 'down';
  return 'flat';
}

// ── Volatility Panel ───────────────────────────────────────────────────
function VolatilityPanel({ vix, vvix, score }) {
  const sc = score?.score ?? 0;
  const col = scoreColor(sc);
  return (
    <div className="market-panel">
      <div className="panel-header">
        <span className="panel-name">⚡ Volatility</span>
        <span className={`panel-score-badge ${col}`}>{sc}</span>
      </div>
      <div>
        <div className="panel-main-value">
          <span className={`panel-big-number text-${col}`}>{fmt(vix?.price, 1)}</span>
          <span className={`panel-direction ${directionClass(vix?.slope5d)}`}>
            {directionArrow(vix?.slope5d)}
          </span>
        </div>
        <span className={`panel-interp ${col}`}>{score?.interpretation || 'Normal'}</span>
      </div>
      <div className="panel-metrics">
        <div className="metric-row">
          <span className="metric-label">VIX Level</span>
          <span className={`metric-value ${vix?.price > 20 ? 'red' : 'green'}`}>{fmt(vix?.price, 1)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">5d Slope</span>
          <span className={`metric-value ${vix?.slope5d > 0 ? 'red' : 'green'}`}>
            {vix?.slope5d != null ? `${vix.slope5d > 0 ? '+' : ''}${fmt(vix.slope5d, 1)}%` : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">1yr Pctile</span>
          <span className={`metric-value ${vix?.percentile1yr > 60 ? 'red' : 'amber'}`}>
            {vix?.percentile1yr != null ? `${vix.percentile1yr}th` : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">VVIX</span>
          <span className="metric-value">{fmt(vvix?.price, 1)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">P/C Est.</span>
          <span className={`metric-value ${vix?.putCallEstimate > 1 ? 'red' : 'green'}`}>
            {fmt(vix?.putCallEstimate, 2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Trend Panel ─────────────────────────────────────────────────────────
function TrendPanel({ spy, qqq, score }) {
  const sc = score?.score ?? 0;
  const col = scoreColor(sc);
  return (
    <div className="market-panel">
      <div className="panel-header">
        <span className="panel-name">📈 Trend</span>
        <span className={`panel-score-badge ${col}`}>{sc}</span>
      </div>
      <div>
        <div className="panel-main-value">
          <span className={`panel-big-number text-${col}`}>{fmt(spy?.price, 0)}</span>
          <span className={`panel-direction ${directionClass(spy?.change)}`}>
            {directionArrow(spy?.change)}
          </span>
        </div>
        <span className={`panel-interp ${col}`}>{score?.interpretation || 'Mixed'}</span>
      </div>
      <div className="panel-metrics">
        <div className="metric-row">
          <span className="metric-label">SPY &gt; 20d MA</span>
          <span className={`metric-value ${spy?.aboveMa20 ? 'green' : 'red'}`}>
            {spy?.aboveMa20 != null ? (spy.aboveMa20 ? '✓ Yes' : '✗ No') : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">SPY &gt; 50d MA</span>
          <span className={`metric-value ${spy?.aboveMa50 ? 'green' : 'red'}`}>
            {spy?.aboveMa50 != null ? (spy.aboveMa50 ? '✓ Yes' : '✗ No') : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">SPY &gt; 200d MA</span>
          <span className={`metric-value ${spy?.aboveMa200 ? 'green' : 'red'}`}>
            {spy?.aboveMa200 != null ? (spy.aboveMa200 ? '✓ Yes' : '✗ No') : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">SPY RSI (14)</span>
          <span className={`metric-value ${spy?.rsi >= 50 && spy?.rsi <= 68 ? 'green' : spy?.rsi > 75 || spy?.rsi < 35 ? 'red' : 'amber'}`}>
            {fmt(spy?.rsi, 1)}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">QQQ &gt; 50d</span>
          <span className={`metric-value ${qqq?.aboveMa50 ? 'green' : 'red'}`}>
            {qqq?.aboveMa50 != null ? (qqq.aboveMa50 ? '✓ Yes' : '✗ No') : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Regime</span>
          <span className={`metric-value ${spy?.regime === 'uptrend' ? 'green' : spy?.regime === 'downtrend' ? 'red' : 'amber'}`}>
            {spy?.regime ? spy.regime.toUpperCase() : '---'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Breadth Panel ───────────────────────────────────────────────────────
function BreadthPanel({ breadth, score }) {
  const sc = score?.score ?? 0;
  const col = scoreColor(sc);
  return (
    <div className="market-panel">
      <div className="panel-header">
        <span className="panel-name">🌐 Breadth</span>
        <span className={`panel-score-badge ${col}`}>{sc}</span>
      </div>
      <div>
        <div className="panel-main-value">
          <span className={`panel-big-number text-${col}`}>{breadth?.pctAbove50d ?? '--'}%</span>
          <span className={`panel-direction ${directionClass(breadth?.adRatio - 0.5)}`}>
            {directionArrow(breadth?.adRatio - 0.5)}
          </span>
        </div>
        <span className={`panel-interp ${col}`}>{score?.interpretation || 'Mixed'}</span>
      </div>
      <div className="panel-metrics">
        <div className="metric-row">
          <span className="metric-label">% &gt; 20d MA</span>
          <span className={`metric-value ${breadth?.pctAbove20d > 60 ? 'green' : 'red'}`}>
            {breadth?.pctAbove20d ?? '--'}%
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">% &gt; 50d MA</span>
          <span className={`metric-value ${breadth?.pctAbove50d > 60 ? 'green' : 'red'}`}>
            {breadth?.pctAbove50d ?? '--'}%
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">% &gt; 200d MA</span>
          <span className={`metric-value ${breadth?.pctAbove200d > 60 ? 'green' : 'red'}`}>
            {breadth?.pctAbove200d ?? '--'}%
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">A/D Ratio</span>
          <span className={`metric-value ${breadth?.adRatio > 0.55 ? 'green' : breadth?.adRatio < 0.45 ? 'red' : 'amber'}`}>
            {fmt(breadth?.adRatio, 2)}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">McClellan OSC</span>
          <span className={`metric-value ${breadth?.mclellanOscillator > 0 ? 'green' : 'red'}`}>
            {breadth?.mclellanOscillator ?? '--'}
          </span>
        </div>
      </div>
      {breadth?.isEstimated && (
        <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: 4 }}>
          ⓘ Breadth values are estimated from sector data
        </div>
      )}
    </div>
  );
}

// ── Momentum Panel ──────────────────────────────────────────────────────
function MomentumPanel({ sectors, score }) {
  const sc = score?.score ?? 0;
  const col = scoreColor(sc);
  const positive = sectors?.filter(s => s.change > 0).length ?? 0;
  const total = sectors?.length ?? 11;

  return (
    <div className="market-panel">
      <div className="panel-header">
        <span className="panel-name">🚀 Momentum</span>
        <span className={`panel-score-badge ${col}`}>{sc}</span>
      </div>
      <div>
        <div className="panel-main-value">
          <span className={`panel-big-number text-${col}`}>{positive}/{total}</span>
          <span className={`panel-direction ${positive >= 7 ? 'up' : positive >= 4 ? 'flat' : 'down'}`}>
            {positive >= 7 ? '↑' : positive >= 4 ? '→' : '↓'}
          </span>
        </div>
        <span className={`panel-interp ${col}`}>{score?.interpretation || 'Neutral'}</span>
      </div>
      <div className="panel-metrics">
        <div className="metric-row">
          <span className="metric-label">Sectors Green</span>
          <span className={`metric-value ${positive >= 7 ? 'green' : positive >= 4 ? 'amber' : 'red'}`}>
            {positive}/{total}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">RS Spread</span>
          <span className={`metric-value ${score?.rsSpread > 2 ? 'green' : 'amber'}`}>
            {score?.rsSpread != null ? `${score.rsSpread.toFixed(1)}%` : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Leaders</span>
          <span className="metric-value" style={{ fontSize: '9px' }}>{score?.leaders || '---'}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Laggards</span>
          <span className="metric-value" style={{ fontSize: '9px' }}>{score?.laggards || '---'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Macro Panel ─────────────────────────────────────────────────────────
function MacroPanel({ yield10yr, dxy, fomc, score }) {
  const sc = score?.score ?? 0;
  const col = scoreColor(sc);

  return (
    <div className="market-panel">
      <div className="panel-header">
        <span className="panel-name">🏦 Macro</span>
        <span className={`panel-score-badge ${col}`}>{sc}</span>
      </div>
      <div>
        <div className="panel-main-value">
          <span className={`panel-big-number text-${col}`}>{fmt(yield10yr?.price, 2)}%</span>
          <span className={`panel-direction ${directionClass(-(yield10yr?.change ?? 0))}`}>
            {yield10yr?.change < 0 ? '↑' : yield10yr?.change > 0 ? '↓' : '→'}
          </span>
        </div>
        <span className={`panel-interp ${col}`}>{score?.interpretation || 'Neutral'}</span>
      </div>
      <div className="panel-metrics">
        <div className="metric-row">
          <span className="metric-label">10yr Yield</span>
          <span className={`metric-value ${yield10yr?.change > 0.5 ? 'red' : yield10yr?.change < -0.3 ? 'green' : 'amber'}`}>
            {fmt(yield10yr?.price, 2)}%
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Yield Δ</span>
          <span className={`metric-value ${yield10yr?.change > 0 ? 'red' : 'green'}`}>
            {yield10yr?.change != null ? `${yield10yr.change > 0 ? '+' : ''}${fmt(yield10yr.change, 3)}%` : '---'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">DXY</span>
          <span className={`metric-value ${dxy?.change > 0.3 ? 'red' : dxy?.change < -0.3 ? 'green' : 'amber'}`}>
            {fmt(dxy?.price, 2)}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Fed Stance</span>
          <span className={`metric-value ${score?.fedStance === 'Dovish' ? 'green' : score?.fedStance === 'Hawkish' ? 'red' : 'amber'}`}>
            {score?.fedStance || 'Neutral'}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">FOMC</span>
          <span className={`metric-value ${fomc?.isImminent ? 'amber' : 'green'}`}>
            {fomc?.label || (fomc?.date ? `${fomc.date}` : 'No event soon')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── MarketPanel dispatcher ──────────────────────────────────────────────
export default function MarketPanel({ type, ...props }) {
  switch (type) {
    case 'volatility': return <VolatilityPanel {...props} />;
    case 'trend':      return <TrendPanel {...props} />;
    case 'breadth':    return <BreadthPanel {...props} />;
    case 'momentum':   return <MomentumPanel {...props} />;
    case 'macro':      return <MacroPanel {...props} />;
    default: return null;
  }
}
