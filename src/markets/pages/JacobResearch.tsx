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
    <div className="terminal-page min-h-screen bg-[var(--t-bg)] text-[var(--t-text)]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/markets")} className="text-[var(--t-text-muted)] hover:text-[var(--t-text-secondary)] text-xs font-mono transition-colors">
            ← MARKETS
          </button>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight">JACOB</h1>
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono">STOCK RESEARCH ASSISTANT</div>
          </div>
        </div>

        {/* Ticker selector */}
        <div className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-xl p-4 mb-4">
          <div className="text-[14px] text-[var(--t-text-muted)] font-mono uppercase mb-2">WHAT TICKER DO YOU WANT ME TO LOOK AT?</div>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search any ticker or company..."
              className="w-full bg-white/5 border border-[var(--t-border-hover)] rounded-lg px-4 py-3 text-sm font-mono text-[var(--t-text)] placeholder-[var(--t-text-muted)] outline-none focus:border-[var(--t-border-hover)]"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--t-bg-hover)] border border-[var(--t-border-hover)] rounded-lg overflow-hidden z-10">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => selectTicker(r.symbol, r.name)}
                    className="w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-white/5 flex justify-between border-b border-[var(--t-border)] last:border-0"
                  >
                    <span className="text-white font-bold">{r.symbol}</span>
                    <span className="text-[var(--t-text-secondary)] truncate ml-3">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedSymbol && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[14px] text-[var(--t-text-muted)] font-mono">SELECTED:</span>
              <span className="text-xs font-mono font-bold text-[var(--t-text)] bg-white/10 px-2 py-1 rounded">{selectedSymbol}</span>
              <span className="text-xs font-mono text-[var(--t-text-secondary)]">{selectedName}</span>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        {selectedSymbol && !loading && !response && (
          <div className="mb-4">
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono uppercase mb-2">QUICK RESEARCH</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => askJacob(p)}
                  className="text-left px-3 py-2.5 bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-lg text-[14px] font-mono text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:border-white/20 transition-all"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom question */}
        {selectedSymbol && (
          <div className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-xl p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askJacob()}
                placeholder={`Ask Jacob anything about ${selectedSymbol}...`}
                className="flex-1 bg-white/5 border border-[var(--t-border-hover)] rounded-lg px-4 py-2.5 text-xs font-mono text-[var(--t-text)] placeholder-[var(--t-text-muted)] outline-none focus:border-[var(--t-border-hover)]"
              />
              <button
                onClick={() => askJacob()}
                disabled={!question || loading}
                className="px-4 py-2.5 bg-white text-black text-[14px] font-mono font-bold rounded-lg hover:bg-[var(--t-accent)]/90 disabled:bg-white/10 disabled:text-[var(--t-text-muted)] transition-all"
              >
                ASK
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-[var(--t-text-muted)] font-mono">Jacob is researching {selectedSymbol}...</span>
            </div>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-[14px] font-bold text-black">J</span>
              </div>
              <span className="text-[14px] font-mono text-[var(--t-text-secondary)]">JACOB on {selectedSymbol}</span>
            </div>
            <div className="text-sm text-[var(--t-text)] leading-relaxed whitespace-pre-wrap font-mono">
              {response}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(response); }}
                className="px-3 py-1.5 text-[14px] font-mono text-[var(--t-text-muted)] border border-[var(--t-border-hover)] rounded-lg hover:text-[var(--t-text-secondary)] hover:border-white/20 transition-all"
              >
                COPY
              </button>
              <button
                onClick={() => setResponse("")}
                className="px-3 py-1.5 text-[14px] font-mono text-[var(--t-text-muted)] border border-[var(--t-border-hover)] rounded-lg hover:text-[var(--t-text-secondary)] hover:border-white/20 transition-all"
              >
                NEW QUESTION
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-6">
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono uppercase tracking-widest mb-3">PREVIOUS RESEARCH</div>
            <div className="space-y-2">
              {history.slice(0, -1).reverse().map((h, i) => (
                <div key={i} className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-mono font-bold text-[var(--t-text-secondary)]">{h.sym}</span>
                    <span className="text-[13px] font-mono text-[var(--t-text-muted)]">"{h.q}"</span>
                  </div>
                  <div className="text-[14px] text-[var(--t-text-secondary)] font-mono line-clamp-2">{h.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedSymbol && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-10">🧠</div>
            <div className="text-[var(--t-text-muted)] text-xs font-mono mb-1">Search for any ticker above</div>
            <div className="text-[var(--t-text-dim)] text-[14px] font-mono">Jacob will give you the real breakdown — no corporate polish</div>
          </div>
        )}
      </div>
    </div>
  );
}
