'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Boxes,
  Layers3,
  PackagePlus,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from 'lucide-react';

import { Select } from '@/components/select';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/articles/services/article-referentiel.service';
import type { Article, Magasin } from '@/features/articles/types/article';

import { createStockEntree } from '@/features/stock-entrees/services/stock-entree.service';
import type {
  CreateStockEntreeDto,
  LigneStockEntreeDto,
  MaterielReceptionDto,
} from '@/features/stock-entrees/types/stock-entree';

type EmplacementMagasin = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

type MaterielLineForm = {
  code: string;
  numeroSerie: string;
};

type EntreeLineForm = {
  id: string;
  articleId: string;
  magasinId: string;
  emplacementId: string;
  quantite: string;
  prixUnitaire: string;
  numeroLot: string;
  datePeremption: string;
  commentaire: string;
  materiels: MaterielLineForm[];
};

const API_BASE_URL = 'http://localhost:3001';

async function getEmplacementsByMagasin(
  idMagasin: number,
): Promise<EmplacementMagasin[]> {
  const res = await fetch(`${API_BASE_URL}/magasins/${idMagasin}/emplacements`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  return res.json();
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyMateriel(): MaterielLineForm {
  return {
    code: '',
    numeroSerie: '',
  };
}

function createEmptyLine(): EntreeLineForm {
  return {
    id: crypto.randomUUID(),
    articleId: '',
    magasinId: '',
    emplacementId: 'none',
    quantite: '1',
    prixUnitaire: '',
    numeroLot: '',
    datePeremption: '',
    commentaire: '',
    materiels: [],
  };
}

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '—';

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return `${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DA`;
}

function buildArticleLabel(article: Article) {
  const reference = article.reference || `Article #${article.idArticle}`;
  const designation = article.designation || 'Sans désignation';

  return `${reference} — ${designation}`;
}

function buildMagasinLabel(magasin: Magasin) {
  const code = magasin.code || `MAG-${magasin.idMagasin}`;
  const libelle = magasin.libelle || 'Sans libellé';

  return `${code} — ${libelle}`;
}

function getLineTotal(line: EntreeLineForm) {
  const quantite = Number(line.quantite || 0);
  const prixUnitaire = Number(line.prixUnitaire || 0);

  return quantite * prixUnitaire;
}

function normalizeQuantity(value: string) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 1) return 1;

  return Math.floor(quantity);
}

function syncMaterielsWithQuantity(
  materiels: MaterielLineForm[],
  quantity: number,
) {
  const next = [...materiels];

  while (next.length < quantity) {
    next.push(createEmptyMateriel());
  }

  while (next.length > quantity) {
    next.pop();
  }

  return next;
}

export default function NouvelleEntreeStockPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);

  const [emplacementsByMagasin, setEmplacementsByMagasin] = useState<
    Record<number, EmplacementMagasin[]>
  >({});

  const [dateReception, setDateReception] = useState(getTodayInputDate());
  const [commentaire, setCommentaire] = useState('');
  const [lines, setLines] = useState<EntreeLineForm[]>([createEmptyLine()]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadReferentiels = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [articlesData, magasinsData] = await Promise.all([
        getArticles(),
        getMagasins(),
      ]);

      setArticles(articlesData);
      setMagasins(magasinsData.filter((magasin) => magasin.actif !== false));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des référentiels.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferentiels();
  }, [loadReferentiels]);

  const articleOptions = useMemo(() => {
    return articles
      .filter((article) => article.actif !== false && article.gereEnStock)
      .map((article) => ({
        value: String(article.idArticle),
        label: buildArticleLabel(article),
      }));
  }, [articles]);

  const magasinOptions = useMemo(() => {
    return magasins.map((magasin) => ({
      value: String(magasin.idMagasin),
      label: buildMagasinLabel(magasin),
    }));
  }, [magasins]);

  const totalQuantite = lines.reduce(
    (total, line) => total + normalizeQuantity(line.quantite),
    0,
  );

  const totalMontant = lines.reduce(
    (total, line) => total + getLineTotal(line),
    0,
  );

  const totalMateriels = lines.reduce(
    (total, line) => total + line.materiels.length,
    0,
  );

  function getArticleById(id?: string) {
    if (!id) return null;

    return articles.find((article) => article.idArticle === Number(id)) ?? null;
  }

  function isArticleSerialise(id?: string) {
    const article = getArticleById(id);

    return Boolean(article?.serialise);
  }

  async function ensureEmplacements(idMagasin?: number | null) {
    if (!idMagasin || Number.isNaN(idMagasin)) return;

    if (emplacementsByMagasin[idMagasin]) return;

    const data = await getEmplacementsByMagasin(idMagasin);

    setEmplacementsByMagasin((prev) => ({
      ...prev,
      [idMagasin]: data,
    }));
  }

  function getEmplacementOptions(magasinId?: string) {
    const idMagasin = Number(magasinId);
    const emplacements = emplacementsByMagasin[idMagasin] ?? [];

    return [
      { value: 'none', label: 'Aucun emplacement' },
      ...emplacements
        .filter((emplacement) => emplacement.actif !== false)
        .map((emplacement) => ({
          value: String(emplacement.idEmplacement),
          label:
            emplacement.code && emplacement.libelle
              ? `${emplacement.code} — ${emplacement.libelle}`
              : emplacement.code ||
                emplacement.libelle ||
                `Emplacement #${emplacement.idEmplacement}`,
        })),
    ];
  }

  function updateLine(id: string, patch: Partial<EntreeLineForm>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;

        const next: EntreeLineForm = {
          ...line,
          ...patch,
        };

        if (patch.magasinId !== undefined) {
          next.emplacementId = 'none';
          ensureEmplacements(Number(patch.magasinId));
        }

        if (patch.articleId !== undefined) {
          const serialise = isArticleSerialise(patch.articleId);
          const quantity = normalizeQuantity(next.quantite);

          next.materiels = serialise
            ? syncMaterielsWithQuantity(next.materiels, quantity)
            : [];
        }

        if (patch.quantite !== undefined) {
          const quantity = normalizeQuantity(patch.quantite);

          next.quantite = String(quantity);

          if (isArticleSerialise(next.articleId)) {
            next.materiels = syncMaterielsWithQuantity(next.materiels, quantity);
          }
        }

        return next;
      }),
    );
  }

  function updateMateriel(
    lineId: string,
    index: number,
    patch: Partial<MaterielLineForm>,
  ) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;

        return {
          ...line,
          materiels: line.materiels.map((materiel, materielIndex) => {
            if (materielIndex !== index) return materiel;

            return {
              ...materiel,
              ...patch,
            };
          }),
        };
      }),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, createEmptyLine()]);
  }

  function removeLine(id: string) {
    setLines((prev) => {
      if (prev.length === 1) return prev;

      return prev.filter((line) => line.id !== id);
    });
  }

  function validateForm() {
    if (!dateReception) {
      return 'La date de réception est obligatoire.';
    }

    if (lines.length === 0) {
      return 'Ajoutez au moins une ligne d’entrée.';
    }

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const lineNumber = index + 1;

      if (!line.articleId) {
        return `Ligne ${lineNumber} : veuillez sélectionner un article.`;
      }

      if (!line.magasinId) {
        return `Ligne ${lineNumber} : veuillez sélectionner un magasin.`;
      }

      const quantity = normalizeQuantity(line.quantite);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return `Ligne ${lineNumber} : la quantité doit être supérieure à 0.`;
      }

      if (isArticleSerialise(line.articleId)) {
        if (line.materiels.length !== quantity) {
          return `Ligne ${lineNumber} : le nombre de matériels doit correspondre à la quantité.`;
        }

        for (let materielIndex = 0; materielIndex < line.materiels.length; materielIndex += 1) {
          const materiel = line.materiels[materielIndex];

          if (!materiel.code.trim()) {
            return `Ligne ${lineNumber} : le code matériel ${materielIndex + 1} est obligatoire.`;
          }
        }
      }
    }

    return '';
  }

  function buildPayloadLine(line: EntreeLineForm): LigneStockEntreeDto {
    const serialise = isArticleSerialise(line.articleId);

    const payload: LigneStockEntreeDto = {
      idArticle: Number(line.articleId),
      idMagasin: Number(line.magasinId),
      quantite: normalizeQuantity(line.quantite),
      commentaire: line.commentaire.trim() || undefined,
    };

    if (line.emplacementId && line.emplacementId !== 'none') {
      payload.idEmplacement = Number(line.emplacementId);
    }

    if (line.prixUnitaire !== '') {
      payload.prixUnitaire = Number(line.prixUnitaire);
    }

    if (line.numeroLot.trim()) {
      payload.numeroLot = line.numeroLot.trim();
    }

    if (line.datePeremption) {
      payload.datePeremption = line.datePeremption;
    }

    if (serialise) {
      payload.materiels = line.materiels.map<MaterielReceptionDto>(
        (materiel) => ({
          code: materiel.code.trim(),
          numeroSerie: materiel.numeroSerie.trim() || undefined,
        }),
      );
    }

    return payload;
  }

  async function handleSubmit() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccessMessage('');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const payload: CreateStockEntreeDto = {
        dateReception,
        commentaire: commentaire.trim() || undefined,
        lignes: lines.map(buildPayloadLine),
      };

      const created = await createStockEntree(payload);

      setSuccessMessage('Bon d’entrée créé avec succès.');

      router.push(`/stock/entrees/${created.idEntreeStock}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du bon d’entrée.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1280px] space-y-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
            {successMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <PackagePlus size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Bon d’entrée stock
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight">
                    Nouvelle entrée stock
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Créez un bon d’entrée et ajoutez les matériels sérialisés si nécessaire.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} className={submitting ? 'animate-pulse' : ''} />
                Enregistrer l’entrée
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <SectionTitle title="Généralités" />

            <div className="mt-3 rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date réception *">
                  <input
                    type="date"
                    value={dateReception}
                    onChange={(event) => setDateReception(event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Commentaire général">
                  <input
                    type="text"
                    value={commentaire}
                    onChange={(event) => setCommentaire(event.target.value)}
                    placeholder="Exemple : réception fournisseur"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <MiniSummary label="Lignes" value={String(lines.length)} />
                <MiniSummary label="Quantité totale" value={String(totalQuantite)} />
                <MiniSummary label="Matériels" value={String(totalMateriels)} />
                <MiniSummary label="Montant estimé" value={formatMoney(totalMontant)} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              title="Lignes d’entrée"
              subtitle="Ajoutez les articles reçus. Pour un article sérialisé, renseignez un code matériel pour chaque unité."
            />

            <button
              type="button"
              onClick={addLine}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
            >
              <Plus size={17} />
              Ajouter une ligne
            </button>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <RefreshCcw size={24} className="animate-spin" />
              </div>

              <p className="mt-4 text-sm font-black text-slate-500">
                Chargement du formulaire d’entrée...
              </p>
            </div>
          ) : (
            lines.map((line, index) => {
              const serialise = isArticleSerialise(line.articleId);
              const emplacementOptions = getEmplacementOptions(line.magasinId);

              return (
                <article
                  key={line.id}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                          <Layers3 size={22} />
                        </div>

                        <div>
                          <h3 className="text-2xl font-black leading-tight text-slate-950">
                            Ligne {index + 1}
                          </h3>

                          <p className="mt-1 text-sm font-black text-slate-500">
                            Total ligne : {formatMoney(getLineTotal(line))}
                          </p>

                          {serialise && (
                            <p className="mt-1 text-sm font-black text-orange-600">
                              Article sérialisé · {line.materiels.length} matériel(s) à créer
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length === 1}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid gap-4 xl:grid-cols-12">
                      <div className="xl:col-span-4">
                        <Field label="Article *">
                          <Select
                            value={line.articleId}
                            onValueChange={(value) =>
                              updateLine(line.id, { articleId: value })
                            }
                            placeholder="Sélectionner un article"
                            items={articleOptions}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-4">
                        <Field label="Magasin *">
                          <Select
                            value={line.magasinId}
                            onValueChange={(value) =>
                              updateLine(line.id, { magasinId: value })
                            }
                            placeholder="Sélectionner un magasin"
                            items={magasinOptions}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-2">
                        <Field label="Qté *">
                          <input
                            type="number"
                            min="1"
                            value={line.quantite}
                            onChange={(event) =>
                              updateLine(line.id, {
                                quantite: event.target.value,
                              })
                            }
                            className={inputClassName}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-2">
                        <Field label="Prix unitaire">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.prixUnitaire}
                            onChange={(event) =>
                              updateLine(line.id, {
                                prixUnitaire: event.target.value,
                              })
                            }
                            placeholder="Prix"
                            className={inputClassName}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-3">
                        <Field label="Lot">
                          <input
                            type="text"
                            value={line.numeroLot}
                            onChange={(event) =>
                              updateLine(line.id, {
                                numeroLot: event.target.value,
                              })
                            }
                            placeholder="Exemple : LOT-H60-2026"
                            className={inputClassName}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-3">
                        <Field label="Péremption">
                          <input
                            type="date"
                            value={line.datePeremption}
                            onChange={(event) =>
                              updateLine(line.id, {
                                datePeremption: event.target.value,
                              })
                            }
                            className={inputClassName}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-3">
                        <Field label="Emplacement">
                          <Select
                            value={line.emplacementId}
                            onValueChange={(value) =>
                              updateLine(line.id, { emplacementId: value })
                            }
                            placeholder="Choisir un emplacement"
                            items={emplacementOptions}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-3">
                        <Field label="Commentaire ligne">
                          <input
                            type="text"
                            value={line.commentaire}
                            onChange={(event) =>
                              updateLine(line.id, {
                                commentaire: event.target.value,
                              })
                            }
                            placeholder="Commentaire"
                            className={inputClassName}
                          />
                        </Field>
                      </div>
                    </div>

                    {serialise && (
                      <div className="mt-5 rounded-[24px] border border-blue-100 bg-blue-50/50 p-4">
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700">
                            <Boxes size={20} />
                          </div>

                          <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#06475a]">
                              Matériels sérialisés
                            </h4>

                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              Pour cet article, la quantité doit correspondre au nombre de matériels saisis.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {line.materiels.map((materiel, materielIndex) => (
                            <div
                              key={`${line.id}-${materielIndex}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                              <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                  label={`Code matériel ${materielIndex + 1} *`}
                                >
                                  <input
                                    type="text"
                                    value={materiel.code}
                                    onChange={(event) =>
                                      updateMateriel(line.id, materielIndex, {
                                        code: event.target.value,
                                      })
                                    }
                                    placeholder="Exemple : MAT-GE-001"
                                    className={inputClassName}
                                  />
                                </Field>

                                <Field label="Numéro de série">
                                  <input
                                    type="text"
                                    value={materiel.numeroSerie}
                                    onChange={(event) =>
                                      updateMateriel(line.id, materielIndex, {
                                        numeroSerie: event.target.value,
                                      })
                                    }
                                    placeholder="Exemple : SN-GE-001"
                                    className={inputClassName}
                                  />
                                </Field>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#06475a] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#043747] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} className={submitting ? 'animate-pulse' : ''} />
            Enregistrer l’entrée
          </button>
        </div>
      </section>
    </main>
  );
}

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#06475a] focus:ring-4 focus:ring-[#06475a]/10';

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#06475a]" />

        <h2 className="text-base font-black uppercase tracking-[0.18em] text-slate-500">
          {title}
        </h2>
      </div>

      {subtitle && (
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </span>

      {children}
    </label>
  );
}

function MiniSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}