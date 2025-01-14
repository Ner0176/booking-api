import { ToBoolean } from 'src/common';
import { IsBoolean } from 'class-validator';

export class DeleteClassDto {
  @IsBoolean()
  @ToBoolean()
  isRecurrent: boolean;
}
