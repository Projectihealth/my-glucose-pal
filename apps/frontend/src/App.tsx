import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileAppShell } from "@/components/layout/MobileAppShell";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { ActivityLogProvider } from "@/context/ActivityLogContext";
import Landing from "./pages/Landing";
import Overview from "./pages/Overview";
import LearnMore from "./pages/LearnMore";
import { GoalTab } from "./pages/GoalTab";
import Coach from "./pages/Coach";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import OliviaOverview from "./pages/articles/OliviaOverview";
import CgmFoundations from "./pages/articles/CgmFoundations";
import NutritionPlaybook from "./pages/articles/NutritionPlaybook";
import NotFound from "./pages/NotFound";
import OliviaHome from "./pages/olivia/OliviaHome";
import ConversationDetail from "./pages/olivia/ConversationDetail";
import VoiceChat from "./pages/olivia/VoiceChat";
import VideoChat from "./pages/olivia/VideoChat";
import TextChat from "./pages/olivia/TextChat";
import { CallResultsPage } from "./pages/olivia/CallResultsPage";
import IconPreview from "./pages/IconPreview";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Wrapper component to conditionally show GoalTab or LearnMore based on beta mode
const LearnMoreOrGoalTab = () => {
  const [isBetaMode, setIsBetaMode] = useState<boolean>(false);

  useEffect(() => {
    // Listen to storage changes to update when beta mode is toggled
    const checkBetaMode = () => {
      const betaMode = localStorage.getItem('betaMode') === 'true';
      setIsBetaMode(betaMode);
    };

    checkBetaMode();

    // Listen for storage changes (when beta button is clicked)
    window.addEventListener('storage', checkBetaMode);

    // Custom event for same-window updates
    const handleBetaModeChange = () => checkBetaMode();
    window.addEventListener('betaModeChange', handleBetaModeChange);

    return () => {
      window.removeEventListener('storage', checkBetaMode);
      window.removeEventListener('betaModeChange', handleBetaModeChange);
    };
  }, []);

  return isBetaMode ? <GoalTab /> : <LearnMore />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserPreferencesProvider>
          <ActivityLogProvider>
            <MobileAppShell>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/coach" element={<OliviaHome />} />
                <Route path="/coach/conversation/:conversationId" element={<ConversationDetail />} />
                <Route path="/coach/voice" element={<VoiceChat />} />
                <Route path="/coach/video" element={<VideoChat />} />
                <Route path="/coach/text" element={<TextChat />} />
                <Route path="/olivia/call-results" element={<CallResultsPage />} />
                <Route path="/icon-preview" element={<IconPreview />} />
              <Route path="/learn-more" element={<LearnMoreOrGoalTab />} />
              <Route path="/learn-more/olivia" element={<OliviaOverview />} />
              <Route path="/learn-more/cgm-foundations" element={<CgmFoundations />} />
              <Route path="/learn-more/nutrition-playbook" element={<NutritionPlaybook />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MobileAppShell>
          </ActivityLogProvider>
        </UserPreferencesProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
