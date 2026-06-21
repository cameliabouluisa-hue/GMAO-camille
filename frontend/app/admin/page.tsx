'use client';

import Link from 'next/link';
import type { ElementType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Boxes,
  ClipboardList,
  Clock3,
  FileText,
  GitBranch,
  Loader2,
  Package,
  PackagePlus,
  ShieldAlert,
  TrendingUp,
  Warehouse,
  Wrench,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
type GeneralDashboardResponse = {
  materielsActifs?: number;
  interventionsEnCours?: number;
  totalArticles?: number;
  plansALancer?: number;
  demandesEnAttente?: number;
  interventionsEnRetard?: number;
  totalEquipements?: number;
  totalMagasins?: number;

  equipements?: {
    total?: number;
    actifs?: number;
    critiques?: number;
  };
  maintenance?: {
    demandesTotales?: number;
    interventionsEnCours?: number;
    plansALancer?: number;
  };
  stock?: {
    articles?: number;
    entrees?: number;
    sorties?: number;
    magasins?: number;
  };
};

type Kpi = {
  label: string;
  value: string;
  description: string;
  icon: ElementType;
  color: string;
  bg: string;
};

type ModuleCard = {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  color: string;
  bg: string;
  links: {
    label: string;
    href: string;
  }[];
};

type AlertItem = {
  title: string;
  description: string;
  status: string;
  color: string;
};

type ActivityItem = {
  title: string;
  description: string;
  time: string;
  icon: ElementType;
};

const emptyDashboard: GeneralDashboardResponse = {
  equipements: {
    total: 0,
    actifs: 0,
    critiques: 0,
  },
  maintenance: {
    demandesTotales: 0,
    interventionsEnCours: 0,
    plansALancer: 0,
  },
  stock: {
    articles: 0,
    entrees: 0,
    sorties: 0,
    magasins: 0,
  },
};

const modules: ModuleCard[] = [
  {
    title: 'Équipements',
    description:
      'Gérez le parc équipements, les familles, modèles, matériels et arborescences.',
    href: '/dashboards/equipements',
    icon: Boxes,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    links: [
      { label: 'Modèles', href: '/modeles' },
      { label: 'Matériels', href: '/materiels' },
      { label: 'Arborescence', href: '/arborescences' },
      { label: 'Points de mesure', href: '/points-mesure' },
    ],
  },
  {
    title: 'Maintenance',
    description:
      'Suivez les demandes d’intervention, les interventions, les gammes et les plans préventifs.',
    href: '/dashboards/maintenance',
    icon: Wrench,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    links: [
      { label: 'Nouvelle DI', href: '/maintenance/demandes/nouveau' },
      { label: 'Interventions', href: '/maintenance/interventions' },
      { label: 'Gammes', href: '/gammes' },
      { label: 'Plans préventifs', href: '/plans-preventifs' },
    ],
  },
  {
    title: 'Stock',
    description:
      'Pilotez les articles, magasins, entrées, sorties et mouvements de stock.',
    href: '/dashboards/stock',
    icon: Warehouse,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    links: [
      { label: 'Articles', href: '/articles' },
      { label: 'Magasins', href: '/magasins' },
      { label: 'Entrées', href: '/stock/entrees' },
      { label: 'Mouvements', href: '/stock/mouvements' },
    ],
  },
];

const activities: ActivityItem[] = [
  {
    title: 'Données synchronisées',
    description: 'Les indicateurs du tableau de bord sont chargés depuis le backend.',
    time: 'Maintenant',
    icon: TrendingUp,
  },
  {
    title: 'Parc équipements suivi',
    description: 'Les matériels actifs et critiques sont calculés automatiquement.',
    time: 'Aujourd’hui',
    icon: Boxes,
  },
  {
    title: 'Maintenance pilotée',
    description: 'Les demandes, interventions et plans préventifs sont centralisés.',
    time: 'Aujourd’hui',
    icon: ClipboardList,
  },
  {
    title: 'Stock surveillé',
    description: 'Les articles, magasins, entrées et sorties sont suivis.',
    time: 'Aujourd’hui',
    icon: Package,
  },
];

function normalizeDashboard(
  data: GeneralDashboardResponse | null | undefined,
) {
  return {
    equipements: {
      total: data?.equipements?.total ?? data?.totalEquipements ?? 0,
      actifs: data?.equipements?.actifs ?? data?.materielsActifs ?? 0,
      critiques: data?.equipements?.critiques ?? 0,
    },
    maintenance: {
      demandesTotales:
        data?.maintenance?.demandesTotales ?? data?.demandesEnAttente ?? 0,
      interventionsEnCours:
        data?.maintenance?.interventionsEnCours ??
        data?.interventionsEnCours ??
        0,
      plansALancer:
        data?.maintenance?.plansALancer ?? data?.plansALancer ?? 0,
    },
    stock: {
      articles: data?.stock?.articles ?? data?.totalArticles ?? 0,
      entrees: data?.stock?.entrees ?? 0,
      sorties: data?.stock?.sorties ?? 0,
      magasins: data?.stock?.magasins ?? data?.totalMagasins ?? 0,
    },
  };
}
export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<GeneralDashboardResponse>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const loadDashboard = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch('http://localhost:3001/dashboards/general', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }

    const data = (await response.json()) as GeneralDashboardResponse;

    console.log('DASHBOARD GENERAL DATA =', data);

    setStats(normalizeDashboard(data));
  } catch (err) {
    console.error('ERREUR DASHBOARD GENERAL =', err);

    setStats(emptyDashboard);
    setError(
      err instanceof Error
        ? err.message
        : 'Erreur lors du chargement du tableau de bord.',
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboard = useMemo(() => normalizeDashboard(stats), [stats]);

  const disponibiliteParc = useMemo(() => {
    if (!dashboard.equipements.total) return 0;

    return Math.round(
      (dashboard.equipements.actifs / dashboard.equipements.total) * 100,
    );
  }, [dashboard.equipements.actifs, dashboard.equipements.total]);

  const kpis: Kpi[] = [
    {
      label: 'Matériels actifs',
      value: String(dashboard.equipements.actifs),
      description: `${dashboard.equipements.total} équipement(s) suivis`,
      icon: Boxes,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Interventions en cours',
      value: String(dashboard.maintenance.interventionsEnCours),
      description: 'Maintenance active',
      icon: Wrench,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
    },
    {
      label: 'Articles stock',
      value: String(dashboard.stock.articles),
      description: `${dashboard.stock.magasins} magasin(s) actif(s)`,
      icon: Package,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Plans à lancer',
      value: String(dashboard.maintenance.plansALancer),
      description: 'Préventif en attente',
      icon: Activity,
      color: 'text-violet-700',
      bg: 'bg-violet-50',
    },
  ];

  const alerts: AlertItem[] = [
    {
      title: 'Équipements critiques',
      description: `${dashboard.equipements.critiques} équipement(s) nécessitent un suivi renforcé.`,
      status: dashboard.equipements.critiques > 0 ? 'À surveiller' : 'Normal',
      color:
        dashboard.equipements.critiques > 0
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Interventions en cours',
      description: `${dashboard.maintenance.interventionsEnCours} intervention(s) actuellement en traitement.`,
      status:
        dashboard.maintenance.interventionsEnCours > 0 ? 'En cours' : 'Aucune',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      title: 'Plans préventifs à lancer',
      description: `${dashboard.maintenance.plansALancer} plan(s) préventif(s) prêt(s) au lancement.`,
      status: dashboard.maintenance.plansALancer > 0 ? 'À traiter' : 'RAS',
      color:
        dashboard.maintenance.plansALancer > 0
          ? 'bg-violet-50 text-violet-700 border-violet-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-3xl bg-[#163E56] shadow-sm">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute bottom-0 right-28 h-40 w-40 rounded-full bg-cyan-300/10" />

          <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Tableau de bord global
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Bienvenue, {user?.fullName || 'Utilisateur'}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/80 sm:text-base">
                Vue globale de la GMAO BMT : équipements, maintenance,
                interventions et stock.
              </p>

              {error && (
                <div className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-50">
                  Impossible de charger les données du backend.
                  <br />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
              <Link
                href="/maintenance/demandes/nouveau"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#163E56] shadow-sm transition hover:bg-slate-100"
              >
                <ClipboardList size={17} />
                Nouvelle DI
              </Link>

              <Link
                href="/materiels/nouveau"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
              >
                <Boxes size={17} />
                Ajouter matériel
              </Link>

              <Link
                href="/stock/entrees/nouvelle"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-black text-[#163E56] shadow-sm transition hover:bg-cyan-200"
              >
                <PackagePlus size={17} />
                Entrée stock
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      {kpi.label}
                    </p>

                    <div className="mt-3 min-h-[40px] text-3xl font-black tracking-tight text-slate-900">
                      {loading ? (
                        <Loader2
                          className="animate-spin text-slate-400"
                          size={28}
                        />
                      ) : (
                        kpi.value
                      )}
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {kpi.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${kpi.bg} ${kpi.color}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Modules principaux
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                Accès rapide aux modules
              </h2>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ${module.bg} ${module.color}`}
                    >
                      <Icon size={26} />
                    </div>

                    <Link
                      href={module.href}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                    >
                      Ouvrir
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    {module.title}
                  </h3>

                  <p className="mt-2 min-h-[52px] text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {module.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-[#163E56] hover:text-[#163E56]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <ShieldAlert size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Alertes
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  Points importants à traiter
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {alert.description}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${alert.color}`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Clock3 size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Activité récente
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  Dernières actions
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-sm font-black text-slate-900">
                          {activity.title}
                        </h3>

                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {activity.time}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Équipements
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  Disponibilité parc
                </h3>
              </div>

              <TrendingUp className="text-blue-700" size={24} />
            </div>

            <p className="mt-4 text-3xl font-black text-slate-900">
              {disponibiliteParc}%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Taux estimé des matériels actifs.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Maintenance
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  DI enregistrées
                </h3>
              </div>

              <FileText className="text-orange-700" size={24} />
            </div>

            <p className="mt-4 text-3xl font-black text-slate-900">
              {dashboard.maintenance.demandesTotales}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Demandes d’intervention suivies dans la GMAO.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Stock
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  Flux stock
                </h3>
              </div>

              <GitBranch className="text-emerald-700" size={24} />
            </div>

            <p className="mt-4 text-3xl font-black text-slate-900">
              {dashboard.stock.entrees + dashboard.stock.sorties}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Entrées et sorties enregistrées.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}