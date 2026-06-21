

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Clock3,
  FileText,
  History,
  Package,
  RefreshCcw,
  Save,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types/auth';
import { Select } from '@/components/select';
import {
  AppFieldGrid,
  AppFormField,
  AppReadField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
  appTextareaClassName,
} from '@/components/app-section-layout';

import {
  getApiErrorMessage,
  getInterventionReferenceData,
} from '../services/intervention.service';

import type {
  AffecterEquipeDto,
  AffecterTechnicienDto,
  CreateConsommationInterventionDto,
  CreateOccupationInterventionDto,
  CreateOperationInterventionDto,
  Intervention,
  InterventionReferenceData,
  RefuserTravauxDto,
  UpsertCompteRenduInterventionDto,
} from '../types/intervention.types';

import {
  Badge,
  EtatBadge,
  formatDateTime,
  formatEtat,
  formatNumber,
  formatType,
} from './InterventionTable';

import { InterventionWorkflowActions } from './InterventionWorkflowActions';
import { OperationsSection } from './OperationsSection';
import { OccupationSection } from './OccupationSection';
import { ConsommationSection } from './ConsommationSection';

type Props = {
  intervention: Intervention;
  actionLoading?: boolean;
  onRefresh: () => void;
  onDemanderValidation: () => void;
  onValider: () => void;
  onRefuser: () => void;
  onDemarrer: () => void;
  onAttenteFourniture: () => void;
  onTerminer: () => void;
  onAccepterTravaux: () => void;
  onRefuserTravaux: (data: RefuserTravauxDto) => void;
  onReprendre: () => void;
  onSolder: () => void;
  onAnnuler: () => void;
  onArchiver: () => void;
  onAffecterEquipe: (data: AffecterEquipeDto) => void | Promise<void>;
  onAffecterTechnicien: (data: AffecterTechnicienDto) => void | Promise<void>;
  onCreateOccupation: (data: CreateOccupationInterventionDto) => void;
  onDeleteOccupation: (idOccupation: number) => void;
  onSaveCompteRendu: (data: UpsertCompteRenduInterventionDto) => void;
  onCreateConsommation: (data: CreateConsommationInterventionDto) => void;
  onCancelConsommation: (idConsommation: number) => void;
  onCreateOperation: (
    data: CreateOperationInterventionDto,
  ) => void | Promise<void>;
  onDeleteOperation: (idOperation: number) => void | Promise<void>;
  onFournituresDisponibles: () => void;
  onDeleteAffectationTechnicien: (
    idAffectation: number,
  ) => void | Promise<void>;
};

type DetailTabId =
  | 'general'
  | 'affectations'
  | 'operations'
  | 'consommations'
  | 'occupations'
  | 'compteRendu'
  | 'historique';

type SelectItem = {
  label: string;
  value: string;
};

const EMPTY_SELECT_VALUE = '__EMPTY_VALUE__';

export function InterventionDetail({
  intervention,
  actionLoading = false,
  onRefresh,
  onDemanderValidation,
  onValider,
  onRefuser,
  onDemarrer,
  onAttenteFourniture,
  onTerminer,
  onAccepterTravaux,
  onRefuserTravaux,
  onReprendre,
  onSolder,
  onAnnuler,
  onArchiver,
  onAffecterEquipe,
  onAffecterTechnicien,
  onCreateOccupation,
  onDeleteOccupation,
  onSaveCompteRendu,
  onCreateConsommation,
  onCancelConsommation,
  onCreateOperation,
  onDeleteOperation,
  onDeleteAffectationTechnicien,
  onFournituresDisponibles,
}: Props) {
 const [activeTab, setActiveTab] = useState<DetailTabId>('general');

const { hasPermission } = useAuth();

const canModify = intervention.etat === 'EN_PREPARATION';

const canUpdateIntervention = hasPermission(Permission.INTERVENTION_UPDATE);
const canAssignIntervention = hasPermission(Permission.INTERVENTION_UPDATE);
const canManageExecution =
  hasPermission(Permission.INTERVENTION_START) ||
  hasPermission(Permission.INTERVENTION_COMPLETE);

const canManageClose = hasPermission(Permission.INTERVENTION_CLOSE);
  const tabs = useMemo(
    () => [
      {
        id: 'general' as const,
        label: 'Général',
        icon: <ClipboardList size={18} />,
      },
      {
        id: 'affectations' as const,
        label: 'Affectations',
        icon: <Users size={18} />,
      },
      {
        id: 'operations' as const,
        label: 'Opérations',
        icon: <Wrench size={18} />,
      },
      {
        id: 'consommations' as const,
        label: 'Consommations',
        icon: <Package size={18} />,
      },
      {
        id: 'occupations' as const,
        label: 'Occupations',
        icon: <Clock3 size={18} />,
      },
      {
        id: 'compteRendu' as const,
        label: 'Compte rendu',
        icon: <FileText size={18} />,
      },
      {
        id: 'historique' as const,
        label: 'Historique',
        icon: <History size={18} />,
      },
    ],
    [],
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 bg-[#06475a] px-7 py-7 text-white md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-100">
            Intervention
          </p>

          <h1 className="mt-2 break-words text-3xl font-black leading-tight text-white md:text-4xl">
            {intervention.code ||
              `OT-${String(intervention.idIntervention).padStart(6, '0')}`}
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-cyan-50/90">
            {intervention.libelle ||
              intervention.description ||
              'Aucun libellé renseigné.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex w-fit rounded-xl bg-white/15 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/10">
              {formatType(intervention.typeMaintenance)}
            </span>

            <span className="inline-flex w-fit rounded-xl bg-white/15 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/10">
              {formatEtat(intervention.etat)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/maintenance/interventions"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <button
            type="button"
            onClick={onRefresh}
            disabled={actionLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={18} />
            Actualiser
          </button>

         {canModify && canUpdateIntervention && (
  <Link
    href={`/maintenance/interventions/${intervention.idIntervention}/modifier`}
    className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50"
  >
    Modifier
  </Link>
)}
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-7 py-6">
        <InterventionWorkflowActions
          intervention={intervention}
          actionLoading={actionLoading}
          onDemanderValidation={onDemanderValidation}
          onValider={onValider}
          onRefuser={onRefuser}
          onDemarrer={onDemarrer}
          onAttenteFourniture={onAttenteFourniture}
          onTerminer={onTerminer}
          onAccepterTravaux={onAccepterTravaux}
          onRefuserTravaux={() =>
            onRefuserTravaux({
              utilisateur: 'Admin',
              motifRefusTravaux: 'Travaux refuses',
            })
          }
          onReprendre={onReprendre}
          onSolder={onSolder}
          onAnnuler={onAnnuler}
          onArchiver={onArchiver}
          onFournituresDisponibles={onFournituresDisponibles}
        />

        {activeTab === 'general' && <GeneralSection intervention={intervention} />}

        {activeTab === 'affectations' && (
         <AffectationSection
  intervention={intervention}
  loading={actionLoading}
  canManageAffectations={canAssignIntervention}
  onAffecterEquipe={onAffecterEquipe}
  onAffecterTechnicien={onAffecterTechnicien}
  onDeleteAffectationTechnicien={onDeleteAffectationTechnicien}
/>
        )}

        {activeTab === 'operations' && (
          <ListSkin>
            <OperationsSection
  interventionEtat={intervention.etat}
  operations={intervention.operation_intervention}
  loading={actionLoading}
  canManageOperations={canUpdateIntervention}
  onCreate={onCreateOperation}
  onDelete={onDeleteOperation}
/>
          </ListSkin>
        )}

        {activeTab === 'consommations' && (
          <ListSkin>
            <ConsommationSection
              interventionEtat={intervention.etat}
              consommations={intervention.consommations}
              loading={actionLoading}
              onCreate={onCreateConsommation}
              onCancel={onCancelConsommation}
            />
          </ListSkin>
        )}

        {activeTab === 'occupations' && (
          <ListSkin>
            <OccupationSection
              interventionEtat={intervention.etat}
              occupations={intervention.occupations}
              affectations={intervention.affectation_technicien}
              operations={intervention.operation_intervention}
              loading={actionLoading}
              onCreate={onCreateOccupation}
              onDelete={onDeleteOccupation}
            />
          </ListSkin>
        )}

        {activeTab === 'compteRendu' && (
          <CompteRenduTab
            interventionEtat={intervention.etat}
            compteRendu={intervention.compteRendu}
            loading={actionLoading}
            onSave={onSaveCompteRendu}
          />
        )}

        {activeTab === 'historique' && (
          <HistorySection intervention={intervention} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition ${
        active
          ? 'border border-slate-200 bg-white text-[#06475a] shadow-sm'
          : 'text-slate-500 hover:bg-white/70 hover:text-[#06475a]'
      }`}
    >
      <span className={active ? 'text-[#06475a]' : 'text-slate-500'}>
        {icon}
      </span>

      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function ListSkin({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        min-w-0
        [&_table]:w-full
        [&_table]:min-w-[950px]
        [&_table]:border-collapse
        [&_thead_tr]:!bg-[#06475a]
        [&_thead_th]:!px-5
        [&_thead_th]:!py-4
        [&_thead_th]:!align-middle
        [&_thead_th]:!text-sm
        [&_thead_th]:!font-black
        [&_thead_th]:!normal-case
        [&_thead_th]:!tracking-normal
        [&_thead_th]:!text-white
        [&_thead_th:first-child]:!rounded-tl-2xl
        [&_thead_th:last-child]:!rounded-tr-2xl
        [&_tbody_td]:!px-5
        [&_tbody_td]:!py-4
        [&_tbody_td]:!align-middle
        [&_tbody_tr]:!border-b
        [&_tbody_tr]:!border-slate-100
        [&_tbody_tr:last-child]:!border-b-0
      "
    >
      {children}
    </div>
  );
}

function GeneralSection({ intervention }: { intervention: Intervention }) {
  return (
    <AppSection title="Informations générales">
      <AppFieldGrid>
        <AppReadField label="Identifiant" value={intervention.idIntervention} />
        <AppReadField label="Code" value={intervention.code} />

        <AppReadField
          label="État"
          value={<EtatBadge etat={intervention.etat} />}
        />

        <AppReadField
          label="Type maintenance"
          value={formatType(intervention.typeMaintenance)}
        />

        <AppReadField
          label="Type intervention"
          value={intervention.typeIntervention}
        />

        <AppReadField label="Nature" value={intervention.natureIntervention} />

        <AppReadField
          label="Priorité"
          value={<Badge tone="info">{intervention.priorite || 'NORMALE'}</Badge>}
        />

        <AppReadField
          label="Criticité"
          value={intervention.criticite || 'MOYENNE'}
        />

        <AppReadField label="Matériel" value={formatMateriel(intervention)} />

        <AppReadField
          label="Équipe"
          value={
            intervention.equipe_maintenance
              ? formatCodeLibelle(
                  intervention.equipe_maintenance.code,
                  intervention.equipe_maintenance.libelle,
                  intervention.equipe_maintenance.idEquipe,
                )
              : intervention.idEquipe
          }
        />

        <AppReadField
          label="Demande liée"
          value={intervention.demande_intervention?.code || intervention.idDemande}
        />

        <AppReadField
          label="Gamme"
          value={intervention.gamme?.libelle || intervention.idGamme}
        />

        <AppReadField
          label="Début prévu"
          value={formatDateTime(intervention.dateDebutPrevue)}
        />

        <AppReadField
          label="Fin prévue"
          value={formatDateTime(intervention.dateFinPrevue)}
        />

        <AppReadField
          label="Début réel"
          value={formatDateTime(intervention.dateDebutReelle)}
        />

        <AppReadField
          label="Fin réelle"
          value={formatDateTime(intervention.dateFinReelle)}
        />

        <AppReadField
          label="Charge prévue"
          value={formatNumber(intervention.chargePrevue)}
        />

        <AppReadField
          label="Charge réelle"
          value={formatNumber(intervention.chargeReelle)}
        />

        <AppReadField
          label="Coût pièces réel"
          value={formatNumber(intervention.coutPiecesReel)}
        />

        <AppReadField
          label="Coût total réel"
          value={formatNumber(intervention.coutTotalReel)}
        />
      </AppFieldGrid>

      <AppReadField label="Description" value={intervention.description} />

      <AppReadField
        label="Diagnostic initial"
        value={intervention.diagnosticInitial}
      />

      <AppReadField label="Instructions" value={intervention.instructions} />
    </AppSection>
  );
}

function AffectationSection({
  intervention,
  loading,
  canManageAffectations,
  onAffecterEquipe,
  onAffecterTechnicien,
  onDeleteAffectationTechnicien,
}: {
  intervention: Intervention;
  loading: boolean;
  canManageAffectations: boolean;
  onAffecterEquipe: (data: AffecterEquipeDto) => void | Promise<void>;
  onAffecterTechnicien: (data: AffecterTechnicienDto) => void | Promise<void>;
  onDeleteAffectationTechnicien: (
    idAffectation: number,
  ) => void | Promise<void>;
}) {
  const [idEquipe, setIdEquipe] = useState(
    intervention.idEquipe ? String(intervention.idEquipe) : '',
  );
  const [idTechnicien, setIdTechnicien] = useState('');
  const [tempsTravail, setTempsTravail] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    tone?: 'danger' | 'warning';
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [references, setReferences] = useState<InterventionReferenceData>({
    materiels: [],
    pointsStructure: [],
    demandes: [],
    plansPreventifs: [],
    declencheurs: [],
    gammes: [],
    equipes: [],
    techniciens: [],
    articles: [],
    magasins: [],
  });

  const [referenceError, setReferenceError] = useState('');

  useEffect(() => {
    setIdEquipe(intervention.idEquipe ? String(intervention.idEquipe) : '');
  }, [intervention.idEquipe]);

  useEffect(() => {
    let mounted = true;

    getInterventionReferenceData()
      .then((data) => {
        if (mounted) {
          setReferences(data);
          setReferenceError('');
        }
      })
      .catch((error) => {
        if (mounted) {
          setReferenceError(
            getApiErrorMessage(
              error,
              'Impossible de charger les listes affectation.',
            ),
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const equipes = useMemo(() => {
    const map = new Map<number, InterventionReferenceData['equipes'][number]>();

    references.equipes.forEach((item) => {
      map.set(item.idEquipe, item);
    });

    if (intervention.equipe_maintenance?.idEquipe) {
      map.set(
        intervention.equipe_maintenance.idEquipe,
        intervention.equipe_maintenance,
      );
    }

    return Array.from(map.values());
  }, [intervention.equipe_maintenance, references.equipes]);

  const techniciens = useMemo(() => {
    const map = new Map<
      number,
      InterventionReferenceData['techniciens'][number]
    >();

    references.techniciens.forEach((item) => {
      map.set(item.idTechnicien, item);
    });

    intervention.affectation_technicien?.forEach((affectation) => {
      if (affectation.technicien?.idTechnicien) {
        map.set(affectation.technicien.idTechnicien, affectation.technicien);
      }
    });

    return Array.from(map.values());
  }, [intervention.affectation_technicien, references.techniciens]);

  const selectedEquipeNumber = Number(idEquipe || intervention.idEquipe || 0);

  const techniciensDeLEquipe = useMemo(() => {
    if (!selectedEquipeNumber) return [];

    return techniciens.filter((technicien) => {
      const technicienAvecEquipe = technicien as typeof technicien & {
        idEquipe?: number | string | null;
      };

      return Number(technicienAvecEquipe.idEquipe || 0) === selectedEquipeNumber;
    });
  }, [techniciens, selectedEquipeNumber]);

  useEffect(() => {
    if (!idTechnicien) return;

    const technicienExisteDansEquipe = techniciensDeLEquipe.some(
      (technicien) => String(technicien.idTechnicien) === String(idTechnicien),
    );

    if (!technicienExisteDansEquipe) {
      setIdTechnicien('');
    }
  }, [idTechnicien, techniciensDeLEquipe]);

  const etat = (intervention.etat || '').toUpperCase();

 const canAffecter =
  canManageAffectations &&
  [
    'EN_PREPARATION',
    'ATTENTE_VALIDATION',
    'VALIDEE',
    'ATTENTE_REALISATION',
    'ATTENTE_FOURNITURE',
  ].includes(etat);

  const equipeDejaAffectee =
    Boolean(idEquipe) && String(idEquipe) === String(intervention.idEquipe || '');

  const equipeOptions = useMemo<SelectItem[]>(() => {
    const missingCurrentEquipe =
      intervention.idEquipe &&
      !equipes.some(
        (equipe) => String(equipe.idEquipe) === String(intervention.idEquipe),
      );

    return [
      ...(missingCurrentEquipe
        ? [
            {
              value: String(intervention.idEquipe),
              label: `Équipe actuelle #${intervention.idEquipe}`,
            },
          ]
        : []),
      ...equipes.map((equipe) => ({
        value: String(equipe.idEquipe),
        label: formatCodeLibelle(equipe.code, equipe.libelle, equipe.idEquipe),
      })),
    ];
  }, [equipes, intervention.idEquipe]);

  const technicienOptions = useMemo<SelectItem[]>(
    () =>
      techniciensDeLEquipe.map((technicien) => ({
        value: String(technicien.idTechnicien),
        label: formatTechnicien(technicien),
      })),
    [techniciensDeLEquipe],
  );

  async function executeAffecterEquipe(id: number) {
    try {
      setActionError('');

      await onAffecterEquipe({
        idEquipe: id,
        assignedBy: 'Admin',
      });

      setIdTechnicien('');
      setTempsTravail('');
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Impossible d'affecter l'équipe."),
      );
    }
  }

  async function handleAffecterEquipe() {
    const id = Number(idEquipe);

    if (!id || Number.isNaN(id)) return;

    const equipeChangee =
      Boolean(intervention.idEquipe) &&
      String(intervention.idEquipe) !== String(id);

    const hasTechniciens = Boolean(intervention.affectation_technicien?.length);

    if (equipeChangee && hasTechniciens) {
      setConfirmDialog({
        title: "Changer l'équipe affectée",
        message:
          "Changer l'équipe va supprimer tous les techniciens déjà affectés à cette intervention. Voulez-vous continuer ?",
        confirmLabel: "Changer l'équipe",
        tone: 'warning',
        onConfirm: () => executeAffecterEquipe(id),
      });
      return;
    }

    await executeAffecterEquipe(id);
  }

  async function handleAffecterTechnicien() {
    const id = Number(idTechnicien);

    if (!id || Number.isNaN(id)) return;

    const temps = tempsTravail.trim() ? Number(tempsTravail) : undefined;

    const tempsTravailNumber =
      temps !== undefined && Number.isFinite(temps) ? temps : undefined;

    try {
      setActionError('');

      await onAffecterTechnicien({
        idTechnicien: id,
        tempsTravail: tempsTravailNumber,
        affectePar: 'Admin',
      });

      setIdTechnicien('');
      setTempsTravail('');
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Impossible d'affecter le technicien."),
      );
    }
  }

  async function executeDeleteAffectation(idAffectation: number) {
    try {
      setActionError('');

      await onDeleteAffectationTechnicien(idAffectation);
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Impossible de supprimer l'affectation technicien.",
        ),
      );
    }
  }

  async function handleDeleteAffectation(idAffectation: number) {
    setConfirmDialog({
      title: 'Supprimer le technicien',
      message: 'Voulez-vous supprimer ce technicien de cette intervention ?',
      confirmLabel: 'Supprimer',
      tone: 'danger',
      onConfirm: () => executeDeleteAffectation(idAffectation),
    });
  }

  const equipeAffecteeLabel = intervention.equipe_maintenance
    ? formatCodeLibelle(
        intervention.equipe_maintenance.code,
        intervention.equipe_maintenance.libelle,
        intervention.equipe_maintenance.idEquipe,
      )
    : intervention.idEquipe
      ? `Équipe #${intervention.idEquipe}`
      : 'Aucune équipe affectée';

  return (
    <AppSection title="Affectations">
      {referenceError && (
        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {referenceError}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {actionError}
        </div>
      )}

      {canAffecter ? (
        <div className="mb-5 grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_170px_minmax(0,1fr)_140px_130px]">
          <SelectControl
            value={idEquipe}
            onChange={(value) => {
              setIdEquipe(value);
              setIdTechnicien('');
            }}
            clearLabel="Sélectionner une équipe"
            placeholder="Sélectionner une équipe"
            items={equipeOptions}
            disabled={loading}
          />

          <button
            type="button"
            disabled={loading || !idEquipe || equipeDejaAffectee}
            onClick={handleAffecterEquipe}
            className={`${appSecondaryButtonClassName} min-w-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Users size={17} />
            <span className="truncate">
              {equipeDejaAffectee ? 'Équipe affectée' : 'Affecter équipe'}
            </span>
          </button>

          <SelectControl
            value={idTechnicien}
            onChange={setIdTechnicien}
            clearLabel={
              selectedEquipeNumber
                ? 'Sélectionner un technicien'
                : 'Sélectionner une équipe d’abord'
            }
            placeholder="Sélectionner un technicien"
            items={technicienOptions}
            disabled={loading || !selectedEquipeNumber}
          />

          <input
            type="number"
            min="0"
            step="0.5"
            value={tempsTravail}
            onChange={(event) => setTempsTravail(event.target.value)}
            disabled={loading || !selectedEquipeNumber}
            className={`${appInputClassName} min-w-0`}
            placeholder="Temps"
          />

          <button
            type="button"
            disabled={loading || !idTechnicien}
            onClick={handleAffecterTechnicien}
            className={`${appPrimaryButtonClassName} min-w-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <UserPlus size={17} />
            Affecter
          </button>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
          <p>
            Les affectations sont verrouillées dès que l’OT est en cours. Les
            temps réels doivent être saisis dans la section Occupations.
          </p>

          <p className="mt-3 text-slate-700">
            Équipe affectée :{' '}
            <span className="font-black text-slate-950">
              {equipeAffecteeLabel}
            </span>
          </p>
        </div>
      )}

      {canAffecter && selectedEquipeNumber && techniciensDeLEquipe.length === 0 && (
        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          Aucun technicien trouvé pour cette équipe.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#06475a] text-sm font-black text-white">
                <th className="px-5 py-4 align-middle">Technicien</th>
                <th className="px-5 py-4 align-middle">Matricule</th>
                <th className="px-5 py-4 align-middle">Rôle</th>
                <th className="px-5 py-4 align-middle">Temps</th>
                <th className="px-5 py-4 align-middle">Affecté par</th>

                {canAffecter && (
                  <th className="px-5 py-4 text-right align-middle">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {intervention.affectation_technicien?.length ? (
                intervention.affectation_technicien.map((affectation) => (
                  <tr key={affectation.idAffectation} className="text-sm">
                    <td className="max-w-[260px] px-5 py-4 align-middle font-black text-slate-950">
                      <span className="block truncate">
                        {affectation.technicien?.nom ||
                          affectation.idTechnicien ||
                          '-'}
                      </span>
                    </td>

                    <td className="max-w-[160px] px-5 py-4 align-middle font-bold text-slate-700">
                      <span className="block truncate">
                        {affectation.technicien?.matricule || '-'}
                      </span>
                    </td>

                    <td className="max-w-[180px] px-5 py-4 align-middle font-bold text-slate-700">
                      <span className="block truncate">
                        {affectation.technicien?.roleEquipe || '-'}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-700">
                      {affectation.tempsTravail ?? '-'}
                    </td>

                    <td className="max-w-[180px] px-5 py-4 align-middle font-bold text-slate-700">
                      <span className="block truncate">
                        {affectation.affectePar || '-'}
                      </span>
                    </td>

                    {canAffecter && (
                      <td className="px-5 py-4 text-right align-middle">
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAffectation(affectation.idAffectation)
                          }
                          disabled={loading}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Supprimer le technicien"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canAffecter ? 6 : 5}
                    className="px-5 py-7 text-center text-sm font-bold text-slate-500"
                  >
                    Aucun technicien affecté.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          tone={confirmDialog.tone}
          loading={loading}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={async () => {
            await confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
        />
      )}
    </AppSection>
  );
}

function CompteRenduTab({
  interventionEtat,
  compteRendu,
  loading,
  onSave,
}: {
  interventionEtat?: string | null;
  compteRendu: Intervention['compteRendu'];
  loading: boolean;
  onSave: (data: UpsertCompteRenduInterventionDto) => void;
}) {
  const [dateCompteRendu, setDateCompteRendu] = useState(
    toDateTimeLocal(compteRendu?.dateCompteRendu),
  );
  const [saisiPar, setSaisiPar] = useState(compteRendu?.saisiPar || 'Admin');
  const [resultat, setResultat] = useState(compteRendu?.resultat || 'REPARE');
  const [dureeReelle, setDureeReelle] = useState(
    toInputValue(compteRendu?.dureeReelle),
  );
  const [tempsArret, setTempsArret] = useState(
    toInputValue(compteRendu?.tempsArret),
  );
  const [cause, setCause] = useState(compteRendu?.cause || '');
  const [remede, setRemede] = useState(compteRendu?.remede || '');
  const [diagnostic, setDiagnostic] = useState(compteRendu?.diagnostic || '');
  const [travauxEffectues, setTravauxEffectues] = useState(
    compteRendu?.travauxEffectues || '',
  );
  const [observation, setObservation] = useState(compteRendu?.observation || '');

  useEffect(() => {
    setDateCompteRendu(toDateTimeLocal(compteRendu?.dateCompteRendu));
    setSaisiPar(compteRendu?.saisiPar || 'Admin');
    setResultat(compteRendu?.resultat || 'REPARE');
    setDureeReelle(toInputValue(compteRendu?.dureeReelle));
    setTempsArret(toInputValue(compteRendu?.tempsArret));
    setCause(compteRendu?.cause || '');
    setRemede(compteRendu?.remede || '');
    setDiagnostic(compteRendu?.diagnostic || '');
    setTravauxEffectues(compteRendu?.travauxEffectues || '');
    setObservation(compteRendu?.observation || '');
  }, [compteRendu]);

  const canEdit = ['EN_COURS', 'TERMINE', 'TRAVAUX_REFUSES'].includes(
    String(interventionEtat || '').toUpperCase(),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({
      dateCompteRendu: localDateToIso(dateCompteRendu),
      saisiPar: emptyToUndefined(saisiPar),
      resultat: emptyToUndefined(resultat),
      dureeReelle: parseOptionalNumber(dureeReelle),
      tempsArret: parseOptionalNumber(tempsArret),
      cause: emptyToUndefined(cause),
      remede: emptyToUndefined(remede),
      diagnostic: emptyToUndefined(diagnostic),
      travauxEffectues: emptyToUndefined(travauxEffectues),
      observation: emptyToUndefined(observation),
    });
  }

  return (
    <AppSection title="Compte rendu">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Dernière saisie"
            value={formatDateTime(compteRendu?.dateCompteRendu)}
          />
          <SummaryCard label="Saisi par" value={compteRendu?.saisiPar || '-'} />
          <SummaryCard
            label="Durée réelle"
            value={
              compteRendu?.dureeReelle !== undefined &&
              compteRendu?.dureeReelle !== null
                ? `${compteRendu.dureeReelle} h`
                : '- h'
            }
          />
        </div>

        {!canEdit && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-500">
            Le compte rendu est modifiable uniquement lorsque l’intervention est
            en cours ou en phase de clôture.
          </div>
        )}

        <div className="grid min-w-0 gap-x-8 md:grid-cols-2">
          <AppFormField label="Date du compte rendu">
            <input
              type="datetime-local"
              value={dateCompteRendu}
              onChange={(event) => setDateCompteRendu(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
            />
          </AppFormField>

          <AppFormField label="Saisi par">
            <input
              value={saisiPar}
              onChange={(event) => setSaisiPar(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
              placeholder="Admin"
            />
          </AppFormField>

          <AppFormField label="Résultat">
            <SelectControl
              value={resultat}
              onChange={setResultat}
              placeholder="Sélectionner un résultat"
              items={[
                { value: 'REPARE', label: 'Réparé' },
                { value: 'NON_REPARE', label: 'Non réparé' },
                { value: 'A_SURVEILLER', label: 'À surveiller' },
                { value: 'REMPLACE', label: 'Remplacé' },
              ]}
              disabled={loading || !canEdit}
            />
          </AppFormField>

          <AppFormField label="Durée réelle">
            <input
              type="number"
              min="0"
              step="0.25"
              value={dureeReelle}
              onChange={(event) => setDureeReelle(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
              placeholder="Durée réelle"
            />
          </AppFormField>

          <AppFormField label="Temps arrêt">
            <input
              type="number"
              min="0"
              step="0.25"
              value={tempsArret}
              onChange={(event) => setTempsArret(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
              placeholder="Temps arrêt"
            />
          </AppFormField>

          <AppFormField label="Cause">
            <input
              value={cause}
              onChange={(event) => setCause(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
              placeholder="Cause"
            />
          </AppFormField>

          <AppFormField label="Remède">
            <input
              value={remede}
              onChange={(event) => setRemede(event.target.value)}
              disabled={loading || !canEdit}
              className={appInputClassName}
              placeholder="Remède"
            />
          </AppFormField>

          <AppFormField label="Diagnostic">
            <textarea
              value={diagnostic}
              onChange={(event) => setDiagnostic(event.target.value)}
              disabled={loading || !canEdit}
              className={appTextareaClassName}
              placeholder="Diagnostic"
            />
          </AppFormField>

          <AppFormField label="Travaux effectués">
            <textarea
              value={travauxEffectues}
              onChange={(event) => setTravauxEffectues(event.target.value)}
              disabled={loading || !canEdit}
              className={appTextareaClassName}
              placeholder="Travaux effectués"
            />
          </AppFormField>

          <AppFormField label="Observation">
            <textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              disabled={loading || !canEdit}
              className={appTextareaClassName}
              placeholder="Observation"
            />
          </AppFormField>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !canEdit}
            className={appPrimaryButtonClassName}
          >
            <Save size={17} />
            Enregistrer le compte rendu
          </button>
        </div>
      </form>
    </AppSection>
  );
}

function SummaryCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 break-words text-sm font-black text-slate-950">
        {value || '-'}
      </div>
    </div>
  );
}

function SelectControl({
  value,
  onChange,
  placeholder,
  clearLabel,
  items,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
  items: SelectItem[];
  disabled?: boolean;
}) {
  const normalizedValue = value || EMPTY_SELECT_VALUE;

  const normalizedItems = clearLabel
    ? [{ value: EMPTY_SELECT_VALUE, label: clearLabel }, ...items]
    : items;

  if (disabled) {
    return (
      <div className="flex h-11 w-full min-w-0 items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400">
        <span className="truncate">{clearLabel || placeholder}</span>
      </div>
    );
  }

  return (
    <Select
      value={normalizedValue}
      onValueChange={(nextValue) =>
        onChange(nextValue === EMPTY_SELECT_VALUE ? '' : nextValue)
      }
      placeholder={placeholder}
      items={normalizedItems}
    />
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = 'warning',
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'danger' | 'warning';
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const confirmClassName =
    tone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-[#06475a] text-white hover:bg-[#043747]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-black text-slate-950">{title}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorySection({ intervention }: { intervention: Intervention }) {
  return (
    <AppSection title="Historique des états">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#06475a] text-sm font-black text-white">
                <th className="px-5 py-4 align-middle">Action</th>
                <th className="px-5 py-4 align-middle">Transition</th>
                <th className="px-5 py-4 align-middle">Commentaire</th>
                <th className="px-5 py-4 align-middle">Utilisateur</th>
                <th className="px-5 py-4 text-right align-middle">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {intervention.historiquesEtat?.length ? (
                intervention.historiquesEtat.map((historique) => (
                  <tr key={historique.idHistoriqueEtat} className="text-sm">
                    <td className="px-5 py-4 align-middle font-black text-slate-950">
                      {historique.action || 'Changement état'}
                    </td>

                    <td className="px-5 py-4 align-middle font-bold text-slate-600">
                      {formatEtat(historique.ancienEtat)} →{' '}
                      {formatEtat(historique.nouvelEtat)}
                    </td>

                    <td className="max-w-[360px] px-5 py-4 align-middle font-bold text-slate-600">
                      <span className="block truncate">
                        {historique.commentaire || '-'}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-black text-slate-800">
                      {historique.changedBy || '-'}
                    </td>

                    <td className="px-5 py-4 text-right align-middle text-xs font-bold text-slate-500">
                      {formatDateTime(historique.changedAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-7 text-center text-sm font-bold text-slate-500"
                  >
                    Aucun historique disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppSection>
  );
}

function formatCodeLibelle(
  code?: string | null,
  libelle?: string | null,
  id?: number | null,
) {
  return [code, libelle].filter(Boolean).join(' - ') || `#${id ?? ''}`;
}

function formatTechnicien(technicien: {
  idTechnicien: number;
  nom?: string | null;
  matricule?: string | null;
}) {
  return (
    [technicien.nom, technicien.matricule].filter(Boolean).join(' - ') ||
    `Technicien #${technicien.idTechnicien}`
  );
}

function formatMateriel(intervention: Intervention) {
  if (intervention.materiel?.code && intervention.materiel?.libelle) {
    return `${intervention.materiel.code} - ${intervention.materiel.libelle}`;
  }

  return (
    intervention.materiel?.code ||
    intervention.materiel?.libelle ||
    (intervention.idMateriel ? `Matériel #${intervention.idMateriel}` : '-')
  );
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function localDateToIso(value: string) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

function toInputValue(value?: number | string | null) {
  return value === null || value === undefined ? '' : String(value);
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}