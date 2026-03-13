import { useParams, useNavigate } from "react-router-dom";
import { getThemeAnalysis, getTickerAnalysis } from "../data/mockData";
import { SectionCard, Tag, ScoreBar, EmptyState } from "../components/MarketComponents";

export default function ThemeAnalysis() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const theme = getThemeAnalysis(themeId || "");

  if (!theme) return <EmptyState message="Theme not found" />;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button onClick={() => navigate("/markets")} className="text-xs text-gray-400 hover:text-gray-600 font-mono mb-3 block">← DASHBOARD</button>
          <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>{theme.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
        {/* Chain Map */}
        <SectionCard title="Value Chain Map">
          <div className="space-y-2 pt-3">
            {theme.chainNodes.map((node) => (
              <div key={node.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.nodeType === "bottleneck" ? "bg-red-500" : node.nodeType === "end_demand" ? "bg-blue-500" : node.nodeType === "platform" ? "bg-purple-500" : "bg-gray-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{node.name}</span>
                    <Tag label={node.nodeType.replace("_", " ")} color={node.nodeType === "bottleneck" ? "red" : "gray"} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{node.role}</p>
                  {node.tickers && (
                    <div className="flex gap-1 mt-1">
                      {node.tickers.map((t) => (
                        <button key={t} onClick={() => navigate(`/markets/ticker/${t}`)} className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors">{t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Candidate Stocks Ranked */}
        <SectionCard title="Candidate Stocks — Leverage Ranked">
          <div className="space-y-3 pt-3">
            {theme.candidateStocks
              .sort((a, b) => b.leverageScore - a.leverageScore)
              .map((stock, i) => {
                const data = getTickerAnalysis(stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => navigate(`/markets/ticker/${stock.symbol}`)}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-mono">{i + 1}</span>
                        <span className="text-base font-semibold font-mono text-gray-900">{stock.symbol}</span>
                        {data && <span className="text-xs text-gray-400">{data.name}</span>}
                      </div>
                      {data && (
                        <span className="text-sm font-mono font-semibold text-gray-900">{data.processScore.total}/100</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{stock.role}</p>
                    <ScoreBar label="Leverage" value={stock.leverageScore} max={100} color={stock.leverageScore >= 80 ? "#059669" : stock.leverageScore >= 60 ? "#d97706" : "#dc2626"} />
                  </div>
                );
              })}
          </div>
        </SectionCard>

        {/* Summary */}
        <SectionCard title="Theme Summary">
          <p className="text-sm text-gray-700 leading-relaxed pt-3">{theme.summary}</p>
        </SectionCard>
      </div>
    </div>
  );
}
