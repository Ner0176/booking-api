import { CreateUserDto } from '../user/dtos';
import { AuthService } from './auth.service';
import { AuthDto, LoginUserDto } from './dtos';
import { Body, Controller, Post } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Serialize(AuthDto)
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() payload: CreateUserDto) {
    return await this.authService.createUser(payload);
  }

  @Post('/login')
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.validateUser(payload);
  }
}
