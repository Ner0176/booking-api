import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepository.find();
  }

  async findManyById(ids: number[]) {
    return await this.userRepository.find({ where: { id: In(ids) } });
  }

  async findByAttrs(attrs: Partial<User>) {
    return await this.userRepository.findOne({
      where: attrs,
    });
  }

  async create(payload: CreateUserDto) {
    const alreadyExists = await this.findByAttrs({ email: payload.email });

    if (alreadyExists) {
      throw new BadRequestException(
        'An account is already created with this email',
      );
    }

    const user = this.userRepository.create(payload);
    return await this.userRepository.save(user);
  }

  async delete(id: string) {
    await this.userRepository.delete(id);
  }
}
