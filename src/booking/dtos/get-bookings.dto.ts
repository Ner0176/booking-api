import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetBookingsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  classId?: number;
}
