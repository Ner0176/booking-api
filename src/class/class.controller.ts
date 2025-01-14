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
    @Body() payload: EditClassStatusDto,
  ) {
    await this.classService.editStatus(id, payload.cancel);
  }

  @Delete('delete')
  async deleteClass(@Query() query: DeleteClassDto) {
    await this.classService.delete(query);
  }
}
