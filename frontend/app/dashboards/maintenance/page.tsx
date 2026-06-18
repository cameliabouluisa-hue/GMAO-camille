'use client';

import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Zap,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';

export default function MaintenanceDashboardPage() {
  // Données mockées pour référence - à connecter à l'API réelle plus tard
  const maintenanceStats = {
    totalDemands: 127,
    pending: 34,
    inProgress: 12,
    completed: 78,
    overdue: 3,
    preventivePlans: 18,
    scheduledInterventions: 7,
  };

  const modules = [
    { label: 'Demandes DI', href: '/maintenance/demandes', icon: AlertCircle },
    { label: 'Interventions', href: '/maintenance/interventions', icon: Wrench },
    { label: 'Gammes', href: '/gammes', icon: BarChart3 },
    { label: 'Plans préventifs', href: '/plans-preventifs', icon: Zap },
    { label: 'Plans prédéfinis', href: '/plans-preventifs-predefinis', icon: CheckCircle },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <PageHeader
          module="Tableaux de bord"
          title="Maintenance"
          description="Suivi et pilotage des demandes d'intervention, ordres de travail et plans préventifs."
        />

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="Demandes totales"
            value={maintenanceStats.totalDemands}
            tone="blue"
          />
          <KpiCard
            icon={<Clock size={20} />}
            label="En attente"
            value={maintenanceStats.pending}
            tone="orange"
            subtitle={`${Math.round((maintenanceStats.pending / maintenanceStats.totalDemands) * 100)}%`}
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="En cours"
            value={maintenanceStats.inProgress}
            tone="violet"
          />
          <KpiCard
            icon={<CheckCircle size={20} />}
            label="Terminées"
            value={maintenanceStats.completed}
            tone="emerald"
            subtitle={`${Math.round((maintenanceStats.completed / maintenanceStats.totalDemands) * 100)}%`}
          />
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="En retard"
            value={maintenanceStats.overdue}
            tone="red"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            icon={<Zap size={20} />}
            label="Plans préventifs actifs"
            value={maintenanceStats.preventivePlans}
            tone="blue"
            subtitle="Programmes de maintenance"
          />
          <KpiCard
            icon={<Wrench size={20} />}
            label="Interventions planifiées"
            value={maintenanceStats.scheduledInterventions}
            tone="emerald"
            subtitle="Cette semaine"
          />
          <SectionCard className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Performance
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">92%</p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Taux de conformité OT
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
      Pilotage maintenance
    </p>

    <div className="mt-3">
      <h2 className="text-2xl font-black">
        Points de contrôle
      </h2>
      <p className="mt-2 text-sm font-medium text-cyan-50">
        Suivi des priorités, de la charge de travail et de la performance des interventions.
      </p>
    </div>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
    {[
      {
        label: 'Interventions en retard',
        value: `${maintenanceStats.overdue} OT`,
        description: 'Ordres de travail nécessitant une action rapide',
        status: 'Urgent',
        icon: AlertCircle,
        cardClass: 'border-red-200 bg-red-50/70',
        iconClass: 'bg-red-100 text-red-700',
        badgeClass: 'bg-red-600 text-white',
      },
      {
        label: 'Charge de travail',
        value: `${maintenanceStats.inProgress} OT`,
        description: 'Interventions actuellement en cours',
        status: 'Normal',
        icon: Wrench,
        cardClass: 'border-blue-200 bg-blue-50/70',
        iconClass: 'bg-blue-100 text-blue-700',
        badgeClass: 'bg-blue-600 text-white',
      },
      {
        label: 'Performance',
        value: '92%',
        description: 'Taux de conformité des ordres de travail',
        status: 'Bon',
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

            <p className="mt-2 text-3xl font-black text-slate-950">
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
