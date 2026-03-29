import { useState, useEffect } from "react";
import { fetchOptions, OptionsContract, OptionsSummary } from "../data/api";

interface OptionsFlowProps {
  symbol: string;
}

export default function OptionsFlow({ symbol }: OptionsFlowProps) {
  const [summary, setSummary] = useState<OptionsSummary>({ totalContracts: 0, calls: 0, puts: 0, putCallRatio: "N/A" });
  const [contracts, setContracts] = useState<OptionsContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "call" | "put">("all");

  useEffect(() => {
    setLoading(true);
    fetchOptions(symbol).then((data) => {
      setSummary(data.summary);
      setContracts(data.contracts);
      setLoading(false);
    });
  }, [symbol]);

  const filtered = filter === "all" ? contracts : contracts.filter((c) => c.type === filter);
  const callPct = summary.totalContracts > 0 ? (summary.calls / summary.totalContracts) * 100 : 50;

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
        <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-4">OPTIONS FLOW</div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-white/5 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
      <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-4">OPTIONS FLOW</div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
          <div className="text-[9px] text-white/30 font-mono">TOTAL</div>
          <div className="text-sm font-bold text-white font-mono mt-1">{summary.totalContracts}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-green-500/10">
          <div className="text-[9px] text-green-400/60 font-mono">CALLS</div>
          <div className="text-sm font-bold text-green-400 font-mono mt-1">{summary.calls}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-red-500/10">
          <div className="text-[9px] text-red-400/60 font-mono">PUTS</div>
          <div className="text-sm font-bold text-red-400 font-mono mt-1">{summary.puts}</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
          <div className="text-[9px] text-white/30 font-mono">P/C RATIO</div>
          <div className="text-sm font-bold text-white font-mono mt-1">{summary.putCallRatio}</div>
        </div>
      </div>

      {/* Call/Put bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[9px] font-mono mb-1">
          <span className="text-green-400/60">CALLS {callPct.toFixed(0)}%</span>
          <span className="text-red-400/60">PUTS {(100 - callPct).toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div className="bg-green-500/60 rounded-l-full transition-all" style={{ width: `${callPct}%` }} />
          <div className="bg-red-500/60 rounded-r-full transition-all" style={{ width: `${100 - callPct}%` }} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-3">
        {(["all", "call", "put"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[10px] font-mono rounded transition-all ${
              filter === f ? "bg-white text-black font-bold" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {f.toUpperCase()}S
          </button>
        ))}
      </div>

      {/* Contracts table */}
      {filtered.length === 0 ? (
        <div className="text-white/20 text-xs font-mono text-center py-4">No contracts available</div>
      ) : (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-[#0a0a0a]">
              <tr className="text-white/30 border-b border-white/[0.06]">
                <th className="text-left py-2 font-normal">TYPE</th>
                <th className="text-right py-2 font-normal">STRIKE</th>
                <th className="text-right py-2 font-normal">EXPIRATION</th>
                <th className="text-right py-2 font-normal">STYLE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] ${c.type === "call" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {c.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 text-right text-white/80">${c.strike?.toFixed(2)}</td>
                  <td className="py-2 text-right text-white/50">{c.expiration}</td>
                  <td className="py-2 text-right text-white/40">{c.style || "american"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
