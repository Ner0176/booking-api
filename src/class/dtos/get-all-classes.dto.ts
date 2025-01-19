import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { ClassStatus } from '../enums';
import { Type } from 'class-transformer';

export class GetAllClassesDto {
  @IsOptional()
  @IsEnum(ClassStatus)
  status: ClassStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate: Date;
}
