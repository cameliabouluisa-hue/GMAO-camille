'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, MapPin, Save } from 'lucide-react';

import { Select } from '@/components/select';
import {
  AppFormField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
  appTextareaClassName,
} from '@/components/app-section-layout';

import { getPointStructureParents } from '../services/point-structure.service';

import type {
  CreatePointStructureDto,
  CriticitePoint,
  EtatPoint,
  PointStructureDetail,
  PointStructureParentOption,
  TypeArborescence,
  TypePointStructure,
  UpdatePointStructureDto,
} from '../types/point-structure.type';

type Mode = 'create' | 'edit';

type FormState = {
  code: string;
  libelle: string;
  description: string;

  typePoint: TypePointStructure;
  typeArborescence: TypeArborescence;
  parentPointId: string;
  ordre: string;

  actif: boolean;
  etat: EtatPoint;

  categorie: string;
  responsable: string;
  organisation: string;
  centreCout: string;

  interventionsAutorisees: boolean;
  criticite: CriticitePoint;
  observationMaintenance: string;

  zoneSensible: boolean;
  accesRestreint: boolean;
  epiObligatoire: boolean;
  consigneSecurite: string;
};

type Props = {
  mode: Mode;
  initialData?: PointStructureDetail | null;
  saving?: boolean;
  error?: string;
  onSubmit: (
    data: CreatePointStructureDto | UpdatePointStructureDto,
  ) => Promise<void>;
  onCancel?: () => void;
};

const DEFAULT_FORM: FormState = {
  code: '',
  libelle: '',
  description: '',

  typePoint: 'GEOGRAPHIQUE',
  typeArborescence: 'GEOGRAPHIQUE',
  parentPointId: 'none',
  ordre: '',

  actif: true,
  etat: 'VALIDE',

  categorie: '',
  responsable: '',
  organisation: '',
  centreCout: '',

  interventionsAutorisees: true,
  criticite: 'MOYENNE',
  observationMaintenance: '',

  zoneSensible: false,
  accesRestreint: false,
  epiObligatoire: false,
  consigneSecurite: '',
};

function toText(value?: string | number | null) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getParentId(initialData?: PointStructureDetail | null) {
  return (
    initialData?.parentPointId ??
    initialData?.placement?.parentPointId ??
    initialData?.parent?.idPoint ??
    null
  );
}

function getOrdre(initialData?: PointStructureDetail | null) {
  return initialData?.ordre ?? initialData?.placement?.ordre ?? null;
}

function buildInitialForm(initialData?: PointStructureDetail | null): FormState {
  if (!initialData) return DEFAULT_FORM;

  const typePoint = initialData.typePoint ?? 'GEOGRAPHIQUE';

  const typeArborescence =
    typePoint === 'GEOGRAPHIQUE'
      ? 'GEOGRAPHIQUE'
      : initialData.typeArborescence ??
        initialData.placement?.typeArborescence ??
        'GEOGRAPHIQUE';

  const parentId = getParentId(initialData);
  const ordre = getOrdre(initialData);

  return {
    code: toText(initialData.code),
    libelle: toText(initialData.libelle),
    description: toText(initialData.description),

    typePoint,
    typeArborescence,

    parentPointId:
      parentId !== null && parentId !== undefined ? String(parentId) : 'none',

    ordre: ordre !== null && ordre !== undefined ? String(ordre) : '',

    actif: initialData.actif !== false,
    etat: initialData.etat ?? 'VALIDE',

    categorie: toText(initialData.categorie),
    responsable: toText(initialData.responsable),
    organisation: toText(initialData.organisation),
    centreCout: toText(initialData.centreCout),

    interventionsAutorisees: initialData.interventionsAutorisees !== false,
    criticite: initialData.criticite ?? 'MOYENNE',
    observationMaintenance: toText(initialData.observationMaintenance),

    zoneSensible: Boolean(initialData.zoneSensible),
    accesRestreint: Boolean(initialData.accesRestreint),
    epiObligatoire: Boolean(initialData.epiObligatoire),
    consigneSecurite: toText(initialData.consigneSecurite),
  };
}

function getParentLabel(parent: PointStructureParentOption) {
  const code = parent.code || `PS-${parent.idPoint}`;
  const libelle = parent.libelle || 'Sans libellé';

  const type =
    parent.typePoint === 'TECHNIQUE' ? 'Technique' : 'Géographique';

  return `${code} — ${libelle} · ${type}`;
}

export function PointStructureFormPage({
  mode,
  initialData,
  saving = false,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(initialData),
  );

  const [parents, setParents] = useState<PointStructureParentOption[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [localError, setLocalError] = useState('');

  const excludeId = initialData?.idPoint;

  const loadParents = useCallback(async () => {
    try {
      setLoadingParents(true);
      setParents([]);

      const data = await getPointStructureParents({
        typePoint: form.typeArborescence,
        excludeId,
      });

      setParents(data ?? []);
    } catch {
      setParents([]);
    } finally {
      setLoadingParents(false);
    }
  }, [form.typeArborescence, excludeId]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData]);

  const arborescenceItems = useMemo(() => {
    if (form.typePoint === 'GEOGRAPHIQUE') {
      return [{ label: 'Géographique', value: 'GEOGRAPHIQUE' }];
    }

    return [
      { label: 'Géographique', value: 'GEOGRAPHIQUE' },
      { label: 'Technique', value: 'TECHNIQUE' },
    ];
  }, [form.typePoint]);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      return parent.typePoint === form.typeArborescence;
    });
  }, [parents, form.typeArborescence]);

  const parentOptions = useMemo(() => {
    return [
      { value: 'none', label: 'Aucun parent' },
      ...filteredParents.map((parent) => ({
        value: String(parent.idPoint),
        label: getParentLabel(parent),
      })),
    ];
  }, [filteredParents]);

  const selectedParent = useMemo(() => {
    if (form.parentPointId === 'none') return null;

    return (
      filteredParents.find(
        (parent) => String(parent.idPoint) === form.parentPointId,
      ) ?? null
    );
  }, [filteredParents, form.parentPointId]);

  useEffect(() => {
    if (loadingParents || form.parentPointId === 'none') return;

    const exists = filteredParents.some(
      (parent) => String(parent.idPoint) === form.parentPointId,
    );

    if (!exists) {
      setForm((previous) => ({
        ...previous,
        parentPointId: 'none',
      }));
    }
  }, [filteredParents, form.parentPointId, loadingParents]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleTypePointChange(typePoint: TypePointStructure) {
    setForm((previous) => ({
      ...previous,
      typePoint,
      typeArborescence:
        typePoint === 'GEOGRAPHIQUE'
          ? 'GEOGRAPHIQUE'
          : previous.typeArborescence,
      parentPointId: 'none',
    }));
  }

  function handleTypeArborescenceChange(typeArborescence: TypeArborescence) {
    if (form.typePoint === 'GEOGRAPHIQUE' && typeArborescence === 'TECHNIQUE') {
      return;
    }

    setForm((previous) => ({
      ...previous,
      typeArborescence,
      parentPointId: 'none',
    }));
  }

  function buildPayload(): CreatePointStructureDto | UpdatePointStructureDto {
    return {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      description: nullableText(form.description),

      typePoint: form.typePoint,
      typeArborescence:
        form.typePoint === 'GEOGRAPHIQUE'
          ? 'GEOGRAPHIQUE'
          : form.typeArborescence,

      parentPointId:
        form.parentPointId !== 'none' ? Number(form.parentPointId) : null,

      ordre: form.ordre !== '' ? Number(form.ordre) : null,

      actif: form.actif,
      etat: form.etat,

      categorie: nullableText(form.categorie),
      responsable: nullableText(form.responsable),
      organisation: nullableText(form.organisation),
      centreCout: nullableText(form.centreCout),

      interventionsAutorisees: form.interventionsAutorisees,
      criticite: form.criticite,
      observationMaintenance: nullableText(form.observationMaintenance),

      zoneSensible: form.zoneSensible,
      accesRestreint: form.accesRestreint,
      epiObligatoire: form.epiObligatoire,
      consigneSecurite: nullableText(form.consigneSecurite),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError('');

    if (!form.code.trim()) {
      setLocalError('Le code du point de structure est obligatoire.');
      return;
    }

    if (!form.libelle.trim()) {
      setLocalError('Le libellé du point de structure est obligatoire.');
      return;
    }

    if (
      form.typePoint === 'GEOGRAPHIQUE' &&
      form.typeArborescence === 'TECHNIQUE'
    ) {
      setLocalError(
        'Un point géographique ne peut pas être placé dans une arborescence technique.',
      );
      return;
    }

    await onSubmit(buildPayload());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <MapPin size={28} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                Point de structure
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {mode === 'create'
                  ? 'Nouveau point de structure'
                  : 'Modifier le point de structure'}
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/85">
                Renseignez les informations géographiques, techniques et de
                maintenance du point.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} className={saving ? 'animate-pulse' : ''} />
            {mode === 'create' ? 'Créer le point' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {(error || localError) && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error || localError}
          </div>
        )}

        <AppSection title="Informations générales">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField label="Code" required>
              <input
                value={form.code}
                onChange={(event) => updateField('code', event.target.value)}
                placeholder="Exemple : GEO_ATELIER"
                className={appInputClassName}
              />
            </AppFormField>

            <AppFormField label="Libellé" required>
              <input
                value={form.libelle}
                onChange={(event) => updateField('libelle', event.target.value)}
                placeholder="Exemple : Atelier électrique"
                className={appInputClassName}
              />
            </AppFormField>

            <AppFormField label="Type de point">
              <Select
                value={form.typePoint}
                onValueChange={(value) =>
                  handleTypePointChange(value as TypePointStructure)
                }
                items={[
                  { label: 'Géographique', value: 'GEOGRAPHIQUE' },
                  { label: 'Technique', value: 'TECHNIQUE' },
                ]}
              />
            </AppFormField>

            <AppFormField label="État">
              <Select
                value={form.etat}
                onValueChange={(value) =>
                  updateField('etat', value as EtatPoint)
                }
                items={[
                  { label: 'Brouillon', value: 'BROUILLON' },
                  { label: 'Validé', value: 'VALIDE' },
                  { label: 'Archivé', value: 'ARCHIVE' },
                ]}
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

            <AppFormField label="Catégorie">
              <input
                value={form.categorie}
                onChange={(event) =>
                  updateField('categorie', event.target.value)
                }
                placeholder="Exemple : Zone maintenance"
                className={appInputClassName}
              />
            </AppFormField>
          </div>

          <AppFormField label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Description du point de structure..."
              className={appTextareaClassName}
            />
          </AppFormField>
        </AppSection>

        <AppSection title="Arborescence">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField
              label="Type d’arborescence"
              help={
                form.typePoint === 'GEOGRAPHIQUE'
                  ? 'Un point géographique appartient obligatoirement à une arborescence géographique.'
                  : 'Le parent affiché dépend du type d’arborescence choisi.'
              }
            >
              <Select
                value={form.typeArborescence}
                onValueChange={(value) =>
                  handleTypeArborescenceChange(value as TypeArborescence)
                }
                items={arborescenceItems}
              />
            </AppFormField>

            <AppFormField
              label="Point parent"
              help={
                loadingParents
                  ? 'Chargement des points parents...'
                  : selectedParent
                    ? `Parent : ${
                        selectedParent.code ? `${selectedParent.code} — ` : ''
                      }${selectedParent.libelle ?? ''}`
                    : form.typeArborescence === 'TECHNIQUE'
                      ? 'Seuls les points techniques sont affichés.'
                      : 'Seuls les points géographiques sont affichés.'
              }
            >
              <Select
                value={form.parentPointId}
                onValueChange={(value) => updateField('parentPointId', value)}
                items={parentOptions}
              />
            </AppFormField>

            <AppFormField label="Ordre d’affichage">
              <input
                type="number"
                min="0"
                value={form.ordre}
                onChange={(event) => updateField('ordre', event.target.value)}
                placeholder="Exemple : 1"
                className={appInputClassName}
              />
            </AppFormField>
          </div>
        </AppSection>

        <AppSection title="Organisation">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField label="Responsable">
              <input
                value={form.responsable}
                onChange={(event) =>
                  updateField('responsable', event.target.value)
                }
                placeholder="Nom du responsable"
                className={appInputClassName}
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

            <AppFormField label="Centre de coût">
              <input
                value={form.centreCout}
                onChange={(event) =>
                  updateField('centreCout', event.target.value)
                }
                placeholder="Exemple : CC-MAINT"
                className={appInputClassName}
              />
            </AppFormField>
          </div>
        </AppSection>

        <AppSection title="Maintenance">
          <div className="grid gap-x-8 md:grid-cols-2">
            <AppFormField label="Interventions autorisées">
              <Select
                value={form.interventionsAutorisees ? 'true' : 'false'}
                onValueChange={(value) =>
                  updateField('interventionsAutorisees', value === 'true')
                }
                items={[
                  { label: 'Oui', value: 'true' },
                  { label: 'Non', value: 'false' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Criticité">
              <Select
                value={form.criticite}
                onValueChange={(value) =>
                  updateField('criticite', value as CriticitePoint)
                }
                items={[
                  { label: 'Faible', value: 'FAIBLE' },
                  { label: 'Moyenne', value: 'MOYENNE' },
                  { label: 'Élevée', value: 'ELEVEE' },
                  { label: 'Critique', value: 'CRITIQUE' },
                ]}
              />
            </AppFormField>
          </div>

          <AppFormField label="Observation maintenance">
            <textarea
              value={form.observationMaintenance}
              onChange={(event) =>
                updateField('observationMaintenance', event.target.value)
              }
              placeholder="Observations liées à la maintenance..."
              className={appTextareaClassName}
            />
          </AppFormField>
        </AppSection>

        <AppSection title="Sécurité">
          <div className="grid gap-x-8 md:grid-cols-3">
            <AppFormField label="Zone sensible">
              <Select
                value={form.zoneSensible ? 'true' : 'false'}
                onValueChange={(value) =>
                  updateField('zoneSensible', value === 'true')
                }
                items={[
                  { label: 'Oui', value: 'true' },
                  { label: 'Non', value: 'false' },
                ]}
              />
            </AppFormField>

            <AppFormField label="Accès restreint">
              <Select
                value={form.accesRestreint ? 'true' : 'false'}
                onValueChange={(value) =>
                  updateField('accesRestreint', value === 'true')
                }
                items={[
                  { label: 'Oui', value: 'true' },
                  { label: 'Non', value: 'false' },
                ]}
              />
            </AppFormField>

            <AppFormField label="EPI obligatoire">
              <Select
                value={form.epiObligatoire ? 'true' : 'false'}
                onValueChange={(value) =>
                  updateField('epiObligatoire', value === 'true')
                }
                items={[
                  { label: 'Oui', value: 'true' },
                  { label: 'Non', value: 'false' },
                ]}
              />
            </AppFormField>
          </div>

          <AppFormField label="Consigne de sécurité">
            <textarea
              value={form.consigneSecurite}
              onChange={(event) =>
                updateField('consigneSecurite', event.target.value)
              }
              placeholder="Consignes de sécurité à respecter..."
              className={appTextareaClassName}
            />
          </AppFormField>
        </AppSection>

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
            disabled={saving}
            className={appPrimaryButtonClassName}
          >
            <Save size={17} className={saving ? 'animate-pulse' : ''} />
            {mode === 'create' ? 'Créer le point' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}