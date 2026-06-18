import { ClipboardList } from 'lucide-react';

import { InventairePrepare } from '../types/inventaire-prepare.types';
import { InventairePrepareCard } from './InventairePrepareCard';

type Props = {
  inventaires: InventairePrepare[];
};

export function InventairePrepareList({ inventaires }: Props) {
  if (inventaires.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <ClipboardList size={26} />
        </div>

        <h2 className="text-xl font-black text-slate-950">
          Aucun inventaire préparé
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Créez un premier inventaire préparé pour commencer le comptage.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {inventaires.map((inventaire) => (
        <InventairePrepareCard
          key={inventaire.idInventairePrepare}
          inventaire={inventaire}
        />
      ))}
    </section>
  );
}