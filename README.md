# Should I Be Trading? 🚦

A live, auto-refreshing Bloomberg Terminal-style market intelligence dashboard. It evaluates the current stock market environment for swing traders and outputs a clear actionable decision (YES, CAUTION, or NO) along with a quantified Market Quality Score.

![Should I Be Trading? Dashboard Screenshot](https://raw.githubusercontent.com/Some-creator/Should-I-be-Trading/main/dashboard_preview.png)

## Features

- **Live Market Data**: Real-time prices for SPY, QQQ, VIX, DXY, 10-Yr Treasury, and all 11 S&P 500 sectors via Yahoo Finance.
- **Scoring Engine**: Evaluates market conditions across 5 categories:
  - Volatility (25%)
  - Momentum (25%)
  - Trend (20%)
  - Breadth (20%)
  - Macro/Liquidity (10%)
- **AI Terminal Analysis**: Rule-based text generation providing a concise narrative of the market environment.
- **Bloomberg Terminal Aesthetic**: High-signal UI with dark theme, monospace fonts, and color-coded indicators.
- **Auto-Refresh**: Dashboard polls the server every 45 seconds to keep data live.
- **Trading Modes**: Toggle between Swing Trading (standard thresholds) and Day Trading (tighter thresholds).

## Architecture

- **Backend**: Node.js + Express
  - `yahoo-finance2` for free live market data
  - In-memory 30s caching layer to reduce API load
  - Custom breadth estimator (derives breadth from live sector data)
- **Frontend**: React + Vite
  - No external CSS framework; entirely custom CSS for the terminal look
  - Modular, reusable React components (`HeroPanel`, `MarketPanel`, `SectorHeatmap`, etc.)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Git

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Some-creator/Should-I-be-Trading.git
   cd "Should-I-be-Trading"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Start the application (runs both backend and frontend concurrently):**
   ```bash
   npm run dev
   ```

4. **View the dashboard:**
   Open [http://localhost:5173](http://localhost:5173) in your browser. The backend API will be running on port 3001.

## Scoring System Details

The backend (`src/scoring/scoringEngine.js`) uses editable constants to determine market health:

| Metric | Max Score | Key Indicators |
|---|---|---|
| **Volatility** | 25 points | VIX level, 5-day slope, 1-year percentile |
| **Momentum** | 25 points | Positive sectors count, Relative Strength spread |
| **Trend** | 20 points | SPY vs 20d/50d/200d MAs, SPY RSI regime |
| **Breadth** | 20 points | Estimated % above MAs, A/D Ratio |
| **Macro/Liq.** | 10 points | 10-yr Yield trend, Dollar Index (DXY), FOMC proximity |

**Decision Thresholds:**
- **80–100 → YES**: Full position sizing
- **60–79 → CAUTION**: Half size, A+ setups only
- **<60 → NO**: Preserve capital

*Note: Live exact breadth data (like exact Advance/Decline line or raw NYSE % above MAs) is not freely available. The system uses sector ETF performance distribution to provide highly correlated estimates.*
