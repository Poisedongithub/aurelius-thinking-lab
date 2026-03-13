// ── Mock Data: 6 stocks across sectors ──
// NVDA (semis/AI), AVGO (AI infra), CIEN (networking/optical),
// MELI (internet/LatAm), META (consumer platform), CAT (industrial)

export interface SourceItem {
  id: string;
  type: "news" | "earnings_release" | "transcript" | "filing" | "contract" | "ownership" | "analyst" | "price_event" | "note";
  sourceName: string;
  sourceUrl: string;
  title: string;
  date: string;
  tickerSymbol: string;
  peerTickerSymbol?: string;
  contentSnippet: string;
}

export interface PriceSnapshot {
  dayMovePct: number;
  weekMovePct: number;
  monthMovePct: number;
  quarterMovePct: number;
  ytdMovePct: number;
  volumeSpike: boolean;
  relativeSectorMovePct: number;
  price: number;
  marketCap: string;
}

export interface Catalyst {
  label: string;
  confidence: number;
  summary: string;
  evidenceSourceIds: string[];
}

export interface ChainNode {
  id: string;
  name: string;
  nodeType: "end_demand" | "platform" | "infra" | "component" | "supplier" | "bottleneck";
  role: string;
  tickers?: string[];
}

export interface ChainEdge {
  from: string;
  to: string;
  relation: string;
}

export interface PeerReadthrough {
  sourceCompany: string;
  sourceTicker: string;
  sourceDate: string;
  quote: string;
  implication: string;
  direction: "bullish" | "bearish" | "mixed";
  confidence: number;
  segment?: string;
  sourceItemId: string;
}

export interface MoneyFlowItem {
  flowType: string;
  strength: "strong" | "moderate" | "weak";
  summary: string;
  amount?: string;
  sourceItemId: string;
}

export interface SegmentSnapshot {
  segmentName: string;
  trend: "accelerating" | "stable" | "decelerating" | "declining";
  thesisRole: "core" | "supporting" | "drag" | "irrelevant";
  importanceScore: number;
  summary: string;
}

export interface ContractEvidence {
  customerName?: string;
  contractType: string;
  stage: "signed" | "announced" | "rumored" | "expanding";
  summary: string;
  sourceItemId: string;
}

export interface TickerAnalysis {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  description: string;
  price: PriceSnapshot;
  attentionTrigger: {
    triggerType: string;
    triggerSummary: string;
    priceContext: string;
    whyThisNameNow: string;
  };
  stockMove: {
    moveSummary: string;
    topCatalysts: Catalyst[];
    primaryCatalyst: string;
    unknownFlag: boolean;
  };
  industryChain: {
    nodes: ChainNode[];
    edges: ChainEdge[];
    companyRole: string;
    bottlenecks: string[];
  };
  leveragePoint: {
    leverageScore: number;
    leverageReasoning: string;
    bottleneckType: string;
    isBestLeveragePoint: boolean;
    betterAlternatives: string[];
  };
  peerReadthroughs: PeerReadthrough[];
  moneyFlow: {
    moneyFlowScore: number;
    moneyFlowSummary: string;
    evidence: MoneyFlowItem[];
    durability: string;
  };
  companyNumbers: {
    revenueGrowth: string;
    epsGrowth: string;
    grossMargin: string;
    operatingMargin: string;
    fcfMargin: string;
    guideDirection: string;
    summary: string;
  };
  segments: SegmentSnapshot[];
  contractsAdoption: {
    evidence: ContractEvidence[];
    adoptionSummary: string;
    adoptionScore: number;
  };
  valuation: {
    pe: number | null;
    evSales: number | null;
    evEbitda: number | null;
    relativeToHistory: string;
    relativeToPeers: string;
    pricedForPerfection: boolean;
    summary: string;
  };
  ownershipSentiment: {
    institutionalOwnership: string;
    shortInterest: string;
    crowding: string;
    sentiment: string;
    summary: string;
  };
  thesis: {
    summary: string;
    bullCase: string;
    bearCase: string;
    whatChangesIt: string;
    watchItems: string[];
  };
  processScore: {
    triggerClarity: number;
    moveCatalystClarity: number;
    leverageStrength: number;
    peerSupport: number;
    moneyFlow: number;
    numberConfirmation: number;
    segmentQuality: number;
    contractsProof: number;
    valuationAttractiveness: number;
    ownershipContext: number;
    total: number;
    rank: string;
  };
  sources: SourceItem[];
  lastUpdated: string;
}

// ── NVDA ──
const nvdaSources: SourceItem[] = [
  { id: "nvda-s1", type: "earnings_release", sourceName: "NVIDIA IR", sourceUrl: "https://investor.nvidia.com", title: "NVIDIA Q4 FY25 Earnings: Revenue $22.1B, +265% YoY", date: "2025-02-21", tickerSymbol: "NVDA", contentSnippet: "Data Center revenue $18.4B, up 409% YoY. Guidance for Q1 FY26: $24B +/- 2%." },
  { id: "nvda-s2", type: "transcript", sourceName: "NVIDIA Earnings Call", sourceUrl: "https://investor.nvidia.com", title: "Jensen Huang: 'We are at the beginning of a new industrial revolution'", date: "2025-02-21", tickerSymbol: "NVDA", contentSnippet: "Blackwell demand is insane. Every major cloud provider, sovereign nation, and enterprise is racing to build AI infrastructure." },
  { id: "nvda-s3", type: "news", sourceName: "Reuters", sourceUrl: "https://reuters.com", title: "Microsoft, Meta, Google to spend $200B+ on AI capex in 2025", date: "2025-02-15", tickerSymbol: "NVDA", peerTickerSymbol: "MSFT", contentSnippet: "Hyperscaler capex budgets for 2025 suggest unprecedented GPU demand." },
  { id: "nvda-s4", type: "contract", sourceName: "Bloomberg", sourceUrl: "https://bloomberg.com", title: "Saudi Arabia orders $10B in NVIDIA GPUs for national AI initiative", date: "2025-02-10", tickerSymbol: "NVDA", contentSnippet: "Sovereign AI spending accelerating. Multiple nations building GPU clusters." },
  { id: "nvda-s5", type: "analyst", sourceName: "Morgan Stanley", sourceUrl: "https://morganstanley.com", title: "NVDA PT raised to $1,100 from $950 — Blackwell cycle just starting", date: "2025-02-22", tickerSymbol: "NVDA", contentSnippet: "We see Blackwell driving a multi-year upgrade cycle. Supply remains the bottleneck, not demand." },
  { id: "nvda-s6", type: "ownership", sourceName: "13F Filing", sourceUrl: "https://sec.gov", title: "Top hedge funds added NVDA in Q4 — Citadel, Millennium, Point72", date: "2025-02-14", tickerSymbol: "NVDA", contentSnippet: "Institutional ownership at 68%. Hedge fund crowding score: elevated." },
];

const nvda: TickerAnalysis = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
  sector: "Technology",
  industry: "Semiconductors",
  exchange: "NASDAQ",
  description: "Designs GPUs and AI accelerators",
  price: { dayMovePct: 3.2, weekMovePct: 8.7, monthMovePct: 15.4, quarterMovePct: 28.1, ytdMovePct: 22.3, volumeSpike: true, relativeSectorMovePct: 12.1, price: 875.40, marketCap: "$2.15T" },
  attentionTrigger: {
    triggerType: "earnings",
    triggerSummary: "Q4 FY25 earnings blew out expectations. Revenue +265% YoY. Data Center +409%. Guidance above consensus.",
    priceContext: "Stock up 8.7% in the past week, 15.4% in the past month. Volume spiked 3x average on earnings day.",
    whyThisNameNow: "This is the single most important AI infrastructure stock. Every dollar of hyperscaler capex flows through NVIDIA GPUs first.",
  },
  stockMove: {
    moveSummary: "Up 3.2% today, 8.7% this week. Post-earnings gap up on massive beat and raise.",
    topCatalysts: [
      { label: "Earnings beat + raise", confidence: 95, summary: "Q4 revenue $22.1B vs $20.4B expected. Q1 guide $24B vs $22B expected.", evidenceSourceIds: ["nvda-s1"] },
      { label: "Blackwell demand commentary", confidence: 90, summary: "Jensen called Blackwell demand 'insane'. Every hyperscaler ordering aggressively.", evidenceSourceIds: ["nvda-s2"] },
      { label: "Hyperscaler capex acceleration", confidence: 85, summary: "$200B+ in combined AI capex budgets for 2025 from MSFT, META, GOOG.", evidenceSourceIds: ["nvda-s3"] },
    ],
    primaryCatalyst: "Earnings beat + raise",
    unknownFlag: false,
  },
  industryChain: {
    nodes: [
      { id: "end-demand", name: "AI Applications", nodeType: "end_demand", role: "ChatGPT, Copilot, AI agents, autonomous driving" },
      { id: "cloud", name: "Cloud / Hyperscalers", nodeType: "platform", role: "MSFT Azure, GOOG GCP, AMZN AWS, META", tickers: ["MSFT", "GOOG", "AMZN", "META"] },
      { id: "gpu", name: "GPU / AI Accelerators", nodeType: "bottleneck", role: "Training and inference compute", tickers: ["NVDA", "AMD"] },
      { id: "hbm", name: "HBM Memory", nodeType: "component", role: "High-bandwidth memory for GPUs", tickers: ["SK Hynix", "Samsung", "MU"] },
      { id: "networking", name: "AI Networking", nodeType: "infra", role: "Connecting GPU clusters", tickers: ["AVGO", "MRVL", "CIEN"] },
      { id: "power", name: "Power / Cooling", nodeType: "infra", role: "Data center power infrastructure", tickers: ["VRTX", "ETN"] },
      { id: "tsmc", name: "Foundry", nodeType: "supplier", role: "Chip manufacturing", tickers: ["TSM"] },
    ],
    edges: [
      { from: "end-demand", to: "cloud", relation: "drives demand for" },
      { from: "cloud", to: "gpu", relation: "purchases" },
      { from: "gpu", to: "hbm", relation: "requires" },
      { from: "gpu", to: "networking", relation: "connects via" },
      { from: "cloud", to: "power", relation: "needs" },
      { from: "gpu", to: "tsmc", relation: "manufactured by" },
    ],
    companyRole: "NVIDIA sits at the GPU/AI Accelerator node — the primary bottleneck in the AI infrastructure chain. Every dollar of AI capex must flow through compute first.",
    bottlenecks: ["GPU supply (TSMC CoWoS packaging)", "HBM supply", "Power availability"],
  },
  leveragePoint: {
    leverageScore: 95,
    leverageReasoning: "NVIDIA has near-monopoly on AI training GPUs (90%+ share). CUDA ecosystem creates massive switching costs. Blackwell architecture extends lead. Every hyperscaler, sovereign, and enterprise must buy NVIDIA to participate in AI.",
    bottleneckType: "technical",
    isBestLeveragePoint: true,
    betterAlternatives: [],
  },
  peerReadthroughs: [
    { sourceCompany: "Microsoft", sourceTicker: "MSFT", sourceDate: "2025-01-30", quote: "We expect to spend over $80B on AI-capable data centers in fiscal 2025.", implication: "Massive GPU demand from MSFT alone. NVDA is primary supplier.", direction: "bullish", confidence: 95, segment: "Data Center", sourceItemId: "nvda-s3" },
    { sourceCompany: "SK Hynix", sourceTicker: "000660.KS", sourceDate: "2025-01-25", quote: "HBM3E is sold out through 2025. We are expanding capacity.", implication: "HBM supply constraint confirms GPU demand is real and exceeds supply.", direction: "bullish", confidence: 85, segment: "Data Center", sourceItemId: "nvda-s1" },
    { sourceCompany: "TSMC", sourceTicker: "TSM", sourceDate: "2025-01-16", quote: "AI revenue will more than double in 2025. CoWoS capacity expanding.", implication: "TSMC confirming massive AI chip demand. NVDA is their largest AI customer.", direction: "bullish", confidence: 90, sourceItemId: "nvda-s1" },
  ],
  moneyFlow: {
    moneyFlowScore: 95,
    moneyFlowSummary: "Hard money is flowing at unprecedented scale. $200B+ in hyperscaler capex, sovereign AI orders, enterprise deployments. This is not hype — signed contracts and capex budgets confirm it.",
    evidence: [
      { flowType: "capex_budget", strength: "strong", summary: "Hyperscalers committed $200B+ in AI capex for 2025", amount: "$200B+", sourceItemId: "nvda-s3" },
      { flowType: "signed_contract", strength: "strong", summary: "Saudi Arabia $10B GPU order", amount: "$10B", sourceItemId: "nvda-s4" },
      { flowType: "backlog", strength: "strong", summary: "Blackwell demand exceeds supply through 2025", sourceItemId: "nvda-s2" },
    ],
    durability: "structural",
  },
  companyNumbers: {
    revenueGrowth: "+265% YoY",
    epsGrowth: "+486% YoY",
    grossMargin: "76.0%",
    operatingMargin: "62.0%",
    fcfMargin: "51.0%",
    guideDirection: "Above consensus — Q1 guide $24B vs $22B expected",
    summary: "Numbers are absurd. Revenue tripled. Margins expanded. Guide beat by $2B. Data Center is 83% of revenue and growing 409%.",
  },
  segments: [
    { segmentName: "Data Center", trend: "accelerating", thesisRole: "core", importanceScore: 95, summary: "$18.4B revenue, +409% YoY. AI training and inference. This IS the thesis." },
    { segmentName: "Gaming", trend: "stable", thesisRole: "supporting", importanceScore: 20, summary: "$2.9B, +56% YoY. Solid but not the story." },
    { segmentName: "Professional Visualization", trend: "stable", thesisRole: "irrelevant", importanceScore: 5, summary: "$463M. Irrelevant to the AI thesis." },
    { segmentName: "Automotive", trend: "accelerating", thesisRole: "supporting", importanceScore: 10, summary: "$346M, +103% YoY. Autonomous driving optionality." },
  ],
  contractsAdoption: {
    evidence: [
      { customerName: "Saudi Arabia", contractType: "GPU purchase", stage: "signed", summary: "$10B national AI initiative GPU order", sourceItemId: "nvda-s4" },
      { customerName: "Microsoft", contractType: "Multi-year supply", stage: "expanding", summary: "Largest GPU customer, expanding Blackwell orders", sourceItemId: "nvda-s3" },
      { contractType: "Sovereign AI", stage: "expanding", summary: "Multiple nations building GPU clusters — India, Japan, UAE, France", sourceItemId: "nvda-s2" },
    ],
    adoptionSummary: "Adoption is as real as it gets. Signed contracts, named customers, dollar amounts. Not vaporware.",
    adoptionScore: 95,
  },
  valuation: {
    pe: 62,
    evSales: 28,
    evEbitda: 45,
    relativeToHistory: "Premium to 5-year average but growing into it fast",
    relativeToPeers: "Expensive vs semis, but justified by growth rate and monopoly position",
    pricedForPerfection: true,
    summary: "62x PE looks expensive until you realize earnings tripled and are still accelerating. The stock is priced for continued dominance. Any demand slowdown would hurt.",
  },
  ownershipSentiment: {
    institutionalOwnership: "68%",
    shortInterest: "1.1%",
    crowding: "elevated",
    sentiment: "extremely bullish",
    summary: "Everyone owns it. Hedge fund crowding is elevated. Short interest is negligible. Consensus is overwhelmingly bullish. Contrarian risk exists — if the narrative cracks, the unwind would be violent.",
  },
  thesis: {
    summary: "NVIDIA is the toll booth on the AI revolution. Near-monopoly on training GPUs, massive switching costs via CUDA, and demand that exceeds supply through 2025. Numbers are confirming the thesis at every turn. The risk is valuation and crowding — everyone already owns it and expects perfection.",
    bullCase: "AI capex cycle is multi-year. Blackwell extends the lead. Sovereign AI is a new demand vector. Inference demand is just starting. $30B+ quarterly revenue run rate by end of 2025.",
    bearCase: "Valuation assumes perfection. AMD and custom ASICs erode share over time. Hyperscaler capex could plateau. Crowded trade — any miss triggers violent selling.",
    whatChangesIt: "Hyperscaler capex guidance cuts. AMD gaining meaningful share. China export restrictions tightening further. Any sign of demand saturation.",
    watchItems: ["Q1 FY26 earnings (May 2025)", "Hyperscaler capex commentary next quarter", "AMD MI350 launch and adoption", "China policy changes", "Blackwell yield and supply ramp"],
  },
  processScore: {
    triggerClarity: 5,
    moveCatalystClarity: 10,
    leverageStrength: 15,
    peerSupport: 9,
    moneyFlow: 15,
    numberConfirmation: 10,
    segmentQuality: 9,
    contractsProof: 10,
    valuationAttractiveness: 4,
    ownershipContext: 3,
    total: 90,
    rank: "Lead",
  },
  sources: nvdaSources,
  lastUpdated: "2025-02-22",
};

// ── AVGO ──
const avgoSources: SourceItem[] = [
  { id: "avgo-s1", type: "earnings_release", sourceName: "Broadcom IR", sourceUrl: "https://investors.broadcom.com", title: "Broadcom Q1 FY25: AI revenue $4.1B, +220% YoY", date: "2025-03-06", tickerSymbol: "AVGO", contentSnippet: "AI networking and custom ASIC revenue surging. VMware integration on track." },
  { id: "avgo-s2", type: "transcript", sourceName: "Broadcom Earnings Call", sourceUrl: "https://investors.broadcom.com", title: "Hock Tan: 'We see a $60-90B AI SAM by 2027'", date: "2025-03-06", tickerSymbol: "AVGO", contentSnippet: "Three hyperscaler custom AI chip programs ramping. Networking switching to Tomahawk 5." },
  { id: "avgo-s3", type: "news", sourceName: "The Information", sourceUrl: "https://theinformation.com", title: "Apple developing AI chip with Broadcom for data centers", date: "2025-02-28", tickerSymbol: "AVGO", peerTickerSymbol: "AAPL", contentSnippet: "Apple reportedly working with Broadcom on custom AI inference chip." },
];

const avgo: TickerAnalysis = {
  symbol: "AVGO",
  name: "Broadcom Inc.",
  sector: "Technology",
  industry: "Semiconductors",
  exchange: "NASDAQ",
  description: "AI networking, custom ASICs, and infrastructure software",
  price: { dayMovePct: 2.1, weekMovePct: 5.3, monthMovePct: 12.8, quarterMovePct: 35.2, ytdMovePct: 18.9, volumeSpike: false, relativeSectorMovePct: 8.4, price: 228.50, marketCap: "$1.07T" },
  attentionTrigger: {
    triggerType: "earnings",
    triggerSummary: "Q1 FY25 showed AI revenue hitting $4.1B, up 220% YoY. Custom ASIC programs for hyperscalers are the real story.",
    priceContext: "Up 35% in the quarter. Steady grind higher, not a single-day spike.",
    whyThisNameNow: "Broadcom is the #2 AI chip play behind NVIDIA. Custom ASICs for Google, Meta, and potentially Apple are a massive growth vector.",
  },
  stockMove: {
    moveSummary: "Up 2.1% today, 5.3% this week. Steady uptrend on AI ASIC momentum.",
    topCatalysts: [
      { label: "AI revenue acceleration", confidence: 90, summary: "AI revenue $4.1B, +220% YoY. Three hyperscaler ASIC programs.", evidenceSourceIds: ["avgo-s1"] },
      { label: "$60-90B AI SAM by 2027", confidence: 85, summary: "Hock Tan outlined massive addressable market for custom AI chips.", evidenceSourceIds: ["avgo-s2"] },
      { label: "Apple AI chip partnership", confidence: 70, summary: "Reports of Apple working with Broadcom on custom AI inference chip.", evidenceSourceIds: ["avgo-s3"] },
    ],
    primaryCatalyst: "AI revenue acceleration",
    unknownFlag: false,
  },
  industryChain: {
    nodes: [
      { id: "hyperscaler", name: "Hyperscalers", nodeType: "end_demand", role: "Google, Meta, Apple — custom chip buyers", tickers: ["GOOG", "META", "AAPL"] },
      { id: "custom-asic", name: "Custom AI ASICs", nodeType: "bottleneck", role: "Broadcom designs custom chips for hyperscalers", tickers: ["AVGO"] },
      { id: "ai-networking", name: "AI Networking", nodeType: "component", role: "Switches, NICs connecting GPU clusters", tickers: ["AVGO", "MRVL"] },
      { id: "gpu", name: "GPUs", nodeType: "component", role: "NVIDIA GPUs — Broadcom networking connects them", tickers: ["NVDA"] },
      { id: "foundry", name: "TSMC Foundry", nodeType: "supplier", role: "Manufactures Broadcom chips", tickers: ["TSM"] },
    ],
    edges: [
      { from: "hyperscaler", to: "custom-asic", relation: "commissions" },
      { from: "hyperscaler", to: "ai-networking", relation: "purchases" },
      { from: "ai-networking", to: "gpu", relation: "connects" },
      { from: "custom-asic", to: "foundry", relation: "manufactured at" },
    ],
    companyRole: "Broadcom sits at two nodes: custom AI ASICs (designing chips for hyperscalers) and AI networking (connecting GPU clusters). Dual leverage.",
    bottlenecks: ["TSMC advanced packaging capacity", "Custom ASIC design slots"],
  },
  leveragePoint: {
    leverageScore: 82,
    leverageReasoning: "Broadcom has deep relationships with 3+ hyperscalers for custom AI chips. Switching costs are high — chip design takes 2-3 years. Networking position (Tomahawk, Jericho) is strong but faces competition from MRVL.",
    bottleneckType: "switching_cost",
    isBestLeveragePoint: false,
    betterAlternatives: ["NVDA for pure GPU leverage"],
  },
  peerReadthroughs: [
    { sourceCompany: "Google", sourceTicker: "GOOG", sourceDate: "2025-02-04", quote: "We continue to invest heavily in custom TPUs alongside NVIDIA GPUs.", implication: "Google's TPU program is Broadcom-designed. Continued investment = continued AVGO revenue.", direction: "bullish", confidence: 85, segment: "Custom ASIC", sourceItemId: "avgo-s2" },
    { sourceCompany: "NVIDIA", sourceTicker: "NVDA", sourceDate: "2025-02-21", quote: "Networking revenue grew significantly as GPU clusters scale.", implication: "NVDA confirming networking demand growth benefits AVGO's switching business.", direction: "bullish", confidence: 80, sourceItemId: "avgo-s1" },
  ],
  moneyFlow: {
    moneyFlowScore: 82,
    moneyFlowSummary: "Real money flowing through hyperscaler custom chip programs and networking upgrades. Not as concentrated as NVDA but diversified across multiple programs.",
    evidence: [
      { flowType: "custom_chip_programs", strength: "strong", summary: "3 hyperscaler ASIC programs in production/ramp", sourceItemId: "avgo-s2" },
      { flowType: "networking_upgrades", strength: "moderate", summary: "Tomahawk 5 switching deployments accelerating", sourceItemId: "avgo-s1" },
    ],
    durability: "structural",
  },
  companyNumbers: {
    revenueGrowth: "+44% YoY (AI: +220%)",
    epsGrowth: "+38% YoY",
    grossMargin: "74.5%",
    operatingMargin: "42.0%",
    fcfMargin: "38.0%",
    guideDirection: "Above consensus — AI revenue guide raised",
    summary: "Total revenue growing 44% but AI segment is the engine at +220%. VMware integration adding steady software revenue. Margins strong.",
  },
  segments: [
    { segmentName: "AI / Semiconductor Solutions", trend: "accelerating", thesisRole: "core", importanceScore: 85, summary: "$4.1B AI revenue, +220% YoY. Custom ASICs + networking." },
    { segmentName: "Infrastructure Software (VMware)", trend: "stable", thesisRole: "supporting", importanceScore: 40, summary: "VMware integration providing stable, high-margin software revenue." },
    { segmentName: "Broadband", trend: "decelerating", thesisRole: "drag", importanceScore: 5, summary: "Legacy broadband business declining. Irrelevant to thesis." },
  ],
  contractsAdoption: {
    evidence: [
      { customerName: "Google", contractType: "Custom TPU design", stage: "expanding", summary: "Multi-generation TPU partnership continuing with next-gen designs", sourceItemId: "avgo-s2" },
      { customerName: "Meta", contractType: "Custom ASIC", stage: "signed", summary: "MTIA inference chip program with Broadcom", sourceItemId: "avgo-s2" },
      { customerName: "Apple", contractType: "Custom AI chip", stage: "rumored", summary: "Reports of Apple AI data center chip partnership", sourceItemId: "avgo-s3" },
    ],
    adoptionSummary: "Two confirmed hyperscaler programs in production, third rumored. Design wins are sticky — 2-3 year cycles.",
    adoptionScore: 80,
  },
  valuation: {
    pe: 38,
    evSales: 18,
    evEbitda: 30,
    relativeToHistory: "Above historical average but AI growth justifies it",
    relativeToPeers: "Cheaper than NVDA on growth-adjusted basis",
    pricedForPerfection: false,
    summary: "38x PE with AI revenue tripling. More reasonable than NVDA. VMware provides a valuation floor. Not cheap, but not priced for perfection either.",
  },
  ownershipSentiment: {
    institutionalOwnership: "78%",
    shortInterest: "0.8%",
    crowding: "moderate",
    sentiment: "bullish",
    summary: "Well-owned but not as crowded as NVDA. Sentiment is bullish but not euphoric. Good positioning.",
  },
  thesis: {
    summary: "Broadcom is the #2 AI infrastructure play with dual leverage: custom ASICs for hyperscalers and AI networking. Three confirmed chip programs, VMware providing a software floor, and a $60-90B AI SAM by 2027. Less crowded than NVDA with more reasonable valuation.",
    bullCase: "Apple becomes 4th custom ASIC customer. AI networking share gains. VMware cross-sell accelerates. $60-90B SAM materializes.",
    bearCase: "Custom ASIC programs get pulled in-house by hyperscalers. MRVL takes networking share. VMware integration stumbles.",
    whatChangesIt: "Hyperscaler custom chip program cancellations. NVDA networking competing more aggressively. AI capex slowdown.",
    watchItems: ["Apple AI chip confirmation", "Q2 FY25 AI revenue trajectory", "MRVL competitive positioning", "VMware renewal rates"],
  },
  processScore: {
    triggerClarity: 5,
    moveCatalystClarity: 9,
    leverageStrength: 12,
    peerSupport: 8,
    moneyFlow: 12,
    numberConfirmation: 9,
    segmentQuality: 8,
    contractsProof: 8,
    valuationAttractiveness: 7,
    ownershipContext: 4,
    total: 82,
    rank: "Strong Watch",
  },
  sources: avgoSources,
  lastUpdated: "2025-03-06",
};

// ── CIEN (Ciena - Networking/Optical) ──
const cienSources: SourceItem[] = [
  { id: "cien-s1", type: "earnings_release", sourceName: "Ciena IR", sourceUrl: "https://investor.ciena.com", title: "Ciena Q1 FY25: Revenue $1.07B, +18% YoY, orders +40%", date: "2025-03-05", tickerSymbol: "CIEN", contentSnippet: "Order growth accelerating driven by cloud and AI data center interconnect demand." },
  { id: "cien-s2", type: "news", sourceName: "Light Reading", sourceUrl: "https://lightreading.com", title: "AI data center buildout driving massive fiber demand", date: "2025-02-20", tickerSymbol: "CIEN", contentSnippet: "GPU clusters require 10-100x more east-west bandwidth. Optical networking is the bottleneck." },
  { id: "cien-s3", type: "analyst", sourceName: "Goldman Sachs", sourceUrl: "https://gs.com", title: "Ciena upgraded to Buy — AI networking cycle just starting", date: "2025-03-06", tickerSymbol: "CIEN", contentSnippet: "We see a multi-year upgrade cycle for optical networking driven by AI cluster interconnect." },
];

const cien: TickerAnalysis = {
  symbol: "CIEN",
  name: "Ciena Corporation",
  sector: "Technology",
  industry: "Networking Equipment",
  exchange: "NYSE",
  description: "Optical networking and intelligent automation software",
  price: { dayMovePct: 4.8, weekMovePct: 12.3, monthMovePct: 22.1, quarterMovePct: 45.6, ytdMovePct: 38.2, volumeSpike: true, relativeSectorMovePct: 18.5, price: 89.30, marketCap: "$12.8B" },
  attentionTrigger: {
    triggerType: "earnings",
    triggerSummary: "Q1 FY25 orders surged 40% YoY. Revenue beat. AI data center interconnect is driving a new cycle.",
    priceContext: "Stock up 45.6% in the quarter. Breakout above 2-year range. Volume spiking on earnings.",
    whyThisNameNow: "AI GPU clusters need massive bandwidth between nodes. Optical networking is the next bottleneck after GPUs and power.",
  },
  stockMove: {
    moveSummary: "Up 4.8% today, 12.3% this week. Post-earnings breakout on 40% order growth.",
    topCatalysts: [
      { label: "Order growth +40% YoY", confidence: 95, summary: "Orders surging on AI data center interconnect demand.", evidenceSourceIds: ["cien-s1"] },
      { label: "AI bandwidth bottleneck narrative", confidence: 80, summary: "Market recognizing optical networking as next AI infrastructure bottleneck.", evidenceSourceIds: ["cien-s2"] },
      { label: "Goldman upgrade", confidence: 70, summary: "Upgraded to Buy with multi-year AI networking thesis.", evidenceSourceIds: ["cien-s3"] },
    ],
    primaryCatalyst: "Order growth +40% YoY",
    unknownFlag: false,
  },
  industryChain: {
    nodes: [
      { id: "ai-workloads", name: "AI Training/Inference", nodeType: "end_demand", role: "Drives bandwidth demand" },
      { id: "gpu-clusters", name: "GPU Clusters", nodeType: "platform", role: "Need interconnect", tickers: ["NVDA"] },
      { id: "optical", name: "Optical Networking", nodeType: "bottleneck", role: "Long-haul and DCI bandwidth", tickers: ["CIEN", "INFN"] },
      { id: "transceivers", name: "Optical Transceivers", nodeType: "component", role: "800G/1.6T modules", tickers: ["LITE", "COHR"] },
      { id: "fiber", name: "Fiber Optic Cable", nodeType: "supplier", role: "Physical fiber infrastructure", tickers: ["CRNT", "GLW"] },
    ],
    edges: [
      { from: "ai-workloads", to: "gpu-clusters", relation: "runs on" },
      { from: "gpu-clusters", to: "optical", relation: "connected by" },
      { from: "optical", to: "transceivers", relation: "uses" },
      { from: "optical", to: "fiber", relation: "runs over" },
    ],
    companyRole: "Ciena provides the optical networking systems that connect AI data centers. As GPU clusters scale, east-west bandwidth demand explodes.",
    bottlenecks: ["Optical transceiver supply (800G)", "Fiber availability in key corridors"],
  },
  leveragePoint: {
    leverageScore: 68,
    leverageReasoning: "Ciena benefits from AI bandwidth demand but is not the primary bottleneck. Competition from Infinera (acquired by Nokia) and Huawei exists. Leverage is real but not monopolistic like NVDA.",
    bottleneckType: "infrastructure",
    isBestLeveragePoint: false,
    betterAlternatives: ["NVDA for compute leverage", "AVGO for networking switching"],
  },
  peerReadthroughs: [
    { sourceCompany: "NVIDIA", sourceTicker: "NVDA", sourceDate: "2025-02-21", quote: "GPU cluster sizes are growing from thousands to tens of thousands of GPUs.", implication: "Larger clusters = exponentially more east-west bandwidth = more Ciena equipment.", direction: "bullish", confidence: 85, sourceItemId: "cien-s2" },
    { sourceCompany: "Corning", sourceTicker: "GLW", sourceDate: "2025-02-05", quote: "Optical fiber demand for data centers is accelerating beyond our capacity additions.", implication: "Fiber demand confirms the bandwidth buildout that Ciena equipment serves.", direction: "bullish", confidence: 75, sourceItemId: "cien-s2" },
  ],
  moneyFlow: {
    moneyFlowScore: 72,
    moneyFlowSummary: "Orders are the hard signal — 40% growth. Hyperscalers are placing real orders for optical equipment. Not as concentrated as GPU spending but clearly accelerating.",
    evidence: [
      { flowType: "order_growth", strength: "strong", summary: "Orders +40% YoY, driven by cloud and AI customers", sourceItemId: "cien-s1" },
      { flowType: "capex_commentary", strength: "moderate", summary: "Hyperscalers mentioning networking upgrades in capex plans", sourceItemId: "cien-s2" },
    ],
    durability: "cyclical",
  },
  companyNumbers: {
    revenueGrowth: "+18% YoY",
    epsGrowth: "+32% YoY",
    grossMargin: "45.2%",
    operatingMargin: "14.8%",
    fcfMargin: "12.0%",
    guideDirection: "Raised — full year revenue guide increased",
    summary: "Revenue growing 18% with orders growing 40% — backlog building. Margins expanding. Not NVDA-level growth but a clear inflection.",
  },
  segments: [
    { segmentName: "Networking Platforms", trend: "accelerating", thesisRole: "core", importanceScore: 80, summary: "Optical networking hardware. AI DCI driving the acceleration." },
    { segmentName: "Platform Software & Services", trend: "stable", thesisRole: "supporting", importanceScore: 30, summary: "Recurring software revenue. Steady but not the growth driver." },
  ],
  contractsAdoption: {
    evidence: [
      { contractType: "Cloud orders", stage: "expanding", summary: "Multiple hyperscaler orders for 400G/800G optical systems", sourceItemId: "cien-s1" },
      { contractType: "DCI buildout", stage: "expanding", summary: "Data center interconnect deployments accelerating", sourceItemId: "cien-s2" },
    ],
    adoptionSummary: "Real orders from real customers. 40% order growth is hard evidence. But customer names are less public than NVDA's.",
    adoptionScore: 68,
  },
  valuation: {
    pe: 28,
    evSales: 3.2,
    evEbitda: 18,
    relativeToHistory: "Above 3-year average but below 2021 peak",
    relativeToPeers: "Reasonable vs networking peers",
    pricedForPerfection: false,
    summary: "28x PE with 40% order growth and revenue accelerating. Not expensive. If the AI networking cycle plays out, this re-rates higher.",
  },
  ownershipSentiment: {
    institutionalOwnership: "92%",
    shortInterest: "4.2%",
    crowding: "low",
    sentiment: "turning bullish",
    summary: "Under-owned by hedge funds. Short interest still elevated — potential squeeze fuel. Sentiment is turning but not crowded yet. Good setup.",
  },
  thesis: {
    summary: "Ciena is a leveraged play on AI bandwidth demand. GPU clusters need exponentially more optical networking as they scale. Orders are surging 40%, revenue is inflecting, and the stock is breaking out. Not a monopoly like NVDA but a clear beneficiary with reasonable valuation and low crowding.",
    bullCase: "AI bandwidth demand is multi-year. 800G/1.6T upgrade cycle extends. Market share gains from Nokia/Infinera. Short squeeze potential.",
    bearCase: "Cyclical networking company — orders could peak and decline. Competition from Nokia (Infinera). Hyperscalers could slow capex.",
    whatChangesIt: "Order growth deceleration. Hyperscaler capex cuts. Competitive losses. Margin compression.",
    watchItems: ["Q2 FY25 order trends", "800G transceiver supply", "Hyperscaler capex commentary", "Nokia/Infinera competitive wins"],
  },
  processScore: {
    triggerClarity: 5,
    moveCatalystClarity: 9,
    leverageStrength: 10,
    peerSupport: 7,
    moneyFlow: 11,
    numberConfirmation: 8,
    segmentQuality: 7,
    contractsProof: 7,
    valuationAttractiveness: 8,
    ownershipContext: 4,
    total: 76,
    rank: "Strong Watch",
  },
  sources: cienSources,
  lastUpdated: "2025-03-06",
};

// ── MELI (MercadoLibre - Internet/LatAm) ──
const meliSources: SourceItem[] = [
  { id: "meli-s1", type: "earnings_release", sourceName: "MercadoLibre IR", sourceUrl: "https://investor.mercadolibre.com", title: "MELI Q4 2024: Revenue $6.1B, +37% YoY FX-neutral", date: "2025-02-20", tickerSymbol: "MELI", contentSnippet: "GMV +28%, TPV +45%. Fintech (Mercado Pago) growing faster than commerce." },
  { id: "meli-s2", type: "news", sourceName: "Bloomberg", sourceUrl: "https://bloomberg.com", title: "Latin America e-commerce penetration still under 15%", date: "2025-02-10", tickerSymbol: "MELI", contentSnippet: "LatAm e-commerce penetration is 12-15% vs 25-30% in the US. Massive runway." },
  { id: "meli-s3", type: "transcript", sourceName: "MELI Earnings Call", sourceUrl: "https://investor.mercadolibre.com", title: "Marcos Galperin: 'Credit book growing 50%+ with improving NPLs'", date: "2025-02-20", tickerSymbol: "MELI", contentSnippet: "Mercado Credito credit book expanding rapidly. NPL ratios improving as models mature." },
];

const meli: TickerAnalysis = {
  symbol: "MELI",
  name: "MercadoLibre Inc.",
  sector: "Consumer Discretionary",
  industry: "Internet Retail / Fintech",
  exchange: "NASDAQ",
  description: "Latin America's largest e-commerce and fintech platform",
  price: { dayMovePct: -1.2, weekMovePct: 2.4, monthMovePct: -5.3, quarterMovePct: 8.7, ytdMovePct: 4.2, volumeSpike: false, relativeSectorMovePct: 3.1, price: 1842.00, marketCap: "$93B" },
  attentionTrigger: {
    triggerType: "theme",
    triggerSummary: "LatAm digital economy theme. E-commerce penetration at 12-15% with massive runway. Fintech adoption accelerating.",
    priceContext: "Stock consolidating after strong 2024. Down 5% in the past month but up 8.7% on the quarter.",
    whyThisNameNow: "MELI is the dominant platform in LatAm — Amazon + PayPal + Square in one. Fintech is now the bigger growth driver.",
  },
  stockMove: {
    moveSummary: "Down 1.2% today, up 2.4% this week. Consolidating after Q4 earnings.",
    topCatalysts: [
      { label: "Q4 earnings beat", confidence: 80, summary: "Revenue $6.1B, +37% FX-neutral. Fintech TPV +45%.", evidenceSourceIds: ["meli-s1"] },
      { label: "Credit book expansion", confidence: 75, summary: "Mercado Credito growing 50%+ with improving credit quality.", evidenceSourceIds: ["meli-s3"] },
      { label: "LatAm penetration runway", confidence: 85, summary: "E-commerce at 12-15% penetration. Years of growth ahead.", evidenceSourceIds: ["meli-s2"] },
    ],
    primaryCatalyst: "Q4 earnings beat",
    unknownFlag: false,
  },
  industryChain: {
    nodes: [
      { id: "consumer", name: "LatAm Consumers", nodeType: "end_demand", role: "300M+ internet users" },
      { id: "marketplace", name: "E-Commerce Platform", nodeType: "platform", role: "MercadoLibre marketplace", tickers: ["MELI"] },
      { id: "fintech", name: "Digital Payments / Lending", nodeType: "platform", role: "Mercado Pago + Credito", tickers: ["MELI", "NU"] },
      { id: "logistics", name: "Logistics / Fulfillment", nodeType: "infra", role: "Mercado Envios", tickers: ["MELI"] },
      { id: "sellers", name: "Merchants / SMBs", nodeType: "supplier", role: "Millions of sellers on platform" },
    ],
    edges: [
      { from: "consumer", to: "marketplace", relation: "shops on" },
      { from: "consumer", to: "fintech", relation: "pays/borrows via" },
      { from: "marketplace", to: "logistics", relation: "fulfilled by" },
      { from: "sellers", to: "marketplace", relation: "sells on" },
      { from: "sellers", to: "fintech", relation: "gets paid via" },
    ],
    companyRole: "MELI owns the entire stack: marketplace, payments, lending, logistics. Vertically integrated LatAm digital economy platform.",
    bottlenecks: ["Logistics infrastructure in LatAm", "Credit risk management"],
  },
  leveragePoint: {
    leverageScore: 78,
    leverageReasoning: "MELI has dominant market share in LatAm e-commerce and fintech. Network effects are strong — more buyers attract more sellers attract more buyers. Logistics moat is widening. But LatAm macro risk is real.",
    bottleneckType: "platform",
    isBestLeveragePoint: true,
    betterAlternatives: [],
  },
  peerReadthroughs: [
    { sourceCompany: "Nu Holdings", sourceTicker: "NU", sourceDate: "2025-02-20", quote: "Digital banking adoption in Brazil continues to accelerate. We added 5M customers in Q4.", implication: "NU confirming digital finance adoption in LatAm supports MELI's fintech growth.", direction: "bullish", confidence: 75, segment: "Fintech", sourceItemId: "meli-s1" },
  ],
  moneyFlow: {
    moneyFlowScore: 65,
    moneyFlowSummary: "Money flowing through consumer adoption and merchant onboarding. Less visible than B2B capex but GMV and TPV growth are the hard signals.",
    evidence: [
      { flowType: "gmv_growth", strength: "strong", summary: "GMV +28% YoY — real transaction volume", sourceItemId: "meli-s1" },
      { flowType: "credit_expansion", strength: "moderate", summary: "Credit book growing 50%+ with improving NPLs", sourceItemId: "meli-s3" },
    ],
    durability: "structural",
  },
  companyNumbers: {
    revenueGrowth: "+37% YoY (FX-neutral)",
    epsGrowth: "+42% YoY",
    grossMargin: "52.0%",
    operatingMargin: "18.5%",
    fcfMargin: "15.0%",
    guideDirection: "No formal guide but commentary positive",
    summary: "37% revenue growth at $93B market cap. Margins expanding. Fintech growing faster than commerce. Credit quality improving.",
  },
  segments: [
    { segmentName: "Commerce (Marketplace + Logistics)", trend: "stable", thesisRole: "core", importanceScore: 60, summary: "GMV +28%. Marketplace is the foundation. Logistics moat widening." },
    { segmentName: "Fintech (Pago + Credito)", trend: "accelerating", thesisRole: "core", importanceScore: 80, summary: "TPV +45%, credit book +50%. This is becoming the bigger story." },
  ],
  contractsAdoption: {
    evidence: [
      { contractType: "User growth", stage: "expanding", summary: "Active users growing double-digits across all markets", sourceItemId: "meli-s1" },
      { contractType: "Merchant adoption", stage: "expanding", summary: "SMB adoption of Mercado Pago accelerating", sourceItemId: "meli-s1" },
    ],
    adoptionSummary: "Adoption is organic and broad-based. Not contract-driven like enterprise — it's consumer/merchant network effects.",
    adoptionScore: 72,
  },
  valuation: {
    pe: 52,
    evSales: 5.8,
    evEbitda: 28,
    relativeToHistory: "Below 2021 highs, above 2022 lows",
    relativeToPeers: "Premium to LatAm peers, discount to US platform comps on growth-adjusted basis",
    pricedForPerfection: false,
    summary: "52x PE looks rich but this is a 37% grower with expanding margins in a massive underpenetrated market. Not cheap but not priced for perfection.",
  },
  ownershipSentiment: {
    institutionalOwnership: "82%",
    shortInterest: "1.5%",
    crowding: "moderate",
    sentiment: "bullish",
    summary: "Well-owned by growth funds. Not overcrowded. LatAm macro fears keep some investors away, which is actually healthy.",
  },
  thesis: {
    summary: "MELI is the dominant LatAm digital economy platform with a massive runway — e-commerce at 12-15% penetration, fintech adoption accelerating, and credit expanding with improving quality. Vertically integrated moat. The risk is LatAm macro and currency, not competition.",
    bullCase: "Fintech becomes bigger than commerce. Credit book scales profitably. LatAm penetration catches up to global averages. Advertising revenue emerges.",
    bearCase: "LatAm recession. Currency devaluation. Credit losses spike. Regulatory crackdown on fintech lending.",
    whatChangesIt: "Brazil/Argentina macro deterioration. NPL spike. GMV growth deceleration. Competitive entry by Amazon or local players.",
    watchItems: ["Q1 2025 earnings", "Brazil macro indicators", "Credit quality trends", "Argentina policy changes"],
  },
  processScore: {
    triggerClarity: 4,
    moveCatalystClarity: 8,
    leverageStrength: 12,
    peerSupport: 6,
    moneyFlow: 10,
    numberConfirmation: 8,
    segmentQuality: 8,
    contractsProof: 7,
    valuationAttractiveness: 6,
    ownershipContext: 4,
    total: 73,
    rank: "Strong Watch",
  },
  sources: meliSources,
  lastUpdated: "2025-02-20",
};

// ── META ──
const metaSources: SourceItem[] = [
  { id: "meta-s1", type: "earnings_release", sourceName: "Meta IR", sourceUrl: "https://investor.fb.com", title: "Meta Q4 2024: Revenue $40.1B, +25% YoY. AI driving engagement.", date: "2025-01-29", tickerSymbol: "META", contentSnippet: "AI recommendations driving 8% increase in time spent on Instagram. Reels monetization improving." },
  { id: "meta-s2", type: "news", sourceName: "The Verge", sourceUrl: "https://theverge.com", title: "Meta to spend $60-65B on AI capex in 2025", date: "2025-01-29", tickerSymbol: "META", contentSnippet: "Zuckerberg doubling down on AI infrastructure. Largest capex budget in company history." },
  { id: "meta-s3", type: "analyst", sourceName: "JPMorgan", sourceUrl: "https://jpmorgan.com", title: "META: AI monetization inflection underappreciated", date: "2025-02-01", tickerSymbol: "META", contentSnippet: "AI-driven ad targeting improvements could add $10B+ in incremental revenue by 2026." },
];

const meta: TickerAnalysis = {
  symbol: "META",
  name: "Meta Platforms Inc.",
  sector: "Communication Services",
  industry: "Social Media / Advertising",
  exchange: "NASDAQ",
  description: "Social media platforms and AI/metaverse investments",
  price: { dayMovePct: 0.8, weekMovePct: 3.1, monthMovePct: 7.2, quarterMovePct: 18.4, ytdMovePct: 12.6, volumeSpike: false, relativeSectorMovePct: 5.3, price: 612.00, marketCap: "$1.55T" },
  attentionTrigger: {
    triggerType: "earnings",
    triggerSummary: "Q4 2024 beat. AI driving engagement and ad targeting improvements. But the real attention-getter: $60-65B capex budget for 2025.",
    priceContext: "Steady uptrend. Up 18.4% on the quarter. No dramatic moves — just grinding higher.",
    whyThisNameNow: "Meta is both an AI beneficiary (ad targeting) and an AI spender ($65B capex). Dual angle.",
  },
  stockMove: {
    moveSummary: "Up 0.8% today, 3.1% this week. Steady grind higher post-earnings.",
    topCatalysts: [
      { label: "AI-driven engagement gains", confidence: 85, summary: "AI recommendations driving 8% more time on Instagram. Direct monetization impact.", evidenceSourceIds: ["meta-s1"] },
      { label: "$60-65B AI capex", confidence: 80, summary: "Massive AI infrastructure investment. Market debating ROI.", evidenceSourceIds: ["meta-s2"] },
      { label: "Ad targeting improvements", confidence: 80, summary: "AI improving ad relevance and conversion rates.", evidenceSourceIds: ["meta-s3"] },
    ],
    primaryCatalyst: "AI-driven engagement gains",
    unknownFlag: false,
  },
  industryChain: {
    nodes: [
      { id: "advertisers", name: "Advertisers", nodeType: "end_demand", role: "Brands spending on digital ads" },
      { id: "social", name: "Social Platforms", nodeType: "platform", role: "FB, Instagram, WhatsApp", tickers: ["META"] },
      { id: "ai-infra", name: "AI Infrastructure", nodeType: "infra", role: "GPU clusters for AI models", tickers: ["NVDA", "AVGO"] },
      { id: "users", name: "Users (3.3B)", nodeType: "end_demand", role: "Daily active users across apps" },
    ],
    edges: [
      { from: "advertisers", to: "social", relation: "buys ads on" },
      { from: "users", to: "social", relation: "engages with" },
      { from: "social", to: "ai-infra", relation: "powered by" },
    ],
    companyRole: "Meta is the platform layer — connecting 3.3B users with advertisers, powered by AI. Both a consumer of AI infrastructure and a monetizer of AI capabilities.",
    bottlenecks: ["AI model quality", "Regulatory risk (EU, US)"],
  },
  leveragePoint: {
    leverageScore: 72,
    leverageReasoning: "Meta has massive distribution (3.3B users) and is using AI to improve monetization. But it's not a bottleneck — it's a beneficiary. The leverage is in the user base and data moat, not in supply scarcity.",
    bottleneckType: "platform",
    isBestLeveragePoint: false,
    betterAlternatives: ["NVDA for AI infrastructure leverage", "GOOG for search + AI leverage"],
  },
  peerReadthroughs: [
    { sourceCompany: "Google", sourceTicker: "GOOG", sourceDate: "2025-02-04", quote: "AI-driven search improvements driving higher ad engagement and revenue per query.", implication: "Google confirming AI improves ad monetization — same thesis applies to Meta.", direction: "bullish", confidence: 80, segment: "Advertising", sourceItemId: "meta-s1" },
    { sourceCompany: "Snap", sourceTicker: "SNAP", sourceDate: "2025-02-06", quote: "We're seeing improved ad performance from AI-powered targeting.", implication: "Even smaller platforms seeing AI ad benefits — Meta with more data should benefit more.", direction: "bullish", confidence: 65, sourceItemId: "meta-s1" },
  ],
  moneyFlow: {
    moneyFlowScore: 70,
    moneyFlowSummary: "Ad revenue is the money flow signal. $40B quarterly revenue growing 25%. Advertisers are spending. The $65B capex is Meta spending money, not receiving it — that's the risk.",
    evidence: [
      { flowType: "ad_revenue", strength: "strong", summary: "Ad revenue $38.7B in Q4, +24% YoY", sourceItemId: "meta-s1" },
      { flowType: "capex_spending", strength: "moderate", summary: "$60-65B capex budget — investing ahead of revenue", sourceItemId: "meta-s2" },
    ],
    durability: "structural",
  },
  companyNumbers: {
    revenueGrowth: "+25% YoY",
    epsGrowth: "+35% YoY",
    grossMargin: "82.0%",
    operatingMargin: "41.0%",
    fcfMargin: "33.0%",
    guideDirection: "Q1 guide in-line. Full year capex guide spooked some investors.",
    summary: "25% revenue growth at $1.5T market cap is impressive. Margins are best-in-class. The debate is whether $65B capex will generate adequate returns.",
  },
  segments: [
    { segmentName: "Family of Apps (FB, IG, WhatsApp)", trend: "accelerating", thesisRole: "core", importanceScore: 95, summary: "$39.9B revenue, +25% YoY. AI driving engagement and ad performance." },
    { segmentName: "Reality Labs (VR/AR)", trend: "declining", thesisRole: "drag", importanceScore: 5, summary: "$1.1B revenue, -$4.6B operating loss. Still a cash furnace." },
  ],
  contractsAdoption: {
    evidence: [
      { contractType: "Advertiser adoption", stage: "expanding", summary: "AI-powered Advantage+ campaigns adopted by majority of top advertisers", sourceItemId: "meta-s1" },
      { contractType: "Llama adoption", stage: "expanding", summary: "Llama open-source AI model widely adopted, building ecosystem", sourceItemId: "meta-s2" },
    ],
    adoptionSummary: "Advertiser adoption of AI tools is broad. Llama ecosystem growing. But these aren't traditional contracts — it's platform adoption.",
    adoptionScore: 70,
  },
  valuation: {
    pe: 26,
    evSales: 9.5,
    evEbitda: 18,
    relativeToHistory: "In-line with 3-year average",
    relativeToPeers: "Cheaper than GOOG on PE, cheaper than AMZN",
    pricedForPerfection: false,
    summary: "26x PE for 25% growth and 41% operating margins. Actually reasonable. The capex concern is real but margins are absorbing it so far.",
  },
  ownershipSentiment: {
    institutionalOwnership: "80%",
    shortInterest: "0.7%",
    crowding: "moderate",
    sentiment: "bullish",
    summary: "Broadly owned. Not overcrowded. Sentiment is bullish but capex concerns keep it from euphoria. Healthy setup.",
  },
  thesis: {
    summary: "Meta is using AI to improve its core advertising business — better targeting, better engagement, better monetization. 25% growth at 26x PE with 41% margins is compelling. The risk is the $65B capex bet — if AI doesn't generate adequate returns, margins compress. But so far, the numbers say it's working.",
    bullCase: "AI ad improvements add $10B+ incremental revenue. Reels monetization closes gap with feed. WhatsApp business messaging scales. Llama ecosystem creates platform value.",
    bearCase: "$65B capex doesn't generate returns. Reality Labs losses continue. Regulatory crackdown on data usage. TikTok competition intensifies.",
    whatChangesIt: "Margin compression from capex. Ad growth deceleration. Regulatory action. AI ROI not materializing.",
    watchItems: ["Q1 2025 ad revenue growth", "Capex efficiency metrics", "Reality Labs loss trajectory", "Regulatory developments"],
  },
  processScore: {
    triggerClarity: 4,
    moveCatalystClarity: 8,
    leverageStrength: 10,
    peerSupport: 7,
    moneyFlow: 10,
    numberConfirmation: 9,
    segmentQuality: 7,
    contractsProof: 7,
    valuationAttractiveness: 8,
    ownershipContext: 4,
    total: 74,
    rank: "Strong Watch",
  },
  sources: metaSources,
  lastUpdated: "2025-01-29",
};

// ── CAT (Caterpillar - Industrial) ──
const catSources: SourceItem[] = [
  { id: "cat-s1", type: "earnings_release", sourceName: "Caterpillar IR", sourceUrl: "https://www.caterpillar.com/en/investors.html", title: "CAT Q4 2024: Revenue $16.2B, -5% YoY. Margins held.", date: "2025-01-28", tickerSymbol: "CAT", contentSnippet: "Revenue declined on lower equipment volumes but margins expanded on pricing and services." },
  { id: "cat-s2", type: "news", sourceName: "WSJ", sourceUrl: "https://wsj.com", title: "US infrastructure spending ramp: $1.2T in federal projects entering execution phase", date: "2025-02-15", tickerSymbol: "CAT", contentSnippet: "IIJA and IRA projects moving from planning to execution. Heavy equipment demand expected to rise." },
  { id: "cat-s3", type: "transcript", sourceName: "CAT Earnings Call", sourceUrl: "https://www.caterpillar.com/en/investors.html", title: "Jim Umpleby: 'Data center construction is a new growth vector'", date: "2025-01-28", tickerSymbol: "CAT", contentSnippet: "AI data center construction driving demand for large excavators, generators, and power systems." },
];

const cat: TickerAnalysis = {
  symbol: "CAT",
  name: "Caterpillar Inc.",
  sector: "Industrials",
  industry: "Construction & Mining Equipment",
  exchange: "NYSE",
  description: "Heavy equipment, power systems, and construction machinery",
  price: { dayMovePct: -0.5, weekMovePct: 1.2, monthMovePct: 3.8, quarterMovePct: -2.1, ytdMovePct: 1.5, volumeSpike: false, relativeSectorMovePct: -1.2, price: 378.00, marketCap: "$182B" },
  attentionTrigger: {
    triggerType: "theme",
    triggerSummary: "AI data center construction theme + US infrastructure spending ramp. CAT supplies the heavy equipment for both.",
    priceContext: "Stock flat on the quarter. Market hasn't fully priced in the data center construction angle.",
    whyThisNameNow: "Every AI data center needs to be physically built. CAT sells the excavators, generators, and power systems for construction.",
  },
  stockMove: {
    moveSummary: "Down 0.5% today, up 1.2% this week. Flat — market hasn't bought the AI angle yet.",
    topCatalysts: [
      { label: "Data center construction demand", confidence: 70, summary: "AI data centers driving new demand for heavy equipment and power systems.", evidenceSourceIds: ["cat-s3"] },
      { label: "Infrastructure spending ramp", confidence: 75, summary: "$1.2T in federal projects entering execution phase.", evidenceSourceIds: ["cat-s2"] },
      { label: "Margin resilience", confidence: 80, summary: "Revenue down 5% but margins expanded on pricing power and services.", evidenceSourceIds: ["cat-s1"] },
    ],
    primaryCatalyst: "Data center construction demand",
    unknownFlag: true,
  },
  industryChain: {
    nodes: [
      { id: "ai-dc", name: "AI Data Centers", nodeType: "end_demand", role: "Physical construction of data centers", tickers: ["EQIX", "DLR"] },
      { id: "infra", name: "US Infrastructure", nodeType: "end_demand", role: "Roads, bridges, energy projects" },
      { id: "equipment", name: "Heavy Equipment", nodeType: "component", role: "Excavators, loaders, generators", tickers: ["CAT", "DE"] },
      { id: "power", name: "Power Systems", nodeType: "component", role: "Generators, turbines for data centers", tickers: ["CAT", "VRTX"] },
      { id: "mining", name: "Mining", nodeType: "end_demand", role: "Copper, lithium for electrification" },
    ],
    edges: [
      { from: "ai-dc", to: "equipment", relation: "requires" },
      { from: "ai-dc", to: "power", relation: "needs backup/primary power" },
      { from: "infra", to: "equipment", relation: "requires" },
      { from: "mining", to: "equipment", relation: "uses" },
    ],
    companyRole: "CAT supplies the physical construction equipment and power systems needed to build AI data centers and infrastructure projects.",
    bottlenecks: ["Skilled labor for construction", "Permitting delays"],
  },
  leveragePoint: {
    leverageScore: 45,
    leverageReasoning: "CAT benefits from data center construction but is not a bottleneck. Heavy equipment is available from multiple suppliers. The leverage is indirect — CAT is a derivative play, not a direct AI beneficiary.",
    bottleneckType: "infrastructure",
    isBestLeveragePoint: false,
    betterAlternatives: ["NVDA for direct AI leverage", "VRTX for power/cooling leverage", "EQIX for data center REIT exposure"],
  },
  peerReadthroughs: [
    { sourceCompany: "Eaton", sourceTicker: "ETN", sourceDate: "2025-02-05", quote: "Data center power demand is the strongest we've ever seen. Backlog up 50%.", implication: "Power demand for data centers confirms the physical buildout that CAT equipment serves.", direction: "bullish", confidence: 65, sourceItemId: "cat-s3" },
  ],
  moneyFlow: {
    moneyFlowScore: 55,
    moneyFlowSummary: "Infrastructure spending is real ($1.2T federal) and data center construction is accelerating. But it's hard to isolate how much flows specifically to CAT vs competitors.",
    evidence: [
      { flowType: "federal_spending", strength: "strong", summary: "$1.2T in infrastructure projects entering execution", amount: "$1.2T", sourceItemId: "cat-s2" },
      { flowType: "dc_construction", strength: "moderate", summary: "Data center construction starts accelerating", sourceItemId: "cat-s3" },
    ],
    durability: "cyclical",
  },
  companyNumbers: {
    revenueGrowth: "-5% YoY",
    epsGrowth: "+2% YoY (margin expansion)",
    grossMargin: "37.5%",
    operatingMargin: "22.8%",
    fcfMargin: "18.0%",
    guideDirection: "Flat — expects 2025 revenue similar to 2024",
    summary: "Revenue declining but margins expanding. Pricing power is real. The question is whether data center and infra spending inflect revenue growth in H2 2025.",
  },
  segments: [
    { segmentName: "Construction Industries", trend: "decelerating", thesisRole: "core", importanceScore: 50, summary: "Revenue declining on dealer inventory normalization. Should inflect with infra spending." },
    { segmentName: "Resource Industries (Mining)", trend: "stable", thesisRole: "supporting", importanceScore: 30, summary: "Mining equipment demand stable. Copper/lithium demand could accelerate." },
    { segmentName: "Energy & Transportation", trend: "accelerating", thesisRole: "core", importanceScore: 60, summary: "Power generation and gas turbines. Data center power is the growth driver." },
  ],
  contractsAdoption: {
    evidence: [
      { contractType: "Federal infrastructure", stage: "expanding", summary: "IIJA projects entering execution phase — equipment orders expected", sourceItemId: "cat-s2" },
      { contractType: "Data center power", stage: "expanding", summary: "Generator and power system orders from data center builders", sourceItemId: "cat-s3" },
    ],
    adoptionSummary: "Federal spending is committed but execution is slow. Data center power orders are real but early. Less concrete than NVDA-style contracts.",
    adoptionScore: 50,
  },
  valuation: {
    pe: 17,
    evSales: 2.8,
    evEbitda: 12,
    relativeToHistory: "In-line with historical average",
    relativeToPeers: "Slight premium to DE, discount to industrial growth names",
    pricedForPerfection: false,
    summary: "17x PE for a cyclical industrial with pricing power and potential AI/infra catalysts. Not expensive. If revenue inflects, stock re-rates.",
  },
  ownershipSentiment: {
    institutionalOwnership: "72%",
    shortInterest: "2.1%",
    crowding: "low",
    sentiment: "neutral",
    summary: "Not a crowded trade. Sentiment is neutral — market hasn't bought the AI data center angle. Could be an opportunity if the thesis plays out.",
  },
  thesis: {
    summary: "CAT is an indirect AI play through data center construction and power systems, plus a direct infrastructure play through $1.2T in federal spending. Revenue is declining but margins are expanding. The stock is cheap at 17x PE. The risk is that the AI/infra catalysts take longer to materialize than expected.",
    bullCase: "Data center construction boom drives equipment and power system orders. Infrastructure spending inflects. Mining demand recovers on copper/lithium. Revenue re-accelerates in H2 2025.",
    bearCase: "Cyclical downturn. Infrastructure spending delayed. Data center angle is overhyped for CAT specifically. Revenue continues declining.",
    whatChangesIt: "Revenue growth turning positive. Data center order wins. Infrastructure project acceleration. Recession fears.",
    watchItems: ["Q1 2025 order trends", "Data center power system orders", "Infrastructure project starts", "Dealer inventory levels"],
  },
  processScore: {
    triggerClarity: 3,
    moveCatalystClarity: 6,
    leverageStrength: 7,
    peerSupport: 5,
    moneyFlow: 8,
    numberConfirmation: 5,
    segmentQuality: 6,
    contractsProof: 5,
    valuationAttractiveness: 8,
    ownershipContext: 4,
    total: 57,
    rank: "Watch",
  },
  sources: catSources,
  lastUpdated: "2025-01-28",
};

// ── Theme: AI Infrastructure ──
export interface ThemeAnalysis {
  id: string;
  name: string;
  description: string;
  chainNodes: ChainNode[];
  chainEdges: ChainEdge[];
  candidateStocks: { symbol: string; role: string; leverageScore: number }[];
  summary: string;
}

export const aiInfraTheme: ThemeAnalysis = {
  id: "ai-infrastructure",
  name: "AI Infrastructure",
  description: "The full stack of hardware, networking, and power needed to train and run AI models at scale.",
  chainNodes: [
    { id: "ai-apps", name: "AI Applications", nodeType: "end_demand", role: "ChatGPT, Copilot, AI agents" },
    { id: "hyperscalers", name: "Hyperscalers", nodeType: "platform", role: "Cloud providers building AI capacity", tickers: ["MSFT", "GOOG", "AMZN", "META"] },
    { id: "gpus", name: "AI Accelerators", nodeType: "bottleneck", role: "GPUs and custom ASICs", tickers: ["NVDA", "AMD", "AVGO"] },
    { id: "hbm", name: "HBM Memory", nodeType: "component", role: "High-bandwidth memory", tickers: ["MU"] },
    { id: "networking", name: "AI Networking", nodeType: "component", role: "Switches, optics, DCI", tickers: ["AVGO", "MRVL", "CIEN"] },
    { id: "power", name: "Power & Cooling", nodeType: "infra", role: "Data center power infrastructure", tickers: ["VRTX", "ETN"] },
    { id: "foundry", name: "Foundry / Packaging", nodeType: "supplier", role: "Chip manufacturing", tickers: ["TSM"] },
    { id: "construction", name: "DC Construction", nodeType: "infra", role: "Physical buildout", tickers: ["CAT"] },
  ],
  chainEdges: [
    { from: "ai-apps", to: "hyperscalers", relation: "hosted by" },
    { from: "hyperscalers", to: "gpus", relation: "purchases" },
    { from: "gpus", to: "hbm", relation: "requires" },
    { from: "gpus", to: "networking", relation: "connected by" },
    { from: "hyperscalers", to: "power", relation: "powered by" },
    { from: "gpus", to: "foundry", relation: "manufactured at" },
    { from: "hyperscalers", to: "construction", relation: "built by" },
  ],
  candidateStocks: [
    { symbol: "NVDA", role: "GPU monopoly — primary bottleneck", leverageScore: 95 },
    { symbol: "AVGO", role: "Custom ASICs + networking", leverageScore: 82 },
    { symbol: "CIEN", role: "Optical networking for DCI", leverageScore: 68 },
    { symbol: "META", role: "Hyperscaler + AI monetizer", leverageScore: 72 },
    { symbol: "CAT", role: "DC construction equipment", leverageScore: 45 },
  ],
  summary: "AI infrastructure is a multi-year capex cycle driven by hyperscaler spending ($200B+ in 2025). The leverage hierarchy is clear: GPUs (NVDA) > Custom ASICs/Networking (AVGO) > Optical (CIEN) > Power (VRTX) > Construction (CAT). Follow the money from applications down to physical infrastructure.",
};

// ── Export all data ──
export const allTickers: Record<string, TickerAnalysis> = {
  NVDA: nvda,
  AVGO: avgo,
  CIEN: cien,
  MELI: meli,
  META: meta,
  CAT: cat,
};

export const allThemes: Record<string, ThemeAnalysis> = {
  "ai-infrastructure": aiInfraTheme,
};

export function getTickerAnalysis(symbol: string): TickerAnalysis | null {
  return allTickers[symbol.toUpperCase()] || null;
}

export function getThemeAnalysis(id: string): ThemeAnalysis | null {
  return allThemes[id] || null;
}

export function searchTickers(query: string): TickerAnalysis[] {
  const q = query.toLowerCase();
  return Object.values(allTickers).filter(
    (t) =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.sector.toLowerCase().includes(q) ||
      t.industry.toLowerCase().includes(q)
  );
}

export function getAllAnalyses(): TickerAnalysis[] {
  return Object.values(allTickers).sort((a, b) => b.processScore.total - a.processScore.total);
}
