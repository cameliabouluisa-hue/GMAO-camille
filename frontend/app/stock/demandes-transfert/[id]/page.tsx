'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  PackageCheck,
  RefreshCcw,
  Truck,
  X,
} from 'lucide-react';

import {
  annulerDemandeTransfert,
  executerDemandeTransfert,
  getDemandeTransfert,
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

export default function DetailDemandeTransfertPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const [demande, setDemande] = useState<DemandeTransfert | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadDemande() {
    try {
      setLoading(true);
      setError('');
      const data = await getDemandeTransfert(id);
      setDemande(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadDemande();
    }
  }, [id]);

  const totalQuantite = useMemo(() => {
    if (!demande) return 0;

    return demande.lignes.reduce(
      (total, ligne) => total + Number(ligne.quantite ?? 0),
      0,
    );
  }, [demande]);

  async function handleAction(action: 'valider' | 'executer' | 'annuler') {
    if (!demande) return;

    try {
      setActionLoading(true);
      setError('');

      if (action === 'valider') {
        await validerDemandeTransfert(demande.idDemandeTransfertStock);
      }

      if (action === 'executer') {
        await executerDemandeTransfert(demande.idDemandeTransfertStock);
      }

      if (action === 'annuler') {
        const ok = window.confirm('Annuler cette demande de transfert ?');
        if (!ok) return;
        await annulerDemandeTransfert(demande.idDemandeTransfertStock);
      }

      await loadDemande();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-6 py-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm font-black text-slate-500 shadow-sm">
          Chargement...
        </div>
      </main>
    );
  }

  if (!demande) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-6 py-6">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm font-black text-red-700">
          {error || 'Demande introuvable.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-6 text-slate-950">
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-slate-400">
              Demande de transfert
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {demande.numero}
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              {demande.magasinSource?.code} vers{' '}
              {demande.magasinDestination?.code}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/stock/demandes-transfert')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Retour
            </button>

            <button
              onClick={loadDemande}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCcw size={18} />
              Actualiser
            </button>

            {demande.statut === 'EN_ATTENTE' && (
              <button
                disabled={actionLoading}
                onClick={() => handleAction('valider')}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Check size={18} />
                Valider
              </button>
            )}

            {demande.statut === 'VALIDEE' && (
              <button
                disabled={actionLoading}
                onClick={() => handleAction('executer')}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
              >
                <PackageCheck size={18} />
                Exécuter
              </button>
            )}

            {['EN_ATTENTE', 'VALIDEE'].includes(demande.statut) && (
              <button
                disabled={actionLoading}
                onClick={() => handleAction('annuler')}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-red-700 disabled:opacity-50"
              >
                <X size={18} />
                Annuler
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
            Statut
          </p>
          <div className="mt-4">
            <StatusBadge statut={demande.statut} />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
            Source
          </p>
          <p className="mt-4 text-xl font-black">
            {demande.magasinSource?.code}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
            Destination
          </p>
          <p className="mt-4 text-xl font-black">
            {demande.magasinDestination?.code}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
            Quantité
          </p>
          <p className="mt-4 text-xl font-black">{totalQuantite}</p>
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-5 border-b border-slate-100 p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Truck size={26} />
          </div>

          <div>
            <h2 className="text-2xl font-black">Lignes de transfert</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {demande.lignes.length} article(s) demandé(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-7 md:grid-cols-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Demandeur
            </p>
            <p className="mt-2 font-black">{demande.demandeur || '—'}</p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Date demande
            </p>
            <p className="mt-2 font-black">{formatDate(demande.dateDemande)}</p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Commentaire
            </p>
            <p className="mt-2 font-black">{demande.commentaire || '—'}</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                <th className="px-6 py-5">Article</th>
                <th className="px-6 py-5">Désignation</th>
                <th className="px-6 py-5">Quantité</th>
                <th className="px-6 py-5">Commentaire</th>
              </tr>
            </thead>

            <tbody>
              {demande.lignes.map((ligne) => (
                <tr
                  key={ligne.idLigneDemandeTransfertStock}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5 font-black">
                    {ligne.article?.reference || `ART-${ligne.idArticle}`}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-600">
                    {ligne.article?.designation || '—'}
                  </td>
                  <td className="px-6 py-5 font-black">
                    {Number(ligne.quantite)}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-500">
                    {ligne.commentaire || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}