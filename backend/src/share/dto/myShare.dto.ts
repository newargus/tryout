import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToClass } from "class-transformer";
import { ShareDTO } from "./share.dto";

export class MyShareDTO extends ShareDTO {
  @Expose()
  @ApiProperty({
    description: 'Number of visitors',
    type: 'number'
  })
  views: number;

  @Expose()
  createdAt: Date;

  @Expose()
  recipients: string[];

  from(partial: Partial<MyShareDTO>) {
    return plainToClass(MyShareDTO, partial, { excludeExtraneousValues: true });
  }

  fromList(partial: Partial<MyShareDTO>[]) {
    return partial.map((part) =>
      plainToClass(MyShareDTO, part, { excludeExtraneousValues: true })
    );
  }
}
