'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Layers3,
  PackageMinus,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from 'lucide-react';

import { Select } from '@/components/select';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/articles/services/article-referentiel.service';
import type { Article, Magasin } from '@/features/articles/types/article';

import { getMateriels } from '@/features/materiels/services/materiel.service';
import type { Materiel } from '@/features/materiels/types/materiel';

import { createStockSortie } from '@/features/stock-sorties/services/stock-sortie.service';
import type {
  CreateStockSortieDto,
  LigneSortieStockCrudDto,
} from '@/features/stock-sorties/types/stock-sortie';

type EmplacementMagasin = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

type SortieLineForm = {
  id: string;
  articleId: string;
  magasinId: string;
  emplacementId: string;
  materielId: string;
  quantite: string;
  prixUnitaire: string;
  commentaire: string;
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

function createEmptyLine(): SortieLineForm {
  return {
    id: crypto.randomUUID(),
    articleId: '',
    magasinId: '',
    emplacementId: 'none',
    materielId: 'none',
    quantite: '1',
    prixUnitaire: '',
    commentaire: '',
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

function getLineTotal(line: SortieLineForm) {
  const quantite = Number(line.quantite || 0);
  const prixUnitaire = Number(line.prixUnitaire || 0);

  return quantite * prixUnitaire;
}

function getMaterielAny(materiel: Materiel) {
  return materiel as unknown as Record<string, any>;
}

function isMaterielLinkedToArticle(materiel: Materiel, article: Article) {
  const anyMateriel = getMaterielAny(materiel);
  const anyArticle = article as unknown as Record<string, any>;

  const modele =
    anyMateriel.modele ||
    anyMateriel.modeleEquipement ||
    anyMateriel.modele_equipement;

  const articleFromModele = modele?.article;

  return (
    anyMateriel.idArticle === article.idArticle ||
    modele?.idArticle === article.idArticle ||
    articleFromModele?.idArticle === article.idArticle ||
    (anyArticle.idModele && anyMateriel.idModele === anyArticle.idModele)
  );
}

function getMaterielMagasinId(materiel: Materiel): number | null {
  const anyMateriel = getMaterielAny(materiel);

  const ligneEntree =
    anyMateriel.ligneEntreeStock ||
    anyMateriel.entree_stock_ligne ||
    anyMateriel.ligne_entree_stock;

  const magasin =
    anyMateriel.magasin ||
    ligneEntree?.magasin ||
    ligneEntree?.magasinSource ||
    ligneEntree?.magasinDestination;

  return (
    anyMateriel.idMagasin ??
    ligneEntree?.idMagasin ??
    magasin?.idMagasin ??
    null
  );
}

function isMaterielDisponible(materiel: Materiel) {
  const anyMateriel = getMaterielAny(materiel);

  if (anyMateriel.actif === false) return false;

  const position = anyMateriel.positionActuelle;

  if (!position) return true;

  return position === 'EN_STOCK' || position === 'EN_RESERVE';
}

function getMaterielLabel(materiel: Materiel) {
  const anyMateriel = getMaterielAny(materiel);

  const code = anyMateriel.code || `MAT-${anyMateriel.idMateriel}`;
  const numeroSerie = anyMateriel.numeroSerie;

  if (numeroSerie) return `${code} — Série : ${numeroSerie}`;

  return code;
}

export default function NouvelleSortieStockPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);

  const [emplacementsByMagasin, setEmplacementsByMagasin] = useState<
    Record<number, EmplacementMagasin[]>
  >({});

  const [dateSortie, setDateSortie] = useState(getTodayInputDate());
  const [commentaire, setCommentaire] = useState('');
  const [lines, setLines] = useState<SortieLineForm[]>([createEmptyLine()]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadReferentiels = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [articlesData, magasinsData, materielsData] = await Promise.all([
        getArticles(),
        getMagasins(),
        getMateriels(),
      ]);

      setArticles(articlesData);
      setMagasins(magasinsData.filter((magasin) => magasin.actif !== false));
      setMateriels(materielsData);
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
    (total, line) => total + Number(line.quantite || 0),
    0,
  );

  const totalMontant = lines.reduce(
    (total, line) => total + getLineTotal(line),
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

  function getMaterielOptions(articleId?: string, magasinId?: string) {
    const article = getArticleById(articleId);
    const idMagasin = Number(magasinId);

    if (!article) {
      return [{ value: 'none', label: 'Sélectionner un matériel' }];
    }

    const selectedMaterielIds = new Set(
      lines
        .map((line) => line.materielId)
        .filter((value) => value && value !== 'none'),
    );

    const filteredMateriels = materiels.filter((materiel) => {
      const anyMateriel = getMaterielAny(materiel);
      const idMateriel = String(anyMateriel.idMateriel);

      const linked = isMaterielLinkedToArticle(materiel, article);
      const available = isMaterielDisponible(materiel);
      const materielMagasinId = getMaterielMagasinId(materiel);

      const matchesMagasin =
        !idMagasin || !materielMagasinId || materielMagasinId === idMagasin;

      const notAlreadySelected = !selectedMaterielIds.has(idMateriel);

      return linked && available && matchesMagasin && notAlreadySelected;
    });

    return [
      { value: 'none', label: 'Sélectionner un matériel' },
      ...filteredMateriels.map((materiel) => ({
        value: String(getMaterielAny(materiel).idMateriel),
        label: getMaterielLabel(materiel),
      })),
    ];
  }

  function updateLine(id: string, patch: Partial<SortieLineForm>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;

        const next: SortieLineForm = {
          ...line,
          ...patch,
        };

        if (patch.articleId !== undefined) {
          next.materielId = 'none';
        }

        if (patch.magasinId !== undefined) {
          next.emplacementId = 'none';
          next.materielId = 'none';
          ensureEmplacements(Number(patch.magasinId));
        }

        if (isArticleSerialise(next.articleId)) {
          next.quantite = '1';
        } else {
          next.materielId = 'none';
        }

        return next;
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
    if (!dateSortie) {
      return 'La date de sortie est obligatoire.';
    }

    if (lines.length === 0) {
      return 'Ajoutez au moins une ligne de sortie.';
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

      const quantite = Number(line.quantite);

      if (!Number.isFinite(quantite) || quantite <= 0) {
        return `Ligne ${lineNumber} : la quantité doit être supérieure à 0.`;
      }

      if (isArticleSerialise(line.articleId) && line.materielId === 'none') {
        return `Ligne ${lineNumber} : veuillez sélectionner le matériel sérialisé à sortir.`;
      }
    }

    return '';
  }

  function buildPayloadLine(line: SortieLineForm): LigneSortieStockCrudDto {
    const serialise = isArticleSerialise(line.articleId);

    const payload: LigneSortieStockCrudDto = {
      idArticle: Number(line.articleId),
      idMagasin: Number(line.magasinId),
      quantite: serialise ? 1 : Number(line.quantite),
      commentaire: line.commentaire.trim() || undefined,
    };

    if (line.emplacementId && line.emplacementId !== 'none') {
      payload.idEmplacement = Number(line.emplacementId);
    }

    if (line.prixUnitaire !== '') {
      payload.prixUnitaire = Number(line.prixUnitaire);
    }

    if (serialise && line.materielId !== 'none') {
      payload.idMateriel = Number(line.materielId);
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

      const payload: CreateStockSortieDto = {
        dateSortie,
        commentaire: commentaire.trim() || null,
        lignes: lines.map(buildPayloadLine),
      };

      const created = await createStockSortie(payload);

      setSuccessMessage('Bon de sortie créé avec succès.');

      router.push(`/stock/sorties/${created.idSortieStock}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la création du bon de sortie.',
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
                  <PackageMinus size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Bon de sortie stock
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight">
                    Nouvelle sortie stock
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Créez un bon de sortie et retirez les articles du stock.
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
                Enregistrer la sortie
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <SectionTitle title="Généralités" />

            <div className="mt-3 rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date sortie *">
                  <input
                    type="date"
                    value={dateSortie}
                    onChange={(event) => setDateSortie(event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Commentaire général">
                  <input
                    type="text"
                    value={commentaire}
                    onChange={(event) => setCommentaire(event.target.value)}
                    placeholder="Exemple : sortie pour intervention"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MiniSummary label="Lignes" value={String(lines.length)} />
                <MiniSummary label="Quantité totale" value={String(totalQuantite)} />
                <MiniSummary label="Montant estimé" value={formatMoney(totalMontant)} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              title="Lignes de sortie"
              subtitle="Ajoutez les articles à sortir. Pour un article sérialisé, sélectionnez le matériel existant."
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
                Chargement du formulaire de sortie...
              </p>
            </div>
          ) : (
            lines.map((line, index) => {
              const serialise = isArticleSerialise(line.articleId);
              const emplacementOptions = getEmplacementOptions(line.magasinId);
              const materielOptions = getMaterielOptions(
                line.articleId,
                line.magasinId,
              );

              return (
                <article
                  key={line.id}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
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
                              Article sérialisé · quantité fixée à 1
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
                              updateLine(line.id, {
                                articleId: value,
                              })
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
                              updateLine(line.id, {
                                magasinId: value,
                              })
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
                            disabled={serialise}
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

                      <div className="xl:col-span-4">
                        <Field label="Emplacement">
                          <Select
                            value={line.emplacementId}
                            onValueChange={(value) =>
                              updateLine(line.id, {
                                emplacementId: value,
                              })
                            }
                            placeholder="Choisir un emplacement"
                            items={emplacementOptions}
                          />
                        </Field>
                      </div>

                      <div className="xl:col-span-4">
                        <Field label="Matériel sérialisé">
                          {serialise ? (
                            <Select
                              value={line.materielId}
                              onValueChange={(value) =>
                                updateLine(line.id, {
                                  materielId: value,
                                })
                              }
                              placeholder="Sélectionner un matériel"
                              items={materielOptions}
                            />
                          ) : (
                            <input
                              disabled
                              value="Non concerné"
                              className={inputClassName}
                            />
                          )}
                        </Field>
                      </div>

                      <div className="xl:col-span-4">
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
            Enregistrer la sortie
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