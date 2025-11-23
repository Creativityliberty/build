/**
 * useKnowledgeSources Hook
 * 
 * Custom hook for managing knowledge sources from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createKnowledgeSource,
    deleteKnowledgeSource,
    getKnowledgeSources,
    updateKnowledgeSource
} from '../services/appwriteService';
import { KnowledgeSource } from '../types';

interface UseKnowledgeSourcesState {
  sources: any[];
  loading: boolean;
  error: Error | null;
}

export function useKnowledgeSources(agentId?: string) {
  const [state, setState] = useState<UseKnowledgeSourcesState>({
    sources: [],
    loading: false,
    error: null,
  });

  // Fetch knowledge sources
  const fetchSources = useCallback(async () => {
    if (!agentId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getKnowledgeSources(agentId);
      const sources = result.documents || [];
      setState({ sources, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [agentId]);

  // Fetch on mount
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Create knowledge source
  const create = useCallback(
    async (sourceData: Omit<KnowledgeSource, 'id'>) => {
      if (!agentId) throw new Error('Agent ID is required');
      try {
        const newSource = await createKnowledgeSource(sourceData, agentId);
        setState(prev => ({
          ...prev,
          sources: [...prev.sources, newSource],
        }));
        return newSource;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    [agentId]
  );

  // Update knowledge source
  const update = useCallback(async (sourceId: string, updates: Partial<KnowledgeSource>) => {
    try {
      const updated = await updateKnowledgeSource(sourceId, updates);
      setState(prev => ({
        ...prev,
        sources: prev.sources.map(s => (s.$id === sourceId ? updated : s)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete knowledge source
  const remove = useCallback(async (sourceId: string) => {
    try {
      await deleteKnowledgeSource(sourceId);
      setState(prev => ({
        ...prev,
        sources: prev.sources.filter(s => s.$id !== sourceId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchSources,
    create,
    update,
    remove,
  };
}
