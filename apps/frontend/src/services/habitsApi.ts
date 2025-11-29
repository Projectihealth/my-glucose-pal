/**
 * Habits API Service
 *
 * This service handles all API calls related to habits/goals management.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: 'NUTRITION' | 'EXERCISE' | 'SLEEP' | 'MINDFULNESS' | 'OTHER';
  logs: { [dateStr: string]: DailyLog };
  frequency: number; // Target count per week
  streak: number;
  emoji?: string;
}

export interface DailyLog {
  status: 'COMPLETED' | 'SKIPPED';
  timestamp: number;
  note?: string;
}

export interface CreateHabitData {
  user_id: string;
  title: string;
  description?: string;
  category?: string; // Backend uses lowercase: 'diet', 'exercise', etc.
  emoji?: string;
  frequency?: number;
  health_benefit?: string;
  week_start?: string;
}

export interface UpdateHabitData {
  title?: string;
  description?: string;
  category?: string;
  emoji?: string;
  frequency?: number;
  health_benefit?: string;
}

export interface CreateLogData {
  log_date: string; // YYYY-MM-DD
  status: 'COMPLETED' | 'SKIPPED';
  note?: string;
}

/**
 * Get all habits for a user with their logs
 */
export async function getHabits(
  userId: string,
  options?: {
    weekStart?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<Habit[]> {
  const params = new URLSearchParams();
  if (options?.weekStart) params.append('week_start', options.weekStart);
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);

  const url = `${BACKEND_URL}/api/todos/habits/${userId}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch habits' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.habits;
}

/**
 * Create a new habit
 */
export async function createHabit(habitData: CreateHabitData): Promise<{ id: number; habit: any }> {
  const response = await fetch(`${BACKEND_URL}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habitData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create habit' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return { id: data.todo_id, habit: data.todo };
}

/**
 * Update a habit
 */
export async function updateHabit(habitId: string, updates: UpdateHabitData): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/todos/${habitId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update habit' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.todo;
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/todos/${habitId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete habit' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}

/**
 * Toggle habit completion for a specific date
 */
export async function toggleHabitLog(
  habitId: string,
  logData: CreateLogData
): Promise<{ log_id: number; log: any }> {
  const response = await fetch(`${BACKEND_URL}/api/todos/${habitId}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to toggle habit log' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a habit log for a specific date
 */
export async function deleteHabitLog(habitId: string, logDate: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/todos/${habitId}/logs/${logDate}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete habit log' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}

/**
 * Get habit streak
 */
export async function getHabitStreak(habitId: string, asOfDate?: string): Promise<number> {
  const params = new URLSearchParams();
  if (asOfDate) params.append('as_of_date', asOfDate);

  const url = `${BACKEND_URL}/api/todos/${habitId}/streak${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get streak' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.streak;
}
