import { applyDecorators, UseGuards } from '@nestjs/common';

import type { PrivilegeCode } from '../constants/auth-permissions';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from './permissions.decorator';

export function RequirePermissions(...permissions: PrivilegeCode[]) {
  return applyDecorators(
    Permissions(...permissions),
    UseGuards(JwtAuthGuard, PermissionsGuard),
  );
}