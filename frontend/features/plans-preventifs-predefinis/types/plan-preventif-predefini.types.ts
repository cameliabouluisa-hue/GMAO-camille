export interface PointMesureLite {
  idPointMesure: number;
  code: string;
  libelle: string;
  type: 'COMPTEUR' | 'CONDITIONNEL' | string;
  unite?: string | null;
  derniereValeur?: number | string | null;
  derniereDate?: string | null;
}

export interface PppDeclencheur {
  idPppDeclencheur: number;
  idPlanPreventifPredefini: number;
  priorite?: number | null;
  etat?: string | null;
  typeDeclencheur: string;

  idGamme: number;
  idModele?: number | null;
  idPointMesure?: number | null;

  etatInterventionCible?: string | null;
  horizonJours?: number | null;
  toleranceJours?: number | null;
  actualisation?: string | null;

  periodiciteValeur?: number | null;
  periodiciteUnite?: string | null;
  nombreJoursPremierLancement?: number | null;

  seuilValeur?: number | string | null;
  operateur?: string | null;

  symptomeCode?: string | null;
  saisonnaliteDu?: string | null;
  saisonnaliteAu?: string | null;
  actif?: boolean | null;

  gamme?: {
    idGamme: number;
    code?: string | null;
    libelle?: string | null;
    typeMaintenance?: string | null;
  } | null;

  modele?: {
    idModele: number;
    code?: string | null;
    libelle?: string | null;
  } | null;

  point_mesure?: PointMesureLite | null;
}

export interface PlanPreventifPredefini {
  idPlanPreventifPredefini: number;
  code: string;
  titre?: string | null;
  etat?: string | null;
  typeDeclenchement?: string | null;
  organisation?: string | null;
  
  actif?: boolean | null;
  createdAt?: string;
  updatedAt?: string;

  
  ppp_declencheur?: PppDeclencheur[];

  plan_preventif?: Array<{
    idPlanPreventif: number;
    code: string;
    libelle?: string | null;
  }>;

  idModele?: number | null;

modele?: {
  idModele: number;
  code: string | null;
  libelle: string | null;
} | null;
}

export type CreatePlanPreventifPredefiniPayload = {
  code: string;
  libelle?: string;
  etat?: string;
  organisation?: string;
  typeDeclenchement?: string;
  idModele?: number;
  actif?: boolean;
};

export type UpdatePlanPreventifPredefiniPayload =
  Partial<CreatePlanPreventifPredefiniPayload>;

export type CreatePppDeclencheurPayload = {
  priorite?: number;
  etat?: string;
  typeDeclencheur?: string;

  idGamme: number;
  idModele?: number | null;
  idPointMesure?: number | null;

  etatInterventionCible?: string;
  actualisation?: string;
  horizonJours?: number | null;
  toleranceJours?: number | null;

  periodiciteValeur?: number | null;
  periodiciteUnite?: string | null;
  nombreJoursPremierLancement?: number | null;

  operateur?: string | null;
  seuilValeur?: number | null;

  symptomeCode?: string;
  actif?: boolean;
};

export type UpdatePppDeclencheurPayload =
  Partial<CreatePppDeclencheurPayload>;

export type DeclencheurFormValues = {
  priorite: string;
  typeDeclencheur: string;
  idGamme: string;
  idModele: string;

  idPointMesure: string;

  horizonJours: string;
  toleranceJours: string;

  periodiciteValeur: string;
  periodiciteUnite: string;
  actif: boolean;
  nombreJoursPremierLancement: string;

  operateur: string;
  seuilValeur: string;
  symptomeCode: string;
};
