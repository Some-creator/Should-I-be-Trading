export default function ScoreBreakdown({ scores, weights, marketQualityScore }) {
  const categories = [
    { key: 'volatility', name: 'Volatility',   weight: weights?.volatility || 0.25 },
    { key: 'momentum',   name: 'Momentum',     weight: weights?.momentum   || 0.25 },
    { key: 'trend',      name: 'Trend',        weight: weights?.trend      || 0.20 },
    { key: 'breadth',    name: 'Breadth',      weight: weights?.breadth    || 0.20 },
    { key: 'macro',      name: 'Macro/Liq.',   weight: weights?.macro      || 0.10 },
  ];

  function barColor(score) {
    if (score >= 70) return 'var(--green-dim)';
    if (score >= 45) return 'var(--amber-dim)';
    return 'var(--red-dim)';
  }

  function scoreClass(score) {
    if (score >= 70) return 'text-green';
    if (score >= 45) return 'text-amber';
    return 'text-red';
  }

  return (
    <div className="score-breakdown">
      <div className="panel-title">Score Breakdown · Market Quality = {marketQualityScore ?? '--'}</div>

      {categories.map(cat => {
        const s = scores?.[cat.key];
        const score = s?.score ?? 0;
        const contribution = Math.round(score * cat.weight);

        return (
          <div key={cat.key} className="breakdown-row">
            <span className="breakdown-name">{cat.name}</span>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{ width: `${score}%`, background: barColor(score) }}
              />
            </div>
            <span className={`breakdown-score ${scoreClass(score)}`}>{score}</span>
            <span className="breakdown-weight">{Math.round(cat.weight * 100)}%</span>
          </div>
        );
      })}

      <div className="divider" />

      {/* Category interpretation labels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map(cat => {
          const s = scores?.[cat.key];
          if (!s?.interpretation) return null;
          const cls = s.score >= 70 ? 'green' : s.score >= 45 ? 'amber' : 'red';
          return (
            <span key={cat.key} className={`panel-interp ${cls}`}>
              {cat.name}: {s.interpretation}
            </span>
          );
        })}
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {categories.map(cat => {
          const s = scores?.[cat.key];
          if (!s?.details) return null;
          return (
            <div key={cat.key} style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--text-dim)', marginRight: 6 }}>{cat.name.toUpperCase()}</span>
              {s.details}
            </div>
          );
        })}
      </div>
    </div>
  );
}
