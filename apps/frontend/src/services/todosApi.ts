/**
 * Todos API Service
 *
 * Handles all API calls related to user todos/goals.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface Todo {
  id: number;
  user_id: string;
  conversation_id?: string;
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit?: string;
  time_of_day?: string;
  time_description?: string;
  target_count: number;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_today: boolean;
  uploaded_images: string[];
  notes?: string;
  week_start?: string;
  created_at: string;
  completed_at?: string;
}

export interface CreateTodoPayload {
  user_id: string;
  title: string;
  description?: string;
  category?: Todo['category'];
  health_benefit?: string;
  time_of_day?: string;
  time_description?: string;
  target_count?: number;
  current_count?: number;
  status?: Todo['status'];
  week_start?: string;
  conversation_id?: string;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  category?: Todo['category'];
  health_benefit?: string;
  time_of_day?: string;
  time_description?: string;
  target_count?: number;
  current_count?: number;
  status?: Todo['status'];
  completed_today?: number;
  uploaded_images?: string[];
  notes?: string;
  week_start?: string;
}

export interface CheckInPayload {
  notes?: string;
  images?: string[];
}

/**
 * Get todos for a user
 */
export async function getTodos(
  userId: string,
  filters?: {
    status?: Todo['status'];
    week_start?: string;
  }
): Promise<Todo[]> {
  const params = new URLSearchParams({ user_id: userId });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.week_start) {
    params.append('week_start', filters.week_start);
  }

  const response = await fetch(`${API_BASE_URL}/api/todos?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.statusText}`);
  }

  const data = await response.json();
  return data.todos;
}

/**
 * Get a specific todo by ID
 */
export async function getTodo(todoId: number): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch todo: ${response.statusText}`);
  }

  const data = await response.json();
  return data.todo;
}

/**
 * Create a new todo
 */
export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.statusText}`);
  }

  const data = await response.json();
  return data.todo;
}

/**
 * Update a todo
 */
export async function updateTodo(
  todoId: number,
  payload: UpdateTodoPayload
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.statusText}`);
  }

  const data = await response.json();
  return data.todo;
}

/**
 * Delete a todo
 */
export async function deleteTodo(todoId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.statusText}`);
  }
}

/**
 * Check in / complete a todo (increment progress)
 */
export async function checkInTodo(
  todoId: number,
  payload: CheckInPayload
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to check in todo: ${response.statusText}`);
  }

  const data = await response.json();
  return data.todo;
}

/**
 * Reset daily completion status for all todos of a user
 */
export async function resetDailyCompletion(userId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/todos/reset-daily/${userId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to reset daily completion: ${response.statusText}`);
  }

  const data = await response.json();
  return data.count;
}
