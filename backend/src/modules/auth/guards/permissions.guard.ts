import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

type RequestUser = {
  idUtilisateur: number;
  email: string;
  role: string;
  permissions: string[];
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.getMetadata<string[]>(context, PERMISSIONS_KEY) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié.');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    const userPermissions = user.permissions ?? [];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Vous n’avez pas les droits nécessaires pour effectuer cette action.',
      );
    }

    return true;
  }

  private getMetadata<T>(
    context: ExecutionContext,
    key: string,
  ): T | undefined {
    const handler = context.getHandler();
    const controller = context.getClass();

    return (
      Reflect.getMetadata(key, handler) ??
      Reflect.getMetadata(key, controller)
    );
  }
}