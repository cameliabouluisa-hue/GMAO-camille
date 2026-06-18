'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { UniteArticleForm } from '@/features/unites-articles/components/UniteArticleForm';
import { createUniteArticle } from '@/features/unites-articles/services/unite-article.service';
import { CreateUniteArticleDto } from '@/features/unites-articles/types/unite-article';

export default function NouvelleUniteArticlePage() {
  const router = useRouter();

  async function handleSubmit(data: CreateUniteArticleDto) {
    await createUniteArticle(data);
    router.push('/unites-articles');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              BMT · Module stock
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#0f3d56]">
              Nouvelle unité article
            </h1>
            <p className="mt-2 text-slate-500">
              Créez une unité utilisée dans les fiches articles.
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

        <UniteArticleForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/unites-articles')}
          submitLabel="Créer l’unité"
        />
      </div>
    </main>
  );
}