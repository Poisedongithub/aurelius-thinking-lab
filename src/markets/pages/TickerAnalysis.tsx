import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme, themes } from "@/hooks/useTheme";
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
import {
  ThesisTab, ValuationTab, MoatTab, ManagementTab, BullBearTab,
  RevenueTab, CompetitiveTab, FinancialHealthTab, CapitalAllocationTab, GuidanceTab,
} from "../components/ResearchTabs";
import {
  IndustryTab, SectorRotationTab, IPOTab, MATab, RegulatoryTab,
  InstitutionalTab, ETFExposureTab, ActivistTab, InsiderPatternsTab, ShortInterestTab,
} from "../components/ResearchTabs2";
import {
  EarningsReplayTab, EarningsCalendarTab, EstimateRevisionsTab, CashFlowTab, MarginsTab,
  ScenarioTab, QualityTab, AlertsTab, ResearchNotesTab, DeepCompareTab,
} from "../components/ResearchTabs3";
import {
  PatternScannerTab, SupportResistanceTab, MomentumTab, FibonacciTab, VolumeProfileTab,
  FedImpactTab, InflationTab, CurrencyTab, YieldCurveTab, GeopoliticalTab,
} from "../components/ResearchTabs4";
import {
  SocialBuzzTab, NewsSentimentTab, AnalystSentimentTab, OptionsSentimentTab, EarningsToneTab,
  EntryExitTab, PositionSizingTab, HedgeTab, TaxOptimizerTab, PairsTradeTab,
} from "../components/ResearchTabs5";
import {
  RegressionTab, SeasonalityTab, CorrelationTab, VolatilityTab, MonteCarloTab,
  ESGTab, ExecCompTab, BoardTab, ActivismHistoryTab, CorporateEventsTab,
} from "../components/ResearchTabs6";

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

type TabKey = "chart" | "fundamentals" | "news" | "options" | "analysis" | "insiders" | "analyst" | "risk" | "dividends" | "peers"
  | "thesis" | "valuation" | "moat" | "management" | "bullbear"
  | "revenue" | "competitive" | "health" | "capital" | "guidance"
  | "industry" | "sectors" | "ipo" | "ma" | "regulatory"
  | "institutional" | "etf" | "activist" | "insiderpatterns" | "shortinterest"
  | "earningsreplay" | "earningscalendar" | "estimates" | "cashflow" | "margins"
  | "deepcompare" | "notes" | "scenario" | "quality" | "alerts"
  | "patternscanner" | "supportresistance" | "momentum" | "fibonacci" | "volumeprofile"
  | "fedimpact" | "inflation" | "currency" | "yieldcurve" | "geopolitical"
  | "socialbuzz" | "newssentiment" | "analystsentiment" | "optionssentiment" | "earningstone"
  | "entryexit" | "positionsizing" | "hedge" | "taxoptimizer" | "pairstrade"
  | "regression" | "seasonality" | "correlation" | "volatility" | "montecarlo"
  | "esg" | "execcomp" | "board" | "activismhistory" | "corporateevents";

export default function TickerAnalysis() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleTicker } = useWatchlist();
  const { theme, setTheme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";
  const isCherry = theme === "cherry-blossom";
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("chart");
  const [activeGroup, setActiveGroup] = useState("OVERVIEW");
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

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["OVERVIEW"]));
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const GROUP_ICONS: Record<string, string> = {};

  if (loading) {
    return (
      <div className="terminal-page min-h-screen bg-[var(--t-bg)] flex items-center justify-center text-[var(--t-text)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--t-border-hover)] border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-[var(--t-text-muted)]">Loading {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="terminal-page min-h-screen bg-[var(--t-bg)] text-[var(--t-text)]">
        <div className="max-w-6xl mx-auto px-5 py-8">
          <button onClick={() => navigate("/markets")} className="text-[14px] text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] font-mono mb-6 transition-colors">← DASHBOARD</button>
          <EmptyState message={error || `Ticker ${symbol} not found`} />
        </div>
      </div>
    );
  }

  const pct = quote.change || 0;
  const isUp = pct >= 0;
  const tvSymbol = quote.exchange?.includes("NASDAQ") ? `NASDAQ:${quote.symbol}` : quote.exchange?.includes("NYSE") ? `NYSE:${quote.symbol}` : quote.symbol;

  const TAB_GROUPS: { group: string; tabs: { key: TabKey; label: string }[] }[] = [
    { group: "OVERVIEW", tabs: [
      { key: "chart", label: "CHART" },
      { key: "fundamentals", label: "FUNDAMENTALS" },
      { key: "news", label: "NEWS" },
      { key: "options", label: "OPTIONS" },
    ]},
    { group: "COMPANY", tabs: [
      { key: "thesis", label: "THESIS" },
      { key: "valuation", label: "VALUATION" },
      { key: "moat", label: "MOAT" },
      { key: "management", label: "MGMT" },
      { key: "bullbear", label: "BULL/BEAR" },
      { key: "revenue", label: "REVENUE" },
      { key: "competitive", label: "COMPETITIVE" },
      { key: "health", label: "FIN. HEALTH" },
      { key: "capital", label: "CAPITAL" },
      { key: "guidance", label: "GUIDANCE" },
    ]},
    { group: "MARKET", tabs: [
      { key: "industry", label: "INDUSTRY" },
      { key: "sectors", label: "SECTORS" },
      { key: "ipo", label: "IPO" },
      { key: "ma", label: "M&A" },
      { key: "regulatory", label: "REGULATORY" },
    ]},
    { group: "OWNERSHIP", tabs: [
      { key: "institutional", label: "INST. OWNERS" },
      { key: "etf", label: "ETF MAP" },
      { key: "activist", label: "ACTIVIST" },
      { key: "insiderpatterns", label: "INSIDER PAT." },
      { key: "shortinterest", label: "SHORT INT." },
      { key: "insiders", label: "INSIDERS" },
    ]},
    { group: "EARNINGS", tabs: [
      { key: "earningsreplay", label: "REPLAY" },
      { key: "earningscalendar", label: "CALENDAR" },
      { key: "estimates", label: "ESTIMATES" },
      { key: "cashflow", label: "CASH FLOW" },
      { key: "margins", label: "MARGINS" },
    ]},
    { group: "RESEARCH", tabs: [
      { key: "analyst", label: "ANALYST" },
      { key: "risk", label: "RISK" },
      { key: "dividends", label: "DIVIDENDS" },
      { key: "peers", label: "PEERS" },
      { key: "deepcompare", label: "COMPARE" },
      { key: "scenario", label: "SCENARIO" },
      { key: "quality", label: "QUALITY" },
      { key: "alerts", label: "ALERTS" },
      { key: "notes", label: "NOTES" },
    ]},
    { group: "TECHNICALS", tabs: [
      { key: "patternscanner", label: "PATTERNS" },
      { key: "supportresistance", label: "S/R LEVELS" },
      { key: "momentum", label: "MOMENTUM" },
      { key: "fibonacci", label: "FIBONACCI" },
      { key: "volumeprofile", label: "VOLUME" },
    ]},
    { group: "MACRO", tabs: [
      { key: "fedimpact", label: "FED IMPACT" },
      { key: "inflation", label: "INFLATION" },
      { key: "currency", label: "CURRENCY" },
      { key: "yieldcurve", label: "YIELD CURVE" },
      { key: "geopolitical", label: "GEO RISK" },
    ]},
    { group: "SENTIMENT", tabs: [
      { key: "socialbuzz", label: "SOCIAL BUZZ" },
      { key: "newssentiment", label: "NEWS SENT." },
      { key: "analystsentiment", label: "ANALYST SENT." },
      { key: "optionssentiment", label: "OPTIONS FLOW" },
      { key: "earningstone", label: "CALL TONE" },
    ]},
    { group: "STRATEGY", tabs: [
      { key: "entryexit", label: "ENTRY/EXIT" },
      { key: "positionsizing", label: "SIZING" },
      { key: "hedge", label: "HEDGE" },
      { key: "taxoptimizer", label: "TAX" },
      { key: "pairstrade", label: "PAIRS" },
    ]},
    { group: "ANALYTICS", tabs: [
      { key: "regression", label: "REGRESSION" },
      { key: "seasonality", label: "SEASONALITY" },
      { key: "correlation", label: "CORRELATION" },
      { key: "volatility", label: "VOLATILITY" },
      { key: "montecarlo", label: "MONTE CARLO" },
    ]},
    { group: "ESG", tabs: [
      { key: "esg", label: "ESG SCORE" },
      { key: "execcomp", label: "EXEC PAY" },
      { key: "board", label: "BOARD" },
      { key: "activismhistory", label: "ACTIVISM" },
      { key: "corporateevents", label: "EVENTS" },
    ]},
    { group: "AI", tabs: [
      { key: "analysis", label: "AI PIPELINE" },
    ]},
  ];
  const TABS = TAB_GROUPS.flatMap(g => g.tabs);

  return (
    <div className={`terminal-page min-h-screen bg-[var(--t-bg)] text-[var(--t-text)] relative ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""} ${isCherry ? "sakura-drift" : ""}`}>
      {/* Theme Background Images */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {isStoic && (
          <>
            <img src="/images/terminal-stoic-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.35]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)" }} />
          </>
        )}
        {isOcean && (
          <>
            <img src="/images/terminal-ocean-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.4]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,15,30,0.35) 0%, rgba(0,25,45,0.5) 40%, rgba(0,20,40,0.7) 70%, rgba(0,12,25,0.9) 100%)" }} />
          </>
        )}
        {isCherry && (
          <>
            <img src="/images/terminal-sakura-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.35]" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,5,10,0.35) 0%, rgba(20,8,15,0.5) 40%, rgba(15,5,10,0.7) 70%, rgba(10,2,5,0.92) 100%)" }} />
          </>
        )}
      </div>

      {/* ═══ SIDEBAR + MAIN LAYOUT ═══ */}
      <div className="flex min-h-screen relative z-10">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[280px] min-w-[280px] border-r border-[var(--t-border)] flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-hide" style={{ background: 'var(--t-header-gradient)', backdropFilter: 'blur(20px) saturate(180%)' }}>

          {/* Back Button */}
          <div className="px-5 pt-4 pb-2">
            <button onClick={() => navigate("/markets")} className="text-[13px] text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] font-mono tracking-wide transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              DASHBOARD
            </button>
          </div>

          {/* Company Info */}
          <div className="px-5 py-4 border-b border-[var(--t-border)]">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold font-mono tracking-wide text-gradient">{quote.symbol}</h1>
              {quote.sector && (
                <span className="text-[10px] font-mono text-[var(--t-text-muted)] bg-[var(--t-btn-bg)] px-1.5 py-0.5 rounded tracking-wider">{quote.sector.toUpperCase()}</span>
              )}
            </div>
            <p className="text-[12px] text-[var(--t-text-muted)] tracking-wide mb-3">{quote.name}</p>
            <div className="text-2xl font-bold font-mono text-[var(--t-text)] tabular-nums">${quote.price.toFixed(2)}</div>
            <span className={`inline-flex items-center gap-1 text-sm font-mono font-semibold tabular-nums mt-1 px-2 py-0.5 rounded-md ${isUp ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className={isUp ? "" : "rotate-180"}>
                <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
              </svg>
              {isUp ? "+" : ""}{pct.toFixed(2)}%
            </span>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-[var(--t-stat-bg)] rounded-lg px-2.5 py-2 border border-[var(--t-border)]">
                <div className="text-[9px] text-[var(--t-text-dim)] font-mono tracking-wider">MKT CAP</div>
                <div className="text-[13px] font-bold text-[var(--t-text)] font-mono">{quote.marketCap ? formatMarketCap(quote.marketCap) : "\u2014"}</div>
              </div>
              <div className="bg-[var(--t-stat-bg)] rounded-lg px-2.5 py-2 border border-[var(--t-border)]">
                <div className="text-[9px] text-[var(--t-text-dim)] font-mono tracking-wider">VOLUME</div>
                <div className="text-[13px] font-bold text-[var(--t-text)] font-mono">{formatVol(quote.volume)}</div>
              </div>
              <div className="bg-[var(--t-stat-bg)] rounded-lg px-2.5 py-2 border border-[var(--t-border)]">
                <div className="text-[9px] text-[var(--t-text-dim)] font-mono tracking-wider">52W HIGH</div>
                <div className="text-[13px] font-bold text-[var(--t-text)] font-mono">{quote.fiftyTwoWeekHigh ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : "\u2014"}</div>
              </div>
              <div className="bg-[var(--t-stat-bg)] rounded-lg px-2.5 py-2 border border-[var(--t-border)]">
                <div className="text-[9px] text-[var(--t-text-dim)] font-mono tracking-wider">52W LOW</div>
                <div className="text-[13px] font-bold text-[var(--t-text)] font-mono">{quote.fiftyTwoWeekLow ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : "\u2014"}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => toggleTicker(quote.symbol)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-mono px-2 py-1.5 rounded-lg transition-all ${
                  isInWatchlist(quote.symbol)
                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    : "text-[var(--t-text-muted)] bg-[var(--t-btn-bg)] border border-[var(--t-border)] hover:bg-[var(--t-btn-hover)]"
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill={isInWatchlist(quote.symbol) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {isInWatchlist(quote.symbol) ? "WATCHING" : "WATCH"}
              </button>
              <span className="flex items-center gap-1 text-[12px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 py-2 overflow-y-auto scrollbar-hide">
            {TAB_GROUPS.map(({ group, tabs }) => (
              <div key={group} className="mb-0.5">
                <button
                  onClick={() => {
                    toggleGroup(group);
                    if (!expandedGroups.has(group)) {
                      setActiveTab(tabs[0].key);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition-all duration-200 ${
                    TAB_GROUPS.find(g => g.tabs.some(t => t.key === activeTab))?.group === group
                      ? "text-[var(--t-text)] bg-[var(--t-group-active)]"
                      : "text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-bg)]"
                  }`}
                >
                  <span className="text-[14px]">{GROUP_ICONS[group] || ""}</span>
                  <span className="text-[13px] font-mono tracking-wider font-medium flex-1">{group}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${expandedGroups.has(group) ? "rotate-90" : ""}`}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                {expandedGroups.has(group) && (
                  <div className="pb-1">
                    {tabs.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`w-full text-left pl-12 pr-5 py-2 text-[13px] font-mono tracking-wide transition-all duration-150 ${
                          activeTab === key
                            ? "text-[var(--t-text)] bg-[var(--t-accent)]/10 border-l-2 border-[var(--t-accent)] font-semibold"
                            : "text-[var(--t-text-dim)] hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-bg)] border-l-2 border-transparent"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Theme Switcher at Bottom */}
          <div className="border-t border-[var(--t-border)] p-4">
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="w-full flex items-center gap-2 text-[12px] font-mono text-[var(--t-text-muted)] bg-[var(--t-btn-bg)] border border-[var(--t-border)] px-3 py-2 rounded-lg hover:text-[var(--t-text-secondary)] hover:bg-[var(--t-btn-hover)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <span className="flex-1 text-left">THEME</span>
                <div className="flex gap-0.5">
                  {themes.map(t => <div key={t.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: t.preview.accent }} />)}
                </div>
              </button>
              {showThemePicker && (
                <div className="absolute left-0 bottom-full mb-2 bg-[var(--t-bg-elevated)] border border-[var(--t-border-hover)] rounded-xl shadow-2xl z-50 p-3 w-full">
                  <div className="text-[10px] font-mono text-[var(--t-text-muted)] tracking-wider mb-2">TERMINAL THEME</div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all mb-1 ${
                        theme === t.id
                          ? "bg-[var(--t-group-active)] border border-[var(--t-border-hover)]"
                          : "hover:bg-[var(--t-btn-hover)] border border-transparent"
                      }`}
                    >
                      <div className="flex gap-0.5">
                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--t-border)]" style={{ backgroundColor: t.preview.bg }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--t-border)]" style={{ backgroundColor: t.preview.accent }} />
                      </div>
                      <div className="text-left flex-1">
                        <div className={`text-[12px] font-medium ${theme === t.id ? "text-[var(--t-text)]" : "text-[var(--t-text-secondary)]"}`}>{t.name}</div>
                      </div>
                      {theme === t.id && (
                        <svg className="w-3.5 h-3.5 text-[var(--t-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">

        {/* ═══ CHART TAB ═══ */}
        {activeTab === "chart" && (
          <div className="space-y-4">
            <TradingViewAdvancedChart symbol={tvSymbol} height={700} showToolbar={true} showSideToolbar={true} allowSymbolChange={true} studies={["STD;RSI"]} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TradingViewTechnicalAnalysis symbol={tvSymbol} height={425} />
              <div className="space-y-4">
                {quote.description && (
                  <div className="content-card p-5">
                    <h3 className="text-[12px] font-semibold text-[var(--t-text-muted)] font-mono tracking-[0.15em] mb-3">ABOUT</h3>
                    <p className="text-[15px] text-[var(--t-text-secondary)] leading-relaxed line-clamp-6">{quote.description}</p>
                    {quote.ceo && (
                      <div className="mt-3 pt-3 border-t border-[var(--t-border)]">
                        <p className="text-[13px] text-[var(--t-text-dim)] font-mono tracking-wide">CEO: <span className="text-[var(--t-text-muted)]">{quote.ceo}</span></p>
                      </div>
                    )}
                  </div>
                )}
                <div className="content-card p-5">
                  <div className="text-[12px] text-[var(--t-text-muted)] font-mono tracking-[0.15em] mb-3">SHARE</div>
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
                <div className="content-card p-6 bg-gradient-to-br from-[var(--t-bg-card)] to-[var(--t-stat-bg)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">WALL STREET CONSENSUS</div>
                      <div className={`text-3xl font-bold font-mono ${
                        analystData.consensus?.includes("Buy") ? "text-emerald-400" :
                        analystData.consensus?.includes("Sell") ? "text-red-400" : "text-amber-400"
                      }`}>{analystData.consensus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">ANALYSTS</div>
                      <div className="text-2xl font-bold font-mono text-[var(--t-text)]">{analystData.numberOfAnalysts || "—"}</div>
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
                      <div className="flex justify-between text-[13px] font-mono text-[var(--t-text-muted)]">
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
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-4 text-center">
                    <div className="text-[13px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">LOW TARGET</div>
                    <div className="text-lg font-bold font-mono text-red-400">${analystData.lowPriceTarget?.toFixed(2) || "—"}</div>
                  </div>
                  <div className="bg-[var(--t-stat-bg)] border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-[13px] text-emerald-400/60 font-mono tracking-widest mb-1">AVG TARGET</div>
                    <div className="text-lg font-bold font-mono text-emerald-400">${analystData.averagePriceTarget?.toFixed(2) || "—"}</div>
                    {analystData.upside && <div className="text-[14px] font-mono text-emerald-400/60 mt-0.5">{analystData.upside} upside</div>}
                  </div>
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-4 text-center">
                    <div className="text-[13px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">HIGH TARGET</div>
                    <div className="text-lg font-bold font-mono text-blue-400">${analystData.highPriceTarget?.toFixed(2) || "—"}</div>
                  </div>
                </div>

                {/* Summary */}
                {analystData.summary && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
                    <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
                    <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{analystData.summary}</p>
                  </div>
                )}

                {/* Recent Ratings */}
                {analystData.recentRatings && analystData.recentRatings.length > 0 && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--t-border)]">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">RECENT ANALYST ACTIONS</div>
                    </div>
                    <div className="divide-y divide-[var(--t-border)]">
                      {analystData.recentRatings.map((r, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--t-btn-bg)] flex items-center justify-center text-[14px] font-mono text-[var(--t-text-secondary)]">{r.analyst?.slice(0, 2)}</div>
                            <div>
                              <div className="text-xs font-semibold text-[var(--t-text)]">{r.analyst}</div>
                              <div className="text-[14px] text-[var(--t-text-muted)]">{r.date} · {r.action}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-mono font-semibold ${
                              r.rating?.toLowerCase().includes("buy") || r.rating?.toLowerCase().includes("overweight") ? "text-emerald-400" :
                              r.rating?.toLowerCase().includes("sell") || r.rating?.toLowerCase().includes("underweight") ? "text-red-400" : "text-amber-400"
                            }`}>{r.rating}</div>
                            <div className="text-[14px] text-[var(--t-text-muted)] font-mono">PT: ${r.priceTarget?.toFixed(2)}</div>
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
                  "bg-[var(--t-stat-bg)] border-[var(--t-border)]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">INSIDER SENTIMENT</div>
                      <div className={`text-2xl font-bold font-mono uppercase ${
                        insiderData.sentiment === "bullish" ? "text-emerald-400" :
                        insiderData.sentiment === "bearish" ? "text-red-400" : "text-amber-400"
                      }`}>{insiderData.sentiment}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-right">
                      <div>
                        <div className="text-[13px] text-[var(--t-text-muted)] font-mono">INSTITUTIONAL</div>
                        <div className="text-sm font-bold text-[var(--t-text)] font-mono">{insiderData.institutionalOwnership || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[13px] text-[var(--t-text-muted)] font-mono">INSIDER</div>
                        <div className="text-sm font-bold text-[var(--t-text)] font-mono">{insiderData.insiderOwnership || "—"}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{insiderData.summary}</p>
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
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--t-border)]">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">RECENT INSIDER TRANSACTIONS</div>
                    </div>
                    <div className="divide-y divide-[var(--t-border)]">
                      {insiderData.recentTransactions.map((t, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold ${
                              t.type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{t.type === "Buy" ? "B" : "S"}</div>
                            <div>
                              <div className="text-xs font-semibold text-[var(--t-text)]">{t.name}</div>
                              <div className="text-[14px] text-[var(--t-text-muted)]">{t.title} · {t.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-mono font-semibold ${t.type === "Buy" ? "text-emerald-400" : "text-red-400"}`}>
                              {t.totalValue}
                            </div>
                            <div className="text-[14px] text-[var(--t-text-muted)] font-mono">{t.shares?.toLocaleString()} shares @ ${t.pricePerShare?.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                {insiderData.keyInsights && insiderData.keyInsights.length > 0 && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
                    <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-3">KEY INSIGHTS</div>
                    <ul className="space-y-2">
                      {insiderData.keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--t-text-secondary)]">
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
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">OVERALL RISK</div>
                      <div className={`text-3xl font-bold font-mono ${
                        riskData.overallRisk === "Low" ? "text-emerald-400" :
                        riskData.overallRisk === "Medium" ? "text-amber-400" : "text-red-400"
                      }`}>{riskData.overallRisk}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">RISK SCORE</div>
                      <div className="text-3xl font-bold font-mono text-[var(--t-text)]">{riskData.riskScore || "—"}<span className="text-sm text-[var(--t-text-muted)]">/100</span></div>
                    </div>
                  </div>
                  {/* Risk Score Bar */}
                  <div className="w-full h-2 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (riskData.riskScore || 0) <= 33 ? "bg-emerald-400" :
                        (riskData.riskScore || 0) <= 66 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${riskData.riskScore || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[13px] font-mono text-[var(--t-text-muted)] mt-1">
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
                      <div className="text-[14px] text-emerald-400/60 font-mono tracking-widest mb-3">SUPPORT LEVELS</div>
                      <div className="space-y-2">
                        {riskData.supportLevels.map((level, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[14px] text-[var(--t-text-muted)] font-mono">S{i + 1}</span>
                            <span className="text-sm font-mono font-semibold text-emerald-400">${level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {riskData.resistanceLevels && riskData.resistanceLevels.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <div className="text-[14px] text-red-400/60 font-mono tracking-widest mb-3">RESISTANCE LEVELS</div>
                      <div className="space-y-2">
                        {riskData.resistanceLevels.map((level, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-[14px] text-[var(--t-text-muted)] font-mono">R{i + 1}</span>
                            <span className="text-sm font-mono font-semibold text-red-400">${level.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Factors */}
                {riskData.risks && riskData.risks.length > 0 && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--t-border)]">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">RISK FACTORS</div>
                    </div>
                    <div className="divide-y divide-[var(--t-border)]">
                      {riskData.risks.map((risk, i) => (
                        <div key={i} className="px-5 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                              risk.severity === "High" || risk.severity === "Very High" ? "bg-red-400" :
                              risk.severity === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                            }`} />
                            <span className="text-xs font-semibold text-[var(--t-text)]">{risk.category}</span>
                            <span className={`text-[13px] font-mono px-1.5 py-0.5 rounded ${
                              risk.severity === "High" || risk.severity === "Very High" ? "text-red-400 bg-red-500/10" :
                              risk.severity === "Medium" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
                            }`}>{risk.severity}</span>
                          </div>
                          <p className="text-xs text-[var(--t-text-secondary)] leading-relaxed pl-4">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {riskData.summary && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
                    <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">RISK ASSESSMENT</div>
                    <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{riskData.summary}</p>
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
                    <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                      <div className="px-5 py-3 border-b border-[var(--t-border)]">
                        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">DIVIDEND HISTORY</div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[var(--t-border)]">
                              <th className="text-left px-5 py-2 text-[13px] text-[var(--t-text-muted)] font-mono">EX-DATE</th>
                              <th className="text-left px-3 py-2 text-[13px] text-[var(--t-text-muted)] font-mono">PAY DATE</th>
                              <th className="text-right px-3 py-2 text-[13px] text-[var(--t-text-muted)] font-mono">AMOUNT</th>
                              <th className="text-right px-5 py-2 text-[13px] text-[var(--t-text-muted)] font-mono">TYPE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--t-border)]">
                            {dividendData.dividends.map((d, i) => (
                              <tr key={i} className="hover:bg-[var(--t-stat-bg)]">
                                <td className="px-5 py-2 text-[var(--t-text-secondary)] font-mono">{d.exDividendDate}</td>
                                <td className="px-3 py-2 text-[var(--t-text-secondary)] font-mono">{d.payDate || "—"}</td>
                                <td className="px-3 py-2 text-right text-emerald-400 font-mono font-semibold">${d.cashAmount.toFixed(4)}</td>
                                <td className="px-5 py-2 text-right text-[var(--t-text-muted)] font-mono">{d.type || "CD"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-8 text-center">
                    <div className="text-[var(--t-text-dim)] text-4xl mb-3">—</div>
                    <p className="text-sm text-[var(--t-text-muted)] font-mono">{quote.symbol} does not currently pay a dividend</p>
                  </div>
                )}

                {/* Stock Splits */}
                {splitsData.length > 0 && (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--t-border)]">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">STOCK SPLIT HISTORY</div>
                    </div>
                    <div className="divide-y divide-[var(--t-border)]">
                      {splitsData.map((s, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <div className="text-xs text-[var(--t-text-secondary)] font-mono">{s.executionDate}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-blue-400">{s.ratio}</span>
                            <span className="text-[13px] text-[var(--t-text-muted)] font-mono">split</span>
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
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
                    <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-3">COMPANY DETAILS</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">INDUSTRY</div><div className="text-xs text-[var(--t-text-secondary)]">{detailsData.industry || detailsData.sicDescription || "—"}</div></div>
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">EMPLOYEES</div><div className="text-xs text-[var(--t-text-secondary)]">{detailsData.totalEmployees?.toLocaleString() || "—"}</div></div>
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">IPO DATE</div><div className="text-xs text-[var(--t-text-secondary)]">{detailsData.listDate || "—"}</div></div>
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">EXCHANGE</div><div className="text-xs text-[var(--t-text-secondary)]">{detailsData.exchange || "—"}</div></div>
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">WEBSITE</div><div className="text-xs text-blue-400/60 truncate">{detailsData.homepageUrl ? <a href={detailsData.homepageUrl} target="_blank" rel="noopener noreferrer">{detailsData.homepageUrl.replace(/https?:\/\//, "")}</a> : "—"}</div></div>
                      <div><div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-0.5">SHARES OUT</div><div className="text-xs text-[var(--t-text-secondary)]">{detailsData.weightedSharesOutstanding ? formatVol(detailsData.weightedSharesOutstanding) : "—"}</div></div>
                    </div>
                    {detailsData.description && (
                      <div className="mt-4 pt-4 border-t border-[var(--t-border)]">
                        <p className="text-xs text-[var(--t-text-muted)] leading-relaxed line-clamp-4">{detailsData.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Related Companies */}
                {relatedData.length > 0 ? (
                  <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[var(--t-border)]">
                      <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">RELATED COMPANIES</div>
                    </div>
                    <div className="divide-y divide-[var(--t-border)]">
                      {relatedData.map((r, i) => (
                        <Link
                          key={i}
                          to={`/markets/ticker/${r.symbol}`}
                          className="px-5 py-3 flex items-center justify-between hover:bg-[var(--t-stat-bg)] transition-colors block"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--t-btn-bg)] flex items-center justify-center text-[14px] font-mono text-[var(--t-text-secondary)] font-bold">{r.symbol.slice(0, 2)}</div>
                            <div>
                              <div className="text-xs font-semibold text-[var(--t-text)] font-mono">{r.symbol}</div>
                              <div className="text-[14px] text-[var(--t-text-muted)]">{r.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-[var(--t-text-secondary)]">{r.price ? `$${r.price.toFixed(2)}` : "—"}</div>
                            {r.change !== null && (
                              <div className={`text-[14px] font-mono ${r.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
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
            <div className="relative overflow-hidden rounded-xl border border-[var(--t-border)] bg-gradient-to-r from-[var(--t-btn-bg)] to-[var(--t-stat-bg)] p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[14px] font-mono text-[var(--t-text)] tracking-widest">AI RESEARCH PIPELINE</span>
                </div>
                <p className="text-[14px] text-[var(--t-text-muted)] max-w-lg">
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

        {/* ═══ THESIS TAB ═══ */}
        {activeTab === "thesis" && <ThesisTab symbol={quote.symbol} name={quote.name} price={quote.price} change={quote.change || 0} />}

        {/* ═══ VALUATION TAB ═══ */}
        {activeTab === "valuation" && <ValuationTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ MOAT TAB ═══ */}
        {activeTab === "moat" && <MoatTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ MANAGEMENT TAB ═══ */}
        {activeTab === "management" && <ManagementTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ BULL/BEAR TAB ═══ */}
        {activeTab === "bullbear" && <BullBearTab symbol={quote.symbol} name={quote.name} price={quote.price} change={quote.change || 0} />}

        {/* ═══ REVENUE TAB ═══ */}
        {activeTab === "revenue" && <RevenueTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ COMPETITIVE TAB ═══ */}
        {activeTab === "competitive" && <CompetitiveTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ FINANCIAL HEALTH TAB ═══ */}
        {activeTab === "health" && <FinancialHealthTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ CAPITAL ALLOCATION TAB ═══ */}
        {activeTab === "capital" && <CapitalAllocationTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ GUIDANCE TAB ═══ */}
        {activeTab === "guidance" && <GuidanceTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ INDUSTRY TAB ═══ */}
        {activeTab === "industry" && <IndustryTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ SECTOR ROTATION TAB ═══ */}
        {activeTab === "sectors" && <SectorRotationTab />}

        {/* ═══ IPO TAB ═══ */}
        {activeTab === "ipo" && <IPOTab />}

        {/* ═══ M&A TAB ═══ */}
        {activeTab === "ma" && <MATab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ REGULATORY TAB ═══ */}
        {activeTab === "regulatory" && <RegulatoryTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ INSTITUTIONAL TAB ═══ */}
        {activeTab === "institutional" && <InstitutionalTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ ETF EXPOSURE TAB ═══ */}
        {activeTab === "etf" && <ETFExposureTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ ACTIVIST TAB ═══ */}
        {activeTab === "activist" && <ActivistTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ INSIDER PATTERNS TAB ═══ */}
        {activeTab === "insiderpatterns" && <InsiderPatternsTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ SHORT INTEREST TAB ═══ */}
        {activeTab === "shortinterest" && <ShortInterestTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ EARNINGS REPLAY TAB ═══ */}
        {activeTab === "earningsreplay" && <EarningsReplayTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ EARNINGS CALENDAR TAB ═══ */}
        {activeTab === "earningscalendar" && <EarningsCalendarTab />}

        {/* ═══ ESTIMATE REVISIONS TAB ═══ */}
        {activeTab === "estimates" && <EstimateRevisionsTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ CASH FLOW TAB ═══ */}
        {activeTab === "cashflow" && <CashFlowTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ MARGINS TAB ═══ */}
        {activeTab === "margins" && <MarginsTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ DEEP COMPARE TAB ═══ */}
        {activeTab === "deepcompare" && <DeepCompareTab symbol={quote.symbol} name={quote.name} />}

        {/* ═══ SCENARIO TAB ═══ */}
        {activeTab === "scenario" && <ScenarioTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ QUALITY TAB ═══ */}
        {activeTab === "quality" && <QualityTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ ALERTS TAB ═══ */}
        {activeTab === "alerts" && <AlertsTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ═══ RESEARCH NOTES TAB ═══ */}
        {activeTab === "notes" && <ResearchNotesTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: Technicals ── */}
        {activeTab === "patternscanner" && <PatternScannerTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "supportresistance" && <SupportResistanceTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "momentum" && <MomentumTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "fibonacci" && <FibonacciTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "volumeprofile" && <VolumeProfileTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: Macro ── */}
        {activeTab === "fedimpact" && <FedImpactTab symbol={quote.symbol} name={quote.name} price={quote.price} sector={quote.sector} />}
        {activeTab === "inflation" && <InflationTab symbol={quote.symbol} name={quote.name} price={quote.price} sector={quote.sector} />}
        {activeTab === "currency" && <CurrencyTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "yieldcurve" && <YieldCurveTab symbol={quote.symbol} name={quote.name} price={quote.price} sector={quote.sector} />}
        {activeTab === "geopolitical" && <GeopoliticalTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: Sentiment ── */}
        {activeTab === "socialbuzz" && <SocialBuzzTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "newssentiment" && <NewsSentimentTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "analystsentiment" && <AnalystSentimentTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "optionssentiment" && <OptionsSentimentTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "earningstone" && <EarningsToneTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: Strategy ── */}
        {activeTab === "entryexit" && <EntryExitTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "positionsizing" && <PositionSizingTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "hedge" && <HedgeTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "taxoptimizer" && <TaxOptimizerTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "pairstrade" && <PairsTradeTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: Advanced Analytics ── */}
        {activeTab === "regression" && <RegressionTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "seasonality" && <SeasonalityTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "correlation" && <CorrelationTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "volatility" && <VolatilityTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "montecarlo" && <MonteCarloTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

        {/* ── Wave 2: ESG & Governance ── */}
        {activeTab === "esg" && <ESGTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "execcomp" && <ExecCompTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "board" && <BoardTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "activismhistory" && <ActivismHistoryTab symbol={quote.symbol} name={quote.name} price={quote.price} />}
        {activeTab === "corporateevents" && <CorporateEventsTab symbol={quote.symbol} name={quote.name} price={quote.price} />}

          <div className="text-center mt-16 pb-8">
            <div className="section-divider mb-6" />
            <p className="text-[13px] text-[var(--t-text-dim)] font-mono tracking-[0.1em]">
              Charts by TradingView <span className="text-[var(--t-border-hover)]">\u00b7</span> Live data via Massive API <span className="text-[var(--t-border-hover)]">\u00b7</span> Analysis powered by DeepSeek AI
            </p>
          </div>
          </div>
        </main>
      </div>

      <JacobChat symbol={quote.symbol} name={quote.name} price={quote.price} change={quote.change || 0} />
    </div>
  );
}

// ── Mini Stat Card ──
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-4 py-4 text-center">
      <div className="text-[12px] text-[var(--t-text-muted)] font-mono tracking-[0.15em] mb-2 uppercase">{label}</div>
      <div className="text-xl font-bold text-[var(--t-text)] tabular-nums font-mono">{value}</div>
    </div>
  );
}

// ── Loading Card ──
function LoadingCard({ label }: { label: string }) {
  return (
    <div className="content-card p-16 text-center">
      <div className="w-10 h-10 border-2 border-[var(--t-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <p className="text-sm font-mono text-[var(--t-text-muted)] animate-pulse tracking-wide">{label}</p>
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
        className="gen-btn w-full group bg-[var(--t-gen-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden hover:bg-[var(--t-gen-hover)] hover:border-[var(--t-border-hover)] transition-all duration-300"
      >
        <div className="relative z-10 flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-lg bg-[var(--t-btn-bg)] text-[var(--t-text-muted)] text-sm flex items-center justify-center font-mono font-bold group-hover:bg-[var(--t-group-active)] group-hover:text-[var(--t-text)] transition-all">{step}</span>
            <h3 className="text-[15px] font-medium text-[var(--t-text-muted)] group-hover:text-[var(--t-text)] transition-colors tracking-wide">{title}</h3>
          </div>
          <span className="text-[13px] font-mono font-semibold text-[var(--t-gen-text)] bg-[var(--t-btn-bg)] px-3.5 py-1.5 rounded-lg group-hover:bg-[var(--t-group-active)] transition-all tracking-wider">GENERATE</span>
        </div>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="content-card overflow-hidden">
        <div className="px-5 py-5 flex items-center gap-4">
          <span className="w-8 h-8 rounded-lg bg-[var(--t-group-active)] text-[var(--t-text)] text-sm flex items-center justify-center font-mono font-bold">{step}</span>
          <h3 className="text-[15px] font-medium text-[var(--t-text-secondary)] tracking-wide">{title}</h3>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="w-5 h-5 border-2 border-[var(--t-accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] font-mono text-[var(--t-text-muted)] animate-pulse tracking-wide">Analyzing...</span>
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
  if (!data) return <p className="text-xs text-[var(--t-text-muted)] font-mono">No data available</p>;

  if ((data as Record<string, unknown>).parseError) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <p className="text-xs text-amber-400 font-mono">AI returned non-standard format. Raw response:</p>
        <pre className="text-xs text-[var(--t-text-secondary)] mt-2 whitespace-pre-wrap">{String((data as Record<string, unknown>).raw || "")}</pre>
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
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.summary)}</p>}
          {d.whyNow && (
            <div className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <p className="text-[14px] text-[var(--t-text-muted)] font-mono mb-1">WHY THIS NAME NOW</p>
              <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.whyNow)}</p>
            </div>
          )}
        </>
      );

    case "what-moved":
      return (
        <>
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)]">{String(d.summary)}</p>}
          {d.catalysts && Array.isArray(d.catalysts) && (d.catalysts as Array<{title: string; description: string; impact: number}>).map((c, i) => (
            <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[var(--t-text)]">{c.title}</span>
                <ConfidenceDots value={c.impact * 10} />
              </div>
              <p className="text-xs text-[var(--t-text-secondary)] leading-relaxed">{c.description}</p>
            </div>
          ))}
        </>
      );

    case "industry-chain":
      return (
        <>
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)]">{String(d.summary)}</p>}
          {d.nodes && Array.isArray(d.nodes) && (d.nodes as Array<{name: string; role: string; tickers?: string[]}>).map((node, i) => (
            <div key={i} className="flex items-center gap-3 bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.role === "competitor" ? "bg-red-400" : node.role === "supplier" ? "bg-blue-400" : node.role === "customer" ? "bg-emerald-400" : "bg-purple-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--t-text)]">{node.name}</span>
                  <Tag label={node.role} color={node.role === "competitor" ? "red" : node.role === "supplier" ? "blue" : "green"} />
                </div>
                {node.tickers && (
                  <div className="flex gap-1 mt-1">
                    {node.tickers.map((t) => <span key={t} className="text-[14px] font-mono text-[var(--t-text-muted)] bg-[var(--t-btn-bg)] px-1.5 py-0.5 rounded border border-[var(--t-border)]">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {d.bottlenecks && Array.isArray(d.bottlenecks) && (d.bottlenecks as string[]).length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <p className="text-[14px] text-red-400 font-mono mb-1">BOTTLENECKS</p>
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
              <span className="text-3xl font-bold font-mono text-[var(--t-text)]">{String(d.score || "—")}</span>
              <span className="text-sm text-[var(--t-text-muted)] ml-1">/100</span>
            </div>
            {d.score && <ScoreBar label="Leverage" value={Number(d.score)} max={100} color={Number(d.score) >= 80 ? "#34d399" : Number(d.score) >= 60 ? "#fbbf24" : "#f87171"} />}
          </div>
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.summary)}</p>}
          {d.tags && Array.isArray(d.tags) && (
            <div className="flex flex-wrap gap-1">{(d.tags as string[]).map((t, i) => <Tag key={i} label={t} color="purple" />)}</div>
          )}
        </>
      );

    case "peer-readthrough":
      return (
        <>
          {d.peers && Array.isArray(d.peers) && (d.peers as Array<{ticker: string; name: string; signal: string; quote: string; implication: string; date: string}>).map((pr, i) => (
            <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[var(--t-text)]">{pr.ticker}</span>
                  <span className="text-xs text-[var(--t-text-muted)]">{pr.name}</span>
                </div>
                <DirectionArrow direction={pr.signal as "bullish" | "bearish" | "mixed"} />
              </div>
              <blockquote className="text-xs text-[var(--t-text-secondary)] italic border-l-2 border-[var(--t-border-hover)] pl-3 mb-2">"{pr.quote}"</blockquote>
              <p className="text-xs text-[var(--t-text-secondary)]">{pr.implication}</p>
              <p className="text-[14px] text-[var(--t-text-dim)] font-mono mt-1">{pr.date}</p>
            </div>
          ))}
        </>
      );

    case "follow-money":
      return (
        <>
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)]">{String(d.summary)}</p>}
          {d.flows && Array.isArray(d.flows) && (d.flows as Array<{entity: string; action: string; amount: string; date: string; significance: string}>).map((f, i) => (
            <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[var(--t-text)]">{f.entity}</span>
                <Tag label={f.action} color={f.action.toLowerCase().includes("buy") ? "green" : f.action.toLowerCase().includes("sell") ? "red" : "blue"} />
              </div>
              <p className="text-xs text-[var(--t-text-secondary)]">{f.amount} · {f.date}</p>
              <p className="text-xs text-[var(--t-text-secondary)] mt-1">{f.significance}</p>
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
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "segments":
      return (
        <>
          {d.segments && Array.isArray(d.segments) && (d.segments as Array<{name: string; status: string; role: string; description: string; importance: number}>).map((seg, i) => (
            <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[var(--t-text)]">{seg.name}</span>
                <div className="flex items-center gap-2">
                  <Tag label={seg.status} color={seg.status === "accelerating" ? "green" : seg.status === "stable" ? "blue" : "yellow"} />
                  <Tag label={seg.role} color={seg.role === "core" ? "green" : seg.role === "supporting" ? "blue" : "gray"} />
                </div>
              </div>
              <p className="text-xs text-[var(--t-text-secondary)] leading-relaxed">{seg.description}</p>
              <div className="mt-2"><ScoreBar label="Importance" value={seg.importance} max={100} /></div>
            </div>
          ))}
        </>
      );

    case "contracts":
      return (
        <>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold font-mono text-[var(--t-text)]">{String(d.score || "—")}</span>
            <span className="text-sm text-[var(--t-text-muted)]">/100</span>
          </div>
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)]">{String(d.summary)}</p>}
          {d.contracts && Array.isArray(d.contracts) && (d.contracts as Array<{customer: string; status: string; description: string}>).map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === "signed" ? "bg-emerald-400" : c.status === "expanding" ? "bg-blue-400" : "bg-amber-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{c.customer}</span>
                  <Tag label={c.status} color={c.status === "signed" ? "green" : c.status === "expanding" ? "blue" : "yellow"} />
                </div>
                <p className="text-xs text-[var(--t-text-secondary)] mt-0.5">{c.description}</p>
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
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.summary)}</p>}
          <div className="grid grid-cols-2 gap-2">
            {d.vsHistory && (
              <div className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <p className="text-[14px] text-[var(--t-text-muted)] font-mono mb-1">VS HISTORY</p>
                <p className="text-xs text-[var(--t-text-secondary)]">{String(d.vsHistory)}</p>
              </div>
            )}
            {d.vsPeers && (
              <div className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <p className="text-[14px] text-[var(--t-text-muted)] font-mono mb-1">VS PEERS</p>
                <p className="text-xs text-[var(--t-text-secondary)]">{String(d.vsPeers)}</p>
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
          {d.summary && <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "thesis":
      return (
        <>
          {d.summary && <p className="text-sm text-[var(--t-text)] leading-relaxed font-medium">{String(d.summary)}</p>}
          <div className="grid grid-cols-1 gap-3">
            {d.bullCase && (
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                <p className="text-[14px] text-emerald-400 font-mono mb-1">BULL CASE</p>
                <p className="text-xs text-emerald-300/70 leading-relaxed">{String(d.bullCase)}</p>
              </div>
            )}
            {d.bearCase && (
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <p className="text-[14px] text-red-400 font-mono mb-1">BEAR CASE</p>
                <p className="text-xs text-red-300/70 leading-relaxed">{String(d.bearCase)}</p>
              </div>
            )}
            {d.whatChangesIt && (
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <p className="text-[14px] text-amber-400 font-mono mb-1">WHAT CHANGES IT</p>
                <p className="text-xs text-amber-300/70 leading-relaxed">{String(d.whatChangesIt)}</p>
              </div>
            )}
          </div>
          {d.watchItems && Array.isArray(d.watchItems) && (
            <div className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <p className="text-[14px] text-[var(--t-text-muted)] font-mono mb-2">WATCH ITEMS</p>
              <ul className="space-y-1">
                {(d.watchItems as string[]).map((item, i) => (
                  <li key={i} className="text-xs text-[var(--t-text-secondary)] flex items-center gap-2">
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
              <span className="text-4xl font-bold font-mono text-[var(--t-text)]">{String(d.totalScore || "—")}</span>
              <p className="text-xs text-[var(--t-text-muted)] font-mono">/100</p>
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
            <div key={i} className="flex items-start gap-3 bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
              <Tag label={s.type.replace(/_/g, " ")} color="blue" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--t-text)] truncate">{s.title}</p>
                <p className="text-[14px] text-[var(--t-text-muted)] mt-0.5">{s.source} · {s.date}</p>
                <p className="text-xs text-[var(--t-text-secondary)] mt-1 line-clamp-2">{s.summary}</p>
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
        <div key={key} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
          <p className="text-[14px] text-[var(--t-text-muted)] font-mono mb-1">{key.toUpperCase()}</p>
          <p className="text-xs text-[var(--t-text-secondary)]">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</p>
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
