import { Type } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class DeleteClassDto {
  @IsString()
  id: string;

  @IsBoolean()
  @Type(() => Boolean)
  isRecurrent: boolean;
}
