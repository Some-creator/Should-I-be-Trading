export default function SectorHeatmap({ sectors }) {
  if (!sectors || sectors.length === 0) return null;

  const sorted = [...sectors].sort((a, b) => b.change - a.change);
  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.change || 0)), 1);

  // Top 3 and bottom 3
  const leaders = new Set(sorted.slice(0, 3).map(s => s.symbol));
  const laggards = new Set(sorted.slice(-3).map(s => s.symbol));

  return (
    <div className="sector-heatmap">
      <div className="panel-title">
        Sector Performance (Daily) — {sectors.filter(s => s.change > 0).length}/11 Positive
      </div>

      <div className="sector-bars">
        {sorted.map(sector => {
          const change = sector.change ?? 0;
          const barWidth = Math.abs(change) / maxAbs * 48; // max 48% of track
          const isPositive = change >= 0;
          const isLeader  = leaders.has(sector.symbol);
          const isLaggard = laggards.has(sector.symbol);

          return (
            <div key={sector.symbol} className="sector-row">
              <span className="sector-name">
                {sector.symbol}
                {isLeader  && <span className="sector-tag leader">▲TOP</span>}
                {isLaggard && <span className="sector-tag laggard">▼BOT</span>}
              </span>

              <div className="sector-bar-track">
                <div className="sector-bar-zero" />
                <div
                  className={`sector-bar-fill ${isPositive ? 'positive' : 'negative'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <span className={`sector-change ${isPositive ? 'positive' : 'negative'}`}>
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>
          Leaders: <span style={{ color: 'var(--green-dim)' }}>{sorted.slice(0, 3).map(s => s.symbol).join(', ')}</span>
        </span>
        <span>
          Laggards: <span style={{ color: 'var(--red-dim)' }}>{sorted.slice(-3).map(s => s.symbol).join(', ')}</span>
        </span>
        <span>
          Spread: <span style={{ color: 'var(--amber)' }}>
            {((sorted[0]?.change || 0) - (sorted[10]?.change || 0)).toFixed(1)}%
          </span>
        </span>
      </div>
    </div>
  );
}
