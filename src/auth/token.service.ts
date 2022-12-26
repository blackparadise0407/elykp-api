import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';
import { uniqueBy } from '@/common/utils/utils';
import { Permission } from '@/permissions/permission.entity';
import { User } from '@/users/user.entity';

import { Token } from './entities/token.entity';
import { TokenType } from './enums/token.enum';

@Injectable()
export class TokenService extends CRUDService<Token, Repository<Token>> {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super('Token', tokenRepository);
  }

  generateRefreshTokenValue() {
    return nanoid(64);
  }

  async generateAccessToken(user: User) {
    const allPerms =
      user?.roles?.reduce((res, acc) => {
        res.push(...acc.permissions);
        return res;
      }, [] as Permission[]) ?? [];
    const permissions = uniqueBy(allPerms, 'id').map((it) => it.name);

    return this.jwtService.sign({
      subject: user.id,
      permissions,
    });
  }

  async generateRefreshToken({
    user,
    ip,
    userAgent,
  }: {
    user: User;
    ip: string;
    userAgent: string;
  }) {
    const refreshToken = new Token();
    refreshToken.value = this.generateRefreshTokenValue();
    refreshToken.expiresAt = moment()
      .add(+this.config.get('auth.refreshTokenExpirationS'), 's')
      .utc()
      .unix();
    refreshToken.user = user;
    refreshToken.type = TokenType.refresh;
    refreshToken.ip = ip;
    refreshToken.userAgent = userAgent;
    await refreshToken.save();
    return refreshToken;
  }
}
