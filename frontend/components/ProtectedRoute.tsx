'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps pages/sections that require authentication
 * Optionally restricts access to specific roles
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role restriction if specified
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLoading, requiredRoles, hasAnyRole, router, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#163E56]"></div>
          <p className="text-sm text-slate-600">Vérification de l&apos;accès...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not authorized, don't render
  if (!isAuthenticated || (requiredRoles && !hasAnyRole(requiredRoles))) {
    return null;
  }

  return <>{children}</>;
}
