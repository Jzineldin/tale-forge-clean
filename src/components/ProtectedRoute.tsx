
import React from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { OneRingLoader } from '@/components/ui/OneRingLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    console.log('[GS:LOG] LoadingState:render=OneRing');
    return fallback || (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <OneRingLoader />
      </div>
    );
  }

  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
