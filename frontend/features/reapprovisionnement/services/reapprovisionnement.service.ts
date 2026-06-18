import {
  CreateReapprovisionnementPayload,
  DemandeReapprovisionnement,
  StockDisponibleReapprovisionnement,
} from '../types/reapprovisionnement.types'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || `Erreur API (${response.status})`;

    throw new Error(message);
  }

  return response.json();
}

export function getReapprovisionnements() {
  return request<DemandeReapprovisionnement[]>(
    '/reapprovisionnements',
  );
}

export function getReapprovisionnement(id: number) {
  return request<DemandeReapprovisionnement>(
    `/reapprovisionnements/${id}`,
  );
}

export function getStockDisponibleReapprovisionnement() {
  return request<StockDisponibleReapprovisionnement[]>(
    '/reapprovisionnements/stock-disponible',
  );
}

export function getSuggestionsStockBas(seuil = 5) {
  return request<StockDisponibleReapprovisionnement[]>(
    `/reapprovisionnements/suggestions-stock-bas?seuil=${seuil}`,
  );
}

export function createReapprovisionnement(
  payload: CreateReapprovisionnementPayload,
) {
  return request<DemandeReapprovisionnement>(
    '/reapprovisionnements',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function validerReapprovisionnement(id: number) {
  return request<DemandeReapprovisionnement>(
    `/reapprovisionnements/${id}/valider`,
    {
      method: 'PATCH',
    },
  );
}

export function annulerReapprovisionnement(id: number) {
  return request<DemandeReapprovisionnement>(
    `/reapprovisionnements/${id}/annuler`,
    {
      method: 'PATCH',
    },
  );
}

export function deleteReapprovisionnement(id: number) {
  return request<{ message: string }>(
    `/reapprovisionnements/${id}`,
    {
      method: 'DELETE',
    },
  );
}