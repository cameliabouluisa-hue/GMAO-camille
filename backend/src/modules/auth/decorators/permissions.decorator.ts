import { SetMetadata } from '@nestjs/common';

import type { PrivilegeCode } from '../constants/auth-permissions';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: PrivilegeCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);