import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJacobResearch, searchTickers } from "../data/api";

export default function JacobResearch() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string; sym: string }[]>([]);

  const handleSearch = async (q: string) => {
    setSymbol(q);
    if (q.length < 1) { setSearchResults([]); return; }
    const results = await searchTickers(q);
    setSearchResults(results.slice(0, 5));
  };

  const selectTicker = (sym: string, name: string) => {
    setSelectedSymbol(sym);
    setSelectedName(name);
    setSymbol(sym);
    setSearchResults([]);
  };

  const quickPrompts = [
    "give me the full breakdown",
    "what breaks the thesis?",
    "is it actually cheap right now?",
    "what's the smart money doing?",
    "compare it to its peers",
    "what's priced in vs what's not?",
  ];

  const askJacob = async (q?: string) => {
    const finalQ = q || question;
    if (!selectedSymbol || !finalQ) return;
    setLoading(true);
    setResponse("");
    const data = await fetchJacobResearch(selectedSymbol, selectedName, undefined, undefined, finalQ);
    setResponse(data.response);
    setHistory((prev) => [...prev, { q: finalQ, a: data.response, sym: selectedSymbol }]);
    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/markets")} className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors">
            ← MARKETS
          </button>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight">JACOB</h1>
            <div className="text-[14px] text-white/30 font-mono">STOCK RESEARCH ASSISTANT</div>
          </div>
        </div>

        {/* Ticker selector */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 mb-4">
          <div className="text-[14px] text-white/30 font-mono uppercase mb-2">WHAT TICKER DO YOU WANT ME TO LOOK AT?</div>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search any ticker or company..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/20 outline-none focus:border-white/30"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg overflow-hidden z-10">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => selectTicker(r.symbol, r.name)}
                    className="w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-white/5 flex justify-between border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-white font-bold">{r.symbol}</span>
                    <span className="text-white/40 truncate ml-3">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedSymbol && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[14px] text-white/30 font-mono">SELECTED:</span>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-1 rounded">{selectedSymbol}</span>
              <span className="text-xs font-mono text-white/40">{selectedName}</span>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        {selectedSymbol && !loading && !response && (
          <div className="mb-4">
            <div className="text-[14px] text-white/30 font-mono uppercase mb-2">QUICK RESEARCH</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => askJacob(p)}
                  className="text-left px-3 py-2.5 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-[14px] font-mono text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom question */}
        {selectedSymbol && (
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askJacob()}
                placeholder={`Ask Jacob anything about ${selectedSymbol}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-white/30"
              />
              <button
                onClick={() => askJacob()}
                disabled={!question || loading}
                className="px-4 py-2.5 bg-white text-black text-[14px] font-mono font-bold rounded-lg hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 transition-all"
              >
                ASK
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-white/30 font-mono">Jacob is researching {selectedSymbol}...</span>
            </div>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-[14px] font-bold text-black">J</span>
              </div>
              <span className="text-[14px] font-mono text-white/40">JACOB on {selectedSymbol}</span>
            </div>
            <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-mono">
              {response}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(response); }}
                className="px-3 py-1.5 text-[14px] font-mono text-white/30 border border-white/10 rounded-lg hover:text-white/60 hover:border-white/20 transition-all"
              >
                COPY
              </button>
              <button
                onClick={() => setResponse("")}
                className="px-3 py-1.5 text-[14px] font-mono text-white/30 border border-white/10 rounded-lg hover:text-white/60 hover:border-white/20 transition-all"
              >
                NEW QUESTION
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-6">
            <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-3">PREVIOUS RESEARCH</div>
            <div className="space-y-2">
              {history.slice(0, -1).reverse().map((h, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/[0.04] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-mono font-bold text-white/50">{h.sym}</span>
                    <span className="text-[13px] font-mono text-white/30">"{h.q}"</span>
                  </div>
                  <div className="text-[14px] text-white/40 font-mono line-clamp-2">{h.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedSymbol && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-10">🧠</div>
            <div className="text-white/20 text-xs font-mono mb-1">Search for any ticker above</div>
            <div className="text-white/10 text-[14px] font-mono">Jacob will give you the real breakdown — no corporate polish</div>
          </div>
        )}
      </div>
    </div>
  );
}
