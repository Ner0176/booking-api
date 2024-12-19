import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async create(payload: CreateUserDto) {
    const alreadyExists = await this.findByEmail(payload.email);

    if (alreadyExists) {
      throw new BadRequestException(
        'An account is already created with this email',
      );
    }

    const user = this.userRepository.create(payload);
    return await this.userRepository.save(user);
  }
}
