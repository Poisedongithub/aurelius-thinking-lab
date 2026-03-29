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

// ══════════════════════════════════════════════════════════════
// NEW ANALYSIS API FUNCTIONS
// ══════════════════════════════════════════════════════════════

// ── Dividends ──
export interface Dividend {
  cashAmount: number;
  currency: string;
  declarationDate: string;
  exDividendDate: string;
  payDate: string;
  recordDate: string;
  frequency: number;
  type: string;
}

export interface DividendData {
  dividends: Dividend[];
  annualDividend: number;
  count: number;
}

export async function fetchDividends(symbol: string): Promise<DividendData> {
  try {
    const res = await fetch(`${API_BASE}/dividends/${symbol}`);
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { dividends: [], annualDividend: 0, count: 0 };
  }
}

// ── Stock Splits ──
export interface StockSplit {
  executionDate: string;
  splitFrom: number;
  splitTo: number;
  ratio: string;
}

export async function fetchSplits(symbol: string): Promise<{ splits: StockSplit[] }> {
  try {
    const res = await fetch(`${API_BASE}/splits/${symbol}`);
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { splits: [] };
  }
}

// ── Related Companies ──
export interface RelatedCompany {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
}

export async function fetchRelated(symbol: string): Promise<{ related: RelatedCompany[] }> {
  try {
    const res = await fetch(`${API_BASE}/related/${symbol}`);
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { related: [] };
  }
}

// ── Enhanced Company Details ──
export interface CompanyDetails {
  symbol: string;
  name: string;
  description: string;
  marketCap: number | null;
  exchange: string;
  sector: string;
  industry: string;
  address: { address1?: string; city?: string; state?: string; postal_code?: string };
  phone: string;
  homepageUrl: string;
  totalEmployees: number | null;
  listDate: string;
  sicCode: string;
  sicDescription: string;
  weightedSharesOutstanding: number | null;
  shareClassSharesOutstanding: number | null;
  price: number | null;
  change: number | null;
  volume: string | null;
  yearHigh: string | null;
  yearLow: string | null;
  dayHigh: string | null;
  dayLow: string | null;
  previousClose: string | null;
}

export async function fetchDetails(symbol: string): Promise<CompanyDetails | null> {
  try {
    const res = await fetch(`${API_BASE}/details/${symbol}`);
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return null;
  }
}

// ── AI Insider Analysis ──
export interface InsiderTransaction {
  name: string;
  title: string;
  type: string;
  shares: number;
  pricePerShare: number;
  totalValue: string;
  date: string;
}

export interface InsiderAnalysis {
  summary: string;
  sentiment: string;
  recentTransactions: InsiderTransaction[];
  institutionalOwnership: string;
  insiderOwnership: string;
  keyInsights: string[];
  shortInterest: { sharesShort: string; shortRatio: string; percentOfFloat: string };
}

export async function fetchInsiderAnalysis(symbol: string, name: string, price: number, change: number): Promise<InsiderAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/ai-insiders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change }),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.analysis;
  } catch {
    return null;
  }
}

// ── AI Analyst Ratings ──
export interface AnalystRating {
  analyst: string;
  rating: string;
  priceTarget: number;
  date: string;
  action: string;
}

export interface AnalystAnalysis {
  consensus: string;
  averagePriceTarget: number;
  highPriceTarget: number;
  lowPriceTarget: number;
  numberOfAnalysts: number;
  ratingBreakdown: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
  recentRatings: AnalystRating[];
  summary: string;
  upside: string;
}

export async function fetchAnalystRatings(symbol: string, name: string, price: number, change: number): Promise<AnalystAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/ai-analyst`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change }),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.analysis;
  } catch {
    return null;
  }
}

// ── AI Risk Analysis ──
export interface RiskFactor {
  category: string;
  severity: string;
  description: string;
}

export interface RiskAnalysis {
  overallRisk: string;
  riskScore: number;
  volatility: { beta: number; standardDeviation: string; maxDrawdown: string; sharpeRatio: number };
  risks: RiskFactor[];
  supportLevels: number[];
  resistanceLevels: number[];
  summary: string;
}

export async function fetchRiskAnalysis(symbol: string, name: string, price: number, change: number): Promise<RiskAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/ai-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, name, price, change }),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.analysis;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
// 30 NEW RESEARCH & ANALYSIS API FUNCTIONS
// ══════════════════════════════════════════════════════════════

// Helper for AI POST calls
async function aiPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.analysis as T;
  } catch { return null; }
}

// 1. Thesis Builder
export interface ThesisAnalysis {
  bullCase: string; bearCase: string; catalysts: string[]; risks: string[];
  keyMetrics: string[]; conviction: string; timeHorizon: string;
  priceTarget: number; summary: string; whatChangesThesis: string;
}
export const fetchThesis = (s: string, n: string, p: number, c: number, t?: string) =>
  aiPost<ThesisAnalysis>("ai-thesis", { symbol: s, name: n, price: p, change: c, existingThesis: t });

// 2. Valuation Models
export interface ValuationAnalysis {
  dcf: { fairValue: number; upside: string; assumptions: Record<string, string>; sensitivity: Array<{ wacc: string; value: number }> };
  comparables: Record<string, { current: number; sectorAvg: number; verdict: string }>;
  historicalValuation: { fiveYrAvgPE: number; currentVsAvg: string; percentileRank: string };
  verdict: string; summary: string;
}
export const fetchValuation = (s: string, n: string, p: number, mc?: string) =>
  aiPost<ValuationAnalysis>("ai-valuation", { symbol: s, name: n, price: p, marketCap: mc });

// 3. Moat Analysis
export interface MoatSource { type: string; strength: string; evidence: string; score: number; }
export interface MoatAnalysis {
  moatRating: string; moatScore: number; sources: MoatSource[];
  moatTrend: string; durability: string; threats: string[]; summary: string;
}
export const fetchMoat = (s: string, n: string, p: number) =>
  aiPost<MoatAnalysis>("ai-moat", { symbol: s, name: n, price: p });

// 4. Management Scorecard
export interface ManagementAnalysis {
  overallGrade: string;
  ceo: { name: string; tenure: string; background: string; rating: string };
  capitalAllocation: Record<string, string>;
  execution: Record<string, string>;
  compensation: Record<string, string>;
  redFlags: string[]; greenFlags: string[]; summary: string;
}
export const fetchManagement = (s: string, n: string) =>
  aiPost<ManagementAnalysis>("ai-management", { symbol: s, name: n });

// 5. Bull vs Bear
export interface BullBearArgument { point: string; evidence: string; strength: number; }
export interface BullBearAnalysis {
  bullCase: { headline: string; arguments: BullBearArgument[]; priceTarget: number; timeframe: string; confidence: number };
  bearCase: { headline: string; arguments: BullBearArgument[]; priceTarget: number; timeframe: string; confidence: number };
  verdict: string; keyQuestion: string;
}
export const fetchBullBear = (s: string, n: string, p: number, c: number) =>
  aiPost<BullBearAnalysis>("ai-bull-bear", { symbol: s, name: n, price: p, change: c });

// 6. Revenue Breakdown
export interface RevenueSegment { name: string; revenue: string; percentage: number; growth: string; trend: string; }
export interface RevenueAnalysis {
  totalRevenue: string; revenueGrowth: string; segments: RevenueSegment[];
  geographicBreakdown: Array<{ region: string; percentage: number }>;
  topCustomers: string[]; concentrationRisk: string; summary: string;
}
export const fetchRevenue = (s: string, n: string) =>
  aiPost<RevenueAnalysis>("ai-revenue", { symbol: s, name: n });

// 7. Competitive Landscape
export interface Competitor { name: string; ticker: string; marketShare: string; threat: string; advantage: string; weakness: string; }
export interface CompetitiveAnalysis {
  marketPosition: string; marketShare: string; totalAddressableMarket: string;
  competitors: Competitor[]; competitiveAdvantages: string[];
  vulnerabilities: string[]; industryTrends: string[]; summary: string;
}
export const fetchCompetitive = (s: string, n: string) =>
  aiPost<CompetitiveAnalysis>("ai-competitive", { symbol: s, name: n });

// 8. Financial Health
export interface HealthMetric { value: number | string; status: string; benchmark: string; }
export interface FinancialHealthAnalysis {
  overallScore: number; grade: string;
  altmanZScore: { score: number; interpretation: string };
  piotroskiFScore: { score: number; interpretation: string };
  metrics: Record<string, HealthMetric>;
  cashPosition: string; totalDebt: string; netCash: string; summary: string;
}
export const fetchFinancialHealth = (s: string, n: string, p: number) =>
  aiPost<FinancialHealthAnalysis>("ai-financial-health", { symbol: s, name: n, price: p });

// 9. Capital Allocation
export interface AllocationItem { category: string; amount: string; percentage: number; trend: string; effectiveness: string; }
export interface CapitalAllocationAnalysis {
  grade: string; totalCapitalDeployed: string; allocation: AllocationItem[];
  roic: string; roicVsWacc: string; valueCreation: string; summary: string;
}
export const fetchCapitalAllocation = (s: string, n: string) =>
  aiPost<CapitalAllocationAnalysis>("ai-capital-allocation", { symbol: s, name: n });

// 10. Guidance Tracker
export interface GuidanceRecord { quarter: string; metricType: string; guided: string; actual: string; result: string; surprise: string; }
export interface GuidanceAnalysis {
  currentGuidance: Record<string, string>;
  guidanceHistory: GuidanceRecord[];
  beatRate: string; avgSurprise: string; managementCredibility: string;
  guidanceTrend: string; nextEarningsDate: string; summary: string;
}
export const fetchGuidance = (s: string, n: string) =>
  aiPost<GuidanceAnalysis>("ai-guidance", { symbol: s, name: n });

// 11. Industry Research
export interface IndustryPlayer { name: string; ticker: string; role: string; share: string; }
export interface IndustryAnalysis {
  industryName: string; marketSize: string; projectedSize: string; cagr: string; stage: string;
  keyPlayers: IndustryPlayer[];
  secularTrends: Array<{ trend: string; impact: string; timeline: string }>;
  risks: Array<{ risk: string; severity: string; description: string }>;
  outlook: string; summary: string;
}
export const fetchIndustry = (s: string, n: string, ind?: string) =>
  aiPost<IndustryAnalysis>("ai-industry", { symbol: s, name: n, industry: ind });

// 12. Sector Rotation
export interface SectorRanking { sector: string; flow: string; strength: number; trend: string; etf: string; }
export interface SectorRotationAnalysis {
  currentRegime: string; sectorRankings: SectorRanking[];
  rotationSignal: string; summary: string;
}
export const fetchSectorRotation = () =>
  aiPost<SectorRotationAnalysis>("ai-sector-rotation", {});

// 13. IPO Tracker
export interface IPOEntry { company: string; ticker: string; expectedDate?: string; ipoDate?: string; sector: string; valuation?: string; ipoPrice?: number; currentPrice?: number; return?: string; description?: string; }
export interface IPOAnalysis {
  upcoming: IPOEntry[]; recent: IPOEntry[];
  marketConditions: string; ipoWindow: string; summary: string;
}
export const fetchIPOTracker = () =>
  aiPost<IPOAnalysis>("ai-ipo-tracker", {});

// 14. M&A Activity
export interface MADeal { acquirer: string; target: string; value: string; premium: string; status: string; date: string; sector: string; rationale: string; }
export interface MAAnalysis {
  recentDeals: MADeal[]; sectorActivity: string; avgPremium: string;
  trends: string[]; potentialTargets: Array<{ company: string; ticker: string; reason: string }>;
  summary: string;
}
export const fetchMAActivity = (s?: string, n?: string) =>
  aiPost<MAAnalysis>("ai-ma-activity", { symbol: s, name: n });

// 15. Regulatory Monitor
export interface RegulatoryIssue { issue: string; agency: string; status: string; impact: string; description: string; timeline: string; }
export interface RegulatoryAnalysis {
  riskLevel: string; activeIssues: RegulatoryIssue[];
  upcomingRegulations: Array<{ regulation: string; impact: string; effectiveDate: string }>;
  politicalRisks: string[]; complianceCosts: string; summary: string;
}
export const fetchRegulatory = (s: string, n: string) =>
  aiPost<RegulatoryAnalysis>("ai-regulatory", { symbol: s, name: n });

// 16. Institutional Ownership
export interface InstitutionalHolder { name: string; shares: string; percentage: string; change: string; changeType: string; }
export interface InstitutionalAnalysis {
  institutionalOwnership: string; topHolders: InstitutionalHolder[];
  recentChanges: { netBuying: boolean; buyersCount: number; sellersCount: number; netShares: string };
  concentration: string; smartMoneySignal: string; summary: string;
}
export const fetchInstitutional = (s: string, n: string) =>
  aiPost<InstitutionalAnalysis>("ai-institutional", { symbol: s, name: n });

// 17. ETF Exposure
export interface ETFHolding { name: string; ticker: string; weight: string; shares: string; aum: string; }
export interface ETFExposureAnalysis {
  totalETFsHolding: number; totalETFOwnership: string; topETFs: ETFHolding[];
  passiveFlowImpact: string; rebalanceRisk: string; summary: string;
}
export const fetchETFExposure = (s: string, n: string) =>
  aiPost<ETFExposureAnalysis>("ai-etf-exposure", { symbol: s, name: n });

// 18. Activist Tracker
export interface ActivistEntry { investor: string; stake: string; position: string; demands: string[]; filingDate: string; outcome: string; }
export interface ActivistAnalysis {
  activeActivists: ActivistEntry[];
  historicalActivism: Array<{ investor: string; year: number; outcome: string; stockImpact: string }>;
  activistRisk: string; vulnerabilities: string[]; summary: string;
}
export const fetchActivist = (s: string, n: string) =>
  aiPost<ActivistAnalysis>("ai-activist", { symbol: s, name: n });

// 19. Insider Patterns
export interface InsiderPattern { pattern: string; detected: boolean; description: string; }
export interface InsiderTransaction { insider: string; title: string; type: string; amount: string; date: string; significance: string; }
export interface InsiderPatternsAnalysis {
  overallSignal: string; patterns: InsiderPattern[];
  netActivity: { last3Months: string; last12Months: string; buyCount: number; sellCount: number; netValue: string };
  notableTransactions: InsiderTransaction[]; summary: string;
}
export const fetchInsiderPatterns = (s: string, n: string) =>
  aiPost<InsiderPatternsAnalysis>("ai-insider-patterns", { symbol: s, name: n });

// 20. Short Interest
export interface ShortInterestAnalysis {
  currentShortInterest: { sharesShort: string; percentOfFloat: string; daysToCover: number; shortRatio: number; costToBorrow: string };
  trend: string;
  trendData: Array<{ date: string; sharesShort: string; percentFloat: string }>;
  squeezeRisk: string; signal: string; summary: string;
}
export const fetchShortInterest = (s: string, n: string) =>
  aiPost<ShortInterestAnalysis>("ai-short-interest", { symbol: s, name: n });

// 21. Earnings Replay
export interface EarningsReplayAnalysis {
  quarter: string; date: string; headline: string;
  revenue: { actual: string; estimate: string; surprise: string; yoyGrowth: string };
  eps: { actual: string; estimate: string; surprise: string };
  segmentHighlights: Array<{ segment: string; revenue: string; growth: string; commentary: string }>;
  guidanceUpdate: { nextQuarter: string; vsConsensus: string; reaction: string };
  keyQuotes: string[];
  stockReaction: { afterHours: string; nextDay: string; oneWeekLater: string };
  analystReactions: Array<{ firm: string; action: string; comment: string }>;
  summary: string;
}
export const fetchEarningsReplay = (s: string, n: string) =>
  aiPost<EarningsReplayAnalysis>("ai-earnings-replay", { symbol: s, name: n });

// 22. Earnings Calendar
export interface EarningsCalendarEntry { symbol: string; name: string; date: string; time: string; epsEstimate: string; revenueEstimate: string; beatStreak: number; avgMove: string; }
export interface EarningsCalendarAnalysis {
  upcoming: EarningsCalendarEntry[]; thisWeek: EarningsCalendarEntry[];
  nextWeek: EarningsCalendarEntry[]; summary: string;
}
export const fetchEarningsCalendar = (symbols?: string[]) =>
  aiPost<EarningsCalendarAnalysis>("ai-earnings-calendar", { symbols });

// 23. Estimate Revisions
export interface EstimateRevision { period: string; metric: string; thirtyDaysAgo: string; current: string; change: string; direction: string; }
export interface EstimateRevisionsAnalysis {
  currentEstimates: Record<string, string>; revisionTrend: string;
  revisions: EstimateRevision[];
  analystChanges: { upgrades: number; downgrades: number; initiations: number; last30Days: string };
  earningsMomentum: string; summary: string;
}
export const fetchEstimateRevisions = (s: string, n: string) =>
  aiPost<EstimateRevisionsAnalysis>("ai-estimate-revisions", { symbol: s, name: n });

// 24. Cash Flow Waterfall
export interface WaterfallItem { item: string; amount: string; value: number; }
export interface CashFlowAnalysis {
  period: string; waterfall: WaterfallItem[];
  fcfMargin: string; fcfYield: string; fcfPerShare: string; cashConversion: string;
  uses: Array<{ category: string; amount: string; percentage: number }>;
  summary: string;
}
export const fetchCashFlow = (s: string, n: string) =>
  aiPost<CashFlowAnalysis>("ai-cashflow", { symbol: s, name: n });

// 25. Margin Analysis
export interface MarginHistory { quarter: string; gross: number; operating: number; net: number; }
export interface MarginPeer { company: string; gross: number; operating: number; net: number; }
export interface MarginAnalysis {
  currentMargins: { gross: number; operating: number; net: number; fcf: number };
  marginTrend: string; history: MarginHistory[];
  peerComparison: MarginPeer[];
  drivers: string[]; risks: string[]; summary: string;
}
export const fetchMargins = (s: string, n: string) =>
  aiPost<MarginAnalysis>("ai-margins", { symbol: s, name: n });

// 26. Deep Comparison
export interface CompanyScore {
  symbol: string; name: string;
  valuation: Record<string, number>;
  growth: Record<string, string>;
  profitability: Record<string, string>;
  risk: Record<string, number | string>;
  score: number;
}
export interface DeepCompareAnalysis {
  companies: CompanyScore[];
  winner: string; winnerReason: string;
  categories: Array<{ category: string; winner: string; reason: string }>;
  summary: string;
}
export const fetchDeepCompare = (symbols: string[]) =>
  aiPost<DeepCompareAnalysis>("ai-deep-compare", { symbols });

// 27. Note Suggestions
export interface NoteSuggestion { title: string; content: string; priority: string; }
export interface NoteSuggestAnalysis {
  suggestedNotes: NoteSuggestion[];
  keyDates: Array<{ date: string; event: string; importance: string }>;
  watchItems: string[];
}
export const fetchNoteSuggestions = (s: string, n: string, p: number, ctx?: string) =>
  aiPost<NoteSuggestAnalysis>("ai-note-suggest", { symbol: s, name: n, price: p, context: ctx });

// 28. Scenario Analysis
export interface ScenarioCase { probability: number; priceTarget: number; upside?: string; downside?: string; assumptions: string; revenueImpact: string; marginImpact: string; }
export interface ScenarioAnalysis {
  baseCase: ScenarioCase; bullCase: ScenarioCase; bearCase: ScenarioCase;
  expectedValue: string; riskReward: string; keyVariable: string; summary: string;
}
export const fetchScenario = (s: string, n: string, p: number, sc?: string) =>
  aiPost<ScenarioAnalysis>("ai-scenario", { symbol: s, name: n, price: p, scenario: sc });

// 29. Quality Score
export interface QualityComponent { factor: string; score: number; metrics: Record<string, string>; assessment: string; }
export interface QualityAnalysis {
  qualityScore: number; grade: string; components: QualityComponent[];
  percentileRank: string;
  comparableScores: Array<{ symbol: string; score: number }>;
  summary: string;
}
export const fetchQuality = (s: string, n: string, p: number) =>
  aiPost<QualityAnalysis>("ai-quality", { symbol: s, name: n, price: p });

// 30. Watchlist Alerts
export interface SuggestedAlert { type: string; condition: string; currentValue: string; threshold: string; rationale: string; priority: string; }
export interface AlertsAnalysis {
  suggestedAlerts: SuggestedAlert[];
  activeFlags: Array<{ flag: string; significance: string }>;
  summary: string;
}
export const fetchAlerts = (s: string, n: string, p: number) =>
  aiPost<AlertsAnalysis>("ai-alerts", { symbol: s, name: n, price: p });
