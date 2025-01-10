import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateClassDto } from './dtos';
import { RRule } from 'rrule';
import { DeleteClassDto } from './dtos/delete-class.dto';
import { createTransaction } from 'src/common';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
  ) {}

  async findAll() {
    return await this.classRepository.find();
  }

  async findByAttrs(filter: Partial<Class>, returnFullInfo?: boolean) {
    const queryParams: FindOneOptions<Class> = {
      where: filter,
    };

    if (returnFullInfo) {
      queryParams.relations = ['bookings', 'bookings.user'];
      queryParams.select = {
        bookings: { id: true, status: true, user: { id: true } },
      };
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
      let datesList: Date[] = [date];
      let recurrentId: string | undefined;

      if (!!recurrencyLimit) {
        const rule = new RRule({
          freq: RRule.WEEKLY,
          byweekday: date.getDay(),
          dtstart: date,
          until: recurrencyLimit,
        });

        datesList = [...datesList, ...rule.all()];

        const weekday = new Intl.DateTimeFormat('es-Es', {
          weekday: 'long',
        }).format(date);
        recurrentId = `${weekday}_${start}_${end}`;
      }

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

  async delete({ id, isRecurrent }: DeleteClassDto) {
    const filter: Partial<Class> = isRecurrent
      ? { recurrentId: id }
      : { id: +id };

    await this.classRepository.delete(filter);
  }

  async decrementAmount(id: number) {
    await this.classRepository.decrement({ id }, 'currentCount', 1);
  }
}
