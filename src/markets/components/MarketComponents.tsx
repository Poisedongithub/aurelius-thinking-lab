import { useState } from "react";

// ── Score Bar (horizontal progress) ──
export const ScoreBar = ({ label, value, max, color = "#2563eb" }: { label: string; value: number; max: number; color?: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-28 text-gray-500 font-mono text-xs">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
    <span className="w-8 text-right font-mono text-xs font-semibold" style={{ color }}>{value}</span>
  </div>
);

// ── Section Card wrapper ──
export const SectionCard = ({ title, step, children, defaultOpen = true }: { title: string; step?: number; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          {step && (
            <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-mono">{step}</span>
          )}
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
};

// ── Tag chip ──
export const Tag = ({ label, color = "gray" }: { label: string; color?: string }) => {
  const colors: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded ${colors[color] || colors.gray}`}>{label}</span>;
};

// ── Direction Arrow ──
export const DirectionArrow = ({ direction }: { direction: "bullish" | "bearish" | "mixed" }) => {
  if (direction === "bullish") return <span className="text-emerald-600 font-mono text-xs">&#9650; BULL</span>;
  if (direction === "bearish") return <span className="text-red-600 font-mono text-xs">&#9660; BEAR</span>;
  return <span className="text-amber-600 font-mono text-xs">&#9644; MIXED</span>;
};

// ── Confidence Dot ──
export const ConfidenceDots = ({ value }: { value: number }) => {
  const filled = Math.round(value / 10);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? (filled >= 8 ? "bg-emerald-500" : filled >= 5 ? "bg-amber-500" : "bg-red-400") : "bg-gray-200"}`} />
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

// ── Process Score Radar (simplified as horizontal bars) ──
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
        <ScoreBar key={key} label={label} value={score[key] || 0} max={max} color={((score[key] || 0) / max) >= 0.7 ? "#059669" : ((score[key] || 0) / max) >= 0.4 ? "#d97706" : "#dc2626"} />
      ))}
    </div>
  );
};

// ── Source Badge ──
export const SourceBadge = ({ type }: { type: string }) => {
  const map: Record<string, string> = {
    news: "blue",
    earnings_release: "green",
    transcript: "purple",
    filing: "gray",
    contract: "green",
    ownership: "yellow",
    analyst: "blue",
    price_event: "red",
    note: "gray",
  };
  return <Tag label={type.replace("_", " ")} color={map[type] || "gray"} />;
};

// ── Stat Box ──
export const StatBox = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
    <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">{label}</div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

// ── Empty State ──
export const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    <p className="text-sm font-mono">{message}</p>
  </div>
);
