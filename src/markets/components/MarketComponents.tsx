import { useState } from "react";

// ── Score Bar (horizontal progress) ──
export const ScoreBar = ({ label, value, max, color = "#3b82f6" }: { label: string; value: number; max: number; color?: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-28 text-white/30 font-mono text-xs">{label}</span>
    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
    <span className="w-8 text-right font-mono text-xs font-semibold" style={{ color }}>{value}</span>
  </div>
);

// ── Section Card wrapper ──
export const SectionCard = ({ title, step, children, defaultOpen = true }: { title: string; step?: number; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center gap-3.5">
          {step && (
            <span className="w-7 h-7 rounded-lg bg-white/[0.1] text-white/60 text-xs flex items-center justify-center font-mono">{step}</span>
          )}
          <h3 className="text-sm font-semibold text-white/70 tracking-tight">{title}</h3>
        </div>
        <svg className={`w-4 h-4 text-white/20 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/[0.06]">{children}</div>}
    </div>
  );
};

// ── Tag chip ──
export const Tag = ({ label, color = "gray" }: { label: string; color?: string }) => {
  const colors: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    gray: "bg-white/[0.04] text-white/40 border-white/[0.08]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return <span className={`inline-block px-2 py-0.5 text-[14px] font-mono uppercase tracking-wider border rounded-md ${colors[color] || colors.gray}`}>{label}</span>;
};

// ── Direction Arrow ──
export const DirectionArrow = ({ direction }: { direction: "bullish" | "bearish" | "mixed" }) => {
  if (direction === "bullish") return <span className="text-emerald-400 font-mono text-xs">&#9650; BULL</span>;
  if (direction === "bearish") return <span className="text-red-400 font-mono text-xs">&#9660; BEAR</span>;
  return <span className="text-amber-400 font-mono text-xs">&#9644; MIXED</span>;
};

// ── Confidence Dots ──
export const ConfidenceDots = ({ value }: { value: number }) => {
  const filled = Math.round(value / 10);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? (filled >= 8 ? "bg-emerald-400" : filled >= 5 ? "bg-amber-400" : "bg-red-400") : "bg-white/[0.08]"}`} />
      ))}
    </div>
  );
};

// ── Trend Badge ──
export const TrendBadge = ({ trend }: { trend: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    accelerating: { color: "green", label: "Accelerating" },
    stable: { color: "blue", label: "Stable" },
    decelerating: { color: "yellow", label: "Decelerating" },
    declining: { color: "red", label: "Declining" },
  };
  const t = map[trend] || { color: "gray", label: trend };
  return <Tag label={t.label} color={t.color} />;
};

// ── Process Score Card ──
export const ProcessScoreCard = ({ score }: { score: Record<string, number> }) => {
  const labels: Record<string, { label: string; max: number }> = {
    triggerClarity: { label: "Trigger", max: 5 },
    moveCatalystClarity: { label: "Catalyst", max: 10 },
    leverageStrength: { label: "Leverage", max: 15 },
    peerSupport: { label: "Peers", max: 10 },
    moneyFlow: { label: "Money Flow", max: 15 },
    numberConfirmation: { label: "Numbers", max: 10 },
    segmentQuality: { label: "Segments", max: 10 },
    contractsProof: { label: "Contracts", max: 10 },
    valuationAttractiveness: { label: "Valuation", max: 10 },
    ownershipContext: { label: "Ownership", max: 5 },
  };
  return (
    <div className="space-y-2">
      {Object.entries(labels).map(([key, { label, max }]) => (
        <ScoreBar key={key} label={label} value={score[key] || 0} max={max} color={((score[key] || 0) / max) >= 0.7 ? "#34d399" : ((score[key] || 0) / max) >= 0.4 ? "#fbbf24" : "#f87171"} />
      ))}
    </div>
  );
};

// ── Source Badge ──
export const SourceBadge = ({ type }: { type: string }) => {
  const map: Record<string, string> = {
    news: "blue", earnings_release: "green", transcript: "purple",
    filing: "gray", contract: "green", ownership: "yellow",
    analyst: "blue", price_event: "red", note: "gray",
  };
  return <Tag label={type.replace("_", " ")} color={map[type] || "gray"} />;
};

// ── Stat Box ──
export const StatBox = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-3 text-center">
    <div className="text-[13px] text-white/20 font-mono tracking-widest mb-1">{label.toUpperCase()}</div>
    <div className="text-sm font-semibold text-white tabular-nums">{value}</div>
    {sub && <div className="text-[14px] text-white/15 mt-0.5">{sub}</div>}
  </div>
);

// ── Empty State ──
export const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-white/20">
    <svg className="w-12 h-12 mb-3 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    <p className="text-sm font-mono">{message}</p>
  </div>
);
