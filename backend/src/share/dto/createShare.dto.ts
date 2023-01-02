import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { type } from "os";
import { ShareSecurityDTO } from "./shareSecurity.dto";

export class CreateShareDTO {
  
  @IsString()
  @Matches("^[a-zA-Z0-9_-]*$", undefined, {
    message: "ID can only contain letters, numbers, underscores and hyphens",
  })
  @Length(3, 50)
  @ApiProperty({
    description: 'Id of share. Id can only contain letters, numbers, underscores and hyphens. Expected lenght: 3 to 50.',
    type: 'string'
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Expiration of the share.',
    type: 'string'
  })
  expiration: string;

  @MaxLength(512)
  @IsOptional()
  @ApiProperty({
    description: 'Description of the share. MaxLenght = 512 ',
    type: 'string'
  })
  @ApiPropertyOptional()
  description: string;

  @IsEmail({}, { each: true })
  @ApiProperty({
    description: 'Emails To Warn for the share ',
    type: '[string]'
  })
  recipients: string[];

  @ValidateNested()
  @Type(() => ShareSecurityDTO)
  @ApiProperty({
    description: 'Security Infromations for the share'
  })
  security: ShareSecurityDTO;
}
