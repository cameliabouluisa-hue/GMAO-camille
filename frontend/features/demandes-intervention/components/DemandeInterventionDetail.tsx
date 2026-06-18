import {
  AppFieldGrid,
  AppReadField,
  AppSection,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCcw,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import type { DemandeIntervention } from '../types/demande-intervention.types';

type Props = {
  demande: DemandeIntervention;
  actionLoading?: boolean;
  onRefresh: () => void;
  onSoumettre: () => void;
  onAccepter: () => void;
  onRefuser: () => void;
};

type InterventionLiee = {
  idIntervention: number;
  code?: string | null;
  libelle?: string | null;
  typeMaintenance?: string | null;
  etat?: string | null;
};

type AnyRecord = Record<string, unknown>;

export function DemandeInterventionDetail({
  demande,
  actionLoading = false,
  onRefresh,
  onSoumettre,
  onAccepter,
  onRefuser,
}: Props) {
  const interventionsLiees = getInterventionsLiees(demande);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 bg-[#07576b] px-7 py-6 text-white md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <FileText size={28} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-white/60">
              Demande d’intervention
            </p>

            <h1 className="mt-1 text-3xl font-black">
              {getDemandeCodeLabel(demande.code, demande.idDemande)}
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-white/80">
              {demande.description || 'Aucune description renseignée.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatutBadge statut={demande.statut} variant="header" />
              <PrioriteBadge priorite={demande.priorite} />
              <CriticiteBadge criticite={demande.criticite} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/maintenance/demandes"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white transition hover:bg-white/20"
          >
            <RefreshCcw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="space-y-6 px-7 py-6">
        <WorkflowActions
          statut={demande.statut}
          actionLoading={actionLoading}
          onSoumettre={onSoumettre}
          onAccepter={onAccepter}
          onRefuser={onRefuser}
        />

        <AppSection title="Informations générales">
          <AppFieldGrid>
            <AppReadField label="Identifiant" value={demande.idDemande} />

            <AppReadField
              label="Code"
              value={getDemandeCodeLabel(demande.code, demande.idDemande)}
            />

            <AppReadField
              label="Statut"
              value={<StatutBadge statut={demande.statut} />}
            />

            <AppReadField
              label="Date demande"
              value={formatDateTime(demande.dateDemande)}
            />

            <AppReadField label="Demandeur" value={demande.demandeur} />

            <AppReadField label="Créé par" value={demande.createdBy} />

            <AppReadField
              label="Priorité"
              value={<PrioriteBadge priorite={demande.priorite} />}
            />

            <AppReadField
              label="Criticité"
              value={<CriticiteBadge criticite={demande.criticite} />}
            />
          </AppFieldGrid>

          <AppReadField label="Description" value={demande.description} />
        </AppSection>

        <AppSection title="Matériel concerné">
          <AppFieldGrid>
            <AppReadField label="Matériel" value={formatMateriel(demande)} />

            <AppReadField label="ID matériel" value={demande.idMateriel} />

            <AppReadField
              label="Matériel en panne"
              value={<BooleanBadge value={demande.materielEnPanne} />}
            />

            <AppReadField
              label="Matériel indisponible"
              value={<BooleanBadge value={demande.materielIndisponible} />}
            />

            <AppReadField
              label="Réception travaux"
              value={<BooleanBadge value={demande.receptionTravaux} />}
            />
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Workflow de la demande">
          <AppFieldGrid>
            <AppReadField
              label="Date soumission"
              value={formatDateTime(demande.dateSoumission)}
            />

            <AppReadField
              label="Date validation"
              value={formatDateTime(demande.dateValidation)}
            />

            <AppReadField label="Validée par" value={demande.validatedBy} />

            <AppReadField label="Motif refus" value={demande.motifRefus} />
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Réception des travaux">
          <AppFieldGrid>
            <AppReadField
              label="Date réception"
              value={formatDateTime(demande.dateReceptionTravaux)}
            />

            <AppReadField label="Réception par" value={demande.receptionBy} />

            <AppReadField
              label="Motif refus travaux"
              value={demande.motifRefusTravaux}
            />
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Intervention générée">
          {interventionsLiees.length > 0 ? (
            <div className="space-y-3">
              {interventionsLiees.map((intervention) => (
                <div
                  key={intervention.idIntervention}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {intervention.code ||
                        `OT-${intervention.idIntervention}`}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {intervention.libelle || 'Intervention générée'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                      {intervention.typeMaintenance || '—'}
                    </span>

                    <span className="inline-flex rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                      {formatEtatIntervention(intervention.etat)}
                    </span>

                    <Link
                      href={`/maintenance/interventions/${intervention.idIntervention}`}
                      className={appSecondaryButtonClassName}
                    >
                      Voir OT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
              Aucune intervention n’est encore liée à cette demande.
            </div>
          )}
        </AppSection>

        <AppSection title="Historique des états">
          {demande.historiquesEtat && demande.historiquesEtat.length > 0 ? (
            <div className="space-y-3">
              {demande.historiquesEtat.map((historique, index) => (
                <div
                  key={
                    historique.idHistorique ||
                    historique.idHistoriqueEtat ||
                    historique.idHistoriqueEtatDemande ||
                    index
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {historique.action || 'Changement d’état'}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatStatut(
                          historique.ancienStatut || historique.ancienEtat,
                        )}{' '}
                        →{' '}
                        {formatStatut(
                          historique.nouveauStatut || historique.nouvelEtat,
                        )}
                      </p>

                      {historique.commentaire && (
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                          {historique.commentaire}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-slate-700">
                        {historique.changedBy || historique.createdBy || '—'}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {formatDateTime(
                          historique.dateChangement ||
                            historique.changedAt ||
                            historique.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
              Aucun historique disponible.
            </div>
          )}
        </AppSection>

        <AppSection title="Audit technique">
          <AppFieldGrid>
            <AppReadField
              label="Créé le"
              value={formatDateTime(demande.createdAt)}
            />

            <AppReadField
              label="Modifié le"
              value={formatDateTime(demande.updatedAt)}
            />
          </AppFieldGrid>
        </AppSection>
      </div>
    </div>
  );
}

function WorkflowActions({
  statut,
  actionLoading,
  onSoumettre,
  onAccepter,
  onRefuser,
}: {
  statut?: string | null;
  actionLoading: boolean;
  onSoumettre: () => void;
  onAccepter: () => void;
  onRefuser: () => void;
}) {
  const currentStatut = normalizeDemandeStatut(statut);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Actions workflow
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Les actions disponibles dépendent du statut actuel de la demande.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {currentStatut === 'EN_PREPARATION' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={onSoumettre}
              className={appPrimaryButtonClassName}
            >
              <Send size={18} />
              Soumettre
            </button>
          )}

          {currentStatut === 'ATTENTE_PRISE_EN_COMPTE' && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={onAccepter}
                className={appPrimaryButtonClassName}
              >
                <CheckCircle2 size={18} />
                Accepter
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={onRefuser}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={18} />
                Refuser
              </button>
            </>
          )}

          {currentStatut === 'ATTENTE_REALISATION' && (
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-5 text-sm font-black text-blue-700">
              <Clock3 size={18} />
              En attente de réalisation
            </div>
          )}

          {currentStatut === 'REFUSE' && (
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 text-sm font-black text-red-700">
              <XCircle size={18} />
              Demande refusée
            </div>
          )}

          {currentStatut === 'SOLDE' && (
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-5 text-sm font-black text-emerald-700">
              <ShieldCheck size={18} />
              Demande soldée
            </div>
          )}

          {currentStatut === 'ANNULE' && (
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 text-sm font-black text-slate-600">
              <XCircle size={18} />
              Demande annulée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatutBadge({
  statut,
  variant = 'default',
}: {
  statut?: string | null;
  variant?: 'default' | 'header';
}) {
  const currentStatut = normalizeDemandeStatut(statut);

  const base =
    variant === 'header'
      ? 'bg-white/15 text-white'
      : currentStatut === 'EN_PREPARATION'
        ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
        : currentStatut === 'ATTENTE_PRISE_EN_COMPTE'
          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
          : currentStatut === 'ATTENTE_REALISATION'
            ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100'
            : currentStatut === 'SOLDE'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : currentStatut === 'REFUSE'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                : currentStatut === 'ANNULE'
                  ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                  : 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';

  return (
    <span
      className={`inline-flex w-fit rounded-xl px-3 py-1.5 text-xs font-black ${base}`}
    >
      {formatStatut(currentStatut)}
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
      className={`inline-flex w-fit rounded-xl px-3 py-1.5 text-xs font-black ${className}`}
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
      className={`inline-flex w-fit rounded-xl px-3 py-1.5 text-xs font-black ${className}`}
    >
      {formatCriticite(criticite)}
    </span>
  );
}

function BooleanBadge({ value }: { value?: boolean | null }) {
  return (
    <span
      className={`inline-flex w-fit rounded-xl px-3 py-1.5 text-xs font-black ${
        value
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
      }`}
    >
      {value ? 'Oui' : 'Non'}
    </span>
  );
}

function normalizeDemandeStatut(statut?: string | null) {
  if (
    statut === 'TERMINE' ||
    statut === 'TRAVAUX_ACCEPTES' ||
    statut === 'TRAVAUX_REFUSES'
  ) {
    return 'ATTENTE_REALISATION';
  }

  return statut || '';
}

function formatStatut(statut?: string | null) {
  const currentStatut = normalizeDemandeStatut(statut);

  const labels: Record<string, string> = {
    EN_PREPARATION: 'En préparation',
    ATTENTE_PRISE_EN_COMPTE: 'Attente prise en compte',
    ATTENTE_REALISATION: 'Attente réalisation',
    REFUSE: 'Refusé',
    SOLDE: 'Soldé',
    ANNULE: 'Annulé',
  };

  if (!currentStatut) return '—';
  if (labels[currentStatut]) return labels[currentStatut];

  switch (currentStatut) {
    case 'SOUMISE':
      return 'Soumise';
    case 'ACCEPTEE':
      return 'Acceptée';
    case 'VALIDEE':
      return 'Validée';
    case 'REFUSEE':
      return 'Refusée';
    case 'TRANSFORMEE':
      return 'Transformée';
    case 'ANNULEE':
      return 'Annulée';
    default:
      return currentStatut || '—';
  }
}

function formatPriorite(priorite?: string | null) {
  switch (priorite) {
    case 'BASSE':
      return 'Basse';
    case 'NORMALE':
      return 'Normale';
    case 'HAUTE':
      return 'Haute';
    case 'URGENTE':
      return 'Urgente';
    default:
      return priorite || '—';
  }
}

function formatCriticite(criticite?: string | null) {
  switch (criticite) {
    case 'FAIBLE':
      return 'Faible';
    case 'MOYENNE':
      return 'Moyenne';
    case 'ELEVEE':
      return 'Élevée';
    case 'CRITIQUE':
      return 'Critique';
    default:
      return criticite || '—';
  }
}

function formatEtatIntervention(etat?: string | null) {
  const labels: Record<string, string> = {
    EN_PREPARATION: 'En préparation',
    ATTENTE_VALIDATION: 'Attente validation',
    VALIDEE: 'Validée',
    ATTENTE_FOURNITURE: 'Attente fourniture',
    ATTENTE_REALISATION: 'Attente réalisation',
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    TRAVAUX_REFUSES: 'Travaux refusés',
    TRAVAUX_ACCEPTES: 'Travaux acceptés',
    SOLDE: 'Soldé',
    ARCHIVE: 'Archivé',
    ANNULE: 'Annulé',
  };

  if (!etat) return '—';

  return labels[etat] || etat;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatMateriel(demande: DemandeIntervention) {
  if (!demande.materiel) {
    return demande.idMateriel ? `Matériel #${demande.idMateriel}` : '—';
  }

  const code = demande.materiel.code;
  const libelle = demande.materiel.libelle;

  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (libelle) return libelle;

  return demande.idMateriel ? `Matériel #${demande.idMateriel}` : '—';
}

function getDemandeCodeLabel(code?: string | null, idDemande?: number) {
  if (code) return code;
  if (idDemande) return `DI-${String(idDemande).padStart(4, '0')}`;
  return 'DI';
}

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getString(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getNumber(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function mapInterventionLiee(record: AnyRecord): InterventionLiee | null {
  const idIntervention = getNumber(record, ['idIntervention', 'id']);

  if (!idIntervention) return null;

  return {
    idIntervention,
    code: getString(record, ['code', 'numero']),
    libelle: getString(record, ['libelle', 'titre', 'description']),
    typeMaintenance: getString(record, ['typeMaintenance']),
    etat: getString(record, ['etat', 'statut']),
  };
}

function getInterventionsLiees(demande: DemandeIntervention) {
  const record = demande as unknown as AnyRecord;

  const relationCandidates = [
    record.intervention,
    record.interventions,
    record.interventionLiee,
    record.interventionsLiees,
    record.intervention_liee,
  ];

  for (const candidate of relationCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter(isRecord)
        .map(mapInterventionLiee)
        .filter((item): item is InterventionLiee => Boolean(item));
    }

    if (isRecord(candidate)) {
      const mapped = mapInterventionLiee(candidate);

      return mapped ? [mapped] : [];
    }
  }

  const idIntervention = getNumber(record, [
    'idIntervention',
    'idInterventionLiee',
  ]);

  if (!idIntervention) {
    return [];
  }

  return [
    {
      idIntervention,
      code: undefined,
      libelle: undefined,
      typeMaintenance: undefined,
      etat: undefined,
    },
  ];
}