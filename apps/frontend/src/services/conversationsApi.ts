/**
 * Conversations API Service
 *
 * Handles all API calls related to conversation history and details.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface Conversation {
  id: string;
  type: 'retell_voice' | 'tavus_video' | 'gpt_chat';
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  transcript?: string | any;
  summary: string;
  key_topics: string[];
  insights?: string;
  extracted_data: Record<string, any>;
}

export interface ConversationHistory {
  conversations: Conversation[];
  count: number;
}

export interface ConversationDetail extends Conversation {
  // All fields from conversations table
  conversation_id: string;
  user_id: string;
  conversation_name?: string;
  tavus_conversation_id?: string;
  tavus_conversation_url?: string;
  tavus_replica_id?: string;
  tavus_persona_id?: string;
  retell_call_id?: string;
  retell_agent_id?: string;
  call_status?: string;
  call_type?: string;
  call_cost?: string;
  disconnection_reason?: string;
  recording_url?: string;
  transcript_object?: string;
  status?: string;
  shutdown_reason?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties?: string;
  metadata?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get conversation history for a user
 */
export async function getConversationHistory(
  userId: string,
  limit: number = 10
): Promise<ConversationHistory> {
  const params = new URLSearchParams({ limit: limit.toString() });

  const response = await fetch(
    `${API_BASE_URL}/api/conversations/history/${userId}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation history: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get detailed information for a specific conversation
 */
export async function getConversationDetail(
  conversationId: string
): Promise<ConversationDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation detail: ${response.statusText}`);
  }

  const data = await response.json();
  return data.conversation;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }
}
