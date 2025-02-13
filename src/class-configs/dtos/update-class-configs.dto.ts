import { IsNumber } from 'class-validator';

export class UpdateClassConfigsDto {
  @IsNumber()
  maxRecoveryDays: number;

  @IsNumber()
  maxCancellationPerMonth: number;

  @IsNumber()
  minHoursBeforeCancellation: number;
}
