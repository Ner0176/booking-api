import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  classId: string;

  @IsBoolean()
  isRecurrent: boolean;

  @IsNumber({}, { each: true })
  userIds: number[];
}
