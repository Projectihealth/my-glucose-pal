/**
 * Tavus视频对话Hook
 *
 * 管理Tavus对话的生命周期：
 * - 自动启动对话
 * - 获取conversation_url
 * - 结束对话
 */

import { useState, useEffect } from 'react';
import { avatarService } from '../services/avatarService';
import type { TavusConversation } from '../types/avatar';

export interface UseTavusConversationReturn {
  conversation: TavusConversation | null;
  isLoading: boolean;
  error: string | null;
  endConversation: () => Promise<void>;
  retry: () => void;
}

/**
 * Tavus视频对话Hook
 * @param userId 用户ID
 * @returns 对话状态和控制方法
 */
export const useTavusConversation = (userId: string): UseTavusConversationReturn => {
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let conversationId: string | null = null;

    const startConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useTavusConversation] Starting conversation for user:', userId);

        // 先清理可能存在的旧对话（解决Tavus并发限制）
        await avatarService.cleanup();

        // 创建新对话
        const result = await avatarService.startConversation(userId);

        if (!isMounted) return;

        if (result.success && result.conversation_details) {
          conversationId = result.conversation_id;
          setConversation(result.conversation_details);

          // 保存对话ID到数据库
          await avatarService.saveConversationId(
            result.conversation_id,
            result.conversation_details.conversation_url
          );

          console.log('[useTavusConversation] Conversation started:', {
            id: result.conversation_id,
            url: result.conversation_details.conversation_url
          });
        } else {
          throw new Error(result.message || 'Failed to start conversation');
        }
      } catch (err: any) {
        if (!isMounted) return;

        console.error('[useTavusConversation] Error starting conversation:', err);

        // 提供友好的错误消息
        let errorMessage = 'Failed to connect to Olivia. ';

        if (err.response?.status === 503) {
          errorMessage += 'Video chat service is unavailable. Please try voice or text chat instead.';
        } else if (err.response?.status === 429) {
          errorMessage += 'Too many active conversations. Please try again in a moment.';
        } else if (err.message) {
          errorMessage += err.message;
        } else {
          errorMessage += 'Please check your connection and try again.';
        }

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    startConversation();

    // Cleanup function
    return () => {
      isMounted = false;

      // 组件卸载时结束对话
      if (conversationId) {
        avatarService.endConversation(conversationId).catch(err => {
          console.error('[useTavusConversation] Error ending conversation on unmount:', err);
        });
      }
    };
  }, [userId, retryCount]);

  /**
   * 手动结束对话
   */
  const endConversation = async () => {
    if (conversation) {
      try {
        await avatarService.endConversation(conversation.conversation_id);
        console.log('[useTavusConversation] Conversation ended successfully');
      } catch (err) {
        console.error('[useTavusConversation] Error ending conversation:', err);
      }
    }
  };

  /**
   * 重试连接
   */
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    conversation,
    isLoading,
    error,
    endConversation,
    retry
  };
};
