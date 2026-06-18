'use client';

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Hammer,
  ShieldCheck,
  Timer,
  Wrench,
  XCircle,
} from 'lucide-react';

import type { MaintenanceDashboardData } from '../types/maintenance.types';

type Props = {
  data: MaintenanceDashboardData;
};

type StatCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div
      className="rounded-[18px] border p-4 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#6E8CA0' }}
          >
            {label}
          </p>

          <p
            className="mt-2 text-[28px] font-bold leading-none"
            style={{ color: '#183B56' }}
          >
            {value}
          </p>

          <p className="mt-2 text-[12px]" style={{ color: '#6B8596' }}>
            {helper}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-[14px]"
          style={{
            backgroundColor: '#EEF6F8',
            color: '#0F5F78',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceStatsCards({ data }: Props) {
  const interventionStats = data.interventionsDashboard.stats;
  const demandeStats = data.demandesDashboard.stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="OT total"
        value={interventionStats.total}
        helper="Toutes les interventions"
        icon={<ClipboardList size={20} />}
      />

      <StatCard
        label="À planifier"
        value={interventionStats.aPlanifier}
        helper="OT en attente d'affectation"
        icon={<Timer size={20} />}
      />

      <StatCard
        label="Affectés"
        value={interventionStats.affectees}
        helper="Affectation équipe ou technicien"
        icon={<Wrench size={20} />}
      />

      <StatCard
        label="Réalisés"
        value={interventionStats.realisees}
        helper="En attente de clôture"
        icon={<CheckCircle2 size={20} />}
      />

      <StatCard
        label="Clôturés"
        value={interventionStats.cloturees}
        helper="Travaux terminés et validés"
        icon={<ShieldCheck size={20} />}
      />

      <StatCard
        label="Préventifs"
        value={interventionStats.preventives}
        helper="OT générés depuis les plans"
        icon={<Hammer size={20} />}
      />

      <StatCard
        label="Correctifs"
        value={interventionStats.correctives}
        helper="OT générés depuis les DI"
        icon={<AlertTriangle size={20} />}
      />

      <StatCard
        label="DI en attente"
        value={demandeStats.enAttente}
        helper="Demandes à valider"
        icon={<XCircle size={20} />}
      />
    </div>
  );
}