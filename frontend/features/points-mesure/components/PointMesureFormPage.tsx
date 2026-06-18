

import { Select } from '@/components/select';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Bell,
  FileText,
  Gauge,
  Link2,
  MapPin,
  Ruler,
  Save,
  Server,
  Settings2,
  ShieldAlert,
  X,
} from 'lucide-react';

import {
  getMaterielsOptions,
  getPointsStructureOptions,
} from '../services/point-mesure.service';

import type {
  AssociationPointMesure,
  CreatePointMesurePayload,
  MaterielOption,
  PointMesure,
  PointMesureType,
  PointStructureOption,
  UpdatePointMesurePayload,
} from '../types/point-mesure.types';

type Mode = 'create' | 'edit';

type FormState = {
  code: string;
  libelle: string;
  type: PointMesureType;
  unite: string;
  organisation: string;

  association: AssociationPointMesure;
  idMateriel: string;
  idPointStructure: string;

  valeurMin: string;
  valeurMax: string;
  nbDecimales: string;
  periodeReleveJours: string;

  surveillanceMin: string;
  surveillanceMax: string;
  correctionMin: string;
  correctionMax: string;

  emettreDi: boolean;
  envoyerAlerte: boolean;
  actif: boolean;
};

type Props = {
  mode: Mode;
  initialData?: Partial<PointMesure> | null;
  onSubmit: (
    data: CreatePointMesurePayload | UpdatePointMesurePayload,
  ) => Promise<void>;
};

const NONE_VALUE = '__NONE__';

const DEFAULT_FORM: FormState = {
  code: '',
  libelle: '',
  type: 'COMPTEUR',
  unite: 'h',
  organisation: 'BMT',

  association: 'MATERIEL',
  idMateriel: '',
  idPointStructure: '',

  valeurMin: '',
  valeurMax: '',
  nbDecimales: '2',
  periodeReleveJours: '',

  surveillanceMin: '',
  surveillanceMax: '',
  correctionMin: '',
  correctionMax: '',

  emettreDi: false,
  envoyerAlerte: false,
  actif: true,
};

const TYPE_ITEMS = [
  { label: 'Compteur', value: 'COMPTEUR' },
  { label: 'Conditionnel', value: 'CONDITIONNEL' },
];

const ASSOCIATION_ITEMS = [
  { label: 'Matériel', value: 'MATERIEL' },
  { label: 'Point de structure', value: 'POINT_STRUCTURE' },
];

const UNITE_ITEMS = [
  { label: 'Sans unité', value: NONE_VALUE },
  { label: 'Heure (h)', value: 'h' },
  { label: 'Kilomètre (km)', value: 'km' },
  { label: 'Cycle', value: 'cycles' },
  { label: 'Température (°C)', value: '°C' },
  { label: 'Pression (bar)', value: 'bar' },
  { label: 'Tension (V)', value: 'V' },
  { label: 'Intensité (A)', value: 'A' },
  { label: 'Pourcentage (%)', value: '%' },
];

function toInputValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeType(value: unknown): PointMesureType {
  if (value === 'COMPTEUR' || value === 'CONDITIONNEL') {
    return value;
  }

  return 'COMPTEUR';
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getDefaultUnite(type: PointMesureType) {
  return type === 'COMPTEUR' ? 'h' : '°C';
}

function buildInitialForm(initialData?: Partial<PointMesure> | null): FormState {
  if (!initialData) return DEFAULT_FORM;

  const hasPointStructure =
    initialData.idPointStructure !== null &&
    initialData.idPointStructure !== undefined;

  const hasMateriel =
    initialData.idMateriel !== null && initialData.idMateriel !== undefined;

  return {
    code: toInputValue(initialData.code),
    libelle: toInputValue(initialData.libelle),
    type: normalizeType(initialData.type),
    unite: toInputValue(initialData.unite),
    organisation: toInputValue(initialData.organisation) || 'BMT',

    association:
      hasPointStructure && !hasMateriel ? 'POINT_STRUCTURE' : 'MATERIEL',
    idMateriel: hasMateriel ? String(initialData.idMateriel) : '',
    idPointStructure: hasPointStructure
      ? String(initialData.idPointStructure)
      : '',

    valeurMin: toInputValue(initialData.valeurMin),
    valeurMax: toInputValue(initialData.valeurMax),
    nbDecimales: toInputValue(initialData.nbDecimales) || '2',
    periodeReleveJours: toInputValue(initialData.periodeReleveJours),

    surveillanceMin: toInputValue(initialData.surveillanceMin),
    surveillanceMax: toInputValue(initialData.surveillanceMax),
    correctionMin: toInputValue(initialData.correctionMin),
    correctionMax: toInputValue(initialData.correctionMax),

    emettreDi: initialData.emettreDi ?? false,
    envoyerAlerte: initialData.envoyerAlerte ?? false,
    actif: initialData.actif ?? true,
  };
}

export function PointMesureFormPage({ mode, initialData, onSubmit }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(initialData),
  );

  const [materiels, setMateriels] = useState<MaterielOption[]>([]);
  const [pointsStructure, setPointsStructure] = useState<
    PointStructureOption[]
  >([]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = mode === 'edit';

  const title = isEditMode
    ? 'Modifier le point de mesure'
    : 'Nouveau point de mesure';

  const submitLabel = isEditMode
    ? 'Enregistrer'
    : 'Créer le point de mesure';

  const selectedMateriel = useMemo(() => {
    if (!form.idMateriel) return null;

    return materiels.find(
      (materiel) => String(materiel.idMateriel) === form.idMateriel,
    );
  }, [form.idMateriel, materiels]);

  const selectedPointStructure = useMemo(() => {
    if (!form.idPointStructure) return null;

    return pointsStructure.find(
      (point) => String(point.idPoint) === form.idPointStructure,
    );
  }, [form.idPointStructure, pointsStructure]);

  const materielItems = useMemo(() => {
    return [
      {
        label: loadingOptions
          ? 'Chargement des matériels...'
          : 'Sélectionner un matériel',
        value: NONE_VALUE,
      },
      ...materiels
        .filter((materiel) => materiel.actif !== false)
        .map((materiel) => ({
          value: String(materiel.idMateriel),
          label: [
            materiel.code || `Matériel #${materiel.idMateriel}`,
            materiel.numeroSerie || null,
            materiel.modele?.libelle || null,
          ]
            .filter(Boolean)
            .join(' — '),
        })),
    ];
  }, [materiels, loadingOptions]);

  const pointStructureItems = useMemo(() => {
    return [
      {
        label: loadingOptions
          ? 'Chargement des points de structure...'
          : 'Sélectionner un point de structure',
        value: NONE_VALUE,
      },
      ...pointsStructure
        .filter((point) => point.actif !== false)
        .map((point) => ({
          value: String(point.idPoint),
          label: [
            point.code || `Point #${point.idPoint}`,
            point.libelle || null,
            point.typePoint || null,
          ]
            .filter(Boolean)
            .join(' — '),
        })),
    ];
  }, [pointsStructure, loadingOptions]);

  const uniteItems = useMemo(() => {
    const existing = UNITE_ITEMS.some((item) => item.value === form.unite);

    if (!form.unite || existing) {
      return UNITE_ITEMS;
    }

    return [
      ...UNITE_ITEMS,
      {
        label: form.unite,
        value: form.unite,
      },
    ];
  }, [form.unite]);

  const completion = useMemo(() => {
    const fields = [
      form.code,
      form.libelle,
      form.type,
      form.association,
      form.association === 'MATERIEL'
        ? form.idMateriel
        : form.idPointStructure,
    ];

    const filled = fields.filter((field) => String(field).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData]);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError('');

        const [materielsData, pointsStructureData] = await Promise.all([
          getMaterielsOptions(),
          getPointsStructureOptions(),
        ]);

        setMateriels(materielsData);
        setPointsStructure(pointsStructureData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des options.',
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleTypeChange(value: string) {
    const nextType = normalizeType(value);

    setForm((prev) => ({
      ...prev,
      type: nextType,
      unite: prev.unite || getDefaultUnite(nextType),
    }));
  }

  function handleUniteChange(value: string) {
    updateField('unite', value === NONE_VALUE ? '' : value);
  }

  function handleAssociationChange(value: string) {
    const association =
      value === 'POINT_STRUCTURE' ? 'POINT_STRUCTURE' : 'MATERIEL';

    setForm((prev) => ({
      ...prev,
      association,
      idMateriel: association === 'MATERIEL' ? prev.idMateriel : '',
      idPointStructure:
        association === 'POINT_STRUCTURE' ? prev.idPointStructure : '',
    }));
  }

  function handleMaterielChange(value: string) {
    updateField('idMateriel', value === NONE_VALUE ? '' : value);
  }

  function handlePointStructureChange(value: string) {
    updateField('idPointStructure', value === NONE_VALUE ? '' : value);
  }

  function buildPayload(): CreatePointMesurePayload | UpdatePointMesurePayload {
    const payload: CreatePointMesurePayload = {
      code: form.code.trim().toUpperCase(),
      libelle: form.libelle.trim(),
      type: form.type,
      unite: form.unite.trim() || null,
      organisation: form.organisation.trim() || null,
      valeurMin: optionalNumber(form.valeurMin),
      valeurMax: optionalNumber(form.valeurMax),
      nbDecimales: optionalNumber(form.nbDecimales),
      periodeReleveJours: optionalNumber(form.periodeReleveJours),

      surveillanceMin: optionalNumber(form.surveillanceMin),
      surveillanceMax: optionalNumber(form.surveillanceMax),
      correctionMin: optionalNumber(form.correctionMin),
      correctionMax: optionalNumber(form.correctionMax),

      emettreDi: form.emettreDi,
      envoyerAlerte: form.envoyerAlerte,
      actif: form.actif,
    };

    if (form.association === 'MATERIEL') {
      payload.idMateriel = Number(form.idMateriel);
      payload.idPointStructure = null;
    } else {
      payload.idPointStructure = Number(form.idPointStructure);
      payload.idMateriel = null;
    }

    return payload;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.code.trim()) {
      setError('Le code est obligatoire.');
      return;
    }

    if (!form.libelle.trim()) {
      setError('Le libellé est obligatoire.');
      return;
    }

    if (form.valeurMin && form.valeurMax) {
      const min = Number(form.valeurMin);
      const max = Number(form.valeurMax);

      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        setError('La valeur minimale ne peut pas être supérieure à la valeur maximale.');
        return;
      }
    }

    if (form.surveillanceMin && form.surveillanceMax) {
      const min = Number(form.surveillanceMin);
      const max = Number(form.surveillanceMax);

      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        setError(
          'Le seuil de surveillance minimum ne peut pas être supérieur au seuil de surveillance maximum.',
        );
        return;
      }
    }

    if (form.correctionMin && form.correctionMax) {
      const min = Number(form.correctionMin);
      const max = Number(form.correctionMax);

      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        setError(
          'Le seuil de correction minimum ne peut pas être supérieur au seuil de correction maximum.',
        );
        return;
      }
    }

    if (form.association === 'MATERIEL' && !form.idMateriel) {
      setError('Veuillez sélectionner un matériel.');
      return;
    }

    if (form.association === 'POINT_STRUCTURE' && !form.idPointStructure) {
      setError('Veuillez sélectionner un point de structure.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await onSubmit(buildPayload());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’enregistrement du point de mesure.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-6">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <button
          type="button"
          onClick={() => router.push('/points-mesure')}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Retour
        </button>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0b3d4f] text-white shadow-sm">
                <Gauge size={30} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
                  Module équipements
                </p>

                <h1 className="mt-1 text-3xl font-black text-slate-950">
                  {title}
                </h1>

                <p className="mt-1 max-w-2xl text-base text-slate-500">
                  Définissez une mesure suivie par la maintenance : compteur,
                  température, pression, tension ou autre indicateur.
                </p>
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3 rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-500">Type</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {form.type}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-500">Statut</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  {form.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#0b3d4f] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection icon={<FileText size={20} />} title="Identification">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Code" required>
                <input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  placeholder="Ex : HEURES_MOTEUR"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label="Libellé" required>
                <input
                  value={form.libelle}
                  onChange={(e) => updateField('libelle', e.target.value)}
                  placeholder="Ex : Heures de fonctionnement moteur"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label="Organisation">
                <input
                  value={form.organisation}
                  onChange={(e) => updateField('organisation', e.target.value)}
                  placeholder="Ex : BMT"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={<Ruler size={20} />} title="Paramétrage de la mesure">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Type de mesure" required>
                <Select
                  value={form.type}
                  onValueChange={handleTypeChange}
                  items={TYPE_ITEMS}
                />
              </Field>

              <Field label="Unité">
                <Select
                  value={form.unite || NONE_VALUE}
                  onValueChange={handleUniteChange}
                  items={uniteItems}
                />
              </Field>

              <Field label="Nombre de décimales">
                <input
                  type="number"
                  min="0"
                  value={form.nbDecimales}
                  onChange={(e) => updateField('nbDecimales', e.target.value)}
                  placeholder="Ex : 2"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>

              <Field label="Période relevés / jours">
                <input
                  type="number"
                  min="0"
                  value={form.periodeReleveJours}
                  onChange={(e) =>
                    updateField('periodeReleveJours', e.target.value)
                  }
                  placeholder="Ex : 30"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f] focus:bg-white"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={<Settings2 size={20} />} title="Valeurs et seuils">
            <div className="grid gap-4 md:grid-cols-2">
              <ThresholdCard
                title="Valeurs autorisées"
                description="Bornes générales de la mesure."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Valeur minimale">
                    <input
                      type="number"
                      value={form.valeurMin}
                      onChange={(e) => updateField('valeurMin', e.target.value)}
                      placeholder="Ex : 0"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>

                  <Field label="Valeur maximale">
                    <input
                      type="number"
                      value={form.valeurMax}
                      onChange={(e) => updateField('valeurMax', e.target.value)}
                      placeholder="Ex : 99999"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>
                </div>
              </ThresholdCard>

              <ThresholdCard
                title="Surveillance"
                description="Seuils utilisés pour surveiller une valeur anormale."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Plancher">
                    <input
                      type="number"
                      value={form.surveillanceMin}
                      onChange={(e) =>
                        updateField('surveillanceMin', e.target.value)
                      }
                      placeholder="Min"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>

                  <Field label="Plafond">
                    <input
                      type="number"
                      value={form.surveillanceMax}
                      onChange={(e) =>
                        updateField('surveillanceMax', e.target.value)
                      }
                      placeholder="Max"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>
                </div>
              </ThresholdCard>

              <ThresholdCard
                title="Correction"
                description="Seuils à partir desquels une action corrective peut être envisagée."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Plancher">
                    <input
                      type="number"
                      value={form.correctionMin}
                      onChange={(e) =>
                        updateField('correctionMin', e.target.value)
                      }
                      placeholder="Min"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>

                  <Field label="Plafond">
                    <input
                      type="number"
                      value={form.correctionMax}
                      onChange={(e) =>
                        updateField('correctionMax', e.target.value)
                      }
                      placeholder="Max"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#0b3d4f]"
                    />
                  </Field>
                </div>
              </ThresholdCard>

              <ThresholdCard
                title="Actions automatiques"
                description="Options utilisées lorsque les seuils sont dépassés."
              >
                <div className="grid gap-4">
                  <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                    <input
                      type="checkbox"
                      checked={form.emettreDi}
                      onChange={(e) =>
                        updateField('emettreDi', e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <ShieldAlert size={17} className="text-[#0b3d4f]" />
                    <span className="text-sm font-bold text-slate-700">
                      Émettre une DI si seuil dépassé
                    </span>
                  </label>

                  <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                    <input
                      type="checkbox"
                      checked={form.envoyerAlerte}
                      onChange={(e) =>
                        updateField('envoyerAlerte', e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <Bell size={17} className="text-[#0b3d4f]" />
                    <span className="text-sm font-bold text-slate-700">
                      Envoyer une alerte
                    </span>
                  </label>

                  <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                    <input
                      type="checkbox"
                      checked={form.actif}
                      onChange={(e) => updateField('actif', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Gauge size={17} className="text-[#0b3d4f]" />
                    <span className="text-sm font-bold text-slate-700">
                      Point de mesure actif
                    </span>
                  </label>
                </div>
              </ThresholdCard>
            </div>
          </FormSection>

          <FormSection icon={<Link2 size={20} />} title="Association">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Associer à" required>
                <Select
                  value={form.association}
                  onValueChange={handleAssociationChange}
                  items={ASSOCIATION_ITEMS}
                />
              </Field>

              {form.association === 'MATERIEL' ? (
                <div className="md:col-span-2">
                  <Field label="Matériel" required>
                    <Select
                      value={form.idMateriel || NONE_VALUE}
                      onValueChange={handleMaterielChange}
                      items={materielItems}
                    />
                  </Field>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <Field label="Point de structure" required>
                    <Select
                      value={form.idPointStructure || NONE_VALUE}
                      onValueChange={handlePointStructureChange}
                      items={pointStructureItems}
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBox
                icon={
                  form.association === 'MATERIEL' ? (
                    <Server size={18} />
                  ) : (
                    <MapPin size={18} />
                  )
                }
                title="Élément sélectionné"
                value={
                  form.association === 'MATERIEL'
                    ? selectedMateriel
                      ? `${selectedMateriel.code || selectedMateriel.idMateriel} ${
                          selectedMateriel.numeroSerie
                            ? `— ${selectedMateriel.numeroSerie}`
                            : ''
                        }`
                      : 'Aucun matériel sélectionné'
                    : selectedPointStructure
                      ? `${
                          selectedPointStructure.code ||
                          selectedPointStructure.idPoint
                        } ${
                          selectedPointStructure.libelle
                            ? `— ${selectedPointStructure.libelle}`
                            : ''
                        }`
                      : 'Aucun point de structure sélectionné'
                }
              />

              <InfoBox
                icon={<Activity size={18} />}
                title="Utilisation"
                value={
                  form.type === 'COMPTEUR'
                    ? 'Ce point servira aux déclencheurs par compteur : heures, kilomètres, cycles...'
                    : 'Ce point servira aux déclencheurs conditionnels : température, pression, tension...'
                }
              />
            </div>
          </FormSection>

          <div className="sticky bottom-4 z-10 flex justify-end">
            <div className="flex gap-3 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={() => router.push('/points-mesure')}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={17} />
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#0b3d4f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082f3d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {saving ? 'Enregistrement...' : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-[#0b3d4f]">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-900">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      {children}
    </label>
  );
}

function InfoBox({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#0b3d4f] shadow-sm">
          {icon}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </p>
      </div>

      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function ThresholdCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h3>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}