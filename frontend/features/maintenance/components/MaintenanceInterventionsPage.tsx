'use client';

import { Eye, RefreshCcw, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useInterventions } from '../hooks/useInterventions';
import type { Intervention } from '../types/maintenance.types';

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getEtatLabel(etat: string) {
  const labels: Record<string, string> = {
    A_PLANIFIER: 'À planifier',
    AFFECTEE: 'Affectée',
    AFFECTEE_EQUIPE: 'Affectée équipe',
    REALISEE: 'Réalisée',
    CLOTUREE: 'Clôturée',
    ANNULEE: 'Annulée',
  };

  return labels[etat] || etat;
}

function getTypeLabel(typeMaintenance: string) {
  const labels: Record<string, string> = {
    PREVENTIF: 'Préventif',
    CORRECTIF: 'Correctif',
  };

  return labels[typeMaintenance] || typeMaintenance;
}

function InterventionRow({
  intervention,
  onOpen,
}: {
  intervention: Intervention;
  onOpen: () => void;
}) {
  return (
    <tr
      className="border-b text-[13px]"
      style={{
        borderColor: '#EEF3F6',
        color: '#183B56',
      }}
    >
      <td className="whitespace-nowrap py-3 pr-4 font-semibold">
        {intervention.code}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {getTypeLabel(intervention.typeMaintenance)}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        <span
          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{
            backgroundColor: '#EEF6F8',
            color: '#0F5F78',
          }}
        >
          {getEtatLabel(intervention.etat)}
        </span>
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {intervention.priorite || 'NORMALE'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {intervention.materiel?.code || '-'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {intervention.equipe_maintenance?.libelle || '-'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {formatDate(intervention.dateDebut)}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {formatDate(intervention.dateFin)}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {intervention.createdBy || '-'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4 text-right">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold transition hover:bg-slate-50"
          style={{
            borderColor: '#E6EDF2',
            backgroundColor: '#FFFFFF',
            color: '#183B56',
          }}
        >
          <Eye size={14} />
          Détail
        </button>
      </td>
    </tr>
  );
}

export default function MaintenanceInterventionsPage() {
  const router = useRouter();

  const {
    interventions,
    filters,
    loading,
    error,
    setTypeMaintenance,
    setEtat,
    resetFilters,
    refetch,
  } = useInterventions();

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
              BMT · Maintenance
            </p>

            <h1
              className="mt-2 text-[28px] font-bold leading-tight"
              style={{ color: '#183B56' }}
            >
              Liste des OT
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Consultation des ordres de travail préventifs et correctifs.
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50"
            style={{
              borderColor: '#E6EDF2',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div
          className="mb-5 rounded-[18px] border p-4 shadow-sm"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E6EDF2',
          }}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                Type
              </label>

              <select
                value={filters.typeMaintenance}
                onChange={(e) => setTypeMaintenance(e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                <option value="TOUS">Tous</option>
                <option value="PREVENTIF">Préventif</option>
                <option value="CORRECTIF">Correctif</option>
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: '#6E8CA0' }}
              >
                État
              </label>

              <select
                value={filters.etat}
                onChange={(e) => setEtat(e.target.value)}
                className="h-[42px] w-full rounded-[12px] border px-3 text-[13px] outline-none"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                <option value="TOUS">Tous</option>
                <option value="A_PLANIFIER">À planifier</option>
                <option value="AFFECTEE">Affectée</option>
                <option value="AFFECTEE_EQUIPE">Affectée équipe</option>
                <option value="REALISEE">Réalisée</option>
                <option value="CLOTUREE">Clôturée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition hover:bg-slate-50 md:w-auto"
                style={{
                  borderColor: '#E6EDF2',
                  backgroundColor: '#FFFFFF',
                  color: '#183B56',
                }}
              >
                <RotateCcw size={15} />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement des interventions...
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

        {!loading && !error && (
          <div
            className="max-w-full overflow-hidden rounded-[18px] border p-4 shadow-sm"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E6EDF2',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2
                  className="text-[18px] font-bold"
                  style={{ color: '#183B56' }}
                >
                  Interventions
                </h2>

                <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
                  {interventions.length} OT trouvé(s).
                </p>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto pb-2">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr
                    className="border-b text-[11px] uppercase tracking-[0.16em]"
                    style={{
                      borderColor: '#E6EDF2',
                      color: '#6E8CA0',
                    }}
                  >
                    <th className="py-3 pr-4 font-semibold">Code</th>
                    <th className="py-3 pr-4 font-semibold">Type</th>
                    <th className="py-3 pr-4 font-semibold">État</th>
                    <th className="py-3 pr-4 font-semibold">Priorité</th>
                    <th className="py-3 pr-4 font-semibold">Matériel</th>
                    <th className="py-3 pr-4 font-semibold">Équipe</th>
                    <th className="py-3 pr-4 font-semibold">Début</th>
                    <th className="py-3 pr-4 font-semibold">Fin</th>
                    <th className="py-3 pr-4 font-semibold">Créé par</th>
                    <th className="py-3 pr-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {interventions.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-[13px]"
                        style={{ color: '#6B8596' }}
                      >
                        Aucun OT trouvé.
                      </td>
                    </tr>
                  )}

                  {interventions.map((intervention) => (
                    <InterventionRow
                      key={intervention.idIntervention}
                      intervention={intervention}
                      onOpen={() =>
                        router.push(
                          `/maintenance/interventions/${intervention.idIntervention}`,
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}