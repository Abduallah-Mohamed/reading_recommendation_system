import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto';
import { CreateUserDto, Role } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Registration
  async register(
    registerAuthDto: RegisterAuthDto,
  ): Promise<{ status_code: string; message: string; data?: User }> {
    const createUserDto: CreateUserDto = {
      ...registerAuthDto,
      role: Role.USER,
    };
    const newUser = await this.usersService.create(createUserDto);
    return newUser;
  }

  // Login
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
