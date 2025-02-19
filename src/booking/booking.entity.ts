import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Class } from 'src/class/class.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Class, (classes) => classes.bookings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  class: Class;

  @ManyToOne(() => Class, { nullable: true, onDelete: 'CASCADE' })
  originalClass?: Class;
}
