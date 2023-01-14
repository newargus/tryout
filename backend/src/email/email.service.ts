import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { User } from "@prisma/client";
import { I18n, I18nContext } from "nestjs-i18n";
import * as nodemailer from "nodemailer";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class EmailService {
  constructor(private config: ConfigService, @I18n() private i18n: I18nContext) {}

  getTransporter() {
    return nodemailer.createTransport({
      host: this.config.get("SMTP_HOST"),
      port: parseInt(this.config.get("SMTP_PORT")),
      secure: parseInt(this.config.get("SMTP_PORT")) == 465,
      auth: {
        user: this.config.get("SMTP_USERNAME"),
        pass: this.config.get("SMTP_PASSWORD"),
      },
    });
  }

  async sendMail(recipientEmail: string, shareId: string, creator: User) {
    if (!this.config.get("ENABLE_EMAIL_RECIPIENTS"))
      throw new InternalServerErrorException("Email service disabled");

    const shareUrl = `${this.config.get("APP_URL")}/share/${shareId}`;

    await this.getTransporter().sendMail({
      from: `"Pingvin Share" <${this.config.get("SMTP_EMAIL")}>`,
      to: recipientEmail,
      subject: this.config.get("EMAIL_SUBJECT"),
      text: this.config
        .get("EMAIL_MESSAGE")
        .replaceAll("\\n", "\n")
        .replaceAll("{creator}", creator.username)
        .replaceAll("{shareUrl}", shareUrl),
    });
  }

  async sendTestMail(recipientEmail: string) {
    await this.getTransporter().sendMail({
      from: `"Pingvin Share" <${this.config.get("SMTP_EMAIL")}>`,
      to: recipientEmail,
      subject:  await this.i18n.t('email.TestEmail.Subject'),
      text: await this.i18n.t('email.TestEmail.Subject') ,
    });
  }
}
