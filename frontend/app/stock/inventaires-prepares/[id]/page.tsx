'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Loader2,
  Package,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';

import { AddLigneInventaireForm } from '@/features/inventaires-prepares/components/AddLigneInventaireForm';
import { InventairePrepareActions } from '@/features/inventaires-prepares/components/InventairePrepareActions';
import { InventairePrepareHeader } from '@/features/inventaires-prepares/components/InventairePrepareHeader';
import { InventaireStatutBadge } from '@/features/inventaires-prepares/components/InventaireStatutBadge';
import { LigneInventaireTable } from '@/features/inventaires-prepares/components/LigneInventaireTable';
import { SaisieQuantitesTable } from '@/features/inventaires-prepares/components/SaisieQuantitesTable';
import { getInventairePrepare } from '@/features/inventaires-prepares/services/inventaires-prepares.service';
import {
  formatDate,
  getInventaireNumber,
  getMagasinLabel,
  InventairePrepare,
} from '@/features/inventaires-prepares/types/inventaire-prepare.types';

export default function DetailInventairePreparePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [inventaire, setInventaire] =
    useState<InventairePrepare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInventaire() {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventairePrepare(id);
      setInventaire(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger l’inventaire.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(id)) {
      loadInventaire();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="animate-spin text-slate-400" size={36} />
      </main>
    );
  }

  if (error || !inventaire) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
        <div className="mx-auto max-w-[1000px] rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          {error || 'Inventaire introuvable.'}
        </div>
      </main>
    );
  }

  const lignes = inventaire.lignes || [];

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto max-w-[1380px] space-y-7">
        <InventairePrepareHeader
          title={getInventaireNumber(inventaire)}
          subtitle="Détail de l’inventaire préparé, lignes de comptage, saisie des quantités et validation des écarts."
          actions={
            <>
              <Link
                href="/stock/inventaires-prepares"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Retour
              </Link>

              <InventairePrepareActions
                inventaire={inventaire}
                onRefresh={loadInventaire}
                onDeleted={() =>
                  router.push('/stock/inventaires-prepares')
                }
              />
            </>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <ClipboardList size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Statut
            </p>
            <div className="mt-3">
              <InventaireStatutBadge statut={inventaire.statut} />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Warehouse size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Magasin
            </p>
            <p className="mt-3 text-lg font-black text-slate-950">
              {getMagasinLabel(inventaire.magasin)}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Package size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Articles
            </p>
            <p className="mt-3 text-lg font-black text-slate-950">
              {lignes.length} ligne(s)
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CalendarDays size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Date
            </p>
            <p className="mt-3 text-lg font-black text-slate-950">
              {formatDate(
                inventaire.dateInventaire ||
                  inventaire.dateCreation ||
                  inventaire.createdAt,
              )}
            </p>
          </div>
        </section>

        {inventaire.commentaire && (
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm font-medium leading-6 text-slate-600 shadow-sm">
            <span className="font-black text-slate-950">
              Commentaire :
            </span>{' '}
            {inventaire.commentaire}
          </div>
        )}

        {inventaire.statut === 'BROUILLON' && (
          <AddLigneInventaireForm
            idInventairePrepare={inventaire.idInventairePrepare}
            onSuccess={loadInventaire}
          />
        )}

        {inventaire.statut === 'EN_COMPTAGE' ? (
          <SaisieQuantitesTable
            inventaire={inventaire}
            onSaved={loadInventaire}
          />
        ) : (
          <LigneInventaireTable lignes={lignes} />
        )}
      </div>
    </main>
  );
}