/**
 * useTools Hook
 * 
 * Custom hook for managing tools from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createTool,
    deleteTool,
    getTools,
    updateTool
} from '../services/appwriteService';
import { Tool } from '../types';

interface UseToolsState {
  tools: any[];
  loading: boolean;
  error: Error | null;
}

export function useTools(agentId?: string) {
  const [state, setState] = useState<UseToolsState>({
    tools: [],
    loading: false,
    error: null,
  });

  // Fetch tools
  const fetchTools = useCallback(async () => {
    if (!agentId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getTools(agentId);
      const tools = result.documents || [];
      setState({ tools, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [agentId]);

  // Fetch on mount
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Create tool
  const create = useCallback(
    async (toolData: Omit<Tool, 'id'>) => {
      if (!agentId) throw new Error('Agent ID is required');
      try {
        const newTool = await createTool(toolData, agentId);
        setState(prev => ({
          ...prev,
          tools: [...prev.tools, newTool],
        }));
        return newTool;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    [agentId]
  );

  // Update tool
  const update = useCallback(async (toolId: string, updates: Partial<Tool>) => {
    try {
      const updated = await updateTool(toolId, updates);
      setState(prev => ({
        ...prev,
        tools: prev.tools.map(t => (t.$id === toolId ? updated : t)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete tool
  const remove = useCallback(async (toolId: string) => {
    try {
      await deleteTool(toolId);
      setState(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t.$id !== toolId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchTools,
    create,
    update,
    remove,
  };
}
