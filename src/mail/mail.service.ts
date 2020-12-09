import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVars, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVars: EmailVars[],
  ) {
    const form = new FormData();
    form.append(
      'from',
      `Nuguri from Nuber Eats <mailgun@${this.options.domain}>`,
    );
    form.append('to', 'com6511@gmail.com');
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(emailVar =>
      form.append(`v:${emailVar.key}`, emailVar.value),
    );

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Confirm Account', email, 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
