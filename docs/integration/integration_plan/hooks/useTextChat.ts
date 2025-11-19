/**
 * 文本聊天Hook
 *
 * 管理GPT文本聊天的状态：
 * - 消息历史
 * - 发送消息
 * - 加载状态
 */

import { useState, useCallback, useEffect } from 'react';
import { textChatService } from '../services/textChatService';
import type { Message } from '../types/conversation';

export interface UseTextChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  endChat: () => Promise<void>;
}

/**
 * 文本聊天Hook
 * @param userId 用户ID
 * @param autoStart 是否自动开始对话（默认true）
 * @returns 聊天状态和控制方法
 */
export const useTextChat = (userId: string, autoStart: boolean = true): UseTextChatReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m Olivia, your personal health butler.\n\nI can help you with:\n• 📊 Checking your glucose levels\n• 🔍 Identifying patterns in your data\n• 💡 Providing personalized recommendations\n• 📈 Tracking your progress\n\nWhat would you like to know today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState(false);

  // 自动启动聊天
  useEffect(() => {
    if (autoStart && !chatStarted) {
      textChatService.startChat(userId)
        .then(() => {
          setChatStarted(true);
          console.log('[useTextChat] Chat started for user:', userId);
        })
        .catch(err => {
          console.error('[useTextChat] Error starting chat:', err);
        });
    }
  }, [userId, autoStart, chatStarted]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // 添加用户消息到UI
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 发送到后端
      const response = await textChatService.chat(userId, message.trim());

      if (response.success) {
        // 添加AI回复到UI
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          metadata: response.function_called ? {
            functionCall: response.function_called
          } : undefined
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.error('[useTextChat] Error sending message:', err);

      setError('Failed to send message. Please try again.');

      // 添加错误消息到UI
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading]);

  /**
   * 清空消息历史
   */
  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Chat history cleared. How can I help you?',
        timestamp: new Date().toISOString()
      }
    ]);
    setError(null);
  }, []);

  /**
   * 结束聊天并保存
   */
  const endChat = useCallback(async () => {
    try {
      await textChatService.endChat(userId);
      console.log('[useTextChat] Chat ended and saved');
    } catch (err) {
      console.error('[useTextChat] Error ending chat:', err);
    }
  }, [userId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    endChat
  };
};
