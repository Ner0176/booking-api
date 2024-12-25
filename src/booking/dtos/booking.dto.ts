import { Expose, Transform } from 'class-transformer';
import { BookingStatus } from '../enums';

export class BookingDto {
  @Expose()
  id: number;

  @Expose()
  status: BookingStatus;

  @Expose()
  @Transform(({ obj }) => obj.user.id)
  userId: number;

  @Expose()
  @Transform(({ obj }) => obj.class.id)
  classId: number;
}
