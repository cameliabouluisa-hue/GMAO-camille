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
  PackageMinus,
  RefreshCcw,
  Save,
  Trash2,
  Warehouse,
} from 'lucide-react';

import { Select } from '@/components/select';

import { getArticles } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/articles/services/article-referentiel.service';
import type { Article, Magasin } from '@/features/articles/types/article';

import { getMateriels } from '@/features/materiels/services/materiel.service';
import type { Materiel } from '@/features/materiels/types/materiel';

import {
  addStockSortieLigne,
  deleteStockSortieLigne,
  getStockSortie,
  updateStockSortie,
  updateStockSortieLigne,
} from '@/features/stock-sorties/services/stock-sortie.service';

import type {
  LigneSortieStockCrudDto,
  StockSortie,
  StockSortieLigne,
  UpdateLigneSortieStockDto,
} from '@/features/stock-sorties/types/stock-sortie';

type EmplacementMagasin = {
  idEmplacement: number;
  code?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
};

type EditableLine = {
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

function getLignes(sortie: StockSortie): StockSortieLigne[] {
  return sortie.lignes ?? sortie.sortie_stock_ligne ?? [];
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

function makeDraftFromLine(ligne: StockSortieLigne): EditableLine {
  const quantite = Number(ligne.quantite ?? 0);

  return {
    articleId: String(ligne.idArticle ?? ''),
    magasinId: String(ligne.idMagasin ?? ''),
    emplacementId:
      ligne.idEmplacement !== null && ligne.idEmplacement !== undefined
        ? String(ligne.idEmplacement)
        : 'none',
    materielId:
      ligne.idMateriel !== null && ligne.idMateriel !== undefined
        ? String(ligne.idMateriel)
        : 'none',
    quantite: quantite > 0 ? String(quantite) : '1',
    prixUnitaire:
      ligne.prixUnitaire !== null && ligne.prixUnitaire !== undefined
        ? String(Number(ligne.prixUnitaire))
        : '',
    commentaire: ligne.commentaire ?? '',
  };
}

function getLineTotal(draft: EditableLine) {
  const quantite = Number(draft.quantite || 0);
  const prixUnitaire = Number(draft.prixUnitaire || 0);

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
  const serie = anyMateriel.numeroSerie;

  if (serie) return `${code} — Série : ${serie}`;

  return code;
}

export default function DetailBonSortiePage() {
  const router = useRouter();
  const params = useParams();

  const idSortie = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;

    return Number(value);
  }, [params]);

  const [sortie, setSortie] = useState<StockSortie | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);

  const [emplacementsByMagasin, setEmplacementsByMagasin] = useState<
    Record<number, EmplacementMagasin[]>
  >({});

  const [headerForm, setHeaderForm] = useState({
    dateSortie: '',
    commentaire: '',
  });

  const [lineDrafts, setLineDrafts] = useState<Record<number, EditableLine>>({});

  const [newLine, setNewLine] = useState<EditableLine>({
    articleId: '',
    magasinId: '',
    emplacementId: 'none',
    materielId: 'none',
    quantite: '1',
    prixUnitaire: '',
    commentaire: '',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingLineId, setSavingLineId] = useState<number | null>(null);
  const [addingLine, setAddingLine] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState('');

  const lignes = sortie ? getLignes(sortie) : [];

  const totalLignes = lignes.length;

  const totalQuantite = lignes.reduce(
    (sum, ligne) => sum + Number(ligne.quantite ?? 0),
    0,
  );

  const totalMateriels = lignes.filter((ligne) => Boolean(ligne.idMateriel))
    .length;

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
      if (!Number.isFinite(idSortie) || idSortie <= 0) {
        setError('Identifiant du bon de sortie invalide.');
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

        const [sortieData, articlesData, magasinsData, materielsData] =
          await Promise.all([
            getStockSortie(idSortie),
            getArticles(),
            getMagasins(),
            getMateriels(),
          ]);

        const sortieLignes = getLignes(sortieData);

        setSortie(sortieData);
        setArticles(articlesData);
        setMagasins(magasinsData);
        setMateriels(materielsData);

        setHeaderForm({
          dateSortie: toInputDate(sortieData.dateSortie),
          commentaire: sortieData.commentaire ?? '',
        });

        const drafts: Record<number, EditableLine> = {};
        const idsMagasins = new Set<number>();

        for (const ligne of sortieLignes) {
          drafts[ligne.idLigneSortieStock] = makeDraftFromLine(ligne);

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
            : 'Erreur lors du chargement du bon de sortie.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idSortie],
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

  function getMaterielOptions(articleId?: string, magasinId?: string) {
    const article = getArticleById(articleId);
    const idMagasin = Number(magasinId);

    if (!article) {
      return [{ value: 'none', label: 'Aucun matériel' }];
    }

    const items = materiels.filter((materiel) => {
      const linked = isMaterielLinkedToArticle(materiel, article);
      const available = isMaterielDisponible(materiel);
      const materielMagasinId = getMaterielMagasinId(materiel);

      const matchesMagasin =
        !idMagasin || !materielMagasinId || materielMagasinId === idMagasin;

      return linked && available && matchesMagasin;
    });

    return [
      { value: 'none', label: 'Sélectionner un matériel' },
      ...items.map((materiel) => ({
        value: String(getMaterielAny(materiel).idMateriel),
        label: getMaterielLabel(materiel),
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
        next.materielId = 'none';
        ensureEmplacements(Number(patch.magasinId));
      }

      if (patch.articleId !== undefined) {
        next.materielId = 'none';
      }

      if (isArticleSerialise(next.articleId)) {
        next.quantite = '1';
      } else {
        next.materielId = 'none';
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
        next.materielId = 'none';
        ensureEmplacements(Number(patch.magasinId));
      }

      if (patch.articleId !== undefined) {
        next.materielId = 'none';
      }

      if (isArticleSerialise(next.articleId)) {
        next.quantite = '1';
      } else {
        next.materielId = 'none';
      }

      return next;
    });
  }

  function buildPayloadFromDraft(
    draft: EditableLine,
  ): LigneSortieStockCrudDto {
    const serialise = isArticleSerialise(draft.articleId);

    const payload: LigneSortieStockCrudDto = {
      idArticle: Number(draft.articleId),
      idMagasin: Number(draft.magasinId),
      quantite: serialise ? 1 : Number(draft.quantite),
      commentaire: draft.commentaire.trim() || undefined,
    };

    if (draft.emplacementId && draft.emplacementId !== 'none') {
      payload.idEmplacement = Number(draft.emplacementId);
    }

    if (serialise && draft.materielId !== 'none') {
      payload.idMateriel = Number(draft.materielId);
    }

    if (draft.prixUnitaire !== '') {
      payload.prixUnitaire = Number(draft.prixUnitaire);
    }

    return payload;
  }

  async function handleSaveHeader() {
    if (!sortie) return;

    try {
      setSavingHeader(true);
      setError('');

      await updateStockSortie(sortie.idSortieStock, {
        dateSortie: headerForm.dateSortie || undefined,
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

    if (!draft || !sortie) return;

    try {
      setSavingLineId(idLigne);
      setError('');

      await updateStockSortieLigne(
        sortie.idSortieStock,
        idLigne,
        buildPayloadFromDraft(draft) as UpdateLigneSortieStockDto,
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
    if (!sortie) return;

    if (deleteCandidateId !== idLigne) {
      setDeleteCandidateId(idLigne);
      return;
    }

    try {
      setError('');
      setDeleteCandidateId(null);

      await deleteStockSortieLigne(sortie.idSortieStock, idLigne);
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
    if (!sortie) return;

    try {
      setAddingLine(true);
      setError('');

      await addStockSortieLigne(
        sortie.idSortieStock,
        buildPayloadFromDraft(newLine),
      );

      setNewLine({
        articleId: '',
        magasinId: '',
        emplacementId: 'none',
        materielId: 'none',
        quantite: '1',
        prixUnitaire: '',
        commentaire: '',
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
    if (!sortie) return;

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
      pdf.text('BON DE SORTIE STOCK', pageWidth - 36, 34, {
        align: 'right',
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(
        `Numéro : ${sortie.numero || `BS-${sortie.idSortieStock}`}`,
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
      pdf.text('Date sortie', 190, y + 24);
      pdf.text('Statut', 340, y + 24);
      pdf.text('Commentaire', 490, y + 24);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textDark);
      pdf.text(cleanText(sortie.numero), 54, y + 42);
      pdf.text(formatDate(sortie.dateSortie), 190, y + 42);
      pdf.text(getStatusLabel(sortie.statut), 340, y + 42);
      pdf.text(cleanText(sortie.commentaire), 490, y + 42, {
        maxWidth: pageWidth - 540,
      });

      y += 125;

      pdf.setTextColor(...textDark);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Lignes du bon de sortie', 36, y);

      y += 16;

      const rows = lignes.map((ligne, index) => {
        const quantite = Number(ligne.quantite ?? 0);
        const prixUnitaire = Number(ligne.prixUnitaire ?? 0);
        const totalLigne = quantite * prixUnitaire;

        const article =
          ligne.article?.reference && ligne.article?.designation
            ? `${ligne.article.reference} — ${ligne.article.designation}`
            : ligne.article?.reference ||
              ligne.article?.designation ||
              ligne.article?.libelle ||
              `Article #${ligne.idArticle}`;

        const magasin =
          ligne.magasin?.code && ligne.magasin?.libelle
            ? `${ligne.magasin.code} — ${ligne.magasin.libelle}`
            : ligne.magasin?.code ||
              ligne.magasin?.libelle ||
              `Magasin #${ligne.idMagasin}`;

        const materiel = ligne.materiel
          ? `${ligne.materiel.code || `MAT-${ligne.materiel.idMateriel}`}${
              ligne.materiel.numeroSerie
                ? ` (${ligne.materiel.numeroSerie})`
                : ''
            }`
          : ligne.idMateriel
            ? `Matériel #${ligne.idMateriel}`
            : '—';

        return [
          String(index + 1),
          cleanText(article),
          cleanText(magasin),
          String(quantite),
          formatMoneyPdf(prixUnitaire),
          formatMoneyPdf(totalLigne),
          cleanText(materiel),
        ];
      });

      autoTable(pdf, {
        startY: y,
        head: [
          [
            '#',
            'Article',
            'Magasin',
            'Qté',
            'Prix unitaire',
            'Total',
            'Matériel',
          ],
        ],
        body: rows,
        theme: 'grid',
        margin: {
          left: 36,
          right: 36,
        },
        styles: {
          font: 'helvetica',
          fontSize: 7.5,
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
            cellWidth: 26,
            halign: 'center',
          },
          1: {
            cellWidth: 160,
          },
          2: {
            cellWidth: 190,
          },
          3: {
            cellWidth: 40,
            halign: 'center',
          },
          4: {
            cellWidth: 120,
            halign: 'right',
            overflow: 'hidden',
          },
          5: {
            cellWidth: 120,
            halign: 'right',
            overflow: 'hidden',
            fontStyle: 'bold',
          },
          6: {
            cellWidth: 105,
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

      pdf.save(`${sortie.numero || `BS-${sortie.idSortieStock}`}.pdf`);
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
            Chargement du bon de sortie...
          </p>
        </section>
      </main>
    );
  }

  if (!sortie) {
    return (
      <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
        <section className="mx-auto max-w-[1280px] rounded-[28px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-black text-red-700">
            Bon de sortie introuvable.
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
                  <PackageMinus size={28} />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
                    Fiche bon de sortie
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight">
                      {sortie.numero || `BS-${sortie.idSortieStock}`}
                    </h1>

                    <span
                      className={`rounded-full border px-4 py-1.5 text-sm font-black ${getStatusClasses(
                        sortie.statut,
                      )}`}
                    >
                      {getStatusLabel(sortie.statut)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-white/85">
                    Bon de sortie #{sortie.idSortieStock} · {totalLignes}{' '}
                    ligne(s)
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
              value={formatDate(sortie.dateSortie)}
            />

            <SummaryCard
              icon={<Layers3 size={20} />}
              label="Lignes"
              value={String(totalLignes)}
            />

            <SummaryCard
              icon={<Boxes size={20} />}
              label="Quantité"
              value={`- ${totalQuantite}`}
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
                <Field label="Date sortie *">
                  <input
                    type="date"
                    value={headerForm.dateSortie}
                    onChange={(event) =>
                      setHeaderForm((prev) => ({
                        ...prev,
                        dateSortie: event.target.value,
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
            title="Lignes du bon de sortie"
            subtitle="Vous pouvez modifier les articles, magasins, emplacements, quantités et matériels sortis."
          />

          {lignes.map((ligne, index) => {
            const draft = lineDrafts[ligne.idLigneSortieStock];

            if (!draft) return null;

            const serialise = isArticleSerialise(draft.articleId);
            const emplacementOptions = getEmplacementOptions(draft.magasinId);
            const materielOptions = getMaterielOptions(
              draft.articleId,
              draft.magasinId,
            );

            return (
              <article
                key={ligne.idLigneSortieStock}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
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
                            ligne.article?.libelle ||
                            `Article #${ligne.idArticle}`}
                        </p>

                        {serialise && (
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
                          handleSaveLine(ligne.idLigneSortieStock)
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
                      >
                        <Save
                          size={17}
                          className={
                            savingLineId === ligne.idLigneSortieStock
                              ? 'animate-pulse'
                              : ''
                          }
                        />
                        Enregistrer
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteLine(ligne.idLigneSortieStock)
                        }
                        className={[
                          'inline-flex h-11 items-center justify-center rounded-xl border px-3 text-sm font-black transition',
                          deleteCandidateId === ligne.idLigneSortieStock
                            ? 'border-red-200 bg-red-600 text-white hover:bg-red-700'
                            : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100',
                        ].join(' ')}
                        title="Supprimer la ligne"
                      >
                        {deleteCandidateId === ligne.idLigneSortieStock ? (
                          'Confirmer'
                        ) : (
                          <Trash2 size={17} />
                        )}
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
                            updateDraftLine(ligne.idLigneSortieStock, {
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
                            updateDraftLine(ligne.idLigneSortieStock, {
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
                          disabled={serialise}
                          value={draft.quantite}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneSortieStock, {
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
                            updateDraftLine(ligne.idLigneSortieStock, {
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

                    <div className="xl:col-span-4">
                      <Field label="Emplacement">
                        <Select
                          value={draft.emplacementId}
                          onValueChange={(value) =>
                            updateDraftLine(ligne.idLigneSortieStock, {
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
                            value={draft.materielId}
                            onValueChange={(value) =>
                              updateDraftLine(ligne.idLigneSortieStock, {
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
                          value={draft.commentaire}
                          onChange={(event) =>
                            updateDraftLine(ligne.idLigneSortieStock, {
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
          })}
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <PackageMinus size={22} />
              </div>

              <div>
                <h3 className="text-2xl font-black leading-tight text-slate-950">
                  Ajouter une nouvelle ligne
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  La ligne sera ajoutée au bon et le stock sera diminué.
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
                    disabled={isArticleSerialise(newLine.articleId)}
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

              <div className="xl:col-span-4">
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

              <div className="xl:col-span-4">
                <Field label="Matériel sérialisé">
                  {isArticleSerialise(newLine.articleId) ? (
                    <Select
                      value={newLine.materielId}
                      onValueChange={(value) =>
                        updateNewLine({
                          materielId: value,
                        })
                      }
                      placeholder="Sélectionner un matériel"
                      items={getMaterielOptions(
                        newLine.articleId,
                        newLine.magasinId,
                      )}
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
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#06475a] focus:ring-4 focus:ring-[#06475a]/10';

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