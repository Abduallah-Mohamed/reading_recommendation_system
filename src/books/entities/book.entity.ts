import { UserBook } from 'src/user-books/entities/user-book.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'books' })
export class Book {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @OneToMany(() => UserBook, (userBook) => userBook.book)
  userBooks: UserBook[];
}
