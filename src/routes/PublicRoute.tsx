import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';

type PublicRouteProps = {
  children: ReactNode;
  allowAuthenticated?: boolean;
};

export function PublicRoute({ children, allowAuthenticated = false }: PublicRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader label="Preparando acesso..." />;
  }

  if (user && !allowAuthenticated) {
    // Authenticated users should not stay on public auth screens.
    const state = location.state as { from?: { pathname?: string } } | null;
    const target = state?.from?.pathname ?? '/dashboard';
    return <Navigate to={target} replace />;
  }

  return children;
}
