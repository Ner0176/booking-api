import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  end: string;

  @IsString()
  start: string;

  @Min(1)
  @IsNumber()
  maxAmount: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  recurrencyLimit?: Date;
}
