export const ROLE_CODES = {
  ADMIN: 'ADMIN',
  RESPONSABLE_MAINTENANCE: 'RESPONSABLE_MAINTENANCE',
  TECHNICIEN: 'TECHNICIEN',
  DEMANDEUR: 'DEMANDEUR',
  MAGASINIER: 'MAGASINIER',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const ROLE_LABELS: Record<RoleCode, string> = {
  [ROLE_CODES.ADMIN]: 'Administrateur',
  [ROLE_CODES.RESPONSABLE_MAINTENANCE]: 'Responsable maintenance',
  [ROLE_CODES.TECHNICIEN]: 'Technicien',
  [ROLE_CODES.DEMANDEUR]: 'Demandeur',
  [ROLE_CODES.MAGASINIER]: 'Magasinier',
};

export const PRIVILEGE_CODES = {
  // =========================
  // DASHBOARDS / RAPPORTS
  // =========================
  DASHBOARD_GENERAL_VIEW: 'DASHBOARD_GENERAL_VIEW',
  DASHBOARD_EQUIPEMENTS_VIEW: 'DASHBOARD_EQUIPEMENTS_VIEW',
  DASHBOARD_MAINTENANCE_VIEW: 'DASHBOARD_MAINTENANCE_VIEW',
  DASHBOARD_STOCK_VIEW: 'DASHBOARD_STOCK_VIEW',
  REPORTS_VIEW: 'REPORTS_VIEW',

  // =========================
  // ADMINISTRATION
  // =========================
  USERS_VIEW: 'USERS_VIEW',
  USERS_CREATE: 'USERS_CREATE',
  USERS_UPDATE: 'USERS_UPDATE',
  USERS_DISABLE: 'USERS_DISABLE',
  USERS_DELETE: 'USERS_DELETE',

  ROLES_VIEW: 'ROLES_VIEW',
  ROLES_MANAGE: 'ROLES_MANAGE',

  PRIVILEGES_VIEW: 'PRIVILEGES_VIEW',
  PRIVILEGES_MANAGE: 'PRIVILEGES_MANAGE',

  SYSTEM_CONFIG: 'SYSTEM_CONFIG',

  // =========================
  // ÉQUIPEMENTS / RÉFÉRENTIEL TECHNIQUE
  // =========================
  EQUIPEMENTS_VIEW: 'EQUIPEMENTS_VIEW',

  MATERIEL_VIEW: 'MATERIEL_VIEW',
  MATERIEL_CREATE: 'MATERIEL_CREATE',
  MATERIEL_UPDATE: 'MATERIEL_UPDATE',
  MATERIEL_DELETE: 'MATERIEL_DELETE',
  MATERIEL_RESTORE: 'MATERIEL_RESTORE',

  MODELE_VIEW: 'MODELE_VIEW',
  MODELE_CREATE: 'MODELE_CREATE',
  MODELE_UPDATE: 'MODELE_UPDATE',
  MODELE_DELETE: 'MODELE_DELETE',

  ARBORESCENCE_VIEW: 'ARBORESCENCE_VIEW',
  ARBORESCENCE_MANAGE: 'ARBORESCENCE_MANAGE',

  POINT_STRUCTURE_VIEW: 'POINT_STRUCTURE_VIEW',
  POINT_STRUCTURE_CREATE: 'POINT_STRUCTURE_CREATE',
  POINT_STRUCTURE_UPDATE: 'POINT_STRUCTURE_UPDATE',
  POINT_STRUCTURE_DELETE: 'POINT_STRUCTURE_DELETE',

  POINT_MESURE_VIEW: 'POINT_MESURE_VIEW',
  POINT_MESURE_CREATE: 'POINT_MESURE_CREATE',
  POINT_MESURE_UPDATE: 'POINT_MESURE_UPDATE',
  POINT_MESURE_DELETE: 'POINT_MESURE_DELETE',

  RELEVE_MESURE_VIEW: 'RELEVE_MESURE_VIEW',
  RELEVE_MESURE_CREATE: 'RELEVE_MESURE_CREATE',
  RELEVE_MESURE_UPDATE: 'RELEVE_MESURE_UPDATE',
  RELEVE_MESURE_DELETE: 'RELEVE_MESURE_DELETE',

  FAMILLE_VIEW: 'FAMILLE_VIEW',
  FAMILLE_MANAGE: 'FAMILLE_MANAGE',

  FABRICANT_VIEW: 'FABRICANT_VIEW',
  FABRICANT_MANAGE: 'FABRICANT_MANAGE',

  MARQUE_VIEW: 'MARQUE_VIEW',
  MARQUE_MANAGE: 'MARQUE_MANAGE',

  TYPE_EQUIPEMENT_VIEW: 'TYPE_EQUIPEMENT_VIEW',
  TYPE_EQUIPEMENT_MANAGE: 'TYPE_EQUIPEMENT_MANAGE',

  ETAT_MODELE_VIEW: 'ETAT_MODELE_VIEW',
  ETAT_MODELE_MANAGE: 'ETAT_MODELE_MANAGE',

  // =========================
  // MAINTENANCE / DI / INTERVENTIONS
  // =========================
  MAINTENANCE_VIEW: 'MAINTENANCE_VIEW',

  DI_VIEW_ALL: 'DI_VIEW_ALL',
  DI_VIEW_OWN: 'DI_VIEW_OWN',
  DI_CREATE: 'DI_CREATE',
  DI_UPDATE: 'DI_UPDATE',
  DI_SUBMIT: 'DI_SUBMIT',
  DI_ACCEPT: 'DI_ACCEPT',
  DI_REFUSE: 'DI_REFUSE',
  DI_VALIDATE_WORKS: 'DI_VALIDATE_WORKS',
  DI_CLOSE: 'DI_CLOSE',
  DI_DELETE: 'DI_DELETE',

  INTERVENTION_VIEW_ALL: 'INTERVENTION_VIEW_ALL',
  INTERVENTION_VIEW_ASSIGNED: 'INTERVENTION_VIEW_ASSIGNED',
  INTERVENTION_CREATE: 'INTERVENTION_CREATE',
  INTERVENTION_UPDATE: 'INTERVENTION_UPDATE',
  INTERVENTION_PLANIFY: 'INTERVENTION_PLANIFY',
  INTERVENTION_ASSIGN: 'INTERVENTION_ASSIGN',
  INTERVENTION_START: 'INTERVENTION_START',
  INTERVENTION_REPORT: 'INTERVENTION_REPORT',
  INTERVENTION_COMPLETE: 'INTERVENTION_COMPLETE',
  INTERVENTION_CLOSE: 'INTERVENTION_CLOSE',
  INTERVENTION_CANCEL: 'INTERVENTION_CANCEL',
  INTERVENTION_DELETE: 'INTERVENTION_DELETE',

  GAMME_VIEW: 'GAMME_VIEW',
  GAMME_CREATE: 'GAMME_CREATE',
  GAMME_UPDATE: 'GAMME_UPDATE',
  GAMME_DELETE: 'GAMME_DELETE',

  PLAN_PREVENTIF_VIEW: 'PLAN_PREVENTIF_VIEW',
  PLAN_PREVENTIF_CREATE: 'PLAN_PREVENTIF_CREATE',
  PLAN_PREVENTIF_UPDATE: 'PLAN_PREVENTIF_UPDATE',
  PLAN_PREVENTIF_DELETE: 'PLAN_PREVENTIF_DELETE',
  PLAN_PREVENTIF_GENERATE_INTERVENTIONS:
    'PLAN_PREVENTIF_GENERATE_INTERVENTIONS',

  PLAN_PREVENTIF_PREDEFINI_VIEW: 'PLAN_PREVENTIF_PREDEFINI_VIEW',
  PLAN_PREVENTIF_PREDEFINI_CREATE: 'PLAN_PREVENTIF_PREDEFINI_CREATE',
  PLAN_PREVENTIF_PREDEFINI_UPDATE: 'PLAN_PREVENTIF_PREDEFINI_UPDATE',
  PLAN_PREVENTIF_PREDEFINI_DELETE: 'PLAN_PREVENTIF_PREDEFINI_DELETE',

  HISTORIQUE_PREVENTIF_VIEW: 'HISTORIQUE_PREVENTIF_VIEW',

  // =========================
  // STOCK / ARTICLES / MOUVEMENTS
  // =========================
  STOCK_VIEW: 'STOCK_VIEW',

  ARTICLE_VIEW: 'ARTICLE_VIEW',
  ARTICLE_CREATE: 'ARTICLE_CREATE',
  ARTICLE_UPDATE: 'ARTICLE_UPDATE',
  ARTICLE_DELETE: 'ARTICLE_DELETE',
  ARTICLE_RESTORE: 'ARTICLE_RESTORE',

  UNITE_ARTICLE_VIEW: 'UNITE_ARTICLE_VIEW',
  UNITE_ARTICLE_MANAGE: 'UNITE_ARTICLE_MANAGE',

  MAGASIN_VIEW: 'MAGASIN_VIEW',
  MAGASIN_CREATE: 'MAGASIN_CREATE',
  MAGASIN_UPDATE: 'MAGASIN_UPDATE',
  MAGASIN_DELETE: 'MAGASIN_DELETE',

  EMPLACEMENT_VIEW: 'EMPLACEMENT_VIEW',
  EMPLACEMENT_MANAGE: 'EMPLACEMENT_MANAGE',

  ENTREE_STOCK_VIEW: 'ENTREE_STOCK_VIEW',
  ENTREE_STOCK_CREATE: 'ENTREE_STOCK_CREATE',
  ENTREE_STOCK_VALIDATE: 'ENTREE_STOCK_VALIDATE',
  ENTREE_STOCK_CANCEL: 'ENTREE_STOCK_CANCEL',

  SORTIE_STOCK_VIEW: 'SORTIE_STOCK_VIEW',
  SORTIE_STOCK_CREATE: 'SORTIE_STOCK_CREATE',
  SORTIE_STOCK_VALIDATE: 'SORTIE_STOCK_VALIDATE',
  SORTIE_STOCK_CANCEL: 'SORTIE_STOCK_CANCEL',

  MOUVEMENT_STOCK_VIEW: 'MOUVEMENT_STOCK_VIEW',

  RESERVATION_VIEW: 'RESERVATION_VIEW',
  RESERVATION_CREATE: 'RESERVATION_CREATE',
  RESERVATION_UPDATE: 'RESERVATION_UPDATE',
  RESERVATION_VALIDATE: 'RESERVATION_VALIDATE',
  RESERVATION_CANCEL: 'RESERVATION_CANCEL',

  DEMANDE_TRANSFERT_VIEW: 'DEMANDE_TRANSFERT_VIEW',
  DEMANDE_TRANSFERT_CREATE: 'DEMANDE_TRANSFERT_CREATE',
  DEMANDE_TRANSFERT_VALIDATE: 'DEMANDE_TRANSFERT_VALIDATE',
  DEMANDE_TRANSFERT_EXECUTE: 'DEMANDE_TRANSFERT_EXECUTE',
  DEMANDE_TRANSFERT_CANCEL: 'DEMANDE_TRANSFERT_CANCEL',

  REAPPROVISIONNEMENT_VIEW: 'REAPPROVISIONNEMENT_VIEW',
  REAPPROVISIONNEMENT_CREATE: 'REAPPROVISIONNEMENT_CREATE',
  REAPPROVISIONNEMENT_UPDATE: 'REAPPROVISIONNEMENT_UPDATE',
  REAPPROVISIONNEMENT_VALIDATE: 'REAPPROVISIONNEMENT_VALIDATE',
  REAPPROVISIONNEMENT_CANCEL: 'REAPPROVISIONNEMENT_CANCEL',

  INVENTAIRE_VIEW: 'INVENTAIRE_VIEW',
  INVENTAIRE_CREATE: 'INVENTAIRE_CREATE',
  INVENTAIRE_UPDATE: 'INVENTAIRE_UPDATE',
  INVENTAIRE_VALIDATE: 'INVENTAIRE_VALIDATE',
  INVENTAIRE_CLOSE: 'INVENTAIRE_CLOSE',

  INVENTAIRE_PREPARE_VIEW: 'INVENTAIRE_PREPARE_VIEW',
  INVENTAIRE_PREPARE_CREATE: 'INVENTAIRE_PREPARE_CREATE',
  INVENTAIRE_PREPARE_UPDATE: 'INVENTAIRE_PREPARE_UPDATE',
  INVENTAIRE_PREPARE_DELETE: 'INVENTAIRE_PREPARE_DELETE',
  INVENTAIRE_PREPARE_LAUNCH: 'INVENTAIRE_PREPARE_LAUNCH',

  STOCK_CONSUMPTION_DECLARE: 'STOCK_CONSUMPTION_DECLARE',
  STOCK_CONSUMPTION_VIEW: 'STOCK_CONSUMPTION_VIEW',
} as const;

export type PrivilegeCode =
  (typeof PRIVILEGE_CODES)[keyof typeof PRIVILEGE_CODES];

export type PrivilegeModule =
  | 'DASHBOARD'
  | 'ADMINISTRATION'
  | 'EQUIPEMENTS'
  | 'MAINTENANCE'
  | 'STOCK';

export type PrivilegeDefinition = {
  code: PrivilegeCode;
  libelle: string;
  module: PrivilegeModule;
  description?: string;
};

export const PRIVILEGES: PrivilegeDefinition[] = [
  // DASHBOARDS
  {
    code: PRIVILEGE_CODES.DASHBOARD_GENERAL_VIEW,
    libelle: 'Consulter le tableau de bord général',
    module: 'DASHBOARD',
  },
  {
    code: PRIVILEGE_CODES.DASHBOARD_EQUIPEMENTS_VIEW,
    libelle: 'Consulter le tableau de bord équipements',
    module: 'DASHBOARD',
  },
  {
    code: PRIVILEGE_CODES.DASHBOARD_MAINTENANCE_VIEW,
    libelle: 'Consulter le tableau de bord maintenance',
    module: 'DASHBOARD',
  },
  {
    code: PRIVILEGE_CODES.DASHBOARD_STOCK_VIEW,
    libelle: 'Consulter le tableau de bord stock',
    module: 'DASHBOARD',
  },
  {
    code: PRIVILEGE_CODES.REPORTS_VIEW,
    libelle: 'Consulter les rapports et indicateurs',
    module: 'DASHBOARD',
  },

  // ADMINISTRATION
  {
    code: PRIVILEGE_CODES.USERS_VIEW,
    libelle: 'Consulter les utilisateurs',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.USERS_CREATE,
    libelle: 'Créer un utilisateur',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.USERS_UPDATE,
    libelle: 'Modifier un utilisateur',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.USERS_DISABLE,
    libelle: 'Activer ou désactiver un utilisateur',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.USERS_DELETE,
    libelle: 'Supprimer un utilisateur',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.ROLES_VIEW,
    libelle: 'Consulter les rôles',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.ROLES_MANAGE,
    libelle: 'Gérer les rôles',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.PRIVILEGES_VIEW,
    libelle: 'Consulter les privilèges',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.PRIVILEGES_MANAGE,
    libelle: 'Gérer les privilèges',
    module: 'ADMINISTRATION',
  },
  {
    code: PRIVILEGE_CODES.SYSTEM_CONFIG,
    libelle: 'Gérer la configuration système',
    module: 'ADMINISTRATION',
  },

  // EQUIPEMENTS
  {
    code: PRIVILEGE_CODES.EQUIPEMENTS_VIEW,
    libelle: 'Accéder au module équipements',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MATERIEL_VIEW,
    libelle: 'Consulter les matériels',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MATERIEL_CREATE,
    libelle: 'Créer un matériel',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MATERIEL_UPDATE,
    libelle: 'Modifier un matériel',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MATERIEL_DELETE,
    libelle: 'Supprimer un matériel',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MATERIEL_RESTORE,
    libelle: 'Restaurer un matériel',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MODELE_VIEW,
    libelle: 'Consulter les modèles',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MODELE_CREATE,
    libelle: 'Créer un modèle',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MODELE_UPDATE,
    libelle: 'Modifier un modèle',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MODELE_DELETE,
    libelle: 'Supprimer un modèle',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.ARBORESCENCE_VIEW,
    libelle: 'Consulter les arborescences',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.ARBORESCENCE_MANAGE,
    libelle: 'Gérer les arborescences',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_STRUCTURE_VIEW,
    libelle: 'Consulter les points de structure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_STRUCTURE_CREATE,
    libelle: 'Créer un point de structure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_STRUCTURE_UPDATE,
    libelle: 'Modifier un point de structure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_STRUCTURE_DELETE,
    libelle: 'Supprimer un point de structure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_MESURE_VIEW,
    libelle: 'Consulter les points de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_MESURE_CREATE,
    libelle: 'Créer un point de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_MESURE_UPDATE,
    libelle: 'Modifier un point de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.POINT_MESURE_DELETE,
    libelle: 'Supprimer un point de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.RELEVE_MESURE_VIEW,
    libelle: 'Consulter les relevés de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.RELEVE_MESURE_CREATE,
    libelle: 'Saisir un relevé de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.RELEVE_MESURE_UPDATE,
    libelle: 'Modifier un relevé de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.RELEVE_MESURE_DELETE,
    libelle: 'Supprimer un relevé de mesure',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.FAMILLE_VIEW,
    libelle: 'Consulter les familles',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.FAMILLE_MANAGE,
    libelle: 'Gérer les familles',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.FABRICANT_VIEW,
    libelle: 'Consulter les fabricants',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.FABRICANT_MANAGE,
    libelle: 'Gérer les fabricants',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MARQUE_VIEW,
    libelle: 'Consulter les marques',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.MARQUE_MANAGE,
    libelle: 'Gérer les marques',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.TYPE_EQUIPEMENT_VIEW,
    libelle: 'Consulter les types d’équipement',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.TYPE_EQUIPEMENT_MANAGE,
    libelle: 'Gérer les types d’équipement',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.ETAT_MODELE_VIEW,
    libelle: 'Consulter les états des modèles',
    module: 'EQUIPEMENTS',
  },
  {
    code: PRIVILEGE_CODES.ETAT_MODELE_MANAGE,
    libelle: 'Gérer les états des modèles',
    module: 'EQUIPEMENTS',
  },

  // MAINTENANCE
  {
    code: PRIVILEGE_CODES.MAINTENANCE_VIEW,
    libelle: 'Accéder au module maintenance',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_VIEW_ALL,
    libelle: 'Consulter toutes les demandes d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_VIEW_OWN,
    libelle: 'Consulter ses propres demandes d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_CREATE,
    libelle: 'Créer une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_UPDATE,
    libelle: 'Modifier une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_SUBMIT,
    libelle: 'Soumettre une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_ACCEPT,
    libelle: 'Accepter une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_REFUSE,
    libelle: 'Refuser une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_VALIDATE_WORKS,
    libelle: 'Valider les travaux liés à une demande',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_CLOSE,
    libelle: 'Clôturer une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.DI_DELETE,
    libelle: 'Supprimer une demande d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_VIEW_ALL,
    libelle: 'Consulter toutes les interventions',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_VIEW_ASSIGNED,
    libelle: 'Consulter les interventions affectées',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_CREATE,
    libelle: 'Créer une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_UPDATE,
    libelle: 'Modifier une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_PLANIFY,
    libelle: 'Planifier une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_ASSIGN,
    libelle: 'Affecter une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_START,
    libelle: 'Démarrer une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_REPORT,
    libelle: 'Renseigner le compte rendu d’intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_COMPLETE,
    libelle: 'Proposer ou marquer la fin d’une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_CLOSE,
    libelle: 'Clôturer une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_CANCEL,
    libelle: 'Annuler une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.INTERVENTION_DELETE,
    libelle: 'Supprimer une intervention',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.GAMME_VIEW,
    libelle: 'Consulter les gammes',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.GAMME_CREATE,
    libelle: 'Créer une gamme',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.GAMME_UPDATE,
    libelle: 'Modifier une gamme',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.GAMME_DELETE,
    libelle: 'Supprimer une gamme',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_VIEW,
    libelle: 'Consulter les plans préventifs',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_CREATE,
    libelle: 'Créer un plan préventif',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_UPDATE,
    libelle: 'Modifier un plan préventif',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_DELETE,
    libelle: 'Supprimer un plan préventif',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_GENERATE_INTERVENTIONS,
    libelle: 'Générer les interventions préventives',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_VIEW,
    libelle: 'Consulter les plans préventifs prédéfinis',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_CREATE,
    libelle: 'Créer un plan préventif prédéfini',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_UPDATE,
    libelle: 'Modifier un plan préventif prédéfini',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_DELETE,
    libelle: 'Supprimer un plan préventif prédéfini',
    module: 'MAINTENANCE',
  },
  {
    code: PRIVILEGE_CODES.HISTORIQUE_PREVENTIF_VIEW,
    libelle: 'Consulter l’historique des déclenchements préventifs',
    module: 'MAINTENANCE',
  },

  // STOCK
  {
    code: PRIVILEGE_CODES.STOCK_VIEW,
    libelle: 'Accéder au module stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ARTICLE_VIEW,
    libelle: 'Consulter les articles',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ARTICLE_CREATE,
    libelle: 'Créer un article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ARTICLE_UPDATE,
    libelle: 'Modifier un article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ARTICLE_DELETE,
    libelle: 'Supprimer un article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ARTICLE_RESTORE,
    libelle: 'Restaurer un article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.UNITE_ARTICLE_VIEW,
    libelle: 'Consulter les unités d’article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.UNITE_ARTICLE_MANAGE,
    libelle: 'Gérer les unités d’article',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.MAGASIN_VIEW,
    libelle: 'Consulter les magasins',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.MAGASIN_CREATE,
    libelle: 'Créer un magasin',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.MAGASIN_UPDATE,
    libelle: 'Modifier un magasin',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.MAGASIN_DELETE,
    libelle: 'Supprimer un magasin',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.EMPLACEMENT_VIEW,
    libelle: 'Consulter les emplacements',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.EMPLACEMENT_MANAGE,
    libelle: 'Gérer les emplacements',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ENTREE_STOCK_VIEW,
    libelle: 'Consulter les entrées stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ENTREE_STOCK_CREATE,
    libelle: 'Créer une entrée stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ENTREE_STOCK_VALIDATE,
    libelle: 'Valider une entrée stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.ENTREE_STOCK_CANCEL,
    libelle: 'Annuler une entrée stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.SORTIE_STOCK_VIEW,
    libelle: 'Consulter les sorties stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.SORTIE_STOCK_CREATE,
    libelle: 'Créer une sortie stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.SORTIE_STOCK_VALIDATE,
    libelle: 'Valider une sortie stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.SORTIE_STOCK_CANCEL,
    libelle: 'Annuler une sortie stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.MOUVEMENT_STOCK_VIEW,
    libelle: 'Consulter l’historique des mouvements stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.RESERVATION_VIEW,
    libelle: 'Consulter les réservations stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.RESERVATION_CREATE,
    libelle: 'Créer une réservation stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.RESERVATION_UPDATE,
    libelle: 'Modifier une réservation stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.RESERVATION_VALIDATE,
    libelle: 'Valider une réservation stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.RESERVATION_CANCEL,
    libelle: 'Annuler une réservation stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.DEMANDE_TRANSFERT_VIEW,
    libelle: 'Consulter les demandes de transfert stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.DEMANDE_TRANSFERT_CREATE,
    libelle: 'Créer une demande de transfert stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.DEMANDE_TRANSFERT_VALIDATE,
    libelle: 'Valider une demande de transfert stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.DEMANDE_TRANSFERT_EXECUTE,
    libelle: 'Exécuter une demande de transfert stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.DEMANDE_TRANSFERT_CANCEL,
    libelle: 'Annuler une demande de transfert stock',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.REAPPROVISIONNEMENT_VIEW,
    libelle: 'Consulter les réapprovisionnements',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.REAPPROVISIONNEMENT_CREATE,
    libelle: 'Créer une demande de réapprovisionnement',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.REAPPROVISIONNEMENT_UPDATE,
    libelle: 'Modifier une demande de réapprovisionnement',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.REAPPROVISIONNEMENT_VALIDATE,
    libelle: 'Valider une demande de réapprovisionnement',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.REAPPROVISIONNEMENT_CANCEL,
    libelle: 'Annuler une demande de réapprovisionnement',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_VIEW,
    libelle: 'Consulter les inventaires',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_CREATE,
    libelle: 'Créer un inventaire',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_UPDATE,
    libelle: 'Modifier un inventaire',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_VALIDATE,
    libelle: 'Valider un inventaire',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_CLOSE,
    libelle: 'Clôturer un inventaire',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_PREPARE_VIEW,
    libelle: 'Consulter les inventaires préparés',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_PREPARE_CREATE,
    libelle: 'Créer un inventaire préparé',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_PREPARE_UPDATE,
    libelle: 'Modifier un inventaire préparé',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_PREPARE_DELETE,
    libelle: 'Supprimer un inventaire préparé',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.INVENTAIRE_PREPARE_LAUNCH,
    libelle: 'Lancer un inventaire préparé',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.STOCK_CONSUMPTION_DECLARE,
    libelle: 'Déclarer une consommation stock sur intervention',
    module: 'STOCK',
  },
  {
    code: PRIVILEGE_CODES.STOCK_CONSUMPTION_VIEW,
    libelle: 'Consulter les consommations stock',
    module: 'STOCK',
  },
];

export const ROLE_PRIVILEGES: Record<RoleCode, PrivilegeCode[]> = {
  [ROLE_CODES.ADMIN]: Object.values(PRIVILEGE_CODES) as PrivilegeCode[],

  [ROLE_CODES.RESPONSABLE_MAINTENANCE]: [
    PRIVILEGE_CODES.DASHBOARD_GENERAL_VIEW,
    PRIVILEGE_CODES.DASHBOARD_EQUIPEMENTS_VIEW,
    PRIVILEGE_CODES.DASHBOARD_MAINTENANCE_VIEW,
    PRIVILEGE_CODES.DASHBOARD_STOCK_VIEW,
    PRIVILEGE_CODES.REPORTS_VIEW,

    PRIVILEGE_CODES.EQUIPEMENTS_VIEW,
    PRIVILEGE_CODES.MATERIEL_VIEW,
    PRIVILEGE_CODES.MATERIEL_CREATE,
    PRIVILEGE_CODES.MATERIEL_UPDATE,
    PRIVILEGE_CODES.MATERIEL_DELETE,
    PRIVILEGE_CODES.MATERIEL_RESTORE,
    PRIVILEGE_CODES.MODELE_VIEW,
    PRIVILEGE_CODES.MODELE_CREATE,
    PRIVILEGE_CODES.MODELE_UPDATE,
    PRIVILEGE_CODES.MODELE_DELETE,
    PRIVILEGE_CODES.ARBORESCENCE_VIEW,
    PRIVILEGE_CODES.ARBORESCENCE_MANAGE,
    PRIVILEGE_CODES.POINT_STRUCTURE_VIEW,
    PRIVILEGE_CODES.POINT_STRUCTURE_CREATE,
    PRIVILEGE_CODES.POINT_STRUCTURE_UPDATE,
    PRIVILEGE_CODES.POINT_STRUCTURE_DELETE,
    PRIVILEGE_CODES.POINT_MESURE_VIEW,
    PRIVILEGE_CODES.POINT_MESURE_CREATE,
    PRIVILEGE_CODES.POINT_MESURE_UPDATE,
    PRIVILEGE_CODES.POINT_MESURE_DELETE,
    PRIVILEGE_CODES.RELEVE_MESURE_VIEW,
    PRIVILEGE_CODES.FAMILLE_VIEW,
    PRIVILEGE_CODES.FAMILLE_MANAGE,
    PRIVILEGE_CODES.FABRICANT_VIEW,
    PRIVILEGE_CODES.FABRICANT_MANAGE,
    PRIVILEGE_CODES.MARQUE_VIEW,
    PRIVILEGE_CODES.MARQUE_MANAGE,
    PRIVILEGE_CODES.TYPE_EQUIPEMENT_VIEW,
    PRIVILEGE_CODES.TYPE_EQUIPEMENT_MANAGE,
    PRIVILEGE_CODES.ETAT_MODELE_VIEW,
    PRIVILEGE_CODES.ETAT_MODELE_MANAGE,

    PRIVILEGE_CODES.MAINTENANCE_VIEW,
    PRIVILEGE_CODES.DI_VIEW_ALL,
    PRIVILEGE_CODES.DI_CREATE,
    PRIVILEGE_CODES.DI_UPDATE,
    PRIVILEGE_CODES.DI_SUBMIT,
    PRIVILEGE_CODES.DI_ACCEPT,
    PRIVILEGE_CODES.DI_REFUSE,
    PRIVILEGE_CODES.DI_VALIDATE_WORKS,
    PRIVILEGE_CODES.DI_CLOSE,
    PRIVILEGE_CODES.INTERVENTION_VIEW_ALL,
    PRIVILEGE_CODES.INTERVENTION_CREATE,
    PRIVILEGE_CODES.INTERVENTION_UPDATE,
    PRIVILEGE_CODES.INTERVENTION_PLANIFY,
    PRIVILEGE_CODES.INTERVENTION_ASSIGN,
    PRIVILEGE_CODES.INTERVENTION_CANCEL,
    PRIVILEGE_CODES.INTERVENTION_CLOSE,
    PRIVILEGE_CODES.GAMME_VIEW,
    PRIVILEGE_CODES.GAMME_CREATE,
    PRIVILEGE_CODES.GAMME_UPDATE,
    PRIVILEGE_CODES.GAMME_DELETE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_VIEW,
    PRIVILEGE_CODES.PLAN_PREVENTIF_CREATE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_UPDATE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_DELETE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_GENERATE_INTERVENTIONS,
    PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_VIEW,
    PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_CREATE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_UPDATE,
    PRIVILEGE_CODES.PLAN_PREVENTIF_PREDEFINI_DELETE,
    PRIVILEGE_CODES.HISTORIQUE_PREVENTIF_VIEW,

    // Consultation stock seulement
    PRIVILEGE_CODES.STOCK_VIEW,
    PRIVILEGE_CODES.ARTICLE_VIEW,
    PRIVILEGE_CODES.MAGASIN_VIEW,
    PRIVILEGE_CODES.EMPLACEMENT_VIEW,
    PRIVILEGE_CODES.ENTREE_STOCK_VIEW,
    PRIVILEGE_CODES.SORTIE_STOCK_VIEW,
    PRIVILEGE_CODES.MOUVEMENT_STOCK_VIEW,
    PRIVILEGE_CODES.RESERVATION_VIEW,
    PRIVILEGE_CODES.DEMANDE_TRANSFERT_VIEW,
    PRIVILEGE_CODES.REAPPROVISIONNEMENT_VIEW,
    PRIVILEGE_CODES.INVENTAIRE_VIEW,
    PRIVILEGE_CODES.INVENTAIRE_PREPARE_VIEW,
    PRIVILEGE_CODES.STOCK_CONSUMPTION_VIEW,
  ],

  [ROLE_CODES.TECHNICIEN]: [
    PRIVILEGE_CODES.DASHBOARD_GENERAL_VIEW,
    PRIVILEGE_CODES.DASHBOARD_MAINTENANCE_VIEW,

    PRIVILEGE_CODES.EQUIPEMENTS_VIEW,
    PRIVILEGE_CODES.MATERIEL_VIEW,
    PRIVILEGE_CODES.MODELE_VIEW,
    PRIVILEGE_CODES.POINT_STRUCTURE_VIEW,
    PRIVILEGE_CODES.POINT_MESURE_VIEW,
    PRIVILEGE_CODES.RELEVE_MESURE_VIEW,
    PRIVILEGE_CODES.RELEVE_MESURE_CREATE,

    PRIVILEGE_CODES.MAINTENANCE_VIEW,
    PRIVILEGE_CODES.DI_VIEW_OWN,
    PRIVILEGE_CODES.INTERVENTION_VIEW_ASSIGNED,
    PRIVILEGE_CODES.INTERVENTION_START,
    PRIVILEGE_CODES.INTERVENTION_REPORT,
    PRIVILEGE_CODES.INTERVENTION_COMPLETE,

    // Consultation des pièces et déclaration de consommation
    PRIVILEGE_CODES.STOCK_VIEW,
    PRIVILEGE_CODES.ARTICLE_VIEW,
    PRIVILEGE_CODES.MAGASIN_VIEW,
    PRIVILEGE_CODES.MOUVEMENT_STOCK_VIEW,
    PRIVILEGE_CODES.STOCK_CONSUMPTION_DECLARE,
    PRIVILEGE_CODES.STOCK_CONSUMPTION_VIEW,
  ],

  [ROLE_CODES.DEMANDEUR]: [
    PRIVILEGE_CODES.DASHBOARD_GENERAL_VIEW,

    PRIVILEGE_CODES.EQUIPEMENTS_VIEW,
    PRIVILEGE_CODES.MATERIEL_VIEW,
    PRIVILEGE_CODES.POINT_STRUCTURE_VIEW,

    PRIVILEGE_CODES.MAINTENANCE_VIEW,
    PRIVILEGE_CODES.DI_VIEW_OWN,
    PRIVILEGE_CODES.DI_CREATE,
    PRIVILEGE_CODES.DI_UPDATE,
    PRIVILEGE_CODES.DI_SUBMIT,
  ],

  [ROLE_CODES.MAGASINIER]: [
    PRIVILEGE_CODES.DASHBOARD_GENERAL_VIEW,
    PRIVILEGE_CODES.DASHBOARD_STOCK_VIEW,

    PRIVILEGE_CODES.STOCK_VIEW,
    PRIVILEGE_CODES.ARTICLE_VIEW,
    PRIVILEGE_CODES.ARTICLE_CREATE,
    PRIVILEGE_CODES.ARTICLE_UPDATE,
    PRIVILEGE_CODES.ARTICLE_DELETE,
    PRIVILEGE_CODES.ARTICLE_RESTORE,
    PRIVILEGE_CODES.UNITE_ARTICLE_VIEW,
    PRIVILEGE_CODES.UNITE_ARTICLE_MANAGE,

    PRIVILEGE_CODES.MAGASIN_VIEW,
    PRIVILEGE_CODES.MAGASIN_CREATE,
    PRIVILEGE_CODES.MAGASIN_UPDATE,
    PRIVILEGE_CODES.MAGASIN_DELETE,
    PRIVILEGE_CODES.EMPLACEMENT_VIEW,
    PRIVILEGE_CODES.EMPLACEMENT_MANAGE,

    PRIVILEGE_CODES.ENTREE_STOCK_VIEW,
    PRIVILEGE_CODES.ENTREE_STOCK_CREATE,
    PRIVILEGE_CODES.ENTREE_STOCK_VALIDATE,
    PRIVILEGE_CODES.ENTREE_STOCK_CANCEL,

    PRIVILEGE_CODES.SORTIE_STOCK_VIEW,
    PRIVILEGE_CODES.SORTIE_STOCK_CREATE,
    PRIVILEGE_CODES.SORTIE_STOCK_VALIDATE,
    PRIVILEGE_CODES.SORTIE_STOCK_CANCEL,

    PRIVILEGE_CODES.MOUVEMENT_STOCK_VIEW,

    PRIVILEGE_CODES.RESERVATION_VIEW,
    PRIVILEGE_CODES.RESERVATION_CREATE,
    PRIVILEGE_CODES.RESERVATION_UPDATE,
    PRIVILEGE_CODES.RESERVATION_VALIDATE,
    PRIVILEGE_CODES.RESERVATION_CANCEL,

    PRIVILEGE_CODES.DEMANDE_TRANSFERT_VIEW,
    PRIVILEGE_CODES.DEMANDE_TRANSFERT_CREATE,
    PRIVILEGE_CODES.DEMANDE_TRANSFERT_VALIDATE,
    PRIVILEGE_CODES.DEMANDE_TRANSFERT_EXECUTE,
    PRIVILEGE_CODES.DEMANDE_TRANSFERT_CANCEL,

    PRIVILEGE_CODES.REAPPROVISIONNEMENT_VIEW,
    PRIVILEGE_CODES.REAPPROVISIONNEMENT_CREATE,
    PRIVILEGE_CODES.REAPPROVISIONNEMENT_UPDATE,
    PRIVILEGE_CODES.REAPPROVISIONNEMENT_VALIDATE,
    PRIVILEGE_CODES.REAPPROVISIONNEMENT_CANCEL,

    PRIVILEGE_CODES.INVENTAIRE_VIEW,
    PRIVILEGE_CODES.INVENTAIRE_CREATE,
    PRIVILEGE_CODES.INVENTAIRE_UPDATE,
    PRIVILEGE_CODES.INVENTAIRE_VALIDATE,
    PRIVILEGE_CODES.INVENTAIRE_CLOSE,

    PRIVILEGE_CODES.INVENTAIRE_PREPARE_VIEW,
    PRIVILEGE_CODES.INVENTAIRE_PREPARE_CREATE,
    PRIVILEGE_CODES.INVENTAIRE_PREPARE_UPDATE,
    PRIVILEGE_CODES.INVENTAIRE_PREPARE_DELETE,
    PRIVILEGE_CODES.INVENTAIRE_PREPARE_LAUNCH,

    PRIVILEGE_CODES.STOCK_CONSUMPTION_VIEW,

    // Lecture utile pour préparer les pièces liées aux interventions
    PRIVILEGE_CODES.MAINTENANCE_VIEW,
    PRIVILEGE_CODES.INTERVENTION_VIEW_ALL,
  ],
};

export function getPrivilegesForRole(role: RoleCode): PrivilegeCode[] {
  return ROLE_PRIVILEGES[role] ?? [];
}

export function roleHasPrivilege(
  role: RoleCode,
  privilege: PrivilegeCode,
): boolean {
  return getPrivilegesForRole(role).includes(privilege);
}