import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Status } from 'src/common';

export class GetUserBookingsDto {
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate: Date;
}
