import { API_BASE_URL } from '@/lib/api';

import type {
  CreateModelePayload,
  FabricantApi,
  MarqueApi,
  ModeleApi,
  ModeleEtat,
  TypeEquipementApi,
  UpdateModelePayload,
  PlanPreventifPredefiniApi,
} from '@/features/modeles/types/modele';

async function readErrorMessage(response: Response, fallback: string) {
  let message = fallback;

  try {
    const data = await response.json();

    if (data?.message) {
      message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }
  } catch {}

  return message;
}

export async function getModeles(): Promise<ModeleApi[]> {
  const response = await fetch(`${API_BASE_URL}/modeles`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les modèles.');
  }

  return response.json();
}

export async function getModeleById(
  idModele: number | string,
): Promise<ModeleApi> {
  const response = await fetch(`${API_BASE_URL}/modeles/${idModele}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger le modèle.');
  }

  return response.json();
}

export async function getEtatsModele(): Promise<ModeleEtat[]> {
  const response = await fetch(`${API_BASE_URL}/etat-modele`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error("Impossible de charger les états du modèle.");
  }

  return response.json();
}

export async function getTypesEquipement(): Promise<TypeEquipementApi[]> {
  const response = await fetch(`${API_BASE_URL}/type-equipements`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error("Impossible de charger les types d'équipement.");
  }

  return response.json();
}

export async function getFabricants(): Promise<FabricantApi[]> {
  const response = await fetch(`${API_BASE_URL}/fabricants`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les fabricants.');
  }

  return response.json();
}

export async function getMarques(): Promise<MarqueApi[]> {
  const response = await fetch(`${API_BASE_URL}/marques`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les marques.');
  }

  return response.json();
}

export async function createModele(
  payload: CreateModelePayload,
): Promise<ModeleApi> {
  const response = await fetch(`${API_BASE_URL}/modeles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      "Impossible d'ajouter le modèle.",
    );

    throw new Error(message);
  }

  return response.json();
}

export async function updateModele(
  idModele: number | string,
  payload: UpdateModelePayload,
): Promise<ModeleApi> {
  const response = await fetch(`${API_BASE_URL}/modeles/${idModele}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      'Impossible de modifier le modèle.',
    );

    throw new Error(message);
  }

  return response.json();
}

export async function deleteModele(idModele: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/modeles/${idModele}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      'Impossible de supprimer le modèle.',
    );

    throw new Error(message);
  }
}
export async function getPlansPreventifsPredefinis(): Promise<
  PlanPreventifPredefiniApi[]
> {
  const response = await fetch(`${API_BASE_URL}/plans-preventifs-predefinis`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      'Impossible de charger les plans préventifs prédéfinis.',
    );
  }

  return response.json();
}