'use client';

import {
  Boxes,
  CalendarDays,
  FileText,
  Hash,
  PackageMinus,
  Warehouse,
} from 'lucide-react';

import type {
  StockSortie,
  StockSortieLigne,
} from '../types/stock-sortie';

type Props = {
  sortie: StockSortie;
};

function getLignes(sortie: StockSortie): StockSortieLigne[] {
  return (
    sortie.lignes ??
    sortie.sortie_stock_ligne ??
    sortie.sortieStockLigne ??
    []
  );
}

function toNumber(value: number | string | null | undefined): number {
  const numberValue = Number(value ?? 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatDate(date?: string | Date | null): string {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR').format(parsedDate);
}

function formatMoney(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '-';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return '-';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'DZD',
  }).format(numberValue);
}

function getArticleLabel(ligne: StockSortieLigne): string {
  const article = ligne.article;

  if (!article) return `Article #${ligne.idArticle ?? '-'}`;

  const reference = article.reference ?? article.code ?? '';
  const libelle = article.libelle ?? article.designation ?? '';

  if (reference && libelle) return `${reference} — ${libelle}`;
  if (reference) return reference;
  if (libelle) return libelle;

  return `Article #${article.idArticle}`;
}

function getMagasinLabel(ligne: StockSortieLigne): string {
  const magasin = ligne.magasin;

  if (!magasin) return `Magasin #${ligne.idMagasin ?? '-'}`;

  const code = magasin.code ?? '';
  const libelle = magasin.libelle ?? '';

  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (libelle) return libelle;

  return `Magasin #${magasin.idMagasin}`;
}

function getEmplacementLabel(ligne: StockSortieLigne): string {
  const emplacement = ligne.emplacement;

  if (!emplacement) return '-';

  const code = emplacement.code ?? '';
  const libelle = emplacement.libelle ?? '';

  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (libelle) return libelle;

  return `Emplacement #${emplacement.idEmplacement}`;
}

function getMaterielLabel(ligne: StockSortieLigne): string {
  const materiel = ligne.materiel;

  if (!materiel) return '-';

  const code = materiel.code ?? '';
  const numeroSerie = materiel.numeroSerie ?? '';
  const libelle = materiel.libelle ?? '';

  if (code && numeroSerie) return `${code} — ${numeroSerie}`;
  if (code && libelle) return `${code} — ${libelle}`;
  if (code) return code;
  if (numeroSerie) return numeroSerie;
  if (libelle) return libelle;

  return `Matériel #${materiel.idMateriel}`;
}

function getStatutClass(statut?: string | null): string {
  const value = statut?.toUpperCase();

  if (value === 'VALIDEE' || value === 'VALIDE') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  }

  if (value === 'ANNULEE' || value === 'ANNULE') {
    return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  }

  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

export function StockSortieDetailCard({ sortie }: Props) {
  const lignes = getLignes(sortie);

  const totalQuantite = lignes.reduce(
    (total, ligne) => total + toNumber(ligne.quantite),
    0,
  );

  const magasins = Array.from(
    new Set(lignes.map(getMagasinLabel).filter(Boolean)),
  );

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <PackageMinus size={28} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">
              Bon de sortie
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-900">
              {sortie.numero ?? `BS-${sortie.idSortieStock}`}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${getStatutClass(
                  sortie.statut,
                )}`}
              >
                {sortie.statut ?? 'Brouillon'}
              </span>

              <span className="text-sm font-semibold text-slate-400">
                ID : {sortie.idSortieStock}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <CalendarDays size={16} />
              Date
            </div>
            <p className="mt-2 text-lg font-black text-slate-900">
              {formatDate(sortie.dateSortie)}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-400">
              <PackageMinus size={16} />
              Quantité
            </div>
            <p className="mt-2 text-lg font-black text-red-700">
              - {totalQuantite}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <Warehouse size={16} />
              Magasins
            </div>
            <p className="mt-2 text-lg font-black text-slate-900">
              {magasins.length}
            </p>
          </div>
        </div>
      </div>

      {sortie.commentaire && (
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <FileText size={22} className="mt-1 text-slate-400" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                Commentaire
              </p>
              <p className="mt-1 font-semibold text-slate-700">
                {sortie.commentaire}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Boxes size={24} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Lignes de sortie
            </h3>
            <p className="text-slate-500">
              {lignes.length} ligne(s) enregistrée(s)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Article
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Magasin
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Emplacement
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Matériel
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Qté
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Prix
                </th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  Commentaire
                </th>
              </tr>
            </thead>

            <tbody>
              {lignes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center font-semibold text-slate-400"
                  >
                    Aucune ligne de sortie.
                  </td>
                </tr>
              ) : (
                lignes.map((ligne) => (
                  <tr
                    key={ligne.idLigneSortieStock}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-5 align-top">
                      <p className="font-black text-slate-900">
                        {getArticleLabel(ligne)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        ID article : {ligne.idArticle ?? '-'}
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <p className="font-bold text-slate-800">
                        {getMagasinLabel(ligne)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        ID magasin : {ligne.idMagasin ?? '-'}
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top font-semibold text-slate-700">
                      {getEmplacementLabel(ligne)}
                    </td>

                    <td className="px-5 py-5 align-top">
                      <div className="flex items-start gap-2">
                        <Hash size={16} className="mt-1 text-slate-400" />
                        <span className="font-semibold text-slate-700">
                          {getMaterielLabel(ligne)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-2xl bg-red-50 px-4 py-3 font-black text-red-700">
                        - {toNumber(ligne.quantite)}
                      </span>
                    </td>

                    <td className="px-5 py-5 align-top font-bold text-slate-700">
                      {formatMoney(ligne.prixUnitaire)}
                    </td>

                    <td className="px-5 py-5 align-top font-semibold text-slate-500">
                      {ligne.commentaire ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}