import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@shared/schema';

export function useAuth() {
  const context = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.authenticated) {
            context.setUser(userData.user);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const signInWithGoogle = async (): Promise<User> => {
    try {
      context.setAuthLoading(true);
      const response = await apiRequest('POST', '/api/auth/google');
      const data = await response.json();
      
      if (data && data.user) {
        context.setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
        return data.user;
      } else {
        throw new Error('Authentication failed');
      }
    } finally {
      context.setAuthLoading(false);
    }
  };
  
  const signOut = async (): Promise<void> => {
    try {
      context.setAuthLoading(true);
      await apiRequest('POST', '/api/auth/logout');
      context.setUser(null);
      // Clear all queries from the cache
      queryClient.clear();
    } finally {
      context.setAuthLoading(false);
    }
  };
  
  return {
    user: context.user,
    signInWithGoogle,
    signOut,
    authLoading: context.authLoading,
    isInitializing,
  };
}
