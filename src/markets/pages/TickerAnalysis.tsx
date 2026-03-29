import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchLiveQuote, fetchSectionAnalysis, formatMarketCap, type LiveQuote, type AIAnalysis,
  fetchDividends, fetchSplits, fetchRelated, fetchDetails, fetchInsiderAnalysis, fetchAnalystRatings, fetchRiskAnalysis,
  type DividendData, type StockSplit, type RelatedCompany, type CompanyDetails, type InsiderAnalysis, type AnalystAnalysis, type RiskAnalysis,
} from "../data/api";
import {
  SectionCard, Tag, DirectionArrow, ConfidenceDots,
  StatBox, EmptyState, ScoreBar,
} from "../components/MarketComponents";
import JacobChat from "../components/JacobChat";
import {
  TradingViewAdvancedChart,
  TradingViewTechnicalAnalysis,
  TradingViewFundamentalData,
  TradingViewCompanyProfile,
  TradingViewTopStories,
} from "../components/TradingViewWidgets";
import OptionsFlow from "../components/OptionsFlow";
import ShareCard from "../components/ShareCard";
import { useWatchlist } from "../data/WatchlistContext";

type SectionKey =
  | "attention-trigger" | "what-moved" | "industry-chain" | "leverage-point"
  | "peer-readthrough" | "follow-money" | "company-numbers" | "segments"
  | "contracts" | "valuation" | "ownership" | "thesis" | "process-score" | "evidence";

const SECTIONS: { key: SectionKey; title: string; step: number }[] = [
  { key: "attention-trigger", title: "Attention Trigger", step: 1 },
  { key: "what-moved", title: "What Moved the Stock", step: 2 },
  { key: "industry-chain", title: "Industry Chain Map", step: 3 },
  { key: "leverage-point", title: "Leverage Point Assessment", step: 4 },
  { key: "peer-readthrough", title: "Peer Read-throughs", step: 5 },
  { key: "follow-money", title: "Follow the Money", step: 6 },
  { key: "company-numbers", title: "Company Numbers", step: 7 },
  { key: "segments", title: "Segment Breakdown", step: 8 },
  { key: "contracts", title: "Contracts & Adoption Proof", step: 9 },
  { key: "valuation", title: "Valuation Context", step: 10 },
  { key: "ownership", title: "Ownership & Sentiment", step: 11 },
  { key: "thesis", title: "Investment Thesis", step: 12 },
  { key: "process-score", title: "Process Score", step: 13 },
  { key: "evidence", title: "Evidence & Sources", step: 14 },
];

type TabKey = "chart" | "fundamentals" | "news" | "options" | "analysis" | "insiders" | "analyst" | "risk" | "dividends" | "peers";

export default function TickerAnalysis() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleTicker } = useWatchlist();
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("chart");
  const [sectionData, setSectionData] = useState<Record<string, Record<string, unknown> | null>>({});
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // New analysis state
  const [dividendData, setDividendData] = useState<DividendData | null>(null);
  const [splitsData, setSplitsData] = useState<StockSplit[]>([]);
  const [relatedData, setRelatedData] = useState<RelatedCompany[]>([]);
  const [detailsData, setDetailsData] = useState<CompanyDetails | null>(null);
  const [insiderData, setInsiderData] = useState<InsiderAnalysis | null>(null);
  const [analystData, setAnalystData] = useState<AnalystAnalysis | null>(null);
  const [riskData, setRiskData] = useState<RiskAnalysis | null>(null);
  const [loadingInsiders, setLoadingInsiders] = useState(false);
  const [loadingAnalyst, setLoadingAnalyst] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingDividends, setLoadingDividends] = useState(false);
  const [loadingPeers, setLoadingPeers] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchLiveQuote(symbol);
        if (!cancelled) {
          if (data) { setQuote(data); } else { setError(`Could not find data for ${symbol}`); }
        }
      } catch {
        if (!cancelled) setError("Failed to load stock data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [symbol]);

  // Load tab data on tab change
  useEffect(() => {
    if (!quote) return;
    if (activeTab === "dividends" && !dividendData && !loadingDividends) {
      setLoadingDividends(true);
      Promise.all([fetchDividends(quote.symbol), fetchSplits(quote.symbol)])
        .then(([div, spl]) => { setDividendData(div); setSplitsData(spl.splits); })
        .finally(() => setLoadingDividends(false));
    }
    if (activeTab === "peers" && relatedData.length === 0 && !loadingPeers) {
      setLoadingPeers(true);
      Promise.all([fetchRelated(quote.symbol), fetchDetails(quote.symbol)])
        .then(([rel, det]) => { setRelatedData(rel.related); setDetailsData(det); })
        .finally(() => setLoadingPeers(false));
    }
    if (activeTab === "insiders" && !insiderData && !loadingInsiders) {
      setLoadingInsiders(true);
      fetchInsiderAnalysis(quote.symbol, quote.name, quote.price, quote.change || 0)
        .then(d => setInsiderData(d))
        .finally(() => setLoadingInsiders(false));
    }
    if (activeTab === "analyst" && !analystData && !loadingAnalyst) {
      setLoadingAnalyst(true);
      fetchAnalystRatings(quote.symbol, quote.name, quote.price, quote.change || 0)
        .then(d => setAnalystData(d))
        .finally(() => setLoadingAnalyst(false));
    }
    if (activeTab === "risk" && !riskData && !loadingRisk) {
      setLoadingRisk(true);
      fetchRiskAnalysis(quote.symbol, quote.name, quote.price, quote.change || 0)
        .then(d => setRiskData(d))
        .finally(() => setLoadingRisk(false));
    }
  }, [activeTab, quote]);

  const loadSection = async (sectionKey: SectionKey) => {
    if (!quote || loadedSections.has(sectionKey) || loadingSections.has(sectionKey)) return;
    setLoadingSections((prev) => new Set(prev).add(sectionKey));
    try {
      const analysis = await fetchSectionAnalysis(quote.symbol, quote.name, quote.price, quote.change, sectionKey);
      setSectionData((prev) => ({ ...prev, [sectionKey]: analysis }));
      setLoadedSections((prev) => new Set(prev).add(sectionKey));
    } catch {
      setSectionData((prev) => ({ ...prev, [sectionKey]: { error: "Failed to generate analysis" } }));
    } finally {
      setLoadingSections((prev) => { const next = new Set(prev); next.delete(sectionKey); return next; });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/30">Loading {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#060606]">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <button onClick={() => navigate("/markets")} className="text-[11px] text-white/30 hover:text-white/60 font-mono mb-6 transition-colors">← DASHBOARD</button>
          <EmptyState message={error || `Ticker ${symbol} not found`} />
        </div>
      </div>
    );
  }

  const pct = quote.change || 0;
  const isUp = pct >= 0;
  const tvSymbol = quote.exchange?.includes("NASDAQ") ? `NASDAQ:${quote.symbol}` : quote.exchange?.includes("NYSE") ? `NYSE:${quote.symbol}` : quote.symbol;

  const TABS: { key: TabKey; label: string }[] = [
    { key: "chart", label: "CHART" },
    { key: "fundamentals", label: "FUNDAMENTALS" },
    { key: "analyst", label: "ANALYST" },
    { key: "insiders", label: "INSIDERS" },
    { key: "risk", label: "RISK" },
    { key: "dividends", label: "DIVIDENDS" },
    { key: "peers", label: "PEERS" },
    { key: "news", label: "NEWS" },
    { key: "options", label: "OPTIONS" },
    { key: "analysis", label: "AI PIPELINE" },
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#060606]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/markets")} className="text-[11px] text-white/30 hover:text-white/60 font-mono tracking-wide transition-colors">← DASHBOARD</button>
            <div className="flex items-center gap-3">
              {quote && (
                <button
                  onClick={() => toggleTicker(quote.symbol)}
                  className={`flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full transition-all ${
                    isInWatchlist(quote.symbol)
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                      : "text-white/30 bg-white/[0.04] border border-white/[0.08] hover:text-white/60 hover:bg-white/[0.08]"
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={isInWatchlist(quote.symbol) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {isInWatchlist(quote.symbol) ? "WATCHING" : "WATCH"}
                </button>
              )}
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono text-white tracking-wide">{quote.symbol}</h1>
                {quote.sector && (
                  <span className="text-[9px] font-mono text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-md tracking-wider">{quote.sector.toUpperCase()}</span>
                )}
              </div>
              <p className="text-[11px] text-white/25 mt-0.5">{quote.name} · {quote.exchange}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">${quote.price.toFixed(2)}</div>
              <span className={`text-sm font-mono tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "+" : ""}{pct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-3 -mb-[1px] overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-2 text-[10px] font-mono tracking-wider rounded-t-lg transition-all whitespace-nowrap ${
                  activeTab === key
                    ? "bg-white/[0.06] text-white border border-white/[0.1] border-b-transparent"
                    : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          <MiniStat label="MARKET CAP" value={quote.marketCap ? formatMarketCap(quote.marketCap) : "—"} />
          <MiniStat label="VOLUME" value={formatVol(quote.volume)} />
          <MiniStat label="52W HIGH" value={quote.fiftyTwoWeekHigh ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : "—"} />
          <MiniStat label="52W LOW" value={quote.fiftyTwoWeekLow ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : "—"} />
          <MiniStat label="DAY HIGH" value={quote.dayHigh ? `$${Number(quote.dayHigh).toFixed(2)}` : "—"} />
          <MiniStat label="DAY LOW" value={quote.dayLow ? `$${Number(quote.dayLow).toFixed(2)}` : "—"} />
        </div>

        {/* ═══ CHART TAB ═══ */}
        {activeTab === "chart" && (
          <div className="space-y-4">
            <TradingViewAdvancedChart symbol={tvSymbol} height={700} showToolbar={true} showSideToolbar={true} allowSymbolChange={true} studies={["STD;RSI"]} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TradingViewTechnicalAnalysis symbol={tvSymbol} height={425} />
              <div className="space-y-4">
                {quote.description && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-white/60 font-mono tracking-wider mb-2">ABOUT</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed line-clamp-6">{quote.description}</p>
                    {quote.ceo && <p className="text-[10px] text-white/15 font-mono mt-3">CEO: {quote.ceo}</p>}
                  </div>
                )}
                <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
                  <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-3">SHARE</div>
                  <ShareCard type="ticker" data={{ symbol: quote.symbol, name: quote.name, price: quote.price, change: quote.change }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ FUNDAMENTALS TAB ═══ */}
        {activeTab === "fundamentals" && (
          <div className="space-y-4">
            <TradingViewFundamentalData symbol={tvSymbol} height={775} />
            <TradingViewCompanyProfile symbol={tvSymbol} height={550} />
          </div>
        )}

        {/* ═══ ANALYST TAB ═══ */}
        {activeTab === "analyst" && (
          <div className="space-y-4">
            {loadingAnalyst ? (
              <LoadingCard label="Loading analyst ratings..." />
            ) : analystData ? (
              <>
                {/* Consensus Header */}
                <div className="bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">WALL STREET CONSENSUS</div>
                      <div className={`text-3xl font-bold font-mono ${
                        analystData.consensus?.includes("Buy") ? "text-emerald-400" :
                        analystData.consensus?.includes("Sell") ? "text-red-400" : "text-amber-400"
                      }`}>{analystData.consensus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">ANALYSTS</div>
                      <div className="text-2xl font-bold font-mono text-white">{analystData.numberOfAnalysts || "—"}</div>
                    </div>
                  </div>

                  {/* Rating Breakdown Bar */}
                  {analystData.ratingBreakdown && (
                    <div className="space-y-2">
                      <div className="flex h-3 rounded-full overflow-hidden">
                        {[
                          { key: "strongBuy", color: "bg-emerald-500", label: "Strong Buy" },
                          { key: "buy", color: "bg-emerald-400", label: "Buy" },
                          { key: "hold", color: "bg-amber-400", label: "Hold" },
                          { key: "sell", color: "bg-red-400", label: "Sell" },
                          { key: "strongSell", color: "bg-red-600", label: "Strong Sell" },
                        ].map(({ key, color }) => {
                          const val = (analystData.ratingBreakdown as Record<string, number>)[key] || 0;
                          const total = Object.values(analystData.ratingBreakdown).reduce((a: number, b: number) => a + b, 0);
                          const pct = total > 0 ? (val / total) * 100 : 0;
                          return pct > 0 ? <div key={key} className={`${color}`} style={{ width: `${pct}%` }} /> : null;
                        })}
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-white/30">
                        <span>Strong Buy: {analystData.ratingBreakdown.strongBuy}</span>
                        <span>Buy: {analystData.ratingBreakdown.buy}</span>
                        <span>Hold: {analystData.ratingBreakdown.hold}</span>
                        <span>Sell: {analystData.ratingBreakdown.sell}</span>
                        <span>Strong Sell: {analystData.ratingBreakdown.strongSell}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Target */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                    <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">LOW TARGET</div>
                    <div className="text-lg font-bold font-mono text-red-400">${analystData.lowPriceTarget?.toFixed(2) || "—"}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-[9px] text-emerald-400/60 font-mono tracking-widest mb-1">AVG TARGET</div>
                    <div className="text-lg font-bold font-mono text-emerald-400">${analystData.averagePriceTarget?.toFixed(2) || "—"}</div>
                    {analystData.upside && <div className="text-[10px] font-mono text-emerald-400/60 mt-0.5">{analystData.upside} upside</div>}
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                    <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">HIGH TARGET</div>
                    <div className="text-lg font-bold font-mono text-blue-400">${analystData.highPriceTarget?.toFixed(2) || "—"}</div>
                  </div>
                </div>

                {/* Summary */}
                {analystData.summary && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
                    <p className="text-sm text-white/50 leading-relaxed">{analystData.summary}</p>
                  </div>
                )}

                {/* Recent Ratings */}
                {analystData.recentRatings && analystData.recentRatings.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest">RECENT ANALYST ACTIONS</div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {analystData.recentRatings.map((r, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-white/40">{r.analyst?.slice(0, 2)}</div>
                            <div>
                              <div className="text-xs font-semibold text-white/70">{r.analyst}</div>
                              <div className="text-[10px] text-white/25">{r.date} · {r.action}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-mono font-semibold ${
                              r.rating?.toLowerCase().includes("buy") || r.rating?.toLowerCase().includes("overweight") ? "text-emerald-400" :
                              r.rating?.toLowerCase().includes("sell") || r.rating?.toLowerCase().includes("underweight") ? "text-red-400" : "text-amber-400"
                            }`}>{r.rating}</div>
                            <div className="text-[10px] text-white/30 font-mono">PT: ${r.priceTarget?.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="No analyst data available" />
            )}
          </div>
        )}

        {/* ═══ INSIDERS TAB ═══ */}
        {activeTab === "insiders" && (
          <div className="space-y-4">
            {loadingInsiders ? (
              <LoadingCard label="Analyzing insider activity..." />
            ) : insiderData ? (
              <>
                {/* Sentiment Header */}
                <div className={`border rounded-xl p-6 ${
                  insiderData.sentiment === "bullish" ? "bg-emerald-500/5 border-emerald-500/20" :
                  insiderData.sentiment === "bearish" ? "bg-red-500/5 border-red-500/20" :
                  "bg-white/[0.03] border-white/[0.08]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">INSIDER SENTIMENT</div>
                      <div className={`text-2xl font-bold font-mono uppercase ${
                        insiderData.sentiment === "bullish" ? "text-emerald-400" :
                        insiderData.sentiment === "bearish" ? "text-red-400" : "text-amber-400"
                      }`}>{insiderData.sentiment}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-right">
                      <div>
                        <div className="text-[9px] text-white/20 font-mono">INSTITUTIONAL</div>
                        <div className="text-sm font-bold text-white/70 font-mono">{insiderData.institutionalOwnership || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/20 font-mono">INSIDER</div>
                        <div className="text-sm font-bold text-white/70 font-mono">{insiderData.insiderOwnership || "—"}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">{insiderData.summary}</p>
                </div>

                {/* Short Interest */}
                {insiderData.shortInterest && (
                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat label="SHARES SHORT" value={insiderData.shortInterest.sharesShort || "—"} />
                    <MiniStat label="SHORT RATIO" value={insiderData.shortInterest.shortRatio || "—"} />
                    <MiniStat label="% OF FLOAT" value={insiderData.shortInterest.percentOfFloat || "—"} />
                  </div>
                )}

                {/* Recent Transactions */}
                {insiderData.recentTransactions && insiderData.recentTransactions.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest">RECENT INSIDER TRANSACTIONS</div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {insiderData.recentTransactions.map((t, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                              t.type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{t.type === "Buy" ? "B" : "S"}</div>
                            <div>
                              <div className="text-xs font-semibold text-white/70">{t.name}</div>
                              <div className="text-[10px] text-white/25">{t.title} · {t.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-mono font-semibold ${t.type === "Buy" ? "text-emerald-400" : "text-red-400"}`}>
                              {t.totalValue}
                            </div>
                            <div className="text-[10px] text-white/25 font-mono">{t.shares?.toLocaleString()} shares @ ${t.pricePerShare?.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                {insiderData.keyInsights && insiderData.keyInsights.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <div className="text-[10px] text-white/20 font-mono tracking-widest mb-3">KEY INSIGHTS</div>
                    <ul className="space-y-2">
                      {insiderData.keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="No insider data available" />
            )}
          </div>
        )}

        {/* ═══ RISK TAB ═══ */}
        {activeTab === "risk" && (
          <div className="space-y-4">
            {loadingRisk ? (
              <LoadingCard label="Analyzing risk profile..." />
            ) : riskData ? (
              <>
                {/* Risk Header */}
                <div className={`border rounded-xl p-6 ${
                  riskData.overallRisk === "Low" ? "bg-emerald-500/5 border-emerald-500/20" :
                  riskData.overallRisk === "Medium" ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-red-500/5 border-red-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">OVERALL RISK</div>
                      <div className={`text-3xl font-bold font-mono ${
                        riskData.overallRisk === "Low" ? "text-emerald-400" :
                        riskData.overallRisk === "Medium" ? "text-amber-400" : "text-red-400"
                      }`}>{riskData.overallRisk}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest mb-1">RISK SCORE</div>
                      <div className="text-3xl font-bold font-mono text-white">{riskData.riskScore || "—"}<span className="text-sm text-white/20">/100</span></div>
                    </div>
                  </div>
                  {/* Risk Score Bar */}
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (riskData.riskScore || 0) <= 33 ? "bg-emerald-400" :
                        (riskData.riskScore || 0) <= 66 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${riskData.riskScore || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-white/20 mt-1">
                    <span>Low Risk</span><span>High Risk</span>
                  </div>
                </div>

                {/* Volatility Metrics */}
                {riskData.volatility && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniStat label="BETA" value={riskData.volatility.beta?.toString() || "—"} />
                    <MiniStat label="STD DEVIATION" value={riskData.volatility.standardDeviation || "—"} />
                    <MiniStat label="MAX DRAWDOWN" value={riskData.volatility.maxDrawdown || "—"} />
                    <MiniStat label="SHARPE RATIO" value={riskData.volatility.sharpeRatio?.toString() || "—"} />
                  </div>
                )}

                {/* Support & Resistance */}
                <div className="grid grid-cols-2 gap-3">
                  {riskData.supportLevels && riskData.supportLevels.length > 0 && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="text-[10px] text-emerald-400/60 font-mono tracking-widest mb-3">SUPPORT LEVELS</div>
                      <div className="space-y-2">
                        {riskData.supportLevels.map((level, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[10px] text-white/25 font-mono">S{i + 1}</span>
                            <span className="text-sm font-mono font-semibold text-emerald-400">${level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {riskData.resistanceLevels && riskData.resistanceLevels.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <div className="text-[10px] text-red-400/60 font-mono tracking-widest mb-3">RESISTANCE LEVELS</div>
                      <div className="space-y-2">
                        {riskData.resistanceLevels.map((level, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[10px] text-white/25 font-mono">R{i + 1}</span>
                            <span className="text-sm font-mono font-semibold text-red-400">${level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Factors */}
                {riskData.risks && riskData.risks.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest">RISK FACTORS</div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {riskData.risks.map((risk, i) => (
                        <div key={i} className="px-5 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                              risk.severity === "High" || risk.severity === "Very High" ? "bg-red-400" :
                              risk.severity === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                            }`} />
                            <span className="text-xs font-semibold text-white/70">{risk.category}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              risk.severity === "High" || risk.severity === "Very High" ? "text-red-400 bg-red-500/10" :
                              risk.severity === "Medium" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
                            }`}>{risk.severity}</span>
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed pl-4">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {riskData.summary && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">RISK ASSESSMENT</div>
                    <p className="text-sm text-white/50 leading-relaxed">{riskData.summary}</p>
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="No risk data available" />
            )}
          </div>
        )}

        {/* ═══ DIVIDENDS TAB ═══ */}
        {activeTab === "dividends" && (
          <div className="space-y-4">
            {loadingDividends ? (
              <LoadingCard label="Loading dividend history..." />
            ) : (
              <>
                {/* Dividend Summary */}
                {dividendData && dividendData.dividends.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MiniStat label="ANNUAL DIVIDEND" value={`$${dividendData.annualDividend.toFixed(2)}`} />
                      <MiniStat label="DIVIDEND YIELD" value={quote.price > 0 ? `${((dividendData.annualDividend / quote.price) * 100).toFixed(2)}%` : "—"} />
                      <MiniStat label="FREQUENCY" value={dividendData.dividends[0]?.frequency === 4 ? "Quarterly" : dividendData.dividends[0]?.frequency === 12 ? "Monthly" : dividendData.dividends[0]?.frequency === 2 ? "Semi-Annual" : "Annual"} />
                      <MiniStat label="PAYMENTS" value={`${dividendData.count} records`} />
                    </div>

                    {/* Dividend History Table */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                      <div className="px-5 py-3 border-b border-white/[0.06]">
                        <div className="text-[10px] text-white/25 font-mono tracking-widest">DIVIDEND HISTORY</div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/[0.06]">
                              <th className="text-left px-5 py-2 text-[9px] text-white/20 font-mono">EX-DATE</th>
                              <th className="text-left px-3 py-2 text-[9px] text-white/20 font-mono">PAY DATE</th>
                              <th className="text-right px-3 py-2 text-[9px] text-white/20 font-mono">AMOUNT</th>
                              <th className="text-right px-5 py-2 text-[9px] text-white/20 font-mono">TYPE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {dividendData.dividends.map((d, i) => (
                              <tr key={i} className="hover:bg-white/[0.02]">
                                <td className="px-5 py-2 text-white/50 font-mono">{d.exDividendDate}</td>
                                <td className="px-3 py-2 text-white/40 font-mono">{d.payDate || "—"}</td>
                                <td className="px-3 py-2 text-right text-emerald-400 font-mono font-semibold">${d.cashAmount.toFixed(4)}</td>
                                <td className="px-5 py-2 text-right text-white/30 font-mono">{d.type || "CD"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
                    <div className="text-white/15 text-4xl mb-3">—</div>
                    <p className="text-sm text-white/30 font-mono">{quote.symbol} does not currently pay a dividend</p>
                  </div>
                )}

                {/* Stock Splits */}
                {splitsData.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest">STOCK SPLIT HISTORY</div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {splitsData.map((s, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="text-xs text-white/50 font-mono">{s.executionDate}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-blue-400">{s.ratio}</span>
                            <span className="text-[9px] text-white/20 font-mono">split</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ PEERS TAB ═══ */}
        {activeTab === "peers" && (
          <div className="space-y-4">
            {loadingPeers ? (
              <LoadingCard label="Finding related companies..." />
            ) : (
              <>
                {/* Company Details Card */}
                {detailsData && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <div className="text-[10px] text-white/20 font-mono tracking-widest mb-3">COMPANY DETAILS</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">INDUSTRY</div><div className="text-xs text-white/60">{detailsData.industry || detailsData.sicDescription || "—"}</div></div>
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">EMPLOYEES</div><div className="text-xs text-white/60">{detailsData.totalEmployees?.toLocaleString() || "—"}</div></div>
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">IPO DATE</div><div className="text-xs text-white/60">{detailsData.listDate || "—"}</div></div>
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">EXCHANGE</div><div className="text-xs text-white/60">{detailsData.exchange || "—"}</div></div>
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">WEBSITE</div><div className="text-xs text-blue-400/60 truncate">{detailsData.homepageUrl ? <a href={detailsData.homepageUrl} target="_blank" rel="noopener noreferrer">{detailsData.homepageUrl.replace(/https?:\/\//, "")}</a> : "—"}</div></div>
                      <div><div className="text-[9px] text-white/15 font-mono mb-0.5">SHARES OUT</div><div className="text-xs text-white/60">{detailsData.weightedSharesOutstanding ? formatVol(detailsData.weightedSharesOutstanding) : "—"}</div></div>
                    </div>
                    {detailsData.description && (
                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <p className="text-xs text-white/35 leading-relaxed line-clamp-4">{detailsData.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Related Companies */}
                {relatedData.length > 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-white/25 font-mono tracking-widest">RELATED COMPANIES</div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {relatedData.map((r, i) => (
                        <Link
                          key={i}
                          to={`/markets/ticker/${r.symbol}`}
                          className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors block"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-white/40 font-bold">{r.symbol.slice(0, 2)}</div>
                            <div>
                              <div className="text-xs font-semibold text-white/70 font-mono">{r.symbol}</div>
                              <div className="text-[10px] text-white/25">{r.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-white/60">{r.price ? `$${r.price.toFixed(2)}` : "—"}</div>
                            {r.change !== null && (
                              <div className={`text-[10px] font-mono ${r.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {r.change >= 0 ? "+" : ""}{r.change.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState message="No related companies found" />
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ NEWS TAB ═══ */}
        {activeTab === "news" && (
          <TradingViewTopStories symbol={tvSymbol} feedMode="symbol" height={600} />
        )}

        {/* ═══ OPTIONS TAB ═══ */}
        {activeTab === "options" && (
          <OptionsFlow symbol={quote.symbol} />
        )}

        {/* ═══ AI ANALYSIS TAB ═══ */}
        {activeTab === "analysis" && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-white/70 tracking-widest">AI RESEARCH PIPELINE</span>
                </div>
                <p className="text-[12px] text-white/25 max-w-lg">
                  Click any section below to generate institutional-grade AI analysis for {quote.symbol}. Each section is generated on demand.
                </p>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-3xl" />
            </div>

            {SECTIONS.map(({ key, title, step }) => (
              <AnalysisSection
                key={key}
                sectionKey={key}
                title={title}
                step={step}
                data={sectionData[key] || null}
                isLoading={loadingSections.has(key)}
                isLoaded={loadedSections.has(key)}
                onLoad={() => loadSection(key)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12 pb-6">
          <p className="text-[10px] text-white/10 font-mono tracking-wider">
            Charts by TradingView · Live data via Massive API · Analysis powered by DeepSeek AI
          </p>
        </div>
      </div>

      <JacobChat symbol={quote.symbol} name={quote.name} price={quote.price} change={quote.change || 0} />
    </div>
  );
}

// ── Mini Stat Card ──
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
      <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">{label}</div>
      <div className="text-sm font-semibold text-white tabular-nums font-mono">{value}</div>
    </div>
  );
}

// ── Loading Card ──
function LoadingCard({ label }: { label: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 text-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm font-mono text-white/30 animate-pulse">{label}</p>
    </div>
  );
}

// ── Analysis Section ──
function AnalysisSection({
  sectionKey, title, step, data, isLoading, isLoaded, onLoad,
}: {
  sectionKey: SectionKey; title: string; step: number;
  data: Record<string, unknown> | null; isLoading: boolean; isLoaded: boolean;
  onLoad: () => void;
}) {
  if (!isLoaded && !isLoading) {
    return (
      <button
        onClick={onLoad}
        className="w-full group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3.5">
            <span className="w-7 h-7 rounded-lg bg-white/[0.06] text-white/30 text-xs flex items-center justify-center font-mono group-hover:bg-white/[0.1] group-hover:text-white/50 transition-all">{step}</span>
            <h3 className="text-sm text-white/30 group-hover:text-white/60 transition-colors">{title}</h3>
          </div>
          <span className="text-[10px] font-mono text-white/15 bg-white/[0.04] px-2.5 py-1 rounded-md group-hover:text-white/30 group-hover:bg-white/[0.06] transition-all">GENERATE</span>
        </div>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3.5">
          <span className="w-7 h-7 rounded-lg bg-white/[0.1] text-white/60 text-xs flex items-center justify-center font-mono">{step}</span>
          <h3 className="text-sm text-white/60">{title}</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-white/25 animate-pulse">Analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SectionCard title={title} step={step}>
      <div className="space-y-3 pt-3">
        <RenderSectionData sectionKey={sectionKey} data={data} />
      </div>
    </SectionCard>
  );
}

// ── Dynamic Section Renderer ──
function RenderSectionData({ sectionKey, data }: { sectionKey: SectionKey; data: Record<string, unknown> | null }) {
  if (!data) return <p className="text-xs text-white/20 font-mono">No data available</p>;

  if ((data as Record<string, unknown>).parseError) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <p className="text-xs text-amber-400 font-mono">AI returned non-standard format. Raw response:</p>
        <pre className="text-xs text-white/40 mt-2 whitespace-pre-wrap">{String((data as Record<string, unknown>).raw || "")}</pre>
      </div>
    );
  }

  const d = data as AIAnalysis & Record<string, unknown>;

  switch (sectionKey) {
    case "attention-trigger":
      return (
        <>
          {d.triggers && Array.isArray(d.triggers) && (
            <div className="flex flex-wrap gap-1">{(d.triggers as string[]).map((t, i) => <Tag key={i} label={t} color="blue" />)}</div>
          )}
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
          {d.whyNow && (
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <p className="text-[10px] text-white/25 font-mono mb-1">WHY THIS NAME NOW</p>
              <p className="text-sm text-white/50 leading-relaxed">{String(d.whyNow)}</p>
            </div>
          )}
        </>
      );

    case "what-moved":
      return (
        <>
          {d.summary && <p className="text-sm text-white/60">{String(d.summary)}</p>}
          {d.catalysts && Array.isArray(d.catalysts) && (d.catalysts as Array<{title: string; description: string; impact: number}>).map((c, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white/80">{c.title}</span>
                <ConfidenceDots value={c.impact * 10} />
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </>
      );

    case "industry-chain":
      return (
        <>
          {d.summary && <p className="text-sm text-white/60">{String(d.summary)}</p>}
          {d.nodes && Array.isArray(d.nodes) && (d.nodes as Array<{name: string; role: string; tickers?: string[]}>).map((node, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.role === "competitor" ? "bg-red-400" : node.role === "supplier" ? "bg-blue-400" : node.role === "customer" ? "bg-emerald-400" : "bg-purple-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/80">{node.name}</span>
                  <Tag label={node.role} color={node.role === "competitor" ? "red" : node.role === "supplier" ? "blue" : "green"} />
                </div>
                {node.tickers && (
                  <div className="flex gap-1 mt-1">
                    {node.tickers.map((t) => <span key={t} className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {d.bottlenecks && Array.isArray(d.bottlenecks) && (d.bottlenecks as string[]).length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <p className="text-[10px] text-red-400 font-mono mb-1">BOTTLENECKS</p>
              <ul className="text-xs text-red-300/70 space-y-1">
                {(d.bottlenecks as string[]).map((b, i) => <li key={i}>- {b}</li>)}
              </ul>
            </div>
          )}
        </>
      );

    case "leverage-point":
      return (
        <>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{String(d.score || "—")}</span>
              <span className="text-sm text-white/20 ml-1">/100</span>
            </div>
            {d.score && <ScoreBar label="Leverage" value={Number(d.score)} max={100} color={Number(d.score) >= 80 ? "#34d399" : Number(d.score) >= 60 ? "#fbbf24" : "#f87171"} />}
          </div>
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
          {d.tags && Array.isArray(d.tags) && (
            <div className="flex flex-wrap gap-1">{(d.tags as string[]).map((t, i) => <Tag key={i} label={t} color="purple" />)}</div>
          )}
        </>
      );

    case "peer-readthrough":
      return (
        <>
          {d.peers && Array.isArray(d.peers) && (d.peers as Array<{ticker: string; name: string; signal: string; quote: string; implication: string; date: string}>).map((pr, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-white/80">{pr.ticker}</span>
                  <span className="text-xs text-white/30">{pr.name}</span>
                </div>
                <DirectionArrow direction={pr.signal as "bullish" | "bearish" | "mixed"} />
              </div>
              <blockquote className="text-xs text-white/40 italic border-l-2 border-white/10 pl-3 mb-2">"{pr.quote}"</blockquote>
              <p className="text-xs text-white/50">{pr.implication}</p>
              <p className="text-[10px] text-white/15 font-mono mt-1">{pr.date}</p>
            </div>
          ))}
        </>
      );

    case "follow-money":
      return (
        <>
          {d.summary && <p className="text-sm text-white/60">{String(d.summary)}</p>}
          {d.flows && Array.isArray(d.flows) && (d.flows as Array<{entity: string; action: string; amount: string; date: string; significance: string}>).map((f, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white/80">{f.entity}</span>
                <Tag label={f.action} color={f.action.toLowerCase().includes("buy") ? "green" : f.action.toLowerCase().includes("sell") ? "red" : "blue"} />
              </div>
              <p className="text-xs text-white/40">{f.amount} · {f.date}</p>
              <p className="text-xs text-white/50 mt-1">{f.significance}</p>
            </div>
          ))}
        </>
      );

    case "company-numbers":
      return (
        <>
          {d.metrics && typeof d.metrics === "object" && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(d.metrics as Record<string, string>).map(([k, v]) => (
                <StatBox key={k} label={k.replace(/([A-Z])/g, " $1").trim()} value={v} />
              ))}
            </div>
          )}
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "segments":
      return (
        <>
          {d.segments && Array.isArray(d.segments) && (d.segments as Array<{name: string; status: string; role: string; description: string; importance: number}>).map((seg, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white/80">{seg.name}</span>
                <div className="flex items-center gap-2">
                  <Tag label={seg.status} color={seg.status === "accelerating" ? "green" : seg.status === "stable" ? "blue" : "yellow"} />
                  <Tag label={seg.role} color={seg.role === "core" ? "green" : seg.role === "supporting" ? "blue" : "gray"} />
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{seg.description}</p>
              <div className="mt-2"><ScoreBar label="Importance" value={seg.importance} max={100} /></div>
            </div>
          ))}
        </>
      );

    case "contracts":
      return (
        <>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold font-mono text-white">{String(d.score || "—")}</span>
            <span className="text-sm text-white/20">/100</span>
          </div>
          {d.summary && <p className="text-sm text-white/60">{String(d.summary)}</p>}
          {d.contracts && Array.isArray(d.contracts) && (d.contracts as Array<{customer: string; status: string; description: string}>).map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === "signed" ? "bg-emerald-400" : c.status === "expanding" ? "bg-blue-400" : "bg-amber-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/80">{c.customer}</span>
                  <Tag label={c.status} color={c.status === "signed" ? "green" : c.status === "expanding" ? "blue" : "yellow"} />
                </div>
                <p className="text-xs text-white/40 mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </>
      );

    case "valuation":
      return (
        <>
          {d.multiples && typeof d.multiples === "object" && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(d.multiples as Record<string, string>).map(([k, v]) => (
                <StatBox key={k} label={k.toUpperCase()} value={v} />
              ))}
            </div>
          )}
          {d.assessment && <Tag label={String(d.assessment)} color={d.assessment === "cheap" ? "green" : d.assessment === "fair" ? "blue" : "red"} />}
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
          <div className="grid grid-cols-2 gap-2">
            {d.vsHistory && (
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <p className="text-[10px] text-white/20 font-mono mb-1">VS HISTORY</p>
                <p className="text-xs text-white/50">{String(d.vsHistory)}</p>
              </div>
            )}
            {d.vsPeers && (
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <p className="text-[10px] text-white/20 font-mono mb-1">VS PEERS</p>
                <p className="text-xs text-white/50">{String(d.vsPeers)}</p>
              </div>
            )}
          </div>
        </>
      );

    case "ownership":
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            {d.institutional && <StatBox label="Institutional" value={String(d.institutional)} />}
            {d.shortInterest && <StatBox label="Short Interest" value={String(d.shortInterest)} />}
          </div>
          <div className="flex items-center gap-2">
            {d.crowding && <Tag label={`Crowding: ${d.crowding}`} color={d.crowding === "elevated" ? "red" : d.crowding === "moderate" ? "yellow" : "green"} />}
            {d.sentiment && <Tag label={String(d.sentiment)} color={String(d.sentiment).includes("bullish") ? "green" : "gray"} />}
          </div>
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "thesis":
      return (
        <>
          {d.summary && <p className="text-sm text-white/70 leading-relaxed font-medium">{String(d.summary)}</p>}
          <div className="grid grid-cols-1 gap-3">
            {d.bullCase && (
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-mono mb-1">BULL CASE</p>
                <p className="text-xs text-emerald-300/70 leading-relaxed">{String(d.bullCase)}</p>
              </div>
            )}
            {d.bearCase && (
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <p className="text-[10px] text-red-400 font-mono mb-1">BEAR CASE</p>
                <p className="text-xs text-red-300/70 leading-relaxed">{String(d.bearCase)}</p>
              </div>
            )}
            {d.whatChangesIt && (
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 font-mono mb-1">WHAT CHANGES IT</p>
                <p className="text-xs text-amber-300/70 leading-relaxed">{String(d.whatChangesIt)}</p>
              </div>
            )}
          </div>
          {d.watchItems && Array.isArray(d.watchItems) && (
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <p className="text-[10px] text-white/20 font-mono mb-2">WATCH ITEMS</p>
              <ul className="space-y-1">
                {(d.watchItems as string[]).map((item, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      );

    case "process-score":
      return (
        <>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-4xl font-bold font-mono text-white">{String(d.totalScore || "—")}</span>
              <p className="text-xs text-white/20 font-mono">/100</p>
            </div>
            {d.conviction && <Tag label={String(d.conviction)} color={d.conviction === "lead" || d.conviction === "high" ? "green" : d.conviction === "moderate" ? "yellow" : "gray"} />}
          </div>
          {d.breakdown && typeof d.breakdown === "object" && (
            <div className="space-y-2">
              {Object.entries(d.breakdown as Record<string, number>).map(([key, val]) => (
                <ScoreBar key={key} label={key} value={val} max={15} color={val / 15 >= 0.7 ? "#34d399" : val / 15 >= 0.4 ? "#fbbf24" : "#f87171"} />
              ))}
            </div>
          )}
        </>
      );

    case "evidence":
      return (
        <>
          {d.sources && Array.isArray(d.sources) && (d.sources as Array<{type: string; title: string; source: string; date: string; summary: string}>).map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <Tag label={s.type.replace(/_/g, " ")} color="blue" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">{s.title}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{s.source} · {s.date}</p>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{s.summary}</p>
              </div>
            </div>
          ))}
        </>
      );

    default:
      return <GenericDataRenderer data={data} />;
  }
}

function GenericDataRenderer({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
          <p className="text-[10px] text-white/20 font-mono mb-1">{key.toUpperCase()}</p>
          <p className="text-xs text-white/50">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function formatVol(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return `${vol}`;
}
