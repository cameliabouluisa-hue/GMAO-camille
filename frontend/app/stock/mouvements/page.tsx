'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Boxes,
  Filter,
  History,
  Package,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
} from 'lucide-react';

import { MouvementStockTable } from '@/features/stock-entrees/components/MouvementStockTable';
import { getMouvementsStock } from '@/features/stock-entrees/services/stock.service';
import type { MouvementStock } from '@/features/stock-entrees/types/stock';

function getArticleLabel(mouvement: MouvementStock) {
  return (
    mouvement.article?.reference ||
    mouvement.article?.designation ||
    `Article #${mouvement.idArticle || '-'}`
  );
}

function getMagasinLabel(mouvement: MouvementStock) {
  const magasin = mouvement.magasinDestination || mouvement.magasinSource;

  return (
    magasin?.libelle ||
    magasin?.code ||
    `Magasin #${
      mouvement.idMagasinDestination || mouvement.idMagasinSource || '-'
    }`
  );
}

export default function MouvementsStockPage() {
  const router = useRouter();

  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('TOUS');

  async function loadMouvements() {
    try {
      setLoading(true);
      setError('');

      const result = await getMouvementsStock();
      setMouvements(result);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des mouvements stock.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMouvements();
  }, []);

  const filteredMouvements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return mouvements.filter((mouvement) => {
      const article = getArticleLabel(mouvement).toLowerCase();
      const magasin = getMagasinLabel(mouvement).toLowerCase();
      const origine = mouvement.origineType?.toLowerCase() || '';
      const commentaire = mouvement.commentaire?.toLowerCase() || '';
      const type = mouvement.typeMouvement || '';

      const matchSearch =
        !normalizedSearch ||
        article.includes(normalizedSearch) ||
        magasin.includes(normalizedSearch) ||
        origine.includes(normalizedSearch) ||
        commentaire.includes(normalizedSearch);

      const matchType = typeFilter === 'TOUS' || type === typeFilter;

      return matchSearch && matchType;
    });
  }, [mouvements, search, typeFilter]);

  const stats = useMemo(() => {
    const articles = new Set(
      mouvements.map((mouvement) => mouvement.idArticle).filter(Boolean),
    );

    const magasins = new Set(
      mouvements
        .flatMap((mouvement) => [
          mouvement.idMagasinSource,
          mouvement.idMagasinDestination,
        ])
        .filter(Boolean),
    );

    const quantiteTotale = mouvements.reduce((total, mouvement) => {
      return total + Number(mouvement.quantite || 0);
    }, 0);

    return {
      totalArticles: articles.size,
      totalQuantite: quantiteTotale,
      totalMagasins: magasins.size,
      totalMouvements: mouvements.length,
    };
  }, [mouvements]);

  const cards = [
    {
      title: 'Articles',
      value: stats.totalArticles,
      icon: Boxes,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Quantité',
      value: stats.totalQuantite,
      icon: Package,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Magasins',
      value: stats.totalMagasins,
      icon: Warehouse,
      color: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'Mouvements',
      value: stats.totalMouvements,
      icon: History,
      color: 'bg-violet-50 text-violet-700',
    },
  ];

  return (
  <div className="w-full min-w-0 bg-slate-50 px-5 py-5 lg:px-7">
    <div className="flex min-w-0 flex-col gap-5">
        <section className="shrink-0 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                Module stock
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Mouvements stock
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Historique des entrées, sorties, transferts et corrections.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/stock')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Stock actuel
              </button>

              <button
                type="button"
                onClick={loadMouvements}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={17} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={() => router.push('/stock/entrees/nouvelle')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2f44]"
              >
                <Plus size={17} />
                Nouvelle entrée
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="shrink-0 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="shrink-0 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon size={20} />
                </div>

                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  {card.title}
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {card.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="shrink-0 rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={20} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par article, magasin, origine ou commentaire..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter size={18} className="text-slate-500" />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="bg-transparent text-sm font-black uppercase tracking-[0.18em] text-slate-700 outline-none"
              >
                <option value="TOUS">Tous</option>
                <option value="ENTREE">Entrée</option>
                <option value="SORTIE">Sortie</option>
                <option value="TRANSFERT">Transfert</option>
                <option value="CORRECTION">Correction</option>
              </select>
            </div>
          </div>
        </section>

       <div className="min-w-0">
  <MouvementStockTable
    mouvements={filteredMouvements}
    loading={loading}
  />
</div>
      </div>
    </div>
  );
}