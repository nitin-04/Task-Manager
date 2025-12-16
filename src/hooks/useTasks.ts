import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import api from '../lib/api';

const socket = io('http://localhost:3000');

export interface TaskFilters {
  status?: string;
  priority?: string;
}

export const useTasks = (filters: TaskFilters) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await api.get('/tasks', {
        params: {
          status: filters.status || undefined,
          priority: filters.priority || undefined,
        },
      });
      return data;
    },
  });

  useEffect(() => {
    socket.on('taskCreated', (newTask) => {
      toast.info(`New Task created: "${newTask.title}"`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    socket.on('taskUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    socket.on('taskDeleted', () => {
      // toast.error(`Task deleted`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, [queryClient]);

  return { tasks, isLoading };
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data } = await api.patch(`/tasks/${id}`, updates);
      return data;
    },

    onSuccess: (data, variables) => {
      const changes = Object.values(variables.updates).join(', ');

      toast.success(`"${data.title}" updated to ${changes}`);

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
