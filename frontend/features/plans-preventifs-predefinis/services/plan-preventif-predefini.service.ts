import type {
  CreatePppDeclencheurPayload,
  CreatePlanPreventifPredefiniPayload,
  PlanPreventifPredefini,
  PppDeclencheur,
  UpdatePlanPreventifPredefiniPayload,
  UpdatePppDeclencheurPayload,
} from '../types/plan-preventif-predefini.types';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function getPlansPreventifsPredefinis(): Promise<
  PlanPreventifPredefini[]
> {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs-predefinis`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      'Erreur lors du chargement des plans préventifs prédéfinis.',
    );
  }

  return res.json();
}

export async function getPlanPreventifPredefiniById(
  id: number,
): Promise<PlanPreventifPredefini> {
  const res = await fetch(
    `${API_BASE_URL}/plans-preventifs-predefinis/${id}`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(
      'Erreur lors du chargement du plan préventif prédéfini.',
    );
  }

  return res.json();
}

export async function createPlanPreventifPredefini(
  payload: CreatePlanPreventifPredefiniPayload,
): Promise<PlanPreventifPredefini> {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs-predefinis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la création du plan préventif prédéfini.');
  }

  return res.json();
}

export async function updatePlanPreventifPredefini(
  id: number,
  payload: UpdatePlanPreventifPredefiniPayload,
): Promise<PlanPreventifPredefini> {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs-predefinis/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      'Erreur lors de la mise à jour du plan préventif prédéfini.',
    );
  }

  return res.json();
}

export async function deletePlanPreventifPredefini(
  id: number,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/plans-preventifs-predefinis/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(
      'Erreur lors de la suppression du plan préventif prédéfini.',
    );
  }

  return;
}

export async function updatePppDeclencheur(
  idPppDeclencheur: number,
  payload: UpdatePppDeclencheurPayload,
): Promise<PppDeclencheur> {
  const res = await fetch(
    `${API_BASE_URL}/plans-preventifs-predefinis/declencheurs/${idPppDeclencheur}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    throw new Error('Erreur lors de la mise à jour du déclencheur PPP.');
  }

  return res.json();
}

export async function deletePppDeclencheur(
  idPppDeclencheur: number,
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/plans-preventifs-predefinis/declencheurs/${idPppDeclencheur}`,
    {
      method: 'DELETE',
    },
  );

  if (!res.ok) {
    throw new Error('Erreur lors de la suppression du déclencheur PPP.');
  }

  return;
}
export async function createPppDeclencheur(
  idPlanPreventifPredefini: number,
  payload: CreatePppDeclencheurPayload,
): Promise<PppDeclencheur> {
  const res = await fetch(
    `${API_BASE_URL}/plans-preventifs-predefinis/${idPlanPreventifPredefini}/declencheurs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    throw new Error('Erreur lors de la création du déclencheur PPP.');
  }

  return res.json();
}