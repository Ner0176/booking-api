import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos';
import { Admin } from 'src/decorators';
import { Serialize } from 'src/interceptors';

@Admin()
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
