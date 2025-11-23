/**
 * useProjects Hook
 * 
 * Custom hook for managing projects from Appwrite
 */

import { useCallback, useEffect, useState } from 'react';
import {
    createProject,
    deleteProject,
    getProjects,
    updateProject
} from '../services/appwriteService';
import { Project } from '../types';

interface UseProjectsState {
  projects: Project[];
  loading: boolean;
  error: Error | null;
}

export function useProjects(ownerId?: string) {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    loading: false,
    error: null,
  });

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getProjects(ownerId);
      const projects = result.documents || [];
      setState({ projects, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [ownerId]);

  // Fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Create project
  const create = useCallback(
    async (projectData: Omit<Project, 'id'>, ownerId: string) => {
      try {
        const newProject = await createProject(projectData, ownerId);
        setState(prev => ({
          ...prev,
          projects: [...prev.projects, newProject as any],
        }));
        return newProject;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, error: err }));
        throw err;
      }
    },
    []
  );

  // Update project
  const update = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      const updated = await updateProject(projectId, updates);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => (p.id === projectId ? (updated as any) : p)),
      }));
      return updated;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  // Delete project
  const remove = useCallback(async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId),
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchProjects,
    create,
    update,
    remove,
  };
}
