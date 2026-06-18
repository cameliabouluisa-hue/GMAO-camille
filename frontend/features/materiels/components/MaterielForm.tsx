import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertTriangle, HardDrive, Save, X } from 'lucide-react';

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

import type {
  CreateMaterielDto,
  EtatMateriel,
  Materiel,
  Modele,
  PointStructure,
  TypeMateriel,
  UpdateMaterielDto,
} from '@/features/materiels/types/materiel';

type PositionActuelle =
  | 'SUR_TERRAIN'
  | 'EN_STOCK'
  | 'EN_ATELIER'
  | 'EN_REPARATION'
  | 'AU_REBUT';

type MaterielFormData = {
  code: string;
  libelle: string;
  numeroSerie: string;

  idModele: string;
  idType: string;
  idEtat: string;
  idPointStructure: string;
  idMaterielParent: string;

  gereEnStock: boolean;
  positionActuelle: PositionActuelle;

  dateMiseService: string;
  dateDernierInventaire: string;
  dateRebut: string;
  motifRebut: string;

  actif: boolean;
};

type Props = {
  mode?: 'create' | 'edit';

  materiel?: Materiel | null;
  initialData?: Materiel | null;

  modeles?: Modele[];
  etats?: EtatMateriel[];
  typesMateriel?: TypeMateriel[];
  types?: TypeMateriel[];
  pointsStructure?: PointStructure[];
  materielsParents?: Materiel[];

  loading?: boolean;
  submitting?: boolean;

  onSubmit: (data: CreateMaterielDto | UpdateMaterielDto) => void | Promise<void>;
  onCancel?: () => void;
};

const POSITION_OPTIONS: { label: string; value: PositionActuelle }[] = [
  { label: 'Sur terrain', value: 'SUR_TERRAIN' },
  { label: 'En stock', value: 'EN_STOCK' },
  { label: 'En réparation / atelier', value: 'EN_ATELIER' },
  { label: 'Au rebut', value: 'AU_REBUT' },
];

const ETATS_BY_POSITION: Record<string, readonly string[]> = {
  SUR_TERRAIN: ['EN_SERVICE', 'EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  EN_STOCK: ['DISPONIBLE'],
  EN_ATELIER: ['EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  EN_REPARATION: ['EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  AU_REBUT: ['AU_REBUT'],
};

function toInputDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

function toNumberOrNull(value: string) {
  if (!value) return null;

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function normalizePosition(value?: string | null): PositionActuelle {
  const normalized = normalizeBusinessCode(value ?? '');

  if (normalized === 'EN_STOCK') return 'EN_STOCK';
  if (normalized === 'AU_REBUT') return 'AU_REBUT';
  if (normalized === 'EN_REPARATION') return 'EN_ATELIER';
  if (normalized === 'EN_ATELIER') return 'EN_ATELIER';
  if (normalized === 'SUR_TERRAIN') return 'SUR_TERRAIN';

  return 'SUR_TERRAIN';
}

function normalizeBusinessCode(value: string) {
  const cleaned = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[’']/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const aliases: Record<string, string> = {
    TERRAIN: 'SUR_TERRAIN',
    SUR_TERRAIN: 'SUR_TERRAIN',

    STOCK: 'EN_STOCK',
    EN_STOCK: 'EN_STOCK',

    ATELIER: 'EN_ATELIER',
    EN_ATELIER: 'EN_ATELIER',
    REPARATION: 'EN_REPARATION',
    EN_REPARATION: 'EN_REPARATION',

    REBUT: 'AU_REBUT',
    AU_REBUT: 'AU_REBUT',

    SERVICE: 'EN_SERVICE',
    EN_SERVICE: 'EN_SERVICE',

    PANNE: 'EN_PANNE',
    EN_PANNE: 'EN_PANNE',

    MAINTENANCE: 'EN_MAINTENANCE',
    EN_MAINTENANCE: 'EN_MAINTENANCE',

    NON_DISPONIBLE: 'INDISPONIBLE',
    INDISPONIBLE: 'INDISPONIBLE',

    DISPONIBLE: 'DISPONIBLE',
  };

  return aliases[cleaned] ?? cleaned;
}

function getModeleLabel(modele: Modele) {
  return modele.libelle || modele.code || `MOD-${modele.idModele}`;
}

function getPointStructureLabel(point: PointStructure) {
  return point.libelle || point.code || `PS-${point.idPoint}`;
}

function getParentMaterielLabel(materiel: Materiel) {
  return materiel.libelle || materiel.code || `MAT-${materiel.idMateriel}`;
}

function getEtatBusinessCode(etat?: EtatMateriel | null) {
  if (!etat) return '';

  return normalizeBusinessCode(etat.code || etat.libelle || '');
}

function findEtatIdByCodes(etats: EtatMateriel[], codes: string[]) {
  const normalizedCodes = codes.map(normalizeBusinessCode);

  const found = etats.find((etat) =>
    normalizedCodes.includes(getEtatBusinessCode(etat)),
  );

  return found?.idEtat ? String(found.idEtat) : '';
}

function isDateInFuture(value: string) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return date.getTime() > today.getTime();
}

function isDateBefore(first: string, second: string) {
  if (!first || !second) return false;

  const d1 = new Date(first);
  const d2 = new Date(second);

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return false;
  }

  return d1.getTime() < d2.getTime();
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getMaterielPointStructureId(materiel?: Materiel | null) {
  if (!materiel) return '';

  const record = materiel as unknown as Record<string, unknown>;

  const value =
    record.idPointStructure ??
    record.idPereGeographique ??
    record.idPointGeographique;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return '';
}

function getMaterielEtatCode(materiel?: Materiel | null) {
  if (!materiel) return '';

  const record = materiel as unknown as Record<string, unknown>;

  const rawEtat =
    record.etat ??
    record.etatMateriel ??
    record.statut ??
    record.codeEtat ??
    '';

  if (typeof rawEtat === 'string') {
    return normalizeBusinessCode(rawEtat);
  }

  if (rawEtat && typeof rawEtat === 'object') {
    const etatRecord = rawEtat as Record<string, unknown>;

    const value = etatRecord.code ?? etatRecord.libelle ?? etatRecord.nom;

    if (typeof value === 'string') {
      return normalizeBusinessCode(value);
    }
  }

  return '';
}

function getMaterielPosition(materiel?: Materiel | null) {
  if (!materiel) return 'SUR_TERRAIN';

  const record = materiel as unknown as Record<string, unknown>;
  const value = record.positionActuelle;

  if (typeof value === 'string') {
    return normalizePosition(value);
  }

  return 'SUR_TERRAIN';
}

function buildInitialForm(materiel?: Materiel | null): MaterielFormData {
  return {
    code: materiel?.code ?? '',
    libelle: materiel?.libelle ?? '',
    numeroSerie: materiel?.numeroSerie ?? '',

    idModele: materiel?.idModele ? String(materiel.idModele) : '',
    idType: materiel?.idType ? String(materiel.idType) : '',
    idEtat: materiel?.idEtat ? String(materiel.idEtat) : '',
    idPointStructure: materiel?.idPointStructure
      ? String(materiel.idPointStructure)
      : '',
    idMaterielParent: materiel?.idMaterielParent
      ? String(materiel.idMaterielParent)
      : '',

    gereEnStock: materiel?.gereEnStock ?? false,
    positionActuelle: normalizePosition(materiel?.positionActuelle),

    dateMiseService: toInputDate(materiel?.dateMiseService),
    dateDernierInventaire: toInputDate(materiel?.dateDernierInventaire),
    dateRebut: toInputDate(materiel?.dateRebut),
    motifRebut: materiel?.motifRebut ?? '',

    actif: materiel?.actif !== false,
  };
}

export default function MaterielForm({
  mode,
  materiel,
  initialData,
  modeles = [],
  etats = [],
  typesMateriel,
  types,
  pointsStructure = [],
  materielsParents = [],
  loading = false,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const currentMateriel = initialData ?? materiel ?? null;
  const isEdit = mode ? mode === 'edit' : Boolean(currentMateriel);

  const [form, setForm] = useState<MaterielFormData>(() =>
    buildInitialForm(currentMateriel),
  );

  const [error, setError] = useState('');

  const typeOptions = typesMateriel ?? types ?? [];

  useEffect(() => {
    setForm(buildInitialForm(currentMateriel));
  }, [currentMateriel]);

  const selectedEtat = useMemo(() => {
    return etats.find((etat) => String(etat.idEtat) === form.idEtat) ?? null;
  }, [etats, form.idEtat]);

  const selectedEtatCode = getEtatBusinessCode(selectedEtat);

  const isStockPosition = form.positionActuelle === 'EN_STOCK';
  const isTerrainPosition = form.positionActuelle === 'SUR_TERRAIN';
  const isRepairPosition =
    form.positionActuelle === 'EN_ATELIER' ||
    form.positionActuelle === 'EN_REPARATION';
  const isRebutPosition = form.positionActuelle === 'AU_REBUT';

  const filteredEtats = useMemo(() => {
    const allowedCodes = ETATS_BY_POSITION[form.positionActuelle] ?? [];

    return etats.filter((etat) => {
      const code = getEtatBusinessCode(etat);

      if (!code) return true;
      if (String(etat.idEtat) === form.idEtat) return true;

      return allowedCodes.includes(code);
    });
  }, [etats, form.idEtat, form.positionActuelle]);

  const filteredParentMateriels = useMemo(() => {
    return materielsParents.filter((item) => {
      if (item.idMateriel === currentMateriel?.idMateriel) return false;
      if (item.actif === false) return false;

      const etatCode = getMaterielEtatCode(item);
      if (etatCode === 'AU_REBUT') return false;

      const position = getMaterielPosition(item);
      if (position !== 'SUR_TERRAIN') return false;

      return true;
    });
  }, [materielsParents, currentMateriel?.idMateriel]);

  function updateField<K extends keyof MaterielFormData>(
    key: K,
    value: MaterielFormData[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function changePosition(rawPosition: string) {
    const position = normalizePosition(rawPosition);

    setForm((prev) => {
      const next: MaterielFormData = {
        ...prev,
        positionActuelle: position,
      };

      if (position === 'EN_STOCK') {
        next.gereEnStock = true;
        next.idPointStructure = '';
        next.idMaterielParent = '';
        next.actif = true;
        next.dateRebut = '';
        next.motifRebut = '';

        const disponibleId = findEtatIdByCodes(etats, ['DISPONIBLE']);
        if (disponibleId) next.idEtat = disponibleId;
      }

      if (position === 'SUR_TERRAIN') {
        next.actif = true;
        next.dateRebut = '';
        next.motifRebut = '';

        const allowed = ETATS_BY_POSITION.SUR_TERRAIN;
        const currentEtat = etats.find(
          (etat) => String(etat.idEtat) === next.idEtat,
        );
        const currentEtatCode = getEtatBusinessCode(currentEtat);

        if (currentEtatCode && !allowed.includes(currentEtatCode)) {
          const enServiceId = findEtatIdByCodes(etats, ['EN_SERVICE']);
          if (enServiceId) next.idEtat = enServiceId;
        }
      }

      if (position === 'EN_ATELIER' || position === 'EN_REPARATION') {
        next.idMaterielParent = '';
        next.actif = true;
        next.dateRebut = '';
        next.motifRebut = '';

        const maintenanceId = findEtatIdByCodes(etats, [
          'EN_MAINTENANCE',
          'INDISPONIBLE',
          'EN_PANNE',
        ]);

        if (maintenanceId) next.idEtat = maintenanceId;
      }

      if (position === 'AU_REBUT') {
        next.actif = false;
        next.idPointStructure = '';
        next.idMaterielParent = '';
        next.gereEnStock = false;
        next.dateRebut = next.dateRebut || todayIsoDate();

        const rebutId = findEtatIdByCodes(etats, ['AU_REBUT']);
        if (rebutId) next.idEtat = rebutId;
      }

      return next;
    });
  }

  function changeParentMateriel(value: string) {
    const idMaterielParent = value === 'NONE_PARENT' ? '' : value;

    const parent = filteredParentMateriels.find(
      (item) => String(item.idMateriel) === idMaterielParent,
    );

    const parentPointId = getMaterielPointStructureId(parent);

    setForm((prev) => ({
      ...prev,
      idMaterielParent,
      idPointStructure: parentPointId || prev.idPointStructure,
    }));
  }

  function validateForm() {
    const errors: string[] = [];

    const code = form.code.trim();
    const libelle = form.libelle.trim();

    if (!code) {
      errors.push('Le code du matériel est obligatoire.');
    }

    if (!libelle) {
      errors.push('Le libellé du matériel est obligatoire.');
    }

    if (!form.positionActuelle) {
      errors.push('La position actuelle est obligatoire.');
    }

    if (isTerrainPosition) {
      if (!form.idPointStructure && !form.idMaterielParent) {
        errors.push(
          'Un matériel sur terrain doit avoir un père géographique ou un père matériel.',
        );
      }

      if (selectedEtatCode === 'EN_SERVICE' && !form.dateMiseService) {
        errors.push(
          'La date de mise en service est obligatoire pour un matériel en service.',
        );
      }
    }

    if (isStockPosition) {
      if (!form.gereEnStock) {
        errors.push('Un matériel en stock doit obligatoirement être géré en stock.');
      }

      if (form.idPointStructure || form.idMaterielParent) {
        errors.push(
          'Un matériel en stock ne doit pas être affecté au terrain ou à un matériel père.',
        );
      }
    }

    if (isRepairPosition) {
      if (form.idMaterielParent) {
        errors.push(
          'Un matériel en réparation ne doit pas rester rattaché activement à un père matériel.',
        );
      }
    }

    if (isRebutPosition) {
      if (form.actif) {
        errors.push('Un matériel au rebut doit être inactif.');
      }

      if (!form.dateRebut) {
        errors.push('La date de rebut est obligatoire.');
      }

      if (form.idPointStructure || form.idMaterielParent) {
        errors.push('Un matériel au rebut ne doit plus avoir d’affectation active.');
      }
    }

    if (form.idMaterielParent && currentMateriel?.idMateriel) {
      if (Number(form.idMaterielParent) === currentMateriel.idMateriel) {
        errors.push('Un matériel ne peut pas être son propre père.');
      }
    }

    const selectedParent = filteredParentMateriels.find(
      (item) => String(item.idMateriel) === form.idMaterielParent,
    );

    if (selectedParent) {
      const parentPointId = getMaterielPointStructureId(selectedParent);

      if (
        parentPointId &&
        form.idPointStructure &&
        parentPointId !== form.idPointStructure
      ) {
        errors.push(
          'Le père géographique doit être le même que celui du père matériel.',
        );
      }
    }

    if (isDateInFuture(form.dateMiseService)) {
      errors.push('La date de mise en service ne peut pas être dans le futur.');
    }

    if (isDateInFuture(form.dateDernierInventaire)) {
      errors.push('La date du dernier inventaire ne peut pas être dans le futur.');
    }

    if (isDateInFuture(form.dateRebut)) {
      errors.push('La date de rebut ne peut pas être dans le futur.');
    }

    if (
      form.dateMiseService &&
      form.dateRebut &&
      isDateBefore(form.dateRebut, form.dateMiseService)
    ) {
      errors.push(
        'La date de rebut ne peut pas être avant la date de mise en service.',
      );
    }

    if (!isRebutPosition && form.dateRebut) {
      errors.push(
        'La date de rebut doit être vide si le matériel n’est pas au rebut.',
      );
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setError('');

    const payload: CreateMaterielDto | UpdateMaterielDto = {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      numeroSerie: form.numeroSerie.trim() || null,

      idModele: toNumberOrNull(form.idModele),
      idType: toNumberOrNull(form.idType),
      idEtat: toNumberOrNull(form.idEtat),

      idPointStructure:
        isTerrainPosition || isRepairPosition
          ? toNumberOrNull(form.idPointStructure)
          : null,

      idMaterielParent: isTerrainPosition
        ? toNumberOrNull(form.idMaterielParent)
        : null,

      gereEnStock: isStockPosition ? true : form.gereEnStock,
      positionActuelle: form.positionActuelle || null,

      dateMiseService: form.dateMiseService || null,
      dateDernierInventaire: form.dateDernierInventaire || null,
      dateRebut: isRebutPosition ? form.dateRebut || null : null,
      motifRebut: isRebutPosition ? form.motifRebut.trim() || null : null,

      actif: isRebutPosition ? false : form.actif,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#06475a] to-[#0b5d73] px-6 py-5 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <HardDrive size={29} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                  {isEdit ? 'Modification matériel' : 'Nouveau matériel'}
                </p>

                <h1 className="mt-1 min-w-0 break-words text-3xl font-black tracking-tight">
                  {isEdit
                    ? currentMateriel?.code || 'Modifier le matériel'
                    : 'Créer un matériel'}
                </h1>

                <p className="mt-2 min-w-0 break-words text-sm font-semibold text-white/75">
                  {isEdit
                    ? 'Modifiez les informations du matériel sélectionné.'
                    : 'Renseignez les informations nécessaires pour ajouter un matériel au parc.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={submitting || loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={16} />
                  Annuler
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0b3d4f] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div className="whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
              {error}
            </div>
          )}

          <AppSection title="Généralités">
            <AppFieldGrid>
              <AppFormField label="Code" required>
                <input
                  value={form.code}
                  onChange={(event) => updateField('code', event.target.value)}
                  className={appInputClassName}
                  placeholder="Ex : STS-01"
                />
              </AppFormField>

              <AppFormField label="Libellé" required>
                <input
                  value={form.libelle}
                  onChange={(event) => updateField('libelle', event.target.value)}
                  className={appInputClassName}
                  placeholder="Ex : Portique de quai STS 01"
                />
              </AppFormField>

              <AppFormField label="N° de série">
                <input
                  value={form.numeroSerie}
                  onChange={(event) =>
                    updateField('numeroSerie', event.target.value)
                  }
                  className={appInputClassName}
                  placeholder="Ex : SN-BMT-STS-001"
                />
              </AppFormField>

              <AppFormField label="Actif">
                <Select
                  value={isRebutPosition ? 'false' : form.actif ? 'true' : 'false'}
                  onValueChange={(value: string) => {
                    if (isRebutPosition) return;
                    updateField('actif', value === 'true');
                  }}
                  items={[
                    { label: 'Actif', value: 'true' },
                    { label: 'Inactif', value: 'false' },
                  ]}
                />
              </AppFormField>
            </AppFieldGrid>
          </AppSection>

          <AppSection title="Référentiel technique">
            <AppFieldGrid>
              <AppFormField label="Modèle">
                <Select
                  value={form.idModele || 'NONE_MODELE'}
                  onValueChange={(value: string) =>
                    updateField('idModele', value === 'NONE_MODELE' ? '' : value)
                  }
                  items={[
                    { label: 'Aucun modèle', value: 'NONE_MODELE' },
                    ...modeles.map((modele) => ({
                      label: getModeleLabel(modele),
                      value: String(modele.idModele),
                    })),
                  ]}
                />
              </AppFormField>

              <AppFormField label="Type de matériel">
                <Select
                  value={form.idType || 'NONE_TYPE'}
                  onValueChange={(value: string) =>
                    updateField('idType', value === 'NONE_TYPE' ? '' : value)
                  }
                  items={[
                    { label: 'Aucun type', value: 'NONE_TYPE' },
                    ...typeOptions.map((type) => ({
                      label: type.libelle || `Type ${type.idType}`,
                      value: String(type.idType),
                    })),
                  ]}
                />
              </AppFormField>

              <AppFormField label="État">
                <Select
                  value={form.idEtat || 'NONE_ETAT'}
                  onValueChange={(value: string) =>
                    updateField('idEtat', value === 'NONE_ETAT' ? '' : value)
                  }
                  items={[
                    { label: 'Aucun état', value: 'NONE_ETAT' },
                    ...filteredEtats.map((etat) => ({
                      label: etat.libelle || etat.code || `État ${etat.idEtat}`,
                      value: String(etat.idEtat),
                    })),
                  ]}
                />
              </AppFormField>

              <AppFormField label="Géré en stock">
                <Select
                  value={isStockPosition ? 'true' : form.gereEnStock ? 'true' : 'false'}
                  onValueChange={(value: string) => {
                    if (isStockPosition) {
                      updateField('gereEnStock', true);
                      return;
                    }

                    updateField('gereEnStock', value === 'true');
                  }}
                  items={[
                    { label: 'Non', value: 'false' },
                    { label: 'Oui', value: 'true' },
                  ]}
                />
              </AppFormField>
            </AppFieldGrid>
          </AppSection>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <AppSection title="Affectation">
              <AppFieldGrid>
                <AppFormField label="Position actuelle">
                  <Select
                    value={form.positionActuelle || 'SUR_TERRAIN'}
                    onValueChange={(value: string) => changePosition(value)}
                    items={POSITION_OPTIONS}
                  />
                </AppFormField>

                {isTerrainPosition && (
                  <>
                    <AppFormField label="Père géographique">
                      <Select
                        value={form.idPointStructure || 'NONE_POINT'}
                        onValueChange={(value: string) =>
                          updateField(
                            'idPointStructure',
                            value === 'NONE_POINT' ? '' : value,
                          )
                        }
                        items={[
                          {
                            label: 'Aucun point de structure',
                            value: 'NONE_POINT',
                          },
                          ...pointsStructure.map((point) => ({
                            label: getPointStructureLabel(point),
                            value: String(point.idPoint),
                          })),
                        ]}
                      />
                    </AppFormField>

                    <AppFormField label="Père matériel">
                      <Select
                        value={form.idMaterielParent || 'NONE_PARENT'}
                        onValueChange={changeParentMateriel}
                        items={[
                          { label: 'Aucun père matériel', value: 'NONE_PARENT' },
                          ...filteredParentMateriels.map((parent) => ({
                            label: getParentMaterielLabel(parent),
                            value: String(parent.idMateriel),
                          })),
                        ]}
                      />
                    </AppFormField>
                  </>
                )}

                {isRepairPosition && (
                  <AppFormField label="Atelier / position de réparation">
                    <Select
                      value={form.idPointStructure || 'NONE_POINT'}
                      onValueChange={(value: string) =>
                        updateField(
                          'idPointStructure',
                          value === 'NONE_POINT' ? '' : value,
                        )
                      }
                      items={[
                        {
                          label: 'Aucun point de structure',
                          value: 'NONE_POINT',
                        },
                        ...pointsStructure.map((point) => ({
                          label: getPointStructureLabel(point),
                          value: String(point.idPoint),
                        })),
                      ]}
                    />
                  </AppFormField>
                )}

                {isStockPosition && (
                  <div className="md:col-span-2">
                    <InfoBox
                      title="Matériel localisé en stock"
                      description="Un matériel en stock ne doit pas avoir de père matériel ni de père géographique terrain. Sa localisation réelle doit être gérée côté stock avec un magasin et éventuellement un emplacement."
                    />
                  </div>
                )}

                {isRebutPosition && (
                  <div className="md:col-span-2">
                    <InfoBox
                      title="Matériel au rebut"
                      description="Un matériel au rebut est automatiquement inactif et ne doit plus avoir d’affectation active."
                      danger
                    />
                  </div>
                )}
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Cycle de vie">
              <div className="min-w-0">
                <AppFormField label="Mise en service">
                  <input
                    type="date"
                    value={form.dateMiseService}
                    onChange={(event) =>
                      updateField('dateMiseService', event.target.value)
                    }
                    className={appInputClassName}
                  />
                </AppFormField>

                <AppFormField label="Dernier inventaire">
                  <input
                    type="date"
                    value={form.dateDernierInventaire}
                    onChange={(event) =>
                      updateField('dateDernierInventaire', event.target.value)
                    }
                    className={appInputClassName}
                  />
                </AppFormField>

                <AppFormField label="Date rebut">
                  <input
                    type="date"
                    value={form.dateRebut}
                    onChange={(event) =>
                      updateField('dateRebut', event.target.value)
                    }
                    className={appInputClassName}
                    disabled={!isRebutPosition}
                  />
                </AppFormField>

                <AppFormField label="Motif rebut">
                  <textarea
                    value={form.motifRebut}
                    onChange={(event) =>
                      updateField('motifRebut', event.target.value)
                    }
                    className={appTextareaClassName}
                    placeholder="Motif de mise au rebut..."
                    disabled={!isRebutPosition}
                  />
                </AppFormField>
              </div>
            </AppSection>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting || loading}
                className={appSecondaryButtonClassName}
              >
                <X size={16} />
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className={appPrimaryButtonClassName}
            >
              <Save size={16} />
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function InfoBox({
  title,
  description,
  danger = false,
}: {
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border px-5 py-4 ${
        danger
          ? 'border-red-100 bg-red-50 text-red-700'
          : 'border-sky-100 bg-sky-50 text-sky-800'
      }`}
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0" />

      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-sm font-semibold opacity-80">{description}</p>
      </div>
    </div>
  );
}