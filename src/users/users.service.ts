import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ status_code: string; message: string; data?: User }> {
    try {
      const user = this.userRepository.create(createUserDto);

      await this.userRepository.save(user);
      this.logger.log('User created successfully');

      return {
        status_code: 'success',
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  async findOneById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to find user', error);
      throw error;
    }
  }
}
