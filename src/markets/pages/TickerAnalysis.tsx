import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLiveQuote, fetchSectionAnalysis, formatMarketCap, type LiveQuote, type AIAnalysis } from "../data/api";
import {
  SectionCard, Tag, DirectionArrow, ConfidenceDots,
  StatBox, EmptyState, ScoreBar,
} from "../components/MarketComponents";
import JacobChat from "../components/JacobChat";
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

export default function TickerAnalysis() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleTicker } = useWatchlist();
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sectionData, setSectionData] = useState<Record<string, Record<string, unknown> | null>>({});
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

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
        <div className="max-w-3xl mx-auto px-5 py-8">
          <button onClick={() => navigate("/markets")} className="text-[11px] text-white/30 hover:text-white/60 font-mono mb-6 transition-colors">← DASHBOARD</button>
          <EmptyState message={error || `Ticker ${symbol} not found`} />
        </div>
      </div>
    );
  }

  const pct = quote.change || 0;
  const isUp = pct >= 0;

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#060606]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
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
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
            <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">MARKET CAP</div>
            <div className="text-sm font-semibold text-white tabular-nums">{quote.marketCap ? formatMarketCap(quote.marketCap) : "—"}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
            <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">VOLUME</div>
            <div className="text-sm font-semibold text-white tabular-nums">{formatVol(quote.volume)}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
            <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">52W HIGH</div>
            <div className="text-sm font-semibold text-white tabular-nums">{quote.fiftyTwoWeekHigh ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : "—"}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
            <div className="text-[9px] text-white/20 font-mono tracking-widest mb-1">52W LOW</div>
            <div className="text-sm font-semibold text-white tabular-nums">{quote.fiftyTwoWeekLow ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : "—"}</div>
          </div>
        </div>

        {/* Company Description */}
        {quote.description && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-white/60 font-mono tracking-wider mb-2">ABOUT</h3>
            <p className="text-[13px] text-white/40 leading-relaxed line-clamp-4">{quote.description}</p>
            {quote.ceo && <p className="text-[10px] text-white/15 font-mono mt-3">CEO: {quote.ceo}</p>}
          </div>
        )}

        {/* AI Pipeline Header */}
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
          {/* Subtle gradient orb */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-3xl" />
        </div>

        {/* Analysis Sections */}
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

        <div className="text-center mt-12 pb-6">
          <p className="text-[10px] text-white/10 font-mono tracking-wider">
            Live data via Massive API · Analysis powered by DeepSeek AI
          </p>
        </div>
      </div>

      <JacobChat symbol={quote.symbol} name={quote.name} price={quote.price} change={quote.change || 0} />
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
                {(d.bottlenecks as string[]).map((b, i) => <li key={i}>• {b}</li>)}
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
              <span className="text-[10px] text-white/15 font-mono mt-1 block">{pr.date}</span>
            </div>
          ))}
        </>
      );

    case "follow-money":
      return (
        <>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{String(d.score || "—")}</span>
              <span className="text-sm text-white/20 ml-1">/100</span>
            </div>
            {d.type && <Tag label={String(d.type)} color={d.type === "structural" ? "green" : "yellow"} />}
          </div>
          {d.summary && <p className="text-sm text-white/60 leading-relaxed">{String(d.summary)}</p>}
          {d.signals && Array.isArray(d.signals) && (d.signals as Array<{type: string; strength: string; description: string; amount?: string}>).map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.strength === "strong" ? "bg-emerald-400" : s.strength === "moderate" ? "bg-amber-400" : "bg-white/20"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/80">{s.type}</span>
                  <Tag label={s.strength} color={s.strength === "strong" ? "green" : s.strength === "moderate" ? "yellow" : "gray"} />
                </div>
                <p className="text-xs text-white/40 mt-0.5">{s.description}</p>
                {s.amount && <span className="text-xs font-mono text-emerald-400 font-semibold">{s.amount}</span>}
              </div>
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
              <div className="mt-2">
                <ScoreBar label="Importance" value={seg.importance} max={100} />
              </div>
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

function MiniChart({ data }: { data: Array<{ date: string; close: number }> }) {
  if (data.length < 2) return null;
  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 340;
  const h = 80;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "#34d399" : "#f87171";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.15" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polygon fill="url(#chartGrad)" points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

function formatVol(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return `${vol}`;
}
