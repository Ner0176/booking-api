import { CreateUserDto, UserDto } from '../user/dtos';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos';
import { Body, Controller, Post } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Serialize(UserDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() payload: CreateUserDto) {
    return await this.authService.createUser(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.validateUser(payload);
  }
}
