'use client';

import Link from 'next/link';
import { CalendarDays, Eye, Layers, Warehouse } from 'lucide-react';

import {
  formatDate,
  getInventaireNumber,
  getMagasinLabel,
  InventairePrepare,
} from '../types/inventaire-prepare.types';
import { InventaireStatutBadge } from './InventaireStatutBadge';

type Props = {
  inventaire: InventairePrepare;
};

export function InventairePrepareCard({ inventaire }: Props) {
  const lignes = inventaire.lignes || [];

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-950">
            {getInventaireNumber(inventaire)}
          </h3>

          <div className="mt-3">
            <InventaireStatutBadge statut={inventaire.statut} />
          </div>
        </div>

        <Link
          href={`/stock/inventaires-prepares/${inventaire.idInventairePrepare}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          title="Voir le détail"
        >
          <Eye size={18} />
        </Link>
      </div>

      <div className="mt-6 grid gap-3 text-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <CalendarDays size={17} className="text-slate-400" />
          <span className="font-semibold">
            {formatDate(
              inventaire.dateInventaire ||
                inventaire.dateCreation ||
                inventaire.createdAt,
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Warehouse size={17} className="text-slate-400" />
          <span className="font-semibold">
            {getMagasinLabel(inventaire.magasin)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Layers size={17} className="text-slate-400" />
          <span className="font-semibold">
            {lignes.length} ligne(s)
          </span>
        </div>
      </div>
    </article>
  );
}