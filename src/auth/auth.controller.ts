import { Response } from 'express';
import { CreateUserDto } from '../user/dtos';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Public } from 'src/decorators';
import { SetCookie } from 'src/interceptors';
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SetCookie()
  @Post('signup')
  async signUp(@Body() payload: CreateUserDto) {
    const user = await this.authService.createUser(payload);
    return user.id;
  }

  @SetCookie()
  @Post('login')
  async login(@Body() payload: LoginUserDto) {
    const user = await this.authService.validateUser(payload);
    return user.id;
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('user');
    return res.send();
  }
}
