import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dtos';
import { RRule } from 'rrule';
import { DeleteClassDto } from './dtos/delete-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
  ) {}

  async findAll() {
    return await this.classRepository.find();
  }

  async findByAttrs({ date, startTime, endTime }: Partial<Class>) {
    return await this.classRepository.findOne({
      where: { date, endTime, startTime },
    });
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

    if (existentClass) {
      throw new BadRequestException(
        'There is already a class in the selected time and date',
      );
    }

    const queryRunner =
      this.classRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async delete({ id, isRecurrent }: DeleteClassDto) {
    const filter: Partial<Class> = isRecurrent
      ? { recurrentId: id }
      : { id: +id };

    await this.classRepository.delete(filter);
  }
}
