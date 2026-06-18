import {
  InventaireMagasin,
  InventaireStockLigne,
  ValiderInventairePayload,
  ValiderInventaireResponse,
} from '../types/inventaire.type';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(' / ')
      : error?.message || 'Une erreur est survenue.';

    throw new Error(message);
  }

  return response.json();
}

export async function getInventaireMagasins() {
  return request<InventaireMagasin[]>('/inventaire/magasins');
}

export async function getInventaireStock(params: {
  idMagasin?: number;
  search?: string;
}) {
  const query = new URLSearchParams();

  if (params.idMagasin) {
    query.set('idMagasin', String(params.idMagasin));
  }

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return request<InventaireStockLigne[]>(`/inventaire${suffix}`);
}

export async function validerInventaire(
  payload: ValiderInventairePayload,
) {
  return request<ValiderInventaireResponse>('/inventaire/valider', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}