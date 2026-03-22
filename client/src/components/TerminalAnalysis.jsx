import { useEffect, useState } from 'react';

export default function TerminalAnalysis({ analysis, decision }) {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!analysis) return;
    setDisplayed('');
    let i = 0;
    const speed = 18; // ms per char
    const timer = setInterval(() => {
      setDisplayed(analysis.slice(0, i + 1));
      i++;
      if (i >= analysis.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [analysis]);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(t);
  }, []);

  const decisionColor = decision === 'YES' ? 'var(--green)' : decision === 'NO' ? 'var(--red)' : 'var(--amber)';

  return (
    <div className="terminal-analysis">
      <div className="analysis-header">
        <span className="analysis-prompt" style={{ color: decisionColor }}>{'>'}_</span>
        <span className="analysis-title">Terminal Analysis</span>
        <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'var(--text-dim)' }}>AI SUMMARY</span>
      </div>
      <p className="analysis-text">
        {displayed || <span style={{ color: 'var(--text-dim)' }}>Generating analysis...</span>}
        {cursor && displayed.length < (analysis?.length || 0) && (
          <span style={{ color: 'var(--green)', marginLeft: 1 }}>█</span>
        )}
        {displayed && displayed.length === analysis?.length && cursor && (
          <span style={{ color: 'var(--green)', opacity: 0.4, marginLeft: 2 }}>█</span>
        )}
      </p>
    </div>
  );
}
