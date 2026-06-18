'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Wrench } from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppSection,
  AppFormField,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';
import { API_BASE_URL } from '@/lib/api';

import type {
  CreateGammePayload,
  Gamme,
  UpdateGammePayload,
} from '../types/gamme.types';

type ModeleOption = {
  idModele: number;
  code?: string | null;
  libelle?: string | null;
};

type MaterielOption = {
  idMateriel: number;
  code?: string | null;
  libelle?: string | null;
  numeroSerie?: string | null;
  idModele?: number | null;
  modele?: {
    idModele: number;
    code?: string | null;
    libelle?: string | null;
  } | null;
};

type GammeFormValues = {
  code: string;
  libelle: string;
  typeMaintenance: string;
  etat: string;
  organisation: string;
  idModele: string;
  idMateriel: string;
  jourFin: string;
  chargePrevue: string;
  tempsArret: string;
  receptionTravaux: boolean;
  actif: boolean;
};

type Props = {
  initialData?: Gamme | null;
  submitting?: boolean;
  submitLabel?: string;
  formId?: string;
showHeader?: boolean;
showFooterActions?: boolean;
  onSubmit: (payload: CreateGammePayload | UpdateGammePayload) => Promise<void>;
  onCancel?: () => void;
};

async function getModeles(): Promise<ModeleOption[]> {
  const response = await fetch(`${API_BASE_URL}/modeles`, {
    cache: 'no-store',
  });

  if (!response.ok) return [];

  return response.json();
}

async function getMateriels(): Promise<MaterielOption[]> {
  const response = await fetch(`${API_BASE_URL}/materiels`, {
    cache: 'no-store',
  });

  if (!response.ok) return [];

  return response.json();
}

function getModeleLabel(modele: ModeleOption) {
  if (modele.code && modele.libelle) return `${modele.code} — ${modele.libelle}`;
  if (modele.code) return modele.code;
  if (modele.libelle) return modele.libelle;

  return `Modèle #${modele.idModele}`;
}

function getMaterielLabel(materiel: MaterielOption) {
  const base =
    materiel.code && materiel.libelle
      ? `${materiel.code} — ${materiel.libelle}`
      : materiel.code ||
        materiel.libelle ||
        `Matériel #${materiel.idMateriel}`;

  if (materiel.numeroSerie) {
    return `${base} · Série ${materiel.numeroSerie}`;
  }

  return base;
}

function getMaterielModeleId(materiel?: MaterielOption | null) {
  return materiel?.idModele ?? materiel?.modele?.idModele ?? null;
}

function getInitialValues(initialData?: Gamme | null): GammeFormValues {
  return {
    code: initialData?.code ?? '',
    libelle: initialData?.libelle ?? '',
    typeMaintenance: initialData?.typeMaintenance ?? 'PREVENTIF',
    etat: initialData?.etat ?? 'BROUILLON',
    organisation: initialData?.organisation ?? '',
    idModele:
      initialData?.idModele !== null && initialData?.idModele !== undefined
        ? String(initialData.idModele)
        : 'none',
    idMateriel:
      initialData?.idMateriel !== null && initialData?.idMateriel !== undefined
        ? String(initialData.idMateriel)
        : 'none',
    jourFin:
      initialData?.jourFin !== null && initialData?.jourFin !== undefined
        ? String(initialData.jourFin)
        : '',
    chargePrevue:
      initialData?.chargePrevue !== null &&
      initialData?.chargePrevue !== undefined
        ? String(initialData.chargePrevue)
        : '',
    tempsArret:
      initialData?.tempsArret !== null && initialData?.tempsArret !== undefined
        ? String(initialData.tempsArret)
        : '',
    receptionTravaux: Boolean(initialData?.receptionTravaux),
    actif: initialData?.actif !== false,
  };
}

export default function GammeForm({
  initialData,
  submitting = false,
  submitLabel = 'Enregistrer',
  formId,
showHeader = true,
showFooterActions = true,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<GammeFormValues>(() =>
    getInitialValues(initialData),
  );

  const [modeles, setModeles] = useState<ModeleOption[]>([]);
  const [materiels, setMateriels] = useState<MaterielOption[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [error, setError] = useState('');

  const loadReferentiels = useCallback(async () => {
    try {
      setLoadingRefs(true);
      setError('');

      const [modelesData, materielsData] = await Promise.all([
        getModeles(),
        getMateriels(),
      ]);

      setModeles(modelesData);
      setMateriels(materielsData);
    } catch {
      setError('Erreur lors du chargement des modèles et matériels.');
    } finally {
      setLoadingRefs(false);
    }
  }, []);

  useEffect(() => {
    loadReferentiels();
  }, [loadReferentiels]);

  useEffect(() => {
    setForm(getInitialValues(initialData));
  }, [initialData]);

  const modeleOptions = useMemo(() => {
    return [
      { value: 'none', label: 'Aucun modèle' },
      ...modeles.map((modele) => ({
        value: String(modele.idModele),
        label: getModeleLabel(modele),
      })),
    ];
  }, [modeles]);

  const filteredMateriels = useMemo(() => {
    if (form.idModele === 'none') return materiels;

    return materiels.filter((materiel) => {
      const materielModeleId = getMaterielModeleId(materiel);

      return Number(materielModeleId) === Number(form.idModele);
    });
  }, [materiels, form.idModele]);

  const materielOptions = useMemo(() => {
    return [
      { value: 'none', label: 'Aucun matériel spécifique' },
      ...filteredMateriels.map((materiel) => ({
        value: String(materiel.idMateriel),
        label: getMaterielLabel(materiel),
      })),
    ];
  }, [filteredMateriels]);

  function updateField<K extends keyof GammeFormValues>(
    key: K,
    value: GammeFormValues[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleModeleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      idModele: value,
      idMateriel: 'none',
    }));
  }

  function handleMaterielChange(value: string) {
    const selectedMateriel = materiels.find(
      (materiel) => materiel.idMateriel === Number(value),
    );

    const materielModeleId = getMaterielModeleId(selectedMateriel);

    setForm((prev) => ({
      ...prev,
      idMateriel: value,
      idModele:
        value !== 'none' && materielModeleId
          ? String(materielModeleId)
          : prev.idModele,
    }));
  }

  function buildPayload(): CreateGammePayload | UpdateGammePayload {
    return {
      code: form.code.trim() || undefined,
      libelle: form.libelle.trim() || undefined,
      typeMaintenance: form.typeMaintenance || undefined,
      etat: form.etat || undefined,
      organisation: form.organisation.trim() || undefined,

      idModele:
        form.idModele !== 'none' && form.idModele !== ''
          ? Number(form.idModele)
          : null,

      idMateriel:
        form.idMateriel !== 'none' && form.idMateriel !== ''
          ? Number(form.idMateriel)
          : null,

      jourFin: form.jourFin !== '' ? Number(form.jourFin) : undefined,
      chargePrevue:
        form.chargePrevue !== '' ? Number(form.chargePrevue) : undefined,
      tempsArret:
        form.tempsArret !== '' ? Number(form.tempsArret) : undefined,

      receptionTravaux: form.receptionTravaux,
      actif: form.actif,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!form.libelle.trim()) {
      setError('Le libellé de la gamme est obligatoire.');
      return;
    }

    if (form.idModele !== 'none' && form.idMateriel !== 'none') {
      const selectedMateriel = materiels.find(
        (materiel) => materiel.idMateriel === Number(form.idMateriel),
      );

      const materielModeleId = getMaterielModeleId(selectedMateriel);

      if (
        materielModeleId &&
        Number(materielModeleId) !== Number(form.idModele)
      ) {
        setError('Le matériel sélectionné n’appartient pas au modèle choisi.');
        return;
      }
    }

    await onSubmit(buildPayload());
  }

  return (
    <form
  id={formId}
  onSubmit={handleSubmit}
  className={
    showHeader
      ? 'overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm'
      : 'space-y-6'
  }
>
      {showHeader && (
      <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Wrench size={28} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                Gamme de maintenance
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {initialData ? 'Modifier la gamme' : 'Nouvelle gamme'}
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/85">
                Associez la gamme à un modèle ou à un matériel précis.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingRefs}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} className={submitting ? 'animate-pulse' : ''} />
            {submitLabel}
          </button>
        </div>
      </div>
      )}
      <div className="space-y-6 p-6">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <AppSection title="Informations générales">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField label="Code">
              <input
                value={form.code}
                onChange={(event) => updateField('code', event.target.value)}
                placeholder="Exemple : GAM-001"
                className={appInputClassName}
              />
            </AppFormField>

            <AppFormField label="Libellé" required>
              <input
                value={form.libelle}
                onChange={(event) => updateField('libelle', event.target.value)}
                placeholder="Exemple : Vidange groupe électrogène"
                className={appInputClassName}
              />
            </AppFormField>

            <AppFormField label="Type maintenance">
              <Select
                value={form.typeMaintenance}
                onValueChange={(value) =>
                  updateField('typeMaintenance', value)
                }
                items={[
                  { label: 'Préventif', value: 'PREVENTIF' },
                  { label: 'Correctif', value: 'CORRECTIF' },
                  { label: 'Conditionnel', value: 'CONDITIONNEL' },
                ]}
              />
            </AppFormField>

            <AppFormField label="État">
              <Select
                value={form.etat}
                onValueChange={(value) => updateField('etat', value)}
                items={[
                  { label: 'Brouillon', value: 'BROUILLON' },
                  { label: 'Validée', value: 'VALIDE' },
                  { label: 'Archivée', value: 'ARCHIVE' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Organisation">
              <input
                value={form.organisation}
                onChange={(event) =>
                  updateField('organisation', event.target.value)
                }
                placeholder="Exemple : Maintenance"
                className={appInputClassName}
              />
            </AppFormField>

            <AppFormField label="Actif">
              <Select
                value={form.actif ? 'true' : 'false'}
                onValueChange={(value) => updateField('actif', value === 'true')}
                items={[
                  { label: 'Actif', value: 'true' },
                  { label: 'Inactif', value: 'false' },
                ]}
              />
            </AppFormField>
          </div>
        </AppSection>

        <AppSection title="Association équipement">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField
              label="Modèle"
              help="Quand un modèle est choisi, la liste des matériels est filtrée automatiquement."
            >
              <Select
                value={form.idModele}
                onValueChange={handleModeleChange}
                placeholder="Sélectionner un modèle"
                items={modeleOptions}
              />
            </AppFormField>

            <AppFormField
              label="Matériel"
              help="Quand un matériel est choisi, son modèle est rempli automatiquement."
            >
              <Select
                value={form.idMateriel}
                onValueChange={handleMaterielChange}
                placeholder="Sélectionner un matériel"
                items={materielOptions}
              />
            </AppFormField>
          </div>
        </AppSection>

       
      {showFooterActions && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={appSecondaryButtonClassName}
            >
              <ArrowLeft size={17} />
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || loadingRefs}
            className={appPrimaryButtonClassName}
          >
            <Save size={17} className={submitting ? 'animate-pulse' : ''} />
            {submitLabel}
          </button>
        </div>
         )}
      </div>
       
    </form>
  );
}