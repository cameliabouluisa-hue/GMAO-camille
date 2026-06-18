'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  Warehouse,
} from 'lucide-react';

import {
  createReapprovisionnement,
  getStockDisponibleReapprovisionnement,
} from '@/features/reapprovisionnement/services/reapprovisionnement.service';
import { StockDisponibleReapprovisionnement } from '@/features/reapprovisionnement/types/reapprovisionnement.types';

type LigneForm = {
  idArticle: number;
  idMagasin: number;
  codeArticle: string;
  libelleArticle: string;
  codeMagasin: string;
  quantiteDisponible: number;
  quantiteDemandee: number;
  commentaire?: string;
};

function formatQty(value: number) {
  return Number(value || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  });
}

function getArticleCode(stock: StockDisponibleReapprovisionnement) {
  return stock.article?.code || `ART-${stock.idArticle}`;
}

function getArticleLabel(stock: StockDisponibleReapprovisionnement) {
  return (
    stock.article?.designation ||
    stock.article?.libelle ||
    stock.article?.code ||
    `Article ${stock.idArticle}`
  );
}

function getMagasinCode(stock: StockDisponibleReapprovisionnement) {
  return stock.magasin?.code || `MAG-${stock.idMagasin}`;
}

function getMagasinLabel(stock: StockDisponibleReapprovisionnement) {
  return stock.magasin?.libelle || getMagasinCode(stock);
}

export default function NouvelleReapprovisionnementPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<StockDisponibleReapprovisionnement[]>(
    [],
  );
  const [selectedStockKey, setSelectedStockKey] = useState('');
  const [quantiteDemandee, setQuantiteDemandee] = useState(1);
  const [demandeur, setDemandeur] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [search, setSearch] = useState('');

  const [lignes, setLignes] = useState<LigneForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadStocks() {
    try {
      setLoading(true);
      setError('');

      const data = await getStockDisponibleReapprovisionnement();
      setStocks(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du stock disponible.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStocks();
  }, []);

  const filteredStocks = useMemo(() => {
    const q = search.toLowerCase().trim();

    return stocks.filter((stock) => {
      const text = [
        getArticleCode(stock),
        getArticleLabel(stock),
        getMagasinCode(stock),
        getMagasinLabel(stock),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(q);
    });
  }, [stocks, search]);

  const selectedStock = useMemo(() => {
    return stocks.find(
      (stock) => `${stock.idArticle}-${stock.idMagasin}` === selectedStockKey,
    );
  }, [stocks, selectedStockKey]);

  const totalQuantite = useMemo(() => {
    return lignes.reduce(
      (sum, ligne) => sum + Number(ligne.quantiteDemandee || 0),
      0,
    );
  }, [lignes]);

  function ajouterLigne() {
    setError('');

    if (!selectedStock) {
      setError('Veuillez sélectionner un article.');
      return;
    }

    if (!quantiteDemandee || quantiteDemandee <= 0) {
      setError('La quantité demandée doit être supérieure à 0.');
      return;
    }

    const exists = lignes.find(
      (ligne) =>
        ligne.idArticle === selectedStock.idArticle &&
        ligne.idMagasin === selectedStock.idMagasin,
    );

    if (exists) {
      setLignes((prev) =>
        prev.map((ligne) =>
          ligne.idArticle === selectedStock.idArticle &&
          ligne.idMagasin === selectedStock.idMagasin
            ? {
                ...ligne,
                quantiteDemandee:
                  Number(ligne.quantiteDemandee) + Number(quantiteDemandee),
              }
            : ligne,
        ),
      );
    } else {
      setLignes((prev) => [
        ...prev,
        {
          idArticle: selectedStock.idArticle,
          idMagasin: selectedStock.idMagasin,
          codeArticle: getArticleCode(selectedStock),
          libelleArticle: getArticleLabel(selectedStock),
          codeMagasin: getMagasinCode(selectedStock),
          quantiteDisponible: Number(selectedStock.quantiteDisponible || 0),
          quantiteDemandee: Number(quantiteDemandee),
        },
      ]);
    }

    setSelectedStockKey('');
    setQuantiteDemandee(1);
  }

  function supprimerLigne(idArticle: number, idMagasin: number) {
    setLignes((prev) =>
      prev.filter(
        (ligne) =>
          !(ligne.idArticle === idArticle && ligne.idMagasin === idMagasin),
      ),
    );
  }

  function updateQuantite(
    idArticle: number,
    idMagasin: number,
    value: number,
  ) {
    setLignes((prev) =>
      prev.map((ligne) =>
        ligne.idArticle === idArticle && ligne.idMagasin === idMagasin
          ? {
              ...ligne,
              quantiteDemandee: value,
            }
          : ligne,
      ),
    );
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError('');

      if (lignes.length === 0) {
        setError('Ajoutez au moins une ligne de réapprovisionnement.');
        return;
      }

      const magasins = Array.from(new Set(lignes.map((ligne) => ligne.idMagasin)));

      if (magasins.length > 1) {
        setError(
          'Une demande de réapprovisionnement doit concerner un seul magasin.',
        );
        return;
      }

      const invalidLine = lignes.find(
        (ligne) => !ligne.quantiteDemandee || ligne.quantiteDemandee <= 0,
      );

      if (invalidLine) {
        setError('Toutes les quantités doivent être supérieures à 0.');
        return;
      }

      const created = await createReapprovisionnement({
        idMagasin: magasins[0],
        demandeur: demandeur.trim() || undefined,
        commentaire: commentaire.trim() || undefined,
        lignes: lignes.map((ligne) => ({
          idArticle: ligne.idArticle,
          quantiteDemandee: Number(ligne.quantiteDemandee),
          commentaire: ligne.commentaire?.trim() || undefined,
        })),
      });

      router.push(
        `/stock/reapprovisionnement/${created.idDemandeReapprovisionnement}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création de la demande.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-8 py-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.45em] text-slate-400">
              Module stock
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">
              Nouvelle demande
            </h1>
            <p className="mt-2 text-base font-semibold text-slate-500">
              Préparez une demande de réapprovisionnement pour les articles à
              commander.
            </p>
          </div>

          <button
            onClick={() => router.push('/stock/reapprovisionnement')}
            className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </section>

      <section className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Lignes
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {lignes.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Package className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Quantité totale
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {formatQty(totalQuantite)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Warehouse className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Magasin
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {lignes[0]?.codeMagasin || '—'}
          </p>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-5 border-b border-slate-100 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Articles à réapprovisionner
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Choisissez un article depuis le stock actuel puis ajoutez-le à la
              demande.
            </p>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Article / magasin
              </label>

              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher article, magasin..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={selectedStockKey}
                onChange={(event) => setSelectedStockKey(event.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-[#0f4a63]"
              >
                <option value="">
                  {loading
                    ? 'Chargement...'
                    : 'Sélectionner un article disponible'}
                </option>

                {filteredStocks.map((stock) => (
                  <option
                    key={`${stock.idArticle}-${stock.idMagasin}`}
                    value={`${stock.idArticle}-${stock.idMagasin}`}
                  >
                    {getArticleCode(stock)} — {getArticleLabel(stock)} —{' '}
                    {getMagasinCode(stock)} — Disponible :{' '}
                    {formatQty(Number(stock.quantiteDisponible || 0))}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Quantité
              </label>

              <input
                type="number"
                min={1}
                step="0.01"
                value={quantiteDemandee}
                onChange={(event) =>
                  setQuantiteDemandee(Number(event.target.value))
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none transition focus:border-[#0f4a63]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={ajouterLigne}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0f4a63] px-5 text-sm font-black text-white shadow-md transition hover:bg-[#0b3b50]"
              >
                <Plus className="h-5 w-5" />
                Ajouter
              </button>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Demandeur
              </label>

              <input
                value={demandeur}
                onChange={(event) => setDemandeur(event.target.value)}
                placeholder="Exemple : Service maintenance"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f4a63]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Commentaire
              </label>

              <input
                value={commentaire}
                onChange={(event) => setCommentaire(event.target.value)}
                placeholder="Exemple : Réapprovisionnement mensuel"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f4a63]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Lignes de la demande
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {lignes.length} ligne(s) ajoutée(s)
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-3 rounded-2xl bg-[#0f4a63] px-6 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#0b3b50] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {submitting ? 'Création...' : 'Créer la demande'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Désignation</th>
                <th className="px-6 py-4">Magasin</th>
                <th className="px-6 py-4">Disponible</th>
                <th className="px-6 py-4">Demandée</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {lignes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune ligne ajoutée.
                  </td>
                </tr>
              ) : (
                lignes.map((ligne) => (
                  <tr
                    key={`${ligne.idArticle}-${ligne.idMagasin}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-5 text-sm font-black text-slate-950">
                      {ligne.codeArticle}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-700">
                      {ligne.libelleArticle}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-700">
                      {ligne.codeMagasin}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-700">
                      {formatQty(ligne.quantiteDisponible)}
                    </td>

                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={ligne.quantiteDemandee}
                        onChange={(event) =>
                          updateQuantite(
                            ligne.idArticle,
                            ligne.idMagasin,
                            Number(event.target.value),
                          )
                        }
                        className="h-12 w-32 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none transition focus:border-[#0f4a63]"
                      />
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() =>
                          supprimerLigne(ligne.idArticle, ligne.idMagasin)
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}