import { useState } from "react";
import { ScoreBar, Tag, StatBox, EmptyState, ConfidenceDots } from "./MarketComponents";
import {
  fetchEarningsReplay, fetchEarningsCalendar, fetchEstimateRevisions, fetchCashFlow, fetchMargins,
  fetchScenario, fetchQuality, fetchAlerts, fetchNoteSuggestions,
  type EarningsReplayAnalysis, type EarningsCalendarAnalysis, type EstimateRevisionsAnalysis,
  type CashFlowAnalysis, type MarginAnalysis, type ScenarioAnalysis, type QualityAnalysis,
  type AlertsAnalysis, type NoteSuggestAnalysis,
} from "../data/api";

function GenerateButton({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  if (loading) return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 text-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm font-mono text-white/30 animate-pulse">{label}</p>
    </div>
  );
  return (
    <button onClick={onClick} className="w-full group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm text-white/30 group-hover:text-white/60 transition-colors">{label}</h3>
        <span className="text-[10px] font-mono text-white/15 bg-white/[0.04] px-2.5 py-1 rounded-md group-hover:text-white/30 group-hover:bg-white/[0.06] transition-all">GENERATE</span>
      </div>
    </button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="text-[10px] text-white/25 font-mono tracking-widest">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   21. EARNINGS REPLAY
   ═══════════════════════════════════════════════════════════════════ */
export function EarningsReplayTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<EarningsReplayAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchEarningsReplay(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Replay Last Earnings" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Replaying earnings..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] text-white/25 font-mono tracking-widest">{data.quarter} · {data.date}</div>
            <h3 className="text-lg font-bold text-white mt-1">{data.headline}</h3>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.revenue && (
          <Card title="REVENUE">
            <div className="grid grid-cols-2 gap-2">
              <StatBox label="ACTUAL" value={data.revenue.actual || "—"} />
              <StatBox label="ESTIMATE" value={data.revenue.estimate || "—"} />
              <StatBox label="SURPRISE" value={data.revenue.surprise || "—"} />
              <StatBox label="YoY GROWTH" value={data.revenue.yoyGrowth || "—"} />
            </div>
          </Card>
        )}
        {data.eps && (
          <Card title="EPS">
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="ACTUAL" value={data.eps.actual || "—"} />
              <StatBox label="ESTIMATE" value={data.eps.estimate || "—"} />
              <StatBox label="SURPRISE" value={data.eps.surprise || "—"} />
            </div>
          </Card>
        )}
      </div>
      {data.segmentHighlights?.length > 0 && (
        <Card title="SEGMENT HIGHLIGHTS">
          <div className="space-y-3">
            {data.segmentHighlights.map((s, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70">{s.segment}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/40">{s.revenue}</span>
                    <Tag label={s.growth} color={s.growth?.startsWith("+") ? "green" : "red"} />
                  </div>
                </div>
                <p className="text-xs text-white/40">{s.commentary}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.guidanceUpdate && (
        <Card title="GUIDANCE UPDATE">
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="NEXT QTR" value={data.guidanceUpdate.nextQuarter || "—"} />
            <StatBox label="VS CONSENSUS" value={data.guidanceUpdate.vsConsensus || "—"} />
            <StatBox label="REACTION" value={data.guidanceUpdate.reaction || "—"} />
          </div>
        </Card>
      )}
      {data.stockReaction && (
        <Card title="STOCK REACTION">
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="AFTER HOURS" value={data.stockReaction.afterHours || "—"} />
            <StatBox label="NEXT DAY" value={data.stockReaction.nextDay || "—"} />
            <StatBox label="1 WEEK LATER" value={data.stockReaction.oneWeekLater || "—"} />
          </div>
        </Card>
      )}
      {data.keyQuotes?.length > 0 && (
        <Card title="KEY QUOTES FROM CALL">
          <div className="space-y-2">
            {data.keyQuotes.map((q, i) => (
              <blockquote key={i} className="text-xs text-white/50 italic border-l-2 border-white/10 pl-3">"{q}"</blockquote>
            ))}
          </div>
        </Card>
      )}
      {data.analystReactions?.length > 0 && (
        <Card title="ANALYST REACTIONS">
          <div className="space-y-2">
            {data.analystReactions.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div><span className="text-white/60">{a.firm}</span><span className="text-white/25 ml-2">{a.action}</span></div>
                <p className="text-white/40 max-w-[50%] text-right">{a.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   22. EARNINGS CALENDAR
   ═══════════════════════════════════════════════════════════════════ */
export function EarningsCalendarTab({ watchlistSymbols }: { watchlistSymbols?: string[] }) {
  const [data, setData] = useState<EarningsCalendarAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchEarningsCalendar(watchlistSymbols); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Load Earnings Calendar" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Building calendar..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  const renderTable = (entries: typeof data.upcoming, title: string) => entries?.length > 0 ? (
    <Card title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-white/[0.06]">
            <th className="text-left py-2 text-[9px] text-white/20 font-mono">SYMBOL</th>
            <th className="text-left py-2 text-[9px] text-white/20 font-mono">DATE</th>
            <th className="text-right py-2 text-[9px] text-white/20 font-mono">EPS EST</th>
            <th className="text-right py-2 text-[9px] text-white/20 font-mono">REV EST</th>
            <th className="text-right py-2 text-[9px] text-white/20 font-mono">BEAT STREAK</th>
            <th className="text-right py-2 text-[9px] text-white/20 font-mono">AVG MOVE</th>
          </tr></thead>
          <tbody className="divide-y divide-white/[0.04]">
            {entries.map((e, i) => (
              <tr key={i}>
                <td className="py-2"><span className="text-white/60 font-mono font-semibold">{e.symbol}</span><span className="text-white/25 ml-1 text-[10px]">{e.name}</span></td>
                <td className="py-2 text-white/40 font-mono">{e.date} {e.time}</td>
                <td className="py-2 text-right text-white/50 font-mono">{e.epsEstimate}</td>
                <td className="py-2 text-right text-white/50 font-mono">{e.revenueEstimate}</td>
                <td className="py-2 text-right"><span className={`font-mono ${e.beatStreak > 0 ? "text-emerald-400" : "text-red-400"}`}>{e.beatStreak}</span></td>
                <td className="py-2 text-right text-white/40 font-mono">{e.avgMove}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  ) : null;
  return (
    <div className="space-y-4">
      {renderTable(data.thisWeek, "THIS WEEK")}
      {renderTable(data.nextWeek, "NEXT WEEK")}
      {renderTable(data.upcoming, "UPCOMING")}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   23. ESTIMATE REVISIONS
   ═══════════════════════════════════════════════════════════════════ */
export function EstimateRevisionsTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<EstimateRevisionsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchEstimateRevisions(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track Estimate Revisions" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Tracking revisions..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="REVISION TREND" value={data.revisionTrend || "—"} />
        <StatBox label="EARNINGS MOMENTUM" value={data.earningsMomentum || "—"} />
      </div>
      {data.currentEstimates && (
        <Card title="CURRENT ESTIMATES">
          <div className="space-y-1.5">{Object.entries(data.currentEstimates).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs"><span className="text-white/30">{k}</span><span className="text-white/60 font-mono">{v}</span></div>
          ))}</div>
        </Card>
      )}
      {data.analystChanges && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="UPGRADES" value={String(data.analystChanges.upgrades)} />
          <StatBox label="DOWNGRADES" value={String(data.analystChanges.downgrades)} />
          <StatBox label="INITIATIONS" value={String(data.analystChanges.initiations)} />
          <StatBox label="LAST 30 DAYS" value={data.analystChanges.last30Days || "—"} />
        </div>
      )}
      {data.revisions?.length > 0 && (
        <Card title="REVISION HISTORY">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 text-[9px] text-white/20 font-mono">PERIOD</th>
                <th className="text-left py-2 text-[9px] text-white/20 font-mono">METRIC</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">30D AGO</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">CURRENT</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">CHANGE</th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.revisions.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 text-white/50 font-mono">{r.period}</td>
                    <td className="py-2 text-white/40">{r.metric}</td>
                    <td className="py-2 text-right text-white/30 font-mono">{r.thirtyDaysAgo}</td>
                    <td className="py-2 text-right text-white/60 font-mono">{r.current}</td>
                    <td className="py-2 text-right">
                      <span className={`font-mono ${r.direction === "up" ? "text-emerald-400" : r.direction === "down" ? "text-red-400" : "text-white/40"}`}>{r.change}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   24. CASH FLOW WATERFALL
   ═══════════════════════════════════════════════════════════════════ */
export function CashFlowTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<CashFlowAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchCashFlow(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Cash Flow" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Building waterfall..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="FCF MARGIN" value={data.fcfMargin || "—"} />
        <StatBox label="FCF YIELD" value={data.fcfYield || "—"} />
        <StatBox label="FCF/SHARE" value={data.fcfPerShare || "—"} />
        <StatBox label="CASH CONVERSION" value={data.cashConversion || "—"} />
      </div>
      {data.waterfall?.length > 0 && (
        <Card title={`CASH FLOW WATERFALL — ${data.period || "LTM"}`}>
          <div className="space-y-2">
            {data.waterfall.map((w, i) => {
              const maxVal = Math.max(...data.waterfall.map(x => Math.abs(x.value)));
              const pct = maxVal > 0 ? (Math.abs(w.value) / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-white/40 text-right truncate">{w.item}</span>
                  <div className="flex-1 h-4 bg-white/[0.03] rounded overflow-hidden relative">
                    <div className={`h-full rounded ${w.value >= 0 ? "bg-emerald-400/30" : "bg-red-400/30"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-20 text-xs font-mono text-right ${w.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>{w.amount}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {data.uses?.length > 0 && (
        <Card title="CASH USES">
          <div className="space-y-2">
            {data.uses.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-xs text-white/40">{u.category}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${u.percentage}%` }} />
                </div>
                <span className="text-xs font-mono text-white/50 w-16 text-right">{u.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   25. MARGIN ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */
export function MarginsTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<MarginAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchMargins(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Margins" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Analyzing margin profile..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      {data.currentMargins && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="GROSS" value={`${data.currentMargins.gross?.toFixed(1)}%`} />
          <StatBox label="OPERATING" value={`${data.currentMargins.operating?.toFixed(1)}%`} />
          <StatBox label="NET" value={`${data.currentMargins.net?.toFixed(1)}%`} />
          <StatBox label="FCF" value={`${data.currentMargins.fcf?.toFixed(1)}%`} />
        </div>
      )}
      <StatBox label="MARGIN TREND" value={data.marginTrend || "—"} />
      {data.history?.length > 0 && (
        <Card title="MARGIN HISTORY">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 text-[9px] text-white/20 font-mono">QUARTER</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">GROSS</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">OPERATING</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">NET</th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.history.map((h, i) => (
                  <tr key={i}>
                    <td className="py-2 text-white/50 font-mono">{h.quarter}</td>
                    <td className="py-2 text-right text-white/50 font-mono">{h.gross?.toFixed(1)}%</td>
                    <td className="py-2 text-right text-white/50 font-mono">{h.operating?.toFixed(1)}%</td>
                    <td className="py-2 text-right text-white/50 font-mono">{h.net?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {data.peerComparison?.length > 0 && (
        <Card title="PEER COMPARISON">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 text-[9px] text-white/20 font-mono">COMPANY</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">GROSS</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">OPERATING</th>
                <th className="text-right py-2 text-[9px] text-white/20 font-mono">NET</th>
              </tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.peerComparison.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 text-white/60">{p.company}</td>
                    <td className="py-2 text-right text-white/50 font-mono">{p.gross?.toFixed(1)}%</td>
                    <td className="py-2 text-right text-white/50 font-mono">{p.operating?.toFixed(1)}%</td>
                    <td className="py-2 text-right text-white/50 font-mono">{p.net?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.drivers?.length > 0 && (
          <Card title="MARGIN DRIVERS">
            <ul className="space-y-1.5">{data.drivers.map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-emerald-300/70"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{d}</li>
            ))}</ul>
          </Card>
        )}
        {data.risks?.length > 0 && (
          <Card title="MARGIN RISKS">
            <ul className="space-y-1.5">{data.risks.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-red-300/70"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{r}</li>
            ))}</ul>
          </Card>
        )}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   28. SCENARIO ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */
export function ScenarioTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<ScenarioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchScenario(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Run Scenario Analysis" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Modeling scenarios..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  const renderCase = (c: typeof data.baseCase, label: string, color: string, borderColor: string) => (
    <div className={`${color} border ${borderColor} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono tracking-widest">{label}</div>
        <span className="text-xs font-mono">{c.probability}% probability</span>
      </div>
      <div className="text-2xl font-bold font-mono mb-3">${c.priceTarget}</div>
      {c.upside && <div className="text-xs font-mono text-emerald-400 mb-1">Upside: {c.upside}</div>}
      {c.downside && <div className="text-xs font-mono text-red-400 mb-1">Downside: {c.downside}</div>}
      <div className="space-y-1.5 mt-3 text-xs">
        <div><span className="text-white/30">Assumptions: </span><span className="text-white/50">{c.assumptions}</span></div>
        <div><span className="text-white/30">Revenue Impact: </span><span className="text-white/50">{c.revenueImpact}</span></div>
        <div><span className="text-white/30">Margin Impact: </span><span className="text-white/50">{c.marginImpact}</span></div>
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="EXPECTED VALUE" value={data.expectedValue || "—"} />
        <StatBox label="RISK/REWARD" value={data.riskReward || "—"} />
        <StatBox label="KEY VARIABLE" value={data.keyVariable || "—"} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderCase(data.bearCase, "BEAR CASE", "bg-red-500/5", "border-red-500/20")}
        {renderCase(data.baseCase, "BASE CASE", "bg-blue-500/5", "border-blue-500/20")}
        {renderCase(data.bullCase, "BULL CASE", "bg-emerald-500/5", "border-emerald-500/20")}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   29. QUALITY SCORE
   ═══════════════════════════════════════════════════════════════════ */
export function QualityTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<QualityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchQuality(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Calculate Quality Score" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scoring quality..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-white">{data.qualityScore}<span className="text-sm text-white/20">/100</span></div>
          <div className="text-[9px] text-white/20 font-mono mt-1">QUALITY SCORE</div>
        </div>
        <div className="text-center">
          <div className={`text-4xl font-bold font-mono ${data.grade?.startsWith("A") ? "text-emerald-400" : data.grade?.startsWith("B") ? "text-blue-400" : data.grade?.startsWith("C") ? "text-amber-400" : "text-red-400"}`}>{data.grade}</div>
          <div className="text-[9px] text-white/20 font-mono mt-1">GRADE</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-sm font-mono text-white/50">{data.percentileRank}</div>
          <div className="text-[9px] text-white/20 font-mono mt-1">PERCENTILE</div>
        </div>
      </div>
      {data.components?.length > 0 && (
        <Card title="QUALITY COMPONENTS">
          <div className="space-y-4">
            {data.components.map((c, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/70">{c.factor}</span>
                  <span className="text-xs font-mono text-white/50">{c.score}/100</span>
                </div>
                <ScoreBar label="" value={c.score} max={100} color={c.score >= 70 ? "#34d399" : c.score >= 40 ? "#fbbf24" : "#f87171"} />
                {c.metrics && (
                  <div className="mt-2 space-y-1">{Object.entries(c.metrics).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]"><span className="text-white/25">{k}</span><span className="text-white/50 font-mono">{v}</span></div>
                  ))}</div>
                )}
                <p className="text-xs text-white/40 mt-1">{c.assessment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.comparableScores?.length > 0 && (
        <Card title="COMPARABLE SCORES">
          <div className="space-y-2">
            {data.comparableScores.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-mono">{c.symbol}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.score >= 70 ? "bg-emerald-400" : c.score >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${c.score}%` }} />
                  </div>
                  <span className="font-mono text-white/50 w-8 text-right">{c.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   30. WATCHLIST ALERTS
   ═══════════════════════════════════════════════════════════════════ */
export function AlertsTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<AlertsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchAlerts(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Generate Smart Alerts" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Analyzing alert conditions..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      {data.activeFlags?.length > 0 && (
        <Card title="ACTIVE FLAGS">
          <div className="space-y-2">
            {data.activeFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-semibold text-amber-300">{f.flag}</span>
                  <p className="text-xs text-amber-300/60 mt-0.5">{f.significance}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.suggestedAlerts?.length > 0 && (
        <Card title="SUGGESTED ALERTS">
          <div className="space-y-3">
            {data.suggestedAlerts.map((a, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag label={a.type} color="blue" />
                    <Tag label={a.priority} color={a.priority === "high" ? "red" : a.priority === "medium" ? "yellow" : "green"} />
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-1">{a.condition}</p>
                <div className="flex gap-3 text-[10px] text-white/30 font-mono">
                  <span>Current: {a.currentValue}</span>
                  <span>Threshold: {a.threshold}</span>
                </div>
                <p className="text-xs text-white/40 mt-1">{a.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   27. RESEARCH NOTES
   ═══════════════════════════════════════════════════════════════════ */
export function ResearchNotesTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; date: string; priority: string }>>(() => {
    try { return JSON.parse(localStorage.getItem(`notes_${symbol}`) || "[]"); } catch { return []; }
  });
  const [suggestions, setSuggestions] = useState<NoteSuggestAnalysis | null>(null);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const saveNotes = (n: typeof notes) => { setNotes(n); localStorage.setItem(`notes_${symbol}`, JSON.stringify(n)); };
  const addNote = () => {
    if (!newTitle.trim()) return;
    const note = { id: Date.now().toString(), title: newTitle, content: newContent, date: new Date().toISOString().split("T")[0], priority: "medium" };
    saveNotes([note, ...notes]);
    setNewTitle(""); setNewContent("");
  };
  const deleteNote = (id: string) => saveNotes(notes.filter(n => n.id !== id));
  const loadSuggestions = async () => {
    setLoadingSugg(true);
    const d = await fetchNoteSuggestions(symbol, name, price, notes.map(n => n.title).join(", "));
    setSuggestions(d);
    setLoadingSugg(false);
  };
  const addSuggested = (s: { title: string; content: string; priority: string }) => {
    const note = { id: Date.now().toString(), title: s.title, content: s.content, date: new Date().toISOString().split("T")[0], priority: s.priority };
    saveNotes([note, ...notes]);
  };

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <Card title="ADD RESEARCH NOTE">
        <div className="space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Note title..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20" />
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Your research notes..." rows={3} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 resize-none" />
          <button onClick={addNote} className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-xs font-mono text-white/60 transition-colors">SAVE NOTE</button>
        </div>
      </Card>
      {/* AI Suggestions */}
      <GenerateButton label={loadingSugg ? "Getting AI suggestions..." : "Get AI Note Suggestions"} onClick={loadSuggestions} loading={loadingSugg} />
      {suggestions?.suggestedNotes?.length > 0 && (
        <Card title="AI SUGGESTED NOTES">
          <div className="space-y-2">
            {suggestions.suggestedNotes.map((s, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70">{s.title}</span>
                  <div className="flex items-center gap-2">
                    <Tag label={s.priority} color={s.priority === "high" ? "red" : s.priority === "medium" ? "yellow" : "green"} />
                    <button onClick={() => addSuggested(s)} className="text-[10px] font-mono text-blue-400 hover:text-blue-300">+ ADD</button>
                  </div>
                </div>
                <p className="text-xs text-white/40">{s.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {suggestions?.watchItems?.length > 0 && (
        <Card title="WATCH ITEMS">
          <ul className="space-y-1.5">{suggestions.watchItems.map((w, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-white/50"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{w}</li>
          ))}</ul>
        </Card>
      )}
      {/* Saved Notes */}
      {notes.length > 0 && (
        <Card title={`YOUR NOTES (${notes.length})`}>
          <div className="space-y-3">
            {notes.map(n => (
              <div key={n.id} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70">{n.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/20 font-mono">{n.date}</span>
                    <button onClick={() => deleteNote(n.id)} className="text-[10px] text-red-400 hover:text-red-300 font-mono">DEL</button>
                  </div>
                </div>
                <p className="text-xs text-white/40 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   26. DEEP COMPARE
   ═══════════════════════════════════════════════════════════════════ */
import { fetchDeepCompare, type DeepCompareAnalysis } from "../data/api";

export function DeepCompareTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<DeepCompareAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareInput, setCompareInput] = useState("");
  const load = async () => {
    const symbols = [symbol, ...compareInput.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)];
    if (symbols.length < 2) return;
    setLoading(true);
    const d = await fetchDeepCompare(symbols);
    setData(d);
    setLoading(false);
  };
  if (!data && !loading) return (
    <div className="space-y-3">
      <Card title="DEEP COMPARE">
        <div className="space-y-3">
          <p className="text-xs text-white/40">Compare {symbol} against other companies. Enter comma-separated tickers:</p>
          <input
            value={compareInput}
            onChange={e => setCompareInput(e.target.value)}
            placeholder="e.g. MSFT, GOOG, AMZN"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20"
          />
          <button onClick={load} className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] rounded-lg text-xs font-mono text-white/60 transition-colors">COMPARE</button>
        </div>
      </Card>
    </div>
  );
  if (loading) return <GenerateButton label="Running deep comparison..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      {data.winner && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="text-[10px] text-emerald-400/60 font-mono tracking-widest mb-1">WINNER</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{data.winner}</div>
          <p className="text-sm text-emerald-300/60 mt-1">{data.winnerReason}</p>
        </div>
      )}
      {data.companies?.length > 0 && (
        <Card title="COMPANY SCORES">
          <div className="space-y-3">
            {data.companies.sort((a, b) => b.score - a.score).map((c, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/20 font-mono w-5">#{i + 1}</span>
                    <span className="text-xs font-semibold text-white/70">{c.symbol}</span>
                    <span className="text-[10px] text-white/30">{c.name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{c.score}/100</span>
                </div>
                <ScoreBar label="" value={c.score} max={100} color={c.score >= 70 ? "#34d399" : c.score >= 40 ? "#fbbf24" : "#f87171"} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.categories?.length > 0 && (
        <Card title="CATEGORY WINNERS">
          <div className="space-y-2">
            {data.categories.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                <span className="text-xs text-white/50">{c.category}</span>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-emerald-400">{c.winner}</span>
                  <p className="text-[10px] text-white/30 max-w-[200px]">{c.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="text-[10px] text-white/20 font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-white/60 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}
