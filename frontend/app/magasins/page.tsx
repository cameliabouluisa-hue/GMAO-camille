'use client';
import { Select } from '@/components/select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Plus,
  RefreshCcw,
  RotateCcw,
  Warehouse,
  XCircle,
   Search,
} from 'lucide-react';

import { MagasinTable } from '@/features/magasins/components/MagasinTable';
import {
  deleteMagasin,
  getMagasins,
} from '@/features/magasins/services/magasin.service';
import type { Magasin } from '@/features/magasins/types/magasin';

type ActifFilter = 'all' | 'true' | 'false';

export default function MagasinsPage() {
  const router = useRouter();

  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [actif, setActif] = useState<ActifFilter>('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getMagasins();
      setMagasins(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des magasins.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMagasins = useMemo(() => {
    const q = search.trim().toLowerCase();

    return magasins.filter((magasin) => {
      const matchesSearch =
        !q ||
        [magasin.code, magasin.libelle]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesActif =
        actif === 'all' ||
        (actif === 'true' && magasin.actif) ||
        (actif === 'false' && !magasin.actif);

      return matchesSearch && matchesActif;
    });
  }, [magasins, search, actif]);

  const stats = useMemo(() => {
    return {
      total: magasins.length,
      actifs: magasins.filter((magasin) => magasin.actif).length,
      inactifs: magasins.filter((magasin) => !magasin.actif).length,
    };
  }, [magasins]);

  function resetFilters() {
    setSearch('');
    setActif('all');
  }

  async function handleDelete(id: number) {
    try {
      setActionLoading(true);
      setError('');

      await deleteMagasin(id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Suppression impossible.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1450px] space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Magasins
            </h1>

            <p className="mt-1 text-base font-semibold text-slate-500">
              Créez, consultez et gérez les magasins utilisés dans les opérations de stock.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={18}
                className={loading ? 'animate-spin' : ''}
              />
              Actualiser
            </button>

            <button
              type="button"
              onClick={() => router.push('/magasins/nouveau')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
            >
              <Plus size={18} />
              Nouveau magasin
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <MiniStat
            icon={<Warehouse size={18} />}
            label="Total"
            value={stats.total}
            tone="blue"
          />

          <MiniStat
            icon={<CheckCircle2 size={18} />}
            label="Actifs"
            value={stats.actifs}
            tone="green"
          />

          <MiniStat
            icon={<XCircle size={18} />}
            label="Inactifs"
            value={stats.inactifs}
            tone="red"
          />
        </div>
<div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="relative w-full ">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Recherche"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10"
        />

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      <div className="w-full sm:w-[260px]">
        <Select
          value={actif}
          onValueChange={(value) => setActif(value as ActifFilter)}
          items={[
            { label: 'Tous les états', value: 'all' },
            { label: 'Actifs', value: 'true' },
            { label: 'Inactifs', value: 'false' },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-white sm:w-[170px]"
      >
        <RotateCcw size={17} />
        Réinitialiser
      </button>
    

  
  </div>
</div>
        {loading ? (
          <LoadingState />
        ) : (
          <MagasinTable
            data={filteredMagasins}
            total={magasins.length}
            actionLoading={actionLoading}
            onView={(id) => router.push(`/magasins/${id}`)}
            onEdit={(id) => router.push(`/magasins/${id}/modifier`)}
            onRemove={handleDelete}
          />
        )}
      </section>
    </main>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'blue' | 'green' | 'red';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-12 w-12 items-center justify-center rounded-2xl',
            tones[tone],
          ].join(' ')}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <RefreshCcw size={24} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        Chargement des magasins...
      </p>
    </div>
  );
}