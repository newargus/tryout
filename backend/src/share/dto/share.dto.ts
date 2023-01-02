import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass, Type } from "class-transformer";
import { FileDTO } from "src/file/dto/file.dto";
import { PublicUserDTO } from "src/user/dto/publicUser.dto";

export class ShareDTO {
  @Expose()
  @ApiProperty({
    description: 'Id of the share',
    type: 'string'
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Expiration date of the share'
  })
  expiration: Date;

  @Expose()
  @Type(() => FileDTO)
  @ApiProperty({
    description: 'Files included in the chare'
  })
  files: FileDTO[];

  @Expose()
  @Type(() => PublicUserDTO)
  creator: PublicUserDTO;

  @Expose()
  @ApiProperty({
    description: 'Descriptiono of the share'
  })
  description: string;

  from(partial: Partial<ShareDTO>) {
    return plainToClass(ShareDTO, partial, { excludeExtraneousValues: true });
  }

  fromList(partial: Partial<ShareDTO>[]) {
    return partial.map((part) =>
      plainToClass(ShareDTO, part, { excludeExtraneousValues: true })
    );
  }
}
