import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLiveQuote, fetchSectionAnalysis, formatMarketCap, type LiveQuote, type AIAnalysis } from "../data/api";
import {
  SectionCard, Tag, DirectionArrow, ConfidenceDots,
  StatBox, EmptyState, ScoreBar,
} from "../components/MarketComponents";

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
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sectionData, setSectionData] = useState<Record<string, Record<string, unknown> | null>>({});
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // Fetch live quote on mount
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchLiveQuote(symbol);
        if (!cancelled) {
          if (data) {
            setQuote(data);
          } else {
            setError(`Could not find data for ${symbol}`);
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load stock data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [symbol]);

  // Load a section's AI analysis on demand
  const loadSection = async (sectionKey: SectionKey) => {
    if (!quote || loadedSections.has(sectionKey) || loadingSections.has(sectionKey)) return;

    setLoadingSections((prev) => new Set(prev).add(sectionKey));
    try {
      const analysis = await fetchSectionAnalysis(
        quote.symbol, quote.name, quote.price, quote.change, sectionKey
      );
      setSectionData((prev) => ({ ...prev, [sectionKey]: analysis }));
      setLoadedSections((prev) => new Set(prev).add(sectionKey));
    } catch {
      setSectionData((prev) => ({ ...prev, [sectionKey]: { error: "Failed to generate analysis" } }));
    } finally {
      setLoadingSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionKey);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-gray-500">Loading {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => navigate("/markets")} className="text-xs text-gray-400 hover:text-gray-600 font-mono mb-4">← DASHBOARD</button>
          <EmptyState message={error || `Ticker ${symbol} not found`} />
        </div>
      </div>
    );
  }

  const pct = quote.change || 0;
  const pctColor = pct >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/markets")} className="text-xs text-gray-400 hover:text-gray-600 font-mono">← DASHBOARD</button>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono text-gray-900">{quote.symbol}</h1>
                {quote.sector && <Tag label={quote.sector} color="blue" />}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{quote.name} · {quote.exchange} · {quote.industry || ""}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-gray-900">${quote.price.toFixed(2)}</div>
              <span className={`text-sm font-mono ${pctColor}`}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
        {/* Price Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatBox label="Market Cap" value={formatMarketCap(quote.marketCap)} />
          <StatBox label="Volume" value={formatVol(quote.volume)} />
          <StatBox label="52W High" value={`$${quote.yearHigh?.toFixed(2) || "—"}`} />
          <StatBox label="52W Low" value={`$${quote.yearLow?.toFixed(2) || "—"}`} />
        </div>

        {/* Performance */}
        {quote.performance && (
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(quote.performance).map(([period, val]) => (
              <StatBox
                key={period}
                label={period}
                value={val != null ? `${val >= 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
              />
            ))}
          </div>
        )}

        {/* Company Description */}
        {quote.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">About {quote.name}</h3>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{quote.description}</p>
            {quote.ceo && <p className="text-[10px] text-gray-400 font-mono mt-2">CEO: {quote.ceo}</p>}
          </div>
        )}

        {/* Mini Chart */}
        {quote.chart && quote.chart.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">30-Day Price</h3>
            <MiniChart data={quote.chart} />
          </div>
        )}

        {/* AI Analysis Sections */}
        <div className="bg-gray-900 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono">AI RESEARCH PIPELINE</span>
          </div>
          <p className="text-xs text-gray-400">Click any section below to generate institutional-grade AI analysis for {quote.symbol}. Each section is generated on demand.</p>
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

        {/* Attribution */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[10px] text-gray-300 font-mono">
            Live data via Financial Modeling Prep · Analysis powered by DeepSeek AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Analysis Section Component ──
function AnalysisSection({
  sectionKey, title, step, data, isLoading, isLoaded, onLoad,
}: {
  sectionKey: SectionKey; title: string; step: number;
  data: Record<string, unknown> | null; isLoading: boolean; isLoaded: boolean;
  onLoad: () => void;
}) {
  if (!isLoaded && !isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <button
          onClick={onLoad}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-mono">{step}</span>
            <h3 className="text-sm font-semibold text-gray-400 tracking-tight">{title}</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">GENERATE</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div className="px-5 py-4 flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-mono">{step}</span>
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-gray-400 animate-pulse">Analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render the analysis data
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
  if (!data) return <p className="text-xs text-gray-400 font-mono">No data available</p>;

  if ((data as Record<string, unknown>).parseError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-700 font-mono">AI returned non-standard format. Raw response:</p>
        <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{String((data as Record<string, unknown>).raw || "")}</pre>
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
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
          {d.whyNow && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-mono mb-1">WHY THIS NAME NOW</p>
              <p className="text-sm text-gray-800 leading-relaxed">{String(d.whyNow)}</p>
            </div>
          )}
        </>
      );

    case "what-moved":
      return (
        <>
          {d.summary && <p className="text-sm text-gray-700">{String(d.summary)}</p>}
          {d.catalysts && Array.isArray(d.catalysts) && (d.catalysts as Array<{title: string; description: string; impact: number}>).map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">{c.title}</span>
                <ConfidenceDots value={c.impact * 10} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </>
      );

    case "industry-chain":
      return (
        <>
          {d.summary && <p className="text-sm text-gray-700">{String(d.summary)}</p>}
          {d.nodes && Array.isArray(d.nodes) && (d.nodes as Array<{name: string; role: string; tickers?: string[]}>).map((node, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.role === "competitor" ? "bg-red-500" : node.role === "supplier" ? "bg-blue-500" : node.role === "customer" ? "bg-emerald-500" : "bg-purple-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{node.name}</span>
                  <Tag label={node.role} color={node.role === "competitor" ? "red" : node.role === "supplier" ? "blue" : "green"} />
                </div>
                {node.tickers && (
                  <div className="flex gap-1 mt-1">
                    {node.tickers.map((t) => <span key={t} className="text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {d.bottlenecks && Array.isArray(d.bottlenecks) && (d.bottlenecks as string[]).length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-red-600 font-mono mb-1">BOTTLENECKS</p>
              <ul className="text-xs text-red-700 space-y-1">
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
              <span className="text-3xl font-bold font-mono text-gray-900">{String(d.score || "—")}</span>
              <span className="text-sm text-gray-400 ml-1">/100</span>
            </div>
            {d.score && <ScoreBar label="Leverage" value={Number(d.score)} max={100} color={Number(d.score) >= 80 ? "#059669" : Number(d.score) >= 60 ? "#d97706" : "#dc2626"} />}
          </div>
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
          {d.tags && Array.isArray(d.tags) && (
            <div className="flex flex-wrap gap-1">{(d.tags as string[]).map((t, i) => <Tag key={i} label={t} color="purple" />)}</div>
          )}
        </>
      );

    case "peer-readthrough":
      return (
        <>
          {d.peers && Array.isArray(d.peers) && (d.peers as Array<{ticker: string; name: string; signal: string; quote: string; implication: string; date: string}>).map((pr, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-gray-900">{pr.ticker}</span>
                  <span className="text-xs text-gray-400">{pr.name}</span>
                </div>
                <DirectionArrow direction={pr.signal as "bullish" | "bearish" | "mixed"} />
              </div>
              <blockquote className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 mb-2">"{pr.quote}"</blockquote>
              <p className="text-xs text-gray-700">{pr.implication}</p>
              <span className="text-[10px] text-gray-400 font-mono mt-1 block">{pr.date}</span>
            </div>
          ))}
        </>
      );

    case "follow-money":
      return (
        <>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold font-mono text-gray-900">{String(d.score || "—")}</span>
              <span className="text-sm text-gray-400 ml-1">/100</span>
            </div>
            {d.type && <Tag label={String(d.type)} color={d.type === "structural" ? "green" : "yellow"} />}
          </div>
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
          {d.signals && Array.isArray(d.signals) && (d.signals as Array<{type: string; strength: string; description: string; amount?: string}>).map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.strength === "strong" ? "bg-emerald-500" : s.strength === "moderate" ? "bg-amber-500" : "bg-gray-400"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900">{s.type}</span>
                  <Tag label={s.strength} color={s.strength === "strong" ? "green" : s.strength === "moderate" ? "yellow" : "gray"} />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                {s.amount && <span className="text-xs font-mono text-emerald-600 font-semibold">{s.amount}</span>}
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
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "segments":
      return (
        <>
          {d.segments && Array.isArray(d.segments) && (d.segments as Array<{name: string; status: string; role: string; description: string; importance: number}>).map((seg, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">{seg.name}</span>
                <div className="flex items-center gap-2">
                  <Tag label={seg.status} color={seg.status === "accelerating" ? "green" : seg.status === "stable" ? "blue" : "yellow"} />
                  <Tag label={seg.role} color={seg.role === "core" ? "green" : seg.role === "supporting" ? "blue" : "gray"} />
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{seg.description}</p>
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
            <span className="text-3xl font-bold font-mono text-gray-900">{String(d.score || "—")}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
          {d.summary && <p className="text-sm text-gray-700">{String(d.summary)}</p>}
          {d.contracts && Array.isArray(d.contracts) && (d.contracts as Array<{customer: string; status: string; description: string}>).map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === "signed" ? "bg-emerald-500" : c.status === "expanding" ? "bg-blue-500" : "bg-amber-500"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900">{c.customer}</span>
                  <Tag label={c.status} color={c.status === "signed" ? "green" : c.status === "expanding" ? "blue" : "yellow"} />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{c.description}</p>
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
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
          <div className="grid grid-cols-2 gap-2">
            {d.vsHistory && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono mb-1">VS HISTORY</p>
                <p className="text-xs text-gray-700">{String(d.vsHistory)}</p>
              </div>
            )}
            {d.vsPeers && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono mb-1">VS PEERS</p>
                <p className="text-xs text-gray-700">{String(d.vsPeers)}</p>
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
          {d.summary && <p className="text-sm text-gray-700 leading-relaxed">{String(d.summary)}</p>}
        </>
      );

    case "thesis":
      return (
        <>
          {d.summary && <p className="text-sm text-gray-800 leading-relaxed font-medium">{String(d.summary)}</p>}
          <div className="grid grid-cols-1 gap-3">
            {d.bullCase && (
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-mono mb-1">BULL CASE</p>
                <p className="text-xs text-emerald-800 leading-relaxed">{String(d.bullCase)}</p>
              </div>
            )}
            {d.bearCase && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-[10px] text-red-600 font-mono mb-1">BEAR CASE</p>
                <p className="text-xs text-red-800 leading-relaxed">{String(d.bearCase)}</p>
              </div>
            )}
            {d.whatChangesIt && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-[10px] text-amber-600 font-mono mb-1">WHAT CHANGES IT</p>
                <p className="text-xs text-amber-800 leading-relaxed">{String(d.whatChangesIt)}</p>
              </div>
            )}
          </div>
          {d.watchItems && Array.isArray(d.watchItems) && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-mono mb-2">WATCH ITEMS</p>
              <ul className="space-y-1">
                {(d.watchItems as string[]).map((item, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
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
              <span className="text-4xl font-bold font-mono text-gray-900">{String(d.totalScore || "—")}</span>
              <p className="text-xs text-gray-400 font-mono">/100</p>
            </div>
            {d.conviction && <Tag label={String(d.conviction)} color={d.conviction === "lead" || d.conviction === "high" ? "green" : d.conviction === "moderate" ? "yellow" : "gray"} />}
          </div>
          {d.breakdown && typeof d.breakdown === "object" && (
            <div className="space-y-2">
              {Object.entries(d.breakdown as Record<string, number>).map(([key, val]) => (
                <ScoreBar key={key} label={key} value={val} max={15} color={val / 15 >= 0.7 ? "#059669" : val / 15 >= 0.4 ? "#d97706" : "#dc2626"} />
              ))}
            </div>
          )}
        </>
      );

    case "evidence":
      return (
        <>
          {d.sources && Array.isArray(d.sources) && (d.sources as Array<{type: string; title: string; source: string; date: string; summary: string}>).map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <Tag label={s.type.replace(/_/g, " ")} color="blue" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{s.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.source} · {s.date}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{s.summary}</p>
              </div>
            </div>
          ))}
        </>
      );

    default:
      return <GenericDataRenderer data={data} />;
  }
}

// ── Generic fallback renderer for unexpected data shapes ──
function GenericDataRenderer({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-[10px] text-gray-400 font-mono mb-1">{key.toUpperCase()}</p>
          <p className="text-xs text-gray-700">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mini Chart (SVG sparkline) ──
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
  const color = isUp ? "#059669" : "#dc2626";

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
