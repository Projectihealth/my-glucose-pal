/**
 * Tavus视频对话服务
 *
 * 负责与Flask后端的Tavus API端点通信
 */

import axios from 'axios';
import type { TavusConversationResponse, TavusMessageResponse } from '../../types/olivia/avatar';

const API_BASE = '/api';  // 使用Vite代理

/**
 * Tavus视频对话服务
 */
export const avatarService = {
  /**
   * 开始新的视频对话
   * @param userId 用户ID
   * @returns 对话详情，包含conversation_url
   */
  async startConversation(userId: string): Promise<TavusConversationResponse> {
    try {
      const response = await axios.post(`${API_BASE}/avatar/start`, {
        user_id: userId
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to start conversation');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to start Tavus conversation:', error);
      throw error;
    }
  },

  /**
   * 发送消息（可选功能 - 如果需要文本交互）
   * @param conversationId 对话ID
   * @param message 消息内容
   */
  async sendMessage(conversationId: string, message: string): Promise<TavusMessageResponse> {
    try {
      const response = await axios.post(`${API_BASE}/avatar/message`, {
        conversation_id: conversationId,
        message
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  /**
   * 结束视频对话
   * @param conversationId 对话ID
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE}/avatar/end/${conversationId}`);
    } catch (error) {
      console.error('Failed to end conversation:', error);
      // 不抛出错误，因为即使结束失败，用户也应该能离开
    }
  },

  /**
   * 获取对话历史
   * @param conversationId 对话ID
   */
  async getHistory(conversationId: string) {
    try {
      const response = await axios.get(`${API_BASE}/avatar/history/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  },

  /**
   * 保存对话ID到数据库（用于后续清理）
   * @param conversationId Tavus对话ID
   * @param conversationUrl Tavus对话URL
   */
  async saveConversationId(conversationId: string, conversationUrl: string) {
    try {
      await axios.post(`${API_BASE}/avatar/save-conversation-id`, {
        conversation_id: conversationId,
        conversation_url: conversationUrl,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save conversation ID:', error);
      // 不抛出错误，这只是辅助功能
    }
  },

  /**
   * 清理旧的对话（解决Tavus并发限制）
   */
  async cleanup() {
    try {
      const response = await axios.post(`${API_BASE}/avatar/cleanup`);
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup conversations:', error);
    }
  }
};
