import { useState } from "react";
import { StatBox, Tag, EmptyState } from "./MarketComponents";
import {
  fetchPatternScanner, fetchSupportResistance, fetchMomentum, fetchFibonacci, fetchVolumeProfile,
  fetchFedImpact, fetchInflation, fetchCurrency, fetchYieldCurve, fetchGeopolitical,
  type PatternScannerAnalysis, type SupportResistanceAnalysis, type MomentumAnalysis,
  type FibonacciAnalysis, type VolumeProfileAnalysis,
  type FedImpactAnalysis, type InflationAnalysis, type CurrencyAnalysis,
  type YieldCurveAnalysis, type GeopoliticalAnalysis,
} from "../data/api";

function GenBtn({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  if (loading) return (
    <div className="content-card p-14 text-center">
      <div className="w-10 h-10 border-2 border-[var(--t-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <p className="text-sm font-mono text-[var(--t-text-muted)] animate-pulse tracking-wide">{label}</p>
    </div>
  );
  return (
    <button onClick={onClick} className="w-full group bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden hover:bg-[var(--t-btn-bg)] hover:border-[var(--t-border-hover)] transition-all">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm text-[var(--t-text-muted)] group-hover:text-[var(--t-text-secondary)] transition-colors">{label}</h3>
        <span className="text-[14px] font-mono text-[var(--t-text-dim)] bg-[var(--t-btn-bg)] px-2.5 py-1 rounded-md group-hover:text-[var(--t-text-muted)] group-hover:bg-[var(--t-btn-bg)] transition-all">GENERATE</span>
      </div>
    </button>
  );
}
function Crd({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--t-border)]"><div className="text-[14px] text-[var(--t-text-muted)] font-mono tracking-[0.15em] uppercase">{title}</div></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ═══ 1. Pattern Scanner ═══
export function PatternScannerTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<PatternScannerAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchPatternScanner(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Scan for chart patterns..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="TREND" value={d.dominantTrend} />
        <StatBox label="STRENGTH" value={d.trendStrength} />
        <StatBox label="VOLUME" value={d.volumeConfirmation} />
      </div>
      <Crd title="DETECTED PATTERNS">
        {d.patterns?.length ? d.patterns.map((p, i) => (
          <div key={i} className="mb-4 last:mb-0 border-b border-[var(--t-border)] pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold text-[var(--t-text)]">{p.name}</span>
              <Tag label={p.type} color={p.type === "Bullish" ? "green" : p.type === "Bearish" ? "red" : "gray"} />
              <Tag label={p.reliability} />
              <Tag label={p.status} color="blue" />
            </div>
            <p className="text-sm text-[var(--t-text-secondary)]">{p.description}</p>
            <p className="text-sm text-[var(--t-text-muted)] font-mono mt-1">Target: ${p.priceTarget}</p>
          </div>
        )) : <EmptyState message="No patterns detected" />}
      </Crd>
      <Crd title="KEY LEVELS">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[13px] text-red-400/60 font-mono mb-2">RESISTANCE</div>
            {d.keyLevels?.resistance?.map((r, i) => <div key={i} className="text-base font-mono text-red-400 mb-1">${r.toFixed(2)}</div>)}
          </div>
          <div>
            <div className="text-[13px] text-emerald-400/60 font-mono mb-2">SUPPORT</div>
            {d.keyLevels?.support?.map((s, i) => <div key={i} className="text-base font-mono text-emerald-400 mb-1">${s.toFixed(2)}</div>)}
          </div>
        </div>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 2. Support/Resistance ═══
export function SupportResistanceTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<SupportResistanceAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchSupportResistance(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Map support & resistance levels..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="NEAREST RESISTANCE" value={`$${d.nearestResistance}`} />
        <StatBox label="NEAREST SUPPORT" value={`$${d.nearestSupport}`} />
        <StatBox label="BREAKOUT PROB." value={d.breakoutProbability} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Crd title="RESISTANCE LEVELS">
          {d.resistanceLevels?.map((r, i) => (
            <div key={i} className="flex justify-between items-center mb-3 last:mb-0">
              <div>
                <span className="text-base font-mono text-red-400 font-semibold">${r.price}</span>
                <span className="text-sm text-[var(--t-text-muted)] ml-2">{r.type}</span>
              </div>
              <Tag label={r.strength} color={r.strength === "Strong" ? "red" : "gray"} />
            </div>
          ))}
        </Crd>
        <Crd title="SUPPORT LEVELS">
          {d.supportLevels?.map((s, i) => (
            <div key={i} className="flex justify-between items-center mb-3 last:mb-0">
              <div>
                <span className="text-base font-mono text-emerald-400 font-semibold">${s.price}</span>
                <span className="text-sm text-[var(--t-text-muted)] ml-2">{s.type}</span>
              </div>
              <Tag label={s.strength} color={s.strength === "Strong" ? "green" : "gray"} />
            </div>
          ))}
        </Crd>
      </div>
      <Crd title="TRADING RANGE">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--t-text-muted)]">Low: <span className="text-emerald-400 font-mono">${d.tradingRange?.low}</span></span>
          <span className="text-sm text-[var(--t-text-muted)]">High: <span className="text-red-400 font-mono">${d.tradingRange?.high}</span></span>
          <Tag label={d.tradingRange?.bias} color={d.tradingRange?.bias === "Bullish" ? "green" : d.tradingRange?.bias === "Bearish" ? "red" : "gray"} />
        </div>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 3. Momentum Dashboard ═══
export function MomentumTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<MomentumAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchMomentum(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze momentum indicators..." onClick={go} loading={l} />;
  const ind = d.indicators;
  const ma = d.movingAverages;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="MOMENTUM" value={d.overallMomentum} />
        <StatBox label="SCORE" value={`${d.momentumScore}/100`} />
        <StatBox label="VS SMA200" value={ma?.priceVsSma200} />
      </div>
      <Crd title="INDICATORS">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div><span className="text-[13px] text-[var(--t-text-muted)] font-mono">RSI</span><div className="text-lg font-mono text-[var(--t-text)]">{ind?.rsi?.value} <Tag label={ind?.rsi?.signal} /></div></div>
            <div><span className="text-[13px] text-[var(--t-text-muted)] font-mono">STOCHASTIC</span><div className="text-lg font-mono text-[var(--t-text)]">K:{ind?.stochastic?.k} D:{ind?.stochastic?.d} <Tag label={ind?.stochastic?.signal} /></div></div>
            <div><span className="text-[13px] text-[var(--t-text-muted)] font-mono">ADX</span><div className="text-lg font-mono text-[var(--t-text)]">{ind?.adx?.value} <Tag label={ind?.adx?.trend} /></div></div>
          </div>
          <div className="space-y-3">
            <div><span className="text-[13px] text-[var(--t-text-muted)] font-mono">MACD</span><div className="text-lg font-mono text-[var(--t-text)]">{ind?.macd?.value} <Tag label={ind?.macd?.crossover} color={ind?.macd?.crossover === "Bullish" ? "green" : "red"} /></div></div>
            <div><span className="text-[13px] text-[var(--t-text-muted)] font-mono">BOLLINGER</span><div className="text-sm font-mono text-[var(--t-text-secondary)]">Upper: {ind?.bollingerBands?.upper} | Mid: {ind?.bollingerBands?.middle} | Low: {ind?.bollingerBands?.lower}</div><Tag label={ind?.bollingerBands?.squeeze ? "SQUEEZE" : "NO SQUEEZE"} color={ind?.bollingerBands?.squeeze ? "yellow" : "gray"} /></div>
          </div>
        </div>
      </Crd>
      <Crd title="MOVING AVERAGES">
        <div className="grid grid-cols-5 gap-2">
          <StatBox label="SMA 20" value={`$${ma?.sma20}`} />
          <StatBox label="SMA 50" value={`$${ma?.sma50}`} />
          <StatBox label="SMA 200" value={`$${ma?.sma200}`} />
          <StatBox label="EMA 12" value={`$${ma?.ema12}`} />
          <StatBox label="EMA 26" value={`$${ma?.ema26}`} />
        </div>
        <div className="flex gap-2 mt-3">
          {ma?.goldenCross && <Tag label="GOLDEN CROSS" color="green" />}
          {ma?.deathCross && <Tag label="DEATH CROSS" color="red" />}
        </div>
      </Crd>
      {d.divergences?.length > 0 && (
        <Crd title="DIVERGENCES">
          {d.divergences.map((dv, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <Tag label={`${dv.indicator} - ${dv.type}`} color={dv.type === "Bullish" ? "green" : "red"} />
              <p className="text-sm text-[var(--t-text-secondary)] mt-1">{dv.description}</p>
            </div>
          ))}
        </Crd>
      )}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 4. Fibonacci ═══
export function FibonacciTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<FibonacciAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchFibonacci(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Calculate Fibonacci levels..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="IMPLICATION" value={d.tradingImplication} />
        <StatBox label="FIB SUPPORT" value={`$${d.nearestFibSupport}`} />
        <StatBox label="FIB RESISTANCE" value={`$${d.nearestFibResistance}`} />
      </div>
      <Crd title="RETRACEMENT LEVELS">
        <div className="text-sm text-[var(--t-text-muted)] mb-3 font-mono">Swing: ${d.retracement?.swingLow} → ${d.retracement?.swingHigh}</div>
        {d.retracement?.levels?.map((lv, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm font-mono text-[var(--t-text-secondary)]">{lv.level}</span>
            <span className="text-base font-mono text-[var(--t-text)] font-semibold">${lv.price}</span>
            <Tag label={lv.status} color={lv.status === "Above" ? "green" : lv.status === "Below" ? "red" : "yellow"} />
          </div>
        ))}
        <p className="text-sm text-[var(--t-text-muted)] mt-2">{d.retracement?.currentPosition}</p>
      </Crd>
      <Crd title="EXTENSION LEVELS">
        {d.extension?.levels?.map((lv, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm font-mono text-[var(--t-text-secondary)]">{lv.level}</span>
            <span className="text-base font-mono text-emerald-400">${lv.price}</span>
          </div>
        ))}
      </Crd>
      <Crd title="KEY LEVEL">
        <div className="text-lg font-mono text-amber-400">${d.keyLevel?.price} ({d.keyLevel?.level})</div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-1">{d.keyLevel?.significance}</p>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 5. Volume Profile ═══
export function VolumeProfileTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<VolumeProfileAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchVolumeProfile(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze volume profile..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="POC" value={`$${d.pointOfControl?.price}`} />
        <StatBox label="REL. VOLUME" value={`${d.relativeVolume}x`} />
        <StatBox label="FLOW" value={d.smartMoneyFlow} />
        <StatBox label="TREND" value={d.volumeTrend} />
      </div>
      <Crd title="VALUE AREA">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--t-text-muted)]">VAH: <span className="text-red-400 font-mono">${d.valueArea?.high}</span></span>
          <span className="text-sm text-[var(--t-text-muted)]">VAL: <span className="text-emerald-400 font-mono">${d.valueArea?.low}</span></span>
          <span className="text-sm text-[var(--t-text-muted)]">Coverage: {d.valueArea?.percentage}</span>
        </div>
      </Crd>
      <Crd title="VOLUME NODES">
        {d.volumeNodes?.map((n, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-base font-mono text-[var(--t-text)]">${n.price}</span>
            <Tag label={n.type} color={n.type.includes("High") ? "blue" : "gray"} />
            <span className="text-sm text-[var(--t-text-secondary)]">{n.significance}</span>
          </div>
        ))}
      </Crd>
      <div className="flex gap-2">
        <Tag label={d.accumulation} color={d.accumulation === "Accumulation" ? "green" : d.accumulation === "Distribution" ? "red" : "gray"} />
        {d.unusualVolume && <Tag label="UNUSUAL VOLUME" color="yellow" />}
      </div>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 6. Fed Impact ═══
export function FedImpactTab({ symbol, name, price, sector }: { symbol: string; name: string; price: number; sector?: string }) {
  const [d, setD] = useState<FedImpactAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchFedImpact(symbol, name, price, sector); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze Fed policy impact..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="RATE SENSITIVITY" value={d.rateImpact?.sensitivity} />
        <StatBox label="DIRECTION" value={d.rateImpact?.direction} />
        <StatBox label="CORRELATION" value={d.historicalCorrelation} />
      </div>
      <Crd title="CURRENT POLICY">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="FED FUNDS" value={d.currentPolicy?.fedFundsRate} />
          <StatBox label="STANCE" value={d.currentPolicy?.stance} />
          <StatBox label="NEXT MEETING" value={d.currentPolicy?.nextMeeting} />
          <StatBox label="EXPECTATION" value={d.currentPolicy?.marketExpectation} />
        </div>
      </Crd>
      <Crd title="SCENARIO ANALYSIS">
        {d.scenarioAnalysis?.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm text-[var(--t-text-secondary)]">{s.scenario}</span>
            <Tag label={s.stockImpact} color={s.stockImpact?.startsWith("+") ? "green" : s.stockImpact?.startsWith("-") ? "red" : "gray"} />
            <span className="text-sm text-[var(--t-text-muted)]">{s.rationale}</span>
          </div>
        ))}
      </Crd>
      <Crd title="QT IMPACT">
        <Tag label={d.qtImpact?.effect} /><p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.qtImpact?.description}</p>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.rateImpact?.mechanism}</p>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 7. Inflation ═══
export function InflationTab({ symbol, name, price, sector }: { symbol: string; name: string; price: number; sector?: string }) {
  const [d, setD] = useState<InflationAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchInflation(symbol, name, price, sector); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze inflation sensitivity..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="SENSITIVITY" value={d.inflationSensitivity} />
        <StatBox label="PRICING POWER" value={d.pricingPower} />
        <StatBox label="CPI CORR." value={d.cpiCorrelation} />
      </div>
      <Crd title="COST PRESSURE">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="INPUT COSTS" value={d.costPressure?.inputCosts} />
          <StatBox label="LABOR" value={d.costPressure?.laborCosts} />
          <StatBox label="RAW MATERIALS" value={d.costPressure?.rawMaterials} />
          <StatBox label="OVERALL" value={d.costPressure?.overallImpact} />
        </div>
      </Crd>
      <Crd title="PASS-THROUGH">
        <StatBox label="ABILITY" value={d.passThrough?.ability} />
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">Lag: {d.passThrough?.lagTime}</p>
        <p className="text-sm text-[var(--t-text-secondary)]">{d.passThrough?.evidence}</p>
      </Crd>
      <div className="flex gap-2">
        <Tag label={d.inflationBeneficiary ? "INFLATION BENEFICIARY" : "NOT A BENEFICIARY"} color={d.inflationBeneficiary ? "green" : "red"} />
        <Tag label={`Real Growth: ${d.realRevenueGrowth}`} />
      </div>
      {d.hedges?.length > 0 && <Crd title="HEDGES">{d.hedges.map((h, i) => <p key={i} className="text-sm text-[var(--t-text-secondary)] mb-1">{h}</p>)}</Crd>}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 8. Currency Exposure ═══
export function CurrencyTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<CurrencyAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchCurrency(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze currency exposure..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="INT'L REVENUE" value={d.internationalRevenue} />
        <StatBox label="FX RISK" value={d.fxRiskLevel} />
      </div>
      <Crd title="CURRENCY BREAKDOWN">
        {d.currencyBreakdown?.map((c, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-base font-mono text-[var(--t-text)]">{c.currency}</span>
            <span className="text-sm text-[var(--t-text-secondary)]">{c.revenueShare}</span>
            <Tag label={c.trend} color={c.trend === "Stable" ? "gray" : c.trend === "Strengthening" ? "green" : "red"} />
          </div>
        ))}
      </Crd>
      <Crd title="DOLLAR IMPACT">
        <div className="space-y-2">
          <p className="text-sm text-[var(--t-text-secondary)]"><span className="text-red-400 font-mono">Strong $:</span> {d.dollarImpact?.strongDollar}</p>
          <p className="text-sm text-[var(--t-text-secondary)]"><span className="text-emerald-400 font-mono">Weak $:</span> {d.dollarImpact?.weakDollar}</p>
          <p className="text-sm text-[var(--t-text-muted)] font-mono">{d.dollarImpact?.sensitivity}</p>
        </div>
      </Crd>
      <Crd title="HEDGING">
        <Tag label={d.hedgingStrategy?.isHedged ? "HEDGED" : "UNHEDGED"} color={d.hedgingStrategy?.isHedged ? "green" : "red"} />
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.hedgingStrategy?.instruments}</p>
        <p className="text-sm text-[var(--t-text-muted)]">{d.hedgingStrategy?.effectiveness}</p>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 9. Yield Curve ═══
export function YieldCurveTab({ symbol, name, price, sector }: { symbol: string; name: string; price: number; sector?: string }) {
  const [d, setD] = useState<YieldCurveAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchYieldCurve(symbol, name, price, sector); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze yield curve signal..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="CURVE SHAPE" value={d.yieldCurveShape} />
        <StatBox label="IMPLICATION" value={d.tradingImplication} />
        <StatBox label="RECESSION PROB." value={d.recessionSignal?.probability} />
      </div>
      <Crd title="SPREADS">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="2Y-10Y" value={d.currentSpreads?.twoTen} />
          <StatBox label="3M-10Y" value={d.currentSpreads?.threeMonthTen} />
        </div>
        <Tag label={d.currentSpreads?.direction} />
      </Crd>
      <Crd title="SECTOR IMPACT">
        <Tag label={d.sectorImplication?.impact} color={d.sectorImplication?.impact === "Positive" ? "green" : "red"} />
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.sectorImplication?.mechanism}</p>
        <p className="text-sm text-[var(--t-text-muted)] mt-1">{d.sectorImplication?.historicalPattern}</p>
      </Crd>
      <Crd title="STOCK IMPACT">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="DEBT PROFILE" value={d.stockSpecificImpact?.debtProfile} />
          <StatBox label="REFI RISK" value={d.stockSpecificImpact?.refinancingRisk} />
          <StatBox label="INT. EXP." value={d.stockSpecificImpact?.interestExpenseSensitivity} />
        </div>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 10. Geopolitical Risk ═══
export function GeopoliticalTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<GeopoliticalAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchGeopolitical(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Assess geopolitical risks..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="OVERALL RISK" value={d.overallRisk} />
        <StatBox label="RISK SCORE" value={`${d.riskScore}/100`} />
        <StatBox label="SANCTIONS" value={d.sanctionsRisk} />
      </div>
      <Crd title="REGIONAL EXPOSURES">
        {d.exposures?.map((e, i) => (
          <div key={i} className="mb-3 last:mb-0 border-b border-[var(--t-border)] pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-[var(--t-text)]">{e.region}</span>
              <Tag label={e.type} /><Tag label={e.exposure} color={e.exposure === "High" ? "red" : "gray"} />
            </div>
            <p className="text-sm text-[var(--t-text-secondary)]">{e.description}</p>
          </div>
        ))}
      </Crd>
      <Crd title="TARIFF RISK">
        <Tag label={d.tariffRisk?.level} color={d.tariffRisk?.level === "High" ? "red" : "gray"} />
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.tariffRisk?.currentTariffs}</p>
        <p className="text-sm text-[var(--t-text-muted)]">{d.tariffRisk?.potentialImpact}</p>
      </Crd>
      <Crd title="SUPPLY CHAIN">
        <StatBox label="DIVERSIFICATION" value={d.supplyChainVulnerability?.diversificationLevel} />
        {d.supplyChainVulnerability?.singlePointsOfFailure?.map((s, i) => <Tag key={i} label={s} color="red" />)}
      </Crd>
      <Crd title="HOTSPOTS">
        {d.currentHotspots?.map((h, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm text-[var(--t-text-secondary)]">{h.issue}</span>
            <Tag label={h.impact} color={h.impact === "High" ? "red" : "gray"} />
            <span className="text-sm text-[var(--t-text-muted)]">P: {h.probability}</span>
          </div>
        ))}
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}
