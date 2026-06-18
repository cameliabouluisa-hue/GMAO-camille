'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  History,
  Package,
  Warehouse,
} from 'lucide-react';

import type { MouvementStock } from '../types/stock';

type Props = {
  mouvements: MouvementStock[];
  loading: boolean;
};

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('fr-FR');
}

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
    magasin?.code && magasin?.libelle
      ? `${magasin.code} — ${magasin.libelle}`
      : magasin?.libelle || magasin?.code || '-'
  );
}

function getTypeStyle(type?: string | null) {
  if (type === 'ENTREE') return 'bg-emerald-50 text-emerald-700';
  if (type === 'SORTIE') return 'bg-red-50 text-red-700';
  if (type === 'TRANSFERT') return 'bg-blue-50 text-blue-700';
  if (type === 'CORRECTION') return 'bg-orange-50 text-orange-700';

  return 'bg-slate-100 text-slate-600';
}

function getTypeLabel(type?: string | null) {
  if (type === 'ENTREE') return 'Entrée';
  if (type === 'SORTIE') return 'Sortie';
  if (type === 'TRANSFERT') return 'Transfert';
  if (type === 'CORRECTION') return 'Correction';

  return type || '-';
}

function getTypeIcon(type?: string | null) {
  if (type === 'SORTIE') return ArrowUpRight;
  return ArrowDownLeft;
}

export function MouvementStockTable({ mouvements, loading }: Props) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <History size={22} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Historique des mouvements
          </h2>
          <p className="text-sm text-slate-500">
            {mouvements.length} mouvement(s) enregistré(s)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm font-medium text-slate-500">
          Chargement des mouvements stock...
        </div>
      ) : mouvements.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm font-medium text-slate-500">
          Aucun mouvement stock trouvé.
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-100 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="w-[13%] px-5 py-3">Type</th>
                <th className="w-[13%] px-5 py-3">Date</th>
                <th className="w-[24%] px-5 py-3">Article</th>
                <th className="w-[24%] px-5 py-3">Magasin</th>
                <th className="w-[10%] px-5 py-3">Qté</th>
                <th className="w-[16%] px-5 py-3">Origine</th>
              </tr>
            </thead>

            <tbody>
              {mouvements.map((mouvement) => {
                const TypeIcon = getTypeIcon(mouvement.typeMouvement);

                return (
                  <tr
                    key={mouvement.idMouvement}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${getTypeStyle(
                          mouvement.typeMouvement,
                        )}`}
                      >
                        <TypeIcon size={15} />
                        <span className="truncate">
                          {getTypeLabel(mouvement.typeMouvement)}
                        </span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-slate-400"
                        />
                        <span className="truncate">
                          {formatDate(mouvement.dateMouvement)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Package
                          size={17}
                          className="shrink-0 text-slate-400"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {getArticleLabel(mouvement)}
                          </p>
                          <p className="truncate text-xs font-semibold text-slate-400">
                            ID article : {mouvement.idArticle || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Warehouse
                          size={17}
                          className="shrink-0 text-slate-400"
                        />
                        <p className="truncate text-sm font-bold text-slate-700">
                          {getMagasinLabel(mouvement)}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                        {Number(mouvement.quantite || 0)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-bold text-slate-700">
                        {mouvement.origineType || '-'}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {mouvement.commentaire || '-'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}