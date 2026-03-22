import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import TickerBar from './components/TickerBar';
import TopBar from './components/TopBar';
import AlertBanner from './components/AlertBanner';
import HeroPanel from './components/HeroPanel';
import ScoreBreakdown from './components/ScoreBreakdown';
import MarketPanel from './components/MarketPanel';
import SectorHeatmap from './components/SectorHeatmap';
import TerminalAnalysis from './components/TerminalAnalysis';
import BreadthDetail from './components/BreadthDetail';
import LoadingSkeleton from './components/LoadingSkeleton';

const API_BASE = ''; // Uses Vite proxy → http://localhost:3001
const REFRESH_INTERVAL = 45 * 1000; // 45 seconds

export default function App() {
  const [data, setData] = useState(null);
  const [tickerData, setTickerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('swingTrading');
  const [status, setStatus] = useState('live'); // live | updating | error
  const [lastUpdate, setLastUpdate] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const refreshTimer = useRef(null);
  const countTimer = useRef(null);

  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ticker`);
      if (res.ok) {
        const json = await res.json();
        setTickerData(json.tickers);
      }
    } catch (_) {}
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setStatus('updating');
    else setStatus('updating');
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/market?mode=${mode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
      setSecondsAgo(0);
      setStatus('live');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setLoading(false);
    }
  }, [mode]);

  // Initial fetch + re-fetch when mode changes
  useEffect(() => {
    setLoading(true);
    fetchData();
    fetchTicker();
  }, [mode]);

  // Auto-refresh
  useEffect(() => {
    refreshTimer.current = setInterval(() => {
      fetchData();
      fetchTicker();
    }, REFRESH_INTERVAL);
    return () => clearInterval(refreshTimer.current);
  }, [fetchData, fetchTicker]);

  // Seconds-ago counter
  useEffect(() => {
    countTimer.current = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(countTimer.current);
  }, [lastUpdate]);

  if (loading) {
    return (
      <div className="app">
        <div className="top-bar" style={{ justifyContent: 'center', padding: '12px' }}>
          <span className="brand-logo">SHOULD I BE TRADING?</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  const md = data?.marketData;
  const scores = data?.scores;

  return (
    <div className="app">
      <TickerBar tickers={tickerData} />

      <TopBar
        status={status}
        secondsAgo={secondsAgo}
        mode={mode}
        setMode={setMode}
        onRefresh={() => { fetchData(true); fetchTicker(); }}
        isRefreshing={status === 'updating'}
      />

      {data?.fomc?.isImminent && (
        <AlertBanner fomc={data.fomc} />
      )}

      {error && !data && (
        <div className="main-content">
          <div className="error-panel">
            ⚠ Cannot connect to data server. Make sure the backend is running on port 3001.<br/>
            <small style={{opacity: 0.6}}>{error}</small>
          </div>
        </div>
      )}

      {data && (
        <div className="main-content">
          {/* Hero + Score breakdown */}
          <div className="hero-row">
            <HeroPanel
              decision={data.decision}
              decisionColor={data.decisionColor}
              score={data.marketQualityScore}
              advice={data.advice}
              executionWindow={data.executionWindow}
            />
            <ScoreBreakdown
              scores={scores}
              weights={data.weights}
              marketQualityScore={data.marketQualityScore}
            />
          </div>

          {/* 5 Core panels */}
          <div className="panels-grid">
            <MarketPanel type="volatility" vix={md.vix} vvix={md.vvix} score={scores.volatility} />
            <MarketPanel type="trend" spy={md.spy} qqq={md.qqq} score={scores.trend} />
            <MarketPanel type="breadth" breadth={md.breadth} score={scores.breadth} />
            <MarketPanel type="momentum" sectors={md.sectors} score={scores.momentum} />
            <MarketPanel type="macro" yield10yr={md.yield10yr} dxy={md.dxy} fomc={data.fomc} score={scores.macro} />
          </div>

          {/* Sector heatmap */}
          <SectorHeatmap sectors={md.sectors} />

          {/* Bottom row */}
          <div className="bottom-row">
            <TerminalAnalysis analysis={data.analysis} decision={data.decision} />
            <BreadthDetail breadth={md.breadth} />
          </div>
        </div>
      )}
    </div>
  );
}
