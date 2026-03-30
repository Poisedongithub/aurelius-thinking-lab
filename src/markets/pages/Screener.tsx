import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScreener, ScreenerResult, formatMarketCap, formatVolume } from "../data/api";
import { TradingViewTickerTape, TradingViewScreener } from "../components/TradingViewWidgets";

const SECTORS = ["All", "Technology", "Communication", "Consumer", "Healthcare", "Financial", "Industrials"];
const MARKET_CAP_FILTERS = [
  { label: "All Caps", min: undefined, max: undefined },
  { label: "Mega (>$200B)", min: 200e9, max: undefined },
  { label: "Large ($10B-$200B)", min: 10e9, max: 200e9 },
  { label: "Mid ($2B-$10B)", min: 2e9, max: 10e9 },
  { label: "Small (<$2B)", min: undefined, max: 2e9 },
];

export default function Screener() {
  const navigate = useNavigate();
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [capFilter, setCapFilter] = useState(0);
  const [sortBy, setSortBy] = useState<"change" | "marketCap" | "volume">("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"tradingview" | "custom">("tradingview");

  useEffect(() => {
    if (view !== "custom") return;
    setLoading(true);
    const cap = MARKET_CAP_FILTERS[capFilter];
    fetchScreener({
      sector: sector === "All" ? undefined : sector,
      marketCapMin: cap.min,
      marketCapMax: cap.max,
      limit: 30,
    }).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [sector, capFilter, view]);

  const sorted = [...results].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
  });

  const toggleSort = (col: "change" | "marketCap" | "volume") => {
    if (sortBy === col) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="terminal-page min-h-screen bg-[var(--t-bg)] text-[var(--t-text)]">
      {/* Ticker Tape */}
      <div className="border-b border-[var(--t-border)]">
        <TradingViewTickerTape />
      </div>

      {/* Header */}
      <div className="border-b border-[var(--t-border)]">
        <div className="max-w-6xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-[var(--t-text)]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Screener
                </h1>
              </div>
              <p className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">FIND YOUR NEXT TRADE</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/markets")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-2.5 py-1.5 transition-all">DASHBOARD</button>
              <button onClick={() => navigate("/markets/macro")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-2.5 py-1.5 transition-all">MACRO</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView("tradingview")}
            className={`px-4 py-2 text-[14px] font-mono tracking-wider rounded-lg transition-all ${
              view === "tradingview" ? "bg-white text-black font-medium" : "text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-bg)]"
            }`}
          >
            TRADINGVIEW SCREENER
          </button>
          <button
            onClick={() => setView("custom")}
            className={`px-4 py-2 text-[14px] font-mono tracking-wider rounded-lg transition-all ${
              view === "custom" ? "bg-white text-black font-medium" : "text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-bg)]"
            }`}
          >
            CUSTOM SCREENER
          </button>
        </div>

        {view === "tradingview" ? (
          <TradingViewScreener height={700} />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <div className="text-[13px] text-[var(--t-text-muted)] font-mono uppercase mb-2">SECTOR</div>
                <div className="flex gap-1 flex-wrap">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSector(s)}
                      className={`px-3 py-1.5 text-[14px] font-mono rounded-lg border transition-all ${
                        sector === s
                          ? "bg-white text-black border-white font-bold"
                          : "border-[var(--t-border-hover)] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:border-white/20"
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[13px] text-[var(--t-text-muted)] font-mono uppercase mb-2">MARKET CAP</div>
                <div className="flex gap-1 flex-wrap">
                  {MARKET_CAP_FILTERS.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setCapFilter(i)}
                      className={`px-3 py-1.5 text-[14px] font-mono rounded-lg border transition-all ${
                        capFilter === i
                          ? "bg-white text-black border-white font-bold"
                          : "border-[var(--t-border-hover)] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:border-white/20"
                      }`}
                    >
                      {f.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[14px] text-[var(--t-text-muted)] font-mono mb-3">
              {loading ? "SCANNING..." : `${sorted.length} RESULTS`}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-[var(--t-stat-bg)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-[var(--t-text-muted)] text-xs font-mono">No stocks match your filters</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-[var(--t-text-muted)] border-b border-[var(--t-border)]">
                      <th className="text-left py-3 font-normal">TICKER</th>
                      <th className="text-left py-3 font-normal">NAME</th>
                      <th className="text-right py-3 font-normal">PRICE</th>
                      <th className="text-right py-3 font-normal cursor-pointer hover:text-[var(--t-text-secondary)]" onClick={() => toggleSort("change")}>
                        CHANGE {sortBy === "change" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                      </th>
                      <th className="text-right py-3 font-normal cursor-pointer hover:text-[var(--t-text-secondary)]" onClick={() => toggleSort("volume")}>
                        VOLUME {sortBy === "volume" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                      </th>
                      <th className="text-right py-3 font-normal cursor-pointer hover:text-[var(--t-text-secondary)]" onClick={() => toggleSort("marketCap")}>
                        MKT CAP {sortBy === "marketCap" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                      </th>
                      <th className="text-right py-3 font-normal">SECTOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((stock) => (
                      <tr
                        key={stock.symbol}
                        onClick={() => navigate(`/markets/ticker/${stock.symbol}`)}
                        className="border-b border-white/[0.03] hover:bg-[var(--t-stat-bg)] cursor-pointer transition-colors"
                      >
                        <td className="py-3 text-[var(--t-text)] font-bold">{stock.symbol}</td>
                        <td className="py-3 text-[var(--t-text-secondary)] max-w-[200px] truncate">{stock.name}</td>
                        <td className="py-3 text-right text-[var(--t-text)]">${stock.price?.toFixed(2)}</td>
                        <td className={`py-3 text-right ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {stock.change >= 0 ? "+" : ""}{stock.change?.toFixed(2)}%
                        </td>
                        <td className="py-3 text-right text-[var(--t-text-secondary)]">{formatVolume(stock.volume)}</td>
                        <td className="py-3 text-right text-[var(--t-text-secondary)]">{stock.marketCap ? formatMarketCap(stock.marketCap) : "—"}</td>
                        <td className="py-3 text-right">
                          {stock.sector && (
                            <span className="text-[13px] px-2 py-0.5 rounded bg-white/5 text-[var(--t-text-secondary)]">{stock.sector.toUpperCase()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12 pb-6">
          <p className="text-[14px] text-[var(--t-text-dim)] font-mono tracking-wider">
            Powered by TradingView · Live data via Massive API
          </p>
        </div>
      </div>
    </div>
  );
}
