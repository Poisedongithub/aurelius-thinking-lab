import { useParams, useNavigate } from "react-router-dom";
import { getTickerAnalysis } from "../data/mockData";
import {
  SectionCard, Tag, DirectionArrow, ConfidenceDots, TrendBadge,
  ProcessScoreCard, SourceBadge, StatBox, EmptyState, ScoreBar,
} from "../components/MarketComponents";

export default function TickerAnalysis() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const data = getTickerAnalysis(symbol || "");

  if (!data) return <EmptyState message={`Ticker ${symbol} not found`} />;

  const pct = data.price.dayMovePct;
  const pctColor = pct >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/markets")} className="text-xs text-gray-400 hover:text-gray-600 font-mono">← DASHBOARD</button>
            <span className="text-[10px] font-mono text-gray-400">Updated {data.lastUpdated}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono text-gray-900">{data.symbol}</h1>
                <Tag label={data.processScore.rank} color={data.processScore.rank === "Lead" ? "green" : data.processScore.rank === "Strong Watch" ? "blue" : "yellow"} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{data.name} · {data.exchange} · {data.industry}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-gray-900">${data.price.price.toFixed(2)}</div>
              <span className={`text-sm font-mono ${pctColor}`}>{pct >= 0 ? "+" : ""}{pct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
        {/* Price Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <StatBox label="1D" value={`${data.price.dayMovePct >= 0 ? "+" : ""}${data.price.dayMovePct.toFixed(1)}%`} />
          <StatBox label="1W" value={`${data.price.weekMovePct >= 0 ? "+" : ""}${data.price.weekMovePct.toFixed(1)}%`} />
          <StatBox label="1M" value={`${data.price.monthMovePct >= 0 ? "+" : ""}${data.price.monthMovePct.toFixed(1)}%`} />
          <StatBox label="QTD" value={`${data.price.quarterMovePct >= 0 ? "+" : ""}${data.price.quarterMovePct.toFixed(1)}%`} />
          <StatBox label="YTD" value={`${data.price.ytdMovePct >= 0 ? "+" : ""}${data.price.ytdMovePct.toFixed(1)}%`} />
        </div>

        {/* Step 1: Attention Trigger */}
        <SectionCard title="Attention Trigger" step={1}>
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-2">
              <Tag label={data.attentionTrigger.triggerType} color="blue" />
              {data.price.volumeSpike && <Tag label="Volume Spike" color="red" />}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.attentionTrigger.triggerSummary}</p>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 font-mono mb-1">WHY THIS NAME NOW</p>
              <p className="text-sm text-gray-800 leading-relaxed">{data.attentionTrigger.whyThisNameNow}</p>
            </div>
          </div>
        </SectionCard>

        {/* Step 2: Stock Move */}
        <SectionCard title="What Moved the Stock" step={2}>
          <div className="space-y-3 pt-3">
            <p className="text-sm text-gray-700">{data.stockMove.moveSummary}</p>
            {data.stockMove.unknownFlag && <Tag label="Catalyst Unclear" color="yellow" />}
            <div className="space-y-3">
              {data.stockMove.topCatalysts.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.label}</span>
                    <ConfidenceDots value={c.confidence} />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{c.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Step 3: Industry Chain */}
        <SectionCard title="Industry Chain Map" step={3}>
          <div className="space-y-3 pt-3">
            <p className="text-sm text-gray-700">{data.industryChain.companyRole}</p>
            <div className="space-y-2">
              {data.industryChain.nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.nodeType === "bottleneck" ? "bg-red-500" : node.nodeType === "end_demand" ? "bg-blue-500" : node.nodeType === "platform" ? "bg-purple-500" : "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{node.name}</span>
                      <Tag label={node.nodeType.replace("_", " ")} color={node.nodeType === "bottleneck" ? "red" : "gray"} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{node.role}</p>
                    {node.tickers && (
                      <div className="flex gap-1 mt-1">
                        {node.tickers.map((t) => (
                          <span key={t} className="text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {data.industryChain.bottlenecks.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600 font-mono mb-1">BOTTLENECKS</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {data.industryChain.bottlenecks.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Step 4: Leverage Point */}
        <SectionCard title="Leverage Point Assessment" step={4}>
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-3xl font-bold font-mono text-gray-900">{data.leveragePoint.leverageScore}</span>
                <span className="text-sm text-gray-400 ml-1">/100</span>
              </div>
              <div className="flex-1">
                <ScoreBar label="Leverage" value={data.leveragePoint.leverageScore} max={100} color={data.leveragePoint.leverageScore >= 80 ? "#059669" : data.leveragePoint.leverageScore >= 60 ? "#d97706" : "#dc2626"} />
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.leveragePoint.leverageReasoning}</p>
            <div className="flex items-center gap-2">
              <Tag label={data.leveragePoint.bottleneckType} color="purple" />
              {data.leveragePoint.isBestLeveragePoint ? <Tag label="Best Leverage Point" color="green" /> : <Tag label="Not Best Leverage" color="yellow" />}
            </div>
            {data.leveragePoint.betterAlternatives.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-mono mb-1">BETTER ALTERNATIVES</p>
                <p className="text-xs text-amber-700">{data.leveragePoint.betterAlternatives.join(", ")}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Step 5: Peer Read-throughs */}
        <SectionCard title="Peer Read-throughs" step={5}>
          <div className="space-y-3 pt-3">
            {data.peerReadthroughs.map((pr, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-gray-900">{pr.sourceTicker}</span>
                    <span className="text-xs text-gray-400">{pr.sourceCompany}</span>
                  </div>
                  <DirectionArrow direction={pr.direction} />
                </div>
                <blockquote className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 mb-2">"{pr.quote}"</blockquote>
                <p className="text-xs text-gray-700">{pr.implication}</p>
                <div className="flex items-center gap-2 mt-2">
                  <ConfidenceDots value={pr.confidence} />
                  <span className="text-[10px] text-gray-400 font-mono">{pr.sourceDate}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 6: Money Flow */}
        <SectionCard title="Follow the Money" step={6}>
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-3xl font-bold font-mono text-gray-900">{data.moneyFlow.moneyFlowScore}</span>
                <span className="text-sm text-gray-400 ml-1">/100</span>
              </div>
              <Tag label={data.moneyFlow.durability} color={data.moneyFlow.durability === "structural" ? "green" : "yellow"} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.moneyFlow.moneyFlowSummary}</p>
            {data.moneyFlow.evidence.map((e, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${e.strength === "strong" ? "bg-emerald-500" : e.strength === "moderate" ? "bg-amber-500" : "bg-gray-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{e.flowType.replace(/_/g, " ")}</span>
                    <Tag label={e.strength} color={e.strength === "strong" ? "green" : e.strength === "moderate" ? "yellow" : "gray"} />
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{e.summary}</p>
                  {e.amount && <span className="text-xs font-mono text-emerald-600 font-semibold">{e.amount}</span>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 7: Company Numbers */}
        <SectionCard title="Company Numbers" step={7}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Rev Growth" value={data.companyNumbers.revenueGrowth} />
              <StatBox label="EPS Growth" value={data.companyNumbers.epsGrowth} />
              <StatBox label="Gross Margin" value={data.companyNumbers.grossMargin} />
              <StatBox label="Op Margin" value={data.companyNumbers.operatingMargin} />
              <StatBox label="FCF Margin" value={data.companyNumbers.fcfMargin} />
              <StatBox label="Guide" value={data.companyNumbers.guideDirection.split("—")[0].trim()} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.companyNumbers.summary}</p>
          </div>
        </SectionCard>

        {/* Step 8: Segment Breakdown */}
        <SectionCard title="Segment Breakdown" step={8}>
          <div className="space-y-3 pt-3">
            {data.segments.map((seg, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{seg.segmentName}</span>
                  <div className="flex items-center gap-2">
                    <TrendBadge trend={seg.trend} />
                    <Tag label={seg.thesisRole} color={seg.thesisRole === "core" ? "green" : seg.thesisRole === "supporting" ? "blue" : seg.thesisRole === "drag" ? "red" : "gray"} />
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{seg.summary}</p>
                <div className="mt-2">
                  <ScoreBar label="Importance" value={seg.importanceScore} max={100} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 9: Contracts & Adoption */}
        <SectionCard title="Contracts & Adoption Proof" step={9}>
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-3xl font-bold font-mono text-gray-900">{data.contractsAdoption.adoptionScore}</span>
                <span className="text-sm text-gray-400 ml-1">/100</span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{data.contractsAdoption.adoptionSummary}</p>
            {data.contractsAdoption.evidence.map((e, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${e.stage === "signed" ? "bg-emerald-500" : e.stage === "expanding" ? "bg-blue-500" : e.stage === "rumored" ? "bg-amber-500" : "bg-gray-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {e.customerName && <span className="text-xs font-semibold text-gray-900">{e.customerName}</span>}
                    <Tag label={e.stage} color={e.stage === "signed" ? "green" : e.stage === "expanding" ? "blue" : "yellow"} />
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{e.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 10: Valuation */}
        <SectionCard title="Valuation Context" step={10}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="P/E" value={data.valuation.pe ? `${data.valuation.pe}x` : "N/A"} />
              <StatBox label="EV/Sales" value={data.valuation.evSales ? `${data.valuation.evSales}x` : "N/A"} />
              <StatBox label="EV/EBITDA" value={data.valuation.evEbitda ? `${data.valuation.evEbitda}x` : "N/A"} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.valuation.summary}</p>
            <div className="flex items-center gap-2">
              {data.valuation.pricedForPerfection && <Tag label="Priced for Perfection" color="red" />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono mb-1">VS HISTORY</p>
                <p className="text-xs text-gray-700">{data.valuation.relativeToHistory}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono mb-1">VS PEERS</p>
                <p className="text-xs text-gray-700">{data.valuation.relativeToPeers}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Step 11: Ownership & Sentiment */}
        <SectionCard title="Ownership & Sentiment" step={11}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="Institutional" value={data.ownershipSentiment.institutionalOwnership} />
              <StatBox label="Short Interest" value={data.ownershipSentiment.shortInterest} />
            </div>
            <div className="flex items-center gap-2">
              <Tag label={`Crowding: ${data.ownershipSentiment.crowding}`} color={data.ownershipSentiment.crowding === "elevated" ? "red" : data.ownershipSentiment.crowding === "moderate" ? "yellow" : "green"} />
              <Tag label={data.ownershipSentiment.sentiment} color={data.ownershipSentiment.sentiment.includes("bullish") ? "green" : "gray"} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.ownershipSentiment.summary}</p>
          </div>
        </SectionCard>

        {/* Step 12: Thesis */}
        <SectionCard title="Investment Thesis" step={12}>
          <div className="space-y-3 pt-3">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">{data.thesis.summary}</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-mono mb-1">BULL CASE</p>
                <p className="text-xs text-emerald-800 leading-relaxed">{data.thesis.bullCase}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-[10px] text-red-600 font-mono mb-1">BEAR CASE</p>
                <p className="text-xs text-red-800 leading-relaxed">{data.thesis.bearCase}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-[10px] text-amber-600 font-mono mb-1">WHAT CHANGES IT</p>
                <p className="text-xs text-amber-800 leading-relaxed">{data.thesis.whatChangesIt}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-mono mb-2">WATCH ITEMS</p>
              <ul className="space-y-1">
                {data.thesis.watchItems.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Step 13: Process Score */}
        <SectionCard title="Process Score" step={13}>
          <div className="space-y-4 pt-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-4xl font-bold font-mono text-gray-900">{data.processScore.total}</span>
                <p className="text-xs text-gray-400 font-mono">/100</p>
              </div>
              <div className="flex-1">
                <Tag label={data.processScore.rank} color={data.processScore.rank === "Lead" ? "green" : data.processScore.rank === "Strong Watch" ? "blue" : "yellow"} />
              </div>
            </div>
            <ProcessScoreCard score={data.processScore as unknown as Record<string, number>} />
          </div>
        </SectionCard>

        {/* Step 14: Sources */}
        <SectionCard title="Evidence & Sources" step={14}>
          <div className="space-y-2 pt-3">
            {data.sources.map((s) => (
              <div key={s.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <SourceBadge type={s.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.sourceName} · {s.date}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{s.contentSnippet}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
