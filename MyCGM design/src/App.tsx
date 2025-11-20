import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { MobileCallInterface } from './components/MobileCallInterface';
import { MobileVideoInterface } from './components/MobileVideoInterface';
import { CallResultsPage } from './components/CallResultsPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AppTutorial } from './components/AppTutorial';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';

type View = 'home' | 'voice-chat' | 'video-chat' | 'call-results';

export interface CGMGoal {
  id: string;
  title: string;
  description: string;
  target_count: number;
  current_count: number;
  category: 'diet' | 'exercise' | 'sleep' | 'medication';
  icon: string;
  week: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [cgmGoals, setCgmGoals] = useState<CGMGoal[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [tutorialComplete, setTutorialComplete] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if onboarding is complete on mount
  useEffect(() => {
    try {
      const isComplete = localStorage.getItem('onboardingComplete');
      const profile = localStorage.getItem('userProfile');
      const tutorialDone = localStorage.getItem('tutorialComplete');
      
      console.log('Onboarding check:', { isComplete, hasProfile: !!profile, tutorialDone });
      
      if (isComplete === 'true' && profile) {
        setOnboardingComplete(true);
        setUserProfile(JSON.parse(profile));
        setTutorialComplete(tutorialDone === 'true');
      } else {
        setOnboardingComplete(false);
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
      setOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOnboardingComplete = (data: any) => {
    // Save onboarding data to localStorage
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userProfile', JSON.stringify(data));
    setUserProfile(data);
    setOnboardingComplete(true);
    // Don't set tutorialComplete yet - let it show
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorialComplete', 'true');
    setTutorialComplete(true);
    // Set flag to show Olivia prompt after tutorial
    localStorage.setItem('showOliviaPrompt', 'true');
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('tutorialComplete', 'true');
    setTutorialComplete(true);
    // Also set flag when tutorial is skipped
    localStorage.setItem('showOliviaPrompt', 'true');
  };

  const handleAddCGMGoal = (goal: CGMGoal) => {
    setCgmGoals(prev => [...prev, goal]);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B7FF3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA]">
        <Toaster />
        {!onboardingComplete ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage 
                onNavigate={setCurrentView} 
                cgmGoals={cgmGoals}
                onAddCGMGoal={handleAddCGMGoal}
              />
            )}
            {currentView === 'voice-chat' && (
              <MobileCallInterface 
                onBack={() => setCurrentView('home')}
                onCallEnded={() => setCurrentView('call-results')}
              />
            )}
            {currentView === 'video-chat' && (
              <MobileVideoInterface 
                onBack={() => setCurrentView('home')}
                onCallEnded={() => setCurrentView('call-results')}
              />
            )}
            {currentView === 'call-results' && (
              <CallResultsPage onBack={() => setCurrentView('home')} />
            )}
            
            {/* Show tutorial after onboarding */}
            {!tutorialComplete && (
              <AppTutorial 
                onComplete={handleTutorialComplete} 
                onSkip={handleTutorialSkip}
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}