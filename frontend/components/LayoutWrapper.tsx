'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

function getRoleLabel(role?: UserRole | string | null) {
  switch (role) {
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.RESPONSABLE_MAINTENANCE:
      return 'Responsable maintenance';
    case UserRole.TECHNICIEN:
      return 'Technicien';
    case UserRole.DEMANDEUR:
      return 'Demandeur';
    case UserRole.MAGASINIER:
      return 'Magasinier';
    default:
      return 'Utilisateur';
  }
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const displayedRole =
  user?.role === UserRole.TECHNICIEN && user?.equipe?.libelle
    ? `${user.roleLabel || 'Technicien'} · ${user.equipe.libelle}`
    : user?.roleLabel || getRoleLabel(user?.role);
  const isAuthPage =
    pathname.startsWith('/auth/') || pathname.startsWith('/unauthorized');

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#163E56]" />
          <p className="text-sm font-bold text-slate-600">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="min-h-screen lg:pl-[292px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-8 py-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                GMAO BMT
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Port · Maintenance · Équipements · Stock
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm md:block">
                Interface utilisateur
              </div>

             <div className="rounded-full bg-cyan-50 px-6 py-3 text-sm font-black text-slate-900">
  {displayedRole}
</div>
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