import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScreener, ScreenerResult, formatMarketCap, formatVolume } from "../data/api";

const SECTORS = ["All", "Technology", "Communication", "Consumer", "Healthcare", "Financial", "Industrials"];
const MARKET_CAP_FILTERS = [
  { label: "All Caps", min: undefined, max: undefined },
  { label: "Mega (>$200B)", min: 200e9, max: undefined },
  { label: "Large ($10B-$200B)", min: 10e9, max: 200e9 },
  { label: "Mid ($2B-$10B)", min: 2e9, max: 10e9 },
  { label: "Small (<$2B)", min: undefined, max: 2e9 },
];

export default function Screener() {
  const navigate = useNavigate();
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("All");
  const [capFilter, setCapFilter] = useState(0);
  const [sortBy, setSortBy] = useState<"change" | "marketCap" | "volume">("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setLoading(true);
    const cap = MARKET_CAP_FILTERS[capFilter];
    fetchScreener({
      sector: sector === "All" ? undefined : sector,
      marketCapMin: cap.min,
      marketCapMax: cap.max,
      limit: 30,
    }).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [sector, capFilter]);

  const sorted = [...results].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
  });

  const toggleSort = (col: "change" | "marketCap" | "volume") => {
    if (sortBy === col) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/markets")} className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors">
              ← MARKETS
            </button>
            <h1 className="text-lg font-bold font-mono tracking-tight">STOCK SCREENER</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Sector filter */}
          <div>
            <div className="text-[9px] text-white/30 font-mono uppercase mb-2">SECTOR</div>
            <div className="flex gap-1 flex-wrap">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border transition-all ${
                    sector === s
                      ? "bg-white text-black border-white font-bold"
                      : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Market cap filter */}
          <div>
            <div className="text-[9px] text-white/30 font-mono uppercase mb-2">MARKET CAP</div>
            <div className="flex gap-1 flex-wrap">
              {MARKET_CAP_FILTERS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setCapFilter(i)}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border transition-all ${
                    capFilter === i
                      ? "bg-white text-black border-white font-bold"
                      : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  }`}
                >
                  {f.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-[10px] text-white/30 font-mono mb-3">
          {loading ? "SCANNING..." : `${sorted.length} RESULTS`}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-white/20 text-xs font-mono">No stocks match your filters</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-white/30 border-b border-white/[0.06]">
                  <th className="text-left py-3 font-normal">TICKER</th>
                  <th className="text-left py-3 font-normal">NAME</th>
                  <th className="text-right py-3 font-normal">PRICE</th>
                  <th
                    className="text-right py-3 font-normal cursor-pointer hover:text-white/60"
                    onClick={() => toggleSort("change")}
                  >
                    CHANGE {sortBy === "change" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th
                    className="text-right py-3 font-normal cursor-pointer hover:text-white/60"
                    onClick={() => toggleSort("volume")}
                  >
                    VOLUME {sortBy === "volume" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th
                    className="text-right py-3 font-normal cursor-pointer hover:text-white/60"
                    onClick={() => toggleSort("marketCap")}
                  >
                    MKT CAP {sortBy === "marketCap" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th className="text-right py-3 font-normal">SECTOR</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((stock) => (
                  <tr
                    key={stock.symbol}
                    onClick={() => navigate(`/markets/ticker/${stock.symbol}`)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-3 text-white font-bold">{stock.symbol}</td>
                    <td className="py-3 text-white/60 max-w-[200px] truncate">{stock.name}</td>
                    <td className="py-3 text-right text-white">${stock.price?.toFixed(2)}</td>
                    <td className={`py-3 text-right ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.change >= 0 ? "+" : ""}{stock.change?.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-white/50">{formatVolume(stock.volume)}</td>
                    <td className="py-3 text-right text-white/50">{stock.marketCap ? formatMarketCap(stock.marketCap) : "—"}</td>
                    <td className="py-3 text-right">
                      {stock.sector && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/40">{stock.sector.toUpperCase()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
