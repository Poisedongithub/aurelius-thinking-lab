import { useState } from "react";
import { StatBox, Tag, EmptyState } from "./MarketComponents";
import {
  fetchRegression, fetchSeasonality, fetchCorrelation, fetchVolatility, fetchMonteCarlo,
  fetchESG, fetchExecComp, fetchBoardAnalysis, fetchActivismHistory, fetchCorporateEvents,
  type RegressionAnalysis, type SeasonalityAnalysis, type CorrelationAnalysis,
  type VolatilityAnalysis, type MonteCarloAnalysis,
  type ESGAnalysis, type ExecCompAnalysis, type BoardAnalysisData,
  type ActivismHistoryAnalysis, type CorporateEventsAnalysis,
} from "../data/api";

function GenBtn({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  if (loading) return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 text-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm font-mono text-white/30 animate-pulse">{label}</p>
    </div>
  );
  return (
    <button onClick={onClick} className="w-full group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm text-white/30 group-hover:text-white/60 transition-colors">{label}</h3>
        <span className="text-[14px] font-mono text-white/15 bg-white/[0.04] px-2.5 py-1 rounded-md group-hover:text-white/30 group-hover:bg-white/[0.06] transition-all">GENERATE</span>
      </div>
    </button>
  );
}
function Crd({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06]"><div className="text-[14px] text-white/25 font-mono tracking-widest">{title}</div></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ═══ 21. Regression Analysis ═══
export function RegressionTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<RegressionAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchRegression(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Run regression analysis..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="R²" value={`${d.rSquared}`} />
        <StatBox label="ADJ. R²" value={`${d.adjustedRSquared}`} />
        <StatBox label="ALPHA" value={d.alpha?.annualized} sub={d.alpha?.significant ? "Significant" : "Not Significant"} />
      </div>
      <Crd title="FACTOR LOADINGS">
        {d.factors?.map((f, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/60 font-semibold">{f.factor}</span>
            <span className="text-base font-mono text-white">{f.beta.toFixed(3)}</span>
            <span className="text-sm text-white/30">p={f.pValue.toFixed(4)}</span>
            <Tag label={f.significance} color={f.significance === "High" ? "green" : f.significance === "Low" ? "red" : "gray"} />
          </div>
        ))}
      </Crd>
      <Crd title="INTERPRETATIONS">
        {d.factors?.map((f, i) => <p key={i} className="text-sm text-white/40 mb-2">• <span className="text-white/60">{f.factor}:</span> {f.interpretation}</p>)}
      </Crd>
      <p className="text-sm text-white/30">Residual Volatility: {d.residualVolatility}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 22. Seasonality Patterns ═══
export function SeasonalityTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<SeasonalityAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchSeasonality(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze seasonal patterns..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="BEST MONTH" value={d.bestMonth} />
        <StatBox label="WORST MONTH" value={d.worstMonth} />
        <StatBox label="CURRENT BIAS" value={d.currentSeasonalBias} />
      </div>
      <Crd title="MONTHLY RETURNS">
        <div className="grid grid-cols-4 gap-2">
          {d.monthlyReturns?.map((m, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 text-center">
              <div className="text-[13px] text-white/25 font-mono">{m.month}</div>
              <div className={`text-lg font-mono font-semibold ${m.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {m.avgReturn >= 0 ? "+" : ""}{m.avgReturn.toFixed(1)}%
              </div>
              <div className="text-[12px] text-white/20">Win: {m.winRate}%</div>
              <div className="text-[11px] text-white/15">Best: {m.best > 0 ? "+" : ""}{m.best}% | Worst: {m.worst}%</div>
            </div>
          ))}
        </div>
      </Crd>
      <Crd title="EARNINGS DRIFT">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="PRE-EARNINGS" value={d.earningsDrift?.preEarnings} />
          <StatBox label="POST-EARNINGS" value={d.earningsDrift?.postEarnings} />
        </div>
      </Crd>
      <p className="text-sm text-white/30">Day-of-Week Effect: {d.dayOfWeekEffect}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 23. Correlation Matrix ═══
export function CorrelationTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<CorrelationAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchCorrelation(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Build correlation matrix..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="HIGHEST CORR." value={`${d.highestCorrelation?.asset} (${d.highestCorrelation?.value})`} />
        <StatBox label="LOWEST CORR." value={`${d.lowestCorrelation?.asset} (${d.lowestCorrelation?.value})`} />
      </div>
      <Crd title="CORRELATIONS">
        {d.correlations?.map((c, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/60">{c.asset}</span>
            <Tag label={c.category} />
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.correlation >= 0 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${Math.abs(c.correlation) * 100}%` }} />
              </div>
              <span className={`text-sm font-mono ${c.correlation >= 0.5 ? "text-emerald-400" : c.correlation <= -0.5 ? "text-red-400" : "text-white/50"}`}>
                {c.correlation.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </Crd>
      <div className="flex gap-2">
        <Tag label={`Diversification: ${d.diversificationBenefit}`} />
      </div>
      <p className="text-sm text-white/30">Regime Changes: {d.regimeChanges}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 24. Volatility Surface ═══
export function VolatilityTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<VolatilityAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchVolatility(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze volatility surface..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="IV" value={`${d.impliedVolatility?.current}%`} />
        <StatBox label="IV RANK" value={`${d.ivRank}`} />
        <StatBox label="IV PERCENTILE" value={`${d.ivPercentile}`} />
        <StatBox label="TREND" value={d.impliedVolatility?.trend} />
      </div>
      <Crd title="IMPLIED VS HISTORICAL">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[13px] text-white/25 font-mono mb-2">IMPLIED</div>
            <StatBox label="CURRENT" value={`${d.impliedVolatility?.current}%`} />
            <p className="text-sm text-white/30 mt-1">Percentile: {d.impliedVolatility?.percentileRank}</p>
            <p className="text-sm text-white/30">vs Historical: {d.impliedVolatility?.vsHistorical}</p>
          </div>
          <div>
            <div className="text-[13px] text-white/25 font-mono mb-2">HISTORICAL</div>
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="HV20" value={`${d.historicalVolatility?.hv20}%`} />
              <StatBox label="HV60" value={`${d.historicalVolatility?.hv60}%`} />
              <StatBox label="HV252" value={`${d.historicalVolatility?.hv252}%`} />
            </div>
          </div>
        </div>
      </Crd>
      <Crd title="SKEW">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="PUT SKEW" value={d.volatilitySkew?.putSkew} />
          <StatBox label="CALL SKEW" value={d.volatilitySkew?.callSkew} />
        </div>
        <p className="text-sm text-white/40 mt-2">{d.volatilitySkew?.implication}</p>
      </Crd>
      <Crd title="TERM STRUCTURE">
        {d.termStructure?.map((t, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/50">{t.expiry}</span>
            <span className="text-base font-mono text-white">{t.iv}%</span>
          </div>
        ))}
        <Tag label={d.termStructureShape} />
      </Crd>
      <p className="text-sm text-white/30">Vol of Vol: {d.volOfVol}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.tradingImplication}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 25. Monte Carlo Simulation ═══
export function MonteCarloTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<MonteCarloAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchMonteCarlo(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Run Monte Carlo simulation..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="SIMULATIONS" value={`${d.simulations?.toLocaleString()}`} />
        <StatBox label="HORIZON" value={d.timeHorizon} />
        <StatBox label="P(PROFIT)" value={d.probabilityOfProfit} />
        <StatBox label="SHARPE" value={`${d.sharpeRatio}`} />
      </div>
      <Crd title="ASSUMPTIONS">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="ANN. RETURN" value={d.assumptions?.annualReturn} />
          <StatBox label="ANN. VOL" value={d.assumptions?.annualVolatility} />
          <StatBox label="DISTRIBUTION" value={d.assumptions?.distribution} />
        </div>
      </Crd>
      <Crd title="PRICE DISTRIBUTION">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="MEDIAN" value={`$${d.results?.medianPrice}`} />
          <StatBox label="MEAN" value={`$${d.results?.meanPrice}`} />
        </div>
        {d.results?.percentiles && (
          <div className="mt-3 space-y-2">
            {Object.entries(d.results.percentiles).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1">
                <span className="text-sm text-white/30">{k} percentile</span>
                <span className="text-sm font-mono text-white">${v}</span>
              </div>
            ))}
          </div>
        )}
      </Crd>
      <Crd title="PROBABILITY TARGETS">
        {d.probabilityAbove?.map((p, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/50">Above ${p.target}</span>
            <span className="text-base font-mono text-white">{p.probability}</span>
          </div>
        ))}
      </Crd>
      <Crd title="DRAWDOWN RISK">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="MEDIAN DD" value={d.maxDrawdown?.median} />
          <StatBox label="WORST 5%" value={d.maxDrawdown?.worst5pct} />
        </div>
      </Crd>
      <p className="text-sm text-white/30">Expected Return: {d.expectedReturn}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 26. ESG Deep Dive ═══
export function ESGTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<ESGAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchESG(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze ESG profile..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="ESG SCORE" value={`${d.overallScore}/100`} />
        <StatBox label="RATING" value={d.rating} />
        <StatBox label="VS INDUSTRY" value={d.peerComparison?.vsIndustry} />
        <StatBox label="TREND" value={d.esgTrend} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Crd title="ENVIRONMENTAL">
          <StatBox label="SCORE" value={`${d.environmental?.score}/100`} />
          <div className="mt-2 space-y-1">
            <p className="text-sm text-white/40">Carbon: {d.environmental?.carbonEmissions}</p>
            <p className="text-sm text-white/40">Renewable: {d.environmental?.renewableEnergy}</p>
            <p className="text-sm text-white/40">Target: {d.environmental?.climateTarget}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">{d.environmental?.keyIssues?.map((k, i) => <Tag key={i} label={k} />)}</div>
        </Crd>
        <Crd title="SOCIAL">
          <StatBox label="SCORE" value={`${d.social?.score}/100`} />
          <div className="mt-2 space-y-1">
            <p className="text-sm text-white/40">Diversity: {d.social?.diversityScore}</p>
            <p className="text-sm text-white/40">Employees: {d.social?.employeeSatisfaction}</p>
            <p className="text-sm text-white/40">Privacy: {d.social?.dataPrivacy}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">{d.social?.keyIssues?.map((k, i) => <Tag key={i} label={k} />)}</div>
        </Crd>
        <Crd title="GOVERNANCE">
          <StatBox label="SCORE" value={`${d.governance?.score}/100`} />
          <div className="mt-2 space-y-1">
            <p className="text-sm text-white/40">Independence: {d.governance?.boardIndependence}</p>
            <p className="text-sm text-white/40">Pay Alignment: {d.governance?.executivePayAlignment}</p>
            <p className="text-sm text-white/40">Rights: {d.governance?.shareholderRights}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">{d.governance?.keyIssues?.map((k, i) => <Tag key={i} label={k} />)}</div>
        </Crd>
      </div>
      {d.controversies?.length > 0 && (
        <Crd title="CONTROVERSIES">
          {d.controversies.map((c, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-white/60">{c.issue}</span>
              <Tag label={c.severity} color={c.severity === "High" ? "red" : c.severity === "Medium" ? "yellow" : "gray"} />
              <Tag label={c.status} />
            </div>
          ))}
        </Crd>
      )}
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 27. Executive Compensation ═══
export function ExecCompTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<ExecCompAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchExecComp(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze executive compensation..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <Crd title="CEO COMPENSATION">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg text-white font-semibold">{d.ceo?.name}</span>
          <span className="text-lg font-mono text-amber-400">{d.ceo?.totalComp}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="BASE" value={d.ceo?.baseSalary} />
          <StatBox label="BONUS" value={d.ceo?.bonus} />
          <StatBox label="STOCK" value={d.ceo?.stockAwards} />
          <StatBox label="OPTIONS" value={d.ceo?.options} />
        </div>
        <p className="text-sm text-white/40 mt-2">Pay for Performance: {d.ceo?.payForPerformance}</p>
      </Crd>
      <Crd title="C-SUITE">
        {d.cSuite?.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <div><span className="text-sm text-white/60">{e.name}</span><span className="text-[13px] text-white/25 ml-2">{e.title}</span></div>
            <span className="text-sm font-mono text-white">{e.totalComp}</span>
          </div>
        ))}
      </Crd>
      <Crd title="PEER COMPARISON">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="VS PEERS" value={d.peerComparison?.vsPeers} />
          <StatBox label="PERCENTILE" value={d.peerComparison?.percentile} />
          <StatBox label="MEDIAN PEER" value={d.peerComparison?.medianPeerComp} />
        </div>
      </Crd>
      <Crd title="ALIGNMENT">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="OWNERSHIP" value={d.alignment?.stockOwnership} />
          <StatBox label="GUIDELINE" value={d.alignment?.ownershipGuideline} />
        </div>
        <div className="flex gap-2 mt-2">
          <Tag label={d.alignment?.meetsGuideline ? "MEETS GUIDELINE" : "BELOW GUIDELINE"} color={d.alignment?.meetsGuideline ? "green" : "red"} />
        </div>
        <p className="text-sm text-white/30 mt-1">Vesting: {d.alignment?.vestingSchedule}</p>
      </Crd>
      {d.concerns?.length > 0 && <Crd title="CONCERNS">{d.concerns.map((c, i) => <p key={i} className="text-sm text-amber-400/60 mb-1">⚠ {c}</p>)}</Crd>}
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 28. Board Analysis ═══
export function BoardTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<BoardAnalysisData | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchBoardAnalysis(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze board composition..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="BOARD SIZE" value={`${d.boardSize}`} />
        <StatBox label="INDEPENDENCE" value={d.independence} />
        <StatBox label="SCORE" value={`${d.overallScore}/100`} />
      </div>
      <Crd title="DIVERSITY">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="GENDER" value={d.diversity?.gender} />
          <StatBox label="ETHNIC" value={d.diversity?.ethnic} />
          <StatBox label="AGE" value={d.diversity?.age} />
        </div>
      </Crd>
      <Crd title="EXPERTISE">
        {d.expertise?.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/60">{e.area}</span>
            <span className="text-sm font-mono text-white">{e.members} members</span>
          </div>
        ))}
      </Crd>
      <Crd title="TENURE">
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="AVERAGE" value={d.tenure?.average} />
          <StatBox label="LONGEST" value={d.tenure?.longest} />
          <StatBox label="NEWEST" value={d.tenure?.newest} />
          <StatBox label="REFRESH" value={d.tenure?.refreshmentRate} />
        </div>
      </Crd>
      <Crd title="COMMITTEES">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="AUDIT" value={d.committees?.audit} />
          <StatBox label="COMP." value={d.committees?.compensation} />
          <StatBox label="NOM." value={d.committees?.nominating} />
        </div>
      </Crd>
      {d.interlockingDirectorships?.length > 0 && (
        <Crd title="INTERLOCKING DIRECTORSHIPS">
          {d.interlockingDirectorships.map((id, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <span className="text-sm text-white/60">{id.director}:</span>
              <span className="text-sm text-white/30 ml-2">{id.otherBoards?.join(", ")}</span>
            </div>
          ))}
        </Crd>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Crd title="STRENGTHS">{d.strengths?.map((s, i) => <p key={i} className="text-sm text-emerald-400/60 mb-1">✓ {s}</p>)}</Crd>
        <Crd title="WEAKNESSES">{d.weaknesses?.map((w, i) => <p key={i} className="text-sm text-red-400/60 mb-1">✗ {w}</p>)}</Crd>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 29. Activism History ═══
export function ActivismHistoryTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<ActivismHistoryAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchActivismHistory(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Review activism history..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="VULNERABILITY" value={d.currentVulnerability?.level} />
        <StatBox label="VULN. SCORE" value={`${d.currentVulnerability?.score}/100`} />
        <StatBox label="PROXY FIGHTS" value={`${d.proxyFightHistory?.total || 0}`} />
      </div>
      <Crd title="ACTIVISM CAMPAIGNS">
        {d.activismHistory?.length ? d.activismHistory.map((c, i) => (
          <div key={i} className="mb-3 last:mb-0 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-white">{c.activist}</span>
              <span className="text-sm text-white/30 font-mono">{c.year}</span>
            </div>
            <p className="text-sm text-white/50">{c.campaign}</p>
            <div className="flex gap-2 mt-1">
              <Tag label={c.outcome} color={c.outcome === "Successful" ? "green" : c.outcome === "Failed" ? "red" : "gray"} />
              <Tag label={c.stockImpact} color={c.stockImpact?.startsWith("+") ? "green" : "red"} />
            </div>
          </div>
        )) : <EmptyState message="No activism history" />}
      </Crd>
      <Crd title="VULNERABILITY FACTORS">
        {d.currentVulnerability?.factors?.map((f, i) => <p key={i} className="text-sm text-amber-400/60 mb-1">• {f}</p>)}
      </Crd>
      <div className="grid grid-cols-2 gap-4">
        <Crd title="LIKELY DEMANDS">{d.potentialTargets?.likelyDemands?.map((d2, i) => <p key={i} className="text-sm text-white/40 mb-1">• {d2}</p>)}</Crd>
        <Crd title="DEFENSES">{d.potentialTargets?.defenses?.map((d2, i) => <p key={i} className="text-sm text-white/40 mb-1">• {d2}</p>)}</Crd>
      </div>
      {d.proxyFightHistory && (
        <Crd title="PROXY FIGHT RECORD">
          <div className="grid grid-cols-4 gap-2">
            <StatBox label="TOTAL" value={`${d.proxyFightHistory.total}`} />
            <StatBox label="WON" value={`${d.proxyFightHistory.won}`} />
            <StatBox label="LOST" value={`${d.proxyFightHistory.lost}`} />
            <StatBox label="SETTLED" value={`${d.proxyFightHistory.settled}`} />
          </div>
        </Crd>
      )}
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 30. Corporate Events Timeline ═══
export function CorporateEventsTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<CorporateEventsAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchCorporateEvents(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="View corporate events timeline..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <Crd title="UPCOMING EVENTS">
        {d.upcomingEvents?.length ? d.upcomingEvents.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
            <div>
              <span className="text-sm font-mono text-white/30">{e.date}</span>
              <Tag label={e.type} color="blue" />
            </div>
            <span className="text-sm text-white/60 flex-1 mx-4">{e.description}</span>
            <div className="text-right">
              <Tag label={e.significance} color={e.significance === "High" ? "red" : e.significance === "Medium" ? "yellow" : "gray"} />
              <p className="text-[13px] text-white/25 mt-1">{e.expectedImpact}</p>
            </div>
          </div>
        )) : <EmptyState message="No upcoming events" />}
      </Crd>
      <Crd title="RECENT EVENTS">
        {d.recentEvents?.map((e, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
            <div>
              <span className="text-sm font-mono text-white/30">{e.date}</span>
              <Tag label={e.type} />
            </div>
            <span className="text-sm text-white/60 flex-1 mx-4">{e.description}</span>
            <div className="text-right">
              <Tag label={e.outcome} />
              <Tag label={e.stockReaction} color={e.stockReaction?.startsWith("+") ? "green" : "red"} />
            </div>
          </div>
        ))}
      </Crd>
      <Crd title="CORPORATE ACTIONS">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[13px] text-white/25 font-mono mb-2">BUYBACKS</div>
            <Tag label={d.corporateActions?.buybacks?.active ? "ACTIVE" : "INACTIVE"} color={d.corporateActions?.buybacks?.active ? "green" : "gray"} />
            <p className="text-sm text-white/30 mt-1">Remaining: {d.corporateActions?.buybacks?.remaining}</p>
            <p className="text-sm text-white/30">Pace: {d.corporateActions?.buybacks?.pace}</p>
          </div>
          <div>
            <div className="text-[13px] text-white/25 font-mono mb-2">SPLITS</div>
            <p className="text-sm text-white/30">Last: {d.corporateActions?.splits?.lastSplit}</p>
            <Tag label={d.corporateActions?.splits?.splitCandidate ? "SPLIT CANDIDATE" : "NOT LIKELY"} color={d.corporateActions?.splits?.splitCandidate ? "yellow" : "gray"} />
          </div>
          <div>
            <div className="text-[13px] text-white/25 font-mono mb-2">SPINOFFS</div>
            <Tag label={d.corporateActions?.spinoffs?.planned ? "PLANNED" : "NONE PLANNED"} color={d.corporateActions?.spinoffs?.planned ? "yellow" : "gray"} />
          </div>
        </div>
      </Crd>
      <p className="text-sm text-white/30">Catalyst Calendar: {d.catalystCalendar}</p>
      <p className="text-sm text-white/40 leading-relaxed">{d.summary}</p>
    </div>
  );
}
