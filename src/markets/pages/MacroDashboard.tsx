import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMacroData, fetchMarketNews, MacroItem, NewsArticle, timeAgo } from "../data/api";

const CATEGORY_LABELS: Record<string, string> = {
  index: "INDICES",
  commodity: "COMMODITIES",
  currency: "CURRENCIES",
  bond: "BONDS",
};

const CATEGORY_ORDER = ["index", "commodity", "currency", "bond"];

export default function MacroDashboard() {
  const navigate = useNavigate();
  const [macro, setMacro] = useState<MacroItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMacroData(), fetchMarketNews()]).then(([macroData, newsData]) => {
      setMacro(macroData);
      setNews(newsData.slice(0, 8));
      setLoading(false);
    });
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: macro.filter((m) => m.category === cat),
  }));

  // Overall market sentiment
  const indices = macro.filter((m) => m.category === "index");
  const avgChange = indices.length > 0
    ? indices.reduce((sum, m) => sum + (m.change || 0), 0) / indices.length
    : 0;
  const sentiment = avgChange > 0.5 ? "BULLISH" : avgChange < -0.5 ? "BEARISH" : "NEUTRAL";
  const sentimentColor = avgChange > 0.5 ? "text-green-400" : avgChange < -0.5 ? "text-red-400" : "text-yellow-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center">
        <div className="text-white/20 text-xs font-mono">Loading macro data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/markets")} className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors">
              ← MARKETS
            </button>
            <div>
              <h1 className="text-lg font-bold font-mono tracking-tight">MACRO DASHBOARD</h1>
              <div className="text-[10px] text-white/30 font-mono">THE BIG PICTURE</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/30 font-mono uppercase">MARKET SENTIMENT</div>
            <div className={`text-sm font-bold font-mono ${sentimentColor}`}>{sentiment}</div>
          </div>
        </div>

        {/* Macro categories */}
        <div className="space-y-4 mb-6">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-2">{group.label}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.symbol}
                    className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all cursor-pointer"
                    onClick={() => navigate(`/markets/ticker/${item.symbol}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-white/40">{item.symbol}</span>
                      {item.change !== null && (
                        <span className={`text-[10px] font-mono font-bold ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold font-mono text-white">
                      {item.price !== null ? `$${item.price.toFixed(2)}` : "—"}
                    </div>
                    <div className="text-[10px] text-white/30 font-mono mt-1">{item.name}</div>
                    {/* Mini bar */}
                    {item.change !== null && (
                      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.change >= 0 ? "bg-green-500/40" : "bg-red-500/40"}`}
                          style={{ width: `${Math.min(Math.abs(item.change) * 20, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Heat map summary */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 mb-6">
          <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-3">HEAT MAP</div>
          <div className="flex flex-wrap gap-2">
            {macro.map((item) => {
              const intensity = Math.min(Math.abs(item.change || 0) * 30, 100);
              const bg = (item.change || 0) >= 0
                ? `rgba(34,197,94,${intensity / 100 * 0.4})`
                : `rgba(239,68,68,${intensity / 100 * 0.4})`;
              return (
                <div
                  key={item.symbol}
                  className="px-3 py-2 rounded-lg border border-white/[0.04] text-center min-w-[80px]"
                  style={{ backgroundColor: bg }}
                >
                  <div className="text-[10px] font-mono font-bold text-white">{item.symbol}</div>
                  <div className={`text-[10px] font-mono ${(item.change || 0) >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {(item.change || 0) >= 0 ? "+" : ""}{(item.change || 0).toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market News */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest mb-4">MARKET NEWS</div>
          <div className="space-y-2">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all"
              >
                <div className="text-xs text-white/80 font-medium leading-tight line-clamp-2">{article.title}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-white/30 font-mono">{article.source}</span>
                  <span className="text-[10px] text-white/15">|</span>
                  <span className="text-[10px] text-white/30 font-mono">{timeAgo(article.published)}</span>
                  {article.tickers.length > 0 && (
                    <>
                      <span className="text-[10px] text-white/15">|</span>
                      {article.tickers.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">{t}</span>
                      ))}
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
