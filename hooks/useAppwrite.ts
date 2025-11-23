/**
 * useAppwrite Hook
 * 
 * Custom React hook for managing Appwrite operations
 * Provides loading, error, and data states for async operations
 */

import { useCallback, useState } from 'react';

interface UseAppwriteState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAppwrite<T>() {
  const [state, setState] = useState<UseAppwriteState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await asyncFunction();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    execute,
  };
}

/**
 * useAppwriteList Hook
 * 
 * For fetching lists of documents from Appwrite
 */
export function useAppwriteList<T>() {
  const [state, setState] = useState<UseAppwriteState<T[]>>({
    data: [],
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<any>) => {
      setState({ data: [], loading: true, error: null });
      try {
        const result = await asyncFunction();
        const documents = result.documents || [];
        setState({ data: documents, loading: false, error: null });
        return documents;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: [], loading: false, error: err });
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    execute,
  };
}
