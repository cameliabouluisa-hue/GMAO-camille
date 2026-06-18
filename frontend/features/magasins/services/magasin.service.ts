import type {
  CreateEmplacementMagasinDto,
  CreateMagasinDto,
  EmplacementMagasin,
  Magasin,
  UpdateEmplacementMagasinDto,
  UpdateMagasinDto,
} from '../types/magasin';

const API_URL = 'http://localhost:3001/magasins';

async function handleResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  if (!res.ok) {
    let message = fallbackMessage;

    try {
      const error = await res.json();
      message = error?.message || fallbackMessage;
    } catch {
      message = fallbackMessage;
    }

    throw new Error(message);
  }

  return res.json();
}

/* =========================
   MAGASINS
========================= */

export async function getMagasins(): Promise<Magasin[]> {
  const res = await fetch(API_URL, { cache: 'no-store' });

  return handleResponse<Magasin[]>(
    res,
    'Erreur lors du chargement des magasins.',
  );
}

export async function getMagasinById(id: number): Promise<Magasin> {
  const res = await fetch(`${API_URL}/${id}`, { cache: 'no-store' });

  return handleResponse<Magasin>(res, 'Magasin introuvable.');
}

export async function createMagasin(
  data: CreateMagasinDto,
): Promise<Magasin> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<Magasin>(
    res,
    'Erreur lors de la création du magasin.',
  );
}

export async function updateMagasin(
  id: number,
  data: UpdateMagasinDto,
): Promise<Magasin> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<Magasin>(
    res,
    'Erreur lors de la modification du magasin.',
  );
}

export async function deleteMagasin(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    let message = 'Impossible de supprimer ce magasin.';

    try {
      const error = await res.json();
      message = error?.message || message;
    } catch {
      // rien
    }

    throw new Error(message);
  }
}

/* =========================
   EMPLACEMENTS MAGASIN
========================= */

export async function getEmplacementsByMagasin(
  idMagasin: number,
): Promise<EmplacementMagasin[]> {
  const res = await fetch(`${API_URL}/${idMagasin}/emplacements`, {
    cache: 'no-store',
  });

  return handleResponse<EmplacementMagasin[]>(
    res,
    'Erreur lors du chargement des emplacements.',
  );
}

export async function createEmplacementMagasin(
  idMagasin: number,
  data: CreateEmplacementMagasinDto,
): Promise<EmplacementMagasin> {
  const res = await fetch(`${API_URL}/${idMagasin}/emplacements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<EmplacementMagasin>(
    res,
    'Erreur lors de la création de l’emplacement.',
  );
}

export async function updateEmplacementMagasin(
  idEmplacement: number,
  data: UpdateEmplacementMagasinDto,
): Promise<EmplacementMagasin> {
  const res = await fetch(`${API_URL}/emplacements/${idEmplacement}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<EmplacementMagasin>(
    res,
    'Erreur lors de la modification de l’emplacement.',
  );
}

export async function deleteEmplacementMagasin(
  idEmplacement: number,
): Promise<EmplacementMagasin> {
  const res = await fetch(`${API_URL}/emplacements/${idEmplacement}`, {
    method: 'DELETE',
  });

  return handleResponse<EmplacementMagasin>(
    res,
    'Impossible de désactiver cet emplacement.',
  );
}