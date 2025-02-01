import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateReadingDto } from './dto/create-readings.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reading } from './entities/reading.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { BooksService } from 'src/books/books.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReadingsService {
  private logger = new Logger(ReadingsService.name);

  constructor(
    @InjectRepository(Reading)
    private readingsRepository: Repository<Reading>,

    private usersService: UsersService,

    private booksService: BooksService,
  ) {}

  async create(
    createReadingDto: CreateReadingDto,
    currentUser: User,
  ): Promise<{
    status_code: string;
  }> {
    try {
      const { book_id, start_page, end_page } = createReadingDto;

      // Check if the reading already exists to prevent duplicates
      const existingReading = await this.readingsRepository.findOne({
        where: {
          user: { id: +currentUser.id },
          book: { id: +book_id },
          start_page,
          end_page,
        },
      });
      if (existingReading) {
        this.logger.error(`Reading already exists`);
        throw new BadRequestException(`Reading already exists`);
      }

      // Fetch user and book in parallel (Improves performance)
      const [user, book] = await Promise.all([
        this.usersService.findOneById(+currentUser.id),
        this.booksService.findOneById(+book_id),
      ]);

      if (book.num_of_pages < end_page) {
        this.logger.error(`End page is greater than book pages: ${end_page}`);
        throw new BadRequestException(
          `End page is greater than book pages: ${end_page}`,
        );
      }

      // Create reading entry
      const reading = this.readingsRepository.create({
        user,
        book,
        start_page,
        end_page,
      });

      await this.readingsRepository.save(reading);

      this.logger.log('Reading created successfully');

      return {
        status_code: 'success',
      };
    } catch (error) {
      this.logger.error('Failed to create reading', error.stack);
      throw error; // Let Global Exception Filter handle the error
    }
  }
}
