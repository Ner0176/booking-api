import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateClassDto } from './dtos';
import { RRule } from 'rrule';
import { createTransaction, Status } from 'src/common';
import { GetAllClassesDto } from './dtos';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class ClassService {
  constructor(
    @Inject(forwardRef(() => BookingService))
    private bookingService: BookingService,
    @InjectRepository(Class) private classRepository: Repository<Class>,
  ) {}

  async findAll({ status, startDate, endDate }: GetAllClassesDto) {
    const today = new Date();
    const query = this.classRepository
      .createQueryBuilder('class')
      .leftJoin('class.bookings', 'booking')
      .loadRelationCountAndMap('class.currentCount', 'class.bookings');

    if (!!status) {
      switch (status) {
        case Status.CANCELLED:
          query.where('class.cancelled = :cancelled', { cancelled: true });
          break;
        case Status.COMPLETED:
          query.where('class.date <= :today', { today });
          break;
        case Status.PENDING:
          query.where('class.date >= :today', { today });
          break;
      }
    }

    if (!!startDate && !!endDate) {
      query.andWhere('class.date BETWEEN :start AND :end', {
        end: endDate,
        start: startDate,
      });
    }

    return await query.orderBy('class.date', 'ASC').getMany();
  }

  async findByAttrs(
    filter: Partial<Class>,
    dynamicQueryFilters?: FindOneOptions<Class>,
  ) {
    let queryParams: FindOneOptions<Class> = {
      where: filter,
    };

    if (dynamicQueryFilters) {
      queryParams = { ...queryParams, ...dynamicQueryFilters };
    }

    return await this.classRepository.find(queryParams);
  }

  async create(payload: CreateClassDto) {
    const { date, end, start, maxAmount, recurrencyLimit } = payload;

    if (start > end) {
      throw new BadRequestException('End time must be after start time');
    }
    if (date > recurrencyLimit) {
      throw new BadRequestException(
        'Recurrency limit must be later than date field',
      );
    }

    const existentClass = await this.findByAttrs({
      date,
      endTime: end,
      startTime: start,
    });

    if (existentClass.length > 0) {
      throw new BadRequestException(
        'There is already a class in the selected time and date',
      );
    }

    const queryRunner =
      this.classRepository.manager.connection.createQueryRunner();

    const createdClasses: Class[] = [];

    await createTransaction(queryRunner, async () => {
      let datesList: Date[] = [];
      let recurrentId: string | undefined;

      if (!!recurrencyLimit) {
        const rule = new RRule({
          dtstart: date,
          freq: RRule.WEEKLY,
          until: recurrencyLimit,
        });

        datesList = rule.all();

        const weekday = new Intl.DateTimeFormat('es-Es', {
          weekday: 'long',
        }).format(date);
        recurrentId = `${weekday}_${start}_${end}`;
      } else datesList = [date];

      for (let i = 0; i < datesList.length; i++) {
        const classInstance = this.classRepository.create({
          maxAmount,
          recurrentId,
          endTime: end,
          startTime: start,
          date: datesList[i],
        });
        await queryRunner.manager.save(classInstance);
        createdClasses.push(classInstance);
      }
    });

    return createdClasses;
  }

  async editStatus(id: number, cancel: boolean) {
    const classInstance = await this.classRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });

    if (!classInstance) {
      throw new BadRequestException(`Class with id: ${id} does not exist`);
    }

    classInstance.cancelled = cancel;

    const bookings = cancel
      ? classInstance.bookings || []
      : (await this.bookingService.findByOriginalClassId(id)) || [];

    if (!bookings.length) return;

    for (const booking of bookings) {
      if (cancel) {
        booking.originalClass = classInstance;
        booking.cancelledAt = new Date();
        booking.class = null;
      } else {
        booking.class = classInstance;
        booking.originalClass = null;
        booking.cancelledAt = null;
      }
    }

    await this.classRepository.save(classInstance);
    await this.bookingService.saveBookings(bookings);
  }

  async delete(id: string, isRecurrent: boolean) {
    const filter: Partial<Class> = isRecurrent
      ? { recurrentId: id }
      : { id: +id };

    await this.classRepository.delete(filter);
  }
}
