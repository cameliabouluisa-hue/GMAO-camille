export type StockArticleMagasin = {
  idStock: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: number | string;
  quantiteReservee: number | string;
  quantiteDisponible: number | string;
  createdAt: string;
  updatedAt: string;

  article?: {
    idArticle: number;
    reference?: string | null;
    code?: string | null;
    designation?: string | null;
    libelle?: string | null;
  };

  magasin?: {
    idMagasin: number;
    code?: string | null;
    nom?: string | null;
    libelle?: string | null;
  };
};

export type MouvementStock = {
  idMouvement: number;
  typeMouvement: string;
  dateMouvement: string;
  quantite: number | string;

  idArticle: number;
  idMateriel?: number | null;

  idMagasinSource?: number | null;
  idMagasinDestination?: number | null;

  origineType?: string | null;
  origineId?: number | null;

  commentaire?: string | null;

  article?: {
    idArticle: number;
    reference?: string | null;
    code?: string | null;
    designation?: string | null;
    libelle?: string | null;
  };

  materiel?: {
    idMateriel: number;
    code?: string | null;
    numeroSerie?: string | null;
  } | null;

  magasinSource?: {
    idMagasin: number;
    code?: string | null;
    nom?: string | null;
    libelle?: string | null;
  } | null;

  magasinDestination?: {
    idMagasin: number;
    code?: string | null;
    nom?: string | null;
    libelle?: string | null;
  } | null;
};