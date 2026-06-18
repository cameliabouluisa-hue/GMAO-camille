'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  CheckCircle,
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

type EquipementsDashboardResponse = {
  total?: number;
  active?: number;
  inactive?: number;
  models?: number;
  critical?: number;
  measurePoints?: number;
  lastAdded?: number;
  status?: string;
};

const emptyEquipementsDashboard: Required<EquipementsDashboardResponse> = {
  total: 0,
  active: 0,
  inactive: 0,
  models: 0,
  critical: 0,
  measurePoints: 0,
  lastAdded: 0,
  status: 'Non défini',
};

function normalizeEquipementsDashboard(
  data: EquipementsDashboardResponse | null | undefined,
): Required<EquipementsDashboardResponse> {
  return {
    total: data?.total ?? 0,
    active: data?.active ?? 0,
    inactive: data?.inactive ?? 0,
    models: data?.models ?? 0,
    critical: data?.critical ?? 0,
    measurePoints: data?.measurePoints ?? 0,
    lastAdded: data?.lastAdded ?? 0,
    status: data?.status ?? 'Non défini',
  };
}

export default function EquipementsDashboardPage() {
  const [stats, setStats] =
    useState<Required<EquipementsDashboardResponse>>(emptyEquipementsDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/dashboards/equipements`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}`);
      }

      const data = (await response.json()) as EquipementsDashboardResponse;

      console.log('DASHBOARD EQUIPEMENTS DATA =', data);

      setStats(normalizeEquipementsDashboard(data));
    } catch (err) {
      console.error('ERREUR DASHBOARD EQUIPEMENTS =', err);

      setStats(emptyEquipementsDashboard);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du tableau de bord équipements.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const modules = [
    { label: 'Matériels', href: '/materiels', icon: Wrench },
    { label: 'Modèles', href: '/modeles', icon: Box },
    { label: 'Arborescence', href: '/arborescences', icon: TrendingUp },
    { label: 'Points de structure', href: '/points-structure', icon: Zap },
    { label: 'Points de mesure', href: '/points-mesure', icon: Clock },
  ];

  const tauxActifs = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.active / stats.total) * 100);
  }, [stats.active, stats.total]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Équipements"
          description="Vue d’ensemble des matériels, modèles, points de structure et points de mesure du parc."
        />

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            Impossible de charger les données du dashboard équipements : {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Box size={20} />
              )
            }
            label="Total équipements"
            value={loading ? '...' : stats.total}
            tone="blue"
            subtitle="Matériels suivis"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <CheckCircle size={20} />
              )
            }
            label="Actifs"
            value={loading ? '...' : stats.active}
            tone="emerald"
            subtitle={`${tauxActifs}% du parc`}
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <AlertCircle size={20} />
              )
            }
            label="Inactifs"
            value={loading ? '...' : stats.inactive}
            tone="orange"
            subtitle="À vérifier"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Wrench size={20} />
              )
            }
            label="Modèles"
            value={loading ? '...' : stats.models}
            tone="violet"
            subtitle="Référentiel technique"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <AlertCircle size={20} />
              )
            }
            label="Critiques"
            value={loading ? '...' : stats.critical}
            tone="red"
            subtitle="Suivi renforcé"
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
            label="Points de mesure"
            value={loading ? '...' : stats.measurePoints}
            tone="blue"
            subtitle="Capteurs et indicateurs"
          />

          <KpiCard
            icon={
              loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <TrendingUp size={20} />
              )
            }
            label="Nouveaux cette semaine"
            value={loading ? '...' : stats.lastAdded}
            tone="emerald"
            subtitle="Matériels ajoutés"
          />

          <SectionCard className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Statut du parc
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {loading ? '...' : stats.status}
            </p>

            <p
              className={`mt-2 text-xs font-bold ${
                stats.status === 'Opérationnel'
                  ? 'text-emerald-600'
                  : 'text-orange-600'
              }`}
            >
              {stats.status === 'Opérationnel'
                ? 'Tous les systèmes sont suivis normalement'
                : 'Certains équipements nécessitent une attention'}
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
                label: 'Équipements inactifs',
                value: `${stats.inactive} équipement(s)`,
                description: 'Matériels désactivés ou indisponibles dans le parc.',
                status: stats.inactive > 0 ? 'À vérifier' : 'RAS',
                icon: AlertCircle,
                cardClass:
                  stats.inactive > 0
                    ? 'border-orange-200 bg-orange-50/70'
                    : 'border-emerald-200 bg-emerald-50/70',
                iconClass:
                  stats.inactive > 0
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-emerald-100 text-emerald-700',
                badgeClass:
                  stats.inactive > 0
                    ? 'bg-orange-600 text-white'
                    : 'bg-emerald-600 text-white',
              },
              {
                label: 'Équipements critiques',
                value: `${stats.critical} équipement(s)`,
                description:
                  'Matériels sensibles nécessitant un suivi maintenance renforcé.',
                status: stats.critical > 0 ? 'Critique' : 'Normal',
                icon: AlertCircle,
                cardClass:
                  stats.critical > 0
                    ? 'border-red-200 bg-red-50/70'
                    : 'border-emerald-200 bg-emerald-50/70',
                iconClass:
                  stats.critical > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700',
                badgeClass:
                  stats.critical > 0
                    ? 'bg-red-600 text-white'
                    : 'bg-emerald-600 text-white',
              },
              {
                label: 'Disponibilité du parc',
                value: `${tauxActifs}%`,
                description:
                  'Taux estimé des équipements actifs par rapport au parc total.',
                status: tauxActifs >= 80 ? 'Bon' : 'À surveiller',
                icon: CheckCircle,
                cardClass:
                  tauxActifs >= 80
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-orange-200 bg-orange-50/70',
                iconClass:
                  tauxActifs >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700',
                badgeClass:
                  tauxActifs >= 80
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