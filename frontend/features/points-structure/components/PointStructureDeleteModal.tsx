

import { AlertTriangle, RotateCcw, Trash2, X } from 'lucide-react';

import { PointStructureListItem } from '../types/point-structure.type';

type Props = {
  point: PointStructureListItem;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function PointStructureDeleteModal({
  point,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const isAlreadyInactive = !point.actif;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
                isAlreadyInactive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {isAlreadyInactive ? (
                <RotateCcw size={26} />
              ) : (
                <AlertTriangle size={26} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                {isAlreadyInactive
                  ? 'Restaurer le point'
                  : 'Désactiver le point'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cette action concerne le point de structure sélectionné.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Point concerné
            </p>

            <h3 className="mt-2 text-lg font-black text-slate-950">
              {point.libelle || '-'}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                Code : {point.code || '-'}
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                Type : {point.typePoint}
              </span>
            </div>
          </div>

          {!isAlreadyInactive && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              Le point ne sera pas supprimé définitivement. Il sera seulement
              désactivé pour préserver l’historique et les relations de la GMAO.
            </div>
          )}

          {isAlreadyInactive && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Le point sera restauré et pourra de nouveau apparaître dans les
              listes et arborescences.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isAlreadyInactive
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAlreadyInactive ? <RotateCcw size={17} /> : <Trash2 size={17} />}
            {loading
              ? 'Traitement...'
              : isAlreadyInactive
                ? 'Restaurer'
                : 'Désactiver'}
          </button>
        </div>
      </div>
    </div>
  );
}