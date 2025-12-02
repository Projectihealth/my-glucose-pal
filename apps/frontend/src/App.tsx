import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileAppShell } from "@/components/layout/MobileAppShell";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { ActivityLogProvider } from "@/context/ActivityLogContext";
import { useState, useEffect, lazy, Suspense } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { AppTutorial } from "@/components/AppTutorial";
import { NudgeNotification } from "@/components/NudgeNotification";

// Eager load critical pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better initial load performance
const Overview = lazy(() => import("./pages/Overview"));
const LearnMore = lazy(() => import("./pages/LearnMore"));
const GoalTab = lazy(() => import("./pages/GoalTab").then(m => ({ default: m.GoalTab })));
const GoalApp = lazy(() => import("./pages/goal/App"));
const Coach = lazy(() => import("./pages/Coach"));
const Profile = lazy(() => import("./pages/Profile"));
const Community = lazy(() => import("./pages/Community"));
const OliviaOverview = lazy(() => import("./pages/articles/OliviaOverview"));
const CgmFoundations = lazy(() => import("./pages/articles/CgmFoundations"));
const NutritionPlaybook = lazy(() => import("./pages/articles/NutritionPlaybook"));
const OliviaHome = lazy(() => import("./pages/olivia/OliviaHome"));
const ConversationDetail = lazy(() => import("./pages/olivia/ConversationDetail"));
const VoiceChat = lazy(() => import("./pages/olivia/VoiceChat"));
const VideoChat = lazy(() => import("./pages/olivia/VideoChat"));
const TextChat = lazy(() => import("./pages/olivia/TextChat"));
const CallResultsPage = lazy(() => import("./pages/olivia/CallResultsPage").then(m => ({ default: m.CallResultsPage })));
const IconPreview = lazy(() => import("./pages/IconPreview"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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

const App = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNudges, setShowNudges] = useState(false);

  useEffect(() => {
    // Check if tutorial should be shown (only for users who completed onboarding)
    if (hasCompletedOnboarding) {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        // Show tutorial after a short delay
        setTimeout(() => setShowTutorial(true), 1000);
      }
      // Enable nudges for users who have completed onboarding
      setShowNudges(true);
    }
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('userProfile', JSON.stringify(data));
    setHasCompletedOnboarding(true);

    // Show tutorial after onboarding
    setTimeout(() => setShowTutorial(true), 500);
    setShowNudges(true);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  // Show ONLY onboarding if not completed
  if (!hasCompletedOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show normal app after onboarding is complete
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserPreferencesProvider>
            <ActivityLogProvider>
              <MobileAppShell>
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/goal" element={<GoalApp />} />
                    <Route path="/goal-old" element={<GoalTab />} />
                    <Route path="/learn-more" element={<LearnMoreOrGoalTab />} />
                    <Route path="/learn-more/olivia" element={<OliviaOverview />} />
                    <Route path="/learn-more/cgm-foundations" element={<CgmFoundations />} />
                    <Route path="/learn-more/nutrition-playbook" element={<NutritionPlaybook />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>

                {/* App Tutorial - shown after onboarding */}
                {showTutorial && (
                  <AppTutorial onComplete={handleTutorialComplete} />
                )}

                {/* Nudge Notifications - shown for engaged users */}
                {showNudges && <NudgeNotification />}
              </MobileAppShell>
            </ActivityLogProvider>
          </UserPreferencesProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
