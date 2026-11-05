import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
