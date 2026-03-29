import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBatchQuotes, searchTickers, formatMarketCap, formatVolume, type DashboardTicker, type SearchResult } from "../data/api";
import { usePortfolio, type PortfolioPosition } from "../data/PortfolioContext";

// ── Helpers ──

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(2)}`;
}

function formatPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

// ── Allocation Bar ──

const ALLOC_COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  "#84cc16", "#e879f9",
];

function AllocationBar({ items }: { items: { symbol: string; pct: number }[] }) {
  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-8 mb-3">
        {items.map((item, i) => (
          <div
            key={item.symbol}
            style={{ width: `${Math.max(item.pct, 1)}%`, backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }}
            className="relative group transition-all hover:opacity-80"
          >
            {item.pct > 8 && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-black/70">
                {item.symbol}
              </span>
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 whitespace-nowrap z-10">
              <span className="text-[11px] font-mono text-white">{item.symbol}</span>
              <span className="text-[11px] font-mono text-white/50 ml-2">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((item, i) => (
          <div key={item.symbol} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
            <span className="text-[11px] font-mono text-white/50">{item.symbol}</span>
            <span className="text-[11px] font-mono text-white/30">{item.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Position Row ──

interface PositionRowProps {
  position: PortfolioPosition;
  liveData?: DashboardTicker;
  onEdit: () => void;
  onRemove: () => void;
  onClick: () => void;
}

function PositionRow({ position, liveData, onEdit, onRemove, onClick }: PositionRowProps) {
  const currentPrice = liveData?.price || 0;
  const marketValue = currentPrice * position.shares;
  const costBasis = position.avgCost * position.shares;
  const pnl = marketValue - costBasis;
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  const dayChange = liveData?.change || 0;
  const isUp = pnl >= 0;
  const dayUp = dayChange >= 0;

  return (
    <div
      className="group bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.10] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 sm:p-5">
        {/* Top row: Symbol + Live Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-mono font-bold text-white">{position.symbol}</span>
            {liveData?.sector && (
              <span className="text-[9px] font-mono text-white/40 bg-white/[0.06] px-1.5 py-0.5 rounded">
                {liveData.sector.toUpperCase()}
              </span>
            )}
            <span className="text-[11px] text-white/25 font-mono truncate max-w-[180px]">
              {liveData?.name || position.symbol}
            </span>
          </div>
          <div className="text-right">
            <div className="text-base font-mono font-semibold text-white tabular-nums">
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-[11px] font-mono tabular-nums ${dayUp ? "text-emerald-400" : "text-red-400"}`}>
              {formatPct(dayChange)}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-widest mb-0.5">SHARES</div>
            <div className="text-sm font-mono text-white tabular-nums">{position.shares.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-widest mb-0.5">AVG COST</div>
            <div className="text-sm font-mono text-white tabular-nums">${position.avgCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-widest mb-0.5">MKT VALUE</div>
            <div className="text-sm font-mono text-white tabular-nums">{formatCurrency(marketValue)}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-white/25 tracking-widest mb-0.5">P&L</div>
            <div className={`text-sm font-mono tabular-nums font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(pnl)} <span className="text-[10px] font-normal">({formatPct(pnlPct)})</span>
            </div>
          </div>
        </div>

        {/* P&L bar */}
        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isUp ? "bg-emerald-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(Math.abs(pnlPct), 100)}%` }}
          />
        </div>

        {/* Action buttons (visible on hover) */}
        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-[10px] font-mono text-white/40 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg px-3 py-1.5 transition-all"
          >
            EDIT
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-[10px] font-mono text-red-400/60 hover:text-red-400 bg-red-500/[0.04] hover:bg-red-500/[0.08] border border-red-500/[0.06] rounded-lg px-3 py-1.5 transition-all"
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Position Modal ──

interface PositionModalProps {
  mode: "add" | "edit";
  initialSymbol?: string;
  initialShares?: number;
  initialAvgCost?: number;
  onSave: (symbol: string, shares: number, avgCost: number) => void;
  onClose: () => void;
}

function PositionModal({ mode, initialSymbol, initialShares, initialAvgCost, onSave, onClose }: PositionModalProps) {
  const [symbol, setSymbol] = useState(initialSymbol || "");
  const [shares, setShares] = useState(initialShares?.toString() || "");
  const [avgCost, setAvgCost] = useState(initialAvgCost?.toString() || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery || mode === "edit") { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchTickers(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, mode]);

  const handleSubmit = () => {
    const s = parseFloat(shares);
    const c = parseFloat(avgCost);
    if (!symbol || isNaN(s) || isNaN(c) || s <= 0 || c <= 0) return;
    onSave(symbol, s, c);
  };

  const isValid = symbol && parseFloat(shares) > 0 && parseFloat(avgCost) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
            {mode === "add" ? "ADD POSITION" : `EDIT ${initialSymbol}`}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ticker search (only for add mode) */}
          {mode === "add" ? (
            <div>
              <label className="text-[10px] font-mono text-white/30 tracking-widest block mb-1.5">TICKER</label>
              {symbol ? (
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                  <span className="text-sm font-mono font-bold text-white">{symbol}</span>
                  <button onClick={() => { setSymbol(""); setSearchQuery(""); }} className="text-[10px] text-white/30 hover:text-white/60 ml-auto">
                    CHANGE
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ticker..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                      {searchResults.map((r) => (
                        <button
                          key={r.symbol}
                          onClick={() => { setSymbol(r.symbol); setSearchQuery(""); setSearchResults([]); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0"
                        >
                          <span className="text-sm font-mono font-semibold text-white">{r.symbol}</span>
                          <span className="text-xs text-white/40 truncate">{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-mono text-white/30 tracking-widest block mb-1.5">TICKER</label>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                <span className="text-sm font-mono font-bold text-white">{initialSymbol}</span>
              </div>
            </div>
          )}

          {/* Shares */}
          <div>
            <label className="text-[10px] font-mono text-white/30 tracking-widest block mb-1.5">SHARES</label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono tabular-nums"
              step="any"
              min="0"
            />
          </div>

          {/* Average Cost */}
          <div>
            <label className="text-[10px] font-mono text-white/30 tracking-widest block mb-1.5">AVG COST PER SHARE</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-mono">$</span>
              <input
                type="number"
                placeholder="e.g. 150.00"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono tabular-nums"
                step="any"
                min="0"
              />
            </div>
          </div>

          {/* Preview */}
          {symbol && parseFloat(shares) > 0 && parseFloat(avgCost) > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
              <div className="text-[9px] font-mono text-white/25 tracking-widest mb-1.5">COST BASIS</div>
              <div className="text-lg font-mono font-semibold text-white tabular-nums">
                {formatCurrency(parseFloat(shares) * parseFloat(avgCost))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-[11px] font-mono text-white/40 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] transition-all">
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex-1 py-3 text-[11px] font-mono rounded-xl transition-all ${
              isValid
                ? "bg-white text-black font-medium hover:bg-white/90"
                : "bg-white/[0.06] text-white/20 cursor-not-allowed"
            }`}
          >
            {mode === "add" ? "ADD POSITION" : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Portfolio Page ──

export default function Portfolio() {
  const navigate = useNavigate();
  const { positions, addPosition, updatePosition, removePosition } = usePortfolio();
  const [liveData, setLiveData] = useState<DashboardTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PortfolioPosition | null>(null);

  // Fetch live prices for all positions
  useEffect(() => {
    if (positions.length === 0) {
      setLiveData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const symbols = positions.map((p) => p.symbol);
        const data = await fetchBatchQuotes(symbols);
        if (!cancelled) setLiveData(data);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [positions]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (positions.length === 0) return;
    const interval = setInterval(async () => {
      try {
        const symbols = positions.map((p) => p.symbol);
        const data = await fetchBatchQuotes(symbols);
        setLiveData(data);
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, [positions]);

  // ── Analytics calculations ──
  const analytics = useMemo(() => {
    const liveMap = new Map(liveData.map((d) => [d.symbol, d]));

    let totalValue = 0;
    let totalCost = 0;
    let totalDayPnl = 0;

    const enriched = positions.map((pos) => {
      const live = liveMap.get(pos.symbol);
      const currentPrice = live?.price || 0;
      const marketValue = currentPrice * pos.shares;
      const costBasis = pos.avgCost * pos.shares;
      const pnl = marketValue - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      const dayChange = live?.change || 0;
      // Day P&L: approximate from % change
      const prevPrice = live?.price && dayChange !== 0 ? live.price / (1 + dayChange / 100) : live?.price || 0;
      const dayPnl = (currentPrice - prevPrice) * pos.shares;

      totalValue += marketValue;
      totalCost += costBasis;
      totalDayPnl += dayPnl;

      return { ...pos, live, currentPrice, marketValue, costBasis, pnl, pnlPct, dayChange, dayPnl };
    });

    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const totalDayPnlPct = totalValue > 0 ? (totalDayPnl / (totalValue - totalDayPnl)) * 100 : 0;

    // Allocation
    const allocation = enriched
      .map((e) => ({ symbol: e.symbol, pct: totalValue > 0 ? (e.marketValue / totalValue) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct);

    // Best & worst performers
    const sorted = [...enriched].sort((a, b) => b.pnlPct - a.pnlPct);
    const bestPerformer = sorted[0] || null;
    const worstPerformer = sorted[sorted.length - 1] || null;

    // Sector breakdown
    const sectorMap = new Map<string, number>();
    enriched.forEach((e) => {
      const sector = e.live?.sector || "Other";
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + e.marketValue);
    });
    const sectors = Array.from(sectorMap.entries())
      .map(([name, value]) => ({ name, pct: totalValue > 0 ? (value / totalValue) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct);

    return { enriched, totalValue, totalCost, totalPnl, totalPnlPct, totalDayPnl, totalDayPnlPct, allocation, bestPerformer, worstPerformer, sectors };
  }, [positions, liveData]);

  const getLiveData = (symbol: string) => liveData.find((d) => d.symbol === symbol);

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Portfolio
                </h1>
                {!loading && positions.length > 0 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/30 font-mono tracking-widest">POSITION TRACKER</p>
            </div>
            <button onClick={() => navigate("/markets")} className="text-[11px] text-white/30 hover:text-white/60 font-mono tracking-wide transition-colors">
              ← MARKETS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* Portfolio Summary Cards */}
        {positions.length > 0 && !loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {/* Total Value */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[9px] text-white/25 font-mono tracking-widest mb-1">TOTAL VALUE</div>
                <div className="text-xl font-semibold text-white tabular-nums font-mono">{formatCurrency(analytics.totalValue)}</div>
              </div>
              {/* Total P&L */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[9px] text-white/25 font-mono tracking-widest mb-1">TOTAL P&L</div>
                <div className={`text-xl font-semibold tabular-nums font-mono ${analytics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(analytics.totalPnl)}
                </div>
                <div className={`text-[10px] font-mono tabular-nums ${analytics.totalPnl >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                  {formatPct(analytics.totalPnlPct)}
                </div>
              </div>
              {/* Day P&L */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[9px] text-white/25 font-mono tracking-widest mb-1">TODAY</div>
                <div className={`text-xl font-semibold tabular-nums font-mono ${analytics.totalDayPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(analytics.totalDayPnl)}
                </div>
                <div className={`text-[10px] font-mono tabular-nums ${analytics.totalDayPnl >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                  {formatPct(analytics.totalDayPnlPct)}
                </div>
              </div>
              {/* Cost Basis */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <div className="text-[9px] text-white/25 font-mono tracking-widest mb-1">COST BASIS</div>
                <div className="text-xl font-semibold text-white tabular-nums font-mono">{formatCurrency(analytics.totalCost)}</div>
                <div className="text-[10px] font-mono text-white/30 tabular-nums">{positions.length} position{positions.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Allocation Bar */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
              <div className="text-[10px] font-mono text-white/30 tracking-widest mb-3">ALLOCATION</div>
              <AllocationBar items={analytics.allocation} />
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/* Best Performer */}
              {analytics.bestPerformer && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="text-[9px] font-mono text-emerald-400/50 tracking-widest mb-2">BEST PERFORMER</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-white">{analytics.bestPerformer.symbol}</span>
                    <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">{formatPct(analytics.bestPerformer.pnlPct)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-white/30 mt-0.5">
                    P&L: {formatCurrency(analytics.bestPerformer.pnl)}
                  </div>
                </div>
              )}
              {/* Worst Performer */}
              {analytics.worstPerformer && positions.length > 1 && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="text-[9px] font-mono text-red-400/50 tracking-widest mb-2">WORST PERFORMER</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-white">{analytics.worstPerformer.symbol}</span>
                    <span className="text-sm font-mono font-semibold text-red-400 tabular-nums">{formatPct(analytics.worstPerformer.pnlPct)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-white/30 mt-0.5">
                    P&L: {formatCurrency(analytics.worstPerformer.pnl)}
                  </div>
                </div>
              )}
              {/* Sector Breakdown */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[9px] font-mono text-white/25 tracking-widest mb-2">SECTORS</div>
                <div className="space-y-1.5">
                  {analytics.sectors.slice(0, 4).map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-white/50">{s.name}</span>
                      <span className="text-[11px] font-mono text-white/30 tabular-nums">{s.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Positions Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-mono text-white/30 tracking-widest">YOUR POSITIONS</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3 py-2 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            ADD POSITION
          </button>
        </div>

        {/* Empty State */}
        {!loading && positions.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-xl">
            <svg className="w-10 h-10 mx-auto mb-3 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-sm text-white/25 font-mono mb-1">No positions yet</p>
            <p className="text-[11px] text-white/15 font-mono mb-4">Add your first position to start tracking your portfolio</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[11px] font-mono text-black bg-white hover:bg-white/90 rounded-lg px-4 py-2 transition-all"
            >
              + ADD YOUR FIRST POSITION
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && positions.length > 0 && (
          <div className="space-y-2">
            {positions.map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-20 bg-white/[0.06] rounded" />
                  <div className="h-5 w-24 bg-white/[0.06] rounded" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-3 w-12 bg-white/[0.04] rounded mb-1" />
                      <div className="h-4 w-16 bg-white/[0.06] rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Position List */}
        {!loading && positions.length > 0 && (
          <div className="space-y-2">
            {analytics.enriched
              .sort((a, b) => b.marketValue - a.marketValue)
              .map((pos) => (
                <PositionRow
                  key={pos.symbol}
                  position={pos}
                  liveData={getLiveData(pos.symbol)}
                  onEdit={() => setEditingPosition(pos)}
                  onRemove={() => removePosition(pos.symbol)}
                  onClick={() => navigate(`/markets/ticker/${pos.symbol}`)}
                />
              ))}
          </div>
        )}

        <div className="text-center mt-12 pb-6">
          <p className="text-[10px] text-white/15 font-mono tracking-wider">
            Live data via Massive API · Portfolio stored locally
          </p>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <PositionModal
          mode="add"
          onSave={(symbol, shares, avgCost) => {
            addPosition(symbol, shares, avgCost);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Position Modal */}
      {editingPosition && (
        <PositionModal
          mode="edit"
          initialSymbol={editingPosition.symbol}
          initialShares={editingPosition.shares}
          initialAvgCost={editingPosition.avgCost}
          onSave={(symbol, shares, avgCost) => {
            updatePosition(symbol, shares, avgCost);
            setEditingPosition(null);
          }}
          onClose={() => setEditingPosition(null)}
        />
      )}
    </div>
  );
}
