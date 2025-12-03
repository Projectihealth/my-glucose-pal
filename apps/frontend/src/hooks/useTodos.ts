import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import * as todosApi from '@/services/todosApi';
import { Todo } from '@/services/todosApi';

/**
 * Hook for fetching todos with caching
 */
export function useTodos(userId: string) {
  return useQuery({
    queryKey: ['todos', userId],
    queryFn: () => todosApi.getTodos(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh for 5 min
    gcTime: 1000 * 60 * 30, // 30 minutes - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

/**
 * Hook for creating a new todo with optimistic update
 */
export function useCreateTodo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTodo: Omit<Todo, 'id' | 'user_id'> & { user_id: string }) => 
      todosApi.createTodo(newTodo),
    
    // Optimistic update - immediately add to UI
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', userId] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', userId]);

      // Optimistically update to the new value
      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) => [
          ...old,
          { ...newTodo, id: Date.now(), user_id: userId } as Todo
        ]);
      }

      return { previousTodos };
    },

    // On success, replace optimistic todo with real one
    onSuccess: (createdTodo) => {
      queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) => {
        // Remove optimistic todo and add real one
        const withoutOptimistic = old.filter(t => t.id !== createdTodo.id);
        return [...withoutOptimistic, createdTodo];
      });
    },

    // On error, roll back to previous state
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userId], context.previousTodos);
      }
    },
  });
}

/**
 * Hook for updating a todo with optimistic update
 */
export function useUpdateTodo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) =>
      todosApi.updateTodo(id, updates),
    
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', userId] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', userId]);

      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) =>
          old.map(todo => todo.id === id ? { ...todo, ...updates } : todo)
        );
      }

      return { previousTodos };
    },

    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) =>
        old.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
      );
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userId], context.previousTodos);
      }
    },
  });
}

/**
 * Hook for deleting a todo with optimistic update
 */
export function useDeleteTodo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todosApi.deleteTodo(id),
    
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos', userId] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', userId]);

      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) =>
          old.filter(todo => todo.id !== id)
        );
      }

      return { previousTodos };
    },

    onError: (_err, _id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userId], context.previousTodos);
      }
    },
  });
}

/**
 * Hook for checking in a todo with optimistic update
 */
export function useCheckInTodo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      todosApi.checkInTodo(id, data),
    
    // Optimistic update - increment current_count immediately
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', userId] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', userId]);

      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) =>
          old.map(todo => {
            if (todo.id === id) {
              const newCount = Math.min(todo.current_count + 1, todo.target_count);
              const newStatus = newCount >= todo.target_count ? 'completed' :
                              newCount > 0 ? 'in_progress' : 'pending';
              return {
                ...todo,
                current_count: newCount,
                status: newStatus as Todo['status'],
                completed_today: true,
              };
            }
            return todo;
          })
        );
      }

      return { previousTodos };
    },

    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<Todo[]>(['todos', userId], (old = []) =>
        old.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
      );
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userId], context.previousTodos);
      }
    },
  });
}

/**
 * Prefetch todos for a user
 */
export function usePrefetchTodos() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['todos', userId],
      queryFn: () => todosApi.getTodos(userId),
      staleTime: 1000 * 60 * 5,
    });
  };
}


