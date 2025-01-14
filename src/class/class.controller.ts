import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto, DeleteClassDto, EditClassStatusDto } from './dtos';

@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Get('all')
  async allClasses() {
    return await this.classService.findAll();
  }

  @Post('create')
  async createClass(@Body() payload: CreateClassDto) {
    return await this.classService.create(payload);
  }

  @Patch(':id')
  async editClassStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() { cancel }: EditClassStatusDto,
  ) {
    await this.classService.editStatus(id, cancel);
  }

  @Delete(':id')
  async deleteClass(
    @Param('id') id: string,
    @Query() { isRecurrent }: DeleteClassDto,
  ) {
    await this.classService.delete(id, isRecurrent);
  }
}
