import { Permission, UserRole } from '@/types/auth';

function uniquePermissions(permissions: Permission[]): Permission[] {
  return Array.from(new Set(permissions));
}

export const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.RESPONSABLE_MAINTENANCE]: 'Responsable maintenance',
  [UserRole.TECHNICIEN]: 'Technicien',
  [UserRole.DEMANDEUR]: 'Demandeur',
  [UserRole.MAGASINIER]: 'Magasinier',
};

const adminPermissions = uniquePermissions(
  Object.values(Permission) as Permission[],
);

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: adminPermissions,

  [UserRole.RESPONSABLE_MAINTENANCE]: uniquePermissions([
    Permission.DASHBOARD_GENERAL_VIEW,
    Permission.DASHBOARD_EQUIPEMENTS_VIEW,
    Permission.DASHBOARD_MAINTENANCE_VIEW,
    Permission.DASHBOARD_STOCK_VIEW,
    Permission.REPORTS_VIEW,

    Permission.EQUIPEMENTS_VIEW,
    Permission.MATERIEL_VIEW,
    Permission.MATERIEL_CREATE,
    Permission.MATERIEL_UPDATE,
    Permission.MATERIEL_DELETE,
    Permission.MATERIEL_RESTORE,

    Permission.MODELE_VIEW,
    Permission.MODELE_CREATE,
    Permission.MODELE_UPDATE,
    Permission.MODELE_DELETE,

    Permission.ARBORESCENCE_VIEW,
    Permission.ARBORESCENCE_MANAGE,

    Permission.POINT_STRUCTURE_VIEW,
    Permission.POINT_STRUCTURE_CREATE,
    Permission.POINT_STRUCTURE_UPDATE,
    Permission.POINT_STRUCTURE_DELETE,

    Permission.POINT_MESURE_VIEW,
    Permission.POINT_MESURE_CREATE,
    Permission.POINT_MESURE_UPDATE,
    Permission.POINT_MESURE_DELETE,

    Permission.RELEVE_MESURE_VIEW,

    Permission.FAMILLE_VIEW,
    Permission.FAMILLE_MANAGE,
    Permission.FABRICANT_VIEW,
    Permission.FABRICANT_MANAGE,
    Permission.MARQUE_VIEW,
    Permission.MARQUE_MANAGE,
    Permission.TYPE_EQUIPEMENT_VIEW,
    Permission.TYPE_EQUIPEMENT_MANAGE,
    Permission.ETAT_MODELE_VIEW,
    Permission.ETAT_MODELE_MANAGE,

    Permission.MAINTENANCE_VIEW,

    Permission.DI_VIEW_ALL,
    Permission.DI_CREATE,
    Permission.DI_UPDATE,
    Permission.DI_SUBMIT,
    Permission.DI_ACCEPT,
    Permission.DI_REFUSE,
    Permission.DI_VALIDATE_WORKS,
    Permission.DI_CLOSE,

    Permission.INTERVENTION_VIEW_ALL,
    Permission.INTERVENTION_CREATE,
    Permission.INTERVENTION_UPDATE,
    Permission.INTERVENTION_PLANIFY,
    Permission.INTERVENTION_ASSIGN,
    Permission.INTERVENTION_CANCEL,
    Permission.INTERVENTION_CLOSE,

    Permission.GAMME_VIEW,
    Permission.GAMME_CREATE,
    Permission.GAMME_UPDATE,
    Permission.GAMME_DELETE,

    Permission.PLAN_PREVENTIF_VIEW,
    Permission.PLAN_PREVENTIF_CREATE,
    Permission.PLAN_PREVENTIF_UPDATE,
    Permission.PLAN_PREVENTIF_DELETE,
    Permission.PLAN_PREVENTIF_GENERATE_INTERVENTIONS,

    Permission.PLAN_PREVENTIF_PREDEFINI_VIEW,
    Permission.PLAN_PREVENTIF_PREDEFINI_CREATE,
    Permission.PLAN_PREVENTIF_PREDEFINI_UPDATE,
    Permission.PLAN_PREVENTIF_PREDEFINI_DELETE,

    Permission.HISTORIQUE_PREVENTIF_VIEW,

    // Stock en consultation seulement
    Permission.STOCK_VIEW,
    Permission.ARTICLE_VIEW,
    Permission.MAGASIN_VIEW,
    Permission.EMPLACEMENT_VIEW,
    Permission.ENTREE_STOCK_VIEW,
    Permission.SORTIE_STOCK_VIEW,
    Permission.MOUVEMENT_STOCK_VIEW,
    Permission.RESERVATION_VIEW,
    Permission.DEMANDE_TRANSFERT_VIEW,
    Permission.REAPPROVISIONNEMENT_VIEW,
    Permission.INVENTAIRE_VIEW,
    Permission.INVENTAIRE_PREPARE_VIEW,
    Permission.STOCK_CONSUMPTION_VIEW,
  ]),

  [UserRole.TECHNICIEN]: uniquePermissions([
    Permission.DASHBOARD_GENERAL_VIEW,
    Permission.DASHBOARD_MAINTENANCE_VIEW,

    Permission.MATERIEL_VIEW,
    Permission.MODELE_VIEW,
    Permission.RELEVE_MESURE_VIEW,
    Permission.RELEVE_MESURE_CREATE,

    Permission.MAINTENANCE_VIEW,
    Permission.DI_VIEW_OWN,

    Permission.INTERVENTION_VIEW_ASSIGNED,
    Permission.INTERVENTION_START,
    Permission.INTERVENTION_REPORT,
    Permission.INTERVENTION_COMPLETE,

    // Consultation pièces + consommation sur intervention
    Permission.STOCK_VIEW,
    Permission.ARTICLE_VIEW,
  
    Permission.MOUVEMENT_STOCK_VIEW,
    Permission.STOCK_CONSUMPTION_DECLARE,
    Permission.STOCK_CONSUMPTION_VIEW,
  ]),

  [UserRole.DEMANDEUR]: uniquePermissions([
    Permission.DASHBOARD_GENERAL_VIEW,

    Permission.EQUIPEMENTS_VIEW,
    Permission.MATERIEL_VIEW,
    

    Permission.MAINTENANCE_VIEW,
    Permission.DI_VIEW_OWN,
    Permission.DI_CREATE,
    Permission.DI_UPDATE,
    Permission.DI_SUBMIT,
  ]),

  [UserRole.MAGASINIER]: uniquePermissions([

    Permission.DASHBOARD_GENERAL_VIEW,
    
    Permission.DASHBOARD_STOCK_VIEW,

    
    Permission.EQUIPEMENTS_VIEW,
    Permission.MATERIEL_VIEW,
    Permission.ARBORESCENCE_VIEW,

    Permission.STOCK_VIEW,

    Permission.ARTICLE_VIEW,
    Permission.ARTICLE_CREATE,
    Permission.ARTICLE_UPDATE,
    Permission.ARTICLE_DELETE,
    Permission.ARTICLE_RESTORE,

    Permission.UNITE_ARTICLE_VIEW,
    Permission.UNITE_ARTICLE_MANAGE,

    Permission.MAGASIN_VIEW,
    Permission.MAGASIN_CREATE,
    Permission.MAGASIN_UPDATE,
    Permission.MAGASIN_DELETE,

    Permission.EMPLACEMENT_VIEW,
    Permission.EMPLACEMENT_MANAGE,

    Permission.ENTREE_STOCK_VIEW,
    Permission.ENTREE_STOCK_CREATE,
    Permission.ENTREE_STOCK_VALIDATE,
    Permission.ENTREE_STOCK_CANCEL,

    Permission.SORTIE_STOCK_VIEW,
    Permission.SORTIE_STOCK_CREATE,
    Permission.SORTIE_STOCK_VALIDATE,
    Permission.SORTIE_STOCK_CANCEL,

    Permission.MOUVEMENT_STOCK_VIEW,

    Permission.RESERVATION_VIEW,
    Permission.RESERVATION_CREATE,
    Permission.RESERVATION_UPDATE,
    Permission.RESERVATION_VALIDATE,
    Permission.RESERVATION_CANCEL,

    Permission.DEMANDE_TRANSFERT_VIEW,
    Permission.DEMANDE_TRANSFERT_CREATE,
    Permission.DEMANDE_TRANSFERT_VALIDATE,
    Permission.DEMANDE_TRANSFERT_EXECUTE,
    Permission.DEMANDE_TRANSFERT_CANCEL,

    Permission.REAPPROVISIONNEMENT_VIEW,
    Permission.REAPPROVISIONNEMENT_CREATE,
    Permission.REAPPROVISIONNEMENT_UPDATE,
    Permission.REAPPROVISIONNEMENT_VALIDATE,
    Permission.REAPPROVISIONNEMENT_CANCEL,

    Permission.INVENTAIRE_VIEW,
    Permission.INVENTAIRE_CREATE,
    Permission.INVENTAIRE_UPDATE,
    Permission.INVENTAIRE_VALIDATE,
    Permission.INVENTAIRE_CLOSE,

    Permission.INVENTAIRE_PREPARE_VIEW,
    Permission.INVENTAIRE_PREPARE_CREATE,
    Permission.INVENTAIRE_PREPARE_UPDATE,
    Permission.INVENTAIRE_PREPARE_DELETE,
    Permission.INVENTAIRE_PREPARE_LAUNCH,

    Permission.STOCK_CONSUMPTION_VIEW,

    // Lecture utile pour préparer les pièces liées aux interventions
    Permission.MAINTENANCE_VIEW,
    Permission.INTERVENTION_VIEW_ALL,
  ]),
};

export const testAccounts = [
  {
    id: '1',
    email: 'admin@gmao.local',
    password: 'admin123',
    fullName: 'Administrateur',
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    email: 'responsable@gmao.local',
    password: 'resp123',
    fullName: 'Responsable Maintenance',
    role: UserRole.RESPONSABLE_MAINTENANCE,
  },
  {
    id: '3',
    email: 'technicien@gmao.local',
    password: 'tech123',
    fullName: 'Technicien',
    role: UserRole.TECHNICIEN,
  },
  {
    id: '4',
    email: 'demandeur@gmao.local',
    password: 'dem123',
    fullName: 'Demandeur',
    role: UserRole.DEMANDEUR,
  },
  {
    id: '5',
    email: 'magasinier@gmao.local',
    password: 'mag123',
    fullName: 'Magasinier',
    role: UserRole.MAGASINIER,
  },
];

export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}