import { useState, useRef } from "react";

interface ShareCardProps {
  type: "ticker" | "portfolio";
  data: {
    symbol?: string;
    name?: string;
    price?: number;
    change?: number;
    totalValue?: number;
    totalPnl?: number;
    totalPnlPct?: number;
    positionCount?: number;
  };
}

export default function ShareCard({ type, data }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = type === "ticker"
    ? `${data.symbol} $${data.price?.toFixed(2)} (${(data.change || 0) >= 0 ? "+" : ""}${data.change?.toFixed(2)}%) — tracked on Thinking Lab`
    : `My portfolio: $${data.totalValue?.toLocaleString()} | P&L: ${(data.totalPnlPct || 0) >= 0 ? "+" : ""}${data.totalPnlPct?.toFixed(1)}% — tracked on Thinking Lab`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-3">
      {/* Preview card */}
      <div ref={cardRef} className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-[var(--t-border)] rounded-xl p-5">
        <div className="text-[13px] text-[var(--t-text-muted)] font-mono uppercase tracking-widest mb-3">THINKING LAB</div>
        {type === "ticker" ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold font-mono text-[var(--t-text)]">{data.symbol}</span>
              <span className="text-xs font-mono text-[var(--t-text-secondary)]">{data.name}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold font-mono text-[var(--t-text)]">${data.price?.toFixed(2)}</span>
              <span className={`text-sm font-mono font-bold ${(data.change || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {(data.change || 0) >= 0 ? "+" : ""}{data.change?.toFixed(2)}%
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-mono text-[var(--t-text-secondary)] mb-1">PORTFOLIO VALUE</div>
            <div className="text-2xl font-bold font-mono text-[var(--t-text)]">${data.totalValue?.toLocaleString()}</div>
            <div className={`text-sm font-mono font-bold mt-1 ${(data.totalPnlPct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(data.totalPnlPct || 0) >= 0 ? "+" : ""}{data.totalPnlPct?.toFixed(1)}% (${data.totalPnl?.toLocaleString()})
            </div>
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono mt-2">{data.positionCount} positions</div>
          </>
        )}
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 px-3 py-2 text-[14px] font-mono font-bold rounded-lg border border-[var(--t-border-hover)] text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:border-white/20 transition-all"
        >
          {copied ? "COPIED!" : "COPY TEXT"}
        </button>
        <button
          onClick={handleTweet}
          className="flex-1 px-3 py-2 text-[14px] font-mono font-bold rounded-lg bg-white text-black hover:bg-[var(--t-accent)]/90 transition-all"
        >
          SHARE ON X
        </button>
      </div>
    </div>
  );
}
