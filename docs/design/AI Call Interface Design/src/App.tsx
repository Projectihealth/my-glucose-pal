import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MobileCallInterface } from './components/MobileCallInterface';
import { CallResultsPage } from './components/CallResultsPage';

type View = 'home' | 'voice-chat' | 'video-chat' | 'call-results';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {currentView === 'home' && (
        <HomePage onNavigate={setCurrentView} />
      )}
      {currentView === 'voice-chat' && (
        <MobileCallInterface 
          onBack={() => setCurrentView('home')}
          onCallEnded={() => setCurrentView('call-results')}
        />
      )}
      {currentView === 'call-results' && (
        <CallResultsPage onBack={() => setCurrentView('home')} />
      )}
      {currentView === 'video-chat' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-gray-700 mb-4">Video Chat</h2>
            <p className="text-gray-500 mb-6">Coming soon...</p>
            <button
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 bg-[#5B7FF3] text-white rounded-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
