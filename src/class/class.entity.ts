import { Booking } from 'src/booking/booking.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maxAmount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: false })
  cancelled: boolean;

  @Column({ nullable: true })
  recurrentId: string;

  @OneToMany(() => Booking, (booking) => booking.class)
  bookings: Booking[];
}
