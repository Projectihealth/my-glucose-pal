import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, TrendingUp, MessageCircle, Users, Target, User, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  highlightId?: string;
  position: 'top' | 'bottom' | 'center';
  spotlightSize?: number;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Health Companion!',
    description: 'Let\'s take a quick tour to help you get the most out of the app. This will only take 30 seconds.',
    icon: Sparkles,
    position: 'center',
  },
  {
    id: 'cgm-tab',
    title: 'CGM Insights',
    description: 'View your glucose data, trends, and weekly goals. Track your progress and celebrate achievements.',
    icon: TrendingUp,
    highlightId: 'tab-cgm',
    position: 'top',
    spotlightSize: 72,
  },
  {
    id: 'olivia-tab',
    title: 'Chat with Olivia AI',
    description: 'Get personalized health guidance through voice, video, or text conversations with your AI companion.',
    icon: MessageCircle,
    highlightId: 'tab-olivia',
    position: 'top',
    spotlightSize: 72,
  },
  {
    id: 'community-tab',
    title: 'Join the Community',
    description: 'Connect with others, share experiences, and get support from people on similar health journeys.',
    icon: Users,
    highlightId: 'tab-community',
    position: 'top',
    spotlightSize: 72,
  },
  {
    id: 'goal-tab',
    title: 'Track Your Goals',
    description: 'Set and monitor daily health goals. Complete tasks to improve your glucose control and overall wellness.',
    icon: Target,
    highlightId: 'tab-goal',
    position: 'top',
    spotlightSize: 72,
  },
  {
    id: 'profile-tab',
    title: 'Manage Your Profile',
    description: 'Update your personal information, health data, and app preferences. Your data is secure and private.',
    icon: User,
    highlightId: 'tab-profile',
    position: 'top',
    spotlightSize: 72,
  },
];

interface AppTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function AppTutorial({ onComplete, onSkip }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Calculate spotlight position
  const getSpotlightPosition = () => {
    if (!step.highlightId) return null;
    
    const element = document.getElementById(step.highlightId);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  };

  const spotlightPos = getSpotlightPosition();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Overlay with spotlight */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 51 }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlightPos && (
                <motion.circle
                  key={step.id}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: step.spotlightSize || 60, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  cx={spotlightPos.x}
                  cy={spotlightPos.y}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Animated ring around highlighted element */}
        {spotlightPos && (
          <motion.div
            key={`ring-${step.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute rounded-full border-4 border-[#5B7FF3] pointer-events-none"
            style={{
              left: spotlightPos.x - (step.spotlightSize || 60),
              top: spotlightPos.y - (step.spotlightSize || 60),
              width: (step.spotlightSize || 60) * 2,
              height: (step.spotlightSize || 60) * 2,
              zIndex: 52,
              boxShadow: '0 0 0 4px rgba(91, 127, 243, 0.2), 0 0 20px rgba(91, 127, 243, 0.4)',
            }}
          >
            {/* Pulse animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full border-4 border-[#5B7FF3]"
            />
          </motion.div>
        )}

        {/* Tutorial Content Card */}
        <div 
          className="absolute left-0 right-0 mx-auto w-full max-w-[390px] px-4"
          style={{
            zIndex: 53,
            top: step.position === 'top' ? '50%' : 
                 step.position === 'bottom' ? 'auto' : '50%',
            bottom: step.position === 'bottom' ? '100px' : 'auto',
            transform: step.position === 'center' ? 'translateY(-50%)' : 
                       step.position === 'top' ? 'translateY(20px)' : 'none',
          }}
        >
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-3xl shadow-2xl p-6 relative"
          >
            {/* Skip Button */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#5B7FF3]/30"
            >
              <step.icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-[#5B7FF3]'
                        : index < currentStep
                        ? 'w-2 bg-[#5B7FF3]'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {currentStep > 0 && !isLastStep && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white shadow-lg shadow-[#5B7FF3]/30 hover:shadow-xl hover:shadow-[#5B7FF3]/40 transition-all ${
                    currentStep === 0 || isLastStep ? 'flex-1' : 'flex-1'
                  }`}
                >
                  {isLastStep ? "Let's Go!" : step.id === 'welcome' ? 'Start Tour' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-5 h-5" />}
                  {isLastStep && <Sparkles className="w-5 h-5" />}
                </button>
              </div>

              {/* Step Counter */}
              <div className="text-center mt-4 text-xs text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Clickable overlay to dismiss */}
        {step.position !== 'center' && (
          <div
            onClick={handleSkip}
            className="absolute inset-0 cursor-pointer"
            style={{ zIndex: 50 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}