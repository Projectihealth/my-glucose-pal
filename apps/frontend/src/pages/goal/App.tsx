import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  Cell
} from 'recharts';

import { Habit, HabitCategory, WeeklyData, UserStats, Recommendation, DailyLog } from './types';
import { getHealthRecommendation } from './services/geminiService';
import { HabitCard } from './components/HabitCard';
import { CalendarStrip } from './components/CalendarStrip';
import { FireIcon, SparklesIcon, ChevronRightIcon, PlusIcon, TargetIcon, LockIcon, XIcon } from './components/Icons';
import { CreateHabitModal } from './components/CreateHabitModal';
import { StreakModal } from './components/StreakModal';
import { HabitDetailsModal } from './components/HabitDetailsModal';
import { getStoredUserId } from '@/utils/userUtils';
import * as habitsApi from '@/services/habitsApi';
import { useHabits } from '@/hooks/useHabits';
import { useQueryClient } from '@tanstack/react-query';

// --- MOCK DATA ---
const MOCK_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Eat a nutritious breakfast',
    description: 'High protein, low carb start (e.g., eggs + avocado).',
    category: HabitCategory.NUTRITION,
    logs: {
        [format(new Date(), 'yyyy-MM-dd')]: { status: 'COMPLETED', timestamp: Date.now() }
    },
    frequency: 7,
    streak: 3,
    emoji: '🥑'
  },
  {
    id: '2',
    title: '15min Walk after Lunch',
    description: 'Helps blunt the post-meal glucose spike.',
    category: HabitCategory.EXERCISE,
    logs: {},
    frequency: 7,
    streak: 2,
    emoji: '🚶'
  },
  {
    id: '3',
    title: 'Dim the light before sleep',
    description: 'Best time: 10-11 PM to boost melatonin.',
    category: HabitCategory.SLEEP,
    logs: {},
    frequency: 7,
    streak: 1,
    emoji: '🌙'
  }
];

const MOCK_ARCHIVED_HABITS: Habit[] = [
    {
      id: 'archived-1',
      title: 'No caffeine after 2 PM',
      description: 'Improves sleep latency.',
      category: HabitCategory.SLEEP,
      logs: {},
      frequency: 7,
      streak: 0
    },
    {
      id: 'archived-2',
      title: '5 min Meditation',
      description: 'Morning mindfulness practice.',
      category: HabitCategory.MINDFULNESS,
      logs: {},
      frequency: 5,
      streak: 0
    }
];

// Mock data for the "Last Week" report which is unlocked
const LAST_WEEK_STATS = [
  { category: HabitCategory.NUTRITION, score: 92, completed: 12, total: 13 },
  { category: HabitCategory.EXERCISE, score: 65, completed: 8, total: 12 },
  { category: HabitCategory.SLEEP, score: 78, completed: 11, total: 14 },
  { category: HabitCategory.MINDFULNESS, score: 40, completed: 2, total: 5 },
];

const LAST_WEEK_DAILY_STATS = [
  { day: 'Mon', count: 5 },
  { day: 'Tue', count: 6 },
  { day: 'Wed', count: 2 }, // Low
  { day: 'Thu', count: 5 },
  { day: 'Fri', count: 1 }, // Low
  { day: 'Sat', count: 4 },
  { day: 'Sun', count: 2 }, // Low
];

export default function App() {
  const userId = getStoredUserId();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const { data: fetchedHabits, isLoading: habitsLoading, error: habitsError } = useHabits(userId || '');

  // Sync local state with cached habits
  useEffect(() => {
    if (fetchedHabits) {
      setHabits(fetchedHabits);
    }
  }, [fetchedHabits]);

  // Fallback to mock data if backend fails
  useEffect(() => {
    if (habitsError) {
      console.error('Failed to load habits:', habitsError);
      setHabits(MOCK_HABITS);
    }
  }, [habitsError]);

  const syncHabits = (updater: (prev: Habit[]) => Habit[]) => {
    setHabits(prev => {
      const next = updater(prev);
      if (userId) {
        queryClient.setQueryData(['habits', userId], next);
      }
      return next;
    });
  };

  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Weekly Report State
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [reportTab, setReportTab] = useState<'last' | 'current'>('last');

  // Insights State
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Detail/Log Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  // --- DERIVED STATE ---
  const selectedDateStr = useMemo(() => format(currentDate, 'yyyy-MM-dd'), [currentDate]);

  const habitsForDate = habits; // In a real app, you would filter by schedule/date

  const completedCount = habits.filter(h => !!h.logs[selectedDateStr]).length;

  const totalHabits = habits.length;
  const progressPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const remainingCount = totalHabits - completedCount;

  const stats: UserStats = {
    dailyProgress: progressPercentage,
    weeklyStreak: 6, // Mocked streak
    bestStreak: 8,   // Mocked best streak
    totalCompletedToday: completedCount,
    totalHabits: totalHabits
  };

  // --- EFFECTS ---

  // Fetch AI recommendations
  useEffect(() => {
    const fetchInsight = async () => {
      if (habits.length === 0 || recommendations.length > 0) return;

      setIsLoadingRecs(true);
      try {
        const recs = await getHealthRecommendation(stats, habits);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits.length]);

  // --- HANDLERS ---
  const handleToggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompleted = !!habit.logs[selectedDateStr];

    try {
      if (isCompleted) {
        // Delete the log
        await habitsApi.deleteHabitLog(id, selectedDateStr);

        // Update local state
        syncHabits(prev => prev.map(h => {
          if (h.id !== id) return h;
          const newLogs = { ...h.logs };
          delete newLogs[selectedDateStr];
          return { ...h, logs: newLogs };
        }));
      } else {
        // Create/update the log
        await habitsApi.toggleHabitLog(id, {
          log_date: selectedDateStr,
          status: 'COMPLETED'
        });

        // Update local state
        syncHabits(prev => prev.map(h => {
          if (h.id !== id) return h;
          const newLogs = { ...h.logs };
          newLogs[selectedDateStr] = {
            status: 'COMPLETED',
            timestamp: Date.now()
          };
          return { ...h, logs: newLogs };
        }));
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      // TODO: Show error toast
    }
  };

  const handleUpdateLog = (habitId: string, log: DailyLog | null) => {
      syncHabits(prev => prev.map(h => {
          if (h.id !== habitId) return h;
          const newLogs = { ...h.logs };
          if (log) {
              newLogs[selectedDateStr] = log;
          } else {
              delete newLogs[selectedDateStr];
          }
          return { ...h, logs: newLogs };
      }));
  };

  const handleOpenDetailModal = (habit: Habit) => {
      setSelectedHabitForDetail(habit);
      setIsDetailModalOpen(true);
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await habitsApi.deleteHabit(id);
      syncHabits(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete habit:', error);
      // TODO: Show error toast
    }
  };

  const handleEditHabit = (habit: Habit) => {
      setEditingHabit(habit);
      setIsAddModalOpen(true);
  };

  const handleDateSelect = (dateStr: string) => {
    // Parse date string properly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    setCurrentDate(new Date(year, month - 1, day));
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'logs' | 'streak'>) => {
    try {
      // Map frontend category to backend category
      const categoryMap: Record<string, string> = {
        'NUTRITION': 'diet',
        'EXERCISE': 'exercise',
        'SLEEP': 'sleep',
        'MINDFULNESS': 'stress',
        'OTHER': 'other'
      };

      if (editingHabit) {
        // Update existing habit
        await habitsApi.updateHabit(editingHabit.id, {
          title: habitData.title,
          description: habitData.description,
          category: categoryMap[habitData.category] || 'other',
          emoji: habitData.emoji,
          frequency: habitData.frequency
        });

        syncHabits(prev => prev.map(h =>
          h.id === editingHabit.id
            ? { ...h, ...habitData }
            : h
        ));
        setEditingHabit(null);
      } else {
        // Create new habit
        const result = await habitsApi.createHabit({
          user_id: userId,
          title: habitData.title,
          description: habitData.description,
          category: categoryMap[habitData.category] || 'other',
          emoji: habitData.emoji,
          frequency: habitData.frequency
        });

        const newHabit: Habit = {
          ...habitData,
          id: String(result.id),
          logs: {},
          streak: 0
        };
        syncHabits(prev => [...prev, newHabit]);
      }
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to save habit:', error);
      // TODO: Show error toast
    }
  };

  const handleAddRecommendation = (rec: Recommendation) => {
    if (rec.kind === 'HABIT_SUGGESTION' && rec.habitData) {
        // This is still creating a 'new' habit from a template, so we don't use editingHabit state
        syncHabits(prev => [...prev, {
            id: `rec-${Date.now()}`,
            title: rec.title,
            description: rec.content,
            category: rec.category,
            frequency: rec.habitData!.frequency || 7,
            emoji: '✨',
            logs: {},
            streak: 0
        }]);
    }
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const handleRestoreHabit = (habitToRestore: Habit) => {
      if (habits.some(h => h.id === habitToRestore.id)) {
          alert("This habit is already in your list!");
          return;
      }
      syncHabits(prev => [...prev, habitToRestore]);
      setArchivedHabits(prev => prev.filter(h => h.id !== habitToRestore.id));
  };

  const handleCloseModal = () => {
      setIsAddModalOpen(false);
      setEditingHabit(null); // Clear editing state on close
  };

  // --- CALENDAR GENERATION ---
  const calendarData: WeeklyData[] = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      const dayStr = format(d, 'yyyy-MM-dd');

      const totalForDay = habits.length;
      const completedForDay = habits.filter(h => !!h.logs[dayStr]).length;

      const isDayCompleted = totalForDay > 0 && completedForDay === totalForDay;

      return {
        day: format(d, 'EEE'),
        date: parseInt(format(d, 'd')),
        fullDate: dayStr,
        isToday: isSameDay(d, new Date()),
        isCompleted: isDayCompleted,
        isSelected: isSameDay(d, currentDate)
      };
    });
  }, [currentDate, habits]);

  const currentMonthStr = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">

      {/* --- HEADER --- */}
      <header className="bg-white pt-8 pb-6 px-6 sticky top-0 z-40 border-b border-gray-100">
        <div className="mb-4">
          <p className="text-[#5B7FF3] text-[11px] tracking-[2.26px] uppercase mb-3 font-semibold">
            MY GOALS
          </p>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[#101828] mb-2" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2' }}>
                Track Your Progress
              </h1>
              <p className="text-[#6A7282] text-[15px]">
                Build healthy habits, one day at a time
              </p>
            </div>
            <button
              onClick={() => setIsStreakModalOpen(true)}
              className="flex items-center gap-1.5 bg-orange-50 pl-2 pr-3 py-1.5 rounded-full border border-orange-100/50 shadow-sm shrink-0 hover:bg-orange-100 transition-colors active:scale-95 cursor-pointer"
            >
              <FireIcon className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-orange-600 font-bold text-xs whitespace-nowrap">{stats.weeklyStreak}d</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-4 py-5">

        {/* --- PROGRESS SECTION --- */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-base">Daily Progress</h3>
            <span className="text-[#5B7FF3] font-bold text-xl">{progressPercentage}%</span>
          </div>

          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="text-gray-400 text-xs text-center pt-0.5">
            {totalHabits - completedCount} {totalHabits - completedCount === 1 ? 'habit' : 'habits'} remaining to hit your daily goal.
          </p>
        </section>

        {/* --- ADAPTIVE INSIGHTS --- */}
        {recommendations.length > 0 && (
        <section>
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-4 h-4 text-[#5B7FF3]" />
              <h3 className="font-bold text-gray-900 text-base">Olivia's Insights</h3>
            </div>

            <div className="space-y-2.5">
                {recommendations.map((rec) => {
                    const isGrowth = rec.kind === 'HABIT_SUGGESTION';

                    if (isGrowth) {
                        return (
                            <div key={rec.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                                <button
                                    onClick={() => handleDismissRecommendation(rec.id)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-400 p-1 transition-colors"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                                <div className="pr-7">
                                    {rec.habitData?.impact === 'HIGH' && (
                                        <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full mb-1.5 inline-block">
                                            High Impact
                                        </span>
                                    )}
                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{rec.title}</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed mb-3">{rec.content}</p>
                                    <button
                                        onClick={() => handleAddRecommendation(rec)}
                                        className="text-xs font-semibold text-[#5B7FF3] bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                    >
                                        Got it, thanks 💪
                                    </button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                             <div key={rec.id} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 relative">
                                <button
                                    onClick={() => handleDismissRecommendation(rec.id)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-400 p-1 transition-colors"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>

                                <div className="pr-7">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{rec.title}</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed mb-3">
                                        {rec.content}
                                    </p>
                                    <button
                                        onClick={() => handleDismissRecommendation(rec.id)}
                                        className="text-xs font-semibold text-[#5B7FF3] bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    >
                                        Got it, thanks 💪
                                    </button>
                                </div>
                             </div>
                        );
                    }
                })}
            </div>
        </section>
        )}

        {/* --- CALENDAR --- */}
        <section>
            <CalendarStrip
                dates={calendarData}
                onSelectDate={handleDateSelect}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                currentMonth={currentMonthStr}
            />
        </section>

        {/* --- HABITS LIST --- */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>
                        {isSameDay(currentDate, new Date()) ? "Today's Habits" : format(currentDate, 'MMM d')}
                    </h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {completedCount}/{totalHabits}
                    </span>
                </div>

                <button
                    onClick={() => { setEditingHabit(null); setIsAddModalOpen(true); }}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] text-white hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                    aria-label="Add Habit"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-2.5">
                {habitsForDate.map(habit => (
                    <HabitCard
                        key={habit.id}
                        habit={habit}
                        onToggle={handleToggleHabit}
                        onDelete={handleDeleteHabit}
                        onEdit={handleEditHabit}
                        onClickBody={handleOpenDetailModal}
                        isCompletedToday={!!habit.logs[selectedDateStr]}
                        selectedDate={selectedDateStr}
                    />
                ))}
            </div>

            {habitsForDate.length === 0 && (
                 <div className="text-center py-10 flex flex-col items-center justify-center">
                    <p className="text-slate-400 mb-4">No habits scheduled for today.</p>
                    <button
                        onClick={() => { setEditingHabit(null); setIsAddModalOpen(true); }}
                        className="px-5 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-500 transition-colors"
                    >
                        Create your first goal
                    </button>
                 </div>
            )}
        </section>

        {/* --- WEEKLY REPORT --- */}
        <section className="pt-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsReportExpanded(!isReportExpanded)}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SparklesIcon className="w-5 h-5 text-[#5B7FF3]" />
                            <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Weekly Summary</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium ml-7">
                            {isReportExpanded ? 'Your wellness insights' : 'Tap to see your progress'}
                        </p>
                    </div>

                    <div className={`w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center transition-all duration-300 ${isReportExpanded ? 'rotate-90 bg-slate-50 text-slate-600' : 'bg-white text-slate-300'}`}>
                        <ChevronRightIcon className="w-5 h-5" />
                    </div>
                </div>

                {isReportExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">

                        {/* Tabs */}
                        <div className="flex mx-6 mb-8 bg-slate-100 p-1 rounded-full w-fit">
                            <button
                                onClick={(e) => { e.stopPropagation(); setReportTab('last'); }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${reportTab === 'last' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Last Week
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setReportTab('current'); }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${reportTab === 'current' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                This Week
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 pb-8 min-h-[200px] relative">

                            {/* LAST WEEK (UNLOCKED) */}
                            {reportTab === 'last' && (
                                <div className="space-y-8">

                                    {/* 1. Minimal Vibe Card */}
                                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
                                         <div className="shrink-0 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl shadow-sm">
                                            🔥
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h3 className="font-bold text-slate-900 text-base">On Fire!</h3>
                                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    Weekly Vibe
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                You crushed your nutrition goals. Maybe show your sleep schedule a little extra love this week?
                                            </p>
                                         </div>
                                    </div>

                                    {/* 2. Daily Check-ins Chart */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <h4 className="text-sm font-bold text-slate-700">Daily Check-ins</h4>
                                        </div>
                                        <div className="h-40 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={LAST_WEEK_DAILY_STATS} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={0}>
                                                    <XAxis
                                                        dataKey="day"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                                        dy={10}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: '#f8fafc' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                                        labelStyle={{ display: 'none' }}
                                                        formatter={(value: number) => [`${value} Check-ins`, 'Count']}
                                                    />
                                                    <Bar
                                                        dataKey="count"
                                                        radius={[4, 4, 4, 4]}
                                                        barSize={32}
                                                        background={{ fill: '#f1f5f9', radius: 4 }}
                                                    >
                                                        <LabelList
                                                            dataKey="count"
                                                            position="top"
                                                            style={{ fill: '#64748b', fontSize: '11px', fontWeight: 'bold' }}
                                                        />
                                                        {LAST_WEEK_DAILY_STATS.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.count < 3 ? '#bfdbfe' : '#3b82f6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* 3. Category Bar Chart */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <h4 className="text-sm font-bold text-slate-700">Category Completion Rate</h4>
                                        </div>
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={LAST_WEEK_STATS} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barGap={0}>
                                                    <XAxis
                                                        dataKey="category"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                                        tickFormatter={(val) => {
                                                            if (val === HabitCategory.NUTRITION) return 'Nutri';
                                                            if (val === HabitCategory.EXERCISE) return 'Exercise';
                                                            if (val === HabitCategory.SLEEP) return 'Sleep';
                                                            if (val === HabitCategory.MINDFULNESS) return 'Mind';
                                                            return val;
                                                        }}
                                                        dy={10}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: '#f8fafc' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                                        formatter={(value: number, name: string, props: any) => {
                                                            const { completed, total } = props.payload;
                                                            return [`${completed}/${total} Completed`, 'Progress'];
                                                        }}
                                                        labelStyle={{ display: 'none' }}
                                                    />
                                                    <Bar
                                                        dataKey="score"
                                                        radius={[8, 8, 8, 8]}
                                                        barSize={32}
                                                        background={{ fill: '#f1f5f9', radius: 8 }}
                                                    >
                                                        <LabelList
                                                            dataKey="score"
                                                            position="top"
                                                            formatter={(val: number) => `${val}%`}
                                                            style={{ fill: '#64748b', fontSize: '11px', fontWeight: 'bold' }}
                                                        />
                                                        {LAST_WEEK_STATS.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.score < 50 ? '#bfdbfe' : '#3b82f6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reportTab === 'current' && (
                                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <LockIcon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-700 text-sm mb-1">Collecting Data...</h4>
                                    <p className="text-slate-400 font-medium text-xs max-w-[200px]">
                                        Your insights are brewing! Check back on Sunday evening for your vibe check.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </section>

      </main>

      <CreateHabitModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        archivedHabits={archivedHabits}
        onRestore={handleRestoreHabit}
        initialData={editingHabit}
      />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        currentStreak={stats.weeklyStreak}
        bestStreak={stats.bestStreak}
      />

      <HabitDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        habit={selectedHabitForDetail}
        selectedDate={selectedDateStr}
        onSave={handleUpdateLog}
      />
    </div>
  );
}
