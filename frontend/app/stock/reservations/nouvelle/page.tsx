'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Package,
  Save,
  Warehouse,
} from 'lucide-react';

import {
  createReservation,
  getStockDisponiblePourReservation,
} from '@/features/reservations/services/reservation.service';
import { StockDisponibleReservation } from '@/features/reservations/types/reservation.type';

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export default function NouvelleReservationPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<StockDisponibleReservation[]>([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [demandeur, setDemandeur] = useState('');
  const [origineType, setOrigineType] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadStocks() {
    try {
      setLoading(true);
      setError('');

      const data = await getStockDisponiblePourReservation();
      setStocks(data);

      if (data.length > 0) {
        setSelectedStockId(String(data[0].idStock));
      }
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

  const selectedStock = useMemo(() => {
    return stocks.find((stock) => String(stock.idStock) === selectedStockId);
  }, [stocks, selectedStockId]);

  const disponible = selectedStock
    ? toNumber(selectedStock.quantiteDisponible)
    : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStock) {
      setError('Veuillez choisir un article à réserver.');
      return;
    }

    if (quantite <= 0) {
      setError('La quantité doit être supérieure à zéro.');
      return;
    }

    if (quantite > disponible) {
      setError(`La quantité demandée dépasse le disponible : ${disponible}.`);
      return;
    }

    try {
      setSaving(true);
      setError('');

      await createReservation({
        idArticle: selectedStock.idArticle,
        idMagasin: selectedStock.idMagasin,
        quantite,
        demandeur: demandeur.trim() || undefined,
        origineType: origineType.trim() || undefined,
        commentaire: commentaire.trim() || undefined,
      });

      router.push('/stock/reservations');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création de la réservation.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-7 text-slate-950">
      <section className="mx-auto max-w-[1250px] space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Nouvelle réservation
              </h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Choisissez un article disponible et bloquez la quantité voulue.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/stock/reservations')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ClipboardList className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Informations de réservation
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Le stock disponible sera diminué automatiquement.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6 p-6">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Article / magasin
              </label>

              <select
                value={selectedStockId}
                onChange={(event) => {
                  setSelectedStockId(event.target.value);
                  setQuantite(1);
                }}
                disabled={loading || stocks.length === 0}
                className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none transition focus:border-[#0b435a]"
              >
                {loading ? (
                  <option>Chargement...</option>
                ) : stocks.length === 0 ? (
                  <option>Aucun stock disponible</option>
                ) : (
                  stocks.map((stock) => (
                    <option key={stock.idStock} value={stock.idStock}>
                      {stock.article?.reference ?? '-'} —{' '}
                      {stock.article?.designation ?? '-'} |{' '}
                      {stock.magasin?.code ?? '-'} | Disponible :{' '}
                      {toNumber(stock.quantiteDisponible)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedStock && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Package className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-[0.25em]">
                      Article
                    </p>
                  </div>
                  <p className="mt-3 font-black text-slate-950">
                    {selectedStock.article?.reference ?? '-'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {selectedStock.article?.designation ?? '-'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Warehouse className="h-5 w-5" />
                    <p className="text-xs font-black uppercase tracking-[0.25em]">
                      Magasin
                    </p>
                  </div>
                  <p className="mt-3 font-black text-slate-950">
                    {selectedStock.magasin?.code ?? '-'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {selectedStock.magasin?.libelle ?? '-'}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                    Disponible
                  </p>
                  <p className="mt-3 text-3xl font-black text-emerald-700">
                    {disponible}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Quantité à réserver
                </label>
                <input
                  type="number"
                  min={1}
                  max={disponible}
                  value={quantite}
                  onChange={(event) => setQuantite(Number(event.target.value))}
                  className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none transition focus:border-[#0b435a]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Demandeur
                </label>
                <input
                  value={demandeur}
                  onChange={(event) => setDemandeur(event.target.value)}
                  placeholder="Exemple : Service maintenance"
                  className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b435a]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Origine
              </label>
              <input
                value={origineType}
                onChange={(event) => setOrigineType(event.target.value)}
                placeholder="Exemple : INTERVENTION, DEMANDE, PREVENTIF..."
                className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b435a]"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Commentaire
              </label>
              <textarea
                value={commentaire}
                onChange={(event) => setCommentaire(event.target.value)}
                placeholder="Exemple : Réservation pour intervention pompe quai 2..."
                rows={5}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b435a]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
            <button
              type="button"
              onClick={() => router.push('/stock/reservations')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>

            <button
              type="submit"
              disabled={saving || loading || !selectedStock}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b435a] px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083348] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Création...' : 'Créer la réservation'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}