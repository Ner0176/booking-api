import { Expose, Transform, Type } from 'class-transformer';
import { BookingStatus } from '../enums';

class PartialUserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class BookingDto {
  @Expose()
  id: number;

  @Expose()
  status: BookingStatus;

  @Expose()
  @Type(() => PartialUserDto)
  user: PartialUserDto;

  @Expose()
  @Transform(({ obj }) => obj.class.id)
  classId: number;
}
