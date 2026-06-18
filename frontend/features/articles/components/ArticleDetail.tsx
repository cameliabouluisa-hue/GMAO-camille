

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Boxes,
  CalendarClock,
  Edit3,
  Package,
  RefreshCcw,
  Warehouse,
} from 'lucide-react';

import {
  AppBadge,
  AppFieldGrid,
  AppReadField,
  AppSection,
} from '@/components/app-section-layout';

import type {
  Article,
  ArticleMaterielSerialise,
  ArticleStock,
  CategorieArticle,
  Magasin,
} from '@/features/articles/types/article';

type Props = {
  article: Article;
  magasins?: Magasin[];
  materielsSerialises?: ArticleMaterielSerialise[];
  refreshing?: boolean;
  onRefresh: () => void | Promise<void>;
  onEdit: () => void;
};

type TabId = 'general' | 'stock' | 'serialises';

const CATEGORIE_LABELS: Record<CategorieArticle, string> = {
  PIECE_RECHANGE: 'Pièce de rechange',
  CONSOMMABLE: 'Consommable',
  FOURNITURE: 'Fourniture',
  OUTILLAGE: 'Outillage',
  EQUIPEMENT_STOCKE: 'Équipement stocké',
  SERVICE: 'Service',
  AUTRE: 'Autre',
};

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}

function formatBoolean(value?: boolean | null) {
  return value ? 'Oui' : 'Non';
}

function formatCategorie(value?: CategorieArticle | null) {
  if (!value) return '—';
  return CATEGORIE_LABELS[value] ?? value;
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function stockNumber(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function formatQuantity(value: string | number | null | undefined) {
  if (!hasValue(value)) return '0';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 3,
  }).format(numberValue);
}

function formatMoney(value: string | number | null | undefined) {
  if (!hasValue(value)) return '—';

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function getArticleReference(article: Article) {
  return article.reference || `ART-${article.idArticle}`;
}

function getArticleDesignation(article: Article) {
  return article.designation || 'Article sans désignation';
}

function getFamilleLabel(article: Article) {
  const famille = article.famille;

  if (!famille) return '—';

  if (famille.code && famille.libelle) {
    return `${famille.code} - ${famille.libelle}`;
  }

  return famille.code || famille.libelle || `Famille ${famille.idFamille}`;
}

function getUniteLabel(article: Article) {
  const unite = article.uniteArticle;

  if (!unite) return '—';

  if (unite.code && unite.libelle) {
    return `${unite.code} - ${unite.libelle}`;
  }

  return unite.code || unite.libelle || `Unité ${unite.idUniteArticle}`;
}

function getModeleLabel(article: Article) {
  const modele = article.modeleEquipement;

  if (!modele) return '—';

  if (modele.code && modele.libelle) {
    return `${modele.code} - ${modele.libelle}`;
  }

  return modele.code || modele.libelle || `Modèle ${modele.idModele}`;
}

export default function ArticleDetail({
  article,
  magasins = [],
  materielsSerialises = [],
  refreshing = false,
  onRefresh,
  onEdit,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const active = article.actif !== false && article.etatArticle !== 'INACTIF';
  const reference = getArticleReference(article);
  const designation = getArticleDesignation(article);
  const stocks = article.stocks ?? [];

  const totalPhysique = useMemo(
    () =>
      stocks.reduce(
        (sum, stock) => sum + stockNumber(stock.quantitePhysique),
        0,
      ),
    [stocks],
  );

  const totalDisponible = useMemo(
    () =>
      stocks.reduce(
        (sum, stock) => sum + stockNumber(stock.quantiteDisponible),
        0,
      ),
    [stocks],
  );

  const tabs: {
    id: TabId;
    label: string;
    icon: ReactNode;
    hidden?: boolean;
  }[] = [
    { id: 'general', label: 'Général', icon: <Package size={17} /> },
    { id: 'stock', label: 'Stock', icon: <Warehouse size={17} /> },
    {
      id: 'serialises',
      label: 'Unités sérialisées',
      icon: <Boxes size={17} />,
      hidden: !article.serialise,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#06475a] to-[#0b5d73] px-6 py-5 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Package size={29} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                Fiche article
              </p>

              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="min-w-0 break-words text-3xl font-black tracking-tight">
                  {reference}
                </h1>

                <AppBadge>{active ? 'Actif' : 'Inactif'}</AppBadge>

                {article.gereEnStock && <AppBadge>Géré en stock</AppBadge>}

                {article.serialise && <AppBadge>Sérialisé</AppBadge>}
              </div>

              <p className="mt-2 min-w-0 break-words text-sm font-semibold text-white/75">
                {designation} · {formatQuantity(totalDisponible)} unité(s)
                disponible(s)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
              Actualiser
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0b3d4f] shadow-sm transition hover:bg-slate-50"
            >
              <Edit3 size={16} />
              Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {tabs
            .filter((tab) => !tab.hidden)
            .map((tab) => {
              const isActiveTab = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-black transition',
                    isActiveTab
                      ? 'bg-white text-[#06475a] shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900',
                  ].join(' ')}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <AppSection title="Généralités">
              <AppFieldGrid>
                <AppReadField label="Référence" value={reference} />
                <AppReadField label="Désignation" value={designation} />
                <AppReadField
                  label="Catégorie"
                  value={formatCategorie(article.categorie)}
                />
                <AppReadField label="Famille" value={getFamilleLabel(article)} />
                <AppReadField label="Unité" value={getUniteLabel(article)} />
                <AppReadField
                  label="État"
                  value={
                    active ? (
                      <AppBadge tone="success">Actif</AppBadge>
                    ) : (
                      <AppBadge tone="danger">Inactif</AppBadge>
                    )
                  }
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Gestion stock">
              <AppFieldGrid>
                <AppReadField
                  label="Géré en stock"
                  value={formatBoolean(article.gereEnStock)}
                />
                <AppReadField
                  label="Sérialisé"
                  value={formatBoolean(article.serialise)}
                />
                <AppReadField
                  label="Géré par lot"
                  value={formatBoolean(article.gereParLot)}
                />
                <AppReadField
                  label="Réparable"
                  value={formatBoolean(article.reparable)}
                />
                <AppReadField
                  label="Stock physique"
                  value={formatQuantity(totalPhysique)}
                />
                <AppReadField
                  label="Stock disponible"
                  value={formatQuantity(totalDisponible)}
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Valorisation">
              <AppFieldGrid>
                <AppReadField
                  label="Prix standard"
                  value={formatMoney(article.prixStandard)}
                />
                <AppReadField
                  label="PMP"
                  value={formatMoney(article.prixMoyenPondere)}
                />
                <AppReadField label="Taxe" value={article.taxe || '—'} />
                <AppReadField
                  label="Nature achat"
                  value={article.natureAchat || '—'}
                />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Référentiel équipement">
              <AppFieldGrid>
                <AppReadField
                  label="Est modèle"
                  value={formatBoolean(article.estModele)}
                />
                <AppReadField label="Modèle lié" value={getModeleLabel(article)} />
              </AppFieldGrid>
            </AppSection>

            <AppSection title="Description">
              <AppReadField
                label="Description"
                value={article.description || '—'}
              />
            </AppSection>

            <AppSection title="Suivi système">
              <AppFieldGrid>
                <AppReadField
                  label="Créé le"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock size={17} className="text-slate-400" />
                      {formatDate(article.createdAt)}
                    </span>
                  }
                />

                <AppReadField
                  label="Modifié le"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock size={17} className="text-slate-400" />
                      {formatDate(article.updatedAt)}
                    </span>
                  }
                />
              </AppFieldGrid>
            </AppSection>
          </div>
        )}

        {activeTab === 'stock' && (
          <ArticleStockTab
            article={article}
            stocks={stocks}
            magasins={magasins}
          />
        )}

        {activeTab === 'serialises' && article.serialise && (
          <ArticleSerialisesTab materiels={materielsSerialises} />
        )}
      </div>
    </div>
  );
}

function ArticleStockTab({
  article,
  stocks,
  magasins,
}: {
  article: Article;
  stocks: ArticleStock[];
  magasins: Magasin[];
}) {
  const magasinById = useMemo(() => {
    return new Map(magasins.map((magasin) => [magasin.idMagasin, magasin]));
  }, [magasins]);

  if (!article.gereEnStock) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm font-black text-slate-500">
        Cet article n’est pas géré en stock.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
            Synthèse stock
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            Quantités disponibles par magasin.
          </p>
        </div>

        {article.serialise && (
          <AppBadge tone="info">
            Quantité = nombre d’unités sérialisées
          </AppBadge>
        )}
      </div>

      <StockTable
        stocks={stocks}
        magasinById={magasinById}
        prixMoyenPondere={article.prixMoyenPondere}
      />
    </div>
  );
}

function StockTable({
  stocks,
  magasinById,
  prixMoyenPondere,
}: {
  stocks: ArticleStock[];
  magasinById: Map<number, Magasin>;
  prixMoyenPondere?: string | number | null;
}) {
  if (stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm font-bold text-slate-400">
        Aucun stock enregistré pour cet article.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#06475a] text-white">
              <th className="px-4 py-3 text-left font-black">Magasin</th>
              <th className="px-4 py-3 text-left font-black">Libellé</th>
              <th className="px-4 py-3 text-right font-black">Qté stock</th>
              <th className="px-4 py-3 text-right font-black">Qté réservée</th>
              <th className="px-4 py-3 text-right font-black">
                Qté disponible
              </th>
              <th className="px-4 py-3 text-right font-black">PMP</th>
              <th className="px-4 py-3 text-right font-black">Valeur stock</th>
            </tr>
          </thead>

          <tbody>
            {stocks.map((stock, index) => {
              const magasin = magasinById.get(stock.idMagasin);
              const qtePhysique = stockNumber(stock.quantitePhysique);
              const pmp = stockNumber(prixMoyenPondere);
              const valeurStock =
                pmp > 0 ? formatMoney(qtePhysique * pmp) : '—';

              return (
                <tr
                  key={stock.idStock}
                  className={[
                    'border-b border-slate-100 transition hover:bg-cyan-50/70',
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-black text-slate-900">
                    {magasin?.code || `Magasin #${stock.idMagasin}`}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {magasin?.libelle || '—'}
                  </td>

                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    {formatQuantity(stock.quantitePhysique)}
                  </td>

                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    {formatQuantity(stock.quantiteReservee)}
                  </td>

                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    {formatQuantity(stock.quantiteDisponible)}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    {formatMoney(prixMoyenPondere)}
                  </td>

                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    {valeurStock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticleSerialisesTab({
  materiels,
}: {
  materiels: ArticleMaterielSerialise[];
}) {
  if (materiels.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
              Unités sérialisées
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Chaque unité physique de cet article correspond à un matériel.
            </p>
          </div>

          <AppBadge tone="warning">Aucune unité trouvée</AppBadge>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
          <p className="text-sm font-black text-slate-600">
            Aucun matériel sérialisé n’est rattaché à cet article.
          </p>

          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
            Les quantités stock existent peut-être déjà, mais aucune fiche
            matériel correspondante n’a été trouvée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
            Unités sérialisées
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            Liste des matériels correspondant aux unités physiques de cet article.
          </p>
        </div>

        <AppBadge tone="info">{materiels.length} unité(s)</AppBadge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#06475a] text-white">
                <th className="px-4 py-3 text-left font-black">
                  Code matériel
                </th>
                <th className="px-4 py-3 text-left font-black">N° série</th>
                <th className="px-4 py-3 text-left font-black">Magasin</th>
                <th className="px-4 py-3 text-left font-black">Emplacement</th>
                <th className="px-4 py-3 text-left font-black">État</th>
                <th className="px-4 py-3 text-left font-black">Position</th>
                <th className="px-4 py-3 text-right font-black">Action</th>
              </tr>
            </thead>

            <tbody>
              {materiels.map((materiel, index) => (
                <tr
                  key={materiel.idMateriel}
                  className={[
                    'border-b border-slate-100 transition hover:bg-cyan-50/70',
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-black text-slate-900">
                    {materiel.code || `MAT-${materiel.idMateriel}`}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {materiel.numeroSerie || '—'}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {materiel.magasinCode ||
                      materiel.magasinLibelle ||
                      (materiel.idMagasin
                        ? `Magasin #${materiel.idMagasin}`
                        : '—')}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {materiel.emplacementCode ||
                      materiel.emplacementLibelle ||
                      (materiel.idEmplacement
                        ? `Emp. #${materiel.idEmplacement}`
                        : '—')}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-black',
                        materiel.actif === false
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-50 text-emerald-700',
                      ].join(' ')}
                    >
                      {materiel.etat || 'Actif'}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {materiel.positionActuelle || '—'}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/materiels/${materiel.idMateriel}`}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-[#06475a] transition hover:bg-slate-50"
                    >
                      Voir fiche
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}