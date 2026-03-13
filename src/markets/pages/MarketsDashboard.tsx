import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBatchQuotes, searchTickers, DEFAULT_WATCHLIST,
  formatMarketCap, type DashboardTicker, type SearchResult,
} from "../data/api";
import { StatBox } from "../components/MarketComponents";

const categories = ["All", "Technology", "Communication", "Industrials", "Consumer", "Healthcare", "Financial"];

export default function MarketsDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tickers, setTickers] = useState<DashboardTicker[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch live prices for watchlist on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBatchQuotes(DEFAULT_WATCHLIST);
        if (!cancelled) {
          setTickers(data);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Failed to load live prices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Live search with debounce
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchTickers(search);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter by sector
  const filtered = category === "All"
    ? tickers
    : tickers.filter((t) => t.sector.toLowerCase().includes(category.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Markets
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400 font-mono">RESEARCH TERMINAL</p>
                {!loading && tickers.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                )}
                {loading && (
                  <span className="text-[10px] font-mono text-gray-400 animate-pulse">Loading live prices...</span>
                )}
              </div>
            </div>
            <button onClick={() => navigate("/home")} className="text-xs text-gray-400 hover:text-gray-600 font-mono">
              ← BACK TO LAB
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search any ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
            />
            {/* Live search dropdown */}
            {search && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => {
                      navigate(`/markets/ticker/${r.symbol}`);
                      setSearch("");
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-gray-900">{r.symbol}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{r.exchange}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-mono tracking-wider rounded-md whitespace-nowrap transition-colors ${
                category === cat ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox label="Watchlist" value={`${tickers.length}`} sub="tickers" />
          <StatBox
            label="Gainers"
            value={`${tickers.filter(t => t.change > 0).length}`}
            sub={`of ${tickers.length}`}
          />
          <StatBox
            label="Losers"
            value={`${tickers.filter(t => t.change < 0).length}`}
            sub={`of ${tickers.length}`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-600 font-mono">{error}</div>
        )}

        {/* Ticker Cards */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="h-5 w-16 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-12 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filtered.map((ticker) => (
              <TickerCard key={ticker.symbol} ticker={ticker} onClick={() => navigate(`/markets/ticker/${ticker.symbol}`)} />
            ))
          )}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-mono text-sm">No tickers found</div>
        )}

        {/* Data source attribution */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[10px] text-gray-300 font-mono">
            Live prices via Financial Modeling Prep · Analysis powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}

function TickerCard({ ticker, onClick }: { ticker: DashboardTicker; onClick: () => void }) {
  const pct = ticker.change;
  const pctColor = pct >= 0 ? "text-emerald-600" : "text-red-600";
  const pctBg = pct >= 0 ? "bg-emerald-50" : "bg-red-50";

  return (
    <div onClick={onClick} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-gray-900 font-mono">{ticker.symbol}</span>
            {ticker.sector && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-500 rounded">{ticker.sector}</span>
            )}
          </div>
          <p className="text-xs text-gray-400">{ticker.name} · {ticker.exchange}</p>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold text-gray-900 font-mono">${ticker.price.toFixed(2)}</div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${pctColor} ${pctBg}`}>
            {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
          <span>Vol: {formatVol(ticker.volume)}</span>
          <span>MCap: {formatMarketCap(ticker.marketCap)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
          <span>52W: ${ticker.yearLow.toFixed(0)} — ${ticker.yearHigh.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

function formatVol(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return `${vol}`;
}
