import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { In, Repository } from 'typeorm';
import { CreateBookingDto, GetBookingsDto, GetUserBookingsDto } from './dtos';
import { ClassService } from 'src/class/class.service';
import { UserService } from 'src/user/user.service';
import { BookingStatus } from './enums';
import { createTransaction } from 'src/common';
import { Class } from 'src/class/class.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassConfigsService } from 'src/class-configs/class-configs.service';
import { differenceInMinutes, startOfMonth } from 'date-fns';

const BOOKING_RELATIONS = {
  relations: ['user', 'class'],
  select: {
    class: { id: true },
    user: { id: true, name: true, phone: true, email: true },
  },
};

@Injectable()
export class BookingService {
  constructor(
    private userService: UserService,
    private classService: ClassService,
    private classConfigsService: ClassConfigsService,
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

  async findBookingsFromUser(userId: number, payload: GetUserBookingsDto) {
    const { status, startDate, endDate } = payload;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.class', 'class')
      .leftJoin('booking.user', 'user')
      .where('user.id = :userId', { userId });

    if (!!status && status.length > 0) {
      query.andWhere('booking.status IN (:...status)', { status });
    }

    if (!!startDate && endDate) {
      query.andWhere('class.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.getMany();
  }

  private validateUserIds(userIds: number[]) {
    if (!userIds.length) {
      throw new BadRequestException('Users ids list is empty');
    }

    if (new Set(userIds).size !== userIds.length) {
      throw new BadRequestException('Users ids can not be repeated');
    }
  }

  private async validateClass(classId: string, isRecurrent: boolean) {
    const filter: Partial<Class> = isRecurrent
      ? { recurrentId: classId }
      : { id: +classId };

    const classInstances = await this.classService.findByAttrs(filter, true);

    if (!classInstances.length) {
      throw new BadRequestException(`Class with id: ${classId} does not exist`);
    }

    return classInstances;
  }

  private async findAndValidateUsers(userIds: number[]) {
    const users = await this.userService.findManyById(userIds);

    if (users.length !== userIds.length) {
      const invalidIds = userIds.filter(
        (id) => !users.find(({ id: foundId }) => foundId === id),
      );
      throw new BadRequestException(
        `Users with ids: ${invalidIds.join(', ')} are not valid`,
      );
    }

    return users;
  }

  async create({ userIds, classId, isRecurrent }: CreateBookingDto) {
    this.validateUserIds(userIds);

    const classes = await this.validateClass(classId, isRecurrent);
    const userInstances = await this.findAndValidateUsers(userIds);

    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();

    await createTransaction(queryRunner, async () => {
      for (const classInstance of classes) {
        const { maxAmount, bookings: classBookings } = classInstance;
        const currentCount = classBookings.length;
        const newCount = currentCount + userIds.length;

        if (newCount > maxAmount) {
          throw new BadRequestException(
            `The class has ${maxAmount - currentCount} empty spots. You tried to book ${userIds.length} spots.`,
          );
        }

        await queryRunner.manager.save(classInstance);

        const bookings = userInstances.map((user) =>
          this.bookingRepository.create({
            user,
            class: classInstance,
            status: BookingStatus.PENDING,
          }),
        );
        await queryRunner.manager.save(bookings);
      }
    });
  }

  async editClassBookings({
    classId,
    isRecurrent,
    userIds: newUserIds,
  }: CreateBookingDto) {
    const newUserIdsSet = new Set(newUserIds);

    const classes = await this.validateClass(classId, isRecurrent);

    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();

    await createTransaction(queryRunner, async () => {
      for (const classInstance of classes) {
        const { maxAmount } = classInstance;
        const currentCount = newUserIds.length;

        if (currentCount > maxAmount) {
          throw new BadRequestException(
            `The class has ${maxAmount - currentCount} empty spots. You tried to book ${currentCount} spots.`,
          );
        }

        const oldUserIds = classInstance.bookings.map((item) => item.user.id);
        const oldUserIdsSet = new Set(oldUserIds);

        const idsToRemove = oldUserIds.filter((id) => !newUserIdsSet.has(id));
        const idsToAdd = newUserIds.filter((id) => !oldUserIdsSet.has(id));

        const userInstances = await this.findAndValidateUsers(idsToAdd);

        await queryRunner.manager.save(classInstance);

        if (idsToRemove.length) {
          await queryRunner.manager.delete(this.bookingRepository.target, {
            class: classInstance,
            user: In(idsToRemove),
          });
        }

        if (idsToAdd.length) {
          const bookings = userInstances.map((user) =>
            this.bookingRepository.create({
              user,
              class: classInstance,
              status: BookingStatus.PENDING,
            }),
          );
          await queryRunner.manager.save(bookings);
        }
      }
    });
  }

  async cancelBooking(id: number, userId: number) {
    const booking = await this.findById(id);
    if (!booking) {
      throw new BadRequestException(`Booking with id: ${id} does not exist`);
    }

    const now = new Date();
    const classDate = new Date(booking.class.date);
    const { maxCancellationPerMonth, minHoursBeforeCancellation } =
      await this.classConfigsService.getClassConfigs();

    const minutesDiff = differenceInMinutes(now, classDate);
    const hoursDiff = minutesDiff / 60;
    if (hoursDiff > minHoursBeforeCancellation) {
      throw new BadRequestException(
        `User ${userId} tried to cancel booking ${id} after the allowed time had expired.`,
      );
    }

    const recentCancellations = await this.findBookingsFromUser(userId, {
      endDate: now,
      startDate: startOfMonth(now),
      status: [BookingStatus.CANCELLED],
    });
    if (recentCancellations.length >= maxCancellationPerMonth) {
      throw new BadRequestException(
        `User ${userId} tried to cancel booking ${id}, exceeding the maximum allowed cancellations for the month.`,
      );
    }

    booking.status = BookingStatus.CANCELLED;
    booking.originalClass = booking.class;
    booking.class = null;

    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: number) {
    const booking = await this.findById(id);

    if (!booking) {
      throw new BadRequestException(`Booking with id: ${id} does not exist`);
    }

    return await this.bookingRepository.remove(booking);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateBookingStatus() {
    return await this.bookingRepository.query(`
       UPDATE booking
       SET status = 'completed'
       WHERE status = 'pending'
       AND (
        SELECT c.date || ' ' || c.endTime
        FROM "class" c
        WHERE c.id = booking.classId
       ) < datetime('now')
      `);
  }
}
