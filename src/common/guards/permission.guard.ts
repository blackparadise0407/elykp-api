import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

export const PermissionGuard = (...requiredPermissions: string[]) => {
  @Injectable()
  class _PermissionGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      const userPerms = request.user?.permissions ?? [];
      return requiredPermissions.every((it) => userPerms.includes(it));
    }
  }

  return mixin(_PermissionGuard);
};
