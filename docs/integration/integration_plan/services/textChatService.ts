/**
 * GPT文本聊天服务
 *
 * 负责与Flask后端的GPT聊天API端点通信
 */

import axios from 'axios';
import type { Message } from '../types/conversation';

const API_BASE = '/api';

export interface ChatResponse {
  success: boolean;
  message: string;
  function_called?: string;
  error?: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  user_id: string;
  conversations: any[];
  stats: {
    total_conversations: number;
    by_type: Record<string, number>;
  };
}

/**
 * GPT文本聊天服务
 */
export const textChatService = {
  /**
   * 开始新的文本聊天
   * @param userId 用户ID
   */
  async startChat(userId: string) {
    try {
      const response = await axios.post(`${API_BASE}/avatar/gpt/start`, {
        user_id: userId
      });

      return response.data;
    } catch (error) {
      console.error('Failed to start chat:', error);
      throw error;
    }
  },

  /**
   * 发送消息并获取回复
   * @param userId 用户ID
   * @param message 消息内容
   */
  async chat(userId: string, message: string): Promise<ChatResponse> {
    try {
      const response = await axios.post(`${API_BASE}/avatar/gpt/chat`, {
        user_id: userId,
        message
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  /**
   * 结束聊天并保存到数据库
   * @param userId 用户ID
   */
  async endChat(userId: string) {
    try {
      const response = await axios.post(`${API_BASE}/avatar/gpt/end`, {
        user_id: userId
      });

      return response.data;
    } catch (error) {
      console.error('Failed to end chat:', error);
      throw error;
    }
  },

  /**
   * 获取用户的聊天历史
   * @param userId 用户ID
   * @param limit 返回数量
   * @param days 天数范围
   */
  async getHistory(userId: string, limit: number = 10, days: number = 7): Promise<ConversationHistoryResponse> {
    try {
      const response = await axios.get(`${API_BASE}/avatar/gpt/history/${userId}`, {
        params: { limit, days }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  },

  /**
   * 清除聊天历史
   * @param userId 用户ID
   */
  async clearHistory(userId: string) {
    try {
      const response = await axios.post(`${API_BASE}/avatar/gpt/clear/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw error;
    }
  }
};
