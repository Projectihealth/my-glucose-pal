import { motion } from 'framer-motion';
import { Todo } from '@/services/todosApi';

interface WeekProgressProps {
  todos: Todo[];
}

export function WeekProgress({ todos }: WeekProgressProps) {
  // Calculate daily completion rates (mock data for demonstration)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completionRates = [
    { day: 'Mon', rate: 100, completed: 3, total: 3 },
    { day: 'Tue', rate: 85, completed: 2, total: 3 },
    { day: 'Wed', rate: 100, completed: 3, total: 3 },
    { day: 'Thu', rate: 67, completed: 2, total: 3 },
    { day: 'Fri', rate: 0, completed: 0, total: 3 },  // Today - incomplete
    { day: 'Sat', rate: 0, completed: 0, total: 3 },  // Future
    { day: 'Sun', rate: 0, completed: 0, total: 3 },  // Future
  ];

  const currentDayIndex = 4; // Friday (0-indexed)
  const weekAverage = Math.round(
    completionRates.slice(0, currentDayIndex + 1).reduce((sum, day) => sum + day.rate, 0) / (currentDayIndex + 1)
  );

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
        {completionRates.map((day, index) => {
          const isFuture = index > currentDayIndex;
          const isToday = index === currentDayIndex;
          const height = isFuture ? 0 : (day.rate / 100) * 100;

          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
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
                {day.day}
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
