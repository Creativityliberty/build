/**
 * useTeams Hook
 * 
 * Custom hook for managing teams from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createTeam,
    deleteTeam,
    getTeams,
    updateTeam
} from '../services/appwriteService';
import { TeamConfig } from '../types';

interface UseTeamsState {
  teams: any[];
  loading: boolean;
  error: Error | null;
}

export function useTeams(projectId?: string) {
  const [state, setState] = useState<UseTeamsState>({
    teams: [],
    loading: false,
    error: null,
  });

  // Fetch teams
  const fetchTeams = useCallback(async () => {
    if (!projectId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getTeams(projectId);
      const teams = result.documents || [];
      setState({ teams, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [projectId]);

  // Fetch on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Create team
  const create = useCallback(
    async (teamData: Omit<TeamConfig, 'id' | 'agents' | 'tasks'>) => {
      if (!projectId) throw new Error('Project ID is required');
      try {
        const newTeam = await createTeam(teamData, projectId);
        setState(prev => ({
          ...prev,
          teams: [...prev.teams, newTeam],
        }));
        return newTeam;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    [projectId]
  );

  // Update team
  const update = useCallback(async (teamId: string, updates: Partial<TeamConfig>) => {
    try {
      const updated = await updateTeam(teamId, updates);
      setState(prev => ({
        ...prev,
        teams: prev.teams.map(t => (t.$id === teamId ? updated : t)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete team
  const remove = useCallback(async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      setState(prev => ({
        ...prev,
        teams: prev.teams.filter(t => t.$id !== teamId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchTeams,
    create,
    update,
    remove,
  };
}
