import { Module } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { EmailService } from "./email.service";

@Module({
  providers: [EmailService,I18nContext],
  exports: [EmailService],
})
export class EmailModule {}
