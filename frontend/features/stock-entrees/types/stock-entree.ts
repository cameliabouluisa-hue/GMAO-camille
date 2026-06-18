export type MaterielReceptionDto = {
  code: string;
  numeroSerie?: string;
};

export type LigneStockEntreeDto = {
  idArticle: number;
  idMagasin: number;
  idEmplacement?: number;
  quantite: number;
  prixUnitaire?: number;
  numeroLot?: string;
  datePeremption?: string;
  commentaire?: string;
  materiels?: MaterielReceptionDto[];
};
export type CreateStockEntreeDto = {
  numero?: string;
  dateReception?: string;
  commentaire?: string;
  lignes: LigneStockEntreeDto[];
};

export type StockEntree = {
  idEntreeStock: number;
  numero: string;
  dateReception: string;
  commentaire?: string | null;
  statut: string;
  createdAt: string;
  updatedAt: string;
  lignes?: StockEntreeLigne[];
};

export type StockEntreeLigne = {
  idLigneEntreeStock: number;
  idEntreeStock: number;
  idArticle: number;
  idMagasin: number;
  idEmplacement?: number | null;
  quantite: number | string;
  prixUnitaire?: number | string | null;
  numeroLot?: string | null;
  datePeremption?: string | null;
  commentaire?: string | null;

  article?: {
    idArticle: number;
    reference?: string | null;
    code?: string | null;
    designation?: string | null;
    libelle?: string | null;
    serialise?: boolean | null;
    gereEnStock?: boolean | null;
  } | null;

  magasin?: {
    idMagasin: number;
    code?: string | null;
    libelle?: string | null;
    nom?: string | null;
  } | null;

  materiels?: {
    idMateriel: number;
    code?: string | null;
    numeroSerie?: string | null;
  }[];
};