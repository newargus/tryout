import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdministratorGuard } from "src/auth/guard/isAdmin.guard";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { EmailService } from "src/email/email.service";
import { ConfigService } from "./config.service";
import { AdminConfigDTO } from "./dto/adminConfig.dto";
import { ConfigDTO } from "./dto/config.dto";
import { TestEmailDTO } from "./dto/testEmail.dto";
import UpdateConfigDTO from "./dto/updateConfig.dto";

@ApiTags('configs')
@Controller("configs")
export class ConfigController {
  constructor(
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'List config parameters for non Admin Users' 
  })
  async list() {
    return new ConfigDTO().fromList(await this.configService.list());
  }

  @Get("admin")
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiOperation({ 
    summary: 'Administration - List config parameters' 
  })
  async listForAdmin() {
    return new AdminConfigDTO().fromList(
      await this.configService.listForAdmin()
    );
  }

  @Patch("admin")
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiOperation({ 
    summary: 'Administration - Update config parameters' 
  })
  async updateMany(@Body() data: UpdateConfigDTO[]) {
    await this.configService.updateMany(data);
  }

  @Post("admin/finishSetup")
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiOperation({ 
    summary: 'Administration - End Up Initial configuration' 
  })
  async finishSetup() {
    return await this.configService.finishSetup();
  }

  @Post("admin/testEmail")
  @ApiOperation({ 
    summary: 'Administration - Testing E-mail configuration' 
  })
  @UseGuards(JwtGuard, AdministratorGuard)
  async testEmail(@Body() { email }: TestEmailDTO) {
    await this.emailService.sendTestMail(email);
  }
}
