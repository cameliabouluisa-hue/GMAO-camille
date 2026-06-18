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

function normalizeUser(response: LoginResponse): User {
  const backendUser = response.user;

  return {
    id: String(backendUser.id ?? backendUser.idUtilisateur),
    email: backendUser.email,
    fullName:
      backendUser.fullName ||
      [backendUser.prenom, backendUser.nom].filter(Boolean).join(' ') ||
      'Utilisateur',
    role: backendUser.role as UserRole,
    permissions: (backendUser.permissions || []) as Permission[],
    avatar: backendUser.avatar ?? null,
    createdAt: backendUser.createdAt,
  };
}

function normalizeMe(user: User): User {
  return {
    id: String(user.id ?? user.idUtilisateur),
    email: user.email,
    fullName:
      user.fullName ||
      [user.prenom, user.nom].filter(Boolean).join(' ') ||
      'Utilisateur',
    role: user.role as UserRole,
    permissions: (user.permissions || []) as Permission[],
    avatar: user.avatar ?? null,
    createdAt: user.createdAt,
  };
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

    const connectedUser = normalizeUser(response);

    saveAuthSession(token, connectedUser);
    setUser(connectedUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
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

      return permissions.every((item) =>
        user.permissions.includes(item),
      );
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
    async function restoreSession() {
      try {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        if (!token) {
          setUser(null);
          return;
        }

        if (storedUser) {
          setUser(storedUser);
        }

        const me = await getMeApi(token);
        const connectedUser = normalizeMe(me);

        saveAuthSession(token, connectedUser);
        setUser(connectedUser);
      } catch (error) {
        console.error('Erreur restauration session auth :', error);
        clearAuthSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
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