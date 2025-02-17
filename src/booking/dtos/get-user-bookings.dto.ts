import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../enums';

export class GetUserBookingsDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus[];

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate: Date;
}
