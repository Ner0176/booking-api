import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ToBoolean } from 'src/common';

export class CreateBookingDto {
  @IsString()
  classId: string;

  @IsBoolean()
  @ToBoolean()
  isRecurrent: boolean;

  @IsNumber({}, { each: true })
  userIds: number[];
}
