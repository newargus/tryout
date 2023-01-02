import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { User } from "@prisma/client";
import { ConfigService } from "src/config/config.service";
import { AuthService } from "./auth.service";
import { AuthTotpService } from "./authTotp.service";
import { GetUser } from "./decorator/getUser.decorator";
import { AuthRegisterDTO } from "./dto/authRegister.dto";
import { AuthSignInDTO } from "./dto/authSignIn.dto";
import { AuthSignInTotpDTO } from "./dto/authSignInTotp.dto";
import { EnableTotpDTO } from "./dto/enableTotp.dto";
import { RefreshAccessTokenDTO } from "./dto/refreshAccessToken.dto";
import { UpdatePasswordDTO } from "./dto/updatePassword.dto";
import { VerifyTotpDTO } from "./dto/verifyTotp.dto";
import { JwtGuard } from "./guard/jwt.guard";

@ApiTags('auth')
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private authTotpService: AuthTotpService,
    private config: ConfigService
  ) {}

  @Throttle(10, 5 * 60)
  @Post("signUp")
  @ApiOperation({ 
    summary: 'Register new user' 
  })
  async signUp(@Body() dto: AuthRegisterDTO) {
    if (!this.config.get("ALLOW_REGISTRATION"))
      throw new ForbiddenException("Registration is not allowed");
    return this.authService.signUp(dto);
  }

  @Throttle(10, 5 * 60)
  @Post("signIn")
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Sign-in Process' 
  })
  signIn(@Body() dto: AuthSignInDTO) {
    return this.authService.signIn(dto);
  }

  @Throttle(10, 5 * 60)
  @Post("signIn/totp")
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'ToTp Sign-in Process' 
  })
  signInTotp(@Body() dto: AuthSignInTotpDTO) {
    return this.authTotpService.signInTotp(dto);
  }

  @Patch("password")
  @UseGuards(JwtGuard)
  @ApiOperation({ 
    summary: 'Update Password' 
  })
  @ApiBearerAuth()
  async updatePassword(@GetUser() user: User, @Body() dto: UpdatePasswordDTO) {
    await this.authService.updatePassword(user, dto.oldPassword, dto.password);
  }

  @Post("token")
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Generate Access Tocken Based on Refresh Token' 
  })
  @ApiBearerAuth()
  async refreshAccessToken(@Body() body: RefreshAccessTokenDTO) {
    const accessToken = await this.authService.refreshAccessToken(
      body.refreshToken
    );
    return { accessToken };
  }

  @Post("totp/enable")
  @UseGuards(JwtGuard)
  @ApiOperation({ 
    summary: 'Enable ToTp' 
  })
  @ApiBearerAuth()
  async enableTotp(@GetUser() user: User, @Body() body: EnableTotpDTO) {
    return this.authTotpService.enableTotp(user, body.password);
  }

  @Post("totp/verify")
  @UseGuards(JwtGuard)
  @ApiOperation({ 
    summary: 'Verify ToTp' 
  })
  @ApiBearerAuth()
  async verifyTotp(@GetUser() user: User, @Body() body: VerifyTotpDTO) {
    return this.authTotpService.verifyTotp(user, body.password, body.code);
  }

  @Post("totp/disable")
  @UseGuards(JwtGuard)
  @ApiOperation({ 
    summary: 'Disable ToTp' 
  })
  @ApiBearerAuth()
  async disableTotp(@GetUser() user: User, @Body() body: VerifyTotpDTO) {
    // Note: We use VerifyTotpDTO here because it has both fields we need: password and totp code
    return this.authTotpService.disableTotp(user, body.password, body.code);
  }
}
