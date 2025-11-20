import { CGMTab } from './CGMTab';
import { CommunityTab } from './CommunityTab';
import { EnhancedGoalTab } from './EnhancedGoalTab';
import { ProfileTab } from './ProfileTab';
import { NudgeNotification } from './NudgeNotification';
import { OliviaWelcomePrompt } from './OliviaWelcomePrompt';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CGMGoal } from '../App';
import { TrendingUp, MessageCircle, Users, Target, User, Phone, Video, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HomePageProps {
  onNavigate: (view: 'home' | 'voice-chat' | 'video-chat') => void;
  cgmGoals: CGMGoal[];
  onAddCGMGoal: (goal: CGMGoal) => void;
}

type Tab = 'cgm' | 'olivia' | 'community' | 'goal' | 'profile';

interface Todo {
  id: number;
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  time_of_day: string;
  time_description: string;
  target_count: number;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  uploaded_images?: string[];
  completed_today?: boolean;
}

export function HomePage({ onNavigate, cgmGoals, onAddCGMGoal }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('cgm');
  const [showOliviaPrompt, setShowOliviaPrompt] = useState(false);

  // Check if we should show Olivia prompt after tutorial
  useEffect(() => {
    const checkOliviaPrompt = () => {
      const shouldShowPrompt = localStorage.getItem('showOliviaPrompt');
      if (shouldShowPrompt === 'true' && !showOliviaPrompt) {
        // Show prompt 10 seconds after tutorial completion
        setTimeout(() => {
          setShowOliviaPrompt(true);
        }, 10000); // 10 seconds delay
      }
    };

    // Check immediately when component mounts
    checkOliviaPrompt();
  }, []); // Only run once on mount

  const handleStartChatWithOlivia = () => {
    localStorage.removeItem('showOliviaPrompt');
    setShowOliviaPrompt(false);
    setActiveTab('olivia');
  };

  const handleDismissOliviaPrompt = () => {
    localStorage.removeItem('showOliviaPrompt');
    setShowOliviaPrompt(false);
  };

  const handleNudgeComplete = (nudgeId: string, category: 'diet' | 'exercise' | 'sleep' | 'medication') => {
    // Find related goal and increment progress
    const relatedGoal = cgmGoals.find(g => g.category === category && g.current_count < g.target_count);
    
    if (relatedGoal) {
      const updatedGoal = {
        ...relatedGoal,
        current_count: Math.min(relatedGoal.current_count + 1, relatedGoal.target_count),
      };
      onAddCGMGoal(updatedGoal);
      
      toast.success('Great job! Goal progress updated 🎉', {
        description: `${updatedGoal.current_count}/${updatedGoal.target_count} ${relatedGoal.title}`,
      });
    } else {
      toast.success('Task completed! Keep up the great work 💪');
    }
  };

  const handleNudgeDismiss = (nudgeId: string) => {
    // Just a gentle reminder that was dismissed
    console.log('Nudge dismissed:', nudgeId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] w-full max-w-[390px] mx-auto relative">
      {/* Nudge Notifications - TEST MODE ENABLED for demo */}
      <NudgeNotification 
        onComplete={handleNudgeComplete}
        onDismiss={handleNudgeDismiss}
        testMode={true} // Set to false in production
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'olivia' && <OliviaTab onNavigate={onNavigate} />}
        {activeTab === 'cgm' && <CGMTab cgmGoals={cgmGoals} onAddCGMGoal={onAddCGMGoal} />}
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'goal' && <EnhancedGoalTab cgmGoals={cgmGoals} />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 w-full max-w-[390px] mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          <TabButton
            id="tab-cgm"
            icon={TrendingUp}
            label="My CGM"
            active={activeTab === 'cgm'}
            onClick={() => setActiveTab('cgm')}
          />
          <TabButton
            id="tab-olivia"
            icon={MessageCircle}
            label="Olivia"
            active={activeTab === 'olivia'}
            onClick={() => setActiveTab('olivia')}
            highlighted={showOliviaPrompt}
          />
          <TabButton
            id="tab-goal"
            icon={Target}
            label="Goal"
            active={activeTab === 'goal'}
            onClick={() => setActiveTab('goal')}
          />
          <TabButton
            id="tab-community"
            icon={Users}
            label="Community"
            active={activeTab === 'community'}
            onClick={() => setActiveTab('community')}
          />
          <TabButton
            id="tab-profile"
            icon={User}
            label="Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </div>

      {/* Olivia Welcome Prompt */}
      {showOliviaPrompt && (
        <OliviaWelcomePrompt
          onStartChat={handleStartChatWithOlivia}
          onDismiss={handleDismissOliviaPrompt}
        />
      )}
    </div>
  );
}

function TabButton({ id, icon: Icon, label, active, onClick, highlighted }: {
  id?: string;
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-1 px-2 min-w-[60px] relative"
    >
      {/* Pulsing background glow when highlighted */}
      {highlighted && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-[#5B7FF3] rounded-2xl blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 2,
              delay: 0.3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-[#5B7FF3] rounded-2xl blur-md"
          />
        </>
      )}
      
      {/* Icon and label */}
      <div className="relative z-10">
        <Icon className={`w-6 h-6 ${active ? 'text-[#5B7FF3]' : highlighted ? 'text-[#5B7FF3]' : 'text-gray-400'}`} />
      </div>
      <span className={`text-xs relative z-10 ${active ? 'text-[#5B7FF3]' : highlighted ? 'text-[#5B7FF3]' : 'text-gray-500'}`}>
        {label}
      </span>
      
      {/* Animated notification dot */}
      {highlighted && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B9D] border-2 border-white rounded-full z-20 shadow-lg"
        />
      )}
    </button>
  );
}

function OliviaTab({ onNavigate }: { onNavigate: (view: 'home' | 'voice-chat' | 'video-chat') => void }) {
  return (
    <div className="relative w-full">
      <div className="box-border flex flex-col gap-6 pb-0 pt-8 px-6 relative w-full">
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-[#5B7FF3] text-[11px] tracking-[2.26px] uppercase">
            OLIVIA AI
          </p>
          <h1 className="text-[#101828]" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2' }}>
            Your Personal Health Companion
          </h1>
          <p className="text-[#6A7282] text-[15px] leading-relaxed">
            Connect with Olivia for personalized health guidance and support.
          </p>
        </div>

        {/* Chat with Olivia Button */}
        <button
          onClick={() => onNavigate('voice-chat')}
          className="relative bg-gradient-to-b from-[#5b7ff3] to-[#7b9ff9] rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden group"
        >
          <div className="flex items-center justify-between px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] rounded-2xl w-16 h-16 flex items-center justify-center relative">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute bg-[#00d492] border-2 border-white rounded-full w-4 h-4 bottom-0 right-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
              </div>
              <div className="text-left">
                <h2 className="font-bold leading-7 text-white text-xl tracking-[-0.45px]">
                  Chat with Olivia
                </h2>
                <p className="font-normal leading-5 text-[rgba(255,255,255,0.8)] text-sm tracking-[-0.15px]">
                  Voice • Video • Text
                </p>
              </div>
            </div>
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </button>

        {/* Recent Conversations Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold leading-[25.5px] text-[#101828] text-[17px] tracking-[-0.43px]">
              Recent Conversations
            </h3>
            <button className="font-medium leading-5 text-[#5b7ff3] text-sm tracking-[-0.15px]">
              View All
            </button>
          </div>

          {/* Conversation Cards */}
          <div className="flex flex-col gap-3">
            {/* Diet & Sleep Habits Card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="bg-[rgba(95,39,205,0.08)] rounded-[14px] w-12 h-12 flex items-center justify-center">
                    <span className="text-2xl">😴</span>
                  </div>
                  <span className="text-[#99a1af] text-xs">Last Friday</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[#101828] text-[15px] tracking-[-0.23px]">
                      Diet & Sleep Habits
                    </h4>
                    <button className="text-gray-400 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 12L4 8L8 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[#6a7282] text-sm leading-relaxed mb-3">
                    Discussed dietary habits and sleep improvement strategies. You tried eating yogurt at night and for breakfast, which made you feel full...
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-[#eff6ff] border border-[#dbeafe] rounded-lg px-2.5 py-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5b7ff3]" />
                    <span className="text-xs text-[#5b7ff3] font-medium">Sleep Goal Set</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakfast Nutrition Card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="bg-[rgba(255,107,157,0.08)] rounded-[14px] w-12 h-12 flex items-center justify-center">
                    <span className="text-2xl">🍳</span>
                  </div>
                  <span className="text-[#99a1af] text-xs">Yesterday</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[#101828] text-[15px] tracking-[-0.23px]">
                      Breakfast Nutrition
                    </h4>
                    <button className="text-gray-400 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 12L4 8L8 4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[#6a7282] text-sm leading-relaxed mb-3">
                    Reviewed your breakfast choices and protein intake. Recommended adding eggs 4 times a week.
                  </p>
                  <div className="inline-flex items-center gap-1.5 bg-[#eff6ff] border border-[#dbeafe] rounded-lg px-2.5 py-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5b7ff3]" />
                    <span className="text-xs text-[#5b7ff3] font-medium">New Goal Created</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 text-center">
            <div className="font-bold text-[#5b7ff3] text-2xl leading-8 tracking-[0.07px]">24/7</div>
            <div className="text-[#6a7282] text-xs leading-4">Available</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 text-center">
            <div className="font-bold text-[#5b7ff3] text-2xl leading-8 tracking-[0.07px]">{'<1s'}</div>
            <div className="text-[#6a7282] text-xs leading-4">Response</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 text-center">
            <div className="font-bold text-[#5b7ff3] text-2xl leading-8 tracking-[0.07px]">100%</div>
            <div className="text-[#6a7282] text-xs leading-4">Private</div>
          </div>
        </div>

        {/* Olivia Can Help Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">✨</span>
            <h3 className="font-semibold text-[#5b7ff3] text-base tracking-[-0.31px]">
              Olivia can help you with
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5b7ff3] mt-2 flex-shrink-0" />
              <p className="text-[#4a5565] text-sm leading-5 tracking-[-0.15px]">
                Daily health check-ins and symptom tracking
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5b7ff3] mt-2 flex-shrink-0" />
              <p className="text-[#4a5565] text-sm leading-5 tracking-[-0.15px]">
                Meal planning and nutrition guidance
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5b7ff3] mt-2 flex-shrink-0" />
              <p className="text-[#4a5565] text-sm leading-5 tracking-[-0.15px]">
                Exercise and activity recommendations
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5b7ff3] mt-2 flex-shrink-0" />
              <p className="text-[#4a5565] text-sm leading-5 tracking-[-0.15px]">
                Sleep pattern analysis and improvement tips
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}