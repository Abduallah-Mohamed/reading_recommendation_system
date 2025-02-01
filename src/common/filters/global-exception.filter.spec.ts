import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockContext: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(), // Make status() chainable
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test-url',
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost; // Cast to unknown, then ArgumentsHost
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle QueryFailedError (NOT NULL violation)', () => {
      const error = new QueryFailedError('query', [], new Error());
      (error as any).code = '23502';
      (error as any).column = 'testColumn';

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Missing required field: testColumn',
      });
    });

    it('should handle QueryFailedError (UNIQUE constraint violation)', () => {
      const error = new QueryFailedError('query', [], new Error());
      (error as any).code = '23505';

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Duplicate value found, please use a unique value',
      });
    });

    it('should handle QueryFailedError (FOREIGN KEY violation)', () => {
      const error = new QueryFailedError('query', [], new Error());
      (error as any).code = '23503';

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Invalid foreign key reference',
      });
    });

    it('should handle other QueryFailedError with default message', () => {
      const error = new QueryFailedError('query', [], new Error());
      (error as any).code = '12345'; // Some other error code

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Internal server error',
      });
    });

    it('should handle HttpException with string message', () => {
      const error = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Forbidden',
      });
    });

    it('should handle HttpException with object response', () => {
      const error = new HttpException(
        { message: 'Custom Error', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ), // Match ISO 8601 format
        path: '/test-url',
        message: 'Custom Error',
      });
    });

    it('should handle unknown exception with default message', () => {
      const error = new Error('Some unknown error');

      filter.catch(error, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Internal server error',
      });
    });
  });
});
