import { User } from 'src/user/user.entity';
import { BookingStatus } from './enums';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from 'src/class/class.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @OneToMany(() => Class, (classes) => classes.bookings)
  class: Class;
}
