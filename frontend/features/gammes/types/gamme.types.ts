export interface Gamme {
  idGamme: number;
  code?: string | null;
  libelle?: string | null;
  typeMaintenance?: string | null;
  etat?: string | null;
  organisation?: string | null;

  idModele?: number | null;
  idMateriel?: number | null;

  jourFin?: number | null;
  chargePrevue?: number | string | null;
  tempsArret?: number | string | null;
  receptionTravaux?: boolean | null;
  actif?: boolean | null;

  modele?: {
    idModele: number;
    code?: string | null;
    libelle?: string | null;
  } | null;

  materiel?: {
    idMateriel: number;
    code?: string | null;
    libelle?: string | null;
    numeroSerie?: string | null;
    idModele?: number | null;
    modele?: {
      idModele: number;
      code?: string | null;
      libelle?: string | null;
    } | null;
  } | null;

  gamme_operation?: GammeOperation[];
}

export interface GammeOperation {
  idOperation: number;
  ordre?: number | null;
  libelle?: string | null;
  description?: string | null;
  tempsStandard?: number | string | null;
  obligatoire?: boolean | null;
  idGamme?: number | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  idModele?: number | null;
  idFamille?: number | null;
}

export interface CreateGammePayload {
  code?: string;
  libelle?: string;
  typeMaintenance?: string;
  etat?: string;
  organisation?: string;

  idModele?: number | null;
  idMateriel?: number | null;

  jourFin?: number;
  chargePrevue?: number;
  tempsArret?: number;
  receptionTravaux?: boolean;
  actif?: boolean;
}

export interface UpdateGammePayload extends Partial<CreateGammePayload> {}

export interface CreateGammeOperationPayload {
  ordre?: number;
  libelle?: string;
  description?: string;
  tempsStandard?: number;
  obligatoire?: boolean;
  idPointStructure?: number;
  idMateriel?: number;
  idModele?: number;
  idFamille?: number;
}

export interface UpdateGammeOperationPayload
  extends Partial<CreateGammeOperationPayload> {}