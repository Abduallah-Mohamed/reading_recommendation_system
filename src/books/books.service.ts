import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { Reading } from 'src/readings/entities/reading.entity';
import { RecommendedBooksResponse } from './interfaces';
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

  async getTopRecommendedBooks(
    limit: number = 5,
  ): Promise<RecommendedBooksResponse> {
    try {
      const books = await this.bookRepository
        .createQueryBuilder('book')
        .leftJoinAndSelect('book.readings', 'reading') // Use leftJoinAndSelect to load readings for each book
        .getMany();

      const booksWithReadPages = books.map((book) => {
        const uniquePages = this.calculateUniquePages(book.readings);
        this.logger.debug(`Book: ${book.title} - Unique pages: ${uniquePages}`); // Use debug level for detailed logging
        return {
          book_id: book.id,
          book_name: book.title,
          num_of_pages: book.num_of_pages,
          num_of_read_pages: Math.min(uniquePages, book.num_of_pages),
        };
      });

      const topRecommendedBooks = booksWithReadPages
        .sort((a, b) => b.num_of_read_pages - a.num_of_read_pages)
        .slice(0, limit);

      this.logger.log(
        `Fetched top ${topRecommendedBooks.length} recommended books successfully.`,
      );

      return {
        status_code: 'success',
        message: 'Fetched top recommended books successfully.',
        data: topRecommendedBooks,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching top recommended books: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private calculateUniquePages(readings: Reading[]): number {
    if (readings.length === 0) return 0;

    // 1. Deduplicate Intervals:
    const uniqueIntervals = this.deduplicateIntervals(readings);

    // 2. Sort Intervals by start_page:
    uniqueIntervals.sort((a, b) => a.start_page - b.start_page);

    // 3. Merge Overlapping Intervals:
    const merged = [uniqueIntervals[0]];
    for (let i = 1; i < uniqueIntervals.length; i++) {
      const current = uniqueIntervals[i];
      const lastMerged = merged[merged.length - 1];

      if (current.start_page <= lastMerged.end_page) {
        // Merge overlapping intervals
        lastMerged.end_page = Math.max(lastMerged.end_page, current.end_page);
      } else {
        // Add non-overlapping interval
        merged.push(current);
      }
    }

    // 4. Calculate Total Unique Pages:
    return merged.reduce(
      (total, interval) =>
        total + (interval.end_page - interval.start_page + 1),
      0,
    );
  }

  // Helper function to deduplicate intervals based on start_page and end_page
  private deduplicateIntervals(intervals: Reading[]): Reading[] {
    const seen = new Set<string>();
    const uniqueIntervals = [];
    for (const interval of intervals) {
      const key = `${interval.start_page}-${interval.end_page}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueIntervals.push(interval);
      }
    }
    return uniqueIntervals;
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
