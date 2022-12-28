import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

import { NOT_FOUND } from '@/common/constants/message';
import { AuthUser } from '@/common/decorators/auth-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { extractJwtFromBearer } from '@/common/utils/utils';
import { MailService } from '@/mail/mail.service';
import { RoleType } from '@/roles/enums/role.enum';
import { RolesService } from '@/roles/roles.service';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Token } from './entities/token.entity';
import { TokenType } from './enums/token.enum';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const existByUsername = await this.usersService.getBy({
      username: body.username,
    });
    if (existByUsername) {
      throw new BadRequestException('Username has been taken');
    }

    const existByEmail = await this.usersService.getBy({
      email: body.email,
    });
    if (existByEmail) {
      throw new BadRequestException('Email has been taken');
    }

    const userRole = await this.rolesService.getBy({ name: RoleType.user });

    const user = new User();
    user.email = body.email;
    user.username = body.username;
    user.password = body.password;
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
    emailVerification.value = this.authService.getEmailVerificationCode();
    emailVerification.userId = user.id;
    await emailVerification.save();

    await this.mailService.sendVerificationEmail(user, emailVerification.value);

    return {
      message:
        'Registration success, an verification link has been sent to your email address',
    };
  }

  @Post('token')
  async refreshToken(
    @Headers('Authorization') authHeader: string,
    @Body() body: RefreshTokenDto,
  ) {
    const refreshToken = await this.tokenService.getBy({
      value: body.refreshToken,
    });
    if (!refreshToken) {
      throw new BadRequestException('Session expired');
    }
    if (refreshToken.expiresAt * 1000 < Date.now()) {
      throw new BadRequestException('Session expired');
    }
    const decodedToken = this.jwtService.verify(
      extractJwtFromBearer(authHeader),
      {
        ignoreExpiration: true,
      },
    );
    if (!decodedToken) {
      throw new BadRequestException('Jwt malformed');
    }
    if (decodedToken?.subject !== refreshToken.userId) {
      throw new BadRequestException('Jwt malformed');
    }
    const user = await this.usersService.getById(refreshToken.userId);
    if (!user) {
      throw new BadRequestException('Jwt malformed');
    }

    const accessToken = await this.tokenService.generateAccessToken(user);
    refreshToken.value = this.tokenService.generateRefreshTokenValue();
    await refreshToken.save();

    return {
      accessToken,
      refreshToken: refreshToken.value,
    };
  }

  @Get('email-verification')
  @Render('email-verification')
  async emailVerification(@Query('code') code: string) {
    const verificationCode = await this.tokenService.get({
      where: {
        type: TokenType.emailVerification,
        value: code,
      },
    });
    if (!verificationCode) {
      return {
        success: false,
        message: 'The verification code does not match our record.',
        title: 'Verification error',
      };
    }
    return {
      success: true,
      title: 'Verification success',
      message:
        'Thank you for your support, we have successfully verified your email address. <br /> You can now proceed to the homepage',
      redirectUrl: 'http://localhost:5173',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getInfo(@AuthUser('subject') userId: string) {
    const user = await this.usersService.getById(userId);
    if (!user) {
      throw new NotFoundException(NOT_FOUND);
    }
    return user;
  }
}
