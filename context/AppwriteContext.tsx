/**
 * AppwriteContext
 * 
 * Global context for managing Appwrite operations and authentication
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginWithEmail, logout, registerUser } from '../services/appwriteService';

interface AppwriteContextType {
  user: any | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setUser(null);
        // Not logged in is not an error
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(email, password, name);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppwriteContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwriteAuth() {
  const context = useContext(AppwriteContext);
  if (!context) {
    throw new Error('useAppwriteAuth must be used within AppwriteProvider');
  }
  return context;
}
