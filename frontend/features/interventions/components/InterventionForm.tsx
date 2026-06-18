'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  AlertTriangle,
  ClipboardList,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppFieldGrid,
  AppFormField,
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
  CreateInterventionDto,
  Intervention,
  InterventionReferenceData,
  MaterielLite,
  PlanPreventifDeclencheurLite,
  UpdateInterventionDto,
} from '../types/intervention.types';

type FormValues = {
  code: string;
  libelle: string;
  description: string;
  typeMaintenance: string;
  typeIntervention: string;
  natureIntervention: string;
  priorite: string;
  criticite: string;
  centreCout: string;
  idMateriel: string;
  idPointStructure: string;
  idDemande: string;
  idGamme: string;
  idEquipe: string;
  idPlanPreventif: string;
  idPlanPreventifDeclencheur: string;
  dateDebutPrevue: string;
  dateFinPrevue: string;
  dateSouhaiteeFin: string;
  chargePrevue: string;
  tempsArretPrevu: string;
  materielEnPanne: boolean;
  materielIndisponible: boolean;
  arretMateriel: boolean;
  receptionTravaux: boolean;
  symptome: string;
  cause: string;
  remede: string;
  diagnosticInitial: string;
  instructions: string;
  createdBy: string;
};

type Props = {
  initialIntervention?: Intervention | null;
  submitLabel?: string;
  loading?: boolean;
  showHeader?: boolean;
  onCancel?: () => void;
  onSubmit: (data: CreateInterventionDto | UpdateInterventionDto) => void;
};

type SelectItem = {
  label: string;
  value: string;
};

const emptyReferences: InterventionReferenceData = {
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
};

const EMPTY_SELECT_VALUE = '__EMPTY_VALUE__';

const inputClassName = `${appInputClassName} min-w-0`;
const textareaClassName = `${appTextareaClassName} min-w-0`;

export function InterventionForm({
  initialIntervention,
  submitLabel = 'Enregistrer',
  loading = false,
  showHeader = false,
  onCancel,
  onSubmit,
}: Props) {
  const initialValues = useMemo<FormValues>(
    () => ({
      code: initialIntervention?.code ?? '',
      libelle: initialIntervention?.libelle ?? '',
      description: initialIntervention?.description ?? '',
      typeMaintenance: initialIntervention?.typeMaintenance ?? 'CORRECTIF',
      typeIntervention: initialIntervention?.typeIntervention ?? 'TRAVAUX',
      natureIntervention: initialIntervention?.natureIntervention ?? 'CURATIF',
      priorite: initialIntervention?.priorite ?? 'NORMALE',
      criticite: initialIntervention?.criticite ?? 'MOYENNE',
      centreCout: initialIntervention?.centreCout ?? '',
      idMateriel: toInputValue(initialIntervention?.idMateriel),
      idPointStructure: toInputValue(initialIntervention?.idPointStructure),
      idDemande: toInputValue(initialIntervention?.idDemande),
      idGamme: toInputValue(initialIntervention?.idGamme),
      idEquipe: toInputValue(initialIntervention?.idEquipe),
      idPlanPreventif: toInputValue(initialIntervention?.idPlanPreventif),
      idPlanPreventifDeclencheur: toInputValue(
        initialIntervention?.idPlanPreventifDeclencheur,
      ),
      dateDebutPrevue: toDateTimeLocal(initialIntervention?.dateDebutPrevue),
      dateFinPrevue: toDateTimeLocal(initialIntervention?.dateFinPrevue),
      dateSouhaiteeFin: toDateTimeLocal(initialIntervention?.dateSouhaiteeFin),
      chargePrevue: toInputValue(initialIntervention?.chargePrevue),
      tempsArretPrevu: toInputValue(initialIntervention?.tempsArretPrevu),
      materielEnPanne: Boolean(initialIntervention?.materielEnPanne),
      materielIndisponible: Boolean(initialIntervention?.materielIndisponible),
      arretMateriel: Boolean(initialIntervention?.arretMateriel),
      receptionTravaux: Boolean(initialIntervention?.receptionTravaux),
      symptome: initialIntervention?.symptome ?? '',
      cause: initialIntervention?.cause ?? '',
      remede: initialIntervention?.remede ?? '',
      diagnosticInitial: initialIntervention?.diagnosticInitial ?? '',
      instructions: initialIntervention?.instructions ?? '',
      createdBy: initialIntervention?.createdBy ?? 'Admin',
    }),
    [initialIntervention],
  );

  const [values, setValues] = useState<FormValues>(initialValues);
  const [references, setReferences] =
    useState<InterventionReferenceData>(emptyReferences);
  const [referenceError, setReferenceError] = useState('');

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

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
            getApiErrorMessage(error, 'Impossible de charger les listes.'),
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const declencheursForPlan = useMemo(() => {
    if (!values.idPlanPreventif) return references.declencheurs;

    return references.declencheurs.filter(
      (declencheur) =>
        String(declencheur.idPlanPreventif) === values.idPlanPreventif,
    );
  }, [references.declencheurs, values.idPlanPreventif]);

  const materielOptions = useMemo<SelectItem[]>(() => {
    const exists = references.materiels.some(
      (materiel) => String(materiel.idMateriel) === values.idMateriel,
    );

    return [
      ...getMissingItem(values.idMateriel, exists, 'Matériel'),
      ...references.materiels.map((materiel) => ({
        value: String(materiel.idMateriel),
        label: formatCodeLibelle(
          materiel.code,
          materiel.libelle,
          materiel.idMateriel,
        ),
      })),
    ];
  }, [references.materiels, values.idMateriel]);

  const pointStructureOptions = useMemo<SelectItem[]>(() => {
    const exists = references.pointsStructure.some(
      (point) => String(point.idPoint) === values.idPointStructure,
    );

    return [
      ...getMissingItem(values.idPointStructure, exists, 'Point de structure'),
      ...references.pointsStructure.map((point) => ({
        value: String(point.idPoint),
        label: formatCodeLibelle(point.code, point.libelle, point.idPoint),
      })),
    ];
  }, [references.pointsStructure, values.idPointStructure]);

  const demandeOptions = useMemo<SelectItem[]>(() => {
    const exists = references.demandes.some(
      (demande) => String(demande.idDemande) === values.idDemande,
    );

    return [
      ...getMissingItem(values.idDemande, exists, 'DI'),
      ...references.demandes.map((demande) => ({
        value: String(demande.idDemande),
        label: formatDemandeLabel(demande),
      })),
    ];
  }, [references.demandes, values.idDemande]);

  const planOptions = useMemo<SelectItem[]>(() => {
    const exists = references.plansPreventifs.some(
      (plan) => String(plan.idPlanPreventif) === values.idPlanPreventif,
    );

    return [
      ...getMissingItem(values.idPlanPreventif, exists, 'Plan préventif'),
      ...references.plansPreventifs.map((plan) => ({
        value: String(plan.idPlanPreventif),
        label: formatCodeLibelle(plan.code, plan.libelle, plan.idPlanPreventif),
      })),
    ];
  }, [references.plansPreventifs, values.idPlanPreventif]);

  const declencheurOptions = useMemo<SelectItem[]>(() => {
    const exists = declencheursForPlan.some(
      (declencheur) =>
        String(declencheur.idPlanPreventifDeclencheur) ===
        values.idPlanPreventifDeclencheur,
    );

    return [
      ...getMissingItem(
        values.idPlanPreventifDeclencheur,
        exists,
        'Déclencheur',
      ),
      ...declencheursForPlan.map((declencheur) => ({
        value: String(declencheur.idPlanPreventifDeclencheur),
        label: formatDeclencheurLabel(declencheur),
      })),
    ];
  }, [declencheursForPlan, values.idPlanPreventifDeclencheur]);

  const gammeOptions = useMemo<SelectItem[]>(() => {
    const exists = references.gammes.some(
      (gamme) => String(gamme.idGamme) === values.idGamme,
    );

    return [
      ...getMissingItem(values.idGamme, exists, 'Gamme'),
      ...references.gammes.map((gamme) => ({
        value: String(gamme.idGamme),
        label: formatCodeLibelle(gamme.code, gamme.libelle, gamme.idGamme),
      })),
    ];
  }, [references.gammes, values.idGamme]);

  const equipeOptions = useMemo<SelectItem[]>(() => {
    const exists = references.equipes.some(
      (equipe) => String(equipe.idEquipe) === values.idEquipe,
    );

    return [
      ...getMissingItem(values.idEquipe, exists, 'Équipe'),
      ...references.equipes.map((equipe) => ({
        value: String(equipe.idEquipe),
        label: formatCodeLibelle(equipe.code, equipe.libelle, equipe.idEquipe),
      })),
    ];
  }, [references.equipes, values.idEquipe]);

  function updateValue<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function findMateriel(idMateriel: string) {
    if (!idMateriel) return null;

    return (
      references.materiels.find(
        (materiel) => String(materiel.idMateriel) === idMateriel,
      ) ?? null
    );
  }

  function handleDemandeChange(value: string) {
    const demande = references.demandes.find(
      (item) => String(item.idDemande) === value,
    );

    const demandeMaterielId = getDemandeMaterielId(demande);
    const demandePointStructureId = getDemandePointStructureId(demande);

    setValues((current) => {
      if (!value) {
        return {
          ...current,
          idDemande: '',
        };
      }

      const nextMaterielId = demandeMaterielId || current.idMateriel;
      const nextMateriel = findMateriel(nextMaterielId);
      const pointFromMateriel = getMaterielPointStructureId(nextMateriel);

      return {
        ...current,
        idDemande: value,
        idMateriel: nextMaterielId,
        idPointStructure:
          demandePointStructureId ||
          pointFromMateriel ||
          current.idPointStructure,
      };
    });
  }

  function handleMaterielChange(value: string) {
    const materiel = findMateriel(value);

    setValues((current) => ({
      ...current,
      idMateriel: value,
      idPointStructure: value ? getMaterielPointStructureId(materiel) : '',
    }));
  }

  function handlePlanChange(value: string) {
    const plan = references.plansPreventifs.find(
      (item) => String(item.idPlanPreventif) === value,
    );

    const declencheur =
      plan?.plan_preventif_declencheur?.[0] ??
      references.declencheurs.find(
        (item) => String(item.idPlanPreventif) === value,
      );

    setValues((current) => {
      if (!value) {
        return {
          ...current,
          idPlanPreventif: '',
          idPlanPreventifDeclencheur: '',
        };
      }

      const nextMaterielId =
        toInputValue(declencheur?.idMateriel) ||
        toInputValue(plan?.idMateriel) ||
        current.idMateriel;

      const materiel = findMateriel(nextMaterielId);
      const pointFromMateriel = getMaterielPointStructureId(materiel);

      return {
        ...current,
        idDemande: '',
        idPlanPreventif: value,
        idPlanPreventifDeclencheur: toInputValue(
          declencheur?.idPlanPreventifDeclencheur,
        ),
        idMateriel: nextMaterielId,
        idPointStructure:
          toInputValue(declencheur?.idPointStructure) ||
          toInputValue(plan?.idPointStructure) ||
          pointFromMateriel ||
          current.idPointStructure,
        idGamme: toInputValue(declencheur?.idGamme) || current.idGamme,
      };
    });
  }

  function handleDeclencheurChange(value: string) {
    const declencheur = references.declencheurs.find(
      (item) => String(item.idPlanPreventifDeclencheur) === value,
    );

    setValues((current) => {
      if (!value) {
        return {
          ...current,
          idPlanPreventifDeclencheur: '',
        };
      }

      const nextMaterielId =
        toInputValue(declencheur?.idMateriel) || current.idMateriel;

      const materiel = findMateriel(nextMaterielId);
      const pointFromMateriel = getMaterielPointStructureId(materiel);

      return {
        ...current,
        idPlanPreventifDeclencheur: value,
        idPlanPreventif:
          toInputValue(declencheur?.idPlanPreventif) ||
          current.idPlanPreventif,
        idMateriel: nextMaterielId,
        idPointStructure:
          toInputValue(declencheur?.idPointStructure) ||
          pointFromMateriel ||
          current.idPointStructure,
        idGamme: toInputValue(declencheur?.idGamme) || current.idGamme,
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateInterventionDto | UpdateInterventionDto = {
      code: emptyToUndefined(values.code),
      libelle: emptyToUndefined(values.libelle),
      description: emptyToUndefined(values.description),
      typeMaintenance: values.typeMaintenance,
      typeIntervention: emptyToUndefined(values.typeIntervention),
      natureIntervention: emptyToUndefined(values.natureIntervention),
      priorite: emptyToUndefined(values.priorite),
      criticite: emptyToUndefined(values.criticite),
      centreCout: emptyToUndefined(values.centreCout),
      idMateriel: parseOptionalInt(values.idMateriel),
      idPointStructure: parseOptionalInt(values.idPointStructure),
      idDemande: values.idPlanPreventif
        ? undefined
        : parseOptionalInt(values.idDemande),
      idGamme: parseOptionalInt(values.idGamme),
      idEquipe: parseOptionalInt(values.idEquipe),
      idPlanPreventif: parseOptionalInt(values.idPlanPreventif),
      idPlanPreventifDeclencheur: parseOptionalInt(
        values.idPlanPreventifDeclencheur,
      ),
      dateDebutPrevue: localDateToIso(values.dateDebutPrevue),
      dateFinPrevue: localDateToIso(values.dateFinPrevue),
      dateSouhaiteeFin: localDateToIso(values.dateSouhaiteeFin),
      chargePrevue: parseOptionalNumber(values.chargePrevue),
      tempsArretPrevu: parseOptionalNumber(values.tempsArretPrevu),
      materielEnPanne: values.materielEnPanne,
      materielIndisponible: values.materielIndisponible,
      arretMateriel: values.arretMateriel,
      receptionTravaux: values.receptionTravaux,
      symptome: emptyToUndefined(values.symptome),
      cause: emptyToUndefined(values.cause),
      remede: emptyToUndefined(values.remede),
      diagnosticInitial: emptyToUndefined(values.diagnosticInitial),
      instructions: emptyToUndefined(values.instructions),
      createdBy: initialIntervention
        ? undefined
        : emptyToUndefined(values.createdBy),
    };

    onSubmit(payload);
  }

  const headerTitle = initialIntervention
    ? 'Modifier une intervention'
    : 'Créer une intervention';

  const headerDescription = initialIntervention
    ? "Mettez à jour les informations de l'ordre de travail sélectionné."
    : "Renseignez les informations nécessaires pour créer un ordre de travail.";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1250px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      {showHeader && (
        <div className="flex flex-col gap-5 bg-[#06475a] px-7 py-7 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/10">
              <ClipboardList size={31} />
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.45em] text-cyan-100">
                Module maintenance
              </p>

              <h1 className="break-words text-3xl font-black leading-tight text-white md:text-4xl">
                {headerTitle}
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-cyan-50/90">
                {headerDescription}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={18} />
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !values.typeMaintenance}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : submitLabel}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8 px-7 py-7">
        {referenceError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-black text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{referenceError}</span>
          </div>
        )}

        <AppSection title="Généralités">
          <AppFieldGrid>
            <AppFormField
              label="Intervention"
              help="Laissez vide si le code est généré automatiquement côté backend."
            >
              <input
                value={values.code}
                onChange={(event) => updateValue('code', event.target.value)}
                className={inputClassName}
                placeholder="Auto si vide"
              />
            </AppFormField>

            <AppFormField label="Titre">
              <input
                value={values.libelle}
                onChange={(event) =>
                  updateValue('libelle', event.target.value)
                }
                className={inputClassName}
                placeholder="Ex : Remplacement roulement"
              />
            </AppFormField>

            <AppFormField label="Centre de coût">
              <input
                value={values.centreCout}
                onChange={(event) =>
                  updateValue('centreCout', event.target.value)
                }
                className={inputClassName}
                placeholder="Ex : MAINT-BMT"
              />
            </AppFormField>

            <AppFormField label="Nature">
              <input
                value={values.natureIntervention}
                onChange={(event) =>
                  updateValue('natureIntervention', event.target.value)
                }
                className={inputClassName}
                placeholder="Ex : CURATIF"
              />
            </AppFormField>

            <AppFormField label="Regroupement" required>
              <SelectControl
                value={values.typeMaintenance}
                onChange={(value) => updateValue('typeMaintenance', value)}
                placeholder="Sélectionner"
                items={[
                  { value: 'CORRECTIF', label: 'Correctif' },
                  { value: 'PREVENTIF', label: 'Préventif' },
                  { value: 'CONDITIONNEL', label: 'Conditionnel / diagnostic' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Priorité">
              <SelectControl
                value={values.priorite}
                onChange={(value) => updateValue('priorite', value)}
                placeholder="Sélectionner"
                items={[
                  { value: 'BASSE', label: 'Basse' },
                  { value: 'NORMALE', label: 'Normale' },
                  { value: 'HAUTE', label: 'Haute' },
                  { value: 'URGENTE', label: 'Urgente' },
                ]}
              />
            </AppFormField>
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Dates">
          <AppFieldGrid>
            <AppFormField label="Date de début">
              <input
                type="datetime-local"
                value={values.dateDebutPrevue}
                onChange={(event) =>
                  updateValue('dateDebutPrevue', event.target.value)
                }
                className={inputClassName}
              />
            </AppFormField>

            <AppFormField label="Date de fin">
              <input
                type="datetime-local"
                value={values.dateFinPrevue}
                onChange={(event) =>
                  updateValue('dateFinPrevue', event.target.value)
                }
                className={inputClassName}
              />
            </AppFormField>

            <AppFormField label="Date souhaitée de fin">
              <input
                type="datetime-local"
                value={values.dateSouhaiteeFin}
                onChange={(event) =>
                  updateValue('dateSouhaiteeFin', event.target.value)
                }
                className={inputClassName}
              />
            </AppFormField>

            <AppFormField label="Criticité">
              <SelectControl
                value={values.criticite}
                onChange={(value) => updateValue('criticite', value)}
                placeholder="Sélectionner"
                items={[
                  { value: 'FAIBLE', label: 'Faible' },
                  { value: 'MOYENNE', label: 'Moyenne' },
                  { value: 'ELEVEE', label: 'Élevée' },
                  { value: 'CRITIQUE', label: 'Critique' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Charge prévue">
              <input
                type="number"
                step="0.01"
                value={values.chargePrevue}
                onChange={(event) =>
                  updateValue('chargePrevue', event.target.value)
                }
                className={inputClassName}
                placeholder="0.00"
              />
            </AppFormField>

            <AppFormField label="Temps d’arrêt prévu">
              <input
                type="number"
                step="0.01"
                value={values.tempsArretPrevu}
                onChange={(event) =>
                  updateValue('tempsArretPrevu', event.target.value)
                }
                className={inputClassName}
                placeholder="0.00"
              />
            </AppFormField>
          </AppFieldGrid>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SwitchCard
              title="Réception des travaux"
              description="Contrôle ou réception nécessaire après réalisation."
              checked={values.receptionTravaux}
              onChange={(checked) => updateValue('receptionTravaux', checked)}
            />

            <SwitchCard
              title="Matériel en panne"
              description="Le matériel présente une panne ou une anomalie."
              checked={values.materielEnPanne}
              onChange={(checked) => updateValue('materielEnPanne', checked)}
            />

            <SwitchCard
              title="Matériel indisponible"
              description="Le matériel ne peut plus être exploité."
              checked={values.materielIndisponible}
              onChange={(checked) =>
                updateValue('materielIndisponible', checked)
              }
            />

            <SwitchCard
              title="Arrêt matériel"
              description="L’intervention entraîne ou constate un arrêt."
              checked={values.arretMateriel}
              onChange={(checked) => updateValue('arretMateriel', checked)}
            />
          </div>
        </AppSection>

        <AppSection title="Équipements">
          <AppFieldGrid>
            <AppFormField
              label="Point de structure"
              help="Se remplit automatiquement depuis le matériel ou depuis la DI si disponible."
            >
              <SelectControl
                value={values.idPointStructure}
                onChange={(value) => updateValue('idPointStructure', value)}
                placeholder="Auto depuis le matériel"
                clearLabel="Auto depuis le matériel"
                items={pointStructureOptions}
              />
            </AppFormField>

            <AppFormField
              label="Matériel"
              help="Se remplit automatiquement si la DI sélectionnée contient un matériel."
            >
              <SelectControl
                value={values.idMateriel}
                onChange={handleMaterielChange}
                placeholder="Sélectionner un matériel"
                clearLabel="Aucun matériel sélectionné"
                items={materielOptions}
              />
            </AppFormField>
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Origine">
          <AppFieldGrid>
            <AppFormField
              label="DI"
              help={
                values.idPlanPreventif
                  ? 'Indisponible car un plan préventif est sélectionné.'
                  : 'Sélectionnez une DI uniquement pour une intervention corrective.'
              }
            >
              <SelectControl
                value={values.idDemande}
                onChange={handleDemandeChange}
                placeholder="Aucune DI liée"
                clearLabel="Aucune DI liée"
                items={demandeOptions}
                disabled={Boolean(values.idPlanPreventif)}
                disabledLabel="Aucune DI liée"
              />
            </AppFormField>

            <AppFormField label="Plan préventif">
              <SelectControl
                value={values.idPlanPreventif}
                onChange={handlePlanChange}
                placeholder="Aucun plan préventif"
                clearLabel="Aucun plan préventif"
                items={planOptions}
              />
            </AppFormField>

            <AppFormField label="Déclencheur">
              <SelectControl
                value={values.idPlanPreventifDeclencheur}
                onChange={handleDeclencheurChange}
                placeholder="Auto depuis le plan"
                clearLabel="Auto depuis le plan"
                items={declencheurOptions}
              />
            </AppFormField>

            <AppFormField label="Gamme">
              <SelectControl
                value={values.idGamme}
                onChange={(value) => updateValue('idGamme', value)}
                placeholder="Auto depuis le déclencheur"
                clearLabel="Auto depuis le déclencheur"
                items={gammeOptions}
              />
            </AppFormField>

            <AppFormField label="Type">
              <input
                value={values.typeIntervention}
                onChange={(event) =>
                  updateValue('typeIntervention', event.target.value)
                }
                className={inputClassName}
                placeholder="TRAVAUX, CONTROLE..."
              />
            </AppFormField>
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Ressources">
          <AppFieldGrid>
            <AppFormField label="Équipe">
              <SelectControl
                value={values.idEquipe}
                onChange={(value) => updateValue('idEquipe', value)}
                placeholder="Aucune équipe"
                clearLabel="Aucune équipe"
                items={equipeOptions}
              />
            </AppFormField>

            <AppFormField label="Émetteur">
              <input
                value={values.createdBy}
                onChange={(event) =>
                  updateValue('createdBy', event.target.value)
                }
                className={inputClassName}
                disabled={Boolean(initialIntervention)}
                placeholder="Admin"
              />
            </AppFormField>
          </AppFieldGrid>
        </AppSection>

        <AppSection title="Dépannage">
          <AppFieldGrid>
            <AppFormField label="Symptôme">
              <input
                value={values.symptome}
                onChange={(event) =>
                  updateValue('symptome', event.target.value)
                }
                className={inputClassName}
                placeholder="Ex : bruit anormal, fuite, arrêt..."
              />
            </AppFormField>

            <AppFormField label="Cause">
              <input
                value={values.cause}
                onChange={(event) => updateValue('cause', event.target.value)}
                className={inputClassName}
                placeholder="Cause probable si connue"
              />
            </AppFormField>

            <AppFormField label="Remède">
              <input
                value={values.remede}
                onChange={(event) => updateValue('remede', event.target.value)}
                className={inputClassName}
                placeholder="Action ou solution prévue"
              />
            </AppFormField>

            <InfoCard
              icon={<ShieldCheck size={18} />}
              title="Suivi technique"
              description="Ces informations facilitent le diagnostic et le compte rendu final."
            />
          </AppFieldGrid>

          <AppFormField label="Description">
            <textarea
              value={values.description}
              onChange={(event) =>
                updateValue('description', event.target.value)
              }
              className={textareaClassName}
              placeholder="Décrivez clairement le besoin, la panne ou les travaux à réaliser..."
            />
          </AppFormField>

          <AppFormField label="Diagnostic initial">
            <textarea
              value={values.diagnosticInitial}
              onChange={(event) =>
                updateValue('diagnosticInitial', event.target.value)
              }
              className={textareaClassName}
              placeholder="Saisissez le diagnostic initial si disponible..."
            />
          </AppFormField>

          <AppFormField label="Instructions">
            <textarea
              value={values.instructions}
              onChange={(event) =>
                updateValue('instructions', event.target.value)
              }
              className={textareaClassName}
              placeholder="Consignes de sécurité, étapes à suivre, remarques..."
            />
          </AppFormField>
        </AppSection>
      </div>

      {!showHeader && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-7 py-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={appSecondaryButtonClassName}
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !values.typeMaintenance}
            className={appPrimaryButtonClassName}
          >
            {loading ? 'Enregistrement...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

function SelectControl({
  value,
  onChange,
  placeholder,
  clearLabel,
  items,
  disabled = false,
  disabledLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
  items: SelectItem[];
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const normalizedValue = value || EMPTY_SELECT_VALUE;

  const normalizedItems = clearLabel
    ? [{ value: EMPTY_SELECT_VALUE, label: clearLabel }, ...items]
    : items;

  if (disabled) {
    return (
      <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400">
        <span>{disabledLabel || placeholder}</span>
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

function SwitchCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex min-h-[104px] cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-[#06475a]/30 hover:bg-[#f8fbfc]">
      <span className="min-w-0">
        <span className="block text-sm font-black text-slate-950">
          {title}
        </span>

        <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span
        className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-[#06475a]' : 'bg-slate-200'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />

        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </label>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[92px] items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f7fb] text-[#06475a]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function getMissingItem(value: string, exists: boolean, label: string) {
  if (!value || exists) return [];

  return [
    {
      value,
      label: `${label} actuel #${value}`,
    },
  ];
}

function formatCodeLibelle(
  code?: string | null,
  libelle?: string | null,
  id?: number | null,
) {
  return [code, libelle].filter(Boolean).join(' — ') || `#${id ?? ''}`;
}

function formatDemandeLabel(demande: {
  idDemande: number;
  code?: string | null;
  description?: string | null;
}) {
  return (
    [demande.code, demande.description].filter(Boolean).join(' — ') ||
    `DI #${demande.idDemande}`
  );
}

function formatDeclencheurLabel(declencheur: PlanPreventifDeclencheurLite) {
  const periodicite = [
    declencheur.periodiciteValeur,
    declencheur.periodiciteUnite,
  ]
    .filter(Boolean)
    .join(' ');

  const gamme = declencheur.gamme
    ? formatCodeLibelle(
        declencheur.gamme.code,
        declencheur.gamme.libelle,
        declencheur.gamme.idGamme,
      )
    : '';

  return (
    [
      declencheur.typeDeclencheur,
      periodicite || null,
      gamme ? `Gamme ${gamme}` : null,
    ]
      .filter(Boolean)
      .join(' — ') || `Déclencheur #${declencheur.idPlanPreventifDeclencheur}`
  );
}

function getMaterielPointStructureId(materiel?: MaterielLite | null) {
  return (
    toInputValue(materiel?.idPointStructure) ||
    toInputValue(materiel?.point_structure?.idPoint)
  );
}

function getDemandeMaterielId(demande: unknown) {
  return (
    readId(demande, ['idMateriel', 'materielId']) ||
    readNestedId(demande, ['materiel', 'idMateriel']) ||
    readNestedId(demande, ['materiel_concerne', 'idMateriel']) ||
    readNestedId(demande, ['materielConcerne', 'idMateriel'])
  );
}

function getDemandePointStructureId(demande: unknown) {
  return (
    readId(demande, ['idPointStructure', 'idPoint', 'pointStructureId']) ||
    readNestedId(demande, ['point_structure', 'idPoint']) ||
    readNestedId(demande, ['pointStructure', 'idPoint']) ||
    readNestedId(demande, ['point', 'idPoint']) ||
    readNestedId(demande, ['materiel', 'idPointStructure']) ||
    readNestedId(demande, ['materiel', 'point_structure', 'idPoint']) ||
    readNestedId(demande, ['materiel', 'pointStructure', 'idPoint'])
  );
}

function readId(source: unknown, keys: string[]) {
  const record = asRecord(source);

  if (!record) return '';

  for (const key of keys) {
    const value = toInputValue(record[key] as string | number | null);

    if (value) return value;
  }

  return '';
}

function readNestedId(source: unknown, path: string[]) {
  let current: unknown = source;

  for (const key of path) {
    const record = asRecord(current);

    if (!record) return '';

    current = record[key];
  }

  return toInputValue(current as string | number | null);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null;

  return value as Record<string, unknown>;
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalInt(value: string) {
  if (!value.trim()) return undefined;

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
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