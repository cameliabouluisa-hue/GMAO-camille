'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

import MaterielForm from '@/features/materiels/components/MaterielForm';

import {
  getEtatsMateriel,
  getMateriel,
  getMateriels,
  getModeles,
  getPointsStructure,
  getTypesMateriel,
  updateMateriel,
} from '@/features/materiels/services/materiel.service';

import type {
  CreateMaterielDto,
  EtatMateriel,
  Materiel,
  Modele,
  PointStructure,
  TypeMateriel,
  UpdateMaterielDto,
} from '@/features/materiels/types/materiel';
import PermissionRoute from '@/components/PermissionRoute';
import { Permission } from '@/types/auth';

type LooseRecord = Record<string, unknown>;

const ETATS_BY_POSITION = {
  SUR_TERRAIN: ['EN_SERVICE', 'EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  EN_STOCK: ['DISPONIBLE'],
  EN_ATELIER: ['EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  EN_REPARATION: ['EN_PANNE', 'EN_MAINTENANCE', 'INDISPONIBLE'],
  AU_REBUT: ['AU_REBUT'],
} as const;

type KnownPosition = keyof typeof ETATS_BY_POSITION;

const ID_KEYS_TO_CLEAN = [
  'idModele',
  'idType',
  'idTypeMateriel',
  'idEtat',
  'idPointStructure',
  'idMaterielParent',
  'idPereGeographique',
  'idPereMateriel',
  'idMagasin',
  'idEmplacement',
  'idArticle',
];

const DATE_KEYS_TO_CLEAN = [
  'dateMiseService',
  'dateMiseEnService',
  'dateDernierInventaire',
  'dateRebut',
];

export default function ModifierMaterielPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    const rawId = params?.id;
    const value = Array.isArray(rawId) ? rawId[0] : rawId;
    return Number(value);
  }, [params]);

  const [materiel, setMateriel] = useState<Materiel | null>(null);

  const [modeles, setModeles] = useState<Modele[]>([]);
  const [etats, setEtats] = useState<EtatMateriel[]>([]);
  const [typesMateriel, setTypesMateriel] = useState<TypeMateriel[]>([]);
  const [pointsStructure, setPointsStructure] = useState<PointStructure[]>([]);
  const [materielsParents, setMaterielsParents] = useState<Materiel[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError('Identifiant du matériel invalide.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [
        materielData,
        modelesData,
        etatsData,
        typesData,
        pointsData,
        materielsData,
      ] = await Promise.all([
        getMateriel(id),
        getModeles(),
        getEtatsMateriel(),
        getTypesMateriel(),
        getPointsStructure(),
        getMateriels(),
      ]);

      if (materielData.actif === false) {
        router.replace('/materiels');
        return;
      }

      setMateriel(materielData);
      setModeles(modelesData);
      setEtats(etatsData);
      setTypesMateriel(typesData);
      setPointsStructure(pointsData);

      setMaterielsParents(
        materielsData.filter((item) => {
          const itemId = readFirstNumber(item, ['idMateriel', 'id']);
          const currentId = readFirstNumber(materielData, [
            'idMateriel',
            'id',
          ]);

          const itemEtat = readEtatCode(item, etatsData);
          const itemPosition = readPosition(item);

          return (
            item.actif !== false &&
            itemId !== currentId &&
            itemEtat !== 'AU_REBUT' &&
            (!itemPosition || itemPosition === 'SUR_TERRAIN')
          );
        }),
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement du matériel.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(data: CreateMaterielDto | UpdateMaterielDto) {
    if (!materiel) return;

    const mergedRaw: LooseRecord = {
      ...toRecord(materiel),
      ...toRecord(data),
    };

    const resolvedEtat = readEtatCode(mergedRaw, etats);

    if (resolvedEtat) {
      mergedRaw.etat = resolvedEtat;
    }

    const candidate = normalizeMaterielBusinessValues(mergedRaw, etats);

    const validationErrors = validateMaterielBusinessValues(
      candidate,
      materielsParents,
      etats,
    );

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    const payload = normalizeMaterielSubmitPayload(
      data as UpdateMaterielDto,
      candidate,
      etats,
    );

    try {
      setSubmitting(true);
      setError('');

      const updated = await updateMateriel(
        materiel.idMateriel,
        payload as UpdateMaterielDto,
      );

      const payloadRecord = toRecord(payload);

      if (payloadRecord.actif === false) {
        router.push('/materiels');
        return;
      }

      router.push(`/materiels/${updated.idMateriel}`);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Erreur lors de la modification du matériel.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

 return (
  <PermissionRoute permission={Permission.MATERIEL_UPDATE}>
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1180px] space-y-5">
        <BackButton onClick={() => router.back()} />

        {error && (
          <div className="whitespace-pre-line rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : !materiel ? (
          <ErrorState message="Matériel introuvable." onRetry={loadData} />
        ) : (
          <MaterielForm
            mode="edit"
            materiel={materiel}
            modeles={modeles}
            etats={etats}
            typesMateriel={typesMateriel}
            pointsStructure={pointsStructure}
            materielsParents={materielsParents}
            loading={loading}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </section>
    </main>
  </PermissionRoute>
);
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
    >
      <ArrowLeft size={18} />
      Retour
    </button>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <RefreshCcw size={24} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        Chargement du formulaire matériel...
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="mt-4 text-lg font-black text-slate-950">
        Impossible de charger le matériel
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
      >
        <RefreshCcw size={16} />
        Réessayer
      </button>
    </div>
  );
}

/* =========================================================
   RÈGLES MÉTIER
========================================================= */

function normalizeMaterielBusinessValues(
  source: LooseRecord,
  etats: EtatMateriel[],
): LooseRecord {
  const next = cleanEmptyValues({ ...source });

  const position = readPosition(next);
  const etat = readEtatCode(next, etats);

  if (position === 'SUR_TERRAIN') {
    next.idMagasin = null;
    next.idEmplacement = null;

    if (!isEtatAllowedForPosition(etat, position)) {
      next.etat = 'EN_SERVICE';
      next.idEtat = findEtatIdByCode(etats, 'EN_SERVICE') ?? next.idEtat;
    }

    if (readEtatCode(next, etats) !== 'AU_REBUT') {
      next.dateRebut = null;
    }
  }

  if (position === 'EN_STOCK') {
    next.gereEnStock = true;
    next.idPointStructure = null;
    next.idMaterielParent = null;
    next.idPereMateriel = null;
    next.idPereGeographique = null;
    next.idMagasin = null;
    next.idEmplacement = null;
    next.dateRebut = null;
    next.etat = 'DISPONIBLE';
    next.idEtat = findEtatIdByCode(etats, 'DISPONIBLE') ?? next.idEtat;
  }

  if (position === 'EN_ATELIER' || position === 'EN_REPARATION') {
    next.idMaterielParent = null;
    next.idPereMateriel = null;
    next.idMagasin = null;
    next.idEmplacement = null;
    next.dateRebut = null;

    if (!isEtatAllowedForPosition(etat, position)) {
      next.etat = 'EN_MAINTENANCE';
      next.idEtat = findEtatIdByCode(etats, 'EN_MAINTENANCE') ?? next.idEtat;
    }
  }

  if (position === 'AU_REBUT') {
    next.etat = 'AU_REBUT';
    next.idEtat = findEtatIdByCode(etats, 'AU_REBUT') ?? next.idEtat;
    next.actif = false;
    next.idPointStructure = null;
    next.idMaterielParent = null;
    next.idPereMateriel = null;
    next.idPereGeographique = null;
    next.idMagasin = null;
    next.idEmplacement = null;

    if (!hasValue(next.dateRebut)) {
      next.dateRebut = todayIsoDate();
    }
  }

  return next;
}

function normalizeMaterielSubmitPayload(
  data: UpdateMaterielDto,
  candidate: LooseRecord,
  etats: EtatMateriel[],
): UpdateMaterielDto {
  const next: LooseRecord = cleanEmptyValues({
    ...toRecord(data),
  });

  const position = readPosition(candidate);
  const etat = readEtatCode(candidate, etats);

  delete next.idMagasin;
  delete next.idEmplacement;
  delete next.idPereMateriel;
  delete next.idPereGeographique;

  if (position === 'SUR_TERRAIN') {
    next.dateRebut = null;

    if (!isEtatAllowedForPosition(etat, position)) {
      const idEtat = findEtatIdByCode(etats, 'EN_SERVICE');
      if (idEtat) next.idEtat = idEtat;
    }
  }

  if (position === 'EN_STOCK') {
    next.gereEnStock = true;
    next.idPointStructure = null;
    next.idMaterielParent = null;
    next.dateRebut = null;

    const idEtat = findEtatIdByCode(etats, 'DISPONIBLE');
    if (idEtat) next.idEtat = idEtat;
  }

  if (position === 'EN_ATELIER' || position === 'EN_REPARATION') {
    next.idMaterielParent = null;
    next.dateRebut = null;

    if (!isEtatAllowedForPosition(etat, position)) {
      const idEtat = findEtatIdByCode(etats, 'EN_MAINTENANCE');
      if (idEtat) next.idEtat = idEtat;
    }
  }

  if (position === 'AU_REBUT') {
    next.actif = false;
    next.idPointStructure = null;
    next.idMaterielParent = null;

    const idEtat = findEtatIdByCode(etats, 'AU_REBUT');
    if (idEtat) next.idEtat = idEtat;

    if (!hasValue(next.dateRebut)) {
      next.dateRebut = todayIsoDate();
    }
  }

  delete next.idMagasin;
  delete next.idEmplacement;
  delete next.idPereMateriel;
  delete next.idPereGeographique;
  delete next.etat;

  return next as UpdateMaterielDto;
}

function validateMaterielBusinessValues(
  source: LooseRecord,
  materielsParents: Materiel[],
  etats: EtatMateriel[],
): string[] {
  const errors: string[] = [];

  const position = readPosition(source);
  const etat = readEtatCode(source, etats);

  const idMateriel = readFirstNumber(source, ['idMateriel', 'id']);

  const idMaterielParent = readFirstNumber(source, [
    'idMaterielParent',
    'idPereMateriel',
  ]);

  const idPointStructure = readFirstNumber(source, [
    'idPointStructure',
    'idPereGeographique',
    'idPointGeographique',
  ]);

  const gereEnStock = readBoolean(source, 'gereEnStock');
  const reparable = readBoolean(source, 'reparable');

  if (!position) {
    errors.push('La position actuelle est obligatoire.');
  }

  if (!etat) {
    errors.push('L’état du matériel est obligatoire.');
  }

  if (position && etat && !isEtatAllowedForPosition(etat, position)) {
    errors.push(
      'L’état sélectionné n’est pas compatible avec la position actuelle.',
    );
  }

  if (position === 'SUR_TERRAIN') {
    if (!idPointStructure && !idMaterielParent) {
      errors.push(
        'Un matériel sur terrain doit avoir un père géographique ou un père matériel.',
      );
    }

    if (
      etat === 'EN_SERVICE' &&
      !hasAnyDate(source, ['dateMiseService', 'dateMiseEnService'])
    ) {
      errors.push(
        'La date de mise en service est obligatoire pour un matériel en service.',
      );
    }
  }

  if (position === 'EN_STOCK') {
    if (gereEnStock !== true) {
      errors.push('Un matériel en stock doit être géré en stock.');
    }
  }

  if (position === 'EN_ATELIER' || position === 'EN_REPARATION') {
    if (reparable === false) {
      errors.push('Un matériel non réparable ne peut pas être mis en réparation.');
    }
  }

  if (position === 'AU_REBUT') {
    if (etat !== 'AU_REBUT') {
      errors.push('Un matériel au rebut doit avoir l’état "Au rebut".');
    }

    if (readBoolean(source, 'actif') !== false) {
      errors.push('Un matériel au rebut doit être inactif.');
    }

    if (!hasAnyDate(source, ['dateRebut'])) {
      errors.push('La date de rebut est obligatoire.');
    }
  }

  if (idMaterielParent) {
    if (idMateriel && idMaterielParent === idMateriel) {
      errors.push('Un matériel ne peut pas être son propre père.');
    }

    const parent = materielsParents.find((item) => {
      const parentId = readFirstNumber(item, ['idMateriel', 'id']);
      return parentId === idMaterielParent;
    });

    if (parent) {
      const parentEtat = readEtatCode(parent, etats);
      const parentPosition = readPosition(parent);
      const parentGeoId = readFirstNumber(parent, [
        'idPointStructure',
        'idPereGeographique',
        'idPointGeographique',
      ]);

      if (parent.actif === false) {
        errors.push('Le père matériel sélectionné est inactif.');
      }

      if (parentEtat === 'AU_REBUT') {
        errors.push('Le père matériel sélectionné est au rebut.');
      }

      if (parentPosition && parentPosition !== 'SUR_TERRAIN') {
        errors.push('Le père matériel doit être sur terrain.');
      }

      if (parentGeoId && idPointStructure && parentGeoId !== idPointStructure) {
        errors.push(
          'Le père géographique doit être le même que celui du père matériel.',
        );
      }
    }
  }

  if (isFutureDate(source, ['dateMiseService', 'dateMiseEnService'])) {
    errors.push('La date de mise en service ne peut pas être dans le futur.');
  }

  if (isFutureDate(source, ['dateDernierInventaire'])) {
    errors.push('La date du dernier inventaire ne peut pas être dans le futur.');
  }

  if (isFutureDate(source, ['dateRebut'])) {
    errors.push('La date de rebut ne peut pas être dans le futur.');
  }

  if (
    hasAnyDate(source, ['dateRebut']) &&
    hasAnyDate(source, ['dateMiseService', 'dateMiseEnService']) &&
    isDateBefore(
      readFirstDate(source, ['dateRebut']),
      readFirstDate(source, ['dateMiseService', 'dateMiseEnService']),
    )
  ) {
    errors.push(
      'La date de rebut ne peut pas être avant la date de mise en service.',
    );
  }

  if (etat !== 'AU_REBUT' && hasAnyDate(source, ['dateRebut'])) {
    errors.push(
      'La date de rebut doit être vide si le matériel n’est pas au rebut.',
    );
  }

  return errors;
}

/* =========================================================
   HELPERS
========================================================= */

function toRecord(value: unknown): LooseRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as LooseRecord;
  }

  return {};
}

function cleanEmptyValues(source: LooseRecord): LooseRecord {
  const next = { ...source };

  for (const key of ID_KEYS_TO_CLEAN) {
    if (next[key] === '') {
      next[key] = null;
    }
  }

  for (const key of DATE_KEYS_TO_CLEAN) {
    if (next[key] === '') {
      next[key] = null;
    }
  }

  return next;
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

function readPosition(source: unknown): string {
  const position = readFirstBusinessCode(source, [
    'positionActuelle',
    'position',
  ]);

  if (position === 'REPARATION') return 'EN_REPARATION';
  if (position === 'ATELIER') return 'EN_ATELIER';

  return position;
}

function readEtatCode(source: unknown, etats: EtatMateriel[]): string {
  const directEtat = readFirstBusinessCode(source, [
    'etat',
    'etatMateriel',
    'statut',
    'codeEtat',
  ]);

  if (directEtat) {
    return directEtat;
  }

  const idEtat = readFirstNumber(source, ['idEtat', 'idEtatMateriel']);

  if (!idEtat) {
    return '';
  }

  const foundEtat = etats.find((etat) => {
    const etatId = readFirstNumber(etat, ['idEtat', 'id']);
    return etatId === idEtat;
  });

  if (!foundEtat) {
    return '';
  }

  return readFirstBusinessCode(foundEtat, ['code', 'libelle', 'nom']);
}

function readFirstBusinessCode(source: unknown, keys: string[]): string {
  const record = toRecord(source);

  for (const key of keys) {
    const value = record[key];
    const code = valueToBusinessCode(value);

    if (code) return code;
  }

  return '';
}

function valueToBusinessCode(value: unknown): string {
  if (!hasValue(value)) return '';

  if (typeof value === 'string') {
    return normalizeBusinessCode(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    const record = value as LooseRecord;

    for (const key of ['code', 'value', 'etat', 'libelle', 'nom']) {
      const nestedValue = record[key];

      if (typeof nestedValue === 'string' && nestedValue.trim()) {
        return normalizeBusinessCode(nestedValue);
      }
    }
  }

  return '';
}

function normalizeBusinessCode(value: string): string {
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
    EN_REPARATION_ATELIER: 'EN_REPARATION',

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

function isKnownPosition(position: string): position is KnownPosition {
  return Object.prototype.hasOwnProperty.call(ETATS_BY_POSITION, position);
}

function isEtatAllowedForPosition(etat: string, position: string): boolean {
  if (!etat || !position || !isKnownPosition(position)) return true;

  const allowedEtats = ETATS_BY_POSITION[position] as readonly string[];

  return allowedEtats.includes(etat);
}

function readBoolean(source: unknown, key: string): boolean | null {
  const record = toRecord(source);
  const value = record[key];

  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', 'oui', '1', 'yes'].includes(normalized)) return true;
    if (['false', 'non', '0', 'no'].includes(normalized)) return false;
  }

  return null;
}

function readFirstNumber(source: unknown, keys: string[]): number | null {
  const record = toRecord(source);

  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const numberValue = Number(value);

      if (Number.isFinite(numberValue) && numberValue > 0) {
        return numberValue;
      }
    }
  }

  return null;
}

function hasAnyDate(source: unknown, keys: string[]): boolean {
  return readFirstDate(source, keys) !== null;
}

function readFirstDate(source: unknown, keys: string[]): Date | null {
  const record = toRecord(source);

  for (const key of keys) {
    const value = record[key];

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function isFutureDate(source: unknown, keys: string[]): boolean {
  const date = readFirstDate(source, keys);

  if (!date) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return date.getTime() > today.getTime();
}

function isDateBefore(first: Date | null, second: Date | null): boolean {
  if (!first || !second) return false;

  return first.getTime() < second.getTime();
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function findEtatIdByCode(
  etats: EtatMateriel[],
  code: string,
): number | null {
  const normalizedCode = normalizeBusinessCode(code);

  const found = etats.find((etat) => {
    const etatCode = readFirstBusinessCode(etat, ['code', 'libelle', 'nom']);
    return etatCode === normalizedCode;
  });

  if (!found) return null;

  return readFirstNumber(found, ['idEtat', 'id']);
}

function getErrorMessage(err: unknown, fallback: string): string {
  const record = toRecord(err);
  const response = toRecord(record.response);
  const data = toRecord(response.data);

  const message = data.message;

  if (Array.isArray(message)) {
    return message.join('\n');
  }

  if (typeof message === 'string') {
    return message;
  }

  const errors = data.errors;

  if (errors && typeof errors === 'object') {
    return Object.values(errors as Record<string, unknown>)
      .map((value) => String(value))
      .join('\n');
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}