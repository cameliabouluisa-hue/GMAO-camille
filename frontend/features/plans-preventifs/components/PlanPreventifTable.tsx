'use client';

import { CalendarClock, Eye, Pencil, Trash2 } from 'lucide-react';

import type { PlanPreventif } from '../types/plan-preventif.types';

type PlanPreventifRow = Omit<
  PlanPreventif,
  'materiel' | 'plan_preventif_predefini'
> & {
  actif?: boolean | null;
  idMateriel?: number | null;
  idPlanPreventifPredefini?: number | null;

  materiel?: {
    idMateriel?: number | null;
    code?: string | null;
    libelle?: string | null;
    designation?: string | null;
  } | null;

  plan_preventif_predefini?: {
    idPlanPreventifPredefini?: number | null;
    code?: string | null;
    titre?: string | null;
    libelle?: string | null;
  } | null;
};

type PlanPreventifTableProps = {
  items: PlanPreventif[];
  total: number;
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (id: number) => void;
};

function formatBoolean(value?: boolean | null) {
  if (value === true) return 'Oui';
  if (value === false) return 'Non';

  return '—';
}

function formatEtat(value?: string | null) {
  if (value === 'ACTIF') return 'Actif';
  if (value === 'INACTIF') return 'Inactif';
  if (value === 'BROUILLON') return 'Brouillon';
  if (value === 'VALIDE') return 'Validé';

  return value || '—';
}

function formatType(value?: string | null) {
  if (value === 'AUTOMATIQUE') return 'Automatique';
  if (value === 'MANUEL') return 'Manuel';
  if (value === 'CONDITIONNEL') return 'Conditionnel';

  return value || '—';
}

function getEtatClass(value?: string | null, actif?: boolean | null) {
  if (actif === false || value === 'INACTIF') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100';
  }

  if (value === 'ACTIF' || value === 'VALIDE') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  }

  if (value === 'BROUILLON') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function getTypeClass(value?: string | null) {
  if (value === 'AUTOMATIQUE') {
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
  }

  if (value === 'MANUEL') {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-100';
  }

  if (value === 'CONDITIONNEL') {
    return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function displayMateriel(item: PlanPreventifRow) {
  if (item.materiel?.code || item.materiel?.libelle || item.materiel?.designation) {
    return `${item.materiel.code || ''}${
      item.materiel.code && (item.materiel.libelle || item.materiel.designation)
        ? ' — '
        : ''
    }${item.materiel.libelle || item.materiel.designation || ''}`;
  }

  if (item.idMateriel) {
    return `Matériel #${item.idMateriel}`;
  }

  return '—';
}

function displaySource(item: PlanPreventifRow) {
  if (
    item.plan_preventif_predefini?.code ||
    item.plan_preventif_predefini?.titre ||
    item.plan_preventif_predefini?.libelle
  ) {
    return `${item.plan_preventif_predefini.code || ''}${
      item.plan_preventif_predefini.code &&
      (item.plan_preventif_predefini.titre ||
        item.plan_preventif_predefini.libelle)
        ? ' — '
        : ''
    }${
      item.plan_preventif_predefini.titre ||
      item.plan_preventif_predefini.libelle ||
      ''
    }`;
  }

  if (item.idPlanPreventifPredefini) {
    return `PPP #${item.idPlanPreventifPredefini}`;
  }

  return '—';
}

function getAssociationSource(item: PlanPreventifRow) {
  return Boolean(
    item.idPlanPreventifPredefini ||
      item.plan_preventif_predefini?.idPlanPreventifPredefini ||
      item.plan_preventif_predefini?.code,
  );
}

function SourceAssociationBadge({ item }: { item: PlanPreventifRow }) {
  const isAssociated = getAssociationSource(item);

  if (!isAssociated) {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700 ring-1 ring-orange-100">
        Non associé
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
      Associé
    </span>
  );
}

export function PlanPreventifTable({
  items,
  total,
  loading,
  onView,
  onEdit,
  onDelete,
}: PlanPreventifTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[26px] font-black leading-tight text-slate-950">
            Liste des plans préventifs
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {items.length} plan(s) affiché(s) sur {total}
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
          <CalendarClock size={17} />
          Plans préventifs
        </span>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-sm font-black text-slate-500">
          Chargement des plans préventifs...
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm font-black text-slate-500">
          Aucun plan préventif trouvé.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100 text-left text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Libellé</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Association</th>
                <th className="px-6 py-4">Matériel</th>
                <th className="px-6 py-4">Source PPP</th>
                <th className="px-6 py-4 text-center">Actif</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((rawItem) => {
                const item = rawItem as PlanPreventifRow;

                return (
                  <tr
                    key={item.idPlanPreventif}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5">
                      <span className="inline-flex max-w-[150px] rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                        <span className="truncate">
                          {item.code || `PP-${item.idPlanPreventif}`}
                        </span>
                      </span>
                    </td>

                    <td className="max-w-[260px] px-6 py-5">
                      <p className="truncate text-base font-black text-slate-950">
                        {item.libelle || 'Sans libellé'}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        ID : {item.idPlanPreventif}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getEtatClass(
                          item.etat,
                          item.actif,
                        )}`}
                      >
                        {formatEtat(item.etat)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getTypeClass(
                          item.typeDeclenchement,
                        )}`}
                      >
                        {formatType(item.typeDeclenchement)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <SourceAssociationBadge item={item} />
                    </td>

                    <td className="max-w-[240px] px-6 py-5">
                      <p
                        className="truncate text-sm font-black text-slate-700"
                        title={displayMateriel(item)}
                      >
                        {displayMateriel(item)}
                      </p>
                    </td>

                    <td className="max-w-[260px] px-6 py-5">
                      <p
                        className="truncate text-sm font-black text-slate-700"
                        title={displaySource(item)}
                      >
                        {displaySource(item)}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-xs font-black',
                          item.actif !== false
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-red-50 text-red-700 ring-1 ring-red-100',
                        ].join(' ')}
                      >
                        {formatBoolean(item.actif !== false)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(item.idPlanPreventif)}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                          title="Voir détail"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(item.idPlanPreventif)}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.idPlanPreventif)}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
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