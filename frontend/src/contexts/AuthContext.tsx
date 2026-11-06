import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { LoginResponseDto } from '@/types/auth';

const TOKEN_KEY = 'jaams_token';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

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

type JwtPayload = Record<string, unknown>;

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload | null): boolean {
  const exp = typeof payload?.exp === 'number' ? payload.exp : null;
  return exp !== null && exp * 1000 < Date.now();
}

function readPayloadString(payload: JwtPayload | null, keys: string[]): string | null {
  if (!payload) return null;
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function restoreSession(token: string | null): AuthState {
  if (!token) return { token: null, user: null };
  const payload = parseJwt(token);
  if (!payload || isTokenExpired(payload)) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }

  const username = readPayloadString(payload, ['unique_name', 'name', 'preferred_username', 'sub']);
  const role = readPayloadString(payload, ['role', ROLE_CLAIM]);
  const userIdRaw = payload.sub ?? payload.nameid;
  const userId = typeof userIdRaw === 'number' ? userIdRaw : Number.parseInt(String(userIdRaw ?? ''), 10);
  const exp = typeof payload.exp === 'number' ? payload.exp : null;

  return {
    token,
    user: username && role
      ? {
          token,
          expiresAtUtc: exp ? new Date(exp * 1000).toISOString() : '',
          userId: Number.isFinite(userId) ? userId : 0,
          username,
          role,
        }
      : null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => restoreSession(localStorage.getItem(TOKEN_KEY)));
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
      if (!state.user) {
        const restored = restoreSession(state.token);
        if (restored.user) {
          setState(restored);
          return;
        }
      }
      if (payload?.exp && typeof payload.exp === 'number') {
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
  }, [state.token, state.user]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiClient.post<LoginResponseDto>('/api/auth/login', { username, password });
    setState({ token: res.token, user: res });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore
    }
    setState({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
}
