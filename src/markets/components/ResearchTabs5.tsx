import { useState } from "react";
import { StatBox, Tag, EmptyState } from "./MarketComponents";
import {
  fetchSocialBuzz, fetchNewsSentiment, fetchAnalystSentiment, fetchOptionsSentiment, fetchEarningsTone,
  fetchEntryExit, fetchPositionSizing, fetchHedge, fetchTaxOptimizer, fetchPairsTrade,
  type SocialBuzzAnalysis, type NewsSentimentAnalysis, type AnalystSentimentAnalysis,
  type OptionsSentimentAnalysis, type EarningsToneAnalysis,
  type EntryExitAnalysis, type PositionSizingAnalysis, type HedgeAnalysis,
  type TaxOptimizerAnalysis, type PairsTradeAnalysis,
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

// ═══ 11. Social Buzz ═══
export function SocialBuzzTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<SocialBuzzAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchSocialBuzz(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Track social media sentiment..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="SENTIMENT" value={d.overallSentiment} />
        <StatBox label="SCORE" value={`${d.sentimentScore}/100`} />
        <StatBox label="TREND" value={d.sentimentTrend} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Crd title="REDDIT">
          <Tag label={d.platforms?.reddit?.sentiment} color={d.platforms?.reddit?.sentiment === "Bullish" ? "green" : "red"} />
          <p className="text-sm text-[var(--t-text-secondary)] mt-2">Volume: {d.platforms?.reddit?.volume}</p>
          {d.platforms?.reddit?.trending && <Tag label="TRENDING" color="yellow" />}
          <div className="mt-2">{d.platforms?.reddit?.keyThemes?.map((t, i) => <Tag key={i} label={t} />)}</div>
        </Crd>
        <Crd title="X / TWITTER">
          <Tag label={d.platforms?.twitter?.sentiment} color={d.platforms?.twitter?.sentiment === "Bullish" ? "green" : "red"} />
          <p className="text-sm text-[var(--t-text-secondary)] mt-2">Volume: {d.platforms?.twitter?.volume}</p>
          {d.platforms?.twitter?.trending && <Tag label="TRENDING" color="yellow" />}
          <div className="mt-2">{d.platforms?.twitter?.keyThemes?.map((t, i) => <Tag key={i} label={t} />)}</div>
        </Crd>
        <Crd title="STOCKTWITS">
          <Tag label={d.platforms?.stocktwits?.sentiment} color={d.platforms?.stocktwits?.sentiment === "Bullish" ? "green" : "red"} />
          <p className="text-sm text-[var(--t-text-secondary)] mt-2">Volume: {d.platforms?.stocktwits?.volume}</p>
          <p className="text-sm text-[var(--t-text-muted)]">Bull/Bear: {d.platforms?.stocktwits?.bullBearRatio}</p>
        </Crd>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Tag label={`Retail vs Inst: ${d.retailVsInstitutional}`} />
        {d.contrarian && <Tag label="CONTRARIAN SIGNAL" color="yellow" />}
        <Tag label={`Meme Risk: ${d.memeStockRisk}`} color={d.memeStockRisk === "High" ? "red" : "gray"} />
      </div>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 12. News Sentiment ═══
export function NewsSentimentTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<NewsSentimentAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchNewsSentiment(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze news sentiment..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="SENTIMENT" value={d.sentiment} />
        <StatBox label="SCORE" value={`${d.overallScore}/100`} />
        <StatBox label="ATTENTION" value={d.mediaAttention} />
      </div>
      <Crd title="SENTIMENT TREND">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="1 WEEK" value={d.sentimentTrend?.oneWeek} />
          <StatBox label="1 MONTH" value={d.sentimentTrend?.oneMonth} />
          <StatBox label="3 MONTH" value={d.sentimentTrend?.threeMonth} />
        </div>
      </Crd>
      <Crd title="RECENT ARTICLES">
        {d.recentArticles?.map((a, i) => (
          <div key={i} className="mb-3 last:mb-0 border-b border-[var(--t-border)] pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-[var(--t-text)]">{a.headline}</span>
              <Tag label={a.sentiment} color={a.sentiment === "Bullish" ? "green" : a.sentiment === "Bearish" ? "red" : "gray"} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--t-text-muted)]">{a.source}</span>
              <span className="text-[13px] text-[var(--t-text-muted)] font-mono">Score: {a.score}</span>
            </div>
          </div>
        ))}
      </Crd>
      <Crd title="TOP THEMES">
        {d.topThemes?.map((t, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm text-[var(--t-text-secondary)]">{t.theme}</span>
            <span className="text-sm text-[var(--t-text-muted)]">{t.frequency}</span>
            <Tag label={t.sentiment} color={t.sentiment === "Positive" ? "green" : t.sentiment === "Negative" ? "red" : "gray"} />
          </div>
        ))}
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 13. Analyst Sentiment Shift ═══
export function AnalystSentimentTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<AnalystSentimentAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchAnalystSentiment(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Track analyst sentiment shifts..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="CONSENSUS" value={d.currentConsensus} />
        <StatBox label="SHIFT" value={d.consensusShift} />
        <StatBox label="PT DIRECTION" value={d.priceTargetTrend?.direction} />
      </div>
      <Crd title="RECENT CHANGES">
        {d.recentChanges?.length ? d.recentChanges.map((c, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <div>
              <span className="text-sm text-[var(--t-text-secondary)] font-semibold">{c.firm}</span>
              <span className="text-[13px] text-[var(--t-text-muted)] ml-2">{c.analyst}</span>
            </div>
            <Tag label={c.action} color={c.action === "Upgrade" ? "green" : c.action === "Downgrade" ? "red" : "gray"} />
            <span className="text-sm text-[var(--t-text-muted)]">{c.from} → {c.to}</span>
            <span className="text-sm font-mono text-[var(--t-text-secondary)]">${c.priceTarget}</span>
          </div>
        )) : <EmptyState message="No recent changes" />}
      </Crd>
      <Crd title="TONE ANALYSIS">
        <StatBox label="CONFIDENCE" value={d.toneAnalysis?.confidence} />
        <p className="text-sm text-[var(--t-text-muted)] mt-2">Hedging: {d.toneAnalysis?.hedgingLanguage}</p>
        <div className="mt-2 flex flex-wrap gap-1">{d.toneAnalysis?.keyPhraseShifts?.map((p, i) => <Tag key={i} label={p} />)}</div>
      </Crd>
      <Crd title="PRICE TARGET TREND">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--t-text-muted)]">3M Ago: <span className="font-mono text-[var(--t-text-secondary)]">${d.priceTargetTrend?.threeMonthAgo}</span></span>
          <span className="text-[var(--t-text-muted)]">→</span>
          <span className="text-sm text-[var(--t-text-muted)]">Current: <span className="font-mono text-[var(--t-text)]">${d.priceTargetTrend?.current}</span></span>
        </div>
      </Crd>
      {d.contrarians?.length > 0 && (
        <Crd title="CONTRARIANS">
          {d.contrarians.map((c, i) => (
            <div key={i} className="mb-2 last:mb-0"><span className="text-sm text-amber-400 font-semibold">{c.firm}</span> — <span className="text-sm text-[var(--t-text-secondary)]">{c.view}</span><p className="text-sm text-[var(--t-text-muted)]">{c.rationale}</p></div>
          ))}
        </Crd>
      )}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 14. Options Sentiment ═══
export function OptionsSentimentTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<OptionsSentimentAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchOptionsSentiment(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze options flow sentiment..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="P/C RATIO" value={`${d.putCallRatio?.current}`} sub={`Avg: ${d.putCallRatio?.average}`} />
        <StatBox label="SIGNAL" value={d.putCallRatio?.signal} />
        <StatBox label="MAX PAIN" value={`$${d.maxPain}`} />
        <StatBox label="SMART MONEY" value={d.smartMoneySignal} />
      </div>
      <Crd title="UNUSUAL ACTIVITY">
        {d.unusualActivity?.length ? d.unusualActivity.map((o, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <Tag label={o.type} color={o.type === "Call" ? "green" : "red"} />
            <span className="text-sm font-mono text-[var(--t-text)]">${o.strike}</span>
            <span className="text-sm text-[var(--t-text-muted)]">{o.expiry}</span>
            <span className="text-sm text-[var(--t-text-secondary)]">{o.premium}</span>
            <Tag label={o.sentiment} color={o.sentiment === "Bullish" ? "green" : "red"} />
          </div>
        )) : <EmptyState message="No unusual activity" />}
      </Crd>
      <Crd title="IMPLIED MOVE">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="NEXT EARNINGS" value={d.impliedMove?.nextEarnings} />
          <StatBox label="NEXT WEEK" value={d.impliedMove?.nextWeek} />
        </div>
      </Crd>
      <Crd title="SKEW">
        <Tag label={d.skew?.direction} /><p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.skew?.implication}</p>
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">OI Trend: {d.openInterestTrend}</p>
    </div>
  );
}

// ═══ 15. Earnings Call Tone ═══
export function EarningsToneTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<EarningsToneAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchEarningsTone(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Analyze earnings call tone..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="TONE" value={d.overallTone} />
        <StatBox label="SCORE" value={`${d.toneScore}/100`} />
        <StatBox label="VS LAST Q" value={d.comparedToLastQuarter} />
      </div>
      <Crd title="MANAGEMENT CONFIDENCE">
        <StatBox label="LEVEL" value={d.managementConfidence?.level} sub={`vs Last Q: ${d.managementConfidence?.vsLastQuarter}`} />
        <div className="mt-2">{d.managementConfidence?.evidence?.map((e, i) => <p key={i} className="text-sm text-[var(--t-text-secondary)] mb-1">• {e}</p>)}</div>
      </Crd>
      <div className="grid grid-cols-3 gap-4">
        <Crd title="BULLISH PHRASES">{d.keyPhrases?.bullish?.map((p, i) => <Tag key={i} label={p} color="green" />)}</Crd>
        <Crd title="BEARISH PHRASES">{d.keyPhrases?.bearish?.map((p, i) => <Tag key={i} label={p} color="red" />)}</Crd>
        <Crd title="HEDGING PHRASES">{d.keyPhrases?.hedging?.map((p, i) => <Tag key={i} label={p} color="yellow" />)}</Crd>
      </div>
      <Crd title="Q&A SENTIMENT">
        <div className="space-y-2">
          <p className="text-sm text-[var(--t-text-secondary)]">Defensiveness: <Tag label={d.qaSentiment?.managementDefensiveness} /></p>
          <p className="text-sm text-[var(--t-text-secondary)]">Skepticism: <Tag label={d.qaSentiment?.analystSkepticism} /></p>
          {d.qaSentiment?.tenseMoments?.map((t, i) => <p key={i} className="text-sm text-amber-400/60">⚡ {t}</p>)}
        </div>
      </Crd>
      <Crd title="GUIDANCE LANGUAGE">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="SPECIFICITY" value={d.guidanceLanguage?.specificity} />
          <StatBox label="CONFIDENCE" value={d.guidanceLanguage?.confidence} />
        </div>
      </Crd>
      {d.redFlags?.length > 0 && <Crd title="RED FLAGS">{d.redFlags.map((f, i) => <p key={i} className="text-sm text-red-400/70 mb-1">⚠ {f}</p>)}</Crd>}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 16. Entry/Exit Planner ═══
export function EntryExitTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<EntryExitAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchEntryExit(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Plan entry & exit strategy..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="SETUP" value={d.currentSetup} />
        <StatBox label="QUALITY" value={d.setupQuality} />
        <StatBox label="R:R RATIO" value={d.riskReward?.ratio} />
      </div>
      <Crd title="ENTRY STRATEGY">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="IDEAL" value={`$${d.entryStrategy?.idealEntry}`} />
          <StatBox label="AGGRESSIVE" value={`$${d.entryStrategy?.aggressiveEntry}`} />
          <StatBox label="CONSERVATIVE" value={`$${d.entryStrategy?.conservativeEntry}`} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">Trigger: {d.entryStrategy?.entryTrigger}</p>
        <p className="text-sm text-[var(--t-text-muted)]">Timeframe: {d.entryStrategy?.timeframe}</p>
      </Crd>
      <Crd title="EXIT STRATEGY">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="TARGET 1" value={`$${d.exitStrategy?.profitTarget1}`} />
          <StatBox label="TARGET 2" value={`$${d.exitStrategy?.profitTarget2}`} />
          <StatBox label="TARGET 3" value={`$${d.exitStrategy?.profitTarget3}`} />
        </div>
        <p className="text-sm text-[var(--t-text-muted)] mt-2">Trailing: {d.exitStrategy?.trailingStop}</p>
      </Crd>
      <Crd title="STOP LOSS">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="TIGHT" value={`$${d.stopLoss?.tight}`} />
          <StatBox label="STANDARD" value={`$${d.stopLoss?.standard}`} />
          <StatBox label="WIDE" value={`$${d.stopLoss?.wide}`} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.stopLoss?.rationale}</p>
      </Crd>
      <Crd title="RISK/REWARD">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="RATIO" value={d.riskReward?.ratio} />
          <StatBox label="RISK" value={d.riskReward?.riskPercent} />
          <StatBox label="REWARD" value={d.riskReward?.rewardPercent} />
        </div>
      </Crd>
      {d.catalystTiming?.length > 0 && (
        <Crd title="CATALYST TIMING">
          {d.catalystTiming.map((c, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
              <span className="text-sm text-[var(--t-text-secondary)]">{c.event}</span>
              <span className="text-sm text-[var(--t-text-muted)] font-mono">{c.date}</span>
              <Tag label={c.strategy} />
            </div>
          ))}
        </Crd>
      )}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 17. Position Sizing ═══
export function PositionSizingTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<PositionSizingAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchPositionSizing(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Calculate position sizing..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <Crd title="KELLY CRITERION">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="OPTIMAL" value={d.kellyCriterion?.optimalSize} />
          <StatBox label="HALF KELLY" value={d.kellyCriterion?.halfKelly} />
          <StatBox label="QUARTER KELLY" value={d.kellyCriterion?.quarterKelly} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.kellyCriterion?.recommendation}</p>
      </Crd>
      <Crd title="RISK-BASED SIZING">
        {d.riskBased && Object.entries(d.riskBased).map(([k, v]) => (
          <div key={k} className="flex justify-between items-center py-2 border-b border-[var(--t-border)] last:border-0">
            <span className="text-sm text-[var(--t-text-secondary)]">{k}</span>
            <span className="text-sm font-mono text-[var(--t-text)]">{v.positionSize}</span>
            <span className="text-sm text-[var(--t-text-muted)]">{v.shares} shares</span>
            <span className="text-sm text-red-400/60">Max Loss: {v.maxLoss}</span>
          </div>
        ))}
      </Crd>
      <Crd title="VOLATILITY ADJUSTED">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="ATR" value={`$${d.volatilityAdjusted?.atr}`} />
          <StatBox label="ATR STOP" value={`$${d.volatilityAdjusted?.atrBasedStop}`} />
          <StatBox label="VOL RANK" value={d.volatilityAdjusted?.volatilityRank} />
          <StatBox label="SUGGESTED" value={d.volatilityAdjusted?.suggestedSize} />
        </div>
      </Crd>
      <Crd title="CONVICTION BASED">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="HIGH" value={d.convictionBased?.highConviction} />
          <StatBox label="MEDIUM" value={d.convictionBased?.mediumConviction} />
          <StatBox label="LOW" value={d.convictionBased?.lowConviction} />
        </div>
      </Crd>
      {d.correlationWarning && <p className="text-sm text-amber-400/70">⚠ {d.correlationWarning}</p>}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 18. Hedge Suggestions ═══
export function HedgeTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<HedgeAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchHedge(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Generate hedge strategies..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="RECOMMENDED" value={d.recommendedHedge} />
        <StatBox label="HEDGE RATIO" value={d.hedgeRatio} />
        <StatBox label="RISK LEVEL" value={d.currentRiskLevel} />
      </div>
      <Crd title="HEDGE STRATEGIES">
        {d.hedgeStrategies?.map((s, i) => (
          <div key={i} className="mb-4 last:mb-0 border-b border-[var(--t-border)] pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold text-[var(--t-text)]">{s.strategy}</span>
              <Tag label={s.type} /><Tag label={s.complexity} color={s.complexity === "Simple" ? "green" : s.complexity === "Complex" ? "red" : "gray"} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <p className="text-sm text-[var(--t-text-secondary)]">Cost: <span className="text-[var(--t-text-secondary)]">{s.cost}</span></p>
              <p className="text-sm text-[var(--t-text-secondary)]">Protection: <span className="text-[var(--t-text-secondary)]">{s.protection}</span></p>
            </div>
            <p className="text-sm text-[var(--t-text-muted)]">{s.details}</p>
          </div>
        ))}
      </Crd>
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 19. Tax Lot Optimizer ═══
export function TaxOptimizerTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<TaxOptimizerAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchTaxOptimizer(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Optimize tax strategy..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <Crd title="TAX-LOSS HARVESTING">
        <Tag label={d.taxLossHarvesting?.opportunity ? "OPPORTUNITY" : "NO OPPORTUNITY"} color={d.taxLossHarvesting?.opportunity ? "green" : "gray"} />
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">Potential Savings: {d.taxLossHarvesting?.potentialSavings}</p>
        <p className="text-sm text-amber-400/60 mt-1">⚠ {d.taxLossHarvesting?.washSaleWarning}</p>
        {d.taxLossHarvesting?.substitutes?.length > 0 && (
          <div className="mt-3">
            <div className="text-[13px] text-[var(--t-text-muted)] font-mono mb-2">SUBSTITUTES</div>
            {d.taxLossHarvesting.substitutes.map((s, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm font-mono text-[var(--t-text)]">{s.ticker}</span>
                <span className="text-sm text-[var(--t-text-muted)]">Corr: {s.correlation}</span>
                <span className="text-sm text-[var(--t-text-secondary)]">{s.reason}</span>
              </div>
            ))}
          </div>
        )}
      </Crd>
      <Crd title="HOLDING PERIOD">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="SHORT-TERM RATE" value={d.holdingPeriod?.shortTermRate} />
          <StatBox label="LONG-TERM RATE" value={d.holdingPeriod?.longTermRate} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.holdingPeriod?.recommendation}</p>
      </Crd>
      <Crd title="LOT SELECTION">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="FIFO" value={d.lotSelection?.fifo} />
          <StatBox label="SPECIFIC ID" value={d.lotSelection?.specificId} />
        </div>
        <p className="text-sm text-[var(--t-text-secondary)] mt-2">{d.lotSelection?.recommendation}</p>
      </Crd>
      {d.yearEndStrategies?.length > 0 && (
        <Crd title="YEAR-END STRATEGIES">{d.yearEndStrategies.map((s, i) => <p key={i} className="text-sm text-[var(--t-text-secondary)] mb-1">• {s}</p>)}</Crd>
      )}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}

// ═══ 20. Pairs Trade Finder ═══
export function PairsTradeTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const [d, setD] = useState<PairsTradeAnalysis | null>(null);
  const [l, setL] = useState(false);
  const go = async () => { setL(true); const r = await fetchPairsTrade(symbol, name, price); setD(r); setL(false); };
  if (!d) return <GenBtn label="Find pairs trade opportunities..." onClick={go} loading={l} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="BEST PAIR" value={d.bestPair?.ticker} sub={d.bestPair?.rationale} />
        <StatBox label="MARKET NEUTRAL" value={d.marketNeutral ? "Yes" : "No"} />
      </div>
      <Crd title="PAIRS">
        {d.pairs?.map((p, i) => (
          <div key={i} className="mb-3 last:mb-0 border-b border-[var(--t-border)] pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-mono text-[var(--t-text)] font-semibold">{p.ticker}</span>
              <Tag label={`Corr: ${p.correlation}`} color={p.correlation > 0.8 ? "green" : "gray"} />
              <Tag label={p.signal} color={p.signal === "Buy" ? "green" : p.signal === "Sell" ? "red" : "gray"} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm text-[var(--t-text-muted)]">Cointegration: {p.cointegration}</p>
              <p className="text-sm text-[var(--t-text-muted)]">Spread: {p.currentSpread}</p>
              <p className="text-sm text-[var(--t-text-muted)]">Return: {p.expectedReturn}</p>
            </div>
          </div>
        ))}
      </Crd>
      {d.riskFactors?.length > 0 && (
        <Crd title="RISK FACTORS">{d.riskFactors.map((r, i) => <p key={i} className="text-sm text-red-400/60 mb-1">⚠ {r}</p>)}</Crd>
      )}
      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{d.summary}</p>
    </div>
  );
}
