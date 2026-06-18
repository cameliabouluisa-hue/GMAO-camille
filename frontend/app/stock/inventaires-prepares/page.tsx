'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';

import { InventairePrepareHeader } from '@/features/inventaires-prepares/components/InventairePrepareHeader';
import { InventairePrepareList } from '@/features/inventaires-prepares/components/InventairePrepareList';
import { getInventairesPrepares } from '@/features/inventaires-prepares/services/inventaires-prepares.service';
import { InventairePrepare } from '@/features/inventaires-prepares/types/inventaire-prepare.types';

export default function InventairesPreparesPage() {
  const [inventaires, setInventaires] = useState<InventairePrepare[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInventaires(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const data = await getInventairesPrepares();
      setInventaires(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les inventaires préparés.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInventaires();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <div className="mx-auto max-w-[1380px] space-y-7">
        <InventairePrepareHeader
          title="Inventaires préparés"
          subtitle="Préparez un comptage, générez les lignes depuis le stock, saisissez les quantités réelles puis validez les écarts."
          actions={
            <>
              <button
                type="button"
                onClick={() => loadInventaires(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {refreshing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCcw size={18} />
                )}
                Actualiser
              </button>

              <Link
                href="/stock/inventaires-prepares/nouveau"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0b3f59] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#083247]"
              >
                <Plus size={18} />
                Nouvel inventaire
              </Link>
            </>
          }
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : (
          <InventairePrepareList inventaires={inventaires} />
        )}
      </div>
    </main>
  );
}