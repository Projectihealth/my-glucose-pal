import { useQuery } from '@tanstack/react-query';
import * as habitsApi from '@/services/habitsApi';
import type { Habit } from '@/services/habitsApi';

/**
 * Shared React Query hook for fetching habits with caching.
 * Keeps habits “warm” so navigating away and back reuses cached data instantly.
 */
export function useHabits(userId: string) {
  return useQuery<Habit[]>({
    queryKey: ['habits', userId],
    queryFn: () => habitsApi.getHabits(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes: treat cached data as fresh
    gcTime: 1000 * 60 * 30,   // 30 minutes: keep cache in memory
    refetchOnWindowFocus: false,
  });
}


