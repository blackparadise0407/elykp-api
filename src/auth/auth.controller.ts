import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { NOT_FOUND } from '@/common/constants/message';
import { AuthUser } from '@/common/decorators/auth-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { extractJwtFromBearer } from '@/common/utils/utils';
import { MailService } from '@/mail/mail.service';
import { RolesService } from '@/roles/roles.service';
import { UsersService } from '@/users/users.service';

import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
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
