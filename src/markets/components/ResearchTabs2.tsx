import { useState } from "react";
import { Tag, StatBox, EmptyState, TrendBadge } from "./MarketComponents";
import {
  fetchIndustry, fetchSectorRotation, fetchIPOTracker, fetchMAActivity, fetchRegulatory,
  fetchInstitutional, fetchETFExposure, fetchActivist, fetchInsiderPatterns, fetchShortInterest,
  type IndustryAnalysis, type SectorRotationAnalysis, type IPOAnalysis, type MAAnalysis,
  type RegulatoryAnalysis, type InstitutionalAnalysis, type ETFExposureAnalysis,
  type ActivistAnalysis, type InsiderPatternsAnalysis, type ShortInterestAnalysis,
} from "../data/api";

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

/* ═══════════════════════════════════════════════════════════════════
   11. INDUSTRY RESEARCH
   ═══════════════════════════════════════════════════════════════════ */
export function IndustryTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<IndustryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchIndustry(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Generate Industry Research" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Researching industry..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No industry data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">INDUSTRY</div>
        <div className="text-2xl font-bold font-mono text-[var(--t-text)] mb-3">{data.industryName}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="MARKET SIZE" value={data.marketSize || "—"} />
          <StatBox label="PROJECTED" value={data.projectedSize || "—"} />
          <StatBox label="CAGR" value={data.cagr || "—"} />
          <StatBox label="STAGE" value={data.stage || "—"} />
        </div>
      </div>
      {data.keyPlayers?.length > 0 && (
        <Card title="KEY PLAYERS">
          <div className="divide-y divide-[var(--t-border)]">
            {data.keyPlayers.map((p, i) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{p.name}</span>
                  <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{p.ticker}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag label={p.role} color="blue" />
                  <span className="text-xs font-mono text-[var(--t-text-secondary)]">{p.share}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.secularTrends?.length > 0 && (
        <Card title="SECULAR TRENDS">
          <div className="space-y-3">
            {data.secularTrends.map((t, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{t.trend}</span>
                  <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{t.timeline}</span>
                </div>
                <p className="text-xs text-[var(--t-text-secondary)]">{t.impact}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.risks?.length > 0 && (
        <Card title="INDUSTRY RISKS">
          <div className="space-y-2">
            {data.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <Tag label={r.severity} color={r.severity === "high" ? "red" : r.severity === "medium" ? "yellow" : "green"} />
                <div>
                  <span className="text-xs font-semibold text-[var(--t-text-secondary)]">{r.risk}</span>
                  <p className="text-xs text-[var(--t-text-muted)] mt-0.5">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-2">OUTLOOK</div>
        <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{data.outlook}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   12. SECTOR ROTATION TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function SectorRotationTab() {
  const [data, setData] = useState<SectorRotationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchSectorRotation(); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Sector Rotation" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Tracking sector flows..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">CURRENT REGIME</div>
        <div className="text-2xl font-bold font-mono text-[var(--t-text)]">{data.currentRegime}</div>
        {data.rotationSignal && <Tag label={data.rotationSignal} color={data.rotationSignal.includes("risk-on") ? "green" : data.rotationSignal.includes("risk-off") ? "red" : "yellow"} />}
      </div>
      {data.sectorRankings?.length > 0 && (
        <Card title="SECTOR RANKINGS">
          <div className="space-y-3">
            {data.sectorRankings.map((s, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--t-text-muted)] font-mono w-5">#{i + 1}</span>
                    <span className="text-xs font-semibold text-[var(--t-text)]">{s.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--t-text-secondary)]">{s.flow}</span>
                    <TrendBadge trend={s.trend} />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.strength >= 70 ? "bg-emerald-400" : s.strength >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${s.strength}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[13px] font-mono text-[var(--t-text-muted)]">
                  <span>Strength: {s.strength}/100</span>
                  <span>{s.etf}</span>
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
   13. IPO/SPAC TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function IPOTab() {
  const [data, setData] = useState<IPOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchIPOTracker(); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track IPO Activity" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scanning IPO pipeline..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="MARKET CONDITIONS" value={data.marketConditions || "—"} />
        <StatBox label="IPO WINDOW" value={data.ipoWindow || "—"} />
      </div>
      {data.upcoming?.length > 0 && (
        <Card title="UPCOMING IPOs">
          <div className="space-y-3">
            {data.upcoming.map((ipo, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--t-text)]">{ipo.company}</span>
                    {ipo.ticker && <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{ipo.ticker}</span>}
                  </div>
                  <Tag label={ipo.sector} color="blue" />
                </div>
                <div className="flex gap-3 text-[14px] text-[var(--t-text-muted)] font-mono">
                  {ipo.expectedDate && <span>Expected: {ipo.expectedDate}</span>}
                  {ipo.valuation && <span>Valuation: {ipo.valuation}</span>}
                </div>
                {ipo.description && <p className="text-xs text-[var(--t-text-secondary)] mt-1">{ipo.description}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.recent?.length > 0 && (
        <Card title="RECENT IPOs">
          <div className="space-y-3">
            {data.recent.map((ipo, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--t-text)]">{ipo.company}</span>
                    <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{ipo.ticker}</span>
                  </div>
                  <span className={`text-xs font-mono ${ipo.return?.startsWith("+") ? "text-emerald-400" : ipo.return?.startsWith("-") ? "text-red-400" : "text-[var(--t-text-secondary)]"}`}>{ipo.return}</span>
                </div>
                <div className="flex gap-3 text-[14px] text-[var(--t-text-muted)] font-mono">
                  <span>IPO: ${ipo.ipoPrice}</span>
                  <span>Current: ${ipo.currentPrice}</span>
                  <span>{ipo.ipoDate}</span>
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
   14. M&A ACTIVITY FEED
   ═══════════════════════════════════════════════════════════════════ */
export function MATab({ symbol, name }: { symbol?: string; name?: string }) {
  const [data, setData] = useState<MAAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchMAActivity(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track M&A Activity" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scanning deal flow..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="SECTOR ACTIVITY" value={data.sectorActivity || "—"} />
        <StatBox label="AVG PREMIUM" value={data.avgPremium || "—"} />
      </div>
      {data.recentDeals?.length > 0 && (
        <Card title="RECENT DEALS">
          <div className="space-y-3">
            {data.recentDeals.map((d, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{d.acquirer} → {d.target}</span>
                  <Tag label={d.status} color={d.status === "completed" ? "green" : d.status === "pending" ? "yellow" : "red"} />
                </div>
                <div className="flex gap-3 text-[14px] text-[var(--t-text-muted)] font-mono">
                  <span>Value: {d.value}</span>
                  <span>Premium: {d.premium}</span>
                  <span>{d.date}</span>
                </div>
                <p className="text-xs text-[var(--t-text-secondary)] mt-1">{d.rationale}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.potentialTargets?.length > 0 && (
        <Card title="POTENTIAL TARGETS">
          <div className="space-y-2">
            {data.potentialTargets.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{t.company}</span>
                  <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{t.ticker}</span>
                </div>
                <p className="text-xs text-[var(--t-text-secondary)] max-w-[50%] text-right">{t.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.trends?.length > 0 && (
        <Card title="M&A TRENDS">
          <ul className="space-y-1.5">{data.trends.map((t, i) => (
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
   15. REGULATORY MONITOR
   ═══════════════════════════════════════════════════════════════════ */
export function RegulatoryTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<RegulatoryAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchRegulatory(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Monitor Regulatory Risks" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scanning regulatory landscape..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="RISK LEVEL" value={data.riskLevel || "—"} />
        <StatBox label="COMPLIANCE COSTS" value={data.complianceCosts || "—"} />
      </div>
      {data.activeIssues?.length > 0 && (
        <Card title="ACTIVE ISSUES">
          <div className="space-y-3">
            {data.activeIssues.map((issue, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{issue.issue}</span>
                  <Tag label={issue.impact} color={issue.impact === "high" ? "red" : issue.impact === "medium" ? "yellow" : "green"} />
                </div>
                <div className="flex gap-3 text-[14px] text-[var(--t-text-muted)] font-mono">
                  <span>Agency: {issue.agency}</span>
                  <span>Status: {issue.status}</span>
                  <span>Timeline: {issue.timeline}</span>
                </div>
                <p className="text-xs text-[var(--t-text-secondary)] mt-1">{issue.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.upcomingRegulations?.length > 0 && (
        <Card title="UPCOMING REGULATIONS">
          <div className="space-y-2">
            {data.upcomingRegulations.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div>
                  <span className="text-xs font-semibold text-[var(--t-text)]">{r.regulation}</span>
                  <span className="text-[14px] text-[var(--t-text-muted)] ml-2">{r.effectiveDate}</span>
                </div>
                <Tag label={r.impact} color={r.impact === "high" ? "red" : "yellow"} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.politicalRisks?.length > 0 && (
        <Card title="POLITICAL RISKS">
          <ul className="space-y-1.5">{data.politicalRisks.map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-red-300/70"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{r}</li>
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
   16. INSTITUTIONAL OWNERSHIP
   ═══════════════════════════════════════════════════════════════════ */
export function InstitutionalTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<InstitutionalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchInstitutional(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Institutional Ownership" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Tracking institutional flows..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="INST. OWNERSHIP" value={data.institutionalOwnership || "—"} />
        <StatBox label="CONCENTRATION" value={data.concentration || "—"} />
        <StatBox label="SMART MONEY" value={data.smartMoneySignal || "—"} />
        <StatBox label="NET BUYING" value={data.recentChanges?.netBuying ? "Yes" : "No"} />
      </div>
      {data.recentChanges && (
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="BUYERS" value={String(data.recentChanges.buyersCount)} />
          <StatBox label="SELLERS" value={String(data.recentChanges.sellersCount)} />
          <StatBox label="NET SHARES" value={data.recentChanges.netShares || "—"} />
        </div>
      )}
      {data.topHolders?.length > 0 && (
        <Card title="TOP HOLDERS">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--t-border)]">
                <th className="text-left py-2 text-[13px] text-[var(--t-text-muted)] font-mono">HOLDER</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">SHARES</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">%</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">CHANGE</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--t-border)]">
                {data.topHolders.map((h, i) => (
                  <tr key={i}>
                    <td className="py-2 text-[var(--t-text-secondary)]">{h.name}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{h.shares}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{h.percentage}</td>
                    <td className="py-2 text-right">
                      <span className={`font-mono ${h.changeType === "increased" ? "text-emerald-400" : h.changeType === "decreased" ? "text-red-400" : "text-[var(--t-text-muted)]"}`}>{h.change}</span>
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

/* ═══════════════════════════════════════════════════════════════════
   17. ETF EXPOSURE MAP
   ═══════════════════════════════════════════════════════════════════ */
export function ETFExposureTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<ETFExposureAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchETFExposure(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Map ETF Exposure" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Mapping ETF holdings..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="ETFs HOLDING" value={String(data.totalETFsHolding)} />
        <StatBox label="ETF OWNERSHIP" value={data.totalETFOwnership || "—"} />
        <StatBox label="PASSIVE IMPACT" value={data.passiveFlowImpact || "—"} />
      </div>
      {data.topETFs?.length > 0 && (
        <Card title="TOP ETF HOLDERS">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--t-border)]">
                <th className="text-left py-2 text-[13px] text-[var(--t-text-muted)] font-mono">ETF</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">WEIGHT</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">SHARES</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">AUM</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--t-border)]">
                {data.topETFs.map((e, i) => (
                  <tr key={i}>
                    <td className="py-2"><div className="text-[var(--t-text-secondary)]">{e.name}</div><div className="text-[14px] text-[var(--t-text-muted)] font-mono">{e.ticker}</div></td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{e.weight}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{e.shares}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{e.aum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {data.rebalanceRisk && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="text-[14px] text-amber-400 font-mono tracking-widest mb-2">REBALANCE RISK</div>
          <p className="text-sm text-amber-300/70">{data.rebalanceRisk}</p>
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
   18. ACTIVIST INVESTOR TRACKER
   ═══════════════════════════════════════════════════════════════════ */
export function ActivistTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<ActivistAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchActivist(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Track Activist Investors" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Scanning activist activity..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="ACTIVIST RISK" value={data.activistRisk || "—"} />
        <StatBox label="ACTIVE CAMPAIGNS" value={String(data.activeActivists?.length || 0)} />
      </div>
      {data.activeActivists?.length > 0 && (
        <Card title="ACTIVE ACTIVISTS">
          <div className="space-y-3">
            {data.activeActivists.map((a, i) => (
              <div key={i} className="bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--t-text)]">{a.investor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-mono text-[var(--t-text-muted)]">{a.stake}</span>
                    <Tag label={a.position} color={a.position === "new" ? "green" : a.position === "increased" ? "blue" : "yellow"} />
                  </div>
                </div>
                {a.demands?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">{a.demands.map((d, j) => <Tag key={j} label={d} color="red" />)}</div>
                )}
                <div className="flex gap-3 text-[14px] text-[var(--t-text-muted)] font-mono">
                  <span>Filed: {a.filingDate}</span>
                  <span>Outcome: {a.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.historicalActivism?.length > 0 && (
        <Card title="HISTORICAL ACTIVISM">
          <div className="space-y-2">
            {data.historicalActivism.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div><span className="text-[var(--t-text-secondary)]">{h.investor}</span><span className="text-[var(--t-text-muted)] ml-2">({h.year})</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--t-text-secondary)]">{h.outcome}</span>
                  <span className={`font-mono ${h.stockImpact?.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{h.stockImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.vulnerabilities?.length > 0 && (
        <Card title="VULNERABILITIES">
          <ul className="space-y-1.5">{data.vulnerabilities.map((v, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-amber-300/70"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{v}</li>
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
   19. INSIDER PATTERN ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */
export function InsiderPatternsTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<InsiderPatternsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchInsiderPatterns(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Insider Patterns" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Detecting patterns..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl p-6">
        <div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-widest mb-1">OVERALL SIGNAL</div>
        <div className={`text-2xl font-bold font-mono ${data.overallSignal === "bullish" ? "text-emerald-400" : data.overallSignal === "bearish" ? "text-red-400" : "text-amber-400"}`}>{data.overallSignal?.toUpperCase()}</div>
      </div>
      {data.netActivity && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatBox label="LAST 3 MO" value={data.netActivity.last3Months || "—"} />
          <StatBox label="LAST 12 MO" value={data.netActivity.last12Months || "—"} />
          <StatBox label="BUYS" value={String(data.netActivity.buyCount)} />
          <StatBox label="SELLS" value={String(data.netActivity.sellCount)} />
          <StatBox label="NET VALUE" value={data.netActivity.netValue || "—"} />
        </div>
      )}
      {data.patterns?.length > 0 && (
        <Card title="DETECTED PATTERNS">
          <div className="space-y-2">
            {data.patterns.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${p.detected ? "bg-emerald-400" : "bg-white/10"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--t-text)]">{p.pattern}</span>
                    <Tag label={p.detected ? "DETECTED" : "NOT FOUND"} color={p.detected ? "green" : "gray"} />
                  </div>
                  <p className="text-xs text-[var(--t-text-secondary)] mt-0.5">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {data.notableTransactions?.length > 0 && (
        <Card title="NOTABLE TRANSACTIONS">
          <div className="space-y-2">
            {data.notableTransactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--t-stat-bg)] rounded-lg p-3 border border-[var(--t-border)]">
                <div>
                  <div className="text-xs font-semibold text-[var(--t-text)]">{t.insider}</div>
                  <div className="text-[14px] text-[var(--t-text-muted)]">{t.title} · {t.date}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono ${t.type === "Buy" || t.type === "buy" ? "text-emerald-400" : "text-red-400"}`}>{t.type} {t.amount}</span>
                  <div className="text-[14px] text-[var(--t-text-muted)]">{t.significance}</div>
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
   20. SHORT INTEREST TRENDS
   ═══════════════════════════════════════════════════════════════════ */
export function ShortInterestTab({ symbol, name }: { symbol: string; name: string }) {
  const [data, setData] = useState<ShortInterestAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const d = await fetchShortInterest(symbol, name); setData(d); setLoading(false); };
  if (!data && !loading) return <GenerateButton label="Analyze Short Interest" onClick={load} loading={false} />;
  if (loading) return <GenerateButton label="Tracking short activity..." onClick={() => {}} loading={true} />;
  if (!data) return <EmptyState message="No data" />;
  return (
    <div className="space-y-4">
      {data.currentShortInterest && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatBox label="SHARES SHORT" value={data.currentShortInterest.sharesShort || "—"} />
          <StatBox label="% OF FLOAT" value={data.currentShortInterest.percentOfFloat || "—"} />
          <StatBox label="DAYS TO COVER" value={String(data.currentShortInterest.daysToCover)} />
          <StatBox label="SHORT RATIO" value={String(data.currentShortInterest.shortRatio)} />
          <StatBox label="BORROW COST" value={data.currentShortInterest.costToBorrow || "—"} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="TREND" value={data.trend || "—"} />
        <StatBox label="SQUEEZE RISK" value={data.squeezeRisk || "—"} />
        <StatBox label="SIGNAL" value={data.signal || "—"} />
      </div>
      {data.trendData?.length > 0 && (
        <Card title="SHORT INTEREST HISTORY">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--t-border)]">
                <th className="text-left py-2 text-[13px] text-[var(--t-text-muted)] font-mono">DATE</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">SHARES SHORT</th>
                <th className="text-right py-2 text-[13px] text-[var(--t-text-muted)] font-mono">% FLOAT</th>
              </tr></thead>
              <tbody className="divide-y divide-[var(--t-border)]">
                {data.trendData.map((t, i) => (
                  <tr key={i}>
                    <td className="py-2 text-[var(--t-text-secondary)] font-mono">{t.date}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{t.sharesShort}</td>
                    <td className="py-2 text-right text-[var(--t-text-secondary)] font-mono">{t.percentFloat}</td>
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
