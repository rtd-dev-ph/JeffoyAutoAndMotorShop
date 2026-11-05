import { createContext, useCallback, useEffect, useRef, useState } from 'react';
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

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const payload = parseJwt(token);
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        return { token: null, user: null };
      }
      return { token, user: null };
    }
    return { token: null, user: null };
  });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleLogoutEvent() {
      setState({ token: null, user: null });
    }
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
      const payload = parseJwt(state.token);
      if (payload?.exp) {
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn > 0) {
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
            setState({ token: null, user: null });
          }, expiresIn);
        } else {
          setState({ token: null, user: null });
        }
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
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
