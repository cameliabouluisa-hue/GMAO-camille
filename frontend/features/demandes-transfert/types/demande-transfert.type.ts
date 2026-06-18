export type StatutDemandeTransfert =
  | 'EN_ATTENTE'
  | 'VALIDEE'
  | 'EXECUTEE'
  | 'ANNULEE';

export type Magasin = {
  idMagasin: number;
  code: string;
  libelle: string;
  actif?: boolean;
};

export type Article = {
  idArticle: number;
  reference: string | null;
  designation: string | null;
  famille?: {
    libelle: string | null;
  } | null;
  uniteArticle?: {
    code: string;
    libelle: string;
  } | null;
};

export type LigneDemandeTransfert = {
  idLigneDemandeTransfertStock: number;
  idDemandeTransfertStock: number;
  idArticle: number;
  quantite: number | string;
  commentaire: string | null;
  article: Article;
};

export type DemandeTransfert = {
  idDemandeTransfertStock: number;
  numero: string;
  dateDemande: string;
  dateValidation: string | null;
  dateExecution: string | null;
  dateAnnulation: string | null;
  statut: StatutDemandeTransfert;
  idMagasinSource: number;
  idMagasinDestination: number;
  demandeur: string | null;
  commentaire: string | null;
  magasinSource: Magasin;
  magasinDestination: Magasin;
  lignes: LigneDemandeTransfert[];
};

export type StockDisponibleTransfert = {
  idStock: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: number | string;
  quantiteReservee: number | string;
  quantiteDisponible: number | string;
  article: Article;
  magasin: Magasin;
};

export type CreateDemandeTransfertPayload = {
  idMagasinSource: number;
  idMagasinDestination: number;
  demandeur?: string;
  commentaire?: string;
  lignes: {
    idArticle: number;
    quantite: number;
    commentaire?: string;
  }[];
};