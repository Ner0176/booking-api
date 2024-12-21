import { ToBoolean } from 'src/common';
import { IsBoolean, IsString } from 'class-validator';

export class DeleteClassDto {
  @IsString()
  id: string;

  @IsBoolean()
  @ToBoolean()
  isRecurrent: boolean;
}
