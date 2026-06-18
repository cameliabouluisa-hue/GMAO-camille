'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react';

import {
  createDemandeTransfert,
  getMagasins,
  getStockDisponibleTransfert,
} from '@/features/demandes-transfert/services/demandes-transfert.service';
import {
  Magasin,
  StockDisponibleTransfert,
} from '@/features/demandes-transfert/types/demande-transfert.type';

type LigneDraft = {
  idArticle: number;
  reference: string;
  designation: string;
  quantite: number;
  disponible: number;
  commentaire?: string;
};

export default function NouvelleDemandeTransfertPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<StockDisponibleTransfert[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);

  const [idMagasinSource, setIdMagasinSource] = useState<number>(0);
  const [idMagasinDestination, setIdMagasinDestination] = useState<number>(0);
  const [idStock, setIdStock] = useState<number>(0);
  const [quantite, setQuantite] = useState<number>(1);
  const [demandeur, setDemandeur] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [lignes, setLignes] = useState<LigneDraft[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [stocksData, magasinsData] = await Promise.all([
        getStockDisponibleTransfert(),
        getMagasins(),
      ]);

      setStocks(stocksData);
      setMagasins(magasinsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const magasinsSources = useMemo(() => {
    const map = new Map<number, Magasin>();

    stocks.forEach((stock) => {
      map.set(stock.magasin.idMagasin, stock.magasin);
    });

    return Array.from(map.values());
  }, [stocks]);

  const stocksDuMagasinSource = useMemo(() => {
    return stocks.filter((stock) => stock.idMagasin === idMagasinSource);
  }, [stocks, idMagasinSource]);

  const magasinsDestination = useMemo(() => {
    return magasins.filter(
      (magasin) =>
        magasin.actif !== false && magasin.idMagasin !== idMagasinSource,
    );
  }, [magasins, idMagasinSource]);

  const selectedStock = useMemo(() => {
    return stocks.find((stock) => stock.idStock === idStock);
  }, [stocks, idStock]);

  function addLigne() {
    setError('');

    if (!idMagasinSource) {
      setError('Choisissez le magasin source.');
      return;
    }

    if (!idMagasinDestination) {
      setError('Choisissez le magasin destination.');
      return;
    }

    if (!selectedStock) {
      setError('Choisissez un article disponible.');
      return;
    }

    if (quantite <= 0) {
      setError('La quantité doit être supérieure à zéro.');
      return;
    }

    const disponible = Number(selectedStock.quantiteDisponible ?? 0);

    if (quantite > disponible) {
      setError(`Quantité insuffisante. Disponible : ${disponible}.`);
      return;
    }

    const exists = lignes.some(
      (ligne) => ligne.idArticle === selectedStock.idArticle,
    );

    if (exists) {
      setError('Cet article est déjà ajouté dans la demande.');
      return;
    }

    setLignes((prev) => [
      ...prev,
      {
        idArticle: selectedStock.idArticle,
        reference: selectedStock.article.reference ?? `ART-${selectedStock.idArticle}`,
        designation:
          selectedStock.article.designation ?? 'Article sans désignation',
        quantite,
        disponible,
      },
    ]);

    setIdStock(0);
    setQuantite(1);
  }

  function removeLigne(idArticle: number) {
    setLignes((prev) =>
      prev.filter((ligne) => ligne.idArticle !== idArticle),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (!idMagasinSource || !idMagasinDestination) {
        setError('Choisissez les deux magasins.');
        return;
      }

      if (idMagasinSource === idMagasinDestination) {
        setError('Les deux magasins doivent être différents.');
        return;
      }

      if (lignes.length === 0) {
        setError('Ajoutez au moins un article à transférer.');
        return;
      }

      const created = await createDemandeTransfert({
        idMagasinSource,
        idMagasinDestination,
        demandeur: demandeur.trim() || undefined,
        commentaire: commentaire.trim() || undefined,
        lignes: lignes.map((ligne) => ({
          idArticle: ligne.idArticle,
          quantite: ligne.quantite,
        })),
      });

      router.push(
        `/stock/demandes-transfert/${created.idDemandeTransfertStock}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-6 text-slate-950">
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-slate-400">
              Module stock
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Nouvelle demande de transfert
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              Choisissez un magasin source, un magasin destination et les
              articles à transférer.
            </p>
          </div>

          <button
            onClick={() => router.push('/stock/demandes-transfert')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-start gap-5 border-b border-slate-100 p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList size={26} />
          </div>

          <div>
            <h2 className="text-2xl font-black">Informations générales</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              La demande ne déplace pas le stock directement. Le stock sera
              réservé après validation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-7 mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 p-7 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Magasin source
            </span>
            <select
              value={idMagasinSource}
              disabled={loading || lignes.length > 0}
              onChange={(event) => {
                setIdMagasinSource(Number(event.target.value));
                setIdStock(0);
                setLignes([]);
              }}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none focus:border-[#0b4660]"
            >
              <option value={0}>Choisir le magasin source</option>
              {magasinsSources.map((magasin) => (
                <option key={magasin.idMagasin} value={magasin.idMagasin}>
                  {magasin.code} — {magasin.libelle}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Magasin destination
            </span>
            <select
              value={idMagasinDestination}
              disabled={loading || !idMagasinSource || lignes.length > 0}
              onChange={(event) =>
                setIdMagasinDestination(Number(event.target.value))
              }
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none focus:border-[#0b4660]"
            >
              <option value={0}>Choisir le magasin destination</option>
              {magasinsDestination.map((magasin) => (
                <option key={magasin.idMagasin} value={magasin.idMagasin}>
                  {magasin.code} — {magasin.libelle}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Demandeur
            </span>
            <input
              value={demandeur}
              onChange={(event) => setDemandeur(event.target.value)}
              placeholder="Exemple : Service maintenance"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#0b4660]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Commentaire
            </span>
            <input
              value={commentaire}
              onChange={(event) => setCommentaire(event.target.value)}
              placeholder="Exemple : transfert urgent atelier"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#0b4660]"
            />
          </label>
        </div>

        <div className="border-t border-slate-100 p-7">
          <h3 className="text-xl font-black">Ajouter les articles</h3>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_160px]">
            <select
              value={idStock}
              disabled={!idMagasinSource}
              onChange={(event) => setIdStock(Number(event.target.value))}
              className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none focus:border-[#0b4660]"
            >
              <option value={0}>Choisir un article disponible</option>
              {stocksDuMagasinSource.map((stock) => (
                <option key={stock.idStock} value={stock.idStock}>
                  {stock.article.reference} — {stock.article.designation} —
                  Disponible : {Number(stock.quantiteDisponible)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={0.01}
              step={0.01}
              value={quantite}
              onChange={(event) => setQuantite(Number(event.target.value))}
              className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none focus:border-[#0b4660]"
            />

            <button
              type="button"
              onClick={addLigne}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0b4660] px-5 text-sm font-black text-white shadow-md hover:bg-[#07384d]"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                  <th className="px-5 py-4">Article</th>
                  <th className="px-5 py-4">Désignation</th>
                  <th className="px-5 py-4">Disponible</th>
                  <th className="px-5 py-4">Quantité</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {lignes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm font-bold text-slate-400"
                    >
                      Aucun article ajouté.
                    </td>
                  </tr>
                ) : (
                  lignes.map((ligne) => (
                    <tr
                      key={ligne.idArticle}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4 font-black">
                        {ligne.reference}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-600">
                        {ligne.designation}
                      </td>
                      <td className="px-5 py-4 font-black">
                        {ligne.disponible}
                      </td>
                      <td className="px-5 py-4 font-black">
                        {ligne.quantite}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeLigne(ligne.idArticle)}
                          className="rounded-xl bg-red-50 p-3 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 p-7">
          <button
            type="button"
            onClick={() => router.push('/stock/demandes-transfert')}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#0b4660] px-6 py-3 text-sm font-black text-white shadow-md hover:bg-[#07384d] disabled:opacity-50"
          >
            {saving ? 'Création...' : 'Créer la demande'}
          </button>
        </div>
      </form>
    </main>
  );
}