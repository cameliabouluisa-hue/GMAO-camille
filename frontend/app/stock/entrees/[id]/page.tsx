'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  Download,
  Layers3,
  Package,
  RefreshCcw,
  Save,
  Trash2,
  Warehouse,
} from 'lucide-react';

import { Select } from '@/components/select';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/articles/services/article-referentiel.service';
import type { Article, Magasin } from '@/features/articles/types/article';

import {
  addStockEntreeLigne,
  deleteStockEntreeLigne,
  getStockEntreeById,
  updateStockEntree,
  updateStockEntreeLigne,
} from '@/features/stock-entrees/services/stock-entree.service';

import type {
  LigneStockEntreeDto,
  MaterielReceptionDto,
  StockEntree,
  StockEntreeLigne,
} from '@/features/stock-entrees/types/stock-entree';

type EmplacementMagasin = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

type EditableMateriel = {
  code: string;
  numeroSerie: string;
};

type EditableLine = {
  articleId: string;
  magasinId: string;
  emplacementId: string;
  quantite: string;
  prixUnitaire: string;
  numeroLot: string;
  datePeremption: string;
  commentaire: string;
  materiels: EditableMateriel[];
};

const API_BASE_URL = 'http://localhost:3001';

async function getEmplacementsByMagasin(
  idMagasin: number,
): Promise<EmplacementMagasin[]> {
  const res = await fetch(`${API_BASE_URL}/magasins/${idMagasin}/emplacements`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

function toInputDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.length >= 10 ? value.slice(0, 10) : '';
  }

  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('fr-FR');
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

function formatMoneyPdf(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '—';

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  const formatted = amount
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${formatted} DA`;
}

function cleanText(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—';

  return String(value).replace(/\s+/g, ' ').trim();
}

function getStatusLabel(statut?: string | null) {
  if (statut === 'VALIDEE') return 'Validée';
  if (statut === 'BROUILLON') return 'Brouillon';
  if (statut === 'ANNULEE') return 'Annulée';

  return statut || '—';
}

function getStatusClasses(statut?: string | null) {
  if (statut === 'VALIDEE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (statut === 'BROUILLON') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (statut === 'ANNULEE') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

function buildArticleLabel(article: Partial<Article> | null | undefined) {
  if (!article) return '—';

  const reference = article.reference || 'ART';
  const designation = article.designation || 'Sans désignation';

  return `${reference} — ${designation}`;
}

function buildMagasinLabel(magasin: Partial<Magasin> | null | undefined) {
  if (!magasin) return '—';

  const code = magasin.code || 'MAG';
  const libelle = magasin.libelle || 'Sans libellé';

  return `${code} — ${libelle}`;
}

function syncMateriels(
  current: EditableMateriel[],
  quantite: number,
): EditableMateriel[] {
  const size = Math.max(0, Math.floor(quantite || 0));
  const next = [...current];

  while (next.length < size) {
    next.push({
      code: '',
      numeroSerie: '',
    });
  }

  return next.slice(0, size);
}

function makeDraftFromLine(ligne: StockEntreeLigne): EditableLine {
  const quantite = Number(ligne.quantite ?? 0);

  return {
    articleId: String(ligne.idArticle ?? ''),
    magasinId: String(ligne.idMagasin ?? ''),
    emplacementId:
      ligne.idEmplacement !== null && ligne.idEmplacement !== undefined
        ? String(ligne.idEmplacement)
        : 'none',
    quantite: quantite > 0 ? String(quantite) : '1',
    prixUnitaire:
      ligne.prixUnitaire !== null && ligne.prixUnitaire !== undefined
        ? String(Number(ligne.prixUnitaire))
        : '',
    numeroLot: ligne.numeroLot ?? '',
    datePeremption: toInputDate(ligne.datePeremption),
    commentaire: ligne.commentaire ?? '',
    materiels:
      ligne.materiels?.map((materiel) => ({
        code: materiel.code ?? '',
        numeroSerie: materiel.numeroSerie ?? '',
      })) ?? [],
  };
}

function getLineTotal(draft: EditableLine) {
  const quantite = Number(draft.quantite || 0);
  const prixUnitaire = Number(draft.prixUnitaire || 0);

  return quantite * prixUnitaire;
}

export default function DetailBonEntreePage() {
  const router = useRouter();
  const params = useParams();

  const idEntree = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    return Number(value);
  }, [params]);

  const [entree, setEntree] = useState<StockEntree | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [emplacementsByMagasin, setEmplacementsByMagasin] = useState<
    Record<number, EmplacementMagasin[]>
  >({});

  const [headerForm, setHeaderForm] = useState({
    dateReception: '',
    commentaire: '',
  });

  const [lineDrafts, setLineDrafts] = useState<Record<number, EditableLine>>({});

  const [newLine, setNewLine] = useState<EditableLine>({
    articleId: '',
    magasinId: '',
    emplacementId: 'none',
    quantite: '1',
    prixUnitaire: '',
    numeroLot: '',
    datePeremption: '',
    commentaire: '',
    materiels: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingLineId, setSavingLineId] = useState<number | null>(null);
  const [addingLine, setAddingLine] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState('');

  const totalLignes = entree?.lignes?.length ?? 0;

  const totalQuantite =
    entree?.lignes?.reduce(
      (sum, ligne) => sum + Number(ligne.quantite ?? 0),
      0,
    ) ?? 0;

  const totalMateriels =
    entree?.lignes?.reduce(
      (sum, ligne) => sum + (ligne.materiels?.length ?? 0),
      0,
    ) ?? 0;

  const articleOptions = articles.map((article) => ({
    value: String(article.idArticle),
    label: buildArticleLabel(article),
  }));

  const magasinOptions = magasins.map((magasin) => ({
    value: String(magasin.idMagasin),
    label: buildMagasinLabel(magasin),
  }));

  const ensureEmplacements = useCallback(
    async (idMagasin?: number | null) => {
      if (!idMagasin || Number.isNaN(idMagasin)) return;

      if (emplacementsByMagasin[idMagasin]) return;

      const data = await getEmplacementsByMagasin(idMagasin);

      setEmplacementsByMagasin((prev) => ({
        ...prev,
        [idMagasin]: data,
      }));
    },
    [emplacementsByMagasin],
  );

  const loadData = useCallback(
    async (silent = false) => {
      if (!Number.isFinite(idEntree) || idEntree <= 0) {
        setError("Identifiant du bon d'entrée invalide.");
        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const [entreeData, articlesData, magasinsData] = await Promise.all([
          getStockEntreeById(idEntree),
          getArticles(),
          getMagasins(),
        ]);

        setEntree(entreeData);
        setArticles(articlesData);
        setMagasins(magasinsData);

        setHeaderForm({
          dateReception: toInputDate(entreeData.dateReception),
          commentaire: entreeData.commentaire ?? '',
        });

        const drafts: Record<number, EditableLine> = {};
        const idsMagasins = new Set<number>();

        for (const ligne of entreeData.lignes ?? []) {
          drafts[ligne.idLigneEntreeStock] = makeDraftFromLine(ligne);

          if (ligne.idMagasin) {
            idsMagasins.add(ligne.idMagasin);
          }
        }

        setLineDrafts(drafts);

        const emplacementsEntries = await Promise.all(
          Array.from(idsMagasins).map(async (idMagasin) => {
            const data = await getEmplacementsByMagasin(idMagasin);
            return [idMagasin, data] as const;
          }),
        );

        setEmplacementsByMagasin((prev) => ({
          ...prev,
          ...Object.fromEntries(emplacementsEntries),
        }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du bon d'entrée.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idEntree],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getArticleById(id?: string) {
    if (!id) return null;

    return articles.find((article) => article.idArticle === Number(id)) ?? null;
  }

  function isArticleSerialise(id?: string) {
    const article = getArticleById(id);

    return Boolean(article?.serialise);
  }

  function getEmplacementOptions(magasinId?: string) {
    const idMagasin = Number(magasinId);
    const items = emplacementsByMagasin[idMagasin] ?? [];

    return [
      { value: 'none', label: 'Aucun emplacement' },
      ...items
        .filter((item) => item.actif !== false)
        .map((item) => ({
          value: String(item.idEmplacement),
          label:
            item.code && item.libelle
              ? `${item.code} — ${item.libelle}`
              : item.code ||
                item.libelle ||
                `Emplacement #${item.idEmplacement}`,
        })),
    ];
  }

  function updateDraftLine(idLigne: number, patch: Partial<EditableLine>) {
    setLineDrafts((prev) => {
      const current = prev[idLigne];

      if (!current) return prev;

      const next: EditableLine = {
        ...current,
        ...patch,
      };

      if (patch.magasinId !== undefined) {
        next.emplacementId = 'none';
        ensureEmplacements(Number(patch.magasinId));
      }

      const articleSerialise = isArticleSerialise(next.articleId);
      const quantite = Number(next.quantite || 0);

      if (articleSerialise) {
        next.materiels = syncMateriels(next.materiels, quantite);
      } else {
        next.materiels = [];
      }

      return {
        ...prev,
        [idLigne]: next,
      };
    });
  }

  function updateNewLine(patch: Partial<EditableLine>) {
    setNewLine((prev) => {
      const next: EditableLine = {
        ...prev,
        ...patch,
      };

      if (patch.magasinId !== undefined) {
        next.emplacementId = 'none';
        ensureEmplacements(Number(patch.magasinId));
      }

      const articleSerialise = isArticleSerialise(next.articleId);
      const quantite = Number(next.quantite || 0);

      if (articleSerialise) {
        next.materiels = syncMateriels(next.materiels, quantite);
      } else {
        next.materiels = [];
      }

      return next;
    });
  }

  function updateExistingMateriel(
    idLigne: number,
    index: number,
    field: keyof EditableMateriel,
    value: string,
  ) {
    setLineDrafts((prev) => {
      const current = prev[idLigne];

      if (!current) return prev;

      const materiels = [...current.materiels];
      const item = materiels[index] ?? {
        code: '',
        numeroSerie: '',
      };

      materiels[index] = {
        ...item,
        [field]: value,
      };

      return {
        ...prev,
        [idLigne]: {
          ...current,
          materiels,
        },
      };
    });
  }

  function updateNewMateriel(
    index: number,
    field: keyof EditableMateriel,
    value: string,
  ) {
    setNewLine((prev) => {
      const materiels = [...prev.materiels];
      const item = materiels[index] ?? {
        code: '',
        numeroSerie: '',
      };

      materiels[index] = {
        ...item,
        [field]: value,
      };

      return {
        ...prev,
        materiels,
      };
    });
  }

  function buildPayloadFromDraft(draft: EditableLine): LigneStockEntreeDto {
    const payload: LigneStockEntreeDto = {
      idArticle: Number(draft.articleId),
      idMagasin: Number(draft.magasinId),
      quantite: Number(draft.quantite),
      commentaire: draft.commentaire.trim() || undefined,
    };

    if (draft.emplacementId && draft.emplacementId !== 'none') {
      payload.idEmplacement = Number(draft.emplacementId);
    }

    if (draft.prixUnitaire !== '') {
      payload.prixUnitaire = Number(draft.prixUnitaire);
    }

    if (draft.numeroLot.trim()) {
      payload.numeroLot = draft.numeroLot.trim();
    }

    if (draft.datePeremption.trim()) {
      payload.datePeremption = draft.datePeremption;
    }

    if (isArticleSerialise(draft.articleId)) {
      payload.materiels = draft.materiels.map<MaterielReceptionDto>(
        (materiel) => ({
          code: materiel.code.trim(),
          numeroSerie: materiel.numeroSerie.trim() || undefined,
        }),
      );
    }

    return payload;
  }

  async function handleSaveHeader() {
    if (!entree) return;

    try {
      setSavingHeader(true);
      setError('');

      await updateStockEntree(entree.idEntreeStock, {
        dateReception: headerForm.dateReception || undefined,
        commentaire: headerForm.commentaire || undefined,
      });

      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du bon.",
      );
    } finally {
      setSavingHeader(false);
    }
  }

  async function handleSaveLine(idLigne: number) {
    const draft = lineDrafts[idLigne];

    if (!draft || !entree) return;

    try {
      setSavingLineId(idLigne);
      setError('');

      await updateStockEntreeLigne(
        entree.idEntreeStock,
        idLigne,
        buildPayloadFromDraft(draft),
      );

      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la modification de la ligne.',
      );
    } finally {
      setSavingLineId(null);
    }
  }

  async function handleDeleteLine(idLigne: number) {
    if (!entree) return;

    try {
      setError('');

      await deleteStockEntreeLigne(entree.idEntreeStock, idLigne);
      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression de la ligne.',
      );
    }
  }

  async function handleAddLine() {
    if (!entree) return;

    try {
      setAddingLine(true);
      setError('');

      await addStockEntreeLigne(
        entree.idEntreeStock,
        buildPayloadFromDraft(newLine),
      );

      setNewLine({
        articleId: '',
        magasinId: '',
        emplacementId: 'none',
        quantite: '1',
        prixUnitaire: '',
        numeroLot: '',
        datePeremption: '',
        commentaire: '',
        materiels: [],
      });

      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout de la ligne.",
      );
    } finally {
      setAddingLine(false);
    }
  }

  async function handleExportPdf() {
    if (!entree) return;

    try {
      setExportingPdf(true);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const primary: [number, number, number] = [6, 71, 90];
      const textDark: [number, number, number] = [15, 23, 42];
      const textMuted: [number, number, number] = [100, 116, 139];
      const border: [number, number, number] = [226, 232, 240];
      const soft: [number, number, number] = [248, 250, 252];

      pdf.setFillColor(...primary);
      pdf.rect(0, 0, pageWidth, 86, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('GMAO BMT', 36, 34);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Port · Maintenance · Équipements · Stock', 36, 51);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text("BON D’ENTRÉE STOCK", pageWidth - 36, 34, {
        align: 'right',
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(
        `Numéro : ${entree.numero || `BE-${entree.idEntreeStock}`}`,
        pageWidth - 36,
        51,
        {
          align: 'right',
        },
      );

      let y = 122;

      pdf.setTextColor(...textDark);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Informations du bon', 36, y);

      y += 16;

      pdf.setDrawColor(...border);
      pdf.setFillColor(...soft);
      pdf.roundedRect(36, y, pageWidth - 72, 82, 10, 10, 'FD');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...textMuted);
      pdf.text('Numéro', 54, y + 24);
      pdf.text('Date réception', 190, y + 24);
      pdf.text('Statut', 340, y + 24);
      pdf.text('Commentaire', 490, y + 24);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textDark);
      pdf.text(cleanText(entree.numero), 54, y + 42);
      pdf.text(formatDate(entree.dateReception), 190, y + 42);
      pdf.text(getStatusLabel(entree.statut), 340, y + 42);

      pdf.text(cleanText(entree.commentaire), 490, y + 42, {
        maxWidth: pageWidth - 540,
      });

      y += 125;

      pdf.setTextColor(...textDark);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Lignes du bon d’entrée', 36, y);

      y += 16;

      const rows =
        entree.lignes?.map((ligne, index) => {
          const quantite = Number(ligne.quantite ?? 0);
          const prixUnitaire = Number(ligne.prixUnitaire ?? 0);
          const totalLigne = quantite * prixUnitaire;

          const article =
            ligne.article?.reference && ligne.article?.designation
              ? `${ligne.article.reference} — ${ligne.article.designation}`
              : ligne.article?.reference ||
                ligne.article?.designation ||
                `Article #${ligne.idArticle}`;

          const magasin =
            ligne.magasin?.code && ligne.magasin?.libelle
              ? `${ligne.magasin.code} — ${ligne.magasin.libelle}`
              : ligne.magasin?.code ||
                ligne.magasin?.libelle ||
                `Magasin #${ligne.idMagasin}`;

          return [
            String(index + 1),
            cleanText(article),
            cleanText(magasin),
            String(quantite),
            formatMoneyPdf(prixUnitaire),
            formatMoneyPdf(totalLigne),
          ];
        }) ?? [];

      autoTable(pdf, {
        startY: y,
        head: [['#', 'Article', 'Magasin', 'Qté', 'Prix unitaire', 'Total']],
        body: rows,
        theme: 'grid',
        margin: {
          left: 36,
          right: 36,
        },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 6,
          textColor: textDark,
          lineColor: border,
          lineWidth: 0.5,
          overflow: 'linebreak',
          valign: 'middle',
        },
        headStyles: {
          fillColor: primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: soft,
        },
        columnStyles: {
          0: {
            cellWidth: 28,
            halign: 'center',
          },
          1: {
            cellWidth: 190,
          },
          2: {
            cellWidth: 230,
          },
          3: {
            cellWidth: 45,
            halign: 'center',
          },
          4: {
            cellWidth: 130,
            halign: 'right',
          },
          5: {
            cellWidth: 130,
            halign: 'right',
            fontStyle: 'bold',
          },
        },
      });

      const pageCount = pdf.getNumberOfPages();

      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...textMuted);

        pdf.text(
          `Généré le ${new Date().toLocaleString('fr-FR')}`,
          36,
          pageHeight - 24,
        );

        pdf.text(`Page ${page}/${pageCount}`, pageWidth - 36, pageHeight - 24, {
          align: 'right',
        });
      }

      pdf.save(`${entree.numero || `BE-${entree.idEntreeStock}`}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <RefreshCcw size={24} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm font-black text-slate-500">
            Chargement du bon d’entrée...
          </p>
        </section>
      </main>
    );
  }

  if (!entree) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-black text-red-700">
            Bon d’entrée introuvable.
          </p>
        </section>
      </main>
    );
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

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0a556b] to-[#0d6f87] px-6 py-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Package size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Fiche bon d’entrée
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight">
                      {entree.numero || `BE-${entree.idEntreeStock}`}
                    </h1>

                    <span
                      className={`rounded-full border px-4 py-1.5 text-sm font-black ${getStatusClasses(
                        entree.statut,
                      )}`}
                    >
                      {getStatusLabel(entree.statut)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Bon d’entrée #{entree.idEntreeStock} · {totalLignes} ligne(s)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-black text-white transition hover:bg-white/20"
                >
                  <RefreshCcw
                    size={17}
                    className={refreshing ? 'animate-spin' : ''}
                  />
                  Actualiser
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#06475a] shadow-sm transition hover:bg-slate-50"
                >
                  <Download
                    size={17}
                    className={exportingPdf ? 'animate-pulse' : ''}
                  />
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<CalendarDays size={20} />}
              label="Date"
              value={formatDate(entree.dateReception)}
            />

            <SummaryCard
              icon={<Layers3 size={20} />}
              label="Lignes"
              value={String(totalLignes)}
            />

            <SummaryCard
              icon={<Boxes size={20} />}
              label="Quantité"
              value={`+ ${totalQuantite}`}
            />

            <SummaryCard
              icon={<Warehouse size={20} />}
              label="Matériels"
              value={String(totalMateriels)}
            />
          </div>

          <div className="px-6 pb-6">
            <SectionTitle title="Généralités" />

            <div className="mt-3 rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date réception *">
                  <input
                    type="date"
                    value={headerForm.dateReception}
                    onChange={(event) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        dateReception: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Commentaire général">
                  <input
                    type="text"
                    value={headerForm.commentaire}
                    onChange={(event) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        commentaire: event.target.value,
                      }))
                    }
                    placeholder="Commentaire"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
                >
                  <Save
                    size={17}
                    className={savingHeader ? 'animate-pulse' : ''}
                  />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle
            title="Lignes du bon d’entrée"
            subtitle="Vous pouvez modifier les quantités, prix, lots, dates de péremption, emplacements et matériels sérialisés."
          />

          {(entree.lignes ?? []).map((ligne, index) => {
            const draft = lineDrafts[ligne.idLigneEntreeStock];

            if (!draft) return null;

            const isSerialise = isArticleSerialise(draft.articleId);
            const emplacementOptions = getEmplacementOptions(draft.magasinId);

            return (
              <article
                key={ligne.idLigneEntreeStock}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Layers3 size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-2xl font-black leading-tight text-slate-950">
                          Ligne {index + 1}
                        </h3>

                        <p className="mt-1 truncate text-sm font-black text-slate-500">
                          Actuel :{' '}
                          {ligne.article?.reference ||
                            ligne.article?.designation ||
                            `Article #${ligne.idArticle}`}
                        </p>

                        {isSerialise && (
                          <p className="mt-1 text-sm font-black text-orange-600">
                            Article sérialisé
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <div className="inline-flex h-11 items-center rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700">
                        Total ligne : {formatMoney(getLineTotal(draft))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveLine(ligne.idLigneEntreeStock)
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
                      >
                        <Save
                          size={17}
                          className={
                            savingLineId === ligne.idLigneEntreeStock
                              ? 'animate-pulse'
                              : ''
                          }
                        />
                        Enregistrer
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteLine(ligne.idLigneEntreeStock)
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid gap-4 xl:grid-cols-12">
                    <div className="xl:col-span-4">
                      <Field label="Article">
                        <Select
                          value={draft.articleId}
                          onValueChange={(value) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              articleId: value,
                            })
                          }
                          placeholder="Sélectionner un article"
                          items={articleOptions}
                        />
                      </Field>
                    </div>

                    <div className="xl:col-span-4">
                      <Field label="Magasin">
                        <Select
                          value={draft.magasinId}
                          onValueChange={(value) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              magasinId: value,
                            })
                          }
                          placeholder="Sélectionner un magasin"
                          items={magasinOptions}
                        />
                      </Field>
                    </div>

                    <div className="xl:col-span-2">
                      <Field label="Qté">
                        <input
                          type="number"
                          min="1"
                          value={draft.quantite}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
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
                          value={draft.prixUnitaire}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              prixUnitaire: event.target.value,
                            })
                          }
                          placeholder="Prix"
                          className={inputClassName}
                        />

                        <p className="mt-2 text-xs font-black text-slate-400">
                          {formatMoney(draft.prixUnitaire)}
                        </p>
                      </Field>
                    </div>

                    <div className="xl:col-span-3">
                      <Field label="Lot">
                        <input
                          type="text"
                          value={draft.numeroLot}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              numeroLot: event.target.value,
                            })
                          }
                          placeholder="Lot"
                          className={inputClassName}
                        />
                      </Field>
                    </div>

                    <div className="xl:col-span-3">
                      <Field label="Péremption">
                        <input
                          type="date"
                          value={draft.datePeremption}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
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
                          value={draft.emplacementId}
                          onValueChange={(value) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              emplacementId: value,
                            })
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
                          value={draft.commentaire}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneEntreeStock, {
                              commentaire: event.target.value,
                            })
                          }
                          placeholder="Commentaire"
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                  </div>

                  {isSerialise && (
                    <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <h4 className="text-base font-black uppercase tracking-[0.18em] text-[#06475a]">
                        Matériels sérialisés
                      </h4>

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Pour cet article, la quantité doit correspondre au nombre
                        de matériels saisis.
                      </p>

                      <div className="mt-4 space-y-3">
                        {draft.materiels.map((materiel, materialIndex) => (
                          <div
                            key={materialIndex}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field
                                label={`Code matériel ${materialIndex + 1} *`}
                              >
                                <input
                                  type="text"
                                  value={materiel.code}
                                  onChange={(event) =>
                                    updateExistingMateriel(
                                      ligne.idLigneEntreeStock,
                                      materialIndex,
                                      'code',
                                      event.target.value,
                                    )
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
                                    updateExistingMateriel(
                                      ligne.idLigneEntreeStock,
                                      materialIndex,
                                      'numeroSerie',
                                      event.target.value,
                                    )
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
          })}
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Package size={22} />
              </div>

              <div>
                <h3 className="text-2xl font-black leading-tight text-slate-950">
                  Ajouter une nouvelle ligne
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  La ligne sera ajoutée au bon et le stock sera augmenté.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <Field label="Article">
                  <Select
                    value={newLine.articleId}
                    onValueChange={(value) =>
                      updateNewLine({
                        articleId: value,
                      })
                    }
                    placeholder="Sélectionner un article"
                    items={articleOptions}
                  />
                </Field>
              </div>

              <div className="xl:col-span-4">
                <Field label="Magasin">
                  <Select
                    value={newLine.magasinId}
                    onValueChange={(value) =>
                      updateNewLine({
                        magasinId: value,
                      })
                    }
                    placeholder="Sélectionner un magasin"
                    items={magasinOptions}
                  />
                </Field>
              </div>

              <div className="xl:col-span-2">
                <Field label="Qté">
                  <input
                    type="number"
                    min="1"
                    value={newLine.quantite}
                    onChange={(event) =>
                      updateNewLine({
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
                    value={newLine.prixUnitaire}
                    onChange={(event) =>
                      updateNewLine({
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
                    value={newLine.numeroLot}
                    onChange={(event) =>
                      updateNewLine({
                        numeroLot: event.target.value,
                      })
                    }
                    placeholder="Lot"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="xl:col-span-3">
                <Field label="Péremption">
                  <input
                    type="date"
                    value={newLine.datePeremption}
                    onChange={(event) =>
                      updateNewLine({
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
                    value={newLine.emplacementId}
                    onValueChange={(value) =>
                      updateNewLine({
                        emplacementId: value,
                      })
                    }
                    placeholder="Choisir un emplacement"
                    items={getEmplacementOptions(newLine.magasinId)}
                  />
                </Field>
              </div>

              <div className="xl:col-span-3">
                <Field label="Commentaire ligne">
                  <input
                    type="text"
                    value={newLine.commentaire}
                    onChange={(event) =>
                      updateNewLine({
                        commentaire: event.target.value,
                      })
                    }
                    placeholder="Commentaire"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>

            {isArticleSerialise(newLine.articleId) && (
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-black uppercase tracking-[0.18em] text-[#06475a]">
                  Matériels sérialisés
                </h4>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Pour cet article, la quantité doit correspondre au nombre de
                  matériels saisis.
                </p>

                <div className="mt-4 space-y-3">
                  {newLine.materiels.map((materiel, materialIndex) => (
                    <div
                      key={materialIndex}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={`Code matériel ${materialIndex + 1} *`}>
                          <input
                            type="text"
                            value={materiel.code}
                            onChange={(event) =>
                              updateNewMateriel(
                                materialIndex,
                                'code',
                                event.target.value,
                              )
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
                              updateNewMateriel(
                                materialIndex,
                                'numeroSerie',
                                event.target.value,
                              )
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

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
              >
                <Save size={17} className={addingLine ? 'animate-pulse' : ''} />
                Ajouter la ligne
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

const inputClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#06475a] focus:ring-4 focus:ring-[#06475a]/10';

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#06475a]">{icon}</div>

        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

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