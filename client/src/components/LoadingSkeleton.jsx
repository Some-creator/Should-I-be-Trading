function SkeletonPanel() {
  return (
    <div className="skeleton-panel">
      <div className="flex-row">
        <div className="skeleton sk-line sk-xs" />
        <div className="skeleton sk-line" style={{ width: 30, marginLeft: 'auto' }} />
      </div>
      <div className="skeleton sk-big" style={{ width: '60%' }} />
      <div className="skeleton sk-line sk-sm" />
      <div className="divider" />
      <div className="skeleton sk-line" />
      <div className="skeleton sk-line sk-sm" />
      <div className="skeleton sk-line" />
      <div className="skeleton sk-line sk-xs" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="main-content">
      {/* Hero row */}
      <div className="hero-row">
        <div className="skeleton-panel" style={{ alignItems: 'center', gap: 16, minHeight: 280 }}>
          <div className="skeleton sk-line" style={{ width: 120 }} />
          <div className="skeleton" style={{ width: 100, height: 60, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 110, height: 110, borderRadius: '50%' }} />
          <div className="skeleton sk-line" style={{ width: 200 }} />
        </div>
        <div className="skeleton-panel" style={{ gap: 12, minHeight: 280 }}>
          <div className="skeleton sk-line sk-xs" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-row" style={{ gap: 8 }}>
              <div className="skeleton sk-line" style={{ width: 80 }} />
              <div className="skeleton sk-line" style={{ flex: 1 }} />
              <div className="skeleton sk-line" style={{ width: 30 }} />
            </div>
          ))}
        </div>
      </div>

      {/* 5 panels */}
      <div className="panels-grid">
        {[1, 2, 3, 4, 5].map(i => <SkeletonPanel key={i} />)}
      </div>

      {/* Sector heatmap */}
      <div className="skeleton-panel" style={{ gap: 8 }}>
        <div className="skeleton sk-line sk-xs" />
        {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <div key={i} className="flex-row">
            <div className="skeleton sk-line" style={{ width: 50 }} />
            <div className="skeleton sk-line" style={{ flex: 1 }} />
            <div className="skeleton sk-line" style={{ width: 50 }} />
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="bottom-row">
        <div className="skeleton-panel" style={{ minHeight: 120 }}>
          <div className="skeleton sk-line sk-xs" />
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line sk-sm" />
          <div className="skeleton sk-line" />
        </div>
        <div className="skeleton-panel" style={{ gap: 8, minHeight: 120 }}>
          <div className="skeleton sk-line sk-xs" />
          {[1,2,3].map(i => (
            <div key={i} className="flex-col">
              <div className="skeleton sk-line sk-sm" />
              <div className="skeleton sk-line" style={{ height: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
