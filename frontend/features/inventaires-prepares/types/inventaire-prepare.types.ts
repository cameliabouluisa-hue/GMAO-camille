export type InventaireStatut =
  | 'BROUILLON'
  | 'EN_COMPTAGE'
  | 'VALIDE'
  | 'ANNULE'
  | string;

export type Magasin = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
  nom?: string | null;
};

export type Article = {
  idArticle: number;
  reference?: string | null;
  code?: string | null;
  designation?: string | null;
  libelle?: string | null;
  unite?: string | null;
};

export type LigneInventairePrepare = {
  idLigneInventairePrepare: number;
  idInventairePrepare: number;
  idArticle: number;
  quantiteTheorique: number;
  quantiteReelle?: number | null;
  ecart?: number | null;
  article?: Article | null;
};

export type InventairePrepare = {
  idInventairePrepare: number;
  numero?: string | null;
  code?: string | null;
  statut: InventaireStatut;
  idMagasin: number;
  magasin?: Magasin | null;
  commentaire?: string | null;
  dateCreation?: string | null;
  dateInventaire?: string | null;
  createdAt?: string | null;
  lignes?: LigneInventairePrepare[];
};

export type CreateInventairePrepareDto = {
  idMagasin: number;
  commentaire?: string;
};

export type AddLigneInventaireDto = {
  idArticle: number;
  quantiteTheorique?: number;
};

export type SaisirQuantitesDto = {
  lignes: {
    idLigneInventairePrepare: number;
    quantiteReelle: number;
  }[];
};

export function getInventaireNumber(inventaire: InventairePrepare) {
  return (
    inventaire.numero ||
    inventaire.code ||
    `INV-${inventaire.idInventairePrepare}`
  );
}

export function getMagasinLabel(magasin?: Magasin | null) {
  if (!magasin) return 'Magasin non défini';
  return magasin.code || magasin.libelle || magasin.nom || `Magasin ${magasin.idMagasin}`;
}

export function getArticleReference(article?: Article | null) {
  if (!article) return 'Article';
  return article.reference || article.code || `Article ${article.idArticle}`;
}

export function getArticleDesignation(article?: Article | null) {
  if (!article) return '—';
  return article.designation || article.libelle || '—';
}

export function formatDate(date?: string | null) {
  if (!date) return '—';

  try {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  } catch {
    return '—';
  }
}