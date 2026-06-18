'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightLeft,
  Check,
  Eye,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  annulerDemandeTransfert,
  deleteDemandeTransfert,
  executerDemandeTransfert,
  getDemandesTransfert,
  validerDemandeTransfert,
} from '@/features/demandes-transfert/services/demandes-transfert.service';
import {
  DemandeTransfert,
  StatutDemandeTransfert,
} from '@/features/demandes-transfert/types/demande-transfert.type';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
}

function totalQuantite(demande: DemandeTransfert) {
  return demande.lignes.reduce(
    (total, ligne) => total + Number(ligne.quantite ?? 0),
    0,
  );
}

function StatusBadge({ statut }: { statut: StatutDemandeTransfert }) {
  const classes: Record<StatutDemandeTransfert, string> = {
    EN_ATTENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    VALIDEE: 'bg-blue-50 text-blue-700 border-blue-200',
    EXECUTEE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ANNULEE: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<StatutDemandeTransfert, string> = {
    EN_ATTENTE: 'En attente',
    VALIDEE: 'Validée',
    EXECUTEE: 'Exécutée',
    ANNULEE: 'Annulée',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${classes[statut]}`}
    >
      {labels[statut]}
    </span>
  );
}

export default function DemandesTransfertPage() {
  const router = useRouter();

  const [demandes, setDemandes] = useState<DemandeTransfert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadDemandes() {
    try {
      setLoading(true);
      setError('');
      const data = await getDemandesTransfert();
      setDemandes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDemandes();
  }, []);

  const filteredDemandes = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return demandes;

    return demandes.filter((demande) => {
      return (
        demande.numero.toLowerCase().includes(value) ||
        demande.magasinSource?.code?.toLowerCase().includes(value) ||
        demande.magasinDestination?.code?.toLowerCase().includes(value) ||
        demande.demandeur?.toLowerCase().includes(value)
      );
    });
  }, [demandes, search]);

  const stats = useMemo(() => {
    return {
      total: demandes.length,
      enAttente: demandes.filter((d) => d.statut === 'EN_ATTENTE').length,
      validees: demandes.filter((d) => d.statut === 'VALIDEE').length,
      executees: demandes.filter((d) => d.statut === 'EXECUTEE').length,
    };
  }, [demandes]);

  async function handleAction(
    id: number,
    action: 'valider' | 'executer' | 'annuler' | 'delete',
  ) {
    try {
      setActionLoading(id);
      setError('');

      if (action === 'valider') {
        await validerDemandeTransfert(id);
      }

      if (action === 'executer') {
        await executerDemandeTransfert(id);
      }

      if (action === 'annuler') {
        const ok = window.confirm('Annuler cette demande de transfert ?');
        if (!ok) return;
        await annulerDemandeTransfert(id);
      }

      if (action === 'delete') {
        const ok = window.confirm('Supprimer cette demande de transfert ?');
        if (!ok) return;
        await deleteDemandeTransfert(id);
      }

      await loadDemandes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setActionLoading(null);
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
              Demandes de transfert
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              Transférez des articles d’un magasin source vers un magasin
              destination.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadDemandes}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={18} />
              Actualiser
            </button>

            <button
              onClick={() => router.push('/stock/demandes-transfert/nouvelle')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0b4660] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#07384d]"
            >
              <Plus size={18} />
              Nouvelle demande
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ['Demandes', stats.total],
          ['En attente', stats.enAttente],
          ['Validées', stats.validees],
          ['Exécutées', stats.executees],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ArrowRightLeft size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Liste des demandes</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filteredDemandes.length} demande(s) affichée(s)
            </p>
          </div>

          <div className="relative w-full lg:w-[520px]">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par numéro, magasin ou demandeur..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-[#0b4660] focus:bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                <th className="px-6 py-5">Numéro</th>
                <th className="px-6 py-5">Magasins</th>
                <th className="px-6 py-5">Articles</th>
                <th className="px-6 py-5">Quantité</th>
                <th className="px-6 py-5">Statut</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : filteredDemandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr
                    key={demande.idDemandeTransfertStock}
                    className="border-t border-slate-100 transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-5">
                      <p className="font-black">{demande.numero}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        ID : {demande.idDemandeTransfertStock}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-black text-slate-900">
                        {demande.magasinSource?.code}
                        <span className="mx-2 text-slate-400">→</span>
                        {demande.magasinDestination?.code}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {demande.magasinSource?.libelle} vers{' '}
                        {demande.magasinDestination?.libelle}
                      </p>
                    </td>

                    <td className="px-6 py-5 font-black">
                      {demande.lignes.length} ligne(s)
                    </td>

                    <td className="px-6 py-5 font-black">
                      {totalQuantite(demande)}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge statut={demande.statut} />
                    </td>

                    <td className="px-6 py-5 font-bold text-slate-600">
                      {formatDate(demande.dateDemande)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/stock/demandes-transfert/${demande.idDemandeTransfertStock}`,
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50"
                          title="Voir"
                        >
                          <Eye size={18} />
                        </button>

                        {demande.statut === 'EN_ATTENTE' && (
                          <button
                            disabled={
                              actionLoading === demande.idDemandeTransfertStock
                            }
                            onClick={() =>
                              handleAction(
                                demande.idDemandeTransfertStock,
                                'valider',
                              )
                            }
                            className="rounded-xl bg-blue-50 p-3 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            title="Valider"
                          >
                            <Check size={18} />
                          </button>
                        )}

                        {demande.statut === 'VALIDEE' && (
                          <button
                            disabled={
                              actionLoading === demande.idDemandeTransfertStock
                            }
                            onClick={() =>
                              handleAction(
                                demande.idDemandeTransfertStock,
                                'executer',
                              )
                            }
                            className="rounded-xl bg-emerald-50 p-3 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            title="Exécuter"
                          >
                            <PackageCheck size={18} />
                          </button>
                        )}

                        {['EN_ATTENTE', 'VALIDEE'].includes(demande.statut) && (
                          <button
                            disabled={
                              actionLoading === demande.idDemandeTransfertStock
                            }
                            onClick={() =>
                              handleAction(
                                demande.idDemandeTransfertStock,
                                'annuler',
                              )
                            }
                            className="rounded-xl bg-red-50 p-3 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            title="Annuler"
                          >
                            <X size={18} />
                          </button>
                        )}

                        {['EN_ATTENTE', 'ANNULEE'].includes(demande.statut) && (
                          <button
                            disabled={
                              actionLoading === demande.idDemandeTransfertStock
                            }
                            onClick={() =>
                              handleAction(
                                demande.idDemandeTransfertStock,
                                'delete',
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:text-red-600 disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
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
      </section>
    </main>
  );
}