import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(
    createBookDto: CreateBookDto,
  ): Promise<{ status_code: string; message: string; book?: Book }> {
    try {
      // Create a new book instance
      const book = this.bookRepository.create(createBookDto);

      // Save to database
      const savedBook = await this.bookRepository.save(book);

      // Log success
      this.logger.log(`Book created successfully: ${savedBook.id}`);

      // Return success response
      return {
        status_code: 'success',
        message: 'Book created successfully',
        book: savedBook,
      };
    } catch (error) {
      this.logger.error(`Error creating book: ${error.message}`, error.stack);

      throw error;
    }
  }

  async findOneById(id: number): Promise<Book> {
    try {
      const book = await this.bookRepository.findOne({ where: { id } });

      if (!book) {
        this.logger.error(`Book not found: ${id}`);
        throw new NotFoundException(`Book not found: ${id}`);
      }

      return book;
    } catch (error) {
      this.logger.error(`Error finding book: ${error.message}`, error.stack);

      throw error;
    }
  }
}
