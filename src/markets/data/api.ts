// Markets API service — 100% live data from Yahoo Finance + DeepSeek AI
// Every ticker gets live prices and AI-generated analysis

const API_BASE = "/api/markets";

// ── Types ──

export interface LiveQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  sector?: string;
  industry?: string;
  description?: string;
  ceo?: string;
  website?: string;
  image?: string;
  performance?: Record<string, number | null>;
  chart?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
}

export interface DashboardTicker {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number | null;
  sector: string;
  industry: string;
  yearHigh: number | null;
  yearLow: number | null;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
}

export interface AIAnalysis {
  attentionTrigger?: { triggers?: string[]; summary?: string; whyNow?: string };
  whatMoved?: { summary?: string; catalysts?: Array<{ title: string; description: string; impact: number }> };
  industryChain?: { summary?: string; nodes?: Array<{ name: string; role: string; tickers?: string[] }>; bottlenecks?: string[] };
  leveragePoint?: { score?: number; summary?: string; tags?: string[]; bestLeverageType?: string };
  peerReadthrough?: { peers?: Array<{ ticker: string; name: string; signal: string; quote: string; implication: string; date: string }> };
  followMoney?: { score?: number; type?: string; summary?: string; signals?: Array<{ type: string; strength: string; description: string; amount?: string }> };
  companyNumbers?: { metrics?: Record<string, string>; summary?: string };
  segments?: { segments?: Array<{ name: string; status: string; role: string; description: string; importance: number }> };
  contracts?: { score?: number; summary?: string; contracts?: Array<{ customer: string; status: string; description: string }> };
  valuation?: { multiples?: Record<string, string>; assessment?: string; summary?: string; vsHistory?: string; vsPeers?: string };
  ownership?: { institutional?: string; shortInterest?: string; crowding?: string; sentiment?: string; summary?: string };
  thesis?: { summary?: string; bullCase?: string; bearCase?: string; whatChangesIt?: string; watchItems?: string[] };
  processScore?: { totalScore?: number; conviction?: string; breakdown?: Record<string, number> };
  evidence?: { sources?: Array<{ type: string; title: string; source: string; date: string; summary: string }> };
  parseError?: boolean;
  raw?: string;
}

// ── API Calls ──

export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/quote/${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchBatchQuotes(symbols: string[]): Promise<DashboardTicker[]> {
  try {
    const res = await fetch(`${API_BASE}/batch?symbols=${symbols.join(",")}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.quotes || []).map((q: Record<string, unknown>) => ({
      symbol: q.symbol as string,
      name: q.name as string || q.symbol as string,
      exchange: q.exchange as string || "",
      price: q.price as number || 0,
      change: q.change as number || 0,
      volume: q.volume as number || 0,
      marketCap: q.marketCap as number || 0,
      sector: q.sector as string || "",
      industry: q.industry as string || "",
      yearHigh: q.yearHigh as number || 0,
      yearLow: q.yearLow as number || 0,
    }));
  } catch {
    return [];
  }
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchSectionAnalysis(
  symbol: string, name: string, price: number, change: number, section: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change, section }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.analysis || null;
  } catch {
    return null;
  }
}

export async function fetchFullAnalysis(
  symbol: string, name: string, price: number, change: number
): Promise<AIAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/full-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.analysis || null;
  } catch {
    return null;
  }
}

// ── Default Watchlist ──
// These are the default tickers shown on the dashboard
export const DEFAULT_WATCHLIST = [
  "NVDA", "AVGO", "CIEN", "META", "MELI", "CAT",
];

// ── Helpers ──

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap}`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return `${vol}`;
}

// ── Jacob AI Chat ──

export interface JacobMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendJacobMessage(
  messages: JacobMessage[],
  symbol?: string,
  name?: string,
  price?: number,
  change?: number
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/jacob`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, symbol, name, price, change }),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.response || "";
  } catch {
    return "something went wrong. try again.";
  }
}
