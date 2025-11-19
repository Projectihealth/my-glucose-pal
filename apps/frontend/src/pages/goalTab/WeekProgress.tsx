import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getWeeklyStats, WeeklyStats, Todo } from '@/services/todosApi';

interface WeekProgressProps {
  todos: Todo[];
  userId: string;
  weekStart: string;
}

export function WeekProgress({ todos, userId, weekStart }: WeekProgressProps) {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressRefreshKey = useMemo(
    () => todos.map(todo => `${todo.id}-${todo.current_count}-${todo.target_count}`).join('|'),
    [todos]
  );

  useEffect(() => {
    if (!userId || !weekStart) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWeeklyStats(userId, weekStart);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch weekly stats:', err);
        setError('Failed to load weekly progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId, weekStart, progressRefreshKey]);

  const completionDays = stats?.days || [];
  const currentDayIndex = (() => {
    if (!stats) return -1;
    const todayStr = new Date().toISOString().split('T')[0];
    return stats.days.findIndex(d => d.date === todayStr);
  })();

  const weekAverage = stats?.week_average ?? 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 mb-0.5" style={{ fontSize: '15px', fontWeight: 600 }}>
            Week Progress
          </h3>
          <p className="text-xs text-gray-500">
            Daily completion rate
            {error && <span className="text-red-400 ml-2">· {error}</span>}
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl text-[#5B7FF3]" style={{ fontWeight: 700 }}>
            {weekAverage}%
          </div>
          <p className="text-xs text-gray-500">Avg</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-3">
        {completionDays.map((day, index) => {
          const isFuture =
            currentDayIndex >= 0 ? index > currentDayIndex : false;
          const isToday = index === currentDayIndex;
          const height = isFuture ? 0 : day.rate;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div className="w-full flex items-end h-24 relative group">
                {!isFuture && (
                  <>
                    {/* Background bar */}
                    <div className="absolute bottom-0 w-full h-full bg-gray-100 rounded-t-lg"></div>
                    {/* Progress bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className={`absolute bottom-0 w-full rounded-t-lg ${
                        day.rate >= 80
                          ? 'bg-gradient-to-t from-emerald-400 to-emerald-300'
                          : day.rate >= 50
                          ? 'bg-gradient-to-t from-[#7B9FF9] to-[#5B7FF3]'
                          : day.rate > 0
                          ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                          : 'bg-gradient-to-t from-gray-300 to-gray-200'
                      }`}
                    />

                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                        {day.completed}/{day.total}
                      </div>
                      <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 mx-auto -mt-0.5"></div>
                    </div>
                  </>
                )}
              </div>

              {/* Day label */}
              <p className={`text-xs ${isToday ? 'text-[#5B7FF3] font-semibold' : 'text-gray-500'}`}>
                {day.day_label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-300"></div>
          <span className="text-xs text-gray-600">Great (80%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#7B9FF9] to-[#5B7FF3]"></div>
          <span className="text-xs text-gray-600">Good (50-79%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-300"></div>
          <span className="text-xs text-gray-600">Try harder</span>
        </div>
      </div>
    </div>
  );
}
