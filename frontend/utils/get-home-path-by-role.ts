import { UserRole } from '@/types/auth';

export function getHomePathByRole(role?: UserRole | string | null) {
  const normalizedRole = String(role ?? '').trim().toUpperCase();

  switch (normalizedRole) {
    case UserRole.ADMIN:
    case 'ADMIN':
      return '/admin';

    case UserRole.RESPONSABLE_MAINTENANCE:
    case 'RESPONSABLE_MAINTENANCE':
      return '/dashboards/maintenance';

    case UserRole.TECHNICIEN:
    case 'TECHNICIEN':
      return '/dashboards/maintenance';

    case UserRole.DEMANDEUR:
    case 'DEMANDEUR':
      return '/dashboards/maintenance';

    case UserRole.MAGASINIER:
    case 'MAGASINIER':
      return '/dashboards/stock';

    default:
      return '/auth/login';
  }
}