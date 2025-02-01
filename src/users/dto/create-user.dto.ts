import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
}
