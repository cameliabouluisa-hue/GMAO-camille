export type InterventionEtat =
  | 'EN_PREPARATION'
  | 'ATTENTE_DEVIS'
  | 'ATTENTE_VALIDATION'
  | 'ATTENTE_FOURNITURE'
  | 'ATTENTE_REALISATION'
  | 'VALIDEE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'TRAVAUX_ACCEPTES'
  | 'TRAVAUX_REFUSES'
  | 'SOLDE'
  | 'ARCHIVE'
  | 'ANNULE'
  | string;

export type InterventionTypeMaintenance =
  | 'CORRECTIF'
  | 'PREVENTIF'
  | 'CONDITIONNEL'
  | string;

  export type CreateOperationInterventionDto = {
  ordre?: number;
  libelle: string;
  description?: string;
  tempsPasse?: number;
  obligatoire?: boolean;
};
export type LiteEntity = {
  code?: string | null;
  libelle?: string | null;
};

export type MaterielLite = LiteEntity & {
  idMateriel: number;
  numeroSerie?: string | null;
  idPointStructure?: number | null;
  point_structure?: PointStructureLite | null;
};

export type PointStructureLite = LiteEntity & {
  idPoint: number;
};

export type ArticleLite = {
  idArticle: number;
  reference?: string | null;
  designation?: string | null;
  libelle?: string | null;
  actif?: boolean | null;
  gereEnStock?: boolean | null;
};

export type MagasinLite = LiteEntity & {
  idMagasin: number;
  actif?: boolean | null;
};

export type TechnicienLite = {
  idTechnicien: number;
  matricule?: string | null;
  nom?: string | null;
  roleEquipe?: string | null;
};

export type EquipeMaintenanceLite = LiteEntity & {
  idEquipe: number;
  actif?: boolean | null;
};

export type DemandeInterventionLite = {
  idDemande: number;
  code?: string | null;
  statut?: string | null;
  description?: string | null;
};

export type GammeLite = LiteEntity & {
  idGamme: number;
};

export type PlanPreventifLite = LiteEntity & {
  idPlanPreventif: number;
  idMateriel?: number | null;
  idPointStructure?: number | null;
  plan_preventif_declencheur?: PlanPreventifDeclencheurLite[];
};

export type PlanPreventifDeclencheurLite = {
  idPlanPreventifDeclencheur: number;
  idPlanPreventif?: number | null;
  typeDeclencheur?: string | null;
  etat?: string | null;
  idGamme?: number | null;
  idPointStructure?: number | null;
  idMateriel?: number | null;
  periodiciteValeur?: number | null;
  periodiciteUnite?: string | null;
  gamme?: GammeLite | null;
};

export type InterventionReferenceData = {
  materiels: MaterielLite[];
  pointsStructure: PointStructureLite[];
  demandes: DemandeInterventionLite[];
  plansPreventifs: PlanPreventifLite[];
  declencheurs: PlanPreventifDeclencheurLite[];
  gammes: GammeLite[];
  equipes: EquipeMaintenanceLite[];
  techniciens: TechnicienLite[];
  articles: ArticleLite[];
  magasins: MagasinLite[];
};

export type AffectationTechnicien = {
  idAffectation: number;
  tempsTravail?: number | null;
  idTechnicien?: number | null;
  idIntervention?: number | null;
  affectePar?: string | null;
  dateAffectation?: string | null;
  technicien?: TechnicienLite | null;
};

export type OperationIntervention = {
  idOperation: number;
  ordre?: number | null;
  libelle?: string | null;
  tempsPasse?: number | null;
  idIntervention?: number | null;
  description?: string | null;
  obligatoire?: boolean | null;
};

export type OccupationIntervention = {
  idOccupation: number;
  idIntervention: number;
  idTechnicien?: number | null;
  idOperation?: number | null;
  dateOccupation: string;
  duree: number | string;
  natureOccupation?: string | null;
  typeHoraire?: string | null;
  commentaire?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  technicien?: TechnicienLite | null;
  operation?: OperationIntervention | null;
};

export type CompteRenduIntervention = {
  idCompteRendu: number;
  idIntervention: number;
  dateCompteRendu?: string | null;
  saisiPar?: string | null;
  travauxEffectues?: string | null;
  diagnostic?: string | null;
  cause?: string | null;
  remede?: string | null;
  observation?: string | null;
  resultat?: string | null;
  tempsArret?: number | string | null;
  dureeReelle?: number | string | null;
};

export type ConsommationIntervention = {
  idConsommation: number;
  quantite: number | string;
  prixUnitaire?: number | string | null;
  coutTotal?: number | string | null;
  quantiteRetournee?: number | string | null;
  statut?: string | null;
  commentaire?: string | null;
  idArticle: number;
  idIntervention: number;
  idMagasin?: number | null;
  idSortieStockLigne?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  motifAnnulation?: string | null;
  article?: ArticleLite | null;
  magasin?: MagasinLite | null;
};

export type SortieStockLigneIntervention = {
  idLigneSortieStock: number;
  idArticle: number;
  idMagasin: number;
  quantite: number | string;
  prixUnitaire?: number | string | null;
  commentaire?: string | null;
  article?: ArticleLite | null;
  magasin?: MagasinLite | null;
};

export type SortieStockIntervention = {
  idSortieStock: number;
  numero: string;
  dateSortie?: string | null;
  statut?: string | null;
  commentaire?: string | null;
  lignes?: SortieStockLigneIntervention[];
};

export type HistoriqueEtatIntervention = {
  idHistoriqueEtat: number;
  idIntervention: number;
  ancienEtat?: string | null;
  nouvelEtat: string;
  action?: string | null;
  commentaire?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

export type Intervention = {
  idIntervention: number;
  code?: string | null;
  libelle?: string | null;
  description?: string | null;
  typeMaintenance?: InterventionTypeMaintenance | null;
  typeIntervention?: string | null;
  natureIntervention?: string | null;
  niveauMaintenance?: string | null;
  priorite?: string | null;
  criticite?: string | null;
  centreCout?: string | null;
  etat?: InterventionEtat | null;
  origineGeneration?: string | null;
  idMateriel?: number | null;
  idPointStructure?: number | null;
  idDemande?: number | null;
  idGamme?: number | null;
  idEquipe?: number | null;
  idPlanPreventif?: number | null;
  idPlanPreventifDeclencheur?: number | null;
  dateDebutPrevue?: string | null;
  dateFinPrevue?: string | null;
  dateDebutReelle?: string | null;
  dateFinReelle?: string | null;
  dateSouhaiteeFin?: string | null;
  dateAffectation?: string | null;
  dateValidation?: string | null;
  dateCloture?: string | null;
  dateAnnulation?: string | null;
  dateArchivage?: string | null;
  chargePrevue?: number | string | null;
  chargeRevisee?: number | string | null;
  chargeReelle?: number | string | null;
  dureePrevue?: number | string | null;
  dureeReelle?: number | string | null;
  tempsArretPrevu?: number | string | null;
  tempsArretReel?: number | string | null;
  materielEnPanne?: boolean | null;
  materielIndisponible?: boolean | null;
  arretMateriel?: boolean | null;
  arretProduction?: boolean | null;
  receptionTravaux?: boolean | null;
  symptome?: string | null;
  cause?: string | null;
  remede?: string | null;
  diagnosticInitial?: string | null;
  instructions?: string | null;
  commentaireRealisation?: string | null;
  motifAnnulation?: string | null;
  motifReport?: string | null;
  createdBy?: string | null;
  assignedBy?: string | null;
  startedBy?: string | null;
  validatedBy?: string | null;
  closedBy?: string | null;
  cancelledBy?: string | null;
  archivedBy?: string | null;
  reportedBy?: string | null;
  coutPiecesReel?: number | string | null;
  coutTotalReel?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  materiel?: MaterielLite | null;
  demande_intervention?: DemandeInterventionLite | null;
  gamme?: GammeLite | null;
  equipe_maintenance?: EquipeMaintenanceLite | null;
  plan_preventif?: PlanPreventifLite | null;
  plan_preventif_declencheur?: PlanPreventifDeclencheurLite | null;
  affectation_technicien?: AffectationTechnicien[];
  operation_intervention?: OperationIntervention[];
  consommations?: ConsommationIntervention[];
  occupations?: OccupationIntervention[];
  sortieStocks?: SortieStockIntervention[];
  compteRendu?: CompteRenduIntervention | null;
  historiquesEtat?: HistoriqueEtatIntervention[];
};

export type InterventionFilters = {
  etat?: string;
  typeMaintenance?: string;
  idMateriel?: number | string;
  idEquipe?: number | string;
};

export type CreateInterventionDto = {
  code?: string;
  libelle?: string;
  description?: string;
  typeMaintenance: string;
  typeIntervention?: string;
  natureIntervention?: string;
  priorite?: string;
  criticite?: string;
  centreCout?: string;
  idMateriel?: number;
  idPointStructure?: number;
  idDemande?: number;
  idGamme?: number;
  idEquipe?: number;
  idPlanPreventif?: number;
  idPlanPreventifDeclencheur?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateSouhaiteeFin?: string;
  dateFixe?: boolean;
  aPlanifier?: boolean;
  materielEnPanne?: boolean;
  materielIndisponible?: boolean;
  arretMateriel?: boolean;
  receptionTravaux?: boolean;
  symptome?: string;
  cause?: string;
  remede?: string;
  diagnosticInitial?: string;
  instructions?: string;
  chargePrevue?: number;
  tempsArretPrevu?: number;
  createdBy?: string;
};

export type UpdateInterventionDto = Partial<CreateInterventionDto> & {
  dateDebutReelle?: string;
  dateFinReelle?: string;
  chargeRevisee?: number;
  chargeReelle?: number;
  tempsArretReel?: number;
};

export type ChangementEtatDto = {
  utilisateur?: string;
  commentaire?: string;
};

export type DemarrerInterventionDto = {
  dateDebutReelle?: string;
  startedBy?: string;
  commentaire?: string;
};

export type TerminerInterventionDto = {
  dateFinReelle?: string;
  dureeReelle?: number;
  tempsArretReel?: number;
  commentaire?: string;
  reportedBy?: string;
};

export type RefuserTravauxDto = {
  utilisateur?: string;
  motifRefusTravaux: string;
};

export type AffecterEquipeDto = {
  idEquipe: number;
  assignedBy?: string;
};

export type AffecterTechnicienDto = {
  idTechnicien: number;
  tempsTravail?: number;
  affectePar?: string;
};

export type CreateOccupationInterventionDto = {
  idTechnicien?: number;
  idOperation?: number;
  dateOccupation: string;
  duree: number;
  natureOccupation?: string;
  typeHoraire?: string;
  commentaire?: string;
  createdBy?: string;
};

export type UpsertCompteRenduInterventionDto = {
  dateCompteRendu?: string;
  saisiPar?: string;
  travauxEffectues?: string;
  diagnostic?: string;
  cause?: string;
  remede?: string;
  observation?: string;
  resultat?: string;
  tempsArret?: number;
  dureeReelle?: number;
};

export type CreateConsommationInterventionDto = {
  idArticle: number;
  idMagasin: number;
  quantite: number;
  prixUnitaire?: number;
  commentaire?: string;
  createdBy?: string;
};

export type AnnulerConsommationInterventionDto = {
  cancelledBy?: string;
  motifAnnulation?: string;
};
