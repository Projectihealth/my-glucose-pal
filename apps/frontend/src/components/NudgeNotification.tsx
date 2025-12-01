import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Check, Coffee, Dumbbell, Moon, Apple, Utensils, Droplet, Bell, ChevronRight } from 'lucide-react';

export interface NudgeData {
  id: string;
  time: string; // HH:mm format
  title: string;
  message: string;
  icon: any;
  color: string;
  bgColor: string;
  category: 'diet' | 'exercise' | 'sleep' | 'medication';
  goalId?: string;
}

const NUDGE_TEMPLATES: NudgeData[] = [
  {
    id: 'breakfast-reminder',
    time: '08:00',
    title: '🌅 Good Morning!',
    message: 'Time for a nutritious breakfast to start your day right',
    icon: Coffee,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    category: 'diet',
  },
  {
    id: 'lunch-reminder',
    time: '12:00',
    title: '🍽️ Lunch Time',
    message: 'Don\'t skip lunch! Have a balanced meal',
    icon: Utensils,
    color: '#10B981',
    bgColor: '#D1FAE5',
    category: 'diet',
  },
  {
    id: 'water-reminder',
    time: '15:00',
    title: '💧 Stay Hydrated',
    message: 'Drink a glass of water and check your glucose',
    icon: Droplet,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    category: 'medication',
  },
  {
    id: 'exercise-reminder',
    time: '17:00',
    title: '💪 Exercise Time',
    message: 'Get active! 30 minutes of exercise will help manage your glucose',
    icon: Dumbbell,
    color: '#EF4444',
    bgColor: '#FEE2E2',
    category: 'exercise',
  },
  {
    id: 'dinner-reminder',
    time: '19:00',
    title: '🌙 Dinner Reminder',
    message: 'Have a healthy dinner before 8 PM',
    icon: Apple,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    category: 'diet',
  },
  {
    id: 'sleep-reminder',
    time: '22:30',
    title: '😴 Wind Down',
    message: 'Prepare for bed. Good sleep helps regulate blood sugar',
    icon: Moon,
    color: '#5B7FF3',
    bgColor: '#E0E7FF',
    category: 'sleep',
  },
];

interface NudgeNotificationProps {
  onComplete?: (nudgeId: string, category: string) => void;
  onDismiss?: (nudgeId: string) => void;
  testMode?: boolean; // For demo purposes
}

type NudgeState = 'expanded' | 'minimized-left' | 'minimized-right' | 'hidden';

export function NudgeNotification({ onComplete, onDismiss, testMode = false }: NudgeNotificationProps) {
  const [currentNudge, setCurrentNudge] = useState<NudgeData | null>(null);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());
  const [nudgeState, setNudgeState] = useState<NudgeState>('expanded');
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(100);

  // Check for nudges to show
  useEffect(() => {
    const checkNudges = () => {
      if (currentNudge) return; // Don't show new nudge if one is already visible

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayKey = now.toDateString();

      // Load dismissed nudges for today
      const storedDismissed = localStorage.getItem(`dismissedNudges-${todayKey}`);
      const dismissed = storedDismissed ? new Set(JSON.parse(storedDismissed)) : new Set();
      setDismissedNudges(dismissed);

      // In test mode, cycle through nudges every 15 seconds
      if (testMode) {
        const index = Math.floor((now.getSeconds() / 15)) % NUDGE_TEMPLATES.length;
        const nudge = NUDGE_TEMPLATES[index];
        if (!dismissed.has(nudge.id)) {
          setCurrentNudge(nudge);
          setNudgeState('expanded');
          x.set(0);
          y.set(100);
        }
        return;
      }

      // Find nudge for current time (within 5 minutes window)
      for (const nudge of NUDGE_TEMPLATES) {
        const [hours, minutes] = nudge.time.split(':').map(Number);
        const nudgeTime = new Date();
        nudgeTime.setHours(hours, minutes, 0, 0);

        const timeDiff = Math.abs(now.getTime() - nudgeTime.getTime());
        const fiveMinutes = 5 * 60 * 1000;

        // Show if within 5 minutes and not dismissed
        if (timeDiff < fiveMinutes && !dismissed.has(nudge.id)) {
          setCurrentNudge(nudge);
          setNudgeState('expanded');
          x.set(0);
          y.set(100);
          break;
        }
      }
    };

    checkNudges();
    const interval = setInterval(checkNudges, testMode ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [currentNudge, testMode, x, y]);

  const handleDismiss = () => {
    if (!currentNudge) return;

    // Save to dismissed list
    const todayKey = new Date().toDateString();
    const newDismissed = new Set(dismissedNudges);
    newDismissed.add(currentNudge.id);
    setDismissedNudges(newDismissed);
    localStorage.setItem(`dismissedNudges-${todayKey}`, JSON.stringify([...newDismissed]));

    setNudgeState('hidden');
    setTimeout(() => {
      setCurrentNudge(null);
      onDismiss?.(currentNudge.id);
    }, 300);
  };

  const handleComplete = () => {
    if (!currentNudge) return;

    // Mark as completed
    onComplete?.(currentNudge.id, currentNudge.category);
    
    // Also dismiss
    const todayKey = new Date().toDateString();
    const newDismissed = new Set(dismissedNudges);
    newDismissed.add(currentNudge.id);
    setDismissedNudges(newDismissed);
    localStorage.setItem(`dismissedNudges-${todayKey}`, JSON.stringify([...newDismissed]));

    setNudgeState('hidden');
    setTimeout(() => {
      setCurrentNudge(null);
    }, 300);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;

    // Determine if should dismiss (swipe up)
    if (offsetY < -150 && nudgeState === 'expanded') {
      handleDismiss();
      return;
    }

    // Determine if should minimize to side (swipe left/right)
    const screenWidth = window.innerWidth;
    const threshold = screenWidth * 0.25; // 25% of screen width

    if (Math.abs(offsetX) > threshold || Math.abs(velocityX) > 500) {
      // Minimize to the side based on direction
      if (offsetX > 0) {
        setNudgeState('minimized-right');
        x.set(screenWidth - 70); // Show only 70px
      } else {
        setNudgeState('minimized-left');
        x.set(-screenWidth + 70); // Show only 70px on left
      }
    } else {
      // Snap back to center if not enough movement
      if (nudgeState === 'expanded') {
        x.set(0);
      } else if (nudgeState === 'minimized-right') {
        x.set(screenWidth - 70);
      } else if (nudgeState === 'minimized-left') {
        x.set(-screenWidth + 70);
      }
    }
  };

  const handleExpand = () => {
    if (nudgeState === 'minimized-left' || nudgeState === 'minimized-right') {
      setNudgeState('expanded');
      x.set(0);
    }
  };

  if (!currentNudge) return null;

  // Minimized view
  if (nudgeState === 'minimized-left' || nudgeState === 'minimized-right') {
    return (
      <motion.div
        className="fixed z-50"
        style={{
          top: y,
          left: nudgeState === 'minimized-left' ? 0 : 'auto',
          right: nudgeState === 'minimized-right' ? 0 : 'auto',
        }}
        drag="y"
        dragConstraints={{ top: 80, bottom: window.innerHeight - 180 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={(e, info) => {
          setIsDragging(false);
        }}
        onClick={handleExpand}
      >
        <motion.div
          className="relative cursor-pointer"
          initial={{ x: nudgeState === 'minimized-right' ? 200 : -200 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Minimized Card */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              width: '70px',
              height: '70px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Color Accent */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ backgroundColor: currentNudge.color }}
            />
            
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                style={{ backgroundColor: currentNudge.bgColor }}
              >
                <currentNudge.icon 
                  className="w-6 h-6" 
                  style={{ color: currentNudge.color }}
                />
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: `2px solid ${currentNudge.color}` }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </div>

            {/* Expand Arrow */}
            <div 
              className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
              style={{ transform: nudgeState === 'minimized-left' ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </div>

            {/* Badge Count */}
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: currentNudge.color }}
            >
              1
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Expanded view
  return (
    <AnimatePresence>
      {nudgeState === 'expanded' && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
          style={{ maxWidth: '390px', margin: '0 auto' }}
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing"
            style={{ x }}
          >
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              }}
              animate={{
                scale: isDragging ? 1.05 : [1, 1.02, 1],
              }}
              transition={{
                scale: isDragging ? { duration: 0.2 } : { duration: 2, repeat: Infinity, repeatType: 'reverse' },
              }}
            >
              {/* Drag Indicator */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Color Accent Bar */}
              <motion.div
                className="h-1.5"
                style={{ backgroundColor: currentNudge.color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{ backgroundColor: currentNudge.bgColor }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <currentNudge.icon 
                      className="w-7 h-7" 
                      style={{ color: currentNudge.color }}
                    />
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `2px solid ${currentNudge.color}` }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className="text-gray-900 mb-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentNudge.title}
                    </motion.h3>
                    <motion.p
                      className="text-sm text-gray-600 leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentNudge.message}
                    </motion.p>

                    {/* Time Badge */}
                    <motion.div
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: currentNudge.bgColor,
                        color: currentNudge.color,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Bell className="w-3 h-3" />
                      <span>{currentNudge.time}</span>
                    </motion.div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-3 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={handleComplete}
                    className="flex-1 py-3 px-4 rounded-xl text-white hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${currentNudge.color} 0%, ${adjustBrightness(currentNudge.color, 20)} 100%)`,
                      boxShadow: `0 4px 12px ${currentNudge.color}40`,
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Mark Done
                  </button>
                </motion.div>

                {/* Swipe Hints */}
                <motion.div
                  className="flex items-center justify-between mt-3 px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span>←</span> Swipe to hide
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    Swipe up to close <span>↑</span>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
