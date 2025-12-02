export enum HabitCategory {
  NUTRITION = 'NUTRITION',
  EXERCISE = 'EXERCISE',
  SLEEP = 'SLEEP',
  MINDFULNESS = 'MINDFULNESS'
}

export interface DailyLog {
  status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'NOTE';
  timestamp: number;
  note?: string;
  photo?: string;
  audio?: string;
  imageUrl?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  logs: Record<string, DailyLog>;
  frequency: number;
  streak: number;
  emoji?: string;
  uploaded_images?: string[];
}

export interface WeeklyData {
  day: string;
  date: number;
  fullDate: string;
  isToday: boolean;
  isCompleted: boolean;
  isSelected: boolean;
}

export interface UserStats {
  dailyProgress: number;
  weeklyStreak: number;
  bestStreak: number;
  totalCompletedToday: number;
  totalHabits: number;
}

export interface Recommendation {
  id: string;
  title: string;
  content: string;
  kind: 'HABIT_SUGGESTION' | 'INSIGHT' | 'ENCOURAGEMENT';
  category: HabitCategory;
  habitData?: {
    frequency?: number;
    impact?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}
