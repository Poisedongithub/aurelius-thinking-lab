import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, themes } from "@/hooks/useTheme";
import {
  fetchBatchQuotes, searchTickers,
  formatMarketCap, type DashboardTicker, type SearchResult,
} from "../data/api";
import { useWatchlist } from "../data/WatchlistContext";
import {
  TradingViewTickerTape,
  TradingViewStockHeatmap,
  TradingViewTopStories,
} from "../components/TradingViewWidgets";

const categories = ["All", "Technology", "Communication", "Industrials", "Consumer", "Healthcare", "Financial"];

export default function MarketsDashboard() {
  const navigate = useNavigate();
  const { watchlist, removeTicker, addTicker } = useWatchlist();
  const { theme, setTheme } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);
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
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showNews, setShowNews] = useState(false);

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

  useEffect(() => {
    if (!search) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchTickers(search);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    <div className="terminal-page min-h-screen bg-[var(--t-bg)] text-[var(--t-text)]">
      {/* TradingView Ticker Tape */}
      <div className="border-b border-[var(--t-border)]">
        <TradingViewTickerTape />
      </div>

      {/* Header */}
      <div className="border-b border-[var(--t-border)]">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[36px] font-semibold tracking-tight text-[var(--t-text)]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Markets
                </h1>
                {!loading && tickers.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[14px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">RESEARCH TERMINAL</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate("/markets/portfolio")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all">PORTFOLIO</button>
              <button onClick={() => navigate("/markets/screener")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all">SCREENER</button>
              <button onClick={() => navigate("/markets/compare")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all">COMPARE</button>
              <button onClick={() => navigate("/markets/jacob")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all">JACOB</button>
              <button onClick={() => navigate("/markets/macro")} className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all">MACRO</button>
              <button onClick={() => navigate("/home")} className="text-[14px] text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] font-mono tracking-wide transition-colors">← BACK</button>
              {/* Theme Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="text-[14px] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] font-mono tracking-wide rounded-lg px-3.5 py-2 transition-all flex items-center gap-1.5"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  THEME
                </button>
                {showThemePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-[var(--t-bg-elevated)] border border-[var(--t-border-hover)] rounded-xl shadow-2xl z-50 p-3 min-w-[200px]">
                    <div className="text-[11px] font-mono text-[var(--t-text-muted)] tracking-wider mb-2">TERMINAL THEME</div>
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                          theme === t.id
                            ? "bg-[var(--t-group-active)] border border-[var(--t-border-hover)]"
                            : "hover:bg-[var(--t-btn-hover)] border border-transparent"
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full border border-[var(--t-border)]" style={{ backgroundColor: t.preview.bg }} />
                          <div className="w-4 h-4 rounded-full border border-[var(--t-border)]" style={{ backgroundColor: t.preview.accent }} />
                          <div className="w-4 h-4 rounded-full border border-[var(--t-border)]" style={{ backgroundColor: t.preview.text }} />
                        </div>
                        <div className="text-left">
                          <div className={`text-[13px] font-medium ${theme === t.id ? "text-[var(--t-text)]" : "text-[var(--t-text-secondary)]"}`}>{t.name}</div>
                          <div className="text-[10px] text-[var(--t-text-muted)]">{t.description}</div>
                        </div>
                        {theme === t.id && (
                          <svg className="w-4 h-4 ml-auto text-[var(--t-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search any ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--t-btn-bg)] border border-[var(--t-border)] rounded-xl text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-muted)] focus:outline-none focus:border-[var(--t-border-hover)] focus:bg-[var(--t-btn-bg)] transition-all font-mono"
            />
            {search && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--t-bg-hover)] border border-[var(--t-border)] rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto backdrop-blur-xl">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => { navigate(`/markets/ticker/${r.symbol}`); setSearch(""); }}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[var(--t-btn-bg)] transition-colors border-b border-[var(--t-border)] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-[var(--t-text)]">{r.symbol}</span>
                      <span className="text-xs text-[var(--t-text-secondary)] truncate max-w-[200px]">{r.name}</span>
                    </div>
                    <span className="text-[14px] text-[var(--t-text-muted)] font-mono">{r.exchange}</span>
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
              className={`px-4 py-2 text-[14px] font-mono tracking-wider rounded-lg whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-white text-black font-medium"
                  : "text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-bg)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-4 py-3.5">
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">WATCHLIST</div>
            <div className="text-xl font-semibold text-[var(--t-text)] tabular-nums">{watchlist.length}</div>
          </div>
          <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-4 py-3.5">
            <div className="text-[14px] text-emerald-400/60 font-mono tracking-widest mb-1">GAINERS</div>
            <div className="text-xl font-semibold text-emerald-400 tabular-nums">{gainers}</div>
          </div>
          <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-4 py-3.5">
            <div className="text-[14px] text-red-400/60 font-mono tracking-widest mb-1">LOSERS</div>
            <div className="text-xl font-semibold text-red-400 tabular-nums">{losers}</div>
          </div>
        </div>

        {/* Add Ticker Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-mono text-[var(--t-text-muted)] tracking-widest">YOUR WATCHLIST</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--t-text-secondary)] hover:text-[var(--t-text)] bg-[var(--t-btn-bg)] hover:bg-[var(--t-btn-hover)] border border-[var(--t-border)] hover:border-[var(--t-border-hover)] rounded-lg px-3 py-2 transition-all"
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
          <div className="text-center py-20 border border-dashed border-[var(--t-border)] rounded-xl">
            <svg className="w-10 h-10 mx-auto mb-3 text-[var(--t-text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm text-[var(--t-text-muted)] font-mono mb-1">Your watchlist is empty</p>
            <p className="text-[14px] text-[var(--t-text-dim)] font-mono mb-4">Add tickers to start tracking</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[14px] font-mono text-black bg-white hover:bg-[var(--t-accent)]/90 rounded-lg px-4 py-2 transition-all"
            >
              + ADD YOUR FIRST TICKER
            </button>
          </div>
        )}

        {/* Ticker List */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: Math.max(watchlist.length, 4) }).map((_, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-16 bg-[var(--t-btn-bg)] rounded mb-2" />
                    <div className="h-3 w-36 bg-[var(--t-btn-bg)] rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-20 bg-[var(--t-btn-bg)] rounded mb-2" />
                    <div className="h-3 w-14 bg-[var(--t-btn-bg)] rounded" />
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
          <div className="text-center py-20 text-[var(--t-text-muted)] font-mono text-sm">No tickers in this category</div>
        )}

        {/* Market Heatmap Toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex items-center gap-2 text-[14px] font-mono text-[var(--t-text-secondary)] hover:text-[var(--t-text)] transition-colors mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${showHeatmap ? "rotate-90" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            S&P 500 HEATMAP
          </button>
          {showHeatmap && (
            <TradingViewStockHeatmap height={500} />
          )}
        </div>

        {/* Market News Toggle */}
        <div className="mt-6">
          <button
            onClick={() => setShowNews(!showNews)}
            className="flex items-center gap-2 text-[14px] font-mono text-[var(--t-text-secondary)] hover:text-[var(--t-text)] transition-colors mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${showNews ? "rotate-90" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            MARKET NEWS
          </button>
          {showNews && (
            <TradingViewTopStories height={500} />
          )}
        </div>

        <div className="text-center mt-12 pb-6">
          <p className="text-[14px] text-[var(--t-text-dim)] font-mono tracking-wider">
            Charts by TradingView · Live data via Massive API · Analysis powered by DeepSeek AI
          </p>
        </div>
      </div>

      {/* Add Ticker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setAddSearch(""); setAddResults([]); }}>
          <div className="bg-[var(--t-bg-hover)] border border-[var(--t-border-hover)] rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--t-border)]">
              <h3 className="text-sm font-semibold text-[var(--t-text)] font-mono">Add to Watchlist</h3>
              <button onClick={() => { setShowAddModal(false); setAddSearch(""); setAddResults([]); }} className="text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search ticker or company..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[var(--t-btn-bg)] border border-[var(--t-border)] rounded-xl text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-muted)] focus:outline-none focus:border-[var(--t-border-hover)] focus:bg-[var(--t-btn-bg)] transition-all font-mono"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-4">
              {addSearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[var(--t-border-hover)] border-t-white/40 rounded-full animate-spin" />
                </div>
              )}
              {!addSearching && addSearch && addResults.length === 0 && (
                <div className="text-center py-8 text-[var(--t-text-muted)] font-mono text-xs">No results found</div>
              )}
              {!addSearching && addResults.map((r) => {
                const alreadyAdded = watchlist.includes(r.symbol);
                return (
                  <div
                    key={r.symbol}
                    className="flex items-center justify-between px-3 py-3 mx-1 rounded-lg hover:bg-[var(--t-btn-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono font-semibold text-[var(--t-text)]">{r.symbol}</span>
                      <span className="text-xs text-[var(--t-text-muted)] truncate">{r.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (alreadyAdded) { removeTicker(r.symbol); } else { addTicker(r.symbol); }
                      }}
                      className={`flex-shrink-0 text-[14px] font-mono px-3 py-1.5 rounded-lg transition-all ${
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
                  <p className="text-xs text-[var(--t-text-muted)] font-mono">Type to search for any stock</p>
                  <p className="text-[14px] text-[var(--t-text-dim)] font-mono mt-1">e.g. AAPL, Tesla, Bitcoin</p>
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
      className="group bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-5 py-4 cursor-pointer hover:bg-[var(--t-btn-bg)] hover:border-[var(--t-border-hover)] transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-xl font-semibold text-[var(--t-text)] font-mono tracking-wide">{ticker.symbol}</span>
              {ticker.sector && (
                <span className="text-[13px] font-mono text-[var(--t-text-muted)] bg-[var(--t-btn-bg)] px-2 py-0.5 rounded-md tracking-wider hidden sm:inline-block">{ticker.sector.toUpperCase()}</span>
              )}
            </div>
            <p className="text-[14px] text-[var(--t-text-muted)] truncate">{ticker.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-[14px] font-mono text-[var(--t-text-dim)]">
            {ticker.marketCap ? <span>MCap {formatMarketCap(ticker.marketCap)}</span> : null}
            <span>Vol {formatVol(ticker.volume)}</span>
          </div>
          <div className="text-right min-w-[100px]">
            <div className="text-xl font-semibold text-[var(--t-text)] font-mono tabular-nums">${ticker.price.toFixed(2)}</div>
            <div className={`text-sm font-mono tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}{pct.toFixed(2)}%
            </div>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isUp ? "bg-emerald-500/10" : "bg-red-500/10"
          }`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isUp ? "text-emerald-400" : "text-red-400 rotate-180"}>
              <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
            </svg>
          </div>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--t-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
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
