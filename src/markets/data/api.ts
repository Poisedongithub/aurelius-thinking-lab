// Markets API service — 100% live data from Google Finance + Polygon + DeepSeek AI
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

// ── Chart Types ──

export interface ChartBar {
  t: number; // timestamp ms
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y";

// ── News Types ──

export interface NewsArticle {
  id: string;
  title: string;
  author: string;
  published: string;
  url: string;
  source: string;
  image: string;
  description: string;
  tickers: string[];
}

// ── Earnings Types ──

export interface EarningsData {
  period: string;
  year: number;
  reportDate: string;
  filingDate: string;
  revenue: number | null;
  netIncome: number | null;
  eps: number | null;
  grossProfit: number | null;
}

// ── Options Types ──

export interface OptionsContract {
  ticker: string;
  type: string;
  strike: number;
  expiration: string;
  style: string;
  shares: number;
}

export interface OptionsSummary {
  totalContracts: number;
  calls: number;
  puts: number;
  putCallRatio: string;
}

// ── Screener Types ──

export interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number | null;
  sector: string;
  industry: string;
}

// ── Macro Types ──

export interface MacroItem {
  symbol: string;
  name: string;
  category: string;
  price: number | null;
  change: number | null;
  dayHigh: number | null;
  dayLow: number | null;
}

// ── Comparison Types ──

export interface ComparisonTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number | null;
  marketCapFormatted?: string;
  yearHigh: number | null;
  yearLow: number | null;
  sector: string;
  industry: string;
}

// ── Mover Types ──

export interface MoverTicker {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  prevClose: number;
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

// ── Feature 1: Chart Data ──

export async function fetchChartData(symbol: string, range: ChartRange = "1M"): Promise<ChartBar[]> {
  try {
    const res = await fetch(`${API_BASE}/chart/${encodeURIComponent(symbol)}?range=${range}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.chart || [];
  } catch {
    return [];
  }
}

// ── Feature 2: News ──

export async function fetchTickerNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/news/ticker/${encodeURIComponent(symbol)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.news || [];
  } catch {
    return [];
  }
}

export async function fetchMarketNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/news`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.news || [];
  } catch {
    return [];
  }
}

// ── Feature 3: Earnings ──

export async function fetchEarnings(symbol: string): Promise<EarningsData[]> {
  try {
    const res = await fetch(`${API_BASE}/earnings/${encodeURIComponent(symbol)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.financials || [];
  } catch {
    return [];
  }
}

// ── Feature 4: Screener ──

export async function fetchScreener(params: {
  sector?: string;
  marketCapMin?: number;
  marketCapMax?: number;
  sort?: string;
  order?: string;
  limit?: number;
}): Promise<ScreenerResult[]> {
  try {
    const query = new URLSearchParams();
    if (params.sector) query.set("sector", params.sector);
    if (params.marketCapMin) query.set("marketCapMin", String(params.marketCapMin));
    if (params.marketCapMax) query.set("marketCapMax", String(params.marketCapMax));
    if (params.sort) query.set("sort", params.sort);
    if (params.order) query.set("order", params.order);
    if (params.limit) query.set("limit", String(params.limit));
    const res = await fetch(`${API_BASE}/screener?${query.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

// ── Feature 5: Movers ──

export async function fetchMovers(direction: "gainers" | "losers"): Promise<MoverTicker[]> {
  try {
    const res = await fetch(`${API_BASE}/movers/${direction}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tickers || [];
  } catch {
    return [];
  }
}

// ── Feature 6: Options ──

export async function fetchOptions(symbol: string): Promise<{ summary: OptionsSummary; contracts: OptionsContract[] }> {
  try {
    const res = await fetch(`${API_BASE}/options/${encodeURIComponent(symbol)}`);
    if (!res.ok) return { summary: { totalContracts: 0, calls: 0, puts: 0, putCallRatio: "N/A" }, contracts: [] };
    const data = await res.json();
    return { summary: data.summary || {}, contracts: data.contracts || [] };
  } catch {
    return { summary: { totalContracts: 0, calls: 0, puts: 0, putCallRatio: "N/A" }, contracts: [] };
  }
}

// ── Feature 7: Peer Comparison ──

export async function fetchComparison(symbols: string[]): Promise<ComparisonTicker[]> {
  try {
    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.comparisons || [];
  } catch {
    return [];
  }
}

// ── Feature 8: Jacob Research ──

export async function fetchJacobResearch(
  symbol: string, name?: string, price?: number, change?: number, question?: string
): Promise<{ response: string; liveData: Record<string, unknown> }> {
  try {
    const res = await fetch(`${API_BASE}/jacob-research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change, question }),
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { response: "something went wrong. try again.", liveData: {} };
  }
}

// ── Feature 9: Share Card ──

export async function generateShareCard(type: string, data: Record<string, unknown>): Promise<{ shareId: string }> {
  try {
    const res = await fetch(`${API_BASE}/share-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { shareId: "" };
  }
}

// ── Feature 10: Macro Dashboard ──

export async function fetchMacroData(): Promise<MacroItem[]> {
  try {
    const res = await fetch(`${API_BASE}/macro`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.macro || [];
  } catch {
    return [];
  }
}

// ── Default Watchlist ──
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

export function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
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
