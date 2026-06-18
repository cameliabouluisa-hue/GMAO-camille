export type FamilleArticle = {
  idFamille: number;
  code: string | null;
  libelle: string | null;
};

export type UniteArticle = {
  idUniteArticle: number;
  code: string;
  libelle: string;
};

export type ArticleReservation = {
  idArticle: number;
  reference: string | null;
  designation: string | null;
  idFamille: number | null;
  idUniteArticle: number | null;
  famille?: FamilleArticle | null;
  uniteArticle?: UniteArticle | null;
};

export type MagasinReservation = {
  idMagasin: number;
  code: string;
  libelle: string;
};

export type ReservationStock = {
  idReservationStock: number;
  numero: string;
  dateReservation: string;
  dateAnnulation: string | null;
  statut: 'VALIDEE' | 'ANNULEE' | string;
  idArticle: number;
  idMagasin: number;
  quantite: string | number;
  demandeur: string | null;
  origineType: string | null;
  origineId: number | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  article: ArticleReservation;
  magasin: MagasinReservation;
};

export type StockDisponibleReservation = {
  idStock: number;
  idArticle: number;
  idMagasin: number;
  quantitePhysique: string | number;
  quantiteReservee: string | number;
  quantiteDisponible: string | number;
  article: ArticleReservation;
  magasin: MagasinReservation;
};

export type CreateReservationPayload = {
  idArticle: number;
  idMagasin: number;
  quantite: number;
  demandeur?: string;
  origineType?: string;
  origineId?: number;
  commentaire?: string;
};