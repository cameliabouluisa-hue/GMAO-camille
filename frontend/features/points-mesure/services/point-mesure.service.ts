import type {
  CreatePointMesurePayload,
  CreateReleveMesurePayload,
  MaterielOption,
  PointMesure,
  PointStructureOption,
  ReleveMesure,
  UpdatePointMesurePayload,
} from '../types/point-mesure.types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message;

    throw new Error(message || `Erreur API ${res.status} sur ${endpoint}.`);
  }

  return res.json() as Promise<T>;
}



export type PointMesureFilters = {
  search?: string;
  type?: 'TOUS' | 'COMPTEUR' | 'CONDITIONNEL';
  actif?: 'true' | 'false' | 'all';
};

export async function getPointsMesure(
  filters?: PointMesureFilters,
): Promise<PointMesure[]> {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.set('search', filters.search);
  }

  if (filters?.type && filters.type !== 'TOUS') {
    params.set('type', filters.type);
  }

  if (filters?.actif && filters.actif !== 'all') {
    params.set('actif', filters.actif);
  }

  const query = params.toString();

  return request<PointMesure[]>(
    query ? `/points-mesure?${query}` : '/points-mesure',
  );
}

export async function getPointMesure(
  idPointMesure: number,
): Promise<PointMesure> {
  return request<PointMesure>(`/points-mesure/${idPointMesure}`);
}
export async function createPointMesure(
  payload: CreatePointMesurePayload,
): Promise<PointMesure> {
  return request<PointMesure>('/points-mesure', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePointMesure(
  idPointMesure: number,
  payload: UpdatePointMesurePayload,
): Promise<PointMesure> {
  return request<PointMesure>(`/points-mesure/${idPointMesure}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePointMesure(
  idPointMesure: number,
): Promise<PointMesure> {
  return request<PointMesure>(`/points-mesure/${idPointMesure}`, {
    method: 'DELETE',
  });
}

export async function restorePointMesure(
  idPointMesure: number,
): Promise<PointMesure> {
  return request<PointMesure>(`/points-mesure/${idPointMesure}/restore`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function getPointsStructureOptions(): Promise<
  PointStructureOption[]
> {
  return request<PointStructureOption[]>('/points-structure?actif=true');
}

export async function getMaterielsOptions(): Promise<MaterielOption[]> {
  const endpoints = ['/materiel', '/materiels', '/equipements', '/equipement'];

  for (const endpoint of endpoints) {
    try {
      return await request<MaterielOption[]>(endpoint);
    } catch {
      // On essaye la route suivante.
    }
  }

  throw new Error(
    'Impossible de charger les matériels. Vérifie la route backend du module matériel.',
  );
}
export async function createReleveMesure(
  payload: CreateReleveMesurePayload,
): Promise<ReleveMesure> {
  return request<ReleveMesure>('/releves-mesure', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteReleveMesure(
  idReleveMesure: number,
): Promise<ReleveMesure> {
  return request<ReleveMesure>(`/releves-mesure/${idReleveMesure}`, {
    method: 'DELETE',
  });
}