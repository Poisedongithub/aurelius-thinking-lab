import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAnalyses, allThemes, searchTickers as mockSearch, type TickerAnalysis } from "../data/mockData";
import { getAllWithLivePrices, hybridSearch } from "../data/api";
import { Tag, ConfidenceDots, StatBox } from "../components/MarketComponents";

const categories = ["All", "Semiconductors", "Networking", "Internet", "Industrials", "Advertising"];

export default function MarketsDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [analyses, setAnalyses] = useState<TickerAnalysis[]>(getAllAnalyses());
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; exchange: string; hasMockData: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLive, setPricesLive] = useState(false);
  const theme = allThemes["ai-infrastructure"];

  // Fetch live prices on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const liveData = await getAllWithLivePrices();
        if (!cancelled && liveData.length > 0) {
          setAnalyses(liveData);
          setPricesLive(true);
        }
      } catch {
        // Keep mock data on failure
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
      const results = await hybridSearch(search);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter by category
  const displayAnalyses = search
    ? analyses.filter(a => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
    : analyses;

  const filtered = category === "All" ? displayAnalyses : displayAnalyses.filter((a) => {
    if (category === "Semiconductors") return ["Semiconductors"].includes(a.industry);
    if (category === "Networking") return a.industry.includes("Networking");
    if (category === "Internet") return a.industry.includes("Internet") || a.industry.includes("Retail");
    if (category === "Industrials") return a.sector === "Industrials";
    if (category === "Advertising") return a.industry.includes("Advertising") || a.industry.includes("Social");
    return true;
  });

  const rankColor = (rank: string) => {
    if (rank === "Lead") return "green";
    if (rank === "Strong Watch") return "blue";
    if (rank === "Watch") return "yellow";
    return "gray";
  };

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
                {pricesLive && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                )}
                {loading && (
                  <span className="text-[10px] font-mono text-gray-400 animate-pulse">Loading prices...</span>
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
              placeholder="Search ticker, company, or sector..."
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">{r.exchange}</span>
                      {r.hasMockData && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-mono">TRACKED</span>}
                    </div>
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
          <StatBox label="Tracked" value={`${analyses.length}`} sub="tickers" />
          <StatBox label="Top Score" value={`${Math.max(...analyses.map(a => a.processScore.total))}`} sub="/ 100" />
          <StatBox label="Themes" value={`${Object.keys(allThemes).length}`} sub="active" />
        </div>

        {/* Theme Card */}
        {theme && (
          <div
            className="bg-white border border-gray-200 rounded-lg p-5 mb-6 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => navigate("/markets/theme/ai-infrastructure")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Active Theme</span>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>{theme.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{theme.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {theme.candidateStocks.map((s) => (
                <span key={s.symbol} className="px-2 py-1 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded">{s.symbol}</span>
              ))}
            </div>
          </div>
        )}

        {/* Ticker Cards */}
        <div className="space-y-3">
          {filtered.map((ticker) => (
            <TickerCard key={ticker.symbol} ticker={ticker} rankColor={rankColor} onClick={() => navigate(`/markets/ticker/${ticker.symbol}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-mono text-sm">No tickers found</div>
        )}

        {/* Data source attribution */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[10px] text-gray-300 font-mono">
            {pricesLive ? "Live prices via Financial Modeling Prep" : "Using cached price data"} · Analysis powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}

function TickerCard({ ticker, rankColor, onClick }: { ticker: TickerAnalysis; rankColor: (r: string) => string; onClick: () => void }) {
  const pct = ticker.price.dayMovePct;
  const pctColor = pct >= 0 ? "text-emerald-600" : "text-red-600";
  const pctBg = pct >= 0 ? "bg-emerald-50" : "bg-red-50";

  return (
    <div onClick={onClick} className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-gray-900 font-mono">{ticker.symbol}</span>
            <Tag label={ticker.processScore.rank} color={rankColor(ticker.processScore.rank)} />
          </div>
          <p className="text-xs text-gray-400">{ticker.name} · {ticker.industry}</p>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold text-gray-900 font-mono">${ticker.price.price.toFixed(2)}</div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${pctColor} ${pctBg}`}>
            {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{ticker.attentionTrigger.whyThisNameNow}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-mono">SCORE</span>
            <span className="text-sm font-semibold font-mono text-gray-900">{ticker.processScore.total}</span>
          </div>
          <ConfidenceDots value={ticker.processScore.total} />
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono text-gray-400">1W: <span className={ticker.price.weekMovePct >= 0 ? "text-emerald-600" : "text-red-600"}>{ticker.price.weekMovePct >= 0 ? "+" : ""}{ticker.price.weekMovePct.toFixed(1)}%</span></span>
          <span className="text-[10px] font-mono text-gray-400">1M: <span className={ticker.price.monthMovePct >= 0 ? "text-emerald-600" : "text-red-600"}>{ticker.price.monthMovePct >= 0 ? "+" : ""}{ticker.price.monthMovePct.toFixed(1)}%</span></span>
        </div>
      </div>
    </div>
  );
}
