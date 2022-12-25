import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';

export const AuthUser = createParamDecorator<keyof JwtPayload>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return user && data ? user[data] : user;
  },
);
