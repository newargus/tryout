import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n";

@ApiTags("Hello")
@Controller("hello")
export class HelloController {
  @Get()
  @ApiOperation({
    summary: "Say Hello with Translation",
  })
  async getHello(@I18n() i18n: I18nContext) {
    return await i18n.t("tests.HELLO");
  }
}
