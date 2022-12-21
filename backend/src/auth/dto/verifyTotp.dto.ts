import { PickType } from "@nestjs/mapped-types";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { UserDTO } from "src/user/dto/user.dto";

export class VerifyTotpDTO extends PickType(UserDTO, ["password"] as const) {
  @IsString()
  code: string;
}