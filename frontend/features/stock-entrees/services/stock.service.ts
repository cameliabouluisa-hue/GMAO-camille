import type {
  MouvementStock,
  StockArticleMagasin,
} from '../types/stock';

const API_URL = 'http://localhost:3001';

export async function getStockActuel(): Promise<StockArticleMagasin[]> {
  const response = await fetch(`${API_URL}/stock`);

  if (!response.ok) {
    throw new Error('Erreur lors du chargement du stock actuel.');
  }

  return response.json();
}

export async function getMouvementsStock(): Promise<MouvementStock[]> {
  const response = await fetch(`${API_URL}/stock/mouvements`);

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des mouvements stock.');
  }

  return response.json();
}