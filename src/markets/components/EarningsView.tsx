import { useState, useEffect } from "react";
import { fetchEarnings, EarningsData, formatLargeNumber } from "../data/api";

interface EarningsViewProps {
  symbol: string;
}

export default function EarningsView({ symbol }: EarningsViewProps) {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEarnings(symbol).then((financials) => {
      setData(financials);
      setLoading(false);
    });
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
        <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">EARNINGS & FINANCIALS</div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-white/5 rounded" />)}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
        <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">EARNINGS & FINANCIALS</div>
        <div className="text-white/20 text-xs font-mono text-center py-6">No earnings data available</div>
      </div>
    );
  }

  // Calculate revenue growth
  const revenueGrowth = data.length >= 2 && data[0].revenue && data[1].revenue
    ? ((data[0].revenue - data[1].revenue) / Math.abs(data[1].revenue) * 100).toFixed(1)
    : null;

  const latestMargin = data[0].revenue && data[0].grossProfit
    ? ((data[0].grossProfit / data[0].revenue) * 100).toFixed(1)
    : null;

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
      <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">EARNINGS & FINANCIALS</div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
          <div className="text-[13px] text-white/30 font-mono uppercase">Latest EPS</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            {data[0].eps !== null ? `$${data[0].eps.toFixed(2)}` : "N/A"}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
          <div className="text-[13px] text-white/30 font-mono uppercase">Rev Growth</div>
          <div className={`text-sm font-bold font-mono mt-1 ${revenueGrowth && parseFloat(revenueGrowth) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {revenueGrowth ? `${parseFloat(revenueGrowth) >= 0 ? "+" : ""}${revenueGrowth}%` : "N/A"}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
          <div className="text-[13px] text-white/30 font-mono uppercase">Gross Margin</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            {latestMargin ? `${latestMargin}%` : "N/A"}
          </div>
        </div>
      </div>

      {/* Revenue bar chart */}
      <div className="mb-4">
        <div className="text-[13px] text-white/30 font-mono uppercase mb-2">QUARTERLY REVENUE</div>
        <div className="flex items-end gap-1 h-24">
          {[...data].reverse().map((q, i) => {
            const maxRev = Math.max(...data.filter(d => d.revenue).map(d => d.revenue!));
            const height = q.revenue ? (q.revenue / maxRev) * 100 : 0;
            const isLatest = i === data.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${isLatest ? "bg-white" : "bg-white/20"}`}
                  style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                />
                <div className="text-[12px] text-white/25 font-mono">
                  {q.period}{String(q.year).slice(-2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px] font-mono">
          <thead>
            <tr className="text-white/30 border-b border-white/[0.06]">
              <th className="text-left py-2 font-normal">PERIOD</th>
              <th className="text-right py-2 font-normal">REVENUE</th>
              <th className="text-right py-2 font-normal">NET INCOME</th>
              <th className="text-right py-2 font-normal">EPS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((q, i) => (
              <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-2 text-white/60">{q.period} {q.year}</td>
                <td className="py-2 text-right text-white/80">{q.revenue ? formatLargeNumber(q.revenue) : "—"}</td>
                <td className={`py-2 text-right ${q.netIncome && q.netIncome >= 0 ? "text-green-400/80" : "text-red-400/80"}`}>
                  {q.netIncome ? formatLargeNumber(q.netIncome) : "—"}
                </td>
                <td className="py-2 text-right text-white/80">{q.eps !== null ? `$${q.eps.toFixed(2)}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
