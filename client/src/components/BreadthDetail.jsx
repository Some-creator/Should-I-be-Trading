function BreadthBar({ label, value, color }) {
  return (
    <div className="breadth-bar-item">
      <div className="breadth-bar-label-row">
        <span>{label}</span>
        <span style={{ color: value > 60 ? 'var(--green)' : value < 40 ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>
          {value ?? '--'}%
        </span>
      </div>
      <div className="breadth-bar-track">
        <div
          className="breadth-bar-fill-inner"
          style={{
            width: `${value ?? 0}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
}

export default function BreadthDetail({ breadth }) {
  if (!breadth) return null;

  return (
    <div className="breadth-detail">
      <div className="panel-title">Breadth Detail</div>

      <div className="breadth-bar-group">
        <BreadthBar label="% Stocks Above 200d MA" value={breadth.pctAbove200d} color="var(--blue-dim)" />
        <BreadthBar label="% Stocks Above 50d MA"  value={breadth.pctAbove50d}  color="var(--green-dim)" />
        <BreadthBar label="% Stocks Above 20d MA"  value={breadth.pctAbove20d}  color="var(--green)" />
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div className="metric-row">
          <span className="metric-label">Advancers (est.)</span>
          <span className="metric-value text-green">{breadth.advancers?.toLocaleString()}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Decliners (est.)</span>
          <span className="metric-value text-red">{breadth.decliners?.toLocaleString()}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">A/D Ratio</span>
          <span className={`metric-value ${breadth.adRatio > 0.55 ? 'text-green' : breadth.adRatio < 0.45 ? 'text-red' : 'text-amber'}`}>
            {breadth.adRatio?.toFixed(3)}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">New Highs (est.)</span>
          <span className="metric-value text-green">{breadth.newHighsEst}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">New Lows (est.)</span>
          <span className="metric-value text-red">{breadth.newLowsEst}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">McClellan OSC</span>
          <span className={`metric-value ${breadth.mclellanOscillator > 0 ? 'text-green' : 'text-red'}`}>
            {breadth.mclellanOscillator > 0 ? '+' : ''}{breadth.mclellanOscillator}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Classification</span>
          <span className={`metric-value ${breadth.classification === 'Expanding' ? 'text-green' : breadth.classification === 'Contracting' ? 'text-red' : 'text-amber'}`}>
            {breadth.classification}
          </span>
        </div>
      </div>

      {breadth.isEstimated && (
        <p style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: 4 }}>
          ⓘ Values estimated from sector ETF data. For precise breadth, integrate a paid data provider.
        </p>
      )}
    </div>
  );
}
