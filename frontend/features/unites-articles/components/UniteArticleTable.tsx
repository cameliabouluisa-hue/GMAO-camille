

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UniteArticle } from '../types/unite-article';

type Props = {
  data: UniteArticle[];
  onCreate: () => void;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void; 
};

export function UniteArticleTable({
  data,
  onCreate,
  onEdit,
  onRemove,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return data;

    return data.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.libelle.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
            Référentiel stock
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Unités articles
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les unités utilisées dans les fiches articles.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f3d56] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#0b3044]"
        >
          <Plus size={18} />
          Nouvelle unité
        </button>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une unité..."
            className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          {filteredData.length} résultat(s)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-left">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                ID
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Code
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Libellé
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.idUniteArticle}
                className="border-b border-slate-100 transition hover:bg-slate-50/80"
              >
                <td className="px-6 py-5 text-sm font-medium text-slate-500">
                  #{item.idUniteArticle}
                </td>

                <td className="px-6 py-5">
                  <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-[#0f3d56]">
                    {item.code}
                  </span>
                </td>

                <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                  {item.libelle}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item.idUniteArticle)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onRemove(item.idUniteArticle)}
                      className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  Aucune unité article trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}