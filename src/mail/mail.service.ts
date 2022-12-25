import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import { EQueue } from '@/common/constants/queue';
import { User } from '@/users/user.entity';

@Injectable()
export class MailService {
  private logger: Logger;
  constructor(
    @InjectQueue(EQueue.mail) private mailQueue: Queue,
    private readonly config: ConfigService,
  ) {
    this.logger = new Logger('MailService');
  }

  async send(payload: ISendMailOptions) {
    try {
      await this.mailQueue.add(payload);
      return true;
    } catch (e) {
      this.logger.error(e?.message);
      return false;
    }
  }

  async sendVerificationEmail(user: User, verificationCode: string) {
    this.send({
      to: user.email,
      subject: 'Email verification',
      template: 'email-verification',
      context: {
        title: 'Email verification',
        username: user.username,
        link:
          this.config.get('baseUrl') +
          '/api/auth/email-verification?code=' +
          verificationCode,
      },
    });
  }
}
