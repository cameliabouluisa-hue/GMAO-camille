import type { ReactNode } from 'react';
import {
  Archive,
  CheckCircle2,
  Clock3,
  Loader2,
  PackageCheck,
  PackageSearch,
  Play,
  RotateCcw,
  ShieldCheck,
  
  XCircle,
} from 'lucide-react';

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
    <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e6f7fb] text-[#07566b]">
              <ShieldCheck size={18} />
            </span>

            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
              Workflow intervention
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-500">
              État actuel
            </span>

            <EtatBadge etat={etat} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          {canAskValidation && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onDemanderValidation}
              icon={<Clock3 size={18} />}
              label="Valider l’OT"
              variant="secondary"
            />
          )}

          {canValidate && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onValider}
              icon={<ShieldCheck size={18} />}
              label="Valider"
              variant="success"
            />
          )}

          {canRefuse && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onRefuser}
              icon={<XCircle size={18} />}
              label="Refuser"
              variant="danger"
            />
          )}

          {canStart && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onDemarrer}
              icon={<Play size={18} />}
              label="Démarrer"
              variant="primary"
            />
          )}

          {canWaitSupply && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onAttenteFourniture}
              icon={<PackageSearch size={18} />}
              label="Attente fourniture"
              variant="secondary"
            />
          )}

          {canSuppliesAvailable && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onFournituresDisponibles}
              icon={<PackageCheck size={18} />}
              label="Fournitures disponibles"
              variant="success"
            />
          )}

          {canFinish && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onTerminer}
              icon={<CheckCircle2 size={18} />}
              label="Terminer"
              variant="success"
            />
          )}

          {canAcceptWorks && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onAccepterTravaux}
              icon={<ShieldCheck size={18} />}
              label="Accepter travaux"
              variant="success"
            />
          )}

          {canRefuseWorks && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onRefuserTravaux}
              icon={<XCircle size={18} />}
              label="Refuser travaux"
              variant="danger"
            />
          )}

          {canResume && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onReprendre}
              icon={<RotateCcw size={18} />}
              label="Reprendre"
              variant="primary"
            />
          )}

          {canSettle && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onSolder}
              label="Solder"
              variant="success"
            />
          )}

          {canCancel && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onAnnuler}
              icon={<XCircle size={18} />}
              label="Annuler"
              variant="danger"
            />
          )}

          {canArchive && (
            <ActionButton
              disabled={actionLoading}
              loading={actionLoading}
              onClick={onArchiver}
              icon={<Archive size={18} />}
              label="Archiver"
              variant="secondary"
            />
          )}

          {!hasActions && (
            <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-500 shadow-sm">
              Lecture seule pour {formatEtat(etat)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ActionButtonProps = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
};

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
}: ActionButtonProps) {
  const variantClass =
    variant === 'danger'
      ? 'border-red-600 bg-red-600 text-white shadow-[0_14px_30px_rgba(220,38,38,0.24)] hover:bg-red-700 hover:border-red-700'
      : variant === 'success'
        ? 'border-emerald-600 bg-emerald-600 text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-700 hover:border-emerald-700'
        : variant === 'secondary'
          ? 'border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-[#b8dbe4] hover:bg-[#f8fcfd] hover:text-[#07566b]'
          : 'border-[#07566b] bg-[#07566b] text-white shadow-[0_14px_30px_rgba(7,86,107,0.22)] hover:bg-[#06485a] hover:border-[#06485a]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-6 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variantClass}`}
    >
      <span className="flex h-6 w-6 items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      </span>

      <span>{label}</span>
    </button>
  );
}