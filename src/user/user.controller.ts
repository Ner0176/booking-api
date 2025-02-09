import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserDto } from './dtos';
import { Admin } from 'src/decorators';
import { Serialize } from 'src/interceptors';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async findUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findByAttrs({ id });
  }

  @Admin()
  @Get('all')
  async allUsers() {
    return await this.userService.findAll();
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
  ) {
    return await this.userService.update(id, payload);
  }

  @Admin()
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
