import {
  Body,
  Controller,
  Delete,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dtos';
import { DeleteClassDto } from './dtos/delete-class.dto';

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

  @Patch('edit-status')
  async editClassStatus(
    @Query('id', ParseIntPipe) id: number,
    @Query('cancel', ParseBoolPipe) cancel: boolean,
  ) {
    await this.classService.editStatus(id, cancel);
  }

  @Delete('delete')
  async deleteClass(@Query() query: DeleteClassDto) {
    await this.classService.delete(query);
  }
}
