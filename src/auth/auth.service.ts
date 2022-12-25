import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';

import { User } from '@/users/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public generateAccessToken(user: User) {
    return this.jwtService.sign({ subject: user.id });
  }

  public getEmailVerificationCode() {
    return nanoid(6);
  }

  public randomBytes(size: number) {
    return randomBytes(size).toString('hex');
  }
}
