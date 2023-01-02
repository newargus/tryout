import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class ShareSecurityDTO {
  @IsString()
  @IsOptional()
  @Length(3, 30)
  @ApiProperty({
    description: 'Password for the share. Expected lenght: 3 to 30.',
    type: 'string'
  })
  @ApiPropertyOptional()
  password: string;

  @IsNumber()
  @IsOptional() @ApiProperty({
    description: 'Number of MaxVieuw for the share',
    type: 'number'
  })
  @ApiPropertyOptional()
  maxViews: number;
}
