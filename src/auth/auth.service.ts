import { randomBytes } from 'crypto';

import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { nanoid } from 'nanoid';
import { catchError, lastValueFrom, map, of } from 'rxjs';

import { MailService } from '@/mail/mail.service';
import { RoleType } from '@/roles/enums/role.enum';
import { RolesService } from '@/roles/roles.service';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Token } from './entities/token.entity';
import { TokenType } from './enums/token.enum';
import { GeoIPResponse } from './interfaces/geo-ip-response.interface';
import { GGTokenExchangeResponse } from './interfaces/gg-token-exchange-response.interface';
import { GGJwtPayload } from './interfaces/google-jwt-payload.interface';
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
    private readonly rolesService: RolesService,
  ) {}

  public async login(loginDto: LoginDto) {
    const user = await this.usersService.existByEmailOrUsername(
      loginDto.usernameOrEmail,
    );
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await user.compareHashPassword(loginDto.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Your email is not verified!');
    }

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    return { accessToken, refreshToken: refreshToken.value, user };
  }

  public getEmailVerificationCode() {
    return nanoid(6);
  }

  public randomBytes(size: number) {
    return randomBytes(size).toString('hex');
  }

  public getGeoLocationByIp(ip: string): Promise<GeoIPResponse> {
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
    const verifiedToken = await this.verifyTokenAsync(
      resetPasswordDto.code,
      TokenType.resetPassword,
    );

    const user = await this.usersService.getById(verifiedToken.userId);
    if (!user) {
      throw new BadRequestException();
    }
    user.password = resetPasswordDto.password;
    user.hashPassword();
    await user.save();
    await verifiedToken.remove();
  }

  public async verifyTokenAsync(tokenStr: string, tokenType: TokenType) {
    const token = await this.tokenService.getBy({
      value: tokenStr,
      type: tokenType,
    });
    if (!token) {
      throw new BadRequestException(
        'The verification code does not match our record.',
      );
    }
    if (token.expiresAt * 1000 < Date.now()) {
      throw new BadRequestException('The verification code expired');
    }
    return token;
  }

  public async register(registerDto: RegisterDto) {
    const existByUsername = await this.usersService.getBy({
      username: registerDto.username,
    });
    if (existByUsername) {
      throw new BadRequestException('Username has been taken');
    }

    const existByEmail = await this.usersService.getBy({
      email: registerDto.email,
    });
    if (existByEmail) {
      throw new BadRequestException('Email has been taken');
    }

    const userRole = await this.rolesService.getBy({ name: RoleType.user });

    const user = new User();
    user.email = registerDto.email;
    user.username = registerDto.username;
    user.password = registerDto.password;
    if (userRole) {
      user.roles = [userRole];
    }

    await user.save();

    const emailVerification = new Token();
    emailVerification.expiresAt = moment()
      .add(+this.config.get('auth.emailVerificationExpirationS'), 's')
      .utc()
      .unix();
    emailVerification.type = TokenType.emailVerification;
    emailVerification.value = this.getEmailVerificationCode();
    emailVerification.userId = user.id;
    await emailVerification.save();

    await this.mailService.sendVerificationEmail(user, emailVerification.value);
  }

  public async verifyEmail(code: string) {
    const verificationCode = await this.tokenService.get({
      where: {
        type: TokenType.emailVerification,
        value: code,
      },
    });
    if (!verificationCode) {
      throw new BadRequestException(
        'The verification code does not match our record.',
      );
    }
    const user = await this.usersService.getById(verificationCode.userId);
    if (!user) {
      throw new BadRequestException(
        'The verification code does not match our record.',
      );
    }
    user.emailVerified = true;
    await user.save();
    await verificationCode.remove();
  }

  public async exchangeGoogleToken(
    code: string,
  ): Promise<GGTokenExchangeResponse> {
    const clientId = this.config.get('google.clientId');
    if (!clientId) {
      throw new InternalServerErrorException('Client id not configured');
    }
    const clientSecret = this.config.get('google.clientSecret');
    if (!clientSecret) {
      throw new InternalServerErrorException('Client secret not configured');
    }
    const redirectUri = this.config.get('google.redirectUri');
    if (!redirectUri) {
      throw new InternalServerErrorException('Redirect url not configured');
    }

    return lastValueFrom(
      this.http
        .post<GGTokenExchangeResponse>(
          'https://oauth2.googleapis.com/token',
          null,
          {
            params: {
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: this.config.get('google.redirectUri'),
              grant_type: 'authorization_code',
            },
          },
        )
        .pipe(
          map((resp) => resp.data),
          catchError((e) => {
            const message = e.response?.data?.error ?? e.message;
            throw new BadRequestException(message);
          }),
        ),
    );
  }

  public async googleSignIn(ggJwtPayload: GGJwtPayload) {
    const existingUser = await this.usersService.get({
      where: {
        email: ggJwtPayload.email,
      },
      relations: {
        roles: { permissions: true },
      },
    });
    if (!existingUser) {
      const userRole = await this.rolesService.get({
        where: {
          name: RoleType.user,
        },
        relations: {
          permissions: true,
        },
      });

      const newUser = new User();
      newUser.email = ggJwtPayload.email;
      newUser.password = '';
      newUser.username = ggJwtPayload.email.substring(
        0,
        ggJwtPayload.email.indexOf('@'),
      );
      newUser.emailVerified = true;
      newUser.idpId = ggJwtPayload.sub;
      if (userRole) {
        newUser.roles = [userRole];
      }

      await newUser.save();

      const accessToken = await this.tokenService.generateAccessToken(newUser);
      const refreshToken = await this.tokenService.generateRefreshToken(
        newUser,
      );

      return { accessToken, refreshToken: refreshToken.value };
    }
    if (existingUser.idpId === ggJwtPayload.sub) {
      const accessToken = await this.tokenService.generateAccessToken(
        existingUser,
      );
      const refreshToken = await this.tokenService.generateRefreshToken(
        existingUser,
      );

      return { accessToken, refreshToken: refreshToken.value };
    }
    throw new BadRequestException(
      'This email is already linked to another account!',
    );
  }
}
