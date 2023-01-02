import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SharePasswordDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Password for the share',
    type: 'string'
  })
  password: string;
}
