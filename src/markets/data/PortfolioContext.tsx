import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "aurelius_portfolio";

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  addedAt: number; // timestamp
}

interface PortfolioContextType {
  positions: PortfolioPosition[];
  addPosition: (symbol: string, shares: number, avgCost: number) => void;
  updatePosition: (symbol: string, shares: number, avgCost: number) => void;
  removePosition: (symbol: string) => void;
  getPosition: (symbol: string) => PortfolioPosition | undefined;
  hasPosition: (symbol: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

function loadPortfolio(): PortfolioPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function savePortfolio(positions: PortfolioPosition[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {}
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<PortfolioPosition[]>(loadPortfolio);

  useEffect(() => {
    savePortfolio(positions);
  }, [positions]);

  const addPosition = (symbol: string, shares: number, avgCost: number) => {
    const s = symbol.toUpperCase().trim();
    if (!s || shares <= 0 || avgCost <= 0) return;
    setPositions((prev) => {
      // If position already exists, update it
      const existing = prev.find((p) => p.symbol === s);
      if (existing) {
        // Average in: new avg cost = (old_shares * old_cost + new_shares * new_cost) / total_shares
        const totalShares = existing.shares + shares;
        const newAvgCost = (existing.shares * existing.avgCost + shares * avgCost) / totalShares;
        return prev.map((p) =>
          p.symbol === s ? { ...p, shares: totalShares, avgCost: newAvgCost } : p
        );
      }
      return [...prev, { symbol: s, shares, avgCost, addedAt: Date.now() }];
    });
  };

  const updatePosition = (symbol: string, shares: number, avgCost: number) => {
    const s = symbol.toUpperCase().trim();
    if (!s || shares <= 0 || avgCost <= 0) return;
    setPositions((prev) =>
      prev.map((p) => (p.symbol === s ? { ...p, shares, avgCost } : p))
    );
  };

  const removePosition = (symbol: string) => {
    const s = symbol.toUpperCase().trim();
    setPositions((prev) => prev.filter((p) => p.symbol !== s));
  };

  const getPosition = (symbol: string) => {
    return positions.find((p) => p.symbol === symbol.toUpperCase().trim());
  };

  const hasPosition = (symbol: string) => {
    return positions.some((p) => p.symbol === symbol.toUpperCase().trim());
  };

  return (
    <PortfolioContext.Provider
      value={{ positions, addPosition, updatePosition, removePosition, getPosition, hasPosition }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
