/**
 * Tavus视频对话相关类型定义
 */

export interface TavusConversation {
  conversation_id: string;
  conversation_url: string;        // Daily.co URL (e.g., https://tavus.daily.co/xxx)
  conversation_name: string;
  status: 'active' | 'ended';
  replica_id: string;
  persona_id: string;
  created_at?: string;
}

export interface TavusConversationResponse {
  success: boolean;
  conversation_id: string;
  user_id: string;
  message: string;
  conversation_details: TavusConversation;
}

export interface TavusMessageResponse {
  success: boolean;
  conversation_id: string;
  user_message: string;
  avatar_response: string;
  function_call?: {
    name: string;
    arguments: Record<string, any>;
  };
  function_result?: any;
  timestamp: string;
}

export interface ConversationState {
  isLoading: boolean;
  error: string | null;
  conversation: TavusConversation | null;
}
