import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abduallah',
    description: 'The username of the user',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456', description: 'The password of the user' })
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abduallah@gmail.com',
    description: 'The email of the user',
  })
  email: string;

  @IsEnum(Role)
  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
  })
  role: Role.USER;
}
