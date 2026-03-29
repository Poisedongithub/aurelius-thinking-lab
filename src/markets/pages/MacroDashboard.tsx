import { useNavigate } from "react-router-dom";
import {
  TradingViewMarketOverview,
  TradingViewStockHeatmap,
  TradingViewEconomicCalendar,
  TradingViewTopStories,
  TradingViewTickerTape,
  TradingViewSymbolOverview,
} from "../components/TradingViewWidgets";

export default function MacroDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Ticker Tape */}
      <div className="border-b border-white/[0.04]">
        <TradingViewTickerTape />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Macro
                </h1>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-white/30 font-mono tracking-widest">GLOBAL MARKETS OVERVIEW</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/markets")} className="text-[10px] text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] font-mono tracking-wide rounded-lg px-2.5 py-1.5 transition-all">DASHBOARD</button>
              <button onClick={() => navigate("/markets/portfolio")} className="text-[10px] text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] font-mono tracking-wide rounded-lg px-2.5 py-1.5 transition-all">PORTFOLIO</button>
              <button onClick={() => navigate("/markets/screener")} className="text-[10px] text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] font-mono tracking-wide rounded-lg px-2.5 py-1.5 transition-all">SCREENER</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {/* Market Overview — Indices, Futures, Bonds, Forex */}
        <div>
          <h2 className="text-[11px] font-mono text-white/30 tracking-widest mb-3">MARKET OVERVIEW</h2>
          <TradingViewMarketOverview height={550} />
        </div>

        {/* Key Charts Grid — S&P 500, Bitcoin, Gold */}
        <div>
          <h2 className="text-[11px] font-mono text-white/30 tracking-widest mb-3">KEY CHARTS</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TradingViewSymbolOverview
              symbols={[["FOREXCOM:SPXUSD", "S&P 500"]]}
              height={350}
              chartType="area"
            />
            <TradingViewSymbolOverview
              symbols={[["BITSTAMP:BTCUSD", "Bitcoin"]]}
              height={350}
              chartType="area"
            />
            <TradingViewSymbolOverview
              symbols={[["COMEX:GC1!", "Gold"]]}
              height={350}
              chartType="area"
            />
          </div>
        </div>

        {/* S&P 500 Heatmap */}
        <div>
          <h2 className="text-[11px] font-mono text-white/30 tracking-widest mb-3">S&P 500 HEATMAP</h2>
          <TradingViewStockHeatmap height={550} />
        </div>

        {/* Economic Calendar + News side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="text-[11px] font-mono text-white/30 tracking-widest mb-3">ECONOMIC CALENDAR</h2>
            <TradingViewEconomicCalendar height={500} />
          </div>
          <div>
            <h2 className="text-[11px] font-mono text-white/30 tracking-widest mb-3">MARKET NEWS</h2>
            <TradingViewTopStories height={500} />
          </div>
        </div>

        <div className="text-center mt-12 pb-6">
          <p className="text-[10px] text-white/15 font-mono tracking-wider">
            Powered by TradingView · Live data via Massive API
          </p>
        </div>
      </div>
    </div>
  );
}
