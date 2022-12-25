import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';

import { NOT_FOUND } from '@/common/constants/message';
import { AuthUser } from '@/common/decorators/auth-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { MailService } from '@/mail/mail.service';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

import { AuthService } from './auth.service';
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

    const user = new User();
    user.email = body.email;
    user.username = body.username;
    user.password = body.password;

    await user.save();

    const emailVerification = new Token();
    emailVerification.expiresInMs = this.config.get(
      'auth.emailVerificationExpirationMs',
    );
    emailVerification.type = TokenType.emailVerification;
    emailVerification.value = this.authService.getEmailVerificationCode();
    emailVerification.userId = user.id;
    await emailVerification.save();

    this.mailService.sendVerificationEmail(user, emailVerification.value);

    return {
      message:
        'Registration success, an verification link has been sent to your email address',
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
