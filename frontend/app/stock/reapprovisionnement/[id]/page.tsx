'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Package,
  Trash2,
  Warehouse,
  XCircle,
} from 'lucide-react';

import {
  annulerReapprovisionnement,
  deleteReapprovisionnement,
  getReapprovisionnement,
  validerReapprovisionnement,
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

function getArticleCode(ligne: DemandeReapprovisionnement['lignes'][number]) {
  return ligne.article?.code || `ART-${ligne.idArticle}`;
}

function getArticleLabel(ligne: DemandeReapprovisionnement['lignes'][number]) {
  return (
    ligne.article?.designation ||
    ligne.article?.libelle ||
    ligne.article?.code ||
    `Article ${ligne.idArticle}`
  );
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

export default function DetailReapprovisionnementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params.id);

  const [demande, setDemande] = useState<DemandeReapprovisionnement | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const data = await getReapprovisionnement(id);
      setDemande(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la demande.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(id)) {
      loadData();
    }
  }, [id]);

  const totalQuantite = useMemo(() => {
    return (
      demande?.lignes.reduce(
        (sum, ligne) => sum + Number(ligne.quantiteDemandee || 0),
        0,
      ) || 0
    );
  }, [demande]);

  async function handleValider() {
    if (!demande) return;

    try {
      setActionLoading(true);
      setError('');

      const updated = await validerReapprovisionnement(
        demande.idDemandeReapprovisionnement,
      );

      setDemande(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la validation.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAnnuler() {
    if (!demande) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment annuler cette demande ?',
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      const updated = await annulerReapprovisionnement(
        demande.idDemandeReapprovisionnement,
      );

      setDemande(updated);
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

  async function handleDelete() {
    if (!demande) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette demande ?',
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      await deleteReapprovisionnement(
        demande.idDemandeReapprovisionnement,
      );

      router.push('/stock/reapprovisionnement');
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-8 py-7">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500 shadow-sm">
          Chargement...
        </div>
      </main>
    );
  }

  if (!demande) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-8 py-7">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm font-bold text-red-700 shadow-sm">
          Demande introuvable.
        </div>
      </main>
    );
  }

  const isBrouillon = demande.statut === 'BROUILLON';
  const isValidee = demande.statut === 'VALIDEE';
  const isAnnulee = demande.statut === 'ANNULEE';

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-8 py-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.45em] text-slate-400">
              Module stock
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-black text-slate-950">
                {demande.numero}
              </h1>
              <StatusBadge statut={demande.statut} />
            </div>

            <p className="mt-2 text-base font-semibold text-slate-500">
              Détail de la demande de réapprovisionnement.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/stock/reapprovisionnement')}
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>

            {isBrouillon && (
              <button
                onClick={handleValider}
                disabled={actionLoading}
                className="inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-5 w-5" />
                Valider
              </button>
            )}

            {isBrouillon && (
              <button
                onClick={handleAnnuler}
                disabled={actionLoading}
                className="inline-flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                <XCircle className="h-5 w-5" />
                Annuler
              </button>
            )}

            {!isValidee && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-5 py-4 text-sm font-black text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Statut
          </p>
          <div className="mt-3">
            <StatusBadge statut={demande.statut} />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Warehouse className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Magasin
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {getMagasinLabel(demande)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Package className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Quantité
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {formatQty(totalQuantite)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.35em] text-slate-400">
            Date
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {formatDate(demande.dateDemande)}
          </p>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-black text-slate-950">
            Informations générales
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Demandeur
              </p>
              <p className="mt-2 text-sm font-black text-slate-800">
                {demande.demandeur || '—'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                Date validation
              </p>
              <p className="mt-2 text-sm font-black text-slate-800">
                {formatDate(demande.dateValidation)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
              Commentaire
            </p>
            <p className="mt-2 text-sm font-bold text-slate-700">
              {demande.commentaire || 'Aucun commentaire.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-black text-slate-950">
            Articles demandés
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {demande.lignes.length} ligne(s) de réapprovisionnement.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Désignation</th>
                <th className="px-6 py-4">Quantité demandée</th>
                <th className="px-6 py-4">Commentaire</th>
              </tr>
            </thead>

            <tbody>
              {demande.lignes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Aucune ligne.
                  </td>
                </tr>
              ) : (
                demande.lignes.map((ligne) => (
                  <tr
                    key={ligne.idLigneReapprovisionnement}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-5 text-sm font-black text-slate-950">
                      {getArticleCode(ligne)}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-700">
                      {getArticleLabel(ligne)}
                    </td>

                    <td className="px-6 py-5 text-sm font-black text-slate-950">
                      {formatQty(Number(ligne.quantiteDemandee || 0))}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                      {ligne.commentaire || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isValidee && (
          <div className="border-t border-slate-100 p-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
              Cette demande est validée. Elle peut maintenant servir de base
              pour préparer un achat ou une future entrée stock après réception.
            </div>
          </div>
        )}

        {isAnnulee && (
          <div className="border-t border-slate-100 p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              Cette demande a été annulée.
            </div>
          </div>
        )}
      </section>
    </main>
  );
}