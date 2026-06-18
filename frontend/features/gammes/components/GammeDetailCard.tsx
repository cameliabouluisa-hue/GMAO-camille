'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { deleteGammeOperation } from '../services/gamme.service';
import type { Gamme } from '../types/gamme.types';

type GammeDetailCardProps = {
  gamme: Gamme;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  return '-';
}

export default function GammeDetailCard({
  gamme,
  deleting,
  onEdit,
  onDelete,
}: GammeDetailCardProps) {
  const router = useRouter();

  function handleAddOperation() {
    router.push(`/gammes/${gamme.idGamme}/operations/nouveau`);
  }

  function handleEditOperation(operationId: number) {
    router.push(`/gammes/${gamme.idGamme}/operations/${operationId}/modifier`);
  }

  async function handleDeleteOperation(operationId: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette opération ?',
    );

    if (!confirmed) return;

    try {
      await deleteGammeOperation(operationId);
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'opération.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-[20px] border p-5"
        style={{
          borderColor: '#E4EBF0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
        }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-[18px] font-semibold"
              style={{ color: '#183B56' }}
            >
              Informations générales
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
              Consultation des informations principales de la gamme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition hover:bg-slate-50"
              style={{
                borderColor: '#E6EDF2',
                backgroundColor: '#FFFFFF',
                color: '#183B56',
              }}
            >
              <Pencil size={15} />
              <span>Modifier</span>
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition disabled:opacity-70"
              style={{
                borderColor: '#F2D2D2',
                backgroundColor: '#FFFFFF',
                color: '#D46A6A',
              }}
            >
              <Trash2 size={15} />
              <span>{deleting ? 'Suppression...' : 'Supprimer'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Code" value={gamme.code || '-'} />
          <InfoItem label="Libellé" value={gamme.libelle || '-'} />
          <InfoItem
            label="Type maintenance"
            value={gamme.typeMaintenance || '-'}
          />
          <InfoItem label="État" value={gamme.etat || '-'} />
          <InfoItem label="Organisation" value={gamme.organisation || '-'} />
          <InfoItem
            label="Jour de fin"
            value={
              gamme.jourFin !== null && gamme.jourFin !== undefined
                ? String(gamme.jourFin)
                : '-'
            }
          />
          <InfoItem
            label="Charge prévue"
            value={
              gamme.chargePrevue !== null && gamme.chargePrevue !== undefined
                ? String(gamme.chargePrevue)
                : '-'
            }
          />
          <InfoItem
            label="Temps d’arrêt"
            value={
              gamme.tempsArret !== null && gamme.tempsArret !== undefined
                ? String(gamme.tempsArret)
                : '-'
            }
          />
          <InfoItem
            label="Réception travaux"
            value={formatBoolean(gamme.receptionTravaux)}
          />
          <InfoItem label="Actif" value={formatBoolean(gamme.actif)} />
          <InfoItem
            label="Modèle"
            value={gamme.modele?.libelle || gamme.modele?.code || '-'}
          />
          <InfoItem
            label="Nombre d’opérations"
            value={String(gamme.gamme_operation?.length || 0)}
          />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[20px] border"
        style={{
          borderColor: '#E4EBF0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(15, 35, 55, 0.05)',
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: '#EDF2F6' }}
        >
          <div>
            <h2
              className="text-[18px] font-semibold"
              style={{ color: '#183B56' }}
            >
              Opérations associées
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: '#6B8596' }}>
              Liste des opérations définies dans cette gamme.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddOperation}
            className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition hover:bg-slate-50"
            style={{
              borderColor: '#E6EDF2',
              backgroundColor: '#FFFFFF',
              color: '#183B56',
            }}
          >
            <Plus size={15} />
            <span>Ajouter une opération</span>
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr
                className="border-b text-left text-[12px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  borderColor: '#EDF2F6',
                  color: '#8AA0B2',
                }}
              >
                <th className="px-5 py-4">Ordre</th>
                <th className="px-5 py-4">Libellé</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Temps standard</th>
                <th className="px-5 py-4">Obligatoire</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!gamme.gamme_operation || gamme.gamme_operation.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-[15px]"
                    style={{ color: '#183B56' }}
                  >
                    Aucune opération trouvée.
                  </td>
                </tr>
              ) : (
                gamme.gamme_operation.map((operation) => (
                  <tr
                    key={operation.idOperation}
                    className="border-b"
                    style={{ borderColor: '#F1F5F8' }}
                  >
                    <td className="px-5 py-5" style={{ color: '#183B56' }}>
                      {operation.ordre ?? '-'}
                    </td>
                    <td
                      className="px-5 py-5 font-medium"
                      style={{ color: '#183B56' }}
                    >
                      {operation.libelle || '-'}
                    </td>
                    <td className="px-5 py-5" style={{ color: '#183B56' }}>
                      {operation.description || '-'}
                    </td>
                    <td className="px-5 py-5" style={{ color: '#183B56' }}>
                      {operation.tempsStandard ?? '-'}
                    </td>
                    <td className="px-5 py-5" style={{ color: '#183B56' }}>
                      {formatBoolean(operation.obligatoire)}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditOperation(operation.idOperation)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                          style={{
                            borderColor: '#E4EBF0',
                            color: '#6E8CA0',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteOperation(operation.idOperation)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border transition"
                          style={{
                            borderColor: '#F2D2D2',
                            color: '#D46A6A',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-[16px] border px-4 py-4"
      style={{
        borderColor: '#EDF2F6',
        backgroundColor: '#FBFDFE',
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: '#8AA0B2' }}
      >
        {label}
      </p>
      <p className="mt-2 text-[15px] font-medium" style={{ color: '#183B56' }}>
        {value}
      </p>
    </div>
  );
}