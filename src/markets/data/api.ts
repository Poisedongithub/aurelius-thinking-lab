// Markets API service — connects to FMP (Financial Modeling Prep) via server proxy
// Falls back to mock data for pre-loaded tickers, fetches live data for new ones

import { getTickerAnalysis, getAllAnalyses, searchTickers as mockSearch, type TickerAnalysis, type PriceSnapshot } from "./mockData";

const API_BASE = "/api/markets";

// ── Live Price Fetching ──

export interface LiveQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  yearHigh: number;
  yearLow: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  sector?: string;
  industry?: string;
  description?: string;
  performance?: Record<string, number | null>;
  chart?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
}

export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/quote/${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchBatchQuotes(symbols: string[]): Promise<LiveQuote[]> {
  try {
    const res = await fetch(`${API_BASE}/batch?symbols=${symbols.join(",")}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.quotes || [];
  } catch {
    return [];
  }
}

export async function searchTickersLive(query: string): Promise<Array<{ symbol: string; name: string; exchange: string }>> {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

// ── AI Analysis Fetching ──

export async function fetchAIAnalysis(symbol: string, name: string, price: number, change: number, section: string): Promise<Record<string, unknown> | null> {
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

export async function fetchFullAnalysis(symbol: string, name: string, price: number, change: number): Promise<Record<string, unknown> | null> {
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

// ── Hybrid Data Layer ──
// For pre-loaded tickers (NVDA, AVGO, etc.): use mock analysis + live prices
// For new tickers: use live prices + AI-generated analysis

// Cache for live quotes to avoid repeated API calls
const quoteCache: Map<string, { data: LiveQuote; timestamp: number }> = new Map();
const CACHE_TTL = 60_000; // 1 minute

async function getCachedQuote(symbol: string): Promise<LiveQuote | null> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  const quote = await fetchLiveQuote(symbol);
  if (quote) quoteCache.set(symbol, { data: quote, timestamp: Date.now() });
  return quote;
}

// Merge live price data into a mock ticker analysis
function mergeLivePrice(mock: TickerAnalysis, live: LiveQuote): TickerAnalysis {
  const updatedPrice: PriceSnapshot = {
    ...mock.price,
    price: live.price,
    dayMovePct: live.change || mock.price.dayMovePct,
    weekMovePct: live.performance?.["1W"] ?? mock.price.weekMovePct,
    monthMovePct: live.performance?.["1M"] ?? mock.price.monthMovePct,
    marketCap: live.marketCap ? formatMarketCap(live.marketCap) : mock.price.marketCap,
  };
  return { ...mock, price: updatedPrice };
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap}`;
}

// Get ticker analysis with live prices overlaid
export async function getTickerWithLivePrice(symbol: string): Promise<TickerAnalysis | null> {
  const mock = getTickerAnalysis(symbol);
  if (!mock) return null;
  
  const live = await getCachedQuote(symbol);
  if (live) return mergeLivePrice(mock, live);
  return mock; // Fallback to pure mock if API fails
}

// Get all pre-loaded tickers with live prices
export async function getAllWithLivePrices(): Promise<TickerAnalysis[]> {
  const mocks = getAllAnalyses();
  const symbols = mocks.map(m => m.symbol);
  
  // Fetch all quotes in parallel
  const quotes = await fetchBatchQuotes(symbols);
  const quoteMap = new Map(quotes.map(q => [q.symbol, q]));
  
  return mocks.map(mock => {
    const live = quoteMap.get(mock.symbol);
    if (live) return mergeLivePrice(mock, live);
    return mock;
  });
}

// Search — combines mock search with live FMP search
export async function hybridSearch(query: string): Promise<Array<{ symbol: string; name: string; exchange: string; hasMockData: boolean }>> {
  // First check mock data
  const mockResults = mockSearch(query).map(t => ({
    symbol: t.symbol,
    name: t.name,
    exchange: t.exchange,
    hasMockData: true,
  }));
  
  // Also search FMP for tickers not in mock data
  const liveResults = await searchTickersLive(query);
  const mockSymbols = new Set(mockResults.map(r => r.symbol));
  const newResults = liveResults
    .filter(r => !mockSymbols.has(r.symbol))
    .map(r => ({ ...r, hasMockData: false }));
  
  return [...mockResults, ...newResults];
}
