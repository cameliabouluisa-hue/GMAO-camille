'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  BarChart3,
  Building2,
  ClipboardList,
  Layers,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type StockOperation = {
  id: number;
  type: string;
  reference: string;
  article: string;
  magasin: string;
  date: string;
  quantity: string;
};

type StockDashboardResponse = {
  totalArticles?: number;
  totalEntrees?: number;
  totalSorties?: number;
  totalMouvements?: number;
  totalMagasins?: number;
  totalInventaires?: number;
  inventairesPrepares?: number;
  dernieresOperations?: StockOperation[];
};

const emptyStockDashboard: Required<StockDashboardResponse> = {
  totalArticles: 0,
  totalEntrees: 0,
  totalSorties: 0,
  totalMouvements: 0,
  totalMagasins: 0,
  totalInventaires: 0,
  inventairesPrepares: 0,
  dernieresOperations: [],
};

function normalizeStockDashboard(
  data: StockDashboardResponse | null | undefined,
): Required<StockDashboardResponse> {
  return {
    totalArticles: data?.totalArticles ?? 0,
    totalEntrees: data?.totalEntrees ?? 0,
    totalSorties: data?.totalSorties ?? 0,
    totalMouvements: data?.totalMouvements ?? 0,
    totalMagasins: data?.totalMagasins ?? 0,
    totalInventaires: data?.totalInventaires ?? 0,
    inventairesPrepares: data?.inventairesPrepares ?? 0,
    dernieresOperations: data?.dernieresOperations ?? [],
  };
}

function formatDate(value?: string) {
  if (!value) return 'Date non définie';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR').format(date);
}

function getOperationStyle(type?: string) {
  const normalizedType = type?.toUpperCase() || '';

  if (normalizedType.includes('ENTREE')) {
    return {
      label: 'Entrée',
      icon: TrendingUp,
      cardClass: 'border-emerald-200 bg-emerald-50/70',
      iconClass: 'bg-emerald-100 text-emerald-700',
      badgeClass: 'bg-emerald-600 text-white',
      quantityClass: 'bg-emerald-600 text-white',
    };
  }

  if (normalizedType.includes('SORTIE')) {
    return {
      label: 'Sortie',
      icon: TrendingDown,
      cardClass: 'border-red-200 bg-red-50/70',
      iconClass: 'bg-red-100 text-red-700',
      badgeClass: 'bg-red-600 text-white',
      quantityClass: 'bg-red-600 text-white',
    };
  }

  if (normalizedType.includes('INVENTAIRE')) {
    return {
      label: 'Inventaire',
      icon: BarChart3,
      cardClass: 'border-blue-200 bg-blue-50/70',
      iconClass: 'bg-blue-100 text-blue-700',
      badgeClass: 'bg-blue-600 text-white',
      quantityClass: 'bg-blue-600 text-white',
    };
  }

  return {
    label: 'Mouvement',
    icon: ArrowRightLeft,
    cardClass: 'border-violet-200 bg-violet-50/70',
    iconClass: 'bg-violet-100 text-violet-700',
    badgeClass: 'bg-violet-600 text-white',
    quantityClass: 'bg-violet-600 text-white',
  };
}

export default function StockDashboardPage() {
  const [stats, setStats] =
    useState<Required<StockDashboardResponse>>(emptyStockDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/dashboards/stock`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}`);
      }

      const data = (await response.json()) as StockDashboardResponse;

      console.log('DASHBOARD STOCK DATA =', data);

      setStats(normalizeStockDashboard(data));
    } catch (err) {
      console.error('ERREUR DASHBOARD STOCK =', err);

      setStats(emptyStockDashboard);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du tableau de bord stock.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const modules = [
    { label: 'Articles', href: '/articles', icon: Package },
    { label: 'Entrées', href: '/stock/entrees', icon: TrendingUp },
    { label: 'Sorties', href: '/stock/sorties', icon: TrendingDown },
    { label: 'Mouvements', href: '/stock/mouvements', icon: ArrowRightLeft },
    { label: 'Inventaire', href: '/stock/inventaire', icon: BarChart3 },
    {
      label: 'Inventaires préparés',
      href: '/stock/inventaires-prepares',
      icon: Layers,
    },
    { label: 'Magasins', href: '/magasins', icon: Building2 },
  ];

  const totalFlux = useMemo(() => {
    return stats.totalEntrees + stats.totalSorties;
  }, [stats.totalEntrees, stats.totalSorties]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Stock"
          description="Vue d’ensemble des articles, magasins, entrées, sorties et mouvements de stock."
        />

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            Impossible de charger les données du dashboard stock : {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <KpiCard
            icon={
              loading ? <Loader2 className="animate-spin" size={20} /> : <Package size={20} />
            }
            label="Articles"
            value={loading ? '...' : stats.totalArticles}
            tone="blue"
            subtitle="Références enregistrées"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <TrendingUp size={20} />
              )
            }
            label="Entrées"
            value={loading ? '...' : stats.totalEntrees}
            tone="emerald"
            subtitle="Bons d’entrée"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <TrendingDown size={20} />
              )
            }
            label="Sorties"
            value={loading ? '...' : stats.totalSorties}
            tone="orange"
            subtitle="Bons de sortie"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Building2 size={20} />
              )
            }
            label="Magasins"
            value={loading ? '...' : stats.totalMagasins}
            tone="violet"
            subtitle="Espaces de stockage"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ArrowRightLeft size={20} />
              )
            }
            label="Mouvements"
            value={loading ? '...' : stats.totalMouvements}
            tone="blue"
            subtitle="Traçabilité des flux"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <BarChart3 size={20} />
              )
            }
            label="Inventaires"
            value={loading ? '...' : stats.totalInventaires}
            tone="emerald"
            subtitle="Contrôles de stock"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Layers size={20} />
              )
            }
            label="Inventaires préparés"
            value={loading ? '...' : stats.inventairesPrepares}
            tone="orange"
            subtitle="En préparation"
          />
        </div>

        <SectionCard>
          <h2 className="mb-6 text-xl font-black text-slate-950">
            Accès rapides
          </h2>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#0b3d4f] hover:bg-[#f5f7fb]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-[#0b3d4f] group-hover:text-white">
                    <Icon size={20} />
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {module.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
         

          {loading ? (
            <div className="flex items-center justify-center rounded-[26px] border border-slate-200 bg-slate-50 p-10 text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Chargement des dernières opérations...
            </div>
          ) : stats.dernieresOperations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ClipboardList size={26} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-950">
                Aucune opération récente
              </h3>

              <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
                Les derniers mouvements de stock apparaîtront ici dès qu’ils
                seront enregistrés.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {stats.dernieresOperations.map((operation) => {
                const style = getOperationStyle(operation.type);
                const Icon = style.icon;

                return (
                  <div
                    key={operation.id}
                    className={`relative overflow-hidden rounded-[26px] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${style.cardClass}`}
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${style.iconClass}`}
                      >
                        <Icon size={22} />
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2 text-sm font-black shadow-sm ${style.quantityClass}`}
                      >
                        {operation.quantity}
                      </div>
                    </div>

                    <div className="relative mt-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-slate-950">
                          {operation.reference}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] shadow-sm ${style.badgeClass}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-black text-slate-800">
                        {operation.article}
                      </p>

                      <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
                        {operation.magasin}
                      </p>

                      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        {formatDate(operation.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        
      </section>
    </main>
  );
}