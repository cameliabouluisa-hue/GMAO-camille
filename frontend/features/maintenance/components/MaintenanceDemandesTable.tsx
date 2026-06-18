'use client';

import type { DemandeIntervention } from '../types/maintenance.types';

type Props = {
  demandes: DemandeIntervention[];
};

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getStatutLabel(statut: string) {
  const labels: Record<string, string> = {
    EN_ATTENTE_VALIDATION: 'En attente',
    VALIDEE: 'Validée',
    REFUSEE: 'Refusée',
    OT_GENERE: 'OT généré',
  };

  return labels[statut] || statut;
}

export default function MaintenanceDemandesTable({ demandes }: Props) {
  const rows = demandes.slice(0, 8);

  return (
    <div
      className="max-w-full overflow-hidden rounded-[18px] border p-4 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div className="mb-4">
        <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
          Dernières DI
        </h2>

        <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
          Demandes d’intervention correctives à suivre.
        </p>
      </div>

      <div className="max-w-full overflow-x-auto pb-2">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr
              className="border-b text-[11px] uppercase tracking-[0.16em]"
              style={{
                borderColor: '#E6EDF2',
                color: '#6E8CA0',
              }}
            >
              <th className="py-3 pr-4 font-semibold">ID</th>
              <th className="py-3 pr-4 font-semibold">Statut</th>
              <th className="py-3 pr-4 font-semibold">Priorité</th>
              <th className="py-3 pr-4 font-semibold">Matériel</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
              <th className="py-3 pr-4 font-semibold">Créée par</th>
              <th className="py-3 pr-4 font-semibold">Description</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-[13px]"
                  style={{ color: '#6B8596' }}
                >
                  Aucune demande trouvée.
                </td>
              </tr>
            )}

            {rows.map((demande) => (
              <tr
                key={demande.idDemande}
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

                <td className="max-w-[260px] truncate py-3 pr-4">
                  {demande.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}