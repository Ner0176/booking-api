import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Admin } from 'src/decorators';
import { ClassConfigsService } from './class-configs.service';
import { UpdateClassConfigsDto } from './dtos';

@Controller('class-configs')
export class ClassConfigsController {
  constructor(private classConfigService: ClassConfigsService) {}

  @Get()
  async getClassConfigs() {
    return await this.classConfigService.getClassConfigs();
  }

  @Admin()
  @Patch()
  async updateClassConfigs(@Body() payload: UpdateClassConfigsDto) {
    return await this.classConfigService.updateClassConfigs(payload);
  }
}
