import { Response } from 'express';
import { CreateUserDto, UserDto } from '../user/dtos';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Public } from 'src/decorators';
import { Serialize, SetCookie } from 'src/interceptors';
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SetCookie()
  @Post('signup')
  @Serialize(UserDto)
  async signUp(@Body() payload: CreateUserDto) {
    return await this.authService.createUser(payload);
  }

  @SetCookie()
  @Post('login')
  @Serialize(UserDto)
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.validateUser(payload);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('user');
    return res.send();
  }
}
