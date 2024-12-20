import { Booking } from 'src/booking/booking.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maxAmount: number;

  @Column()
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ nullable: true })
  recurrentId: string;

  @ManyToOne(() => Booking, (booking) => booking.class)
  bookings: Booking[];
}
