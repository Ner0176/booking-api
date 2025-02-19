import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { In, Repository } from 'typeorm';
import { CreateBookingDto, GetBookingsDto, GetUserBookingsDto } from './dtos';
import { ClassService } from 'src/class/class.service';
import { UserService } from 'src/user/user.service';
import { createTransaction, Status } from 'src/common';
import { Class } from 'src/class/class.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassConfigsService } from 'src/class-configs/class-configs.service';
import { differenceInMinutes, format, startOfMonth } from 'date-fns';

@Injectable()
export class BookingService {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => ClassService))
    private classService: ClassService,
    private classConfigsService: ClassConfigsService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
  ) {}

  async findAll({ userId, classId }: GetBookingsDto) {
    return await this.bookingRepository.find({
      where: { user: { id: userId }, class: { id: classId } },
      relations: ['user', 'class'],
      select: {
        class: { id: true },
        user: { id: true, name: true, phone: true, email: true },
      },
    });
  }

  async findById(id: number) {
    return await this.bookingRepository.findOne({
      where: { id },
      relations: ['class'],
    });
  }

  async findByOriginalClassId(classId: number) {
    return await this.bookingRepository.find({
      where: { originalClass: { id: classId } },
    });
  }

  async findBookingsFromUser(userId: number, payload: GetUserBookingsDto) {
    const { status, startDate, endDate } = payload;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .leftJoinAndSelect('booking.class', 'class')
      .leftJoinAndSelect('booking.originalClass', 'originalClass')
      .loadRelationCountAndMap('class.currentCount', 'class.bookings')
      .where('user.id = :userId', { userId });

    if (!!status) {
      const now = new Date();
      const time = format(now, 'HH:mm');

      if (status === Status.CANCELLED) {
        query.andWhere('booking.cancelledAt IS NOT NULL');
      } else {
        let queryStatus =
          'class.date < :now OR (class.date = :now AND class.endTime < :time)';

        if (status === Status.PENDING) {
          queryStatus = `NOT(${queryStatus})`;
        }

        query.andWhere(queryStatus, { now, time });
      }
    }

    if (!!startDate && !!endDate) {
      query.andWhere('class.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query
      .orderBy('MIN(class.date, originalClass.date)', 'ASC')
      .getMany();
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

    const classInstances = await this.classService.findByAttrs(filter, {
      relations: ['bookings', 'bookings.user'],
      select: {
        bookings: { id: true, user: { id: true } },
      },
    });

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

    const minutesDiff = differenceInMinutes(classDate, now);
    const hoursDiff = minutesDiff / 60;
    if (hoursDiff < minHoursBeforeCancellation) {
      throw new BadRequestException(
        `User ${userId} tried to cancel booking ${id} after the allowed time had expired.`,
      );
    }

    const recentCancellations = await this.findBookingsFromUser(userId, {
      endDate: now,
      startDate: startOfMonth(now),
      status: Status.CANCELLED,
    });
    if (recentCancellations.length >= maxCancellationPerMonth) {
      throw new BadRequestException(
        `User ${userId} tried to cancel booking ${id}, exceeding the maximum allowed cancellations for the month.`,
      );
    }

    booking.cancelledAt = new Date();
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

  async saveBookings(bookings: Booking[]) {
    await this.bookingRepository.save(bookings);
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
