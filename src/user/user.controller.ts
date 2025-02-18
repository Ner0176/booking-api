import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserDto } from './dtos';
import { Admin, User, UserCookie } from 'src/decorators';
import { Serialize } from 'src/interceptors';

@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Admin()
  @Get('all')
  async allUsers(@User() { id }: UserCookie) {
    return await this.userService.findAll(id);
  }

  @Get('findMe')
  async findUser(@User() { id }: UserCookie) {
    return await this.userService.findByAttrs({ id });
  }

  @Patch('update')
  async updateUser(@Body() payload: UpdateUserDto, @User() user: UserCookie) {
    const { id, ...rest } = payload;
    return await this.userService.update(id ?? user.id, rest);
  }

  @Admin()
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
