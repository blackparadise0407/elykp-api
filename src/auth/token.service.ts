import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';
import { User } from '@/users/user.entity';

import { Token } from './entities/token.entity';

@Injectable()
export class TokenService extends CRUDService<Token, Repository<Token>> {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {
    super('Token', tokenRepository);
  }

  generateAccessToken(user: User) {
    return this.jwtService.sign({
      subject: user.id,
      permissions: [],
    });
  }
}
