/**
 * useAgents Hook
 * 
 * Custom hook for managing agents from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createAgent,
    deleteAgent,
    getAgents,
    updateAgent
} from '../services/appwriteService';
import { AgentConfig } from '../types';

interface UseAgentsState {
  agents: any[];
  loading: boolean;
  error: Error | null;
}

export function useAgents(teamId?: string) {
  const [state, setState] = useState<UseAgentsState>({
    agents: [],
    loading: false,
    error: null,
  });

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    if (!teamId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getAgents(teamId);
      const agents = result.documents || [];
      setState({ agents, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [teamId]);

  // Fetch on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Create agent
  const create = useCallback(
    async (agentData: Omit<AgentConfig, 'id'>) => {
      if (!teamId) throw new Error('Team ID is required');
      try {
        const newAgent = await createAgent(agentData, teamId);
        setState(prev => ({
          ...prev,
          agents: [...prev.agents, newAgent],
        }));
        return newAgent;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    [teamId]
  );

  // Update agent
  const update = useCallback(async (agentId: string, updates: Partial<AgentConfig>) => {
    try {
      const updated = await updateAgent(agentId, updates);
      setState(prev => ({
        ...prev,
        agents: prev.agents.map(a => (a.$id === agentId ? updated : a)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete agent
  const remove = useCallback(async (agentId: string) => {
    try {
      await deleteAgent(agentId);
      setState(prev => ({
        ...prev,
        agents: prev.agents.filter(a => a.$id !== agentId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchAgents,
    create,
    update,
    remove,
  };
}
