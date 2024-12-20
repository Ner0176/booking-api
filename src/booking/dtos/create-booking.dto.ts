import { IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  classId: number;

  @IsNumber({}, { each: true })
  userIds: number[];
}
