import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader label="Carregando sua sessão..." />;
  }

  if (!user) {
    // Unauthenticated users are redirected before they can reach private screens.
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return children;
}
