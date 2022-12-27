import { Body, Controller, Get, Post, Query, Render } from '@nestjs/common';

import { LoginDto } from '@/auth/dto/login.dto';

@Controller()
export class AppController {
  @Get('login')
  @Render('login')
  getLogin(@Query('redirect_url') redirectUrl: string) {
    console.log(redirectUrl);
    return {};
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    console.log(body);
    return {};
  }
}
