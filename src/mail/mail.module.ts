import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { EQueue } from '@/common/constants/queue';

import { MailConsumer } from './mail.consumer';
import { MailService } from './mail.service';

@Module({
  imports: [BullModule.registerQueue({ name: EQueue.mail })],
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
