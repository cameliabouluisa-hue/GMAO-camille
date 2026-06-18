'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Warehouse } from 'lucide-react';

import {
  createInventairePrepare,
  getMagasins,
} from '../services/inventaires-prepares.service';
import {
  getMagasinLabel,
  Magasin,
} from '../types/inventaire-prepare.types';

export function CreateInventairePrepareForm() {
  const router = useRouter();

  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [idMagasin, setIdMagasin] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMagasins, setLoadingMagasins] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMagasins() {
      try {
        setLoadingMagasins(true);
        const data = await getMagasins();
        setMagasins(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger les magasins.',
        );
      } finally {
        setLoadingMagasins(false);
      }
    }

    loadMagasins();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!idMagasin) {
      setError('Veuillez choisir un magasin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const inventaire = await createInventairePrepare({
        idMagasin: Number(idMagasin),
        commentaire: commentaire.trim() || undefined,
      });

      router.push(
        `/stock/inventaires-prepares/${inventaire.idInventairePrepare}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur pendant la création.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Warehouse size={26} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Informations générales
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Choisissez le magasin à inventorier.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Magasin
          </label>

          <select
            value={idMagasin}
            onChange={(event) => setIdMagasin(event.target.value)}
            disabled={loadingMagasins}
            className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">
              {loadingMagasins
                ? 'Chargement...'
                : 'Sélectionner un magasin'}
            </option>

            {magasins.map((magasin) => (
              <option
                key={magasin.idMagasin}
                value={magasin.idMagasin}
              >
                {getMagasinLabel(magasin)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Commentaire
          </label>

          <textarea
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            rows={4}
            placeholder="Exemple : Inventaire mensuel du magasin principal..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0b3f59] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083247] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          Créer l’inventaire
        </button>
      </div>
    </form>
  );
}