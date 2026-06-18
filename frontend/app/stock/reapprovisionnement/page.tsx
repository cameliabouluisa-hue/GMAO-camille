'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  RefreshCcw,
  Search,
  Eye,
  Package,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';

import {
  getReapprovisionnements,
} from '@/features/reapprovisionnement/services/reapprovisionnement.service';
import { DemandeReapprovisionnement } from '@/features/reapprovisionnement/types/reapprovisionnement.types';

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('fr-FR');
}

function formatQty(value: number) {
  return Number(value || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  });
}

function getMagasinLabel(demande: DemandeReapprovisionnement) {
  return (
    demande.magasin?.code ||
    demande.magasin?.libelle ||
    `MAG-${demande.idMagasin}`
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const styles =
    statut === 'VALIDEE'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : statut === 'ANNULEE'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles}`}
    >
      {statut}
    </span>
  );
}

export default function ReapprovisionnementPage() {
  const router = useRouter();

  const [demandes, setDemandes] = useState<DemandeReapprovisionnement[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await getReapprovisionnements();
      setDemandes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredDemandes = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return demandes;

    return demandes.filter((demande) => {
      return (
        demande.numero?.toLowerCase().includes(q) ||
        demande.statut?.toLowerCase().includes(q) ||
        getMagasinLabel(demande).toLowerCase().includes(q) ||
        demande.demandeur?.toLowerCase().includes(q)
      );
    });
  }, [demandes, search]);

  const stats = useMemo(() => {
    const totalLignes = demandes.reduce(
      (sum, demande) => sum + (demande.lignes?.length || 0),
      0,
    );

    const totalQuantite = demandes.reduce(
      (sum, demande) =>
        sum +
        demande.lignes.reduce(
          (s, ligne) => s + Number(ligne.quantiteDemandee || 0),
          0,
        ),
      0,
    );

    const validees = demandes.filter(
      (demande) => demande.statut === 'VALIDEE',
    ).length;

    return {
      demandes: demandes.length,
      lignes: totalLignes,
      quantite: totalQuantite,
      validees,
    };
  }, [demandes]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-8 py-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.45em] text-slate-400">
              Module stock
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">
              Réapprovisionnement
            </h1>
            <p className="mt-2 text-base font-semibold text-slate-500">
              Préparez les demandes d’achat ou de réapprovisionnement
              des articles en stock faible.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw className="h-5 w-5" />
              Actualiser
            </button>

            <button
              onClick={() =>
                router.push('/stock/reapprovisionnement/nouveau')
              }
              className="inline-flex items-center gap-3 rounded-2xl bg-[#0f4a63] px-6 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#0b3b50]"
            >
              <Plus className="h-5 w-5" />
              Nouvelle demande
            </button>
          </div>
        </div>
      </section>

      <section className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Demandes
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {stats.demandes}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Validées
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {stats.validees}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Package className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Lignes
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {stats.lignes}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Warehouse className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Quantité
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {formatQty(stats.quantite)}
          </p>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-5 border-b border-slate-100 p-6">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Liste des demandes
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {filteredDemandes.length} demande(s) affichée(s)
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par numéro, magasin, demandeur..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {error && (
          <div className="m-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                <th className="px-6 py-4">Numéro</th>
                <th className="px-6 py-4">Magasin</th>
                <th className="px-6 py-4">Lignes</th>
                <th className="px-6 py-4">Quantité</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : filteredDemandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => {
                  const quantite = demande.lignes.reduce(
                    (sum, ligne) =>
                      sum + Number(ligne.quantiteDemandee || 0),
                    0,
                  );

                  return (
                    <tr
                      key={demande.idDemandeReapprovisionnement}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5 text-sm font-black text-slate-950">
                        {demande.numero}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {getMagasinLabel(demande)}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {demande.lignes.length} ligne(s)
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {formatQty(quantite)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge statut={demande.statut} />
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {formatDate(demande.dateDemande)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            router.push(
                              `/stock/reapprovisionnement/${demande.idDemandeReapprovisionnement}`,
                            )
                          }
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}