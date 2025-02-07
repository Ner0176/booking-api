import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos';
import { AdminGuard } from 'src/decorators';

@AdminGuard()
@Controller('user')
@Serialize(UserDto)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  async allUsers() {
    return await this.userService.findAll();
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
