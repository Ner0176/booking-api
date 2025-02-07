import { Response } from 'express';
import { CreateUserDto, UserDto } from '../user/dtos';
import { AuthService } from './auth.service';
import { setCookie } from './auth.utils';
import { LoginUserDto } from './dtos';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { Public } from 'src/decorators';
@Public()
@Serialize(UserDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() payload: CreateUserDto, @Res() res: Response) {
    const user = await this.authService.createUser(payload);
    setCookie(res, { id: user.id, isAdmin: user.isAdmin });
    return res.send(user);
  }

  @Post('login')
  async login(@Body() payload: LoginUserDto, @Res() res: Response) {
    const user = await this.authService.validateUser(payload);
    setCookie(res, { id: user.id, isAdmin: user.isAdmin });
    return res.send(user);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('user');
    return res.send();
  }
}
