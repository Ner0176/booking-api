import { IsBoolean } from 'class-validator';
import { ToBoolean } from 'src/common';

export class EditClassStatusDto {
  @IsBoolean()
  @ToBoolean()
  cancel: boolean;
}
