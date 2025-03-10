import React, { createContext, useState, ReactNode } from 'react';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  authLoading: boolean;
  setAuthLoading: (loading: boolean) => void;
}

const defaultContext: AuthContextType = {
  user: null,
  setUser: () => {},
  authLoading: false,
  setAuthLoading: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, setAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
