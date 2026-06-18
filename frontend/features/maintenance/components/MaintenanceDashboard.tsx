'use client';

import { RefreshCcw } from 'lucide-react';

import { useMaintenanceDashboard } from '../hooks/useMaintenanceDashboard';
import MaintenanceDemandesTable from './MaintenanceDemandesTable';
import MaintenanceInterventionsTable from './MaintenanceInterventionsTable';
import MaintenanceStatsCards from './MaintenanceStatsCards';

export default function MaintenanceDashboard() {
  const { data, loading, refreshing, error, refetch } =
    useMaintenanceDashboard();

  return (
    <div
      className="min-h-full w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #F7FAFC 0%, #EEF4F7 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{ color: '#6E8CA0' }}
            >
              BMT · GMAO
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Dashboard maintenance
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Vue responsable sur les OT, les DI, les états et les priorités.
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={refreshing}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              borderColor: '#E6EDF2',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            <RefreshCcw size={16} />
            <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement du tableau de bord...
          </div>
        )}

        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-[13px]"
            style={{
              borderColor: '#E8B4B4',
              color: '#8A1F1F',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-5">
            <MaintenanceStatsCards data={data} />

            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
              <MaintenanceInterventionsTable
                interventions={data.interventionsDashboard.interventions}
              />

              <MaintenanceDemandesTable
                demandes={data.demandesDashboard.demandes}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}