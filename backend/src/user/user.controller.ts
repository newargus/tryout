import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { GetUser } from "src/auth/decorator/getUser.decorator";
import { AdministratorGuard } from "src/auth/guard/isAdmin.guard";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { CreateUserDTO } from "./dto/createUser.dto";
import { UpdateOwnUserDTO } from "./dto/updateOwnUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserDTO } from "./dto/user.dto";
import { UserSevice } from "./user.service";

@ApiTags('users')
@Controller("users")
export class UserController {
  constructor(private userService: UserSevice) {}

  // Own user operations
  @Get("me")
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Get information of Autenticated User'
  })
  @ApiBearerAuth()
  async getCurrentUser(@GetUser() user: User) {
    return new UserDTO().from(user);
  }

  @Patch("me")
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update information of Autenticated User'
  })
  async updateCurrentUser(
    @GetUser() user: User,
    @Body() data: UpdateOwnUserDTO
  ) {
    return new UserDTO().from(await this.userService.update(user.id, data));
  }

  @Delete("me")
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Autenticated User'
  })
  async deleteCurrentUser(@GetUser() user: User) {
    return new UserDTO().from(await this.userService.delete(user.id));
  }

  // Global user operations
  @Get()
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Administration - List All Users'
  })
  async list(): Promise<UserDTO[]> {
    return new UserDTO().fromList(await this.userService.list());
  }

  @Post()
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Administration - Create new user'
  })
  async create(@Body() user: CreateUserDTO): Promise<UserDTO> {
    return new UserDTO().from(await this.userService.create(user));
  }

  @Patch(":id")
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Administration - Update user'
  })
  async update(@Param("id") id: string, @Body() user: UpdateUserDto): Promise<UserDTO> {
    return new UserDTO().from(await this.userService.update(id, user));
  }

  @Delete(":id")
  @UseGuards(JwtGuard, AdministratorGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Administration - Delete user'
  })
  async delete(@Param("id") id: string): Promise<UserDTO> {
    return new UserDTO().from(await this.userService.delete(id));
  }
}
