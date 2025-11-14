/**
 * 通用对话类型定义
 */

export enum ConversationType {
  TEXT = 'gpt_chat',
  VOICE = 'retell_voice',
  VIDEO = 'tavus_video'
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    functionCall?: any;
    audioUrl?: string;
    videoUrl?: string;
  };
}

export interface BaseConversation {
  conversation_id: string;
  user_id: string;
  type: ConversationType;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'ended' | 'error';
}

export interface ConversationHistory extends BaseConversation {
  conversation_name?: string;
  duration_seconds?: number;
  transcript?: Message[];
  metadata?: Record<string, any>;
}

export interface ConversationStats {
  total_conversations: number;
  by_type: Record<ConversationType, number>;
  total_duration_seconds: number;
  average_duration_seconds: number;
}
