import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserBooksService } from './user-books.service';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';

@Controller('user-books')
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @Post()
  create(@Body() createUserBookDto: CreateUserBookDto) {
    return this.userBooksService.create(createUserBookDto);
  }

  @Get()
  findAll() {
    return this.userBooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userBooksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserBookDto: UpdateUserBookDto) {
    return this.userBooksService.update(+id, updateUserBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userBooksService.remove(+id);
  }
}
