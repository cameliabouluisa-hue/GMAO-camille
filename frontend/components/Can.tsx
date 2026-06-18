'use client';

import { useAuth } from '@/context/AuthContext';
import { Permission, UserRole } from '@/types/auth';

interface CanProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Can Component
 * 
 * Conditionally renders children based on user permissions or roles
 * Usage:
 *   <Can permission={Permission.DELETE_MATERIAL}>
 *     <DeleteButton />
 *   </Can>
 *   
 *   <Can role={[UserRole.ADMIN, UserRole.RESPONSABLE_MAINTENANCE]}>
 *     <AdminSection />
 *   </Can>
 */
export function Can({
  children,
  permission,
  role,
  fallback,
}: CanProps) {
  const { user, hasPermission, hasAnyRole } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  let allowed = true;

  // Check permission
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    allowed = permissions.some(p => hasPermission(p));
  }

  // Check role
  if (allowed && role) {
    const roles = Array.isArray(role) ? role : [role];
    allowed = hasAnyRole(roles);
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
