import { BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface TodoWithWeek {
  id: number;
  title: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  target_count: number;
  current_count: number;
  week_start_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  daily_completion?: boolean[];
}

interface WeekTrendChartProps {
  todos: TodoWithWeek[];
}

export function WeekTrendChart({ todos }: WeekTrendChartProps) {
  // Current week todos
  const currentWeekTodos = todos.filter(t => t.week_start_date === '2024-11-11');
  
  if (currentWeekTodos.length === 0) return null;

  // Mock daily completion data (in real app, this would come from actual check-in data)
  // For demo, generate based on current progress
  const getDailyCompletionRate = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalTasks = currentWeekTodos.length;
    
    // Mock data - in reality this would track actual daily completions
    return days.map((day, index) => {
      // Only show data for past days (Mon-Thu for current week)
      if (index <= 3) {
        // Simulate completion data
        const completed = currentWeekTodos.filter(t => {
          // Mock: assume tasks are completed in order through the week
          const progressPerDay = t.current_count / 4; // Spread current progress over 4 days
          return Math.floor(progressPerDay) > 0;
        }).length;
        
        const rate = (completed / totalTasks) * 100;
        return {
          day,
          rate,
          completed,
          total: totalTasks,
          isPast: true,
        };
      }
      return {
        day,
        rate: 0,
        completed: 0,
        total: totalTasks,
        isPast: false,
      };
    });
  };

  const dailyData = getDailyCompletionRate();
  const maxRate = Math.max(...dailyData.map(d => d.rate), 100);
  
  // Calculate average completion rate for past days
  const pastDays = dailyData.filter(d => d.isPast);
  const avgRate = pastDays.length > 0 
    ? pastDays.reduce((sum, d) => sum + d.rate, 0) / pastDays.length 
    : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B7FF3]/10 to-[#5B7FF3]/5 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#5B7FF3]" />
          </div>
          <div>
            <h3 className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
              Week Progress
            </h3>
            <p className="text-xs text-gray-500">Daily completion rate</p>
          </div>
        </div>

        {/* Average Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#5B7FF3]/10 to-[#7B9FF9]/10 rounded-full border border-[#5B7FF3]/20">
          <TrendingUp className="w-3 h-3 text-[#5B7FF3]" />
          <span className="text-xs text-[#5B7FF3]" style={{ fontWeight: 600 }}>
            {Math.round(avgRate)}% avg
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {dailyData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            {/* Bar */}
            <div className="w-full flex flex-col justify-end h-24">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: data.isPast ? `${(data.rate / maxRate) * 100}%` : 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: 'spring', damping: 15 }}
                className={`w-full rounded-t-lg relative group cursor-pointer ${
                  data.isPast
                    ? data.rate >= 80
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      : data.rate >= 50
                      ? 'bg-gradient-to-t from-[#5B7FF3] to-[#7B9FF9]'
                      : 'bg-gradient-to-t from-orange-500 to-orange-400'
                    : 'bg-gray-100'
                }`}
              >
                {/* Tooltip */}
                {data.isPast && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs py-1.5 px-2.5 rounded-lg whitespace-nowrap shadow-lg">
                      <p style={{ fontWeight: 600 }}>{Math.round(data.rate)}%</p>
                      <p className="text-gray-300">{data.completed}/{data.total} tasks</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Day Label */}
            <span className={`text-xs ${data.isPast ? 'text-gray-600' : 'text-gray-400'}`} style={{ fontWeight: 500 }}>
              {data.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500 to-emerald-400"></div>
          <span className="text-gray-600">Great (>80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-[#5B7FF3] to-[#7B9FF9]"></div>
          <span className="text-gray-600">Good (50-80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-orange-500 to-orange-400"></div>
          <span className="text-gray-600">Needs work (<50%)</span>
        </div>
      </div>
    </div>
  );
}
