import {
  AddLigneInventaireDto,
  Article,
  CreateInventairePrepareDto,
  InventairePrepare,
  Magasin,
  SaisirQuantitesDto,
} from '../types/inventaire-prepare.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Erreur serveur';

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      message = await response.text();
    }

    throw new Error(message);
  }

  return response.json();
}

function normalizeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }

  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  return [];
}

export async function getInventairesPrepares() {
  const data = await fetchJson<unknown>('/inventaires-prepares');
  return normalizeArray<InventairePrepare>(data);
}

export async function getInventairePrepare(id: number) {
  return fetchJson<InventairePrepare>(`/inventaires-prepares/${id}`);
}

export async function createInventairePrepare(
  dto: CreateInventairePrepareDto,
) {
  return fetchJson<InventairePrepare>('/inventaires-prepares', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function addLigneInventaire(
  idInventairePrepare: number,
  dto: AddLigneInventaireDto,
) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/lignes`,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
  );
}

export async function genererLignesDepuisStock(
  idInventairePrepare: number,
) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/generer-lignes-depuis-stock`,
    {
      method: 'POST',
    },
  );
}

export async function lancerComptage(idInventairePrepare: number) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/lancer-comptage`,
    {
      method: 'PATCH',
    },
  );
}

export async function saisirQuantites(
  idInventairePrepare: number,
  dto: SaisirQuantitesDto,
) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/saisir-quantites`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
  );
}

export async function validerInventaire(idInventairePrepare: number) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/valider`,
    {
      method: 'PATCH',
    },
  );
}

export async function annulerInventaire(idInventairePrepare: number) {
  return fetchJson<InventairePrepare>(
    `/inventaires-prepares/${idInventairePrepare}/annuler`,
    {
      method: 'PATCH',
    },
  );
}

export async function deleteInventairePrepare(idInventairePrepare: number) {
  return fetchJson<void>(
    `/inventaires-prepares/${idInventairePrepare}`,
    {
      method: 'DELETE',
    },
  );
}

export async function getMagasins() {
  try {
    const data = await fetchJson<unknown>('/magasins');
    return normalizeArray<Magasin>(data);
  } catch {
    const data = await fetchJson<unknown>('/magasin');
    return normalizeArray<Magasin>(data);
  }
}

export async function getArticles() {
  const data = await fetchJson<unknown>('/articles');
  return normalizeArray<Article>(data);
}