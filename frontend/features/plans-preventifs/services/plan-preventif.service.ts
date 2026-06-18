import type {
  CreatePlanPreventifDeclencheurPayload,
  CreatePlanPreventifPayload,
  Gamme,
  Materiel,
  PlanPreventif,
  PlanPreventifDeclencheur,
  PlanPreventifPredefini,
  PointMesure,
  UpdatePlanPreventifPayload,
  UpdatePlanPreventifDeclencheurPayload,
} from '../types/plan-preventif.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.message || `Erreur API ${response.status} sur ${endpoint}.`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getPlansPreventifs() {
  return request<PlanPreventif[]>('/plans-preventifs');
}

export async function getPlanPreventifById(id: number) {
  return request<PlanPreventif>(`/plans-preventifs/${id}`);
}

export async function createPlanPreventif(payload: CreatePlanPreventifPayload) {
  return request<PlanPreventif>('/plans-preventifs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePlanPreventif(
  id: number,
  payload: UpdatePlanPreventifPayload,
) {
  return request<PlanPreventif>(`/plans-preventifs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePlanPreventif(id: number) {
  return request<{ message?: string }>(`/plans-preventifs/${id}`, {
    method: 'DELETE',
  });
}
export async function updatePlanPreventifDeclencheur(
  idPlanPreventifDeclencheur: number,
  payload: UpdatePlanPreventifDeclencheurPayload,
) {
  return request<PlanPreventifDeclencheur>(
    `/plans-preventifs/declencheurs/${idPlanPreventifDeclencheur}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deletePlanPreventifDeclencheur(
  idPlanPreventifDeclencheur: number,
) {
  return request<{ message?: string }>(
    `/plans-preventifs/declencheurs/${idPlanPreventifDeclencheur}`,
    {
      method: 'DELETE',
    },
  );
}
export async function getPlanPreventifDeclencheurs(idPlanPreventif: number) {
  return request<PlanPreventifDeclencheur[]>(
    `/plans-preventifs/${idPlanPreventif}/declencheurs`,
  );
}

export async function getAllPlanPreventifDeclencheurs() {
  return request<PlanPreventifDeclencheur[]>(
    '/plans-preventifs/all-declencheurs',
  );
}

export async function regeneratePlanPreventifDeclencheurs(
  idPlanPreventif: number,
) {
  return request<PlanPreventif>(
    `/plans-preventifs/${idPlanPreventif}/regenerate-declencheurs`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  );
}

export async function generateOtPreventifFromDeclencheur(
  idPlanPreventifDeclencheur: number,
) {
  return request<{
    message: string;
    intervention: unknown;
  }>(`/plans-preventifs/generate-ot/${idPlanPreventifDeclencheur}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getPlanPreventifsPredefinis() {
  return request<PlanPreventifPredefini[]>('/plans-preventifs-predefinis');
}

export async function getGammesForPlanPreventif() {
  return request<Gamme[]>('/gammes');
}

export async function getPointsMesureForPlanPreventif() {
  return request<PointMesure[]>('/points-mesure');
}

export async function getMaterielsForPlanPreventif() {
  const endpoints = ['/materiel', '/materiels', '/equipements', '/equipement'];

  for (const endpoint of endpoints) {
    try {
      return await request<Materiel[]>(endpoint);
    } catch {
      // endpoint suivant
    }
  }

  throw new Error(
    'Impossible de charger les matériels. Vérifie la route backend du module matériel.',
  );
}

export async function createPlanPreventifDeclencheur(
  idPlanPreventif: number,
  payload: CreatePlanPreventifDeclencheurPayload,
) {
  return request<PlanPreventifDeclencheur>(
    `/plans-preventifs/${idPlanPreventif}/declencheurs`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}