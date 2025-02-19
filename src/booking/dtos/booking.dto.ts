import { Status } from 'src/common';
import { UserDto } from 'src/user/dtos';
import { Expose, Transform, Type } from 'class-transformer';

export class BookingDto {
  @Expose()
  id: number;

  @Expose()
  status: Status;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Transform(({ obj }) => obj.class.id)
  classId: number;
}
