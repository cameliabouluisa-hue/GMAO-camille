import { API_BASE_URL } from '@/lib/api';
import {
  CreateGammeOperationPayload,
  CreateGammePayload,
  Gamme,
  GammeOperation,
  UpdateGammeOperationPayload,
  UpdateGammePayload,
} from '../types/gamme.types';

export async function getGammes(): Promise<Gamme[]> {
  const res = await fetch(`${API_BASE_URL}/gammes`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des gammes');
  }

  return res.json();
}

export async function getGammeById(id: number): Promise<Gamme> {
  const res = await fetch(`${API_BASE_URL}/gammes/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement de la gamme');
  }

  return res.json();
}

export async function createGamme(payload: CreateGammePayload): Promise<Gamme> {
  const res = await fetch(`${API_BASE_URL}/gammes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la création de la gamme');
  }

  return res.json();
}

export async function updateGamme(
  id: number,
  payload: UpdateGammePayload,
): Promise<Gamme> {
  const res = await fetch(`${API_BASE_URL}/gammes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la mise à jour de la gamme');
  }

  return res.json();
}

export async function deleteGamme(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/gammes/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la suppression de la gamme');
  }
}

export async function getOperationsByGamme(
  idGamme: number,
): Promise<GammeOperation[]> {
  const res = await fetch(`${API_BASE_URL}/gammes/${idGamme}/operations`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des opérations');
  }

  return res.json();
}

export async function createGammeOperation(
  idGamme: number,
  payload: CreateGammeOperationPayload,
): Promise<GammeOperation> {
  const res = await fetch(`${API_BASE_URL}/gammes/${idGamme}/operations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création de l'opération");
  }

  return res.json();
}

export async function updateGammeOperation(
  idOperation: number,
  payload: UpdateGammeOperationPayload,
): Promise<GammeOperation> {
  const res = await fetch(`${API_BASE_URL}/gammes/operations/${idOperation}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour de l'opération");
  }

  return res.json();
}

export async function deleteGammeOperation(idOperation: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/gammes/operations/${idOperation}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la suppression de l'opération");
  }
}