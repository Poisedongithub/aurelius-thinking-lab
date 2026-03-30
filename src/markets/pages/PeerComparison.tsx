import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComparison, ComparisonTicker, searchTickers, formatMarketCap, formatVolume } from "../data/api";

export default function PeerComparison() {
  const navigate = useNavigate();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonTicker[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setInputVal(q);
    if (q.length < 1) { setSearchResults([]); return; }
    const results = await searchTickers(q);
    setSearchResults(results.slice(0, 5));
  };

  const addSymbol = (sym: string) => {
    if (symbols.length >= 4 || symbols.includes(sym.toUpperCase())) return;
    setSymbols([...symbols, sym.toUpperCase()]);
    setInputVal("");
    setSearchResults([]);
  };

  const removeSymbol = (sym: string) => {
    setSymbols(symbols.filter((s) => s !== sym));
    setComparisons(comparisons.filter((c) => c.symbol !== sym));
  };

  const runComparison = async () => {
    if (symbols.length < 2) return;
    setLoading(true);
    const data = await fetchComparison(symbols);
    setComparisons(data);
    setLoading(false);
  };

  const maxMcap = Math.max(...comparisons.map((c) => c.marketCap || 0), 1);
  const maxVol = Math.max(...comparisons.map((c) => c.volume || 0), 1);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/markets")} className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors">
            ← MARKETS
          </button>
          <h1 className="text-lg font-bold font-mono tracking-tight">PEER COMPARISON</h1>
        </div>

        {/* Add tickers */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 mb-6">
          <div className="text-[14px] text-white/30 font-mono uppercase mb-3">ADD TICKERS TO COMPARE (2-4)</div>
          <div className="flex gap-2 flex-wrap mb-3">
            {symbols.map((sym) => (
              <span key={sym} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs font-mono font-bold">
                {sym}
                <button onClick={() => removeSymbol(sym)} className="text-white/30 hover:text-red-400 transition-colors">×</button>
              </span>
            ))}
            {symbols.length < 4 && (
              <div className="relative">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Add ticker..."
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-white/30 w-40"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-[#111] border border-white/10 rounded-lg overflow-hidden z-10 w-64">
                    {searchResults.map((r) => (
                      <button
                        key={r.symbol}
                        onClick={() => addSymbol(r.symbol)}
                        className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/5 flex justify-between"
                      >
                        <span className="text-white font-bold">{r.symbol}</span>
                        <span className="text-white/40 truncate ml-2">{r.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={runComparison}
            disabled={symbols.length < 2 || loading}
            className={`px-4 py-2 text-[14px] font-mono font-bold rounded-lg transition-all ${
              symbols.length >= 2
                ? "bg-white text-black hover:bg-white/90"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {loading ? "COMPARING..." : "COMPARE"}
          </button>
        </div>

        {/* Results */}
        {comparisons.length > 0 && (
          <div className="space-y-4">
            {/* Price & Change cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {comparisons.map((c) => (
                <div
                  key={c.symbol}
                  onClick={() => navigate(`/markets/ticker/${c.symbol}`)}
                  className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 cursor-pointer hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold font-mono">{c.symbol}</span>
                    {c.sector && (
                      <span className="text-[12px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono">{c.sector}</span>
                    )}
                  </div>
                  <div className="text-lg font-bold font-mono">${c.price?.toFixed(2)}</div>
                  <div className={`text-xs font-mono ${c.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {c.change >= 0 ? "+" : ""}{c.change?.toFixed(2)}%
                  </div>
                  <div className="text-[14px] text-white/30 font-mono mt-1 truncate">{c.name}</div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
              <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">SIDE-BY-SIDE</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-white/30 border-b border-white/[0.06]">
                      <th className="text-left py-2 font-normal">METRIC</th>
                      {comparisons.map((c) => (
                        <th key={c.symbol} className="text-right py-2 font-normal">{c.symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">Price</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white">${c.price?.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">Day Change</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className={`py-2 text-right ${c.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {c.change >= 0 ? "+" : ""}{c.change?.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">Market Cap</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/80">
                          {c.marketCap ? formatMarketCap(c.marketCap) : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">Volume</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/80">{formatVolume(c.volume)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">52W High</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/80">
                          {c.yearHigh ? `$${c.yearHigh.toFixed(2)}` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">52W Low</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/80">
                          {c.yearLow ? `$${c.yearLow.toFixed(2)}` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-2 text-white/50">Sector</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/60">{c.sector || "—"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-white/50">Industry</td>
                      {comparisons.map((c) => (
                        <td key={c.symbol} className="py-2 text-right text-white/60">{c.industry || "—"}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual bars */}
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
              <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">MARKET CAP COMPARISON</div>
              <div className="space-y-2">
                {comparisons.map((c) => (
                  <div key={c.symbol} className="flex items-center gap-3">
                    <span className="text-[14px] font-mono font-bold w-12">{c.symbol}</span>
                    <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden">
                      <div
                        className="h-full bg-white/20 rounded transition-all"
                        style={{ width: `${((c.marketCap || 0) / maxMcap) * 100}%` }}
                      />
                    </div>
                    <span className="text-[14px] font-mono text-white/50 w-16 text-right">
                      {c.marketCap ? formatMarketCap(c.marketCap) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {comparisons.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-20">⚖️</div>
            <div className="text-white/20 text-xs font-mono">Add 2-4 tickers above and click COMPARE</div>
          </div>
        )}
      </div>
    </div>
  );
}
