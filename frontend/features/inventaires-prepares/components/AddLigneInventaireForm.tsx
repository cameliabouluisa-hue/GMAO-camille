'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import {
  addLigneInventaire,
  getArticles,
} from '../services/inventaires-prepares.service';
import {
  Article,
  getArticleDesignation,
  getArticleReference,
} from '../types/inventaire-prepare.types';

type Props = {
  idInventairePrepare: number;
  onSuccess: () => void;
};

export function AddLigneInventaireForm({
  idInventairePrepare,
  onSuccess,
}: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [idArticle, setIdArticle] = useState('');
  const [quantiteTheorique, setQuantiteTheorique] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoadingArticles(true);
        const data = await getArticles();
        setArticles(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger les articles.',
        );
      } finally {
        setLoadingArticles(false);
      }
    }

    loadArticles();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!idArticle) {
      setError('Veuillez choisir un article.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addLigneInventaire(idInventairePrepare, {
        idArticle: Number(idArticle),
        quantiteTheorique:
          quantiteTheorique.trim() === ''
            ? undefined
            : Number(quantiteTheorique),
      });

      setIdArticle('');
      setQuantiteTheorique('');
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ajouter la ligne.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-black text-slate-950">
        Ajouter un article à compter
      </h3>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_180px_auto]">
        <select
          value={idArticle}
          onChange={(event) => setIdArticle(event.target.value)}
          disabled={loadingArticles}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        >
          <option value="">
            {loadingArticles
              ? 'Chargement...'
              : 'Sélectionner un article'}
          </option>

          {articles.map((article) => (
            <option key={article.idArticle} value={article.idArticle}>
              {getArticleReference(article)} —{' '}
              {getArticleDesignation(article)}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          step="1"
          value={quantiteTheorique}
          onChange={(event) =>
            setQuantiteTheorique(event.target.value)
          }
          placeholder="Qté théorique"
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0b3f59] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#083247] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          Ajouter
        </button>
      </div>
    </form>
  );
}