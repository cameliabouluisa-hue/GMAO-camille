import type {
  CreateStockSortieDto,
  LigneSortieStockCrudDto,
  StockSortie,
  UpdateLigneSortieStockDto,
  UpdateStockSortieDto,
} from '../types/stock-sortie';

const API_URL = 'http://localhost:3001';

async function handleApiError(response: Response, defaultMessage: string) {
  const error = await response.json().catch(() => null);

  const message = Array.isArray(error?.message)
    ? error.message.join(', ')
    : error?.message || defaultMessage;

  throw new Error(message);
}

function normalizeSortie(data: StockSortie): StockSortie {
  return {
    ...data,
    lignes: data.lignes ?? data.sortie_stock_ligne ?? [],
  };
}

function normalizeSorties(data: StockSortie[]): StockSortie[] {
  return data.map(normalizeSortie);
}

export async function getStockSorties(): Promise<StockSortie[]> {
  const response = await fetch(`${API_URL}/stock/sorties`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    await handleApiError(response, 'Erreur lors du chargement des sorties.');
  }

  const data = await response.json();

  return normalizeSorties(data);
}

export async function getStockSortie(id: number): Promise<StockSortie> {
  const response = await fetch(`${API_URL}/stock/sorties/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    await handleApiError(
      response,
      'Erreur lors du chargement du bon de sortie.',
    );
  }

  const data = await response.json();

  return normalizeSortie(data);
}

export async function createStockSortie(
  data: CreateStockSortieDto,
): Promise<StockSortie> {
  const response = await fetch(`${API_URL}/stock/sorties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(
      response,
      'Erreur lors de la création du bon de sortie.',
    );
  }

  const result = await response.json();

  return normalizeSortie(result);
}

export async function updateStockSortie(
  id: number,
  data: UpdateStockSortieDto,
): Promise<StockSortie> {
  const response = await fetch(`${API_URL}/stock/sorties/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(
      response,
      'Erreur lors de la modification du bon de sortie.',
    );
  }

  const result = await response.json();

  return normalizeSortie(result);
}

export async function addStockSortieLigne(
  idSortieStock: number,
  data: LigneSortieStockCrudDto,
): Promise<StockSortie> {
  const response = await fetch(
    `${API_URL}/stock/sorties/${idSortieStock}/lignes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    await handleApiError(response, "Erreur lors de l'ajout de la ligne.");
  }

  const result = await response.json();

  return normalizeSortie(result);
}

export async function updateStockSortieLigne(
  idSortieStock: number,
  idLigneSortieStock: number,
  data: UpdateLigneSortieStockDto,
): Promise<StockSortie> {
  const response = await fetch(
    `${API_URL}/stock/sorties/${idSortieStock}/lignes/${idLigneSortieStock}`,
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
      'Erreur lors de la modification de la ligne.',
    );
  }

  const result = await response.json();

  return normalizeSortie(result);
}

export async function deleteStockSortieLigne(
  idSortieStock: number,
  idLigneSortieStock: number,
): Promise<StockSortie> {
  const response = await fetch(
    `${API_URL}/stock/sorties/${idSortieStock}/lignes/${idLigneSortieStock}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    await handleApiError(
      response,
      'Erreur lors de la suppression de la ligne.',
    );
  }

  const result = await response.json();

  return normalizeSortie(result);
}