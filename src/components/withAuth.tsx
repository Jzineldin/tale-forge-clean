
import React from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Navigate } from 'react-router-dom';

interface WithAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & WithAuthProps) => {
    const { isAuthenticated, loading } = useAuth();
    const { children, fallback, redirectTo = '/auth', ...componentProps } = props;

    if (loading) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <Navigate to={redirectTo} replace />;
    }

    return <Component {...(componentProps as P)} />;
  };
};

export const RequireAuth: React.FC<WithAuthProps> = ({ 
  children, 
  fallback, 
  redirectTo = '/auth' 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
