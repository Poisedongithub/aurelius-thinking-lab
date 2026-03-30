import { useState, useEffect, useRef } from "react";
import { fetchChartData, ChartBar, ChartRange } from "../data/api";

interface PriceChartProps {
  symbol: string;
  currentPrice?: number;
  change?: number;
}

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

export default function PriceChart({ symbol, currentPrice, change }: PriceChartProps) {
  const [range, setRange] = useState<ChartRange>("1M");
  const [data, setData] = useState<ChartBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchChartData(symbol, range).then((bars) => {
      setData(bars);
      setLoading(false);
    });
  }, [symbol, range]);

  useEffect(() => {
    drawChart();
  }, [data, hoveredBar]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const closes = data.map((d) => d.c);
    const minPrice = Math.min(...closes) * 0.998;
    const maxPrice = Math.max(...closes) * 1.002;
    const priceRange = maxPrice - minPrice || 1;

    const isPositive = data.length > 1 ? data[data.length - 1].c >= data[0].c : (change || 0) >= 0;
    const lineColor = isPositive ? "#22c55e" : "#ef4444";
    const fillColor = isPositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 4) * i;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`$${price.toFixed(2)}`, w - padding.right + 5, y + 3);
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    data.forEach((bar, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + ((maxPrice - bar.c) / priceRange) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill area
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Hover crosshair
    if (hoveredBar && hoverX !== null) {
      const idx = Math.round(((hoverX - padding.left) / chartW) * (data.length - 1));
      if (idx >= 0 && idx < data.length) {
        const bar = data[idx];
        const x = padding.left + (idx / (data.length - 1)) * chartW;
        const y = padding.top + ((maxPrice - bar.c) / priceRange) * chartH;

        // Vertical line
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Date labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    const labelCount = Math.min(5, data.length);
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const bar = data[idx];
      const x = padding.left + (idx / (data.length - 1)) * chartW;
      const date = new Date(bar.t);
      const label = range === "1D" || range === "1W"
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
      ctx.fillText(label, x, h - 5);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;
    const x = e.clientX - rect.left;
    const padding = { left: 10, right: 60 };
    const chartW = rect.width - padding.left - padding.right;
    const idx = Math.round(((x - padding.left) / chartW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      setHoveredBar(data[idx]);
      setHoverX(x);
    }
  };

  const displayPrice = hoveredBar ? hoveredBar.c : currentPrice;
  const displayChange = hoveredBar && data.length > 0
    ? ((hoveredBar.c - data[0].c) / data[0].c * 100)
    : change;

  return (
    <div className="bg-[var(--t-bg-elevated)] border border-[var(--t-border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-[var(--t-text)] font-mono">
              ${displayPrice?.toFixed(2) || "—"}
            </span>
            {displayChange !== undefined && (
              <span className={`text-sm font-mono ${displayChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {displayChange >= 0 ? "+" : ""}{displayChange.toFixed(2)}%
              </span>
            )}
          </div>
          {hoveredBar && (
            <div className="text-[14px] text-[var(--t-text-muted)] font-mono mt-1">
              O: ${hoveredBar.o.toFixed(2)} H: ${hoveredBar.h.toFixed(2)} L: ${hoveredBar.l.toFixed(2)} V: {(hoveredBar.v / 1e6).toFixed(1)}M
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-[14px] font-mono rounded transition-all ${
                range === r
                  ? "bg-white text-black font-bold"
                  : "text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="relative px-0">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-[var(--t-text-muted)] text-xs font-mono">Loading chart...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-[var(--t-text-muted)] text-xs font-mono">No chart data available</div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setHoveredBar(null); setHoverX(null); }}
          />
        )}
      </div>
    </div>
  );
}
