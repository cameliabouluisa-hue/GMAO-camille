'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import { saisirQuantites } from '../services/inventaires-prepares.service';
import {
  getArticleDesignation,
  getArticleReference,
  InventairePrepare,
} from '../types/inventaire-prepare.types';

type Props = {
  inventaire: InventairePrepare;
  onSaved: () => void;
};

export function SaisieQuantitesTable({
  inventaire,
  onSaved,
}: Props) {
  const [quantites, setQuantites] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lignes = inventaire.lignes || [];

  useEffect(() => {
    const initialValues: Record<number, string> = {};

    lignes.forEach((ligne) => {
      initialValues[ligne.idLigneInventairePrepare] =
        ligne.quantiteReelle !== null &&
        ligne.quantiteReelle !== undefined
          ? String(ligne.quantiteReelle)
          : '';
    });

    setQuantites(initialValues);
  }, [inventaire.idInventairePrepare, lignes]);

  async function handleSave() {
    try {
      setLoading(true);
      setError(null);

      const payload = lignes.map((ligne) => ({
        idLigneInventairePrepare:
          ligne.idLigneInventairePrepare,
        quantiteReelle: Number(
          quantites[ligne.idLigneInventairePrepare] || 0,
        ),
      }));

      await saisirQuantites(inventaire.idInventairePrepare, {
        lignes: payload,
      });

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’enregistrer les quantités.',
      );
    } finally {
      setLoading(false);
    }
  }

  const canEdit = inventaire.statut === 'EN_COMPTAGE';

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Saisie des quantités réelles
          </h2>

          <p className="text-sm font-medium text-slate-500">
            Saisissez les quantités trouvées physiquement dans le magasin.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b3f59] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083247] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Enregistrer
          </button>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!canEdit && (
        <div className="mx-6 mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          La saisie est possible uniquement lorsque l’inventaire est en comptage.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="mt-5 min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Article
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Désignation
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Qté théorique
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Qté réelle
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Écart
              </th>
            </tr>
          </thead>

          <tbody>
            {lignes.map((ligne) => {
              const value =
                quantites[ligne.idLigneInventairePrepare] ?? '';

              const ecart =
                value === ''
                  ? null
                  : Number(value) -
                    Number(ligne.quantiteTheorique);

              return (
                <tr
                  key={ligne.idLigneInventairePrepare}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5 text-sm font-black text-slate-950">
                    {getArticleReference(ligne.article)}
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                    {getArticleDesignation(ligne.article)}
                  </td>

                  <td className="px-6 py-5 text-sm font-black text-slate-950">
                    {ligne.quantiteTheorique}
                  </td>

                  <td className="px-6 py-5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={!canEdit}
                      value={value}
                      onChange={(event) =>
                        setQuantites((prev) => ({
                          ...prev,
                          [ligne.idLigneInventairePrepare]:
                            event.target.value,
                        }))
                      }
                      className="h-11 w-32 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>

                  <td className="px-6 py-5">
                    {ecart === null ? (
                      <span className="text-sm font-bold text-slate-400">
                        —
                      </span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${
                          ecart === 0
                            ? 'bg-slate-100 text-slate-600'
                            : ecart > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {ecart > 0 ? `+${ecart}` : ecart}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}