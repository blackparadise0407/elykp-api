import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DiscordLoggerService } from '../services/discord-logger.service';

@Catch(HttpException)
export class MvcExceptionFilter implements ExceptionFilter {
  constructor(private readonly discordLogger: DiscordLoggerService) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isInternalError = exception.getStatus() >= 500;
    const fullPath = `${request.protocol}://${request.hostname}${request.originalUrl}`;
    if (isInternalError) {
      this.discordLogger.error({
        ...(exception.getResponse() as any),
        timestamp: new Date().toISOString(),
        path: fullPath,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
    }

    return response.render('error', {
      error: exception.message,
      title: 'An error happened!',
      internal: isInternalError,
    });
  }
}
