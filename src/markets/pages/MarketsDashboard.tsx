import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBatchQuotes, searchTickers,
  formatMarketCap, type DashboardTicker, type SearchResult,
} from "../data/api";
import { useWatchlist } from "../data/WatchlistContext";

const categories = ["All", "Technology", "Communication", "Industrials", "Consumer", "Healthcare", "Financial"];

export default function MarketsDashboard() {
  const navigate = useNavigate();
  const { watchlist, removeTicker, addTicker } = useWatchlist();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tickers, setTickers] = useState<DashboardTicker[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addResults, setAddResults] = useState<SearchResult[]>([]);
  const [addSearching, setAddSearching] = useState(false);

  // Fetch live data for watchlist tickers
  useEffect(() => {
    if (watchlist.length === 0) {
      setTickers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBatchQuotes(watchlist);
        if (!cancelled) { setTickers(data); setError(""); }
      } catch {
        if (!cancelled) setError("Failed to load live prices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [watchlist]);

  // Main search (navigate to ticker)
  useEffect(() => {
    if (!search) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchTickers(search);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Add-ticker search
  useEffect(() => {
    if (!addSearch) { setAddResults([]); return; }
    setAddSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchTickers(addSearch);
      setAddResults(results);
      setAddSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [addSearch]);

  const filtered = category === "All"
    ? tickers
    : tickers.filter((t) => t.sector.toLowerCase().includes(category.toLowerCase()));

  const gainers = tickers.filter(t => t.change > 0).length;
  const losers = tickers.filter(t => t.change < 0).length;

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Markets
                </h1>
                {!loading && tickers.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/30 font-mono tracking-widest">RESEARCH TERMINAL</p>
            </div>
            <button onClick={() => navigate("/home")} className="text-[11px] text-white/30 hover:text-white/60 font-mono tracking-wide transition-colors">
              ← BACK
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search any ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all font-mono"
            />
            {search && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto backdrop-blur-xl">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => { navigate(`/markets/ticker/${r.symbol}`); setSearch(""); }}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-white">{r.symbol}</span>
                      <span className="text-xs text-white/40 truncate max-w-[200px]">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-white/20 font-mono">{r.exchange}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-[11px] font-mono tracking-wider rounded-lg whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-white text-black font-medium"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">WATCHLIST</div>
            <div className="text-xl font-semibold text-white tabular-nums">{watchlist.length}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <div className="text-[10px] text-emerald-400/60 font-mono tracking-widest mb-1">GAINERS</div>
            <div className="text-xl font-semibold text-emerald-400 tabular-nums">{gainers}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
            <div className="text-[10px] text-red-400/60 font-mono tracking-widest mb-1">LOSERS</div>
            <div className="text-xl font-semibold text-red-400 tabular-nums">{losers}</div>
          </div>
        </div>

        {/* Add Ticker Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-mono text-white/30 tracking-widest">YOUR WATCHLIST</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3 py-2 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            ADD TICKER
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-400 font-mono">{error}</div>
        )}

        {/* Empty Watchlist State */}
        {!loading && watchlist.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-xl">
            <svg className="w-10 h-10 mx-auto mb-3 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm text-white/25 font-mono mb-1">Your watchlist is empty</p>
            <p className="text-[11px] text-white/15 font-mono mb-4">Add tickers to start tracking</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[11px] font-mono text-black bg-white hover:bg-white/90 rounded-lg px-4 py-2 transition-all"
            >
              + ADD YOUR FIRST TICKER
            </button>
          </div>
        )}

        {/* Ticker List */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: Math.max(watchlist.length, 4) }).map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-16 bg-white/[0.06] rounded mb-2" />
                    <div className="h-3 w-36 bg-white/[0.04] rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-20 bg-white/[0.06] rounded mb-2" />
                    <div className="h-3 w-14 bg-white/[0.04] rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filtered.map((ticker) => (
              <TickerRow
                key={ticker.symbol}
                ticker={ticker}
                onClick={() => navigate(`/markets/ticker/${ticker.symbol}`)}
                onRemove={(e) => { e.stopPropagation(); removeTicker(ticker.symbol); }}
              />
            ))
          )}
        </div>

        {!loading && filtered.length === 0 && watchlist.length > 0 && (
          <div className="text-center py-20 text-white/20 font-mono text-sm">No tickers in this category</div>
        )}

        <div className="text-center mt-12 pb-6">
          <p className="text-[10px] text-white/15 font-mono tracking-wider">
            Live data via Massive API · Analysis powered by DeepSeek AI
          </p>
        </div>
      </div>

      {/* Add Ticker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setAddSearch(""); setAddResults([]); }}>
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white font-mono">Add to Watchlist</h3>
              <button onClick={() => { setShowAddModal(false); setAddSearch(""); setAddResults([]); }} className="text-white/20 hover:text-white/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 py-4">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search ticker or company..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all font-mono"
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto px-2 pb-4">
              {addSearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                </div>
              )}
              {!addSearching && addSearch && addResults.length === 0 && (
                <div className="text-center py-8 text-white/20 font-mono text-xs">No results found</div>
              )}
              {!addSearching && addResults.map((r) => {
                const alreadyAdded = watchlist.includes(r.symbol);
                return (
                  <div
                    key={r.symbol}
                    className="flex items-center justify-between px-3 py-3 mx-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono font-semibold text-white">{r.symbol}</span>
                      <span className="text-xs text-white/30 truncate">{r.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (alreadyAdded) {
                          removeTicker(r.symbol);
                        } else {
                          addTicker(r.symbol);
                        }
                      }}
                      className={`flex-shrink-0 text-[10px] font-mono px-3 py-1.5 rounded-lg transition-all ${
                        alreadyAdded
                          ? "text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                          : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      {alreadyAdded ? "REMOVE" : "+ ADD"}
                    </button>
                  </div>
                );
              })}
              {!addSearch && (
                <div className="text-center py-8">
                  <p className="text-xs text-white/20 font-mono">Type to search for any stock</p>
                  <p className="text-[10px] text-white/10 font-mono mt-1">e.g. AAPL, Tesla, Bitcoin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TickerRow({ ticker, onClick, onRemove }: { ticker: DashboardTicker; onClick: () => void; onRemove: (e: React.MouseEvent) => void }) {
  const pct = ticker.change;
  const isUp = pct >= 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4 cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-[15px] font-semibold text-white font-mono tracking-wide">{ticker.symbol}</span>
              {ticker.sector && (
                <span className="text-[9px] font-mono text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-md tracking-wider hidden sm:inline-block">{ticker.sector.toUpperCase()}</span>
              )}
            </div>
            <p className="text-[11px] text-white/30 truncate">{ticker.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Meta info */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-white/15">
            {ticker.marketCap ? <span>MCap {formatMarketCap(ticker.marketCap)}</span> : null}
            <span>Vol {formatVol(ticker.volume)}</span>
          </div>

          {/* Price + Change */}
          <div className="text-right min-w-[100px]">
            <div className="text-[15px] font-semibold text-white font-mono tabular-nums">${ticker.price.toFixed(2)}</div>
            <div className={`text-xs font-mono tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}{pct.toFixed(2)}%
            </div>
          </div>

          {/* Arrow */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isUp ? "bg-emerald-500/10" : "bg-red-500/10"
          }`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isUp ? "text-emerald-400" : "text-red-400 rotate-180"}>
              <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
            </svg>
          </div>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove from watchlist"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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
