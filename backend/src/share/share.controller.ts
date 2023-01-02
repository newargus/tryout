import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { User } from "@prisma/client";
import { GetUser } from "src/auth/decorator/getUser.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { CreateShareDTO } from "./dto/createShare.dto";
import { MyShareDTO } from "./dto/myShare.dto";
import { ShareDTO } from "./dto/share.dto";
import { ShareMetaDataDTO } from "./dto/shareMetaData.dto";
import { SharePasswordDto } from "./dto/sharePassword.dto";
import { ShareOwnerGuard } from "./guard/shareOwner.guard";
import { ShareSecurityGuard } from "./guard/shareSecurity.guard";
import { ShareTokenSecurity } from "./guard/shareTokenSecurity.guard";
import { ShareService } from "./share.service";


@ApiTags('shares')
@Controller("shares")
export class ShareController {
  constructor(private shareService: ShareService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Shares' })
  async getMyShares(@GetUser() user: User) {
    return new MyShareDTO().fromList(
      await this.shareService.getSharesByUser(user.id)
    );
  }

  @Get(":id")
  @UseGuards(ShareSecurityGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Share with Id' })
  async get(@Param("id") id: string) {
    return new ShareDTO().from(await this.shareService.get(id));
  }

  @Get(":id/metaData")
  @UseGuards(ShareSecurityGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Share Metatdata' })
  async getMetaData(@Param("id") id: string) {
    return new ShareMetaDataDTO().from(await this.shareService.getMetaData(id));
  }

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create User Share' })
  async create(@Body() body: CreateShareDTO, @GetUser() user: User) {
    return new ShareDTO().from(await this.shareService.create(body, user));
  }

  @Delete(":id")
  @UseGuards(JwtGuard, ShareOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete User Share' })
  async remove(@Param("id") id: string) {
    await this.shareService.remove(id);
  }

  @Post(":id/complete")
  @HttpCode(202)
  @UseGuards(JwtGuard, ShareOwnerGuard)
  @ApiOperation({ summary: 'Complete Sharing process of User Share' })
  @ApiBearerAuth()
  async complete(@Param("id") id: string) {
    return new ShareDTO().from(await this.shareService.complete(id));
  }

  @Get("isShareIdAvailable/:id")
  @ApiOperation({ summary: 'Check if User Share is available' })
  async isShareIdAvailable(@Param("id") id: string) {
    return this.shareService.isShareIdAvailable(id);
  }

  @HttpCode(200)
  @Throttle(10, 5 * 60)
  @UseGuards(ShareTokenSecurity)
  @ApiOperation({ summary: 'Get Share Token by providing Share Password' })
  @Post(":id/token")
  async getShareToken(@Param("id") id: string, @Body() body: SharePasswordDto) {
    return this.shareService.getShareToken(id, body.password);
  }
}
