'use client';

import type { Intervention } from '../types/maintenance.types';

type Props = {
  interventions: Intervention[];
};

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

export default function MaintenanceInterventionsTable({
  interventions,
}: Props) {
  const rows = interventions.slice(0, 8);

  return (
    <div
      className="max-w-full overflow-hidden rounded-[18px] border p-4 shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E6EDF2',
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: '#183B56' }}>
            Derniers OT
          </h2>

          <p className="mt-1 text-[12px]" style={{ color: '#6B8596' }}>
            Suivi rapide des interventions préventives et correctives.
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto pb-2">
        <table className="w-full min-w-[760px] border-collapse text-left">
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
              <th className="py-3 pr-4 font-semibold">Matériel</th>
              <th className="py-3 pr-4 font-semibold">Équipe</th>
              <th className="py-3 pr-4 font-semibold">Date début</th>
              <th className="py-3 pr-4 font-semibold">Créé par</th>
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
                  Aucun OT trouvé.
                </td>
              </tr>
            )}

            {rows.map((intervention) => (
              <tr
                key={intervention.idIntervention}
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
                  {intervention.typeMaintenance}
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
                  {intervention.materiel?.code || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {intervention.equipe_maintenance?.libelle || '-'}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {formatDate(intervention.dateDebut)}
                </td>

                <td className="whitespace-nowrap py-3 pr-4">
                  {intervention.createdBy || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}