'use client';

import {
  CalendarDays,
  Eye,
  FileText,
  Layers,
  Package,
  Warehouse,
} from 'lucide-react';

import type {
  StockSortie,
  StockSortieLigne,
} from '../types/stock-sortie';

type Props = {
  sorties: StockSortie[];
  total: number;
  loading: boolean;
  onView?: (id: number) => void;
};

function getLignes(sortie: StockSortie): StockSortieLigne[] {
  return sortie.lignes ?? sortie.sortie_stock_ligne ?? [];
}

function formatDate(date?: string | null): string {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return parsedDate.toLocaleDateString('fr-FR');
}

function getTotalQuantite(sortie: StockSortie): number {
  return getLignes(sortie).reduce<number>(
    (total, ligne) => total + Number(ligne.quantite ?? 0),
    0,
  );
}

function getMaterielsCount(sortie: StockSortie): number {
  return getLignes(sortie).filter((ligne) => Boolean(ligne.idMateriel)).length;
}

function getArticlesLabel(sortie: StockSortie): string {
  const articles = getLignes(sortie)
    .map((ligne) => {
      return (
        ligne.article?.reference ||
        ligne.article?.designation ||
        ligne.article?.libelle ||
        `Article #${ligne.idArticle}`
      );
    })
    .filter((value): value is string => Boolean(value));

  const uniqueArticles = Array.from(new Set(articles));

  if (uniqueArticles.length === 0) return '-';

  if (uniqueArticles.length === 1) {
    return uniqueArticles[0] ?? '-';
  }

  return `${uniqueArticles[0]} +${uniqueArticles.length - 1}`;
}

function getMagasinsLabel(sortie: StockSortie): string {
  const magasins = getLignes(sortie)
    .map((ligne) => {
      const magasin = ligne.magasin;

      if (!magasin) {
        return `Magasin #${ligne.idMagasin}`;
      }

      if (magasin.code && magasin.libelle) {
        return `${magasin.code} — ${magasin.libelle}`;
      }

      return magasin.code || magasin.libelle || `Magasin #${ligne.idMagasin}`;
    })
    .filter((value): value is string => Boolean(value));

  const uniqueMagasins = Array.from(new Set(magasins));

  if (uniqueMagasins.length === 0) return '-';

  if (uniqueMagasins.length === 1) {
    return uniqueMagasins[0] ?? '-';
  }

  return `${uniqueMagasins[0]} +${uniqueMagasins.length - 1}`;
}

function getStatutLabel(statut?: string | null): string {
  if (statut === 'VALIDEE') return 'Validée';
  if (statut === 'BROUILLON') return 'Brouillon';
  if (statut === 'ANNULEE') return 'Annulée';

  return statut || 'STATUT';
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

export function StockSortieListOptionB({
  sorties,
  total,
  loading,
  onView,
}: Props) {
  return (
    <section className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <FileText size={23} />
          </div>

          <div className="min-w-0">
            <h2 className="text-[26px] font-black leading-tight text-slate-950">
              Liste des bons de sortie
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {sorties.length} bon(s) affiché(s) sur {total}
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
          <FileText size={17} />
          Sortie stock
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-sm font-medium text-slate-500">
          Chargement des bons de sortie...
        </div>
      ) : sorties.length === 0 ? (
        <div className="p-8 text-sm font-medium text-slate-500">
          Aucun bon de sortie enregistré.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sorties.map((sortie) => {
            const lignes = getLignes(sortie);
            const totalQuantite = getTotalQuantite(sortie);
            const totalMateriels = getMaterielsCount(sortie);

            return (
              <article
                key={sortie.idSortieStock}
                className="grid w-full gap-5 px-6 py-5 transition hover:bg-slate-50/80 xl:grid-cols-[270px_minmax(0,1fr)_170px]"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black text-slate-950">
                    {sortie.numero || `BS-${sortie.idSortieStock}`}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatutStyle(
                        sortie.statut,
                      )}`}
                    >
                      {getStatutLabel(sortie.statut)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-400">
                    ID : {sortie.idSortieStock}
                  </p>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <InfoItem
                    icon={<CalendarDays size={16} />}
                    label="Date"
                    value={formatDate(sortie.dateSortie)}
                  />

                  <InfoItem
                    icon={<Package size={16} />}
                    label="Articles"
                    value={getArticlesLabel(sortie)}
                  />

                  <InfoItem
                    icon={<Warehouse size={16} />}
                    label="Magasins"
                    value={getMagasinsLabel(sortie)}
                  />

                  <InfoItem
                    icon={<Layers size={16} />}
                    label="Lignes"
                    value={`${lignes.length} ligne(s)`}
                  />
                </div>

                <div className="flex min-w-0 items-center gap-2 xl:justify-end">
                  <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-red-50 px-3 text-center text-sm font-black text-red-700">
                    - {totalQuantite}
                  </span>

                  <span className="flex h-12 min-w-16 items-center justify-center rounded-2xl bg-blue-50 px-3 text-center text-sm font-black text-blue-700">
                    {totalMateriels} mat.
                  </span>

                  <button
                    type="button"
                    onClick={() => onView?.(sortie.idSortieStock)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
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