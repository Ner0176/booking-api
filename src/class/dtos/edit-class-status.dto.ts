import { IsBoolean } from 'class-validator';

export class EditClassStatusDto {
  @IsBoolean()
  cancel: boolean;
}
