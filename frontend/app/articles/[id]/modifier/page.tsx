'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

import ArticleForm  from '@/features/articles/components/ArticleForm';

import {
  getArticleById,
  updateArticle,
} from '@/features/articles/services/article.service';

import type {
  Article,
  CreateArticleDto,
  UpdateArticleDto,
} from '@/features/articles/types/article';

export default function ModifierArticlePage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    const rawId = params?.id;
    const value = Array.isArray(rawId) ? rawId[0] : rawId;
    return Number(value);
  }, [params]);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError("Identifiant de l'article invalide.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await getArticleById(id);
      setArticle(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement de l'article.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(data: CreateArticleDto | UpdateArticleDto) {
    if (!article) return;

    try {
      setSubmitting(true);
      setError('');

      const updated = await updateArticle(
        article.idArticle,
        data as UpdateArticleDto,
      );

      router.push(`/articles/${updated.idArticle}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la modification de l'article.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1180px] space-y-5">
        <BackButton onClick={() => router.back()} />

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : !article ? (
          <ErrorState message="Article introuvable." onRetry={loadData} />
        ) : (
          <ArticleForm
            mode="edit"
            article={article}
            loading={loading}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </section>
    </main>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
    >
      <ArrowLeft size={18} />
      Retour
    </button>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <RefreshCcw size={24} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        Chargement du formulaire article...
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="mt-4 text-lg font-black text-slate-950">
        Impossible de charger l’article
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
      >
        <RefreshCcw size={16} />
        Réessayer
      </button>
    </div>
  );
}