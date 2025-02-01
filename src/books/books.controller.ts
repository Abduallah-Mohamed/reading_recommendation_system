import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common';
import { JwtAuthGuard, RolesGuard } from 'src/common';

@ApiTags('Books') // 📌 Group under "Books" section in Swagger
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Roles('admin')
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get('top-recommended')
  @ApiOperation({ summary: 'Get top recommended books' })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  getTopRecommendedBooks() {
    return this.booksService.getTopRecommendedBooks();
  }
}
