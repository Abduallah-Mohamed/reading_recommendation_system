import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('BooksController', () => {
  let controller: BooksController;

  // Mocking BooksService methods
  const mockBooksService = {
    create: jest.fn(),
    getTopRecommendedBooks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test: Create a new book
  describe('create', () => {
    it('should create a new book successfully', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        num_of_pages: 100,
      };

      const expectedResult = { id: 1, ...createBookDto };

      mockBooksService.create.mockResolvedValue(expectedResult); // Mock service behavior

      const result = await controller.create(createBookDto);

      expect(result).toEqual(expectedResult);
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
      expect(mockBooksService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if book creation fails', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Faulty Book',
        num_of_pages: 50,
      };

      mockBooksService.create.mockRejectedValue(
        new InternalServerErrorException('Book creation failed'),
      );

      await expect(controller.create(createBookDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  // Test: Get top recommended books
  describe('getTopRecommendedBooks', () => {
    it('should return top recommended books', async () => {
      const expectedBooks = [
        { id: 1, title: 'Book 1', num_of_read_pages: 120 },
        { id: 2, title: 'Book 2', num_of_read_pages: 90 },
      ];

      mockBooksService.getTopRecommendedBooks.mockResolvedValue(expectedBooks);

      const result = await controller.getTopRecommendedBooks();

      expect(result).toEqual(expectedBooks);
      expect(mockBooksService.getTopRecommendedBooks).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching recommended books', async () => {
      mockBooksService.getTopRecommendedBooks.mockRejectedValue(
        new InternalServerErrorException('Failed to fetch recommended books'),
      );

      await expect(controller.getTopRecommendedBooks()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockBooksService.getTopRecommendedBooks).toHaveBeenCalledTimes(1);
    });
  });
});
