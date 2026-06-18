

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import {
  CreateUniteArticleDto,
  UniteArticle,
} from '../types/unite-article';

type Props = {
  initialData?: UniteArticle;
  onSubmit: (data: CreateUniteArticleDto) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
};

export function UniteArticleForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
}: Props) {
  const [code, setCode] = useState(initialData?.code ?? '');
  const [libelle, setLibelle] = useState(initialData?.libelle ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!code.trim() || !libelle.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        code: code.trim(),
        libelle: libelle.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
          Référentiel stock
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Informations de l’unité
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Renseignez le code et le libellé de l’unité article.
        </p>
      </div>

      <div className="grid gap-6 px-8 py-8 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Code unité *
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex : U"
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Libellé *
          </label>
          <input
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Ex : Unité"
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      {error && (
        <div className="mx-8 mb-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-8 py-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <X size={18} />
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0f3d56] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#0b3044] disabled:opacity-60"
        >
          <Save size={18} />
          {loading ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  );
}