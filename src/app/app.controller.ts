import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

import { AuthService } from '@/auth/auth.service';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { TokenType } from '@/auth/enums/token.enum';
import { TokenService } from '@/auth/token.service';
import { Cookie } from '@/common/decorators/cookie.decorator';
import { AuthFilter } from '@/common/filters/auth.filter';
import { LoginGuard } from '@/common/guards/login.guard';

@Controller()
export class AppController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  @UseGuards(LoginGuard)
  @UseFilters(AuthFilter)
  get(@Res() res: Response) {
    res.redirect(this.config.get('redirectUrl')!);
  }

  @Get('login')
  async getLogin(
    @Res() res: Response,
    @Cookie('accessToken') accessToken: string,
    @Query('return_url') returnUrl?: string,
  ) {
    const verifyResult = await this.tokenService.verifyAccessToken(accessToken);
    if (verifyResult) {
      return res.redirect(302, this.config.get('redirectUrl')!);
    }
    return res.render('login', {
      returnUrl,
    });
  }

  @Post('login')
  @Throttle(5, 5 * 60)
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(body);
      res.cookie('accessToken', accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
      });
      res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
      });
      const url = this.config.get('redirectUrl')! + (body.returnUrl ?? '');
      res.redirect(302, url);
    } catch (e) {
      res.render('login', {
        error: e.message,
      });
    }
  }

  @Get('register')
  @Render('register')
  async getRegister() {
    return {};
  }

  @Post('register')
  @Render('register')
  async register(@Body() body: RegisterDto) {
    try {
      await this.authService.register(body);
      return {
        message:
          'Registration success, an verification link has been sent to your email address',
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
      };
    }
  }

  @Get('forgot-password')
  @Render('forgot-password')
  async forgotPassword() {
    return {};
  }

  @Post('forgot-password')
  @Render('forgot-password')
  async postForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
      };
    }
  }

  @Get('reset-password')
  async resetPassword(
    @Res() res: Response,
    @Query('code') code: string,
    @Query('email') email: string,
  ) {
    try {
      const verifiedToken = await this.authService.verifyTokenAsync(
        code,
        TokenType.resetPassword,
      );
      res.render('reset-password', {
        email,
        code: verifiedToken.value,
      });
    } catch (e) {
      res.render('error', { error: e.message });
    }
  }

  @Post('reset-password')
  @Render('reset-password')
  async postResetPassword(@Body() body: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(body);
      return {
        success: true,
        email: body.email,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
      };
    }
  }

  @Get('email-verification')
  @Render('email-verification')
  async emailVerification(@Query('code') code: string) {
    try {
      await this.authService.verifyEmail(code);
      return {
        title: 'Success!',
        message:
          'Thank you for your support, we have successfully verified your email address. <br /> You can now proceed to the homepage',
      };
    } catch (e) {
      return {
        title: 'Verification error!',
        message: e.message,
      };
    }
  }
}
