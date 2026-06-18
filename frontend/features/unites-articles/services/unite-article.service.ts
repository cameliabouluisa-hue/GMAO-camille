import {
  CreateUniteArticleDto,
  UniteArticle,
  UpdateUniteArticleDto,
} from '../types/unite-article';

const API_URL = 'http://localhost:3001/unites-articles';

export async function getUnitesArticles(): Promise<UniteArticle[]> {
  const res = await fetch(API_URL, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des unités articles.');
  }

  return res.json();
}

export async function getUniteArticleById(id: number): Promise<UniteArticle> {
  const res = await fetch(`${API_URL}/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error("Unité d'article introuvable.");
  }

  return res.json();
}

export async function createUniteArticle(
  data: CreateUniteArticleDto,
): Promise<UniteArticle> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création de l'unité article.");
  }

  return res.json();
}

export async function updateUniteArticle(
  id: number,
  data: UpdateUniteArticleDto,
): Promise<UniteArticle> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la modification de l'unité article.");
  }

  return res.json();
}

export async function deleteUniteArticle(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error("Impossible de supprimer cette unité article.");
  }
}