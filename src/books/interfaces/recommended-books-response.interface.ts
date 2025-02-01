import { RecommendedBook } from './recommended-book.interface';

export interface RecommendedBooksResponse {
  status_code: string;
  message: string;
  data: RecommendedBook[];
}
