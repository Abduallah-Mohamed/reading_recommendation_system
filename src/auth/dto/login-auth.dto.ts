import { PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register-auth.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto extends PartialType(RegisterAuthDto) {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abduallah@gmail.com',
    description: 'The email of the user',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Abd132#%$',
    description: 'The password of the user',
  })
  password: string;
}
