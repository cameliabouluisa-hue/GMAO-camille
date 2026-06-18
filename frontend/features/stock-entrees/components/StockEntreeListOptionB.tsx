'use client';

import {
  CalendarDays,
  Eye,
  FileText,
  Layers,
  Package,
  RefreshCcw,
  Warehouse,
} from 'lucide-react';

import type {
  StockEntree,
  StockEntreeLigne,
} from '../types/stock-entree';

type Props = {
  entrees: StockEntree[];
  total: number;
  loading: boolean;
  onView?: (id: number) => void;
};

function formatDate(date?: string | null): string {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return parsedDate.toLocaleDateString('fr-FR');
}

function getTotalQuantite(entree: StockEntree): number {
  return (
    entree.lignes?.reduce<number>(
      (total: number, ligne: StockEntreeLigne) =>
        total + Number(ligne.quantite ?? 0),
      0,
    ) ?? 0
  );
}

function getMaterielsCount(entree: StockEntree): number {
  return (
    entree.lignes?.reduce<number>(
      (total: number, ligne: StockEntreeLigne) =>
        total + (ligne.materiels?.length ?? 0),
      0,
    ) ?? 0
  );
}

function getArticlesLabel(entree: StockEntree): string {
  const articles =
    entree.lignes
      ?.map((ligne: StockEntreeLigne) => {
        return (
          ligne.article?.reference ||
          ligne.article?.designation ||
          `Article #${ligne.idArticle}`
        );
      })
      .filter((value): value is string => Boolean(value)) ?? [];

  const uniqueArticles = Array.from(new Set(articles));

  if (uniqueArticles.length === 0) return '—';

  if (uniqueArticles.length === 1) {
    return uniqueArticles[0] ?? '—';
  }

  return `${uniqueArticles[0]} +${uniqueArticles.length - 1}`;
}

function getMagasinsLabel(entree: StockEntree): string {
  const magasins =
    entree.lignes
      ?.map((ligne: StockEntreeLigne) => {
        const magasin = ligne.magasin;

        if (!magasin) {
          return `Magasin #${ligne.idMagasin}`;
        }

        if (magasin.code && magasin.libelle) {
          return `${magasin.code} — ${magasin.libelle}`;
        }

        return magasin.code || magasin.libelle || `Magasin #${ligne.idMagasin}`;
      })
      .filter((value): value is string => Boolean(value)) ?? [];

  const uniqueMagasins = Array.from(new Set(magasins));

  if (uniqueMagasins.length === 0) return '—';

  if (uniqueMagasins.length === 1) {
    return uniqueMagasins[0] ?? '—';
  }

  return `${uniqueMagasins[0]} +${uniqueMagasins.length - 1}`;
}

function getStatutStyle(statut?: string | null): string {
  if (statut === 'VALIDEE') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  }

  if (statut === 'BROUILLON') {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
  }

  if (statut === 'ANNULEE') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-100';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

function formatStatut(statut?: string | null): string {
  if (statut === 'VALIDEE') return 'Validée';
  if (statut === 'BROUILLON') return 'Brouillon';
  if (statut === 'ANNULEE') return 'Annulée';

  return statut || 'Statut';
}

export function StockEntreeListOptionB({
  entrees,
  total,
  loading,
  onView,
}: Props) {
  if (loading) {
    return (
      <section className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <RefreshCcw size={24} className="animate-spin" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-500">
          Chargement des bons d’entrée...
        </p>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Liste des bons d’entrée
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {entrees.length} bon(s) affiché(s) sur {total}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
          <FileText size={15} />
          Réception stock
        </div>
      </div>

      {entrees.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm font-black text-slate-400">
          Aucun bon d’entrée trouvé.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {entrees.map((entree: StockEntree) => {
            const totalQuantite = getTotalQuantite(entree);
            const totalMateriels = getMaterielsCount(entree);

            return (
              <article
                key={entree.idEntreeStock}
                className="grid w-full gap-5 px-6 py-5 transition hover:bg-slate-50/80 xl:grid-cols-[270px_minmax(0,1fr)_190px]"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onView?.(entree.idEntreeStock)}
                    className="max-w-full truncate text-left text-xl font-black text-slate-950 transition hover:text-[#06475a]"
                  >
                    {entree.numero || `BE-${entree.idEntreeStock}`}
                  </button>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-black',
                        getStatutStyle(entree.statut),
                      ].join(' ')}
                    >
                      {formatStatut(entree.statut)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-400">
                    Bon d’entrée #{entree.idEntreeStock}
                  </p>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <InfoItem
                    icon={<CalendarDays size={16} />}
                    label="Date"
                    value={formatDate(entree.dateReception)}
                  />

                  <InfoItem
                    icon={<Package size={16} />}
                    label="Articles"
                    value={getArticlesLabel(entree)}
                  />

                  <InfoItem
                    icon={<Warehouse size={16} />}
                    label="Magasins"
                    value={getMagasinsLabel(entree)}
                  />

                  <InfoItem
                    icon={<Layers size={16} />}
                    label="Lignes"
                    value={`${entree.lignes?.length ?? 0} ligne(s)`}
                  />
                </div>

                <div className="flex min-w-0 items-center gap-2 xl:justify-end">
                  <span className="inline-flex h-11 min-w-12 items-center justify-center rounded-2xl bg-emerald-50 px-3 text-sm font-black text-emerald-700">
                    + {totalQuantite}
                  </span>

                  <span className="inline-flex h-11 min-w-16 items-center justify-center rounded-2xl bg-blue-50 px-3 text-sm font-black text-blue-700">
                    {totalMateriels} mat.
                  </span>

                  <button
                    type="button"
                    onClick={() => onView?.(entree.idEntreeStock)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                    title="Voir détail"
                  >
                    <Eye size={19} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {icon}
        <span className="truncate">{label}</span>
      </div>

      <p className="mt-2 truncate text-base font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}