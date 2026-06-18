export type PlanPreventifEtat = 'ACTIF' | 'INACTIF' | 'BROUILLON';

export type PlanPreventifTypeDeclenchement = 'AUTOMATIQUE' | 'MANUEL';

export type PeriodiciteUnite = 'JOUR' | 'SEMAINE' | 'MOIS' | 'ANNEE';

export type TypeDeclencheur = 'CALENDAIRE' | 'COMPTEUR' | 'CONDITIONNEL';

export type Materiel = {
  idMateriel: number;
  code: string;
  numeroSerie?: string | null;
  idModele?: number | null;
  modele?: {
    idModele: number;
    code: string;
    libelle: string;
  } | null;
};

export type Gamme = {
  idGamme: number;
  code: string;
  libelle: string;
  typeMaintenance?: string | null;
};

export type PointMesure = {
  idPointMesure: number;
  code: string;
  libelle: string;
  type: 'COMPTEUR' | 'CONDITIONNEL' | string;
  unite?: string | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  derniereValeur?: number | string | null;
  derniereDate?: string | null;
  actif?: boolean | null;
};

export type PlanPreventifPredefini = {
  idPlanPreventifPredefini: number;
  code: string;
  titre: string;
  etat?: string | null;
  typeDeclenchement?: string | null;
  organisation?: string | null;
};

export type PlanPreventifDeclencheur = {
  idPlanPreventifDeclencheur: number;
  idPlanPreventif: number;
  idPppDeclencheurSource?: number | null;

  priorite?: number | null;
  etat?: string | null;
  typeDeclencheur?: TypeDeclencheur | string | null;

  idGamme?: number | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  idPointMesure?: number | null;
  idModele?: number | null;
  idFamille?: number | null;

  etatInterventionCible?: string | null;
  actualisation?: string | null;
  horizonJours?: number | null;
  toleranceJours?: number | null;

  periodiciteValeur?: number | null;
  periodiciteUnite?: PeriodiciteUnite | string | null;

  prochainLancementDate?: string | null;
  derniereRealisationDate?: string | null;
  derniereRealisationPrevueDate?: string | null;

  operateur?: string | null;
  seuilValeur?: number | string | null;

  prochainLancementValeur?: number | string | null;
  derniereRealisationValeur?: number | string | null;
  derniereRealisationPrevueValeur?: number | string | null;

  symptomeCode?: string | null;
  saisonnaliteDu?: string | null;
  saisonnaliteAu?: string | null;

  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;

  gamme?: Gamme | null;
  materiel?: Materiel | null;
  point_mesure?: PointMesure | null;
};

export type PlanPreventif = {
  idPlanPreventif: number;
  code: string;
  libelle: string;
  etat: PlanPreventifEtat | string;
  typeDeclenchement: PlanPreventifTypeDeclenchement | string;

  idMateriel?: number | null;
  idPointStructure?: number | null;
  idPlanPreventifPredefiniSource?: number | null;

  organisation?: string | null;
  masquerLignesInactives?: boolean;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;

  materiel?: Materiel | null;
  plan_preventif_predefini?: PlanPreventifPredefini | null;
  plan_preventif_declencheur?: PlanPreventifDeclencheur[];
};

export type CreatePlanPreventifPayload = {
  code?: string;
  libelle: string;
  etat?: string;
  typeDeclenchement?: string;
  idMateriel?: number;
  idPlanPreventifPredefiniSource?: number;
  organisation?: string;
  masquerLignesInactives?: boolean;
  actif?: boolean;
};

export type UpdatePlanPreventifPayload = Partial<CreatePlanPreventifPayload>;

export type CreatePlanPreventifDeclencheurPayload = {
  idPppDeclencheurSource?: number | null;

  priorite?: number;
  etat?: string;
  typeDeclencheur?: string;

  idGamme?: number;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  idPointMesure?: number | null;
  idModele?: number | null;
  idFamille?: number | null;

  etatInterventionCible?: string;
  actualisation?: string;

  horizonJours?: number | null;
  toleranceJours?: number | null;

  periodiciteValeur?: number | null;
  periodiciteUnite?: string | null;

  prochainLancementDate?: string | null;

  operateur?: string | null;
  seuilValeur?: number | null;

  prochainLancementValeur?: number | null;
  derniereRealisationValeur?: number | null;
  derniereRealisationPrevueValeur?: number | null;

  symptomeCode?: string | null;
  saisonnaliteDu?: string | null;
  saisonnaliteAu?: string | null;

  actif?: boolean;
};

export type UpdatePlanPreventifDeclencheurPayload =
  Partial<CreatePlanPreventifDeclencheurPayload>; 