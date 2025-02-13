import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClassConfigs } from './class-configs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateClassConfigsDto } from './dtos';

@Injectable()
export class ClassConfigsService {
  constructor(
    @InjectRepository(ClassConfigs)
    private classConfigRepository: Repository<ClassConfigs>,
  ) {}

  async getClassConfigs() {
    return await this.classConfigRepository.find();
  }

  async updateClassConfigs(payload: UpdateClassConfigsDto) {
    let newConfig: ClassConfigs;

    const classConfig = await this.getClassConfigs();

    if (!classConfig || !classConfig.length) {
      newConfig = this.classConfigRepository.create(payload);
    } else {
      newConfig = this.classConfigRepository.merge(classConfig[0], payload);
    }

    return await this.classConfigRepository.save(newConfig);
  }
}
