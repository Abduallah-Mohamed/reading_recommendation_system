import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { BooksService } from 'src/books/books.service';

@Injectable()
export class FavoritesService {
  private logger = new Logger(FavoritesService.name);

  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,

    private usersService: UsersService,

    private booksService: BooksService,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<{
    status_code: string;
  }> {
    try {
      const { user_id, book_id, start_page, end_page } = createFavoriteDto;

      // Check if the favorite already exists to prevent duplicates
      const existingFavorite = await this.favoritesRepository.findOne({
        where: {
          user: { id: +user_id },
          book: { id: +book_id },
          start_page,
          end_page,
        },
      });
      if (existingFavorite) {
        this.logger.error(`Favorite already exists: ${user_id} - ${book_id}`);
        throw new BadRequestException(
          `Favorite already exists: ${user_id} - ${book_id}`,
        );
      }

      // Fetch user and book in parallel (Improves performance)
      const [user, book] = await Promise.all([
        this.usersService.findOneById(+user_id),
        this.booksService.findOneById(+book_id),
      ]);

      // Create favorite entry
      const favorite = this.favoritesRepository.create({
        user,
        book,
        start_page,
        end_page,
      });

      await this.favoritesRepository.save(favorite);

      this.logger.log('Favorite created successfully');

      return {
        status_code: 'success',
      };
    } catch (error) {
      this.logger.error('Failed to create favorite', error.stack);
      throw error; // Let Global Exception Filter handle the error
    }
  }

  findAll() {
    return this.favoritesRepository.find();
  }
}
