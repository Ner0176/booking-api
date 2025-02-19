import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'src/common';

export class GetAllClassesDto {
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
