import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator<string>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookies = request.cookies;
    return cookies && data ? cookies[data] : cookies;
  },
);
