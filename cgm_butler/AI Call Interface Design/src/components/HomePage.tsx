import { TrendingUp, MessageCircle, Users, BookOpen, User, Mic, Video } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: 'home' | 'voice-chat' | 'video-chat') => void;
}

type Tab = 'cgm' | 'olivia' | 'community' | 'learn' | 'profile';

export function HomePage({ onNavigate }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('olivia');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] max-w-[430px] mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'olivia' && <OliviaTab onNavigate={onNavigate} />}
        {activeTab === 'cgm' && <PlaceholderTab title="My CGM" />}
        {activeTab === 'community' && <PlaceholderTab title="Community" />}
        {activeTab === 'learn' && <PlaceholderTab title="Learn More" />}
        {activeTab === 'profile' && <PlaceholderTab title="Profile" />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-[430px] mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          <TabButton
            icon={TrendingUp}
            label="My CGM"
            active={activeTab === 'cgm'}
            onClick={() => setActiveTab('cgm')}
          />
          <TabButton
            icon={MessageCircle}
            label="Olivia"
            active={activeTab === 'olivia'}
            onClick={() => setActiveTab('olivia')}
          />
          <TabButton
            icon={Users}
            label="Community"
            active={activeTab === 'community'}
            onClick={() => setActiveTab('community')}
          />
          <TabButton
            icon={BookOpen}
            label="Learn More"
            active={activeTab === 'learn'}
            onClick={() => setActiveTab('learn')}
          />
          <TabButton
            icon={User}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-1 px-2 min-w-[60px]"
    >
      <Icon className={`w-6 h-6 ${active ? 'text-[#5B7FF3]' : 'text-gray-400'}`} />
      <span className={`text-xs ${active ? 'text-[#5B7FF3]' : 'text-gray-500'}`}>
        {label}
      </span>
    </button>
  );
}

function OliviaTab({ onNavigate }: { onNavigate: (view: 'voice-chat' | 'video-chat') => void }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 pt-8">
        <h1 className="text-gray-800 text-2xl">Talk with Olivia</h1>
        <p className="text-gray-500">
          Connect with your AI health companion through voice or video
        </p>
      </div>

      {/* Chat Options */}
      <div className="space-y-4 pt-4">
        {/* Voice Chat Button */}
        <button
          onClick={() => onNavigate('voice-chat')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Mic className="w-7 h-7 text-[#5B7FF3]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 text-lg mb-1">Voice Chat</h3>
              <p className="text-gray-500 text-sm">
                Have a natural conversation about your health
              </p>
            </div>
          </div>
        </button>

        {/* Video Chat Button */}
        <button
          onClick={() => onNavigate('video-chat')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Video className="w-7 h-7 text-[#5B7FF3]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 text-lg mb-1">Video Chat</h3>
              <p className="text-gray-500 text-sm">
                Face-to-face interaction with visual support
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-[#EEF2FF] rounded-3xl p-6 mt-8">
        <h3 className="text-[#5B7FF3] text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">✨</span>
          Olivia can help you with
        </h3>
        <div className="space-y-2 text-gray-600 text-sm">
          <p>• Daily health check-ins and symptom tracking</p>
          <p>• Meal planning and nutrition guidance</p>
          <p>• Exercise and activity recommendations</p>
          <p>• Sleep pattern analysis and tips</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="p-6 pt-12">
      <h1 className="text-gray-800 text-2xl mb-4">{title}</h1>
      <p className="text-gray-500">This section is under development.</p>
    </div>
  );
}

import { useState } from 'react';
