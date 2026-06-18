

import {
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Warehouse,
  XCircle,
} from 'lucide-react';

import type { Magasin } from '@/features/magasins/types/magasin';

type Props = {
  data: Magasin[];
  total: number;
  actionLoading?: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
};

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date);
}

export function MagasinTable({
  data,
  total,
  actionLoading = false,
  onView,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Liste des magasins
          </h2>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {data.length} magasin(s) affiché(s) sur {total}
          </p>
        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Magasin</th>
              <th className="px-6 py-4">État</th>
              <th className="px-6 py-4">Créé le</th>
              <th className="px-6 py-4 text-center ">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((magasin) => (
              <tr
                key={magasin.idMagasin}
                className="border-b border-slate-100 transition hover:bg-slate-50/80"
              >
                <td className="px-6 py-5">
                  <button
                    type="button"
                    onClick={() => onView(magasin.idMagasin)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-900 transition hover:bg-cyan-50 hover:text-[#06475a]"
                  >
                    {magasin.code}
                  </button>
                </td>

                <td className="px-6 py-5">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">
                      {magasin.libelle}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      Magasin #{magasin.idMagasin}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-5">
                  {magasin.actif ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                      
                      Inactif
                    </span>
                  )}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-500">
                  {formatDate(magasin.createdAt)}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(magasin.idMagasin)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                      title="Voir la fiche"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(magasin.idMagasin)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(magasin.idMagasin)}
                      disabled={actionLoading}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-14 text-center text-sm font-black text-slate-400"
                >
                  Aucun magasin trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}