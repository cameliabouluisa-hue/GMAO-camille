export type PointMesureType = 'COMPTEUR' | 'CONDITIONNEL';

export type AssociationPointMesure = 'MATERIEL' | 'POINT_STRUCTURE';

export type PointMesure = {
  idPointMesure: number;
  code: string;
  libelle: string;
  type: PointMesureType | string;
  unite?: string | null;

  idPointStructure?: number | null;
  idMateriel?: number | null;

  derniereValeur?: number | string | null;
  derniereDate?: string | null;

  actif?: boolean | null;
  createdAt?: string;
  updatedAt?: string;

  point_structure?: {
    idPoint: number;
    code?: string | null;
    libelle?: string | null;
    typePoint?: string | null;
    actif?: boolean | null;
  } | null;

  materiel?: {
    idMateriel: number;
    code?: string | null;
    numeroSerie?: string | null;
    actif?: boolean | null;
  } | null;

organisation?: string | null;
valeurMin?: number | string | null;
valeurMax?: number | string | null;
nbDecimales?: number | null;
periodeReleveJours?: number | null;

surveillanceMin?: number | string | null;
surveillanceMax?: number | string | null;
correctionMin?: number | string | null;
correctionMax?: number | string | null;

emettreDi?: boolean;
envoyerAlerte?: boolean;
releves?: ReleveMesure[];

_count?: {
  releves: number;
};
};

export type CreatePointMesurePayload = {
  code: string;
  libelle: string;
  type: PointMesureType;
  unite?: string | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  actif?: boolean;
  organisation?: string | null;
  valeurMin?: number | string | null;
valeurMax?: number | string | null;
nbDecimales?: number | null;
periodeReleveJours?: number | null;

surveillanceMin?: number | string | null;
surveillanceMax?: number | string | null;
correctionMin?: number | string | null;
correctionMax?: number | string | null;

emettreDi?: boolean;
envoyerAlerte?: boolean;
};

export type UpdatePointMesurePayload = Partial<CreatePointMesurePayload>;

export type PointStructureOption = {
  idPoint: number;
  code?: string | null;
  libelle?: string | null;
  typePoint?: string | null;
  actif?: boolean | null;
};

export type MaterielOption = {
  idMateriel: number;
  code?: string | null;
  numeroSerie?: string | null;
  actif?: boolean | null;
  modele?: {
    idModele: number;
    code?: string | null;
    libelle?: string | null;
  } | null;
};
export type ReleveMesure = {
  idReleveMesure: number;
  idPointMesure: number;
  dateReleve: string;
  valeur: number | string;
  variation?: number | string | null;
  commentaire?: string | null;
  correction?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateReleveMesurePayload = {
  idPointMesure: number;
  dateReleve?: string;
  valeur: number;
  variation?: number | null;
  commentaire?: string | null;
  correction?: boolean;
};

export type UpdateReleveMesurePayload = Partial<CreateReleveMesurePayload>;