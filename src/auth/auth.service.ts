import { randomBytes } from 'crypto';

import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { nanoid } from 'nanoid';
import { catchError, lastValueFrom, map, of } from 'rxjs';

import { MailService } from '@/mail/mail.service';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Token } from './entities/token.entity';
import { TokenType } from './enums/token.enum';
import { GeoIPResponse } from './interfaces/geo-ip-response.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  public async login(loginDto: LoginDto) {
    const user = await this.usersService.existByEmailOrUsername(
      loginDto.usernameOrEmail,
    );
    if (!user) {
      throw new BadRequestException('Bad credentials');
    }

    const isValidPassword = await user.compareHashPassword(loginDto.password);
    if (!isValidPassword) {
      throw new BadRequestException('Bad credentials');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Your email is not verified!');
    }

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    return { accessToken, refreshToken: refreshToken.value };
  }

  public generateAccessToken(user: User) {
    return this.jwtService.sign({ subject: user.id });
  }

  public getEmailVerificationCode() {
    return nanoid(6);
  }

  public randomBytes(size: number) {
    return randomBytes(size).toString('hex');
  }

  public getGeoLocationByIp(ip: string): Promise<any> {
    return lastValueFrom(
      this.http
        .get<GeoIPResponse>(this.config.get('geo.apiUrl')!, {
          params: {
            apiKey: this.config.get('geo.apiKey'),
            ip,
          },
        })
        .pipe(
          map((response) => response.data ?? response),
          catchError((_) => {
            return of({
              district: 'local',
              state_prov: 'local',
              country_name: 'Vietnam',
            } as GeoIPResponse);
          }),
        ),
    );
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.getBy({
      email: forgotPasswordDto.email,
    });
    if (!user) {
      throw new BadRequestException('No user found with this email address');
    }
    if (!user.emailVerified) {
      throw new BadRequestException('Your email is not verified yet');
    }
    const resetPasswordToken = new Token();
    resetPasswordToken.value = nanoid(6);
    resetPasswordToken.type = TokenType.resetPassword;
    resetPasswordToken.expiresAt = moment()
      .add(+this.config.get('auth.resetPasswordExpirationS')!, 's')
      .utc()
      .unix();
    resetPasswordToken.user = user;

    await resetPasswordToken.save();

    await this.mailService.sendResetPasswordLinkEmail(
      user,
      resetPasswordToken.value,
    );
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const verificationCode = await this.tokenService.getBy({
      value: resetPasswordDto.code,
      type: TokenType.resetPassword,
    });
    if (!verificationCode) {
      return {
        error: 'The verification code does not match our record.',
        success: false,
      };
    }
    if (verificationCode.expiresAt * 1000 < Date.now()) {
      return {
        error: 'The verification code expired',
        success: false,
      };
    }
    const user = await this.usersService.getById(verificationCode.userId);
    if (!user) {
      throw new BadRequestException();
    }
    user.password = resetPasswordDto.password;
    await user.save();
    await verificationCode.remove();
  }
}
