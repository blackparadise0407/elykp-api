import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AppModule } from '@/app/app.module';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const logMessage = AppModule.isDev
        ? `${method} ${originalUrl} ${statusCode}`
        : `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`;

      this.logger.log(logMessage);
    });

    next();
  }
}
