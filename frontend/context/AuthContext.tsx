'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthContextType,
  LoginCredentials,
  LoginResponse,
  User,
} from '@/types/auth';
import { Permission, UserRole } from '@/types/auth';
import {
  clearAuthSession,
  getMeApi,
  getStoredToken,
  getStoredUser,
  loginApi,
  saveAuthSession,
} from '@/services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(user: User): User {
  return {
    id: String(user.id ?? user.idUtilisateur),
    idUtilisateur: user.idUtilisateur,
    email: user.email,
    nom: user.nom ?? null,
    prenom: user.prenom ?? null,
    fullName:
      user.fullName ||
      [user.prenom, user.nom].filter(Boolean).join(' ') ||
      'Utilisateur',
    role: user.role as UserRole,
    roleLabel: user.roleLabel,
    permissions: (user.permissions || []) as Permission[],
    avatar: user.avatar ?? null,
    actif: user.actif,
    idTechnicien: user.idTechnicien ?? null,
idEquipe: user.idEquipe ?? null,
equipe: user.equipe ?? null,
    createdAt: user.createdAt,
    dateCreation: user.dateCreation,
    derniereConnexion: user.derniereConnexion,
    
  };
}

function normalizeLoginResponse(response: LoginResponse): User {
  return normalizeUser(response.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginApi(credentials);

    const token = response.accessToken || response.token;

    if (!token) {
      throw new Error('Token manquant dans la réponse du serveur.');
    }

    const connectedUser = normalizeLoginResponse(response);

    saveAuthSession(token, connectedUser);
    setUser(connectedUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    window.location.href = '/auth/login';
  }, []);

  const hasPermission = useCallback(
    (permission: Permission | Permission[]) => {
      if (!user) return false;

      if (user.role === UserRole.ADMIN) {
        return true;
      }

      const permissions = Array.isArray(permission)
        ? permission
        : [permission];

      return permissions.every((item) => user.permissions.includes(item));
    },
    [user],
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false;

      const roles = Array.isArray(role) ? role : [role];

      return roles.includes(user.role);
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false;

      return roles.includes(user.role);
    },
    [user],
  );

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        clearAuthSession();

        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      const storedUser = getStoredUser();

      if (storedUser && mounted) {
        setUser(normalizeUser(storedUser));
      }

      try {
        const me = await getMeApi(token);

        if (mounted) {
          const connectedUser = normalizeUser(me);
          saveAuthSession(token, connectedUser);
          setUser(connectedUser);
        }
      } catch (error) {
        console.error('Erreur restauration session auth :', error);
        clearAuthSession();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
    }),
    [user, isLoading, login, logout, hasPermission, hasRole, hasAnyRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }

  return context;
}