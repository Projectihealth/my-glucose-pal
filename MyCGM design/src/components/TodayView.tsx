import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';

interface TodoWithWeek {
  id: number;
  title: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  target_count: number;
  current_count: number;
  week_start_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_today?: boolean;
  best_time?: string; // e.g., "7-9 AM"
}

interface TodayViewProps {
  todos: TodoWithWeek[];
  onQuickCheckIn: (id: number) => void;
}

export function TodayView({ todos, onQuickCheckIn }: TodayViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filter today's incomplete tasks (not completed_today and not fully completed)
  const todayTasks = todos.filter(t => !t.completed_today && t.current_count < t.target_count);
  const completedToday = todos.filter(t => t.completed_today).length;
  const totalToday = todos.length; // Total tasks for today
  
  const getBestTime = (category: string) => {
    switch (category) {
      case 'diet':
        return '7-9 AM';
      case 'exercise':
        return '5-7 PM';
      case 'sleep':
        return '10-11 PM';
      default:
        return 'Anytime';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#5B7FF3]/5 to-[#7B9FF9]/5 rounded-3xl border border-[#5B7FF3]/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center shadow-md">
            <span className="text-white text-lg">📅</span>
          </div>
          <div className="text-left">
            <h3 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
              Today - Nov 17
            </h3>
            <p className="text-xs text-gray-500">
              {completedToday} of {totalToday} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedToday === totalToday && totalToday > 0 && (
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs flex items-center gap-1" style={{ fontWeight: 600 }}>
              <CheckCircle2 className="w-3 h-3" />
              All Done
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Tasks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {todayTasks.length > 0 ? (
                todayTasks.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onQuickCheckIn(todo.id)}
                        className="w-5 h-5 rounded-full border-2 border-[#5B7FF3] flex items-center justify-center flex-shrink-0 mt-0.5 hover:bg-[#5B7FF3]/10 active:scale-95 transition-all"
                      >
                        <Circle className="w-3 h-3 text-[#5B7FF3]" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Best time: {getBestTime(todo.category)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-gray-700 text-sm mb-1" style={{ fontWeight: 600 }}>
                    All tasks complete!
                  </p>
                  <p className="text-gray-500 text-xs">
                    Great job staying on track today ✨
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}