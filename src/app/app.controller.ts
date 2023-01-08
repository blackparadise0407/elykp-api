import {
  BadRequestException,
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
import * as qs from 'qs';

import { AuthService } from '@/auth/auth.service';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { IssuedTokensDto } from '@/auth/dto/issued-token.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { TokenType } from '@/auth/enums/token.enum';
import { TokenService } from '@/auth/token.service';
import { Cookie } from '@/common/decorators/cookie.decorator';
import { AuthFilter } from '@/common/filters/auth.filter';
import { MvcExceptionFilter } from '@/common/filters/mvc-exception.filter';
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
    res.redirect('/roles');
  }

  @Get('login')
  async getLogin(
    @Res() res: Response,
    @Cookie('accessToken') accessToken: string,
    @Query('return_url') returnUrl?: string,
  ) {
    // const verifyResult = await this.tokenService.verifyAccessToken(accessToken);
    // if (verifyResult) {
    //   return res.redirect(302, this.config.get('redirectUrl')!);
    // }
    return res.render('auth/login', {
      returnUrl,
    });
  }

  @Post('login')
  @Throttle(5, 5 * 60)
  @UseFilters(MvcExceptionFilter)
  async authorize(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const loginResult = await this.authService.loginByUsernameAndPassword(
        body,
      );
      return res.redirect(this.getPostLoginUrl(loginResult, body.state));
    } catch (e) {
      return res.render('auth/login', {
        error: e.message,
      });
    }
  }

  @Get('register')
  @Render('auth/register')
  async getRegister() {
    return {};
  }

  @Post('register')
  @Render('auth/register')
  @UseFilters(MvcExceptionFilter)
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
  @Render('auth/forgot-password')
  async forgotPassword() {
    return {};
  }

  @Post('forgot-password')
  @UseFilters(MvcExceptionFilter)
  async postForgotPassword(
    @Res() res: Response,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto);
      return res.redirect('forgot-password-confirmation');
    } catch (e) {
      return res.render('auth/forgot-password', {
        success: false,
        error: e.message,
      });
    }
  }

  @Get('forgot-password-confirmation')
  @Render('auth/forgot-password-confirmation')
  @UseFilters(MvcExceptionFilter)
  forgotPasswordConfirmation() {
    return {};
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
      res.render('auth/reset-password', {
        email,
        code: verifiedToken.value,
      });
    } catch (e) {
      res.render('error', { error: e.message });
    }
  }

  @Post('reset-password')
  @Render('auth/reset-password')
  @UseFilters(MvcExceptionFilter)
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
  @Render('auth/email-verification')
  @UseFilters(MvcExceptionFilter)
  async emailVerification(@Query('code') code: string) {
    await this.authService.verifyEmail(code);
    return {
      title: 'Success!',
      message:
        'Thank you for your support, we have successfully verified your email address. <br /> You can now proceed to the homepage',
    };
  }

  @Get('google-signin')
  googleSignIn(@Res() res: Response) {
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=383521474601-1lagrhu0b3el5k1g5uthb3khfdvfijmm.apps.googleusercontent.com&scope=openid%20email%20profile&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fcallback%2Fgoogle';
    return res.redirect(url);
  }

  @Get('callback/google')
  @UseFilters(MvcExceptionFilter)
  async googleCallback(@Res() res: Response, @Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Invalid request');
    }
    const { id_token } = await this.authService.exchangeGoogleToken(code);

    const decodedGoogleJwt = await this.tokenService.decodeGoogleJwt(id_token);
    if (decodedGoogleJwt) {
      const signInResult = await this.authService.loginByIdp(decodedGoogleJwt);
      if (signInResult) {
        return res.redirect(this.getPostLoginUrl(signInResult));
      }
    }

    return res.render('auth/callback');
  }

  private getPostLoginUrl(
    { accessToken, refreshToken, user }: IssuedTokensDto,
    state?: any,
  ) {
    const queryString = qs.stringify({
      id_token: accessToken,
      refresh_token: refreshToken,
      state,
      user_id: user.id,
    });
    const url = new URL(this.config.get('redirectUrl')!);
    url.search = '?' + queryString;
    return url.toString();
  }
}
