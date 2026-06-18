import {
  CreateDemandeTransfertPayload,
  DemandeTransfert,
  Magasin,
  StockDisponibleTransfert,
} from '../types/demande-transfert.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Erreur ${response.status}`;

    try {
      const data = await response.json();
      if (Array.isArray(data.message)) {
        message = data.message.join(', ');
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      message = await response.text();
    }

    throw new Error(message);
  }

  return response.json();
}

export function getDemandesTransfert() {
  return request<DemandeTransfert[]>('/demandes-transfert');
}

export function getDemandeTransfert(id: number) {
  return request<DemandeTransfert>(`/demandes-transfert/${id}`);
}

export function getStockDisponibleTransfert() {
  return request<StockDisponibleTransfert[]>(
    '/demandes-transfert/stock-disponible',
  );
}

export function createDemandeTransfert(
  payload: CreateDemandeTransfertPayload,
) {
  return request<DemandeTransfert>('/demandes-transfert', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function validerDemandeTransfert(id: number) {
  return request<DemandeTransfert>(`/demandes-transfert/${id}/valider`, {
    method: 'PATCH',
  });
}

export function executerDemandeTransfert(id: number) {
  return request<DemandeTransfert>(`/demandes-transfert/${id}/executer`, {
    method: 'PATCH',
  });
}

export function annulerDemandeTransfert(id: number) {
  return request<DemandeTransfert>(`/demandes-transfert/${id}/annuler`, {
    method: 'PATCH',
  });
}

export function deleteDemandeTransfert(id: number) {
  return request<DemandeTransfert>(`/demandes-transfert/${id}`, {
    method: 'DELETE',
  });
}

export function getMagasins() {
  return request<Magasin[]>('/magasins');
}