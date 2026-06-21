'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';

type PermissionMode = 'all' | 'any';

type PermissionRouteProps = {
  permission: Permission | Permission[];
  mode?: PermissionMode;
  children: React.ReactNode;
};

export default function PermissionRoute({
  permission,
  mode = 'all',
  children,
}: PermissionRouteProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasPermission } = useAuth();

  const permissions = useMemo(() => {
    return Array.isArray(permission) ? permission : [permission];
  }, [permission]);

  const isAllowed = useMemo(() => {
    if (isLoading || !isAuthenticated) return false;

    if (mode === 'any') {
      return permissions.some((item) => hasPermission(item));
    }

    return permissions.every((item) => hasPermission(item));
  }, [isLoading, isAuthenticated, mode, permissions, hasPermission]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (!isAllowed) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, isAllowed, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Vérification des permissions...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}