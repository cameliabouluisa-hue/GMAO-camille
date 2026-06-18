import {
  CreatePointStructureDto,
  FindPointsStructureQuery,
  PointStructureActionResponse,
  PointStructureDetail,
  PointStructureListItem,
  PointStructureParentOption,
  PointStructureStats,
  TypeArborescence,
  TypePointStructure,
  UpdatePointStructureDto,
} from '../types/point-structure.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join('\n')
      : data?.message || 'Une erreur est survenue.';

    throw new Error(message);
  }

  return data as T;
}

function isTypeArborescence(value: unknown): value is TypeArborescence {
  return value === 'GEOGRAPHIQUE' || value === 'TECHNIQUE';
}

function getLiensArborescence(item: any): any[] {
  if (Array.isArray(item?.liensArborescence)) {
    return item.liensArborescence;
  }

  if (Array.isArray(item?.liens)) {
    return item.liens;
  }

  return [];
}

function getPointArborescence(
  item: any,
  preferred?: TypeArborescence,
): TypeArborescence {
  if (preferred && pointBelongsToArborescence(item, preferred)) {
    return preferred;
  }

  if (isTypeArborescence(item?.typeArborescence)) {
    return item.typeArborescence;
  }

  if (isTypeArborescence(item?.placement?.typeArborescence)) {
    return item.placement.typeArborescence;
  }

  const liens = getLiensArborescence(item);

  const lienAvecType = liens.find((lien) =>
    isTypeArborescence(lien?.typeArborescence),
  );

  if (lienAvecType?.typeArborescence) {
    return lienAvecType.typeArborescence;
  }

  if (item?.typePoint === 'TECHNIQUE') {
    return 'TECHNIQUE';
  }

  return 'GEOGRAPHIQUE';
}

function pointBelongsToArborescence(
  item: any,
  typeArborescence: TypeArborescence,
): boolean {
  if (isTypeArborescence(item?.typeArborescence)) {
    return item.typeArborescence === typeArborescence;
  }

  if (isTypeArborescence(item?.placement?.typeArborescence)) {
    return item.placement.typeArborescence === typeArborescence;
  }

  const liens = getLiensArborescence(item);

  if (liens.length > 0) {
    return liens.some((lien) => {
      return lien?.typeArborescence === typeArborescence;
    });
  }

  return item?.typePoint === typeArborescence;
}

function normalizePointStructure(item: any): PointStructureListItem {
  const materielsCount = Number(
    item?.materielsCount ?? item?.nbMateriels ?? item?._count?.materiels ?? 0,
  );

  const typeArborescence = getPointArborescence(item);

  return {
    idPoint: Number(item.idPoint),
    code: item.code ?? '',
    libelle: item.libelle ?? '',
    description: item.description ?? null,

    typePoint: item.typePoint,
    typeArborescence,

    actif: Boolean(item.actif),

    etat: item.etat ?? 'VALIDE',
    categorie: item.categorie ?? null,

    responsable: item.responsable ?? null,
    organisation: item.organisation ?? null,
    centreCout: item.centreCout ?? null,

    interventionsAutorisees: item.interventionsAutorisees ?? true,
    criticite: item.criticite ?? 'MOYENNE',
    observationMaintenance: item.observationMaintenance ?? null,

    zoneSensible: item.zoneSensible ?? false,
    accesRestreint: item.accesRestreint ?? false,
    epiObligatoire: item.epiObligatoire ?? false,
    consigneSecurite: item.consigneSecurite ?? null,

    materielsCount,
    nbMateriels: materielsCount,

    placement: item.placement ?? null,
    liensArborescence: item.liensArborescence ?? item.liens ?? [],
    parent: item.parent ?? null,

    nbGammesOperations: item.nbGammesOperations ?? 0,
    nbPlansPreventifs: item.nbPlansPreventifs ?? 0,
    nbDeclencheursPreventifs: item.nbDeclencheursPreventifs ?? 0,
    nbHistoriquesPreventifs: item.nbHistoriquesPreventifs ?? 0,
  };
}

function normalizePayload<T extends Record<string, any>>(dto: T): T {
  const payload: Record<string, any> = {};

  const nullableStringFields = new Set([
    'description',
    'categorie',
    'responsable',
    'organisation',
    'centreCout',
    'observationMaintenance',
    'consigneSecurite',
  ]);

  Object.entries(dto).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === '') {
      payload[key] = nullableStringFields.has(key) ? null : '';
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (nullableStringFields.has(key) && trimmed.length === 0) {
        payload[key] = null;
        return;
      }

      payload[key] = key === 'code' ? trimmed.toUpperCase() : trimmed;
      return;
    }

    payload[key] = value;
  });

  return payload as T;
}

export async function getPointsStructure(
  query: FindPointsStructureQuery = {},
): Promise<PointStructureListItem[]> {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.typePoint && query.typePoint !== 'TOUS') {
    params.set('typePoint', query.typePoint);
  }

  if (query.actif && query.actif !== 'all') {
    params.set('actif', query.actif);
  }

  if (query.etat && query.etat !== 'TOUS') {
    params.set('etat', query.etat);
  }

  if (query.categorie?.trim()) {
    params.set('categorie', query.categorie.trim());
  }

  if (query.criticite && query.criticite !== 'TOUS') {
    params.set('criticite', query.criticite);
  }

  const queryString = params.toString();

  const data = await request<any[]>(
    `${API_URL}/points-structure${queryString ? `?${queryString}` : ''}`,
  );

  return data.map(normalizePointStructure);
}

export async function getPointStructure(
  idPoint: number,
): Promise<PointStructureDetail> {
  const data = await request<any>(`${API_URL}/points-structure/${idPoint}`);

  return normalizePointStructure(data) as PointStructureDetail;
}

export async function createPointStructure(
  dto: CreatePointStructureDto,
): Promise<PointStructureListItem> {
  const data = await request<any>(`${API_URL}/points-structure`, {
    method: 'POST',
    body: JSON.stringify(normalizePayload(dto)),
  });

  return normalizePointStructure(data);
}

export async function updatePointStructure(
  idPoint: number,
  dto: UpdatePointStructureDto,
): Promise<PointStructureListItem> {
  const data = await request<any>(`${API_URL}/points-structure/${idPoint}`, {
    method: 'PATCH',
    body: JSON.stringify(normalizePayload(dto)),
  });

  return normalizePointStructure(data);
}

export async function deletePointStructure(
  idPoint: number,
): Promise<PointStructureActionResponse> {
  return request<PointStructureActionResponse>(
    `${API_URL}/points-structure/${idPoint}`,
    {
      method: 'DELETE',
    },
  );
}

export async function restorePointStructure(
  idPoint: number,
): Promise<PointStructureActionResponse> {
  return request<PointStructureActionResponse>(
    `${API_URL}/points-structure/${idPoint}/restaurer`,
    {
      method: 'PATCH',
    },
  );
}

export async function deleteDefinitifPointStructure(
  idPoint: number,
): Promise<PointStructureActionResponse> {
  return request<PointStructureActionResponse>(
    `${API_URL}/points-structure/${idPoint}/definitif`,
    {
      method: 'DELETE',
    },
  );
}

export async function getPointStructureParents(
  options: {
    typeArborescence?: TypeArborescence | 'TOUS';
    typePoint?: TypePointStructure | 'TOUS';
    excludeId?: number;
  } = {},
): Promise<PointStructureParentOption[]> {
  const points = await getPointsStructure({
    actif: 'true',
    typePoint: 'TOUS',
  });

  const typeArborescence = options.typeArborescence ?? 'TOUS';

  return points
    .filter((point) => point.idPoint !== options.excludeId)
    .filter((point) => {
      if (typeArborescence !== 'TOUS') {
        return pointBelongsToArborescence(point, typeArborescence);
      }

      if (options.typePoint && options.typePoint !== 'TOUS') {
        return point.typePoint === options.typePoint;
      }

      return true;
    })
    .map((point) => ({
      idPoint: point.idPoint,
      code: point.code,
      libelle: point.libelle,
      typePoint: point.typePoint,
      typeArborescence:
        typeArborescence !== 'TOUS'
          ? typeArborescence
          : getPointArborescence(point),
      actif: point.actif,
    }));
}

export async function getPointsStructureStats(): Promise<PointStructureStats> {
  const points = await getPointsStructure({
    actif: 'all',
    typePoint: 'TOUS',
  });

  return {
    total: points.length,
    geographiques: points.filter(
      (point) => point.typePoint === 'GEOGRAPHIQUE',
    ).length,
    techniques: points.filter(
      (point) => point.typePoint === 'TECHNIQUE',
    ).length,
    actifs: points.filter((point) => point.actif).length,
    inactifs: points.filter((point) => !point.actif).length,
  };
}