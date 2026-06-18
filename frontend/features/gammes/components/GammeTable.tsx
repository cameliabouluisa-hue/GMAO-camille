

import { Eye, Pencil, Trash2, Wrench } from 'lucide-react';

import type { Gamme } from '../types/gamme.types';

type GammeTableProps = {
  gammes: Gamme[];
  total: number;
  loading: boolean;
  actionLoadingId?: number | null;
  deleteCandidateId?: number | null;
  onView: (idGamme: number) => void;
  onEdit: (idGamme: number) => void;
  onDelete: (gamme: Gamme) => void;
};

function formatTypeMaintenance(value?: string | null) {
  if (value === 'PREVENTIF') return 'Préventif';
  if (value === 'CORRECTIF') return 'Correctif';
  if (value === 'CONDITIONNEL') return 'Conditionnel';

  return value || '—';
}

function formatEtat(value?: string | null) {
  if (value === 'BROUILLON') return 'Brouillon';
  if (value === 'VALIDE') return 'Validée';
  if (value === 'ANNULE') return 'Annulée';
  if (value === 'ARCHIVE') return 'Archivée';

  return value || '—';
}

function getTypeClass(value?: string | null) {
  if (value === 'PREVENTIF') {
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
  }

  if (value === 'CORRECTIF') {
    return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';
  }

  if (value === 'CONDITIONNEL') {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-100';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function getEtatClass(value?: string | null, actif?: boolean | null) {
  if (actif === false) {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100';
  }

  if (value === 'VALIDE') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  }

  if (value === 'BROUILLON') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function getOperationsCount(gamme: Gamme) {
  return gamme.gamme_operation?.length ?? 0;
}

function getModeleLabel(gamme: Gamme) {
  if (gamme.modele?.code && gamme.modele?.libelle) {
    return `${gamme.modele.code} — ${gamme.modele.libelle}`;
  }

  if (gamme.modele?.code) return gamme.modele.code;
  if (gamme.modele?.libelle) return gamme.modele.libelle;
  if (gamme.idModele) return `Modèle #${gamme.idModele}`;

  return '—';
}
function getMaterielLabel(gamme: Gamme) {
  if (gamme.materiel?.code && gamme.materiel?.libelle) {
    return `${gamme.materiel.code} — ${gamme.materiel.libelle}`;
  }

  if (gamme.materiel?.code) return gamme.materiel.code;
  if (gamme.materiel?.libelle) return gamme.materiel.libelle;
  if (gamme.idMateriel) return `Matériel #${gamme.idMateriel}`;

  return '—';
}
export function GammeTable({
  gammes,
  total,
  loading,
  actionLoadingId,
  deleteCandidateId,
  onView,
  onEdit,
  onDelete,
}: GammeTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[26px] font-black leading-tight text-slate-950">
            Liste des gammes
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {gammes.length} gamme(s) affichée(s) sur {total}
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
          <Wrench size={17} />
          Gammes maintenance
        </span>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-sm font-black text-slate-500">
          Chargement des gammes...
        </div>
      ) : gammes.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm font-black text-slate-500">
          Aucune gamme trouvée.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Gamme</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4">Matériel</th>
                <th className="px-6 py-4">Modèle</th>
                <th className="px-6 py-4 text-center">Opérations</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {gammes.map((gamme) => {
                const deleting = actionLoadingId === gamme.idGamme;
                const confirmDelete = deleteCandidateId === gamme.idGamme;

                return (
                  <tr
                    key={gamme.idGamme}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                        {gamme.code || `GAM-${gamme.idGamme}`}
                      </span>
                    </td>

                    <td className="max-w-[260px] px-6 py-5">
                      <p className="truncate text-base font-black text-slate-950">
                        {gamme.libelle || 'Sans libellé'}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        ID : {gamme.idGamme}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getTypeClass(
                          gamme.typeMaintenance,
                        )}`}
                      >
                        {formatTypeMaintenance(gamme.typeMaintenance)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getEtatClass(
                          gamme.etat,
                          gamme.actif,
                        )}`}
                      >
                        {gamme.actif === false
                          ? 'Inactive'
                          : formatEtat(gamme.etat)}
                      </span>
                    </td>

                    <td className="max-w-[180px] px-6 py-5">
                      <p className="truncate text-sm font-black text-slate-700">
                        {getMaterielLabel(gamme)}
                      </p>
                    </td>

                    <td className="max-w-[240px] px-6 py-5">
                      <p className="truncate text-sm font-black text-slate-700">
                        {getModeleLabel(gamme)}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl bg-violet-50 px-3 text-sm font-black text-violet-700">
                        {getOperationsCount(gamme)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(gamme.idGamme)}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
                          title="Voir détail"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(gamme.idGamme)}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => onDelete(gamme)}
                          className={[
                            'inline-flex h-11 items-center justify-center rounded-2xl border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60',
                            confirmDelete
                              ? 'border-red-200 bg-red-600 text-white hover:bg-red-700'
                              : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100',
                          ].join(' ')}
                          title="Supprimer"
                        >
                          {confirmDelete ? (
                            deleting ? (
                              '...'
                            ) : (
                              'Confirmer'
                            )
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}