'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  FileText,
  Layers,
  PackageMinus,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
} from 'lucide-react';

import { Select } from '@/components/select';
import { getStockSorties } from '@/features/stock-sorties/services/stock-sortie.service';
import { StockSortieListOptionB } from '@/features/stock-sorties/components/StockSortieListOptionB';

import type {
  StockSortie,
  StockSortieLigne,
} from '@/features/stock-sorties/types/stock-sortie';

type StatutFilter = 'all' | 'VALIDEE' | 'BROUILLON' | 'ANNULEE';

function getLignes(sortie: StockSortie): StockSortieLigne[] {
  return sortie.lignes ?? sortie.sortie_stock_ligne ?? [];
}

function getTotalQuantite(sortie: StockSortie): number {
  return getLignes(sortie).reduce<number>(
    (total, ligne) => total + Number(ligne.quantite ?? 0),
    0,
  );
}

function getSearchText(sortie: StockSortie): string {
  const lignes = getLignes(sortie);

  const articles = lignes
    .map((ligne) => {
      return [
        ligne.article?.reference,
        ligne.article?.designation,
        ligne.article?.libelle,
        ligne.idArticle ? `Article ${ligne.idArticle}` : '',
      ].join(' ');
    })
    .join(' ');

  const magasins = lignes
    .map((ligne) => {
      return [
        ligne.magasin?.code,
        ligne.magasin?.libelle,
        ligne.idMagasin ? `Magasin ${ligne.idMagasin}` : '',
      ].join(' ');
    })
    .join(' ');

  return [
    sortie.numero,
    sortie.statut,
    sortie.idSortieStock,
    sortie.commentaire,
    articles,
    magasins,
  ]
    .join(' ')
    .toLowerCase();
}

export default function StockSortiesPage() {
  const router = useRouter();

  const [sorties, setSorties] = useState<StockSortie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState<StatutFilter>('all');

  const loadSorties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getStockSorties();
      setSorties(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des bons de sortie.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSorties();
  }, [loadSorties]);

  const filteredSorties = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sorties.filter((sortie) => {
      const matchesSearch = !q || getSearchText(sortie).includes(q);

      const matchesStatut =
        statut === 'all' || String(sortie.statut) === statut;

      return matchesSearch && matchesStatut;
    });
  }, [sorties, search, statut]);

  const stats = useMemo(() => {
    return {
      total: sorties.length,
      validees: sorties.filter((sortie) => sortie.statut === 'VALIDEE').length,
      lignes: sorties.reduce(
        (total, sortie) => total + getLignes(sortie).length,
        0,
      ),
      quantite: sorties.reduce(
        (total, sortie) => total + getTotalQuantite(sortie),
        0,
      ),
    };
  }, [sorties]);

  function resetFilters() {
    setSearch('');
    setStatut('all');
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1450px] space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Sorties stock
            </h1>

            <p className="mt-1 text-base font-semibold text-slate-500">
              Consultez les bons de sortie, leurs lignes d’articles et les
              mouvements générés.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadSorties}
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
              onClick={() => router.push('/stock/sorties/nouvelle')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
            >
              <Plus size={18} />
              Nouvelle sortie
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <MiniStat
            icon={<FileText size={18} />}
            label="Total"
            value={stats.total}
            tone="blue"
          />

          <MiniStat
            icon={<CheckCircle2 size={18} />}
            label="Validées"
            value={stats.validees}
            tone="green"
          />

          <MiniStat
            icon={<Layers size={18} />}
            label="Lignes"
            value={stats.lignes}
            tone="purple"
          />

          <MiniStat
            icon={<PackageMinus size={18} />}
            label="Quantité"
            value={stats.quantite}
            tone="red"
          />
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:flex-1">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par numéro, article ou magasin..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-10 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 hover:bg-white focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10"
              />

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="w-full sm:w-[240px]">
                <Select
                  value={statut}
                  onValueChange={(value) => setStatut(value as StatutFilter)}
                  items={[
                    { label: 'Tous les statuts', value: 'all' },
                    { label: 'Validées', value: 'VALIDEE' },
                    { label: 'Brouillons', value: 'BROUILLON' },
                    { label: 'Annulées', value: 'ANNULEE' },
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
        </div>

        <StockSortieListOptionB
          sorties={filteredSorties}
          total={sorties.length}
          loading={loading}
          onView={(id) => router.push(`/stock/sorties/${id}`)}
        />
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
  tone: 'blue' | 'green' | 'purple' | 'red';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-violet-50 text-violet-600',
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