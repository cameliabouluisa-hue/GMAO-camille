'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Package,
  RefreshCcw,
  Save,
  Search,
  Warehouse,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiMagasin = {
  idMagasin?: number;
  id?: number;
  code?: string | null;
  libelle?: string | null;
  nom?: string | null;
};

type ApiArticle = {
  idArticle?: number;
  id?: number;
  reference?: string | null;
  designation?: string | null;
  libelle?: string | null;
  unite?: string | null;
  famille?: {
    libelle?: string | null;
  } | null;
};

type ApiStock = {
  idStockArticleMagasin?: number;
  idStock?: number;
  idArticle?: number;
  idMagasin?: number;
  quantitePhysique?: number | string | null;
  quantiteDisponible?: number | string | null;
  quantiteStock?: number | string | null;
  quantite?: number | string | null;
  article?: ApiArticle | null;
  magasin?: ApiMagasin | null;
};

type InventaireLigne = {
  key: string;
  idArticle: number;
  idMagasin: number;
  reference: string;
  designation: string;
  famille: string;
  unite: string;
  magasinCode: string;
  magasinLibelle: string;
  qteTheorique: number;
};

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeArray(data: unknown): any[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.stocks)) return obj.stocks;
    if (Array.isArray(obj.magasins)) return obj.magasins;
  }

  return [];
}

async function fetchFirstAvailable(paths: string[]) {
  let lastError: unknown = null;

  for (const path of paths) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        lastError = new Error(`${path} : ${response.status}`);
        continue;
      }

      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Aucune route API disponible.');
}

function normalizeStockRows(rows: ApiStock[]): InventaireLigne[] {
  return rows.map((row, index) => {
    const article = row.article || {};
    const magasin = row.magasin || {};

    const idArticle = toNumber(row.idArticle ?? article.idArticle ?? article.id);
    const idMagasin = toNumber(row.idMagasin ?? magasin.idMagasin ?? magasin.id);

    const qteTheorique = toNumber(
      row.quantitePhysique ??
        row.quantiteDisponible ??
        row.quantiteStock ??
        row.quantite,
    );

    return {
      key: String(
        row.idStockArticleMagasin ??
          row.idStock ??
          `${idMagasin}-${idArticle}-${index}`,
      ),
      idArticle,
      idMagasin,
      reference:
        article.reference ||
        article.designation ||
        article.libelle ||
        `ART-${idArticle || index + 1}`,
      designation:
        article.designation ||
        article.libelle ||
        article.reference ||
        'Article sans désignation',
      famille: article.famille?.libelle || 'Non définie',
      unite: article.unite || 'U',
      magasinCode:
        magasin.code ||
        magasin.libelle ||
        magasin.nom ||
        `MAG-${idMagasin || '-'}`,
      magasinLibelle:
        magasin.libelle ||
        magasin.nom ||
        magasin.code ||
        'Magasin non défini',
      qteTheorique,
    };
  });
}

function getEcart(qteReelle: string | undefined, qteTheorique: number) {
  const reel = qteReelle === undefined || qteReelle === '' ? 0 : Number(qteReelle);
  return Number.isFinite(reel) ? reel - qteTheorique : -qteTheorique;
}

export default function InventairePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [lignes, setLignes] = useState<InventaireLigne[]>([]);
  const [magasins, setMagasins] = useState<ApiMagasin[]>([]);

  const [selectedMagasin, setSelectedMagasin] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [quantitesReelles, setQuantitesReelles] = useState<Record<string, string>>(
    {},
  );

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const [stockData, magasinsData] = await Promise.all([
        fetchFirstAvailable(['/stock', '/stock/actuel', '/stocks']),
        fetchFirstAvailable(['/magasins', '/magasin']),
      ]);

      const stockRows = normalizeArray(stockData) as ApiStock[];
      const magasinRows = normalizeArray(magasinsData) as ApiMagasin[];

      const normalized = normalizeStockRows(stockRows);

      setLignes(normalized);
      setMagasins(magasinRows);

      const initialQuantities: Record<string, string> = {};
      normalized.forEach((ligne) => {
        initialQuantities[ligne.key] = String(ligne.qteTheorique);
      });

      setQuantitesReelles(initialQuantities);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les données de stock.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const lignesFiltrees = useMemo(() => {
    const q = search.trim().toLowerCase();

    return lignes.filter((ligne) => {
      const matchMagasin =
        selectedMagasin === 'ALL' ||
        String(ligne.idMagasin) === String(selectedMagasin);

      const matchSearch =
        !q ||
        ligne.reference.toLowerCase().includes(q) ||
        ligne.designation.toLowerCase().includes(q) ||
        ligne.magasinCode.toLowerCase().includes(q) ||
        ligne.magasinLibelle.toLowerCase().includes(q) ||
        ligne.famille.toLowerCase().includes(q);

      return matchMagasin && matchSearch;
    });
  }, [lignes, search, selectedMagasin]);

  const totalArticles = lignesFiltrees.length;

  const totalTheorique = useMemo(() => {
    return lignesFiltrees.reduce((sum, ligne) => sum + ligne.qteTheorique, 0);
  }, [lignesFiltrees]);

  const totalReel = useMemo(() => {
    return lignesFiltrees.reduce((sum, ligne) => {
      const value = quantitesReelles[ligne.key];
      return sum + toNumber(value);
    }, 0);
  }, [lignesFiltrees, quantitesReelles]);

  const totalEcart = totalReel - totalTheorique;

  function updateQuantite(key: string, value: string) {
    setQuantitesReelles((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleValiderInventaire() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const lignesPayload = lignesFiltrees.map((ligne) => {
        const quantiteReelle = toNumber(quantitesReelles[ligne.key]);
        const ecart = quantiteReelle - ligne.qteTheorique;

        return {
          idArticle: ligne.idArticle,
          idMagasin: ligne.idMagasin,
          quantiteTheorique: ligne.qteTheorique,
          quantiteReelle,
          ecart,
        };
      });

      const response = await fetch(`${API_URL}/stock/inventaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idMagasin:
            selectedMagasin === 'ALL' ? null : Number(selectedMagasin),
          commentaire,
          lignes: lignesPayload,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Erreur pendant la validation.');
      }

      setSuccess(
        'Inventaire validé avec succès. Les écarts peuvent maintenant générer des mouvements de correction.',
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de valider l’inventaire.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
                Module stock
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Inventaire
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Relevez les quantités physiques du magasin, comparez-les avec le
                stock théorique et préparez les corrections.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCcw size={18} />
                Actualiser
              </button>

              <button
                type="button"
                onClick={handleValiderInventaire}
                disabled={saving || loading || lignesFiltrees.length === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0b4560] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#08364b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? 'Validation...' : 'Valider l’inventaire'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Package size={23} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Articles
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalArticles}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ClipboardList size={23} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Qté théorique
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalTheorique}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Calculator size={23} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Qté réelle
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalReel}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                totalEcart === 0
                  ? 'bg-slate-100 text-slate-500'
                  : totalEcart > 0
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              <AlertTriangle size={23} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              Écart total
            </p>
            <p
              className={`mt-2 text-3xl font-black ${
                totalEcart === 0
                  ? 'text-slate-950'
                  : totalEcart > 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
              }`}
            >
              {totalEcart > 0 ? `+${totalEcart}` : totalEcart}
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Magasin
              </label>

              <select
                value={selectedMagasin}
                onChange={(e) => setSelectedMagasin(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#0b4560] focus:ring-4 focus:ring-[#0b4560]/10"
              >
                <option value="ALL">Tous les magasins</option>

                {magasins.map((magasin, index) => {
                  const id = magasin.idMagasin ?? magasin.id ?? index;
                  const label =
                    magasin.code ||
                    magasin.libelle ||
                    magasin.nom ||
                    `Magasin ${id}`;

                  return (
                    <option key={id} value={String(id)}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Recherche
              </label>

              <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0b4560] focus-within:ring-4 focus-within:ring-[#0b4560]/10">
                <Search size={20} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher article, magasin, famille..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Commentaire
              </label>

              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Exemple : inventaire mensuel du magasin principal..."
                className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b4560] focus:ring-4 focus:ring-[#0b4560]/10"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Liste des articles à inventorier
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {lignesFiltrees.length} ligne(s) affichée(s)
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-600">
              <Warehouse size={18} />
              Stock actuel
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] table-fixed">
              <colgroup>
                <col className="w-[150px]" />
                <col className="w-[280px]" />
                <col className="w-[220px]" />
                <col className="w-[170px]" />
                <col className="w-[170px]" />
                <col className="w-[130px]" />
              </colgroup>

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Désignation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Magasin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Qté théorique
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Qté réelle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                    Écart
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      Chargement de l’inventaire...
                    </td>
                  </tr>
                ) : lignesFiltrees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      Aucun article trouvé.
                    </td>
                  </tr>
                ) : (
                  lignesFiltrees.map((ligne) => {
                    const ecart = getEcart(
                      quantitesReelles[ligne.key],
                      ligne.qteTheorique,
                    );

                    return (
                      <tr
                        key={ligne.key}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-5 align-middle">
                          <span className="inline-flex min-w-24 items-center justify-center rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-[#0b4560]">
                            {ligne.reference}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <p className="truncate text-sm font-black text-slate-950">
                            {ligne.designation}
                          </p>
                          <p className="mt-1 truncate text-xs font-bold text-slate-400">
                            {ligne.famille} · {ligne.unite}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <p className="truncate text-sm font-black text-slate-950">
                            {ligne.magasinCode}
                          </p>
                          <p className="mt-1 truncate text-xs font-bold text-slate-400">
                            {ligne.magasinLibelle}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <p className="text-sm font-black text-slate-950">
                            {ligne.qteTheorique}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            Disponible : {ligne.qteTheorique}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <input
                            type="number"
                            min="0"
                            value={quantitesReelles[ligne.key] ?? ''}
                            onChange={(e) =>
                              updateQuantite(ligne.key, e.target.value)
                            }
                            className="h-12 w-36 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none transition focus:border-[#0b4560] focus:ring-4 focus:ring-[#0b4560]/10"
                          />
                        </td>

                        <td className="px-6 py-5 align-middle">
                          <span
                            className={`inline-flex min-w-16 items-center justify-center rounded-2xl px-4 py-3 text-sm font-black ${
                              ecart === 0
                                ? 'bg-slate-100 text-slate-500'
                                : ecart > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {ecart > 0 ? `+${ecart}` : ecart}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}