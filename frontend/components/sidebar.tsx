'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, type ElementType } from 'react';
import {
  BarChart3,
  Box,
  ChevronDown,
  Gauge,
  LogOut,
  Package,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import { AppLogo } from '@/components/app-logo';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';
import { getHomePathByRole } from '@/utils/get-home-path-by-role';
type MenuItem = {
  label: string;
  href: string;
  permissions?: Permission[];
};

type MenuModule = {
  label: string;
  href?: string;
  icon: ElementType;
  permissions?: Permission[];
  submenu?: MenuItem[];
};

const menuStructure: MenuModule[] = [
  {
    label: 'Dashboard',
href: '/',
    icon: Gauge,
  
  },
  {
    label: 'Utilisateurs',
    href: '/admin/utilisateurs',
    icon: Users,
    permissions: [Permission.USERS_VIEW],
  },
  {
    label: 'Équipements',
    href: '/dashboards/equipements',
    icon: Wrench,
    permissions: [Permission.EQUIPEMENTS_VIEW],
    submenu: [
      {
        label: 'Parc d’équipements',
        href: '/arborescences',
        permissions: [Permission.ARBORESCENCE_VIEW],
      },
      {
        label: 'Modèles',
        href: '/modeles',
        permissions: [Permission.MODELE_VIEW],
      },
      {
        label: 'Matériels',
        href: '/materiels',
        permissions: [Permission.MATERIEL_VIEW],
      },
      {
        label: 'Points de structure',
        href: '/points-structure',
        permissions: [Permission.POINT_STRUCTURE_VIEW],
      },
      {
        label: 'Points de mesure',
        href: '/points-mesure',
        permissions: [Permission.POINT_MESURE_VIEW],
      },
    ],
  },
  {
    label: 'Maintenance',
    href: '/dashboards/maintenance',
    icon: BarChart3,
    permissions: [Permission.MAINTENANCE_VIEW],
    submenu: [
      {
        label: 'Demandes d’intervention',
        href: '/maintenance/demandes',
        permissions: [
          Permission.DI_VIEW_ALL,
          Permission.DI_VIEW_OWN,
          Permission.DI_CREATE,
        ],
      },
      {
        label: 'Interventions',
        href: '/maintenance/interventions',
        permissions: [
          Permission.INTERVENTION_VIEW_ALL,
          Permission.INTERVENTION_VIEW_ASSIGNED,
        ],
      },
      {
        label: 'Plan préventif',
        href: '/plans-preventifs',
        permissions: [Permission.PLAN_PREVENTIF_VIEW],
      },
      {
        label: 'Plans préventifs prédéfinis',
        href: '/plans-preventifs-predefinis',
        permissions: [Permission.PLAN_PREVENTIF_PREDEFINI_VIEW],
      },
      {
        label: 'Gammes',
        href: '/gammes',
        permissions: [Permission.GAMME_VIEW],
      },
    ],
  },
  {
    label: 'Stock',
    href: '/dashboards/stock',
    icon: Package,
    permissions: [Permission.STOCK_VIEW],
    submenu: [
      {
        label: 'Articles',
        href: '/articles',
        permissions: [Permission.ARTICLE_VIEW],
      },
      {
        label: 'Entrées',
        href: '/stock/entrees',
        permissions: [Permission.ENTREE_STOCK_VIEW],
      },
      {
        label: 'Historique des mouvements',
        href: '/stock/mouvements',
        permissions: [Permission.MOUVEMENT_STOCK_VIEW],
      },
      {
        label: 'Magasins',
        href: '/magasins',
        permissions: [Permission.MAGASIN_VIEW],
      },
      {
        label: 'Inventaires préparés',
        href: '/stock/inventaires-prepares',
        permissions: [Permission.INVENTAIRE_PREPARE_VIEW],
      },
      {
        label: 'Inventaire',
        href: '/stock/inventaire',
        permissions: [Permission.INVENTAIRE_VIEW],
      },
      {
        label: 'Sortie',
        href: '/stock/sorties',
        permissions: [Permission.SORTIE_STOCK_VIEW],
      },
      {
        label: 'Réservations',
        href: '/stock/reservations',
        permissions: [Permission.RESERVATION_VIEW],
      },
      {
        label: 'Demandes de transfert',
        href: '/stock/demandes-transfert',
        permissions: [Permission.DEMANDE_TRANSFERT_VIEW],
      },
      {
        label: 'Réapprovisionnement',
        href: '/stock/reapprovisionnement',
        permissions: [Permission.REAPPROVISIONNEMENT_VIEW],
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, hasPermission } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
const resolveHref = (label: string, href: string) => {
  if (label === 'Dashboard') {
    return getHomePathByRole(user?.role);
  }

  return href;
};
  const canAccess = (permissions?: Permission[]) => {
    if (!permissions || permissions.length === 0) return true;

    return permissions.some((permission) => hasPermission(permission));
  };

  const visibleMenuStructure = useMemo(() => {
    return menuStructure
      .map((module) => {
        const visibleSubmenu = module.submenu?.filter((item) =>
          canAccess(item.permissions),
        );

        const moduleAllowed = canAccess(module.permissions);
        const hasVisibleSubmenu = !!visibleSubmenu?.length;

        if (!moduleAllowed && !hasVisibleSubmenu) {
          return null;
        }

        return {
          ...module,
          submenu: visibleSubmenu,
        };
      })
      .filter(Boolean) as MenuModule[];
  }, [user]);

  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({
    '/dashboards/stock':
      pathname.startsWith('/stock') ||
      pathname.startsWith('/articles') ||
      pathname.startsWith('/magasins'),
    '/dashboards/equipements':
      pathname.startsWith('/materiels') ||
      pathname.startsWith('/familles') ||
      pathname.startsWith('/modeles') ||
      pathname.startsWith('/arborescences') ||
      pathname.startsWith('/points-structure') ||
      pathname.startsWith('/points-mesure'),
    '/dashboards/maintenance':
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/plans-preventifs') ||
      pathname.startsWith('/plans-preventifs-predefinis') ||
      pathname.startsWith('/gammes'),
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      setIsLoggingOut(false);
    }
  };

  const toggleModule = (key: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isModuleActive = (module: MenuModule) => {
    if (module.href && pathname === module.href) return true;

    return module.submenu?.some((item) => pathname === item.href) ?? false;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[292px] shrink-0 overflow-hidden bg-[#0f3d56] text-white shadow-2xl lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,195,215,0.28),transparent_35%),linear-gradient(180deg,#0f3d56_0%,#0b2f43_55%,#081f2d_100%)]" />

      <div className="relative flex h-full flex-col">
       <div className="shrink-0 border-b border-white/10 px-4 py-3">
  <div className="flex h-[74px] items-center justify-between gap-2">
    <Link
      href="/"
      className="-ml-10 flex h-[74px] w-[255px] items-center overflow-hidden"
    >
      <AppLogo
        theme="dark"
        className="h-[74px] w-[255px]"
        imageClassName="scale-[2.35]"
      />
    </Link>

    <button
      type="button"
      aria-label="Fermer le menu"
      className="shrink-0 rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white"
    >
      <X size={21} />
    </button>
  </div>
</div>

        <nav className="relative flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-2.5">
            {visibleMenuStructure.map((module) => {
              const Icon = module.icon;
              const active = isModuleActive(module);
              const hasSubmenu = !!module.submenu?.length;
              const key = module.href || module.label;
              const expanded = expandedModules[key];

              return (
                <div key={module.label}>
                  <div className="flex items-center gap-2">
                    {module.href ? (
                      <Link
                        
  href={resolveHref(module.label, module.href)}
                        className={`group flex h-[52px] flex-1 items-center gap-3.5 rounded-[18px] px-4 text-[14px] font-bold transition ${
                          active
                            ? 'bg-white/95 text-[#0f3d56] shadow-[0_10px_30px_rgba(129,195,215,0.25)]'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon
                          size={22}
                          strokeWidth={2.2}
                          className={
                            active ? 'text-[#0f3d56]' : 'text-white/70'
                          }
                        />
                        <span>{module.label}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleModule(key)}
                        className={`group flex h-[52px] flex-1 items-center gap-3.5 rounded-[18px] px-4 text-left text-[14px] font-bold transition ${
                          active
                            ? 'bg-white/95 text-[#0f3d56] shadow-[0_10px_30px_rgba(129,195,215,0.25)]'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon
                          size={22}
                          strokeWidth={2.2}
                          className={
                            active ? 'text-[#0f3d56]' : 'text-white/70'
                          }
                        />
                        <span>{module.label}</span>
                      </button>
                    )}

                    {hasSubmenu && (
                      <button
                        type="button"
                        onClick={() => toggleModule(key)}
                        className={`flex h-[44px] w-[44px] items-center justify-center rounded-2xl transition ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-white/55 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ChevronDown
                          size={19}
                          className={`transition ${
                            expanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubmenu && expanded && (
                    <div className="ml-7 mt-2.5 border-l-2 border-white/20 pb-1 pl-5">
                      <div className="space-y-1">
                        {module.submenu?.map((item) => {
                          const subActive = pathname === item.href;

                          return (
                            <Link
                              key={item.href}
href={item.href}                              className={`block rounded-xl px-3 py-2 text-[13px] font-medium transition ${
                                subActive
                                  ? 'bg-white/15 text-white'
                                  : 'text-white/50 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="relative shrink-0 space-y-3 border-t border-white/10 bg-[#081f2d]/80 px-6 py-4 backdrop-blur">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut || isLoading}
            className="flex w-full items-center gap-2.5 rounded-xl bg-red-500/20 px-3 py-2.5 text-[13px] font-bold text-red-100 transition hover:bg-red-500/30 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
          </button>

          <div className="flex items-center gap-3 border-t border-white/10 pt-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
              <Box size={18} className="text-[#81C3D7]" />
            </div>

            <div>
              <p className="text-[13px] font-bold text-white">GMAO v1.0.0</p>
              <p className="mt-0.5 text-[11px] font-medium text-white/40">
                © 2025 Maintenance
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}