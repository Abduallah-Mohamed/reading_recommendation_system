import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto';
import { CreateUserDto, Role } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Registration
  async register(
    registerAuthDto: RegisterAuthDto,
  ): Promise<{ status_code: string; message: string; data?: User }> {
    try {
      const createUserDto: CreateUserDto = {
        ...registerAuthDto,
        role: Role.USER,
      };
      const newUser = await this.usersService.create(createUserDto);
      return newUser;
    } catch (error) {
      this.logger.error(
        `Error during user registration: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  // Login
  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        this.logger.warn(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);
      this.logger.log(`User ${email} logged in successfully.`);
      return { access_token: token };
    } catch (error) {
      this.logger.error(
        `Error during user login: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
