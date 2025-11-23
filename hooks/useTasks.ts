/**
 * useTasks Hook
 * 
 * Custom hook for managing tasks from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createTask,
    deleteTask,
    getTasks,
    updateTask
} from '../services/appwriteService';
import { TaskConfig } from '../types';

interface UseTasksState {
  tasks: any[];
  loading: boolean;
  error: Error | null;
}

export function useTasks(teamId?: string) {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: false,
    error: null,
  });

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!teamId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getTasks(teamId);
      const tasks = result.documents || [];
      setState({ tasks, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [teamId]);

  // Fetch on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const create = useCallback(
    async (taskData: Omit<TaskConfig, 'id'>) => {
      if (!teamId) throw new Error('Team ID is required');
      try {
        const newTask = await createTask(taskData, teamId);
        setState(prev => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
        }));
        return newTask;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    [teamId]
  );

  // Update task
  const update = useCallback(async (taskId: string, updates: Partial<TaskConfig>) => {
    try {
      const updated = await updateTask(taskId, updates);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t.$id === taskId ? updated : t)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete task
  const remove = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.$id !== taskId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchTasks,
    create,
    update,
    remove,
  };
}
