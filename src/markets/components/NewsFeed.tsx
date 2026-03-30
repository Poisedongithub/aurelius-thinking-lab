import { useState, useEffect } from "react";
import { fetchTickerNews, fetchMarketNews, NewsArticle, timeAgo } from "../data/api";

interface NewsFeedProps {
  symbol?: string;
  limit?: number;
}

export default function NewsFeed({ symbol, limit = 10 }: NewsFeedProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = symbol ? fetchTickerNews(symbol) : fetchMarketNews();
    fetcher.then((articles) => {
      setNews(articles.slice(0, limit));
      setLoading(false);
    });
  }, [symbol, limit]);

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
        <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">
          {symbol ? `${symbol} NEWS` : "MARKET NEWS"}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
        <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">
          {symbol ? `${symbol} NEWS` : "MARKET NEWS"}
        </div>
        <div className="text-white/20 text-xs font-mono text-center py-6">No news available</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4">
      <div className="text-[14px] text-white/20 font-mono uppercase tracking-widest mb-4">
        {symbol ? `${symbol} NEWS` : "MARKET NEWS"}
      </div>
      <div className="space-y-3">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all group"
          >
            <div className="flex gap-3">
              {article.image && (
                <img
                  src={article.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs text-white/80 font-medium leading-tight line-clamp-2 group-hover:text-white transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[14px] text-white/30 font-mono">{article.source}</span>
                  <span className="text-[14px] text-white/15">|</span>
                  <span className="text-[14px] text-white/30 font-mono">{timeAgo(article.published)}</span>
                </div>
                {article.tickers.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {article.tickers.slice(0, 4).map((t) => (
                      <span key={t} className="text-[13px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
