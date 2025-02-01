import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Clean Code', description: 'The title of the book' })
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '100',
    description: 'The number of pages of the book',
  })
  num_of_pages: number;
}
