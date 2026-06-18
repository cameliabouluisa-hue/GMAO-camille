'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Package, RefreshCcw } from 'lucide-react';

import ArticleDetail from '@/features/articles/components/ArticleDetail';
import { getArticleById } from '@/features/articles/services/article.service';
import { getMagasins } from '@/features/articles/services/article-referentiel.service';

import { getMateriels } from '@/features/materiels/services/materiel.service';

import type {
  Article,
  ArticleMaterielSerialise,
  Magasin,
} from '@/features/articles/types/article';

import type { Materiel } from '@/features/materiels/types/materiel';


function isMaterielLinkedToArticle(materiel: Materiel, article: Article) {
  const anyMateriel = materiel as any;
  const anyArticle = article as any;

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

function getEtatMaterielLabel(materiel: Materiel) {
  const anyMateriel = materiel as any;

  return (
    anyMateriel.etat_materiel?.libelle ||
    anyMateriel.etat_materiel?.code ||
    anyMateriel.etat?.libelle ||
    anyMateriel.etat?.code ||
    anyMateriel.etat ||
    '—'
  );
}

function getPositionLabel(position?: string | null) {
  if (position === 'EN_STOCK') return 'En réserve';
  if (position === 'SUR_TERRAIN') return 'Sur terrain';
  if (position === 'EN_ATELIER') return 'En atelier';
  if (position === 'AU_REBUT') return 'Au rebut';

  return position || '—';
}

function mapMaterielToArticleSerialise(
  materiel: Materiel,
): ArticleMaterielSerialise {
  const anyMateriel = materiel as any;

  const ligneEntree =
    anyMateriel.ligneEntreeStock ||
    anyMateriel.entree_stock_ligne ||
    anyMateriel.ligne_entree_stock;

  const magasin =
    anyMateriel.magasin ||
    ligneEntree?.magasin ||
    ligneEntree?.magasinSource ||
    ligneEntree?.magasinDestination;

  const emplacement =
    anyMateriel.emplacement ||
    ligneEntree?.emplacement ||
    ligneEntree?.emplacement_magasin;

  return {
    idMateriel: anyMateriel.idMateriel,
    code: anyMateriel.code || `MAT-${anyMateriel.idMateriel}`,
    libelle: anyMateriel.libelle ?? null,
    numeroSerie: anyMateriel.numeroSerie ?? null,

    idMagasin:
      anyMateriel.idMagasin ??
      ligneEntree?.idMagasin ??
      magasin?.idMagasin ??
      null,

    idEmplacement:
      anyMateriel.idEmplacement ??
      ligneEntree?.idEmplacement ??
      emplacement?.idEmplacement ??
      null,

    magasinCode: magasin?.code ?? null,
    magasinLibelle: magasin?.libelle ?? null,

    emplacementCode: emplacement?.code ?? null,
    emplacementLibelle: emplacement?.libelle ?? null,

    etat: getEtatMaterielLabel(materiel),
    positionActuelle: getPositionLabel(anyMateriel.positionActuelle),
    actif: anyMateriel.actif,
  };
}
export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    const rawId = params?.id;
    const value = Array.isArray(rawId) ? rawId[0] : rawId;
    return Number(value);
  }, [params]);

  const [article, setArticle] = useState<Article | null>(null);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
const [materielsSerialises, setMaterielsSerialises] = useState<
  ArticleMaterielSerialise[]
>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadArticle = useCallback(
    async (silent = false) => {
      if (!Number.isFinite(id) || id <= 0) {
        setError('Identifiant de l’article invalide.');
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

        const [articleData, magasinsData, materielsData] = await Promise.all([
  getArticleById(id),
  getMagasins(),
  getMateriels(),
]);

const serialises = materielsData
  .filter((materiel) => isMaterielLinkedToArticle(materiel, articleData))
  .map(mapMaterielToArticleSerialise);

setArticle(articleData);
setMagasins(magasinsData);
setMaterielsSerialises(serialises);

        setArticle(articleData);
        setMagasins(magasinsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement de l’article.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  function handleEdit() {
    if (!article) return;
    router.push(`/articles/${article.idArticle}`);
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5f7fb] px-5 py-6">
      <section className="mx-auto max-w-[1180px] space-y-5">
        <BackButton onClick={() => router.back()} />

        {loading ? (
          <LoadingState />
        ) : error && !article ? (
          <ErrorState message={error} onRetry={() => loadArticle()} />
        ) : article ? (
          <>
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
                {error}
              </div>
            )}
<ArticleDetail
  article={article}
  magasins={magasins}
  materielsSerialises={materielsSerialises}
  refreshing={refreshing}
  onRefresh={() => loadArticle(true)}
  onEdit={handleEdit}
/>
          </>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-[#06475a]"
    >
      <ArrowLeft size={18} />
      Retour
    </button>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <RefreshCcw size={24} className="animate-spin" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        Chargement de la fiche article...
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle size={24} />
      </div>

      <h2 className="mt-4 text-lg font-black text-slate-950">
        Impossible de charger l’article
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06475a] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#043747]"
      >
        <RefreshCcw size={16} />
        Réessayer
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Package size={24} />
      </div>

      <h2 className="mt-4 text-lg font-black text-slate-950">
        Article introuvable
      </h2>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Aucun article ne correspond à cet identifiant.
      </p>
    </div>
  );
}