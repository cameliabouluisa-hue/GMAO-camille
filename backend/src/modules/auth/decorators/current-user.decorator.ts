import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentAuthUser = {
  idUtilisateur: number;
  email: string;
  role: string;
  permissions: string[];
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentAuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);