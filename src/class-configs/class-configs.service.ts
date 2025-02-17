import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClassConfigs } from './class-configs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateClassConfigsDto } from './dtos';

const DEFAULT_CLASS_CONFIGS = {
  maxRecoveryDays: 60,
  maxCancellationPerMonth: 2,
  minHoursBeforeCancellation: 2,
};

@Injectable()
export class ClassConfigsService {
  constructor(
    @InjectRepository(ClassConfigs)
    private classConfigRepository: Repository<ClassConfigs>,
  ) {}

  async getClassConfigs() {
    const classConfigs = await this.classConfigRepository.find();
    return classConfigs.length > 0 ? classConfigs[0] : DEFAULT_CLASS_CONFIGS;
  }

  async updateClassConfigs(payload: UpdateClassConfigsDto) {
    let newConfig: ClassConfigs;

    const classConfig = await this.classConfigRepository.find();

    if (!classConfig || !classConfig.length) {
      newConfig = this.classConfigRepository.create(payload);
    } else {
      newConfig = this.classConfigRepository.merge(classConfig[0], payload);
    }

    return await this.classConfigRepository.save(newConfig);
  }
}
