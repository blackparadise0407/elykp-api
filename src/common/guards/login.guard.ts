import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { TokenService } from '@/auth/token.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const accessToken = req.cookies['accessToken'];
    return this.tokenService.verifyAccessToken(accessToken);
  }
}
