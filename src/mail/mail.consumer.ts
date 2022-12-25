import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { OnQueueActive, OnQueueError, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { EQueue } from '@/common/constants/queue';

@Processor(EQueue.mail)
export class MailConsumer {
  private logger: Logger;
  constructor(private readonly mailerService: MailerService) {
    this.logger = new Logger('Mail queue');
  }
  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} `);
  }

  @Process()
  async sendMail(job: Job<ISendMailOptions>) {
    try {
      await this.mailerService.sendMail(job.data);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  @OnQueueError()
  onError(...args: any[]) {
    this.logger.error(`Error processing job ${args}`);
  }
}
