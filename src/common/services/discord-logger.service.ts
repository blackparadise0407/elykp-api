import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordLoggerService {
  private url: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.url = config.get('discord.webhookUrl') ?? '';
    if (!this.url) {
      throw new InternalServerErrorException('Web hook url not configured');
    }
  }

  error(msg: any) {
    this.http
      .post(this.url, {
        content: ['```json', JSON.stringify(msg, undefined, 2), '```'].join(
          '\n',
        ),
      })
      .subscribe();
  }
}
