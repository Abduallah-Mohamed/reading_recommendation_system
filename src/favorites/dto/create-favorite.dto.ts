import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsPageRangeValid } from '../decorators/validate-page-range.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'The ID of the book' })
  book_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'The ID of the user' })
  user_id: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'The start page of the book' })
  start_page: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPageRangeValid()
  @ApiProperty({ example: '1', description: 'The end page of the book' })
  end_page: number;
}
