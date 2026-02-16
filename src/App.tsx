import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/arena" element={<ChooseOpponent />} />
          <Route path="/arena/topic/:philosopherId" element={<TopicSelection />} />
          <Route path="/arena/arenas/:philosopherId/:topicId" element={<ArenaSelection />} />
          <Route path="/arena/spar/:philosopherId/:topicId/:arenaLevel" element={<SparringArena />} />
          <Route path="/arena/spar/:philosopherId/:topicId" element={<SparringArena />} />
          <Route path="/library" element={<LibraryScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/dilemma" element={<DilemmaQuiz />} />
          <Route path="/dilemma/results" element={<DilemmaResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
