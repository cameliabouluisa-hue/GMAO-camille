'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Warehouse,
  XCircle,
} from 'lucide-react';

import {
  annulerReservation,
  deleteReservation,
  getReservations,
} from '@/features/reservations/services/reservation.service';
import { ReservationStock } from '@/features/reservations/types/reservation.type';

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export default function ReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<ReservationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function loadReservations() {
    try {
      setLoading(true);
      setError('');
      const data = await getReservations();
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des réservations.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return reservations;

    return reservations.filter((reservation) => {
      const articleText = `${reservation.article?.reference ?? ''} ${
        reservation.article?.designation ?? ''
      }`.toLowerCase();

      const magasinText = `${reservation.magasin?.code ?? ''} ${
        reservation.magasin?.libelle ?? ''
      }`.toLowerCase();

      return (
        reservation.numero.toLowerCase().includes(value) ||
        articleText.includes(value) ||
        magasinText.includes(value) ||
        reservation.statut.toLowerCase().includes(value)
      );
    });
  }, [reservations, search]);

  const stats = useMemo(() => {
    const actives = reservations.filter(
      (reservation) => reservation.statut === 'VALIDEE',
    );

    const totalReserve = actives.reduce(
      (sum, reservation) => sum + toNumber(reservation.quantite),
      0,
    );

    const articles = new Set(actives.map((reservation) => reservation.idArticle));
    const magasins = new Set(actives.map((reservation) => reservation.idMagasin));

    return {
      total: reservations.length,
      actives: actives.length,
      totalReserve,
      articles: articles.size,
      magasins: magasins.size,
    };
  }, [reservations]);

  async function handleAnnuler(id: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment annuler cette réservation ?',
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      await annulerReservation(id);
      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’annulation.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette réservation annulée ?',
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      await deleteReservation(id);
      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-7 text-slate-950">
      <section className="mx-auto max-w-[1450px] space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Réservations
              </h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Bloquez une quantité d’article pour une intervention ou un besoin
                futur.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadReservations}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-5 w-5" />
                Actualiser
              </button>

              <button
                type="button"
                onClick={() => router.push('/stock/reservations/nouvelle')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b435a] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083348]"
              >
                <Plus className="h-5 w-5" />
                Nouvelle réservation
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Réservations
            </p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Quantité réservée
            </p>
            <p className="mt-2 text-3xl font-black">{stats.totalReserve}</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Package className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Articles
            </p>
            <p className="mt-2 text-3xl font-black">{stats.articles}</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Warehouse className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Magasins
            </p>
            <p className="mt-2 text-3xl font-black">{stats.magasins}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Liste des réservations
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {filteredReservations.length} réservation(s) affichée(s)
                </p>
              </div>

              <div className="relative w-full lg:max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par numéro, article ou magasin..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#0b435a] focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Article
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Magasin
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      Chargement des réservations...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.idReservationStock}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">
                          {reservation.numero}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          ID : {reservation.idReservationStock}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">
                          {reservation.article?.reference ?? '-'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {reservation.article?.designation ?? '-'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">
                          {reservation.magasin?.code ?? '-'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {reservation.magasin?.libelle ?? '-'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                          {toNumber(reservation.quantite)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            reservation.statut === 'VALIDEE'
                              ? 'rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700'
                              : 'rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-500'
                          }
                        >
                          {reservation.statut}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-700">
                        {formatDate(reservation.dateReservation)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {reservation.statut === 'VALIDEE' && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                handleAnnuler(reservation.idReservationStock)
                              }
                              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 transition hover:bg-orange-100 disabled:opacity-50"
                              title="Annuler"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}

                          {reservation.statut === 'ANNULEE' && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                handleDelete(reservation.idReservationStock)
                              }
                              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}