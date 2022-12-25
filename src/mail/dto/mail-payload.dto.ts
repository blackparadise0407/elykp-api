export class MailPayloadDto {
  subject: string;
  html: string;
  to: string[];
  from?: string;
}
