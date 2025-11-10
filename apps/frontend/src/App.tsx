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
import Coach from "./pages/Coach";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import OliviaOverview from "./pages/articles/OliviaOverview";
import CgmFoundations from "./pages/articles/CgmFoundations";
import NutritionPlaybook from "./pages/articles/NutritionPlaybook";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <Route path="/coach" element={<Coach />} />
              <Route path="/learn-more" element={<LearnMore />} />
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
