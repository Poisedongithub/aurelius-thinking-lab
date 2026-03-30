import { useEffect, useRef, memo } from "react";

// ── Advanced Chart ──
interface AdvancedChartProps {
  symbol: string;
  height?: number;
  interval?: string;
  showToolbar?: boolean;
  showSideToolbar?: boolean;
  allowSymbolChange?: boolean;
  studies?: string[];
}

export const TradingViewAdvancedChart = memo(function TradingViewAdvancedChart({
  symbol,
  height = 500,
  interval = "D",
  showToolbar = true,
  showSideToolbar = false,
  allowSymbolChange = false,
  studies = [],
}: AdvancedChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = `${height - 32}px`;
    widgetDiv.style.width = "100%";
    container.current.appendChild(widgetDiv);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML = `<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>`;
    copyright.style.fontSize = "10px";
    copyright.style.opacity = "0.3";
    container.current.appendChild(copyright);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: false,
      width: "100%",
      height: height - 32,
      symbol: symbol,
      interval: interval,
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: allowSymbolChange,
      calendar: false,
      hide_top_toolbar: !showToolbar,
      hide_side_toolbar: !showSideToolbar,
      hide_legend: false,
      hide_volume: false,
      save_image: false,
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      withdateranges: true,
      details: false,
      hotlist: false,
      studies: studies,
      support_host: "https://www.tradingview.com",
    });
    container.current.appendChild(script);
  }, [symbol, interval, showToolbar, showSideToolbar, allowSymbolChange]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px`, width: "100%" }}
    />
  );
});

// ── Ticker Tape ──
interface TickerTapeProps {
  symbols?: Array<{ proName: string; title: string }>;
  colorTheme?: "dark" | "light";
  displayMode?: "adaptive" | "regular" | "compact";
}

export const TradingViewTickerTape = memo(function TradingViewTickerTape({
  symbols,
  colorTheme = "dark",
  displayMode = "adaptive",
}: TickerTapeProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols || [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100" },
        { proName: "FOREXCOM:DJI", title: "Dow 30" },
        { proName: "INDEX:NKY", title: "Nikkei 225" },
        { proName: "NASDAQ:NVDA", title: "NVDA" },
        { proName: "NASDAQ:AAPL", title: "AAPL" },
        { proName: "NASDAQ:TSLA", title: "TSLA" },
        { proName: "NASDAQ:META", title: "META" },
        { proName: "NASDAQ:AMZN", title: "AMZN" },
        { proName: "NASDAQ:GOOG", title: "GOOG" },
        { proName: "NASDAQ:MSFT", title: "MSFT" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "COMEX:GC1!", title: "Gold" },
        { proName: "NYMEX:CL1!", title: "Crude Oil" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: displayMode,
      colorTheme: colorTheme,
      locale: "en",
    });
    container.current.appendChild(script);
  }, []);

  return <div ref={container} className="tradingview-widget-container" />;
});

// ── Technical Analysis Widget ──
interface TechnicalAnalysisProps {
  symbol: string;
  height?: number;
  interval?: string;
}

export const TradingViewTechnicalAnalysis = memo(function TradingViewTechnicalAnalysis({
  symbol,
  height = 425,
  interval = "1D",
}: TechnicalAnalysisProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: interval,
      width: "100%",
      isTransparent: true,
      height: height,
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "dark",
    });
    container.current.appendChild(script);
  }, [symbol, interval, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Symbol Overview (Mini Chart) ──
interface SymbolOverviewProps {
  symbols: string[][];
  height?: number;
  chartType?: "area" | "bars" | "candlesticks" | "line";
}

export const TradingViewSymbolOverview = memo(function TradingViewSymbolOverview({
  symbols,
  height = 400,
  chartType = "area",
}: SymbolOverviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols,
      chartOnly: false,
      width: "100%",
      height: height,
      locale: "en",
      colorTheme: "dark",
      autosize: false,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: chartType,
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      headerFontSize: "medium",
      backgroundColor: "rgba(0, 0, 0, 0)",
      lineWidth: 2,
      lineType: 0,
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
    });
    container.current.appendChild(script);
  }, [JSON.stringify(symbols), chartType, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Stock Heatmap ──
interface StockHeatmapProps {
  height?: number;
  dataSource?: string;
  grouping?: string;
  blockSize?: string;
  blockColor?: string;
}

export const TradingViewStockHeatmap = memo(function TradingViewStockHeatmap({
  height = 500,
  dataSource = "SPX500",
  grouping = "sector",
  blockSize = "market_cap_basic",
  blockColor = "change",
}: StockHeatmapProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: dataSource,
      grouping: grouping,
      blockSize: blockSize,
      blockColor: blockColor,
      locale: "en",
      symbolUrl: "",
      colorTheme: "dark",
      hasTopBar: true,
      isDataSet498Enabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: height,
    });
    container.current.appendChild(script);
  }, [dataSource, grouping, blockSize, blockColor, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Screener Widget ──
interface ScreenerWidgetProps {
  height?: number;
  defaultColumn?: string;
  defaultScreen?: string;
  market?: string;
}

export const TradingViewScreener = memo(function TradingViewScreener({
  height = 600,
  defaultColumn = "overview",
  defaultScreen = "most_capitalized",
  market = "america",
}: ScreenerWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: height,
      defaultColumn: defaultColumn,
      defaultScreen: defaultScreen,
      market: market,
      showToolbar: true,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
    });
    container.current.appendChild(script);
  }, [defaultColumn, defaultScreen, market, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Market Overview Widget ──
interface MarketOverviewProps {
  height?: number;
  tabs?: Array<{
    title: string;
    symbols: Array<{ s: string; d?: string }>;
    originalTitle: string;
  }>;
}

export const TradingViewMarketOverview = memo(function TradingViewMarketOverview({
  height = 500,
  tabs,
}: MarketOverviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const defaultTabs = [
      {
        title: "Indices",
        symbols: [
          { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
          { s: "FOREXCOM:NSXUSD", d: "US 100" },
          { s: "FOREXCOM:DJI", d: "Dow 30" },
          { s: "INDEX:NKY", d: "Nikkei 225" },
          { s: "INDEX:DEU40", d: "DAX" },
          { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
        ],
        originalTitle: "Indices",
      },
      {
        title: "Futures",
        symbols: [
          { s: "CME_MINI:ES1!", d: "S&P 500" },
          { s: "CME:6E1!", d: "Euro" },
          { s: "COMEX:GC1!", d: "Gold" },
          { s: "NYMEX:CL1!", d: "WTI Crude" },
          { s: "NYMEX:NG1!", d: "Nat Gas" },
          { s: "CBOT:ZC1!", d: "Corn" },
        ],
        originalTitle: "Futures",
      },
      {
        title: "Bonds",
        symbols: [
          { s: "CBOT:ZB1!", d: "T-Bond" },
          { s: "CBOT:UB1!", d: "Ultra T-Bond" },
          { s: "EUREX:FGBL1!", d: "Euro Bund" },
          { s: "EUREX:FBTP1!", d: "Euro BTP" },
          { s: "EUREX:FGBM1!", d: "Euro BOBL" },
        ],
        originalTitle: "Bonds",
      },
      {
        title: "Forex",
        symbols: [
          { s: "FX:EURUSD", d: "EUR to USD" },
          { s: "FX:GBPUSD", d: "GBP to USD" },
          { s: "FX:USDJPY", d: "USD to JPY" },
          { s: "FX:USDCHF", d: "USD to CHF" },
          { s: "FX:AUDUSD", d: "AUD to USD" },
          { s: "FX:USDCAD", d: "USD to CAD" },
        ],
        originalTitle: "Forex",
      },
    ];

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: "100%",
      height: height,
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: "rgba(34, 197, 94, 1)",
      plotLineColorFalling: "rgba(239, 68, 68, 1)",
      gridLineColor: "rgba(255, 255, 255, 0.03)",
      scaleFontColor: "rgba(255, 255, 255, 0.3)",
      belowLineFillColorGrowing: "rgba(34, 197, 94, 0.05)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.05)",
      belowLineFillColorGrowingBottom: "rgba(34, 197, 94, 0)",
      belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0)",
      symbolActiveColor: "rgba(255, 255, 255, 0.05)",
      tabs: tabs || defaultTabs,
    });
    container.current.appendChild(script);
  }, [height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Top Stories (News) Widget ──
interface TopStoriesProps {
  height?: number;
  feedMode?: "all_symbols" | "symbol";
  symbol?: string;
}

export const TradingViewTopStories = memo(function TradingViewTopStories({
  height = 400,
  feedMode = "all_symbols",
  symbol,
}: TopStoriesProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const config: Record<string, unknown> = {
      feedMode: feedMode,
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: height,
      colorTheme: "dark",
      locale: "en",
    };
    if (feedMode === "symbol" && symbol) {
      config.symbol = symbol;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.current.appendChild(script);
  }, [feedMode, symbol, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Economic Calendar Widget ──
interface EconomicCalendarProps {
  height?: number;
}

export const TradingViewEconomicCalendar = memo(function TradingViewEconomicCalendar({
  height = 500,
}: EconomicCalendarProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      width: "100%",
      height: height,
      locale: "en",
      importanceFilter: "-1,0,1",
      countryFilter: "us",
    });
    container.current.appendChild(script);
  }, [height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Fundamental Data Widget ──
interface FundamentalDataProps {
  symbol: string;
  height?: number;
}

export const TradingViewFundamentalData = memo(function TradingViewFundamentalData({
  symbol,
  height = 775,
}: FundamentalDataProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      isTransparent: true,
      largeChartUrl: "",
      displayMode: "regular",
      width: "100%",
      height: height,
      colorTheme: "dark",
      symbol: symbol,
      locale: "en",
    });
    container.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Company Profile Widget ──
interface CompanyProfileProps {
  symbol: string;
  height?: number;
}

export const TradingViewCompanyProfile = memo(function TradingViewCompanyProfile({
  symbol,
  height = 550,
}: CompanyProfileProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: height,
      isTransparent: true,
      colorTheme: "dark",
      symbol: symbol,
      locale: "en",
    });
    container.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});

// ── Symbol Info Widget ──
interface SymbolInfoProps {
  symbol: string;
}

export const TradingViewSymbolInfo = memo(function TradingViewSymbolInfo({
  symbol,
}: SymbolInfoProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      locale: "en",
      colorTheme: "dark",
      isTransparent: true,
    });
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div ref={container} className="tradingview-widget-container" />
  );
});

// ── Mini Chart Widget ──
interface MiniChartProps {
  symbol: string;
  height?: number;
  dateRange?: string;
}

export const TradingViewMiniChart = memo(function TradingViewMiniChart({
  symbol,
  height = 220,
  dateRange = "12M",
}: MiniChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: height,
      locale: "en",
      dateRange: dateRange,
      colorTheme: "dark",
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
      chartOnly: false,
      noTimeScale: false,
    });
    container.current.appendChild(script);
  }, [symbol, dateRange, height]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container rounded-xl overflow-hidden border border-[var(--t-border)]"
      style={{ height: `${height}px` }}
    />
  );
});
