import { motion, AnimatePresence } from 'framer-motion';
import { X as XIcon, Trophy, Flame, Star, TrendingUp, Sparkles, Camera } from 'lucide-react';
import { Todo } from '@/services/todosApi';

interface WeeklySummaryModalProps {
  todos: Todo[];
  onClose: () => void;
}

export function WeeklySummaryModal({ todos, onClose }: WeeklySummaryModalProps) {
  // Calculate stats
  const totalGoals = todos.length;
  const completedGoals = todos.filter(t => t.current_count >= t.target_count).length;
  const totalCheckIns = todos.reduce((sum, t) => sum + t.current_count, 0);
  const totalPhotos = todos.reduce((sum, t) => sum + (t.uploaded_images?.length || 0), 0);
  const completionRate = Math.round((completedGoals / totalGoals) * 100);
  const currentStreak = 7; // Mock data

  // Calculate achievements
  const achievements = [];
  if (completionRate >= 80) achievements.push({ icon: Trophy, label: 'High Achiever', color: 'from-amber-400 to-yellow-500' });
  if (currentStreak >= 7) achievements.push({ icon: Flame, label: '7-Day Streak', color: 'from-orange-400 to-red-500' });
  if (totalPhotos >= 10) achievements.push({ icon: Camera, label: 'Photo Master', color: 'from-purple-400 to-pink-500' });
  if (completedGoals === totalGoals) achievements.push({ icon: Star, label: 'Perfect Week', color: 'from-emerald-400 to-green-500' });

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      />

      {/* Modal - CENTERED */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-full max-w-[360px] max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95 z-10"
          >
            <XIcon className="w-4 h-4" />
          </button>

          <div className="text-center text-white mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl mb-1" style={{ fontWeight: 700 }}>
              Week Completed!
            </h2>
            <p className="text-white/80 text-sm">
              Nov 11 - Nov 17, 2024
            </p>
          </div>

          {/* Completion Circle */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - completionRate / 100) }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="text-4xl text-white" style={{ fontWeight: 700 }}
              >
                {completionRate}%
              </motion.div>
              <p className="text-white/80 text-xs">Complete</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
              <div className="text-2xl text-emerald-600 mb-1" style={{ fontWeight: 700 }}>
                {completedGoals}
              </div>
              <p className="text-xs text-emerald-700">
                Goals Done
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-[#5B7FF3]/10 to-[#7B9FF9]/10 rounded-2xl border border-[#5B7FF3]/20">
              <div className="text-2xl text-[#5B7FF3] mb-1" style={{ fontWeight: 700 }}>
                {totalCheckIns}
              </div>
              <p className="text-xs text-[#5B7FF3]">
                Check-ins
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="text-2xl text-purple-600 mb-1" style={{ fontWeight: 700 }}>
                {totalPhotos}
              </div>
              <p className="text-xs text-purple-700">
                Photos
              </p>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-gray-900 mb-3 flex items-center gap-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                <Trophy className="w-4 h-4 text-amber-500" />
                Achievements Earned
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-2`}>
                      <achievement.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 600 }}>
                      {achievement.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 text-sm mb-1" style={{ fontWeight: 600 }}>
                  AI Insight
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {completionRate >= 80
                    ? "Amazing work! Your consistency is paying off. Keep up this momentum next week."
                    : completionRate >= 50
                    ? "Good progress! Try setting reminders to help you stay on track next week."
                    : "Let's focus on building consistency. Start with just 1-2 key habits next week."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-2xl hover:shadow-lg active:scale-[0.98] transition-all"
            style={{ fontWeight: 600 }}
          >
            Start New Week
          </button>
        </div>
      </motion.div>
    </>
  );
}
