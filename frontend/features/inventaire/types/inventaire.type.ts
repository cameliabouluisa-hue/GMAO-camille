export type InventaireMagasin = {
  idMagasin: number;
  code: string;
  libelle: string;
};

export type InventaireStockLigne = {
  idStock: number;

  idArticle: number;
  reference: string | null;
  designation: string | null;
  unite: string | null;
  serialise: boolean;
  famille: string | null;
  modele: string | null;

  idMagasin: number;
  magasinCode: string;
  magasinLibelle: string;

  quantiteTheorique: number;
  quantiteReservee: number;
  quantiteDisponible: number;
};

export type ValiderInventairePayload = {
  idMagasin: number;
  commentaire?: string;
  lignes: {
    idArticle: number;
    quantiteReelle: number;
  }[];
};

export type ValiderInventaireResponse = {
  message: string;
  lignesControlees: number;
  mouvementsCrees: number;
  totalEcartsAbs: number;
  lignes: {
    idArticle: number;
    reference: string | null;
    designation: string | null;
    quantiteTheorique: number;
    quantiteReelle: number;
    ecart: number;
  }[];
};