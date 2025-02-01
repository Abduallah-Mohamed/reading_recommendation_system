import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'readings' })
export class Reading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  start_page: number;

  @Column()
  end_page: number;

  @ManyToOne(() => User, (user) => user.readings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.readings)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
