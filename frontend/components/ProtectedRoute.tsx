'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

type Props = {
  children: ReactNode;
};

const PUBLIC_ROUTES = ['/auth/login'];

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      window.location.replace('/auth/login');
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-[#163E56]" size={28} />
          <p className="text-sm font-bold">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-[#163E56]" size={28} />
          <p className="text-sm font-bold">Redirection vers la connexion...</p>
        </div>
      </main>
    );
  }

  if (isAuthenticated && isPublicRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-[#163E56]" size={28} />
          <p className="text-sm font-bold">Redirection vers le dashboard...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}