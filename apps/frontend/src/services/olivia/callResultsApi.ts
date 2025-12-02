/**
 * Call Results API Service
 * 用于 CallResultsPage 的 API 调用
 */

import axios from 'axios';

const MINERVA_BASE_URL = import.meta.env.VITE_MINERVA_BASE_URL || 'http://localhost:8000';
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ConversationSummary {
  overview: string;
  key_findings: string[];
  duration: string;
}

export interface Goal {
  id: string;
  title: string;
  status: 'ACHIEVED' | 'IN PROGRESS' | 'NOT STARTED';
  currentBehavior?: string;
  recommendation: string;
}

export interface TodoSuggestion {
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  time_of_day: string;
  time_description: string;
  target_count: number;
  priority?: 'high' | 'medium' | 'low';
  recommendation_tag?: 'ai_recommended' | 'quick_win' | 'high_impact' | 'doctor_suggested';
}

export interface TranscriptMessage {
  role: string;
  content: string;
  timestamp?: string;
}

/**
 * 生成对话摘要
 */
export async function generateConversationSummary(
  transcript: TranscriptMessage[],
  durationSeconds: number
): Promise<ConversationSummary> {
  try {
    const response = await axios.post(
      `${MINERVA_BASE_URL}/intake/generate-conversation-summary`,
      {
        transcript,
        duration_seconds: durationSeconds,
      }
    );

    return response.data.summary;
  } catch (error) {
    console.error('Failed to generate conversation summary:', error);
    throw error;
  }
}

/**
 * 生成并保存健康目标
 */
export async function generateGoals(
  userId: string,
  conversationId: string,
  transcript: TranscriptMessage[]
): Promise<Goal[]> {
  try {
    const response = await axios.post(`${MINERVA_BASE_URL}/intake/generate-goals`, {
      user_id: userId,
      conversation_id: conversationId,
      transcript,
    });

    return response.data.goals;
  } catch (error) {
    console.error('Failed to generate goals:', error);
    throw error;
  }
}

/**
 * 生成 TODO 建议（不保存到数据库）
 */
export async function generateTodoSuggestions(
  userId: string,
  conversationId: string,
  transcript: TranscriptMessage[]
): Promise<TodoSuggestion[]> {
  try {
    const response = await axios.post(
      `${MINERVA_BASE_URL}/intake/generate-todo-suggestions`,
      {
        user_id: userId,
        conversation_id: conversationId,
        transcript,
      }
    );

    return response.data.suggestions;
  } catch (error) {
    console.error('Failed to generate TODO suggestions:', error);
    throw error;
  }
}

/**
 * 批量创建选中的 TODOs
 */
export async function batchCreateTodos(
  userId: string,
  conversationId: string,
  weekStart: string,
  todos: TodoSuggestion[]
): Promise<{ count: number; todos: any[] }> {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/api/todos/batch-create`, {
      user_id: userId,
      conversation_id: conversationId,
      week_start: weekStart,
      todos: todos.map((todo) => ({
        ...todo,
        current_count: 0,
        status: 'pending',
        user_selected: true,
      })),
    });

    return {
      count: response.data.count,
      todos: response.data.todos,
    };
  } catch (error) {
    console.error('Failed to batch create todos:', error);
    throw error;
  }
}

/**
 * 获取当前周的开始日期 (Monday, YYYY-MM-DD 格式)
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust when day is Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);

  // Format as YYYY-MM-DD
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
