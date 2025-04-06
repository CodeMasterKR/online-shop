import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transport;
  constructor() {
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ibrahimovkamronbek7@gmail.com',
        pass: 'lfkq xjew lhpu kgdv',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.transport.sendMail({
        to,
        subject,
        text,
      });
    } catch (error) {
      console.log(error.message);
    }
  }
}
