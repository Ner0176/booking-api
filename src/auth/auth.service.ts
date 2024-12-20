import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos';
import { CreateUserDto } from '../user/dtos';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  private async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async createUser(payload: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(payload.password, 12);
    return await this.userService.create({
      ...payload,
      password: hashedPassword,
    });
  }

  async validateUser({ email, password }: LoginUserDto) {
    const user = await this.userService.findByAttrs({ email });

    if (!user) {
      throw new NotFoundException(
        'There is no user account with the provided email',
      );
    }

    if (!this.comparePassword(password, user.password)) {
      throw new BadRequestException('The password is not valid');
    }

    return user;
  }
}
