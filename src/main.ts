import { join } from 'path';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as hbs from 'hbs';

import { AppModule } from '@/app/app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('App');

  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    origin: '*',
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.set('view options', { layout: 'layouts/auth' });
  app.setViewEngine('hbs');

  await app.listen(AppModule.port);
  logger.log('Application started on port ' + AppModule.port);
}
bootstrap();
