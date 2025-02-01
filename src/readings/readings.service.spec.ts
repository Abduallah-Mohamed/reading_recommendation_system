import { Test, TestingModule } from '@nestjs/testing';
import { ReadingsService } from './readings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from './entities/reading.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { CreateReadingDto } from './dto/create-readings.dto';
import { BadRequestException } from '@nestjs/common';

// Mock UsersService
const mockUsersService = () => ({
  findOneById: jest.fn(),
});

// Mock BooksService
const mockBooksService = () => ({
  findOneById: jest.fn(),
});

describe('ReadingsService', () => {
  let service: ReadingsService;
  let readingsRepository: Repository<Reading>;
  let usersService: UsersService;
  let booksService: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsService,
        {
          provide: getRepositoryToken(Reading),
          useClass: Repository,
        },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: BooksService, useFactory: mockBooksService },
      ],
    }).compile();

    service = module.get<ReadingsService>(ReadingsService);
    readingsRepository = module.get<Repository<Reading>>(
      getRepositoryToken(Reading),
    );
    usersService = module.get<UsersService>(UsersService);
    booksService = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reading successfully', async () => {
      const createReadingDto: CreateReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 50,
      };
      const mockUser: Partial<User> = { id: 1, email: 'test@example.com' };
      const mockBook: Partial<Book> = {
        id: 1,
        title: 'Test Book',
        num_of_pages: 100,
      };

      jest.spyOn(readingsRepository, 'findOne').mockResolvedValue(null);
      (usersService.findOneById as jest.Mock).mockResolvedValue(mockUser);
      (booksService.findOneById as jest.Mock).mockResolvedValue(mockBook);
      jest.spyOn(readingsRepository, 'create').mockReturnValue({
        ...createReadingDto,
        user: mockUser,
        book: mockBook,
      } as any);
      jest.spyOn(readingsRepository, 'save').mockResolvedValue({
        id: 1,
        ...createReadingDto,
        user: mockUser,
        book: mockBook,
      } as any);

      const result = await service.create(createReadingDto, mockUser as User);

      expect(result.status_code).toEqual('success');
      expect(readingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockUser.id },
          book: { id: +createReadingDto.book_id },
          start_page: createReadingDto.start_page,
          end_page: createReadingDto.end_page,
        },
      });
      expect(usersService.findOneById).toHaveBeenCalledWith(mockUser.id);
      expect(booksService.findOneById).toHaveBeenCalledWith(
        +createReadingDto.book_id,
      );
      expect(readingsRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        book: mockBook,
        start_page: createReadingDto.start_page,
        end_page: createReadingDto.end_page,
      });
      expect(readingsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if reading already exists', async () => {
      const createReadingDto: CreateReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 50,
      };
      const mockUser: Partial<User> = { id: 1, email: 'test@example.com' };
      const existingReading: Partial<Reading> = { id: 1, ...createReadingDto };

      jest
        .spyOn(readingsRepository, 'findOne')
        .mockResolvedValue(existingReading as Reading);

      await expect(
        service.create(createReadingDto, mockUser as User),
      ).rejects.toThrow(BadRequestException);
      expect(readingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockUser.id },
          book: { id: +createReadingDto.book_id },
          start_page: createReadingDto.start_page,
          end_page: createReadingDto.end_page,
        },
      });
    });

    it('should throw BadRequestException if end_page is greater than num_of_pages', async () => {
      const createReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 150,
      };
      const mockUser: Partial<User> = { id: 1, email: 'test@example.com' };
      const mockBook: Partial<Book> = {
        id: 1,
        title: 'Test Book',
        num_of_pages: 100,
      };

      jest.spyOn(readingsRepository, 'findOne').mockResolvedValue(null);
      (usersService.findOneById as jest.Mock).mockResolvedValue(mockUser);
      (booksService.findOneById as jest.Mock).mockResolvedValue(mockBook);

      await expect(
        service.create(createReadingDto, mockUser as User),
      ).rejects.toThrow(BadRequestException);
      expect(readingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockUser.id },
          book: { id: +createReadingDto.book_id },
          start_page: createReadingDto.start_page,
          end_page: createReadingDto.end_page,
        },
      });
      expect(usersService.findOneById).toHaveBeenCalledWith(mockUser.id);
      expect(booksService.findOneById).toHaveBeenCalledWith(
        +createReadingDto.book_id,
      );
    });

    it('should handle errors and rethrow them', async () => {
      const createReadingDto: CreateReadingDto = {
        book_id: '1',
        start_page: 1,
        end_page: 50,
      };
      const mockUser: Partial<User> = { id: 1, email: 'test@example.com' };
      const databaseError = new Error('Database error');

      jest
        .spyOn(readingsRepository, 'findOne')
        .mockRejectedValue(databaseError);

      await expect(
        service.create(createReadingDto, mockUser as User),
      ).rejects.toThrow(databaseError);
      expect(readingsRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockUser.id },
          book: { id: +createReadingDto.book_id },
          start_page: createReadingDto.start_page,
          end_page: createReadingDto.end_page,
        },
      });
    });
  });
});
