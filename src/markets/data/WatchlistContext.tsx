import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { DEFAULT_WATCHLIST } from "./api";

const STORAGE_KEY = "aurelius_watchlist";

interface WatchlistContextType {
  watchlist: string[];
  addTicker: (symbol: string) => void;
  removeTicker: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleTicker: (symbol: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function loadWatchlist(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First time — seed with defaults
  return [...DEFAULT_WATCHLIST];
}

function saveWatchlist(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const addTicker = (symbol: string) => {
    const s = symbol.toUpperCase().trim();
    if (!s) return;
    setWatchlist((prev) => {
      if (prev.includes(s)) return prev;
      return [...prev, s];
    });
  };

  const removeTicker = (symbol: string) => {
    const s = symbol.toUpperCase().trim();
    setWatchlist((prev) => prev.filter((t) => t !== s));
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol.toUpperCase().trim());

  const toggleTicker = (symbol: string) => {
    if (isInWatchlist(symbol)) {
      removeTicker(symbol);
    } else {
      addTicker(symbol);
    }
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addTicker, removeTicker, isInWatchlist, toggleTicker }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}
