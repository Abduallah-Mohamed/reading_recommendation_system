import { User } from 'src/auth/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class UserBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  start_page: number;

  @Column()
  end_page: number;

  @ManyToOne(() => User, (user) => user.userBooks)
  user: User;

  @ManyToOne(() => Book, (book) => book.userBooks)
  book: Book;
}
