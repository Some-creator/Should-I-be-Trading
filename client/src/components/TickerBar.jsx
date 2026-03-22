import { useEffect, useRef, useState } from 'react';

function fmt(val, decimals = 2) {
  if (val == null) return '---';
  return Number(val).toFixed(decimals);
}

function changeClass(change) {
  if (change == null) return 'flat';
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'flat';
}

export default function TickerBar({ tickers }) {
  const DEFAULT_TICKERS = [
    { symbol: 'SPY', price: null, change: null },
    { symbol: 'QQQ', price: null, change: null },
    { symbol: 'VIX', price: null, change: null },
    { symbol: 'DXY', price: null, change: null },
    { symbol: 'TNX', price: null, change: null },
  ];

  const items = tickers && tickers.length > 0 ? tickers : DEFAULT_TICKERS;
  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-symbol">{t.symbol}</span>
            <span className="ticker-price">
              {t.price != null ? fmt(t.price) : '—'}
            </span>
            {t.change != null && (
              <span className={`ticker-change ${changeClass(t.change)}`}>
                {t.change > 0 ? '+' : ''}{fmt(t.change, 2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
