import {
  CreateStockEntreeDto,
  LigneStockEntreeDto,
  StockEntree,
} from '../types/stock-entree';

const API_URL = 'http://localhost:3001';

async function handleApiError(response: Response, defaultMessage: string) {
  const error = await response.json().catch(() => null);

  if (Array.isArray(error?.message)) {
    throw new Error(error.message.join(', '));
  }

  throw new Error(error?.message ?? defaultMessage);
}

export async function createStockEntree(
  data: CreateStockEntreeDto,
): Promise<StockEntree> {
  const response = await fetch(`${API_URL}/stock/entrees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors de la création de l'entrée stock.",
    );
  }

  return response.json();
}

export async function getStockEntrees(): Promise<StockEntree[]> {
  const response = await fetch(`${API_URL}/stock/entrees`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    await handleApiError(
      response,
      'Erreur lors du chargement des entrées stock.',
    );
  }

  return response.json();
}

export async function getStockEntreeById(
  id: number,
): Promise<StockEntree> {
  const response = await fetch(`${API_URL}/stock/entrees/${id}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors du chargement de l'entrée stock.",
    );
  }

  return response.json();
}
export async function updateStockEntree(
  id: number,
  data: {
    numero?: string;
    dateReception?: string;
    commentaire?: string;
  },
): Promise<StockEntree> {
  const response = await fetch(`${API_URL}/stock/entrees/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors de la modification du bon d'entrée.",
    );
  }

  return response.json();
}

export async function addStockEntreeLigne(
  id: number,
  data: LigneStockEntreeDto,
): Promise<StockEntree> {
  const response = await fetch(`${API_URL}/stock/entrees/${id}/lignes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors de l'ajout de la ligne d'entrée.",
    );
  }

  return response.json();
}

export async function updateStockEntreeLigne(
  id: number,
  idLigne: number,
  data: Partial<LigneStockEntreeDto>,
): Promise<StockEntree> {
  const response = await fetch(
    `${API_URL}/stock/entrees/${id}/lignes/${idLigne}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors de la modification de la ligne d'entrée.",
    );
  }

  return response.json();
}

export async function deleteStockEntreeLigne(
  id: number,
  idLigne: number,
): Promise<StockEntree> {
  const response = await fetch(
    `${API_URL}/stock/entrees/${id}/lignes/${idLigne}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    await handleApiError(
      response,
      "Erreur lors de la suppression de la ligne d'entrée.",
    );
  }

  return response.json();
}