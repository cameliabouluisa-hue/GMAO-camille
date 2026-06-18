'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  FileText,
  Plus,
  Save,
  Trash2,
  Warehouse,
} from 'lucide-react';

import { Select } from '@/components/select';

import {
  AppFieldGrid,
  AppFormField,
  AppSection,
  appInputClassName,
  appPrimaryButtonClassName,
  appSecondaryButtonClassName,
} from '@/components/app-section-layout';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/magasins/services/magasin.service';

import type {
  CreateStockEntreeDto,
  LigneStockEntreeDto,
} from '../types/stock-entree';

type ArticleOption = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  serialise?: boolean | null;
  gereEnStock?: boolean | null;
};

type MagasinOption = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

type MaterielForm = {
  code: string;
  numeroSerie: string;
};

type LigneForm = {
  idArticle: string;
  idMagasin: string;
  idEmplacement: string;
  quantite: string;
  prixUnitaire: string;
  numeroLot: string;
  datePeremption: string;
  commentaire: string;
  materiels: MaterielForm[];
};

type Props = {
  onSubmit: (data: CreateStockEntreeDto) => Promise<void> | void;
};

function todayInputDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createEmptyMateriel(): MaterielForm {
  return {
    code: '',
    numeroSerie: '',
  };
}

function createEmptyLigne(): LigneForm {
  return {
    idArticle: '',
    idMagasin: '',
    idEmplacement: '',
    quantite: '1',
    prixUnitaire: '',
    numeroLot: '',
    datePeremption: '',
    commentaire: '',
    materiels: [],
  };
}

function getQuantityInteger(value: string) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity <= 0) return 0;

  return Math.trunc(quantity);
}

function syncMaterielsLength(
  materiels: MaterielForm[],
  quantite: string,
): MaterielForm[] {
  const quantity = getQuantityInteger(quantite);

  if (quantity <= 0) return [];

  if (materiels.length === quantity) return materiels;

  if (materiels.length < quantity) {
    return [
      ...materiels,
      ...Array.from({ length: quantity - materiels.length }, () =>
        createEmptyMateriel(),
      ),
    ];
  }

  return materiels.slice(0, quantity);
}

function getArticleLabel(article: ArticleOption) {
  if (article.reference && article.designation) {
    return `${article.reference} — ${article.designation}`;
  }

  return (
    article.reference ||
    article.designation ||
    `Article #${article.idArticle}`
  );
}

function getMagasinLabel(magasin: MagasinOption) {
  if (magasin.code && magasin.libelle) {
    return `${magasin.code} — ${magasin.libelle}`;
  }

  return magasin.code || magasin.libelle || `Magasin #${magasin.idMagasin}`;
}

function isArticleSerialized(
  idArticle: string,
  articlesById: Map<number, ArticleOption>,
) {
  const id = Number(idArticle);

  if (!id) return false;

  return articlesById.get(id)?.serialise === true;
}

function normalizeLine(
  line: LigneForm,
  articlesById: Map<number, ArticleOption>,
): LigneForm {
  const serialized = isArticleSerialized(line.idArticle, articlesById);

  return {
    ...line,
    materiels: serialized
      ? syncMaterielsLength(line.materiels, line.quantite)
      : [],
  };
}

function buildLinePayload(
  line: LigneForm,
  serialized: boolean,
): LigneStockEntreeDto {
  return {
    idArticle: Number(line.idArticle),
    idMagasin: Number(line.idMagasin),
    idEmplacement: line.idEmplacement
      ? Number(line.idEmplacement)
      : undefined,
    quantite: Number(line.quantite),
    prixUnitaire: line.prixUnitaire.trim()
      ? Number(line.prixUnitaire)
      : undefined,
    numeroLot: line.numeroLot.trim() || undefined,
    datePeremption: line.datePeremption || undefined,
    commentaire: line.commentaire.trim() || undefined,
    materiels: serialized
      ? line.materiels.map((materiel) => ({
          code: materiel.code.trim(),
          numeroSerie: materiel.numeroSerie.trim() || undefined,
        }))
      : undefined,
  };
}

function validateLine(
  line: LigneForm,
  serialized: boolean,
  lineIndex: number,
) {
  const lineLabel = `Ligne ${lineIndex + 1}`;

  if (!line.idArticle) {
    return `${lineLabel} : veuillez sélectionner un article.`;
  }

  if (!line.idMagasin) {
    return `${lineLabel} : veuillez sélectionner un magasin.`;
  }

  const quantity = Number(line.quantite);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return `${lineLabel} : la quantité doit être supérieure à zéro.`;
  }

  if (serialized && !Number.isInteger(quantity)) {
    return `${lineLabel} : la quantité d’un article sérialisé doit être un nombre entier.`;
  }

  if (line.prixUnitaire.trim()) {
    const price = Number(line.prixUnitaire);

    if (!Number.isFinite(price) || price < 0) {
      return `${lineLabel} : le prix unitaire est invalide.`;
    }
  }

  if (serialized) {
    const quantityInteger = getQuantityInteger(line.quantite);

    if (line.materiels.length !== quantityInteger) {
      return `${lineLabel} : le nombre de matériels doit correspondre à la quantité.`;
    }

    for (let index = 0; index < line.materiels.length; index += 1) {
      const materiel = line.materiels[index];

      if (!materiel.code.trim()) {
        return `${lineLabel} : le code matériel ${index + 1} est obligatoire.`;
      }
    }

    const codes = line.materiels
      .map((materiel) => materiel.code.trim().toLowerCase())
      .filter(Boolean);

    if (new Set(codes).size !== codes.length) {
      return `${lineLabel} : les codes matériels doivent être uniques.`;
    }
  }

  return '';
}

export function StockEntreeForm({ onSubmit }: Props) {
  const [dateReception, setDateReception] = useState(todayInputDate());
  const [commentaire, setCommentaire] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([createEmptyLigne()]);

  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [magasins, setMagasins] = useState<MagasinOption[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const articlesById = useMemo(() => {
    return new Map(articles.map((article) => [article.idArticle, article]));
  }, [articles]);

  const articleItems = useMemo(() => {
    return [
      { label: 'Sélectionner un article', value: 'NONE_ARTICLE' },
      ...articles
        .filter((article) => article.gereEnStock !== false)
        .map((article) => ({
          label: getArticleLabel(article),
          value: String(article.idArticle),
        })),
    ];
  }, [articles]);

  const magasinItems = useMemo(() => {
    return [
      { label: 'Sélectionner un magasin', value: 'NONE_MAGASIN' },
      ...magasins
        .filter((magasin) => magasin.actif !== false)
        .map((magasin) => ({
          label: getMagasinLabel(magasin),
          value: String(magasin.idMagasin),
        })),
    ];
  }, [magasins]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        setError('');

        const [articlesData, magasinsData] = await Promise.all([
          getArticles(),
          getMagasins(),
        ]);

        setArticles(articlesData as unknown as ArticleOption[]);
        setMagasins(magasinsData as unknown as MagasinOption[]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des articles ou des magasins.',
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function updateLine<K extends keyof LigneForm>(
    index: number,
    key: K,
    value: LigneForm[K],
  ) {
    setLignes((prev) =>
      prev.map((line, lineIndex) => {
        if (lineIndex !== index) return line;

        const nextLine = normalizeLine(
          {
            ...line,
            [key]: value,
          },
          articlesById,
        );

        return nextLine;
      }),
    );
  }

  function updateMateriel(
    lineIndex: number,
    materielIndex: number,
    key: keyof MaterielForm,
    value: string,
  ) {
    setLignes((prev) =>
      prev.map((line, index) => {
        if (index !== lineIndex) return line;

        return {
          ...line,
          materiels: line.materiels.map((materiel, currentIndex) =>
            currentIndex === materielIndex
              ? {
                  ...materiel,
                  [key]: value,
                }
              : materiel,
          ),
        };
      }),
    );
  }

  function addLine() {
    setLignes((prev) => [...prev, createEmptyLigne()]);
  }

  function removeLine(index: number) {
    setLignes((prev) => {
      if (prev.length === 1) return prev;

      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    for (let index = 0; index < lignes.length; index += 1) {
      const line = lignes[index];
      const serialized = isArticleSerialized(line.idArticle, articlesById);
      const validationError = validateLine(line, serialized, index);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');

      const payload: CreateStockEntreeDto = {
        dateReception: dateReception || undefined,
        commentaire: commentaire.trim() || undefined,
        lignes: lignes.map((line) =>
          buildLinePayload(
            line,
            isArticleSerialized(line.idArticle, articlesById),
          ),
        ),
      };

      await onSubmit(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de l'entrée stock.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = loadingData || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#06475a] to-[#0b5d73] px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <FileText size={29} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                Bon d’entrée stock
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight">
                Nouvelle entrée stock
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/75">
                Enregistrez un bon d’entrée avec une ou plusieurs lignes
                d’articles.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <AppSection title="Généralités">
            <AppFieldGrid>
              <AppFormField label="Date de réception" required>
                <input
                  type="date"
                  value={dateReception}
                  onChange={(event) => setDateReception(event.target.value)}
                  className={appInputClassName}
                />
              </AppFormField>

              <AppFormField label="Commentaire général">
                <input
                  value={commentaire}
                  onChange={(event) => setCommentaire(event.target.value)}
                  className={appInputClassName}
                  placeholder="Ex : Réception fournisseur"
                />
              </AppFormField>
            </AppFieldGrid>
          </AppSection>

          <AppSection title="Lignes d’entrée">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Articles réceptionnés
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Pour un article sérialisé, chaque unité doit avoir son code
                  matériel.
                </p>
              </div>

              <button
                type="button"
                onClick={addLine}
                disabled={disabled}
                className={appSecondaryButtonClassName}
              >
                <Plus size={17} />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-5">
              {lignes.map((line, index) => {
                const serialized = isArticleSerialized(
                  line.idArticle,
                  articlesById,
                );

                return (
                  <LineCard
                    key={index}
                    index={index}
                    line={line}
                    serialized={serialized}
                    canRemove={lignes.length > 1}
                    articleItems={articleItems}
                    magasinItems={magasinItems}
                    disabled={disabled}
                    onChange={(key, value) => updateLine(index, key, value)}
                    onMaterielChange={(materielIndex, key, value) =>
                      updateMateriel(index, materielIndex, key, value)
                    }
                    onRemove={() => removeLine(index)}
                  />
                );
              })}
            </div>
          </AppSection>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={disabled}
              className={appPrimaryButtonClassName}
            >
              <Save size={17} />
              {submitting ? 'Enregistrement...' : "Enregistrer l'entrée"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function LineCard({
  index,
  line,
  serialized,
  canRemove,
  articleItems,
  magasinItems,
  disabled,
  onChange,
  onMaterielChange,
  onRemove,
}: {
  index: number;
  line: LigneForm;
  serialized: boolean;
  canRemove: boolean;
  articleItems: { label: string; value: string }[];
  magasinItems: { label: string; value: string }[];
  disabled: boolean;
  onChange: <K extends keyof LigneForm>(key: K, value: LigneForm[K]) => void;
  onMaterielChange: (
    materielIndex: number,
    key: keyof MaterielForm,
    value: string,
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-950">
            Ligne {index + 1}
          </h3>

          {serialized && (
            <p className="mt-1 text-sm font-black text-orange-600">
              Article sérialisé
            </p>
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            title="Supprimer la ligne"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <AppFieldGrid>
        <AppFormField label="Article" required>
          <Select
            value={line.idArticle || 'NONE_ARTICLE'}
            onValueChange={(value) =>
              onChange('idArticle', value === 'NONE_ARTICLE' ? '' : value)
            }
            items={articleItems}
          />
        </AppFormField>

        <AppFormField label="Magasin" required>
          <Select
            value={line.idMagasin || 'NONE_MAGASIN'}
            onValueChange={(value) =>
              onChange('idMagasin', value === 'NONE_MAGASIN' ? '' : value)
            }
            items={magasinItems}
          />
        </AppFormField>

        <AppFormField label="Quantité" required>
          <input
            type="number"
            min="1"
            step={serialized ? '1' : '0.01'}
            value={line.quantite}
            onChange={(event) => onChange('quantite', event.target.value)}
            className={appInputClassName}
          />
        </AppFormField>

        <AppFormField label="Prix unitaire">
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.prixUnitaire}
            onChange={(event) => onChange('prixUnitaire', event.target.value)}
            className={appInputClassName}
            placeholder="Ex : 250000"
          />
        </AppFormField>

        <AppFormField label="N° lot">
          <input
            value={line.numeroLot}
            onChange={(event) => onChange('numeroLot', event.target.value)}
            className={appInputClassName}
            placeholder="Ex : LOT-H60-2026"
          />
        </AppFormField>

        <AppFormField label="Date de péremption">
          <input
            type="date"
            value={line.datePeremption}
            onChange={(event) =>
              onChange('datePeremption', event.target.value)
            }
            className={appInputClassName}
          />
        </AppFormField>

        <AppFormField label="Emplacement">
          <input
            type="number"
            min="1"
            value={line.idEmplacement}
            onChange={(event) => onChange('idEmplacement', event.target.value)}
            className={appInputClassName}
            placeholder="Optionnel : ID emplacement"
          />
        </AppFormField>

        <AppFormField label="Commentaire ligne">
          <input
            value={line.commentaire}
            onChange={(event) => onChange('commentaire', event.target.value)}
            className={appInputClassName}
            placeholder="Commentaire spécifique à cette ligne"
          />
        </AppFormField>
      </AppFieldGrid>

      {serialized && (
        <div className="mt-5 rounded-[22px] border border-blue-100 bg-blue-50/40 p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#06475a]">
              <Warehouse size={19} />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-950">
                Matériels générés
              </h4>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Pour cet article, la quantité doit correspondre au nombre de
                matériels saisis.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {line.materiels.map((materiel, materielIndex) => (
              <div
                key={materielIndex}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <AppFieldGrid>
                  <AppFormField
                    label={`Code matériel ${materielIndex + 1}`}
                    required
                  >
                    <input
                      value={materiel.code}
                      onChange={(event) =>
                        onMaterielChange(
                          materielIndex,
                          'code',
                          event.target.value,
                        )
                      }
                      className={appInputClassName}
                      placeholder="Ex : MAT-GE-001"
                    />
                  </AppFormField>

                  <AppFormField label="Numéro de série">
                    <input
                      value={materiel.numeroSerie}
                      onChange={(event) =>
                        onMaterielChange(
                          materielIndex,
                          'numeroSerie',
                          event.target.value,
                        )
                      }
                      className={appInputClassName}
                      placeholder="Ex : SN-GE-001"
                    />
                  </AppFormField>
                </AppFieldGrid>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}