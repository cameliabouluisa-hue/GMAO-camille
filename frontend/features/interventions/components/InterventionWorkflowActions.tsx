import type { ReactNode } from 'react';
import {
  Archive,
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageSearch,
  Play,
  RotateCcw,
  ShieldCheck,
  StopCircle,
  XCircle,
} from 'lucide-react';

import { appPrimaryButtonClassName } from '@/components/app-section-layout';
import type { Intervention } from '../types/intervention.types';
import { EtatBadge, formatEtat } from './InterventionTable';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';
type Props = {
  intervention: Intervention;
  actionLoading?: boolean;

  onDemanderValidation: () => void;
  onValider: () => void;
  onRefuser: () => void;
  onDemarrer: () => void;
  onAttenteFourniture: () => void;
  onFournituresDisponibles: () => void;
  onTerminer: () => void;
  onAccepterTravaux: () => void;
  onRefuserTravaux: () => void;
  onReprendre: () => void;
  onSolder: () => void;
  onAnnuler: () => void;
  onArchiver: () => void;
};

export function InterventionWorkflowActions({
  intervention,
  actionLoading = false,
  onDemanderValidation,
  onValider,
  onRefuser,
  onDemarrer,
  onAttenteFourniture,
  onFournituresDisponibles,
  onTerminer,
  onAccepterTravaux,
  onRefuserTravaux,
  onReprendre,
  onSolder,
  onAnnuler,
  onArchiver,
}: Props) {
  const etat = (intervention.etat || '').toUpperCase();
const { hasPermission } = useAuth();

const canUpdateIntervention = hasPermission(Permission.INTERVENTION_UPDATE);
const canStartIntervention = hasPermission(Permission.INTERVENTION_START);
const canCompleteIntervention = hasPermission(Permission.INTERVENTION_COMPLETE);
const canCloseIntervention = hasPermission(Permission.INTERVENTION_CLOSE);
const canAskValidation =
  etat === 'EN_PREPARATION' && canUpdateIntervention;

const canValidate =
  etat === 'ATTENTE_VALIDATION' && canUpdateIntervention;

const canRefuse =
  etat === 'ATTENTE_VALIDATION' && canUpdateIntervention;

const canStart =
  ['VALIDEE', 'ATTENTE_REALISATION'].includes(etat) &&
  canStartIntervention;

const canWaitSupply =
  etat === 'VALIDEE' && canUpdateIntervention;

const canSuppliesAvailable =
  etat === 'ATTENTE_FOURNITURE' && canUpdateIntervention;

const canFinish =
  etat === 'EN_COURS' && canCompleteIntervention;

const canAcceptWorks =
  etat === 'TERMINE' && canCloseIntervention;

const canRefuseWorks =
  etat === 'TERMINE' && canCloseIntervention;

const canResume =
  etat === 'TRAVAUX_REFUSES' && canStartIntervention;

const canSettle =
  etat === 'TRAVAUX_ACCEPTES' && canCloseIntervention;

const canCancel =
  canUpdateIntervention &&
  [
    'EN_PREPARATION',
    'ATTENTE_VALIDATION',
    'VALIDEE',
    'ATTENTE_REALISATION',
    'ATTENTE_FOURNITURE',
    'EN_COURS',
  ].includes(etat);

const canArchive =
  etat === 'SOLDE' && canCloseIntervention;
  const hasActions =
    canAskValidation ||
    canValidate ||
    canRefuse ||
    canStart ||
    canWaitSupply ||
    canSuppliesAvailable ||
    canFinish ||
    canAcceptWorks ||
    canRefuseWorks ||
    canResume ||
    canSettle ||
    canCancel ||
    canArchive;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Workflow intervention
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-500">
              État actuel
            </span>

            <EtatBadge etat={etat} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canAskValidation && (
            <ActionButton
              disabled={actionLoading}
              onClick={onDemanderValidation}
              icon={<Clock3 size={18} />}
              label="Valider l’OT"
              variant="secondary"
            />
          )}

          {canValidate && (
            <ActionButton
              disabled={actionLoading}
              onClick={onValider}
              icon={<ShieldCheck size={18} />}
              label="Valider"
            />
          )}

          {canRefuse && (
            <ActionButton
              disabled={actionLoading}
              onClick={onRefuser}
              icon={<XCircle size={18} />}
              label="Refuser"
              variant="danger"
            />
          )}

          {canStart && (
            <ActionButton
              disabled={actionLoading}
              onClick={onDemarrer}
              icon={<Play size={18} />}
              label="Démarrer"
            />
          )}

          {canWaitSupply && (
            <ActionButton
              disabled={actionLoading}
              onClick={onAttenteFourniture}
              icon={<PackageSearch size={18} />}
              label="Attente fourniture"
              variant="secondary"
            />
          )}

          {canSuppliesAvailable && (
            <ActionButton
              disabled={actionLoading}
              onClick={onFournituresDisponibles}
              icon={<PackageCheck size={18} />}
              label="Fournitures disponibles"
            />
          )}

          {canFinish && (
            <ActionButton
              disabled={actionLoading}
              onClick={onTerminer}
              icon={<CheckCircle2 size={18} />}
              label="Terminer"
            />
          )}

          {canAcceptWorks && (
            <ActionButton
              disabled={actionLoading}
              onClick={onAccepterTravaux}
              icon={<ShieldCheck size={18} />}
              label="Accepter travaux"
            />
          )}

          {canRefuseWorks && (
            <ActionButton
              disabled={actionLoading}
              onClick={onRefuserTravaux}
              icon={<XCircle size={18} />}
              label="Refuser travaux"
              variant="danger"
            />
          )}

          {canResume && (
            <ActionButton
              disabled={actionLoading}
              onClick={onReprendre}
              icon={<RotateCcw size={18} />}
              label="Reprendre"
            />
          )}

          {canSettle && (
            <ActionButton
              disabled={actionLoading}
              onClick={onSolder}
              icon={<StopCircle size={18} />}
              label="Solder"
            />
          )}

          {canCancel && (
            <ActionButton
              disabled={actionLoading}
              onClick={onAnnuler}
              icon={<XCircle size={18} />}
              label="Annuler"
              variant="danger"
            />
          )}

          {canArchive && (
            <ActionButton
              disabled={actionLoading}
              onClick={onArchiver}
              icon={<Archive size={18} />}
              label="Archiver"
              variant="secondary"
            />
          )}

          {!hasActions && (
            <div className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-500">
              Lecture seule pour {formatEtat(etat)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  onClick,
  variant = 'primary',
}: {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const className =
    variant === 'primary'
      ? appPrimaryButtonClassName
      : variant === 'danger'
        ? 'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
        : 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
      {disabled ? 'Traitement...' : label}
    </button>
  );
}