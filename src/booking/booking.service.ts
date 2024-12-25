import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto, GetBookingsDto } from './dtos';
import { ClassService } from 'src/class/class.service';
import { UserService } from 'src/user/user.service';
import { BookingStatus } from './enums';
import { createTransaction } from 'src/common';

const BOOKING_RELATIONS = {
  relations: ['user', 'class'],
  select: { user: { id: true }, class: { id: true } },
};

@Injectable()
export class BookingService {
  constructor(
    private userService: UserService,
    private classService: ClassService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
  ) {}

  async findAll({ userId, classId }: GetBookingsDto) {
    return await this.bookingRepository.find({
      ...BOOKING_RELATIONS,
      where: { user: { id: userId }, class: { id: classId } },
    });
  }

  async findById(id: number) {
    return await this.bookingRepository.findOne({
      where: { id },
      ...BOOKING_RELATIONS,
    });
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
        `The class has ${maxAmount - currentCount} empty spots. You tried to book ${userIds.length} spots.`,
      );
    }

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
      classInstance.currentCount = newCount;
      await queryRunner.manager.save(classInstance);

      const bookings = usersInstances.map((user) =>
        this.bookingRepository.create({
          user,
          class: classInstance,
          status: BookingStatus.PENDING,
        }),
      );
      await queryRunner.manager.save(bookings);
    });
  }

  async cancelBooking(id: number) {
    const booking = await this.findById(id);

    if (!booking) {
      throw new BadRequestException(`Booking with id: ${id} does not exist`);
    }

    await this.classService.decrementAmount(booking.class.id);

    booking.status = BookingStatus.CANCELED;
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: number) {
    const booking = await this.findById(id);

    if (!booking) {
      throw new BadRequestException(`Booking with id: ${id} does not exist`);
    }

    await this.classService.decrementAmount(booking.class.id);
    return await this.bookingRepository.remove(booking);
  }
}
