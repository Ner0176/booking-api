import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClassConfigs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 2 })
  minHoursBeforeCancellation: number;

  @Column({ default: 2 })
  maxCancellationPerMonth: number;

  @Column({ default: 60 })
  maxRecoveryDays: number;
}
