import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(userId: number) {
    return await this.userRepository.find({ where: { id: Not(userId) } });
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

  async update(id: number, payload: UpdateUserDto) {
    const user = await this.findByAttrs({ id });

    if (!user) {
      throw new BadRequestException(`User with id: ${id} does not exist`);
    }

    return await this.userRepository.save({ ...user, ...payload });
  }

  async delete(id: string) {
    await this.userRepository.delete(id);
  }
}
