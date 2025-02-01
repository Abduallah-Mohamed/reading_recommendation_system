import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // ✅ Handling TypeORM Database Errors
    if (exception instanceof QueryFailedError) {
      const error: any = exception as any;

      if (error.code === '23502') {
        // NOT NULL violation
        message = `Missing required field: ${error.column}`;
        status = HttpStatus.BAD_REQUEST;
      } else if (error.code === '23505') {
        // UNIQUE constraint violation
        message = 'Duplicate value found, please use a unique value';
        status = HttpStatus.BAD_REQUEST;
      } else if (error.code === '23503') {
        // FOREIGN KEY violation
        message = 'Invalid foreign key reference';
        status = HttpStatus.BAD_REQUEST;
      }
    }
    // ✅ Handling Standard HTTP Exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || 'An error occurred';
    }

    // ✅ Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
