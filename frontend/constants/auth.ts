import { UserRole, Permission } from '@/types/auth';

// Role to Permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MATERIALS,
    Permission.CREATE_MATERIAL,
    Permission.EDIT_MATERIAL,
    Permission.DELETE_MATERIAL,
    Permission.VIEW_MAINTENANCE,
    Permission.CREATE_DI,
    Permission.EDIT_DI,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTION,
    Permission.EDIT_INTERVENTION,
    Permission.VIEW_STOCK,
    Permission.CREATE_ENTRY,
    Permission.CREATE_EXIT,
    Permission.VIEW_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_REPORTS,
    Permission.SYSTEM_CONFIG,
  ],

  [UserRole.RESPONSABLE_MAINTENANCE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_MAINTENANCE,
    Permission.CREATE_DI,
    Permission.EDIT_DI,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTION,
    Permission.EDIT_INTERVENTION,
    Permission.VIEW_STOCK,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.TECHNICIEN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_MAINTENANCE,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTION,
    Permission.EDIT_INTERVENTION,
    Permission.VIEW_STOCK,
  ],

  [UserRole.DEMANDEUR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MATERIALS,
    Permission.CREATE_DI,
    Permission.VIEW_INTERVENTIONS,
  ],

  [UserRole.MAGASINIER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_STOCK,
    Permission.CREATE_ENTRY,
    Permission.CREATE_EXIT,
    Permission.VIEW_INVENTORY,
    Permission.EDIT_INVENTORY,
  ],
};

// Test accounts for mock authentication
export const testAccounts = [
  {
    id: '1',
    email: 'admin@gmao.local',
    password: 'admin123',
    fullName: 'Administrator',
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
