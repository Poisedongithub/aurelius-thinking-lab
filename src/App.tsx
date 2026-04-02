import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import SplashScreen from "./pages/SplashScreen";
import AuthPage from "./pages/AuthPage";
import HomeScreen from "./pages/HomeScreen";
import ChooseOpponent from "./pages/ChooseOpponent";
import TopicSelection from "./pages/TopicSelection";
import SparringArena from "./pages/SparringArena";
import ArenaSelection from "./pages/ArenaSelection";
import ProfileScreen from "./pages/ProfileScreen";
import LibraryScreen from "./pages/LibraryScreen";
import DilemmaQuiz from "./pages/DilemmaQuiz";
import DilemmaResults from "./pages/DilemmaResults";
import ClassicDilemma from "./pages/ClassicDilemma";
import ResetPassword from "./pages/ResetPassword";
import OnboardingScreen from "./pages/OnboardingScreen";
import ProgressDashboard from "./pages/ProgressDashboard";
import MoralCourt from "./pages/MoralCourt";
import CourtHistory from "./pages/CourtHistory";
import NotFound from "./pages/NotFound";
import MarketsDashboard from "./markets/pages/MarketsDashboard";
import TickerAnalysis from "./markets/pages/TickerAnalysis";
import ThemeAnalysis from "./markets/pages/ThemeAnalysis";
import Portfolio from "./markets/pages/Portfolio";
import Screener from "./markets/pages/Screener";
import PeerComparison from "./markets/pages/PeerComparison";
import JacobResearch from "./markets/pages/JacobResearch";
import MacroDashboard from "./markets/pages/MacroDashboard";
import { WatchlistProvider } from "./markets/data/WatchlistContext";
import { PortfolioProvider } from "./markets/data/PortfolioContext";
import FloatingThemeSwitcher from "./markets/components/FloatingThemeSwitcher";

const queryClient = new QueryClient();

const MarketsWrapper = ({ children }: { children: React.ReactNode }) => (
  <WatchlistProvider>
    <PortfolioProvider>
      {children}
      <FloatingThemeSwitcher />
    </PortfolioProvider>
  </WatchlistProvider>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/arena" element={<ChooseOpponent />} />
            <Route path="/arena/topic/:philosopherId" element={<TopicSelection />} />
            <Route path="/arena/arenas/:philosopherId/:topicId" element={<ArenaSelection />} />
            <Route path="/arena/spar/:philosopherId/:topicId/:arenaLevel" element={<SparringArena />} />
            <Route path="/arena/spar/:philosopherId/:topicId" element={<SparringArena />} />
            <Route path="/library" element={<LibraryScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/progress" element={<ProgressDashboard />} />
            <Route path="/dilemma" element={<DilemmaQuiz />} />
            <Route path="/dilemma/results" element={<DilemmaResults />} />
            <Route path="/dilemma/:dilemmaId" element={<ClassicDilemma />} />
            <Route path="/court" element={<MoralCourt />} />
            <Route path="/court/history" element={<CourtHistory />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Markets routes */}
            <Route path="/markets" element={<MarketsWrapper><MarketsDashboard /></MarketsWrapper>} />
            <Route path="/markets/ticker/:symbol" element={<MarketsWrapper><TickerAnalysis /></MarketsWrapper>} />
            <Route path="/markets/theme/:themeId" element={<MarketsWrapper><ThemeAnalysis /></MarketsWrapper>} />
            <Route path="/markets/portfolio" element={<MarketsWrapper><Portfolio /></MarketsWrapper>} />
            <Route path="/markets/screener" element={<MarketsWrapper><Screener /></MarketsWrapper>} />
            <Route path="/markets/compare" element={<MarketsWrapper><PeerComparison /></MarketsWrapper>} />
            <Route path="/markets/jacob" element={<MarketsWrapper><JacobResearch /></MarketsWrapper>} />
            <Route path="/markets/macro" element={<MarketsWrapper><MacroDashboard /></MarketsWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
