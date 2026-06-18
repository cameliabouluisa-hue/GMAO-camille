export type Magasin = {
  idMagasin: number;
  code?: string | null;
  libelle?: string | null;
};

export type Article = {
  idArticle: number;
  code?: string | null;
  libelle?: string | null;
  designation?: string | null;
};

export type LigneReapprovisionnement = {
  idLigneReapprovisionnement: number;
  idArticle: number;
  quantiteDemandee: number;
  commentaire?: string | null;
  article?: Article | null;
};

export type DemandeReapprovisionnement = {
  idDemandeReapprovisionnement: number;
  numero: string;
  dateDemande: string;
  dateValidation?: string | null;
  dateAnnulation?: string | null;
  statut: 'BROUILLON' | 'VALIDEE' | 'ANNULEE' | string;
  demandeur?: string | null;
  commentaire?: string | null;
  idMagasin: number;
  magasin?: Magasin | null;
  lignes: LigneReapprovisionnement[];
};

export type StockDisponibleReapprovisionnement = {
  idStockArticleMagasin: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: number;
  quantiteReservee: number;
  quantiteDisponible: number;
  quantiteSuggeree?: number;
  article?: Article | null;
  magasin?: Magasin | null;
};

export type CreateReapprovisionnementPayload = {
  idMagasin: number;
  demandeur?: string;
  commentaire?: string;
  lignes: {
    idArticle: number;
    quantiteDemandee: number;
    commentaire?: string;
  }[];
};