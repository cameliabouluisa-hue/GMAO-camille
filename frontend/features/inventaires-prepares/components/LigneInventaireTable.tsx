import {
  getArticleDesignation,
  getArticleReference,
  LigneInventairePrepare,
} from '../types/inventaire-prepare.types';

type Props = {
  lignes: LigneInventairePrepare[];
};

function getEcart(ligne: LigneInventairePrepare) {
  if (ligne.quantiteReelle === null || ligne.quantiteReelle === undefined) {
    return null;
  }

  if (ligne.ecart !== null && ligne.ecart !== undefined) {
    return ligne.ecart;
  }

  return Number(ligne.quantiteReelle) - Number(ligne.quantiteTheorique);
}

export function LigneInventaireTable({ lignes }: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-2xl font-black text-slate-950">
          Lignes d’inventaire
        </h2>

        <p className="text-sm font-medium text-slate-500">
          {lignes.length} article(s) à compter.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Article
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Désignation
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Qté théorique
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Qté réelle
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Écart
              </th>
            </tr>
          </thead>

          <tbody>
            {lignes.map((ligne) => {
              const ecart = getEcart(ligne);

              return (
                <tr
                  key={ligne.idLigneInventairePrepare}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5 text-sm font-black text-slate-950">
                    {getArticleReference(ligne.article)}
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                    {getArticleDesignation(ligne.article)}
                  </td>

                  <td className="px-6 py-5 text-sm font-black text-slate-950">
                    {ligne.quantiteTheorique}
                  </td>

                  <td className="px-6 py-5 text-sm font-black text-slate-950">
                    {ligne.quantiteReelle ?? '—'}
                  </td>

                  <td className="px-6 py-5">
                    {ecart === null ? (
                      <span className="text-sm font-bold text-slate-400">
                        —
                      </span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${
                          ecart === 0
                            ? 'bg-slate-100 text-slate-600'
                            : ecart > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {ecart > 0 ? `+${ecart}` : ecart}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}