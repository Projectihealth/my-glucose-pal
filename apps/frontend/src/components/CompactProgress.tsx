import { useState } from 'react';
import { Crown, ChevronDown, Flame, X as XIcon, Gift, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoRecord {
  url: string;
  date: string;
  timestamp: number;
}

interface TodoWithWeek {
  id: number;
  title: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  target_count: number;
  current_count: number;
  week_start_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  uploaded_images?: PhotoRecord[];
  completed_today?: boolean;
}

interface CompactProgressStatsProps {
  todos: TodoWithWeek[];
}

// Helper function to calculate streak (mock implementation)
function calculateStreak(todos: TodoWithWeek[]): number {
  // In a real app, this would check daily check-ins over time
  // For now, we count unique days where at least one todo was completed
  // We use completed_today flag to determine if user checked in today
  
  const hasCompletedToday = todos.some(todo => todo.completed_today);
  
  // Mock implementation: 
  // - Count how many todos have been checked in at least once
  // - This simulates days of activity (in real app, we'd track daily completion dates)
  const activeTodos = todos.filter(todo => todo.current_count > 0).length;
  
  // Simple heuristic for demo purposes
  if (!hasCompletedToday) {
    // If nothing done today, don't count today in streak
    return Math.max(0, activeTodos - 1);
  }
  
  // Estimate streak based on unique activity
  // In real app: track completion dates and calculate consecutive days
  if (activeTodos === 0) return 0;
  if (activeTodos === 1) return 1;
  if (activeTodos === 2) return 3;
  if (activeTodos >= 3) return 7;
  
  return Math.min(activeTodos * 2, 30); // Cap at 30 days
}

export function CompactProgressStats({ todos }: CompactProgressStatsProps) {
  const [showFullStats, setShowFullStats] = useState(false);

  // Calculate statistics
  const completedTodos = todos.filter(todo => todo.current_count >= todo.target_count).length;
  const totalCheckIns = todos.reduce((sum, todo) => sum + todo.current_count, 0);
  
  // Calculate level based on completed todos
  const level = Math.floor(completedTodos / 3) + 1;
  const nextLevelProgress = ((completedTodos % 3) / 3) * 100;
  
  // Calculate this week's completion rate
  const thisWeekCompletionRate = todos.length > 0 ? (completedTodos / todos.length) * 100 : 0;
  
  // Calculate streak
  const streak = calculateStreak(todos);
  
  // CGM Reward System (Based on Streak Days, not completed goals)
  // Every 30 days of streak = 1 free CGM
  const cgmsEarned = Math.floor(streak / 30);
  const daysUntilNextCGM = 30 - (streak % 30);
  const progressToNextCGM = ((streak % 30) / 30) * 100;
  const nextCGMDays = (cgmsEarned + 1) * 30;
  
  // SVG Circle Ring calculations (now shows streak progress to next CGM)
  const size = 60;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressToNextCGM / 100) * circumference;

  return (
    <>
      <button
        onClick={() => setShowFullStats(true)}
        className="w-full bg-gradient-to-br from-[#5B7FF3]/10 to-[#7B9FF9]/10 rounded-3xl p-4 border border-[#5B7FF3]/20 hover:border-[#5B7FF3]/40 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          {/* Left: Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B9FF9" />
                  <stop offset="100%" stopColor="#5B7FF3" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Right: Text info */}
          <div className="flex-1 text-left">
            {/* Top row: Streak + Days */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-gray-900 text-xl" style={{ fontWeight: 700 }}>
                  {streak} {streak === 1 ? 'Day' : 'Days'}
                </h3>
                <span className="text-orange-600 text-xs" style={{ fontWeight: 600 }}>
                  Streak 🔥
                </span>
              </div>
            </div>
            
            {/* This Week Progress Bar */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">This Week</span>
                <span className="text-[#5B7FF3]" style={{ fontWeight: 600 }}>
                  {completedTodos}/{todos.length} goals
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${thisWeekCompletionRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-[#A5C4FF] to-[#7B9FF9] rounded-full"
                />
              </div>
            </div>
            
            {/* CGM Progress */}
            <p className="text-gray-600 text-xs">
              {daysUntilNextCGM} {daysUntilNextCGM === 1 ? 'day' : 'days'} to {cgmsEarned === 0 ? 'your first' : 'next'} free CGM
            </p>
          </div>

          {/* Right arrow indicator */}
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transform rotate-[-90deg]" />
        </div>
      </button>

      {/* Full Stats Modal */}
      <AnimatePresence>
        {showFullStats && (
          <FullStatsModal
            todos={todos}
            streak={streak}
            onClose={() => setShowFullStats(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Full Statistics Modal
interface FullStatsModalProps {
  todos: TodoWithWeek[];
  streak: number;
  onClose: () => void;
}

function FullStatsModal({ todos, streak, onClose }: FullStatsModalProps) {
  // Calculate statistics
  const completedTodos = todos.filter(todo => todo.current_count >= todo.target_count).length;
  
  // CGM Reward System (Based on Streak Days)
  const cgmsEarned = Math.floor(streak / 30);
  const daysUntilNextCGM = 30 - (streak % 30);
  const progressToNextCGM = ((streak % 30) / 30) * 100;
  const nextCGMDays = (cgmsEarned + 1) * 30;
  
  // Check if user just earned a CGM
  const justEarnedCGM = streak % 30 === 0 && streak > 0;
  
  // Best streak (mock - in real app, this would be from DB)
  const bestStreak = Math.max(streak, Math.floor(streak * 1.2));

  // Next 2 milestones
  const nextMilestone = Math.ceil(streak / 30) * 30;
  const followingMilestone = nextMilestone + 30;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
        style={{ 
          width: 'calc(100vw - 32px)',
          maxWidth: '390px'
        }}
      >
        {/* Handle bar */}
        <div className="sticky top-0 bg-white pt-3 pb-2 flex items-center justify-center z-10 rounded-t-3xl">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-900 text-xl" style={{ fontWeight: 700 }}>
              Your Rewards
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <XIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Just Earned CGM - Celebration */}
            {justEarnedCGM ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="relative bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-8 text-center overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <Gift className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  
                  <h3 className="text-white text-2xl mb-2" style={{ fontWeight: 700 }}>
                    Congratulations! 🎉
                  </h3>
                  <p className="text-white/90 text-sm mb-6">
                    You've earned a free CGM sensor
                  </p>
                  
                  <button className="w-full bg-white text-emerald-600 py-3 px-6 rounded-2xl hover:bg-white/90 transition-all" style={{ fontWeight: 600 }}>
                    Claim Your Reward
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Streak Hero Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border border-orange-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-orange-700 text-sm mb-1" style={{ fontWeight: 600 }}>
                        Current Streak
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-orange-900" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                          {streak}
                        </h3>
                        <span className="text-orange-700 text-xl" style={{ fontWeight: 600 }}>
                          {streak === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Flame className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Best: {bestStreak} days</span>
                  </div>
                </div>

                {/* CGM Reward Card */}
                <div className="bg-gradient-to-br from-[#5B7FF3]/10 to-[#7B9FF9]/10 rounded-3xl p-6 border border-[#5B7FF3]/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">
                        {cgmsEarned === 0 ? 'Your First' : 'Next'} Free CGM
                      </p>
                      <p className="text-gray-900 text-xl" style={{ fontWeight: 700 }}>
                        {nextCGMDays} Day Streak
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-full flex items-center justify-center shadow-lg">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  {/* Large Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextCGM}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-[#7B9FF9] to-[#5B7FF3] rounded-full relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/40"></div>
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 text-sm">
                        <span className="text-[#5B7FF3]" style={{ fontWeight: 700 }}>{daysUntilNextCGM}</span> days to go
                      </p>
                      <p className="text-[#5B7FF3] text-sm" style={{ fontWeight: 600 }}>
                        {progressToNextCGM.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                <Gift className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-purple-900 text-2xl mb-1" style={{ fontWeight: 700 }}>
                  {cgmsEarned}
                </p>
                <p className="text-purple-700 text-xs">CGMs Earned</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <Trophy className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-blue-900 text-2xl mb-1" style={{ fontWeight: 700 }}>
                  {bestStreak}
                </p>
                <p className="text-blue-700 text-xs">Best Streak</p>
              </div>
            </div>

            {/* Next Milestones */}
            {!justEarnedCGM && (
              <div>
                <h3 className="text-gray-600 text-sm mb-3" style={{ fontWeight: 600 }}>
                  Coming Up
                </h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-200">
                    <div className="w-10 h-10 bg-[#5B7FF3] rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                        {nextMilestone} Days
                      </p>
                      <p className="text-gray-500 text-xs">Free CGM Sensor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5B7FF3] text-xs" style={{ fontWeight: 600 }}>
                        {Math.ceil((nextMilestone - streak) / 7)}w
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100 opacity-60">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>
                        {followingMilestone} Days
                      </p>
                      <p className="text-gray-400 text-xs">Free CGM Sensor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs" style={{ fontWeight: 600 }}>
                        {Math.ceil((followingMilestone - streak) / 7)}w
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Message */}
            {!justEarnedCGM && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 text-center border border-orange-100"
              >
                <Sparkles className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <p className="text-gray-700 text-sm leading-relaxed">
                  {daysUntilNextCGM <= 7 
                    ? `Almost there! Just ${daysUntilNextCGM} more ${daysUntilNextCGM === 1 ? 'day' : 'days'} to your ${cgmsEarned === 0 ? 'first' : 'next'} free CGM! 🎉`
                    : `Keep up the great work! You're building a ${streak}-day healthy habit. 💪`
                  }
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}