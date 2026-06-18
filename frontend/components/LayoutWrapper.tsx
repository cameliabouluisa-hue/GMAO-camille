'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './sidebar';
import { useEffect, useState } from 'react';

/**
 * LayoutWrapper Component
 * 
 * Wraps all pages and manages layout visibility based on auth state
 * Shows sidebar and header only for authenticated users
 * Shows full-screen auth pages for unauthenticated users
 */
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Check if current path is an auth page (doesn't need sidebar)
  const isAuthPage =
    pathname.startsWith('/auth/') || pathname.startsWith('/unauthorized');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading screen while initializing auth
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#163E56]"></div>
          <p className="text-sm text-slate-600">Initialisation de l&apos;application...</p>
        </div>
      </div>
    );
  }

  // Auth pages don't need sidebar/header
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Unauthenticated users on non-auth pages will be redirected by ProtectedRoute
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#163E56]"></div>
          <p className="text-sm text-slate-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Authenticated users get full layout with sidebar
  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="min-h-screen lg:pl-[292px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-8 py-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                GMAO BMT
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                Port · Maintenance · Équipements · Stock
              </p>
            </div>

            <div className="flex items-center gap-4">
              

              <div className="rounded-full bg-cyan-50 px-6 py-3 text-sm font-black text-slate-900">
                
                   Magasinier            </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-89px)] bg-[#f4f7fb]">
          {children}
        </main>
      </div>
    </div>
  );
}
