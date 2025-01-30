import { Module } from '@nestjs/common';
import { UserBooksService } from './user-books.service';
import { UserBooksController } from './user-books.controller';

@Module({
  controllers: [UserBooksController],
  providers: [UserBooksService],
})
export class UserBooksModule {}
