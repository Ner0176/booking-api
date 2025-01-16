import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { ClassStatus } from '../enums';
import { Type } from 'class-transformer';

class OrderByDateDto {
  endDate: Date;
  startDate: Date;
}

export class GetAllClassesDto {
  @IsOptional()
  @IsEnum(ClassStatus)
  status: ClassStatus;

  @IsDate()
  @IsOptional()
  @Type(() => OrderByDateDto)
  period: OrderByDateDto;
}
