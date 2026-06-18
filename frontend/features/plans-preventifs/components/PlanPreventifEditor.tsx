'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  Eye,
  FileText,
  Layers3,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppBadge,
  AppFieldGrid,
  AppFormField,
  AppReadField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import {
  createPlanPreventif,
  createPlanPreventifDeclencheur,
  deletePlanPreventifDeclencheur,
  getGammesForPlanPreventif,
  getMaterielsForPlanPreventif,
  getPlanPreventifDeclencheurs,
  getPlanPreventifsPredefinis,
  getPointsMesureForPlanPreventif,
  updatePlanPreventif,
  updatePlanPreventifDeclencheur,
} from '../services/plan-preventif.service';

import type {
  CreatePlanPreventifDeclencheurPayload,
  CreatePlanPreventifPayload,
  Gamme,
  Materiel,
  PlanPreventif,
  PlanPreventifDeclencheur,
  PlanPreventifPredefini,
  PointMesure,
  UpdatePlanPreventifDeclencheurPayload,
} from '../types/plan-preventif.types';

type Mode = 'create' | 'edit' | 'detail';
type ActiveTab = 'general' | 'declencheurs';

type SelectItem = {
  value: string;
  label: string;
};

type PlanValues = {
  code: string;
  libelle: string;
  etat: string;
  typeDeclenchement: string;
  idMateriel: string;
  idPlanPreventifPredefiniSource: string;
  organisation: string;
  masquerLignesInactives: boolean;
  actif: boolean;
};

type DeclencheurFormValues = {
  priorite: string;
  etat: string;
  typeDeclencheur: string;
  idGamme: string;
  idMateriel: string;
  idPointMesure: string;
  horizonJours: string;
  toleranceJours: string;
  periodiciteValeur: string;
  periodiciteUnite: string;
  prochainLancementDate: string;
  operateur: string;
  seuilValeur: string;
  prochainLancementValeur: string;
  symptomeCode: string;
  actif: boolean;
};

type LocalDeclencheur = {
  localId: string;
  persistedId?: number;
  values: DeclencheurFormValues;
  source?: PlanPreventifDeclencheur;
};

type Props = {
  mode: Mode;
  initialPlan?: PlanPreventif | null;
  onCancel: () => void;
  onSaved?: (plan: PlanPreventif) => void;
};

const EMPTY_SELECT_VALUE = '__EMPTY_VALUE__';

const emptyPlanValues: PlanValues = {
  code: '',
  libelle: '',
  etat: 'ACTIF',
  typeDeclenchement: 'AUTOMATIQUE',
  idMateriel: '',
  idPlanPreventifPredefiniSource: '',
  organisation: 'BMT',
  masquerLignesInactives: false,
  actif: true,
};

const emptyDeclencheurValues: DeclencheurFormValues = {
  priorite: '1',
  etat: 'ACTIF',
  typeDeclencheur: 'CALENDAIRE',
  idGamme: '',
  idMateriel: '',
  idPointMesure: '',
  horizonJours: '',
  toleranceJours: '',
  periodiciteValeur: '',
  periodiciteUnite: 'JOUR',
  prochainLancementDate: '',
  operateur: '>=',
  seuilValeur: '',
  prochainLancementValeur: '',
  symptomeCode: '',
  actif: true,
};

const CALENDAIRE_UNITS: SelectItem[] = [
  { value: 'JOUR', label: 'Jour' },
  { value: 'SEMAINE', label: 'Semaine' },
  { value: 'MOIS', label: 'Mois' },
  { value: 'ANNEE', label: 'Année' },
];

const OPERATEURS: SelectItem[] = [
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
];

export function PlanPreventifEditor({
  mode,
  initialPlan,
  onCancel,
  onSaved,
}: Props) {
  const router = useRouter();

  const readOnly = mode === 'detail';
  const isCreate = mode === 'create';

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const [values, setValues] = useState<PlanValues>(emptyPlanValues);
  const [declencheurs, setDeclencheurs] = useState<LocalDeclencheur[]>([]);

  const [triggerValues, setTriggerValues] = useState<DeclencheurFormValues>({
    ...emptyDeclencheurValues,
  });

  const [editingLocalId, setEditingLocalId] = useState<string | null>(null);
  const [showTriggerForm, setShowTriggerForm] = useState(false);

  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [pointsMesure, setPointsMesure] = useState<PointMesure[]>([]);
  const [plansPredefinis, setPlansPredefinis] = useState<
    PlanPreventifPredefini[]
  >([]);

  const [foreignLoading, setForeignLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triggerSaving, setTriggerSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<LocalDeclencheur | null>(
    null,
  );

  useEffect(() => {
    if (!initialPlan) {
      setValues(emptyPlanValues);
      setDeclencheurs([]);
      return;
    }

    setValues({
      code: initialPlan.code ?? '',
      libelle: initialPlan.libelle ?? '',
      etat: initialPlan.etat ?? 'ACTIF',
      typeDeclenchement: initialPlan.typeDeclenchement ?? 'AUTOMATIQUE',
      idMateriel: toInputValue(initialPlan.idMateriel),
      idPlanPreventifPredefiniSource: toInputValue(
        initialPlan.idPlanPreventifPredefiniSource,
      ),
      organisation: initialPlan.organisation ?? 'BMT',
      masquerLignesInactives: initialPlan.masquerLignesInactives === true,
      actif: initialPlan.actif !== false,
    });

    const embeddedDeclencheurs =
      initialPlan.plan_preventif_declencheur ??
      [];

    setDeclencheurs(
      embeddedDeclencheurs.map((item) => ({
        localId: `persisted-${item.idPlanPreventifDeclencheur}`,
        persistedId: item.idPlanPreventifDeclencheur,
        values: declencheurToFormValues(item),
        source: item,
      })),
    );
  }, [initialPlan]);

  useEffect(() => {
    let mounted = true;

    async function loadForeignKeys() {
      try {
        setForeignLoading(true);

        const [gammesData, materielsData, pointsData, predefinisData] =
          await Promise.all([
            getGammesForPlanPreventif(),
            getMaterielsForPlanPreventif(),
            getPointsMesureForPlanPreventif(),
            getPlanPreventifsPredefinis(),
          ]);

        if (!mounted) return;

        setGammes(Array.isArray(gammesData) ? gammesData : []);
        setMateriels(Array.isArray(materielsData) ? materielsData : []);
        setPointsMesure(Array.isArray(pointsData) ? pointsData : []);
        setPlansPredefinis(
          Array.isArray(predefinisData) ? predefinisData : [],
        );
      } catch {
        if (!mounted) return;

        setGammes([]);
        setMateriels([]);
        setPointsMesure([]);
        setPlansPredefinis([]);
      } finally {
        if (mounted) setForeignLoading(false);
      }
    }

    loadForeignKeys();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDeclencheurs() {
      if (!initialPlan?.idPlanPreventif || isCreate) return;

      try {
        const data = await getPlanPreventifDeclencheurs(
          initialPlan.idPlanPreventif,
        );

        if (!mounted) return;

        setDeclencheurs(
          data.map((item) => ({
            localId: `persisted-${item.idPlanPreventifDeclencheur}`,
            persistedId: item.idPlanPreventifDeclencheur,
            values: declencheurToFormValues(item),
            source: item,
          })),
        );
      } catch {
        // Si le détail du plan contient déjà les déclencheurs, on garde ceux-là.
      }
    }

    loadDeclencheurs();

    return () => {
      mounted = false;
    };
  }, [initialPlan?.idPlanPreventif, isCreate]);

  const selectedMaterielId = values.idMateriel
    ? Number(values.idMateriel)
    : null;

  const selectedPredefiniId = values.idPlanPreventifPredefiniSource
    ? Number(values.idPlanPreventifPredefiniSource)
    : null;

  const gammesItems = useMemo<SelectItem[]>(
    () =>
      gammes.map((gamme) => ({
        value: String(gamme.idGamme),
        label: formatCodeLibelle(gamme.code, gamme.libelle, gamme.idGamme),
      })),
    [gammes],
  );

  const materielsItems = useMemo<SelectItem[]>(
    () =>
      materiels.map((materiel) => ({
        value: String(materiel.idMateriel),
        label: formatMateriel(materiel),
      })),
    [materiels],
  );

  const plansPredefinisItems = useMemo<SelectItem[]>(
    () =>
      plansPredefinis.map((plan) => ({
        value: String(plan.idPlanPreventifPredefini),
        label: formatPlanPredefini(plan),
      })),
    [plansPredefinis],
  );

  const pointsMesureItems = useMemo<SelectItem[]>(() => {
    const type = triggerValues.typeDeclencheur;

    if (type !== 'COMPTEUR' && type !== 'CONDITIONNEL') return [];

    return pointsMesure
      .filter(
        (point) =>
          point.actif !== false &&
          String(point.type ?? '').toUpperCase() ===
            String(type).toUpperCase(),
      )
      .map((point) => ({
        value: String(point.idPointMesure),
        label: formatPointMesure(point),
      }));
  }, [pointsMesure, triggerValues.typeDeclencheur]);

  function setPlanField<K extends keyof PlanValues>(
    field: K,
    value: PlanValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function setTriggerField<K extends keyof DeclencheurFormValues>(
    field: K,
    value: DeclencheurFormValues[K],
  ) {
    setTriggerValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleChangeTriggerType(nextType: string) {
    setTriggerValues((current) => {
      if (nextType === 'CALENDAIRE') {
        return {
          ...current,
          typeDeclencheur: nextType,
          periodiciteUnite: current.periodiciteUnite || 'JOUR',
          idPointMesure: '',
          operateur: '',
          seuilValeur: '',
          prochainLancementValeur: '',
          symptomeCode: '',
        };
      }

      if (nextType === 'COMPTEUR') {
        return {
          ...current,
          typeDeclencheur: nextType,
          periodiciteUnite: '',
          prochainLancementDate: '',
          operateur: '',
          seuilValeur: '',
          symptomeCode: '',
          idPointMesure: '',
        };
      }

      return {
        ...current,
        typeDeclencheur: nextType,
        periodiciteValeur: '',
        periodiciteUnite: '',
        prochainLancementDate: '',
        prochainLancementValeur: '',
        idPointMesure: '',
        operateur: current.operateur || '>=',
        seuilValeur: '',
      };
    });
  }

  function handleNewTrigger() {
    setError('');
    setSuccess('');
    setEditingLocalId(null);

    setTriggerValues({
      ...emptyDeclencheurValues,
      idMateriel: values.idMateriel,
    });

    setShowTriggerForm(true);
    setActiveTab('declencheurs');
  }

  function handleEditTrigger(item: LocalDeclencheur) {
    setError('');
    setSuccess('');
    setEditingLocalId(item.localId);

    setTriggerValues({
      ...item.values,
      idMateriel: item.values.idMateriel || values.idMateriel,
    });

    setShowTriggerForm(true);
    setActiveTab('declencheurs');
  }

  function handleCancelTriggerEdit() {
    setEditingLocalId(null);

    setTriggerValues({
      ...emptyDeclencheurValues,
      idMateriel: values.idMateriel,
    });

    setShowTriggerForm(false);
  }

  async function handleTriggerSubmit() {
    if (readOnly) return;

    const triggerError = validateTrigger(triggerValues);

    if (triggerError) {
      setError(triggerError);
      setSuccess('');
      setActiveTab('declencheurs');
      return;
    }

    try {
      setTriggerSaving(true);
      setError('');
      setSuccess('');

      const currentEditing = declencheurs.find(
        (item) => item.localId === editingLocalId,
      );

      if (isCreate) {
        const nextTrigger: LocalDeclencheur = {
          localId: currentEditing?.localId ?? `local-${Date.now()}`,
          values: {
            ...triggerValues,
            idMateriel: triggerValues.idMateriel || values.idMateriel,
          },
        };

        setDeclencheurs((current) =>
          currentEditing
            ? current.map((item) =>
                item.localId === currentEditing.localId ? nextTrigger : item,
              )
            : [...current, nextTrigger],
        );

        setSuccess(
          currentEditing
            ? 'Déclencheur modifié localement. Il sera enregistré avec le plan.'
            : 'Déclencheur ajouté localement. Il sera enregistré avec le plan.',
        );

        handleCancelTriggerEdit();
        setActiveTab('declencheurs');
        return;
      }

      if (!initialPlan?.idPlanPreventif) return;

      const payload = triggerValuesToPayload(triggerValues, values.idMateriel);

      if (currentEditing?.persistedId) {
        const updated = await updatePlanPreventifDeclencheur(
          currentEditing.persistedId,
          payload as UpdatePlanPreventifDeclencheurPayload,
        );

        setDeclencheurs((current) =>
          current.map((item) =>
            item.localId === currentEditing.localId
              ? {
                  localId: `persisted-${updated.idPlanPreventifDeclencheur}`,
                  persistedId: updated.idPlanPreventifDeclencheur,
                  values: declencheurToFormValues(updated),
                  source: updated,
                }
              : item,
          ),
        );

        setSuccess('Déclencheur modifié.');
      } else {
        const created = await createPlanPreventifDeclencheur(
          initialPlan.idPlanPreventif,
          payload,
        );

        setDeclencheurs((current) => [
          ...current,
          {
            localId: `persisted-${created.idPlanPreventifDeclencheur}`,
            persistedId: created.idPlanPreventifDeclencheur,
            values: declencheurToFormValues(created),
            source: created,
          },
        ]);

        setSuccess('Déclencheur ajouté.');
      }

      handleCancelTriggerEdit();
      setActiveTab('declencheurs');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du déclencheur.",
      );
      setSuccess('');
    } finally {
      setTriggerSaving(false);
    }
  }

  async function handleDeleteTrigger(item: LocalDeclencheur) {
    if (readOnly) return;

    try {
      setTriggerSaving(true);
      setError('');
      setSuccess('');

      if (!isCreate && item.persistedId) {
        await deletePlanPreventifDeclencheur(item.persistedId);
      }

      setDeclencheurs((current) =>
        current.filter((trigger) => trigger.localId !== item.localId),
      );

      setConfirmDelete(null);
      setSuccess(
        isCreate
          ? 'Déclencheur retiré localement.'
          : 'Déclencheur supprimé.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression du déclencheur.',
      );
      setSuccess('');
    } finally {
      setTriggerSaving(false);
    }
  }

  async function handleSavePlan() {
    if (readOnly) return;

    if (!values.libelle.trim()) {
      setError('Le libellé du plan préventif est obligatoire.');
      setSuccess('');
      setActiveTab('general');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload: CreatePlanPreventifPayload = {
        code: emptyToUndefined(values.code),
        libelle: values.libelle.trim(),
        etat: emptyToUndefined(values.etat),
        typeDeclenchement: emptyToUndefined(values.typeDeclenchement),
        idMateriel: parseOptionalInt(values.idMateriel),
        idPlanPreventifPredefiniSource: parseOptionalInt(
          values.idPlanPreventifPredefiniSource,
        ),
        organisation: emptyToUndefined(values.organisation),
        masquerLignesInactives: values.masquerLignesInactives,
        actif: values.actif,
      };

      let savedPlan: PlanPreventif;

      if (isCreate) {
        savedPlan = await createPlanPreventif(payload);

        for (const declencheur of declencheurs) {
          await createPlanPreventifDeclencheur(
            savedPlan.idPlanPreventif,
            triggerValuesToPayload(declencheur.values, values.idMateriel),
          );
        }
      } else {
        if (!initialPlan?.idPlanPreventif) return;

        savedPlan = await updatePlanPreventif(
          initialPlan.idPlanPreventif,
          payload,
        );
      }

      setSuccess('Plan préventif enregistré.');
      onSaved?.(savedPlan);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du plan.",
      );
      setSuccess('');
    } finally {
      setSaving(false);
    }
  }

  const title =
    mode === 'create'
      ? 'Créer un plan préventif'
      : mode === 'edit'
        ? 'Modifier le plan préventif'
        : 'Fiche plan préventif';

  const subtitle =
    mode === 'detail'
      ? 'Consultez les informations du plan appliqué et ses déclencheurs.'
      : 'Renseignez les informations du plan appliqué et gérez ses déclencheurs.';

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 bg-[#06475a] px-7 py-7 text-white md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/10">
            <CalendarClock size={31} />
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.45em] text-cyan-100">
              Plan préventif
            </p>

            <h1 className="break-words text-3xl font-black leading-tight text-white md:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-cyan-50/90">
              {subtitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                {values.etat || 'ACTIF'}
              </span>

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                {values.typeDeclenchement || 'AUTOMATIQUE'}
              </span>

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                {declencheurs.length} déclencheur(s)
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || triggerSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
            Retour
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={handleSavePlan}
              disabled={saving || triggerSaving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}

          {readOnly && initialPlan?.idPlanPreventif && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/plans-preventifs/${initialPlan.idPlanPreventif}/modifier`,
                )
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50"
            >
              <Pencil size={18} />
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'general'}
            icon={<FileText size={18} />}
            label="Général"
            onClick={() => setActiveTab('general')}
          />

          <TabButton
            active={activeTab === 'declencheurs'}
            icon={<Layers3 size={18} />}
            label="Déclencheurs"
            count={declencheurs.length}
            onClick={() => setActiveTab('declencheurs')}
          />
        </div>
      </div>

      <div className="space-y-6 px-7 py-7">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
            {success}
          </div>
        )}

        {activeTab === 'general' && (
          <GeneralTab
            values={values}
            readOnly={readOnly}
            foreignLoading={foreignLoading}
            materielsItems={materielsItems}
            plansPredefinisItems={plansPredefinisItems}
            selectedMaterielId={selectedMaterielId}
            selectedPredefiniId={selectedPredefiniId}
            onSetField={setPlanField}
            onViewMateriel={() => {
              if (selectedMaterielId) {
                router.push(`/materiels/${selectedMaterielId}`);
              }
            }}
            onAddMateriel={() => router.push('/materiels/nouveau')}
            onViewPredefini={() => {
              if (selectedPredefiniId) {
                router.push(
                  `/plans-preventifs-predefinis/${selectedPredefiniId}`,
                );
              }
            }}
            onAddPredefini={() =>
              router.push('/plans-preventifs-predefinis/nouveau')
            }
          />
        )}

        {activeTab === 'declencheurs' && (
          <DeclencheursTab
            readOnly={readOnly}
            isCreate={isCreate}
            values={triggerValues}
            editingLocalId={editingLocalId}
            showForm={showTriggerForm}
            saving={triggerSaving}
            declencheurs={declencheurs}
            gammesItems={gammesItems}
            pointsMesureItems={pointsMesureItems}
            onNewTrigger={handleNewTrigger}
            onSubmit={handleTriggerSubmit}
            onCancelEdit={handleCancelTriggerEdit}
            onEdit={handleEditTrigger}
            onDelete={setConfirmDelete}
            onSetField={setTriggerField}
            onChangeType={handleChangeTriggerType}
            onViewGamme={() => {
              if (triggerValues.idGamme) {
                router.push(`/gammes/${triggerValues.idGamme}`);
              }
            }}
            onAddGamme={() => router.push('/gammes/nouveau')}
            formatTrigger={(item) =>
              formatTriggerForDisplay(item, gammesItems, pointsMesure)
            }
          />
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer le déclencheur"
          message="Voulez-vous supprimer ce déclencheur du plan préventif ?"
          confirmLabel="Supprimer"
          loading={triggerSaving}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteTrigger(confirmDelete)}
        />
      )}
    </div>
  );
}

function GeneralTab({
  values,
  readOnly,
  foreignLoading,
  materielsItems,
  plansPredefinisItems,
  selectedMaterielId,
  selectedPredefiniId,
  onSetField,
  onViewMateriel,
  onAddMateriel,
  onViewPredefini,
  onAddPredefini,
}: {
  values: PlanValues;
  readOnly: boolean;
  foreignLoading: boolean;
  materielsItems: SelectItem[];
  plansPredefinisItems: SelectItem[];
  selectedMaterielId: number | null;
  selectedPredefiniId: number | null;
  onSetField: <K extends keyof PlanValues>(
    field: K,
    value: PlanValues[K],
  ) => void;
  onViewMateriel: () => void;
  onAddMateriel: () => void;
  onViewPredefini: () => void;
  onAddPredefini: () => void;
}) {
  const materielLabel =
    materielsItems.find((item) => item.value === values.idMateriel)?.label ||
    '-';

  const predefiniLabel =
    plansPredefinisItems.find(
      (item) => item.value === values.idPlanPreventifPredefiniSource,
    )?.label || '-';

  if (readOnly) {
    return (
      <AppSection title="Informations générales">
        <AppFieldGrid>
          <AppReadField label="Code" value={values.code || '-'} />
          <AppReadField label="Libellé" value={values.libelle || '-'} />

          <AppReadField
            label="État"
            value={
              <AppBadge tone={values.etat === 'INACTIF' ? 'danger' : 'success'}>
                {values.etat}
              </AppBadge>
            }
          />

          <AppReadField
            label="Type déclenchement"
            value={values.typeDeclenchement || '-'}
          />

          <AppReadField label="Matériel" value={materielLabel} />
          <AppReadField label="Plan prédéfini source" value={predefiniLabel} />
          <AppReadField label="Organisation" value={values.organisation || '-'} />

          <AppReadField
            label="Masquer lignes inactives"
            value={values.masquerLignesInactives ? 'Oui' : 'Non'}
          />

          <AppReadField label="Actif" value={values.actif ? 'Oui' : 'Non'} />
        </AppFieldGrid>
      </AppSection>
    );
  }

  return (
    <AppSection title="Informations générales">
      <AppFieldGrid>
        <AppFormField label="Code">
          <input
            value={values.code}
            onChange={(event) => onSetField('code', event.target.value)}
            className={appInputClassName}
            placeholder="Ex : PP-001"
          />
        </AppFormField>

        <AppFormField label="Libellé" required>
          <input
            value={values.libelle}
            onChange={(event) => onSetField('libelle', event.target.value)}
            className={appInputClassName}
            placeholder="Ex : Préventif mensuel Reach Stacker"
          />
        </AppFormField>

        <AppFormField label="État">
          <SelectControl
            value={values.etat}
            onChange={(value) => onSetField('etat', value)}
            placeholder="Sélectionner un état"
            items={[
              { value: 'ACTIF', label: 'Actif' },
              { value: 'INACTIF', label: 'Inactif' },
              { value: 'BROUILLON', label: 'Brouillon' },
            ]}
          />
        </AppFormField>

        <AppFormField label="Type de déclenchement">
          <SelectControl
            value={values.typeDeclenchement}
            onChange={(value) => onSetField('typeDeclenchement', value)}
            placeholder="Sélectionner un type"
            items={[
              { value: 'AUTOMATIQUE', label: 'Automatique' },
              { value: 'MANUEL', label: 'Manuel' },
            ]}
          />
        </AppFormField>

        <AppFormField label="Organisation">
          <input
            value={values.organisation}
            onChange={(event) =>
              onSetField('organisation', event.target.value)
            }
            className={appInputClassName}
            placeholder="Ex : BMT"
          />
        </AppFormField>

        <AppFormField label="Actif">
          <SelectControl
            value={values.actif ? 'true' : 'false'}
            onChange={(value) => onSetField('actif', value === 'true')}
            placeholder="Sélectionner"
            items={[
              { value: 'true', label: 'Oui' },
              { value: 'false', label: 'Non' },
            ]}
          />
        </AppFormField>

        <div className="md:col-span-2">
          <AppFormField label="Matériel">
            <div className="flex min-w-0 gap-2">
              <div className="min-w-0 flex-1">
                <SelectControl
                  value={values.idMateriel}
                  onChange={(value) => onSetField('idMateriel', value)}
                  placeholder={
                    foreignLoading
                      ? 'Chargement des matériels...'
                      : 'Sélectionner un matériel'
                  }
                  clearLabel="Aucun matériel"
                  items={materielsItems}
                />
              </div>

              <button
                type="button"
                onClick={onViewMateriel}
                disabled={!selectedMaterielId}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={17} />
              </button>

              <button
                type="button"
                onClick={onAddMateriel}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <Plus size={17} />
              </button>
            </div>
          </AppFormField>
        </div>

        <div className="md:col-span-2">
          <AppFormField label="Plan préventif prédéfini source">
            <div className="flex min-w-0 gap-2">
              <div className="min-w-0 flex-1">
                <SelectControl
                  value={values.idPlanPreventifPredefiniSource}
                  onChange={(value) =>
                    onSetField('idPlanPreventifPredefiniSource', value)
                  }
                  placeholder={
                    foreignLoading
                      ? 'Chargement des plans prédéfinis...'
                      : 'Sélectionner un plan prédéfini'
                  }
                  clearLabel="Aucun plan prédéfini"
                  items={plansPredefinisItems}
                />
              </div>

              <button
                type="button"
                onClick={onViewPredefini}
                disabled={!selectedPredefiniId}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={17} />
              </button>

              <button
                type="button"
                onClick={onAddPredefini}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <Plus size={17} />
              </button>
            </div>
          </AppFormField>
        </div>

        <AppFormField label="Masquer lignes inactives">
          <SelectControl
            value={values.masquerLignesInactives ? 'true' : 'false'}
            onChange={(value) =>
              onSetField('masquerLignesInactives', value === 'true')
            }
            placeholder="Sélectionner"
            items={[
              { value: 'true', label: 'Oui' },
              { value: 'false', label: 'Non' },
            ]}
          />
        </AppFormField>
      </AppFieldGrid>
    </AppSection>
  );
}

function DeclencheursTab({
  readOnly,
  isCreate,
  values,
  editingLocalId,
  showForm,
  saving,
  declencheurs,
  gammesItems,
  pointsMesureItems,
  onNewTrigger,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
  onSetField,
  onChangeType,
  onViewGamme,
  onAddGamme,
  formatTrigger,
}: {
  readOnly: boolean;
  isCreate: boolean;
  values: DeclencheurFormValues;
  editingLocalId: string | null;
  showForm: boolean;
  saving: boolean;
  declencheurs: LocalDeclencheur[];
  gammesItems: SelectItem[];
  pointsMesureItems: SelectItem[];
  onNewTrigger: () => void;
  onSubmit: () => void | Promise<void>;
  onCancelEdit: () => void;
  onEdit: (item: LocalDeclencheur) => void;
  onDelete: (item: LocalDeclencheur) => void;
  onSetField: <K extends keyof DeclencheurFormValues>(
    field: K,
    value: DeclencheurFormValues[K],
  ) => void;
  onChangeType: (type: string) => void;
  onViewGamme: () => void;
  onAddGamme: () => void;
  formatTrigger: (item: LocalDeclencheur) => {
    type: string;
    priorite: string;
    gamme: string;
    pointMesure: string;
    regle: string;
    actif: boolean;
  };
}) {
  const isCalendaire = values.typeDeclencheur === 'CALENDAIRE';
  const isCompteur = values.typeDeclencheur === 'COMPTEUR';
  const isConditionnel = values.typeDeclencheur === 'CONDITIONNEL';
  const isMesure = isCompteur || isConditionnel;

  return (
    <AppSection title="Déclencheurs">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">
            Liste des conditions de déclenchement liées au plan préventif.
          </p>

          {isCreate && (
            <p className="mt-1 text-xs font-bold text-slate-400">
              En création, les déclencheurs sont ajoutés dans la liste puis
              enregistrés avec le plan.
            </p>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={onNewTrigger}
            disabled={saving}
            className={appPrimaryButtonClassName}
          >
            <Plus size={17} />
            Nouveau déclencheur
          </button>
        )}
      </div>

      {showForm && !readOnly && (
        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black text-slate-950">
                {editingLocalId
                  ? 'Modifier le déclencheur'
                  : 'Ajouter un déclencheur'}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Définissez la gamme, le type et la règle de déclenchement.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={17} />
            </button>
          </div>

          <AppFieldGrid>
            <AppFormField label="Priorité">
              <input
                type="number"
                min="1"
                value={values.priorite}
                onChange={(event) =>
                  onSetField('priorite', event.target.value)
                }
                className={appInputClassName}
                placeholder="1"
              />
            </AppFormField>

            <AppFormField label="Type déclencheur">
              <SelectControl
                value={values.typeDeclencheur}
                onChange={onChangeType}
                placeholder="Type déclencheur"
                items={[
                  { value: 'CALENDAIRE', label: 'Calendaire' },
                  { value: 'COMPTEUR', label: 'Compteur' },
                  { value: 'CONDITIONNEL', label: 'Conditionnel' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Gamme" required>
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <SelectControl
                    value={values.idGamme}
                    onChange={(value) => onSetField('idGamme', value)}
                    placeholder="Sélectionner une gamme"
                    clearLabel="Sélectionner une gamme"
                    items={gammesItems}
                  />
                </div>

                <button
                  type="button"
                  onClick={onViewGamme}
                  disabled={!values.idGamme}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye size={17} />
                </button>

                <button
                  type="button"
                  onClick={onAddGamme}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus size={17} />
                </button>
              </div>
            </AppFormField>

            <AppFormField label="Horizon jours">
              <input
                type="number"
                min="0"
                value={values.horizonJours}
                onChange={(event) =>
                  onSetField('horizonJours', event.target.value)
                }
                className={appInputClassName}
                placeholder="Ex : 7"
              />
            </AppFormField>

            <AppFormField label="Tolérance jours">
              <input
                type="number"
                min="0"
                value={values.toleranceJours}
                onChange={(event) =>
                  onSetField('toleranceJours', event.target.value)
                }
                className={appInputClassName}
                placeholder="Ex : 2"
              />
            </AppFormField>

            {isCalendaire && (
              <>
                <AppFormField label="Périodicité" required>
                  <input
                    type="number"
                    min="1"
                    value={values.periodiciteValeur}
                    onChange={(event) =>
                      onSetField('periodiciteValeur', event.target.value)
                    }
                    className={appInputClassName}
                    placeholder="Ex : 30"
                  />
                </AppFormField>

                <AppFormField label="Unité">
                  <SelectControl
                    value={values.periodiciteUnite}
                    onChange={(value) => onSetField('periodiciteUnite', value)}
                    placeholder="Unité"
                    items={CALENDAIRE_UNITS}
                  />
                </AppFormField>

                <AppFormField label="Prochain lancement">
                  <input
                    type="date"
                    value={values.prochainLancementDate}
                    onChange={(event) =>
                      onSetField('prochainLancementDate', event.target.value)
                    }
                    className={appInputClassName}
                  />
                </AppFormField>
              </>
            )}

            {isMesure && (
              <AppFormField label="Point de mesure" required>
                <SelectControl
                  value={values.idPointMesure}
                  onChange={(value) => onSetField('idPointMesure', value)}
                  placeholder="Sélectionner un point"
                  clearLabel="Sélectionner un point"
                  items={pointsMesureItems}
                />
              </AppFormField>
            )}

            {isCompteur && (
              <>
                <AppFormField label="Périodicité compteur" required>
                  <input
                    type="number"
                    min="1"
                    value={values.periodiciteValeur}
                    onChange={(event) =>
                      onSetField('periodiciteValeur', event.target.value)
                    }
                    className={appInputClassName}
                    placeholder="Ex : 1000"
                  />
                </AppFormField>

                <AppFormField label="Prochain lancement valeur">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={values.prochainLancementValeur}
                    onChange={(event) =>
                      onSetField(
                        'prochainLancementValeur',
                        event.target.value,
                      )
                    }
                    className={appInputClassName}
                    placeholder="Ex : 5000"
                  />
                </AppFormField>
              </>
            )}

            {isConditionnel && (
              <>
                <AppFormField label="Opérateur" required>
                  <SelectControl
                    value={values.operateur}
                    onChange={(value) => onSetField('operateur', value)}
                    placeholder="Opérateur"
                    items={OPERATEURS}
                  />
                </AppFormField>

                <AppFormField label="Seuil" required>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={values.seuilValeur}
                    onChange={(event) =>
                      onSetField('seuilValeur', event.target.value)
                    }
                    className={appInputClassName}
                    placeholder="Ex : 500"
                  />
                </AppFormField>

                <AppFormField label="Symptôme">
                  <input
                    value={values.symptomeCode}
                    onChange={(event) =>
                      onSetField('symptomeCode', event.target.value)
                    }
                    className={appInputClassName}
                    placeholder="Code symptôme"
                  />
                </AppFormField>
              </>
            )}

            <AppFormField label="Actif">
              <SelectControl
                value={values.actif ? 'true' : 'false'}
                onChange={(value) => onSetField('actif', value === 'true')}
                placeholder="Actif"
                items={[
                  { value: 'true', label: 'Oui' },
                  { value: 'false', label: 'Non' },
                ]}
              />
            </AppFormField>
          </AppFieldGrid>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className={appSecondaryButtonClassName}
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={() => onSubmit()}
              disabled={saving}
              className={appPrimaryButtonClassName}
            >
              <Save size={17} />
              {saving ? 'Enregistrement...' : 'Enregistrer déclencheur'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-[#06475a] text-sm font-black text-white">
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Priorité</th>
                <th className="px-5 py-4">Gamme</th>
                <th className="px-5 py-4">Point mesure</th>
                <th className="px-5 py-4">Règle</th>
                <th className="px-5 py-4">Actif</th>
                {!readOnly && (
                  <th className="px-5 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {declencheurs.length === 0 ? (
                <tr>
                  <td
                    colSpan={readOnly ? 6 : 7}
                    className="px-5 py-7 text-center text-sm font-bold text-slate-500"
                  >
                    Aucun déclencheur associé.
                  </td>
                </tr>
              ) : (
                declencheurs.map((item) => {
                  const display = formatTrigger(item);

                  return (
                    <tr key={item.localId} className="text-sm">
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {display.type}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        {display.priorite}
                      </td>

                      <td className="max-w-[260px] px-5 py-4 font-bold text-slate-700">
                        <span className="block truncate">{display.gamme}</span>
                      </td>

                      <td className="max-w-[240px] px-5 py-4 font-bold text-slate-700">
                        <span className="block truncate">
                          {display.pointMesure}
                        </span>
                      </td>

                      <td className="max-w-[360px] px-5 py-4 font-bold text-slate-700">
                        <span className="block truncate">{display.regle}</span>
                      </td>

                      <td className="px-5 py-4">
                        <AppBadge tone={display.actif ? 'success' : 'danger'}>
                          {display.actif ? 'Oui' : 'Non'}
                        </AppBadge>
                      </td>

                      {!readOnly && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(item)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppSection>
  );
}

function TabButton({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
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
      <span>{icon}</span>
      <span>{label}</span>

      {typeof count === 'number' && (
        <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e8f7fb] px-2 text-xs font-black text-[#06475a]">
          {count}
        </span>
      )}
    </button>
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
      <div className="flex h-11 w-full min-w-0 items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400">
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
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
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
            className={appSecondaryButtonClassName}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function validateTrigger(values: DeclencheurFormValues) {
  if (!values.idGamme) return 'La gamme est obligatoire pour le déclencheur.';

  if (
    values.typeDeclencheur === 'CALENDAIRE' &&
    !values.periodiciteValeur.trim()
  ) {
    return 'La périodicité est obligatoire pour un déclencheur calendaire.';
  }

  if (values.typeDeclencheur === 'COMPTEUR') {
    if (!values.idPointMesure) {
      return 'Le point de mesure est obligatoire pour un déclencheur compteur.';
    }

    if (!values.periodiciteValeur.trim()) {
      return 'La périodicité compteur est obligatoire.';
    }
  }

  if (values.typeDeclencheur === 'CONDITIONNEL') {
    if (!values.idPointMesure) {
      return 'Le point de mesure est obligatoire pour un déclencheur conditionnel.';
    }

    if (!values.operateur || !values.seuilValeur.trim()) {
      return "L'opérateur et le seuil sont obligatoires pour un déclencheur conditionnel.";
    }
  }

  return '';
}

function triggerValuesToPayload(
  values: DeclencheurFormValues,
  fallbackMaterielId: string,
): CreatePlanPreventifDeclencheurPayload {
  const isCalendaire = values.typeDeclencheur === 'CALENDAIRE';
  const isCompteur = values.typeDeclencheur === 'COMPTEUR';
  const isConditionnel = values.typeDeclencheur === 'CONDITIONNEL';

  return {
    priorite: parseOptionalInt(values.priorite),
    etat: emptyToUndefined(values.etat),
    typeDeclencheur: values.typeDeclencheur || 'CALENDAIRE',
    idGamme: Number(values.idGamme),

    idMateriel:
      parseOptionalInt(values.idMateriel) ??
      parseOptionalInt(fallbackMaterielId) ??
      null,

    idPointMesure:
      isCompteur || isConditionnel
        ? parseOptionalInt(values.idPointMesure) ?? null
        : null,

    horizonJours: parseOptionalInt(values.horizonJours) ?? null,
    toleranceJours: parseOptionalInt(values.toleranceJours) ?? null,

    periodiciteValeur:
      isCalendaire || isCompteur
        ? parseOptionalInt(values.periodiciteValeur) ?? null
        : null,

    periodiciteUnite: isCalendaire
      ? emptyToNull(values.periodiciteUnite)
      : null,

    prochainLancementDate: isCalendaire
      ? emptyToNull(values.prochainLancementDate)
      : null,

    prochainLancementValeur: isCompteur
      ? parseOptionalNumber(values.prochainLancementValeur) ?? null
      : null,

    operateur: isConditionnel ? emptyToNull(values.operateur) : null,

    seuilValeur: isConditionnel
      ? parseOptionalNumber(values.seuilValeur) ?? null
      : null,

    symptomeCode: isConditionnel ? emptyToNull(values.symptomeCode) : null,

    actif: values.actif,
  };
}

function declencheurToFormValues(
  item: PlanPreventifDeclencheur,
): DeclencheurFormValues {
  return {
    priorite: toInputValue(item.priorite ?? 1),
    etat: item.etat || 'ACTIF',
    typeDeclencheur: item.typeDeclencheur || 'CALENDAIRE',
    idGamme: toInputValue(item.idGamme),
    idMateriel: toInputValue(item.idMateriel),
    idPointMesure: toInputValue(item.idPointMesure),
    horizonJours: toInputValue(item.horizonJours),
    toleranceJours: toInputValue(item.toleranceJours),
    periodiciteValeur: toInputValue(item.periodiciteValeur),
    periodiciteUnite: item.periodiciteUnite || 'JOUR',
    prochainLancementDate: dateInputValue(item.prochainLancementDate),
    operateur: item.operateur || '>=',
    seuilValeur: toInputValue(item.seuilValeur),
    prochainLancementValeur: toInputValue(item.prochainLancementValeur),
    symptomeCode: item.symptomeCode || '',
    actif: item.actif !== false,
  };
}

function formatTriggerForDisplay(
  item: LocalDeclencheur,
  gammesItems: SelectItem[],
  pointsMesure: PointMesure[],
) {
  const values = item.values;

  const gamme =
    item.source?.gamme?.code || item.source?.gamme?.libelle
      ? formatCodeLibelle(
          item.source.gamme?.code,
          item.source.gamme?.libelle,
          item.source.gamme?.idGamme,
        )
      : gammesItems.find((gammeItem) => gammeItem.value === values.idGamme)
          ?.label || `Gamme #${values.idGamme || '-'}`;

  const pointFromList = pointsMesure.find(
    (point) => String(point.idPointMesure) === values.idPointMesure,
  );

  const pointMesure =
    item.source?.point_mesure?.code || item.source?.point_mesure?.libelle
      ? formatPointMesure(item.source.point_mesure)
      : pointFromList
        ? formatPointMesure(pointFromList)
        : values.idPointMesure
          ? `Point #${values.idPointMesure}`
          : '-';

  let regle = '-';

  if (values.typeDeclencheur === 'CALENDAIRE') {
    const unit = formatUnite(values.periodiciteUnite);

    regle = values.periodiciteValeur
      ? `Tous les ${values.periodiciteValeur} ${unit}`
      : '-';

    if (values.prochainLancementDate) {
      regle += ` — prochain : ${values.prochainLancementDate}`;
    }
  }

  if (values.typeDeclencheur === 'COMPTEUR') {
    regle = values.periodiciteValeur
      ? `Tous les ${values.periodiciteValeur}`
      : '-';

    if (values.prochainLancementValeur) {
      regle += ` — prochain : ${values.prochainLancementValeur}`;
    }
  }

  if (values.typeDeclencheur === 'CONDITIONNEL') {
    regle = `${pointMesure} ${values.operateur || ''} ${
      values.seuilValeur || ''
    }`.trim();
  }

  return {
    type: values.typeDeclencheur || '-',
    priorite: values.priorite || '-',
    gamme,
    pointMesure,
    regle,
    actif: values.actif !== false,
  };
}

function formatMateriel(materiel?: Materiel | null) {
  if (!materiel) return '-';

  return [
    materiel.code,
    materiel.numeroSerie ? `SN ${materiel.numeroSerie}` : null,
    materiel.modele?.libelle,
  ]
    .filter(Boolean)
    .join(' — ') || `Matériel #${materiel.idMateriel}`;
}

function formatPlanPredefini(plan: PlanPreventifPredefini) {
  return [plan.code, plan.titre].filter(Boolean).join(' — ');
}

function formatPointMesure(point?: PointMesure | null) {
  if (!point) return '-';

  return [point.code, point.libelle, point.unite ? `(${point.unite})` : null]
    .filter(Boolean)
    .join(' — ') || `Point #${point.idPointMesure}`;
}

function formatCodeLibelle(
  code?: string | null,
  libelle?: string | null,
  id?: number | null,
) {
  return [code, libelle].filter(Boolean).join(' — ') || `#${id ?? ''}`;
}

function formatUnite(value: string) {
  switch (value) {
    case 'JOUR':
      return 'jour(s)';
    case 'SEMAINE':
      return 'semaine(s)';
    case 'MOIS':
      return 'mois';
    case 'ANNEE':
      return 'année(s)';
    default:
      return value || '';
  }
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseOptionalInt(value: string) {
  if (!value.trim()) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) return undefined;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function toInputValue(value?: string | number | null) {
  return value === null || value === undefined ? '' : String(value);
}

function dateInputValue(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}