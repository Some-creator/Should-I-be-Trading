function CircularScore({ score, color }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor = color === 'green' ? '#00ff9d' : color === 'red' ? '#ff3355' : '#ffb800';

  return (
    <div className="score-ring-container">
      <div className="score-ring">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle className="ring-bg" cx="55" cy="55" r={radius} />
          <circle
            className="ring-fill"
            cx="55" cy="55" r={radius}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-text-overlay">
          <span className={`score-number ${color}`}>{score}</span>
          <span className="score-pct">MQS</span>
        </div>
      </div>
      <span className="score-label">Market Quality</span>
    </div>
  );
}

export default function HeroPanel({ decision, decisionColor, score, advice, executionWindow }) {
  const execColor = executionWindow?.score >= 70 ? 'green' : executionWindow?.score >= 50 ? 'amber' : 'red';

  return (
    <div className={`hero-panel ${decisionColor}`}>
      <span className="decision-label">Should I Trade Today?</span>

      <span className={`decision-badge ${decisionColor}`}>
        {decision || '---'}
      </span>

      <CircularScore score={score ?? 0} color={decisionColor} />

      <p className="advice-text">{advice || 'Calculating...'}</p>

      <div className="execution-window">
        <span className="exec-label">⚡ Execution Window</span>
        <span className={`exec-score ${execColor}`}>
          {executionWindow?.score ?? '--'}/100
        </span>
      </div>
    </div>
  );
}
