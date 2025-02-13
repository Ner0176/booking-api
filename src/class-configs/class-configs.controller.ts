import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Admin } from 'src/decorators';
import { ClassConfigsService } from './class-configs.service';
import { UpdateClassConfigsDto } from './dtos';

const DEFAULT_CLASS_CONFIGS = {
  maxRecoveryDays: 60,
  maxCancellationPerMonth: 2,
  minHoursBeforeCancellation: 2,
};

@Controller('class-configs')
export class ClassConfigsController {
  constructor(private classConfigService: ClassConfigsService) {}

  @Get()
  async getClassConfigs() {
    const classConfigs = await this.classConfigService.getClassConfigs();
    return classConfigs.length > 0 ? classConfigs[0] : DEFAULT_CLASS_CONFIGS;
  }

  @Admin()
  @Patch()
  async updateClassConfigs(@Body() payload: UpdateClassConfigsDto) {
    return await this.classConfigService.updateClassConfigs(payload);
  }
}
