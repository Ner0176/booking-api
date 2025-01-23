import { Expose, Transform, Type } from 'class-transformer';
import { BookingStatus } from '../enums';
import { UserDto } from 'src/user/dtos';

export class BookingDto {
  @Expose()
  id: number;

  @Expose()
  status: BookingStatus;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Transform(({ obj }) => obj.class.id)
  classId: number;
}
