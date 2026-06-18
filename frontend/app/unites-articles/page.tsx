'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { UniteArticleTable } from '@/features/unites-articles/components/UniteArticleTable';
import {
  deleteUniteArticle,
  getUnitesArticles,
} from '@/features/unites-articles/services/unite-article.service';
import { UniteArticle } from '@/features/unites-articles/types/unite-article';

export default function UnitesArticlesPage() {
  const router = useRouter();
  const [data, setData] = useState<UniteArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const result = await getUnitesArticles();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette unité article ?',
    );

    if (!confirmed) return;

    try {
      await deleteUniteArticle(id);
      await loadData();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Suppression impossible.',
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              BMT · Module stock
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#0f3d56]">
              Unités articles
            </h1>
            <p className="mt-2 text-slate-500">
              Gestion des unités utilisées pour les articles stockés.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          
        </div>

        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Chargement des unités articles...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <UniteArticleTable
            data={data}
            onCreate={() => router.push('/unites-articles/nouvelle')}
            onEdit={(id) => router.push(`/unites-articles/${id}/modifier`)}
            onRemove={handleDelete}
          />
        )}
      </div>
    </main>
  );
}