// User roles enumeration
export enum UserRole {
  ADMIN = 'ADMIN',
  DEMANDEUR = 'DEMANDEUR',
  RESPONSABLE_MAINTENANCE = 'RESPONSABLE_MAINTENANCE',
  TECHNICIEN = 'TECHNICIEN',
  MAGASINIER = 'MAGASINIER',
}

// Permissions enumeration
export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  
  // Equipment permissions
  VIEW_MATERIALS = 'VIEW_MATERIALS',
  CREATE_MATERIAL = 'CREATE_MATERIAL',
  EDIT_MATERIAL = 'EDIT_MATERIAL',
  DELETE_MATERIAL = 'DELETE_MATERIAL',
  
  // Maintenance permissions
  VIEW_MAINTENANCE = 'VIEW_MAINTENANCE',
  CREATE_DI = 'CREATE_DI',
  EDIT_DI = 'EDIT_DI',
  VIEW_INTERVENTIONS = 'VIEW_INTERVENTIONS',
  CREATE_INTERVENTION = 'CREATE_INTERVENTION',
  EDIT_INTERVENTION = 'EDIT_INTERVENTION',
  
  // Stock permissions
  VIEW_STOCK = 'VIEW_STOCK',
  CREATE_ENTRY = 'CREATE_ENTRY',
  CREATE_EXIT = 'CREATE_EXIT',
  VIEW_INVENTORY = 'VIEW_INVENTORY',
  EDIT_INVENTORY = 'EDIT_INVENTORY',
  
  // Admin permissions
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  VIEW_REPORTS = 'VIEW_REPORTS',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
}

// User interface
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  createdAt: Date;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse {
  user: User;
  token?: string;
}
