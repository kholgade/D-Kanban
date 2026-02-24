import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskStatus } from '@d-kanban/shared';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (title: string, description: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export function useTasks(token: string | null): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/tasks');
      const data = (await response.json()) as { success: boolean; data: Task[] };
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (title: string, description: string, priority: string = 'low'): Promise<Task> => {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, priority }),
      });
      const data = (await response.json()) as { success: boolean; data: Task };
      if (data.success) {
        setTasks((prev) => [...prev, data.data]);
        return data.data;
      }
      throw new Error('Failed to create task');
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task> => {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = (await response.json()) as { success: boolean; data: Task };
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data.data : t)));
        return data.data;
      }
      throw new Error('Failed to update task');
    },
    []
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { success: boolean };
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error('Failed to delete task');
      }
    },
    []
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return tasks.filter((t) => t.status === status);
    },
    [tasks]
  );

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
    getTasksByStatus,
  };
}
