import { useState, useRef, useEffect } from "react";
import { sendJacobMessage, type JacobMessage } from "../data/api";

interface JacobChatProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export default function JacobChat({ symbol, name, price, change }: JacobChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<JacobMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: JacobMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendJacobMessage(newMessages, symbol, name, price, change);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "something went wrong. try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed state — floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
        title="Talk to Jacob"
      >
        <div className="flex flex-col items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[7px] font-mono font-bold tracking-wider mt-0.5">JACOB</span>
        </div>
      </button>
    );
  }

  // Open state — chat panel
  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] sm:bottom-6 sm:right-6 flex flex-col bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: "min(600px, 80vh)" }}>
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-mono font-bold">J</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Jacob</span>
              <span className="text-[9px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">STOCK ANALYST</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              talking about {symbol}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50" style={{ minHeight: "200px" }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-mono font-bold text-gray-500">J</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">ask me anything about {symbol}</p>
            <p className="text-[10px] text-gray-400 font-mono">i'll give you the real take, not the polished one</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                `should i buy ${symbol} here`,
                `what breaks the thesis`,
                `is it actually cheap`,
                `give me the full breakdown`,
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-[9px] font-mono text-gray-400 block mb-1">jacob</span>
              )}
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant" ? "font-normal" : ""
              }`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <span className="text-[9px] font-mono text-gray-400 block mb-1">jacob</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`ask jacob about ${symbol}...`}
            className="flex-1 text-sm bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
