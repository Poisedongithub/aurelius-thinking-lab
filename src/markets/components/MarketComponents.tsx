import { useState } from "react";

// ── Score Bar (horizontal progress) ──
export const ScoreBar = ({ label, value, max, color = "#3b82f6" }: { label: string; value: number; max: number; color?: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-28 text-[var(--t-text-muted)] font-mono text-xs tracking-wide">{label}</span>
    <div className="flex-1 h-2 bg-[var(--t-btn-bg)] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(value / max) * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }} />
    </div>
    <span className="w-8 text-right font-mono text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
  </div>
);

// ── Section Card wrapper ──
export const SectionCard = ({ title, step, children, defaultOpen = true }: { title: string; step?: number; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="content-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--t-btn-bg)] transition-all duration-200">
        <div className="flex items-center gap-4">
          {step && (
            <span className="w-8 h-8 rounded-lg bg-[var(--t-group-active)] text-[var(--t-text)] text-sm flex items-center justify-center font-mono font-bold">{step}</span>
          )}
          <h3 className="text-[15px] font-semibold text-[var(--t-text)] tracking-wide">{title}</h3>
        </div>
        <svg className={`w-4 h-4 text-[var(--t-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-[var(--t-border)]">{children}</div>}
    </div>
  );
};

// ── Tag chip ──
export const Tag = ({ label, color = "gray" }: { label: string; color?: string }) => {
  const colors: Record<string, string> = {
    green: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/12 text-red-400 border-red-500/20",
    blue: "bg-blue-500/12 text-blue-400 border-blue-500/20",
    yellow: "bg-amber-500/12 text-amber-400 border-amber-500/20",
    gray: "bg-[var(--t-btn-bg)] text-[var(--t-text-secondary)] border-[var(--t-border)]",
    purple: "bg-purple-500/12 text-purple-400 border-purple-500/20",
  };
  return <span className={`inline-block px-2.5 py-1 text-[12px] font-mono font-medium uppercase tracking-wider border rounded-lg ${colors[color] || colors.gray}`}>{label}</span>;
};

// ── Direction Arrow ──
export const DirectionArrow = ({ direction }: { direction: "bullish" | "bearish" | "mixed" }) => {
  if (direction === "bullish") return <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">&#9650; BULL</span>;
  if (direction === "bearish") return <span className="inline-flex items-center gap-1 text-red-400 font-mono text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-md">&#9660; BEAR</span>;
  return <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md">&#9644; MIXED</span>;
};

// ── Confidence Dots ──
export const ConfidenceDots = ({ value }: { value: number }) => {
  const filled = Math.round(value / 10);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < filled ? (filled >= 8 ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" : filled >= 5 ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.4)]" : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.4)]") : "bg-[var(--t-btn-hover)]"}`} />
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
    <div className="space-y-2.5">
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
  <div className="stat-card bg-[var(--t-stat-bg)] border border-[var(--t-border)] rounded-xl px-4 py-3.5 text-center">
    <div className="text-[11px] text-[var(--t-text-muted)] font-mono tracking-[0.15em] mb-1.5">{label.toUpperCase()}</div>
    <div className="text-sm font-bold text-[var(--t-text)] tabular-nums font-mono">{value}</div>
    {sub && <div className="text-[12px] text-[var(--t-text-dim)] mt-1 font-mono">{sub}</div>}
  </div>
);

// ── Empty State ──
export const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-[var(--t-text-muted)]">
    <svg className="w-14 h-14 mb-4 text-[var(--t-text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    <p className="text-sm font-mono tracking-wide">{message}</p>
  </div>
);
