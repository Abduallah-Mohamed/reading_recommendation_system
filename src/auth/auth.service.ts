import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  create(registerAuthDto: RegisterAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
}
