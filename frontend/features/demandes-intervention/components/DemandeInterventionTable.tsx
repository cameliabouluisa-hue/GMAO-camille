import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react';

import type { DemandeIntervention } from '../types/demande-intervention.types';

type PermissionCheck = boolean | ((demande: DemandeIntervention) => boolean);

type Props = {
  demandes: DemandeIntervention[];
  total: number;
  loading?: boolean;
  actionLoadingId?: number | null;

  canCreate?: boolean;
  canUpdate?: PermissionCheck;
  canDelete?: PermissionCheck;
  canAccept?: PermissionCheck;
  canRefuse?: PermissionCheck;
  canClose?: PermissionCheck;

  onDelete?: (demande: DemandeIntervention) => void | Promise<void>;
  onAccept?: (demande: DemandeIntervention) => void | Promise<void>;
  onRefuse?: (demande: DemandeIntervention) => void | Promise<void>;
  onClose?: (demande: DemandeIntervention) => void | Promise<void>;

  getDetailHref?: (demande: DemandeIntervention) => string;
  getEditHref?: (demande: DemandeIntervention) => string;
  createHref?: string;
};

export function DemandeInterventionTable({
  demandes,
  total,
  loading = false,
  actionLoadingId = null,

  canCreate = false,
  canUpdate = false,
  canDelete = false,
  canAccept = false,
  canRefuse = false,
  canClose = false,

  onDelete,
  onAccept,
  onRefuse,
  onClose,

  getDetailHref = (demande) =>
    `/maintenance/demandes/${demande.idDemande}`,
  getEditHref = (demande) =>
    `/maintenance/demandes/${demande.idDemande}/modifier`,
  createHref = '/maintenance/demandes/nouveau',
}: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Liste des demandes d’intervention
          </h2>

          <p className="text-sm font-medium text-slate-500">
            {demandes.length} demande(s) affichée(s) sur {total}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500">
          Chargement des demandes d’intervention...
        </div>
      ) : demandes.length === 0 ? (
        <EmptyState canCreate={canCreate} createHref={createHref} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Matériel</th>
                <th className="px-5 py-4">Priorité</th>
                <th className="px-5 py-4">Criticité</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4">Date demande</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {demandes.map((demande) => {
                const statut = normalizeDemandeStatut(demande.statut);
                const isActionLoading = actionLoadingId === demande.idDemande;

                const updateAllowed =
                  isAllowed(canUpdate, demande) && statut === 'EN_PREPARATION';

                const deleteAllowed =
                  Boolean(onDelete) &&
                  isAllowed(canDelete, demande) &&
                  statut === 'EN_PREPARATION';

                const acceptAllowed =
                  Boolean(onAccept) &&
                  isAllowed(canAccept, demande) &&
                  statut === 'ATTENTE_PRISE_EN_COMPTE';

                const refuseAllowed =
                  Boolean(onRefuse) &&
                  isAllowed(canRefuse, demande) &&
                  statut === 'ATTENTE_PRISE_EN_COMPTE';

                const closeAllowed =
                  Boolean(onClose) &&
                  isAllowed(canClose, demande) &&
                  statut === 'ATTENTE_REALISATION';

                return (
                  <tr
                    key={demande.idDemande}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 align-middle">
                      <Link
                        href={getDetailHref(demande)}
                        className="text-sm font-black text-slate-950 hover:text-[#0b3d4f]"
                      >
                        {getDemandeCodeLabel(
                          demande.code,
                          demande.idDemande,
                        )}
                      </Link>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="max-w-[330px] break-words text-sm font-bold leading-6 text-slate-800">
                        {demande.description || '—'}
                      </p>

                      {demande.demandeur && (
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          Demandeur : {demande.demandeur}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="max-w-[260px] break-words text-sm font-bold text-slate-800">
                        {formatMateriel(demande)}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <PrioriteBadge priorite={demande.priorite} />
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <CriticiteBadge criticite={demande.criticite} />
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <StatutBadge statut={demande.statut} />
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="text-sm font-bold text-slate-700">
                        {formatDateTime(
                          demande.dateDemande || demande.createdAt,
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          href={getDetailHref(demande)}
                          icon={<Eye size={16} />}
                          label="Voir"
                        />

                        {updateAllowed && (
                          <ActionButton
                            href={getEditHref(demande)}
                            icon={<Pencil size={16} />}
                            label="Modifier"
                          />
                        )}

                        {acceptAllowed && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => onAccept?.(demande)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Accepter"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {refuseAllowed && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => onRefuse?.(demande)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Refuser"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        {closeAllowed && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => onClose?.(demande)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Clôturer"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {deleteAllowed && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => onDelete?.(demande)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
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
    </div>
  );
}

function EmptyState({
  canCreate,
  createHref,
}: {
  canCreate: boolean;
  createHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText size={24} />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-900">
        Aucune demande trouvée
      </h3>

      <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
        Modifiez les filtres ou créez une nouvelle demande d’intervention.
      </p>

      {canCreate && (
        <Link
          href={createHref}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
        >
          Nouvelle demande
        </Link>
      )}
    </div>
  );
}

function ActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#06475a]"
      title={label}
    >
      {icon}
    </Link>
  );
}

function isAllowed(
  permission: PermissionCheck,
  demande: DemandeIntervention,
) {
  if (typeof permission === 'function') {
    return permission(demande);
  }

  return permission;
}

function StatutBadge({ statut }: { statut?: string | null }) {
  const currentStatut = normalizeDemandeStatut(statut);
  const label = formatStatut(currentStatut);

  const className =
    currentStatut === 'EN_PREPARATION'
      ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
      : currentStatut === 'ATTENTE_PRISE_EN_COMPTE'
        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
        : currentStatut === 'ATTENTE_REALISATION'
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
          : currentStatut === 'SOLDE'
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
            : currentStatut === 'REFUSE' || currentStatut === 'ANNULE'
              ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';

  return (
    <span
      className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-black ${className}`}
    >
      {label}
    </span>
  );
}

function PrioriteBadge({ priorite }: { priorite?: string | null }) {
  const className =
    priorite === 'BASSE'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
      : priorite === 'NORMALE'
        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
        : priorite === 'HAUTE'
          ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
          : priorite === 'URGENTE'
            ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';

  return (
    <span
      className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-black ${className}`}
    >
      {formatPriorite(priorite)}
    </span>
  );
}

function CriticiteBadge({ criticite }: { criticite?: string | null }) {
  const className =
    criticite === 'FAIBLE'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
      : criticite === 'MOYENNE'
        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
        : criticite === 'ELEVEE'
          ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
          : criticite === 'CRITIQUE'
            ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';

  return (
    <span
      className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-black ${className}`}
    >
      {formatCriticite(criticite)}
    </span>
  );
}

function normalizeDemandeStatut(statut?: string | null) {
  return String(statut || 'EN_PREPARATION').toUpperCase();
}

function formatStatut(statut?: string | null) {
  const value = normalizeDemandeStatut(statut);

  switch (value) {
    case 'EN_PREPARATION':
      return 'En préparation';
    case 'ATTENTE_PRISE_EN_COMPTE':
      return 'Attente prise en compte';
    case 'ATTENTE_REALISATION':
      return 'Attente réalisation';
    case 'SOLDE':
      return 'Soldée';
    case 'REFUSE':
      return 'Refusée';
    case 'ANNULE':
      return 'Annulée';
    default:
      return value.replaceAll('_', ' ').toLowerCase();
  }
}

function formatPriorite(priorite?: string | null) {
  const value = String(priorite || 'NORMALE').toUpperCase();

  switch (value) {
    case 'BASSE':
      return 'Basse';
    case 'NORMALE':
      return 'Normale';
    case 'HAUTE':
      return 'Haute';
    case 'URGENTE':
      return 'Urgente';
    default:
      return value;
  }
}

function formatCriticite(criticite?: string | null) {
  const value = String(criticite || 'MOYENNE').toUpperCase();

  switch (value) {
    case 'FAIBLE':
      return 'Faible';
    case 'MOYENNE':
      return 'Moyenne';
    case 'ELEVEE':
      return 'Élevée';
    case 'CRITIQUE':
      return 'Critique';
    default:
      return value;
  }
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getDemandeCodeLabel(code?: string | null, id?: number | null) {
  return code || `DI-${String(id || 0).padStart(6, '0')}`;
}

function formatMateriel(demande: DemandeIntervention) {
  const materiel = demande.materiel;

  if (materiel?.code && materiel?.libelle) {
    return `${materiel.code} - ${materiel.libelle}`;
  }

  return materiel?.code || materiel?.libelle || '—';
}