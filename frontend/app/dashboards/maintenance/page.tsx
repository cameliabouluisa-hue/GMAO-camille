'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type MaintenanceDashboardResponse = {
  totalDemands?: number;
  pending?: number;
  inProgress?: number;
  completed?: number;
  overdue?: number;
  preventivePlans?: number;
  scheduledInterventions?: number;
  performance?: number;
};

const emptyMaintenanceDashboard: Required<MaintenanceDashboardResponse> = {
  totalDemands: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0,
  preventivePlans: 0,
  scheduledInterventions: 0,
  performance: 0,
};

function normalizeMaintenanceDashboard(
  data: MaintenanceDashboardResponse | null | undefined,
): Required<MaintenanceDashboardResponse> {
  return {
    totalDemands: data?.totalDemands ?? 0,
    pending: data?.pending ?? 0,
    inProgress: data?.inProgress ?? 0,
    completed: data?.completed ?? 0,
    overdue: data?.overdue ?? 0,
    preventivePlans: data?.preventivePlans ?? 0,
    scheduledInterventions: data?.scheduledInterventions ?? 0,
    performance: data?.performance ?? 0,
  };
}

export default function MaintenanceDashboardPage() {
  const [stats, setStats] =
    useState<Required<MaintenanceDashboardResponse>>(emptyMaintenanceDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/dashboards/maintenance`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}`);
      }

      const data = (await response.json()) as MaintenanceDashboardResponse;

      console.log('DASHBOARD MAINTENANCE DATA =', data);

      setStats(normalizeMaintenanceDashboard(data));
    } catch (err) {
      console.error('ERREUR DASHBOARD MAINTENANCE =', err);

      setStats(emptyMaintenanceDashboard);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du tableau de bord maintenance.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const modules = [
    {
      label: 'Demandes DI',
      href: '/maintenance/demandes',
      icon: ClipboardList,
    },
    {
      label: 'Interventions',
      href: '/maintenance/interventions',
      icon: Wrench,
    },
    {
      label: 'Gammes',
      href: '/gammes',
      icon: BarChart3,
    },
    {
      label: 'Plans préventifs',
      href: '/plans-preventifs',
      icon: Zap,
    },
    {
      label: 'Plans prédéfinis',
      href: '/plans-preventifs-predefinis',
      icon: CheckCircle,
    },
  ];

  const tauxTerminees = useMemo(() => {
    if (!stats.totalDemands) return 0;
    return Math.round((stats.completed / stats.totalDemands) * 100);
  }, [stats.completed, stats.totalDemands]);

  const tauxAttente = useMemo(() => {
    if (!stats.totalDemands) return 0;
    return Math.round((stats.pending / stats.totalDemands) * 100);
  }, [stats.pending, stats.totalDemands]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Maintenance"
          description="Suivi et pilotage des demandes d’intervention, ordres de travail et plans préventifs."
        />

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            Impossible de charger les données du dashboard maintenance : {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ClipboardList size={20} />
              )
            }
            label="Demandes totales"
            value={loading ? '...' : stats.totalDemands}
            tone="blue"
            subtitle="DI enregistrées"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Clock size={20} />
              )
            }
            label="En attente"
            value={loading ? '...' : stats.pending}
            tone="orange"
            subtitle={`${tauxAttente}% des demandes`}
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <TrendingUp size={20} />
              )
            }
            label="En cours"
            value={loading ? '...' : stats.inProgress}
            tone="violet"
            subtitle="Maintenance active"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <CheckCircle size={20} />
              )
            }
            label="Terminées"
            value={loading ? '...' : stats.completed}
            tone="emerald"
            subtitle={`${tauxTerminees}% traitées`}
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <AlertCircle size={20} />
              )
            }
            label="En retard"
            value={loading ? '...' : stats.overdue}
            tone="red"
            subtitle="À traiter en priorité"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Zap size={20} />
              )
            }
            label="Plans préventifs actifs"
            value={loading ? '...' : stats.preventivePlans}
            tone="blue"
            subtitle="Programmes de maintenance"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Wrench size={20} />
              )
            }
            label="Interventions planifiées"
            value={loading ? '...' : stats.scheduledInterventions}
            tone="emerald"
            subtitle="Cette semaine"
          />

          <SectionCard className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Performance
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {loading ? '...' : `${stats.performance}%`}
            </p>

            <p
              className={`mt-2 text-sm font-bold ${
                stats.performance >= 80 ? 'text-emerald-600' : 'text-orange-600'
              }`}
            >
              {stats.performance >= 80
                ? 'Taux de traitement satisfaisant'
                : 'Performance à améliorer'}
            </p>
          </SectionCard>
        </div>

        <SectionCard>
          <h2 className="mb-6 text-xl font-black text-slate-950">
            Accès rapides
          </h2>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
          

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                label: 'Interventions en retard',
                value: `${stats.overdue} OT`,
                description:
                  'Ordres de travail nécessitant une action rapide.',
                status: stats.overdue > 0 ? 'Urgent' : 'RAS',
                icon: AlertCircle,
                cardClass:
                  stats.overdue > 0
                    ? 'border-red-200 bg-red-50/70'
                    : 'border-emerald-200 bg-emerald-50/70',
                iconClass:
                  stats.overdue > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700',
                badgeClass:
                  stats.overdue > 0
                    ? 'bg-red-600 text-white'
                    : 'bg-emerald-600 text-white',
              },
              {
                label: 'Charge de travail',
                value: `${stats.inProgress} OT`,
                description:
                  'Interventions actuellement en cours de réalisation.',
                status: stats.inProgress > 0 ? 'En cours' : 'Aucune',
                icon: Wrench,
                cardClass:
                  stats.inProgress > 0
                    ? 'border-blue-200 bg-blue-50/70'
                    : 'border-slate-200 bg-slate-50',
                iconClass:
                  stats.inProgress > 0
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600',
                badgeClass:
                  stats.inProgress > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-white',
              },
              {
                label: 'Performance',
                value: `${stats.performance}%`,
                description:
                  'Taux de traitement des demandes et interventions terminées.',
                status: stats.performance >= 80 ? 'Bon' : 'À améliorer',
                icon: CheckCircle,
                cardClass:
                  stats.performance >= 80
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-orange-200 bg-orange-50/70',
                iconClass:
                  stats.performance >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700',
                badgeClass:
                  stats.performance >= 80
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 text-white',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`relative overflow-hidden rounded-[26px] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${item.cardClass}`}
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${item.iconClass}`}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      className={`rounded-2xl px-4 py-2 text-sm font-black shadow-sm ${item.badgeClass}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {loading ? '...' : item.value}
                    </p>

                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}