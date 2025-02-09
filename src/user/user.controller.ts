import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserDto } from './dtos';
import { Admin } from 'src/decorators';
import { Serialize } from 'src/interceptors';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Admin()
  @Get('all')
  async allUsers() {
    return await this.userService.findAll();
  }

  @Get('findMe')
  async findUser(@Req() req: Request) {
    return await this.userService.findByAttrs({ id: req['user'].id });
  }

  @Patch('update')
  async updateUser(@Body() payload: UpdateUserDto, @Req() req: Request) {
    const { id, ...rest } = payload;
    return await this.userService.update(id ?? req['user'].id, rest);
  }

  @Admin()
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
