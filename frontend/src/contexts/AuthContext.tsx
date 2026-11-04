import { createContext, useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { LoginResponseDto } from '@/types/auth';

const TOKEN_KEY = 'jaams_token';

interface AuthState {
  token: string | null;
  user: LoginResponseDto | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return { token, user: null };
  });

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [state.token]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiClient.post<LoginResponseDto>('/api/auth/login', { username, password });
    setState({ token: res.token, user: res });
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
}
