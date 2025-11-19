/**
 * React Query hooks for conversation data
 * Provides caching and optimized data fetching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getConversationHistory, 
  getConversationDetail,
  type ConversationHistory,
  type ConversationDetail 
} from '../services/conversationsApi';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (userId: string, limit: number) => [...conversationKeys.lists(), userId, limit] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (conversationId: string) => [...conversationKeys.details(), conversationId] as const,
};

/**
 * Hook to fetch conversation history with caching
 */
export function useConversationHistory(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: conversationKeys.list(userId, limit),
    queryFn: () => getConversationHistory(userId, limit),
    staleTime: 2 * 60 * 1000, // 2分钟内不重新请求
    gcTime: 10 * 60 * 1000, // 10分钟后清除缓存
    enabled: !!userId,
  });
}

/**
 * Hook to fetch conversation detail with caching
 */
export function useConversationDetail(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId!),
    queryFn: () => getConversationDetail(conversationId!),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求（详情页变化少）
    gcTime: 15 * 60 * 1000, // 15分钟后清除缓存
    enabled: !!conversationId,
  });
}

/**
 * Hook to prefetch conversation detail
 * 在列表页鼠标悬停或即将导航时预加载
 */
export function usePrefetchConversationDetail() {
  const queryClient = useQueryClient();

  return (conversationId: string) => {
    queryClient.prefetchQuery({
      queryKey: conversationKeys.detail(conversationId),
      queryFn: () => getConversationDetail(conversationId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook to invalidate conversation queries
 * 用于数据更新后刷新缓存
 */
export function useInvalidateConversations() {
  const queryClient = useQueryClient();

  return {
    invalidateHistory: (userId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.list(userId, 10) 
      });
    },
    invalidateDetail: (conversationId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.detail(conversationId) 
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.all 
      });
    },
  };
}

