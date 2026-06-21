import Link from 'next/link';
import type { ReactNode } from 'react';
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react';

import type { Intervention } from '../types/intervention.types';

type Props = {
  interventions: Intervention[];
  total: number;
  loading?: boolean;
  actionLoadingId?: number | null;
  onDelete?: (intervention: Intervention) => void | Promise<void>;

  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;

  canViewAll?: boolean;
  canViewAssigned?: boolean;
};

export function InterventionTable({
  interventions,
  total,
  loading = false,
  actionLoadingId = null,
  onDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Liste des interventions
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {interventions.length} intervention(s) affichee(s) sur {total}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500">
          Chargement des interventions...
        </div>
      ) : interventions.length === 0 ? (
        <EmptyState canCreate={canCreate} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Libelle</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Etat</th>
                <th className="px-5 py-4">Priorite</th>
                <th className="px-5 py-4">Materiel</th>
                <th className="px-5 py-4">Equipe</th>
                <th className="px-5 py-4">Debut prevu</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {interventions.map((intervention) => {
                const isActionLoading =
                  actionLoadingId === intervention.idIntervention;

                return (
                  <tr
                    key={intervention.idIntervention}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 align-middle">
                      <Link
                        href={`/maintenance/interventions/${intervention.idIntervention}`}
                        className="text-sm font-black text-slate-950 hover:text-[#06475a]"
                      >
                        {getInterventionCodeLabel(intervention)}
                      </Link>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="max-w-[320px] break-words text-sm font-bold leading-6 text-slate-800">
                        {intervention.libelle ||
                          intervention.description ||
                          '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <Badge tone="info">
                        {formatType(intervention.typeMaintenance)}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <EtatBadge etat={intervention.etat} />
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <Badge tone={getPriorityTone(intervention.priorite)}>
                        {intervention.priorite || 'NORMALE'}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="max-w-[240px] break-words text-sm font-bold text-slate-800">
                        {formatMateriel(intervention)}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="text-sm font-bold text-slate-700">
                        {intervention.equipe_maintenance?.libelle ||
                          intervention.idEquipe ||
                          '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="text-sm font-bold text-slate-700">
                        {formatDateTime(intervention.dateDebutPrevue)}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                       <ActionButton
  href={`/maintenance/interventions/${intervention.idIntervention}`}
  icon={<Eye size={16} />}
  label="Voir"
/>

{canUpdate && (
  <ActionButton
    href={`/maintenance/interventions/${intervention.idIntervention}/modifier`}
    icon={<Pencil size={16} />}
    label="Modifier"
  />
)}

{canDelete && onDelete && (
  <button
    type="button"
    disabled={isActionLoading}
    onClick={() => onDelete(intervention)}
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

export function EtatBadge({ etat }: { etat?: string | null }) {
  const tone =
    etat === 'EN_COURS'
      ? 'info'
      : etat === 'TERMINE' ||
          etat === 'TRAVAUX_ACCEPTES' ||
          etat === 'SOLDE' ||
          etat === 'ARCHIVE'
        ? 'success'
        : etat === 'ANNULE' || etat === 'TRAVAUX_REFUSES'
          ? 'danger'
        : etat === 'ATTENTE_VALIDATION' ||
              etat === 'VALIDEE' ||
              etat === 'ATTENTE_REALISATION' ||
              etat === 'ATTENTE_FOURNITURE'
            ? 'warning'
            : 'neutral';

  return <Badge tone={tone}>{formatEtat(etat)}</Badge>;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    warning: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  };

  return (
    <span
      className={`inline-flex w-fit rounded-xl px-3 py-1.5 text-xs font-black ${tones[tone]}`}
    >
      {children}
    </span>
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
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#06475a]"
    >
      {icon}
    </Link>
  );
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText size={24} />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-900">
        Aucune intervention trouvée
      </h3>

      <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
        Modifiez les filtres ou consultez les interventions disponibles.
      </p>

      {canCreate && (
        <Link
          href="/maintenance/interventions/nouveau"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#06475a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#043747]"
        >
          Nouvelle intervention
        </Link>
      )}
    </div>
  );
}

export function formatEtat(etat?: string | null) {
  const labels: Record<string, string> = {
    EN_PREPARATION: 'En preparation',
    ATTENTE_DEVIS: 'Attente devis',
    ATTENTE_VALIDATION: 'Attente validation',
    ATTENTE_FOURNITURE: 'Attente fourniture',
    ATTENTE_REALISATION: 'Attente realisation',
    VALIDEE: 'Validee',
    EN_COURS: 'En cours',
    TERMINE: 'Termine',
    TRAVAUX_ACCEPTES: 'Travaux acceptes',
    TRAVAUX_REFUSES: 'Travaux refuses',
    SOLDE: 'Solde',
    ARCHIVE: 'Archive',
    ANNULE: 'Annule',
  };

  return etat ? labels[etat] ?? etat : '-';
}

export function formatType(type?: string | null) {
  const labels: Record<string, string> = {
    CORRECTIF: 'Correctif',
    PREVENTIF: 'Preventif',
    CONDITIONNEL: 'Conditionnel',
  };

  return type ? labels[type] ?? type : '-';
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(number);
}

function getPriorityTone(priority?: string | null) {
  if (priority === 'URGENTE') return 'danger';
  if (priority === 'HAUTE') return 'warning';
  if (priority === 'BASSE') return 'success';
  return 'info';
}

function formatMateriel(intervention: Intervention) {
  if (intervention.materiel?.code && intervention.materiel?.libelle) {
    return `${intervention.materiel.code} - ${intervention.materiel.libelle}`;
  }
  return (
    intervention.materiel?.code ||
    intervention.materiel?.libelle ||
    (intervention.idMateriel ? `Materiel #${intervention.idMateriel}` : '-')
  );
}

function getInterventionCodeLabel(intervention: Intervention) {
  return (
    intervention.code ||
    `OT-${String(intervention.idIntervention).padStart(6, '0')}`
  );
}
