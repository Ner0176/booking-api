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

  private validateUserIds(userIds: number[]) {
    if (!userIds.length) {
      throw new BadRequestException('Users ids list is empty');
    }

    if (new Set(userIds).size !== userIds.length) {
      throw new BadRequestException('Users ids can not be repeated');
    }
  }

  async create({ userIds, classId }: CreateBookingDto) {
    this.validateUserIds(userIds);

    const classInstance = await this.classService.findByAttrs({ id: classId });
    if (!classInstance) {
      throw new BadRequestException(`Class with id: ${classId} does not exist`);
    }

    const { maxAmount, currentCount } = classInstance;
    const newCount = currentCount + userIds.length;

    if (newCount > maxAmount) {
      throw new BadRequestException(
        `The class has only ${maxAmount - currentCount} empty spots. You tried to book ${userIds.length} spots.`,
      );
    } else classInstance.currentCount = newCount;

    const usersInstances = await this.userService.findManyById(userIds);

    if (usersInstances.length !== userIds.length) {
      const invalidIds = userIds.filter(
        (id) => !usersInstances.find(({ id: instanceId }) => instanceId === id),
      );
      throw new BadRequestException(
        `Users with ids: ${invalidIds.join(', ')} are not valid`,
      );
    }

    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();

    await createTransaction(queryRunner, async () => {
      const bookings = usersInstances.map((user) =>
        this.bookingRepository.create({ user, class: classInstance }),
      );
      await queryRunner.manager.save(bookings);
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
