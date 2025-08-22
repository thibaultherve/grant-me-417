import { useAuth } from "@/features/auth/hooks/use-auth";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthRouterProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthRouter({
  children,
  requireAuth = false,
  redirectTo,
}: AuthRouterProps) {
  const { user, loading } = useAuth();
  const location = useLocation();


  // Show loading while determining auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle protected routes
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle auth-only routes (login/register when already logged in)
  if (!requireAuth && user && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
