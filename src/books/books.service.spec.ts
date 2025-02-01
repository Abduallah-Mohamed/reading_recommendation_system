import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { Reading } from '../readings/entities/reading.entity'; // Update with your actual path
import { CreateBookDto } from './dto/create-book.dto';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: Repository<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useClass: Repository, // Mock the repository
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        num_of_pages: 100,
      };
      const createdBook = { id: 1, ...createBookDto };

      jest.spyOn(bookRepository, 'create').mockReturnValue(createdBook as Book);
      jest.spyOn(bookRepository, 'save').mockResolvedValue(createdBook as Book);

      const result = await service.create(createBookDto);

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual('Book created successfully');
      expect(result.book).toEqual(createdBook);
      expect(bookRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(bookRepository.save).toHaveBeenCalledWith(createdBook);
    });

    it('should handle errors during book creation', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        num_of_pages: 100,
      };

      jest.spyOn(bookRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createBookDto)).rejects.toThrow(
        'Database error',
      );
      expect(bookRepository.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('getTopRecommendedBooks', () => {
    it('should return top recommended books', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Book 1',
          num_of_pages: 300,
          readings: [
            { id: 1, start_page: 1, end_page: 50 },
            { id: 2, start_page: 60, end_page: 100 },
          ],
        },
        {
          id: 2,
          title: 'Book 2',
          num_of_pages: 200,
          readings: [
            { id: 3, start_page: 1, end_page: 100 },
            { id: 4, start_page: 101, end_page: 150 },
          ],
        },
        {
          id: 3,
          title: 'Book 3',
          num_of_pages: 500,
          readings: [],
        },
      ];

      jest.spyOn(bookRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBooks),
      } as any);

      const result = await service.getTopRecommendedBooks();

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual(
        'Fetched top recommended books successfully.',
      );
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.data[0].book_id).toEqual(2); // Book 2 has the most read pages in this mock data
      expect(bookRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle errors during fetching top recommended books', async () => {
      jest
        .spyOn(bookRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          throw new Error('Database error');
        });

      await expect(service.getTopRecommendedBooks()).rejects.toThrow(
        'Database error',
      );
    });

    it('should return an empty array when there are no books', async () => {
      jest.spyOn(bookRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getTopRecommendedBooks();

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual(
        'Fetched top recommended books successfully.',
      );
      expect(result.data.length).toEqual(0);
    });

    it('should return top limited recommended books', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Book 1',
          num_of_pages: 300,
          readings: [
            { id: 1, start_page: 1, end_page: 50 },
            { id: 2, start_page: 60, end_page: 100 },
          ],
        },
        {
          id: 2,
          title: 'Book 2',
          num_of_pages: 200,
          readings: [
            { id: 3, start_page: 1, end_page: 100 },
            { id: 4, start_page: 101, end_page: 150 },
          ],
        },
        {
          id: 3,
          title: 'Book 3',
          num_of_pages: 500,
          readings: [],
        },
        {
          id: 4,
          title: 'Book 4',
          num_of_pages: 600,
          readings: [{ id: 5, start_page: 1, end_page: 600 }],
        },
        {
          id: 5,
          title: 'Book 5',
          num_of_pages: 100,
          readings: [{ id: 6, start_page: 1, end_page: 50 }],
        },
        {
          id: 6,
          title: 'Book 6',
          num_of_pages: 1000,
          readings: [{ id: 7, start_page: 1, end_page: 1000 }],
        },
      ];

      jest.spyOn(bookRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBooks),
      } as any);

      const result = await service.getTopRecommendedBooks(5);

      expect(result.status_code).toEqual('success');
      expect(result.message).toEqual(
        'Fetched top recommended books successfully.',
      );
      expect(result.data.length).toEqual(5);
      expect(result.data[0].book_id).toEqual(6);
    });
  });

  describe('calculateUniquePages', () => {
    it('should calculate unique pages for non-overlapping intervals', () => {
      const readings: Partial<Reading>[] = [
        { start_page: 1, end_page: 50 },
        { start_page: 60, end_page: 100 },
      ];
      const uniquePages = service['calculateUniquePages'](
        readings as Reading[],
      );
      expect(uniquePages).toEqual(91); // 50 + 41
    });

    it('should calculate unique pages for overlapping intervals', () => {
      const readings: Partial<Reading>[] = [
        { start_page: 1, end_page: 50 },
        { start_page: 40, end_page: 80 },
        { start_page: 70, end_page: 120 },
      ];
      const uniquePages = service['calculateUniquePages'](
        readings as Reading[],
      );
      expect(uniquePages).toEqual(120); // Merged to 1-120
    });

    it('should calculate unique pages for duplicate intervals', () => {
      const readings: Partial<Reading>[] = [
        { start_page: 1, end_page: 50 },
        { start_page: 1, end_page: 50 },
        { start_page: 60, end_page: 100 },
      ];
      const uniquePages = service['calculateUniquePages'](
        readings as Reading[],
      );
      expect(uniquePages).toEqual(91); // 50 + 41
    });

    it('should return 0 for empty intervals', () => {
      const readings: Partial<Reading>[] = [];
      const uniquePages = service['calculateUniquePages'](
        readings as Reading[],
      );
      expect(uniquePages).toEqual(0);
    });
  });

  describe('findOneById', () => {
    it('should return a book by ID', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        num_of_pages: 300,
        // ... other properties
      };

      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(mockBook as Book);

      const result = await service.findOneById(1);

      expect(result).toEqual(mockBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if book is not found', async () => {
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
      expect(bookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should handle errors during book retrieval', async () => {
      jest
        .spyOn(bookRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findOneById(1)).rejects.toThrow('Database error');
      expect(bookRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
