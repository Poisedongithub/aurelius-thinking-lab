import { useState } from "react";
import {
  ScoreBar, Tag, ConfidenceDots, StatBox, EmptyState, TrendBadge,
} from "./MarketComponents";
import {
  fetchThesis, fetchValuation, fetchMoat, fetchManagement, fetchBullBear,
  fetchRevenue, fetchCompetitive, fetchFinancialHealth, fetchCapitalAllocation, fetchGuidance,
  type ThesisAnalysis, type ValuationAnalysis, type MoatAnalysis, type ManagementAnalysis,
  type BullBearAnalysis, type RevenueAnalysis, type CompetitiveAnalysis, type FinancialHealthAnalysis,
  type CapitalAllocationAnalysis, type GuidanceAnalysis,
} from "../data/api";

/* ─── Shared loading / generate button ─── */
function GenerateButton({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  if (loading) return (
    <div className="content-card p-14 text-center">
      <div className="w-10 h-10 border-2 border-[var(--t-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <p className="text-sm font-mono text-[var(--t-text-muted)] animate-pulse tracking-wide">{label}</p>
    </div>
  );
  return (
    <button onClick={onClick} className="gen-btn w-full group bg-[var(--t-gen-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden hover:bg-[var(--t-gen-hover)] hover:border-[var(--t-border-hover)] transition-all duration-300">
      <div className="relative z-10 flex items-center justify-between px-5 py-5">
        <h3 className="text-[15px] font-medium text-[var(--t-text-muted)] group-hover:text-[var(--t-text)] transition-colors tracking-wide">{label}</h3>
        <span className="text-[13px] font-mono font-semibold text-[var(--t-gen-text)] bg-[var(--t-btn-bg)] px-3.5 py-1.5 rounded-lg group-hover:bg-[var(--t-group-active)] transition-all tracking-wider">GENERATE</span>
      </div>
    </button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="content-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--t-border)] bg-[var(--t-bg-card)]">
        <div className="text-[12px] text-[var(--t-text-muted)] font-mono tracking-[0.15em] uppercase">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function GradeDisplay({ grade, label }: { grade: string; label: string }) {
  const color = grade === "A" || grade === "A+" || grade === "A-" ? "text-emerald-400" :
    grade === "B" || grade === "B+" || grade === "B-" ? "text-blue-400" :
    grade === "C" || grade === "C+" || grade === "C-" ? "text-amber-400" : "text-red-400";
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold font-mono ${color}`}>{grade}</div>
      <div className="text-[13px] text-[var(--t-text-muted)] font-mono tracking-widest mt-1">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   1. THESIS BUILDER
   ═══════════════════════════════════════════════════════════════════ */
export function ThesisTab({ symbol, name, price, change }: { symbol: string; name: string; price: number; change: number }) {
  const [data, setData] = useState<ThesisAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchThesis(symbol, name, price, change); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Generate Investment Thesis" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Building thesis..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No thesis data available" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="CONVICTION" value={data.conviction} />
        <StatBox label="TIME HORIZON" value={data.timeHorizon} />
        <StatBox label="PRICE TARGET" value={`$${data.priceTarget}`} />
      </div>
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">THESIS SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="text-[14px] text-emerald-400 font-mono tracking-widest mb-2">BULL CASE</div>
          <p className="text-sm text-emerald-300/70 leading-relaxed">{data.bullCase}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="text-[14px] text-red-400 font-mono tracking-widest mb-2">BEAR CASE</div>
          <p className="text-sm text-red-300/70 leading-relaxed">{data.bearCase}</p>
        </div>
      </div>
      {data.catalysts?.length > 0 && (
        <Card title="CATALYSTS">
          <div className="flex flex-wrap gap-1.5">{data.catalysts.map((c, i) => <Tag key={i} label={c} color="green" />)}</div>
        </Card>
      )}
      {data.risks?.length > 0 && (
        <Card title="KEY RISKS">
          <div className="flex flex-wrap gap-1.5">{data.risks.map((r, i) => <Tag key={i} label={r} color="red" />)}</div>
        </Card>
      )}
      {data.keyMetrics?.length > 0 && (
        <Card title="KEY METRICS TO WATCH">
          <ul className="space-y-1.5">{data.keyMetrics.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[var(--t-text-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />{m}</li>
          ))}</ul>
        </Card>
      )}
      {data.whatChangesThesis && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="text-[14px] text-amber-400 font-mono tracking-widest mb-2">WHAT CHANGES THE THESIS</div>
          <p className="text-sm text-amber-300/70 leading-relaxed">{data.whatChangesThesis}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2. VALUATION MODELS
   ═══════════════════════════════════════════════════════════════════ */
export function ValuationTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<ValuationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchValuation(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Run Valuation Models" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Running DCF & comparables..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No valuation data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest">OVERALL VERDICT</div>
          <Tag label={data.verdict} color={data.verdict?.toLowerCase().includes("under") ? "green" : data.verdict?.toLowerCase().includes("over") ? "red" : "blue"} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
      {data.dcf && (
        <Card title="DCF MODEL">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatBox label="FAIR VALUE" value={`$${data.dcf.fairValue?.toFixed(2)}`} />
            <StatBox label="UPSIDE" value={data.dcf.upside || "—"} />
          </div>
          {data.dcf.assumptions && (
            <div className="space-y-1.5 mb-4">
              <div className="text-[13px] text-[var(--t-text-dim)] font-mono">ASSUMPTIONS</div>
              {Object.entries(data.dcf.assumptions).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs"><span className="text-[var(--t-text-muted)]">{k}</span><span className="text-[var(--t-text-secondary)] font-mono">{v}</span></div>
              ))}
            </div>
          )}
          {data.dcf.sensitivity?.length > 0 && (
            <div>
              <div className="text-[13px] text-[var(--t-text-dim)] font-mono mb-2">SENSITIVITY (WACC)</div>
              <div className="flex gap-2">{data.dcf.sensitivity.map((s, i) => (
                <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg px-3 py-2 text-center flex-1">
                  <div className="text-[13px] text-[var(--t-text-muted)] font-mono">{s.wacc}</div>
                  <div className="text-sm font-mono font-semibold text-[var(--t-text)]">${s.value?.toFixed(2)}</div>
                </div>
              ))}</div>
            </div>
          )}
        </Card>
      )}
      {data.comparables && (
        <Card title="COMPARABLE MULTIPLES">
          <div className="space-y-3">
            {Object.entries(data.comparables).map(([metric, vals]) => (
              <div key={metric} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[var(--t-text-secondary)]">{metric}</span>
                  <Tag label={vals.verdict} color={vals.verdict?.toLowerCase().includes("cheap") ? "green" : vals.verdict?.toLowerCase().includes("rich") ? "red" : "blue"} />
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-[var(--t-text-secondary)]">Current: <span className="text-[var(--t-text)] font-mono">{vals.current?.toFixed(1)}x</span></span>
                  <span className="text-[var(--t-text-secondary)]">Sector: <span className="text-[var(--t-text)] font-mono">{vals.sectorAvg?.toFixed(1)}x</span></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.historicalValuation && (
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="5YR AVG P/E" value={data.historicalValuation.fiveYrAvgPE?.toFixed(1) + "x"} />
          <StatBox label="VS AVERAGE" value={data.historicalValuation.currentVsAvg || "—"} />
          <StatBox label="PERCENTILE" value={data.historicalValuation.percentileRank || "—"} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3. MOAT ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */
export function MoatTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<MoatAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchMoat(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Competitive Moat" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Analyzing moat sources..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No moat data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">MOAT RATING</div>
            <div className="text-3xl font-bold font-mono text-[var(--t-text)]">{data.moatRating}</div>
          </div>
          <div className="text-right">
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">MOAT SCORE</div>
            <div className="text-3xl font-bold font-mono text-[var(--t-text)]">{data.moatScore}<span className="text-sm text-[var(--t-text-muted)]">/100</span></div>
          </div>
        </div>
        <div className="w-full h-2 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${data.moatScore >= 70 ? "bg-emerald-400" : data.moatScore >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${data.moatScore}%` }} />
        </div>
        <div className="flex gap-2 mt-3">
          <Tag label={`Trend: ${data.moatTrend}`} color={data.moatTrend === "widening" ? "green" : data.moatTrend === "stable" ? "blue" : "red"} />
          <Tag label={`Durability: ${data.durability}`} color={data.durability === "high" ? "green" : data.durability === "medium" ? "yellow" : "red"} />
        </div>
      </div>
      {data.sources?.length > 0 && (
        <Card title="MOAT SOURCES">
          <div className="space-y-3">
            {data.sources.map((s, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{s.type}</span>
                  <div className="flex items-center gap-2">
                    <Tag label={s.strength} color={s.strength === "strong" ? "green" : s.strength === "moderate" ? "yellow" : "red"} />
                    <span className="text-xs font-mono text-[var(--t-text-secondary)]">{s.score}/100</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--t-text-secondary)] leading-relaxed">{s.evidence}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.threats?.length > 0 && (
        <Card title="THREATS TO MOAT">
          <ul className="space-y-1.5">{data.threats.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-red-300/70"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{t}</li>
          ))}</ul>
        </Card>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   4. MANAGEMENT SCORECARD
   ═══════════════════════════════════════════════════════════════════ */
export function ManagementTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<ManagementAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchManagement(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Score Management Team" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Evaluating management..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No management data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6 flex items-center gap-6">
        <GradeDisplay grade={data.overallGrade} label="OVERALL GRADE" />
        {data.ceo && (
          <div className="flex-1">
            <div className="text-xs font-semibold text-[var(--t-text)]">{data.ceo.name}</div>
            <div className="text-[14px] text-[var(--t-text-muted)]">CEO · {data.ceo.tenure} · Rating: {data.ceo.rating}</div>
            <p className="text-xs text-[var(--t-text-secondary)] mt-1">{data.ceo.background}</p>
          </div>
        )}
      </div>
      {data.capitalAllocation && (
        <Card title="CAPITAL ALLOCATION">
          <div className="space-y-1.5">{Object.entries(data.capitalAllocation).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs"><span className="text-[var(--t-text-muted)]">{k}</span><span className="text-[var(--t-text-secondary)] font-mono">{v}</span></div>
          ))}</div>
        </Card>
      )}
      {data.execution && (
        <Card title="EXECUTION TRACK RECORD">
          <div className="space-y-1.5">{Object.entries(data.execution).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs"><span className="text-[var(--t-text-muted)]">{k}</span><span className="text-[var(--t-text-secondary)] font-mono">{v}</span></div>
          ))}</div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.greenFlags?.length > 0 && (
          <Card title="GREEN FLAGS">
            <ul className="space-y-1.5">{data.greenFlags.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-emerald-300/70"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{f}</li>
            ))}</ul>
          </Card>
        )}
        {data.redFlags?.length > 0 && (
          <Card title="RED FLAGS">
            <ul className="space-y-1.5">{data.redFlags.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-red-300/70"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{f}</li>
            ))}</ul>
          </Card>
        )}
      </div>
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   5. BULL VS BEAR DEBATE
   ═══════════════════════════════════════════════════════════════════ */
export function BullBearTab({ symbol, name, price, change }: { symbol: string; name: string; price: number; change: number }) {
  const [data, setData] = useState<BullBearAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchBullBear(symbol, name, price, change); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Generate Bull vs Bear Debate" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Building arguments..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bull */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] text-emerald-400 font-mono tracking-widest">BULL CASE</div>
            <span className="text-xs font-mono text-emerald-400">${data.bullCase.priceTarget} PT</span>
          </div>
          <h3 className="text-sm font-semibold text-emerald-300 mb-3">{data.bullCase.headline}</h3>
          <div className="space-y-3">
            {data.bullCase.arguments?.map((a, i) => (
              <div key={i} className="bg-emerald-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-emerald-300">{a.point}</span>
                  <ConfidenceDots value={a.strength * 10} />
                </div>
                <p className="text-xs text-emerald-300/60">{a.evidence}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-[14px] font-mono text-emerald-400/60">
            <span>{data.bullCase.timeframe}</span>
            <span>·</span>
            <span>Confidence: {data.bullCase.confidence}%</span>
          </div>
        </div>
        {/* Bear */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] text-red-400 font-mono tracking-widest">BEAR CASE</div>
            <span className="text-xs font-mono text-red-400">${data.bearCase.priceTarget} PT</span>
          </div>
          <h3 className="text-sm font-semibold text-red-300 mb-3">{data.bearCase.headline}</h3>
          <div className="space-y-3">
            {data.bearCase.arguments?.map((a, i) => (
              <div key={i} className="bg-red-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-red-300">{a.point}</span>
                  <ConfidenceDots value={a.strength * 10} />
                </div>
                <p className="text-xs text-red-300/60">{a.evidence}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-[14px] font-mono text-red-400/60">
            <span>{data.bearCase.timeframe}</span>
            <span>·</span>
            <span>Confidence: {data.bearCase.confidence}%</span>
          </div>
        </div>
      </div>
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">VERDICT</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.verdict}</p>
      </div>
      {data.keyQuestion && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="text-[14px] text-amber-400 font-mono tracking-widest mb-2">KEY QUESTION</div>
          <p className="text-sm text-amber-300/70">{data.keyQuestion}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   6. REVENUE BREAKDOWN
   ═══════════════════════════════════════════════════════════════════ */
export function RevenueTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<RevenueAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchRevenue(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Revenue Breakdown" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Breaking down revenue..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No revenue data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="TOTAL REVENUE" value={data.totalRevenue || "—"} />
        <StatBox label="REVENUE GROWTH" value={data.revenueGrowth || "—"} />
      </div>
      {data.segments?.length > 0 && (
        <Card title="BUSINESS SEGMENTS">
          <div className="space-y-3">
            {data.segments.map((s, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--t-text-secondary)]">{s.revenue}</span>
                    <Tag label={s.growth} color={s.growth?.startsWith("+") ? "green" : s.growth?.startsWith("-") ? "red" : "blue"} />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${s.percentage}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[13px] font-mono text-[var(--t-text-muted)]">
                  <span>{s.percentage}% of revenue</span>
                  <TrendBadge trend={s.trend} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.geographicBreakdown?.length > 0 && (
        <Card title="GEOGRAPHIC BREAKDOWN">
          <div className="space-y-2">
            {data.geographicBreakdown.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 text-xs text-[var(--t-text-secondary)]">{g.region}</span>
                <div className="flex-1 h-1.5 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${g.percentage}%` }} />
                </div>
                <span className="text-xs font-mono text-[var(--t-text-secondary)] w-10 text-right">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.concentrationRisk && (
        <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
          <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">CONCENTRATION RISK</div>
          <p className="text-sm text-[var(--t-text-secondary)]">{data.concentrationRisk}</p>
        </div>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   7. COMPETITIVE LANDSCAPE
   ═══════════════════════════════════════════════════════════════════ */
export function CompetitiveTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<CompetitiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchCompetitive(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Map Competitive Landscape" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Mapping competitors..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No competitive data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="MARKET POSITION" value={data.marketPosition || "—"} />
        <StatBox label="MARKET SHARE" value={data.marketShare || "—"} />
        <StatBox label="TAM" value={data.totalAddressableMarket || "—"} />
      </div>
      {data.competitors?.length > 0 && (
        <Card title="KEY COMPETITORS">
          <div className="space-y-3">
            {data.competitors.map((c, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--t-text)]">{c.name}</span>
                    <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{c.ticker}</span>
                  </div>
                  <Tag label={`Threat: ${c.threat}`} color={c.threat === "high" ? "red" : c.threat === "medium" ? "yellow" : "green"} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[var(--t-text-muted)]">Share: </span><span className="text-[var(--t-text-secondary)]">{c.marketShare}</span></div>
                  <div><span className="text-[var(--t-text-muted)]">Advantage: </span><span className="text-[var(--t-text-secondary)]">{c.advantage}</span></div>
                </div>
                {c.weakness && <p className="text-xs text-[var(--t-text-muted)] mt-1">Weakness: {c.weakness}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.competitiveAdvantages?.length > 0 && (
        <Card title="COMPETITIVE ADVANTAGES">
          <div className="flex flex-wrap gap-1.5">{data.competitiveAdvantages.map((a, i) => <Tag key={i} label={a} color="green" />)}</div>
        </Card>
      )}
      {data.industryTrends?.length > 0 && (
        <Card title="INDUSTRY TRENDS">
          <ul className="space-y-1.5">{data.industryTrends.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[var(--t-text-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{t}</li>
          ))}</ul>
        </Card>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   8. FINANCIAL HEALTH SCORE
   ═══════════════════════════════════════════════════════════════════ */
export function FinancialHealthTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [data, setData] = useState<FinancialHealthAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchFinancialHealth(symbol, name, price); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Financial Health" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scoring financial health..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6 flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-[var(--t-text)]">{data.overallScore}<span className="text-sm text-[var(--t-text-muted)]">/100</span></div>
          <div className="text-[13px] text-[var(--t-text-muted)] font-mono mt-1">HEALTH SCORE</div>
        </div>
        <GradeDisplay grade={data.grade} label="GRADE" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.altmanZScore && (
          <Card title="ALTMAN Z-SCORE">
            <div className="text-2xl font-bold font-mono text-[var(--t-text)] mb-1">{data.altmanZScore.score?.toFixed(2)}</div>
            <p className="text-xs text-[var(--t-text-secondary)]">{data.altmanZScore.interpretation}</p>
          </Card>
        )}
        {data.piotroskiFScore && (
          <Card title="PIOTROSKI F-SCORE">
            <div className="text-2xl font-bold font-mono text-[var(--t-text)] mb-1">{data.piotroskiFScore.score}/9</div>
            <p className="text-xs text-[var(--t-text-secondary)]">{data.piotroskiFScore.interpretation}</p>
          </Card>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="CASH" value={data.cashPosition || "—"} />
        <StatBox label="TOTAL DEBT" value={data.totalDebt || "—"} />
        <StatBox label="NET CASH" value={data.netCash || "—"} />
      </div>
      {data.metrics && (
        <Card title="KEY METRICS">
          <div className="space-y-2">
            {Object.entries(data.metrics).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs">
                <span className="text-[var(--t-text-muted)]">{k}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--t-text-secondary)] font-mono">{String(v.value)}</span>
                  <Tag label={v.status} color={v.status === "strong" || v.status === "good" ? "green" : v.status === "weak" || v.status === "poor" ? "red" : "yellow"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   9. CAPITAL ALLOCATION TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function CapitalAllocationTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<CapitalAllocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchCapitalAllocation(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track Capital Allocation" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Analyzing capital deployment..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="GRADE" value={data.grade} />
        <StatBox label="TOTAL DEPLOYED" value={data.totalCapitalDeployed || "—"} />
        <StatBox label="ROIC" value={data.roic || "—"} />
        <StatBox label="ROIC vs WACC" value={data.roicVsWacc || "—"} />
      </div>
      {data.allocation?.length > 0 && (
        <Card title="ALLOCATION BREAKDOWN">
          <div className="space-y-3">
            {data.allocation.map((a, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{a.category}</span>
                  <span className="text-xs font-mono text-[var(--t-text-secondary)]">{a.amount}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${a.percentage}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[13px] font-mono text-[var(--t-text-muted)]">
                  <span>{a.percentage}%</span>
                  <span>{a.effectiveness}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.valueCreation && (
        <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
          <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">VALUE CREATION</div>
          <p className="text-sm text-[var(--t-text-secondary)]">{data.valueCreation}</p>
        </div>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   10. GUIDANCE TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function GuidanceTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<GuidanceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchGuidance(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track Management Guidance" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Analyzing guidance history..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="BEAT RATE" value={data.beatRate || "—"} />
        <StatBox label="AVG SURPRISE" value={data.avgSurprise || "—"} />
        <StatBox label="CREDIBILITY" value={data.managementCredibility || "—"} />
        <StatBox label="NEXT EARNINGS" value={data.nextEarningsDate || "—"} />
      </div>
      {data.currentGuidance && (
        <Card title="CURRENT GUIDANCE">
          <div className="space-y-1.5">{Object.entries(data.currentGuidance).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs"><span className="text-[var(--t-text-muted)]">{k}</span><span className="text-[var(--t-text-secondary)] font-mono">{v}</span></div>
          ))}</div>
        </Card>
      )}
      {data.guidanceHistory?.length > 0 && (
        <Card title="GUIDANCE HISTORY">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--t-border)]">
                <th className="text-left py-2 text-[13px] text-[var(--t-text-muted)] font-mono">QUARTER</th>
                <th className="text-left py-2 text-[13px] text-[var(--t-text-muted)] font-mono">METRIC</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">GUIDED</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">ACTUAL</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">RESULT</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--t-border)]">
                {data.guidanceHistory.map((g, i) => (
                  <tr key={i}>
                    <td className="py-2 text-[var(--t-text-secondary)] font-mono">{g.quarter}</td>
                    <td className="py-2 text-[var(--t-text-secondary)]">{g.metricType}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{g.guided}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{g.actual}</td>
                    <td className="py-2 text-right">
                      <Tag label={g.result} color={g.result === "beat" ? "green" : g.result === "miss" ? "red" : "yellow"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">SUMMARY</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
}
