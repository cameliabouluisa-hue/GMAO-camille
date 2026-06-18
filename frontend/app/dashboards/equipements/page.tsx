'use client';

import Link from 'next/link';
import {
  Wrench,
  AlertCircle,
  CheckCircle,
  Box,
  TrendingUp,
  Zap,
  Clock,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';

export default function EquipementsPage() {
  // Données mockées pour référence - à connecter à l'API réelle plus tard
  const equipmentStats = {
    total: 248,
    active: 198,
    inactive: 50,
    models: 42,
    critical: 12,
    measurePoints: 156,
    lastAdded: 8,
  };

  const modules = [
    { label: 'Matériels', href: '/materiels', icon: Wrench },
    { label: 'Modèles', href: '/modeles', icon: Box },
    { label: 'Arborescence', href: '/arborescences', icon: TrendingUp },
    { label: 'Points de structure', href: '/points-structure', icon: Zap },
    { label: 'Points de mesure', href: '/points-mesure', icon: Clock },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Équipements"
          description="Vue d'ensemble des matériels, modèles et points de mesure du parc."
        />

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={<Box size={20} />}
            label="Total équipements"
            value={equipmentStats.total}
            tone="blue"
          />
          <KpiCard
            icon={<CheckCircle size={20} />}
            label="Actifs"
            value={equipmentStats.active}
            tone="emerald"
            subtitle={`${Math.round((equipmentStats.active / equipmentStats.total) * 100)}%`}
          />
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="Inactifs"
            value={equipmentStats.inactive}
            tone="orange"
          />
          <KpiCard
            icon={<Wrench size={20} />}
            label="Modèles"
            value={equipmentStats.models}
            tone="violet"
          />
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="Critiques"
            value={equipmentStats.critical}
            tone="red"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            icon={<Zap size={20} />}
            label="Points de mesure"
            value={equipmentStats.measurePoints}
            tone="blue"
            subtitle="Capteurs et indicateurs"
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Nouveaux cette semaine"
            value={equipmentStats.lastAdded}
            tone="emerald"
            subtitle="Matériels ajoutés"
          />
          <SectionCard className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Statut du parc
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">Opérationnel</p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Tous les systèmes nominaux
            </p>
          </SectionCard>
        </div>

        <SectionCard>
          <h2 className="mb-6 text-xl font-black text-slate-950">Accès rapides</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#0b3d4f] hover:bg-[#f5f7fb]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {module.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>

       <SectionCard className="overflow-hidden">
  <div className="mb-6 rounded-[24px] bg-gradient-to-r from-[#0b3d4f] via-[#0f5b6b] to-[#16a6c9] p-6 text-white">
    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
      État du parc
    </p>

    <div className="mt-3">
      <h2 className="text-2xl font-black">
        Points de vigilance
      </h2>
      <p className="mt-2 text-sm font-medium text-cyan-50">
        Suivi des équipements sensibles, critiques et de l’état général du parc.
      </p>
    </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
    {[
      {
        label: 'Équipements en panne',
        value: `${equipmentStats.inactive} équipement(s)`,
        description: 'Matériels indisponibles ou hors service',
        status: 'Priorité',
        icon: AlertCircle,
        cardClass: 'border-orange-200 bg-orange-50/70',
        iconClass: 'bg-orange-100 text-orange-700',
        badgeClass: 'bg-orange-600 text-white',
      },
      {
        label: 'Équipements critiques',
        value: `${equipmentStats.critical} équipement(s)`,
        description: 'Matériels sensibles nécessitant un suivi renforcé',
        status: 'Critique',
        icon: AlertCircle,
        cardClass: 'border-red-200 bg-red-50/70',
        iconClass: 'bg-red-100 text-red-700',
        badgeClass: 'bg-red-600 text-white',
      },
      {
        label: 'Mise à jour du parc',
        value: 'Il y a 2 jours',
        description: 'Dernière actualisation des données équipements',
        status: 'À jour',
        icon: CheckCircle,
        cardClass: 'border-emerald-200 bg-emerald-50/70',
        iconClass: 'bg-emerald-100 text-emerald-700',
        badgeClass: 'bg-emerald-600 text-white',
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
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${item.iconClass}`}>
              <Icon size={22} />
            </div>

            <span className={`rounded-2xl px-4 py-2 text-sm font-black shadow-sm ${item.badgeClass}`}>
              {item.status}
            </span>
          </div>

          <div className="relative mt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {item.value}
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
