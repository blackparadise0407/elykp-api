import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { UAParser } from 'ua-parser-js';

import { GeoIPResponse } from '@/auth/interfaces/geo-ip-response.interface';
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

  sendVerificationEmail(user: User, verificationCode: string) {
    return this.send({
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

  sendLoginConfirmationEmail({
    user,
    userAgent,
    geo,
  }: {
    user: User;
    geo: GeoIPResponse;
    userAgent: string;
  }) {
    const { device } = new UAParser(userAgent).getResult();
    return this.send({
      to: user.email,
      subject: 'Login confirmation',
      template: 'login-confirmation',
      context: {
        username: user.username,
        device: `${device.vendor ?? ''} ${device.model ?? ''} `,
        location: `${geo.district}, ${geo.state_prov}, ${geo.country_name}`,
      },
    });
  }

  sendResetPasswordLinkEmail(user: User, verificationCode: string) {
    return this.send({
      to: user.email,
      subject: 'Reset password',
      template: 'reset-password',
      context: {
        username: user.username,
        link:
          this.config.get('baseUrl') +
          `/api/auth/reset-password?code=${verificationCode}&email=${user.email}`,
      },
    });
  }
}
