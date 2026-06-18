export type MaintenanceType = 'PREVENTIF' | 'CORRECTIF';

export type InterventionEtat =
  | 'A_PLANIFIER'
  | 'AFFECTEE'
  | 'AFFECTEE_EQUIPE'
  | 'REALISEE'
  | 'CLOTUREE'
  | 'ANNULEE';

export type DemandeStatut =
  | 'EN_ATTENTE_VALIDATION'
  | 'VALIDEE'
  | 'REFUSEE'
  | 'OT_GENERE';

export type Materiel = {
  idMateriel: number;
  code: string;
  numeroSerie?: string | null;
  modele?: {
    idModele: number;
    code: string;
    libelle: string;
  } | null;
  etat_materiel?: {
    idEtat: number;
    libelle: string;
  } | null;
  type_materiel?: {
    idType: number;
    libelle: string;
  } | null;
};

export type GammeOperation = {
  idOperation: number;
  ordre?: number | null;
  libelle?: string | null;
  tempsStandard?: number | string | null;
  description?: string | null;
  obligatoire?: boolean | null;
};

export type Gamme = {
  idGamme: number;
  code: string;
  libelle: string;
  typeMaintenance?: string | null;
  gamme_operation?: GammeOperation[];
};

export type OperationIntervention = {
  idOperation: number;
  ordre?: number | null;
  libelle?: string | null;
  tempsPasse?: number | string | null;
  idIntervention: number;
  description?: string | null;
  obligatoire?: boolean | null;
  idGammeOperationSource?: number | null;
};

export type Technicien = {
  idTechnicien: number;
  matricule: string;
  nom: string;
  idEquipe?: number | null;
  roleEquipe?: string | null;
};

export type AffectationTechnicien = {
  idAffectation: number;
  tempsTravail?: number | null;
  idTechnicien: number;
  idIntervention: number;
  dateAffectation?: string | null;
  affectePar?: string | null;
  technicien?: Technicien | null;
};

export type EquipeMaintenance = {
  idEquipe: number;
  code: string;
  libelle: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  actif?: boolean;
};

export type PlanPreventif = {
  idPlanPreventif: number;
  code: string;
  libelle?: string | null;
};

export type PlanPreventifDeclencheur = {
  idPlanPreventifDeclencheur: number;
  typeDeclencheur?: string | null;
  prochainLancementDate?: string | null;
  derniereRealisationDate?: string | null;
};

export type Intervention = {
  idIntervention: number;
  code: string;
  typeMaintenance: MaintenanceType;
  dateDebut?: string | null;
  dateFin?: string | null;
  etat: InterventionEtat;
  idMateriel?: number | null;
  idDemande?: number | null;
  idGamme?: number | null;
  idEquipe?: number | null;
  idPlanPreventif?: number | null;
  idPlanPreventifDeclencheur?: number | null;
  origineGeneration?: string | null;
  priorite?: string | null;
  description?: string | null;
  createdBy?: string | null;
  validatedBy?: string | null;
  assignedBy?: string | null;
  closedBy?: string | null;
  dateValidation?: string | null;
  dateAffectation?: string | null;
  dateCloture?: string | null;

  materiel?: Materiel | null;
  gamme?: Gamme | null;
  equipe_maintenance?: EquipeMaintenance | null;
  affectation_technicien?: AffectationTechnicien[];
  operation_intervention?: OperationIntervention[];
  demande_intervention?: DemandeIntervention | null;
  plan_preventif?: PlanPreventif | null;
  plan_preventif_declencheur?: PlanPreventifDeclencheur | null;
};

export type DemandeIntervention = {
  idDemande: number;
  dateDemande?: string | null;
  description?: string | null;
  statut: DemandeStatut;
  idMateriel?: number | null;
  priorite?: string | null;
  createdBy?: string | null;
  validatedBy?: string | null;
  dateValidation?: string | null;
  motifRefus?: string | null;
  materiel?: Materiel | null;
  intervention?: Intervention[];
};

export type InterventionDashboardResponse = {
  stats: {
    total: number;
    aPlanifier: number;
    affectees: number;
    realisees: number;
    cloturees: number;
    annulees?: number;
    preventives: number;
    correctives: number;
  };
  interventions: Intervention[];
};

export type DemandeDashboardResponse = {
  stats: {
    total: number;
    enAttente: number;
    validees: number;
    refusees: number;
    otGeneres: number;
    urgentes: number;
  };
  demandes: DemandeIntervention[];
};

export type MaintenanceDashboardData = {
  interventionsDashboard: InterventionDashboardResponse;
  demandesDashboard: DemandeDashboardResponse;
};