import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dtos';
import { ClassService } from 'src/class/class.service';
import { UserService } from 'src/user/user.service';
import { BookingStatus } from './enums';
import { createTransaction } from 'src/common';

@Injectable()
export class BookingService {
  constructor(
    private userService: UserService,
    private classService: ClassService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
  ) {}

  async findById(id: number) {
    return await this.bookingRepository.findOne({ where: { id } });
  }

  async create({ userIds, classId }: CreateBookingDto) {
    if (!userIds.length) {
      throw new BadRequestException('Users ids list is empty');
    }

    const classInstance = await this.classService.findByAttrs({ id: classId });
    const { maxAmount, currentCount } = classInstance;
    if (currentCount >= maxAmount) {
      throw new BadRequestException(
        'The class is full, it does not accept more bookings',
      );
    }

    if (!classInstance) {
      throw new BadRequestException(`Class with id: ${classId} does not exist`);
    }

    const usersInstances = await this.userService.findManyById(userIds);
    const usersMap = new Map(usersInstances.map((user) => [user.id, user]));

    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();

    await createTransaction(queryRunner, async () => {
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const user = usersMap.get(userId);

        if (!user) {
          throw new BadRequestException(
            `User with id: ${userId} does not exist`,
          );
        }

        const booking = this.bookingRepository.create({
          user,
          class: classInstance,
        });
        await queryRunner.manager.save(booking);
      }
    });
  }

  async cancelBooking(id: number) {
    const booking = await this.findById(id);

    if (!booking) {
      throw new BadRequestException(`Booking with id: ${id} does not exist`);
    }

    booking.status = BookingStatus.CANCELED;
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: number) {
    await this.bookingRepository.delete(id);
  }
}
