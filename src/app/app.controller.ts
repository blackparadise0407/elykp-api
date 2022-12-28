import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { AuthService } from '@/auth/auth.service';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { TokenService } from '@/auth/token.service';
import { Cookie } from '@/common/decorators/cookie.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

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
  // @Throttle(5, 5 * 60)
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
  @Render('reset-password')
  async resetPassword(
    @Query('code') code: string,
    @Query('email') email: string,
  ) {
    return {
      email,
      code,
    };
  }

  @Post('reset-password')
  @Render('reset-password')
  async postResetPassword(@Body() body: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(body);
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
}
