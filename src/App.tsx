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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
