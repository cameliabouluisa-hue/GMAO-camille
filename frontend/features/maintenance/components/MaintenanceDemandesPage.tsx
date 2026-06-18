'use client';

import { Eye, Plus, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useDemandesIntervention } from '../hooks/useDemandesIntervention';
import type { DemandeIntervention } from '../types/maintenance.types';

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getStatutLabel(statut?: string | null) {
  const labels: Record<string, string> = {
    EN_ATTENTE_VALIDATION: 'En attente',
    VALIDEE: 'Validée',
    REFUSEE: 'Refusée',
    OT_GENERE: 'OT généré',
  };

  return statut ? labels[statut] || statut : '-';
}

function DemandeRow({
  demande,
  onOpen,
}: {
  demande: DemandeIntervention;
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
        DI-{String(demande.idDemande).padStart(5, '0')}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        <span
          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{
            backgroundColor: '#EEF6F8',
            color: '#0F5F78',
          }}
        >
          {getStatutLabel(demande.statut)}
        </span>
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {demande.priorite || '-'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {demande.materiel?.code || '-'}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {formatDate(demande.dateDemande)}
      </td>

      <td className="whitespace-nowrap py-3 pr-4">
        {demande.createdBy || '-'}
      </td>

      <td className="max-w-[300px] truncate py-3 pr-4">
        {demande.description || '-'}
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

export default function MaintenanceDemandesPage() {
  const router = useRouter();
  const { demandes, loading, error, refetch } = useDemandesIntervention();

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
              Demandes d’intervention
            </h1>

            <p className="mt-2 text-[14px]" style={{ color: '#6B8596' }}>
              Création, validation et transformation des DI en OT correctifs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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

            <button
              type="button"
              onClick={() => router.push('/maintenance/demandes/nouveau')}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-semibold text-white transition"
              style={{
                backgroundColor: '#0F5F78',
              }}
            >
              <Plus size={16} />
              Nouvelle DI
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-6 text-[13px]" style={{ color: '#5F7C90' }}>
            Chargement des demandes...
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
            <div className="mb-4">
              <h2
                className="text-[18px] font-bold"
                style={{ color: '#183B56' }}
              >
                Liste des DI
              </h2>

              <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
                {demandes.length} demande(s) trouvée(s).
              </p>
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
                    <th className="py-3 pr-4 font-semibold">Statut</th>
                    <th className="py-3 pr-4 font-semibold">Priorité</th>
                    <th className="py-3 pr-4 font-semibold">Matériel</th>
                    <th className="py-3 pr-4 font-semibold">Date</th>
                    <th className="py-3 pr-4 font-semibold">Créée par</th>
                    <th className="py-3 pr-4 font-semibold">Description</th>
                    <th className="py-3 pr-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {demandes.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-[13px]"
                        style={{ color: '#6B8596' }}
                      >
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  )}

                  {demandes.map((demande) => (
                    <DemandeRow
                      key={demande.idDemande}
                      demande={demande}
                      onOpen={() =>
                        router.push(`/maintenance/demandes/${demande.idDemande}`)
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