export default function TopBar({ status, secondsAgo, mode, setMode, onRefresh, isRefreshing }) {
  return (
    <div className="top-bar">
      <div className="brand">
        <span className="brand-logo">SHOULD I TRADE?</span>
        <span className="brand-sub">Market Intelligence Terminal</span>
      </div>

      <div className="top-bar-right">
        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'swingTrading' ? 'active' : ''}`}
            onClick={() => setMode('swingTrading')}
          >
            SWING
          </button>
          <button
            className={`mode-btn ${mode === 'dayTrading' ? 'active' : ''}`}
            onClick={() => setMode('dayTrading')}
          >
            DAY
          </button>
        </div>

        {/* Status */}
        <div className="status-badge">
          <div className={`status-dot ${status}`} />
          <span style={{ color: status === 'live' ? 'var(--green)' : status === 'error' ? 'var(--red)' : 'var(--amber)', letterSpacing: '0.1em', fontSize: '10px' }}>
            {status === 'live' ? 'LIVE' : status === 'updating' ? 'UPDATING' : 'ERROR'}
          </span>
        </div>

        {/* Last update */}
        <span className="last-update">
          {secondsAgo < 5 ? 'just now' : `updated ${secondsAgo}s ago`}
        </span>

        {/* Refresh button */}
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          ⟳ REFRESH
        </button>
      </div>
    </div>
  );
}
