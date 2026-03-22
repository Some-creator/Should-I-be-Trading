export default function AlertBanner({ fomc }) {
  if (!fomc?.isImminent) return null;

  const urgency = fomc.isSameDay ? 'TODAY' : `IN ${fomc.hoursUntil}H`;
  const msg = fomc.isSameDay
    ? `FOMC RATE DECISION TODAY — Expect volatility. Avoid new positions before the announcement.`
    : `FOMC MEETING IN ${fomc.daysUntil} DAY${fomc.daysUntil > 1 ? 'S' : ''} (${fomc.date}) — Reduce risk and trade smaller.`;

  return (
    <div className="alert-banner">
      <span className="alert-icon">⚠</span>
      <span className="alert-text">{msg}</span>
      <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--amber-dim)', fontWeight: 700 }}>
        {urgency}
      </span>
    </div>
  );
}
