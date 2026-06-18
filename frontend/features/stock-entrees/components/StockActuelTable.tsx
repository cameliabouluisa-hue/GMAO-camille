'use client';

import { ArrowDownToLine } from 'lucide-react';
import type { StockArticleMagasin } from '../types/stock';

type Props = {
  stocks: StockArticleMagasin[];
  loading: boolean;
};

function getArticleLabel(stock: StockArticleMagasin) {
  return (
    stock.article?.reference ||
    stock.article?.designation ||
    `Article #${stock.idArticle}`
  );
}

function getMagasinLabel(stock: StockArticleMagasin) {
  if (stock.magasin?.code && stock.magasin?.libelle) {
    return `${stock.magasin.code} — ${stock.magasin.libelle}`;
  }

  return stock.magasin?.libelle || stock.magasin?.code || `Magasin #${stock.idMagasin}`;
}

export function StockActuelTable({ stocks, loading }: Props) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-white">
      <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ArrowDownToLine size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Quantités par magasin
            </h2>
            <p className="text-slate-500">
              {stocks.length} ligne(s) de stock enregistrée(s)
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-slate-500 lg:px-8">
          Chargement du stock actuel...
        </div>
      ) : stocks.length === 0 ? (
        <div className="px-6 py-8 text-slate-500 lg:px-8">
          Aucun stock disponible.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-sm font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4 lg:px-8">Article</th>
                <th className="px-6 py-4 lg:px-8">Magasin</th>
                <th className="px-6 py-4 text-center lg:px-8">Quantité</th>
                <th className="px-6 py-4 text-center lg:px-8">Réservée</th>
                <th className="px-6 py-4 text-center lg:px-8">Disponible</th>
              </tr>
            </thead>

            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.idStock}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5 lg:px-8">
                    <div>
                      <p className="font-bold text-slate-900">
                        {getArticleLabel(stock)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-700 lg:px-8">
                    {getMagasinLabel(stock)}
                  </td>

                  <td className="px-6 py-5 text-center lg:px-8">
                    <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700">
                      {Number(stock.quantitePhysique ?? 0)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center font-bold text-slate-900 lg:px-8">
                    {Number(stock.quantiteReservee ?? 0)}
                  </td>

                  <td className="px-6 py-5 text-center lg:px-8">
                    <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
                      {Number(stock.quantiteDisponible ?? 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}