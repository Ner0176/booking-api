import { Booking } from 'src/booking/booking.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
